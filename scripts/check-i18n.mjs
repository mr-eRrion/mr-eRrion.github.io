import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

// Run after a production build; pass the same deployment base, e.g. /blog.
const base = (process.argv[2] ?? '').replace(/\/$/, '');
const root = new URL('../dist/', import.meta.url);
const files = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
assert.ok(files.length > 0, 'Build the site before checking bilingual routes');
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(([tag]) => tag);
const localFile = (pathname) => {
  assert.ok(pathname.startsWith(`${base}/`), `URL lost the deployment base: ${pathname}`);
  const relative = decodeURIComponent(pathname.slice(base.length + 1));
  if (relative === '404/') return '404.html';
  return relative.endsWith('/') || !relative ? `${relative}index.html` : relative;
};

let pairs = 0;
for (const file of files) {
  const html = read(file);
  const english = file.startsWith('en/');
  assert.equal(attribute(tags(html, 'html')[0], 'lang'), english ? 'en' : 'zh-CN', file);
  const links = tags(html, 'link');
  const canonical = new URL(attribute(links.find((tag) => attribute(tag, 'rel') === 'canonical'), 'href'));
  const switcher = html.match(/<nav class="language-switch"[^>]*>(.*?)<\/nav>/s)?.[1];
  assert.ok(switcher, `Missing language switch: ${file}`);
  const languageLinks = tags(switcher, 'a');
  assert.equal(languageLinks.length, 2, file);
  assert.equal(languageLinks.filter((tag) => attribute(tag, 'aria-current') === 'page').length, 1, file);

  if (!file.includes('404')) {
    const otherLanguage = english ? 'zh-CN' : 'en';
    const alternate = links.find((tag) => attribute(tag, 'hreflang') === otherLanguage);
    assert.ok(alternate, `Missing translation: ${file}`);
    const target = new URL(attribute(alternate, 'href'));
    const expected = english ? canonical.pathname.replace(`${base}/en/`, `${base}/`) : canonical.pathname.replace(`${base}/`, `${base}/en/`);
    assert.equal(target.pathname, expected, `Wrong translation target: ${file}`);
    const otherHTML = read(localFile(target.pathname));
    assert.ok(tags(otherHTML, 'link').some((tag) => attribute(tag, 'hreflang') === (english ? 'en' : 'zh-CN') && attribute(tag, 'href') === canonical.href), `Translation link is not reciprocal: ${file}`);
    assert.equal(attribute(languageLinks.find((tag) => attribute(tag, 'lang') === otherLanguage), 'href'), target.pathname, file);
    pairs++;
  }

  // Check generated navigation, TOC anchors, and shared assets in both languages.
  for (const tag of [...tags(html, 'a'), ...links, ...tags(html, 'script'), ...tags(html, 'img')]) {
    const href = attribute(tag, 'href') ?? attribute(tag, 'src');
    if (!href) continue;
    const url = new URL(href.replaceAll('&amp;', '&'), canonical);
    if (url.origin !== canonical.origin) continue;
    const targetFile = localFile(url.pathname);
    assert.ok(existsSync(new URL(targetFile, root)), `Broken link in ${file}: ${href}`);
    if (url.hash && targetFile.endsWith('.html')) {
      assert.ok(read(targetFile).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Broken anchor in ${file}: ${href}`);
    }
  }
}

for (const language of ['', 'en/']) {
  const feed = read(`${language}rss.xml`);
  assert.ok(feed.includes(`<language>${language ? 'en' : 'zh-CN'}</language>`));
  const items = [...feed.matchAll(/<item>(.*?)<\/item>/gs)];
  const articles = files.filter((file) => file.startsWith(`${language}posts/`) && file !== `${language}posts/index.html`);
  assert.equal(items.length, articles.length, 'RSS must include each published article once');
  for (const [, item] of items) {
    const url = new URL(item.match(/<link>(.*?)<\/link>/s)[1]);
    assert.ok(url.pathname.startsWith(`${base}/${language}posts/`), `RSS crossed languages: ${url}`);
    assert.ok(existsSync(new URL(localFile(url.pathname), root)));
  }
}

const index = JSON.parse(read('pagefind/pagefind-entry.json'));
assert.deepEqual(Object.keys(index.languages).sort(), ['en', 'zh-cn']);
console.log(`Verified ${files.length} pages, ${pairs / 2} translation pairs, links, anchors, RSS, and two search languages (base: ${base || '/'}).`);
