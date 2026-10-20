# eRrion 的小屋：项目说明

## 项目概览

“eRrion 的小屋”是 eRrion 的中英双语个人静态博客，用于长期整理数学、物理以及二者交汇处的学习笔记与专题文章。站点强调从定义、假设和结构出发，保留推导与理解形成的过程，而不仅陈列结论。

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
- 中英文站点标题、简介、作者与标签显示名集中在 `src/config.ts`；UI 翻译和语言路径函数集中在 `src/i18n.ts`。
- URL 和静态资源必须基于 Astro 的 `BASE_URL` 构造，以支持 GitHub Pages 子路径部署。
- `dist/`、`.astro/` 和 `node_modules/` 是生成内容，不进入版本控制。

### 内容约定

- 中文原文与英文译文分别维护；文章应明确对象、假设、符号约定和推导脉络，翻译保留公式和章节结构。
- 中文内容默认 `lang: zh`，英文内容放在各 collection 的 `en/` 子目录并声明 `lang: en`；同名文件代表同一内容的两个语言版本。英文文章引用带 `en/` 前缀的英文专栏 ID。
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
- 草稿是否在列表页、详情页、专栏、标签、RSS 和搜索索引中一致地不可见？
- 专栏引用、章节顺序与前后章导航是否一致？
- 数学公式、代码块、定理环境和长文目录在桌面与窄屏下是否保持可读？
- 元数据、canonical URL、Open Graph 信息、sitemap 和 RSS 是否与站点配置一致？

主要观察对象包括构建结果、类型与内容检查、生成路由、内部链接、静态资源路径、搜索索引、RSS/sitemap、响应式布局和浏览器控制台错误。

## 实现策略与设计决策

- 侧栏“浏览”保留首页、全部文章、专栏、主题、关于；主题分类统一从主题索引进入。下方“其他栏目”提供“小游戏”入口 `/games/`，首个游戏为 `/games/bingo/`，同步提供英文路由；不再生成归档页，时间顺序阅读由文章列表承担。
- Bingo 使用纯客户端单人抽号规则：各列分别取 1–15、16–30、31–45、46–60、61–75，中央为自由格；抽号不重复、自动标记，统计横竖和两条对角线。刷新或重新开局会重置，不保存进度。核心规则在 `src/lib/bingo.ts`，使用 Node.js 22.18+ 执行 `node scripts/check-bingo.mjs` 验证。
- Wordle 位于 `/games/wordle/`（含英文版），支持 4–7 字母选择（默认 5），每局六次机会，切换长度立即清空旧局。常用答案与允许猜测词分开维护于 `src/data/wordle-words.json`；猜测词库来源和更新约定见同目录的 `wordle-words.README.md`。词库外或重复提交不计次数。重复字母先匹配正确位置，再按剩余数量分配提示；支持实体和屏幕键盘，刷新会重置。抽词与判定在 `src/lib/wordle.ts`，使用 Node.js 22.18+ 执行 `node scripts/check-wordle.mjs` 验证。
- 音游开字母位于 `/games/rhythm-letters/`（含英文版），按需加载由 FallOxygen 曲名和公开署名数据生成的本地 `public/data/rhythm-playable.json` 精简题库。支持“只开曲名／曲名 - 署名”两种模式（默认署名模式，选择对下一局生效），纯曲名模式按曲名去重；支持多分类抽曲、逐字符揭开、完整曲名猜测（两种模式均无需署名，同名曲同时判中）、主持人标记、结束揭晓和题面复制；刷新不保存进度。比较时统一大小写与全半角，空格和曲名／署名分隔符默认显示；揭开所有字符不自动计为猜中。来源与更新约定见 `src/data/rhythm-songs.README.md`，规则验证为 `node scripts/check-rhythm-letters.mjs`。
- 曲师署名单独保存在 `public/data/rhythm-artists.json`，schemaVersion 2 按音游存储独立曲目 ID 和 `byTitle` 多值索引，附来源证据与匹配方式；Arcaea 的 Genesis、Quon 分别保留两首曲目，其他同名歧义不推断。按用户要求保留游戏／来源的完整音乐署名，不按作曲、演奏、演唱身份筛选；保留合作／演唱署名原文，游戏 UI 使用该字段，缺失／冲突条目保留纯曲名，已确认同名曲分别抽取，跨库按曲名和署名共同去重。Wiki 表格与公开 JSON 元数据快照分别在 `src/data/rhythm-wiki/`、`src/data/rhythm-databases/`。`scripts/import-rhythm-databases.mjs` 从已下载 JSON 导入，`scripts/import-rhythm-community.mjs` 导入 Milthm 社区表格、官方公告和 BOF 快照，`scripts/enrich-rhythm-artists.mjs` 离线生成，`scripts/check-rhythm-artists.mjs` 验证，覆盖报告为 `src/data/rhythm-artist-coverage.json`。匹配限于同一游戏，不跨游戏套用同名曲师；已核实的格式和拼写别名保存在 `src/data/rhythm-title-aliases.json`，绑定具体来源记录，保留版本后缀并检查同名冲突。
- 曲库范围以 `src/data/rhythm-games.json` 的 22 个分类为准；曲名文件、曲师来源及覆盖报告同步裁剪。用户名称 MushDash、TAKUMI3、ONGEKI、DJMAC 分别对应 Muse Dash、TAKUMI³、オンゲキ、DJMAX。更新上游题库时必须先用完整分类解析后筛选，不可用缩减白名单直接解析完整上游文件。

