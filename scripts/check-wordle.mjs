import assert from 'node:assert/strict';
import { wordsByLength, wordLengths, vocabulary, scoreGuess, pickAnswer } from '../src/lib/wordle.ts';

assert.ok(vocabulary.size > 40000);
for (const word of ['tree', 'zesty', 'banana', 'letters', 'played', 'cookies']) assert.ok(vocabulary.has(word));
assert.ok([...vocabulary].every((word) => /^[a-z]{4,7}$/.test(word)));
for (const length of wordLengths) {
  const words = wordsByLength[length];
  assert.equal(words.length, new Set(words).size, 'No duplicate answers');
  assert.ok(words.length >= 500);
  assert.ok(words.every((word) => word.length === length && vocabulary.has(word)));
  for (let i = 0; i < 100; i++) {
    const answer = pickAnswer(length, words[0]);
    assert.ok(words.includes(answer));
    assert.notEqual(answer, words[0]);
    assert.deepEqual(scoreGuess(answer, answer), Array(length).fill('correct'));
    // Feedback must never mark more copies of a letter than the answer contains.
    const guess = words[(i + 1) % words.length];
    const scores = scoreGuess(guess, answer);
    for (const letter of new Set(guess)) {
      const marked = [...guess].filter((c, j) => c === letter && scores[j] !== 'absent').length;
      assert.equal(marked, Math.min([...guess].filter(c => c === letter).length, [...answer].filter(c => c === letter).length));
    }
  }
}
assert.deepEqual(scoreGuess('apple', 'apple'), Array(5).fill('correct'));
assert.deepEqual(scoreGuess('ghost', 'apple'), Array(5).fill('absent'));
assert.deepEqual(scoreGuess('allee', 'apple'), ['correct', 'present', 'absent', 'absent', 'correct']);
assert.deepEqual(scoreGuess('eerie', 'serve'), ['absent', 'correct', 'correct', 'absent', 'correct']);
assert.deepEqual(scoreGuess('apple', 'plain'), ['present', 'present', 'absent', 'present', 'absent']);
assert.throws(() => scoreGuess('shorter', 'apple'));
assert.throws(() => scoreGuess('APPLE', 'apple'));
assert.deepEqual(scoreGuess('noon', 'only'), ['present', 'present', 'absent', 'absent']);
assert.deepEqual(scoreGuess('banana', 'cabana'), ['present', 'correct', 'absent', 'correct', 'correct', 'correct']);
assert.deepEqual(scoreGuess('letters', 'settled'), ['present', 'correct', 'correct', 'correct', 'present', 'absent', 'present']);
assert.throws(() => scoreGuess('cat', 'cat'));
assert.throws(() => scoreGuess('elephant', 'elephant'));
assert.throws(() => pickAnswer(8));
console.log(`Wordle: ${vocabulary.size} accepted words, 4–7 letter answers, repeated-letter scoring, and input bounds verified.`);
