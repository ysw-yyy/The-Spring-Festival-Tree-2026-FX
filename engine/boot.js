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
  // 稀有度染色必须紧跟渲染：游戏每拍会重写文本（清掉我包的那层 span），
  // 定时扫描会留下几毫秒的白字；同一帧内补上就看不到无色瞬间。
  if (RT.rarityGlow) RT.rarityGlow.scan();
      // ★ 必须在 vdom 渲染**之后**重绘：这一拍 DOM 已经是新标签的内容，
      //   矩形正确 → 进页面立刻有线、切标签同一帧换新线（不再残留旧线）。
      if (needCanvasUpdate) {
        RT.canvas.draw();
        needCanvasUpdate = false;
      }
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
      // ★ 这里只同步画布尺寸，**不绘制**：此时 DOM 还是上一帧的，
      //   照旧绘制会用旧矩形画线（进页面时不画线、切标签时残留旧线闪一下）。
      //   真正的绘制挪到下面 RT.system.update() 之后。
      if (canvasEl && (canvasEl.width !== window.innerWidth || canvasEl.height !== window.innerHeight)) {
        resizeCanvas();
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
      // ★ 必须在 vdom 渲染**之后**重绘：这一拍 DOM 已经是新标签的内容，
      //   矩形正确 → 进页面立刻有线、切标签同一帧换新线（不再残留旧线）。
      if (needCanvasUpdate) {
        RT.canvas.draw();
        needCanvasUpdate = false;
      }
    } catch (e) {
      RT.error('主循环出错: ' + e.message, e.stack);
    } finally {
      ticking = false;
    }
  }, (RT.config.loop && RT.config.loop.intervalMs) || 50);
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
      // ★ 硬重置时**绝不能**再存一次：hardReset 先抹掉 localStorage 键、再 reload，
      //   而这里会在卸载瞬间把内存里的进度写回去 —— 表现就是"硬重置后存档还在"（用户实报）。
      if (RT.debug && RT.debug.suppressUnloadSave) return;
      try { if (player !== undefined && options.autosave) save(); } catch (e) { /* 忽略 */ }
    });

    await load();
    startMainLoop();
    // M10：数字平滑显示（配置关着时 start() 自己会拒绝）。
    // 支持 URL 覆盖，方便直接在浏览器里对比观感与开销：
    //   ?smooth=0 关  |  ?smooth=1 滚 +1 位小数  |  ?smooth=2 +2 位  |  ?smooth=3 +3 位（默认 0）
    //   ?hz=N      主循环频率（10~120，默认 20）—— 也就是"直接加大刷新率"
    // 实测（真存档，数值钉在 1e18、增长约 5%/s，每组 4s）：
    //   20Hz → 数字可见变化约 21 次/秒；40Hz → 约 42 次/秒；60Hz → 约 50 次/秒（撞上显示粒度墙）
    //   主循环 JS 成本近似**正比于频率**（每 tick 都要 updateTemp + 整页渲染）：
    //   20→60Hz 时 temp.js 约 2~3 倍。所以真要加，40Hz 通常比 60Hz 划算得多。
    try {
      const qs = String((typeof location !== 'undefined' && location.search) || '');
      const q = /[?&]smooth=(\d+)/.exec(qs);
      if (q) {
        const v = parseInt(q[1], 10);
        const cfg = RT.config.ui.smoothNumbers;
        if (v <= 0) cfg.enabled = false;
        else { cfg.enabled = true; cfg.extraDigits = v; }
      }
      const hz = /[?&]hz=(\d+)/.exec(qs);
      if (hz) {
        const v = Math.max(10, Math.min(120, parseInt(hz[1], 10)));
        RT.config.loop.intervalMs = Math.round(1000 / v);
        if (typeof interval !== 'undefined' && interval) { clearInterval(interval); startMainLoop(); }
      }
      RT.smoothNumbers.start();
  // 购买闪光：边沿触发，切页面/重渲染都不会重播
  RT.boughtFlash.start();
  if (RT.fastBars) RT.fastBars.start();
  if (RT.permGlow) RT.permGlow.start();
  if (RT.rarityGlow) RT.rarityGlow.start();
  // 画布是 fixed 的，滚动容器时若不立即重绘，连线会明显滞后
  if (RT.canvas.attachScroll) RT.canvas.attachScroll();
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
