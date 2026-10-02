/* =============================================================================
   effects.js —— 深空 · 极光特效层
   -----------------------------------------------------------------------------
   一个完全独立的视觉特效层，不参与、也不修改任何游戏逻辑：

     · 极光帷幕   —— 顶部缓慢流动的极光，青绿 / 冰蓝 / 紫罗兰三色
     · 深空星场   —— 三层视差星点，缓慢漂移 + 呼吸闪烁
     · 流星       —— 随机划过的拖尾流星
     · 星尘上浮   —— 持续从下方缓缓升起的发光尘埃
     · 点击爆发   —— 点到可交互元素时炸开的粒子（"炫酷"的主要来源）
     · 指针视差   —— 星场 / 极光 / 星云随鼠标轻微位移

   实现方式是单个 <canvas> + requestAnimationFrame，不产生任何 DOM 节点，
   所以不会和游戏那套基于 Vue 组件的粒子系统抢性能，也不会触发 0.5s 全局过渡。

   想现场调参：浏览器控制台里用 window.deepSpaceEffects，例如
       deepSpaceEffects.set("starDensity", 1.5)
       deepSpaceEffects.set("auroraIntensity", 0.4)
       deepSpaceEffects.get()
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     可调参数
     ----------------------------------------------------------------------- */
  const CONFIG = {
    enabled: true,

    // 极光
    // 按需求已默认关闭：它对视觉氛围的贡献可以被星云/星场替代，
    // 而它是整屏独立画布，存在固定的合成开销。想找回就把这里改成 true。
    drawAuroraLayer: false,
    auroraIntensity: 1.25, // 总亮度，0 = 关闭（仅当 drawAuroraLayer 为 true 时生效）
    auroraCurtains: 4, // 帷幕条数（越多越厚重）
    auroraColumns: 34, // 每条帷幕的水平采样点（模糊会补足平滑度，不必太高）
    auroraHeight: 0.42, // 帷幕高度占屏幕比例
    auroraSpeed: 0.42, // 流动速度
    auroraRefresh: 0.1, // 极光重建间隔（秒）。慢速特效不必每帧重算
    auroraParallax: true, // 极光是否跟随鼠标视差
    auroraScale: 0.5, // 极光渲染倍率：重模糊内容不需要全分辨率

    // 星场
    starDensity: 0.8, // 每 10000 平方像素的星点数
    starParallax: 26, // 指针视差强度（像素）
    starParallaxMode: "transform", // "transform"=交给合成器 | "perstar"=逐星计算
    starDrift: 1.0, // 缓慢漂移速度
    starMax: 700, // 星点上限（性能保护）
    updateHz: 30, // 粒子物理更新频率。低于刷新率可省一半 CPU，肉眼几乎无差

    // 逐层开关（用于定位到底是哪一层在吃性能）
    drawStarsLayer: true,
    drawNebulaLayer: true,
    drawParticles: true,
    inputFx: true, // 点击回弹 + 升级/购买成功的界面特效
    // 升级 / 解锁成功的闪光时长（毫秒）
    unlockFlashMs: 760,
    cssNebula: true, // CSS 那张星云背景层（已不含 blur）
    cheapSky: false, // true = 用一张平面渐变替代两张星云（氛围基本保留）

    // 流星
    shootingStarRate: 0.22, // 平均每秒生成概率
    shootingStarSpeed: 1.15,

    // 星尘
    sparkRate: 4.5, // 每秒生成数量
    sparkMax: 120,

    // 点击爆发
    burstEnabled: true,
    burstCount: 30, // 每次点击粒子数
    burstMax: 600,
    unlockBurstCount: 26, // 升级/解锁成功时的粒子数
    unlockBurst: true, // 升级成功时从元素中心炸开一把金色粒子
    idleShimmer: true, // 闲置按钮的偶发闪光（JS 负责错开相位）
    clickRipple: true, // 点击时从光标位置扩散一圈水波纹
    idleTrace: true, // 低频按钮的「描边行走」光带
    milestoneFx: true, // 里程碑达成时的金环 + 粒子
    energyFx: true, // 能量条填充时的脉冲 + 粒子（p 层专属）
    cooldownFx: true, // 计时条（冷却 + 持续时间）
    numberFx: true, // 数值的发光质感（按量级分档）
    energyMotes: true, // 能量条右侧的等离子能量微尘
    moteCount: 22, // 每次等级跳变喷出的微尘数量
    moteMax: 130, // 微尘总数上限（性能保护，别调太高：300+ 时绘制要 1.6ms/帧）
    moteTrickleN: 2, // 按住期间每次溢出的数量
    moteTrickleMs: 140, // 按住期间的溢出间隔
    moteSpreadX: 18, // 横向散布范围（别调大：容器 overflow:hidden 会裁断辉光）
    moteSpreadY: 16, // 沿条高的散布范围（像素）

    // 性能
    maxPixelRatio: 1.25, // 高分屏渲染倍率上限（背景特效不需要原生分辨率）
    maxPixelRatioHigh: 1.0, // 渲染面积过大时进一步压到 1.0，优先保流畅
    renderScale: 0.75, // 粒子层额外渲染倍率。全屏画布每帧的 clear+合成是固定成本，
    //                     按 0.75 渲染可省约 44% 像素量，肉眼几乎无差
    autoQuality: true, // 按实测绘制耗时自动降级/恢复画质
    drawBudgetMs: 6, // 单帧绘制耗时预算，超过 1.7 倍降级、低于 0.7 倍恢复
    frameCap: 0, // 0 = 不限制。省 CPU 的兜底手段，卡顿时可设 30/45
  };

  /* --------------------------------------------------------------------------
     性能预设：卡顿时逐个往下试，外观保留、开销递减
       deepSpaceEffects.preset("高") / ("中") / ("低") / ("极低")
     ----------------------------------------------------------------------- */
  const PRESETS = {
    高: {
      auroraIntensity: 1.25,
      auroraCurtains: 4,
      auroraColumns: 34,
      auroraRefresh: 0.1,
      auroraScale: 0.5,
      starDensity: 0.8,
      maxPixelRatio: 1.25,
      maxPixelRatioHigh: 1.0,
      renderScale: 0.75,
      cheapSky: true,
      frameCap: 0,
      sparkRate: 4.5,
      shootingStarRate: 0.22,
      burstCount: 30,
    },
    中: {
      auroraIntensity: 1.15,
      auroraCurtains: 3,
      auroraColumns: 28,
      auroraRefresh: 0.14,
      auroraScale: 0.42,
      starDensity: 0.55,
      maxPixelRatio: 1,
      maxPixelRatioHigh: 1,
      renderScale: 0.62,
      cheapSky: true,
      frameCap: 36,
      sparkRate: 2.5,
      shootingStarRate: 0.15,
      burstCount: 24,
    },
    低: {
      auroraIntensity: 1,
      auroraCurtains: 2,
      auroraColumns: 22,
      auroraRefresh: 0.2,
      auroraScale: 0.34,
      starDensity: 0.4,
      maxPixelRatio: 1,
      maxPixelRatioHigh: 1,
      renderScale: 0.5,
      cheapSky: true,
      frameCap: 30,
      sparkRate: 1.2,
      shootingStarRate: 0.1,
      burstCount: 16,
    },
    极低: {
      auroraIntensity: 0.9,
      auroraCurtains: 1,
      auroraColumns: 16,
      auroraRefresh: 0.3,
      auroraScale: 0.28,
      starDensity: 0.3,
      maxPixelRatio: 1,
      maxPixelRatioHigh: 1,
      renderScale: 0.4,
      cheapSky: true,
      frameCap: 24,
      sparkRate: 0,
      shootingStarRate: 0,
      burstCount: 10,
    },
  };

  const AURORA_COLORS = ["#4dffd2", "#7a5cff", "#2ad4ff"];
  const STAR_COLOR = "234, 246, 255";

  /* --------------------------------------------------------------------------
     运行模式（可用于定位卡顿来源）

       ?fx=all     全部特效（默认）
       ?fx=canvas  只要 canvas 层（极光/星场/粒子），不要 CSS 发光动画
       ?fx=css     只要 CSS 发光动画，不要 canvas 层
       ?fx=off     全部关闭（用于和原版对比）

     直接打开游戏时也可以用控制台切换：deepSpaceEffects.mode("css")
     ----------------------------------------------------------------------- */
  const VALID_MODES = ["all", "canvas", "css", "off"];
  let MODE = "all";
  try {
    const q = new URLSearchParams(window.location.search).get("fx");
    if (q && VALID_MODES.indexOf(q) >= 0) MODE = q;
  } catch (e) {
    /* URLSearchParams 不可用时保持默认 */
  }

  /* --------------------------------------------------------------------------
     画布初始化
     ---------------------------------------------------------------------------
     分两张画布，是为了把「每帧都要重画的东西」和「很久才变一次的东西」隔开：

       canvas     #deepSpaceCanvas   星场 / 流星 / 星尘 / 点击爆发（每帧重绘）
       auroraCv   #deepSpaceAurora   极光（每 ~0.1 秒才重建，平时整层静止）

     如果合成到同一张画布上，每帧都必须把整屏的极光位图重画一遍，
     在低端/集显机器上是实打实的固定开销。拆开后，每帧只需重绘一次透明画布，
     极光那层交给合成器保持不动。
     ----------------------------------------------------------------------- */
  const canvas = document.createElement("canvas");
  canvas.id = "deepSpaceCanvas";
  canvas.setAttribute("aria-hidden", "true");

  const auroraCv = document.createElement("canvas");
  auroraCv.id = "deepSpaceAurora";
  auroraCv.setAttribute("aria-hidden", "true");

  /* 能量粒子专用画布 —— 它必须待在「游戏 UI 之上」。
     ---------------------------------------------------------------------------
     踩过的坑：能量微尘原来画在 #deepSpaceCanvas 上，而那张画布是 z-index: -1000
     （整屏最底层），能量条本身是 DOM。结果粒子只要落在条的范围里就被条**完全盖住**，
     只有飘到条外的那部分看得见。
     所以能量粒子单独一层，z-index: 6：高于能量条（底槽 2 / 填充 3 / 文字 6），
     低于 tooltip（7）、侧栏（20000）与弹窗，不会糊住任何文字与交互。
     pointer-events: none 保证不挡点击。
     ----------------------------------------------------------------------- */
  const energyCv = document.createElement("canvas");
  energyCv.id = "deepSpaceEnergy";
  energyCv.setAttribute("aria-hidden", "true");

  let ectx = null;
  let energyDirty = null; // 上一帧弄脏的矩形，用于只清那一块

  let ctx = null;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let qualityScale = 1; // 自适应画质档位
  let ready = false;
  let lastUpdate = -1; // 上次物理更新的 elapsed 时间点（用于更新节流）

  // 极光离屏画布（低分辨率渲染 + 模糊烘焙缓存，避免每帧重跑昂贵的模糊）
  let auroraCanvas = null;
  let auroraBlurCanvas = null;
  let auroraBlurredAt = null;
  let auroraBlur = 11;
  let auroraFilterSupported = true;
  let auroraRenderedAt = -999;
  let auroraDirty = true;
  let auroraNeedsFirstPaint = true;
  let auroraPaints = 0;

  const stars = [];
  const sparks = [];
  const burst = [];
  const shooting = [];
  let nebulaBlobs = [];
  let cheapSkyGrad = null;

  const camera = { x: 0, y: 0, tx: 0, ty: 0 };

  /* --------------------------------------------------------------------------
     尺寸与场景构建
     ----------------------------------------------------------------------- */
  function attachLayers() {
    // 极光层不用时连画布都不挂到 DOM 上，避免白白占一个整屏合成层
    if (CONFIG.drawAuroraLayer && !document.body.contains(auroraCv)) {
      document.body.appendChild(auroraCv);
    }
    if (!document.body.contains(canvas)) document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });
    // 能量粒子层**按需挂载**（见 updateEnergyMotes）：
    // 它是一张整屏透明画布，空着也要参与每帧清空+合成。
    // 而绝大多数存档根本没解锁 p 层能量条，所以不预先挂上去。
    ectx = energyCv.getContext("2d", { alpha: true });
    // 检测 ctx.filter 支持情况，不支持就退回不模糊的渲染
    try {
      ctx.filter = "blur(1px)";
      auroraFilterSupported = ctx.filter !== "none" && ctx.filter !== "";
      ctx.filter = "none";
    } catch (e) {
      auroraFilterSupported = false;
    }
  }

  function resize() {
    if (!ctx) return;
    W = window.innerWidth;
    H = window.innerHeight;
    const rawDpr = window.devicePixelRatio || 1;
    // 画布面积越大，clear + 合成的固定开销越明显（4K 全屏尤其）：
    // 面积超过约 260 万 CSS 像素时把渲染倍率压到 1.0，肉眼几乎无差但省很多。
    const cap =
      W * H > 2600000 ? CONFIG.maxPixelRatioHigh : CONFIG.maxPixelRatio;
    dpr = Math.min(rawDpr, cap) * CONFIG.renderScale;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    // 画布缓冲比 CSS 尺寸小，浏览器会按 style 尺寸放大显示。
    // 星点本来就是柔和光点，缩放几乎看不出来，但 clear+合成的像素量省掉近一半。
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 能量粒子层：用完整的 CSS 像素尺寸（不缩），因为粒子小而亮，缩了会糊。
    // 关键：这张画布的 CSS 尺寸是 100%，浏览器会按「CSS 显示尺寸 ÷ 内部像素尺寸」
    // 整体缩放它。所以内部像素尺寸**必须**正好等于 CSS 像素尺寸，
    // 否则整层被拉伸，粒子位置随之偏移 —— 这就是「粒子错位」的根源。
    W = window.innerWidth;
    H = window.innerHeight;
    energyCv.width = Math.max(1, Math.floor(W));
    energyCv.height = Math.max(1, Math.floor(H));
    if (ectx) ectx.setTransform(1, 0, 0, 1, 0, 0);
    energyDirty = null;
    // 极光层用原始 CSS 像素尺寸，供内部低分辨率渲染使用
    auroraCv.width = Math.max(1, Math.floor(W * Math.min(rawDpr, cap)));
    auroraCv.height = Math.max(1, Math.floor(H * Math.min(rawDpr, cap)));

    auroraDirty = true; // 尺寸变了，极光缓存必须重建
    auroraRenderedAt = -999; // 强制下一帧重建
    cheapSkyGrad = null; // 渐变的坐标依赖尺寸，必须重建
    buildStars();
    buildNebula();
  }

  function starCount() {
    const base = (W * H) / 10000 * CONFIG.starDensity * qualityScale;
    return Math.max(40, Math.min(CONFIG.starMax, Math.round(base)));
  }

  function buildStars() {
    stars.length = 0;
    const total = starCount();
    for (let i = 0; i < total; i++) {
      const depth = Math.random() * 0.85 + 0.15; // 0.15 远 ~ 1 近
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        depth: depth,
        r: 0.35 + depth * 1.35,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.7,
        vy: -(3 + depth * 12) * CONFIG.starDrift, // 缓慢上浮
        tint: Math.random() < 0.14 ? Math.random() : 0, // 少量彩色星
      });
    }
  }

  function buildNebula() {
    // 位置用屏幕比例表示，尺寸随窗口变化，避免拉伸变形
    nebulaBlobs = [
      { x: 0.18, y: 0.24, r: 0.5, depth: 0.25, color: "77, 255, 210", a: 0.17 },
      { x: 0.82, y: 0.18, r: 0.44, depth: 0.4, color: "122, 92, 255", a: 0.18 },
      { x: 0.62, y: 0.78, r: 0.56, depth: 0.16, color: "42, 212, 255", a: 0.14 },
      { x: 0.28, y: 0.92, r: 0.42, depth: 0.32, color: "122, 92, 255", a: 0.12 },
      { x: 0.5, y: 0.55, r: 0.62, depth: 0.1, color: "90, 160, 255", a: 0.1 },
    ];
  }

  /* --------------------------------------------------------------------------
     极光
     ----------------------------------------------------------------------- */
  // 平滑插值，用来生成柔和的渐隐曲线
  function smoothstep(edge0, edge1, x) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function renderAurora(t) {
    const due =
      t - auroraRenderedAt >= CONFIG.auroraRefresh ||
      auroraBlurCanvas === null ||
      auroraBlurredAt !== auroraRenderedAt;
    if (!auroraDirty && !due) return;
    auroraRender(t);
  }

  // 真正重建极光阴离屏图。只在需要时调用（约每 0.1 秒一次）。
  function auroraRender(t) {
    const curtains = Math.max(1, Math.round(CONFIG.auroraCurtains));
    const cols = Math.max(16, Math.round(CONFIG.auroraColumns * qualityScale));
    const step = W / cols;
    const baseHeight = H * CONFIG.auroraHeight;
    const STOPS = 8; // 每条竖条的渐变采样数（模糊会补足平滑度）

    // 低分辨率离屏：画布像素 = CSS 像素 × auroraScale，
    // 绘制时用 setTransform(auroraScale) 直接按 CSS 坐标作图，无需换算。
    const s = dpr * CONFIG.auroraScale;
    const ow = Math.max(1, Math.ceil(W * s));
    const oh = Math.max(1, Math.ceil(H * s));
    if (!auroraCanvas) auroraCanvas = document.createElement("canvas");
    if (auroraCanvas.width !== ow || auroraCanvas.height !== oh) {
      auroraCanvas.width = ow;
      auroraCanvas.height = oh;
    }
    if (!auroraBlurCanvas) auroraBlurCanvas = document.createElement("canvas");
    if (auroraBlurCanvas.width !== ow || auroraBlurCanvas.height !== oh) {
      auroraBlurCanvas.width = ow;
      auroraBlurCanvas.height = oh;
      auroraBlurredAt = null; // 尺寸变了，模糊缓存作废
    }

    const octx = auroraCanvas.getContext("2d");
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, ow, oh);
    octx.setTransform(s, 0, 0, s, 0, 0);
    octx.globalCompositeOperation = "lighter";

    // 视差量做粗量化，避免鼠标一动就打破缓存
    const camX = CONFIG.auroraParallax ? Math.round(camera.x / 12) * 12 : 0;
    const camY = CONFIG.auroraParallax ? Math.round(camera.y / 12) * 12 : 0;

    for (let c = 0; c < curtains; c++) {
      const color = AURORA_COLORS[c % AURORA_COLORS.length];
      const depth = 0.55 + c * 0.35; // 越大越"近"，视差越明显
      const phase = c * 2.3;
      const speed = CONFIG.auroraSpeed * (1 + c * 0.22);
      const curtainHeight = baseHeight * (0.72 + 0.34 * ((c % 3) / 2));
      const tail = curtainHeight * 0.6;
      const total = curtainHeight + tail;
      // 亮度补偿与渲染倍率解耦（渲染倍率只影响清晰度，不该压暗画面）
      const alphaScale = CONFIG.auroraIntensity * (0.62 - c * 0.1);
      if (alphaScale <= 0.015) continue;

      // 顶部波动的基准线：几个不同频率的正弦叠加，看起来更自然
      const topAt = (u) =>
        10 +
        Math.sin(u * 3.1 + t * 0.21 * speed + phase) * H * 0.03 +
        Math.sin(u * 7.3 - t * 0.34 * speed + phase * 1.7) * H * 0.014 +
        Math.sin(u * 1.4 + t * 0.12 * speed - phase * 0.6) * H * 0.024;

      const parallax = camY * depth * -0.55 + camX * depth * 0.28;
      const rgb = hexToRgb(color);

      for (let i = 0; i < cols; i++) {
        const u = (i + 0.5) / cols;
        const x = i * step;
        const top = topAt(u) + parallax;
        const edge = Math.sin(u * Math.PI);
        // 极轻微的丝缕粗细变化（模糊会把它磨成柔和起伏）
        const streak = 0.94 + 0.06 * Math.sin(i * 2.399 + c * 5.1);
        const alpha = alphaScale * Math.pow(edge, 3) * streak;

        const g = octx.createLinearGradient(0, top, 0, top + total);
        for (let s = 0; s <= STOPS; s++) {
          const p = s / STOPS;
          const rise = smoothstep(0, 0.1, p);
          const fall = Math.pow(1 - smoothstep(0.1, 0.8, p), 1.8);
          const a = alpha * rise * fall;
          g.addColorStop(p, "rgba(" + rgb + ", " + Math.max(0, a) + ")");
        }
        octx.fillStyle = g;
        octx.fillRect(x - 1, top, step + 2, total);
      }
    }

    // 生成的同时把模糊「烘焙」进缓存：此后每帧只做一次廉价合成，
    // 不必对整屏反复跑模糊这个昂贵的操作。
    const bl = auroraBlurCanvas.getContext("2d");
    bl.setTransform(1, 0, 0, 1, 0, 0);
    bl.clearRect(0, 0, ow, oh);
    if (auroraFilterSupported) bl.filter = "blur(" + auroraBlur * s + "px)";
    bl.drawImage(auroraCanvas, 0, 0);
    bl.filter = "none";
    auroraBlurredAt = t;

    auroraDirty = false;
    auroraRenderedAt = t;
  }

  // 极光画到自己的画布上。只有内容真的重建时才需要画，
  // 其余时间这一层由合成器保持不动，完全不占主线程。
  function drawAurora(t) {
    if (CONFIG.auroraIntensity <= 0) return;

    // 若之前被关掉（画布已卸载），重新开启时补挂载
    if (!document.body.contains(auroraCv)) {
      document.body.appendChild(auroraCv);
      auroraDirty = true;
    }

    const before = auroraRenderedAt;
    renderAurora(t);
    if (!auroraBlurCanvas) return;
    if (auroraRenderedAt === before && !auroraNeedsFirstPaint) return; // 没有重建，无需重画
    auroraNeedsFirstPaint = false;

    const actx = auroraCv.getContext("2d");
    actx.setTransform(1, 0, 0, 1, 0, 0);
    actx.clearRect(0, 0, auroraCv.width, auroraCv.height);
    actx.globalCompositeOperation = "lighter";
    actx.drawImage(auroraBlurCanvas, 0, 0, auroraCv.width, auroraCv.height);
    actx.globalCompositeOperation = "source-over";
    auroraPaints++;
  }

  /* --------------------------------------------------------------------------
     星云（在极光更后面，负责整屏色彩氛围）
     ----------------------------------------------------------------------- */
  function drawNebula() {
    // 廉价替代：一张静态平面渐变。比两个整屏径向渐变 + 一张带 blur 的固定层轻得多，
    // 深空氛围基本保留。
    if (CONFIG.cheapSky) {
      if (!cheapSkyGrad) {
        cheapSkyGrad = ctx.createLinearGradient(0, 0, 0, H);
        cheapSkyGrad.addColorStop(0, "rgba(70, 200, 190, 0.16)");
        cheapSkyGrad.addColorStop(0.45, "rgba(40, 80, 160, 0.1)");
        cheapSkyGrad.addColorStop(1, "rgba(60, 40, 130, 0.08)");
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = cheapSkyGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const b of nebulaBlobs) {
      const cx = b.x * W + camera.x * b.depth;
      const cy = b.y * H + camera.y * b.depth;
      const r = Math.max(W, H) * b.r * 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(" + b.color + ", " + b.a + ")");
      g.addColorStop(0.55, "rgba(" + b.color + ", " + b.a * 0.35 + ")");
      g.addColorStop(1, "rgba(" + b.color + ", 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     星场
     ----------------------------------------------------------------------- */
  /* 亮星的「十字光芒」精灵缓存。
     ---------------------------------------------------------------------------
     之前每颗亮星每帧都要：改一次 fillStyle + arc+fill + 改 strokeStyle +
     两次 moveTo/lineTo + stroke，一轮下来十几条绘制指令。
     而亮星只有几十颗、形态就那么几种（按半径分档），完全没必要每帧重画。

     做法：按「半径档位」预渲染到离屏小画布，绘制时只 drawImage + 设置 globalAlpha。
     颜色是固定的暖白（STAR_COLOR），alpha 用 globalAlpha 统一控制，
     所以一颗星只需要一条 drawImage。 */
  const STAR_SPRITE_PX = 48; // 精灵画布边长（够放下最大半径的十字光芒）
  const starSprites = new Map(); // 半径档位 -> 画布

  function getStarSprite(r) {
    // 量化到 0.25px 一档，避免每种半径都生成一张
    const key = Math.round(r * 4) / 4;
    let cv = starSprites.get(key);
    if (cv) return cv;
    cv = document.createElement("canvas");
    cv.width = STAR_SPRITE_PX;
    cv.height = STAR_SPRITE_PX;
    const g = cv.getContext("2d");
    const c = STAR_SPRITE_PX / 2;
    // 核心圆
    g.fillStyle = "rgba(" + STAR_COLOR + ", 1)";
    g.beginPath();
    g.arc(c, c, key, 0, Math.PI * 2);
    g.fill();
    // 十字光芒（与原来同形态，只是烘进精灵）
    g.strokeStyle = "rgba(" + STAR_COLOR + ", 0.45)";
    g.lineWidth = 0.6;
    const len = key * 4.2;
    g.beginPath();
    g.moveTo(c - len, c);
    g.lineTo(c + len, c);
    g.moveTo(c, c - len);
    g.lineTo(c, c + len);
    g.stroke();
    starSprites.set(key, cv);
    return cv;
  }

  function drawStars(dt, t) {
    // dt === 0 表示本帧只重绘、不推进物理（由更新节流决定）
    const advance = dt > 0;
    ctx.save();
    // 普通小星全部塞进一条路径，最后一次性 fill：
    // 原来是每颗星改一次 fillStyle + 一次 fillRect（几百次状态切换），
    // 现在只剩 2~3 次，是性价比最高的一处优化。
    ctx.beginPath();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (advance) {
        s.twinkle += dt * s.twinkleSpeed;
        s.y += s.vy * dt;

        if (s.y < -4) {
          s.y = H + 4;
          s.x = Math.random() * W;
        }
      }

      const x = s.x + camera.x * s.depth * 0.4;
      const y = s.y + camera.y * s.depth * 0.4;

      const tw = 0.45 + 0.55 * ((Math.sin(s.twinkle) + 1) / 2);
      const a = (0.18 + s.depth * 0.62) * tw;

      if (s.r > 0.95) {
        // 近处亮星：用预渲染好的十字光芒精灵，一颗星一条 drawImage，
        // 不再每帧走「改色 + 画圆 + 改色 + 描两条线」那一串指令。
        // 有色偏的（tint）只占极少数，仍走原来的矢量画法以免串色。
        if (s.tint) {
          ctx.fillStyle = "hsla(" + (190 + s.tint * 110) + ", 90%, 78%, " + a + ")";
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const half = STAR_SPRITE_PX / 2;
          ctx.globalAlpha = a;
          ctx.drawImage(getStarSprite(s.r), x - half, y - half);
          ctx.globalAlpha = 1;
        }
        ctx.beginPath(); // 交错的星点不要被上面那条路径继续累积
        continue;
      }

      const sz = s.r * 1.25;
      ctx.rect(x, y, sz, sz);
    }
    // 统一画出普通星点：颜色按平均亮度给一次即可，视觉上无法分辨
    ctx.fillStyle = "rgba(" + STAR_COLOR + ", 0.72)";
    ctx.fill();
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     流星
     ----------------------------------------------------------------------- */
  function spawnShootingStar() {
    const fromLeft = Math.random() < 0.6;
    const speed = (620 + Math.random() * 520) * CONFIG.shootingStarSpeed;
    const ang = (Math.random() * 14 + 24) * (Math.PI / 180); // 向右下
    shooting.push({
      x: fromLeft ? Math.random() * W * 0.55 - 60 : Math.random() * W,
      y: Math.random() * H * 0.42 - 40,
      vx: Math.cos(ang) * speed * (fromLeft ? 1 : -1),
      vy: Math.sin(ang) * speed,
      life: 1,
      decay: 0.55 + Math.random() * 0.45,
      len: 90 + Math.random() * 130,
      width: 1.1 + Math.random() * 1.5,
      color: Math.random() < 0.5 ? "234, 246, 255" : "122, 255, 224",
    });
  }

  function updateShooting(dt) {
    if (Math.random() < CONFIG.shootingStarRate * dt) spawnShootingStar();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= s.decay * dt;

      if (
        s.life <= 0 ||
        s.x < -400 ||
        s.x > W + 400 ||
        s.y > H + 200
      ) {
        shooting.splice(i, 1);
        continue;
      }

      const a = Math.min(1, s.life) * 0.95;
      const mag = Math.hypot(s.vx, s.vy) || 1;
      const tx = s.x - (s.vx / mag) * s.len;
      const ty = s.y - (s.vy / mag) * s.len;

      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, "rgba(" + s.color + ", " + a + ")");
      g.addColorStop(0.35, "rgba(" + s.color + ", " + a * 0.35 + ")");
      g.addColorStop(1, "rgba(" + s.color + ", 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // 流星头部亮点
      ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.width * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     星尘上浮
     ----------------------------------------------------------------------- */
  function spawnSpark() {
    const hue = Math.random() < 0.5 ? 165 : 258;
    sparks.push({
      x: Math.random() * W,
      y: H + 10,
      vx: (Math.random() - 0.5) * 14,
      vy: -(14 + Math.random() * 34),
      r: 0.8 + Math.random() * 2.1,
      life: 1,
      decay: 0.11 + Math.random() * 0.16,
      wob: Math.random() * Math.PI * 2,
      hue: hue,
    });
  }

  function updateSparks(dt, t) {
    const rate = CONFIG.sparkRate * qualityScale;
    // dt === 0 表示本帧只重绘，不推进物理也不生成新粒子
    if (dt > 0 && Math.random() < rate * dt) spawnSpark();
    if (sparks.length > CONFIG.sparkMax) sparks.splice(0, sparks.length - CONFIG.sparkMax);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (dt > 0) {
        s.life -= s.decay * dt;
        if (s.life <= 0 || s.y < -20) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += (s.vx + Math.sin(t * 1.3 + s.wob) * 8) * dt;
        s.y += s.vy * dt;
      }

      const a = s.life * 0.75;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
      g.addColorStop(0, "hsla(" + s.hue + ", 100%, 82%, " + a + ")");
      g.addColorStop(0.4, "hsla(" + s.hue + ", 100%, 70%, " + a * 0.35 + ")");
      g.addColorStop(1, "hsla(" + s.hue + ", 100%, 60%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     点击爆发
     ----------------------------------------------------------------------- */
  function spawnBurst(x, y) {
    if (!CONFIG.burstEnabled) return;
    const n = Math.round(CONFIG.burstCount * qualityScale);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 70 + Math.random() * 290;
      burst.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: 1.2 + Math.random() * 2.6,
        life: 1,
        decay: 0.85 + Math.random() * 0.85,
        hue: Math.random() < 0.45 ? 165 : 258,
      });
    }
    if (burst.length > CONFIG.burstMax)
      burst.splice(0, burst.length - CONFIG.burstMax);
  }

  // 升级/解锁成功时的粒子爆发：与鼠标点击的爆发区分开——
  //   金色（hue 42）为主，掺少量白，并且用「速度分档」造出层次，
  //   而不是单纯朝四周均匀喷一圈。
  function spawnUnlockBurst(el, opt) {
    if (!CONFIG.burstEnabled || !el) return;
    const o = opt || {};
    const baseHue = o.hue === undefined ? 42 : o.hue;
    const altHue = o.altHue === undefined ? 190 : o.altHue;
    const altChance = o.altChance === undefined ? 0.22 : o.altChance;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const reach = Math.max(rect.width, rect.height) * 0.6;
    const n = Math.round(CONFIG.unlockBurstCount * qualityScale);

    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.35;
      const tier = 1 + (i % 3) * 0.55; // 三档速度，形成内外层次
      const speed = (reach * 2.1 + Math.random() * 90) * tier;
      burst.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: 1.1 + Math.random() * 2.2,
        life: 1,
        decay: 0.75 + Math.random() * 0.7,
        // 主色 + 少量辅色，和鼠标点击的爆发区分开
        hue: Math.random() < 1 - altChance ? baseHue : altHue,
      });
    }
    if (burst.length > CONFIG.burstMax)
      burst.splice(0, burst.length - CONFIG.burstMax);
  }

  // 升级/解锁成功的「冲击波」：一圈从元素边缘向外扩散并淡出的光环。
  // 刻意画在 canvas 上而不是用伪元素——伪元素只有两个，已经被
  // 光晕（::after）和闲置闪光（::before）占用；画在 canvas 上既不抢位置，
  // 也不产生任何重绘/重排开销。
  const shockwaves = [];
  let shockwaveTotal = 0; // 累计生成次数，供验收观测

  function spawnShockwave(el, color, softColor) {
    if (!CONFIG.unlockBurst || !el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    shockwaves.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
      r: Math.max(rect.width, rect.height) * 0.62,
      life: 1,
      decay: 1.7, // 约 0.6 秒
      // 默认金黄（升级用）；里程碑传冷蓝、能量条传暖黄，观感上区分开
      color: color || "255, 224, 150",
      softColor: softColor || null,
    });
    shockwaveTotal++; // 供验收观测
  }

  function updateShockwaves(dt) {
    if (!shockwaves.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i];
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        shockwaves.splice(i, 1);
        continue;
      }
      const p = 1 - s.life; // 0 → 1
      const scale = 1 + p * 0.85;
      const rx = (s.w / 2) * scale;
      const ry = (s.h / 2) * scale;
      const alpha = s.life * 0.9;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(s.x - rx, s.y - ry, rx * 2, ry * 2, Math.min(rx, ry) * 0.4);
      } else {
        ctx.rect(s.x - rx, s.y - ry, rx * 2, ry * 2);
      }
      ctx.lineWidth = 2 + s.life * 3;
      ctx.strokeStyle = "rgba(" + s.color + ", " + alpha + ")";
      ctx.stroke();
    }
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     已获得 / 满级元素
     ---------------------------------------------------------------------------
     只用 CSS 的「呼吸辉光」（挂在 ::before，只动 opacity）。
     曾经还在这里画过 canvas 星点，但用户反馈不需要，已整体移除。
     ----------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     里程碑 & 能量条（p 层）专属特效
     ---------------------------------------------------------------------------
     两者都用 canvas 的「冲击波 + 粒子」组合（spawnShockwave / spawnUnlockBurst），
     但配合不同颜色，观感上与普通升级区分开：
       里程碑达成 → 蓝色冲击波 + 蓝色粒子（重要节点，用冷色强调「里程碑」）
       能量条填充 → 暖黄冲击波 + 金色粒子（与「能量」的黄色数值一致）

     检测方式：
       里程碑 —— <td class="milestone"> 与 .milestoneDone 的类名翻转；
                 没有 id，所以用「文本内容」当键（里程碑标题唯一）。
       能量条 —— 直接读 player.p.energyDrain[i]（与 buyable 读等级同理，
                 比盯 DOM 文本可靠）。
     ----------------------------------------------------------------------- */
  const msDoneSeen = new WeakMap(); // td -> 上次是否已完成
  const msSeenAny = new WeakSet(); // 首次见到只登记不播，避免进页面满屏闪
  const energyLevelSeen = new WeakMap(); // .fill -> 上次的填充字符串

  function scanMilestones() {
    if (!CONFIG.inputFx || !CONFIG.milestoneFx) return;
    document.querySelectorAll(".milestone, .milestoneDone").forEach((el) => {
      const isDone = el.classList.contains("milestoneDone");
      const prev = msDoneSeen.get(el);
      msDoneSeen.set(el, isDone);
      if (!msSeenAny.has(el)) {
        // 首次见到（含切换界面重建的节点）只登记，不播
        msSeenAny.add(el);
        return;
      }
      if (prev === false && isDone) {
        spawnShockwave(el, "#8fd8ff", "#dff2ff");
        spawnUnlockBurst(el, { hue: 205, altHue: 190, altChance: 0.35 });
      }
    });
  }

  /* 算出粒子的升起位置 —— **固定在能量条右端**。
     ---------------------------------------------------------------------------
     曾经按「红色填充部分的可见右端」算，做法是读游戏裁切用的 clip-path：

       style.fillDims.width = bar.width + 1 + 'px'
       style.fillDims['clip-path'] = 'inset(0% ' + bar.progress + '% 0% 0%)'

     那是能算准的（量过，与渲染一致），但用户要的是**固定在右端**，
     所以现在直接取条右端，不再随进度移动。

     保留一段历史坑记录（以后要改回「跟前沿」时别再踩）：
       - 不能用 .fill 的 getBoundingClientRect().right —— .fill 的宽度永远是
         「整条宽 +1px」，它的右端恒等于条右端，跟进度无关（按它算等于恒取满格）。
       - 要拿进度就读 tmp[layer].bars[id].progress 或 clipPath 的第二个数，
         但**量纲是 0~100 的百分数**，不是 0~1 的比例。
     ----------------------------------------------------------------------- */
  function energyLeadX(rect) {
    // 右侧留 8px：那条描边在边缘，粒子压上去会显得毛糙
    return rect.right - 8;
  }

  function scanEnergyBars() {
    if (!CONFIG.inputFx || !CONFIG.energyFx) return;
    let levels, drains;
    try {
      if (typeof player === "undefined" || !player.p) return;
      levels = player.p.energyLevel;
      drains = player.p.energyDrain;
    } catch (e) {
      return;
    }
    if (!levels || !drains) return;

    // 进度条本体：.fill 的顺序与能量条序号一致
    // 注意：.fill 是所有 bar 共用的类，而各条 bar 的颜色由游戏内联 fillStyle 决定。
    // 所以这里只「打标记」，颜色与光效都交给 CSS 的 .ds-energy-bar-fill 处理，
    // 绝不能像以前那样给通用 .fill 覆盖 background-image（会把颜色冲掉）。
    const fills = document.querySelectorAll(".fill");
    // 持续流出：按住填充按钮时，让能量微尘不断从填充前沿溢出，
    // 而不是只在等级跳变那一刻喷一次 —— 这样「能量感」才是持续的。
    // 注意：clickable 组件的 class 里**不含** clickable（只有 upg tooltipBox can），
    // 所以不能靠类名选（实测 querySelectorAll('.clickable') 为 0）；
    // 按住状态也不体现在 DOM 上，所以由本层自己监听 pointerdown/up 追踪。
    const nowMs = performance.now();
    if (energyHolding && nowMs - moteTrickleAt > CONFIG.moteTrickleMs) {
      moteTrickleAt = nowMs;
      fills.forEach((el, i) => {
        if (i >= levels.length) return;
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        // 从**条右端**升起（固定位置，不随进度移动）
        spawnEnergyMotes(energyLeadX(r), r.top + r.height * 0.5, CONFIG.moteTrickleN);
      });
    }

    fills.forEach((el, i) => {
      if (i >= levels.length) return;
      el.classList.add("ds-energy-bar-fill");
      const lv = String(levels[i]);
      const prev = energyLevelSeen.get(el);
      energyLevelSeen.set(el, lv);
      if (prev === undefined || prev === lv) return;
      // 等级上升才播（下降可能是重置）
      const rose = (() => {
        try {
          return levels[i].gt(prev);
        } catch (e) {
          return Number(lv) > Number(prev);
        }
      })();
      if (!rose) return;
      pulseOnce(el, "ds-energy-pulse", 620);
      // 从条右端升起（固定位置）
      const rect = el.getBoundingClientRect();
      spawnEnergyMotes(
        energyLeadX(rect),
        rect.top + rect.height * 0.5,
        CONFIG.moteCount
      );
    });

    // 填充按钮：clickable 组件的 class 不含 clickable，只有 upg tooltipBox can，
    // 所以按 id 前缀选（id 形如 clickable-p-11）。
    const btns = document.querySelectorAll("[id^='clickable-p-']");
    btns.forEach((el, i) => {
      el.classList.add("ds-energy-btn");
      if (i >= drains.length) return;
      const d = String(drains[i]);
      const prev = energyLevelSeen.get(el);
      energyLevelSeen.set(el, d);
      if (prev === undefined || prev === d) return;
      if (pulseOnce(el, "ds-energy-pulse", 620)) {
        const rect = el.getBoundingClientRect();
        // 按钮上方也喷一束微尘，呼应进度条那束
        spawnEnergyMotes(rect.left + rect.width / 2, rect.top + 4, 12);
      }
    });
  }

  /* --------------------------------------------------------------------------
     能量微尘（energyMotes）—— 能量条专属的能量质感粒子
     ---------------------------------------------------------------------------
     与通用 burst 的区别（用户要求「看起来有能量的感觉」）：
       · 从填充前沿**向上飘升**，而不是四散炸开
       · 颜色走青→蓝→白炽，少量暖金点缀，像等离子体而不是火花
       · 每颗都带**闪烁**（sin 高频抖动）与**拖尾**，像放电
       · 中心是白炽核心 + 外层彩色辉光，尺寸小但很亮
     ----------------------------------------------------------------------- */
  const energyMotes = [];
  let moteTrickleAt = 0; // 持续流出的节流计时
  let energyHolding = false; // 是否正按住某个填充按钮

  const MOTE_HUES = [188, 200, 215, 172, 48]; // 青 / 蓝 / 深蓝 / 薄荷 / 少量暖金

  /* 微尘辉光精灵缓存。
     ---------------------------------------------------------------------------
     原来每颗微尘每帧都要 createRadialGradient（4 个色标）+ arc + fill，
     再加一条 createLinearGradient 的拖尾 —— 约 46 颗就是**每帧 92 次渐变对象创建**，
     全部在 "lighter" 加法混合下填充，是这块最重的开销。

     与星场同样的思路：形态与色相就那么几种，预渲染成精灵，绘制时只 drawImage。
     色相只有 5 种、半径量化成 2 档，所以最多 10 张小图，一次生成永久复用。

     做法：先画一张「白色径向渐变」当模板，再读出像素、按色相逐像素着色、
     用 putImageData 写回 —— 这样既保住了原来的衰减曲线，又能换任意色相，
     不需要为每个色相重跑一次 createRadialGradient。
     ----------------------------------------------------------------------- */
  const MOTE_SPRITE_PX = 96; // 精灵边长；绘制时缩放到实际辉光直径
  const moteSprites = new Map(); // "hue|档位" -> 画布（最多 5 色相 × 2 档 = 10 张）

  function buildMoteSprite(hue, big) {
    const key = hue + "|" + (big ? 1 : 0);
    const cached = moteSprites.get(key);
    if (cached) return cached;

    const N = MOTE_SPRITE_PX;
    const c = N / 2;
    const cv = document.createElement("canvas");
    cv.width = N;
    cv.height = N;
    const g = cv.getContext("2d");

    // 模板：白色径向渐变。
    // 内层半径按档位不同（大档更「散」、小档更「聚」），色标比例与原来一致。
    const inner = big ? c : c * 0.55;
    const grad = g.createRadialGradient(c, c, 0, c, c, inner);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(big ? 0.22 : 0.55, "rgba(255,255,255,0.72)");
    grad.addColorStop(big ? 0.55 : 0.85, "rgba(255,255,255,0.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, N, N);

    // 逐像素着色：alpha 原样保留，RGB 换成该色相
    const img = g.getImageData(0, 0, N, N);
    const d = img.data;
    const hh = hue / 60;
    const i = Math.floor(hh) % 6;
    const f = hh - Math.floor(hh);
    const q = 1 - f;
    let r, gg, b;
    if (i === 0) { r = 1; gg = f; b = 0; }
    else if (i === 1) { r = q; gg = 1; b = 0; }
    else if (i === 2) { r = 0; gg = 1; b = f; }
    else if (i === 3) { r = 0; gg = q; b = 1; }
    else if (i === 4) { r = f; gg = 0; b = 1; }
    else { r = 1; gg = 0; b = q; }
    const R = (r * 255) | 0;
    const G = (gg * 255) | 0;
    const B = (b * 255) | 0;
    for (let k = 0; k < d.length; k += 4) {
      d[k] = R;
      d[k + 1] = G;
      d[k + 2] = B;
    }
    g.putImageData(img, 0, 0);
    moteSprites.set(key, cv);
    return cv;
  }

  function spawnEnergyMotes(x, y, count) {
    if (!CONFIG.energyFx || !CONFIG.energyMotes) return;
    const n = Math.round((count || CONFIG.moteCount) * qualityScale);
    for (let i = 0; i < n; i++) {
      const spread = (Math.random() - 0.5) * (CONFIG.moteSpreadX || 18);
      const hue = MOTE_HUES[(Math.random() * MOTE_HUES.length) | 0];
      energyMotes.push({
        x: x + spread,
        y: y + (Math.random() - 0.5) * (CONFIG.moteSpreadY || 16),
        // 向上为主，横向漂移刻意很小：能量条容器是 overflow:hidden，
        // 横向漂远了辉光会被条的边缘裁断（看起来像被切了一刀）。
        vx: (Math.random() - 0.5) * 14,
        vy: -(10 + Math.random() * 26),
        r: 1.1 + Math.random() * 1.7,
        hue: hue,
        // 拖尾用的纯色。以前每帧 createLinearGradient，现在预先算好一个颜色串，
        // 绘制时只改 globalAlpha —— 省掉每帧每颗一次的渐变对象创建。
        tailColor: "hsl(" + hue + ", 100%, 80%)",
        life: 1,
        // 衰减刻意偏快：单颗约 1.1~1.7 秒就消亡，形成「不断流过」的观感，
        // 而不是越积越多糊成一片（实测衰减太慢会顶到数量上限）。
        decay: 1.1 + Math.random() * 0.7,
        // 闪烁相位与频率：让每颗独立地明灭，像放电
        flickPhase: Math.random() * Math.PI * 2,
        flickSpeed: 11 + Math.random() * 15,
      });
    }
    if (energyMotes.length > CONFIG.moteMax)
      energyMotes.splice(0, energyMotes.length - CONFIG.moteMax);
  }

  function updateEnergyMotes(dt, t) {
    if (!ectx) return;

    // 按需挂载：有粒子才把这张整屏透明画布挂到 DOM 上；
    // 粒子清空后立刻摘掉，避免长期白占一个参与每帧合成的整屏层
    // （绝大多数存档根本没解锁能量条，这张画布本该是零成本）。
    if (energyMotes.length) {
      if (!document.body.contains(energyCv)) document.body.appendChild(energyCv);
    } else if (document.body.contains(energyCv)) {
      energyCv.remove();
      return;
    }

    // 自愈：这张画布是 position:fixed + width:100%，会被浏览器按「CSS 显示尺寸 /
    // 内部像素尺寸」的比值整体缩放。如果两者不一致（窗口在画布建立后才确定尺寸、
    // 或 resize 事件没跑到），粒子就会被整体拉偏 —— 这正是「粒子错位」的根源。
    // 每帧比对一次并纠正，代价只是两个数字比较。
    if (energyCv.width !== Math.floor(W) || energyCv.height !== Math.floor(H)) {
      energyCv.width = Math.max(1, Math.floor(W));
      energyCv.height = Math.max(1, Math.floor(H));
      ectx.setTransform(1, 0, 0, 1, 0, 0);
      energyDirty = null;
    }

    // 先清掉上一帧弄脏的那块（只清这一块，不整屏清，
    // 否则等于每帧往一个整屏画布上糊一次透明清除，白费带宽）
    if (energyDirty) {
      ectx.clearRect(
        energyDirty.x,
        energyDirty.y,
        energyDirty.w,
        energyDirty.h
      );
      energyDirty = null;
    }
    if (!energyMotes.length) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    ectx.save();
    ectx.globalCompositeOperation = "lighter";
    for (let i = energyMotes.length - 1; i >= 0; i--) {
      const p = energyMotes[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        energyMotes.splice(i, 1);
        continue;
      }
      // 上升加速 + 横向阻尼：像被吸上去的能量
      p.vy -= 26 * dt;
      p.vx *= 1 - 1.4 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // 闪烁：高频 sin，让它忽明忽暗
      const flick = 0.55 + 0.45 * Math.sin(t * p.flickSpeed + p.flickPhase);
      const a = p.life * p.life * flick; // 平方衰减，尾巴更干净
      if (a < 0.02) continue;

      const R = p.r * (2.2 + p.life * 1.6);
      const reach = R * 3;

      // 记录需要的清除范围（含辉光半径）
      if (p.x - reach < minX) minX = p.x - reach;
      if (p.y - reach < minY) minY = p.y - reach;
      if (p.x + reach > maxX) maxX = p.x + reach;
      if (p.y + reach > maxY) maxY = p.y + reach;

      // 外层彩色辉光：直接从精灵缓存取，不再每帧 createRadialGradient。
      // 精灵内部已带 4 段衰减，整颗的明暗用 globalAlpha 控制。
      const sprite = buildMoteSprite(p.hue, p.life > 0.55);
      const side = reach * 2;
      ectx.globalAlpha = a;
      ectx.drawImage(sprite, p.x - reach, p.y - reach, side, side);

      // 白炽核心：很小但接近纯白，是「能量」的关键观感（arc 很便宜，保留）
      ectx.globalAlpha = a * 0.95;
      ectx.fillStyle = "#ffffff";
      ectx.beginPath();
      ectx.arc(p.x, p.y, Math.max(0.6, p.r * 0.72), 0, Math.PI * 2);
      ectx.fill();

      // 上升拖尾：原来是 createLinearGradient + stroke（每帧一次渐变创建）。
      // 拖尾很短，用纯色 + globalAlpha 表达渐隐，肉眼几乎无差，但省掉整个渐变对象。
      const tail = 0.055 + p.life * 0.05;
      ectx.globalAlpha = a * 0.5;
      ectx.strokeStyle = p.tailColor;
      ectx.lineWidth = Math.max(0.6, p.r * 0.75);
      ectx.beginPath();
      ectx.moveTo(p.x, p.y);
      ectx.lineTo(p.x - p.vx * tail, p.y - p.vy * tail);
      ectx.stroke();
    }
    ectx.restore();

    // 下一帧要清的矩形（外扩 2px 防止边缘残影）
    if (minX < maxX) {
      energyDirty = {
        x: Math.max(0, minX - 2),
        y: Math.max(0, minY - 2),
        w: maxX - minX + 4,
        h: maxY - minY + 4,
      };
    }
  }

  /* --------------------------------------------------------------------------
     冷却条（独立于按钮）
     ---------------------------------------------------------------------------
     这一版是**重做**的。以前把进度带画在按钮的 ::before 上，一路踩坑：
     ::after 被「闲置闪光」的高特异性选择器占着、::before 又有两条规则在动画
     opacity、还要靠 !important 跟斜向流光抢 animation；最要命的是按钮容器有
     overflow:hidden，带子只剩几个像素，用户连续三次反馈「看不到」。

     现在改成**完全独立的 DOM 元素**，由特效层自己创建、挂在自己的固定图层里：
       · 不在按钮内部 → 不受 overflow / border-radius / 背景色影响
       · 不占伪元素 → 与闲置闪光、已获得辉光、斜向流光互不干扰
       · 不需要 !important → 与任何既有选择器都没有特异性关系
       · 位置由 JS 按按钮的实际矩形摆放 → 看起来仍是「这个按钮的冷却条」
         （悬在底边上，向上露出 4px，按钮本体完全不动）

     图层用 position:fixed，z-index 5：在能量条（2/3/6）与 tooltip（7）之下。
     ----------------------------------------------------------------------- */
  // 元素 id → 计时信息 { field: player 里的字段名, kind: 'cd' | 'buff' }
  //
  // **注意：不是所有条都是「冷却」**（这里我一开始就搞错了）。
  // 实测 layers.js 里 h 层有四个计时器，含义完全不同：
  //   player.h.wait       冷却      → clickable-h-11「凝聚希望」用完要等
  //   player.h.duration   持续时间  → clickable-h-12「希望共振」的增益时长
  //   player.h.duration2  持续时间  → clickable-h-13「希望共鸣」
  //   player.h.duration3  持续时间  → clickable-h-14「希望永续」
  // 只读 wait 的话，希望共振永远不会有条 —— 而用户恰恰先注意到它。
  //
  // **不要给 max 写死数字**：这几个计时器的满值都是**动态**的，
  // 游戏里的公式（layers.js）：
  //   wait      = 1 秒起，每次相关升级减半 → 0.5 / 0.25 / 0.125 / 0.0625
  //   duration  = log10(max(希望粒子, 10))
  //   duration2 = (log10((白点+1)*10)) ^ 0.8 * 10
  // 也就是说它们随玩家进度持续增长，写死必然失真（我一开始就写死了 32/40）。
  //
  // 改用**自动定标**：每次计时器从「无」变为「有」时记下当时的满值作为峰值，
  // 之后用 剩余/峰值 当比例。见 updateCooldowns 里的 cdPeak。
  const CD_BY_ID = {
    "clickable-h-11": { field: "wait", kind: "cd" },
    "clickable-h-12": { field: "duration", kind: "buff" },
    "clickable-h-13": { field: "duration2", kind: "buff" },
    "clickable-h-14": { field: "duration3", kind: "buff" },
  };
  // field → 这一次计时周期里观察到的峰值（用于归一化比例）
  const cdPeak = new Map();
  const CD_BAR_H = 8; // 与 effects.css 里 .ds-cdbar 的 height 保持一致
  const CD_LIFT = 3; // 向上露出多少像素（按钮本体不动）
  const cdBars = new Map(); // element -> 条子元素
  let cdLayer = null;
  let cdReadyAt = new WeakMap(); // el -> 上次是否已就绪（只在翻转那一刻播特效）
  let cdDebug = null; // 调试探针（见 updateCooldowns 末尾与 perf()）

  /** 按需创建/摘除图层。没有冷却按钮时整层不存在，零合成成本。 */
  function ensureCdLayer(want) {
    if (want && !cdLayer) {
      cdLayer = document.createElement("div");
      cdLayer.id = "deepSpaceCooldown";
      document.body.appendChild(cdLayer);
    } else if (!want && cdLayer) {
      cdLayer.remove();
      cdLayer = null;
      cdBars.clear();
      cdPeak.clear(); // 计时器都不在了，峰值缓存一并丢掉，下次重新定标
    }
  }

  /** 取某元素对应的条子，没有就建一条。kind 决定配色（cd 冷绿 / buff 暖金）。 */
  function getCdBar(el, kind) {
    let bar = cdBars.get(el);
    if (bar && bar.isConnected) return bar;
    bar = document.createElement("div");
    bar.className = "ds-cdbar ds-cdbar-" + (kind || "cd");
    const fill = document.createElement("i");
    bar.appendChild(fill);
    cdLayer.appendChild(bar);
    cdBars.set(el, bar);
    return bar;
  }

  /** 把条子摆到按钮底边上（只写 transform/width，不读布局）。 */
  function placeCdBar(bar, r) {
    const w = r.width;
    const h = r.height;
    // 居中留 2px 内缩，避免长按钮的条子看起来比按钮还宽
    const bw = Math.max(24, Math.min(w - 4, 220));
    const left = r.left + (w - bw) / 2;
    const top = r.top + h - CD_BAR_H + CD_LIFT;
    bar.style.width = bw.toFixed(1) + "px";
    bar.style.transform =
      "translate3d(" + left.toFixed(1) + "px," + top.toFixed(1) + "px,0)";
  }

  function updateCooldowns() {
    if (!CONFIG.cooldownFx) {
      ensureCdLayer(false);
      return;
    }
    // 先看有没有登记过的计时按钮存在于当前界面。
    // 必须**在遍历之前**判断，因为下面的循环里会用到 cdLayer，
    // 而图层只能提前建好 —— 我曾把 ensureCdLayer 放在循环之后，
    // 结果 getCdBar 里的 appendChild 拿到 null 抛异常，
    // 把整个 scan() 打断，连 `setInterval(scan, 150)` 都没执行到，
    // 整个特效层的定时扫描直接瘫痪。这是个很隐蔽的连锁故障。
    const ids = Object.keys(CD_BY_ID);
    let anyPresent = false;
    for (let i = 0; i < ids.length; i++) {
      const probe = document.getElementById(ids[i]);
      if (probe && probe.getBoundingClientRect().width) {
        anyPresent = true;
        break;
      }
    }
    if (!anyPresent) {
      ensureCdLayer(false); // 没有冷却按钮 → 整层不存在，零成本
      cdDebug = { all: 0, live: 0, layer: false, bars: 0, H: H, W: W, at: Math.round(performance.now()) };
      return;
    }
    ensureCdLayer(true); // 图层先就位，后面 getCdBar 才能安全 appendChild

    const all = document.querySelectorAll("[id^='clickable-']");
    let live = 0;
    const seen = new Set();
    all.forEach((el) => {
      const info = CD_BY_ID[el.id];
      if (!info) return;
      let secs = 0;
      try {
        const parts = (el.id || "").split("-");
        const layer = parts.length >= 3 ? parts[1] : null;
        const pl = layer && typeof player !== "undefined" ? player[layer] : null;
        if (!pl) return;
        const raw = pl[info.field];
        const n = typeof raw === "number" ? raw : Number(raw);
        secs = isFinite(n) ? n : 0;
      } catch (e) {
        return;
      }
      const active = secs > 0.02;
      // 满值是动态的，所以自动定标：计时器每次从「无」变「有」时重新记录峰值，
      // 之后用 剩余 / 峰值 作为比例。峰值只在计时期间更新（取见过的最大值），
      // 所以条子只会平滑缩短，不会因为满值波动而来回跳。
      if (!active) {
        cdPeak.delete(info.field);
      } else {
        const pk = cdPeak.get(info.field) || 0;
        if (secs > pk) cdPeak.set(info.field, secs);
      }
      const peak = cdPeak.get(info.field) || secs || 1;
      const ratio = active ? Math.min(1, secs / peak) : 0;
      const bar = getCdBar(el, info.kind);

      // 计时结束 → 条子淡出，且**不再重新摆位**。
      // 为什么必须跳过摆位：按钮一旦不可点，游戏可能给它 display:none，
      // 此时 getBoundingClientRect() 返回全 0，摆位算出来是 (-6, 0) 这种垃圾值，
      // 条子会在左上角闪一下（实测就是这个现象）。
      if (!active) {
        bar.style.opacity = "0";
        const wasActive = cdReadyAt.get(el);
        cdReadyAt.set(el, false);
        if (wasActive === true && info.kind === "cd") {
          // 冷却刚结束：条子亮一下扩散淡出 + 一次冲击波
          bar.style.opacity = "1";
          bar.classList.remove("ds-cdbar-ready");
          void bar.offsetWidth; // 强制回流，让同一元素能重播动画
          bar.classList.add("ds-cdbar-ready");
          if (CONFIG.unlockBurst) {
            spawnShockwave(el, "190, 255, 190", "235, 255, 235");
          }
        }
        return;
      }

      // 以下只在「计时进行中」执行。
      // 摆位需要真实矩形，而且必须在这里才取 —— 按钮被隐藏时矩形是全 0。
      const r = el.getBoundingClientRect();
      // 不可见的（切换了界面 / 滚出视口 / 尺寸为 0）先不摆，也不计入 live
      if (!r.width || !r.height || r.bottom < 0 || r.top > H) return;

      seen.add(el);
      placeCdBar(bar, r);
      live++;

      bar.firstChild.style.setProperty(
        "--ds-cd-pct",
        (ratio * 100).toFixed(2) + "%"
      );
      bar.classList.remove("ds-cdbar-ready");
      bar.style.opacity = "1";
      cdReadyAt.set(el, true);
    });

    // 清掉不再需要的条子（按钮被移出 DOM / 切走了）
    cdBars.forEach((bar, el) => {
      if (!seen.has(el) || !el.isConnected) {
        bar.remove();
        cdBars.delete(el);
      }
    });
    ensureCdLayer(live > 0);
    // 调试探针：定位「冷却条没出现」时到底卡在哪一步
    cdDebug = {
      all: all.length,
      live: live,
      layer: !!cdLayer,
      bars: cdBars.size,
      H: H,
      W: W,
      at: Math.round(performance.now()),
    };
  }

  /* --------------------------------------------------------------------------
     数字特效
     ---------------------------------------------------------------------------
     给游戏里的数值加一点「读数」的质感：柔和外发光 + 随量级增强。

     **关键约束：数字每 50ms 就被游戏重写一次**（updateTemp 里直接改 textContent）。
     所以这里绝对不能用 CSS 动画 —— 文本一换，动画就被打断重放，
     看起来一直在抖。本项目早就为此删掉过一版「数值脉冲」，别再踩。
     这里只写一个静态的 data 属性，CSS 侧也只是静态 text-shadow。

     量级分档靠指数（科学计数法的 eXX）。游戏用 format() 输出，
     大数走 "2.82e37" 这种形式，所以直接匹配 /e(\\d+)/ 最省事：
     没有指数就是 0 档，也就是普通小数值。
     ----------------------------------------------------------------------- */
  const numTiered = new WeakMap(); // el -> 上次写过的档位（只在变化时写 DOM）
  let numScanned = 0;
  let numMarked = 0;
  let numDebug = null;

  function numTier(text) {
    const m = /e\+?(\d+)/i.exec(text);
    if (m) {
      const e = parseInt(m[1], 10);
      // 每 10 个数量级升一档：1e10 → 1 档，1e20 → 2 档……
      if (e >= 90) return 6;
      if (e >= 75) return 5;
      if (e >= 60) return 4;
      if (e >= 45) return 3;
      if (e >= 30) return 2;
      if (e >= 15) return 1;
      return 0;
    }
    // 没有科学计数法：看整数位数（千分位逗号也算）
    const digits = text.replace(/[^0-9]/g, "").length;
    if (digits >= 16) return 5;
    if (digits >= 13) return 4;
    if (digits >= 10) return 3;
    if (digits >= 7) return 2;
    if (digits >= 4) return 1;
    return 0;
  }

  /** 数字所在的是不是「数值展示位」（排除按钮文案、tooltip 长句）。 */
  function numCandidate(el, allowInner) {
    if (el.children.length) {
      // allowInner：数字常被包在 <b> 里（例如「你有 <b>1.47e44</b> 希望粒子」），
      // 这时父元素是 span/div。只对「子元素全是行内标签且数量很少」的放行，
      // 避免把整块说明文字当成数值。
      if (!allowInner) return false;
      if (el.children.length > 3) return false;
      for (let i = 0; i < el.children.length; i++) {
        const tag = el.children[i].tagName;
        if (tag !== "B" && tag !== "STRONG" && tag !== "SPAN" && tag !== "I") {
          return false;
        }
      }
    }
    const t = (el.textContent || "").trim();
    if (!t || t.length > 28) return false;
    if (!/\d/.test(t)) return false;
    // tooltip 是长说明，排除
    if (el.classList.contains("tooltip")) return false;
    // 排除纯价格/成本行（那些已经有按钮光效了，再加会太吵）
    if (/cost|价格|花费/i.test(t)) return false;
    return true;
  }

  function scanNumbers() {
    if (!CONFIG.numberFx) return;
    // 候选范围刻意收窄：顶部资源区 + 当前层级的树/表格。
    // 全页扫会把成就名、说明文字一起扫进来，既慢又吵。
    //
    // 注意容器 id 是 **#treeTab**，不是 `#<layer>Tab`。
    // 我一开始按层级名拼 id（`#hTab` / `#dTab`），实测全部不存在，
    // 结果只有顶部资源区被标记到。
    const roots = [];
    const tree = document.getElementById("treeTab");
    if (tree) roots.push(tree);
    // #points 的父容器就是顶部资源条；treeTab 里也含 #points 时会重复扫，
    // 所以下面用 Set 去重（实测重复扫会让同一个元素被标记两次）。
    const pts = document.getElementById("points");
    if (pts && pts.parentElement) {
      const wrap = pts.parentElement;
      if (roots.indexOf(wrap) < 0 && !(roots[0] && roots[0].contains(wrap))) {
        roots.push(wrap);
      }
    }
    if (!roots.length) return;

    roots.forEach((root) => {
      const all = root.querySelectorAll("h2, h3, span, b, strong");
      all.forEach((el) => {
        numScanned++;
        // 先按「叶子」扫一遍；不行再看它是不是「少数行内子元素」的容器，
        // 因为数字常被包在 <b> 里（「你有 <b>1.47e44</b> 希望粒子」）。
        // 这样父容器与内层 <b> 都会被标记，取并集不影响观感。
        if (!numCandidate(el, true)) return;
        const tier = numTier(el.textContent || "");
        // 只在档位变化时写 DOM（数字每 50ms 变，但档位很少变）
        if (numTiered.get(el) === tier) return;
        numTiered.set(el, tier);
        el.setAttribute("data-ds-num", String(tier));
        numMarked++;
      });
    });
    numDebug = {
      roots: roots.length,
      scanned: numScanned,
      marked: numMarked,
      at: Math.round(performance.now()),
    };
  }

  function updateBurst(dt) {
    if (!burst.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = burst.length - 1; i >= 0; i--) {
      const p = burst[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        burst.splice(i, 1);
        continue;
      }
      p.vx *= 1 - 2.1 * dt; // 阻尼
      p.vy = p.vy * (1 - 2.1 * dt) + 110 * dt; // 轻微重力
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const a = p.life * 0.95;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, "hsla(" + p.hue + ", 100%, 88%, " + a + ")");
      g.addColorStop(0.45, "hsla(" + p.hue + ", 100%, 72%, " + a * 0.5 + ")");
      g.addColorStop(1, "hsla(" + p.hue + ", 100%, 60%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // 高速粒子拖一条短线
      ctx.strokeStyle = "hsla(" + p.hue + ", 100%, 85%, " + a * 0.5 + ")";
      ctx.lineWidth = Math.max(0.5, p.r * 0.7);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.026, p.y - p.vy * 0.026);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     主循环
     ----------------------------------------------------------------------- */
  let last = 0;
  let lastRendered = 0;
  let elapsed = 0;

  // 自适应画质状态
  const allowedScales = [1, 0.8, 0.62, 0.45, 0.32];
  let scaleIndex = 0;
  let recoverStreak = 0;
  let adaptMark = 0; // 上次判定时的 stats.samples
  let adaptDrawMark = 0; // 上次判定时的 stats.drawSum
  let adaptSum = 0;

  const stats = {
    samples: 0,
    sum: 0,
    max: 0,
    windows: 0,
    drawSamples: 0,
    drawSum: 0,
    drawMax: 0,
    phases: {},
  };

  function frame(now) {
    requestAnimationFrame(frame);
    if (!CONFIG.enabled || MODE === "off" || MODE === "css") return;

    if (!last) last = now;
    const rawDt = (now - last) / 1000;
    last = now;
    if (!isFinite(rawDt) || rawDt < 0) return;

    // 帧率上限：省 CPU 最直接的手段，背景特效不需要 120fps
    if (CONFIG.frameCap > 0) {
      if (now - lastRendered < 1000 / CONFIG.frameCap - 1) return;
    }
    lastRendered = now;

    const dt = Math.min(rawDt, 0.05); // 切标签页回来时不要一次跳一大步
    elapsed += dt;
    adaptSum += rawDt;

    // ---- 自适应画质 ----
    // 判据用「本层实测绘制耗时」，而不是 rAF 帧间隔：
    // 帧间隔会被浏览器节流/其它标签页/主线程负载干扰，用它判断会导致误降画质。
    // 绘制耗时才是这一层真正的开销。
    if (CONFIG.autoQuality && stats.samples - adaptMark >= 20 && adaptSum >= 0.8) {
      const n = stats.samples - adaptMark;
      const drawAvg = (stats.drawSum - adaptDrawMark) / n;
      adaptMark = stats.samples;
      adaptDrawMark = stats.drawSum;
      adaptSum = 0;

      if (drawAvg > CONFIG.drawBudgetMs * 1.7 && scaleIndex < allowedScales.length - 1) {
        scaleIndex++;
        qualityScale = allowedScales[scaleIndex];
        buildStars();
        auroraDirty = true;
        recoverStreak = 0;
      } else if (drawAvg < CONFIG.drawBudgetMs * 0.7) {
        recoverStreak++;
        if (recoverStreak >= 2 && scaleIndex > 0) {
          scaleIndex--;
          qualityScale = allowedScales[scaleIndex];
          buildStars();
          auroraDirty = true;
          recoverStreak = 0;
        }
      } else {
        recoverStreak = 0;
      }
    }

    // 指针视差平滑跟随
    camera.x += (camera.tx - camera.x) * Math.min(1, dt * 4.5);
    camera.y += (camera.ty - camera.y) * Math.min(1, dt * 4.5);

    // 物理更新节流：星点漂移/闪烁这类慢运动不必跟满刷新率。
    // 注意用「自上次更新以来的真实时长」推进物理，这样速度与实际时间一致，
    // 降频只影响平滑度、不会让星点漂移变快或变慢。
    const due = CONFIG.updateHz <= 0 || elapsed - lastUpdate >= 1 / CONFIG.updateHz;
    let updateDt = 0;
    if (due) {
      updateDt = lastUpdate < 0 ? dt : Math.min(0.2, elapsed - lastUpdate);
      lastUpdate = elapsed;
    }

    ctx.clearRect(0, 0, W, H);
    const drawStart = performance.now();
    stats.samples++;
    stats.sum += rawDt;
    stats.max = Math.max(stats.max, rawDt);
    let lastMark = drawStart;
    const mark = (name) => {
      const t2 = performance.now();
      stats.phases[name] = (stats.phases[name] || 0) + (t2 - lastMark);
      lastMark = t2;
    };
    if (CONFIG.drawNebulaLayer) {
      drawNebula();
    }
    mark("nebula");
    if (CONFIG.drawAuroraLayer) {
      drawAurora(elapsed);
    }
    mark("aurora");
    if (CONFIG.drawStarsLayer) {
      drawStars(updateDt, elapsed);
    }
    mark("stars");
    if (CONFIG.drawParticles) {
      updateSparks(updateDt, elapsed);
      mark("sparks");
      updateBurst(dt);
      mark("burst");
      updateShockwaves(dt);
      mark("shock");
    } else {
      mark("sparks");
      mark("burst");
      mark("shock");
    }
    // 能量粒子画在**它自己那张位于游戏 UI 之上**的画布上，与 drawParticles 无关：
    // 它必须每帧跟随能量条的位置重绘，也要保证旧位置被清干净（否则会留残影）。
    updateEnergyMotes(dt, elapsed);
    mark("motes");
    if (CONFIG.drawParticles) {
      updateShooting(dt);
      mark("shooting");
    } else {
      mark("shooting");
    }
    // 只统计「本层实际绘制耗时」，与浏览器节流无关，才能反映真实开销
    const cost = performance.now() - drawStart;
    stats.drawSamples++;
    stats.drawSum += cost;
    stats.drawMax = Math.max(stats.drawMax, cost);
  }

  /* --------------------------------------------------------------------------
     工具
     ----------------------------------------------------------------------- */
  const rgbCache = {};
  function hexToRgb(hex) {
    if (rgbCache[hex]) return rgbCache[hex];
    const v = hex.replace("#", "");
    const n = parseInt(
      v.length === 3
        ? v
            .split("")
            .map((c) => c + c)
            .join("")
        : v,
      16
    );
    const out = ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
    rgbCache[hex] = out;
    return out;
  }

  /* --------------------------------------------------------------------------
     事件绑定
     ----------------------------------------------------------------------- */
  function bindEvents() {
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener(
      "pointermove",
      (e) => {
        // 归一化到 [-0.5, 0.5]，越靠边视差越大
        camera.tx = (e.clientX / W - 0.5) * CONFIG.starParallax * 2;
        camera.ty = (e.clientY / H - 0.5) * CONFIG.starParallax * 2;
      },
      { passive: true }
    );

    // 点击可交互元素时炸开粒子
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== undefined && e.button !== 0) return; // 只响应左键
        const el = e.target && e.target.closest
          ? e.target.closest(
              ".can, .clickable, button, .tabButton, .treeNode, .upg, .buyable, .achievement, .tile, .reset, .smallUpg, .longUpg, .opt"
            )
          : null;
        // 空白处给个小爆发，点到可交互元素给个大的
        if (el) spawnBurst(e.clientX, e.clientY);
        else if (CONFIG.burstEnabled) {
          const keep = CONFIG.burstCount;
          CONFIG.burstCount = Math.round(keep * 0.45);
          spawnBurst(e.clientX, e.clientY);
          CONFIG.burstCount = keep;
        }
      },
      { passive: true }
    );

    // 切回标签页时重置时间基准，避免 dt 突变与误判掉帧
    document.addEventListener("visibilitychange", () => {
      last = 0;
      lastRendered = 0;
      adaptMark = stats.samples;
      adaptDrawMark = stats.drawSum;
      adaptSum = 0;
      recoverStreak = 0;
    });
  }

  // 用 body 上的 class 作为 CSS 特效的总开关（不需要包装元素）
  function applyModeToBody(m) {
    const on = m === "all" || m === "css";
    document.body.classList.toggle("ds-glow", on);
    // CSS 星云（带 blur 的那张）单独一个开关，方便定位它的开销
    document.body.classList.toggle("ds-nosky", !CONFIG.cssNebula || CONFIG.cheapSky);
    // 闲置闪光开关（CSS 那边据此整条停掉动画）
    document.body.classList.toggle("ds-no-shimmer", !CONFIG.idleShimmer);
    document.body.setAttribute("data-ds-mode", m);
  }

  function boot() {
    applyModeToBody(MODE);
    if (MODE === "css" || MODE === "off") {
      // 不需要 canvas 层：连 RAF 循环都不启动，做到真正零开销
      ready = true;
      return;
    }

    attachLayers();
    resize();
    buildStars();
    buildNebula();
    bindEvents();
    if (CONFIG.inputFx) bindInteraction();
    ready = true;
    requestAnimationFrame(frame);

    // 设置里「背景特效」开关的持久化：读档后要把开关状态重新应用一次。
    // 由游戏那边的 applyBackgroundFx() 负责具体切换，这里只负责在合适的时机触发；
    // 用定时器而不是事件，是为了避免和游戏的读档顺序耦合。
    if (typeof applyBackgroundFx === "function") {
      const syncBackgroundFx = (tries) => {
        try {
          applyBackgroundFx();
          return;
        } catch (e) {
          /* 游戏还没起来，下一轮再试 */
        }
        if (tries < 20) setTimeout(() => syncBackgroundFx(tries + 1), 500);
      };
      setTimeout(() => syncBackgroundFx(0), 600);
      setTimeout(() => syncBackgroundFx(0), 2500);
      setTimeout(() => syncBackgroundFx(0), 6000);
    }
  }

  /* --------------------------------------------------------------------------
     交互动效
     ---------------------------------------------------------------------------
     两条原则：
     1) 只切换 class，动画交给 CSS，并且只动 transform/opacity（合成器处理）；
     2) 不用 transitionend 收尾（全局过渡被改成 0s 后它不会触发），
        统一用定时器按动画时长摘掉 class。
     ----------------------------------------------------------------------- */
  const POP_SELECTOR =
    ".can, .clickable, button, .tabButton, .treeNode, .upg, .buyable, .achievement, .tile, .reset, .smallUpg, .longUpg, .opt";

  function pulseOnce(el, cls, ms) {
    if (!el || !el.classList) return;
    // 先摘掉再加回，保证连点也能重新播放
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  function bindInteraction() {
    // 点击回弹
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (!CONFIG.inputFx) return;
        if (e.button !== undefined && e.button !== 0) return;
        const el = e.target && e.target.closest ? e.target.closest(POP_SELECTOR) : null;
        if (el) {
          pulseOnce(el, "ds-pop", 300);
          // 点击水波纹：以「光标落点」为原点扩散，
          // 所以要把落点换算成元素内的百分比写进 CSS 变量。
          if (CONFIG.clickRipple && el.classList) {
            const rect = el.getBoundingClientRect();
            if (rect.width && rect.height) {
              const px = ((e.clientX - rect.left) / rect.width) * 100;
              const py = ((e.clientY - rect.top) / rect.height) * 100;
              el.style.setProperty("--ds-rip-x", Math.max(0, Math.min(100, px)).toFixed(1) + "%");
              el.style.setProperty("--ds-rip-y", Math.max(0, Math.min(100, py)).toFixed(1) + "%");
            }
            pulseOnce(el, "ds-ripple", 520);
          }
        }
        // 点击后临时加速扫描：购买造成的状态变化要尽快被看到，
        // 否则闪光会晚于点击 150ms（原来的固定轮询间隔），反馈不跟手。
        kickScan();

        // 按住「填充能量条」时标记为按住中，让能量微尘持续从填充前沿溢出。
        if (e.target && e.target.closest && e.target.closest("[id^='clickable-p-']")) {
          energyHolding = true;
        }
      },
      { passive: true }
    );

    // 松开即停止流出（pointerup 挂 window，指针移出按钮也算松开）
    const releaseHold = () => {
      energyHolding = false;
    };
    window.addEventListener("pointerup", releaseHold, { passive: true });
    window.addEventListener("pointercancel", releaseHold, { passive: true });
    window.addEventListener("blur", releaseHold, { passive: true });

    bindUnlockEffects();
  }

  // 把扫描提前触发几次，让购买反馈立刻跟上点击
  let scanFn = null;
  let kickTimer = null;
  function kickScan() {
    if (!scanFn) return;
    let n = 0;
    if (kickTimer) clearInterval(kickTimer);
    scanFn();
    kickTimer = setInterval(() => {
      scanFn();
      if (++n >= 12) {
        clearInterval(kickTimer);
        kickTimer = null;
      }
    }, 50); // 覆盖点击后约 0.6 秒
  }

  /* --------------------------------------------------------------------------
     升级 / 解锁成功的界面特效
     ---------------------------------------------------------------------------
     监听游戏自己加的状态类（.bought / .done / .canComplete），用 WeakMap 记录
     每个元素上一次的状态；**只在状态真正翻转的那一刻**放动画。

     为什么不直接对 .bought 写 CSS 动画：游戏每 50ms 重渲染一次，
     元素上只要有 .bought 就会一直重播动画，那样反而更晃。
     必须用 JS 做「边沿触发」。
     ----------------------------------------------------------------------- */
  const canState = new WeakMap(); // el -> 上次是否可购买
  /* 每个「物品键」最近一次已知的购买状态。
     ---------------------------------------------------------------------------
     原来这里是一个 `playedUnlock` Set：「播放过解锁特效的物品永久跳过」。
     那是为了压住「切界面时 Vue 复用/重建节点导致重复播放」，
     但副作用是**重置后再买永远不再有特效**（用户反馈的问题）——
     因为键只增不减，一旦入集就再也不播。

     正确做法是**按状态判断**而不是「播放过没有」：
     只要某个物品的购买状态发生 false → true 的翻转，就应该播一次。
     重置会把状态刷回 false（元素上 .bought 被摘掉，scan 会记录到），
     再次购买时自然又是 false → true，特效照常播放 —— 可以无限次重复。

     这个 Map 只存最近一次状态（不是「播放历史」），所以键数量有限，
     不会像 Set 那样无限增长。 */
  const boughtByKey = new Map();
  // 记录元素当前对应的物品键：键变了说明这个 DOM 节点被复用给了别的物品，
  // 此时不能拿旧物品的状态当基线（否则会误判/漏判）。
  const currentKey = new WeakMap();
  const unlockFxReadyAt = performance.now() + 2500; // 启动初期不播，避免进页面满屏闪

  // 把一批元素里最外层的那些挑出来，避免父子同时播放造成双倍动画
  function outermost(list) {
    const set = new Set(list);
    return list.filter((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (set.has(p)) return false;
      }
      return true;
    });
  }

  // 生成稳定的「物品键」。
  // 优先用元素 id（升级/可购买/点击物都有，形如 upgrade-a-11）；
  // 没有 id 的（里程碑、成就之类）退回「位置路径 + 类名」，
  // 因为只按类名的话同一层里一堆同类元素会共用一个键，状态互相污染。
  function itemKey(el) {
    if (el.id) return "#" + el.id;
    const parts = [];
    let node = el;
    for (let depth = 0; node && node.nodeType === 1 && depth < 6; depth++) {
      const cls =
        typeof node.className === "string"
          ? node.className.split(/\s+/).filter(Boolean).sort().join(".")
          : "";
      const idx = node.parentElement
        ? Array.prototype.indexOf.call(node.parentElement.children, node)
        : 0;
      parts.push(node.tagName + (cls ? "." + cls : "") + "[" + idx + "]");
      node = node.parentElement;
    }
    return parts.join(">");
  }

  /* 判断某个元素是否「刚刚买到」，并在是的时候播特效。
     抽成独立函数是为了能直接单测（不必去观察动画）。 */
  function handleBoughtTransition(el) {
    const boughtNow =
      el.classList.contains("bought") ||
      el.classList.contains("done") ||
      el.classList.contains("canComplete");

    const key = itemKey(el);
    const keyChanged = currentKey.get(el) !== key;
    const known = !keyChanged && boughtByKey.has(key);

    // 未知 → 当作「本来就是这样」，只登记不播（否则进页面/切界面满屏闪）。
    // 已知 → 用记录里的状态当基线，于是重置后再次购买又是 false → true。
    const wasBought = known ? boughtByKey.get(key) : undefined;

    if (keyChanged) currentKey.set(el, key);
    boughtByKey.set(key, boughtNow);

    if (!boughtNow || wasBought !== false) return null;

    pulseOnce(el, "ds-unlocked", CONFIG.unlockFlashMs);
    // 同时：从元素中心炸一把金色粒子 + 一圈扩散的冲击波
    if (CONFIG.unlockBurst) {
      spawnUnlockBurst(el);
      spawnShockwave(el);
    }
    return key;
  }

  function bindUnlockEffects() {
    const scan = () => {
      if (!CONFIG.inputFx) return;
      // 启动窗口内只记录状态，不放动画：
      // 进游戏时存档里已获得的升级会一次性全部渲染出来，全都闪一下会很乱。
      const canAnimate = performance.now() >= unlockFxReadyAt;

      // ---- ① 升级/收集品：只在「未获得 → 已获得」这一刻闪光 ----
      //
      // 关键点：必须扫描**全部**升级元素，不能只查 `.bought`。
      // 只查 `.bought` 的话，未购买的元素从来没被记录过；
      // 等它买下来变成 `.bought`，对记录表来说仍是「首次见到」，
      // 会被当成老存档里的东西静默跳过，永远不播动画（踩过）。
      //
      // 只看「最外层」元素，避免父容器与内部 span 各播一次造成动画叠加。
      const candidates = outermost(
        Array.prototype.slice.call(
          document.querySelectorAll(
            ".upg, .buyable, .achievement, .tile, .milestone, .milestoneDone, .challenge"
          )
        )
      );

      candidates.forEach((el) => {
        // 启动窗口内只登记状态、不播动画（避免进页面满屏闪）
        if (!canAnimate) {
          const k = itemKey(el);
          currentKey.set(el, k);
          boughtByKey.set(
            k,
            el.classList.contains("bought") ||
              el.classList.contains("done") ||
              el.classList.contains("canComplete")
          );
          return;
        }
        handleBoughtTransition(el);
      });

      // ---- ② 变得买得起：一次性脉冲提示 ----
      candidates.forEach((el) => {
        // canPrev === false → 从买不起翻转为买得起；
        // canPrev === undefined → 新出现的元素（新解锁的一批）且已买得起。
        // 不能用「首次见到」来触发，否则进页面时已有的元素会一起闪。
        const canNow = el.classList.contains("can");
        const canPrev = canState.get(el);
        canState.set(el, canNow);
        if (canAnimate && canNow && (canPrev === false || canPrev === undefined)) {
          pulseOnce(el, "ds-afford", 700);
        }
      });

      // ---- ③ 给新出现/还没排过相位的元素排闲置闪光相位 ----
      spreadShimmerPhase();

      // ---- ④ buyable：按等级变化触发（见下方函数说明）----
      scanBuyableLevels();

      // ---- ⑤ 里程碑 & 能量条（p 层专属）----
      scanMilestones();
      scanEnergyBars();

      // ---- ⑥ 冷却型按钮（希望共振）的充电状态 ----
      updateCooldowns();

      // ---- ⑦ 数值的发光质感（按量级分档）----
      scanNumbers();
    };

    scan();
    scanFn = scan; // 供 kickScan 立即触发
    // 重渲染后新出现的元素也要纳入观察
    setInterval(scan, 150);
  }

  /* --------------------------------------------------------------------------
     buyable 专属：按「等级变化」触发
     ---------------------------------------------------------------------------
     buyable 与 upgrade 的本质区别是它「有等级、可反复购买」，
     所以不能用升级那套「一次性获得」。这里直接读游戏的数据：
       元素 id = "buyable-<layer>-<id>"
       等级   = player[layer].buyables[<id>]   （Decimal）
     等级上升就播一次「升级脉冲」，比盯 DOM 文本可靠得多也便宜得多
     （文本变化不知道是不是升级，也可能是降价刷新）。
     ----------------------------------------------------------------------- */
  const buyableLevel = new WeakMap(); // el -> 上次看到的等级字符串
  const BUYABLE_MIN_GAP = 90; // 连点时限流（毫秒）
  const lastBuyableFx = new WeakMap();

  function scanBuyableLevels() {
    if (!CONFIG.inputFx) return;
    const els = document.querySelectorAll(".buyable[id]");
    if (!els.length) return;

    els.forEach((el) => {
      const parts = el.id.split("-"); // ["buyable", layer, id]
      if (parts.length < 3) return;
      const layer = parts[1];
      const bid = parts.slice(2).join("-");
      let lvl;
      try {
        const pl = typeof player !== "undefined" ? player : null;
        const obj = pl && pl[layer] && pl[layer].buyables;
        if (!obj || obj[bid] === undefined) return;
        lvl = String(obj[bid]);
      } catch (e) {
        return; // player 还没准备好
      }
      const prev = buyableLevel.get(el);
      buyableLevel.set(el, lvl);
      if (prev === undefined || prev === lvl) return; // 首次见到 / 没变化

      // 等级上升才播（下降可能是重置/卖出，不播）
      const rose = (() => {
        try {
          const pl = player[layer].buyables[bid];
          return pl.gt(prev); // Decimal.gt 能比较字符串形式
        } catch (e) {
          return Number(lvl) > Number(prev);
        }
      })();
      if (!rose) return;

      const now = performance.now();
      const last = lastBuyableFx.get(el) || 0;
      if (now - last < BUYABLE_MIN_GAP) return; // 连点限流，避免动画被打断重放
      lastBuyableFx.set(el, now);

      pulseOnce(el, "ds-lvlup", 330);

      // 刚好买到上限：额外给一次强调（元素此时已带 .bought）
      if (el.classList.contains("bought")) {
        pulseOnce(el, "ds-maxed", 820);
      }
    });
  }

  /* --------------------------------------------------------------------------
     闲置按钮的「偶发闪光」相位错开
     ---------------------------------------------------------------------------
     CSS 让每个按钮每 2.6 秒闪一次，若所有按钮相位一致就会变成集体闪烁。
     这里按元素序号写 inline animation-delay，让光在界面上「游走」。
     只在元素首次出现时写一次，不重复改样式（避免每帧触发样式重算）。
     ----------------------------------------------------------------------- */
  function spreadShimmerPhase() {
    if (!CONFIG.idleShimmer) return;
    const els = document.querySelectorAll(
      ".upg:not(.ds-phase), .buyable:not(.ds-phase), .tile:not(.ds-phase)"
    );
    const total = els.length || 1;
    els.forEach((el, i) => {
      el.classList.add("ds-phase");
      // 均匀铺满整个周期；元素多时自然形成连续流动
      const delay = -(i / total) * 2.6 * 2;
      el.style.setProperty("--ds-idle-delay", delay.toFixed(3) + "s");
    });

    // 低频按钮（导航标签、树节点）：数量少，可以给更「重」的描边行走效果。
    // 高频格子若也加，一屏上百个旋转光带会非常花，所以只标记低频的。
    if (CONFIG.idleTrace) {
      document
        .querySelectorAll(
          ".tabButton:not(.ds-lowfreq), .treeNode:not(.ds-lowfreq), .treeButton:not(.ds-lowfreq)"
        )
        .forEach((el) => el.classList.add("ds-lowfreq"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* --------------------------------------------------------------------------
     调试接口
     ----------------------------------------------------------------------- */
  window.deepSpaceEffects = {
    /* 验收用的「解锁特效状态机」入口。
       传入一个元素，走的就是真实的判断逻辑；返回物品键表示「这次播了特效」，
       返回 null 表示「没播」。用来验证：
         · 首次见到已购元素 → null（不播，避免进页面满屏闪）
         · 未购 → 已购        → 返回键（播）
         · 已购 → 重置 → 再购 → 仍然返回键（可重复）
       不传参数时返回当前记录表快照，便于观察。 */
    unlockProbe: (el) => {
      if (!el) {
        const snap = {};
        boughtByKey.forEach((v, k) => {
          snap[k] = v;
        });
        return snap;
      }
      return handleBoughtTransition(el);
    },
    get: () =>
      Object.assign({}, CONFIG, {
        qualityScale: qualityScale,
        stars: stars.length,
        ready: ready,
        mode: MODE,
        cssEnabled: MODE === "all" || MODE === "css",
        frameCap: CONFIG.frameCap,
      }),
    // 一键切换整层的运行模式（含 CSS 部分），带上 URL 参数刷新即可持久生效
    mode: (m) => {
      if (VALID_MODES.indexOf(m) < 0) return "未知模式: " + m;
      MODE = m;
      applyModeToBody(m);
      return m;
    },
    set: (key, value) => {
      if (!(key in CONFIG)) return "未知参数: " + key;
      CONFIG[key] = value;
      if (key === "starDensity" || key === "starMax") buildStars();
      if (key === "maxPixelRatio" || key === "maxPixelRatioHigh" || key === "renderScale") resize();
      // 任何影响极光外观的参数都要让缓存失效
      if (key.indexOf("aurora") === 0) {
        auroraDirty = true;
        // 开关极光层时同步挂载/卸载那张画布
        if (key === "drawAuroraLayer") {
          if (value && !document.body.contains(auroraCv)) {
            document.body.appendChild(auroraCv);
          } else if (!value && document.body.contains(auroraCv)) {
            auroraCv.remove();
          }
        }
      }
      if (key === "cssNebula" || key === "cheapSky" || key === "idleShimmer") {
        applyModeToBody(MODE);
      }
      if (key === "idleShimmer" && value) spreadShimmerPhase();
      return CONFIG[key];
    },
    // 应用性能预设：只动性能与视觉密度相关的参数，不改变整体外观
    preset: (name) => {
      const p = PRESETS[name];
      if (!p) return "可用预设: " + Object.keys(PRESETS).join(" / ");
      Object.keys(p).forEach((k) => {
        CONFIG[k] = p[k];
      });
      auroraDirty = true;
      resize();
      buildStars();
      return name;
    },
    // 手动锁定画质档位（关闭自适应后使用）
    quality: (q) => {
      if (typeof q !== "number") return qualityScale;
      CONFIG.autoQuality = false;
      qualityScale = q;
      buildStars();
      auroraDirty = true;
      return qualityScale;
    },
    setColors: (arr) => {
      if (Array.isArray(arr) && arr.length) {
        AURORA_COLORS.length = 0;
        arr.forEach((c) => AURORA_COLORS.push(c));
      }
      return AURORA_COLORS.slice();
    },
    burst: (x, y) => spawnBurst(x === undefined ? W / 2 : x, y === undefined ? H / 2 : y),
    // 自带绘制耗时统计，不依赖浏览器的 RAF 节流行为
    perf: () => {
      const avg = stats.samples ? stats.sum / stats.samples : 0;
      const drawAvg = stats.drawSamples ? stats.drawSum / stats.drawSamples : 0;
      return {
        frames: stats.samples,
        rafAvgMs: +(avg * 1000).toFixed(2),
        rafMaxMs: +(stats.max * 1000).toFixed(2),
        rafFps: avg > 0 ? +(1 / avg).toFixed(1) : 0,
        drawSamples: stats.drawSamples,
        drawAvgMs: +drawAvg.toFixed(3),
        drawMaxMs: +stats.drawMax.toFixed(3),
        qualityScale: qualityScale,
        scaleIndex: scaleIndex,
        autoQuality: CONFIG.autoQuality,
        frameCap: CONFIG.frameCap,
        renderPixelRatio: dpr,
        auroraPaints: auroraPaints,
        shockwavesTotal: shockwaveTotal,
        shockwavesAlive: shockwaves.length,
        motes: energyMotes.length,
        motesMax: CONFIG.moteMax,
        // 调试用：前几颗微尘的实际坐标，便于验收「是否从填充前沿升起」
        motesDebug: energyMotes.slice(-6).map((m) => ({
          x: Math.round(m.x),
          y: Math.round(m.y),
          life: +m.life.toFixed(2),
        })),
        stars: stars.length,
        // 调试用：冷却条的扫描结果（定位「冷却条没出现」时卡在哪一步）
        cdDebug: cdDebug,
        // 调试用：数值扫描结果
        numDebug: numDebug,
        // 各阶段平均耗时（毫秒/帧）
        phases: Object.keys(stats.phases).reduce((acc, k) => {
          acc[k] = +(stats.phases[k] / Math.max(1, stats.drawSamples)).toFixed(2);
          return acc;
        }, {}),
      };
    },
    perfReset: () => {
      stats.samples = 0;
      stats.sum = 0;
      stats.max = 0;
      stats.windows = 0;
      stats.drawSamples = 0;
      stats.drawSum = 0;
      stats.drawMax = 0;
      stats.phases = {};
    },
    reset: () => {
      scaleIndex = 0;
      qualityScale = 1;
      recoverStreak = 0;
      adaptMark = stats.samples;
      adaptDrawMark = stats.drawSum;
      adaptSum = 0;
      resize();
    },
  };
})();
