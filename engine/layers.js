/* ============================================================================
 * 层级系统（重写版）
 * ----------------------------------------------------------------------------
 * 内容层用 addLayer("s", {...}) / addNode("blank", {...}) 声明层级；这里负责：
 *   - 注册 + 规范化（补默认值、给物品注入 id/layer）
 *   - 生成 LAYERS / ROW_LAYERS / TREE_LAYERS / OTHER_LAYERS（树与左右分栏用它）
 *   - 热键表
 *   - 三个系统页（info / options / changelog）也在这里注册
 * 语义与上游 technical/layerSupport.js 对齐，代码重写。
 * ========================================================================== */

var LAYERS = [];
var ROW_LAYERS = {};
var TREE_LAYERS = [];
var OTHER_LAYERS = {};
var hotkeys = {};
var maxRow = 0;

function layerShown(layer) {
  const t = tmp[layer];
  return t ? t.layerShown : false;
}

function nodeShown(layer) {
  return layerShown(layer);
}

function setRowCol(items) {
  if (items.rows && items.cols) return;
  let rows = 0, cols = 0;
  for (const up in items) {
    if (!isNaN(up)) {
      if (Math.floor(up / 10) > rows) rows = Math.floor(up / 10);
      if (up % 10 > cols) cols = up % 10;
    }
  }
  items.rows = rows;
  items.cols = cols;
}

// 给一类物品统一注入 id/layer/unlocked 等
function prepareItemGroup(layer, group, kind) {
  if (!group) return;
  if (kind === 'buyables' || kind === 'clickables' || kind === 'bars') group.layer = layer;
  // 上游只给 upgrades/achievements/challenges/buyables/clickables 推 rows/cols；
  // milestones / bars / infoboxes 不推（推了就会往物品表里混进 rows/cols 两个数字键）
  if (kind === 'upgrades' || kind === 'achievements' || kind === 'challenges' || kind === 'buyables' || kind === 'clickables') {
    setRowCol(group);
  }
  for (const thing in group) {
    const item = group[thing];
    if (!isPlainObject(item)) continue;
    item.id = thing;
    item.layer = layer;
    if (item.unlocked === undefined) item.unlocked = true;
    if (kind === 'challenges') {
      if (item.completionLimit === undefined) item.completionLimit = 1;
      else if (item.marked === undefined) item.marked = function () { return maxedChallenge(this.layer, this.id); };
    }
    if (kind === 'buyables') {
      item.canBuy = function () { return canBuyBuyable(this.layer, this.id); };
      if (item.purchaseLimit === undefined) item.purchaseLimit = new Decimal(Infinity);
    }
  }
}

function setupLayer(layer) {
  const L = layers[layer];
  L.layer = layer;

  prepareItemGroup(layer, L.upgrades, 'upgrades');
  prepareItemGroup(layer, L.milestones, 'milestones');
  prepareItemGroup(layer, L.achievements, 'achievements');
  prepareItemGroup(layer, L.challenges, 'challenges');
  prepareItemGroup(layer, L.buyables, 'buyables');
  prepareItemGroup(layer, L.clickables, 'clickables');
  prepareItemGroup(layer, L.bars, 'bars');
  prepareItemGroup(layer, L.infoboxes, 'infoboxes');

  if (L.grid) {
    L.grid.layer = layer;
    if (L.grid.getUnlocked === undefined) L.grid.getUnlocked = true;
    if (L.grid.getCanClick === undefined) L.grid.getCanClick = true;
  }
  if (L.startData) {
    const data = L.startData();
    if (data.best !== undefined && L.showBest === undefined) L.showBest = true;
    if (data.total !== undefined && L.showTotal === undefined) L.showTotal = true;
  }

  // ---- 默认值（顺序与上游一致，避免相互影响）----
  if (!L.componentStyles) L.componentStyles = {};
  if (L.symbol === undefined) L.symbol = layer.charAt(0).toUpperCase() + layer.slice(1);
  if (L.unlockOrder === undefined) L.unlockOrder = [];
  if (L.gainMult === undefined) L.gainMult = decimalOne;
  if (L.gainExp === undefined) L.gainExp = decimalOne;
  if (L.directMult === undefined) L.directMult = decimalOne;
  if (L.type === undefined) L.type = 'none';
  if (L.base === undefined || L.base <= 1) L.base = 2;
  if (L.softcap === undefined) L.softcap = new Decimal('e1e7');
  if (L.softcapPower === undefined) L.softcapPower = new Decimal('0.5');
  if (L.displayRow === undefined) L.displayRow = L.row;
  if (L.name === undefined) L.name = layer;
  if (L.layerShown === undefined) L.layerShown = true;
  if (L.glowColor === undefined) L.glowColor = defaultGlow;

  const row = L.row;
  const displayRow = L.displayRow;

  if (!ROW_LAYERS[row]) ROW_LAYERS[row] = {};
  if (!TREE_LAYERS[displayRow] && !isNaN(displayRow)) TREE_LAYERS[displayRow] = [];
  if (!OTHER_LAYERS[displayRow] && isNaN(displayRow)) OTHER_LAYERS[displayRow] = [];

  ROW_LAYERS[row][layer] = layer;
  const position = L.position !== undefined ? L.position : layer;

  if (!isNaN(displayRow) || displayRow < 0) TREE_LAYERS[displayRow].push({ layer: layer, position: position });
  else OTHER_LAYERS[displayRow].push({ layer: layer, position: position });

  if (maxRow < L.displayRow) maxRow = L.displayRow;
}

