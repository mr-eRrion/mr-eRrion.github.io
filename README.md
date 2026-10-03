# 相空间札记

一个用于记录数学与物理内容的 Astro 中英双语静态博客。支持 Markdown/MDX、KaTeX 数学公式、定理与证明环境、专栏卷册、文章目录、标签、归档、RSS、静态全文搜索和 GitHub Pages 自动部署。

## 本地使用

```sh
npm install
npm run dev
```

生产构建：

```sh
npm run build
```

## 写作

文章存放在 `src/content/posts/`。普通文章可以使用 Markdown；需要调用定理、定义和证明组件时使用 MDX。专栏资料存放在 `src/content/series/`，文章通过 `series` 引用专栏，并用 `seriesOrder` 指定章节顺序。站点名称、作者和主题中文名集中配置在 `src/config.ts`。

## 中英文内容

中文保留原网址，英文使用 `/en/` 前缀。侧栏的「中文 / English」会切换到当前页面的对应版本；站内导航、专栏章节、RSS 和搜索均按当前语言展示。没有译文时，切换入口返回目标语言的文章、专栏或主题列表。

- 中文文章保存在 `src/content/posts/`，默认 `lang: zh`；英文文章保存在 `src/content/posts/en/`，使用相同文件名，并填写 `lang: en`。
- 英文专栏保存在 `src/content/series/en/`，同样填写 `lang: en`；英文文章引用 `series: en/geometric-mechanics` 等英文专栏 ID。
- 两个版本共用标签 ID，分别翻译标题、摘要和正文。英文 MDX 的组件相对导入需多向上一级，例如 `../../../components/math/Theorem.astro`。
- UI 文案在 `src/i18n.ts`，站点信息和标签显示名在 `src/config.ts`。语言由 URL 决定，不自动跳转浏览器语言。

构建后检查双语页面、链接、RSS 和搜索索引：

```sh
npm run check
npm run build
npm run check:i18n
```

验证 GitHub Pages 子路径部署时，构建和检查应传入相同前缀：

```sh
BASE_PATH=/blog npm run build
npm run check:i18n -- /blog
```
