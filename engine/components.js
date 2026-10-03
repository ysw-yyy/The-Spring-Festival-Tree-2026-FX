/* ============================================================================
 * 组件注册表（重写版）
 * ----------------------------------------------------------------------------
 * 把 tabFormat 里的 ["upgrade", 11] 这类声明编译成 vnode。
 * 上游是 Vue 模板；这里每个组件就是一个普通函数 (layer, data) -> vnode。
 * DOM 结构 / class / id 与上游保持一致，见 docs/ARCHITECTURE.md §6。
 * ========================================================================== */

RT.components = (function () {
  const h = RT.vdom.h;
  const text = RT.vdom.text;

  function cs(layer, name) {   // componentStyles 简写
    return tmp[layer] && tmp[layer].componentStyles ? tmp[layer].componentStyles[name] : undefined;
  }

  function tooltipNode(tip) {
    if (!tip) return null;
    return h('div', { class: 'tooltip', html: tip });
  }

  // ---- 基础展示 ----------------------------------------------------------
  function displayText(layer, data) {
    return h('span', { class: 'instant', html: data });
  }

  function blank(layer, data) {
    if (!data) return h('div', { class: 'instant' }, [h('div', { class: 'instant', style: { width: '8px', height: '17px' } })]);
    if (Array.isArray(data)) return h('div', { class: 'instant' }, [h('div', { class: 'instant', style: { width: data[0], height: data[1] } })]);
    return h('div', { class: 'instant' }, [h('div', { class: 'instant', style: { width: '8px', height: data } }, [h('br')])]);
  }

  function displayImage(layer, data) {
    return h('img', { class: 'instant', attrs: { src: data, alt: data } });
  }

  function hLine(layer, data) {
    return h('hr', { class: 'instant hl', style: data ? { width: data } : null });
  }

  function vLine(layer, data) {
    return h('div', { class: 'instant vl2', style: data ? { height: data } : null });
  }

  // ---- 布局 --------------------------------------------------------------
  function renderComponentItem(layer, item) {
    if (!Array.isArray(item)) {
      return component(layer, item, undefined, cs(layer, item));
    }
    if (item.length === 3) {
      return component(layer, item[0], item[1], [cs(layer, item[0]), item[2] || {}]);
    }
    if (item.length === 2) {
      return component(layer, item[0], item[1], cs(layer, item[0]));
    }
    return component(layer, item[0], undefined, cs(layer, item[0]));
  }

  function rowLike(layer, data, wrapClass) {
    const kids = (data || []).map((item) => renderComponentItem(layer, item));
    return h('div', { class: 'upgTable instant' }, [h('div', { class: wrapClass }, kids)]);
  }

  function row(layer, data) { return rowLike(layer, data, 'upgRow'); }
  function column(layer, data) { return rowLike(layer, data, 'upgCol'); }

  function layerProxy(layer, data) {
    return h('div', {}, [column(data[0], data[1])]);
  }

  function infobox(layer, data) {
    const boxes = tmp[layer].infoboxes;
    if (!boxes || boxes[data] === undefined || !boxes[data].unlocked) return null;
    const box = boxes[data];
    const opened = player.infoboxes[layer] && player.infoboxes[layer][data];
    return h('div', {
      class: 'story instant',
      style: [
        { 'border-color': tmp[layer].color, 'border-radius': opened ? 0 : '8px' },
        box.style,
      ],
    }, [
      h('button', {
        class: 'story-title',
        style: [{ 'background-color': tmp[layer].color }, box.titleStyle],
        data: { act: 'toggleInfobox', layer: layer, id: data },
      }, [
        h('span', { class: 'story-toggle' }, [text(opened ? '+' : '-')]),
        h('span', { html: box.title ? box.title : tmp[layer].name }),
      ]),
      opened ? null : h('div', { class: 'story-text', style: box.bodyStyle }, [
        h('span', { html: box.body ? box.body : 'Blah' }),
      ]),
    ]);
  }

  // ---- 升级 --------------------------------------------------------------
  function upgrade(layer, data) {
    const upg = tmp[layer].upgrades[data];
    if (!upg || !upg.unlocked) return null;
    const bought = hasUpgrade(layer, data);
    const can = canAffordUpgrade(layer, data) && !bought;
    const classes = [layer, 'tooltipBox', 'upg'];
    classes.push(bought ? 'bought' : can ? 'can' : 'locked');
    const content = [];
    if (layers[layer].upgrades[data].fullDisplay) {
      content.push(h('span', { html: run(layers[layer].upgrades[data].fullDisplay, layers[layer].upgrades[data]) }));
    } else {
      if (upg.title) content.push(h('span', {}, [h('h3', { html: upg.title }), h('br')]));
      content.push(h('span', { html: upg.description }));
      if (layers[layer].upgrades[data].effectDisplay) {
        content.push(h('span', {}, [
          h('br'),
          text('当前效果: '),
          h('span', { html: run(layers[layer].upgrades[data].effectDisplay, layers[layer].upgrades[data]) }),
        ]));
      }
      content.push(h('br'));
      content.push(h('br'));
      content.push(text('Cost: ' + formatWhole(upg.cost) + ' ' +
        (upg.currencyDisplayName ? upg.currencyDisplayName : tmp[layer].resource)));
    }
    if (upg.tooltip) content.push(tooltipNode(upg.tooltip));
    return h('button', {
      class: classes,
      attrs: { id: 'upgrade-' + layer + '-' + data },
      style: [(!bought && can) ? { 'background-color': tmp[layer].color } : {}, upg.style],
      data: { act: 'buyUpg', layer: layer, id: String(data) },
    }, content);
  }

  function upgrades(layer, data) {
    if (!tmp[layer].upgrades) return null;
    const rows = data === undefined ? tmp[layer].upgrades.rows : data;
    const rowNodes = [];
    for (let r = 1; r <= rows; r++) {
      const cells = [];
      for (let c = 1; c <= tmp[layer].upgrades.cols; c++) {
        const id = r * 10 + c;
        if (tmp[layer].upgrades[id] !== undefined && tmp[layer].upgrades[id].unlocked) {
          // upgGrid / upgCell 是给样式用的钩子：升级格子做成"等分整行 + 正方形"
          // 必须有类名可选中（不能只靠 .upgAlign，那个类成就/可购买/可点击也在用）。
          cells.push(h('div', { class: 'upgAlign upgCell' }, [upgrade(layer, id)]));
        }
      }
      rowNodes.push(h('div', { class: 'upgRow upgGrid' }, cells));
    }
    return h('div', { class: 'upgTable' }, rowNodes.concat([h('br')]));
  }

  // ---- 里程碑 ------------------------------------------------------------
  function milestone(layer, data) {
    const ms = tmp[layer].milestones[data];
    if (!ms || !milestoneShown(layer, data) || !ms.unlocked) return null;
    const got = hasMilestone(layer, data);
    const content = [
      h('h3', { html: ms.requirementDescription }),
      h('br'),
      h('span', { html: run(layers[layer].milestones[data].effectDescription, layers[layer].milestones[data]) }),
      h('br'),
    ];
    if (ms.tooltip) content.push(tooltipNode(ms.tooltip));
    if (ms.toggles && got) {
      for (const toggle of ms.toggles) {
        content.push(toggleButton(layer, toggle));
        content.push(text('\u00a0'));
      }
    }
    return h('td', {
      class: got ? 'milestoneDone tooltipBox' : 'milestone tooltipBox',
      style: ms.style,
    }, content);
  }

  function toggleButton(layer, data) {
    return h('button', {
      class: 'smallUpg can',
      style: { 'background-color': tmp[data[0]].color },
      data: { act: 'toggleAuto', layer: data[0], id: String(data[1]) },
    }, [text(player[data[0]][data[1]] ? 'ON' : 'OFF')]);
  }

  function milestones(layer, data) {
    if (!tmp[layer].milestones) return null;
    const ids = data === undefined ? Object.keys(tmp[layer].milestones) : data;
    const rows = [];
    for (const id of ids) {
      if (tmp[layer].milestones[id] === undefined || !tmp[layer].milestones[id].unlocked) continue;
      if (!milestoneShown(layer, id)) continue;
      rows.push(h('tr', {}, [milestone(layer, id)]));
    }
    return h('div', {}, [h('table', {}, rows), h('br')]);
  }

  // ---- 挑战 --------------------------------------------------------------
  function challenge(layer, data) {
    const ch = tmp[layer].challenges[data];
    if (!ch || !ch.unlocked) return null;
    if (options.hideChallenges && maxedChallenge(layer, data) && !inChallenge(layer, data)) return null;
    const style = challengeStyle(layer, data);
    const classes = ['challenge', style];
    if (player[layer].activeChallenge === Number(data)) classes.push('resetNotify');
    const body = [];
    body.push(h('br'));
    body.push(h('h3', { html: ch.name }));
    body.push(h('br'));
    body.push(h('br'));
    body.push(h('button', {
      class: 'longUpg can ' + layer,
      style: { 'background-color': tmp[layer].color },
      data: { act: 'startChallenge', layer: layer, id: String(data) },
    }, [text(challengeButtonText(layer, data))]));
    body.push(h('br'));
    body.push(h('br'));
    if (layers[layer].challenges[data].fullDisplay) {
      body.push(h('span', { html: run(layers[layer].challenges[data].fullDisplay, layers[layer].challenges[data]) }));
    } else {
      body.push(h('span', { html: ch.challengeDescription }));
      body.push(h('br'));
      body.push(text('目标:  '));
      if (ch.goalDescription) {
        body.push(h('span', { html: ch.goalDescription }));
      } else {
        body.push(h('span', {}, [text(format(ch.goal) + ' ' + (ch.currencyDisplayName ? ch.currencyDisplayName : modInfo.pointsName))]));
      }
      body.push(h('br'));
      body.push(text('奖励: '));
      body.push(h('span', { html: ch.rewardDescription }));
      body.push(h('br'));
      if (layers[layer].challenges[data].rewardDisplay !== undefined) {
        body.push(h('span', {}, [
          text('当前: '),
          h('span', {
            html: (ch.rewardDisplay)
              ? run(layers[layer].challenges[data].rewardDisplay, layers[layer].challenges[data])
              : format(ch.rewardEffect),
          }),
        ]));
      }
    }
    body.push(nodeMark(layer, ch.marked, 20, 1.5));
    return h('div', { class: classes, style: ch.style }, body);
  }

  function challenges(layer, data) {
    if (!tmp[layer].challenges) return null;
    const rows = data === undefined ? tmp[layer].challenges.rows : data;
    const rowNodes = [];
    for (let r = 1; r <= rows; r++) {
      const cells = [];
      for (let c = 1; c <= tmp[layer].challenges.cols; c++) {
        const id = r * 10 + c;
        if (tmp[layer].challenges[id] !== undefined && tmp[layer].challenges[id].unlocked) {
          cells.push(challenge(layer, id));
        }
      }
      rowNodes.push(h('div', { class: 'upgRow' }, cells));
    }
    return h('div', { class: 'upgTable' }, rowNodes);
  }

  // ---- 可购买 ------------------------------------------------------------
  function buyable(layer, data) {
    const b = tmp[layer].buyables[data];
    if (!b || !b.unlocked) return null;
    const maxed = player[layer].buyables[data].gte(b.purchaseLimit);
    const classes = ['buyable', 'tooltipBox'];
    classes.push(b.canBuy ? 'can' : 'locked');
    if (maxed) classes.push('bought');
    const content = [];
    if (b.title) content.push(h('span', {}, [h('h2', { html: b.title }), h('br')]));
    content.push(h('span', {
      style: { 'white-space': 'pre-line' },
      html: run(layers[layer].buyables[data].display, layers[layer].buyables[data]),
    }));
    content.push(nodeMark(layer, b.marked));
    if (b.tooltip) content.push(tooltipNode(b.tooltip));

    const inner = [];
    inner.push(h('button', {
      class: classes,
      attrs: { id: 'buyable-' + layer + '-' + data },
      style: [b.canBuy ? { 'background-color': tmp[layer].color } : {}, cs(layer, 'buyable'), b.style],
      data: { act: 'buyBuyable', layer: layer, id: String(data) },
    }, content));

    const hasSellOne = b.sellOne !== undefined && !(b.canSellOne !== undefined && b.canSellOne == false);
    const hasSellAll = b.sellAll && !(b.canSellAll !== undefined && b.canSellAll == false);
    if (hasSellOne || hasSellAll) {
      inner.push(h('br'));
      if (hasSellOne) {
        inner.push(h('button', {
          class: 'longUpg can',
          style: cs(layer, 'sell-one'),
          data: { act: 'sellOne', layer: layer, id: String(data) },
        }, [text(tmp[layer].buyables.sellOneText ? tmp[layer].buyables.sellOneText : 'Sell One')]));
      }
      if (hasSellAll) {
        inner.push(h('button', {
          class: 'longUpg can',
          style: cs(layer, 'sell-all'),
          data: { act: 'sellAll', layer: layer, id: String(data) },
        }, [text(tmp[layer].buyables.sellAllText ? tmp[layer].buyables.sellAllText : 'Sell All')]));
      }
    }
    return h('div', { style: { display: 'grid' } }, inner);
  }

  function buyables(layer, data) {
    if (!tmp[layer].buyables) return null;
    const showRespec = tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false);
    const rows = data === undefined ? tmp[layer].buyables.rows : data;
    const rowNodes = [];
    if (showRespec) {
      rowNodes.push(h('div', {}, [
        h('div', { class: 'tooltipBox respecCheckbox' }, [
          h('input', {
            attrs: { type: 'checkbox' },
            data: { act: 'none' },
          }),
          tooltipNode('Disable respec confirmation'),
        ]),
        h('button', {
          class: 'longUpg can',
          style: 'margin-right: 18px',
          data: { act: 'respec', layer: layer },
        }, [text(tmp[layer].buyables.respecText ? tmp[layer].buyables.respecText : 'Respec')]),
      ]));
    }
    for (let r = 1; r <= rows; r++) {
      const cells = [];
      for (let c = 1; c <= tmp[layer].buyables.cols; c++) {
        const id = r * 10 + c;
        if (tmp[layer].buyables[id] !== undefined && tmp[layer].buyables[id].unlocked) {
          cells.push(h('div', {
            class: 'upgAlign',
            style: { 'margin-left': '7px', 'margin-right': '7px', height: data ? data : 'inherit' },
          }, [buyable(layer, id)]));
        }
      }
      rowNodes.push(h('div', { class: 'upgRow' }, cells));
      rowNodes.push(h('br'));
    }
    return h('div', { class: 'upgTable' }, rowNodes);
  }

  // ---- 可点击 ------------------------------------------------------------
  function clickable(layer, data) {
    const cl = tmp[layer].clickables[data];
    if (!cl || !cl.unlocked) return null;
    const classes = ['upg', 'tooltipBox', cl.canClick ? 'can' : 'locked'];
    const content = [];
    if (cl.title) content.push(h('span', {}, [h('h2', { html: cl.title }), h('br')]));
    content.push(h('span', {
      style: { 'white-space': 'pre-line' },
      html: run(layers[layer].clickables[data].display, layers[layer].clickables[data]),
    }));
    content.push(nodeMark(layer, cl.marked));
    if (cl.tooltip) content.push(tooltipNode(cl.tooltip));
    return h('button', {
      class: classes,
      attrs: { id: 'clickable-' + layer + '-' + data },
      style: [cl.canClick ? { 'background-color': tmp[layer].color } : {}, cl.style],
      data: { act: 'clickClickable', layer: layer, id: String(data) },
    }, content);
  }

  function clickables(layer, data) {
    if (!tmp[layer].clickables) return null;
    const showMaster = tmp[layer].clickables.masterButtonPress && !(tmp[layer].clickables.showMasterButton !== undefined && tmp[layer].clickables.showMasterButton == false);
    const rows = data === undefined ? tmp[layer].clickables.rows : data;
    const rowNodes = [];
    if (showMaster) {
      rowNodes.push(h('button', {
        class: 'longUpg can',
        style: [{ 'margin-bottom': '12px' }, cs(layer, 'master-button')],
        data: { act: 'masterButton', layer: layer },
      }, [text(tmp[layer].clickables.masterButtonText ? tmp[layer].clickables.masterButtonText : 'Click me!')]));
    }
    for (let r = 1; r <= rows; r++) {
      const cells = [];
      for (let c = 1; c <= tmp[layer].clickables.cols; c++) {
        const id = r * 10 + c;
        if (tmp[layer].clickables[id] !== undefined && tmp[layer].clickables[id].unlocked) {
          cells.push(h('div', {
            class: 'upgAlign',
            style: { 'margin-left': '7px', 'margin-right': '7px', height: data ? data : 'inherit' },
          }, [clickable(layer, id)]));
        }
      }
      rowNodes.push(h('div', { class: 'upgRow' }, cells));
      rowNodes.push(h('br'));
    }
    return h('div', { class: 'upgTable' }, rowNodes);
  }

  // ---- 成就 --------------------------------------------------------------
  function achievement(layer, data) {
    const ach = tmp[layer].achievements[data];
    if (!ach || !ach.unlocked) return null;
    const got = hasAchievement(layer, data);
    const tip = (ach.tooltip == '') ? false
      : got ? (ach.doneTooltip ? ach.doneTooltip : (ach.tooltip ? ach.tooltip : '你做到了!'))
        : (ach.goalTooltip ? ach.goalTooltip : (ach.tooltip ? ach.tooltip : 'LOCKED'));
    return h('div', {
      class: [layer, 'achievement', 'tooltipBox', got ? 'bought' : 'locked'].join(' '),
      style: achievementStyle(layer, data),
    }, [
      tooltipNode(tip),
      ach.name ? h('span', {}, [h('br'), h('h3', { style: ach.textStyle, html: ach.name }), h('br')]) : null,
    ]);
  }

  function achievements(layer, data) {
    if (!tmp[layer].achievements) return null;
    const rows = data === undefined ? tmp[layer].achievements.rows : data;
    const rowNodes = [];
    for (let r = 1; r <= rows; r++) {
      const cells = [];
      for (let c = 1; c <= tmp[layer].achievements.cols; c++) {
        const id = r * 10 + c;
        if (tmp[layer].achievements[id] !== undefined && tmp[layer].achievements[id].unlocked) {
          cells.push(h('div', { class: 'upgAlign' }, [achievement(layer, id)]));
        }
      }
      rowNodes.push(h('div', { class: 'upgRow' }, cells));
    }
    return h('div', { class: 'upgTable' }, rowNodes.concat([h('br')]));
  }

  // ---- 树 / 节点标记 -----------------------------------------------------
  function treeNode(layer, abb, size, prev) {
    if (!nodeShown(layer)) return null;
    const t = tmp[layer];
    const unlocked = player[layer] && player[layer].unlocked;
    const canClick = t.isLayer ? (unlocked || t.canReset) : t.canClick;
    const classes = [];
    classes.push(t.isLayer ? 'treeNode' : 'treeButton');
    if (size == 'small') classes.push('smallNode');
    classes.push(layer, 'tooltipBox');
    if (player[layer] && player[layer].forceTooltip) classes.push('forceTooltip');
    if (t.layerShown == 'ghost') classes.push('ghost');
    if (!t.layerShown) classes.push('hidden');
    classes.push(canClick ? 'can' : 'locked');
    if (t.notify && unlocked) classes.push('notify');
    if (t.prestigeNotify) classes.push('resetNotify');
    if (canClick) classes.push('can');
    if (!tmp.scrolled) classes.push('front');

    const tooltipText = t.tooltip != '' ? (t.isLayer
      ? (unlocked
        ? (t.tooltip ? t.tooltip : formatWhole(player[layer].points) + ' ' + str(t.resource))
        : (t.tooltipLocked ? t.tooltipLocked : 'Reach ' + formatWhole(t.requires) + ' ' + str(t.baseResource) +
          ' to unlock (You have ' + formatWhole(t.baseAmount) + ' ' + str(t.baseResource) + ')'))
      : (t.canClick ? (t.tooltip ? t.tooltip : 'I am a button!') : (t.tooltipLocked ? t.tooltipLocked : 'I am a button!')))
      : null;

    return h('button', {
      class: classes.join(' '),
      attrs: { id: layer },
      style: constructNodeStyle(layer),
      data: { act: 'treeNode', layer: layer, prev: prev || '' },
    }, [
      h('span', {
        class: 'nodeLabel',
        html: (abb !== '' && abb !== undefined && t.image === undefined) ? abb : '&nbsp;',
      }),
      tooltipText ? tooltipNode(tooltipText) : null,
      nodeMark(layer, t.marked),
    ]);
  }

  function tree(layer, data) {
    const rows = data || TREE_LAYERS;
    const rowNodes = [];
    for (let r = 0; r < rows.length; r++) {
      const cells = [];
      const row = rows[r];
      for (let i = 0; i < row.length; i++) {
        const node = row[i];
        // 注意：**不要**给单元格加内联 width/height。
        // 上游模板写的是 `style = "{width: 0px}"` —— 漏了 v-bind:，浏览器把这串当无效 CSS
        // 忽略掉，所以原版单元格实际没有尺寸约束。照字面实现会真的写上内联 width:0，
        // 后果实测：**同一行的节点会竖排**（h@748,140 / a@748,244），
        // 而原版是并排（h@690,136 / a@810,136）。
        cells.push(h('span', {}, [treeNode(node, tmp[node] ? tmp[node].symbol : node, undefined, layer)]));
      }
      rowNodes.push(h('span', { class: 'upgRow' }, [
        h('table', {}, cells.concat([h('tr', {}, [h('table', {}, [h('button', { class: 'treeNode hidden' })])])])),
      ]));
    }
    return h('div', {}, rowNodes);
  }

  function thingTree(layer, data, type) {
    // O-1：两棵树的 thing-tree（升级树/可购买树/可点击树）布局不同：
    //   RG = table 布局 + 每行补一个隐藏的 treeNode 占位（撑出行高）
    //   SF = div/flex 布局 + 行间距（源码自带注释 //Using DeepSeek，属布局修复）
    // 复刻错变体会导致整片网格错位。
    const flexVariant = RT.config.layout.thingTreeVariant === 'flex';
    const rowNodes = [];
    for (let r = 0; r < (data || []).length; r++) {
      const cells = [];
      for (const id of data[r]) {
        if (tmp[layer][type + 's'][id] === undefined || !tmp[layer][type + 's'][id].unlocked) continue;
        // 同样不要加内联尺寸：RG 的上游模板写的是 `style = "{width: 0px; height: 0px;}"`
        //（漏 v-bind:，被浏览器忽略），SF 的模板则压根没有 style。
        // 照字面写成真内联 0×0 的后果是把单元格压成 0 宽，整片升级树会挤成一坨。
        cells.push(h('span', { class: 'upgAlign' },
          [component(layer, type, id, [cs(layer, type), {}], 'treeThing')]));
      }
      if (flexVariant) {
        rowNodes.push(h('div', {
          class: 'upgRow',
          style: { 'margin-bottom': '50px' },
        }, cells));
      } else {
        rowNodes.push(h('span', { class: 'upgRow' }, [
          h('table', {}, cells.concat([h('tr', {}, [h('table', {}, [h('button', { class: 'treeNode hidden' })])])])),
        ]));
      }
    }
    return h('div', {}, rowNodes);
  }

  function nodeMark(layer, data, offset, scale) {
    if (!data) return null;
    if (offset === undefined) offset = 0;
    if (scale === undefined) scale = 1;
    if (data === true) {
      return h('div', {}, [h('div', {
        class: 'star',
        style: { position: 'absolute', left: (offset - 10) + 'px', top: (offset - 10) + 'px', transform: 'scale(' + scale + ', ' + scale + ')' },
      })]);
    }
    return h('div', {}, [h('img', {
      class: 'mark',
      style: { position: 'absolute', left: (offset - 22) + 'px', top: (offset - 15) + 'px', transform: 'scale(' + scale + ', ' + scale + ')' },
      attrs: { src: data },
    })]);
  }

  // ---- 进度条 ------------------------------------------------------------
  function bar(layer, data) {
    const b = tmp[layer].bars[data];
    if (!b || !b.unlocked) return null;
    const style = constructBarStyle(layer, data);
    // barWrap / barInner 这两个类名是**给样式当钩子**用的：
    // 条的宽度由内容层给定（SF 的能量条是 600px），而块级盒子不会被父级的
    // `text-align: center` 居中 —— 没有类名样式就选不中它，条就会左贴
    //（实测中心比右栏中心偏左 144px）。原生 TMT 的模板里这层是无类的 div，
    // 所以那里也只能左对齐。
    return h('div', { class: 'barWrap', style: { position: 'relative' } }, [
      h('div', { class: 'barInner', style: [b.style, style.dims, { display: 'table' }] }, [
        h('div', { class: 'overlayTextContainer barBorder', style: [b.borderStyle, style.dims] }, [
          h('span', {
            class: 'overlayText',
            style: [b.style, b.textStyle],
            html: run(layers[layer].bars[data].display, layers[layer].bars[data]),
          }),
        ]),
        h('div', { class: 'barBG barBorder', style: [b.style, b.baseStyle, b.borderStyle, style.dims] }, [
          h('div', { class: 'fill', style: [b.style, b.fillStyle, style.fillDims] }),
        ]),
      ]),
    ]);
  }

  // ---- 主显示 / 重置按钮 -------------------------------------------------
  function mainDisplay(layer, data) {
    const t = tmp[layer];
    // 防御：不是所有层都有 points（春节树的 d / t / A 就没有）。上游模板直接
    // `player[layer].points.lt(...)`，遇到这种层整棵渲染树都会抛错。
    const pts = player[layer] ? player[layer].points : undefined;
    const value = data ? format(pts, data)
      : (layer == 'e' && player.e && player.e.points !== undefined ? format(player.e.points)
        : formatWhole(pts === undefined ? 0 : pts));
    return h('div', {}, [
      (pts === undefined || pts.lt('1e1000')) ? h('span', {}, [text('你有 ')]) : null,
      h('h2', { style: { color: 'var(--points)' } }, [text(value)]),
      text(' ' + str(t.resource)),
      layers[layer].effectDescription
        ? h('span', {}, [text(', '), h('span', { html: run(layers[layer].effectDescription, layers[layer]) })])
        : null,
      h('br'),
      h('br'),
    ]);
  }

  function resourceDisplay(layer) {
    const t = tmp[layer];
    const p = player[layer] || {};
    return h('div', { style: { 'margin-top': '-13px' } }, [
      t.baseAmount !== undefined && t.baseAmount !== null
        ? h('span', {}, [h('br'), text('你有 ' + formatWhole(t.baseAmount) + ' ' + str(t.baseResource))])
        : null,
      t.passiveGeneration && t.resetGain
        ? h('span', {}, [h('br'), text('你正在获得 ' + format(t.resetGain.times(t.passiveGeneration)) + ' ' + str(t.resource) + ' 每秒')])
        : null,
      h('br'),
      h('br'),
      (t.showBest && p.best !== undefined)
        ? h('span', {}, [text('你的最佳 ' + str(t.resource) + ' 是 ' + formatWhole(p.best)), h('br')]) : null,
      (t.showTotal && p.total !== undefined)
        ? h('span', {}, [text('你总共有' + formatWhole(p.total) + ' ' + str(t.resource)), h('br')]) : null,
    ]);
  }

  function prestigeButton(layer) {
    if (tmp[layer].type === 'none') return null;
    const can = tmp[layer].canReset;
    return h('button', {
      class: [layer, 'reset', can ? 'can' : 'locked'].join(' '),
      style: [can ? { 'background-color': tmp[layer].color } : {}, cs(layer, 'prestige-button')],
      html: prestigeButtonText(layer),
      data: { act: 'doReset', layer: layer },
    });
  }

  // ---- 微标签 ------------------------------------------------------------
  function tabButtons(layer, data, family) {
    const buttons = [];
    for (const tab in data) {
      const item = data[tab];
      if (!(item.unlocked == undefined || item.unlocked)) continue;
      const notify = subtabShouldNotify(layer, family, tab);
      const resetNotify = subtabResetNotify(layer, family, tab);
      const classes = ['tabButton'];
      if (notify) classes.push('notify');
      if (resetNotify) classes.push('resetNotify');
      buttons.push(h('button', {
        class: classes.join(' '),
        style: [
          { 'border-color': tmp[layer].color },
          notify ? { 'box-shadow': 'inset 0 0 0 2px ' + (data[tab].glowColor || defaultGlow) } : {},
          cs(layer, 'tab-button'),
          data[tab].buttonStyle,
        ],
        data: { act: 'subtab', layer: layer, family: family, id: tab },
      }, [text(tab)]));
    }
    return h('div', { class: 'upgRow' }, buttons);
  }

  function microtabs(layer, data) {
    if (!tmp[layer].microtabs) return null;
    const family = data;
    const current = player.subtabs[layer][family];
    const def = tmp[layer].microtabs[family][current];
    if (!def) return null;
    const body = def.embedLayer
      ? layerTab(def.embedLayer, undefined, undefined, true)
      : column(layer, def.content);
    return h('div', { style: { 'border-style': 'solid' } }, [
      h('div', { class: 'upgTable instant' }, [tabButtons(layer, tmp[layer].microtabs[family], family)]),
      h('div', { style: def.style }, [body]),
    ]);
  }

  // ---- 层标签（默认布局）------------------------------------------------
  function layerTab(layer, back, spacing, embedded) {
    if (!tmp[layer]) return null;
    const t = tmp[layer];
    const mainTabs = (t.tabFormat && !Array.isArray(t.tabFormat)) ? player.subtabs[layer].mainTabs : undefined;
    const subtabStyle = mainTabs && t.tabFormat[mainTabs] ? t.tabFormat[mainTabs].style : null;
    const rootStyle = [t.style ? t.style : {}, subtabStyle];

    const inner = [];
    if (back) {
      inner.push(h('div', {}, [h('button', {
        class: back == 'big' ? 'other-back' : 'back',
        data: { act: 'goBack', layer: layer },
      }, [text('←')])]));
    }

    if (!t.tabFormat) {
      // 默认布局
      if (spacing) inner.push(h('div', { style: { height: spacing } }));
      if (t.infoboxes) {
        const first = Object.keys(t.infoboxes)[0];
        inner.push(infobox(layer, first));
      }
      inner.push(h('div', { style: cs(layer, 'main-display') }, [mainDisplay(layer)]));
      if (t.type !== 'none') inner.push(prestigeButton(layer));
      inner.push(h('div', { style: cs(layer, 'resource-display') }, [resourceDisplay(layer)]));
      inner.push(h('div', { style: cs(layer, 'milestones') }, [milestones(layer)]));
      if (Array.isArray(t.midsection)) inner.push(column(layer, t.midsection));
      inner.push(h('div', { style: cs(layer, 'clickables') }, [clickables(layer)]));
      inner.push(h('div', { style: cs(layer, 'buyables') }, [buyables(layer)]));
      inner.push(h('div', { style: cs(layer, 'upgrades') }, [upgrades(layer)]));
      inner.push(h('div', { style: cs(layer, 'challenges') }, [challenges(layer)]));
      inner.push(h('div', { style: cs(layer, 'achievements') }, [achievements(layer)]));
      inner.push(h('br'));
      inner.push(h('br'));
    } else if (Array.isArray(t.tabFormat)) {
      if (spacing) inner.push(h('div', { style: { height: spacing } }));
      inner.push(column(layer, t.tabFormat));
    } else {
      inner.push(h('div', {
        class: 'upgTable',
        style: { 'padding-top': embedded ? '0' : '25px', 'margin-top': embedded ? '-10px' : '0', 'margin-bottom': '24px' },
      }, [tabButtons(layer, t.tabFormat, 'mainTabs')]));
      const def = t.tabFormat[mainTabs];
      if (def && def.embedLayer) inner.push(layerTab(def.embedLayer, undefined, undefined, true));
      else if (def) inner.push(column(layer, def.content));
    }
    return h('div', { class: 'noBackground', style: rootStyle }, inner);
  }

  // ---- 注册表 ------------------------------------------------------------
  const registry = {
    'display-text': displayText,
    'raw-html': displayText,
    'blank': blank,
    'display-image': displayImage,
    'h-line': hLine,
    'v-line': vLine,
    'row': row,
    'column': column,
    'layer-proxy': layerProxy,
    'infobox': infobox,
    'upgrades': upgrades,
    'upgrade': upgrade,
    'milestones': milestones,
    'milestone': milestone,
    'toggle': toggleButton,
    'challenges': challenges,
    'challenge': challenge,
    'buyables': buyables,
    'buyable': buyable,
    'clickables': clickables,
    'clickable': clickable,
    'achievements': achievements,
    'achievement': achievement,
    'tree': tree,
    'tree-node': function (layer, data) { return treeNode(data, tmp[data] ? tmp[data].symbol : data); },
    'upgrade-tree': function (layer, data) { return thingTree(layer, data, 'upgrade'); },
    'buyable-tree': function (layer, data) { return thingTree(layer, data, 'buyable'); },
    'clickable-tree': function (layer, data) { return thingTree(layer, data, 'clickable'); },
    'node-mark': function (layer, data) { return nodeMark(layer, data); },
    'bar': bar,
    'main-display': mainDisplay,
    'resource-display': resourceDisplay,
    'prestige-button': prestigeButton,
    'tooltip': function (layer, data) { return tooltipNode(data); },
    'microtabs': microtabs,
    'tab-buttons': function (layer, data) { return tabButtons(layer, data, 'mainTabs'); },
    'layer-tab': layerTab,
    'sell-one': function (layer, data) {
      return h('button', {
        class: 'longUpg can', style: cs(layer, 'sell-one'),
        data: { act: 'sellOne', layer: layer, id: String(data) },
      }, [text('Sell One')]);
    },
    'sell-all': function (layer, data) {
      return h('button', {
        class: 'longUpg can', style: cs(layer, 'sell-all'),
        data: { act: 'sellAll', layer: layer, id: String(data) },
      }, [text('Sell All')]);
    },
    'info-tab': function () { return RT.system.infoTab(); },
    'options-tab': function () { return RT.system.optionsTab(); },
    'grid': function () { RT.warn('grid 组件暂未实现（内容层未使用）'); return null; },
  };

  // 单个组件调用：extraClass 用于 treeThing 这类外层包装
  function component(layer, name, data, style, extraClass) {
    const fn = registry[name];
    if (!fn) {
      RT.warn('未知组件: ' + name);
      return null;
    }
    const node = fn(layer, data);
    if (!node) return null;
    if (extraClass) {
      node.props = node.props || {};
      const base = RT.vdom.classString(node.props.class);
      node.props.class = base ? base + ' ' + extraClass : extraClass;
    }
    if (style) {
      node.props = node.props || {};
      node.props.style = Array.isArray(node.props.style) ? node.props.style.concat([style]) : [node.props.style, style];
    }
    return node;
  }

  return {
    registry: registry,
    component: component,
    layerTab: layerTab,
    treeNode: treeNode,
    tabButtons: tabButtons,
    nodeMark: nodeMark,
    infobox: infobox,
    milestoneShown: milestoneShown,
  };
})();
