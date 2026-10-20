import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cleanCell, extractRows, reconcile, applyReviewedAliases } from './enrich-rhythm-artists.mjs';
import { extractSupplement } from './import-rhythm-supplements.mjs';

assert.equal(cleanCell('[[かめりあ>作曲者#Camellia]]'), 'かめりあ');
assert.equal(cleanCell('&size(10){A &amp; B};&br;feat. &#33457;'), 'A & B feat. 花');
assert.equal(cleanCell('[[A>B]]((footnote))'), 'A');
assert.equal(cleanCell('[[AI[UE]OON>AI_UE_OON]]'), 'AI[UE]OON');
assert.equal(cleanCell('[[[X]]]'), '[X]');
assert.equal(cleanCell('[[[PRAW]>PRAW]]'), '[PRAW]');
assert.equal(extractRows('arcaea', [{
  line: 1,
  text: "|[[Last &#124; Moment>Last]]&br;&color(#ffffff,#292929){&color(red){''Beyond''};譜面限定楽曲};|side|onoken|pack|4.0|9|",
}], 0, 2)[0].aliases[0], 'Last | Moment');
assert.deepEqual(extractRows('arcaea', [{
  line: 1, text: '|[[A>#aaa]]|side|Credit|1|',
}], 0, 2), []);
const csv = 'Song,Artist,Difficulty\n"Love me, Love me, Love me",きくお,Past\n' +
  '"Love me, Love me, Love me",きくお,Future\n' +
  '"Song ""A""","Artist, B",Past\nSong,Other artist,Past\n';
