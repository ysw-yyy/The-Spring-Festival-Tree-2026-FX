/* ============================================================================
 * 弹窗与粒子（重写版）
 * ----------------------------------------------------------------------------
 * 弹窗：doPopup 只管入队（内容层调用它），渲染层每 tick 把队列画成 .popup；
 * 淡出用 CSS transition（给即将过期的弹窗加 fade-leave-active/fade-leave-to），
 * 绝不用 animation-fill-mode: both —— 那会把 opacity 钉死导致“瞬间消失”。
 * 粒子：内容层没有用到（16 层里没有 particle 组件），这里只留最小可用实现，
 * 供 gameLoop 里的 clearParticles 调用。
 * ========================================================================== */

var popupTitle = '', popupType = 'default-popup', popupMessage = '', popupTimer = 3;

function doPopup(type, text_, title, timer, color) {
  if (type === undefined) type = 'none';
  if (text_ === undefined) text_ = 'This is a test popup.';
  if (title === undefined) title = '';
  if (timer === undefined) timer = 3;
  if (color === undefined) color = '';
  switch (type) {
    case 'achievement': popupType = 'achievement-popup'; break;
    case 'challenge': popupType = 'challenge-popup'; break;
    default: popupType = 'default-popup'; break;
  }
  popupTitle = title === '' ? (type === 'achievement' ? 'Achievement Unlocked!' : type === 'challenge' ? 'Challenge Complete' : 'Something Happened?') : title;
  popupMessage = text_;
  popupTimer = timer;
  activePopups.push({
    time: popupTimer, maxTime: popupTimer, type: popupType, title: popupTitle,
    message: popupMessage + '\n', id: popupID, color: color,
  });
  popupID++;
  RT.requestRender();
}

function adjustPopupTime(diff) {
  for (let i = activePopups.length - 1; i >= 0; i--) {
    activePopups[i].time -= diff;
    if (activePopups[i].time < 0 && !activePopups[i].leaving) {
      // 交给 CSS 做淡出，等过渡结束后真正移除
      activePopups[i].leaving = true;
      (function (p) {
        setTimeout(function () {
          const idx = activePopups.indexOf(p);
          if (idx >= 0) activePopups.splice(idx, 1);
          RT.requestRender();
        }, 320);
      })(activePopups[i]);
    }
    if (activePopups[i].time < -10) activePopups.splice(i, 1);
  }
}

RT.popups = {
  containerVNode: function () {
    const h = RT.vdom.h;
    const kids = [];
    for (const popup of activePopups) {
      const classes = ['popup', popup.type];
      if (popup.leaving) classes.push('fade-leave-active', 'fade-leave-to');
      kids.push(h('div', {
        // ★ key 必须有：没有它时子节点按**位置**复用，同屏多个弹窗时
        //   新内容会落到旧节点的壳里（出现动画不播、淡出状态也错位）。
        key: popup.id,
        class: classes.join(' '),
        style: popup.color ? { 'background-color': popup.color } : null,
        data: { act: 'closePopup' },
      }, [
        h('h3', { html: popup.title }),
        h('br'),
        h('h2', { html: popup.message }),
      ]));
    }
    return h('div', { class: 'popup-container' }, kids);
  },
};

// 点击弹窗关闭（在委托里被调用；这里给出实现）
RT.closePopup = function (el) {
  const idx = Array.prototype.indexOf.call(el.parentNode.children, el);
  if (idx >= 0 && activePopups[idx]) {
    activePopups.splice(idx, 1);
    RT.requestRender();
  }
};

// ---- 粒子（最小实现；内容层暂未使用）-------------------------------------
var particles = [];

function clearParticles(filter) {
  if (!filter) { particles = []; return; }
  particles = particles.filter((p) => !filter(p));
}

function makeParticle(doThis, data) {
  const particle = Object.assign({
    time: 0, id: particles.length, layer: player.tab, x: mouseX, y: mouseY,
  }, data);
  particles.push(particle);
  if (doThis) doThis(particle);
  return particle;
}

function updateParticles(diff) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.time !== undefined && p.duration !== undefined) {
      p.time += diff;
      if (p.time > p.duration) particles.splice(i, 1);
    }
  }
}

function constructParticleStyle(data) {
  return {
    position: 'absolute', left: (data.x || 0) + 'px', top: (data.y || 0) + 'px',
    opacity: data.opacity === undefined ? 1 : data.opacity,
  };
}
