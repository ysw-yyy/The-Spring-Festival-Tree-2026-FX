/* ============================================================================
 * 游戏 API（重写版）
 * ----------------------------------------------------------------------------
 * 内容层直接调用的那一批函数：读取器（hasUpgrade / upgradeEffect / …）、
 * 购买与点击、重置与挑战、里程碑/成就、主循环。
 * 语义与上游 utils.js + utils/easyAccess.js + js/game.js 对齐，代码全部重写。
 *
 * 与上游的两处刻意差异：
 *   1) 不再使用 Vue.set，直接给 player 上的字段赋值；
 *   2) 读取器对「还没移植进来的层」容错（返回 false / 中性值），
 *      这样分阶段移植时其它层不会因为引用不存在的层而崩。
 * ========================================================================== */

// ---- 安全取用的内部小工具 -------------------------------------------------
function safeTmp(layer) { return tmp[layer]; }
function layerExists(layer) { return !!layers[layer]; }

// ---- 读取器（easyAccess 同名同语义，但对缺失层容错）----------------------
function hasUpgrade(layer, id) {
  if (!layerExists(layer) || !player[layer] || !tmp[layer]) return false;
  return (player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString()))
    && !tmp[layer].deactivated;
}

function hasMilestone(layer, id) {
  if (!layerExists(layer) || !player[layer] || !tmp[layer]) return false;
  return (player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString()))
    && !tmp[layer].deactivated;
}

function hasAchievement(layer, id) {
  if (!layerExists(layer) || !player[layer] || !tmp[layer]) return false;
  return (player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString()))
    && !tmp[layer].deactivated;
}

function hasChallenge(layer, id) {
  if (!layerExists(layer) || !player[layer] || !tmp[layer]) return false;
  return (player[layer].challenges[id]) && !tmp[layer].deactivated;
}

function maxedChallenge(layer, id) {
  if (!layerExists(layer) || !tmp[layer].challenges[id]) return false;
  return (player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit) && !tmp[layer].deactivated;
}

function challengeCompletions(layer, id) {
  if (!layerExists(layer) || !player[layer]) return 0;
  return player[layer].challenges[id];
}

function getBuyableAmount(layer, id) {
  if (!layerExists(layer) || !player[layer]) return decimalZero;
  return player[layer].buyables[id];
}

function setBuyableAmount(layer, id, amt) {
  player[layer].buyables[id] = amt;
}

function addBuyables(layer, id, amt) {
  player[layer].buyables[id] = player[layer].buyables[id].add(amt);
}

function getClickableState(layer, id) {
  if (!layerExists(layer) || !player[layer]) return undefined;
  return player[layer].clickables[id];
}

function setClickableState(layer, id, state) {
  player[layer].clickables[id] = state;
}

function upgradeEffect(layer, id) {
  const t = tmp[layer];
  if (!t || !t.upgrades || !t.upgrades[id]) return undefined;
  return t.upgrades[id].effect;
}

function challengeEffect(layer, id) {
  const t = tmp[layer];
  if (!t || !t.challenges || !t.challenges[id]) return decimalOne;   // 中性值
  return t.challenges[id].rewardEffect;
}

function buyableEffect(layer, id) {
  const t = tmp[layer];
  if (!t || !t.buyables || !t.buyables[id]) return undefined;
  return t.buyables[id].effect;
}

function clickableEffect(layer, id) {
  const t = tmp[layer];
  if (!t || !t.clickables || !t.clickables[id]) return undefined;
  return t.clickables[id].effect;
}

function achievementEffect(layer, id) {
  const t = tmp[layer];
  if (!t || !t.achievements || !t.achievements[id]) return undefined;
  return t.achievements[id].effect;
}

function gridEffect(layer, id) {
  return gridRun(layer, 'getEffect', player[layer].grid[id], id);
}

