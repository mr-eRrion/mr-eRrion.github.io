# 音游曲名题库

按用户指定的 22 个分类筛选后的快照保存于 `public/data/rhythm-songs.txt`，下载日期为 2026-10-20。

- 来源页面：https://falloxygen.github.io/
- 原始数据：https://raw.githubusercontent.com/FallOxygen/falloxygen.github.io/main/library/Songs.txt
- 上游同时提供 ZIP 下载：https://raw.githubusercontent.com/FallOxygen/falloxygen.github.io/main/library/Songs.zip

保留选中分类的曲名，不复制原站界面或实现代码。页面提供来源署名和筛选后的快照下载。上游的公开可下载状态不等于额外的版权授权；本仓库没有为该数据重新声明许可证。

`rhythm-games.json` 是当前保留的 22 个曲库白名单。只将已知分类识别为分段标记，保留 `[PRAW]`、`[X]`、`[Oro Ara]` 等实际曲名；保留以数字开头的曲名。分类内去重，开局时按完整的“曲名＋署名”在选中分类间去重。

更新时下载上述原始文件，先用完整的上游分类表解析，再按当前白名单筛选写入；不能直接用缩减的白名单解析完整文件，否则被移除分类会混入上一分类。检查新增或更名分类、更新快照日期，然后运行 `node scripts/check-rhythm-letters.mjs`。游戏按需加载本地静态文件，不依赖上游在线服务。

## 游戏题面

开局可选“只开曲名”或“曲名 - 署名”，默认署名模式；设置变动只影响下一局，当前局题面、判定和复制保持不变。纯曲名模式仅使用曲名并按曲名去重；署名模式按以下规则处理。

页面加载 `rhythm-playable.json`，每条记录保留 title 和可选 artist，不下载完整来源证据。已匹配署名显示为 `曲名 - 署名`，缺失或冲突条目保留纯曲名。曲名与署名共同参与逐字符揭开，中间的 ` - ` 固定显示；猜测、揭晓和复制使用同一完整答案。Arcaea 已确认的同名不同曲各自参与抽取；跨库只合并曲名和署名均相同的记录。

精简题库由下述 enrich 脚本同步生成，更新源数据后必须重建；测试会检查两份数据一致。

## 曲师署名补充

`public/data/rhythm-artists.json` 为独立补充数据，当前 schemaVersion 为 2。曲名文件已按当前白名单筛选，游戏 UI 使用据此生成的 `public/data/rhythm-playable.json` 精简题库。按用户要求，`artist` 原样保留来源的音乐署名，不按作曲、演奏、演唱等角色筛选；可能包含合作名义、演唱者或别名。来源声明的 composer 与 artist 在 sources.creditType 中区分，PJSK/DJMAX 额外保留已有的作曲、编曲、作词、演唱等字段，不从混合署名中猜测拆分。

2026-10-20 保留 22 个曲库，共 13,911 条分类内曲名记录、10,724 个去重曲名。全部分类均已有署名数据，匹配 12,149 条“分类＋曲名”，保存 12,151 首独立曲目，整体覆盖率 87.3%。本轮格式与别名核对新增 396 条标题匹配。这里的覆盖率以本地题库为分母，不代表来源网站或游戏全部曲目的覆盖率。

| 游戏 | 匹配曲名 / 题库曲名 | 独立曲目 |
| --- | ---: | ---: |
| Phigros | 307 / 327 | 307 |
| Arcaea | 594 / 634 | 596 |
| Orzmic | 200 / 214 | 200 |
| Milthm | 96 / 127 | 96 |
| Lanota | 692 / 723 | 692 |
| Rotaeno | 410 / 427 | 410 |
| Cytus II | 658 / 680 | 658 |
| Muse Dash | 699 / 724 | 699 |
| Paradigm:Reboot | 402 / 426 | 402 |
| TAKUMI³ | 266 / 272 | 266 |
| PJSK | 677 / 736 | 677 |
| maimai | 1433 / 1500 | 1433 |
| CHUNITHM | 1599 / 1638 | 1599 |
| オンゲキ | 828 / 840 | 828 |
| Rizline | 145 / 148 | 145 |
| vivid/stasis | 191 / 206 | 191 |
| Dynamix | 467 / 565 | 467 |
| Deemo | 434 / 449 | 434 |
| Deemo II | 520 / 584 | 520 |
| DJMAX | 529 / 768 | 529 |
| BOF | 927 / 1848 | 927 |
| InFalsus | 75 / 75 | 75 |

### 数据结构与同名曲

