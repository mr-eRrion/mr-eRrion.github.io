import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { i18n, routeLocale, localeBase, languagePaths, contentSlug, htmlLang } from '../../i18n';

export const getStaticPaths = languagePaths;

export async function GET(context) {
  const lang = routeLocale(context.params.lang);
  const { site: metadata } = i18n(lang);
  const posts = (await getCollection('posts', ({ data }) => !data.draft && data.lang === lang)).sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
  const site = new URL(`${localeBase(lang)}/`, context.site);
  return rss({
    title: metadata.title,
    description: metadata.description,
    site,
    customData: `<language>${htmlLang(lang)}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: new URL(`posts/${contentSlug(post.id)}/`, site).href
    }))
  });
}
