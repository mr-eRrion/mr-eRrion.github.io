import { SITE, EN_SITE, TAG_LABELS, EN_TAG_LABELS } from './config';

export const locales = ['zh', 'en'] as const;
export type Locale = typeof locales[number];
export const localeParam = (lang: Locale) => lang === 'en' ? 'en' : undefined;
export const routeLocale = (lang?: string): Locale => lang === 'en' ? 'en' : 'zh';
export const languagePaths = () => locales.map((lang) => ({ params: { lang: localeParam(lang) } }));
export const assetBase = import.meta.env.BASE_URL.replace(/\/$/, '');
export const localeBase = (lang: Locale) => `${assetBase}${lang === 'en' ? '/en' : ''}`;
// English translations keep the original filename in the en/ content directory.
export const contentSlug = (id: string) => id.replace(/^en\//, '');
export const htmlLang = (lang: Locale) => lang === 'zh' ? 'zh-CN' : 'en';

const zh = {
  language: '语言', chapter: '章节', phaseNotes: '相空间札记', seriesHeading: '专栏 · 卷册', emptySet: '空集',
  home: '首页', posts: '文章', allPosts: '全部文章', series: '专栏', archive: '归档',
  topics: '主题', topicIndex: '主题索引', about: '关于', search: '搜索', searchPosts: '搜索文章',
  skip: '跳到正文', browseTopics: '浏览与主题', explore: '浏览', mainNav: '主导航', topicNav: '主题导航',
  rss: 'RSS 订阅 ↗', appearance: '外观主题', light: '浅色', dark: '深色', system: '系统',
  lightTheme: '浅色主题', darkTheme: '深色主题', systemTheme: '跟随系统主题',
  greeting: '今天要从哪里开始呢？', pinned: '置顶', pinnedPost: '置顶文章', latest: '最新文章', list: '列表',
  postsDescription: '有哪些优秀的物理数学同人作品？', read: '阅读',
  topicsDescription: '按数学与物理主题浏览文章。', topicsIntro: '沿着概念之间的联系，而不只是时间顺序阅读。',
  seriesDescription: '有组织的系列文章', ongoing: '连载中', completed: '已完结', planned: '筹备中',
  openSeries: '打开专栏 →', contents: '目录', backPosts: '← 返回文章', volume: '卷',
  toc: '文章目录', onThisPage: '本页目录', noSections: '本文暂无分节', seriesNav: '专栏章节导航',
  partOf: '所属专栏', previous: '← 上一章', next: '下一章 →', backSeries: '返回专栏 →', fullContents: '查看完整目录',
  searchDescription: '搜索站内数学与物理文章。', searchIntro: '检索文章标题、正文以及数学与物理主题。',
  searchPlaceholder: '输入关键词……', aboutDescription: '关于 eRrion 的小屋。',
  aboutHeading: '我是一个正在学习的人', aboutSubheading: '请和我交朋友', avatar: 'eRrion 的头像',
  aboutIntro: '你好，我是 eRrion。这里是我整理数学与物理学习过程的笔记，偶尔随机掉落其他随笔。',
  aboutAside: '有哪些优秀的百合同人作品？', notFound: '页面未找到', notFoundHeading: '这个页面不存在。',
  notFoundIntro: '你可能来到了一片荒原', backHome: '返回首页', definition: '定义', theorem: '定理', proof: '证明', qed: '证毕',
  postCount: (n: number) => `${n} 篇文章`, chapterCount: (n: number) => `${n} 个章节`,
  archiveIntro: (n: number) => `${n} 篇文章，按时间倒序排列。`,
  topicIntro: (n: number) => `该主题下共有 ${n} 篇文章。`,
  readingTime: (n: number) => `约 ${n} 分钟阅读`,
  chapterProgress: (n: number, total: number) => `第 ${n} 章，共 ${total} 章`
};
const en: typeof zh = {
  language: 'Language', chapter: 'Chapter', phaseNotes: 'Phase Space Notes', seriesHeading: 'Series · Monographs', emptySet: 'Empty set',
  home: 'Home', posts: 'Articles', allPosts: 'All articles', series: 'Series', archive: 'Archive',
  topics: 'Topics', topicIndex: 'Topic index', about: 'About', search: 'Search', searchPosts: 'Search articles',
  skip: 'Skip to content', browseTopics: 'Browse & topics', explore: 'Explore', mainNav: 'Main navigation', topicNav: 'Topics',
  rss: 'RSS feed ↗', appearance: 'Appearance', light: 'Light', dark: 'Dark', system: 'System',
  lightTheme: 'Light theme', darkTheme: 'Dark theme', systemTheme: 'Use system theme',
  greeting: 'Where shall we begin today?', pinned: 'Pinned', pinnedPost: 'Pinned article', latest: 'Latest articles', list: 'Archive',
  postsDescription: 'Looking for good fan works about physics and mathematics?', read: 'Read ',
  topicsDescription: 'Browse articles by mathematics and physics topic.', topicsIntro: 'Follow connections between ideas, beyond chronological order.',
  seriesDescription: 'Articles organized into series', ongoing: 'Ongoing', completed: 'Completed', planned: 'Planned',
  openSeries: 'Open series →', contents: 'Contents', backPosts: '← All articles', volume: 'Volume',
  toc: 'Table of contents', onThisPage: 'On this page', noSections: 'No sections in this article', seriesNav: 'Series navigation',
  partOf: 'Part of the series', previous: '← Previous chapter', next: 'Next chapter →', backSeries: 'Back to series →', fullContents: 'View all chapters',
  searchDescription: 'Search mathematics and physics articles.', searchIntro: 'Search article titles, text, and mathematics and physics topics.',
  searchPlaceholder: 'Enter keywords…', aboutDescription: 'About eRrion’s Corner.',
  aboutHeading: 'I’m still learning.', aboutSubheading: 'Let’s be friends.', avatar: 'eRrion’s avatar',
  aboutIntro: 'Hi, I’m eRrion. This is where I keep notes as I learn mathematics and physics, with the occasional essay on something else.',
  aboutAside: 'Any good yuri fan works to recommend?', notFound: 'Page not found', notFoundHeading: 'This page doesn’t exist.',
  notFoundIntro: 'You may have wandered into the wilderness.', backHome: 'Back to home', definition: 'Definition', theorem: 'Theorem', proof: 'Proof', qed: 'End of proof',
  postCount: (n) => `${n} ${n === 1 ? 'article' : 'articles'}`, chapterCount: (n) => `${n} ${n === 1 ? 'chapter' : 'chapters'}`,
  archiveIntro: (n) => `${n} articles, newest first.`, topicIntro: (n) => `${n} ${n === 1 ? 'article' : 'articles'} in this topic.`,
  readingTime: (n) => `About ${n} min read`, chapterProgress: (n, total) => `Chapter ${n} of ${total}`
};

export function i18n(lang: Locale) {
  return { t: lang === 'en' ? en : zh, site: lang === 'en' ? EN_SITE : SITE, tags: lang === 'en' ? EN_TAG_LABELS : TAG_LABELS };
}
