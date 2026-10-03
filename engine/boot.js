/* ============================================================================
 * 启动与主循环（重写版）
 * ----------------------------------------------------------------------------
 * 上游的主循环在 js/game.js 里（50ms 定时器 + 500ms 无脑重画 canvas）。
 * 这里保留 50ms 的 tick 与各阶段调用顺序，但：
 *   - canvas 只在 needCanvasUpdate / 窗口尺寸变化时重画（不做无脑定时重画）；
 *   - 渲染由自研 vdom 负责，每 tick 只 patch 动态区域。
 * ========================================================================== */

var interval = null;
var saveInterval = null;
var titleInterval = null;

function startMainLoop() {
  interval = setInterval(function () {
    if (player === undefined || tmp === undefined) return;
    if (ticking) return;
    if (tmp.gameEnded && !player.keepGoing) {
      // 通关后停表（但仍保证结算界面渲染过一次）
      if (!RT.debug.endedRendered) {
        RT.debug.endedRendered = true;
        RT.system.update();
      }
      return;
    }
    ticking = true;
    try {
      const now = Date.now();
      const numberMode = RT.config.time.engineNumeric === 'number';
      // M4/M5：RG 全程 Decimal；SF 用原生 number（并把 diff 归一成 number 再传给内容层）
      let diff, trueDiff;
      if (numberMode) {
        diff = (now - player.time) / 1e3;
        trueDiff = diff;
      } else {
        diff = n(now - player.time).div(1e3);
        trueDiff = n(diff);
      }

      if (player.offTime !== undefined) {
        if (numberMode) {
          const limit = modInfo.offlineLimit * 3600;
          if (player.offTime.remain > limit) player.offTime.remain = limit;
          if (player.offTime.remain > 0) {
            const offlineDiff = Math.max(player.offTime.remain / 10, diff);
            player.offTime.remain -= offlineDiff;
            diff += offlineDiff;
          }
        } else {
          if (n(player.offTime.remain).gte(n(modInfo.offlineLimit).mul(3600))) {
            player.offTime.remain = n(modInfo.offlineLimit).mul(3600);
          }
          if (n(player.offTime.remain).gt(0)) {
            const offlineDiff = n(player.offTime.remain).div(10).max(diff);
            player.offTime.remain = n(player.offTime.remain).sub(offlineDiff);
            diff = diff.add(offlineDiff);
          }
        }
        if (!options.offlineProd || player.offTime.remain <= 0) player.offTime = undefined;
      }
      // M6：现实时间字段名 RG='timeplayed' / SF='realTime'（不报错、只会静默丢数据）
      const realField = RT.config.time.realTimeField || 'timeplayed';
      if (player.devSpeed.neq(0)) {
        player[realField] = player[realField] !== undefined && player[realField].add
          ? player[realField].add(diff)
          : toNumber(player[realField] || 0) + toNumber(diff);
      }
      if (player.devSpeed) diff = numberMode ? diff * player.devSpeed : diff.mul(player.devSpeed);
      player.time = now;

      const canvasEl = document.getElementById('treeCanvas');
      if (canvasEl && (canvasEl.width !== window.innerWidth || canvasEl.height !== window.innerHeight)) {
        needCanvasUpdate = true;
      }
      if (needCanvasUpdate) {
        resizeCanvas();
        needCanvasUpdate = false;
      }

      const treeTab = document.getElementById('treeTab');
      tmp.scrolled = !!(treeTab && treeTab.scrollTop > 30);

      updateTemp();
      updateOomps(diff);
      updateWidth();
      updateTabFormats();
      gameLoop(diff);
      fixNaNs();
      adjustPopupTime(trueDiff);
      updateParticles(trueDiff);
      RT.system.update();
    } catch (e) {
      RT.error('主循环出错: ' + e.message, e.stack);
    } finally {
      ticking = false;
    }
  }, 50);
}

function startAuxIntervals() {
  saveInterval = setInterval(function () {
    if (player === undefined) return;
    if (tmp.gameEnded && !player.keepGoing) return;
    if (options.autosave) save();
  }, 5000);

  // M9：标题跟随资源是音乐游戏树专有功能（SF 没有）。没有注册钩子就不起这个定时器。
  const titleHook = RT.config.hooks && RT.config.hooks.updateTitle;
  if (typeof titleHook === 'function') {
    titleInterval = setInterval(function () {
      if (player === undefined) return;
      try { titleHook(); } catch (e) { /* 标题失败不影响游戏 */ }
    }, 1000);
  }
}

RT.boot = async function () {
  const t0 = Date.now();
  try {
    RT.initInputState();
    installHotkeys();
    RT.delegation.install(document.body);

    window.addEventListener('resize', function () {
      resizeCanvas();
      RT.requestRender();
    });
    window.addEventListener('beforeunload', function () {
      try { if (player !== undefined && options.autosave) save(); } catch (e) { /* 忽略 */ }
    });

    await load();
    startMainLoop();
    // M10：数字平滑显示（配置关着时 start() 自己会拒绝）。
    // 支持 URL 覆盖，方便直接在浏览器里对比观感与开销：
    //   ?smooth=0 关  |  ?smooth=1 滚 +1 位小数  |  ?smooth=2 +2 位  |  ?smooth=3 +3 位（默认）
    // 实测（无头 Edge，采样 4s；数值 7.6e20、每秒 +1.26e18）：
    //   关        → 数字每秒变 1.5 次，(program) 4.3%
    //   +3 位小数 → 每秒变 20 次，     (program) 约 11%
    //   其中约 3.9pp 是"每帧重画文本"与**背景漂移**的叠加：把漂移停掉后是 7.6%。
    try {
      const q = /[?&]smooth=(\d+)/.exec(String((typeof location !== 'undefined' && location.search) || ''));
      if (q) {
        const v = parseInt(q[1], 10);
        const cfg = RT.config.ui.smoothNumbers;
        if (v <= 0) cfg.enabled = false;
        else { cfg.enabled = true; cfg.extraDigits = v; }
      }
      RT.smoothNumbers.start();
    } catch (e) { RT.error('启动数字平滑失败: ' + e.message); }
    startAuxIntervals();

    RT.debug.bootedAt = Date.now();
    RT.debug.bootMs = RT.debug.bootedAt - t0;
    RT.system.update();
    if (RT.canvas.hasCanvas()) resizeCanvas();
  } catch (e) {
    RT.error('启动失败: ' + e.message, e.stack);
    const el = document.getElementById('app');
    if (el) {
      el.innerHTML = '<div class="fullWidth"><h2>启动失败</h2><pre style="text-align:left;white-space:pre-wrap">' +
        String(e.stack || e.message).replace(/</g, '&lt;') + '</pre></div>';
    }
  }
};
