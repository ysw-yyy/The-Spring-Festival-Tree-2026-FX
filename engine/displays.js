/* ============================================================================
 * 显示层的纯函数（重写版）
 * ----------------------------------------------------------------------------
 * 把层/物品数据算成「文本 + 样式」，供自研渲染层直接使用。不含 DOM 操作，
 * 便于在 Node 里单测。对应上游 technical/displays.js + utils/options.js 的 milestoneShown。
 * ========================================================================== */

// M8：玩家可见文案一律走配置（默认 = 音乐游戏树的中文；春节树覆盖成英文）
function uiStr(key, fallback) {
  const s = (RT.config && RT.config.ui && RT.config.ui.strings) || {};
  const v = s[key];
  return v === undefined || v === null ? fallback : v;
}

function prestigeButtonText(layer) {
  if (layers[layer].prestigeButtonText !== undefined) {
    return run(layers[layer].prestigeButtonText(), layers[layer]);
  }
  const t = tmp[layer];
  if (t.type == 'normal') {
    return (player[layer].points.lt(1e3)
      ? (t.resetDescription !== undefined ? t.resetDescription : uiStr('resetFor', '重置以获得 '))
      : '') +
      `+<b>${formatWhole(t.resetGain)}</b> ${str(t.resource)} ` +
      (t.resetGain.lt(100) && player[layer].points.lt(1e3)
        ? `<br><br>${uiStr('nextNeeds', '下一个需要')} ${t.roundUpCost ? formatWhole(t.nextAt) : format(t.nextAt)} ${str(t.baseResource)}`
        : '');
  }
  if (t.type == 'static') {
    return `${t.resetDescription !== undefined ? t.resetDescription : uiStr('resetForShort', '重置以获得')}+<b>${formatWhole(t.resetGain)}</b> ${str(t.resource)}<br><br>` +
      `${player[layer].points.lt(30) ? (t.baseAmount.gte(t.nextAt) && t.canBuyMax !== undefined && t.canBuyMax ? uiStr('nextAt', '下一个:') : uiStr('reqAt', '需要:')) : ''} ` +
      `${formatWhole(t.baseAmount)} / ${t.roundUpCost ? formatWhole(t.nextAtDisp) : format(t.nextAtDisp)} ${str(t.baseResource)}`;
  }
  if (t.type == 'none') return '';
  // O-2：SF 在这里有一句兜底文案，RG 返回 undefined
  return uiStr('prestigeFallback', undefined);
}

function constructNodeStyle(layer) {
  const style = [];
  if ((tmp[layer].isLayer && layerunlocked(layer)) || (!tmp[layer].isLayer && tmp[layer].canClick)) {
    style.push({ 'background-color': tmp[layer].color });
  }
  if (tmp[layer].image !== undefined) style.push({ 'background-image': 'url("' + tmp[layer].image + '")' });
  if (tmp[layer].notify && player[layer].unlocked) {
    // 几何风不要外发光：用内嵌环代替（高对比、零模糊开销）
    style.push({ 'box-shadow': 'inset 0 0 0 3px ' + tmp[layer].trueGlowColor });
  }
  style.push(tmp[layer].nodeStyle);
  return style;
}

function challengeStyle(layer, id) {
  if (player[layer].activeChallenge == id && canCompleteChallenge(layer, id)) return 'canComplete';
  if (hasChallenge(layer, id)) return 'done';
  return 'locked';
}

function challengeButtonText(layer, id) {
  return player[layer].activeChallenge == id
    ? (canCompleteChallenge(layer, id) ? uiStr('challengeFinish', '完成') : uiStr('challengeExit', '退出'))
    : (hasChallenge(layer, id) ? uiStr('challengeCompleted', '已通过') : uiStr('challengeStart', '开始'));
}

function achievementStyle(layer, id) {
  const ach = tmp[layer].achievements[id];
  const style = [];
  if (ach.image) style.push({ 'background-image': 'url("' + ach.image + '")' });
  if (!ach.unlocked) style.push({ visibility: 'hidden' });
  style.push(ach.style);
  return style;
}

function milestoneShown(layer, id) {
  const complete = player[layer].milestones.includes(id) || player[layer].milestones.includes(toNumber(id));
  const auto = layers[layer].milestones[id].toggles;

  switch (options.msDisplay) {
    case 'always': return true;
    case 'last': return auto || !complete || player[layer].lastMilestone === id;
    case 'automation': return auto || !complete;
    case 'incomplete': return !complete;
    case 'never': return false;
  }
  // ★ 未知/缺失的值一律按"总是显示"处理（原来是 return false）。
  //   options 存在 localStorage 里、和存档分开，所以浏览器里只要残留一个不认识的值，
  //   **整页里程碑会全部消失**，而存档/引擎/内容全都正常 —— 极难排查
  //   （用户实拍报过"里程碑没了"，最后就是这里）。
  return true;
}

