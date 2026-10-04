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
        // ★ 平滑层接管的节点：把真值写到 data-sm-target 上，**不动文本**
        //（文本归 requestAnimationFrame 的平滑循环所有）。否则 20Hz 的渲染会把
        // 平滑层写的中间值冲掉，看起来每秒闪 20 次。
        const smHost = smoothHostOf(node);
        if (smHost) {
          smHost.dataset.smTarget = vnode.text;
          // ★ 必须通知平滑层立刻重扫元素列表：渲染器从这里起就**不再自己写文本**了，
          //   若平滑层的列表里还没有这个元素（列表每 1.5 秒才重扫一次），文本就会
          //   一直停在旧值（实测：刚打开页面时头部的点数是 0，之后永远显示 0.00 ✗）。
          if (RT.smoothNumbers && RT.smoothNumbers.markDirty) RT.smoothNumbers.markDirty();
          return node;
        }
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
        // 非分屏（窄宽度 / 强制单标签）：内容整屏显示，树用返回按钮回去。
        // 不这么做的话节点点了也看不到界面（右栏被挤到树下面）。
        if (!tmp.other.splitScreen) {
          // 记住的一定是树层（返回按钮要回到树），而不是当前 navTab 的临时值
          if (!tmp.other.oneTabTree) tmp.other.oneTabTree = (typeof layoutInfo !== 'undefined' && layoutInfo && layoutInfo.startNavTab)
            ? layoutInfo.startNavTab : 'tree-tab';
          showNavTab('none');
        }
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

// ---- M10. 数字平滑显示 -----------------------------------------------------
// 见 core.js 里 RT.config.ui.smoothNumbers 的注释。要点：
//   · 主循环 20Hz，但数字文本"格式化后变了才写"，3 位有效数字下每秒只变约 1.6 次；
//   · 这里用 requestAnimationFrame 在两次 tick 之间把标记过的读数滚到目标值，
//     滚动期间多显示一两位小数，收敛后精确贴回原文本（所以静止时与原版逐字一致）；
//   · 渲染器对标记节点的文本"让位"（写进 data-sm-target），避免 20Hz 把中间值冲掉。
function smoothHostOf(node) {
  const cfg = RT.config.ui && RT.config.ui.smoothNumbers;
  if (!cfg || !cfg.enabled) return null;
  const p = node.parentNode;
  if (!p || p.nodeType !== 1 || !p.dataset || p.dataset.sm === undefined) return null;
  return p;
}

