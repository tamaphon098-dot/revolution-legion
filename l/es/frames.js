// Generates ornate pixel-art 9-slice frames at startup and exposes them as CSS variables
// (--f-panel, --f-gold, ...). Hand-placed pixels: ink outline, bevelled metal rim, corner gems.
import { PAL } from './data.js';

function frame({ size = 24, cut = 8, rimHi, rim, rimLo, inner, fill, fillHi, gem, gemHi, rivets = true }) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const x = c.getContext('2d');
  const px = (col, a, b, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const S = size;
  // fill
  px(fill, 3, 3, S - 6, S - 6);
  if (fillHi) px(fillHi, 4, 4, S - 8, 1);
  // ink outline (with notched corners)
  px(PAL.ink, 1, 0, S - 2, 1); px(PAL.ink, 1, S - 1, S - 2, 1); px(PAL.ink, 0, 1, 1, S - 2); px(PAL.ink, S - 1, 1, 1, S - 2);
  // metal rim: light top/left, dark bottom/right
  px(rimHi, 1, 1, S - 2, 1); px(rimHi, 1, 1, 1, S - 2);
  px(rim, 2, 2, S - 4, 1); px(rim, 2, 2, 1, S - 4); px(rim, 1, S - 3, S - 2, 1); px(rim, S - 3, 1, 1, S - 2);
  px(rimLo, 1, S - 2, S - 2, 1); px(rimLo, S - 2, 1, 1, S - 2);
  // inner ink line
  px(inner, 3, 3, S - 6, 1); px(inner, 3, 3, 1, S - 6); px(inner, 3, S - 4, S - 6, 1); px(inner, S - 4, 3, 1, S - 6);
  // rivets in the middle of each edge (stretched region repeats them visually as studs)
  if (rivets) for (const [a, b] of [[S / 2 - 1, 1], [S / 2 - 1, S - 3], [1, S / 2 - 1], [S - 3, S / 2 - 1]]) { px(rimHi, a, b, 2, 1); px(rimLo, a, b + 1, 2, 1); }
  // corner gems (5x5 diamonds sitting on the rim)
  if (gem) for (const [a, b] of [[0, 0], [S - 5, 0], [0, S - 5], [S - 5, S - 5]]) {
    px(PAL.ink, a + 1, b, 3, 5); px(PAL.ink, a, b + 1, 5, 3);
    px(gem, a + 2, b + 1, 1, 3); px(gem, a + 1, b + 2, 3, 1);
    px(gemHi, a + 2, b + 1, 1, 1);
  }
  void cut;
  return c.toDataURL();
}

export function installFrames() {
  const root = document.documentElement.style;
  const set = (name, url) => root.setProperty(name, `url(${url})`);
  set('--f-panel', frame({ rimHi: PAL.lemon, rim: PAL.gold, rimLo: PAL.bark, inner: PAL.ink, fill: '#2a2f4d', fillHi: PAL.slate, gem: PAL.red, gemHi: PAL.pink }));
  set('--f-plain', frame({ rimHi: PAL.mist, rim: PAL.steel, rimLo: PAL.night, inner: PAL.ink, fill: PAL.night, fillHi: PAL.slate, gem: null, rivets: false }));
  set('--f-gold', frame({ size: 16, rimHi: PAL.white, rim: PAL.lemon, rimLo: PAL.orange, inner: PAL.orange, fill: PAL.gold, fillHi: PAL.lemon, gem: null, rivets: false }));
  set('--f-blue', frame({ size: 16, rimHi: PAL.white, rim: PAL.cyan, rimLo: PAL.sea, inner: PAL.sea, fill: PAL.sky, fillHi: PAL.cyan, gem: null, rivets: false }));
  set('--f-red', frame({ size: 16, rimHi: PAL.white, rim: PAL.pink, rimLo: PAL.blood, inner: PAL.blood, fill: PAL.red, fillHi: PAL.pink, gem: null, rivets: false }));
  set('--f-rose', frame({ size: 16, rimHi: PAL.white, rim: PAL.pink, rimLo: PAL.plum, inner: PAL.plum, fill: PAL.rose, fillHi: PAL.pink, gem: null, rivets: false }));
  set('--f-off', frame({ size: 16, rimHi: PAL.mist, rim: PAL.steel, rimLo: PAL.night, inner: PAL.night, fill: PAL.slate, fillHi: PAL.steel, gem: null, rivets: false }));
  set('--f-lemon', frame({ size: 16, rimHi: PAL.white, rim: PAL.white, rimLo: PAL.gold, inner: PAL.gold, fill: PAL.lemon, fillHi: PAL.white, gem: null, rivets: false }));
}
