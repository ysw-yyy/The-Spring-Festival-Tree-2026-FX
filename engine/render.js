/* ============================================================================
 * 自研渲染层（无 Vue）
 * ----------------------------------------------------------------------------
 * 一个够用就好的 vdom：
 *   h(tag, props, children)  建虚拟节点；props 支持 class / style(对象或数组) /
 *                            html / text / attrs / data
 *   mount(vnode) -> Node     首次挂载
 *   patch(node, vnode)       按位置 diff：标签不同就整块替换，否则只改差异
 * 事件不用逐个节点绑定，而是**根委托**：元素上只写 data-act / data-layer / data-id，
 * 由 installDelegation() 在根节点上分发。这样 DOM 结构稳定、不必每 tick 重挂闭包。
 * ========================================================================== */

RT.vdom = (function () {
  function h(tag, props, children) {
    const kids = [];
    if (children) {
      // 子元素归一化：允许直接写字符串/数字、允许嵌套数组、跳过 null/false。
      // 不做这层归一化的后果是——数组会被当成 vnode 塞进 DOM，字符串会丢，
      // 最后在 applyProps 上炸出 "Cannot read properties of undefined (reading 'class')"
      //（春节树的 info-tab 就这么炸过一次）。
      const push = (c) => {
        if (c === null || c === undefined || c === false || c === true) return;
        if (Array.isArray(c)) { for (const x of c) push(x); return; }
        if (typeof c === 'string' || typeof c === 'number') { kids.push(text(c)); return; }
        kids.push(c);
      };
      for (const c of children) push(c);
    }
    return { type: 'elem', tag: tag, props: props || {}, children: kids };
  }

  function text(value) {
    return { type: 'text', text: value === null || value === undefined ? '' : String(value) };
  }

  function flatStyles(style) {
    const out = {};
    if (!style) return out;
    const list = Array.isArray(style) ? style : [style];
    for (const s of list) {
      if (!s) continue;
      for (const k in s) {
        if (s[k] === undefined || s[k] === null || s[k] === '') continue;
        out[k] = s[k];
      }
    }
    return out;
  }

  function applyStyle(el, style) {
    const next = flatStyles(style);
    const prev = el.__style || {};
    for (const k in next) {
      if (prev[k] !== next[k]) el.style.setProperty(k, String(next[k]));
    }
    for (const k in prev) {
      if (!(k in next)) el.style.removeProperty(k);
    }
    el.__style = next;
  }

  // class 允许是字符串或数组（组件里常写成数组）；数组必须用空格拼接，
  // 否则 className 会把数组强转成 "a,b,c" 这种逗号串，CSS 选择器全部失配。
  function classString(cls) {
    if (cls === undefined || cls === null) return '';
    if (Array.isArray(cls)) {
      const parts = [];
      for (const c of cls) {
        if (!c) continue;
        if (Array.isArray(c)) { const s = classString(c); if (s) parts.push(s); }
        else parts.push(String(c));
      }
      return parts.join(' ');
    }
    return String(cls);
  }

  function applyProps(el, props) {
    props = props || {};          // 防御：任何来源的 vnode 都不该把渲染整条链炸掉
    // class
    const cls = classString(props.class);
    const prevCls = el.__class === undefined ? null : el.__class;
    if (prevCls !== cls) {
      el.__class = cls;
      if (cls) el.className = cls;
      else el.removeAttribute('class');
    }
    // style
    if (props.style) applyStyle(el, props.style);
    else if (el.__style && Object.keys(el.__style).length) applyStyle(el, null);

    // html（字符串比较后才写，避免每 tick 重建子树）
    // 注意：这里**绝不能 return** —— 之前那样写会让 data-act / attrs 全部丢失，
    // 表现就是「按钮点不动」（重置按钮的 data-act 就是这么丢的，实测 elementFromPoint
    // 命中按钮本身、但沿父链找不到任何 data-act）。html 只影响内容，属性照旧要设置。
    if (props.html !== undefined) {
      const html = props.html === null ? '' : String(props.html);
      if (el.__html !== html) {
        el.__html = html;
        el.innerHTML = html;
      }
    } else if (el.__html !== undefined) {
      el.__html = undefined;
      el.innerHTML = '';
    }

    // text
    if (props.text !== undefined) {
      const t = props.text === null ? '' : String(props.text);
      if (el.__text !== t) {
        el.__text = t;
        el.textContent = t;
      }
    }

    // attrs
    const attrs = props.attrs || {};
    const prevAttrs = el.__attrs || {};
    for (const k in attrs) {
      if (attrs[k] === undefined || attrs[k] === null || attrs[k] === false) continue;
      if (prevAttrs[k] !== attrs[k]) el.setAttribute(k, String(attrs[k]));
    }
    for (const k in prevAttrs) {
      if (!(k in attrs)) el.removeAttribute(k);
    }
    el.__attrs = Object.assign({}, attrs);

    // data-*
    const data = props.data || {};
    const prevData = el.__data || {};
    for (const k in data) {
      if (prevData[k] !== data[k]) el.dataset[k] = data[k];
    }
    for (const k in prevData) {
      if (!(k in data)) delete el.dataset[k];
    }
    el.__data = Object.assign({}, data);
  }

  function mount(vnode) {
    if (!vnode || typeof vnode !== 'object') {
      // 到这一步说明调用方塞了非 vnode 的东西（字符串/数字/数组）。归一化成文本节点，
      // 顺便把位置报出来，免得以后又靠猜。
      RT.error('mount 收到非 vnode：' + JSON.stringify(vnode) + '（已按文本处理）');
      return document.createTextNode(vnode === null || vnode === undefined ? '' : String(vnode));
    }
    if (vnode.type === 'text') return document.createTextNode(vnode.text);
    const el = document.createElement(vnode.tag);
    applyProps(el, vnode.props);
    if (!vnode.props || vnode.props.html === undefined) {
      for (const child of vnode.children || []) el.appendChild(mount(child));
    }
    el.__v = vnode;
    return el;
  }

  function patch(node, vnode) {
    if (!node) return mount(vnode);
    if (vnode.type === 'text') {
      if (node.nodeType === 3) {
        if (node.data !== vnode.text) node.data = vnode.text;
        return node;
      }
      const fresh = mount(vnode);
      node.parentNode.replaceChild(fresh, node);
      return fresh;
    }
    // elem
    if (node.nodeType !== 1 || node.tagName.toLowerCase() !== vnode.tag.toLowerCase()) {
      const fresh = mount(vnode);
      node.parentNode.replaceChild(fresh, node);
      return fresh;
    }
    applyProps(node, vnode.props);
    const oldV = node.__v;
    const oldKids = oldV && oldV.children ? oldV.children : [];
    // 有 html 属性时，applyProps 已经用 innerHTML 接管了子节点：此时**不能**再按
    // children 去增删（否则会把刚写进去的内容删掉）。
    if (vnode.props.html === undefined) patchChildren(node, oldKids, vnode.children);
    node.__v = vnode;
    return node;
  }

  function patchChildren(parent, oldKids, newKids) {
    // 增删一律**以真实 DOM 为准**，不要拿旧 vnode 的 children 列表按索引对齐：
    // 节点在 `props.html` 与 `children` 两种形态之间切换过之后，两者数量会不一致，
    // 按旧列表算 max 就会漏删 —— 症状是「切到内容更短的层时，上一层的组件残留在界面上」。
    if (oldKids.length !== parent.childNodes.length) {
      RT.warn('vdom 子节点与真实 DOM 不同步（已按 DOM 修正）: vnode=' + oldKids.length +
        ' dom=' + parent.childNodes.length +
        (parent.className ? ' @.' + String(parent.className).trim().split(/\s+/)[0] : ''));
    }
    for (let i = 0; i < newKids.length; i++) {
      const dom = parent.childNodes[i];
      if (!dom) { parent.appendChild(mount(newKids[i])); continue; }
      patch(dom, newKids[i]);
    }
    while (parent.childNodes.length > newKids.length) parent.removeChild(parent.lastChild);
  }

  function render(container, vnode) {
    if (!container.__v) {
      container.__v = vnode;
      const el = mount(vnode);
      container.appendChild(el);
      container.__root = el;
      return el;
    }
    const el = patch(container.__root, vnode);
    container.__root = el;
    container.__v = vnode;
    return el;
  }

  return { h: h, text: text, mount: mount, patch: patch, render: render, flatStyles: flatStyles, classString: classString };
})();