- 使用 Astro Content Collections 和 `src/content.config.ts` 作为文章与专栏元数据的唯一 schema 来源。
- 在构建期生成文章、专栏和标签动态路由；所有公开内容均由仓库内文件驱动。
- 使用 `BaseLayout.astro` 统一页面骨架、导航、SEO 元数据和社交分享信息；使用 `PostLayout.astro` 统一文章目录、标签和专栏章节导航。
- 使用全局 CSS 维护视觉系统和响应式规则，暂不引入客户端 UI 框架。
- 视觉参考 Delta 文档：纸色背景、细边框、衬线标题、红黑蓝顶端色带；桌面使用固定侧栏，窄屏使用可展开导航。首页保持“置顶 + 时间顺序文章列表”，最多展示 3 篇置顶，超出置顶上限的文章仍进入普通列表。主题支持浅色、深色和跟随系统，并在本地保存选择；文章目录在宽屏位于正文右侧，窄屏移至正文上方。
- 搜索由 `npm run build` 在 Astro 构建结束后对 `dist/` 运行 Pagefind 生成。
- 中文保留原路径，英文使用 `/en/` 前缀；页面模板统一放在 `src/pages/[...lang]/`，构建期按语言生成。语言切换优先进入对应页面，缺少译文时回到目标语言的对应列表，且不声明不存在的 SEO alternate。语言由 URL 决定，不通过浏览器偏好自动重定向。
- 列表、专栏前后章与 RSS 按内容语言隔离；Pagefind 根据 HTML 的 `lang` 建立与选择独立索引。公共资源路径不带语言前缀，所有页面和资源继续兼容部署 base path。
- 部署工作流从 `GITHUB_REPOSITORY` 推断 GitHub Pages 的站点 URL 与 base path，也允许用 `SITE_URL` 和 `BASE_PATH` 显式覆盖。

## 代码与内容结构

```text
.github/workflows/deploy.yml   GitHub Pages 构建与部署
astro.config.mjs              Astro、MDX、数学处理、站点 URL 与 base path
src/config.ts                 全站文案和标签显示名
src/i18n.ts                   UI 翻译、语言与路径函数
src/content.config.ts         文章与专栏内容 schema
src/content/posts/            Markdown/MDX 文章正文
src/content/series/           YAML 专栏元数据
src/content/posts/en/         与中文同名的英文文章
src/content/series/en/        英文专栏元数据
src/components/math/          定义、定理、证明等 MDX 组件
src/layouts/                  全站基础布局和文章布局
src/pages/                    首页、列表、详情、标签、搜索与 RSS 路由
scripts/check-i18n.mjs        构建后的双语路由、链接与索引检查
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
npm run check:i18n
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
5. 英文译文放在 `posts/en/` 下的同名文件，设置 `lang: en` 并引用英文专栏；按目录深度调整 MDX 组件导入。构建后运行 `npm run check:i18n` 核对中英文配对、链接、RSS 与搜索索引。

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
- 双语改动需验证对应页面互切、两种语言的搜索结果与界面文案。子路径构建后使用 `npm run check:i18n -- /blog` 等相同前缀运行检查。

## 待决定事项

- 文章级 Open Graph 图片尚未建立独立字段与生成流程。
- 已有构建后的双语配对和站内断链检查；当前没有自动化可访问性或浏览器端回归测试，内容和界面增长后可再评估是否引入。
- 尚未规定草稿预览、文章发布前审校清单和长期备份策略。

## 当前状态

- 阶段：可运行的初始版本，处于内容扩充与站点细节完善期。
- 已有能力：中英文切换、Markdown/MDX、KaTeX、数学环境组件、文章目录、专栏章节、标签、分语言 RSS 与 Pagefind 搜索、sitemap、响应式布局和 GitHub Pages 自动部署。
- 已有内容：6 篇文章与对应的 6 篇英文译文、1 个双语连载专栏；其中包含一篇讨论 Codex Skills 与凝聚态物理科研工作流的 AI for Research 文章。
