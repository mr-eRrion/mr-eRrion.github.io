# 音游曲名题库

按用户指定的 22 个分类筛选后的快照保存于 `public/data/rhythm-songs.txt`，下载日期为 2026-10-20。

- 来源页面：https://falloxygen.github.io/
- 原始数据：https://raw.githubusercontent.com/FallOxygen/falloxygen.github.io/main/library/Songs.txt
- 上游同时提供 ZIP 下载：https://raw.githubusercontent.com/FallOxygen/falloxygen.github.io/main/library/Songs.zip

保留选中分类的曲名，不复制原站界面或实现代码。页面提供来源署名和筛选后的快照下载。上游的公开可下载状态不等于额外的版权授权；本仓库没有为该数据重新声明许可证。

`rhythm-games.json` 是当前保留的 22 个曲库白名单。只将已知分类识别为分段标记，保留 `[PRAW]`、`[X]`、`[Oro Ara]` 等实际曲名；保留以数字开头的曲名。分类内去重，开局时按完整的“曲名＋署名”在选中分类间去重。

更新时下载上述原始文件，先用完整的上游分类表解析，再按当前白名单筛选写入；不能直接用缩减的白名单解析完整文件，否则被移除分类会混入上一分类。检查新增或更名分类、更新快照日期，然后运行 `node scripts/check-rhythm-letters.mjs`。游戏按需加载本地静态文件，不依赖上游在线服务。

本地快照已校正上游的粘连曲名，并删除用户确认的无效条目。`rhythm-title-corrections.json` 保存分类、原字符串、恢复后的曲名及依据（titles 为空数组表示删除）；重新下载题库时需按分类重放这些已核实的校正。不要按大小写、语言变化或标点自动切分未知曲名。检查脚本会验证旧粘连条目未重新出现，以及恢复后的曲目和署名完整。

## 游戏题面

开局可选“只开曲名”或“曲名 - 署名”，默认署名模式；设置变动只影响下一局，当前局题面、判定和复制保持不变。纯曲名模式仅使用曲名并按曲名去重；署名模式按以下规则处理。

页面加载 `rhythm-playable.json`，每条记录保留 title 和可选 artist，不下载完整来源证据。已匹配署名显示为 `曲名 - 署名`，缺失或冲突条目保留纯曲名。曲名与署名共同参与逐字符揭开，中间的 ` - ` 固定显示；揭晓和复制保留署名，两种模式的猜测均只匹配完整曲名，无需输入署名。本局多首同名曲会同时判为猜中。已确认的同名不同曲各自参与抽取；跨库只合并曲名和署名均相同的记录。

精简题库由下述 enrich 脚本同步生成，更新源数据后必须重建；测试会检查两份数据一致。

## 曲师署名补充

`public/data/rhythm-artists.json` 为独立补充数据，当前 schemaVersion 为 2。曲名文件已按当前白名单筛选，游戏 UI 使用据此生成的 `public/data/rhythm-playable.json` 精简题库。按用户要求，`artist` 原样保留来源的音乐署名，不按作曲、演奏、演唱等角色筛选；可能包含合作名义、演唱者或别名。来源声明的 composer 与 artist 在 sources.creditType 中区分，PJSK/DJMAX 额外保留已有的作曲、编曲、作词、演唱等字段，不从混合署名中猜测拆分。

2026-10-20 保留 22 个曲库，共 13,938 条分类内曲名记录、10,683 个去重曲名。全部分类均已有署名数据，匹配 12,252 条“分类＋曲名”，保存 12,258 首独立曲目，整体覆盖率 87.9%。重点来源补查后，又校正了 maimai、CHUNITHM、Paradigm:Reboot 的粘连标题，统计包含拆分、分类内去重及大小写敏感匹配的结果。这里的覆盖率以本地题库为分母，不代表来源网站或游戏全部曲目的覆盖率。

| 游戏 | 匹配曲名 / 题库曲名 | 独立曲目 |
| --- | ---: | ---: |
| Phigros | 327 / 327 | 328 |
| Arcaea | 634 / 634 | 636 |
| Orzmic | 197 / 214 | 197 |
| Milthm | 95 / 127 | 95 |
| Lanota | 688 / 723 | 688 |
| Rotaeno | 405 / 427 | 405 |
| Cytus II | 649 / 680 | 649 |
| Muse Dash | 697 / 724 | 697 |
| Paradigm:Reboot | 430 / 430 | 432 |
| TAKUMI³ | 266 / 272 | 266 |
| PJSK | 677 / 736 | 677 |
| maimai | 1496 / 1496 | 1497 |
| CHUNITHM | 1665 / 1665 | 1665 |
| オンゲキ | 827 / 840 | 827 |
| Rizline | 144 / 148 | 144 |
| vivid/stasis | 189 / 206 | 189 |
| Dynamix | 460 / 565 | 460 |
| Deemo | 403 / 449 | 403 |
| Deemo II | 517 / 584 | 517 |
| DJMAX | 527 / 768 | 527 |
| BOF | 885 / 1848 | 885 |
| InFalsus | 74 / 75 | 74 |

