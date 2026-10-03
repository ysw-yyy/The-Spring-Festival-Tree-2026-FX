/* ============================================================================
 * 音乐游戏树 · 重构版引擎 —— 核心与全局状态
 * ----------------------------------------------------------------------------
 * 内容层（content/）是一字不改搬过来的，它引用的是**真正的全局名**
 * （player / tmp / layers / hasUpgrade / run ...），所以这里就用普通
 * 顶层 `var` 声明把它们放到全局作用域，和原引擎的做法一致。
 *
 * RT 只放引擎自己的东西（错误记录、渲染调度、内部工具），不参与内容层的名字空间。
 * 详见 docs/ARCHITECTURE.md §3 §4。
 * ========================================================================== */

/* eslint-disable no-var */

// ---- 全局状态（名字与 TMT 一致，内容层直接引用）----------------------------
var player;                 // 存档数据
var tmp = {};               // 每 tick 重算的派生数据
var temp = tmp;             // TMT 里 temp 是 tmp 的别名
var funcs = {};             // 与 tmp 同构，记录“哪些键是函数”
var layers = {};            // 层定义
var options = {};           // 设置
var activePopups = [];      // 弹窗队列
var popupID = 0;

var needCanvasUpdate = true;
var onFocused = false;
var onTreeTab = true;
var shiftDown = false;
var ctrlDown = false;
var mouseX = 0, mouseY = 0;
var NaNalert = false;
var ticking = false;

var decimalZero = new Decimal(0);
var decimalOne = new Decimal(1);
var decimalNaN = new Decimal(NaN);
var defaultGlow = '#ff0000';

// 树连线方向常量（内容层可能引用）
var UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3;

// ---- 引擎命名空间 ---------------------------------------------------------
var RT = {
  version: '0.1.0',
  engineName: 'rtree-engine',
  errors: [],     // 验收脚本读它判断“控制台干净”
  warnings: [],
  debug: {},      // 引擎各阶段的自检数据（perf、渲染计数等）
};

RT.record = function (kind, message, detail) {
  const list = kind === 'warn' ? RT.warnings : RT.errors;
  const e = {
    kind: kind, message: String(message),
    detail: detail === undefined || detail === null ? null : String(detail), at: Date.now(),
  };
  list.push(e);
  if (list.length > 200) list.shift();
  return e;
};
RT.error = function (m, d) { return RT.record('error', m, d); };
RT.warn = function (m, d) { return RT.record('warn', m, d); };

