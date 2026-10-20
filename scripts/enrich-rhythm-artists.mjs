import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseLibrary, buildSongLibrary } from '../src/lib/rhythm-letters.ts';

export const sources = [
  ['phigros', 'Phigros', 'phigros/楽曲名順', 0, 1, 'composer'],
  ['arcaea', 'Arcaea', 'arcaea/タイトル順', 0, 2, 'composer'],
  ['rotaeno', 'Rotaeno', 'rotaeno/楽曲一覧', 1, 2, 'composer'],
  ['rizline', 'Rizline', 'rizline/楽曲一覧', 0, 0, 'artist'],
  ['orzmic', 'Orzmic', 'orzmic/楽曲一覧', 0, 1, 'composer'],
  ['cytus2', 'Cytus II', 'cytus-2/楽曲一覧', 0, 1, 'composer'],
  ['paradigm', 'Paradigm:Reboot', 'paradigm_/全曲ソート表', 0, 1, 'in-game-credit'],
  ['takumi', 'TAKUMI³', 'takumi_game/デフォルト順', 0, 1, 'in-game-credit'],
  ['vivid', 'vivid/stasis', 'vividstasis/楽曲一覧', 0, 1, 'in-game-credit'],
  ['deemo', 'Deemo', 'deemo/曲名リスト/タイトル順', 0, 1, 'in-game-credit'],
  ['deemo2', 'Deemo II', 'deemo_ii/タイトル順', 0, 1, 'in-game-credit'],
  ['deemo2albums', 'Deemo II', 'deemo_ii/アルバム順', 0, 1, 'in-game-credit'],
  ['infalsus', 'InFalsus', 'infalsus/全楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanota', 'Lanota', 'lanotagame/ストーリー楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotasub', 'Lanota', 'lanotagame/サブスク楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotaexp', 'Lanota', 'lanotagame/エキスパンション楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotasel', 'Lanota', 'lanotagame/セレクション楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotaevent', 'Lanota', 'lanotagame/イベント楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotaother', 'Lanota', 'lanotagame/その他チャプター楽曲一覧', 0, 1, 'in-game-credit'],
  ['lanotaplan', 'Lanota', 'lanotagame/調律計画楽曲一覧', 0, 1, 'in-game-credit'],
  ['dynamix', 'Dynamix', 'rhythmgame/Dynamix', 0, 1, 'in-game-credit'],
];
const root = new URL('../', import.meta.url);
const readJSON = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const writeJSON = (path, value) => writeFileSync(new URL(path, root), JSON.stringify(value, null, 2) + '\n');

