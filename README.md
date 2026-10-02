# 2026 春节树 · 深空特效版

《2026 春节树》是一个基于 **The-Modding-Tree** 的中文增量游戏（incremental game）。
本仓库是 **[QqQe308/The-Spring-Festival-Tree-2026](https://github.com/QqQe308/The-Spring-Festival-Tree-2026)
的官方 fork**，加了深空视觉特效层与性能优化，**游戏玩法与原版一致，未做改动**。

> fork 关系是真实且完整的：本仓库保留了上游全部提交历史，
> 我们的改动只有**一个提交**、领先上游 1 个提交、落后 0 个
> （`ahead_by: 1, behind_by: 0`），涉及 **14 个文件**
> （10 个新增 + 4 个性能修复）。所以可以直接向上游提 PR，diff 是干净的。

在线试玩：**https://ysw-yyy.github.io/The-Spring-Festival-Tree-2026-FX/**

也可以直接用仓库里的 `index.html`（纯静态页面，无需构建；
但依赖 CDN 加载 Vue，首次打开需要联网）。

---

## 这个版本加了什么

### 视觉特效层（独立文件，不侵入游戏逻辑）

新增两个文件，游戏主体代码**几乎零修改**：

- `js/effects.js` —— 独立的 canvas 特效层：星场、流星、星尘、点击爆发、星云
- `css/effects.css` —— CSS 部分，作用域限定在 `body.ds-glow`

具体效果：

| 效果 | 说明 |
| --- | --- |
| 深空背景 | 星场 + 多层柔和星云（**不使用 `filter: blur()`**，靠多段径向渐变手工实现） |
| 点击反馈 | 命中可交互元素时的回弹、从**光标落点**扩散的水波纹 |
| 升级/解锁 | 元素放大回弹 + 光晕爆开 + 金色粒子 + canvas 冲击波光环 |
| 购买反馈 | **90ms 内**跟手触发（点击时临时加速状态扫描） |
| buyable 升级 | 等级上升时脉冲；买到上限时金色旋转光芒 |
| 已获得元素 | 缓慢呼吸辉光（只动 opacity，**不做流光**） |
| 里程碑 | 达成瞬间冷蓝冲击波 + 蓝色粒子；已达成界面金色质感 |
| 能量条（p 层） | 持续脉冲 + 填充前沿的「能量锋面」+ 等离子能量微尘 |
| 按钮质感 | `background-blend-mode` 叠加渐变做出立体感，**保留游戏主题色** |
| 可重置 / 可购买高亮 | 琥珀金 = 该层可重置，冰蓝 = 新升级可买（复用游戏自身状态类） |

### 性能优化

实测数据（1600×900，DPR 1，无头浏览器）：

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 特效层单帧绘制 | 0.93 ms | **0.66 ms** |
| 其中星场部分 | 0.72 ms | **0.41 ms** |

关键手法：

- **星点精灵缓存**：亮星的十字光芒预渲染成离屏精灵，绘制时只 `drawImage`
- **能量画布按需挂载**：有粒子才挂到 DOM，清空后立刻摘除，空闲时零整屏图层
- **禁止整屏 `filter: blur()`**：在本项目实测中它会让 144fps 掉到 70fps
- **不产生动画 `box-shadow`**：需要脉动就用伪元素只动 `opacity`
- **描边行走**用 `linear-gradient` + `background-position`，而不是旋转 `conic-gradient` + `mask`

对游戏本体的三处修复（都带注释说明原因）：

1. `* { transition-duration: 0.5s }` → `0s`（原规则等于给全页每个元素挂 0.5s 过渡）
2. 删掉每 500ms 无条件重绘画布的定时器，改为尺寸真的变化才重绘
3. 主循环开头加 `if (document.hidden) return`，标签页不可见时不跑逻辑

### 设置项

游戏设置页新增一个 **「背景特效: 开/关」** 开关，可单独关闭背景层
（星场 / 星云 / 流星 / 星尘 / 点击爆发），界面上的光效不受影响。

调试用 URL 参数：`?fx=all|canvas|css|off`（分别表示全开 / 仅 canvas / 仅 CSS / 全关）。

---

## 本地运行

因为是纯静态页面，任意静态服务器即可：

```bash
python -m http.server 8000
# 然后打开 http://127.0.0.1:8000/index.html
```

> 注意：`index.html` 通过 CDN 加载 Vue 2.6.12，**首次打开需要联网**。
> 网络不通时会白屏。

---

## 来源与许可

本仓库是 [2026 春节树](https://github.com/QqQe308/The-Spring-Festival-Tree-2026)
的 **GitHub fork**（真 fork，非重新上传），保留了上游全部提交历史。
上游链路如下，特此致谢：

| 项目 | 作者 | 说明 |
| --- | --- | --- |
| [The Prestige Tree](https://github.com/jacorb-tpt/The-Prestige-Tree) | Jacorb | 最初的增量游戏 |
| [The-Modding-Tree](https://github.com/Acamaeda/The-Modding-Tree) | Acamaeda | 本游戏使用的引擎框架 |
| [2026 春节树](https://github.com/QqQe308/The-Spring-Festival-Tree-2026) | QqQe308 | 游戏内容（层级、平衡、剧情）|

三者的授权均为 **MIT License**，许可证原文保留在：

- `LICENSE` —— Modding Tree Copyright (c) 2020 Acamaeda
- `Prestige-tree-license` —— Prestige Tree Copyright (c) 2020 Jacorb

本仓库新增的 `js/effects.js`、`css/effects.css` 以及各项性能改动，
同样以 MIT License 发布。

### 与上游同步

```bash
git remote add upstream https://github.com/QqQe308/The-Spring-Festival-Tree-2026.git
git fetch upstream
git merge upstream/main      # 或 git rebase upstream/main
```

因为保留了共同祖先，上游的更新可以直接 merge/rebase，不会产生无关历史。

---

## 目录结构

```
index.html            入口（引入特效层）
js/effects.js         ★ 新增：canvas 特效层
css/effects.css       ★ 新增：CSS 特效（作用域 body.ds-glow）
bench.html            ★ 新增：特效对照台（可实时看帧率、切换模式与画质预设）
js/layers.js          游戏内容定义（层级 / 升级 / 剧情）
js/game.js            游戏主循环与逻辑
js/components.js      Vue 组件
css/                  游戏样式
docs/                 引擎文档
Old Things/           上游遗留文件
```



