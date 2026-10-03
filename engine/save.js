/* ============================================================================
 * 存档与读档（重写版）
 * ----------------------------------------------------------------------------
 * - 存档键名沿用上游：localStorage[modInfo.id] 与 localStorage[modInfo.id + "_options"]
 *   （modInfo.id = "Rhythm Game"），所以原版的存档能被直接读到，反之亦然。
 * - 写入是**同步**的（engine/codec.js 里自己实现的 stored-deflate），
 *   所以 beforeunload / 硬重置前都能可靠落盘。
 * - 读取是**异步**的（浏览器原生 DecompressionStream），load() 因此返回 Promise，
 *   由 boot() 等待。
 * ========================================================================== */

function startPlayerBase() {
  return {
    tab: layoutInfo.startTab,
    navTab: (readData(layoutInfo.showTree) ? layoutInfo.startNavTab : 'none'),
    time: Date.now(),
    notify: {},
    versionType: modInfo.id,
    version: VERSION.num,
    beta: VERSION.beta,
    timePlayed: 0,
    keepGoing: false,
    hasNaN: false,
    points: modInfo.initialStartPoints,
    subtabs: {},
    lastSafeTab: (readData(layoutInfo.showTree) ? 'none' : layoutInfo.startTab),
  };
}

function getStartLayerData(layer) {
  let layerdata = {};
  if (layers[layer].startData) layerdata = layers[layer].startData();

  if (layerdata.unlocked === undefined) layerdata.unlocked = true;
  if (layerdata.total === undefined) layerdata.total = decimalZero;
  if (layerdata.best === undefined) layerdata.best = decimalZero;
  if (layerdata.resetTime === undefined) layerdata.resetTime = 0;
  if (layerdata.forceTooltip === undefined) layerdata.forceTooltip = false;

  layerdata.buyables = getStartBuyables(layer);
  if (layerdata.noRespecConfirm === undefined) layerdata.noRespecConfirm = false;
  if (layerdata.clickables == undefined) layerdata.clickables = getStartClickables(layer);
  layerdata.spentOnBuyables = decimalZero;
  layerdata.upgrades = [];
  layerdata.milestones = [];
  layerdata.lastMilestone = null;
  layerdata.achievements = [];
  layerdata.challenges = getStartChallenges(layer);
  layerdata.grid = getStartGrid(layer);
  layerdata.prevTab = '';
  return layerdata;
}

function getStartBuyables(layer) {
  const data = {};
  if (layers[layer].buyables) {
    for (const id in layers[layer].buyables) {
      if (isPlainObject(layers[layer].buyables[id])) data[id] = decimalZero;
    }
  }
  return data;
}

function getStartClickables(layer) {
  const data = {};
  if (layers[layer].clickables) {
    for (const id in layers[layer].clickables) {
      if (isPlainObject(layers[layer].clickables[id])) data[id] = '';
    }
  }
  return data;
}

function getStartChallenges(layer) {
  const data = {};
  if (layers[layer].challenges) {
    for (const id in layers[layer].challenges) {
      if (isPlainObject(layers[layer].challenges[id])) data[id] = 0;
    }
  }
  return data;
}

function getStartGrid(layer) {
  const data = {};
  if (!layers[layer].grid) return data;
  if (layers[layer].grid.maxRows === undefined) layers[layer].grid.maxRows = layers[layer].grid.rows;
  if (layers[layer].grid.maxCols === undefined) layers[layer].grid.maxCols = layers[layer].grid.cols;
  for (let y = 1; y <= layers[layer].grid.maxRows; y++) {
    for (let x = 1; x <= layers[layer].grid.maxCols; x++) {
      data[100 * y + x] = layers[layer].grid.getStartData(100 * y + x);
    }
  }
  return data;
}

function getStartPlayer() {
  const playerdata = startPlayerBase();
  if (addedPlayerData !== undefined && typeof addedPlayerData === 'function') {
    const extradata = addedPlayerData();
    for (const thing in extradata) playerdata[thing] = extradata[thing];
  }
  playerdata.infoboxes = {};
  for (const layer in layers) {
    playerdata[layer] = getStartLayerData(layer);
    if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
      playerdata.subtabs[layer] = {};
      playerdata.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0];
    }
    if (layers[layer].microtabs) {
      if (playerdata.subtabs[layer] == undefined) playerdata.subtabs[layer] = {};
      for (const item in layers[layer].microtabs) {
        playerdata.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0];
      }
    }
    if (layers[layer].infoboxes) {
      if (playerdata.infoboxes[layer] == undefined) playerdata.infoboxes[layer] = {};
      for (const item in layers[layer].infoboxes) playerdata.infoboxes[layer][item] = false;
    }
  }
  return playerdata;
}