// ---- 每模组配置（引擎默认 = 音乐游戏树的语义）--------------------------------
// 两个模组各自改过 TMT 引擎的若干处：存档前后缀、doReset 里的模组专有 hack、
// 挑战启动/结算变体、时间字段名与数值类型、主题表、玩家可见文案…
// 这些差异做成旋钮放这里，由每个模组的 content/engine-config.js 覆盖。
// **默认值必须等于音乐游戏树的行为**，这样音乐游戏树零配置保持原样。
// 逐条依据（含源码文件:行号）见 rg/sf_engine_deltas.md。
RT.config = {
  save: {
    startString: 'TRGTSaveFile',        // M1：RG 用 TRGTSaveFile/EndOfSaveFile
    endString: 'EndOfSaveFile',
    legacyBase64Fallback: true,         // S2：老式「纯 base64 无前缀」存档的兜底分支
  },
  hooks: {
    doResetPre: null,                   // M2：RG = e.bestOnce 那句；签名 (layer)
    onRowReset: null,                   // M2：RG = row>4 时点判定层可点击；签名 (layer, row)
    updateTitle: null,                  // M9：RG 的标题跟随资源；SF 无此功能
  },
  challenge: {
    variant: 'rg',                      // M3：'rg' | 'sf'
  },
  loop: {
    intervalMs: 50,                     // 主循环周期（20Hz）。调小 = 逻辑与界面都更快，但每 tick 的 updateTemp+整页渲染也按比例变多
    normalizeDiffToNumber: false,       // M4：SF 把 diff 归一成 number
  },
  time: {
    engineNumeric: 'decimal',           // M5：'decimal' | 'number'
    realTimeField: 'timeplayed',        // M6：RG=timeplayed / SF=realTime
    resetTimeIsDecimal: true,           // G2：重置后 resetTime 初值类型
  },
  theme: {
    list: null,                         // M7：null = 用引擎内置主题表
    colors: null,
    default: 'default',
    switchVariant: 'rg',                // 'rg' | 'sf'
  },
  ui: {
    // M8：玩家可见文案，默认 = 音乐游戏树的中文；SF 覆盖为英文。
    strings: {
      resetFor: '重置以获得 ',
      resetForShort: '重置以获得',
      nextAt: '下一个:',
      reqAt: '需要:',
      nextNeeds: '下一个需要',
      challengeFinish: '完成',
      challengeExit: '退出',
      challengeCompleted: '已通过',
      challengeStart: '开始',
      resetRowPrompt: ' Type "I WANT TO RESET THIS" to confirm',
      hardResetConfirm: '你确定要进行硬重置吗？这将删除你的所有进度！',
      prestigeFallback: null,           // O-2
    },
    // M9：折叠框（剧情/说明）的正文是否**常驻 DOM**。
    // 上游是"展开时新建、收起时删除"（`opened ? null : h(...)`），这样没法做双向伸缩动画；
    // 打开这个开关后正文一直存在，靠容器上的 `open` 类 + CSS 的 grid-template-rows
    // 过渡来做伸缩。
    // ★ 默认必须是 false：它改变 DOM 结构，音乐游戏树的样式表里没有对应的折叠规则，
    //   打开会让它的折叠框全部常开。只有配好对应样式的模组（春节树）才开。
    infoboxBodyAlwaysInDom: false,
    // M10：数字平滑显示。
    // 背景：主循环 20Hz，但界面上的数字是"格式化后的字符串变了才写 DOM"——
    // 3 位有效数字下（`7.63e20`）第三位每秒才变约 1.6 次，所以看起来是一跳一跳的。
    // 瓶颈**不是帧率而是显示精度**，所以这里在两次 tick 之间用 requestAnimationFrame
    // 把被标记的读数**滚动**到目标值，滚动期间多显示一两位小数（收敛后精确贴回原文本）。
    // 只改那几个标记节点，不跑 updateTemp、不做整页渲染。
    // ★ 默认 false：它改变可见文本形态，只有想要这套观感的模组才开。
    smoothNumbers: {
      enabled: false,
      easing: 0.35,        // 每帧向目标靠拢的比例（越大收敛越快）
      extraDigits: 0,      // 滚动期间额外显示的小数位（0 = 与最终文本同形状，宽度不跳）
      settle: 1e-6,        // 相对误差小于它就贴回精确文本
      // 落后超过这么多个"显示步长"就直接贴合：目标跑得比显示粒度快时
      //（真存档点数每秒涨 1.26e18，而 2 位小数的粒度是 1e16）平滑层会**一直落后** ——
      // 线上实测落后约 0.18 秒 ≈ 20 个步长，数字就在撒谎了。设上限后不会。
      maxLagSteps: 3,
    },
    // M12：升级标题里要高亮的字（"小巧思"用）。空字符串 = 不处理。
    // 例：春节树思念层的升级标题**全部**含"思"，就把那个字挑出来染色/发光。
    // 引擎只负责包一层 <span class="hl">，具体样式由各模组的样式表写；默认关闭。
    titleHighlightChars: '',
    // M13：设置页（options-tab）里要隐藏的**行号**（1 起，每行三个按钮）。
    // 空数组 = 全部显示（引擎默认）。春节树按用户要求只留前两行。
    hideOptionRows: [],
    // ④ 这些层不渲染"你有 N <资源>"（内容层不变，只在渲染时跳过）
    hideResourceDisplay: [],
    // 树连线的常驻流动动画（虚线沿连线流动，表达"连接"）。
    // 关掉 = 静止实线；prefers-reduced-motion 下会自动关。
    animateBranches: true,
    branchFlowFps: 30,      // 重绘频率：整屏画布的重绘是主要成本，30 足够顺
    branchDash: [34, 26],   // 光段 / 空隙：拉长一点，脉冲更清楚
    branchLineWidth: 1.4,   // ★ 连线很细：底轨与光芯都以它为基准
    branchGlow: 11,         // ★ 光芯的辉光半径（px）——细线要显发光就靠它
    branchHalo: 3.4,        // 光晕层宽度 = 线宽 × 这个倍数（宽而淡，垫在光芯下）
    branchHaloAlpha: 0.22,  // 光晕层透明度
    branchDashSpeed: 1.6,   // 每帧推进的偏移量（30fps 下约 48px/秒）
  },
  layout: {
    thingTreeVariant: 'table',          // O-1：'table'（RG）| 'flex'（SF）
  },
};

