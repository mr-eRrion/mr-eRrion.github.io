import wordData from '../data/wordle-words.json' with { type: 'json' };

export const wordLengths = [4, 5, 6, 7] as const;
export type WordLength = typeof wordLengths[number];
export const wordsByLength = wordData.answers;
export const vocabulary = new Set(wordData.allowed);

export type LetterState = 'absent' | 'present' | 'correct';

export function scoreGuess(guess: string, answer: string): LetterState[] {
  if (!/^[a-z]{4,7}$/.test(guess) || !/^[a-z]{4,7}$/.test(answer) || guess.length !== answer.length) {
    throw new Error('Expected two lowercase words of equal length (4–7)');
  }
  const result: LetterState[] = Array(answer.length).fill('absent');
  const remaining = [...answer];
  // Reserve exact matches before allocating the remaining repeated letters.
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) { result[i] = 'correct'; remaining[i] = ''; }
  }
  for (let i = 0; i < answer.length; i++) {
    if (result[i] === 'correct') continue;
    const index = remaining.indexOf(guess[i]);
    if (index !== -1) { result[i] = 'present'; remaining[index] = ''; }
  }
  return result;
}

export function pickAnswer(length: WordLength = 5, previous?: string): string {
  if (!wordLengths.includes(length)) throw new Error('Unsupported word length');
  const candidates = wordsByLength[length].filter((word) => word !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
