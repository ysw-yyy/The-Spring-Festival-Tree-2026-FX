# 2026 春节树 · 无 TMT / 无 Vue 重写版

> **署名与许可**：游戏内容（15 个层的定义、文案、数值）属于原作者
> [QqQe308](https://github.com/QqQe308/The-Spring-Festival-Tree-2026)，本目录**逐字节保留**了他的内容层，
> 未作任何修改；`LICENSE` / `Prestige-tree-license`（MIT）随原仓库一并保留。
> 被替换掉的只有**引擎**：TMT（The Modding Tree, MIT）与 Vue 2 不再加载，改用一套自研引擎
> （`engine/`，无构建、无依赖）；数值仍用 MIT 的 `break_eternity`。
> 这不是原仓库的分支提交，而是同一份内容在另一套引擎上的运行版本。

原版：[QqQe308/The-Spring-Festival-Tree-2026](https://github.com/QqQe308/The-Spring-Festival-Tree-2026)（TMT 2.6.6.2 + Vue 2 + pako）

这一份是**同一套自研引擎**重做的版本：不加载 TMT、不加载 Vue，数值仍用 `break_eternity`，
存档解码用浏览器原生 `DecompressionStream`、编码用自研的**同步** DEFLATE（内容层要求同步拿到长度）。
**内容层（层定义）一个字节都没改**，只是按行首 `addLayer(` 切成了一层一个文件。

## 跑起来

随便找个静态服务器指向本目录即可（需要 Chromium/Edge 103+，用了 `DecompressionStream`）：

```powershell
python -m http.server 8126 --directory <本目录>
# 浏览器打开 http://127.0.0.1:8126/
```

没有构建步骤、没有依赖安装：`index.html` 里全是相对路径（37 个脚本，实测 0 缺失）。

## 目录

```
index.html          入口（由工具生成：引擎 18 个脚本 → mod.js → engine-config.js → 15 层 → tree.js → RT.boot()）
engine/             自研引擎 18 个文件（源在 rg/engine，用哈希强制交付副本与源一致）
vendor/             break_eternity.js（大数库，MIT）
content/
  mod.js            模组定义（原样）
  engine-config.js  ★ 本模组的引擎配置旋钮（这个模组与"默认语义"的全部差异都在这里）
  manifest.json     切分清单（含每个层来自原文件的哪一行、字节数）
  layers/           15 个层 + 1 个前导段 + tree.js，逐字节保留原文
css/                深空极光风格 + 动效层（5 个文件；motion.css 是独立的动效层，整块可删）
```

## 这个模组改过 TMT 引擎的地方（都做成了配置，不是散落的 if）

| 旋钮 | 本模组 | 引擎默认（= 上游 TMT 语义） | 不改会怎样 |
| --- | --- | --- | --- |
| `save.startString/endString` | `2026HappyNewYear` / `2026NewYearTreeMadeByQqQe308` | `TRGTSaveFile` / `EndOfSaveFile` | **直接报错**（读不了原版存档） |
| `save.legacyBase64Fallback` | `false` | `true` | 多一条上游没有的导入路径 |
| `hooks.doResetPre` / `onRowReset` / `updateTitle` | 全是 `null` | 上游的三处专有逻辑 | 照抄 `doResetPre` 会让**任意层重置静默失效**（`e` 层没有 `bestOnce`） |
| `challenge.variant` | `'sf'` | `'rg'` | 挑战结算路径不同 |
| `loop.normalizeDiffToNumber` | `true` | `false` | 内容层收到的 `diff` 类型不同 |
| `time.engineNumeric` / `realTimeField` / `resetTimeIsDecimal` | `number` / `realTime` / `false` | `decimal` / `timeplayed` / `true` | **存档里时间的序列化形式不同**；字段名写错不报错、只是静默丢数据 |
| `theme.list/default/colors` | `['default','aqua']` / `default`（极光色板） | 4 套，默认 rizline | 上游 `switchTheme()` 的写法不同，照抄会切不了主题 |
| `ui.strings.*` | 英文 | 中文 | 文案串味 |
| `layout.thingTreeVariant` | `'flex'` | `'table'` | 升级树整片错位 |
| `ui.infoboxBodyAlwaysInDom` | `true` | `false` | 折叠框（剧情/说明）的正文是"展开才建、收起就删"（上游行为），**那样只能单向播动画**；开了这个开关正文常驻 DOM，配合 CSS 的 `grid-template-rows` 过渡才能双向伸缩。默认必须是 `false`——它改的是 DOM 结构，没配对应样式时开了会让折叠框全部常开 |
| `loop.intervalMs` | `25`（40Hz） | `50`（20Hz） | 界面数字的可见刷新率只有 21 次/秒。实测 40Hz → **37~42 次/秒**（循环 JS 成本约 2 倍），60Hz 只到 50 次/秒却要 3 倍成本——已撞上"显示粒度 ÷ 增长速度"这道墙。URL 可覆盖：`?hz=60` / `?hz=20`；引擎默认仍是 50ms（20Hz） |
| `ui.smoothNumbers` | `{enabled:true, extraDigits:0}` | `{enabled:false}` | 两次 tick 之间把实时读数滚到目标值（rAF，只写被标记的节点）。`extraDigits` 决定滚动时的小数位（0 = 与最终文本同形状，宽度不跳）；URL 可覆盖：`?smooth=0` 关 / `1~3` 多给几位小数 |

## 验收（都在无头 Edge 里实跑过）

| 项目 | 结果 |
| --- | --- |
| 内容层切分 | **逐字节一致**（321,708B，15 层 + 前导段 + tree.js） |
| 启动 | **0 错误 0 警告**（20 个层注册） |
| 通用冒烟（切标签/买/重置/存读档/逐层渲染/配置接线） | **20/20** |
| 布局几何（无横向溢出、两栏各 50%、侧栏在视口内、同行树节点水平排开、右栏内容居中、**升级卡片统一正方形且文字不溢出**） | **16/16** |
| 树上可点节点集合（开局 + 推进后，与原版逐节点对拍） | **9/9** |
| 功能面 / 引擎缺口（所有层 × 主标签 × 微标签共 43 页全渲染） | **0 未知组件 / 0 报错 / 0 空白页** |
| 组件渲染对拍（42 个标签页"渲染出哪些组件种类"） | **全一致** |
| 存档互操作（原版 ↔ 本版） | **9/9**，15 个层字段逐一相同 |
| **用界面按钮导入原版存档**（设置页 → 导入存档 → 粘贴 → 重载） | **12/12**：导入后 15 个层的点数与升级逐一相同；导出按钮产出的存档能被原版算法解开 |
| **用玩家自己的真存档做端到端验收**（`real_save.js`：界面导入 → 逐层逐标签页巡检） | **10/10**：15 层字段逐一相同；38 个标签页零错误、零漏字面量；10 个页面的升级卡片统一正方形；能量条在右栏居中；**子标签不会被主循环弹回** |
| 逐层数值对拍（冻主循环 + 固定种子 + 96 步操作） | **0 差异**（41,689 字符快照，连跑两次同结果） |
| 重置按钮排版（三节点同一行 / 不溢出 / 栏内居中） | **5/5**（本地与线上） |
| 折叠框（圆角一致 + 双向伸缩逐帧采样） | **11/11**（本地与线上） |
| 动效层体检 + 开销采样（`motion_audit.js`，Profiler 取样占比） | 背景漂移/入场/卡片入场/子标签高亮都实测生效；**动效开关两组差 ≈ 1.8 个百分点的 `(program)`**（本机 fps 不可信，故用占比） |

复跑入口在仓库里：`rg/tests/run_all.cmd`（14 步，只跑春节树；含动效体检、折叠框、重置按钮、真存档验收；
有 `C:\Users\22830\Desktop\Saves\2026.txt` 时自动加跑真存档验收，没有就跳过并打印 `[SKIP]`；
每步失败会自动重试一次并如实标注）。

## 动效层（`css/motion.css`）

单独一个文件，**整块删掉即可回到纯静态**。全部只用 `transform` / `opacity` / 颜色，
且都落在小元素上，遵守工作区里实测过的红线（不动画 `filter` / `box-shadow` / `text-shadow`；
不给"可见范围随状态变化"的大元素加动画）：

| 动效 | 载体 | 触发 |
| --- | --- | --- |
| 右栏内容入场（淡入 + 上移 6px） | `#rightContent` | 切层/切子标签时由引擎**重放**（vdom 原地 patch，class 不变则动画不会自己重播，所以 `tabs.js` 里做了 `restartEnterAnim()`） |
| 升级卡片入场（错开 0.02s×6） | `.upgGrid > .upgCell > .upg` | 同上，随内容入场 |
| 卡片/按钮悬停抬起、按下回弹 | `.can` 系列 | `:hover` / `:active`，`transform` 不动布局 |
| 当前子标签高亮（亮一档的纱 + 内嵌下划线） | `.tabButton.active` | 引擎按当前 `subtabs` 加类（新解锁层会回落到第一个标签） |
| 树节点悬停放大 | `.treeNode.can` | `:hover`（`scale(1.06)`） |
| 背景极光极慢漂移（90s，位移 ±0.6%、缩放 1.03→1.06） | `body::before` | 唯一一处常驻动画，**只动 transform**（合成器操作）；`will-change` 也只写在这一层 |
| **折叠框伸缩**（`auto 0fr → auto 1fr`，0.22s） | `.story` / `.story.open` | 点标题展开或收起，双向都有过程；正文淡入慢半拍，先长高度再显字 |
| 键盘焦点环 | `.can` / `.tabButton` / `.opt` / `.treeNode` | `:focus-visible`，纯静态 |

### 重置按钮与"内容不溢出"（用户报过两次排版问题）

**症状 1：重置按钮的排版不对** —— 按钮内容是「'重置以获得 ' + `<b>数字</b>` + ' 资源名'」
这种"文本 + 内联元素 + 文本"的混合。容器一旦写成 `flex`，**每个文本节点和 `<b>` 都会变成
独立弹性项**，实测竖着排成三行（`+` / `3.16e49` / `希望粒子` 各一行），原版是一行。

- 修法：`.reset` / `.prestige-button` 改回 `display: inline-block` + `text-align: center`
  （上游就是 `inline-block`）。垂直居中不需要 flex —— `<button>` 自带"内容垂直居中"。
- 居中仍靠 `margin: auto`（它是 `.upgCol` 的弹性项，`inline-block` 会被块化成 `block`）。

**症状 2：挑战卡片的内容溢出圆角框** —— `.challenge { height: 300px }` 写死高度，
而卡片里的「目标 / 奖励 / 当前」是多行文本，实测子节点底部 1056 > 盒子底部 996，
文字与 `Start` 按钮都画到了卡片外面，标题还和上一行叠字。

- 修法：`.challenge` / `.achievement` / `.milestoneDone` / `.opt` 的固定 `height`
  一律改成 `min-height`（内容短时尺寸不变，长了能撑开）。

**门禁**：`real_save.js` 的逐页巡检新增"组件内容不溢出"检查——只量**流内**子元素的
边界（绝对定位的 `.tooltip` 本来就比卡片宽，用 `scrollWidth` 判会得到一片假溢出）。
`reset_check.js`（5 项）单独盯重置按钮：三节点必须**同一视觉行**、不溢出、在栏内居中。
判定"同一行"按**垂直重叠**分组，不能比较 `top` 是否相等（行内元素与相邻文本的盒子
度量能差 2px，直接比会把一行误判成两行——这个坑也踩过）。



1. **圆角/直角混用**：引擎内联了 `border-radius: opened ? 0 : '8px'`（上游原样），
   一展开就把外框变成直角，而标题栏与正文仍按样式表用圆角 → 看起来"外方内圆"。
   内联优先级最高，样式里必须 `!important` 才能统一；子元素不用自己写圆角，
   父级 `overflow: hidden` 会把它们裁成外轮廓的圆角。
2. **正文的 padding 会让它"收不干净"**：`grid` 行到 `0fr` 时元素自身 padding 仍占高度
   （实测残留 20px）。要把 padding 挪到内层 `span`（`display: block`）上，
   外层才能真正塌到 0（实测收起后正文高 = 0）。
3. **`transition` 写坏会静默失效**：`var(--t-fast)` 本身就是 `0.1s linear`（含缓动），
   再拼一个 `ease-out` 会让整条声明"计算值无效"而退化成初始值 `all 0s`——
   计算值看起来**和"被 `.instant` 压过"一模一样**，害我查错方向。
   验收脚本现在会打印命中该元素的所有 transition 规则，一眼看出谁赢。
   另外折叠框带 `instant` 类（`base.css: .instant { transition: none }`），覆盖它要 `!important`。

- **`prefers-reduced-motion: reduce` 时全部关闭**（写在同一个文件末尾，等于一个紧急开关）。
- 背景层已从 `position: absolute` 改成 **`fixed`**：带 `transform: scale()` 的元素会被算进
  **可滚动溢出区**，实测让文档 `scrollWidth` 从 1600 涨到 1614、冒出横向滚动条；
  fixed 元素不参与滚动溢出，从根上避免（几何门禁里那条"无横向溢出"就是抓到它的）。
- 开销：动效开 vs 关，`(idle)` 91.4% vs 95.3%、`(program)` 2.4% vs 0.6%
  —— 约 1.8 个百分点的合成开销，换来悬停/入场/高亮的反馈。

## 存档：能读原版、原版也能读它

- **导入原版存档**：设置页 → 「导入存档」→ 粘贴原版导出的存档串 → 回车，页面会自己重载。
  兼容原版的前后缀 `2026HappyNewYear … 2026NewYearTreeMadeByQqQe308`；
  实测把原版存档（含 15 个层的点数与升级）整体导入后**逐字段一致**。
- **导出**：设置页 → 「导出存档」（复制到剪贴板）。实测导出的存档用**原版的解码步骤**能解开、
  层数据齐全，所以原版也能读回本版的档。
- 若你本来就在**同一个 origin**（同主机同端口）上跑过原版，那更简单：本版读的就是同一个
  `localStorage['HappyNewYear2026']`，打开即继承进度。

## 已知取舍

- **`.reset`（重置/声望按钮）必须写 `margin-left/right: auto`**：它的父容器 `.upgCol` 是
  `display:flex; align-items:normal`（升级树不叠成一坨就靠这个 `normal`），而定宽 200px 的
  flex 子项**不会**被 `text-align:center` 居中，会被放在交叉轴起点 —— 实测中心偏左 300px。
  auto 外边距吸收交叉轴剩余空间才是正确修法；不要改成 `align-items:center`。
- 与上游一致的**上游 bug** 会被保留（例如里程碑开关的 `<button class="smallUpg can">ON/OFF</button>` 写法、
  上游模板里 `style = "{width: 0px}"` 这种漏 `v-bind:` 的无效写法 —— 后者浏览器本来就是忽略的，
  所以本版也**不写**那个内联尺寸，否则同一行的树节点会竖排）。
- `grid` / `text-input` / `slider` / `drop-down` / `particles` 引擎里没有实现（`grid` 是空实现并记一条 warn），
  因为这个模组的内容层**根本没用到**它们；`feature_surface` 每次都会重新验证"未知组件数 = 0"。