function inChallenge(layer, id) {
  if (!layerExists(layer) || !player[layer]) return false;
  const challenge = player[layer].activeChallenge;
  if (!challenge) return false;
  id = toNumber(id);
  if (challenge == id) return true;
  const def = layers[layer].challenges && layers[layer].challenges[challenge];
  if (def && def.countsAs) return def.countsAs.includes(id) || false;
  return false;
}

// ---- 购买 / 点击 ---------------------------------------------------------
function canAffordUpgrade(layer, id) {
  const t = tmp[layer];
  if (!t || t.deactivated) return false;
  const upg = t.upgrades[id];
  if (!upg || upg.canAfford === false) return false;
  const cost = upg.cost;
  if (cost !== undefined) return canAffordPurchase(layer, upg, cost);
  return true;
}

function canBuyBuyable(layer, id) {
  const b = tmp[layer].buyables[id];
  return b.unlocked && run(b.canAfford, b) && player[layer].buyables[id].lt(b.purchaseLimit) && !tmp[layer].deactivated;
}

function canAffordPurchase(layer, thing, cost) {
  if (thing.currencyInternalName) {
    const name = thing.currencyInternalName;
    if (thing.currencyLocation) return !thing.currencyLocation[name].lt(cost);
    if (thing.currencyLayer) return !player[thing.currencyLayer][name].lt(cost);
    return !player[name].lt(cost);
  }
  return !player[layer].points.lt(cost);
}

function buyUpgrade(layer, id) { buyUpg(layer, id); }

function buyUpg(layer, id) {
  const t = tmp[layer];
  if (!t || !t.upgrades || !t.upgrades[id]) return;
  const upg = t.upgrades[id];
  if (!player[layer].unlocked || player[layer].deactivated) return;
  if (!upg.unlocked) return;
  if (player[layer].upgrades.includes(id) || player[layer].upgrades.includes(toNumber(id))) return;
  if (upg.canAfford === false) return;

  const pay = layers[layer].upgrades[id].pay;
  if (pay !== undefined) {
    run(pay, layers[layer].upgrades[id]);
  } else {
    const cost = upg.cost;
    if (upg.currencyInternalName) {
      const name = upg.currencyInternalName;
      if (upg.currencyLocation) {
        if (upg.currencyLocation[name].lt(cost)) return;
        upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost);
      } else if (upg.currencyLayer) {
        const lr = upg.currencyLayer;
        if (player[lr][name].lt(cost)) return;
        player[lr][name] = player[lr][name].sub(cost);
      } else {
        if (player[name].lt(cost)) return;
        player[name] = player[name].sub(cost);
      }
    } else {
      if (player[layer].points.lt(cost)) return;
      player[layer].points = player[layer].points.sub(cost);
    }
  }
  player[layer].upgrades.push(id);
  if (upg.onPurchase != undefined) run(upg.onPurchase, upg);
  needCanvasUpdate = true;
  RT.requestRender();
}

function buyMaxBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canBuy) return;
  if (!layers[layer].buyables[id].buyMax) return;
  run(layers[layer].buyables[id].buyMax, layers[layer].buyables[id]);
  updateBuyableTemp(layer);
  RT.requestRender();
}

function buyBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canBuy) return;
  run(layers[layer].buyables[id].buy, layers[layer].buyables[id]);
  updateBuyableTemp(layer);
  RT.requestRender();
}

function clickClickable(layer, id) {
  if (!player[layer].unlocked || tmp[layer].deactivated) return;
  if (!tmp[layer].clickables[id].unlocked) return;
  if (!tmp[layer].clickables[id].canClick) return;
  run(layers[layer].clickables[id].onClick, layers[layer].clickables[id]);
  updateClickableTemp(layer);
  RT.requestRender();
}

function clickGrid(layer, id) {
  if (!player[layer].unlocked || tmp[layer].deactivated) return;
  if (!run(layers[layer].grid.getUnlocked, layers[layer].grid, id)) return;
  if (!gridRun(layer, 'getCanClick', player[layer].grid[id], id)) return;
  gridRun(layer, 'onClick', player[layer].grid[id], id);
}

