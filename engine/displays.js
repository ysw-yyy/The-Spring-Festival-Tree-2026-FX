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
      `+<b>${formatWhole(t.resetGain)}</b> ${t.resource} ` +
      (t.resetGain.lt(100) && player[layer].points.lt(1e3)
        ? `<br><br>${uiStr('nextNeeds', '下一个需要')} ${t.roundUpCost ? formatWhole(t.nextAt) : format(t.nextAt)} ${t.baseResource}`
        : '');
  }
  if (t.type == 'static') {
    return `${t.resetDescription !== undefined ? t.resetDescription : uiStr('resetForShort', '重置以获得')}+<b>${formatWhole(t.resetGain)}</b> ${t.resource}<br><br>` +
      `${player[layer].points.lt(30) ? (t.baseAmount.gte(t.nextAt) && t.canBuyMax !== undefined && t.canBuyMax ? uiStr('nextAt', '下一个:') : uiStr('reqAt', '需要:')) : ''} ` +
      `${formatWhole(t.baseAmount)} / ${t.roundUpCost ? formatWhole(t.nextAtDisp) : format(t.nextAtDisp)} ${t.baseResource}`;
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
  return false;
}

function updateWidth() {
  const screenWidth = window.innerWidth;
  let splitScreen = screenWidth >= 1024;
  if (options.forceOneTab) splitScreen = false;
  if (player.navTab == 'none') splitScreen = true;
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
