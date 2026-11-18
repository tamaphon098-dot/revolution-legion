import { Game, newState } from './game.js';
import { ITEMS, RINGS, MUTATIONS } from './data.js';
const MUTS = Object.fromEntries(MUTATIONS.map((m) => [m.id, m]));
import { ZERO, NUMCFG } from './num.js';
import { IMG, loadImages, circlePoints } from './px.js';
import { BattleView } from './battle.js';
import { RingView } from './rings.js';
import { UI } from './ui.js';
import { installFrames } from './frames.js';
import { Monetize } from './monetize.js';
import { Tutorial } from './tutorial.js';
import { BGM } from './bgm.js';
import { VERSION as VERSION_STR } from './data.js';
const bgm = new BGM();
// audio may only start from a user gesture
document.addEventListener('pointerdown', () => bgm.start(), { capture: true });
let bossT = 0;
installFrames();

const SAVE = 'revlegion_v3';
// Debug tools (time x10, console access) exist ONLY on the local dev server, never in the Android app or a hosted web build.
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const DEBUG = !NATIVE && (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.port === '5180';
// store screenshots: ?shot=<name> loads www/shots/<name>.json and never saves (dev server only)
const SHOT = DEBUG ? new URLSearchParams(location.search).get('shot') : null;
// Save signature: deters casual save editing (a tampered save still loads, but raid records are disabled).
const SALT = 'rv-legion::7f3a91';
function sig(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }
// ISO-like week key for the weekly raid
function weekInfo() { const d = new Date(); const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); const no = Math.floor((t / 86400000 + 3) / 7); return { no, key: 'w' + no }; }
const app = document.getElementById('app');

// ---------- integer pixel scaling: 360 logical px -> a whole number of device pixels ----------
// safe-area insets (status bar / gesture bar on edge-to-edge Android)
const inset = (() => {
  const p = document.createElement('div');
  p.style.cssText = 'position:fixed;left:0;top:0;width:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(p);
  return () => { const cs = getComputedStyle(p); return { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 }; };
})();
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const ins = inset();
  const W = window.innerWidth, H = window.innerHeight - ins.top - ins.bottom;
  // device pixels per logical pixel; the small tolerance stops 1080/360 = 2.997 (CSS rounding) from flooring to 2
  let dev = Math.floor((W * dpr) / 360 + 0.03);
  if (dev < 1) dev = 1;
  let css = dev / dpr;
  if (360 * css > W) css = W / 360;                      // never wider than the screen
  if (640 * css > H) { css = H / 640; }                  // very wide screens: fit height instead
  const h = Math.max(600, Math.min(860, Math.floor(H / css)));
  app.style.height = h + 'px';
  app.style.transform = `scale(${css})`;
  app.style.left = Math.round((W - 360 * css) / 2) + 'px';
  app.style.top = Math.round(ins.top + Math.max(0, (H - h * css) / 2)) + 'px';
}
fit();

// ---------- save ----------
function load() {
  if (SHOT) {
    const x = new XMLHttpRequest(); x.open('GET', 'shots/' + SHOT + '.json', false); x.send();
    const s = JSON.parse(x.responseText), b = newState();
    return { ...b, ...s, stats: { ...b.stats, ...s.stats }, perm: { ...b.perm, ...s.perm }, lastSave: Date.now() };
  }
  try {
    const raw = localStorage.getItem(SAVE);
    if (!raw) return null;
    let s, tampered = false;
    const env = JSON.parse(raw);
    if (env && env.d && env.h) { s = JSON.parse(env.d); tampered = sig(env.d + SALT) !== env.h; } else s = env; // old unsigned saves are accepted once
    const b = newState();
    const m = { ...b, ...s, stats: { ...b.stats, ...s.stats }, perm: { ...b.perm, ...s.perm } };
    if (m.gold === null || m.gold === undefined) m.gold = ZERO;
    if (tampered) m.tampered = true;
    if (!DEBUG) m.timeScale = 1;
    // clock rolled back since the last save -> no offline reward this time
    if (m.lastSave && Date.now() < m.lastSave - 120000) { m.clockFlag = (m.clockFlag || 0) + 1; m.lastSave = Date.now(); }
    return m;
  } catch { return null; }
}
function save() { if (SHOT) return; try { game.state.lastSave = Date.now(); const d = JSON.stringify(game.state); localStorage.setItem(SAVE, JSON.stringify({ d, h: sig(d + SALT) })); } catch { /* ignore */ } }
// rotating backups (3 generations) so a bad save never costs the whole game
function backup() {
  try {
    const list = JSON.parse(localStorage.getItem(SAVE + '_bk') || '[]');
    list.unshift({ time: Date.now(), stage: game.state.stage, missions: game.state.missions.length, data: JSON.stringify(game.state) });
    localStorage.setItem(SAVE + '_bk', JSON.stringify(list.slice(0, 3)));
  } catch { /* ignore */ }
}
function backups() { try { return JSON.parse(localStorage.getItem(SAVE + '_bk') || '[]'); } catch { return []; } }
function restore(k) { const b = backups()[k]; if (!b) return; localStorage.setItem(SAVE, JSON.stringify({ d: b.data, h: sig(b.data + SALT) })); location.reload(); }

