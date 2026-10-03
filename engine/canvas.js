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
  drawnBranches++;
  // ① 底轨：静态暗线 —— 让"连接"始终可见（也保证没动画时仍然是实线）。
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = flow ? branchShade(color_id, -0.45) : color_id;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // ② 光段：亮色 + 柔光，沿连线推进（观感"能量在连接上流动"）。
  if (flow) {
    ctx.setLineDash(branchDashArr());
    ctx.lineDashOffset = -branchPhase;
    ctx.shadowBlur = 12;
    ctx.shadowColor = branchShade(color_id, 0.35);
    ctx.strokeStyle = branchShade(color_id, 0.62);
    ctx.lineWidth = Math.max(2, width * 0.55);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
  }
}

RT.canvas = {
  resize: resizeCanvas,
  stopFlow: stopBranchFlow,
  draw: drawTree,
  hasCanvas: function () { return !!document.getElementById('treeCanvas'); },
};