function respecBuyables(layer) {
  if (!layers[layer].buyables) return;
  if (!layers[layer].buyables.respec) return;
  if (!player[layer].noRespecConfirm &&
    !confirm(tmp[layer].buyables.respecMessage || 'Are you sure you want to respec? This will force you to do a "' +
      (tmp[layer].name ? tmp[layer].name : layer) + '" reset as well!')) return;
  run(layers[layer].buyables.respec, layers[layer].buyables);
  updateBuyableTemp(layer);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

function toggleAuto(toggle) {
  player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]];
  needCanvasUpdate = true;
}

// ---- 重置收益 / 需求 -----------------------------------------------------
function getResetGain(layer, useType) {
  let type = useType;
  if (!useType) {
    type = tmp[layer].type;
    if (layers[layer].getResetGain !== undefined) return layers[layer].getResetGain();
  }
  if (tmp[layer].type == 'none') return new Decimal(0);
  if (tmp[layer].gainExp.eq(0)) return decimalZero;
  if (type == 'static') {
    if (!tmp[layer].canBuyMax || tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalOne;
    let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1)
      .log(tmp[layer].base).times(tmp[layer].gainExp)
      .pow(Decimal.pow(tmp[layer].exponent, -1));
    gain = gain.times(tmp[layer].directMult);
    return gain.floor().sub(player[layer].points).add(1).max(1);
  } else if (type == 'normal') {
    if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero;
    let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent)
      .times(tmp[layer].gainMult).pow(tmp[layer].gainExp);
    if (gain.gte(tmp[layer].softcap)) {
      gain = gain.pow(tmp[layer].softcapPower).times(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower)));
    }
    gain = gain.times(tmp[layer].directMult);
    return gain.floor().max(0);
  } else if (type == 'custom') {
    return layers[layer].getResetGain();
  }
  return decimalZero;
}

function getNextAt(layer, canMax, useType) {
  if (canMax === undefined) canMax = false;
  let type = useType;
  if (!useType) {
    type = tmp[layer].type;
    if (layers[layer].getNextAt !== undefined) return layers[layer].getNextAt(canMax);
  }
  if (tmp[layer].type == 'none') return new Decimal(Infinity);
  if (tmp[layer].gainMult.lte(0)) return new Decimal(Infinity);
  if (tmp[layer].gainExp.lte(0)) return new Decimal(Infinity);

  if (type == 'static') {
    if (!tmp[layer].canBuyMax) canMax = false;
    const amt = player[layer].points.plus(
      canMax && tmp[layer].baseAmount.gte(tmp[layer].nextAt) ? tmp[layer].resetGain : 0).div(tmp[layer].directMult);
    const extraCost = Decimal.pow(tmp[layer].base, amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult);
    let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires);
    if (tmp[layer].roundUpCost) cost = cost.ceil();
    return cost;
  } else if (type == 'normal') {
    let next = tmp[layer].resetGain.add(1).div(tmp[layer].directMult);
    if (next.gte(tmp[layer].softcap)) {
      next = next.div(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower))).pow(decimalOne.div(tmp[layer].softcapPower));
    }
    next = next.root(tmp[layer].gainExp).div(tmp[layer].gainMult).root(tmp[layer].exponent)
      .times(tmp[layer].requires).max(tmp[layer].requires);
    if (tmp[layer].roundUpCost) next = next.ceil();
    return next;
  } else if (type == 'custom') {
    return layers[layer].getNextAt(canMax);
  }
  return decimalZero;
}

function softcap(value, cap, power) {
  if (power === undefined) power = 0.5;
  if (value.lte(cap)) return value;
  return value.pow(power).times(cap.pow(decimalOne.sub(power)));
}