- `games[game].tracks[id]` 保存独立 ID、题库曲名、署名、匹配方式和 evidence。ID 由游戏、曲名及署名的 SHA-256 前 24 位确定，不依赖下载顺序；署名实质修改时 ID 会改变。
- `games[game].byTitle[title]` 为 ID 数组，允许同一音游下一个曲名对应多首曲目。
- Arcaea 的 Genesis 分为 Iris、Morrigan feat.Lily；Quon 分为 Feryquitous、DJ Noriken。两组已根据不同 Wiki 目标页／曲包及用户确认恢复为四条记录，不再当作署名冲突排除。
- 其他同名多署名暂记于覆盖报告的 conflicts，待核实是不同歌曲还是别名／署名差异，不能自动认定为多首曲目。相同游戏、相同曲名和完全相同署名的重复来源记录合并，但 evidence 保留。
- 匹配仅在同一音游内进行，自动允许大小写、Unicode NFC 和连续空白差异；语言别名使用来源明确列出的名称、Wiki 标题重定向或已核实的对应关系。不做模糊匹配，不跨游戏套用同名署名，保留 Remix/Edit 等版本后缀。缺失记录表示未知。
- `rhythm-title-aliases.json` 保存逐条核对的空格、全半角、标点与拼写映射，绑定来源 ID、原曲名、原署名及行号／记录 ID；重建时若证据失效或不唯一则报错。Arcaea 等表格的明确双语名称从同一标题单元格提取。新增别名仍经过同名冲突检查，不自动选取某一署名。

覆盖报告 `src/data/rhythm-artist-coverage.json` 列出每个游戏的缺失标题、待核实候选及统计。数据中的 matched 是原题库标题覆盖数，trackRecords 是独立曲目数，两者不能混用。

### 来源与复现

