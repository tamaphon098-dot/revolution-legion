// Big numbers are stored as log10 values (a plain JS float). 0 => 1, 3 => 1000, -Infinity => 0.
export const ZERO = -Infinity;
export const L = (x) => (x <= 0 ? ZERO : Math.log10(x));

export function ladd(a, b) {
  if (a === ZERO) return b;
  if (b === ZERO) return a;
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (hi - lo > 17) return hi;
  return hi + Math.log10(1 + Math.pow(10, lo - hi));
}

// a - b, clamped at zero
export function lsub(a, b) {
  if (b === ZERO) return a;
  if (b >= a) return ZERO;
  if (a - b > 17) return a;
  return a + Math.log10(1 - Math.pow(10, b - a));
}

// Japanese large-number units. Each unit = 10^4. Past 無量大数 (1e68) we switch to e-notation; ∞ at the double limit.
export const UNITS = ['', '万', '億', '兆', '京', '垓', '秭', '穣', '溝', '澗', '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'];
export const INF = Math.log10(1.7976931348623157e308);
export const NUMCFG = { broken: false, lang: globalThis.RL_LANG || 'ja' }; // after Break Infinity numbers keep going past ∞
const MYRIAD = {
  ja: UNITS,
  'zh-TW': ['', '萬', '億', '兆', '京', '垓', '秭', '穰', '溝', '澗', '正', '載', '極', '恆河沙', '阿僧祇', '那由他', '不可思議', '無量大數'],
  'zh-CN': ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祇', '那由他', '不可思议', '无量大数'],
  ko: ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극', '항하사', '아승기', '나유타', '불가사의', '무량대수'],
};
// short scale for languages without myriad units
const SHORT = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg'];

export function fmt(l) {
  if (l === ZERO || !isFinite(l) || l < -9) return l === Infinity ? '∞' : '0';
  if (l >= INF && !NUMCFG.broken) return '∞';
  if (l < 4) {
    const v = Math.pow(10, l);
    if (v < 10 && Math.abs(v - Math.round(v)) > 1e-6) return v.toFixed(2);
    return Math.floor(v + 1e-9).toLocaleString('en-US');
  }
  if (l >= 72) {
    let e = Math.floor(l), m = Math.pow(10, l - e);
    if (m >= 9.995) { m = 1; e += 1; }
    return m.toFixed(2) + 'e' + e;
  }
  const my = MYRIAD[NUMCFG.lang];
  const g = my ? 4 : 3, units = my || SHORT;
  const u = Math.min(units.length - 1, Math.floor(l / g));
  const v = Math.pow(10, l - u * g);
  const s = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : String(Math.floor(v));
  return s + units[u];
}

// plain number formatting for small counters (speeds, multipliers)
export function fnum(v, d = 1) {
  if (v >= 1e6) return fmt(L(v));
  if (v >= 1000) return Math.floor(v).toLocaleString('en-US');
  return v.toFixed(d);
}