function updateWidth() {
  const screenWidth = window.innerWidth;
  const oneTabW = (RT.config.ui && RT.config.ui.oneTabWidth) || 1024;
  const narrow = screenWidth < oneTabW;
  let splitScreen = screenWidth >= 1024;
  if (options.forceOneTab) splitScreen = false;
  if (player.navTab == 'none') splitScreen = true;
  // 窄宽度（低于 oneTabWidth）自动进单标签页：
  // 否则两栏都会渲染，右栏被挤到树的下面，看起来就是点了节点打不开任何界面。
  // oneTabTree 记住树停在哪一层，供返回按钮用；窗口变宽时恢复。
  // 树层 id 的唯一正确来源：内容层的 layoutInfo.startNavTab（SF 是 'tree-tab'）。
  // 之前我用 player.lastSafeTab 去恢复，而它记的是最近打开的非侧栏标签（例如 'p'），
  // 于是左栏display成了那一层的内容、树不见了（用户实拍"左边应是树、右边是其他的"）。
  const treeLayer = (typeof layoutInfo !== 'undefined' && layoutInfo && layoutInfo.startNavTab)
    ? layoutInfo.startNavTab : 'tree-tab';
  // 一次性修正存档里被写脏的 navTab：既不是树层、也不是侧栏层的值都拉回树层。
  if (!tmp.other.navSanitized) {
    tmp.other.navSanitized = true;
    const navOk = player.navTab === 'none' || player.navTab === treeLayer ||
      (tmp[player.navTab] && tmp[player.navTab].leftTab);
    if (!navOk) player.navTab = treeLayer;
  }
  if (!narrow) {
    if (tmp.other.oneTabTree) { player.navTab = tmp.other.oneTabTree; tmp.other.oneTabTree = null; }
    // ★ player.navTab 是**存在存档里**的：窄屏时被自动改成 'none' 之后，游戏一自动存档就固定下来，
    //   于是即使窗口很宽也只剩单栏（用户实报“宽屏双标签没了”）。宽屏下一次性恢复成树。
    //   只做一次，所以之后用户自己用返回按钮进单标签仍然有效。
    else if (!tmp.other.oneTabWideFixed && !options.forceOneTab && player.navTab === 'none' && player.tab !== 'none') {
      tmp.other.oneTabWideFixed = true;
      player.navTab = treeLayer;
    }
  } else if (!tmp.other.oneTabTree && player.navTab !== 'none' && player.tab !== 'none' && !options.forceOneTab) {
    tmp.other.oneTabTree = player.navTab;
    player.navTab = 'none';
  } else if (narrow && !tmp.other.oneTabTree && player.navTab === 'none' && player.tab !== 'none') {
    // 窄屏 + 存档里已经是 navTab='none'（上次单标签被存下来了）：这里补上 oneTabTree，
    // 否则返回按钮与 goBack 都不知道树在哪一层。
    tmp.other.oneTabTree = treeLayer;
  }
  tmp.other.screenWidth = screenWidth;
  tmp.other.screenHeight = window.innerHeight;
  tmp.other.splitScreen = splitScreen;
  tmp.other.lastPoints = player.points;
}

function updateOomps(diff) {
  tmp.other.oompsMag = 0;
  if (player.points.lte(new Decimal(1e100)) || diff == 0) return;

  let pp = new Decimal(player.points);
  let lp = tmp.other.lastPoints || new Decimal(0);
  if (pp.gt(lp)) {
    if (pp.gte('10^^8')) {
      pp = pp.slog(1e10);
      lp = lp.slog(1e10);
      tmp.other.oomps = pp.sub(lp).div(diff);
      tmp.other.oompsMag = -1;
    } else {
      while (pp.div(lp).log(10).div(diff).gte('100') && tmp.other.oompsMag <= 5 && lp.gt(0)) {
        pp = pp.log(10);
        lp = lp.log(10);
        tmp.other.oomps = pp.sub(lp).div(diff);
        tmp.other.oompsMag++;
      }
    }
  }
}

// 进度条的裁剪：返回 {dims, fillDims}
function constructBarStyle(layer, id) {
  const bar = tmp[layer].bars[id];
  const style = {};
  let progress = bar.progress;
  if (progress instanceof Decimal) progress = progress.toNumber();
  progress = (1 - Math.min(Math.max(progress, 0), 1)) * 100;

  style.dims = { width: bar.width + 'px', height: bar.height + 'px' };
  style.fillDims = { width: bar.width + 0.5 + 'px', height: bar.height + 0.5 + 'px' };

  switch (bar.direction) {
    case UP:
      style.fillDims['clip-path'] = 'inset(' + progress + '% 0% 0% 0%)';
      style.fillDims.width = bar.width + 1 + 'px';
      break;
    case DOWN:
      style.fillDims['clip-path'] = 'inset(0% 0% ' + progress + '% 0%)';
      style.fillDims.width = bar.width + 1 + 'px';
      break;
    case RIGHT:
      style.fillDims['clip-path'] = 'inset(0% ' + progress + '% 0% 0%)';
      break;
    case LEFT:
      style.fillDims['clip-path'] = 'inset(0% 0% 0% ' + progress + '%)';
      break;
    default:
      style.fillDims['clip-path'] = 'inset(0% 50% 0% 0%)';
  }
  if (bar.instant) style.fillDims['transition-duration'] = '0s';
  return style;
}
