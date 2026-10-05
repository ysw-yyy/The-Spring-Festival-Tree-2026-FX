/* ============================================================================
 * 数字格式化（重写版）
 * ----------------------------------------------------------------------------
 * 与上游 js/utils/NumberFormating.js 的输出**逐字符等价**（有 Node 对拍测试：
 * rg/tests/format_parity.js）。语义要点：
 *   - 1e3 起用千分位；1e9 起用指数；1e10000 / 1e1000000 起降精度；
 *     eeee1000 之后走 slog 的 "F" 记法；极小值用负指数 / ⁻¹ 记法。
 *   - formatWhole 在 <1e9 时取整；formatTime 按 秒/分/时/天/年 拼接。
 * ========================================================================== */

function exponentialFormat(num, precision, mantissa) {
  if (mantissa === undefined) mantissa = true;
  let e = num.log10().floor();
  let m = num.div(Decimal.pow(10, e));
  // 进位判断改成**数值**比较：原来是拿四舍五入后的字符串和数字 10 做 == 比较，
  // 依赖隐式类型转换；只要尾数四舍五入到 10（如 9.9e11034）就必须进位成 1e(指数+1)，
  // 否则会出现 "10e11034" 这种非规范写法（用户实拍）。数值判断与精度无关。
  if (m.gte(10) || Number(m.toStringWithDecimalPlaces(precision)) >= 10) {
    m = decimalOne;
    e = e.add(1);
  }
  if (e.gte(1e9)) e = format(e, 3);
  // 统一加千分位：原来只有指数 >= 10000 才走 commaFormat（<10000 走纯数字），
  // 于是指数在 9999 附近来回时显示会在 "e9999" 与 "e10,000" 两种风格间跳
  // （用户实报"航点超过 1e10000 逗号时隐时现"）。现在一律 commaFormat，
  // <1000 本来就没有逗号，不受影响。这一处**刻意偏离**上游输出，
  // 所以 format_parity 会在此区间报差异，属预期。
  else e = commaFormat(e, 0);
  if (mantissa) return m.toStringWithDecimalPlaces(precision) + 'e' + e;
  return 'e' + e;
}

function commaFormat(num, precision) {
  if (num === null || num === undefined) return 'NaN';
  if (num.mag < 0.001) return (0).toFixed(precision);
  const init = num.toStringWithDecimalPlaces(precision);
  const portions = init.split('.');
  portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  if (portions.length == 1) return portions[0];
  return portions[0] + '.' + portions[1];
}

function regularFormat(num, precision) {
  if (num === null || num === undefined) return 'NaN';
  if (num.mag < 0.0001) return (0).toFixed(precision);
  if (num.mag < 0.1 && precision !== 0) precision = Math.max(precision, 4);
  return num.toStringWithDecimalPlaces(precision);
}

function fixValue(x, y) {
  return x || new Decimal(y === undefined ? 0 : y);
}

function sumValues(x) {
  x = Object.values(x);
  if (!x[0]) return decimalZero;
  return x.reduce((a, b) => Decimal.add(a, b));
}

function format(decimal, precision, small) {
  if (precision === undefined) precision = 2;
  small = small || modInfo.allowSmall;
  decimal = new Decimal(decimal);
  if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
    player.hasNaN = true;
    return 'NaN';
  }
  if (decimal.sign < 0) return '-' + format(decimal.neg(), precision, small);
  if (decimal.mag == Number.POSITIVE_INFINITY) return 'Infinity';

  if (decimal.gte('eeee1000')) {
    const slog = decimal.slog();
    if (slog.gte(1e6)) return 'F' + format(slog.floor());
    return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + 'F' + commaFormat(slog.floor(), 0);
  } else if (decimal.gte('1e1000000')) return exponentialFormat(decimal, 0, false);
  else if (decimal.gte('1e10000')) return exponentialFormat(decimal, 0);
  else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision);
  else if (decimal.gte(1e3)) return commaFormat(decimal, 0);
  else if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision);
  else if (decimal.eq(0)) return (0).toFixed(precision);

  // 极小值：取倒数再格式化，前面加负号 / 用 ⁻¹
  decimal = invertOOM(decimal);
  if (decimal.lt('1e1000')) {
    const val = exponentialFormat(decimal, precision);
    return val.replace(/([^(?:e|F)]*)$/, '-$1');
  }
  return format(decimal, precision) + '⁻¹';
}

function formatWhole(decimal) {
  decimal = new Decimal(decimal);
  if (decimal.gte(1e9)) return format(decimal, 2);
  if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2);
  return format(decimal, 0);
}

function formatTime(s) {
  if (s < 60) return format(s) + 's';
  else if (s < 3600) return formatWhole(Math.floor(s / 60)) + 'm ' + format(s % 60) + 's';
  else if (s < 86400) return formatWhole(Math.floor(s / 3600)) + 'h ' + formatWhole(Math.floor(s / 60) % 60) + 'm ' + format(s % 60) + 's';
  else if (s < 31536000) return formatWhole(Math.floor(s / 86400) % 365) + 'd ' + formatWhole(Math.floor(s / 3600) % 24) + 'h ' + formatWhole(Math.floor(s / 60) % 60) + 'm ' + format(s % 60) + 's';
  return formatWhole(Math.floor(s / 31536000)) + 'y ' + formatWhole(Math.floor(s / 86400) % 365) + 'd ' + formatWhole(Math.floor(s / 3600) % 24) + 'h ' + formatWhole(Math.floor(s / 60) % 60) + 'm ' + format(s % 60) + 's';
}

function toPlaces(x, precision, maxAccepted) {
  x = new Decimal(x);
  let result = x.toStringWithDecimalPlaces(precision);
  if (new Decimal(result).gte(maxAccepted)) {
    result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision);
  }
  return result;
}

// 也会显示非常小的数
function formatSmall(x, precision) {
  return format(x, precision === undefined ? 2 : precision, true);
}

function invertOOM(x) {
  let e = x.log10().ceil();
  const m = x.div(Decimal.pow(10, e));
  e = e.neg();
  return new Decimal(10).pow(e).times(m);
}
