/* ============================================================================
 * 主题与设置（重写版）
 * ========================================================================== */

// ---- 主题 ---------------------------------------------------------------
// 内置主题表（引擎默认 = 上游那三套；rizline 是音乐游戏树自己加的风格）。
// 每个模组用 RT.config.theme 选择「有哪些主题 / 默认哪个 / 切换写法」。
var BUILTIN_COLORS = {
  rizline: {
    1: '#111111', 2: '#767676', 3: '#c9c9cb',        // 树连线：墨黑 / 中灰 / 浅灰
    color: '#111111', points: '#111111', locked: '#9a9a9c',
    background: '#f4f4f5', background_tooltip: 'rgba(255, 255, 255, 0.97)',
  },
  default: {
    1: '#ffffff', 2: '#bfbfbf', 3: '#7f7f7f',
    color: '#dfdfdf', points: '#ffffff', locked: '#bf8f8f',
    background: '#0f0f0f', background_tooltip: 'rgba(0, 0, 0, 0.75)',
  },
  aqua: {
    1: '#bfdfff', 2: '#8fa7bf', 3: '#5f6f7f',
    color: '#bfdfff', points: '#dfefff', locked: '#c4a7b3',
    background: '#001f3f', background_tooltip: 'rgba(0, 15, 31, 0.75)',
  },
  judgment: {
    1: '#ffffff', 2: '#bfbfbf', 3: '#7f7f7f',
    color: '#dfdfdf', points: '#fcd5d5', locked: '#bf8f8f',
    background: '#361010', background_tooltip: 'rgba(0, 0, 0, 0.75)',
  },
};

var themes = ['default'];
var colors = BUILTIN_COLORS;
var colors_theme = colors.default;

// 由配置刷新主题表/默认主题（RT.setConfig 时会调用；模组配置在内容层加载时生效）
function applyConfiguredTheme() {
  const cfg = (RT.config && RT.config.theme) || {};
  themes = (cfg.list && cfg.list.length) ? cfg.list.slice() : ['default'];
  colors = cfg.colors || BUILTIN_COLORS;
  const def = cfg.default || themes[0];
  if (typeof options === 'object' && options && themes.indexOf(options.theme) < 0) options.theme = def;
  if (typeof document !== 'undefined' && document.body) changeTheme();
}
function changeTheme() {
  const def = (RT.config && RT.config.theme && RT.config.theme.default) || themes[0] || 'default';
  const name = options.theme || def;
  colors_theme = colors[name] || BUILTIN_COLORS.default;
  if (typeof document === 'undefined' || !document.body) return;
  const root = document.body;
  // 把主题名写到 body 上：CSS 靠它区分浅色（白纱 + 墨字）与暗色（黑纱 + 浅字）。
  // 只靠 prefers-color-scheme 判不出来（实测过）。
  root.dataset.theme = name;
  root.style.setProperty('--background', colors_theme.background);
  root.style.setProperty('--background_tooltip', colors_theme.background_tooltip);
  root.style.setProperty('--color', colors_theme.color);
  root.style.setProperty('--points', colors_theme.points);
  root.style.setProperty('--locked', colors_theme.locked);
}

function getThemeName() {
  return options.theme ? options.theme : ((RT.config.theme && RT.config.theme.default) || 'default');
}

function switchTheme() {
  // T2：两棵树的切换写法不同
  //   rg —— 整体被 gcs('j',11) 门禁包住（判定层的那个可点击控制能否换主题）
  //   sf —— 无门禁，但末句 `options.theme = themes[1]` 会覆盖前一句（上游原样，保持一致）
  if (RT.config.theme.switchVariant === 'sf') {
    let index = themes.indexOf(options.theme);
    if (options.theme === null || index >= themes.length - 1 || index < 0) {
      options.theme = themes[0];
    } else {
      index++;
      options.theme = themes[index];
      options.theme = themes[1];
    }
    changeTheme();
    resizeCanvas();
    return;
  }
  if (gcs('j', 11) == 0) {
    let index = themes.indexOf(options.theme);
    if (options.theme === null || index >= themes.length - 1 || index < 0) {
      options.theme = themes[0];
    } else {
      index++;
      if (index >= 2 && gcs('j', 11) == 0) options.theme = themes[0];
      else options.theme = themes[index];
    }
    changeTheme();
    resizeCanvas();
  }
}

// ---- 设置 ---------------------------------------------------------------
function getStartOptions() {
  return {
    autosave: true,
    msDisplay: 'always',
    theme: (RT.config.theme && RT.config.theme.default) || 'default',
    hqTree: false,
    offlineProd: true,
    hideChallenges: false,
    showStory: true,
    forceOneTab: false,
    oldStyle: false,
    tooltipForcing: true,
  };
}

var styleCooldown = 0;

function toggleOpt(name) {
  if (name == 'oldStyle' && styleCooldown > 0) return;
  options[name] = !options[name];
  if (name == 'hqTree') changeTreeQuality();
  if (name == 'oldStyle') updateStyle();
  save(true);   // 顺手修掉原版“改完设置立刻刷新会丢改动”的毛病
}

function updateStyle() {
  styleCooldown = 1;
}

function changeTreeQuality() {
  const on = options.hqTree;
  document.body.style.setProperty('--hqProperty1', on ? '2px solid' : '4px solid');
  document.body.style.setProperty('--hqProperty2a', on ? '-4px -4px 4px rgba(0, 0, 0, 0.25) inset' : '-4px -4px 4px rgba(0, 0, 0, 0) inset');
  document.body.style.setProperty('--hqProperty2b', on ? '0px 0px 20px var(--background)' : '');
  document.body.style.setProperty('--hqProperty3', on ? '2px 2px 4px rgba(0, 0, 0, 0.25)' : 'none');
  needCanvasUpdate = true;
}

const MS_DISPLAYS = ['ALL', 'LAST, AUTO, INCOMPLETE', 'AUTOMATION, INCOMPLETE', 'INCOMPLETE', 'NONE'];
const MS_SETTINGS = ['always', 'last', 'automation', 'incomplete', 'never'];

function adjustMSDisp() {
  options.msDisplay = MS_SETTINGS[(MS_SETTINGS.indexOf(options.msDisplay) + 1) % 5];
}

// ---- 热键 ---------------------------------------------------------------
function installHotkeys() {
  RT.setKeyDownHook(function (e) {
    if (player === undefined) return;
    if (tmp.gameEnded && !player.keepGoing) return;
    let key = e.key;
    if (ctrlDown) key = 'ctrl+' + key;
    if (ctrlDown && hotkeys[key]) e.preventDefault();
    const k = hotkeys[key];
    if (k && player[k.layer] && player[k.layer].unlocked && tmp[k.layer].hotkeys[k.id].unlocked) {
      k.onPress();
    }
  });
}

function focused(x) {
  onFocused = x;
}
