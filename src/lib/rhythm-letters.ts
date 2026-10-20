export function parseLibrary(text: string, games: string[]): Record<string, string[]> {
  const library: Record<string, string[]> = {};
  let current: string | undefined;
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const title = line.trim();
    if (!title) continue;
    const tag = title.match(/^\[(.+)\]$/)?.[1];
    // Bracketed song titles are common: only known range names start sections.
    if (tag && games.includes(tag)) {
      current = tag;
      library[current] ??= [];
    } else if (current && !library[current].includes(title)) library[current].push(title);
  }
  return library;
}

export const normalize = (text: string) => text.normalize('NFKC').toLowerCase();
export const answerKey = (text: string) => normalize(text).trim().replace(/\s+/gu, ' ');
export function maskTitle(title: string, opened: Set<string>): string {
  return Array.from(title, char => /\s/u.test(char) || opened.has(normalize(char)) ? char : '＊').join('');
}
export type Song = { title: string; artist?: string };
export type SongLibrary = Record<string, Song[]>;
export type SongMode = 'title' | 'credit';
type ArtistDatabase = {
  games: Record<string, { byTitle: Record<string, string[]>; tracks: Record<string, { title: string; artist: string }> }>;
};
export function buildSongLibrary(library: Record<string, string[]>, artists: ArtistDatabase): SongLibrary {
  return Object.fromEntries(Object.entries(library).map(([game, titles]) => [game, titles.flatMap(title => {
    const data = artists.games[game];
    const ids = data?.byTitle[title];
    if (!ids?.length) return [{ title }];
    return ids.map(id => {
      const track = data.tracks[id];
      if (!track || track.title !== title || !track.artist.trim()) throw new Error(`Invalid track: ${game} / ${id}`);
      return { title, artist: track.artist };
    });
  })]));
}
export function songPool(library: SongLibrary, games: string[], mode: SongMode = 'credit'): Song[] {
  // Project before deduplicating, so title-only rounds cannot draw the same title twice.
  const songs = games.flatMap(game => library[game] ?? []).map(song => mode === 'title' ? { title: song.title } : song);
  return [...new Map(songs.map(song =>
    [JSON.stringify([song.title, song.artist ?? null]), song],
  )).values()];
}
export function songText(song: Song, opened?: Set<string>): string {
  const text = (value: string) => opened ? maskTitle(value, opened) : value;
  return text(song.title) + (song.artist ? ` - ${text(song.artist)}` : '');
}
export function pickSongs<T>(pool: T[], count: number): T[] {
  const songs = [...new Set(pool)];
  if (!Number.isInteger(count) || count < 1 || count > songs.length) throw new RangeError('Invalid song count');
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songs[i], songs[j]] = [songs[j], songs[i]];
  }
  return songs.slice(0, count);
}