RT.smoothNumbers = (function () {
  const state = new WeakMap();
  let rafId = null;
  let lastCollect = 0;
  let dirty = false;   // 渲染器新写入了 data-sm-target → 下一帧立刻重扫元素列表
  let cache = [];
  const stats = { frames: 0, writes: 0, snaps: 0, elements: 0 };

  // 解析成「尾数 + 十进制指数」：1.23e45 → {m:1.23,e:45}；123.45 → {m:123.45,e:0}
  // 用尾数/指数分开表示，1e1000 这种超出 float 范围的值也能平滑（插值在对数空间做）。
  function parse(text) {
    const s = String(text).replace(/,/g, '').trim();
    const m = /^([+-]?\d*\.?\d+)(?:e([+-]?\d+))?$/i.exec(s);
    if (!m) return null;
    const mant = parseFloat(m[1]);
    if (!isFinite(mant)) return null;
    return { m: mant, e: m[2] === undefined ? 0 : parseInt(m[2], 10) };
  }
  function logOf(n) { return Math.log10(Math.abs(n.m)) + n.e; }
  function fromLog(l) {
    const e = Math.floor(l);
    return { m: Math.pow(10, l - e), e: e };
  }
  // 目标文本的"形状"：指数形式几位小数 / 普通形式几位小数 / 有无千分位
  function shapeOf(text) {
    const s = String(text);
    const ex = /^([+-]?)(\d+(?:\.(\d+))?)e([+-]?\d+)$/i.exec(s.replace(/,/g, ''));
    if (ex) return { exp: true, dec: ex[3] ? ex[3].length : 0, expDigits: String(ex[4]).replace(/[+-]/, '').length, sign: ex[1] };
    const pl = /^([+-]?)(\d+(?:\.(\d+))?)$/.exec(s.replace(/,/g, ''));
    if (pl) return { exp: false, dec: pl[3] ? pl[3].length : 0, comma: s.indexOf(',') >= 0, sign: pl[1] };
    return null;
  }
  function format(v, shape, extra) {
    if (!shape) return null;
    const dec = shape.dec + extra;
    if (shape.exp) {
      let m = v.m, e = v.e;
      if (Math.abs(m) >= 10) { m /= 10; e += 1; }
      if (Math.abs(m) < 1 && m !== 0) { m *= 10; e -= 1; }
      return shape.sign + m.toFixed(Math.min(dec, 8)) + 'e' + e;
    }
    const plain = Math.abs(v.e) < 15 ? v.m * Math.pow(10, v.e) : v.m;
    let out = plain.toFixed(Math.min(dec, 8));
    if (shape.comma) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return shape.sign + out;
  }

  function collect() {
    cache = Array.prototype.slice.call(document.querySelectorAll('[data-sm]'));
    stats.elements = cache.length;
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const cfg = RT.config.ui && RT.config.ui.smoothNumbers;
    if (!cfg || !cfg.enabled) { stop(); return; }
    stats.frames++;
    if (document.hidden) return;                       // 后台不烧 CPU
    if (dirty || now - lastCollect > 500) { collect(); lastCollect = now; dirty = false; }
    for (let i = 0; i < cache.length; i++) {
      const el = cache[i];
      if (!el.isConnected) continue;
      const raw = el.dataset.smTarget;
      if (raw === undefined || raw === '') continue;
      let st = state.get(el);
      if (!st) { st = { cur: parse(raw), target: parse(raw), text: raw, shape: shapeOf(raw) }; state.set(el, st); }
      if (raw !== st.text) {                            // 引擎刚写入了新的真值 → 换目标
        const prevTarget = st.target;
        st.text = raw; st.shape = shapeOf(raw);
        const t = parse(raw);
        if (t) {
          // 记下"这次 tick 目标跳了几个显示步长" —— 自适应落后上限要用它。
          // 后期点数每 tick 可能跳好几个步长（真存档：每秒 1.26e18、粒度 1e16、20Hz → 每 tick 6 步）。
          if (prevTarget) {
            const sl = (t.e - (st.shape.dec || 0));
            const jump = Math.pow(10, logOf(t) - sl) - Math.pow(10, logOf(prevTarget) - sl);
            st.tickSteps = Math.abs(jump);
          }
          st.target = t;
        }
      }
      if (!st.target || !st.cur || !st.shape) continue;
      // ★ 目标"跳变"就直接贴合，不要滚：
      //   切标签时元素是**复用**的（同一个 DOM 节点换了内容），上一页是 1e20、这一页是四千多，
      //   滚起来中间会显示成 4236:205 这种四不像（用户实拍报过）。
      //   判据：形状变了（整数 ↔ 指数）或跨了半个数量级 → 立即贴合。
      const key = st.shape.exp ? 'e' + st.shape.dec : 'p' + st.shape.dec + (st.shape.comma ? 'c' : '');
      const shapeChanged = !!st.key && st.key !== key;
      const logJump = st.shape.exp ? Math.abs(logOf(st.target) - logOf(st.cur)) : 0;
      // 纯整数（无指数、无小数）也不滚：数值本来就每帧在涨，滚动只会把整数磨出小数尾巴。
      const plainInteger = !st.shape.exp && st.shape.dec === 0;
      if (shapeChanged || logJump > 0.5 || plainInteger) {
        st.cur = { m: st.target.m, e: st.target.e };
        st.key = key;
        if (el.textContent !== st.text) { el.textContent = st.text; stats.snaps++; }
        continue;
      }
      st.key = key;
      // ★ 给"落后"设上限：目标一直在跑，平滑层追不上就会**一直落后**
      //   （线上实测落后约 0.18 秒 ≈ 20 个显示步长，数字在撒谎）。
      //   ★★ 但上限**不能写死**：后期点数每 tick 就跳好几个显示步长
      //   （真存档：每秒 1.26e18、粒度 1e16、20Hz → 每 tick 6 步），
      //   固定的 3 步会在这种"快增长"场景下每 tick 都触发贴合 —— 等于把平滑关掉了。
      //   所以自适应：允许落后 = max(基础值, 上一次 tick 跳的步长 × 1.5)，
      //   含义就是"显示最多差一个多 tick"，既顺滑又不撒谎。
      const base = cfg.maxLagSteps === undefined ? 3 : cfg.maxLagSteps;
      const allowed = Math.max(base, (st.tickSteps || 0) * 1.5);
      const stepLog = st.shape.exp ? (st.target.e - st.shape.dec) : (-st.shape.dec);
      const lagSteps = Math.pow(10, logOf(st.target) - stepLog) - Math.pow(10, logOf(st.cur) - stepLog);
      if (Math.abs(lagSteps) > allowed) {
        st.cur = { m: st.target.m, e: st.target.e };
        st.key = key;
        if (el.textContent !== st.text) { el.textContent = st.text; stats.snaps++; stats.lagSnaps++; }
        continue;
      }
      // 相对误差够小 → 精确贴回原文本（静止时与原版逐字一致）
      const rel = st.target.m !== 0 ? Math.abs(st.cur.m - st.target.m) / Math.abs(st.target.m) : Math.abs(st.cur.m);
      if (st.cur.e === st.target.e && rel <= cfg.settle) {
        if (el.textContent !== st.text) { el.textContent = st.text; stats.snaps++; }
        continue;
      }
      // 指数形式在对数空间插值（跨数量级也顺滑），普通形式线性插值
      let next;
      if (st.shape.exp) {
        const l = logOf(st.cur) + (logOf(st.target) - logOf(st.cur)) * cfg.easing;
        st.cur = fromLog(l);
      } else {
        st.cur = { m: st.cur.m + (st.target.m - st.cur.m) * cfg.easing, e: st.target.e };
      }
      next = format(st.cur, st.shape, cfg.extraDigits);
      if (next && el.textContent !== next) { el.textContent = next; stats.writes++; }
    }
  }

  function start() {
    const cfg = RT.config.ui && RT.config.ui.smoothNumbers;
    if (!cfg || !cfg.enabled || rafId !== null) return false;
    if (typeof requestAnimationFrame !== 'function') return false;
    // 用户要求减少动效 → 不滚动（数字仍然是精确值）
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    collect();
    lastCollect = performance.now();
    rafId = requestAnimationFrame(frame);
    return true;
  }
  function stop() { if (rafId !== null) cancelAnimationFrame(rafId); rafId = null; }

  function markDirty() { dirty = true; }
  return { start: start, stop: stop, stats: stats, collect: collect, parse: parse, shapeOf: shapeOf, format: format, markDirty: markDirty };
})();


  /* ==========================================================================
   * 购买闪光（边沿触发）
   * --------------------------------------------------------------------------
   * 闪光的动画**不能**直接挂在 .bought 上：游戏每 50ms 重渲染、切标签还会整片重建，
   * 于是每次重渲染都当成"新元素"重播一次（用户实报"切换页面时升级的闪光会重播"）。
   * 这里改成 JS 边沿触发：记录每个元素上一次的"已购买"状态，只在 false -> true 那一刻
   * 临时加 .rt-just-bought，动画放完之后摘掉。首次见到的元素**不播**（避免进页面满屏闪）。
   * ========================================================================== */
  RT.boughtFlash = (function () {
    var seen = new WeakMap();   // 元素 -> 上一次是否已购买
    var timer = null;
    var DURATION = 650;
    var INTERVAL = 140;

    function scan() {
      if (typeof document === 'undefined') return 0;
      if (document.hidden) return 0;
      var nodes = document.querySelectorAll('.upg, .buyable');
      var fired = 0;
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var now = el.classList.contains('bought');
        var before = seen.get(el);
        seen.set(el, now);
        if (before === undefined) continue;      // 首次见到：只记录，不播
        if (before === false && now === true && !el.classList.contains('rt-just-bought')) {
          el.classList.add('rt-just-bought');
          (function (node) {
            setTimeout(function () { node.classList.remove('rt-just-bought'); }, DURATION);
          })(el);
          fired++;
        }
      }
      return fired;
    }

    function start() {
      var cfg = (RT.config.ui || {});
      if (cfg.boughtFlash === false) return false;
      if (timer !== null) return false;
      if (typeof setInterval !== 'function') return false;
      scan();
      timer = setInterval(scan, INTERVAL);
      return true;
    }

    function stop() { if (timer !== null) { clearInterval(timer); timer = null; } }

    return { start: start, stop: stop, scan: scan };
  })();