function fixData(defaultData, newData) {
  for (const item in defaultData) {
    if (defaultData[item] == null) {
      if (newData[item] === undefined) newData[item] = null;
    } else if (Array.isArray(defaultData[item])) {
      if (newData[item] === undefined) newData[item] = defaultData[item];
      else fixData(defaultData[item], newData[item]);
    } else if (defaultData[item] instanceof Decimal) {
      if (newData[item] === undefined) newData[item] = defaultData[item];
      else newData[item] = new Decimal(newData[item]);
    } else if (defaultData[item] && typeof defaultData[item] === 'object') {
      if (newData[item] === undefined || typeof defaultData[item] !== 'object') newData[item] = defaultData[item];
      else fixData(defaultData[item], newData[item]);
    } else {
      if (newData[item] === undefined) newData[item] = defaultData[item];
    }
  }
}

function fixSave() {
  const defaultData = getStartPlayer();
  fixData(defaultData, player);

  for (const layer in layers) {
    if (player[layer].best !== undefined) player[layer].best = new Decimal(player[layer].best);
    if (player[layer].total !== undefined) player[layer].total = new Decimal(player[layer].total);
    if (!player[layer].upgrades) player[layer].upgrades = [];
    if (!player[layer].milestones) player[layer].milestones = [];
    if (!player[layer].achievements) player[layer].achievements = [];

    if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
      if (!player.subtabs[layer]) player.subtabs[layer] = { mainTabs: Object.keys(layers[layer].tabFormat)[0] };
      if (!Object.keys(layers[layer].tabFormat).includes(player.subtabs[layer].mainTabs)) {
        player.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0];
      }
    }
    if (layers[layer].microtabs) {
      if (!player.subtabs[layer]) player.subtabs[layer] = {};
      for (const item in layers[layer].microtabs) {
        if (!Object.keys(layers[layer].microtabs[item]).includes(player.subtabs[layer][item])) {
          player.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0];
        }
      }
    }
  }
}

function NaNcheck(data) {
  for (const item in data) {
    if (data[item] == null) continue;
    else if (Array.isArray(data[item])) NaNcheck(data[item]);
    else if (data[item] !== data[item] || checkDecimalNaN(data[item])) {
      if (!NaNalert) {
        NaNalert = true;
        RT.error('存档里出现 NaN 字段: ' + item);
        alert("Invalid value found in player, named '" + item + "'. You can refresh the page, and you will be un-NaNed.");
        return;
      }
    } else if (data[item] instanceof Decimal) continue;
    else if (data[item].constructor === Object) NaNcheck(data[item]);
  }
}

function fixNaNs() {
  NaNcheck(player);
}

function save(force) {
  if (player === undefined) return;
  if (!force) {
    NaNcheck(player);
    if (NaNalert) return;
  }
  try {
    localStorage.setItem(modInfo.id, formatsave.encode(player));
    localStorage.setItem(modInfo.id + '_options', formatsave.encode(options));
    RT.debug.lastSaveAt = Date.now();
  } catch (e) {
    RT.error('存档写入失败: ' + e.message, e.stack);
  }
}

async function loadOptions() {
  let get = null;
  try { get = localStorage.getItem(modInfo.id + '_options'); } catch (e) { get = null; }
  if (get) {
    try { options = Object.assign(getStartOptions(), await formatsave.decode(get)); }
    catch (e) { RT.error('设置解码失败，改用默认设置: ' + e.message); options = getStartOptions(); }
  } else {
    options = getStartOptions();
  }
  if (themes.indexOf(options.theme) < 0) {
    options.theme = (RT.config.theme && RT.config.theme.default) || 'default';
  }
  fixData(getStartOptions(), options);
}

function setupModInfo() {
  modInfo.changelog = typeof changelog !== 'undefined' ? changelog : '';
  modInfo.winText = typeof winText !== 'undefined' && winText
    ? winText
    : 'Congratulations! You have reached the end and beaten this game, but for now...';
}

function versionCheck() {
  if (player.versionType === undefined || player.version === undefined) {
    player.versionType = modInfo.id;
    player.version = 0;
  }
  if (player.versionType == modInfo.id && VERSION.num > player.version) {
    player.keepGoing = false;
    if (typeof fixOldSave === 'function') fixOldSave(player.version);
  }
  player.versionType = getStartPlayer().versionType;
  player.version = VERSION.num;
  player.beta = VERSION.beta;
}

