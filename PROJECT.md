# 相空间札记：项目说明

## 项目概览

“相空间札记”是 eRrion 的中文个人静态博客，用于长期整理数学、物理以及二者交汇处的学习笔记与专题文章。站点强调从定义、假设和结构出发，保留推导与理解形成的过程，而不仅陈列结论。

本文件是项目级长期记忆，记录站点定位、实现约束、内容模型、维护流程和验收标准。面向读者的简介与快速使用说明仍以 `README.md` 为准。

## 背景与动机

数学和物理文章通常需要普通博客之外的表达能力，包括可靠的公式排版、定理与证明环境、较长文章的目录导航，以及按课程或专著脉络组织系列内容。本项目将这些能力整合为一个无需服务端的静态站点，使文章可以用 Markdown 或 MDX 编写、通过 Git 管理，并由 GitHub Pages 持续发布。

内容当前覆盖几何与拓扑、量子理论、统计物理和数学方法；已有“几何力学导论”系列。数学与物理在站点中各自可以是独立主题，也可以在自然相关时交叉讨论。

## 项目目标

- 建立适合数学与物理长文的稳定写作和发布环境。
- 让单篇文章可按时间、主题和专栏三种路径发现与阅读。
- 保证公式、代码、定理环境、文章目录和章节导航在静态构建后正确工作。
- 保持站点简洁、可读、易于维护，并兼容普通 GitHub Pages 项目站点和 `<username>.github.io` 用户站点。
- 通过内容 schema 和构建检查尽早发现元数据、引用与页面生成错误。

## 基本约束与设计约定

### 已确定事实

- 技术栈为 Astro 7、TypeScript、Markdown/MDX、KaTeX 和 Pagefind。
- 输出模式为纯静态站点，不依赖服务端运行时或数据库。
- 文章源文件位于 `src/content/posts/`，专栏元数据位于 `src/content/series/`。
- 文章可以通过 `draft` 隐藏；`featured` 标记用于在首页置顶，首页最多展示 3 篇置顶文章；专栏归属使用 `series` 和正整数 `seriesOrder`。
- 全站标题、简介、作者与标签中文名集中在 `src/config.ts`。
- URL 和静态资源必须基于 Astro 的 `BASE_URL` 构造，以支持 GitHub Pages 子路径部署。
- `dist/`、`.astro/` 和 `node_modules/` 是生成内容，不进入版本控制。

### 内容约定

- 正文以中文为主；文章应明确对象、假设、符号约定和推导脉络。
- 普通文章优先使用 Markdown；需要 Astro 组件时使用 MDX。
- 数学公式使用 Markdown 数学语法，由 `remark-math` 与 `rehype-katex` 处理。
- 定义、定理和证明分别复用 `src/components/math/` 中的现有组件。
- 标签使用稳定的英文标识符；面向读者的中文名称在 `TAG_LABELS` 中统一维护。
- 专栏章节的 `seriesOrder` 应唯一且连续，保证目录和上一篇/下一篇导航正确。

### 当前产品假设

- 现阶段内容规模适合构建期读取全部内容，不需要分页、数据库或增量内容服务。
- Pagefind 的构建后静态索引足以满足站内搜索需求。
- GitHub Actions 与 GitHub Pages 是默认发布渠道；本地预览和其他静态托管平台属于兼容目标，但不是当前主流程。

## 核心问题与观察指标

本项目持续关注以下可检验问题：

- 新文章能否只通过内容文件和元数据加入站点，而无需修改页面逻辑？
- 普通根路径和 GitHub Pages 仓库子路径下的页面、图片、RSS、搜索与站内链接是否都正确？
- 草稿是否在列表页、详情页、专栏、标签、归档、RSS 和搜索索引中一致地不可见？
- 专栏引用、章节顺序与前后章导航是否一致？
- 数学公式、代码块、定理环境和长文目录在桌面与窄屏下是否保持可读？
- 元数据、canonical URL、Open Graph 信息、sitemap 和 RSS 是否与站点配置一致？

主要观察对象包括构建结果、类型与内容检查、生成路由、内部链接、静态资源路径、搜索索引、RSS/sitemap、响应式布局和浏览器控制台错误。

## 实现策略与设计决策