| 来源 ID | 游戏 | URL | 原字段含义 |
| --- | --- | --- | --- |
| phigros | Phigros | [来源](https://wikiwiki.jp/phigros/楽曲名順) | composer |
| arcaea | Arcaea | [来源](https://wikiwiki.jp/arcaea/タイトル順) | composer |
| rotaeno | Rotaeno | [来源](https://wikiwiki.jp/rotaeno/楽曲一覧) | composer |
| rizline | Rizline | [来源](https://wikiwiki.jp/rizline/楽曲一覧) | artist |
| orzmic | Orzmic | [来源](https://wikiwiki.jp/orzmic/楽曲一覧) | composer |
| cytus2 | Cytus II | [来源](https://wikiwiki.jp/cytus-2/楽曲一覧) | composer |
| paradigm | Paradigm:Reboot | [来源](https://wikiwiki.jp/paradigm_/全曲ソート表) | in-game-credit |
| takumi | TAKUMI³ | [来源](https://wikiwiki.jp/takumi_game/デフォルト順) | in-game-credit |
| vivid | vivid/stasis | [来源](https://wikiwiki.jp/vividstasis/楽曲一覧) | in-game-credit |
| deemo | Deemo | [来源](https://wikiwiki.jp/deemo/曲名リスト/タイトル順) | in-game-credit |
| deemo2 | Deemo II | [来源](https://wikiwiki.jp/deemo_ii/タイトル順) | in-game-credit |
| deemo2albums | Deemo II | [来源](https://wikiwiki.jp/deemo_ii/アルバム順) | in-game-credit |
| infalsus | InFalsus | [来源](https://wikiwiki.jp/infalsus/全楽曲一覧) | in-game-credit |
| lanota | Lanota | [来源](https://wikiwiki.jp/lanotagame/ストーリー楽曲一覧) | in-game-credit |
| lanotasub | Lanota | [来源](https://wikiwiki.jp/lanotagame/サブスク楽曲一覧) | in-game-credit |
| lanotaexp | Lanota | [来源](https://wikiwiki.jp/lanotagame/エキスパンション楽曲一覧) | in-game-credit |
| lanotasel | Lanota | [来源](https://wikiwiki.jp/lanotagame/セレクション楽曲一覧) | in-game-credit |
| lanotaevent | Lanota | [来源](https://wikiwiki.jp/lanotagame/イベント楽曲一覧) | in-game-credit |
| lanotaother | Lanota | [来源](https://wikiwiki.jp/lanotagame/その他チャプター楽曲一覧) | in-game-credit |
| lanotaplan | Lanota | [来源](https://wikiwiki.jp/lanotagame/調律計画楽曲一覧) | in-game-credit |
| dynamix | Dynamix | [来源](https://wikiwiki.jp/rhythmgame/Dynamix) | in-game-credit |
| bof-104 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=104) | event-display-credit |
| bof-110 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=110) | event-display-credit |
| bof-116 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=116) | event-display-credit |
| bof-123 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=123) | event-display-credit |
| bof-127 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=127) | event-display-credit |
| bof-133 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=133) | event-display-credit |
| bof-137 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=137) | event-display-credit |
| bof-140 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=140) | event-display-credit |
| bof-142 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=142) | event-display-credit |
| bof-146 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=146) | event-display-credit |
| bof-149 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=149) | event-display-credit |
| bof-74 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=74) | event-display-credit |
| bof-83 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=83) | event-display-credit |
| bof-88 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=88) | event-display-credit |
| bof-96 | BOF | [来源](https://manbow.nothing.sh/event/event.cgi?action=List_def&event=96) | event-display-credit |
| djmax | DJMAX | [来源](https://raw.githubusercontent.com/rosenrose/djmax/master/db.json) | composer |
| milthm-fandom | Milthm | [来源](https://milthm.fandom.com/wiki/Songs) | in-game-credit |
| milthm-official | Milthm | [来源](https://milthm.com/wiki/en/changelog/) | in-game-credit |
| musedash | Muse Dash | [来源](https://api.musedash.moe/albums) | artist |
| otoge-chunithm | CHUNITHM | [来源](https://raw.githubusercontent.com/zvuc/otoge-db/master/chunithm/data/music.json) | artist |
| otoge-maimai | maimai | [来源](https://raw.githubusercontent.com/zvuc/otoge-db/master/maimai/data/maimai_songs.json) | artist |
| otoge-ongeki | オンゲキ | [来源](https://raw.githubusercontent.com/zvuc/otoge-db/master/ongeki/data/music.json) | artist |
| sekai | PJSK | [来源](https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/musics.json) | composer |

SEGA 三游戏使用 [OTOGE DB](https://github.com/zvuc/otoge-db) 保留的官方公开 JSON 快照；Muse Dash 使用 [musedash.moe 公开 API](https://github.com/simon300000/musedash.moe/blob/master/API.md)。来源更新日期可能不同，不保证包含最新曲目；没有 artist 字段的来源记录不写入补全结果。

`rhythm-wiki/*.json` 保存 Wiki 表格行及原位置。Wiki 来源的 evidence.line 为源文本快照的 1 起始行号，Rizline 另保留 artistLine。部分 Wiki/Fandom 直连受限，本批 Wiki 文本来自可读取的公开页面缓存；读取日期不等于资料更新日期。

`rhythm-databases/*.json` 保存公开 JSON、HTML 来源提取出的曲名、署名、原始 ID／数组位置及明确的附加署名字段；包括输入快照 SHA-256、来源 URL 和读取日期，若有上游 updateTime 也会保留。Milthm Fandom 的哈希对应索引返回的表格文本；不把这些哈希冒充整个上游数据库的校验值。只保存元数据，不下载音乐或封面，不执行外部项目代码。公开可读不等于额外版权授权，使用时保留来源归属。

离线重建和测试：

```sh
node scripts/enrich-rhythm-artists.mjs
node scripts/check-rhythm-artists.mjs
node scripts/check-rhythm-letters.mjs
```

新增 JSON 快照先按 `scripts/import-rhythm-databases.mjs` 声明的 URL 下载至一个临时目录，使用脚本中相应文件名，再运行 `node scripts/import-rhythm-databases.mjs /path/to/downloads` 生成精简快照。该脚本只做本地导入，不访问网络。更新时核对字段语义、同名曲、覆盖率并更新读取日期。

### 本轮来源和剩余缺口

- Milthm 合并 Fandom 的公开索引表格与官方更新记录，保留原表行／公告句子。两者存在署名语言和版本差异，冲突待核实。
- Lanota 分别读取故事、扩展、精选、订阅、活动等表；Deemo II 合并标题表与更新更及时的专辑表。页面中的付费标记不属于曲名，解析时去除；署名中的 pianist 等身份原样保留。
- BOF 使用官方历届参赛列表的显示署名，可能含 mov/BGA 等附加署名，不自行拆分；数据保留赛事编号、作品编号和原详情链接。未匹配标题不靠相似名字推断。

新增社区来源的离线导入器为 `scripts/import-rhythm-community.mjs`，从下载目录读取 Milthm 表格／公告和 BOF HTML，再生成精简快照；运行 `node scripts/import-rhythm-community.mjs /path/to/downloads`。正常重建只需要仓库内的精简快照，无需重新联网。Wiki 表格需保留标题／署名列、原行号，按 enrich 脚本 sources 配置对应来源。
