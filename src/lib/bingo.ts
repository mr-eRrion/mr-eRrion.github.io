export function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createCard(): (number | null)[] {
  const columns = Array.from({ length: 5 }, (_, column) =>
    shuffle(Array.from({ length: 15 }, (_, i) => column * 15 + i + 1)).slice(0, 5));
  return Array.from({ length: 25 }, (_, i) => i === 12 ? null : columns[i % 5][Math.floor(i / 5)]);
}

export function winningLines(card: (number | null)[], drawn: Set<number>): number[][] {
  const lines = [
    ...Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => row * 5 + col)),
    ...Array.from({ length: 5 }, (_, col) => Array.from({ length: 5 }, (_, row) => row * 5 + col)),
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
  ];
  return lines.filter((line) => line.every((i) => card[i] === null || drawn.has(card[i]!)));
}
