// Pixel-art helpers: bitmap number font, pixel circles, image loading.
import { PAL } from './data.js';

// ---------- 5x7 bitmap font for numbers (crisp at any integer scale) ----------
const G = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '.': ['00', '00', '00', '00', '00', '11', '11'],
  ',': ['00', '00', '00', '00', '00', '01', '10'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01110'],
  '×': ['00000', '10001', '01010', '00100', '01010', '10001', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '!': ['1', '1', '1', '1', '1', '0', '1'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
  L: ['1000', '1000', '1000', '1000', '1000', '1000', '1111'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
};

// Non-bitmap glyphs (kanji units, ∞) are rasterised once from DotGothic16 and thresholded to 1-bit pixels.
const RAST = {};
function raster(ch) {
  if (RAST[ch]) return RAST[ch];
  const c = document.createElement('canvas');
  c.width = 18; c.height = 18;
  const x = c.getContext('2d');
  x.font = '16px DotGothic16';
  x.textBaseline = 'top';
  x.fillStyle = '#fff';
  x.fillText(ch, 0, 1);
  const d = x.getImageData(0, 0, 18, 18).data;
  const rows = [];
  let maxX = 0;
  for (let y = 0; y < 18; y++) {
    let r = '';
    for (let xx = 0; xx < 18; xx++) { const on = d[(y * 18 + xx) * 4 + 3] > 110; r += on ? '1' : '0'; if (on) maxX = Math.max(maxX, xx); }
    rows.push(r);
  }
  // trim empty rows top/bottom so the glyph sits on the digit baseline
  while (rows.length && !rows[0].includes('1')) rows.shift();
  while (rows.length && !rows[rows.length - 1].includes('1')) rows.pop();
  const g = { rows: rows.map((r) => r.slice(0, maxX + 1)), big: true };
  RAST[ch] = g;
  return g;
}
function glyph(ch) { return G[ch] ? { rows: G[ch], big: false } : raster(ch); }
function gScale(g, scale) { return g.big ? Math.max(1, Math.round(scale / 2)) : scale; }

export function textWidth(str, scale = 1) {
  let w = 0;
  for (const ch of str) { const g = glyph(ch), s = gScale(g, scale); w += ((g.rows[0] || '0').length + 1) * s; }
  return w - scale;
}

// Draws pixel text with a 1-pixel (scaled) ink outline. Returns width.
export function pxText(ctx, str, x, y, color, scale = 1, outline = PAL.ink, color2 = null) {
  x = Math.round(x); y = Math.round(y);
  const base = 7 * scale; // digit cap height; big glyphs are bottom-aligned to it
  const draw = (ox, oy, col) => {
    ctx.fillStyle = col;
    let cx = x + ox;
    for (const ch of str) {
      const gl = glyph(ch), s = gScale(gl, scale), rows = gl.rows, h = rows.length;
      const top = y + oy + (gl.big ? base - h * s + s : 0);
      for (let r = 0; r < h; r++) {
        if (color2 && col !== outline) ctx.fillStyle = r < h * 0.55 ? col : color2;
        for (let c = 0; c < rows[r].length; c++) if (rows[r][c] === '1') ctx.fillRect(cx + c * s, top + r * s, s, s);
      }
      cx += ((rows[0] || '0').length + 1) * s;
    }
  };
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 2], [1, 2], [-1, 2]]) draw(ox * scale, oy * scale, outline);
  draw(0, 0, color);
  return textWidth(str, scale);
}

// ---------- pixel circle point lists (cached), sorted by angle from 12 o'clock clockwise ----------
const circleCache = {};
export function circlePoints(r) {
  if (circleCache[r]) return circleCache[r];
  const pts = [];
  const seen = new Set();
  for (let a = 0; a < 3600; a++) {
    const t = (a / 3600) * Math.PI * 2;
    const x = Math.round(Math.sin(t) * r), y = Math.round(-Math.cos(t) * r);
    const k = x + ',' + y;
    if (!seen.has(k)) { seen.add(k); pts.push({ x, y, a: a / 3600 }); }
  }
  circleCache[r] = pts;
  return pts;
}

// ---------- images ----------
export const IMG = {};
export function loadImages(names, base = 'px/') {
  return Promise.all(names.map((n) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; res(); };
    im.onerror = () => res();
    im.src = base + n + '.png';
  })));
}

// Recolour a sprite: every opaque pixel -> colour (hit flash), or only outline pixels (rank aura).
const tintCache = {};
export function tinted(name, color, outlineOnly = false) {
  const key = name + color + outlineOnly;
  if (tintCache[key]) return tintCache[key];
  const im = IMG[name];
  if (!im) return null;
  const c = document.createElement('canvas');
  c.width = im.width; c.height = im.height;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height);
  const [r, g, b] = [1, 3, 5].map((o) => parseInt(color.slice(o, o + 2), 16));
  for (let p = 0; p < d.data.length; p += 4) {
    if (d.data[p + 3] === 0) continue;
    const isInk = d.data[p] === 24 && d.data[p + 1] === 20 && d.data[p + 2] === 37;
    if (!outlineOnly || isInk) { d.data[p] = r; d.data[p + 1] = g; d.data[p + 2] = b; }
  }
  x.putImageData(d, 0, 0);
  tintCache[key] = c;
  return c;
}

// Break a sprite into chunky pixel debris for death animations.
const chunkCache = {};
export function chunks(name, size = 3) {
  if (chunkCache[name]) return chunkCache[name];
  const im = IMG[name];
  if (!im) return [];
  const c = document.createElement('canvas');
  c.width = im.width; c.height = im.height;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const out = [];
  for (let y = 0; y < im.height; y += size) for (let xx = 0; xx < im.width; xx += size) {
    const p = (y * im.width + xx) * 4;
    if (d[p + 3] > 0) out.push({ x: xx, y, c: `rgb(${d[p]},${d[p + 1]},${d[p + 2]})` });
  }
  chunkCache[name] = out;
  return out;
}