// 读档：完整流程与上游一致，只是 decode 是异步的
async function load() {
  let get = null;
  try { get = localStorage.getItem(modInfo.id); } catch (e) { get = null; }

  if (get === null || get === undefined) {
    player = getStartPlayer();
    options = getStartOptions();
  } else {
    let decoded = {};
    try {
      decoded = await formatsave.decode(get);
    } catch (e) {
      RT.error('存档解码失败，已按新档启动: ' + e.message, e.stack);
    }
    player = Object.assign(getStartPlayer(), decoded);
    fixSave();
    await loadOptions();
  }

  // 诊断快照：读档刚完成、主循环还没跑之前的状态。
  // 验收脚本靠它判断「存档确实被读进来了」，否则大后期每秒增长会把当前值冲得看不出处。
  RT.debug.loaded = {
    fromStorage: !(get === null || get === undefined),
    points: String(player.points),
    tab: player.tab,
    sUpgrades: player.s && player.s.upgrades ? player.s.upgrades.slice() : null,
    at: Date.now(),
  };

  if (options.offlineProd) {
    if (player.offTime === undefined) player.offTime = { remain: 0 };
    player.offTime.remain += (Date.now() - player.time) / 1000;
  }
  player.time = Date.now();
  versionCheck();
  changeTheme();
  changeTreeQuality();
  updateLayers();
  setupModInfo();

  setupTemp();
  updateTemp();
  updateTemp();
  updateTabFormats();
  document.title = modInfo.name;
  RT.system.update();
  if (RT.canvas.hasCanvas()) resizeCanvas();
}

// ---- 导出 / 导入 --------------------------------------------------------
function exportSave() {
  const str = formatsave.encode(player);
  // 无论复制成功与否都把结果挂到 window 上：
  // 无头环境下 execCommand('copy') 可能**返回 true 但其实没进剪贴板**，
  // 那样只看"失败兜底分支"就取不到字符串（验收脚本会误判成导出失败）。
  window.__lastExportSave = str;
  try {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    if (!ok) throw new Error('execCommand copy 返回 false');
    doPopup('none', '存档已复制到剪贴板（' + str.length + ' 字符）', '导出存档', 3);
  } catch (e) {
    // 复制失败（无头/权限）时把字符串放进弹窗，并暴露到 window 上给自动化取用
    doPopup('none', '无法自动复制，请从控制台取 window.__lastExportSave', '导出存档', 6);
    RT.warn('导出存档复制失败: ' + e.message);
  }
  return str;
}

async function importSave(imported, forced) {
  if (imported === undefined) imported = prompt('Paste your save here');
  if (imported === null || imported === undefined || imported === '') return false;
  try {
    const decoded = await formatsave.decode(String(imported).trim());
    const tempPlr = Object.assign(getStartPlayer(), decoded);
    if (tempPlr.versionType != modInfo.id && !forced &&
      !confirm('This save appears to be for a different mod! Are you sure you want to import?')) return false;
    player = tempPlr;
    player.versionType = modInfo.id;
    fixSave();
    versionCheck();
    save(true);
    window.location.reload();
    return true;
  } catch (e) {
    RT.error('导入存档失败: ' + e.message, e.stack);
    alert('导入存档失败：' + e.message);
    return false;
  }
}

// 自动化验收用：不刷新页面地把存档装进内存（不写 localStorage）
async function importSaveInPlace(imported) {
  const decoded = await formatsave.decode(String(imported).trim());
  player = Object.assign(getStartPlayer(), decoded);
  player.versionType = modInfo.id;
  fixSave();
  versionCheck();
  player.time = Date.now();
  RT.debug.loaded = {
    fromStorage: false, imported: true,
    points: String(player.points),
    tab: player.tab,
    sUpgrades: player.s && player.s.upgrades ? player.s.upgrades.slice() : null,
    at: Date.now(),
  };
  changeTheme();
  updateLayers();
  setupTemp();
  updateTemp();
  updateTemp();
  updateTabFormats();
  RT.system.update();
  if (RT.canvas.hasCanvas()) resizeCanvas();
  return true;
}

function updateTitle() {
  if (typeof gcs === 'function') {
    if (gcs('S', 21)) document.title = modInfo.name;
    if (gcs('S', 22)) document.title = modInfo.name + ' - ' + format(player.points) + ' Notes';
    if (gcs('S', 23) && player.a) document.title = modInfo.name + ' - ' + format(player.a.ptt) + ' PTT';
    if (gcs('S', 24) && player.p) document.title = modInfo.name + ' - ' + format(player.p.rks) + ' RKS';
    if (gcs('S', 25) && player.c) document.title = modInfo.name + ' - ' + format(player.c.power) + ' Cytus力量';
    if (gcs('S', 26) && player.ch) document.title = modInfo.name + ' - ' + format(player.ch.enp) + ' 课题力量';
    if (gcs('S', 27) && player.r) document.title = modInfo.name + ' - ' + format(player.r.notes) + ' 填充Notes';
  }
}
