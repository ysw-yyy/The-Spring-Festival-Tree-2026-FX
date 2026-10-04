/* ============================================================================
 * 树连线（重写版）
 * ----------------------------------------------------------------------------
 * 用 canvas 在节点之间画线：层的 branches、以及升级/可购买/可点击的 branches。
 * 元素 id 约定：层 = <layer>，物品 = <upgrade|buyable|clickable>-<layer>-<id>。
 * 只在需要时重画（needCanvasUpdate / 窗口尺寸变化 / 切换标签），不做无脑定时重绘。
 * ========================================================================== */

var canvas = null;
var ctx = null;

function retrieveCanvasData() {
  const treeCanv = document.getElementById('treeCanvas');
  const treeTab = document.getElementById('treeTab');
  if (!treeCanv) return false;
  canvas = treeCanv;
  ctx = canvas.getContext('2d');
  return true;
}

function resizeCanvas() {
  if (!retrieveCanvasData()) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  branchGradCache.clear();
  drawTree();
}

var branchPhase = 0;
var drawnBranches = 0;
var branchFlowTimer = null;
var lastBranchAt = 0;

// 颜色明暗：主题色多为 #rgb/#rrggbb，其它写法（如 rgba()）原样返回。
function branchShade(color, amt) {
  if (typeof color !== 'string' || color[0] !== '#') return color;
  let h = color.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return color;
  const n = parseInt(h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt > 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
  return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
}

// 沿线段方向的渐变：两端透明、中段实色 —— 让连线两端"虚化"而不是硬切。
// 渐变对象按 (颜色 + 取整后的坐标) 缓存，避免每帧为每条连线重建。
var branchGradCache = new Map();

function branchFade(color) {
  if (typeof color !== 'string') return color;
  var m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(color);
  if (m) return 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',0)';
  var h = /^#([0-9a-fA-F]{6})$/.exec(color);
  if (h) {
    var n = parseInt(h[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',0)';
  }
  return 'rgba(255,255,255,0)';
}

function branchGrad(color, x1, y1, x2, y2) {
  var key = color + '|' + Math.round(x1) + ',' + Math.round(y1) + ',' + Math.round(x2) + ',' + Math.round(y2);
  var g = branchGradCache.get(key);
  if (g) return g;
  g = ctx.createLinearGradient(x1, y1, x2, y2);
  var soft = branchFade(color);
  g.addColorStop(0, soft);
  g.addColorStop(0.16, color);
  g.addColorStop(0.84, color);
  g.addColorStop(1, soft);
  if (branchGradCache.size > 800) branchGradCache.clear();
  branchGradCache.set(key, g);
  return g;
}

// 滚动时立即重绘：画布是 fixed 的，节点在滚动容器里，不重绘就会"线跟着慢半拍"。
var scrollRafPending = false;
function onScrollRedraw() {
  if (scrollRafPending) return;
  scrollRafPending = true;
  var run = function () { scrollRafPending = false; drawTree(); };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  else setTimeout(run, 16);
}

function attachScrollRedraw() {
  if (typeof window === 'undefined' || !window.addEventListener) return;
  // capture: true —— 滚动事件不冒泡（scroll 只在目标元素上触发），必须用捕获阶段才能听到容器滚动
  var opts = { passive: true, capture: true };
  window.addEventListener('scroll', onScrollRedraw, opts);
  document.addEventListener('scroll', onScrollRedraw, opts);
}

function branchFlowOn() {
  const cfg = RT.config.ui || {};
  if (cfg.animateBranches === false) return false;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

function branchDashArr() {
  const d = (RT.config.ui && RT.config.ui.branchDash) || [26, 18];
  return d.slice();
}

// 只在"真有连线被画出来 + 动画开着 + 页面可见"时循环，且按 branchFlowFps 限帧。
// 整屏画布每次重绘都要重新合成，所以这里刻意不用 60fps。
function startBranchFlow() {
  if (!branchFlowOn()) return;
  if (branchFlowTimer !== null) return;
  const fps = (RT.config.ui && RT.config.ui.branchFlowFps) || 30;
  const interval = 1000 / fps;
  const speed = (RT.config.ui && RT.config.ui.branchDashSpeed) || 1.2;
  const dash = branchDashArr();
  const period = dash[0] + dash[1];
  branchFlowTimer = setInterval(function () {
    if (document.hidden) return;
    const now = performance.now();
    if (now - lastBranchAt < interval - 2) return;
    lastBranchAt = now;
    branchPhase = (branchPhase + speed) % period;
    drawTree();
  }, Math.max(16, Math.round(interval)));
}

function stopBranchFlow() {
  if (branchFlowTimer !== null) { clearInterval(branchFlowTimer); branchFlowTimer = null; }
}

function drawTree() {
  if (!retrieveCanvasData()) return;
  drawnBranches = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const layer in layers) {
    if (!tmp[layer]) continue;
    if (tmp[layer].layerShown == true && tmp[layer].branches) {
      for (const branch in tmp[layer].branches) drawTreeBranch(layer, tmp[layer].branches[branch]);
    }
    drawComponentBranches(layer, tmp[layer].upgrades, 'upgrade-');
    drawComponentBranches(layer, tmp[layer].buyables, 'buyable-');
    drawComponentBranches(layer, tmp[layer].clickables, 'clickable-');
  }
  // 画完之后：有连线就启动/保持流动，没有就停掉（没有连线的标签页零成本）
  if (drawnBranches > 0) startBranchFlow(); else stopBranchFlow();
}

function drawComponentBranches(layer, data, prefix) {
  if (!data) return;
  for (const id in data) {
    if (data[id] && data[id].branches) {
      for (const branch in data[id].branches) {
        drawTreeBranch(id, data[id].branches[branch], prefix + layer + '-');
      }
    }
  }
}

function drawTreeBranch(num1, data, prefix) {
  let num2 = data;
  let color_id = 1;
  let width = 15;
  if (Array.isArray(data)) {
    num2 = data[0];
    color_id = data[1];
    width = data[2] || width;
  }
  if (typeof color_id == 'number') color_id = colors_theme[color_id];
  if (prefix) {
    num1 = prefix + num1;
    num2 = prefix + num2;
  }
  const el1 = document.getElementById(num1);
  const el2 = document.getElementById(num2);
  if (!el1 || !el2) return;

  const start = el1.getBoundingClientRect();
  const end = el2.getBoundingClientRect();
  const x1 = start.left + start.width / 2 + window.scrollX;
  const y1 = start.top + start.height / 2 + window.scrollY;
  const x2 = end.left + end.width / 2 + window.scrollX;
  const y2 = end.top + end.height / 2 + window.scrollY;
  const flow = branchFlowOn();
  const ui = RT.config.ui || {};
  // ★ 线很细：宽度不再用内容层给的 15px（那是上游的粗箭头），改用配置值。
  const lw = ui.branchLineWidth || 1.4;
  drawnBranches++;
  const line = function (w, style, dash, offset, glow, glowColor, alpha) {
    ctx.setLineDash(dash || []);
    ctx.lineDashOffset = offset || 0;
    ctx.lineWidth = w;
    ctx.strokeStyle = branchGrad(style, x1, y1, x2, y2);
    ctx.shadowBlur = glow || 0;
    ctx.shadowColor = glowColor || 'transparent';
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
  };
  // ① 底轨：极细的静态暗线 —— "连接"始终可见，关动画时就是它。
  line(lw, flow ? branchShade(color_id, -0.42) : color_id);
  if (flow) {
    // ② 光晕：宽而淡的一层，垫在光芯下面（细线想"看得出来发光"靠它）。
    line(lw * (ui.branchHalo || 3.4), branchShade(color_id, 0.25), branchDashArr(),
      -branchPhase, 0, null, ui.branchHaloAlpha === undefined ? 0.22 : ui.branchHaloAlpha);
    // ③ 光芯：细亮线 + 辉光，沿连线推进。
    line(Math.max(1, lw * 1.6), branchShade(color_id, 0.72), branchDashArr(),
      -branchPhase, ui.branchGlow === undefined ? 11 : ui.branchGlow, branchShade(color_id, 0.45));
  }
}

RT.canvas = {
  resize: resizeCanvas,
  attachScroll: attachScrollRedraw,
  stopFlow: stopBranchFlow,
  draw: drawTree,
  hasCanvas: function () { return !!document.getElementById('treeCanvas'); },
};