// 该层是否需要高亮（默认只看升级）
function shouldNotify(layer) {
  for (const id in tmp[layer].upgrades) {
    if (isPlainObject(layers[layer].upgrades[id])) {
      if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked) return true;
    }
  }
  if (player[layer].activeChallenge && canCompleteChallenge(layer, player[layer].activeChallenge)) return true;
  if (tmp[layer].shouldNotify) return true;

  if (isPlainObject(tmp[layer].tabFormat)) {
    for (const subtab in tmp[layer].tabFormat) {
      if (subtabShouldNotify(layer, 'mainTabs', subtab)) {
        tmp[layer].trueGlowColor = tmp[layer].tabFormat[subtab].glowColor || defaultGlow;
        return true;
      }
    }
  }
  for (const family in tmp[layer].microtabs) {
    for (const subtab in tmp[layer].microtabs[family]) {
      if (subtabShouldNotify(layer, family, subtab)) {
        tmp[layer].trueGlowColor = tmp[layer].microtabs[family][subtab].glowColor;
        return true;
      }
    }
  }
  return false;
}

function canReset(layer) {
  if (!layers[layer]) return false;
  if (!tmp[layer]) return false;
  if (layers[layer].canReset !== undefined) return run(layers[layer].canReset, layers[layer]);
  if (tmp[layer].type == 'normal') return tmp[layer].baseAmount.gte(tmp[layer].requires);
  if (tmp[layer].type == 'static') return tmp[layer].baseAmount.gte(tmp[layer].nextAt);
  return false;
}

function layerunlocked(layer) {
  if (tmp[layer] && tmp[layer].type == 'none') return player[layer] && player[layer].unlocked;
  return LAYERS.includes(layer) && player[layer] && (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown));
}

function keepGoing() {
  player.keepGoing = true;
  needCanvasUpdate = true;
}

// ---- 重置 ---------------------------------------------------------------
function rowReset(row, layer) {
  for (const lr in ROW_LAYERS[row]) {
    if (layers[lr].doReset) {
      if (!isNaN(row)) player[lr].activeChallenge = null;   // 行重置会退出挑战
      run(layers[lr].doReset, layers[lr], layer);
    } else if (tmp[layer].row > tmp[lr].row && !isNaN(row)) {
      layerDataReset(lr);
    }
  }
}

function layerDataReset(layer, keep) {
  keep = keep || [];
  const storedData = {
    unlocked: player[layer].unlocked,
    forceTooltip: player[layer].forceTooltip,
    noRespecConfirm: player[layer].noRespecConfirm,
    prevTab: player[layer].prevTab,
  };
  for (const thing in keep) {
    if (player[layer][keep[thing]] !== undefined) storedData[keep[thing]] = player[layer][keep[thing]];
  }

  player[layer].buyables = getStartBuyables(layer);
  player[layer].clickables = getStartClickables(layer);
  player[layer].challenges = getStartChallenges(layer);
  player[layer].grid = getStartGrid(layer);

  layOver(player[layer], getStartLayerData(layer));
  player[layer].upgrades = [];
  player[layer].milestones = [];
  player[layer].achievements = [];

  for (const thing in storedData) player[layer][thing] = storedData[thing];
}

function addPoints(layer, gain) {
  player[layer].points = player[layer].points.add(gain).max(0);
  if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points);
  if (player[layer].total) player[layer].total = player[layer].total.add(gain);
}

function generatePoints(layer, diff) {
  addPoints(layer, tmp[layer].resetGain.times(diff));
}

