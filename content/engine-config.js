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
  loop: { normalizeDiffToNumber: true },

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
  },

  // C1：春节树的升级树用 div/flex 布局，不是音乐游戏树的 table 布局
  layout: { thingTreeVariant: 'flex' },
});
