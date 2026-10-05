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
      case 'showTab':
        showTab(el.dataset.target);
        enterOneTabIfNeeded(el.dataset.target);
        break;
      case 'showNavTab': showNavTab(el.dataset.target); break;
      case 'goBack': goBack(el.dataset.layer); break;
      case 'subtab':
        // 记录当前子标签：data-subtab 需要它（player.subtabs 的族名不固定，
        // 实测点击后两个族都停在旧值，猜不出来就只能记）。
        RT.currentSubtab = { layer: el.dataset.layer, family: el.dataset.family, id: el.dataset.id };
        setSubtab(el.dataset.layer, el.dataset.family, el.dataset.id);
        break;
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

  // 非分屏（窄宽度 / 强制单标签）下打开某个标签时：内容整屏显示，同时把树层记下来
  // 供返回按钮使用。设置 / 说明 / Changelog 这些顶部图标走的是 showTab，
  // 之前只有"点树节点"那条路径做了这件事，于是窄屏点图标会又渲染成两栏、
  // 内容被挤到树下面看不见（用户实报"单标签下点不开设置和说明"）。
  function enterOneTabIfNeeded(target) {
    if (!target || target === 'none') return;
    if (tmp.other.splitScreen) return;
    if (!tmp.other.oneTabTree) {
      tmp.other.oneTabTree = (typeof layoutInfo !== 'undefined' && layoutInfo && layoutInfo.startNavTab)
        ? layoutInfo.startNavTab : 'tree-tab';
    }
    showNavTab('none');
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
        enterOneTabIfNeeded(layer);
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
      // ★ 进位必须在**四舍五入之后**再判一次：m = 9.6、dec = 0 时上面的
      //   `>= 10` 为 false，但 toFixed(0) 会把它写成 "10"，于是输出 "10e11547"
      //   （用户实报的 10e 问题，就是这么来的）。format.js 里修过同一个坑，
      //   这里是平滑模块的另一套格式化，必须各自修。
      let outM = m.toFixed(Math.min(dec, 8));
      if (Math.abs(parseFloat(outM)) >= 10) {
        outM = (parseFloat(outM) / 10).toFixed(Math.min(dec, 8));
        e += 1;
      }
      // ★ 指数必须走引擎的 commaFormat：这里原来直接把指数拼成数字（"e11034"），
      //   而引擎的 format() 是加千分位的（"e11,034"）。平滑模块随后会覆写 #points
      //   的文本，于是页面上看到的就是不带逗号的那个 —— 用户实报"1e11000 以下正常、
      //   再大逗号就没了"，差别只在指数是否够千位（10000 起才有逗号）。
      const eStr = (typeof commaFormat === 'function')
        ? commaFormat(new Decimal(e), 0) : String(e);
      return shape.sign + outM + 'e' + eStr;
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

  // ---- 能量条"快速成长"判定 ------------------------------------------------
  // 用户要求：等级涨得快时才把填充换成染色斜纹（并去掉纯色条），慢下来恢复。
  // 这里只做**状态判定**，视觉全在 CSS（components.css 的 I43）。
  // 等级从条内文字读（"等级:498.91"），而不是猜游戏内部字段 —— 文字就是玩家看到的，
  // 阈值也按玩家感知定；每 250ms 扫一次、最多 8 条，开销可忽略。
  RT.fastBars = (function () {
    const cfg = () => (RT.config.ui && RT.config.ui.fastBars) || {};
    let timer = null;
    const last = new WeakMap();    // 元素 -> { v, t } 上次等级与时间
    const shown = new WeakMap();   // 元素 -> 进入快速态的时长基准
    // 从 .fill 的同级元素里找 .barBG（两者是兄弟：.overlayTextContainer / .barBG / .fill）
    function barBGSibling(fill) {
      if (!fill || !fill.parentElement) return null;
      const kids = fill.parentElement.children;
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].classList && kids[i].classList.contains('barBG')) return kids[i];
      }
      return null;
    }
    function levelOf(wrap) {
      const t = wrap.querySelector('.overlayTextContainer') || wrap;
      const m = /等级\s*[:：]\s*([\d.,]+)/.exec(t.textContent || '');
      if (!m) return null;
      const v = parseFloat(m[1].replace(/,/g, ''));
      return isNaN(v) ? null : v;
    }
    function scan() {
      const c = cfg();
      if (c.enabled === false) return;
      const win = c.windowMs || 1000;      // 折算成"每秒涨多少级"的窗口
      const minGain = c.minGain || 1;      // 每秒涨 >= 1 级算快
      const hold = c.holdMs || 1500;       // 掉速后再保持多久才恢复
      const now = performance.now();
      const wraps = document.querySelectorAll('.barWrap');
      for (let i = 0; i < wraps.length; i++) {
        const wrap = wraps[i];
        const lv = levelOf(wrap);
        if (lv === null) continue;
        const prev = last.get(wrap);
        last.set(wrap, { v: lv, t: now });
        let gain = null;
        if (prev && now > prev.t) gain = (lv - prev.v) / (now - prev.t) * win;
        if (gain !== null && gain >= minGain) {
          shown.set(wrap, now);
          const fill = wrap.querySelector('.fill');
          if (fill) {
            const col = getComputedStyle(fill).backgroundColor;
            if (col && col !== 'rgba(0, 0, 0, 0)') wrap.style.setProperty('--rt-bar-color', col);
          }
          wrap.classList.add('rt-bar-fast');
          // 类同时加到 .fill 与 .barBG：
          //   .fill  → 只用来把纯色条去掉；
          //   .barBG → 条纹画在它上面，宽度是整条（用户要求"铺满整个能量条"）。
          // 直接找 .fill 的同级 .barBG，不依赖 .barWrap 的祖先关系（踩过坑）。
          const bgEl = barBGSibling(fill);
          if (fill) fill.classList.add('rt-bar-fast');
          if (bgEl) bgEl.classList.add('rt-bar-fast');
        } else if (wrap.classList.contains('rt-bar-fast')) {
          if (now - (shown.get(wrap) || 0) > hold) {
            wrap.classList.remove('rt-bar-fast');
            const f2 = wrap.querySelector('.fill');
            if (f2) f2.classList.remove('rt-bar-fast');
            const b2 = barBGSibling(f2);
            if (b2) b2.classList.remove('rt-bar-fast');
          }
        }
      }
    }
    return {
      start() { if (timer === null) timer = setInterval(scan, (cfg().intervalMs || 250)); },
      stop() { if (timer !== null) { clearInterval(timer); timer = null; } },
      scan: scan,
      // 手动标记（测试 / 调试用）：走与自动判定完全相同的视觉路径
      mark(el, holdMs) {
        const fill = el.querySelector ? el.querySelector('.fill') : null;
        if (fill) {
          const col = getComputedStyle(fill).backgroundColor;
          if (col) el.style.setProperty('--rt-bar-color', col);
        }
        shown.set(el, performance.now() - (holdMs || 0));
        el.classList.add('rt-bar-fast');
        if (fill) fill.classList.add('rt-bar-fast');
        const bgEl2 = barBGSibling(fill);
        if (bgEl2) bgEl2.classList.add('rt-bar-fast');
        return true;
      }
    };
  })();

  // ---- 『已永久』卡片标记 ---------------------------------------------------
  // 产能增益页里被永久化的增益卡是**纯 div、无类名**（内容层自定义 HTML），
  // CSS 也没法按文字选择，所以这里扫一遍：找到文字恰为『已永久』的叶子节点，
  // 往上取两级 div（实测链条 span → div → div 就是那张卡），打上 .rt-permanent；
  // 金色发光样式写在 components.css 的 I47。
  RT.permGlow = (function () {
    let timer = null;
    function scan() {
      const nodes = document.querySelectorAll('span, div');
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (el.children.length) continue;
        if ((el.textContent || '').trim() !== '\u5df2\u6c38\u4e45') continue;
        let card = el;
        for (let up = 0; up < 2 && card.parentElement; up++) card = card.parentElement;
        if (card && !card.classList.contains('rt-permanent')) card.classList.add('rt-permanent');
      }
    }
    return {
      start() { if (timer === null) timer = setInterval(scan, 800); scan(); },
      stop() { if (timer !== null) { clearInterval(timer); timer = null; } },
      scan: scan,
    };
  })();

  // ---- 稀有度词发光 ---------------------------------------------------------
  // 内容层是纯 HTML（无类名），CSS 也没法按文字选择，所以这里扫一遍：
  //   a) 整格就是稀有度的（列表里的 [普通] / [稀有]）→ 直接给元素打类；
  //   b) 词嵌在长句里的（"普通结晶: 36.34"、"普通☆永久化"）→ 只把那个词包成 span。
  // ★ flex 父级的坑：那几行（如升级卡的 "Cost: 50 稀有结晶"）父级是 flex，
  //   直接插 span 会让 span 与相邻文字各自成为 **flex 项** → 一个词占一行，
  //   且每次重渲染后重新包裹表现为"来回闪"。所以遇到 flex 父级时，
  //   先把整行文字收进**一个** span（.rt-line，单个 flex 项），下一次扫描再在它内部上色。
  RT.rarityGlow = (function () {
    const WORDS = { '普通': 'rt-r-common', '稀有': 'rt-r-rare', '史诗': 'rt-r-epic', '传说': 'rt-r-legend' };
    const INLINE_RE = /(普通|稀有|史诗|传说)(?=结晶|永久化|\])/;
    const INLINE_RE_G = /(普通|稀有|史诗|传说)(?=结晶|永久化|\])/g;
    let timer = null;

    function hosts() {
      const out = [];
      const a = document.getElementById('tabContent');
      const b = document.getElementById('rightContent');
      if (a) out.push(a);
      if (b) out.push(b);
      return out.length ? out : [document.body];
    }

    function tagWholeCell(host) {
      const all = host.querySelectorAll('span, div, b, p');
      for (let i = 0; i < all.length; i++) {
        const e = all[i];
        if (e.children.length) continue;
        const t = (e.textContent || '').trim();
        const m = /^\[?(普通|稀有|史诗|传说)\]?$/.exec(t);
        if (m && !e.classList.contains('rt-rarity')) e.classList.add('rt-rarity', WORDS[m[1]]);
      }
    }

    function collect(host) {
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null);
      const jobs = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.nodeValue || '';
        if (!text) continue;
        const pe = node.parentElement;
        if (!pe) continue;
        if (pe.classList.contains('rt-rarity') || pe.id === 'points') continue;
        if (INLINE_RE.test(text)) jobs.push(node);
      }
      return jobs;
    }

    function wrapWords(host) {
      collect(host).forEach(function (node) {
        const parent = node.parentElement;
        if (!parent) return;
        // flex 父级：先把整行收进一个 span，本轮不再动它（下一轮在 rt-line 内部处理）
        if (getComputedStyle(parent).display.indexOf('flex') >= 0) {
          if (!parent.querySelector(':scope > .rt-line')) {
            const line = document.createElement('span');
            line.className = 'rt-line';
            while (parent.firstChild) line.appendChild(parent.firstChild);
            parent.appendChild(line);
          }
          return;
        }
        const text = node.nodeValue || '';
        const frag = document.createDocumentFragment();
        let last = 0, m;
        INLINE_RE_G.lastIndex = 0;
        while ((m = INLINE_RE_G.exec(text)) !== null) {
          if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const span = document.createElement('span');
          span.className = 'rt-rarity ' + WORDS[m[1]];
          span.textContent = m[1];
          frag.appendChild(span);
          last = m.index + m[1].length;
        }
        if (!last) return;
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        if (node.parentNode) node.parentNode.replaceChild(frag, node);
      });
    }

    function scan() {
      try {
        hosts().forEach(function (h) { tagWholeCell(h); wrapWords(h); });
      } catch (e) {}
    }

    return {
      // 120ms：游戏每拍重渲染会清掉包裹层，间隔太长会看到"先白、过一会才变色"。
      start() { if (timer === null) timer = setInterval(scan, 120); scan(); },
      stop() { if (timer !== null) { clearInterval(timer); timer = null; } },
      scan: scan,
    };
  })();
