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

function drawTree() {
  if (!retrieveCanvasData()) return;
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
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.strokeStyle = color_id;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

RT.canvas = {
  resize: resizeCanvas,
  draw: drawTree,
  hasCanvas: function () { return !!document.getElementById('treeCanvas'); },
};
