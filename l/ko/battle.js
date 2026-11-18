// Battle scene: crisp pixel layer + a blurred additive "bloom" layer on top (#bglow).
// Every glowing thing is drawn twice: sharp on the pixel canvas, soft on the glow canvas.
import { IMG, tinted, chunks, pxText, textWidth, circlePoints } from './px.js';
import { RINGS, HEROES, RANKS, RARITY, PAL } from './data.js';
import { fmt } from './num.js';

const ORDER = ['nox', 'elia', 'seris', 'leon'];
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const WORLD_LIGHT = [PAL.lemon, PAL.cyan, PAL.orange, PAL.rose];
const FORE = [[PAL.forest, PAL.deep || '#265c42'], [PAL.white, PAL.cloud], [PAL.bark, PAL.coffee || '#3e2731'], [PAL.plum, PAL.rose]];

export class BattleView {
  constructor(canvas, glow, game) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.gcv = glow; this.gx = glow.getContext('2d');
    this.g = game;
    this.t = 0; this.stop = 0; this.shake = 0; this.flash = 0;
    this.anim = {};
    this.cd = [0, 0, 0, 0];
    this.parts = []; this.fx = []; this.nums = []; this.debris = []; this.drops = [];
    this.enemyHit = 0; this.enemyIn = 0;
    this.grass = Array.from({ length: 26 }, (_, k) => ({ x: k * 15 + ri(-4, 4), h: ri(4, 9), ph: rnd(0, 6) }));
    this.resize();
  }

  resize() {
    const r = this.cv.getBoundingClientRect();
    const scale = document.getElementById('app').getBoundingClientRect().width / 360;
    this.W = 360;
    this.H = Math.max(120, Math.round(r.height / scale));
    for (const c of [this.cv, this.gcv]) { c.width = this.W; c.height = this.H; }
    this.ground = this.H - 14;
  }

  heroPos(id) {
    const r = HEROES[id].ring;
    const x = [160, 116, 78, 38][r];
    const dy = [0, -3, -6, -3][r];
    return { x, y: this.ground + dy };
  }
  escale() {
    const e = this.g.enemy;
    if (!e) return 1;
    const im = IMG[e.s];
    let s = e.boss ? (e.scale || 1) : 1;
    if (im) s = Math.min(s, (this.H - 24) / im.height);
    return Math.max(0.5, Math.round(s * 4) / 4);
  }
  enemyPos() {
    const e = this.g.enemy, im = e && IMG[e.s], sc = this.escale();
    const slide = Math.max(0, 1 - this.enemyIn / 0.25) * 100;
    const x = Math.round((e && e.boss ? 274 : 286) + slide);
    const h = im ? Math.round(im.height * sc) : 40;
    return { x, y: this.ground, top: this.ground - h, cy: this.ground - Math.round(h / 2), h };
  }

  // ---------------- events ----------------
  onEvent(ev) {
    const ep = this.enemyPos();
    switch (ev.type) {
      case 'hit': return this.onHit(ev, ep);
      case 'combo':
        if (this.comboCd > 0) return;
        this.comboCd = 0.7;
        this.stop = Math.max(this.stop, 0.08); this.shake = Math.max(this.shake, 4 + ev.n); this.flash = Math.max(this.flash, 0.15 + ev.n * 0.05);
        for (const r of ev.rings) { const hp = this.heroPos(this.g.heroId(r)); this.fx.push({ k: 'bolt', t: 0, d: 0.32, x0: hp.x + 8, y0: hp.y - 34, x1: ep.x, y1: ep.cy, c: RINGS[r].col, seed: Math.random() * 1000 }); }
        this.fx.push({ k: 'nova', t: 0, d: 0.5, x: ep.x, y: ep.cy, cs: ev.rings.map((r) => RINGS[r].col) });
        this.num(ev.dmg, ep, PAL.white, PAL.pink, 3, true);
        return;
      case 'kill': {
        const im = IMG[ev.sprite];
        if (im && this.debris.length < 360) {
          const sc = this.escale();
          for (const c of chunks(ev.sprite)) {
            if (Math.random() < 0.5) continue;
            this.debris.push({ x: ep.x - (im.width * sc) / 2 + c.x * sc, y: ep.y - im.height * sc + c.y * sc, vx: rnd(-30, 80), vy: rnd(-110, -20), c: c.c, life: rnd(0.4, 0.8), s: Math.max(2, Math.round(3 * sc)) });
          }
        }
        for (let k = 0; k < (ev.boss ? 12 : 4); k++) this.parts.push({ coin: 1, x: ep.x + rnd(-8, 8), y: ep.cy, vx: rnd(-60, 20), vy: rnd(-130, -60), g: 280, life: 1.1 });
        this.fx.push({ k: 'pop', t: 0, d: 0.3, x: ep.x, y: ep.cy });
        if (ev.boss) { this.stop = 0.14; this.shake = 10; this.flash = 0.6; }
        return;
      }
      case 'spawn': this.enemyIn = 0; return;
      case 'perfect': {
        this.pf = { t: 0, streak: ev.streak };
        this.stop = Math.max(this.stop, 0.05); this.shake = Math.max(this.shake, 4); this.flash = Math.max(this.flash, 0.12);
        this.anim[this.g.heroId(ev.ring)] = 1;
        this.fx.push({ k: 'nova', t: 0, d: 0.35, x: ep.x, y: ep.cy, cs: [PAL.white, RINGS[ev.ring].col] });
        this.spark(ep.x, ep.cy, PAL.lemon, 10);
        this.num(ev.dmg, ep, PAL.white, PAL.lemon, 2, true);
        return;
      }
      case 'drop':
        this.drops.push({ it: ev.item, x: ep.x, y: ep.cy, vy: -130, t: 0, isNew: ev.isNew });
        if (ev.isNew || ev.item.rar >= 2) { this.stop = Math.max(this.stop, 0.12); this.flash = Math.max(this.flash, 0.2); }
        return;
      case 'burst': this.flash = 0.7; this.shake = 8; return;
      case 'unit': this.flash = 0.8; this.shake = 10; this.stop = 0.2; for (let k = 0; k < 40; k++) this.parts.push({ x: rnd(0, 360), y: rnd(0, this.H), vx: rnd(-30, 30), vy: rnd(-90, -20), life: 1, d: 1.4, c: PAL.lemon, glow: 1 }); return;
      case 'ascend': {
        const hp = this.heroPos(this.g.heroId(ev.ring));
        this.fx.push({ k: 'pillar', t: 0, d: 1.1, x: hp.x, c: RINGS[ev.ring].col });
        for (let k = 0; k < 30; k++) this.parts.push({ x: hp.x + rnd(-12, 12), y: hp.y - rnd(0, 50), vx: rnd(-20, 20), vy: rnd(-90, -30), life: 1, d: 1.2, c: RINGS[ev.ring].hi, glow: 1 });
        this.flash = 0.4;
      }
    }
  }

  onHit(ev, ep) {
    const i = ev.ring;
    if (ev.tap) return; // tap visuals are drawn instantly by tapFx
    if (this.cd[i] > 0) return; // fast rings still deal every hit; visuals are paced
    this.cd[i] = [0.2, 0.28, 0.5, 0.65][i];
    const id = this.g.heroId(i), hp = this.heroPos(id);
    this.anim[id] = 1;
    if (i === 0) {
      const rk = this.g.rank(this.g.heroId(0)), n = 1 + Math.min(2, rk);
      for (let k = 0; k < n; k++) this.fx.push({ k: 'slash', t: -k * 0.06, d: 0.22, x: ep.x + ri(-6, 6), y: ep.cy + ri(-10, 10), r: 18 + k * 4, flip: k % 2, c: rk >= 4 ? PAL.lemon : PAL.white, c2: rk >= 4 ? PAL.orange : PAL.red });
      this.enemyHit = 1; this.shake = Math.max(this.shake, 2); this.stop = Math.max(this.stop, 0.03);
      this.spark(ep.x - 6, ep.cy, PAL.lemon, 7);
    } else if (i === 1) {
      for (let k = 0; k < 4; k++) this.fx.push({ k: 'shard', t: -k * 0.05, d: 0.3, x0: hp.x + 12, y0: hp.y - 40, x1: ep.x + ri(-8, 8), y1: ep.cy + ri(-14, 14) });
      this.fx.push({ k: 'circle', t: 0, d: 0.4, x: hp.x, y: hp.y, c: PAL.cyan });
    } else if (i === 2) {
      this.fx.push({ k: 'circle', t: 0, d: 0.6, x: hp.x, y: hp.y, c: PAL.lemon, big: 1 });
      for (let k = 0; k < 12; k++) this.parts.push({ x: rnd(10, 190), y: this.ground - rnd(0, 8), vx: 0, vy: rnd(-45, -20), life: 1, d: 1, c: PAL.lemon, glow: 1 });
    } else {
      this.fx.push({ k: 'spirit', t: 0, d: 0.65, x0: hp.x, y0: hp.y - 56 });
      this.fx.push({ k: 'circle', t: 0, d: 0.45, x: hp.x, y: hp.y, c: PAL.rose });
    }
    const cols = [[PAL.white, PAL.lemon], [PAL.white, PAL.cyan], [PAL.white, PAL.lemon], [PAL.white, PAL.pink]][i];
    if (ev.crit) { this.num(ev.dmg, ep, PAL.lemon, PAL.orange, 2, true); this.stop = Math.max(this.stop, 0.07); this.shake = 5; }
    else this.num(ev.dmg, ep, cols[0], cols[1], 1);
  }

  drawPerfect(dt) {
    if (!this.pf) return;
    this.pf.t += dt;
    if (this.pf.t > 0.7) { this.pf = null; return; }
    const sc = this.pf.t < 0.08 ? 3 : 2, y = 64 - Math.floor(this.pf.t * 16);
    const txt = 'PERFECT!', w = textWidth(txt, sc);
    pxText(this.ctx, txt, (this.W - w) >> 1, y, PAL.lemon, sc, PAL.ink, PAL.orange);
    if (this.pf.streak > 1) { const s2 = this.pf.streak + '연'; pxText(this.ctx, s2, (this.W - textWidth(s2, 2)) >> 1, y + 22, PAL.white, 2, PAL.ink, PAL.cyan); }
    this.gx.fillStyle = PAL.gold; this.gx.fillRect(((this.W - w) >> 1) - 4, y - 2, w + 8, 7 * sc + 4);
  }

  tapFx() {
    const ep = this.enemyPos();
    this.anim[this.g.heroId(0)] = 1;
    this.fx.push({ k: 'slash', t: 0, d: 0.18, x: ep.x + ri(-8, 8), y: ep.cy + ri(-12, 12), r: 14, flip: Math.random() < 0.5 ? 1 : 0, c: PAL.white, c2: PAL.lemon });
    this.enemyHit = Math.max(this.enemyHit, 0.7);
    this.spark(ep.x, ep.cy, PAL.white, 4);
  }

  num(dl, ep, c1, c2, scale, big = false) {
    if (!big && this.numCd > 0) return; // small numbers are sparse; crits/combos always show
    if (!big) this.numCd = 0.6;
    if (this.nums.length > 4) this.nums.shift();
    this.lane = ((this.lane || 0) + 1) % 4;
    this.nums.push({ s: fmt(dl), x: ep.x - 34 + this.lane * 6, y: Math.max(16, ep.top + this.lane * 14), t: 0, c1, c2, scale });
  }
  spark(x, y, c, n) {
    for (let k = 0; k < n; k++) { const a = rnd(0, 6.28), v = rnd(50, 140); this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, d: rnd(0.15, 0.35), c, glow: 1 }); }
  }

  // ---------------- frame ----------------
  draw(dt) {
    const ctx = this.ctx, gx = this.gx, g = this.g;
    ctx.imageSmoothingEnabled = false; gx.imageSmoothingEnabled = false;
    for (let i = 0; i < 4; i++) this.cd[i] -= dt;
    this.comboCd = (this.comboCd || 0) - dt;
    this.numCd = (this.numCd || 0) - dt;
    let adt = dt;
    if (this.stop > 0) { this.stop -= dt; adt = 0; }     // hit-stop
    this.t += adt; this.enemyIn += adt;
    this.update(adt);

    const sx = this.shake > 0.5 ? ri(-1, 1) * Math.ceil(this.shake / 3) : 0;
    const sy = this.shake > 0.5 ? ri(-1, 1) * Math.ceil(this.shake / 4) : 0;
    this.shake = Math.max(0, this.shake - dt * 30);
    ctx.setTransform(1, 0, 0, 1, sx, sy);
    gx.setTransform(1, 0, 0, 1, 0, 0);
    gx.clearRect(0, 0, this.W, this.H);
    gx.setTransform(1, 0, 0, 1, sx, sy);

    const bg = IMG[g.worldDef().bg];
    if (bg) {
      const gy = this.H - bg.height + 4;
      // the canvas can be taller than the backdrop: extend the sky's top row so no empty strip shows (incl. during shake)
      if (gy > -4) ctx.drawImage(bg, 0, 0, bg.width, 1, -4, -4, this.W + 8, gy + 5);
      ctx.drawImage(bg, 0, gy);
    }
    this.rays();
    this.ambient();
    for (const r of [3, 2, 1, 0]) if (g.on(r)) this.hero(g.heroId(r));
    this.drawPerfect(adt);
    this.enemy(adt);
    for (const d of this.debris) { ctx.fillStyle = d.c; ctx.fillRect(Math.round(d.x), Math.round(d.y), d.s, d.s); }
    this.fore();
    this.renderFx(ctx, false);
    this.renderFx(gx, true);
    this.renderParts();
    this.renderDrops();
    this.renderNums();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    gx.setTransform(1, 0, 0, 1, 0, 0);

    if (g.state.od > 0) {
      ctx.fillStyle = PAL.lemon; gx.fillStyle = PAL.orange;
      for (let k = 0; k < 9; k++) { const y = (k * 23 + Math.floor(this.t * 420)) % this.H, x = (k * 71) % this.W; ctx.fillRect(x, y, 26, 1); gx.fillRect(x, y - 1, 26, 3); }
    }
    if (this.g.state.fxLow) this.flash = Math.min(this.flash, 0.15);
    if (this.flash > 0) {
      gx.globalAlpha = Math.min(0.6, this.flash); gx.fillStyle = PAL.white; gx.fillRect(0, 0, this.W, this.H); gx.globalAlpha = 1;
      ctx.globalAlpha = Math.min(0.5, this.flash); ctx.fillStyle = PAL.white; ctx.fillRect(0, 0, this.W, this.H); ctx.globalAlpha = 1;
      this.flash -= dt * 3;
    }
    this.vignette();
    this.hud();
  }

  update(dt) {
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter((f) => f.t < f.d);
    if (this.fx.length > 120) this.fx.splice(0, this.fx.length - 120);
    for (const d of this.debris) {
      d.vy += 320 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt;
      if (d.y > this.ground) { d.y = this.ground; d.vy *= -0.3; d.vx *= 0.6; }
    }
    this.debris = this.debris.filter((d) => d.life > 0);
    for (const p of this.parts) {
      p.life -= dt / (p.d || 1);
      p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.coin && p.life < 0.5) { p.x += (8 - p.x) * dt * 8; p.y += (-12 - p.y) * dt * 8; p.vx = p.vy = p.g = 0; }
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    if (this.parts.length > 320) this.parts.splice(0, this.parts.length - 320);
  }

  rays() { // soft light shafts from the sky (glow layer only)
    const gx = this.gx, col = WORLD_LIGHT[this.g.state.world];
    gx.fillStyle = col;
    for (let k = 0; k < 3; k++) {
      const x0 = 30 + k * 110 + Math.sin(this.t * 0.3 + k) * 12;
      gx.globalAlpha = 0.05 + 0.025 * Math.sin(this.t * 0.7 + k * 2);
      gx.beginPath(); gx.moveTo(x0, -4); gx.lineTo(x0 + 26, -4); gx.lineTo(x0 + 80, this.ground); gx.lineTo(x0 + 40, this.ground); gx.closePath(); gx.fill();
    }
    gx.globalAlpha = 1;
  }

  ambient() {
    const ctx = this.ctx, gx = this.gx, w = this.g.state.world, snow = w === 1;
    this.amb = this.amb || Array.from({ length: 22 }, () => ({ x: rnd(0, 360), y: rnd(0, 200), v: rnd(4, 12), s: Math.random() < 0.3 ? 2 : 1 }));
    const col = [PAL.lemon, PAL.white, PAL.gold, PAL.cyan][w];
    for (const p of this.amb) {
      p.x += p.v * 0.016 * (snow ? -0.5 : 1); p.y += (snow ? 0.25 : -0.05);
      if (p.x > 362) p.x = -2; if (p.x < -2) p.x = 362; if (p.y < -2) p.y = this.H; if (p.y > this.H) p.y = 0;
      if (Math.floor(this.t * 3 + p.x) % 5 === 0) continue;
      ctx.fillStyle = col; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      gx.fillStyle = col; gx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, p.s + 2, p.s + 2);
    }
  }

  fore() { // swaying foreground tufts in front of the feet (depth)
    const ctx = this.ctx, [c1, c2] = FORE[this.g.state.world];
    for (const gr of this.grass) {
      const sway = Math.round(Math.sin(this.t * 1.6 + gr.ph));
      const x = gr.x, y = this.H;
      ctx.fillStyle = c2; ctx.fillRect(x - 2, y - gr.h + 3, 5, gr.h);
      ctx.fillStyle = c1; ctx.fillRect(x + sway, y - gr.h, 2, gr.h); ctx.fillRect(x - 2 + sway, y - gr.h + 3, 2, gr.h - 3); ctx.fillRect(x + 3 + sway, y - gr.h + 4, 2, gr.h - 4);
    }
  }

  vignette() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(24,20,37,0.35)';
    ctx.fillRect(0, 0, this.W, 2); ctx.fillRect(0, 0, 2, this.H); ctx.fillRect(this.W - 2, 0, 2, this.H);
    ctx.fillStyle = 'rgba(24,20,37,0.18)';
    ctx.fillRect(0, 2, this.W, 3); ctx.fillRect(2, 0, 3, this.H); ctx.fillRect(this.W - 5, 0, 3, this.H);
  }

  shadow(x, y, w) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(24,20,37,0.4)';
    ctx.fillRect(Math.round(x - w / 2), y, Math.round(w), 2);
    ctx.fillRect(Math.round(x - w / 2 + 3), y + 2, Math.round(w - 6), 1);
  }

  hero(id) {
    const ctx = this.ctx, gx = this.gx, im = IMG[HEROES[id].sprite];
    if (!im) return;
    const p = this.heroPos(id), a = this.anim[id] || 0;
    this.anim[id] = Math.max(0, a - 0.016 * 5);
    const bob = Math.floor(this.t * 2 + p.x) % 2;
    let dx = 0, dy = 0;
    if (a > 0) { if (id === 'leon') dx = a > 0.6 ? 18 : a > 0.3 ? 10 : 3; else dy = a > 0.5 ? -4 : -1; }
    const x = p.x - (im.width >> 1) + dx, y = p.y - im.height + bob + dy;
    this.shadow(p.x + dx, p.y, im.width * 0.6);
    const rank = this.g.rank(id);
    if (rank >= 1) {
      const col = RANKS[rank].col, full = tinted(HEROES[id].sprite, col);
      // rank aura = coloured silhouette offset behind the sprite (a clean 1px rim), plus soft bloom
      if (full && (rank >= 3 || Math.floor(this.t * 3) % 2)) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(full, x + ox, y + oy);
      if (full) { gx.globalAlpha = 0.12 + rank * 0.05; gx.drawImage(full, x, y); gx.globalAlpha = 1; }
      if (rank >= 3 && Math.random() < 0.35) this.parts.push({ x: x + rnd(0, im.width), y: y + rnd(0, im.height), vx: 0, vy: -24, life: 1, d: 0.6, c: col, glow: 1 });
    }
    const st = this.g.state;
    if ((st.supporter || st.aura) && Math.random() < 0.25) this.parts.push({ x: x + rnd(0, im.width), y: y + rnd(0, im.height), vx: 0, vy: -18, life: 1, d: 0.7, c: st.aura ? [PAL.pink, PAL.cyan, PAL.lemon, PAL.leaf][Math.floor(Math.random() * 4)] : PAL.gold, glow: 1 });
    if (id === 'leon' && a > 0.5) { ctx.globalAlpha = 0.4; ctx.drawImage(im, x - 10, y); ctx.globalAlpha = 1; }
    ctx.drawImage(im, x, y);
    if (a > 0.6) { const c = tinted(HEROES[id].sprite, RINGS[HEROES[id].ring].hi); if (c) { gx.globalAlpha = 0.25; gx.drawImage(c, x, y); gx.globalAlpha = 1; } }
  }

  enemy(dt) {
    const e = this.g.enemy, ctx = this.ctx, gx = this.gx;
    if (!e) return;
    const im = IMG[e.s];
    if (!im) return;
    const sc = this.escale(), p = this.enemyPos();
    const w = Math.round(im.width * sc), h = Math.round(im.height * sc);
    const hit = this.enemyHit;
    this.enemyHit = Math.max(0, hit - dt * 8);
    const kb = hit > 0.5 ? 4 : 0;
    const bob = Math.floor(this.t * (e.boss ? 1.5 : 2.5)) % 2;
    const x = p.x - (w >> 1) + kb, y = p.y - h + bob;
    this.shadow(p.x, p.y, w * 0.6);
    if (e.boss) { // menacing red rim: silhouette offset behind the sprite + faint bloom
      const t = tinted(e.s, Math.floor(this.t * 3) % 2 ? PAL.red : PAL.blood);
      if (t) { for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(t, x + ox, y + oy, w, h); gx.globalAlpha = 0.18; gx.drawImage(t, x, y, w, h); gx.globalAlpha = 1; }
    }
    ctx.drawImage(im, x, y, w, h);
    if (this.g.freeze > 0) { ctx.globalAlpha = 0.5; ctx.drawImage(tinted(e.s, PAL.cyan), x, y, w, h); ctx.globalAlpha = 1; gx.globalAlpha = 0.4; gx.drawImage(tinted(e.s, PAL.cyan), x, y, w, h); gx.globalAlpha = 1; }
    if (hit > 0.55) { const wt = tinted(e.s, PAL.white); ctx.drawImage(wt, x, y, w, h); gx.globalAlpha = 0.45; gx.drawImage(wt, x, y, w, h); gx.globalAlpha = 1; }
  }

  arc(ctx, cx, cy, r, from, to, col, w = 1) {
    ctx.fillStyle = col;
    for (const p of circlePoints(r)) if (p.a >= from && p.a <= to) ctx.fillRect(cx + p.x, cy + p.y, w, w);
  }

  renderFx(ctx, glow) {
    const W = glow ? 2 : 1; // glow pass draws fatter so the blur reads as light
    for (const f of this.fx) {
      if (f.t < 0) continue;
      const k = f.t / f.d, step = Math.min(2, Math.floor(k * 3));
      switch (f.k) {
        case 'slash': {
          const span = [0.14, 0.32, 0.32][step], start = 0.55 + step * 0.04;
          const a0 = f.flip ? 1 - start - span : start, a1 = a0 + span;
          this.arc(ctx, f.x, f.y, f.r, a0, a1, step === 2 ? PAL.pink : f.c, 2 * W);
          if (step < 2) this.arc(ctx, f.x, f.y, f.r - 2, a0 + 0.03, a1 - 0.03, f.c2, W);
          break;
        }
        case 'shard': {
          const e = Math.min(1, k * 1.5);
          const x = Math.round(f.x0 + (f.x1 - f.x0) * e), y = Math.round(f.y0 + (f.y1 - f.y0) * e - Math.sin(e * Math.PI) * 16);
          ctx.fillStyle = PAL.cyan; ctx.fillRect(x - 4, y, 9, W); ctx.fillRect(x - 1, y - 1, 3 * W, 3 * W);
          ctx.fillStyle = PAL.white; ctx.fillRect(x, y, 2, 1);
          if (!glow && e >= 1 && !f.hit) { f.hit = 1; this.spark(f.x1, f.y1, PAL.cyan, 5); this.enemyHit = Math.max(this.enemyHit, 0.5); }
          break;
        }
        case 'circle': {
          const rx = f.big ? 12 + step * 14 : 9 + step * 4;
          ctx.fillStyle = f.c;
          for (const p of circlePoints(rx)) ctx.fillRect(f.x + p.x, f.y + Math.round(p.y * 0.3), W, W);
          break;
        }
        case 'spirit': {
          const im = IMG.summon_spirit, ep = this.enemyPos();
          const e = Math.min(1, k * 1.4);
          const x = Math.round(f.x0 + (ep.x - f.x0) * e), y = Math.round(f.y0 + (ep.cy - 10 - f.y0) * e);
          if (im) {
            const src = glow ? tinted('summon_spirit', PAL.pink) : im;
            ctx.globalAlpha = 0.35; ctx.drawImage(src, (x - im.width / 2 - 16) | 0, (y - im.height / 2) | 0);
            ctx.globalAlpha = glow ? 0.45 : 1; ctx.drawImage(src, (x - im.width / 2) | 0, (y - im.height / 2) | 0); ctx.globalAlpha = 1;
          }
          if (!glow && e >= 1 && !f.hit) { f.hit = 1; this.spark(ep.x, ep.cy, PAL.pink, 12); this.shake = 6; this.enemyHit = 1; this.stop = 0.06; }
          break;
        }
        case 'bolt': {
          ctx.fillStyle = step === 1 ? PAL.white : f.c;
          let x = f.x0, y = f.y0, seed = f.seed;
          const n = 8;
          for (let s = 1; s <= n; s++) {
            seed = (seed * 9301 + 49297) % 233280;
            const nx = Math.round(f.x0 + ((f.x1 - f.x0) * s) / n), ny = Math.round(f.y0 + ((f.y1 - f.y0) * s) / n + (s < n ? (seed / 233280) * 12 - 6 : 0));
            const len = Math.max(1, Math.abs(nx - x), Math.abs(ny - y));
            for (let q = 0; q <= len; q++) ctx.fillRect(Math.round(x + ((nx - x) * q) / len), Math.round(y + ((ny - y) * q) / len), 2 * W, 2 * W);
            x = nx; y = ny;
          }
          break;
        }
        case 'nova': f.cs.forEach((c, i) => this.arc(ctx, f.x, f.y, 8 + step * 12 + i * 5, 0, 1, c, 2 * W)); break;
        case 'pop': this.arc(ctx, f.x, f.y, 6 + step * 8, 0, 1, PAL.white, W); break;
        case 'pillar': {
          const w = [5, 12, 7][step] * (glow ? 2 : 1);
          ctx.fillStyle = f.c; ctx.fillRect(f.x - w, 0, w * 2, this.ground);
          ctx.fillStyle = PAL.white; ctx.fillRect(f.x - (w >> 2), 0, Math.max(1, w >> 1), this.ground);
          break;
        }
      }
    }
  }

  renderParts() {
    const ctx = this.ctx, gx = this.gx, coin = IMG.icon_gold;
    for (const p of this.parts) {
      if (p.coin) { if (coin) { ctx.drawImage(coin, Math.round(p.x) - 5, Math.round(p.y) - 5, 10, 10); gx.fillStyle = PAL.gold; gx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6); } continue; }
      ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      if (p.glow) { gx.fillStyle = p.c; gx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3); }
    }
  }

  renderDrops() {
    const ctx = this.ctx, gx = this.gx;
    for (const d of this.drops) {
      d.t += 0.016;
      if (d.t < 0.6) { d.vy += 6.5; d.y += d.vy * 0.016; if (d.y > this.ground - 14) { d.y = this.ground - 14; d.vy *= -0.4; } }
      const rar = RARITY[d.it.rar];
      if (d.it.rar >= 1) {
        const w = 2 + d.it.rar;
        ctx.globalAlpha = 0.55 + 0.3 * (Math.floor(d.t * 6) % 2); ctx.fillStyle = rar.col; ctx.fillRect(Math.round(d.x) - w, 0, w * 2 + 1, Math.round(d.y)); ctx.globalAlpha = 1;
        gx.fillStyle = rar.col; gx.fillRect(Math.round(d.x) - w * 2, 0, w * 4, Math.round(d.y) + 8);
      }
      const im = IMG[d.it.id];
      if (im) { ctx.drawImage(im, Math.round(d.x - im.width / 2), Math.round(d.y - im.height / 2 + Math.sin(d.t * 6))); gx.fillStyle = rar.col; gx.fillRect(Math.round(d.x) - 8, Math.round(d.y) - 8, 16, 16); }
      if (d.isNew && Math.floor(d.t * 4) % 2 === 0) pxText(ctx, 'NEW!', d.x - 12, d.y - 26, PAL.lemon, 1, PAL.ink, PAL.orange);
      if (d.t > 1.4) { d.x += (340 - d.x) * 0.1; d.y += (-20 - d.y) * 0.1; }
    }
    this.drops = this.drops.filter((d) => d.t < 1.9);
  }

  renderNums() {
    for (const n of this.nums) {
      n.t += 0.016;
      const pop = n.t < 0.06 ? 1 : 0;
      const rise = n.t < 0.12 ? 0 : Math.min(16, Math.floor((n.t - 0.12) * 32));
      if (n.t > 0.95 && Math.floor(n.t * 12) % 2) continue;
      const sc = n.scale + pop;
      const w = textWidth(n.s, sc);
      const x = Math.max(2, Math.min(this.W - w - 2, n.x - (pop ? w / 4 : 0)));
      pxText(this.ctx, n.s, x, n.y - rise, n.c1, sc, PAL.ink, n.c2);
    }
    this.nums = this.nums.filter((n) => n.t < 1.2);
  }

  hud() {
    const ctx = this.ctx, g = this.g, e = g.enemy;
    if (!e) return;
    const pct = e.hp === -Infinity ? 0 : Math.max(0, Math.min(1, Math.pow(10, e.hp - e.maxHp)));
    const bw = 130, bx = this.W - bw - 8, by = 6;
    ctx.fillStyle = PAL.ink; ctx.fillRect(bx - 2, by - 2, bw + 4, 10);
    ctx.fillStyle = PAL.gold; ctx.fillRect(bx - 1, by - 1, bw + 2, 1); ctx.fillStyle = PAL.bark; ctx.fillRect(bx - 1, by + 7, bw + 2, 1);
    ctx.fillStyle = PAL.blood; ctx.fillRect(bx, by, bw, 7);
    ctx.fillStyle = e.boss ? PAL.orange : PAL.red; ctx.fillRect(bx, by, Math.ceil(bw * pct), 7);
    ctx.fillStyle = e.boss ? PAL.lemon : PAL.pink; ctx.fillRect(bx, by, Math.ceil(bw * pct), 2);
    if (e.boss) {
      const tt = Math.max(0, g.bossTimer);
      ctx.fillStyle = PAL.ink; ctx.fillRect(bx - 2, by + 9, bw + 4, 5);
      ctx.fillStyle = tt < 8 && Math.floor(this.t * 6) % 2 ? PAL.white : PAL.cyan; ctx.fillRect(bx, by + 10, Math.round((tt / 30) * bw), 3);
    }
  }
}