function updateHotkeys() {
  hotkeys = {};
  for (const layer in layers) {
    const hk = layers[layer].hotkeys;
    if (!hk) continue;
    for (const id in hk) {
      if (!isPlainObject(hk[id])) continue;
      hotkeys[hk[id].key] = hk[id];
      hotkeys[hk[id].key].layer = layer;
      hotkeys[hk[id].key].id = id;
      if (hk[id].unlocked === undefined) hk[id].unlocked = true;
    }
  }
}

function updateLayers() {
  LAYERS = Object.keys(layers);
  ROW_LAYERS = {};
  TREE_LAYERS = {};
  OTHER_LAYERS = {};
  maxRow = 0;
  for (const layer in layers) setupLayer(layer);

  for (const row in OTHER_LAYERS) {
    OTHER_LAYERS[row].sort((a, b) => (a.position > b.position ? 1 : -1));
    for (const i in OTHER_LAYERS[row]) OTHER_LAYERS[row][i] = OTHER_LAYERS[row][i].layer;
  }
  for (const row in TREE_LAYERS) {
    TREE_LAYERS[row].sort((a, b) => (a.position > b.position ? 1 : -1));
    for (const i in TREE_LAYERS[row]) TREE_LAYERS[row][i] = TREE_LAYERS[row][i].layer;
  }
  // 只留下连续的行，供 tree 组件按行渲染
  const dense = [];
  for (let x = 0; x < maxRow + 1; x++) {
    if (TREE_LAYERS[x]) dense.push(TREE_LAYERS[x]);
  }
  TREE_LAYERS = dense;
  updateHotkeys();
}

function addLayer(layerName, layerData, tabLayers) {
  layers[layerName] = layerData;
  layers[layerName].isLayer = true;
  if (tabLayers !== null && tabLayers !== undefined) {
    const format = {};
    for (const id in tabLayers) {
      const layer = tabLayers[id];
      format[layers[layer].name ? layers[layer].name : layer] = {
        embedLayer: layer,
        buttonStyle: function () {
          if (!tmp[this.embedLayer].nodeStyle) return { 'border-color': tmp[this.embedLayer].color };
          const style = tmp[this.embedLayer].nodeStyle;
          if (style['border-color'] === undefined) style['border-color'] = tmp[this.embedLayer].color;
          return style;
        },
        unlocked: function () { return tmp[this.embedLayer].layerShown; },
      };
    }
    layers[layerName].tabFormat = format;
  }
}

// 非层级节点（只出现在树上）
function addNode(layerName, layerData) {
  layers[layerName] = layerData;
  layers[layerName].isLayer = false;
}

function someLayerUnlocked(row) {
  for (const layer in ROW_LAYERS[row]) {
    if (player[layer] && player[layer].unlocked) return true;
  }
  return false;
}

// ---- 三个系统页（与上游 layerSupport.js 末尾一致）------------------------
addLayer('info-tab', { tabFormat: ['info-tab'], row: 'otherside' });
addLayer('options-tab', { tabFormat: ['options-tab'], row: 'otherside' });
addLayer('changelog-tab', {
  tabFormat: function () { return [['raw-html', modInfo.changelog]]; },
  row: 'otherside',
});
