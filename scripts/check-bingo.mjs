import assert from 'node:assert/strict';
import { createCard, shuffle, winningLines } from '../src/lib/bingo.ts';

for (let trial = 0; trial < 100; trial++) {
  const card = createCard();
  assert.equal(card.length, 25);
  assert.equal(card[12], null);
  assert.equal(new Set(card.filter((n) => n !== null)).size, 24);
  card.forEach((n, i) => {
    if (i !== 12) assert.ok(n >= (i % 5) * 15 + 1 && n <= (i % 5 + 1) * 15);
  });
  assert.equal(winningLines(card, new Set()).length, 0);
  for (const indices of [[0, 1, 2, 3, 4], [0, 5, 10, 15, 20], [0, 6, 18, 24], [4, 8, 16, 20]]) {
    const drawn = new Set(indices.map((i) => card[i]));
    assert.equal(winningLines(card, drawn).length, 1);
    drawn.delete(card[indices[0]]);
    assert.equal(winningLines(card, drawn).length, 0);
  }
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  const deck = shuffle(numbers);
  assert.deepEqual([...deck].sort((a, b) => a - b), numbers);
  assert.equal(winningLines(card, new Set(deck)).length, 12);
}
console.log('Bingo: card ranges, unique draws, free center, rows, columns, diagonals, and full card verified.');
