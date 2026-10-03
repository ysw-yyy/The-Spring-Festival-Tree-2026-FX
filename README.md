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
engine/             自研引擎 18 个文件（与音乐游戏树共享同一份源，用哈希强制一致）
vendor/             break_eternity.js（大数库，MIT）
content/
  mod.js            模组定义（原样）
  engine-config.js  ★ 本模组的引擎配置旋钮（这个模组与"默认语义"的全部差异都在这里）
  manifest.json     切分清单（含每个层来自原文件的哪一行、字节数）
  layers/           15 个层 + 1 个前导段 + tree.js，逐字节保留原文
css/                深空极光风格（4 个文件，2398 行）
```

## 这个模组改过 TMT 引擎的地方（都做成了配置，不是散落的 if）

| 旋钮 | 本模组 | 引擎默认（= 音乐游戏树） | 不改会怎样 |
| --- | --- | --- | --- |
| `save.startString/endString` | `2026HappyNewYear` / `2026NewYearTreeMadeByQqQe308` | `TRGTSaveFile` / `EndOfSaveFile` | **直接报错**（读不了原版存档） |
| `save.legacyBase64Fallback` | `false` | `true` | 多一条上游没有的导入路径 |
| `hooks.doResetPre` / `onRowReset` / `updateTitle` | 全是 `null` | 音乐游戏树的三处专有逻辑 | 照抄 `doResetPre` 会让**任意层重置静默失效**（`e` 层没有 `bestOnce`） |
| `challenge.variant` | `'sf'` | `'rg'` | 挑战结算路径不同 |
| `loop.normalizeDiffToNumber` | `true` | `false` | 内容层收到的 `diff` 类型不同 |
| `time.engineNumeric` / `realTimeField` / `resetTimeIsDecimal` | `number` / `realTime` / `false` | `decimal` / `timeplayed` / `true` | **存档里时间的序列化形式不同**；字段名写错不报错、只是静默丢数据 |
| `theme.list/default/colors` | `['default','aqua']` / `default`（极光色板） | 4 套，默认 rizline | 上游 `switchTheme()` 的写法不同，照抄会切不了主题 |
| `ui.strings.*` | 英文 | 中文 | 文案串味 |
| `layout.thingTreeVariant` | `'flex'` | `'table'` | 升级树整片错位 |

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
| 逐层数值对拍（冻主循环 + 固定种子 + 96 步操作） | **0 差异**（41,689 字符快照，连跑两次同结果） |

复跑入口在仓库里：`rg/tests/run_all.cmd`（17 步，含音乐游戏树回归；每步失败会自动重试一次并如实标注）。

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
