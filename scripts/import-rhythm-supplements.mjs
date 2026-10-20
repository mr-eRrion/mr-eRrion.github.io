// Import gap-filling metadata only; existing credits and conflicts need separate review.
// Usage: node scripts/import-rhythm-supplements.mjs <download-directory>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchKey } from './enrich-rhythm-artists.mjs';

export function extractSupplement(id, raw) {
  if (id === 'phigros-info') {
    return raw.trimEnd().split(/\r?\n/).map((sourceRow, index) => {
      const [sourceId, title, artist] = sourceRow.split('\t');
      if (!sourceId || !title || !artist) throw new Error(`Invalid Phigros row ${index + 1}`);
      return { sourceId, title, artist, sourceRow, sourceLine: index + 1 };
    });
  }
  if (id === 'arcaea-charts') {
    if (!raw.startsWith('Song,Artist,')) throw new Error('Unexpected Arcaea CSV header');
    const records = new Map();
    for (const [index, sourceRow] of raw.split(/\r?\n/).entries()) {
      if (index === 0 || !sourceRow.trim()) continue;
      // Only the first two CSV fields are needed; quoted commas and "" are supported.
      const fields = sourceRow.match(/^(?:"((?:[^"]|"")*)"|([^",]*)),(?:"((?:[^"]|"")*)"|([^",]*)),/);
      if (!fields) throw new Error(`Invalid Arcaea row ${index + 1}`);
      const title = (fields[1] ?? fields[2]).replaceAll('""', '"');
      const artist = (fields[3] ?? fields[4]).replaceAll('""', '"');
      const key = JSON.stringify([title, artist]);
      if (!records.has(key)) records.set(key, {
        sourceId: `row-${index + 1}`, title, artist, sourceRow, sourceLine: index + 1,
      });
    }
    return [...records.values()];
  }
  if (['otoge-maimai-deleted', 'otoge-chunithm-deleted'].includes(id)) {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) throw new Error('Expected an OTOGE DB song array');
    return rows.map((r, sourceIndex) => {
      if (typeof r.title !== 'string' || typeof r.artist !== 'string' || !r.deleted_date) {
        throw new Error('Invalid deleted-song metadata');
      }
      return { sourceId: String(r.id ?? r.sort), title: r.title, artist: r.artist,
        sourceIndex, deletedDate: r.deleted_date,
        ...(r.wikiwiki_url || r.wiki_url ? { sourceUrl: r.wikiwiki_url || r.wiki_url } : {}) };
    });
  }
  throw new Error(`Unknown source: ${id}`);
}

export function importSupplements(directory) {
  const root = new URL('../', import.meta.url);
  const coverage = JSON.parse(readFileSync(new URL('src/data/rhythm-artist-coverage.json', root)));
  for (const [id, game, file, url, creditType] of [
    ['phigros-info', 'Phigros', 'phigros-info.tsv',
      'https://raw.githubusercontent.com/7aGiven/Phigros_Resource/info/info.tsv', 'composer'],
    ['arcaea-charts', 'Arcaea', 'arcaea-charts.csv',
      'https://raw.githubusercontent.com/TechnicalVessel/Arcaea-Chart-List/main/arcaea_chart_list.csv', 'artist'],
    ['otoge-maimai-deleted', 'maimai', 'maimai-deleted.json',
      'https://raw.githubusercontent.com/zvuc/otoge-db/main/maimai/data/music-ex-deleted.json', 'artist'],
    ['otoge-chunithm-deleted', 'CHUNITHM', 'chunithm-deleted.json',
      'https://raw.githubusercontent.com/zvuc/otoge-db/main/chunithm/data/music-ex-deleted.json', 'artist'],
  ]) {
    const input = resolve(directory, file);
    if (!existsSync(input)) continue;
    const path = new URL(`src/data/rhythm-databases/${id}.json`, root);
    const previous = existsSync(path) ? JSON.parse(readFileSync(path)).records : [];
    // Retain previously selected titles on reimport, even after coverage is rebuilt.
    const targets = new Set([...coverage.games[game].missing, ...previous.map(r => r.title)].map(matchKey));
    const raw = readFileSync(input, 'utf8');
    const records = extractSupplement(id, raw).filter(r => targets.has(matchKey(r.title)));
    if (!records.length) throw new Error(`No gap-filling records in ${file}`);
    const snapshot = { id, game, url, retrievedAt: '2026-10-20', creditType,
      selection: 'Missing titles only at first import; retain selected titles on reimport. Existing matches and conflicts are not overridden.',
      rawSha256: createHash('sha256').update(raw).digest('hex'), records };
    writeFileSync(path, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`${id}: ${records.length} supplemental records`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Supply a directory containing downloaded metadata');
  importSupplements(process.argv[2]);
}
