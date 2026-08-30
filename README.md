# 相空间札记

一个用于记录数学与物理内容的 Astro 静态博客。支持 Markdown/MDX、KaTeX 数学公式、定理与证明环境、专栏卷册、文章目录、标签、归档、RSS、静态全文搜索和 GitHub Pages 自动部署。

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

## 部署

将仓库推送到 GitHub 后，在仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。工作流会自动识别普通项目页面与 `<username>.github.io` 用户页面，并设置正确的资源路径。
