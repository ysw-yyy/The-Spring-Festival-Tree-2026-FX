/* ============================================================================
 * 标签页与 tabFormat（重写版）
 * ----------------------------------------------------------------------------
 * - constructTabFormat：把 tabFormat / content 里的函数求值出来。上游会用
 *   `this = {layer, id, family}` 绑定这些函数（这点很怪但内容层依赖），这里保持一致。
 * - showTab / showNavTab / goBack：主标签与导航标签的切换。
 * ========================================================================== */

function constructTabFormat(layer, id, family) {
  let tabTemp, tabLayer, tabFunc, location, key;
  if (id === undefined) {
    tabTemp = tmp[layer].tabFormat;
    tabLayer = layers[layer].tabFormat;
    tabFunc = funcs[layer].tabFormat;
    location = tmp[layer];
    key = 'tabFormat';
  } else if (family === undefined) {
    tabTemp = tmp[layer].tabFormat[id].content;
    tabLayer = layers[layer].tabFormat[id].content;
    tabFunc = funcs[layer].tabFormat[id].content;
    location = tmp[layer].tabFormat[id];
    key = 'content';
  } else {
    tabTemp = tmp[layer].microtabs[family][id].content;
    tabLayer = layers[layer].microtabs[family][id].content;
    tabFunc = funcs[layer].microtabs[family][id].content;
    location = tmp[layer].microtabs[family][id];
    key = 'tabFormat';
  }
  if (isFunction(tabLayer)) return tabLayer.bind(location)();
  updateTempData(tabLayer, tabTemp, tabFunc, { layer: layer, id: id, family: family });
  return tabTemp;
}

function updateTabFormats() {
  updateTabFormat(player.tab);
  updateTabFormat(player.navTab);
}

function updateTabFormat(layer) {
  if (!layers[layer] || layers[layer].tabFormat === undefined) return;

  let tab = player.subtabs[layer] ? player.subtabs[layer].mainTabs : undefined;
  if (isFunction(layers[layer].tabFormat)) {
    temp[layer].tabFormat = layers[layer].tabFormat();
  } else if (Array.isArray(layers[layer].tabFormat)) {
    temp[layer].tabFormat = constructTabFormat(layer);
  } else if (isPlainObject(layers[layer].tabFormat)) {
    if (layers[layer].tabFormat[tab] && layers[layer].tabFormat[tab].embedLayer === undefined) {
      temp[layer].tabFormat[tab].content = constructTabFormat(layer, tab);
    }
  }

  // 嵌入层
  if (isPlainObject(tmp[layer].tabFormat) && tmp[layer].tabFormat[tab] && tmp[layer].tabFormat[tab].embedLayer !== undefined) {
    updateTabFormat(tmp[layer].tabFormat[tab].embedLayer);
  }

  // 微标签
  for (const family in layers[layer].microtabs) {
    tab = player.subtabs[layer][family];
    if (tmp[layer].microtabs[family] && tmp[layer].microtabs[family][tab]) {
      if (tmp[layer].microtabs[family][tab].embedLayer) {
        updateTabFormat(tmp[layer].microtabs[family][tab].embedLayer);
      } else {
        temp[layer].microtabs[family][tab].content = constructTabFormat(layer, tab, family);
      }
    }
  }
}

// ---- 导航 ---------------------------------------------------------------
// 切标签/子标签时重放一次内容入场动效。
// 为什么需要手动来这一下：CSS 动画只在元素**新建**或 animation 属性**变化**时开始，
// 而我们的 vdom 是原地 patch（元素一直存在、class 也不变），所以不动手重置的话
// 入场动画一辈子只播一次。做法是标准的 animation:none → 强制重排 → 清空。
function restartEnterAnim() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('rightContent') || document.getElementById('tabContent');
  if (!el || !el.style) return;
  el.style.animation = 'none';
  void el.offsetWidth;      // 强制重排，浏览器才会接受"动画重新开始"
  el.style.animation = '';
}

function showTab(name, prev) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;
  if (player.tab !== name) clearParticles(function (p) { return p.layer === player.tab; });
  if (tmp[name] && player.tab === name && isPlainObject(tmp[name].tabFormat)) {
    player.subtabs[name].mainTabs = Object.keys(layers[name].tabFormat)[0];
  }
  player.tab = name;
  if (tmp[name] && tmp[name].row !== 'side' && tmp[name].row !== 'otherside') player.lastSafeTab = name;
  updateTabFormats();
  needCanvasUpdate = true;
  RT.requestRender();
  restartEnterAnim();
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

function showNavTab(name, prev) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;
  if (player.navTab !== name) clearParticles(function (p) { return p.layer === player.navTab; });
  if (tmp[name] && tmp[name].previousTab !== undefined) prev = tmp[name].previousTab;
  if (name !== 'none' && prev && (tmp[prev] && tmp[name] ? (!tmp[prev].leftTab == !tmp[name].leftTab) : false)) {
    player[name].prevTab = prev;
  } else if (player[name]) {
    player[name].prevTab = '';
  }
  player.navTab = name;
  updateTabFormats();
  needCanvasUpdate = true;
  RT.requestRender();
  restartEnterAnim();
}

function goBack(layer) {
  // 单标签模式（窄宽度）：返回就是回到树 —— 否则会落到 tab='none'，整屏空白。
  if (tmp.other && tmp.other.oneTabTree && player.navTab === 'none') {
    const tree = tmp.other.oneTabTree;
    showNavTab(tree, layer);
    showTab('none');
    return;
  }
  let nextTab = 'none';
  if (player[layer] && player[layer].prevTab) nextTab = player[layer].prevTab;
  if (player.navTab === 'none' && tmp[layer] && (tmp[layer].row == 'side' || tmp[layer].row == 'otherside')) {
    nextTab = player.lastSafeTab;
  }
  if (tmp[layer] && tmp[layer].leftTab) showNavTab(nextTab, layer);
  else showTab(nextTab, layer);
}

// 切换 mainTabs 微标签
function setSubtab(layer, family, id) {
  if (!player.subtabs[layer]) player.subtabs[layer] = {};
  player.subtabs[layer][family] = id;
  updateTabFormats();
  needCanvasUpdate = true;
  RT.requestRender();
  // 切子标签**不**重放右栏入场动画：只有切层/切导航标签才该有（用户实拍"图1切图2出现不该有的动画"）。
  // restartEnterAnim();
}
