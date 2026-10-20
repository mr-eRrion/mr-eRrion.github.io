import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleanCell, extractRows, reconcile, applyReviewedAliases } from './enrich-rhythm-artists.mjs';

assert.equal(cleanCell('[[かめりあ>作曲者#Camellia]]'), 'かめりあ');
assert.equal(cleanCell('&size(10){A &amp; B};&br;feat. &#33457;'), 'A & B feat. 花');
assert.equal(cleanCell('[[A>B]]((footnote))'), 'A');
assert.deepEqual(extractRows('rotaeno', [
  { line: 1, text: '|~解禁|~Song|~Composer|~Version|h' },
  { line: 2, text: '|1|[[First]]|Alice|1.0|2|3|' },
  { line: 3, text: '|~Song|~Composer|~Version|h' },
  { line: 4, text: '|[[Second]]|Bob|1.0|2|3|' },
], 1, 2), [
  { title: 'First', artist: 'Alice', line: 2 },
  { title: 'Second', artist: 'Bob', line: 4 },
]);
assert.deepEqual(extractRows('rizline', [
  { line: 1, text: '|&attachref(cover.png);|>|>|>|>|\'\'[[Song]]\'\'|' },
  { line: 2, text: '|~|>|>|>|>|[[Alice>Artists#Alice]]|' },
], 0, 0), [{ title: 'Song', artist: 'Alice', line: 1, artistLine: 2 }]);
assert.deepEqual(extractRows('paradigm', [
  { line: 1, text: '|~Title|~Composer|~Genre|~BPM|h' },
  { line: 2, text: '|[PRAW]|Knighthood|FRENCHCORE|210|Illustrator|2:37|4.0|529|Charter|' },
], 0, 1), [{ title: '[PRAW]', artist: 'Knighthood', line: 2 }]);
assert.deepEqual(extractRows('dynamix', [
  { line: 1, text: '|~Song|Credit|3|-|10|13|-|' },
  { line: 2, text: '|~対応言語|日本語|~|' },
], 0, 1), [{ title: 'Song', artist: 'Credit', line: 1 }]);
assert.deepEqual(extractRows('deemo2albums', [
  { line: 1, text: '|■[[Piano piece]]|pianist: Example|1.0|2|3|4|' },
], 0, 1), [{ title: 'Piano piece', artist: 'pianist: Example', line: 1 }]);
const result = reconcile(['Song', 'Another', 'Missing', 'song (Remix)'], [
  { title: 'song', artist: 'Alice', line: 1 },
  { title: 'Another', artist: 'Alice', line: 2 },
  { title: 'Another', artist: 'Bob', line: 3 },
]);
assert.equal(result.matched.Song[0].artist, 'Alice');
assert.equal(result.matched.Song[0].match, 'case-unicode-spacing');
assert.deepEqual(result.missing, ['Missing', 'song (Remix)']);
assert.equal(result.conflicts.length, 1);
assert.equal(result.matched.Another, undefined);
const bilingual = extractRows('arcaea', [
  { line: 1, text: '|[[ヨミビトシラズ]]&br;&size(10){yomibito_shirazu};|pack|Credit|1|' },
], 0, 2);
assert.deepEqual(bilingual[0].aliases, ['ヨミビトシラズ', 'yomibito_shirazu']);
assert.equal(bilingual[0].title, 'ヨミビトシラズ yomibito_shirazu');
const reviewedCandidates = [{ title: 'A-B', artist: 'Alice', source: 'example', line: 1 }];
const review = { title: 'A - B', sourceTitle: 'A-B', artist: 'Alice', source: 'example', line: 1, reason: 'Spacing' };
const reviewed = applyReviewedAliases(reviewedCandidates, [review]);
assert.equal(reconcile(['A - B'], reviewed).matched['A - B'][0].match, 'reviewed-alias');
assert.equal(reviewedCandidates[0].aliases, undefined);
assert.throws(() => applyReviewedAliases(reviewedCandidates, [{ ...review, line: 2 }]), /Stale or ambiguous/);
assert.equal(reconcile(['A - B'], [...reviewed, { title: 'A - B', artist: 'Bob' }]).conflicts.length, 1);
assert.deepEqual(reconcile(['A-B (Remix)'], reviewed).missing, ['A-B (Remix)']);

