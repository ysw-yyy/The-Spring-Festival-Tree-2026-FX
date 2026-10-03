/* ============================================================================
 * 2026 春节树 · 引擎配置（content/engine-config.js）
 * ----------------------------------------------------------------------------
 * 这个模组改过 TMT 引擎的若干处，全部在这里以配置形式声明；引擎默认值保持
 * 音乐游戏树的语义，所以这里写的每一条都对应上游源码的一处差异。
 * 逐条依据（文件:行号）见 rg/sf_engine_deltas.md。
 * ========================================================================== */

RT.setConfig({
  // S1：春节树的存档前后缀与音乐游戏树不同（上游 js/utils/save.js:4-5）
  save: {
    startString: '2026HappyNewYear',
    endString: '2026NewYearTreeMadeByQqQe308',
    // S2：上游把「无前缀的旧式 base64 存档」兜底分支注释掉了 → 关掉它，保持一致
    legacyBase64Fallback: false,
  },

  // G1：春节树的 doReset **没有**音乐游戏树那两句专有 hack —— 两个 hook 都留 null。
  // 注意别照抄音乐游戏树的 doResetPre：春节树的 e 层没有 bestOnce，会抛 TypeError
  // 并让**任意层**的重置静默失效。引擎默认已经是 null，这里显式写出来当文档。
  hooks: {
    doResetPre: null,
    onRowReset: null,
    // S3：春节树没有「标题跟随资源」这个功能（上游 save.js 里 updateTitle 整体不存在）
    updateTitle: null,
  },

  // G3：挑战启动写法不同（上游 js/game.js:291-297）
  challenge: { variant: 'sf' },

  // G5/G6：主循环把 diff 归一成原生 number
  // M11：主循环 **40Hz**（intervalMs 25）。这是实测出的性价比档：
  //   数字可见变化 21 次/秒 → **42.5 次/秒**，而循环 JS 成本约 2 倍（temp.js ≈2% → ≈4%）；
  //   60Hz 只能到 50 次/秒却要 3 倍成本 —— 已经撞上"显示粒度 ÷ 增长速度"这道墙。
  //   URL 可覆盖：?hz=60 / ?hz=20 随时对比。音乐游戏树保持引擎默认 50ms，不替它改。
  loop: { normalizeDiffToNumber: true, intervalMs: 25 },

  // M5/M6/G2/G8：时间全族用原生 number，现实时间字段叫 realTime
  time: {
    engineNumeric: 'number',
    realTimeField: 'realTime',
    resetTimeIsDecimal: false,
  },

  // T1/T2：只有 default / aqua 两套主题，且切换写法与音乐游戏树不同。
  // 视觉风格（深空极光）由 CSS 决定；这里把 default 调成极光色板。
  theme: {
    list: ['default', 'aqua'],
    default: 'default',
    switchVariant: 'sf',
    colors: {
      default: {
        1: '#dff3ff', 2: '#7fa9c8', 3: '#3f5d78',       // 树连线：极光白 / 冰蓝 / 深蓝灰
        color: '#dff3ff',
        points: '#a9f0e6',
        locked: '#6b7f96',
        background: '#070b18',                          // 深空底色
        background_tooltip: 'rgba(6, 10, 24, 0.92)',
      },
      aqua: {
        1: '#bfdfff', 2: '#8fa7bf', 3: '#5f6f7f',
        color: '#bfdfff', points: '#dfefff', locked: '#c4a7b3',
        background: '#001f3f', background_tooltip: 'rgba(0, 15, 31, 0.75)',
      },
    },
  },

  // M8：玩家可见文案一律英文（上游 js/technical/displays.js:5,7,12,35；game.js:270,442）
  ui: {
    strings: {
      resetFor: 'Reset for ',
      resetForShort: 'Reset for ',
      nextAt: 'Next:',
      reqAt: 'Req:',
      nextNeeds: 'Next at',
      challengeFinish: 'Finish',
      challengeExit: 'Exit Early',
      challengeCompleted: 'Completed',
      challengeStart: 'Start',
      resetRowPrompt: 'Are you sure you want to reset this row? It is highly recommended that you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm',
      hardResetConfirm: 'Are you sure you want to do this? You will lose all your progress!',
      prestigeFallback: 'You need prestige button text',   // D1
    },
    // M9：折叠框（剧情/说明）的正文常驻 DOM —— 配合 motion.css 里
    // grid-template-rows 的过渡，展开/收起都能有伸缩动画。
    // 上游是"展开时新建、收起时删除"，那种结构只能单向播动画。
    infoboxBodyAlwaysInDom: true,
    // M10：数字平滑显示 —— 两次 tick 之间把实时读数滚到目标值，滚动期间多显示两位小数
    //（主循环 20Hz、而 3 位有效数字每秒只变约 1.6 次，所以原来看起来是一跳一跳的）
    smoothNumbers: { enabled: true, easing: 0.35, extraDigits: 0, settle: 1e-6 },
    // M12：思念层所有升级标题都含"思"字 —— 把它挑出来高亮（用户要的小巧思）
    titleHighlightChars: '思填充',
    // ④ 按作者要求：A / t 层不显示"你有 N <资源>"那一行（点基层级上它没有意义）
    hideResourceDisplay: ['A', 't'],
    // M13：按用户要求，设置页只保留前两行（保存/自动保存/硬重置、导出/导入/离线进度）
    hideOptionRows: [3, 4],
  },

  // C1：春节树的升级树用 div/flex 布局，不是音乐游戏树的 table 布局
  layout: { thingTreeVariant: 'flex' },
});