const saved = load();
const game = new Game(saved);
if (DEBUG) window.game = game;
let ui, battle, ring, shop, tut;

// rebirth header: temple + rotating pixel rings + Leon
function drawTemple(cv, t) {
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const bg = IMG.bg_temple;
  if (bg) ctx.drawImage(bg, 0, 110 - bg.height + 30);
  const cx = 200, cy = 40;
  RINGS.forEach((r, i) => {
    if (!game.on(i)) return;
    const rad = 26 - i * 5;
    ctx.fillStyle = r.col;
    for (const p of circlePoints(rad)) ctx.fillRect(cx + p.x, cy + Math.round(p.y * 0.35) + i * 6, 1, 1);
    const a = (t * (0.6 + i * 0.2)) % 1, pts = circlePoints(rad), p = pts[Math.floor(a * pts.length)];
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx + p.x - 1, cy + Math.round(p.y * 0.35) + i * 6 - 1, 3, 3);
  });
  const h = IMG.hero_leon;
  if (h) ctx.drawImage(h, 120, 110 - h.height - 4);
}

async function start() {
  const names = ['hero_leon', 'hero_seris', 'hero_elia', 'hero_nox', 'boss_dragon', 'enemy_slime', 'enemy_skeleton', 'enemy_imp', 'enemy_golem', 'summon_spirit',
    'bgw_1', 'bgw_2', 'bgw_3', 'bgw_4', 'bg_temple', 'bg_lab', 'icon_gold',
    'en_w1_mush', 'en_w1_wolf', 'en_w2_wolf', 'en_w2_wraith', 'en_w2_yeti', 'en_w2_bat', 'en_w3_gear', 'en_w3_owl', 'en_w3_mage', 'en_w4_eye', 'en_w4_jelly', 'en_w4_knight', 'bo_w2', 'bo_w3', 'bo_w4', 'bg_temple',
    'hero_mina', 'hero_garou', 'hero_volt', 'hero_luna', 'hero_brom', 'hero_tia', 'hero_zeno', 'hero_sierra', ...ITEMS.map((i) => i.id)];
  await loadImages(names);
  if (document.fonts) await Promise.race([document.fonts.load('16px DotGothic16'), new Promise((r) => setTimeout(r, 1200))]);
  battle = new BattleView(document.getElementById('bcv'), document.getElementById('bglow'), game);
  ring = new RingView(document.getElementById('rcv'), document.getElementById('rglow'), game, 176);
  layout();
  // drag the ring around its centre to crank it; tap the battlefield to slash
  const rcv = document.getElementById('rcv');
  let lastA = null;
  const angleOf = (e) => { const r = rcv.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
  rcv.style.touchAction = 'none';
  rcv.addEventListener('pointerdown', (e) => { lastA = angleOf(e); rcv.setPointerCapture(e.pointerId); ring.grab = true; });
  rcv.addEventListener('pointermove', (e) => {
    if (lastA === null) return;
    const a = angleOf(e);
    let d = a - lastA;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    lastA = a;
    if (d > 0) { game.spin(d / (Math.PI * 2)); ring.spun(d); }
  });
  const up = () => { lastA = null; ring.grab = false; };
  rcv.addEventListener('pointerup', up); rcv.addEventListener('pointercancel', up);
  document.getElementById('bwrap').addEventListener('pointerdown', () => { const r = game.tap(); if (r && !r.perfect) battle.tapFx(); });
  ui = new UI(game, {
    debug: DEBUG,
    week: weekInfo,
    onSave: save,
    bgm: () => bgm,
    onMissionList: () => { if (tut) tut.flags.missionOpened = true; },
    monetize: () => shop,
    backups,
    restore,
    onReset: () => { localStorage.removeItem(SAVE); location.reload(); },
    onScreen: (s) => { if (s === 'battle') setTimeout(layout, 0); },
  });
  if (saved) {
    const off = game.runOffline((Date.now() - (saved.lastSave || Date.now())) / 1000);
    if (off) ui.offline(off);
    if (game.state.seenVersion) ui.news(true); else game.state.seenVersion = VERSION_STR;
  } else { ui.intro(); game.state.seenVersion = VERSION_STR; }
  if (DEBUG) window.ui = ui;
  tut = new Tutorial(game, app);
  tut.onDone = (done) => ui.toast(done ? '教程完成！' : '跳过教程', '接下来随意玩。挂机也能前进');
  shop = new Monetize((id) => { game.grant(id); save(); }, ui);
  shop.init();
  for (const e of game.events) ui.onEvent(e);
  game.events.length = 0;
  { const d = new Date(), y = new Date(Date.now() - 86400000), f = (x) => `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; const r = game.daily(f(d), f(y)); if (r && r.streak > 0 && game.state.stats.playTime > 60) ui.daily(r); }
  if (SHOT) {
    ui.modalQ.length = 0; ui._shown = null; document.getElementById('modal').classList.add('hide');
    const q = new URLSearchParams(location.search);
    if (q.get('scr')) ui.show(q.get('scr'));
    if (q.get('open') === 'missions') ui.missionList();
    if (q.get('open') === 'pass') ui.shop('pass');
    // headless capture may not deliver animation frames: refresh the HUD on a timer as well
    ui.refresh(); setInterval(() => { try { ui.refresh(); } catch { /* ignore */ } }, 200);
  }
  if (game.state.pendingMut) ui.mutPicker({ ring: game.state.pendingMut.ring, opts: game.state.pendingMut.opts.map((id) => ({ id, ...MUTS[id] })) });

  let last = performance.now(), acc = 0, sacc = 0, bacc = 0;
  app.classList.toggle('fxlow', !!game.state.fxLow);
  const frame = () => {
    requestAnimationFrame(frame); // schedule first: an exception below can't kill the loop
    const now = performance.now(); // one clock for everything: rAF timestamps can run on a different (lagging) clock
    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
    last = now;
    NUMCFG.broken = !!(game.state.inf && game.state.inf.broken);
    const sdt = dt * game.state.timeScale * game.fluxMul();
    game.useFlux(dt);
    const steps = Math.ceil(sdt / 0.05);
    for (let k = 0; k < steps; k++) game.tick(sdt / steps);
    for (const e of game.events) { battle.onEvent(e); ring.onEvent(e); if (ui.labView) ui.labView.onEvent(e); ui.onEvent(e); }
    game.events.length = 0;
    // a drawing bug must never stop the game itself
    try {
      if (ui.scr === 'battle') { battle.draw(dt); ring.draw(dt); }
      if (ui.scr === 'lab' && ui.labView) ui.labView.draw(dt);
      if (ui.scr === 'rebirth') drawTemple(document.getElementById('tcv'), now / 1000);
    } catch (err) { if (!frame.warned) { frame.warned = true; console.error('render error', err); } }
    acc += dt; sacc += dt;
    if (acc > 0.1) {
      bossT = game.enemy && game.enemy.boss ? bossT + acc : 0;
      bgm.play(bossT > 3 ? 'boss' : (game.state.world >= 2 || game.state.dilOn) ? 'night' : 'field');
      acc = 0; game.passTime(0.1); ui.refresh(); if (tut) tut.update(0.1, !document.getElementById('modal').classList.contains('hide')); }
    if (sacc > 10) { sacc = 0; save(); }
    bacc = (bacc || 0) + dt;
    if (bacc > 300) { bacc = 0; backup(); }
  };
  requestAnimationFrame(frame);
}

let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); bgm.pause(); save(); return; }
  bgm.resume();
  if (hiddenAt && ui) { const off = game.runOffline((Date.now() - hiddenAt) / 1000); if (off) ui.offline(off); }
  hiddenAt = 0;
});
window.addEventListener('pagehide', save);
function layout() {
  fit();
  if (battle) battle.resize();
  if (ring) {
    // measured size can be 0/NaN while the phone WebView is still laying out: fall back to 176
    const scale = app.getBoundingClientRect().width / 360;
    const mh = document.getElementById('mid').getBoundingClientRect().height / (scale || 1);
    const size = Number.isFinite(mh) && mh > 100 ? Math.max(176, Math.min(220, Math.floor(mh - 6) & ~1)) : 176;
    ring.setSize(size);
  }
}
window.addEventListener('resize', layout);
start();