function doReset(layer, force) {
  force = force === true;
  // 模组专有 hook（默认 null）。音乐游戏树在这里做 `player.e.bestOnce` 的更新；
  // 春节树的 e 层根本没有 bestOnce，照抄会在**任意层重置**时抛 TypeError 并中断整个重置
  //（症状只是"点重置没反应"，极难定位）。见 rg/sf_engine_deltas.md §5。
  if (RT.config.hooks.doResetPre) RT.config.hooks.doResetPre(layer);

  if (tmp[layer].type == 'none') return;
  const row = tmp[layer].row;
  // 音乐游戏树的另一句专有 hack：第 5 行以后的重置顺手点掉判定层的“换主题”可点击。
  if (RT.config.hooks.onRowReset) RT.config.hooks.onRowReset(layer, row);

  if (!force) {
    if (tmp[layer].canReset === false) return;
    if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
    let gain = tmp[layer].resetGain;
    if (tmp[layer].type == 'static') {
      if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
      gain = tmp[layer].canBuyMax ? gain : 1;
    }

    if (layers[layer].onPrestige) run(layers[layer].onPrestige, layers[layer], gain);
    addPoints(layer, gain);
    updateMilestones(layer);
    updateAchievements(layer);

    if (!player[layer].unlocked) {
      player[layer].unlocked = true;
      needCanvasUpdate = true;
      if (tmp[layer].increaseUnlockOrder) {
        const lrs = tmp[layer].increaseUnlockOrder;
        for (const lr in lrs) if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder++;
      }
    }
  }

  if (run(layers[layer].resetsNothing, layers[layer])) return;
  tmp[layer].baseAmount = decimalZero;

  for (const layerResetting in layers) {
    if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChallenge(layerResetting);
  }

  player.points = row == 0 ? decimalZero : getStartPoints();

  for (let x = row; x >= 0; x--) rowReset(x, layer);
  for (const r in OTHER_LAYERS) rowReset(r, layer);

  // G2：RG 用 n(0)（Decimal），SF 用 0（number）—— 决定存档里 resetTime 的序列化形式
  if (RT.config.time.resetTimeIsDecimal) {
    player[layer].resetTime = n(0);
    player[layer].resettime = n(0);
  } else {
    player[layer].resetTime = 0;
    player[layer].resettime = 0;
  }

  updateTemp();
  updateTemp();
}

function resetRow(row) {
  const promptText = (RT.config.ui.strings && RT.config.ui.strings.resetRowPrompt) ||
    ' Type "I WANT TO RESET THIS" to confirm';
  if (prompt(promptText) != 'I WANT TO RESET THIS') return;
  const pre_layers = ROW_LAYERS[row - 1];
  const rowLayers = ROW_LAYERS[row];
  const post_layers = ROW_LAYERS[row + 1];
  rowReset(row + 1, post_layers[0]);
  doReset(pre_layers[0], true);
  for (const layer in rowLayers) {
    player[layer].unlocked = false;
    if (player[layer].unlockOrder) player[layer].unlockOrder = 0;
  }
  player.points = getStartPoints();
  updateTemp();
  resizeCanvas();
}

// ---- 挑战 ---------------------------------------------------------------
function startChallenge(layer, x) {
  let enter = false;
  if (!player[layer].unlocked || !tmp[layer].challenges[x].unlocked) return;
  // M3：两棵树的 startChallenge 写法不同（见 rg/sf_engine_deltas.md G3）：
  //   rg —— 只有"点同一个挑战"才结算；点别的挑战直接覆盖、**不结算**
  //   sf —— 只要当前有挑战就先结算（可能 +1 完成次数），且用 !== null 判定
  if (RT.config.challenge.variant === 'sf') {
    if (player[layer].activeChallenge !== null && player[layer].activeChallenge !== undefined) {
      if (player[layer].activeChallenge != x) enter = true;
      completeChallenge(layer, player[layer].activeChallenge);
      player[layer].activeChallenge = null;
    } else {
      enter = true;
    }
  } else {
    if (player[layer].activeChallenge == x) {
      completeChallenge(layer, x);
      player[layer].activeChallenge = null;
    } else {
      enter = true;
    }
  }
  doReset(layer, true);
  if (enter) {
    player[layer].activeChallenge = x;
    run(layers[layer].challenges[x].onEnter, layers[layer].challenges[x]);
  }
  updateChallengeTemp(layer);
  RT.requestRender();
}