### 数据结构与同名曲

- `games[game].tracks[id]` 保存独立 ID、题库曲名、署名、匹配方式和 evidence。ID 由游戏、曲名及署名的 SHA-256 前 24 位确定，不依赖下载顺序；署名实质修改时 ID 会改变。
- `games[game].byTitle[title]` 为 ID 数组，允许同一音游下一个曲名对应多首曲目。
- Arcaea 的 Genesis 分为 Iris、Morrigan feat.Lily；Quon 分为 Feryquitous、DJ Noriken。两组已根据不同 Wiki 目标页／曲包及用户确认恢复为四条记录，不再当作署名冲突排除。
- Phigros 的 Another Me 经用户确认分别为 D_AAN、Neutral Moon 两首不同歌曲，保留两条独立曲目与各自来源证据（2026-10-20）。
- Paradigm:Reboot 的 OMG（Dopam!ne vs zEnsEn、Halv）及 Alexandrite（onoken、WAiKURO）经用户确认分别为同名不同曲，保留四条独立曲目与各自来源证据（2026-10-20）。
- maimai 的 Link 经用户确认分别为 Clean Tears feat. Youna、Circle of friends(天月-あまつき-・un:c・伊東歌詞太郎・コニー・はしやん) 两首独立歌曲，保留各自来源证据（2026-10-20）。
- 其他同名多署名暂记于覆盖报告的 conflicts，待核实是不同歌曲还是别名／署名差异，不能自动认定为多首曲目。相同游戏、相同曲名和完全相同署名的重复来源记录合并，但 evidence 保留。
- 匹配仅在同一音游内进行，严格区分大小写，只自动允许 Unicode NFC 和连续空白差异；语言别名使用来源明确列出的名称、Wiki 标题重定向或已核实的对应关系。`Trust`／`TRUST`、`FLOWER`／`Flower` 分别匹配各自署名。曲库去重也区分大小写，玩家提交答案时才忽略大小写；玩家开字母的输入仍统一大小写与全半角。不做模糊匹配，不跨游戏套用同名署名，保留 Remix/Edit 等版本后缀。缺失记录表示未知。
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

### 五个重点曲库的再次核查（2026-10-20）

来源补查阶段在旧的大小写不敏感规则下使 Arcaea、Phigros 全部匹配。随后根据用户确认修复 maimai、CHUNITHM、Paradigm:Reboot 的曲名粘连，并同步重建署名数据和游戏题库；最新统计见上表。游戏规则未变。

- 修正 Wiki 链接解析对曲名内方括号的处理，恢复 `[PRAW]`、`[X]`、`AI[UE]OON` 等；只检查链接目标中的锚点，不再把链接后的颜色代码误判为锚点，因此恢复 `Last | Moment`、`Last | Eternity` 等曲目。该公共修正也使 Orzmic、Cytus II、TAKUMI³、vivid/stasis、Lanota 共恢复 7 条匹配。
- Arcaea 的希腊字母／拉丁字母、日文／英文别名逐条绑定原表记录；`一輪`、`Opium and Purple haze`、`Word Problems` 另有曲目页说明。`⊥⊬` 不与符号外观相近的 `~_+` 合并。
- Paradigm:Reboot 的 `Paradigm Edit.`、`Original Mix` 和 `A.K.A. 黄昏の協奏曲` 根据同一曲目的 Genre 栏核实，保留题库中的完整版本后缀。新增专辑四首曲目的署名来自游戏官方账号的 v4.12 更新公告。
- maimai、CHUNITHM 的旧曲从 OTOGE DB 独立的删除曲目档案补入。maimai《ぽっぴっぽー》采用 Wiki 的 `(ラマーズP)` 括号署名；Wiki 明确说明机台、NET 和官网未显示署名，此条为社区注明的归属。

新增来源：

