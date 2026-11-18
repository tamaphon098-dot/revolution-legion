// Revolution rings: thick bevelled pixel bands + gems on a crisp canvas, light on a blurred glow canvas.
import { RINGS, PAL } from './data.js';
import { circlePoints, pxText, textWidth } from './px.js';
import { fmt } from './num.js';

const GEM = ['0011100', '0122210', '1222221', '1223221', '0122210', '0011100'];

export class RingView {
  constructor(canvas, glow, game, size = 176) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.gcv = glow; this.gx = glow ? glow.getContext('2d') : null;
    this.g = game;
    this.t = 0;
    this.lapFlash = [0, 0, 0, 0];
    this.sync = 0; this.syncRings = [];
    this.disp = [0, 0, 0, 0];
    this.setSize(size);
  }
  setSize(size) {
    if (!Number.isFinite(size) || size < 64) size = 176;
    this.S = size;
    for (const c of [this.cv, this.gcv]) if (c) { c.width = size; c.height = size; c.style.width = size + 'px'; c.style.height = size + 'px'; }
  }
  radii() { const S = this.S; return [S * 0.44, S * 0.355, S * 0.27, S * 0.185].map(Math.round); }

  spun(d) { this.spinGlow = Math.min(1, (this.spinGlow || 0) + d * 2); this.hintDone = true; }

  onEvent(ev) {
    if (ev.type === 'lap') { this.lapFlash[ev.ring] = 0.14; this.pops = this.pops || []; if (this.pops.length < 6) this.pops.push({ ring: ev.ring, t: 0 }); }
    if (ev.type === 'combo') { this.sync = 0.35; this.syncRings = ev.rings; }
    if (ev.type === 'ascend') this.lapFlash[ev.ring] = 0.7;
  }

  gem(ctx, x, y, col, hi) {
    x = Math.round(x) - 3; y = Math.round(y) - 3;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      const v = GEM[r][c];
      if (v === '0') continue;
      ctx.fillStyle = v === '1' ? PAL.ink : v === '3' ? PAL.white : r < 3 ? hi : col;
      ctx.fillRect(x + c, y + r, 1, 1);
    }
  }

  draw(dt) {
    this.t += Math.max(0, dt || 0);
    const ctx = this.ctx, gx = this.gx, g = this.g, S = this.S, c = S >> 1;
    ctx.clearRect(0, 0, S, S);
    if (gx) gx.clearRect(0, 0, S, S);
    const R = this.radii();

    // --- rune circle backdrop (slowly rotating dotted rings + glyph ticks) ---
    const outer = R[0] + 8;
    const rot = (this.t * 0.02) % 1;
    ctx.fillStyle = PAL.plum;
    circlePoints(outer).forEach((p, k) => { if (k % 3 === 0) ctx.fillRect(c + p.x, c + p.y, 1, 1); });
    const op = circlePoints(outer + 4);
    for (let k = 0; k < 24; k++) {
      const p = op[Math.floor(((((k / 24 + rot) % 1) + 1) % 1) * op.length) % op.length];
      if (!p) continue;
      ctx.fillStyle = k % 6 === 0 ? PAL.rose : PAL.plum;
      ctx.fillRect(c + p.x - 1, c + p.y - 1, k % 6 === 0 ? 3 : 2, k % 6 === 0 ? 3 : 2);
    }
    ctx.fillStyle = PAL.slate;
    circlePoints(R[3] - 10).forEach((p, k) => { if (k % 2 === 0) ctx.fillRect(c + p.x, c + p.y, 1, 1); });

    // trigger line (dotted gold)
    ctx.fillStyle = this.sync > 0 ? PAL.white : PAL.gold;
    for (let y = c - R[0] - 6; y < c - 16; y += 3) ctx.fillRect(c, y, 1, 2);
    if (gx && this.sync > 0) { gx.fillStyle = PAL.white; gx.fillRect(c - 2, c - R[0] - 8, 5, R[0] - 8); }

    for (let i = 0; i < 4; i++) {
      if (!g.on(i)) {
        ctx.fillStyle = PAL.slate;
        circlePoints(R[i]).forEach((p, k) => { if (k % 5 === 0) ctx.fillRect(c + p.x, c + p.y, 1, 1); });
        continue;
      }
      const def = g.ringLook(i), rps = g.rps(i);
      let ang;
      if (rps <= 2) { ang = g.state.rings[i].angle; this.disp[i] = ang; }
      else { this.disp[i] = (this.disp[i] + 2 * (1 + Math.log10(rps / 2)) * dt) % 1; ang = this.disp[i]; }
      const flash = this.lapFlash[i] > 0 || (this.sync > 0 && this.syncRings.includes(i));

      // band: ink | lo | col | col | hi(top half) | ink
      const band = [[R[i] + 3, PAL.ink], [R[i] + 2, def.lo], [R[i] + 1, flash ? PAL.white : def.col], [R[i], flash ? PAL.white : def.col], [R[i] - 1, def.lo], [R[i] - 2, PAL.ink]];
      for (const [rr, col] of band) { ctx.fillStyle = col; for (const p of circlePoints(rr)) ctx.fillRect(c + p.x, c + p.y, 1, 1); }
      ctx.fillStyle = def.hi; // specular highlight on the upper-left of the band
      for (const p of circlePoints(R[i] + 1)) if (p.a > 0.7 || p.a < 0.08) ctx.fillRect(c + p.x, c + p.y, 1, 1);
      if (gx) { gx.globalAlpha = flash ? 0.9 : 0.35; gx.fillStyle = flash ? PAL.white : def.col; for (const p of circlePoints(R[i])) gx.fillRect(c + p.x - 1, c + p.y - 1, 3, 3); gx.globalAlpha = 1; }

      // comet trail behind each node
      const n = g.nodes(i), pts = circlePoints(R[i]);
      const trail = Math.min(0.32, 0.08 + Math.min(rps, 6) * 0.04);
      for (let k = 0; k < n; k++) {
        const a = (ang + k / n) % 1, base = Math.floor(a * pts.length);
        const len = Math.floor(pts.length * trail);
        for (let q = 0; q < len; q++) {
          const f = q / len;
          if ((f > 0.5 && q % 2) || (f > 0.8 && q % 3)) continue;
          const p = pts[(base - q + pts.length * 4) % pts.length];
          ctx.fillStyle = f < 0.2 ? PAL.white : def.hi;
          ctx.fillRect(c + p.x, c + p.y - 1, 1, 3 - Math.floor(f * 2));
          if (gx && f < 0.4) { gx.fillStyle = def.hi; gx.fillRect(c + p.x - 1, c + p.y - 1, 2, 2); }
        }
        const p = pts[base % pts.length];
        this.gem(ctx, c + p.x, c + p.y, def.col, def.hi);
        if (gx) { gx.fillStyle = def.hi; gx.fillRect(c + p.x - 3, c + p.y - 3, 7, 7); }
      }
      // trigger notch
      ctx.fillStyle = PAL.ink; ctx.fillRect(c - 3, c - R[i] - 7, 7, 4);
      ctx.fillStyle = flash ? PAL.white : PAL.lemon; ctx.fillRect(c - 2, c - R[i] - 6, 5, 2); ctx.fillRect(c - 1, c - R[i] - 4, 3, 1);
      this.lapFlash[i] -= dt;
    }
    this.sync -= dt;
    // lap pops: '×1.01' rising from the trigger notch
    for (const p of this.pops || []) {
      p.t += dt;
      const y = c - R[p.ring] - 16 - Math.floor(p.t * 20);
      if (p.t < 0.9 && !(p.t > 0.7 && Math.floor(p.t * 12) % 2)) pxText(ctx, '×1.01', c + 6, y, g.ringLook(p.ring).hi, 1, PAL.ink, PAL.white);
    }
    this.pops = (this.pops || []).filter((p) => p.t < 0.9);

    // crank feedback + first-time hint
    this.spinGlow = Math.max(0, (this.spinGlow || 0) - dt * 1.5);
    if (gx && this.spinGlow > 0) { gx.globalAlpha = this.spinGlow * 0.6; gx.fillStyle = PAL.white; for (const p of circlePoints(R[0])) gx.fillRect(c + p.x - 2, c + p.y - 2, 5, 5); gx.globalAlpha = 1; }
    if (!this.hintDone && !this.g.state.stats.spun) {
      const k = (this.t % 1.6) / 1.6, pts = circlePoints(R[0] + 10), p = pts[Math.floor(((0.1 + k * 0.3) % 1) * pts.length)];
      ctx.fillStyle = PAL.white; ctx.fillRect(c + p.x - 2, c + p.y - 2, 5, 5);
      ctx.fillStyle = PAL.ink; ctx.fillRect(c + p.x - 1, c + p.y - 1, 3, 3);
    }
    // --- centre medallion: ink disc, gold rim with 8 studs, number in two tones ---
    const mr = Math.round(S * 0.135);
    ctx.fillStyle = PAL.ink;
    for (let y = -mr; y <= mr; y++) { const w = Math.round(Math.sqrt(mr * mr - y * y)); ctx.fillRect(c - w, c + y, w * 2 + 1, 1); }
    for (const [rr, col] of [[mr, PAL.bark], [mr - 1, PAL.gold], [mr - 2, PAL.lemon], [mr - 3, PAL.bark]]) { ctx.fillStyle = col; for (const p of circlePoints(rr)) ctx.fillRect(c + p.x, c + p.y, 1, 1); }
    const sp = circlePoints(mr - 1);
    for (let k = 0; k < 8; k++) { const p = sp[Math.floor((k / 8) * sp.length)]; ctx.fillStyle = PAL.white; ctx.fillRect(c + p.x, c + p.y, 1, 1); }
    if (gx) { gx.fillStyle = PAL.gold; gx.globalAlpha = 0.3; for (const p of circlePoints(mr)) gx.fillRect(c + p.x - 1, c + p.y - 1, 3, 3); gx.globalAlpha = 1; }
    const txt = '×' + fmt(g.totalMultL(), 1);
    const sc = textWidth(txt, 2) <= mr * 2 + 30 ? 2 : 1;
    pxText(ctx, txt, c - (textWidth(txt, sc) >> 1), c - Math.round(3.5 * sc), PAL.lemon, sc, PAL.ink, PAL.orange);
  }
}