assert.deepEqual(extractSupplement('arcaea-charts', csv).map(r => [r.title, r.artist]), [
  ['Love me, Love me, Love me', 'きくお'], ['Song "A"', 'Artist, B'], ['Song', 'Other artist'],
]);
assert.deepEqual(extractSupplement('phigros-info', 'stable.id\tSong\tArtist\tIllustrator\n')[0], {
  sourceId: 'stable.id', title: 'Song', artist: 'Artist',
  sourceRow: 'stable.id\tSong\tArtist\tIllustrator', sourceLine: 1,
});
assert.throws(() => extractSupplement('phigros-info', 'missing\tartist'), /Invalid Phigros/);
assert.throws(() => extractSupplement('arcaea-charts', 'Unexpected,header\n'), /header/);
assert.throws(() => extractSupplement('otoge-maimai-deleted', '{}'), /array/);
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
const result = reconcile(['Song', ' song ', 'Another', 'Missing', 'song (Remix)'], [
  { title: 'song', artist: 'Alice', line: 1 },
  { title: 'Another', artist: 'Alice', line: 2 },
  { title: 'Another', artist: 'Bob', line: 3 },
]);
assert.equal(result.matched[' song '][0].artist, 'Alice');
assert.equal(result.matched[' song '][0].match, 'unicode-spacing');
assert.deepEqual(result.missing, ['Song', 'Missing', 'song (Remix)']);
const caseDistinct = reconcile(['Trust', 'TRUST'], [
  { title: 'Trust', artist: 'Artist A' },
  { title: 'TRUST', artist: 'Artist B' },
]);
assert.equal(caseDistinct.matched.Trust[0].artist, 'Artist A');
assert.equal(caseDistinct.matched.TRUST[0].artist, 'Artist B');
assert.equal(caseDistinct.conflicts.length, 0);
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
for (const source of Object.keys(artists.sources)) {
  if (!source.endsWith('-details') && source !== 'paradigm-official-updates') continue;
  const snapshot = read(`../src/data/rhythm-databases/${source}.json`);
  const excerpts = snapshot.records.map(({ sourceUrl, sourceExcerpt }) => ({ sourceUrl, sourceExcerpt }));
  assert.equal(createHash('sha256').update(JSON.stringify(excerpts)).digest('hex'), snapshot.rawSha256);
  assert.equal(new Set(snapshot.records.map(r => r.sourceId)).size, snapshot.records.length);
}
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
assert.deepEqual(credits('Phigros', 'Another Me').sort(), ['D_AAN', 'Neutral Moon']);
assert.deepEqual(credits('Arcaea', 'Quon').sort(), ['DJ Noriken', 'Feryquitous']);
assert.deepEqual(credits('Arcaea', 'Genesis').sort(), ['Iris', 'Morrigan feat.Lily']);
assert.equal(credits('PJSK', 'Tell Your World')[0], 'kz');
assert.deepEqual(credits('Paradigm:Reboot', '[NWAD]'), ['Knighthood']);
assert.deepEqual(credits('Paradigm:Reboot', 'OMG').sort(), ['Dopam!ne vs zEnsEn', 'Halv']);
assert.deepEqual(credits('Paradigm:Reboot', 'Alexandrite').sort(), ['WAiKURO', 'onoken']);
assert.deepEqual(credits('Milthm', 'Daisy'), ['Lifetheory']);
assert.deepEqual(credits('InFalsus', 'Cryogenic'), ['Camellia ft. Petra Gurin']);
assert.deepEqual(credits('InFalsus', 'F0 CHAOS'), ['Lamanya']);
assert.deepEqual(credits('Phigros', '[PRAW]'), ['Bluewind']);
assert.deepEqual(credits('Phigros', 'ハテ'), ['rN || Frums']);
for (const [game, title, artist] of [
  ['Phigros', 'Re：birth', 'ああああ'],
  ['Arcaea', "Dancin' on a Cat's Paw", 'Ino(chronoize)'],
  ['Arcaea', 'Can I Friend You on Bassbook? Lol', 'かめりあ feat. ななひら'],
  ['Arcaea', 'Kanjou no Matenrou ～Arr.Demetori', 'Demetori'],
  ['Arcaea', 'Death By Glamour', 'Toby Fox'],
  ['Paradigm:Reboot', 'Last farewell', 'Un vs. らせん'],
  ['Paradigm:Reboot', 'Name of oath', 'void (Mournfinale) feat. コツキミヤ (Gt.えば)'],
  ['Paradigm:Reboot', 'Kimi to mita sora no uta', 'TAKU1175+菊池亮太'],
]) assert.deepEqual(credits(game, title), [artist]);
assert.deepEqual(credits('Phigros', 'Spasmodic (Haocore Mix)'), ['姜米條-天利']);
assert.deepEqual(credits('Arcaea', 'Château de cartes'), ['Inverted Silence ft. Pernelle']);
assert.deepEqual(credits('Arcaea', 'Last | Moment'), ['onoken']);
assert.deepEqual(credits('Arcaea', 'AI[UE]OON'), ['MYUKKE.']);
assert.deepEqual(credits('Arcaea', '⊥⊬'), ['Silentroom Dismantled XOR かたぎり']);
assert.deepEqual(credits('maimai', '天霊霊地霊霊'), ['iKz feat.小可學妹']);
assert.deepEqual(credits('maimai', '残響散歌'), ['Aimer']);
assert.deepEqual(credits('maimai', 'Link').sort(), [
  'Circle of friends(天月-あまつき-・un:c・伊東歌詞太郎・コニー・はしやん)', 'Clean Tears feat. Youna',
]);
assert.deepEqual(credits('CHUNITHM', 'Reach for the Stars'), ['ソニック カラーズ']);
assert.deepEqual(credits('maimai', 'Trust'), ['Massive New Krew feat. 光吉猛修']);
assert.deepEqual(credits('maimai', 'TRUST'), ['小仏 凪(CV:佐倉 薫)']);
assert.deepEqual(credits('CHUNITHM', 'FLOWER'), ['DJ YOSHITAKA']);
assert.deepEqual(credits('CHUNITHM', 'Flower'), [
  '曲：白戸佑輔(Dream Monster)／歌：ASTERISM [星咲 あかり(CV：赤尾 ひかる)、藤沢 柚子(CV：久保田 梨沙)、三角 葵(CV：春野 杏)]',
]);
assert.deepEqual(credits('CHUNITHM', 'Love Cheat!'), ['MOSAIC.WAV']);
assert.deepEqual(credits('Paradigm:Reboot', '[PRAW] （Paradigm Edit.）'), ['Knighthood']);
assert.deepEqual(credits('Paradigm:Reboot', '思春期AI Syndrome'), ['technoplanet feat. 木下珠子']);
assert.equal(credits('Paradigm:Reboot', 'Rrhar\'ilREDASH'), undefined);
assert.equal(credits('CHUNITHM', 'Fracture RayAxium Crisis'), undefined);
assert.equal(credits('maimai', 'DX'), undefined);
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