| 来源 ID | 游戏 | URL | 字段／证据 |
| --- | --- | --- | --- |
| phigros-info | Phigros | [公开元数据](https://raw.githubusercontent.com/7aGiven/Phigros_Resource/info/info.tsv) | TSV 曲名、曲师，保留稳定歌曲 ID 和原行 |
| arcaea-charts | Arcaea | [社区曲目表](https://raw.githubusercontent.com/TechnicalVessel/Arcaea-Chart-List/main/arcaea_chart_list.csv) | Song、Artist；相同歌曲的多个难度行去重 |
| otoge-maimai-deleted | maimai | [删除曲目档案](https://raw.githubusercontent.com/zvuc/otoge-db/main/maimai/data/music-ex-deleted.json) | title、artist、deleted_date |
| otoge-chunithm-deleted | CHUNITHM | [删除曲目档案](https://raw.githubusercontent.com/zvuc/otoge-db/main/chunithm/data/music-ex-deleted.json) | title、artist、deleted_date |
| arcaea-details | Arcaea | [Château de cartes](https://wikiwiki.jp/arcaea/Ch%C3%A2teau%20de%20cartes) | 曲目页 Composer |
| phigros-details | Phigros | [Phigros Wiki](https://wikiwiki.jp/phigros/) | 三首愚人节曲目的 Composer，逐条保存详情 URL |
| paradigm-details | Paradigm:Reboot | [resoLve](https://wikiwiki.jp/paradigm_/resoLve) | 曲目页アーティスト |
| paradigm-official-updates | Paradigm:Reboot | [官方账号 v4.12 更新公告](https://www.sina.cn/news/detail/5347374949468765.html) | 2026-09-26 公告原文音乐署名 |
| maimai-details | maimai | [maimai 攻略 Wiki](https://gamerch.com/maimai) | 曲目页署名，逐条保存详情 URL；community-attribution |

前四个来源由 `node scripts/import-rhythm-supplements.mjs /path/to/downloads` 导入。下载文件名依次为 `phigros-info.tsv`、`arcaea-charts.csv`、`maimai-deleted.json`、`chunithm-deleted.json`，缺少的文件跳过。该导入器首次只选择覆盖报告中的 missing 标题，不覆盖已有匹配和 conflicts；再次导入同时保留该来源已选标题，重建后仍可重复执行。导入后运行 enrich 和两个 rhythm 检查脚本。

`*-details.json` 和 `paradigm-official-updates.json` 是逐页核对的短摘录，包含 sourceUrl、sourceExcerpt；其 rawSha256 校验的是按记录顺序序列化的 `{sourceUrl, sourceExcerpt}` 数组，而不是网页全文。检查脚本验证摘录哈希和独立记录 ID。

粘连校正（2026-10-20）：

- 拆开 55 条“两首曲名粘连”：maimai 22 条、CHUNITHM 29 条、Paradigm:Reboot 4 条。拆分后所有歌曲均已匹配署名；其中 maimai 的《ブリキノダンス》补取已有删除曲目档案，CHUNITHM 的 5 处空格／全半角差异使用逐条别名映射。
- 另修复 2 处附带信息粘连：《インドア系ならトラックメイカー》后的 `x0o0x_` 是官方列表中相邻空白曲名歌曲的署名；《絡繰りドール》后的《人形裁判…》是东方原曲信息。仅恢复收录曲标题，不把附带信息新增为可抽取曲目。详情链接保存在校正记录中。
- 分类内去重后曲名总数净增 54，匹配数净增 111；其他游戏及现有署名冲突保持不变。

重点曲库的最终确认结果（2026-10-20）；其他未匹配条目保留在覆盖报告：

- Phigros、Arcaea 已全部匹配。用户确认 `Re：birth` 的写法与署名；Arcaea 的 `Dancin' on a Cat's Paw`、`Can I Friend You on Bassbook? Lol`、`Kanjou no Matenrou ～Arr.Demetori`、`Death By Glamour` 保留用户确认的写法，并逐条绑定来源别名与署名。`Another Me` 仍按两首独立歌曲保留。
- Paradigm:Reboot 已全部匹配。按用户确认的写法改为 `Last farewell`、`Name of oath`、`Kimi to mita sora no uta`，保留来源完整署名；`OMG`、`Alexandrite` 各存两首独立曲目。
- CHUNITHM 已全部匹配：用户确认 `イロドリミドリ` 不是歌曲，已删除；`Reach for the Stars` 经用户确认并核对来源，使用 `ソニック カラーズ` 署名，通过绑定来源记录的大小写别名映射。
- maimai 已全部匹配：用户确认此前 26 条缺失项均非本游戏收录曲，已全部删除；删除记录按分类保存在 `rhythm-title-corrections.json`，不影响其他游戏中的同名条目。`Link` 按两首独立歌曲保留。

上述剩余统计采用用户指定的大小写敏感匹配规则。此前仅靠忽略大小写得到的匹配回退为缺失，只有逐条核实的别名可继续映射，不能为维持覆盖率自动补大小写别名。