- 使用 Astro Content Collections 和 `src/content.config.ts` 作为文章与专栏元数据的唯一 schema 来源。
- 在构建期生成文章、专栏和标签动态路由；所有公开内容均由仓库内文件驱动。
- 使用 `BaseLayout.astro` 统一页面骨架、导航、SEO 元数据和社交分享信息；使用 `PostLayout.astro` 统一文章目录、标签和专栏章节导航。
- 使用全局 CSS 维护视觉系统和响应式规则，暂不引入客户端 UI 框架。
- 搜索由 `npm run build` 在 Astro 构建结束后对 `dist/` 运行 Pagefind 生成。
- 部署工作流从 `GITHUB_REPOSITORY` 推断 GitHub Pages 的站点 URL 与 base path，也允许用 `SITE_URL` 和 `BASE_PATH` 显式覆盖。

## 代码与内容结构

```text
.github/workflows/deploy.yml   GitHub Pages 构建与部署
astro.config.mjs              Astro、MDX、数学处理、站点 URL 与 base path
src/config.ts                 全站文案和标签显示名
src/content.config.ts         文章与专栏内容 schema
src/content/posts/            Markdown/MDX 文章正文
src/content/series/           YAML 专栏元数据
src/components/math/          定义、定理、证明等 MDX 组件
src/layouts/                  全站基础布局和文章布局
src/pages/                    首页、列表、详情、归档、标签、搜索与 RSS 路由
src/styles/global.css         全站视觉与响应式样式
public/                       favicon、头像、Open Graph 图片等原样发布资源
dist/                         生产构建结果（生成目录）
```

## 工作流程

### 本地开发

```sh
npm install
npm run dev
```

修改内容或界面后先运行检查，再执行完整生产构建：

```sh
npm run check
npm run build
```

需要检查生产构建时运行：

```sh
npm run preview
```

### 发布

```text
提交并推送到 main
        ↓
GitHub Actions 使用 Node.js 22 执行 npm ci
        ↓
Astro 生成静态页面
        ↓
Pagefind 为 dist/ 建立搜索索引
        ↓
上传 Pages artifact
        ↓
部署到 GitHub Pages
```

GitHub 仓库需在 Pages 设置中选择 GitHub Actions 作为发布来源。

### 新增文章

1. 在 `src/content/posts/` 新建 `.md` 或 `.mdx` 文件，并填写 schema 要求的 frontmatter。
2. 新标签需要同时在 `src/config.ts` 的 `TAG_LABELS` 中补充中文显示名。
3. 若文章属于专栏，引用现有专栏 ID，并设置唯一且连续的 `seriesOrder`。
4. 运行 `npm run check` 和 `npm run build`，再检查文章页、所属列表、标签、专栏与搜索结果。

## 验证与验收标准

一次内容或代码变更只有在与改动范围相关的下列条件满足后才可视为完成：

- `npm run check` 无 Astro、TypeScript 或内容 schema 错误。
- `npm run build` 成功，且 Pagefind 能为 `dist/` 建立索引。
- 没有意外提交 `node_modules/`、`.astro/`、`dist/`、系统文件、密钥或其他生成物。
- 新增或修改的公开页面可从预期入口访问，内部链接无明显断链。
- 文章 frontmatter 日期、标签、草稿状态、精选状态和专栏引用符合 schema 与内容意图。
- 涉及专栏时，章节顺序、进度、上一篇/下一篇导航一致。
- 涉及部署路径或静态资源时，至少验证根路径与非空 base path 两种构建情形。
- 涉及样式或布局时，检查桌面和窄屏视图；正文、公式、代码块和导航无明显溢出或遮挡。
- 涉及 SEO 或订阅时，检查 canonical URL、Open Graph 图片、RSS 与 sitemap 中的绝对地址。

## 待决定事项

- 文章级 Open Graph 图片尚未建立独立字段与生成流程。
- 当前没有自动化断链、可访问性或浏览器端回归测试；内容和界面增长后可再评估是否引入。
- 尚未规定草稿预览、文章发布前审校清单和长期备份策略。

## 当前状态

- 阶段：可运行的初始版本，处于内容扩充与站点细节完善期。
- 已有能力：Markdown/MDX、KaTeX、数学环境组件、文章目录、专栏章节、标签、归档、RSS、Pagefind 搜索、sitemap、响应式布局和 GitHub Pages 自动部署。
- 已有内容：6 篇文章、1 个连载专栏；其中包含一篇讨论 Codex Skills 与凝聚态物理科研工作流的 AI for Research 文章。