function canCompleteChallenge(layer, x) {
  if (x != player[layer].activeChallenge) return;
  const challenge = tmp[layer].challenges[x];
  if (challenge.canComplete !== undefined) return challenge.canComplete;

  if (challenge.currencyInternalName) {
    const name = challenge.currencyInternalName;
    if (challenge.currencyLocation) return !challenge.currencyLocation[name].lt(challenge.goal);
    if (challenge.currencyLayer) return !player[challenge.currencyLayer][name].lt(challenge.goal);
    return !player[name].lt(challenge.goal);
  }
  return !player.points.lt(challenge.goal);
}

function completeChallenge(layer, x) {
  x = player[layer].activeChallenge;
  if (!x) return;
  const completions = canCompleteChallenge(layer, x);
  if (!completions) {
    player[layer].activeChallenge = null;
    run(layers[layer].challenges[x].onExit, layers[layer].challenges[x]);
    return;
  }
  if (player[layer].challenges[x] < tmp[layer].challenges[x].completionLimit) {
    needCanvasUpdate = true;
    player[layer].challenges[x] += completions;
    player[layer].challenges[x] = Math.min(player[layer].challenges[x], tmp[layer].challenges[x].completionLimit);
    if (layers[layer].challenges[x].onComplete) run(layers[layer].challenges[x].onComplete, layers[layer].challenges[x]);
  }
  player[layer].activeChallenge = null;
  run(layers[layer].challenges[x].onExit, layers[layer].challenges[x]);
  updateChallengeTemp(layer);
}

// ---- 里程碑 / 成就 ------------------------------------------------------
function updateMilestones(layer) {
  if (tmp[layer].deactivated) return;
  for (const id in layers[layer].milestones) {
    const ms = layers[layer].milestones[id];
    if (!isPlainObject(ms)) continue;   // 跳过 rows/cols 之类的非物品键
    if (!hasMilestone(layer, id) && ms.done()) {
      player[layer].milestones.push(id);
      if (ms.onComplete) ms.onComplete();
      if (tmp[layer].milestonePopups || tmp[layer].milestonePopups === undefined) {
        doPopup('milestone', tmp[layer].milestones[id].requirementDescription, 'Milestone Gotten!', 3, tmp[layer].color);
      }
      player[layer].lastMilestone = id;
    }
  }
}

function updateAchievements(layer) {
  if (tmp[layer].deactivated) return;
  for (const id in layers[layer].achievements) {
    if (isPlainObject(layers[layer].achievements[id]) && !hasAchievement(layer, id) && layers[layer].achievements[id].done()) {
      player[layer].achievements.push(id);
      if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete();
      if (tmp[layer].achievementPopups || tmp[layer].achievementPopups === undefined) {
        doPopup('achievement', tmp[layer].achievements[id].name, 'Achievement Gotten!', 3, tmp[layer].color);
      }
    }
  }
}

// ---- 自动购买 / 时间 ----------------------------------------------------
function autobuyUpgrades(layer) {
  if (!tmp[layer].upgrades) return;
  for (const id in tmp[layer].upgrades) {
    if (isPlainObject(tmp[layer].upgrades[id]) &&
      (layers[layer].upgrades[id].canAfford === undefined || layers[layer].upgrades[id].canAfford() === true)) {
      buyUpg(layer, id);
    }
  }
}