const cache = new Map();
const read = path => {
  if (!cache.has(path)) cache.set(path, JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')));
  return cache.get(path);
};
const artists = read('../public/data/rhythm-artists.json');
const coverage = read('../src/data/rhythm-artist-coverage.json');
let count = 0;
let titles = 0;
const ids = new Set();
assert.equal(artists.schemaVersion, 2);
for (const [game, data] of Object.entries(artists.games)) {
  assert.equal(Object.keys(data.byTitle).length, coverage.games[game].matched);
  assert.equal(Object.keys(data.tracks).length, coverage.games[game].trackRecords);
  for (const [id, credit] of Object.entries(data.tracks)) {
    const { title } = credit;
    assert.equal(id, credit.id);
    assert.ok(!ids.has(id), 'Independent track IDs must be unique across games');
    ids.add(id);
    assert.ok(credit.artist.trim());
    assert.ok(data.byTitle[title].includes(id));
    assert.ok(credit.evidence.length);
    for (const evidence of credit.evidence) {
      const source = artists.sources[evidence.source];
      assert.equal(source.game, game);
      assert.ok(source.url.startsWith('https://'));
      assert.equal(evidence.artist, credit.artist);
      if (evidence.line) {
        const rows = read(`../src/data/rhythm-wiki/${evidence.source}.json`);
        assert.ok(rows.some(row => row.line === evidence.line));
      } else {
        const snapshot = read(`../src/data/rhythm-databases/${evidence.source}.json`);
        assert.match(snapshot.rawSha256, /^[a-f0-9]{64}$/);
        assert.ok(snapshot.records.some(r => r.sourceId === evidence.sourceId && r.title === evidence.title && r.artist === evidence.artist));
      }
    }
    assert.ok(!coverage.games[game].missing.includes(title));
    assert.ok(!coverage.games[game].conflicts.some(conflict => conflict.title === title));
    count++;
  }
  for (const [title, trackIds] of Object.entries(data.byTitle)) {
    assert.ok(trackIds.length);
    assert.equal(new Set(trackIds).size, trackIds.length);
    for (const id of trackIds) assert.equal(data.tracks[id].title, title);
    titles++;
  }
  assert.equal(coverage.games[game].matched + coverage.games[game].missing.length + coverage.games[game].conflicts.length, coverage.games[game].total);
}
const credits = (game, title) => artists.games[game].byTitle[title]?.map(id => artists.games[game].tracks[id].artist);
assert.deepEqual(credits('Phigros', 'Gungnir Fracture'), ['Kry.exe']);
assert.equal(credits('Phigros', 'Another Me'), undefined);
assert.deepEqual(credits('Arcaea', 'Quon').sort(), ['DJ Noriken', 'Feryquitous']);
assert.deepEqual(credits('Arcaea', 'Genesis').sort(), ['Iris', 'Morrigan feat.Lily']);
assert.equal(credits('PJSK', 'Tell Your World')[0], 'kz');
assert.deepEqual(credits('Paradigm:Reboot', '[NWAD]'), ['Knighthood']);
assert.deepEqual(credits('Milthm', 'Daisy'), ['Lifetheory']);
assert.deepEqual(credits('InFalsus', 'Cryogenic'), ['Camellia ft. Petra Gurin']);
assert.deepEqual(credits('InFalsus', 'F0 CHAOS'), ['Lamanya']);
assert.ok(credits('Arcaea', 'yomibito_shirazu')?.length);
assert.ok(credits('BOF', '切踏')[0].startsWith('A.T.M.'));
assert.ok(Object.values(artists.games['Deemo II'].tracks).some(r => r.artist.startsWith('pianist:')));
for (const removed of ['术力口', '东方Project']) assert.ok(!(removed in artists.games));
assert.deepEqual(reconcile(['Other name'], [{ title: 'Original', aliases: ['Other name'], artist: 'A', sourceId: '1' }]).matched['Other name'][0].match, 'source-alias');
assert.equal(reconcile(['123'], [{ title: '123', artist: 'A' }]).matched['123'].length, 1);
assert.equal(reconcile(['Same'], [{ title: 'Same', artist: 'A' }, { title: 'Same', artist: 'A' }]).matched.Same.length, 1);
assert.equal(count, coverage.trackRecords);
assert.equal(titles, coverage.matchedEntries);
assert.ok(count > 12000);
assert.equal(Object.keys(artists.games).length, 22);
const allowedGames = read('../src/data/rhythm-games.json');
assert.deepEqual(Object.keys(coverage.games).sort(), [...allowedGames].sort());
assert.ok(Object.keys(artists.games).every(game => allowedGames.includes(game)));
assert.ok(Object.values(artists.sources).every(source => allowedGames.includes(source.game)));
console.log(`Verified ${count} sourced tracks / ${titles} titles across ${Object.keys(artists.games).length} games, source integrity, aliases, and independent homonyms.`);
