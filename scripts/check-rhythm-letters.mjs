import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLibrary, normalize, answerKey, maskTitle, pickSongs, buildSongLibrary, songPool, songText } from '../src/lib/rhythm-letters.ts';
const games = JSON.parse(readFileSync(new URL('../src/data/rhythm-games.json', import.meta.url)));
const library = parseLibrary(readFileSync(new URL('../public/data/rhythm-songs.txt', import.meta.url), 'utf8'), games);
assert.equal(Object.keys(library).length, 22);
assert.deepEqual(Object.keys(library), games);
assert.ok(!('Cytus' in library));
assert.ok(!library.Milthm.includes('[Berry Melody]'), 'Removed sections must not become song titles');
for (const removed of ['术力口', '东方Project']) {
  assert.ok(!(removed in library));
  assert.ok(!Object.values(library).flat().includes(`[${removed}]`), 'Removed headings must not leak into another library');
}
assert.equal(Object.values(library).flat().length, 13938);
assert.ok(library.Lanota.includes('[Oro Ara]'));
assert.ok(library.Phigros.includes('70 Minutes Fighters'));
assert.ok(library.Phigros.includes('[PRAW]'));
assert.deepEqual(parseLibrary('[Game]\n[X]\n123 Song\n[X]\n[Other]\n曲名', ['Game', 'Other']), { Game: ['[X]', '123 Song'], Other: ['曲名'] });
assert.equal(maskTitle('Ａa 你😀!', new Set([normalize('a'), '你'])), 'Ａa 你＊＊');
assert.equal(maskTitle('aAa', new Set(['a'])), 'aAa');
assert.equal(answerKey(' Ａ  Song '), answerKey('a song'));
assert.equal(answerKey('Trust'), answerKey('TRUST'), 'Player answers remain case-insensitive');
assert.equal(songPool({ A: [{ title: 'Trust' }, { title: 'TRUST' }] }, ['A'], 'title').length, 2,
  'Case-distinct song titles remain separate in the pool');
assert.equal(pickSongs(['a', 'a', 'b'], 2).length, 2);
assert.equal(new Set(pickSongs(['a', 'a', 'b'], 2)).size, 2);
for (const count of [0, 3, NaN, 1.5]) assert.throws(() => pickSongs(['a', 'b'], count), RangeError);
const artists = JSON.parse(readFileSync(new URL('../public/data/rhythm-artists.json', import.meta.url)));
const playable = buildSongLibrary(library, artists);
assert.deepEqual(playable, JSON.parse(readFileSync(new URL('../public/data/rhythm-playable.json', import.meta.url))), 'Playable snapshot must be rebuilt with artist data');
assert.equal(Object.values(playable).flat().length, 13944);
const corrections = JSON.parse(readFileSync(new URL('../src/data/rhythm-title-corrections.json', import.meta.url)));
for (const { game, title, titles } of corrections) {
  assert.ok(!library[game].includes(title), `Corrected or removed title returned: ${game} / ${title}`);
  for (const restored of titles) {
    assert.ok(library[game].includes(restored), `Missing restored title: ${game} / ${restored}`);
    assert.ok(playable[game].some(song => song.title === restored && song.artist),
      `Restored title must retain its own credit: ${game} / ${restored}`);
  }
}
for (const name of ['Genesis', 'Quon']) {
  const variants = songPool(playable, ['Arcaea']).filter(song => song.title === name);
  assert.equal(variants.length, 2);
  assert.equal(new Set(variants.map(song => songText(song))).size, 2);
  assert.deepEqual(songPool(playable, ['Arcaea'], 'title').filter(song => song.title === name), [{ title: name }]);
}
assert.equal(songPool(playable, ['Arcaea'], 'title').length, 634);
const titleRound = songPool(playable, ['Arcaea'], 'title');
assert.ok(titleRound.every(song => song.artist === undefined));
assert.equal(songText(titleRound.find(song => song.title === 'Quon')), 'Quon');
assert.equal(songText(titleRound.find(song => song.title === 'Quon'), new Set(['q'])), 'Q＊＊＊');
assert.equal(songPool(playable, ['Arcaea'], 'credit').length, 636, 'Switching modes must not mutate the library');
assert.deepEqual(songPool(playable, ['Phigros'], 'credit').filter(song => song.title === 'Another Me').map(song => songText(song)).sort(),
  ['Another Me - D_AAN', 'Another Me - Neutral Moon']);
assert.deepEqual(songPool(playable, ['Phigros'], 'title').filter(song => song.title === 'Another Me'), [{ title: 'Another Me' }]);
for (const [title, artists] of [
  ['OMG', ['Dopam!ne vs zEnsEn', 'Halv']],
  ['Alexandrite', ['WAiKURO', 'onoken']],
]) {
  const variants = songPool(playable, ['Paradigm:Reboot']).filter(song => song.title === title);
  assert.deepEqual(variants.map(song => song.artist).sort(), artists);
  assert.deepEqual(songPool(playable, ['Paradigm:Reboot'], 'title').filter(song => song.title === title), [{ title }]);
  assert.equal(variants.filter(song => answerKey(song.title) === answerKey(title.toUpperCase())).length, 2,
    'A title answer matches both independent compositions');
}
assert.equal(songPool(playable, ['maimai']).filter(song => song.title === 'Link').length, 2);
assert.deepEqual(songPool(playable, ['maimai'], 'title').filter(song => song.title === 'Link'), [{ title: 'Link' }]);
const credited = { title: 'Ａ-b', artist: 'Ab你' };
assert.equal(songText(credited, new Set(['a'])), 'Ａ＊＊ - A＊＊');
assert.equal(songText(credited, new Set(['-'])), '＊-＊ - ＊＊＊');
assert.equal(songText(credited), 'Ａ-b - Ab你');
assert.equal(songText({ title: 'Missing' }), 'Missing');
assert.notEqual(answerKey(songText(credited)), answerKey(credited.title), 'Title alone is not the full credited answer');
assert.equal(songPool({ A: [credited], B: [{ ...credited }, { ...credited, artist: 'Other' }] }, ['A', 'B']).length, 2);
assert.throws(() => buildSongLibrary({ A: ['Song'] }, { games: { A: { byTitle: { Song: ['bad'] }, tracks: {} } } }), /Invalid track/);
console.log(`Rhythm letters passed: ${Object.keys(library).length} libraries, ${Object.values(library).flat().length} entries, ${new Set(Object.values(library).flat()).size} unique titles.`);
