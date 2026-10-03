/* ============================================================================
 * tmp 求值引擎（重写版）
 * ----------------------------------------------------------------------------
 * TMT 的核心机制：层定义里凡是「函数且不在 activeFunctions 白名单里」的属性，
 * 每个 tick 都会被无参调用一次，结果写进同构的 tmp 对象；内容层读 tmp 拿现值。
 * 这套语义必须保真（内容层大量依赖，例如 tmp.a.snEff4、tmp.ch.dragEff）。
 *
 * 与上游的唯一差别：不再用 Vue.set 触发响应式更新，直接赋值即可
 * （自研渲染层每 tick 重画动态区域）。
 * ========================================================================== */

// 这些函数不会被 tmp 每 tick 调用（要么有副作用，要么由渲染层按需调用）
var activeFunctions = [
  'startData', 'onPrestige', 'doReset', 'update', 'automate',
  'buy', 'buyMax', 'respec', 'onPress', 'onClick', 'onHold', 'masterButtonPress',
  'sellOne', 'sellAll', 'pay', 'actualCostFunction', 'actualEffectFunction',
  'effectDescription', 'display', 'fullDisplay', 'effectDisplay', 'rewardDisplay',
  'tabFormat', 'content',
  'onComplete', 'onPurchase', 'onEnter', 'onExit', 'done',
  'getUnlocked', 'getStyle', 'getCanClick', 'getTitle', 'getDisplay', 'getTooltip', 'getEffect',
];

var traversableClasses = [];

function setupTemp() {
  tmp = {};
  tmp.pointGen = new Decimal(1);
  tmp.backgroundStyle = {};
  tmp.displayThings = [];
  tmp.scrolled = 0;
  tmp.gameEnded = false;
  funcs = {};

  setupTempData(layers, tmp, funcs);
  for (const layer in layers) {
    tmp[layer].resetGain = {};
    tmp[layer].nextAt = {};
    tmp[layer].nextAtDisp = {};
    tmp[layer].canReset = {};
    tmp[layer].notify = {};
    tmp[layer].prestigeNotify = {};
    tmp[layer].computedNodeStyle = [];
    setupBuyables(layer);
    tmp[layer].trueGlowColor = [];
  }
  tmp.other = {
    lastPoints: player.points || decimalZero,
    oomps: decimalZero,
    screenWidth: 0,
    screenHeight: 0,
  };
  updateWidth();
  temp = tmp;
}

const boolNames = ['unlocked', 'deactivated'];

// 按层定义建出 tmp（同构）+ funcs（记录哪些键是函数）
function setupTempData(layerData, tmpData, funcsData) {
  for (const item in layerData) {
    const value = layerData[item];
    if (value === null || value === undefined) {
      tmpData[item] = null;
    } else if (value instanceof Decimal) {
      tmpData[item] = value;
    } else if (Array.isArray(value)) {
      tmpData[item] = [];
      funcsData[item] = [];
      setupTempData(value, tmpData[item], funcsData[item]);
    } else if (value.constructor === Object) {
      tmpData[item] = {};
      funcsData[item] = [];
      setupTempData(value, tmpData[item], funcsData[item]);
    } else if (typeof value === 'object' && traversableClasses.includes(value.constructor && value.constructor.name)) {
      tmpData[item] = new value.constructor();
      funcsData[item] = new value.constructor();
    } else if (isFunction(value) && !activeFunctions.includes(item)) {
      funcsData[item] = value;
      tmpData[item] = boolNames.includes(item) ? false : decimalOne;
    } else {
      tmpData[item] = value;
    }
  }
}

// 每 tick 把 funcs 里记下的函数重新求值到 tmp
function updateTempData(layerData, tmpData, funcsData, useThis) {
  for (const item in funcsData) {
    if (Array.isArray(layerData[item])) {
      // tabFormat / content 不进 tmp 自动求值，由 constructTabFormat 负责
      if (item !== 'tabFormat' && item !== 'content') {
        updateTempData(layerData[item], tmpData[item], funcsData[item], useThis);
      }
    } else if ((layerData[item] && layerData[item].constructor === Object) ||
      (typeof layerData[item] === 'object' && layerData[item] && traversableClasses.includes(layerData[item].constructor.name))) {
      updateTempData(layerData[item], tmpData[item], funcsData[item], useThis);
    } else if (isFunction(layerData[item]) && !isFunction(tmpData[item])) {
      let value;
      if (useThis !== undefined) value = layerData[item].bind(useThis)();
      else value = layerData[item]();
      tmpData[item] = value;   // 上游用 Vue.set，这里直接赋值
    }
  }
}

function updateTemp() {
  if (tmp === undefined) setupTemp();

  updateTempData(layers, tmp, funcs);

  for (const layer in layers) {
    tmp[layer].resetGain = getResetGain(layer);
    tmp[layer].nextAt = getNextAt(layer);
    tmp[layer].nextAtDisp = getNextAt(layer, true);
    tmp[layer].canReset = canReset(layer);
    tmp[layer].trueGlowColor = tmp[layer].glowColor;
    tmp[layer].notify = shouldNotify(layer);
    tmp[layer].prestigeNotify = prestigeNotify(layer);
    if (tmp[layer].passiveGeneration === true) tmp[layer].passiveGeneration = 1;
  }

  tmp.pointGen = getPointGen();
  tmp.backgroundStyle = readData(backgroundStyle);

  tmp.displayThings = [];
  for (const thing in displayThings) {
    let text = displayThings[thing];
    if (isFunction(text)) text = text();
    tmp.displayThings.push(text);
  }
}

function updateChallengeTemp(layer) {
  updateTempData(layers[layer].challenges, tmp[layer].challenges, funcs[layer].challenges);
}

function updateBuyableTemp(layer) {
  updateTempData(layers[layer].buyables, tmp[layer].buyables, funcs[layer].buyables);
}

function updateClickableTemp(layer) {
  updateTempData(layers[layer].clickables, tmp[layer].clickables, funcs[layer].clickables);
}

// 把 buyable 的 cost/effect 包一层，让内容层可以用无参写法拿到「当前等级下」的值。
// 必须幂等：上游每次 setupTemp 都会再包一层，而「包装函数调用 actualCostFunction」
// 在第二次包装时会变成自己调自己（栈溢出）。移植版允许重复 setupTemp（例如导入存档），
// 所以这里用标记位保证只包一次。
function setupBuyables(layer) {
  for (const id in layers[layer].buyables) {
    const b = layers[layer].buyables[id];
    if (!isPlainObject(b)) continue;
    if (b.__rtWrapped) continue;
    b.__rtWrapped = true;
    // 只包「确实是函数」的 cost/effect：内容层里有既没写 cost 也没写 effect 的
    // buyable（纯展示/纯按钮），包装它们会让 tmp 求值时调到 undefined。
    if (typeof b.cost === 'function') {
      b.actualCostFunction = b.cost;
      b.cost = function (x) {
        x = x === undefined ? player[this.layer].buyables[this.id] : x;
        return layers[this.layer].buyables[this.id].actualCostFunction(x);
      };
    }
    if (typeof b.effect === 'function') {
      b.actualEffectFunction = b.effect;
      b.effect = function (x) {
        x = x === undefined ? player[this.layer].buyables[this.id] : x;
        return layers[this.layer].buyables[this.id].actualEffectFunction(x);
      };
    }
  }
}