// 深合并：模组配置只写要改的项
RT.setConfig = function (patch) {
  (function merge(dst, src) {
    for (const k in src) {
      const v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) &&
          dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) {
        merge(dst[k], v);
      } else {
        dst[k] = v;
      }
    }
  })(RT.config, patch || {});
  // 配置一变就刷新主题表/默认主题。**这一行不能省**：
  // options.js 里的 applyConfiguredTheme() 负责把 RT.config.theme.colors 装进 colors，
  // 少了它主题色板永远不会生效（实测：春节树的极光色板没被采用，--background 仍是
  // BUILTIN_COLORS.default 的 #0f0f0f），而且 themes 会停在 ['default']，
  // 让 switchTheme() 的 sf 分支把 options.theme 写成 undefined。
  if (typeof applyConfiguredTheme === 'function') applyConfiguredTheme();
  return RT.config;
};

// 语言无关的小工具（TMT 同名同语义）-----------------------------------
// 插值成文本时把 undefined/null 变成空字符串 —— 与 Vue 的插值行为一致。
// 不加这一步的后果：层没定义 `resource`/`baseResource` 时，界面上会直接出现
// 字面量 "undefined"（原版 Vue 那里是空的）。实测：成就页顶部出现过
// 「你有 0 undefined」。内容层确实有这种不定义 resource 的层（A / d / t）。
function str(v) {
  return (v === undefined || v === null) ? '' : String(v);
}

function isFunction(obj) {
  return !!(obj && obj.call && obj.apply);
}

function isPlainObject(obj) {
  return !!obj && obj.constructor === Object;
}

// TMT 的 run：把函数绑到目标对象再调用；不是函数就直接当值返回
function run(func, target, args) {
  if (isFunction(func)) return func.bind(target)(args === undefined ? null : args);
  return func;
}

// 读“可能是函数”的层属性
function readData(data, args) {
  if (isFunction(data)) return data(args === undefined ? null : args);
  return data;
}

function toNumber(x) {
  if (x === null || x === undefined) return x;
  if (typeof x === 'object' && x.mag !== undefined) return x.toNumber();
  if (x + 0 !== x) return parseFloat(x);
  return x;
}

function checkDecimalNaN(x) {
  return x instanceof Decimal && !x.eq(x);
}

// 把 value 转成和 oldValue 同类型（读档 / 输入框用）
function toValue(value, oldValue) {
  if (oldValue instanceof Decimal) {
    const v = new Decimal(value);
    if (checkDecimalNaN(v)) return decimalZero;
    return v;
  }
  if (!isNaN(oldValue)) return parseFloat(value) || 0;
  return value;
}

// 把 obj2 的值覆盖到 obj1（Decimal 复制，对象递归）
function layOver(obj1, obj2) {
  for (const x in obj2) {
    if (obj2[x] instanceof Decimal) obj1[x] = new Decimal(obj2[x]);
    else if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
    else obj1[x] = obj2[x];
  }
}

function deepClone(value) {
  if (value instanceof Decimal) return new Decimal(value);
  if (Array.isArray(value)) return value.map(deepClone);
  if (value instanceof Object) {
    const out = {};
    for (const k in value) out[k] = deepClone(value[k]);
    return out;
  }
  return value;
}

RT.util = {
  isFunction, isPlainObject, run, readData, toNumber, toValue, checkDecimalNaN, layOver, deepClone,
};

// ---- 渲染调度 -------------------------------------------------------------
// 动态区域每 tick 都会重渲染；renderRequested 只在“结构变了要立刻重画”时置位
var renderRequested = true;
RT.requestRender = function () { renderRequested = true; };
RT.consumeRenderRequest = function () { const v = renderRequested; renderRequested = false; return v; };

RT.setNeedCanvasUpdate = function (v) { needCanvasUpdate = v; };

// ---- 键盘 / 鼠标状态 -----------------------------------------------------
var onKeyDownHook = null;
RT.setKeyDownHook = function (fn) { onKeyDownHook = fn; };

RT.initInputState = function () {
  document.addEventListener('keydown', function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
    if (typeof onKeyDownHook === 'function' && !onFocused) onKeyDownHook(e);
  });
  document.addEventListener('keyup', function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
  });
  document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
};

// ---- 错误记录 -------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.RT = RT;
  window.addEventListener('error', function (ev) {
    RT.error('window.onerror', (ev.message || 'unknown') + ' @ ' + (ev.filename || '?') + ':' + (ev.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function (ev) {
    const r = ev.reason;
    RT.error('unhandledrejection', (r && (r.stack || r.message)) || String(r));
  });
}
