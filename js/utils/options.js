// ************ Options ************

let options = {};

function getStartOptions() {
  return {
    autosave: true,
    msDisplay: "always",
    theme: "default",
    hqTree: false,
    offlineProd: true,
    hideChallenges: false,
    showStory: true,
    forceOneTab: false,
    oldStyle: false,
    tooltipForcing: true,
    // 背景特效（星场 / 星云 / 流星 / 星尘 / 点击爆发）总开关。
    // 关掉后只保留 CSS 部分的界面光效，可显著省电 / 提帧。
    backgroundFx: true,
  };
}

function toggleOpt(name) {
  if (name == "oldStyle" && styleCooldown > 0) return;

  options[name] = !options[name];
  if (name == "hqTree") changeTreeQuality();
  if (name == "oldStyle") updateStyle();
  if (name == "backgroundFx") applyBackgroundFx();
  // 立刻存档：options 本来是靠周期性 autosave 落盘的，
  // 改完设置如果马上就刷新/关页面，改动会丢（实测就是这样）。
  if (typeof save === "function") save(true);
}

/* 背景特效开关：只切「背景」那几层（星场 / 星云 / 流星 / 星尘 / 点击爆发），
   界面上的光效（闲置闪光、解锁反馈、能量条脉冲与粒子等）不受影响。
   具体实现交给特效层自己的接口，游戏这边不碰它的内部状态。 */
function applyBackgroundFx() {
  if (typeof deepSpaceEffects === "undefined" || !deepSpaceEffects) return;
  const on = !!options.backgroundFx;
  deepSpaceEffects.set("drawStarsLayer", on);
  deepSpaceEffects.set("drawNebulaLayer", on);
  deepSpaceEffects.set("drawParticles", on);
  deepSpaceEffects.set("cssNebula", on);
  // 星场/粒子层不挂载时把指针也清掉（避免留一个看不见的整屏层）
  const cv = document.getElementById("deepSpaceCanvas");
  if (cv) cv.style.visibility = on ? "" : "hidden";
  needCanvasUpdate = true;
}
var styleCooldown = 0;
function updateStyle() {
  styleCooldown = 1;
  let css = document.getElementById("styleStuff");
  css.href = options.oldStyle ? "oldStyle.css" : "style.css";
  needCanvasUpdate = true;
}
function changeTreeQuality() {
  var on = options.hqTree;
  document.body.style.setProperty(
    "--hqProperty1",
    on ? "2px solid" : "4px solid",
  );
  document.body.style.setProperty(
    "--hqProperty2a",
    on
      ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset"
      : "-4px -4px 4px rgba(0, 0, 0, 0) inset",
  );
  document.body.style.setProperty(
    "--hqProperty2b",
    on ? "0px 0px 20px var(--background)" : "",
  );
  document.body.style.setProperty(
    "--hqProperty3",
    on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none",
  );
}
function toggleAuto(toggle) {
  Vue.set(player[toggle[0]], [toggle[1]], !player[toggle[0]][toggle[1]]);
  needCanvasUpdate = true;
}

const MS_DISPLAYS = [
  "ALL",
  "LAST, AUTO, INCOMPLETE",
  "AUTOMATION, INCOMPLETE",
  "INCOMPLETE",
  "NONE",
];

const MS_SETTINGS = ["always", "last", "automation", "incomplete", "never"];

function adjustMSDisp() {
  options.msDisplay =
    MS_SETTINGS[(MS_SETTINGS.indexOf(options.msDisplay) + 1) % 5];
}
function milestoneShown(layer, id) {
  complete = player[layer].milestones.includes(id);
  auto = layers[layer].milestones[id].toggles;

  switch (options.msDisplay) {
    case "always":
      return true;
      break;
    case "last":
      return auto || !complete || player[layer].lastMilestone === id;
      break;
    case "automation":
      return auto || !complete;
      break;
    case "incomplete":
      return !complete;
      break;
    case "never":
      return false;
      break;
  }
  return false;
}
