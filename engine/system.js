/* ============================================================================
 * 页面外壳（重写版）
 * ----------------------------------------------------------------------------
 * index.html 里只有一个空容器 #app；这里用自研 vdom 生成整页结构：
 *   顶部资源栏 / 系统按钮 / 侧边层级栏 / 左（树或导航层）/ 右（当前层）/ 背景层 / 弹窗
 * 布局规则与上游 index.html 的 v-if 条件一致。
 * ========================================================================== */

RT.system = (function () {
  const h = RT.vdom.h;
  const text = RT.vdom.text;

  function canGenPointsSafe() {
    try { return typeof canGenPoints === 'function' ? canGenPoints() : true; }
    catch (e) { RT.error('canGenPoints 出错: ' + e.message); return false; }
  }

  // 顶部资源栏
  function overlayHead() {
    const kids = [];
    if (player.devSpeed && player.devSpeed != 1) {
      kids.push(h('span', { class: 'overlayThing' }, [h('br'), text('全局速率: ' + format(player.devSpeed) + 'x'), h('br')]));
    }
    if (player.offTime !== undefined) {
      kids.push(h('span', { class: 'overlayThing' }, [h('br'), text('Offline Time: ' + formatTime(player.offTime.remain)), h('br')]));
    }
    kids.push(h('br'));
    if (player.points.lt('1e1000')) kids.push(h('span', { class: 'overlayThing' }, [text('你有 ')]));
    kids.push(h('h2', { class: 'overlayThing', attrs: { id: 'points', 'data-sm': 'head' } }, [text(format(player.points))]));
    if (player.points.lt('1e1e6')) kids.push(h('span', { class: 'overlayThing' }, [text(' ' + modInfo.pointsName)]));
    kids.push(h('br'));
    if (canGenPointsSafe()) {
      let gen;
      if (tmp.other.oompsMag != 0) {
        gen = format(tmp.other.oomps) + ' OOM' +
          (tmp.other.oompsMag < 0 ? '^OOM' : tmp.other.oompsMag > 1 ? '^' + tmp.other.oompsMag : '') + 's';
      } else {
        gen = formatSmall(getPointGen());
      }
      kids.push(h('span', { class: 'overlayThing' }, [text('(' + gen + '/sec)')]));
    }
    for (const thing of tmp.displayThings) {
      kids.push(h('div', { class: 'overlayThing' }, [thing ? h('span', { html: thing }) : null]));
    }
    return h('div', {
      // 头部：**不写内联 width**（内联会盖过样式表，宽度就交不给 CSS 了）。
      // 它的内容靠 body 的 text-align:center 居中，所以"看起来居中在哪"完全由
      // 这个盒子的宽度与水平位置决定 —— 分屏时要把它限制在左栏（见 layout.css 的
      // body[data-split="1"] .overlayHead），否则它会按整页 90% 排，中心落在
      // 页面中心而不是左栏中心（实测偏右 320px）。
      class: 'overlayThing overlayHead',
      style: { 'padding-bottom': '7px', 'z-index': 1000, position: 'relative' },
    }, kids);
  }

  function sideLayers() {
    const side = OTHER_LAYERS['side'] || [];
    const kids = [];
    for (let i = 0; i < side.length; i++) {
      const node = side[i];
      kids.push(h('div', {}, [RT.components.treeNode(node, tmp[node] && tmp[node].symbol, 'small')]));
    }
    return h('div', { class: 'sideLayers' }, kids);
  }

  // 三个系统图标：自绘内联 SVG（不引用任何外部素材）。
  // 用 stroke="currentColor" + fill="none"：换主题时图标跟着文字色走。
  const ICONS = {
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="3.3" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4' +
      'M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M12 10.8v5.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>' +
      '<rect x="11.1" y="6.6" width="1.8" height="2" fill="currentColor"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M13.6 5.6H7.2A2 2 0 0 0 5.2 7.6v9.2a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2v-6.4" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M14.6 4.2h5.2v5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>' +
      '<path d="M19.6 4.4l-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/></svg>',
  };

  function iconBtnEl(tagName, props, glyph) {
    props.class = 'overlayThing iconBtn';
    return h(tagName, props, [h('span', { class: 'iconGlyph', html: glyph })]);
  }

  // 系统按钮（版本号 / 齿轮 / i / 作者链接）
  function overlayButtons() {
    const kids = [];
    kids.push(h('div', {
      class: 'overlayThing', attrs: { id: 'version' },
      data: { act: 'changelog' },
    }, [text(VERSION.withoutName)]));

    // 返回按钮：与上游条件一致
    const navPrev = player.navTab !== 'none' && player[player.navTab] && player[player.navTab].prevTab;
    const tabPrev = player.navTab == 'none' && player.tab !== 'none' && tmp[player.tab] &&
      (tmp[player.tab].row == 'side' || tmp[player.tab].row == 'otherside' || player[player.tab].prevTab);
    if (navPrev || tabPrev) {
      kids.push(h('button', {
        class: 'other-back overlayThing',
        data: { act: 'goBack', layer: player.navTab == 'none' ? player.tab : player.navTab },
      }, [text('←')]));
    }

    if (player.tab != 'options-tab') {
      kids.push(iconBtnEl('button', {
        attrs: { id: 'optionWheel', title: '设置' },
        data: { act: 'showTab', target: 'options-tab' },
      }, ICONS.gear));
    }
    if (player.tab != 'info-tab') {
      kids.push(iconBtnEl('button', {
        attrs: { id: 'info', title: '关于 / 热键' },
        data: { act: 'showTab', target: 'info-tab' },
      }, ICONS.info));
    }
    // 作者链接：图标按钮 + hover 浮出的文字标签（label 必须是 #discord 的直接子元素，
    // CSS 的 `#discord > .link` 就靠这一点；见 layout.css 的注释）
    kids.push(h('a', {
      class: 'overlayThing iconBtn',
      attrs: {
        id: 'discord', href: modInfo.discordLink || '#', target: '_blank', rel: 'noreferrer',
        title: modInfo.discordName || '作者链接',
      },
    }, [
      h('span', { class: 'iconGlyph', html: ICONS.link }),
      h('span', { class: 'link', html: modInfo.discordName || '作者链接' }),
    ]));
    return kids;
  }

  function infoTab() {
    const links = [];
    if (modInfo.discordLink) {
      links.push(h('span', {}, [
        h('a', { class: 'link', attrs: { href: modInfo.discordLink, target: '_blank' } }, [text(modInfo.discordName || '作者链接')]),
        h('br'),
      ]));
    }
    const hotkeyLines = [];
    for (const key in hotkeys) {
      const k = hotkeys[key];
      if (player[k.layer] && player[k.layer].unlocked && tmp[k.layer].hotkeys[k.id].unlocked) {
        hotkeyLines.push(h('br'), text(k.description || key));
      }
    }
    return h('div', {}, [
      h('h2', {}, [text(modInfo.name)]),
      h('br'),
      h('h3', {}, [text(VERSION.withName)]),
      modInfo.author ? h('span', {}, [h('br'), text('Made by ' + modInfo.author)]) : null,
      h('br'),
      text('本版本是「不用 TMT / 不用 Vue」的自研引擎重构版（引擎 ' + RT.engineName + ' ' + RT.version + '）'),
      h('br'),
      text('原版：The Modding Tree 2.6.6.2 模板 + Vue 2 + pako，作者 Acamaeda 等；本作作者 ' + modInfo.author),
      h('br'),
      h('br'),
      h('div', { class: 'link', data: { act: 'showTab', target: 'changelog-tab' } }, [text('Changelog')]),
      h('br'),
      links,
      h('br'),
      h('br'),
      text('游玩时间: ' + formatTime(player.timePlayed)),
      h('br'),
      h('br'),
      h('h3', {}, [text('热键：')]),
      h('br'),
      hotkeyLines,
    ]);
  }

  function optButton(label, act, id) {
    return h('td', {}, [h('button', {
      class: 'opt',
      data: { act: act, id: id || '' },
    }, [text(label)])]);
  }

  function optionsTab() {
    // 每行三个按钮。行的可见性由 RT.config.ui.hideOptionRows 控制
    // （1 起算；默认空 = 全部显示，音乐游戏树不受影响；春节树只留前两行）。
    const rows = [
      [optButton('保存', 'save'),
       optButton('自动保存: ' + (options.autosave ? '是' : '否'), 'toggleOpt', 'autosave'),
       optButton('硬重置', 'hardReset')],
      [optButton('导出存档', 'exportSave'),
       optButton('导入存档', 'importSave'),
       optButton('离线进度: ' + (options.offlineProd ? '开' : '关'), 'toggleOpt', 'offlineProd')],
      [optButton('主题: ' + getThemeName(), 'switchTheme'),
       optButton('显示里程碑: ' + MS_DISPLAYS[MS_SETTINGS.indexOf(options.msDisplay)], 'adjustMSDisp'),
       optButton('高质量树: ' + (options.hqTree ? '开' : '关'), 'toggleOpt', 'hqTree')],
      [optButton('显示完成的挑战: ' + (options.hideChallenges ? '隐藏' : '显示'), 'toggleOpt', 'hideChallenges'),
       optButton('单标签模式: ' + (options.forceOneTab ? '永远' : '自动'), 'toggleOpt', 'forceOneTab'),
       optButton('Shift-Click to Toggle Tooltips: ' + (options.forceTooltips ? 'ON' : 'OFF'), 'toggleOpt', 'forceTooltips')],
    ];
    const hide = (RT.config.ui && RT.config.ui.hideOptionRows) || [];
    const trs = [];
    for (let i = 0; i < rows.length; i++) {
      if (hide.indexOf(i + 1) >= 0) continue;
      trs.push(h('tr', {}, rows[i]));
    }
    return h('table', {}, trs);
  }

  function endgameView() {
    return h('div', { class: 'fullWidth' }, [
      h('br'),
      h('h2', {}, [text(modInfo.name + ' ' + VERSION.withoutName)]),
      h('br'), h('br'),
      h('h3', { html: modInfo.winText }),
      h('br'),
      h('h3', {}, [text('可以前往 gityx.com 和 B站@QqQe308 找到作者！')]),
      h('br'), h('br'),
      player.timePlayedReset ? null : h('div', {}, [text('你用了 ' + formatTime(player.timePlayed) + ' (游戏时间)通关！')]),
      h('br'),
      h('button', { class: 'longUpg can', data: { act: 'hardReset' } }, [text('重新开始(不建议!)')]),
      text('\u00a0\u00a0\u00a0\u00a0'),
      h('button', {
        class: 'longUpg can',
        data: { act: 'keepGoing' },
      }, [text('等待更新(真的会更新吗？)')]),
    ]);
  }

  // ---- 整页 vnode --------------------------------------------------------
  function shellVNode() {
    const ended = tmp.gameEnded && !player.keepGoing;
    const leftLayer = player.navTab === 'none' ? player.tab : player.navTab;
    const rightShown = !ended && player.navTab !== 'none' && player.tab !== 'none';
    const split = rightShown && tmp.other.splitScreen;
    // 把「是否分屏」写到 body 上，供样式使用（CSS 不能从 #treeTab 往后选，
    // 因为 #overlayHead 在它**前面**）。分屏时头部只应覆盖左栏 —— 原版就是这样：
    // 实测原版头部 40..752，正好落在左栏 0..792 内；不处理的话头部按整页 100% 排，
    // 内容中心落在页面中心，看起来就是"航迹偏右"。
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.split = split ? '1' : '0';
    }

    const kids = [];
    if (!ended) kids.push(h('canvas', { class: 'canvas', attrs: { id: 'treeCanvas' } }));

    if (ended) {
      kids.push(endgameView());
    } else {
      kids.push(h('div', {
        class: 'treeOverlay',
        attrs: { id: 'treeOverlay' },
      }, [h('div', { class: 'overlayThing' }, overlayButtons()), overlayHead(), sideLayers()]));

      kids.push(h('div', {
        class: rightShown ? 'col left' : 'fullWidth',
        attrs: { id: 'treeTab' },
      }, [
        h('br'), h('br'), h('br'), h('br'),
        // 左栏也带上它自己那一层的颜色（层内容根会有，但栏级装饰要用）
        h('div', {
          attrs: { id: 'tabContent' },
          style: { '--layer-color': (tmp[leftLayer] && tmp[leftLayer].color) || 'var(--aur-a)' },
        }, [RT.components.layerTab(leftLayer || 'none')]),
      ]));

      if (rightShown) {
        kids.push(h('div', {
          class: 'col right tab',
          attrs: { id: 'rightTab' },
          style: {},
        }, [h('div', {
          attrs: { id: 'rightContent' },
          style: { '--layer-color': (tmp[player.tab] && tmp[player.tab].color) || 'var(--aur-a)' },
        }, [RT.components.layerTab(player.tab, 'none', '50px')])]));
      }
    }

    kids.push(h('div', { class: 'bg', style: leftLayer && tmp[leftLayer] && tmp[leftLayer].style ? tmp[leftLayer].style : {} }));
    kids.push(h('div', { class: 'bg2', style: tmp.backgroundStyle }));
    kids.push(RT.popups.containerVNode());
    return h('div', { attrs: { id: 'app' }, class: ended ? 'ended' : '' }, kids);
  }

  let container = null;

  function update() {
    if (!container) container = document.getElementById('app');
    if (!container) return;
    try {
      RT.vdom.render(container, shellVNode());
    } catch (e) {
      RT.error('渲染出错: ' + e.message, e.stack);
    }
  }

  return {
    update: update,
    infoTab: infoTab,
    optionsTab: optionsTab,
    overlayHead: overlayHead,
    shellVNode: shellVNode,
  };
})();