function addTime(diff, layer) {
  let data = player;
  let time = data.timePlayed;
  if (layer) {
    data = data[layer];
    time = data.time;
  }
  // M5：数值类型。RG 全程 Decimal；SF 全程原生 number（这直接决定存档里
  // time / timePlayed 的序列化形式，所以不是精度问题而是存档可读性问题）。
  if (RT.config.time.engineNumeric === 'number') {
    if (time + 0 !== time) {           // 上游留的防内存泄漏检查
      console.log('Memory leak detected. Trying to fix...');
      if (isNaN(time) || time == 0) {
        console.log("Couldn't fix! Resetting...");
        time = layer ? player.timePlayed : 0;
        if (!layer) player.timePlayedReset = true;
      }
    }
    time = toNumber(time) + toNumber(diff);
  } else {
    if (time.add(0) !== time) {         // 上游留的防内存泄漏检查
      console.log('Memory leak detected. Trying to fix...');
      if (isNaN(time) || time == n(0)) {
        console.log("Couldn't fix! Resetting...");
        time = layer ? player.timePlayed : n(0);
        if (!layer) player.timePlayedReset = true;
      }
    }
    time = time.add(diff);
  }
  if (layer) data.time = time;
  else data.timePlayed = time;
}

// ---- 提示 / 通知 --------------------------------------------------------
function prestigeNotify(layer) {
  if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify();
  if (isPlainObject(tmp[layer].tabFormat)) {
    for (const subtab in tmp[layer].tabFormat) {
      if (subtabResetNotify(layer, 'mainTabs', subtab)) return true;
    }
  }
  for (const family in tmp[layer].microtabs) {
    for (const subtab in tmp[layer].microtabs[family]) {
      if (subtabResetNotify(layer, family, subtab)) return true;
    }
  }
  if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false;
  if (tmp[layer].type == 'static') return tmp[layer].canReset;
  if (tmp[layer].type == 'normal') return tmp[layer].canReset && tmp[layer].resetGain.gte(player[layer].points.div(10));
  return false;
}

function notifyLayer(name) {
  if (player.tab == name || !layerunlocked(name)) return;
  player.notify[name] = 1;
}

function subtabShouldNotify(layer, family, id) {
  let subtab = {};
  if (family == 'mainTabs') subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];
  if (!subtab) return false;
  if (!subtab.unlocked) return false;
  if (subtab.embedLayer) return tmp[subtab.embedLayer].notify;
  return subtab.shouldNotify;
}

function subtabResetNotify(layer, family, id) {
  let subtab = {};
  if (family == 'mainTabs') subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];
  if (!subtab) return false;
  if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify;
  return subtab.prestigeNotify;
}

function gridRun(layer, func, data, id) {
  const g = layers[layer].grid;
  if (isFunction(g[func])) return g[func].bind(g)(data, id);
  return g[func];
}

