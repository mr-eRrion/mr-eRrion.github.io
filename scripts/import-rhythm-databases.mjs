// Import downloaded public JSON snapshots. No remote code is executed.
// Usage: node scripts/import-rhythm-databases.mjs /path/to/downloads
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const directory = process.argv[2];
if (!directory) throw new Error('Supply a directory containing the downloaded snapshots');
const destination = new URL('../src/data/rhythm-databases/', import.meta.url);
mkdirSync(destination, { recursive: true });
const sha = text => createHash('sha256').update(text).digest('hex');
const text = value => typeof value === 'string' ? value.trim() : Array.isArray(value) && value.every(v => typeof v === 'string') ? value.join(' / ') : '';
function save(id, game, file, url, extract, creditType = 'artist') {
  const raw = readFileSync(resolve(directory, file), 'utf8');
  const data = JSON.parse(raw);
  const records = extract(data).filter(r => typeof r.title === 'string' && r.title.trim() && typeof r.artist === 'string' && r.artist.trim());
  if (!records.length) throw new Error(`No usable records in ${file}`);
  const result = {
    id, game, url, retrievedAt: '2026-10-20', creditType, rawSha256: sha(raw),
    ...(data.updateTime ? { upstreamUpdatedAt: data.updateTime } : {}),
    records,
  };
  writeFileSync(new URL(`${id}.json`, destination), JSON.stringify(result, null, 2) + '\n');
  console.log(`${game}: ${records.length} source records`);
}
for (const [id, game, path] of [
  ['maimai', 'maimai', 'maimai/data/maimai_songs.json'],
  ['chunithm', 'CHUNITHM', 'chunithm/data/music.json'],
  ['ongeki', 'オンゲキ', 'ongeki/data/music.json'],
]) save(`otoge-${id}`, game, `${id}-songs.json`, `https://raw.githubusercontent.com/zvuc/otoge-db/master/${path}`,
  rows => rows.map((r, index) => ({ title: r.title, artist: r.artist, sourceId: String(r.id ?? r.sort ?? index), sourceIndex: index })));
save('sekai', 'PJSK', 'sekai.txt', 'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/musics.json',
  rows => rows.map((r, index) => ({
    title: r.title, artist: r.composer, sourceId: String(r.id), sourceIndex: index,
    credits: { composer: r.composer, arranger: r.arranger, lyricist: r.lyricist },
  })), 'composer');
save('musedash', 'Muse Dash', 'musedash-albums.json', 'https://api.musedash.moe/albums',
  albums => Object.values(albums).flatMap(album => Object.values(album.music).map(r => ({
    title: r.name, artist: r.author, sourceId: r.uid,
    aliases: [...new Set(['ChineseS', 'ChineseT', 'English', 'Japanese', 'Korean'].map(lang => r[lang]?.name).filter(Boolean))],
  }))));
save('djmax', 'DJMAX', 'djmax-db.json', 'https://raw.githubusercontent.com/rosenrose/djmax/master/db.json',
  data => Object.entries(data.songs).flatMap(([pack, rows]) => rows.map((r, index) => ({
    title: r.title, artist: text(r.artist?.remix) ? `${text(r.artist.compose)} (remix: ${text(r.artist.remix)})` : text(r.artist?.compose),
    sourceId: `${pack}/${index}`, credits: {
      composer: text(r.artist?.compose), remixer: text(r.artist?.remix),
      vocalist: text(r.artist?.vocal), lyricist: text(r.artist?.lyrics),
    },
  }))), 'composer');