/* ---------------------------------------------------------------------------
 * 事件委托：data-act 决定动作
 * -------------------------------------------------------------------------*/
RT.delegation = (function () {
  const holds = {};   // 长按重复触发（buyable / clickable 的 onHold、buyable 的连买）

  function findAct(target) {
    let el = target;
    while (el && el !== document) {
      if (el.dataset && el.dataset.act) return el;
      el = el.parentNode;
    }
    return null;
  }

  function act(el, event) {
    const actName = el.dataset.act;
    const layer = el.dataset.layer;
    const id = el.dataset.id;
    switch (actName) {
      // ---- 导航 ----
      case 'showTab': showTab(el.dataset.target); break;
      case 'showNavTab': showNavTab(el.dataset.target); break;
      case 'goBack': goBack(el.dataset.layer); break;
      case 'subtab': setSubtab(el.dataset.layer, el.dataset.family, el.dataset.id); break;
      case 'treeNode':
        treeNodeClick(layer, el.dataset.prev || undefined);
        break;
      // ---- 购买 / 交互 ----
      case 'buyUpg': buyUpg(layer, id); break;
      case 'buyBuyable': buyBuyable(layer, id); break;
      case 'buyMaxBuyable': buyMaxBuyable(layer, id); break;
      case 'cloneBuyable': break;
      case 'clickClickable': clickClickable(layer, id); break;
      case 'startChallenge': startChallenge(layer, Number(id)); break;
      case 'doReset': doReset(layer); break;
      case 'respec': respecBuyables(layer); break;
      case 'masterButton': run(tmp[layer].clickables.masterButtonPress, tmp[layer].clickables); break;
      case 'sellOne': run(tmp[layer].buyables[id].sellOne, tmp[layer].buyables[id]); updateBuyableTemp(layer); break;
      case 'sellAll': run(tmp[layer].buyables[id].sellAll, tmp[layer].buyables[id]); updateBuyableTemp(layer); break;
      case 'toggleAuto': toggleAuto([layer, id]); break;
      case 'toggleInfobox':
        player.infoboxes[layer][id] = !player.infoboxes[layer][id];
        RT.requestRender();
        break;
      // ---- 设置页 ----
      case 'save': save(); break;
      case 'exportSave': exportSave(); break;
      case 'importSave': importSave(); break;
      case 'hardReset': hardReset(); break;
      case 'toggleOpt':
        toggleOpt(id);
        RT.requestRender();
        break;
      case 'switchTheme': switchTheme(); RT.requestRender(); break;
      case 'adjustMSDisp': adjustMSDisp(); RT.requestRender(); break;
      case 'changelog': showTab('changelog-tab'); break;
      case 'none': break;
      default:
        RT.warn('未知的 data-act: ' + actName);
    }
  }

  function treeNodeClick(layer, prev) {
    if ((shiftDown || player.shitDown) && options.forceTooltips && layer !== 't') {
      player[layer].forceTooltip = !player[layer].forceTooltip;
    } else if (tmp[layer].isLayer) {
      if (tmp[layer].leftTab) {
        showNavTab(layer, prev);
        showTab('none');
      } else {
        showTab(layer, prev);
      }
    } else {
      run(layers[layer].onClick, layers[layer]);
    }
    RT.requestRender();
  }

  // 长按重复：buyable 一直买；clickable / grid 用到 onHold
  function startHold(el) {
    const actName = el.dataset.act;
    const layer = el.dataset.layer;
    const id = el.dataset.id;
    if (holds[actName + layer + id]) return;
    let ticks = 0;
    const timer = setInterval(function () {
      ticks++;
      if (ticks < 5) return;
      try {
        if (actName === 'buyBuyable') {
          buyBuyable(layer, id);
        } else if (actName === 'clickClickable') {
          const c = layers[layer].clickables[id];
          if (c.onHold && run(c.canClick, c)) run(c.onHold, c);
        } else if (actName === 'treeNode') {
          // 树上节点不长按
        }
      } catch (e) {
        RT.error('长按处理出错: ' + e.message, e.stack);
      }
    }, 50);
    holds[actName + layer + id] = timer;
  }

  function stopHold(el) {
    const key = el.dataset.act + el.dataset.layer + el.dataset.id;
    if (holds[key]) {
      clearInterval(holds[key]);
      delete holds[key];
    }
  }

  function stopAllHolds() {
    for (const k in holds) { clearInterval(holds[k]); delete holds[k]; }
  }

  function install(root) {
    root.addEventListener('click', function (e) {
      const el = findAct(e.target);
      if (!el) return;
      if (e.target && e.target.tagName === 'INPUT') return;
      e.stopPropagation();
      try { act(el, e); } catch (err) { RT.error('点击处理出错: ' + err.message, err.stack); }
    });
    const down = function (e) {
      const el = findAct(e.target);
      if (!el) return;
      stopAllHolds();
      startHold(el);
    };
    const up = function () { stopAllHolds(); };
    root.addEventListener('mousedown', down);
    root.addEventListener('touchstart', down, { passive: true });
    root.addEventListener('mouseup', up);
    root.addEventListener('mouseleave', up);
    root.addEventListener('touchend', up);
    root.addEventListener('touchcancel', up);
    document.addEventListener('mouseup', up);
  }

  return { install: install, stopAllHolds: stopAllHolds };
})();