// Only explicit typography and spacing equivalence; no fuzzy or cross-game matching.
export const matchKey = text => text.normalize('NFC').toLowerCase().replace(/\s+/gu, ' ').trim();
export function cleanCell(text) {
  let value = text
    .replace(/\(\([\s\S]*?\)\)/g, '')
    .replace(/\[\[([^\]]+)\]\]/g, (_, link) => link.split('>')[0])
    .replace(/&br;/gi, ' ')
    .replace(/&(?:size|color|ruby)\([^)]*\)\{([^{}]*)\};/g, '$1');
  for (let i = 0; i < 3; i++) value = value.replace(/&(?:size|color)\([^)]*\)\{([^{}]*)\};/g, '$1');
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/'{2,3}/g, '').replace(/%%/g, '')
    .replace(/^(?:(?:LEFT|CENTER|RIGHT|COLOR\([^)]*\)|BGCOLOR\([^)]*\)|SIZE\(\d+\)):)+/, '')
    .replace(/\s+/gu, ' ').trim();
}
const valid = text => !!text && !/^[-~>?\s]+$/.test(text) && !/\[\[|\]\]|&(?:\w+)[;(]|\{\{|\}\}|https?:/.test(text);
function titleAliases(id, cell, title) {
  if (!['arcaea', 'deemo', 'lanotaplan'].includes(id)) return [];
  const links = [...cell.matchAll(/\[\[([^\]]+)\]\]/g)];
  if (links.length !== 1) return [];
  const names = [cleanCell(links[0][1].split('>')[0])];
  // Arcaea puts translated names in small text; keep full version suffixes.
  if (id === 'arcaea') {
    for (const m of cell.matchAll(/&size\(10\)\{([^{}]+)\};/g)) {
      const translation = cleanCell(m[1].replace(/\[\[[^\]]+\]\]/g, '').replace(/^(?:&br;)+/, ''));
      if (valid(translation)) names.push(translation);
    }
  }
  return [...new Set(names)].filter(name => valid(name) && matchKey(name) !== matchKey(title));
}
export function extractRows(id, rows, titleColumn, artistColumn) {
  const records = [];
  let pending;
  for (const row of rows) {
    const cells = row.text.slice(1).split('|');
    if (id === 'rotaeno' || id === 'cytus') {
      const headers = cells.map(c => c.replace(/^~/, ''));
      const artistHeader = headers.findIndex(c => c === 'Composer' || c === 'Artist');
      const titleHeader = headers.findIndex(c => c === 'Song' || c === '曲名');
      if (artistHeader >= 0 && titleHeader >= 0) {
        titleColumn = titleHeader;
        artistColumn = artistHeader;
        continue;
      }
    }
    if (id === 'rizline') {
      if (cells[0]?.startsWith('&attachref(') && cells.at(-2)?.includes('[[')) {
        pending = { title: cleanCell(cells.at(-2)), line: row.line };
      } else if (pending && cells[0] === '~' && cells.slice(1, 5).every(c => c === '>')) {
        const artist = cleanCell(cells.at(-2));
        if (valid(artist)) records.push({ ...pending, artist, artistLine: row.line });
        pending = undefined;
      } else pending = undefined;
      continue;
    }
    // These two tables use plain titles; require their specific BPM/difficulty columns.
    const plainTitle = id === 'paradigm' || id === 'dynamix';
    if (plainTitle) {
      const numericCells = id === 'paradigm' ? [cells[3], cells[6]] : cells.slice(2, 7);
      if (!numericCells.some(c => /^\s*\d+(?:\.\d+)?\s*$/.test(c ?? ''))) continue;
    } else if (!cells[titleColumn]?.includes('[[') || /#/.test(cells[titleColumn].split('>')[1] ?? '')) continue;
    if (!['phigros', 'deemo'].includes(id) && !cells.slice(artistColumn + 1).some(c => /\d/.test(c))) continue;
    let title = cleanCell(cells[titleColumn]);
    if (plainTitle) title = title.replace(/^~/, '');
    if (id === 'deemo2albums') title = title.replace(/^■/, '');
    const artist = cleanCell(cells[artistColumn] ?? '');
    const aliases = titleAliases(id, cells[titleColumn], title);
    if (valid(title) && valid(artist)) records.push({ title, artist, line: row.line, ...(aliases.length ? { aliases } : {}) });
  }
  return records;
}

// These pairs are distinct compositions, supported by separate Wiki destinations/packs.
const confirmedHomonyms = {
  Arcaea: {
    Genesis: ['Iris', 'Morrigan feat.Lily'],
    Quon: ['Feryquitous', 'DJ Noriken'],
  },
};
// Reviewed mappings bind to an exact source row, never a global fuzzy key.
export function applyReviewedAliases(candidates, reviews) {
  const result = candidates.map(c => ({ ...c }));
  for (const review of reviews) {
    const hits = result.filter(c => c.source === review.source && c.title === review.sourceTitle &&
      c.artist === review.artist && (review.line ? c.line === review.line : c.sourceId === review.sourceId));
    if (hits.length !== 1) throw new Error(`Stale or ambiguous alias evidence: ${review.title} / ${review.source}`);
    const hit = hits[0];
    hit.aliases = [...new Set([...(hit.aliases ?? []), review.title])];
    hit.aliasReviews = [...(hit.aliasReviews ?? []), { title: review.title, reason: review.reason, ...(review.url ? { url: review.url } : {}) }];
  }
  return result;
}
export function reconcile(titles, candidates, game = '') {
  const index = new Map();
  for (const candidate of candidates) {
    for (const title of new Set([candidate.title, ...(candidate.aliases ?? [])])) {
      const key = matchKey(title);
      const list = index.get(key) ?? [];
      if (!list.includes(candidate)) list.push(candidate);
      index.set(key, list);
    }
  }
  const matched = {}, missing = [], conflicts = [];
  for (const title of titles) {
    const hits = index.get(matchKey(title)) ?? [];
    if (!hits.length) { missing.push(title); continue; }
    const artists = [...new Set(hits.map(hit => hit.artist))];
    const approved = confirmedHomonyms[game]?.[title];
    if (artists.length > 1 && !(approved && artists.length === approved.length && artists.every(a => approved.includes(a)))) {
      conflicts.push({ title, candidates: hits }); continue;
    }
    matched[title] = artists.map(artist => {
      const evidence = hits.filter(hit => hit.artist === artist);
      const hit = evidence[0];
      return {
        artist, sourceTitle: hit.title, sourceLine: hit.line,
        ...(hit.artistLine ? { artistLine: hit.artistLine } : {}),
        match: title === hit.title ? 'exact' : matchKey(title) === matchKey(hit.title) ? 'case-unicode-spacing' :
          hit.aliasReviews?.some(r => r.title === title) ? 'reviewed-alias' : 'source-alias',
        evidence,
      };
    });
  }
  return { matched, missing, conflicts };
}

export function build() {
  const library = parseLibrary(readFileSync(new URL('public/data/rhythm-songs.txt', root), 'utf8'), readJSON('src/data/rhythm-games.json'));
  const output = { schemaVersion: 2, retrievedAt: '2026-10-20', sources: {}, games: {} };
  const report = { retrievedAt: output.retrievedAt, totalEntries: 0, matchedEntries: 0, trackRecords: 0, games: {} };
  const byGame = new Map();
  const aliasReviews = readJSON('src/data/rhythm-title-aliases.json');
  if (aliasReviews.some(r => !library[r.game])) throw new Error('Alias references a removed game');
  function add(game, records) {
    byGame.set(game, [...(byGame.get(game) ?? []), ...records]);
  }
  for (const [id, game, path, titleColumn, artistColumn, creditType] of sources) {
    const rows = readJSON(`src/data/rhythm-wiki/${id}.json`);
    const candidates = extractRows(id, rows, titleColumn, artistColumn);
    if (!candidates.length) throw new Error(`No parsed artist records: ${id}`);
    output.sources[id] = { game, url: `https://wikiwiki.jp/${path}`, creditType, retrievedAt: output.retrievedAt };
    add(game, candidates.map(record => ({ ...record, source: id })));
  }
  for (const file of readdirSync(new URL('src/data/rhythm-databases/', root)).filter(f => f.endsWith('.json')).sort()) {
    const { records, id, ...metadata } = readJSON(`src/data/rhythm-databases/${file}`);
    output.sources[id] = metadata;
    if (!library[metadata.game]) throw new Error(`Unknown game ${metadata.game}`);
    add(metadata.game, records.map(record => ({ ...record, source: id })));
  }
  for (const [game, candidates] of byGame) {
    const { matched, missing, conflicts } = reconcile(library[game], applyReviewedAliases(candidates, aliasReviews.filter(r => r.game === game)), game);
    const tracks = {}, byTitle = {};
    for (const [title, variants] of Object.entries(matched)) {
      byTitle[title] = variants.map(variant => {
        const id = createHash('sha256').update(JSON.stringify([game, title, variant.artist])).digest('hex').slice(0, 24);
        tracks[id] = {
          id, title, artist: variant.artist, match: variant.match,
          ...(variants.length > 1 ? { identity: 'confirmed-homonym' } : {}),
          evidence: variant.evidence,
        };
        return id;
      });
    }
    output.games[game] = { tracks, byTitle };
    report.games[game] = {
      total: library[game].length, matched: Object.keys(byTitle).length,
      trackRecords: Object.keys(tracks).length, sourceRows: candidates.length, conflicts, missing,
    };
    report.trackRecords += Object.keys(tracks).length;
  }
  for (const [game, titles] of Object.entries(library)) {
    report.totalEntries += titles.length;
    if (!report.games[game]) report.games[game] = { total: titles.length, matched: 0, status: 'not-yet-sourced' };
    report.matchedEntries += report.games[game].matched;
  }
  writeJSON('public/data/rhythm-artists.json', output);
  writeFileSync(new URL('public/data/rhythm-playable.json', root), JSON.stringify(buildSongLibrary(library, output)) + '\n');
  writeJSON('src/data/rhythm-artist-coverage.json', report);
  for (const [game, stats] of Object.entries(report.games)) {
    if (stats.sourceRows) console.log(`${game}: ${stats.matched}/${stats.total}; conflicts ${stats.conflicts.length}`);
  }
  console.log(`Total: ${report.matchedEntries}/${report.totalEntries} game/title entries`);
  return { output, report };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) build();
