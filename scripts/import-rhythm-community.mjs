// Import downloaded public metadata. No network requests; preserve source credits.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { cleanCell, matchKey } from './enrich-rhythm-artists.mjs';
import { parseLibrary } from '../src/lib/rhythm-letters.ts';

const directory = process.argv[2];
if (!directory) throw new Error('Usage: node scripts/import-rhythm-community.mjs <download-directory>');
const root = new URL('../', import.meta.url);
const read = file => readFileSync(resolve(directory, file));
const json = file => JSON.parse(read(file));
const hash = value => createHash('sha256').update(value).digest('hex');
const library = parseLibrary(readFileSync(new URL('public/data/rhythm-songs.txt', root), 'utf8'), JSON.parse(readFileSync(new URL('src/data/rhythm-games.json', root))));
const htmlText = text => cleanCell(text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ''));
function save(id, game, url, raw, records, extra = {}) {
  const titles = new Set(library[game].map(matchKey));
  records = records.filter(r => r.title && r.artist && !/^[?\s-]+$/.test(r.artist) &&
    [r.title, ...(r.aliases ?? [])].some(t => titles.has(matchKey(t))));
  if (!records.length) throw new Error(`Empty source: ${id}`);
  const snapshot = { id, game, url, retrievedAt: '2026-10-20', creditType: 'in-game-credit',
    rawSha256: hash(raw), ...extra, records };
  writeFileSync(new URL(`src/data/rhythm-databases/${id}.json`, root), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`${id}: ${records.length} source records`);
}

// Fandom's indexed table was accessible when its page endpoint was unavailable.
const milthmTable = json('artist-milthm-search.json');
save('milthm-fandom', 'Milthm', 'https://milthm.fandom.com/wiki/Songs', milthmTable,
  milthmTable.split('\n').flatMap((sourceRow, i) => {
    const cells = sourceRow.split(/  \| /).map(s => s.trim());
    if (cells.length < 3 || ['Song', '---', '???'].includes(cells[0])) return [];
    return [{ title: cells[0], artist: cells[1], sourceId: `table-row-${i + 1}`, sourceRow }];
  }), { retrieval: 'Search-indexed song table; original rows retained' });

const changelog = read('milthm-changelog.html');
const updates = [];
for (const [i, match] of [...changelog.toString().matchAll(/<li[^>]*>(.*?)<\/li>/gs)].entries()) {
  const sourceRow = htmlText(match[1]);
  const song = sourceRow.match(/["“]([^"“”]+)["”] by (.+)$/);
  if (!song || song[1].includes('?')) continue;
  updates.push({ title: song[1], artist: song[2]
    .replace(/ \((?:Milthm )?Original\)(?:.*)$/, '')
    .replace(/ \((?:[Ff]rom) .*\)$/, ''),
    sourceId: `list-item-${i}`, sourceRow });
}
save('milthm-official', 'Milthm', 'https://milthm.com/wiki/en/changelog/', changelog, updates);

for (const file of readdirSync(directory).filter(f => /^bof-list\d+\.html$/.test(f)).sort()) {
  const raw = read(file);
  const text = new TextDecoder('shift-jis').decode(raw);
  // A timed-out response can still contain complete cards. Import only closed
  // title/credit elements and explicitly mark the source as a partial snapshot.
  const partialSnapshot = !/<\/html>\s*$/i.test(text);
  const event = file.match(/\d+/)[0];
  const records = [...text.matchAll(/<h4[^>]*><strong><a href="([^"]*action=More_def[^"]*)">([\s\S]*?)<\/a><\/strong><\/h4>\s*<h5[^>]*>([\s\S]*?)<\/h5>/g)]
    .map(m => ({ title: htmlText(m[2]), artist: htmlText(m[3]),
      sourceId: `${event}-${m[1].match(/num=(\d+)/)?.[1]}`,
      sourceUrl: `https://manbow.nothing.sh/event/${m[1].replaceAll('&amp;', '&')}` }));
  for (const m of text.matchAll(/<strong><A href="([^"]*action=More_def[^"]*)">([^<]+)<\/A><br><\/strong>\s*([^<]+)<\/div>/g)) {
    records.push({ title: htmlText(m[2]), artist: htmlText(m[3]),
      sourceId: `${event}-${m[1].match(/num=(\d+)/)?.[1]}`,
      sourceUrl: `https://manbow.nothing.sh/event/${m[1].replaceAll('&amp;', '&')}` });
  }
  if (records.length) save(`bof-${event}`, 'BOF', `https://manbow.nothing.sh/event/event.cgi?action=List_def&event=${event}`, raw, records,
    { creditType: 'event-display-credit', partialSnapshot });
}