// ---- 主循环 -------------------------------------------------------------
function gameLoop(diff) {
  const numberMode = RT.config.time.engineNumeric === 'number';
  if (isEndgame() || tmp.gameEnded) {
    tmp.gameEnded = true;
    clearParticles();
  }
  if (isNaN(diff) || diff < 0) diff = 0;
  if (tmp.gameEnded && !player.keepGoing) {
    diff = 0;
    clearParticles();
  }
  // M4/G6：RG 用 Decimal 算 maxTickLength；SF 用原生 number 比较
  if (maxTickLength) {
    if (numberMode) {
      const limit = maxTickLength();
      if (diff > limit) diff = limit;
    } else {
      const limit = n(maxTickLength());
      if (n(diff).gte(limit)) diff = n(limit);
    }
  }
  addTime(diff);
  player.points = player.points.add(tmp.pointGen.times(diff)).max(0);

  for (let x = 0; x <= maxRow; x++) {
    for (const item in TREE_LAYERS[x]) {
      const layer = TREE_LAYERS[x][item];
      // G6：RG 的 resetTime 是 Decimal（n(x).add(diff)），SF 是原生 number（+= diff）
      player[layer].resetTime = numberMode
        ? toNumber(player[layer].resetTime) + toNumber(diff)
        : n(player[layer].resetTime).add(diff);
      if (tmp[layer].passiveGeneration) {
        generatePoints(layer, numberMode ? n(diff).mul(tmp[layer].passiveGeneration)
          : diff * tmp[layer].passiveGeneration);
      }
      if (layers[layer].update) layers[layer].update(diff);
    }
  }
  for (const row in OTHER_LAYERS) {
    for (const item in OTHER_LAYERS[row]) {
      const layer = OTHER_LAYERS[row][item];
      player[layer].resetTime = numberMode
        ? toNumber(player[layer].resetTime) + toNumber(diff)
        : n(player[layer].resetTime).add(diff);
      if (tmp[layer].passiveGeneration) {
        generatePoints(layer, numberMode ? n(diff).mul(tmp[layer].passiveGeneration)
          : diff * tmp[layer].passiveGeneration);
      }
      if (layers[layer].update) layers[layer].update(diff);
    }
  }
  for (let x = maxRow; x >= 0; x--) {
    for (const item in TREE_LAYERS[x]) {
      const layer = TREE_LAYERS[x][item];
      if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
      if (layers[layer].automate) layers[layer].automate();
      if (tmp[layer].autoUpgrade) autobuyUpgrades(layer);
    }
  }
  for (const row in OTHER_LAYERS) {
    for (const item in OTHER_LAYERS[row]) {
      const layer = OTHER_LAYERS[row][item];
      if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
      if (layers[layer].automate) layers[layer].automate();
      player[layer].best = player[layer].best.max(player[layer].points);
      if (tmp[layer].autoUpgrade) autobuyUpgrades(layer);
    }
  }
  for (const layer in layers) {
    if (layers[layer].milestones) updateMilestones(layer);
    if (layers[layer].achievements) updateAchievements(layer);
  }
}

// 硬重置的"已武装"状态：见下面 hardReset 的注释。
var hardResetArmed = false;
var hardResetTimer = null;

function hardReset(resetOptions) {
  const msg = (RT.config.ui.strings && RT.config.ui.strings.hardResetConfirm) ||
    '你确定要进行硬重置吗？这将删除你的所有进度！';

  // ★ 为什么不能只依赖 confirm()：浏览器允许用户勾选"阻止此页面创建更多对话框"，
  //   一旦勾上，`confirm()` 会**永远返回 false** —— 表现就是"点了硬重置没反应"（用户实报）。
  //   所以这里做成两步确认：先 confirm；如果它被压掉（返回 false），就把按钮"武装"起来，
  //   5 秒内**再点一次**即执行。两条路都能用，且都仍然需要明确的二次动作。
  let ok = false;
  if (hardResetArmed) {
    ok = true;
  } else {
    try { ok = confirm(msg); } catch (e) { ok = false; }
  }
  if (!ok) {
    hardResetArmed = true;
    const el = document.querySelector('[data-act="hardReset"]');
    if (el) el.textContent = '再点一次确认硬重置！';
    RT.warn('硬重置已武装：5 秒内再点一次即执行（浏览器可能拦截了确认对话框）');
    if (hardResetTimer) clearTimeout(hardResetTimer);
    hardResetTimer = setTimeout(function () {
      hardResetArmed = false;
      const e2 = document.querySelector('[data-act="hardReset"]');
      if (e2) e2.textContent = '硬重置';
    }, 5000);
    return;
  }

  // 硬重置：直接把存档抹掉（比"先写再刷新"可靠，异步写入不保证在刷新前落盘）
  try {
    localStorage.removeItem(modInfo.id);
    if (resetOptions) localStorage.removeItem(modInfo.id + '_options');
  } catch (e) { /* 忽略隐私模式等异常 */ }
  // ★ 必须同时**抑制卸载时的自动存档**：否则 reload 触发 beforeunload，
  //   那里会把内存里还在的进度原样写回去 —— 抹掉的键立刻复活，看起来就是"硬重置没用"。
  RT.debug.suppressUnloadSave = true;
  window.location.reload();
}
