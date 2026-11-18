// REVOLUTION LEGION v2 — pure simulation (no DOM). Renderers read game.state and drain game.events.
//
// Loop (Revolution Idle style):
//   rings lap -> each lap grows that ring's lap multiplier (×1.01, compounding) and fires attacks
//   gold buys Lv (power) and speed; Lv is capped -> Ascension resets Lv, keeps a share of the power,
//   raises the cap and the lap growth (hero ranks up visually)
//   Rebirth: reset the run for a Prestige Multiplier the player chooses when to take
//   Revolution / Transcendence: deeper resets that unlock new rules (mutations, worlds, final boss)
import { ZERO, L, ladd, lsub } from './num.js';
import { RINGS, HEROES, RANKS, RARITY, ITEMS, ENEMIES, BOSSES, VOID_KING, WORLDS, COMBOS, MUTATIONS, PERM, MISSIONS, TRAITS, TRAIT_ORDER, CHALLENGES, ACHIEVEMENTS, IP_UP, INF_CH, PROMO, EP_UP, DIL, DIL_UP, ORES, REFINE, TAROT, ZODIAC, SHOP, LEGION, RECRUIT, RAID_RULES, CARDS, RING_SKINS, AGE_BANDS } from './data.js';

const WAVES = 5;
const BOSS_TIME = 30;
const LOG104 = Math.log10(1.04);
// Global number scale: keeps digits slow early (first hour ~1万) and reaches ∞ (1.8e308) near the end.
export const CFG = { K: 1 / 6, H: 0.35, G: 0.2, C: 0.2, lapLv: 0.2 };
export const K = CFG.K;
export const INF_L = Math.log10(1.7976931348623157e308);

export function newRing(i) {
  return { on: i === 0, lv: 1, spd: 0, asc: 0, apL: 0, lapL: 0, angle: 0, throttle: 1 };
}

export function newState() {
  return {
    v: 2,
    gold: ZERO, stage: 1, wave: 0, world: 0, runBest: 1,
    rings: RINGS.map((_, i) => newRing(i)),
    nodeBonus: [0, 0, 0, 0],
    mut: [[], [], [], []],
    stats: { laps: [0, 0, 0, 0], asc: [0, 0, 0, 0], ascTotal: [0, 0, 0, 0], combos: 0, combo2: 0, combo3: 0, combo4: 0, kills: 0, bossKills: 0, bestStage: 1, rebirths: 0, revolutions: 0, transcends: 0, mutations: 0, cleared: false, playTime: 0 },
    pmL: 0, core: 0, perm: Object.fromEntries(PERM.map((p) => [p.id, 0])),
    memory: 0, transcends: 0,
    found: [], items: {}, equip: { leon: null, seris: null, elia: null, nox: null },
    missions: [], features: {}, worlds: [0], worldBest: {},
    burst: 0, od: 0, autoBurst: true, autoTune: false, autoRbL: 1,
    units: 0, retry: 0, timeScale: 1, lastSave: Date.now(),
    ach: [], chDone: [], challenge: null, autoBuyOn: true, pendingMut: null, boughtThisRun: false, fxLow: false,
    inf: { count: 0, broken: false }, ip: 0, ipTotal: 0, ipUp: {}, infReady: false, infCh: null, infChDone: [],
    flux: 0, fluxOn: false, daily: { last: '', streak: 0, total: 0 }, bestDpsL: 0,
    promo: [0, 0, 0, 0], pmSpent: 0, eter: { count: 0 }, ep: 0, epTotal: 0, epUp: {}, dilOn: false, dilBest: 0, tp: 0, tpTotal: 0, dilUp: {},
    ores: { cu: 0, ag: 0, au: 0, star: 0, black: 0 }, refine: {}, tarotSeen: [], buffs: {}, tarotPerm: { pow: 0, lap: 0, devil: 0 }, zodiac: [], zslots: 3, codes: [],
    rules: { revStage: 350, autoTr: true, infGain: 0, eterStage: 0, autoPromo: false },
    owned: [], noAds: false, supporter: false, ads: { day: '', used: {} },
    autoEquipOn: false, unseenItems: 0,
    lineup: ['leon', 'seris', 'elia', 'nox'], recruits: ['leon', 'seris', 'elia', 'nox'], cards: {}, deck: [], cslots: 3,
    raid: { week: '', weekTier: 0, best: 0, tokens: 0, tokensTotal: 0, goldWeeks: 0, weeks: 0, rainbow: 0 }, streak: 0,
  };
}

export class Game {
  constructor(state) {
    this.state = state || newState();
    this.events = [];
    this.t = 0;
    this.pending = null;
    this.syncHist = [];
    this.freeze = 0;
    this.bossTimer = 0;
    this.chaos = [1, 1, 1, 1];
    this.chaosT = 0;
    this.spinBank = 0;   // seconds of extra ring time the player has cranked in
    this.tapCd = 0;
    this.spawn();
  }
  emit(e) { if (this.events.length < 400) this.events.push(e); }

  // ================= derived =================
  on(i) { return this.state.rings[i].on; }
  active() { return [0, 1, 2, 3].filter((i) => this.on(i) && !(this.state.challenge === 'solo' && i > 0)); }
  ch(id) { return this.state.challenge === id; }
  ipHas(id) { return !!(this.state.ipUp || {})[id]; }
  epHas(id) { return !!(this.state.epUp || {})[id]; }
  dl(id) { return (this.state.dilUp || {})[id] || 0; }
  zod(id) { return (this.state.zodiac || []).includes(id); }
  buff(id) { return ((this.state.buffs || {})[id] || 0) > 0; }
  ich(id) { return this.state.infCh === id; }
  ichDone(id) { return (this.state.infChDone || []).includes(id); }
  chDone(id) { return (this.state.chDone || []).includes(id); }
  isHarmony() {
    const r = this.active().map((i) => this.rps(i)).sort((a, b) => a - b);
    if (r.length < 4) return false;
    return [1, 2, 4, 8].every((m, k) => Math.abs(r[k] / r[0] - m) < 0.03);
  }
  heroId(i) { return (this.state.lineup || [])[i] || RINGS[i].hero; }
  hero(i, id) { return this.on(i) && this.heroId(i) === id; }
  cardLv(id) { const s = this.state; return (s.deck || []).includes(id) ? (s.cards[id] || 0) : 0; }
  raidRule(id) { return !!(this.raid && this.raid.rule.id === id); }
  raidOn() { return !!this.raid; }
  worldDef() { return WORLDS[this.state.world]; }
  has(f) { return !!this.state.features[f]; }

  rank(heroId) {
    const n = this.state.stats.ascTotal[HEROES[heroId].ring];
    let r = 0;
    RANKS.forEach((k, idx) => { if (n >= k.need) r = idx; });
    return r;
  }
  itemLevel(id) { return Math.min(10, this.state.items[id] || 0); }
  itemMultL(id) {
    if (!id || !this.state.items[id] || this.ich('i_noitem')) return 0;
    const it = ITEMS.find((x) => x.id === id);
    return (L(RARITY[it.rar].mult * (1 + 0.1 * (this.itemLevel(id) - 1))) + L(1 + 0.5 * ((this.state.refine || {})[id] || 0))) * (this.ichDone('i_noitem') ? 2 : 1);
  }
  equipFx(i, fx) {
    const id = this.state.equip[this.heroId(i)];
    if (!id) return false;
    return ITEMS.find((x) => x.id === id).fx === fx;
  }
  anyFx(fx) { return [0, 1, 2, 3].some((i) => this.on(i) && this.equipFx(i, fx)); }
  hasMut(i, m) { return this.state.mut[i].includes(m); }

  cap(i) { const a = this.state.rings[i].asc; return a === 0 ? 30 : 50 + 25 * a; }
  spdCap(i) { return this.has('speed') ? Math.min(40, 10 + 2 * this.state.rings[i].asc) : 0; }

  lapGainL(i) {
    const s = this.state, r = s.rings[i];
    let g = 0.01 * (1 + 0.05 * Math.min(r.asc, 20)) * (1 + 0.1 * s.perm.gain) * (1 + 0.2 * s.memory) * this.worldDef().lapGain;
    if (this.hasMut(i, 'reverse')) g *= 1.6;
    if (this.ipHas('gain')) g *= 1.5;
    g *= (1 + 0.15 * ((s.promo || [])[i] || 0)) * (this.epHas('lapx') ? 2 : 1) * (1 + 0.25 * this.dl('d_lap')) * (1 + 0.02 * ((s.tarotPerm || {}).lap || 0)) * (this.zod('z11') ? 1.1 : 1) * (this.buff('t2') ? 2 : 1) * (i === 1 && this.heroId(1) === 'luna' ? 1.1 : 1);
    return Math.log10(1 + g);
  }

  speedMult(i) {
    const s = this.state;
    let m = (1 + 0.05 * s.rings[i].spd) * (1 + 0.1 * s.perm.spd) * (1 + 0.25 * s.transcends) * (this.chDone('nospeed') ? 1.15 : 1) * (this.ipHas('spd') ? 3 : 1) * (this.buff('t4') ? 2 : 1) * (1 + 0.05 * this.cardLv('c_rush')) * (this.hero(3, 'sierra') ? 1.1 : 1) * (this.raidRule('r_slow') ? 0.5 : 1);
    if (this.on(2)) m *= 1 + Math.min(0.5, 0.001 * s.rings[2].lv * (1 + s.rings[2].asc));
    if (this.anyFx('haste')) m *= 1.2;
    if (this.hasMut(i, 'reverse')) m *= 0.8;
    if (this.worldDef().chaos) m *= this.chaos[i];
    return m;
  }
  rpsMax(i) { return this.speedMult(i) / RINGS[i].baseLap; }
  rps(i) { return this.rpsMax(i) * this.state.rings[i].throttle * (this.state.od > 0 ? 5 : 1); }

  nodes(i) {
    let n = [3, 2, 2, 1][i] + this.state.nodeBonus[i] + (this.state.perm.node || 0) + (i === 0 && this.chDone('solo') ? 1 : 0) + (this.zod('z3') ? 1 : 0);
    if (this.equipFx(i, 'node')) n += 1;
    if (this.hasMut(i, 'split')) n += 2;
    if (i === 0 && this.rank(this.heroId(0)) >= 3) n += 1;
    if (this.heroId(i) === 'mina') n *= 2;
    return n;
  }

  dexL() {
    if (!this.has('dexBonus')) return 0;
    const per = 0.04 + (this.state.missions.includes('M20') ? 0.02 : 0) + (this.state.missions.includes('M26') ? 0.03 : 0);
    let l = this.state.found.length * per;
    if (this.state.found.length >= ITEMS.length) l += 2;
    return l;
  }

  globalL() {
    const s = this.state;
    const pm = this.ch('nopm') ? 0 : s.pmL;
    return L(1 + s.missions.length) + pm + s.memory * L(3) + s.transcends * 2 + this.dexL() + (s.units || 0) * L(1.15) + (s.ach || []).length * L(1.05) + (this.ipHas('pow') ? 30 : 0) + (s.ipRep || 0) * 10 + (this.epHas('epPow') ? 50 : 0) + this.dl('d_pow') * 20 + ((s.tarotPerm || {}).pow || 0) * L(1.1) + ((s.tarotPerm || {}).devil || 0) * L(1.5) + (this.buff('t1') ? 5 : 0);
  }

  powL(i) {
    const r = this.state.rings[i];
    return CFG.K * (L(RINGS[i].basePow) + L(r.lv) + r.lv * LOG104 + r.apL);
  }

  hitL(i) {
    const s = this.state, r = s.rings[i];
    let l = this.powL(i) + r.lapL + this.globalL();
    if (!this.ich('i_norank')) l += L(RANKS[this.rank(this.heroId(i))].mult) * (this.ichDone('i_norank') ? 2 : 1);
    l += this.itemMultL(s.equip[this.heroId(i)]);
    l += ((s.promo || [])[i] || 0) * PROMO.pow;
    if (i === 0 && this.zod('z1')) l += 8;
    if (i === 1 && this.zod('z9')) l += 8;
    const hid = this.heroId(i);
    if (hid === 'mina') l -= 0.22;
    if (hid === 'garou') l += L(1 + 0.05 * Math.min(this.berserk || 0, 100));
    if (hid === 'brom') l -= 1;
    if (hid === 'zeno') l += Math.min(this.necro || 0, 50) * L(1.1);
    l += 2 * this.cardLv(['c_edge', 'c_frost', 'c_choir', 'c_horde'][i]);
    l += L(this.worldDef().dmg[i]);
    if (this.on(2) && i !== 2) l += s.rings[2].lapL * 0.4; // Elia's blessing
    return l;
  }

  comboL(n) {
    let l = L(COMBOS[n].mult) + Math.log10(1 + 0.25 * this.state.stats.combo4 ** 0.3) + (this.chDone('sync') ? L(2) : 0) + L(1 + 0.5 * this.cardLv('c_link')) + (this.hero(2, 'tia') ? L(2) : 0);
    if (n === 4 && this.anyFx('fullSync')) l += L(20);
    return l;
  }
  syncWin() { return (this.anyFx('syncWin') ? 0.25 : 0.12) * (this.zod('z7') || this.buff('t6') ? 2 : 1) * (this.hero(1, 'volt') ? 1.5 : 1) * (this.hero(2, 'tia') ? 2 : 1); }
  syncRate() { return this.syncHist.length ? this.syncHist.reduce((a, b) => a + b, 0) / this.syncHist.length : 0; }

  totalMultL() { // what the ring centre shows: lap multipliers × global
    let l = this.globalL();
    for (const i of this.active()) l += this.state.rings[i].lapL;
    return l;
  }
  dpsL() {
    let l = ZERO;
    for (const i of this.active()) l = ladd(l, this.hitL(i) + L(this.rps(i) * this.nodes(i)));
    return l;
  }

  // ================= economy =================
  lvCostL(i) { const r = this.state.rings[i]; return CFG.C * (RINGS[i].costL + (r.lv - 1) * CFG.lapLv + r.asc * 0.6); }
  spdCostL(i) { const r = this.state.rings[i]; return CFG.C * (RINGS[i].costL + 1 + r.spd * 0.25 + r.spd * r.spd * 0.004); }
  canLv(i) { return this.state.rings[i].lv < this.cap(i) && this.state.gold >= this.lvCostL(i); }
  canSpd(i) { return !this.ch('nospeed') && this.state.rings[i].spd < this.spdCap(i) && this.state.gold >= this.spdCostL(i); }
  canAsc(i) { return !this.ch('noasc') && this.state.rings[i].lv >= this.cap(i); }

  buyLv(i) {
    if (!this.canLv(i)) return false;
    this.state.gold = lsub(this.state.gold, this.lvCostL(i));
    this.state.rings[i].lv++;
    this.state.boughtThisRun = true;
    return true;
  }
  buySpd(i) {
    if (!this.canSpd(i)) return false;
    this.state.gold = lsub(this.state.gold, this.spdCostL(i));
    this.state.rings[i].spd++;
    this.state.boughtThisRun = true;
    if (this.state.autoTune) this.autoTuneRings();
    return true;
  }
  buyMax(i) { let n = 0; while (this.buyLv(i) && n < 1000) n++; return n; }

  ascend(i) {
    const s = this.state, r = s.rings[i];
    if (!this.canAsc(i)) return false;
    const before = this.rank(this.heroId(i));
    r.apL += (L(r.lv) + r.lv * LOG104) * (this.chDone('noasc') ? 0.65 : 0.5);
    r.lv = 1;
    r.asc++;
    s.stats.asc[i]++;
    s.stats.ascTotal[i]++;
    let mutation = null;
    if (this.has('mutation') && !s.pendingMut && s.mut[i].length < 2 && Math.random() < 0.25) {
      const pool = MUTATIONS.filter((m) => !s.mut[i].includes(m.id)).sort(() => Math.random() - 0.5).slice(0, 3);
      s.pendingMut = { ring: i, opts: pool.map((m) => m.id) };
      this.emit({ type: 'mutChoice', ring: i, opts: pool });
      if (this.autoPickMut) this.chooseMut(0);
    }
    const after = this.rank(this.heroId(i));
    this.emit({ type: 'ascend', ring: i, rankUp: after > before ? after : 0, mutation });
    return true;
  }

  chooseMut(k) {
    const s = this.state, p = s.pendingMut;
    if (!p) return;
    const id = p.opts[Math.max(0, Math.min(p.opts.length - 1, k))];
    s.mut[p.ring].push(id);
    s.stats.mutations++;
    s.pendingMut = null;
    this.emit({ type: 'mutation', ring: p.ring, mutation: MUTATIONS.find((m) => m.id === id) });
  }

  goldPerKillL(boss) {
    const s = this.state;
    let l = 2.4 + 0.2 * s.stage + s.perm.gold * L(4) + this.worldOffset() * 0.8;
    if (boss) l += 1.2;
    return CFG.G * l + (this.zod('z2') ? 5 : 0) + (this.buff('t19') ? 10 : 0) + this.cardLv('c_gold') + (this.hero(2, 'brom') ? 2 : 0);
  }

  // ================= combat =================
  worldOffset() { return [0, 20, 45, 90, 110][this.state.world]; }
  hpL(stage, boss) {
    const x = stage - 1;
    if (this.worldDef().endless) return CFG.H * (0.7 + 0.45 * x + 0.0004 * x * x + this.worldOffset() + (boss ? 1 : 0)); // corridor: gentle, endless
    let l = 0.7 + 0.3 * x + 0.0025 * x * x + 0.004 * Math.max(0, x - 200) ** 2 + this.worldOffset();
    if (boss) l += 1.0;
    const w = this.worldDef();
    if (w.final && stage === w.final) return INF_L; // the Void King: HP = ∞
    return CFG.H * l;
  }
  isBoss(stage = this.state.stage) { return stage % 10 === 0; }

  spawn() {
    const s = this.state, w = this.worldDef();
    const boss = this.isBoss() && s.retry <= 0;
    let def;
    const pool = ENEMIES[s.world] || ENEMIES[0], bpool = BOSSES[s.world] || BOSSES[0];
    if (boss && w.final && s.stage === w.final) def = VOID_KING;
    else if (boss) def = bpool[Math.floor(s.stage / 10 - 1) % bpool.length];
    else def = pool[(s.stage - 1 + s.wave) % pool.length];
    const hp = this.hpL(s.stage, boss);
    let trait = null;
    if (boss && !def.king && (s.stage >= 50 || s.world > 0)) trait = TRAIT_ORDER[(s.stage / 10 + s.world * 2) % TRAIT_ORDER.length];
    if (trait === 'phys' && this.active().length < 2) trait = 'regen'; // never block a red-only team with physical immunity
    if (trait === 'barrier' && this.active().length < 2) trait = 'rush';
    this.enemy = { ...def, boss, maxHp: hp, hp, weak: boss ? 1 : def.weak || 0, trait, id: Math.random() };
    this.bossTimer = boss ? (trait === 'rush' ? 15 : BOSS_TIME) * (this.ch('rush') ? 1 / 3 : 1) : 0;
    this.emit({ type: 'spawn' });
  }

  damage(dl, ring, kind) {
    if (this.raid) return this.raidDamage(dl, ring, kind);
    const e = this.enemy;
    if (ring === 1 && e.weak) dl += L(2);
    if (this.freeze > 0) dl += L(1.5);
    if (e.boss && ring === 0 && this.equipFx(0, 'boss')) dl += L(2);
    if (e.trait === 'phys' && ring === 0) dl -= 2;
    if (e.trait === 'magic' && ring === 1) dl -= 2;
    if (e.trait === 'barrier' && kind !== 'combo' && kind !== 'burst') dl -= 3;
    if (this.ch('sync') && kind !== 'combo') dl -= 2;
    if (e.boss && this.zod('z5')) dl += 6;
    if (e.boss) dl += 2 * this.cardLv('c_boss');
    if (this.state.dilOn) dl *= DIL.power + 0.02 * this.dl('d_soft');
    e.hp = lsub(e.hp, dl);
    if (this.has('burst') && this.state.od <= 0) this.state.burst = Math.min(100, this.state.burst + (kind === 'combo' ? 2 : 0.15));
    if (e.hp === ZERO) this.kill();
  }

  kill() {
    const s = this.state, e = this.enemy;
    s.gold = ladd(s.gold, this.goldPerKillL(e.boss));
    s.stats.kills++;
    this.berserk = 0;
    this.necro = (this.necro || 0) + 1;
    this.emit({ type: 'kill', boss: e.boss, sprite: e.s });
    this.rollDrop(e.boss);
    if (e.king) {
      const first = !s.stats.cleared;
      s.stats.cleared = true;
      s.infReady = true;
      if (s.infCh && !s.infChDone.includes(s.infCh)) { s.infChDone.push(s.infCh); this.emit({ type: 'infChClear', id: s.infCh }); }
      this.emit({ type: 'clear', first });
    }
    if (e.boss) {
      s.stats.bossKills++;
      if (e.trait) s.stats.traitKills = (s.stats.traitKills || 0) + 1;
      if (this.bossTimer > 25) s.stats.fastBoss = 1;
      if (s.od > 0) s.stats.odBoss = 1;
      this.advance();
    }
    else if (s.retry > 0) { /* farming before the next boss attempt */ }
    else { s.wave++; if (s.wave >= WAVES) this.advance(); }
    this.spawn();
  }

  advance() {
    const s = this.state;
    s.stage++;
    s.wave = 0;
    this.necro = 0;
    s.runBest = Math.max(s.runBest, s.stage);
    s.stats.bestStage = Math.max(s.stats.bestStage, s.stage);
    s.worldBest[s.world] = Math.max(s.worldBest[s.world] || 0, s.stage);
    if (!s.boughtThisRun && s.stage >= 15 && s.stats.rebirths > 0) s.stats.lazy = 1;
    this.emit({ type: 'stage', stage: s.stage });
    const chal = s.challenge && CHALLENGES.find((c) => c.id === s.challenge);
    if (chal && s.runBest >= chal.goal) this.finishChallenge(true);
  }

  bossFail() {
    const s = this.state;
    s.retry = 45; // farm for 45s, then try again automatically
    s.wave = 0;
    this.emit({ type: 'bossfail' });
    this.spawn();
  }

  rollDrop(boss, forced = false) {
    const s = this.state;
    if (!this.has('items')) return;
    if (forced) { this._forceDrop = true; }
    this.rollOre(boss);
    const p = (boss ? 0.08 : 0.002 + (this.has('luck') ? 0.002 : 0)) * (this.zod('z6') ? 2 : 1);
    if (!this._forceDrop && Math.random() > p) return;
    this._forceDrop = false;
    const shift = (this.worldDef().drop || 0) + (boss ? 0.5 : 0) + 0.15 * this.state.memory + this.state.transcends;
    const w = [70, 22, 6, 1.6, 0.25].map((v, k) => v * Math.pow(1.6, k * shift));
    if (boss && s.missions.includes('M19')) w[0] = 0;
    let roll = Math.random() * w.reduce((a, b) => a + b, 0), rar = 0;
    for (; rar < 4; rar++) { if (roll < w[rar]) break; roll -= w[rar]; }
    const pool = ITEMS.filter((it) => it.rar === rar);
    const it = pool[Math.floor(Math.random() * pool.length)];
    const isNew = !s.items[it.id];
    s.items[it.id] = (s.items[it.id] || 0) + 1;
    if (isNew) { s.found.push(it.id); s.unseenItems = (s.unseenItems || 0) + 1; }
    // which hero would use it, and is it an upgrade over what they hold now?
    const ring = ['s', 'm', 'h', 'n'].indexOf(it.type);
    const hid = this.heroId(ring);
    const before = this.itemMultL(s.equip[hid]), after = this.itemMultL(it.id);
    const better = s.equip[hid] !== it.id && after > before + 1e-9;
    if (s.autoEquipOn) this.autoEquip();
    this.emit({ type: 'drop', item: it, isNew, better: better && !s.autoEquipOn, hid, before, after, lv: this.itemLevel(it.id) });
  }

  rollOre(boss) {
    const s = this.state;
    if (!this.has('minerals')) return;
    const m = (this.zod('z6') ? 2 : 1) * (1 + 0.5 * this.cardLv('c_ore')) * (this.hero(2, 'brom') ? 2 : 1);
    if (Math.random() < (boss ? 1 : 0.05) * m) { const o = ['cu', 'ag', 'au', 'star', 'star'][s.world]; s.ores[o] = (s.ores[o] || 0) + (boss ? 3 : 1); }
    if (Math.random() < (boss ? 0.1 : 0.004) * m) { s.ores.black = (s.ores.black || 0) + 1; this.emit({ type: 'blackOre' }); }
  }

  equipItem(hid, id) { if (!this.state.items[id]) return false; this.state.equip[hid] = id; return true; }

  autoEquip() {
    const s = this.state;
    for (const hid of Object.keys(HEROES)) {
      const type = HEROES[hid].type;
      const cur = s.equip[hid];
      let best = cur, bestL = cur ? this.itemMultL(cur) : -1;
      for (const it of ITEMS) if (it.type === type && s.items[it.id] && this.itemMultL(it.id) > bestL) { best = it.id; bestL = this.itemMultL(it.id); }
      s.equip[hid] = best;
    }
  }

  // Player input -------------------------------------------------------------
  // spin(frac): the player dragged the outer ring by `frac` of a turn (clockwise > 0)
  spin(frac) {
    if (frac <= 0) return;
    const base = this.rps(this.active()[0] ?? 0) || 0.1;
    this.spinBank = Math.min(2.5, this.spinBank + frac / base);
    this.state.stats.spun = (this.state.stats.spun || 0) + frac;
  }
  // PERFECT: tap within a short window of any node crossing the trigger (skill expression; streaks grow)
  perfectWindow() { return 0.1 * (1 + 0.2 * this.cardLv('c_perf')); }
  nearestNode() {
    let best = null;
    for (const i of this.active()) {
      const n = this.nodes(i), rps = this.rps(i), f = (this.state.rings[i].angle * n) % 1;
      const dt = Math.min(f, 1 - f) / Math.max(1e-6, rps * n);
      if (!best || dt < best.dt) best = { i, dt };
    }
    return best;
  }
  tap() {
    const s = this.state;
    if (this.tapCd > 0 || !this.enemy) return null;
    this.tapCd = 0.12;
    s.stats.taps = (s.stats.taps || 0) + 1;
    const nn = this.nearestNode();
    if (nn && nn.dt <= this.perfectWindow()) {
      s.streak = (s.streak || 0) + 1;
      s.stats.perfects = (s.stats.perfects || 0) + 1;
      s.stats.bestStreak = Math.max(s.stats.bestStreak || 0, s.streak);
      const dl = this.hitL(nn.i) + L(3 + 0.5 * this.cardLv('c_perf') + 0.1 * Math.min(s.streak, 50));
      this.spinBank = Math.min(2.5, this.spinBank + 0.3);
      this.emit({ type: 'perfect', ring: nn.i, streak: s.streak, dmg: dl });
      this.damage(dl, nn.i, 'perfect');
      return { perfect: true, streak: s.streak };
    }
    s.streak = 0;
    const dl = this.hitL(0) - L(2);
    this.emit({ type: 'hit', ring: 0, dmg: dl, tap: true });
    this.damage(dl, 0, 'hit');
    return { perfect: false };
  }

  // ================= weekly raid =================
  raidTarget() { return Math.max(this.state.bestDpsL || 0, this.dpsL()) + Math.log10(60); }
  startRaid(weekKey, weekNo) {
    if (!this.has('raid') || this.raid) return false;
    const rule = RAID_RULES[((weekNo % RAID_RULES.length) + RAID_RULES.length) % RAID_RULES.length];
    const target = this.raidTarget();
    this.raid = { t: 60, dmgL: ZERO, rule, weekKey, target };
    this.enemy = { s: 'bo_w4', n: 'Incursión: ' + rule.name, boss: true, raid: true, maxHp: target + 1, hp: target + 1, weak: 1, id: Math.random() };
    this.bossTimer = 60;
    this.emit({ type: 'raidStart', rule });
    return true;
  }
  raidDamage(dl, ring, kind) {
    const r = this.raid, e = this.enemy;
    switch (r.rule.id) {
      case 'r_red': dl += ring === 0 ? L(3) : L(0.3); break;
      case 'r_sync': dl += kind === 'combo' ? 1 : -1; break;
      case 'r_perf': if (kind === 'perfect') dl += L(5); break;
      case 'r_slow': dl += L(4); break;
      case 'r_purple': if (ring === 3) dl += L(5); break;
    }
    r.dmgL = ladd(r.dmgL, dl);
    e.hp = Math.max(-1, lsub(e.maxHp, r.dmgL));
    if (this.has('burst') && this.state.od <= 0) this.state.burst = Math.min(100, this.state.burst + (kind === 'combo' ? 2 : 0.15));
  }
  endRaid() {
    const s = this.state, r = this.raid, R = s.raid;
    this.raid = null;
    const score = r.dmgL, t = r.target;
    let tier = score >= t + 1 ? 4 : score >= t + 0.5 ? 3 : score >= t ? 2 : score >= t - 1 ? 1 : 0;
    const suspicious = score > t + 4 || s.tampered;
    if (suspicious) tier = 0;
    if (R.week !== r.weekKey) { R.week = r.weekKey; R.weekTier = 0; R.weeks++; }
    const gained = Math.max(0, tier - R.weekTier);
    if (tier >= 3 && R.weekTier < 3) R.goldWeeks++;
    if (tier >= 4 && R.weekTier < 4) R.rainbow++;
    R.weekTier = Math.max(R.weekTier, tier);
    R.tokens += gained; R.tokensTotal += gained;
    for (let k = 0; k < gained * 2; k++) this.drawCard(true);
    if (!suspicious) R.best = Math.max(R.best || 0, score);
    this.emit({ type: 'raidEnd', score, tier, gained, suspicious });
    this.spawn();
  }

  // ================= legion & cards =================
  setLineup(ring, id) {
    const s = this.state;
    if (!s.recruits.includes(id) || !LEGION[ring].includes(id)) return false;
    s.lineup[ring] = id;
    this.berserk = 0;
    return true;
  }
  checkRecruits() {
    const s = this.state;
    for (const [id, r] of Object.entries(RECRUIT)) if (!s.recruits.includes(id) && r.cond(s)) { s.recruits.push(id); this.emit({ type: 'recruit', id }); }
  }
  drawCard(free = false) {
    const s = this.state;
    if (!free) { if ((s.ores.black || 0) < 1) return null; s.ores.black--; }
    const c = CARDS[Math.floor(Math.random() * CARDS.length)];
    s.cards[c.id] = Math.min(10, (s.cards[c.id] || 0) + 1);
    s.stats.cards = (s.stats.cards || 0) + 1;
    if (s.deck.length < s.cslots && !s.deck.includes(c.id)) s.deck.push(c.id);
    this.emit({ type: 'card', card: c, lv: s.cards[c.id], free });
    return c;
  }
  toggleCard(id) {
    const s = this.state;
    if (s.deck.includes(id)) { s.deck = s.deck.filter((x) => x !== id); return true; }
    if (!s.cards[id] || s.deck.length >= s.cslots) return false;
    s.deck.push(id);
    return true;
  }

  burstNow() {
    const s = this.state;
    if (!this.has('burst') || s.burst < 100 || s.od > 0) return false;
    s.burst = 0;
    s.od = this.chDone('rush') ? 15 : 10;
    this.emit({ type: 'burst' });
    return true;
  }

  // ================= tick =================
  tick(dt) {
    const s = this.state;
    this.t += dt;
    s.stats.playTime += dt;
    if (s.od > 0) s.od = Math.max(0, s.od - dt);
    for (const k in (s.buffs || {})) { s.buffs[k] -= dt; if (s.buffs[k] <= 0) delete s.buffs[k]; }
    if (!s.features.promotion && s.pmL >= PROMO.unlockL) { s.features.promotion = true; this.emit({ type: 'feature', id: 'promotion' }); }
    if (this.freeze > 0) this.freeze -= dt;
    if (s.retry > 0) { s.retry -= dt; if (s.retry <= 0 && this.isBoss()) this.spawn(); }
    if (this.worldDef().chaos) {
      this.chaosT -= dt;
      if (this.chaosT <= 0) { this.chaosT = 3; this.chaos = this.chaos.map(() => 0.5 + Math.random() * 1.5); }
    }

    // cranking: extra ring time (max 4x real time) — rings, laps, hits and syncs all advance together
    const extra = Math.min(this.spinBank, dt * 4);
    this.spinBank -= extra;
    const rdt = dt + extra;
    this.tapCd -= dt;
    const t0 = this.t - dt;
    const revs = [];
    for (const i of this.active()) {
      const r = s.rings[i];
      const rps = this.rps(i), n = this.nodes(i);
      const a0 = r.angle, a1 = a0 + rps * rdt;
      const hits = Math.floor(a1 * n) - Math.floor(a0 * n);
      let laps = Math.floor(a1) - Math.floor(a0);
      if (hits > 0) {
        if (this.heroId(i) === 'garou') this.berserk = (this.berserk || 0) + hits;
        let dl = this.hitL(i) + L(hits);
        let crit = false;
        const critChance = (this.equipFx(i, 'crit') ? 0.25 : 0) + (this.hasMut(i, 'crit') ? 0.3 : 0) + (this.zod('z8') ? 0.15 : 0) + (this.buff('t18') ? 0.2 : 0) + 0.05 * this.cardLv('c_crit') + (this.raidRule('r_crit') ? 0.3 : 0) + (i === 1 && this.heroId(1) === 'luna' ? 0.3 : 0);
        if (critChance && Math.random() < 1 - Math.pow(1 - critChance, Math.min(hits, 20))) { dl += L(i === 1 && this.heroId(1) === 'luna' ? 8 : this.hasMut(i, 'crit') ? 5 : 4); crit = true; }
        if (i === 1 && this.equipFx(1, 'freeze')) this.freeze = 2;
        this.emit({ type: 'hit', ring: i, dmg: dl, crit });
        this.damage(dl, i, 'hit');
      }
      if (laps > 0) {
        if (this.equipFx(i, 'extraLap')) laps += laps < 30 ? [...Array(laps)].filter(() => Math.random() < 0.15).length : Math.round(laps * 0.15);
        const eff = laps * (this.hasMut(i, 'double') ? 2 : 1);
        r.lapL += eff * this.lapGainL(i);
        s.stats.laps[i] += laps;
        const first = (Math.floor(a0) + 1 - a0) / rps;
        const k = Math.min(Math.floor(a1) - Math.floor(a0), 30);
        for (let q = 0; q < k; q++) revs.push({ ring: i, t: t0 + (first + q / rps) * (dt / rdt) });
        this.emit({ type: 'lap', ring: i });
        if (i === 3 && this.heroId(3) === 'sierra') this.spinBank = Math.min(2.5, this.spinBank + 0.3 * laps);
      }
      r.angle = a1 - Math.floor(a1);
    }

    revs.sort((a, b) => a.t - b.t);
    const win = this.syncWin();
    for (const ev of revs) {
      if (this.pending && ev.t - this.pending.t <= win && !this.pending.set.includes(ev.ring)) this.pending.set.push(ev.ring);
      else { this.flush(); this.pending = { t: ev.t, set: [ev.ring] }; }
    }
    if (this.pending && this.t - this.pending.t > win) this.flush();

    if (this.raid) { this.raid.t -= dt; this.bossTimer = Math.max(0, this.raid.t); if (this.raid.t <= 0) this.endRaid(); }
    else if (this.enemy.boss) {
      this.bossTimer -= dt;
      if (this.enemy.trait === 'regen' && this.enemy.hp !== ZERO) this.enemy.hp = Math.min(this.enemy.maxHp, ladd(this.enemy.hp, this.enemy.maxHp + L(0.02 * dt)));
      if (this.bossTimer <= 0) this.bossFail();
    }

    this.automate(dt);
    this.checkMissions();
    this.unitAcc = (this.unitAcc || 0) + dt;
    if (this.unitAcc > 1) {
      this.unitAcc = 0;
      const u = Math.min(17, Math.floor(this.dpsL() / 4));
      if (u > (s.units || 0)) { s.units = u; this.emit({ type: 'unit', u }); }
      s.bestDpsL = Math.max(s.bestDpsL || 0, this.dpsL());
      if (s.dilOn) s.dilBest = Math.max(s.dilBest || 0, this.dpsL() * (DIL.power + 0.02 * this.dl('d_soft')));
      this.checkAch();
    }
  }

  checkAch() {
    const s = this.state;
    this.checkRecruits();
    for (const a of ACHIEVEMENTS) {
      if (s.ach.includes(a.id)) continue;
      let ok = false;
      try { ok = a.cond(s, this); } catch { ok = false; }
      if (ok) { s.ach.push(a.id); this.emit({ type: 'ach', ach: a }); }
    }
  }

  flush() {
    const p = this.pending;
    this.pending = null;
    if (!p) return;
    if (this.active().length >= 2) { this.syncHist.push(p.set.length >= 2 ? 1 : 0); if (this.syncHist.length > 50) this.syncHist.shift(); }
    if (p.set.length < 2) return;
    const n = Math.min(4, p.set.length), s = this.state;
    s.stats.combos++;
    s.stats['combo' + n]++;
    let base = ZERO;
    for (const i of p.set) base = ladd(base, this.hitL(i));
    const dl = base + this.comboL(n);
    this.emit({ type: 'combo', n, rings: [...p.set].sort(), dmg: dl });
    this.damage(dl, -1, 'combo');
    if (this.hero(1, 'volt')) { const v = this.hitL(1) + 1; this.emit({ type: 'hit', ring: 1, dmg: v, crit: true }); this.damage(v, 1, 'hit'); }
  }

  automate(dt) {
    const s = this.state;
    this.autoAcc = (this.autoAcc || 0) + dt;
    if (this.autoAcc < 0.5) return;
    this.autoAcc = 0;
    if (this.has('autoBuy') && s.autoBuyOn) {
      for (let k = 0; k < 200; k++) {
        let best = null;
        for (const i of this.active()) {
          if (this.canLv(i) && (!best || this.lvCostL(i) < best.c)) best = { i, c: this.lvCostL(i), f: 'lv' };
          if (this.canSpd(i) && (!best || this.spdCostL(i) < best.c)) best = { i, c: this.spdCostL(i), f: 'spd' };
        }
        if (!best) break;
        if (best.f === 'lv') this.buyLv(best.i); else this.buySpd(best.i);
      }
    }
    if (s.perm.autoAsc) for (const i of this.active()) if (this.canAsc(i)) this.ascend(i);
    if (s.autoBurst && s.burst >= 100) this.burstNow();
    if (s.perm.autoRb && this.rebirthTargetL() >= s.pmL + s.autoRbL) this.rebirth();
    const R = s.rules || {};
    if (s.world !== 4) {
      if (this.ipHas('autoRev') && this.canRevolution() && s.runBest >= (R.revStage || 350)) this.revolution();
      if (this.ipHas('autoTr') && R.autoTr !== false && this.canTranscend()) this.transcend();
    }
    if (this.epHas('autoInf') && R.infGain > 0 && this.canInfinity() && this.ipGain() >= R.infGain) this.infinity();
    if (R.eterStage > 0 && this.canEternity() && s.runBest >= R.eterStage) this.eternity();
    if (R.autoPromo && this.has('promotion')) for (let k = 0; k < 8; k++) { const i = this.active().reduce((a, b) => (s.promo[b] < s.promo[a] ? b : a), this.active()[0]); if (PROMO.costL(s.promo[i]) > 0.1 * s.pmL || !this.promote(i)) break; }
  }

  // ================= missions =================
  current() { return MISSIONS.find((m) => !this.state.missions.includes(m.id)); }
  checkMissions() {
    const m = this.current();
    if (!m) return;
    const [c, t] = m.cond(this.state);
    if (c >= t) this.complete(m);
  }
  complete(m) {
    const s = this.state, rw = m.reward;
    s.missions.push(m.id);
    if (rw.feature) s.features[rw.feature] = true;
    if (rw.feature2) s.features[rw.feature2] = true;
    if (rw.feature === 'rebirth') this.offer('rl_grow_rb');
    if (rw.feature === 'revolution') this.offer('rl_grow_rev');
    this.passXp(30);
    if (rw.cslot) s.cslots = (s.cslots || 3) + rw.cslot;
    if (rw.gold) s.gold = ladd(s.gold, rw.gold);
    if (rw.ip) { s.ip += rw.ip; s.ipTotal = (s.ipTotal || 0) + rw.ip; }
    if (rw.zslot) s.zslots = (s.zslots || 3) + rw.zslot;
    if (rw.black) s.ores.black = (s.ores.black || 0) + rw.black;
    if (rw.ring !== undefined) { s.rings[rw.ring].on = true; this.realign(); }
    if (rw.node !== undefined) s.nodeBonus[rw.node]++;
    if (rw.world !== undefined && !s.worlds.includes(rw.world)) s.worlds.push(rw.world);
    if (rw.feature === 'autotune') { s.autoTune = true; this.autoTuneRings(); }
    this.emit({ type: 'mission', mission: m });
  }

  // ================= lab =================
  setThrottle(i, v) { this.state.rings[i].throttle = Math.max(0.1, Math.min(1, v)); this.realign(); }
  realign() { for (const r of this.state.rings) r.angle = 0; this.pending = null; }
  autoTuneRings() {
    const act = this.active();
    if (act.length < 2) return;
    const max = act.map((i) => this.rpsMax(i));
    let best = null;
    for (let e = -40; e <= 40; e++) {
      const base = Math.pow(2, e / 4);
      const pick = [];
      let ok = true, score = 0;
      for (let k = 0; k < act.length; k++) {
        let m = 0;
        for (const c of [1, 2, 4, 8, 16, 32]) if (base * c <= max[k] + 1e-9) m = c;
        if (!m || base * m < max[k] * 0.15) { ok = false; break; }
        pick.push(m); score += Math.log(base * m / max[k]);
      }
      if (ok && (!best || score > best.score)) best = { base, pick, score };
    }
    if (!best) return;
    act.forEach((i, k) => { this.state.rings[i].throttle = Math.min(1, (best.base * best.pick[k]) / max[k]); });
    this.realign();
  }

  // ================= prestige =================
  rebirthTargetL() { return this.state.runBest < 40 ? 0 : (this.chDone('nopm') ? 0.48 : 0.4) * (this.ichDone('i_norb') ? 1.5 : 1) * (this.zod('z10') ? 1.1 : 1) * this.hpL(this.state.runBest - 1, false) - (this.state.pmSpent || 0); }
  rebirthCore() { return Math.max(0, Math.floor((this.state.runBest - 30) / 10)) * (this.ipHas('core') ? 3 : 1); }
  canRebirth() { return this.has('rebirth') && !this.state.challenge && !this.ich('i_norb') && this.rebirthTargetL() > this.state.pmL + 0.05; }
  rebirth() {
    const s = this.state;
    if (!this.canRebirth()) return false;
    const gain = this.rebirthTargetL() - s.pmL;
    s.pmL = this.rebirthTargetL();
    const core = this.rebirthCore();
    s.core += core;
    s.stats.rebirths++;
    this.resetRun();
    this.emit({ type: 'rebirth', gainL: gain, core });
    return true;
  }
  resetRun() {
    const s = this.state;
    s.stage = (this.worldDef().endless && this.epHas('startCorr')) ? 101 : 1 + s.perm.start * 10;
    s.runBest = s.stage;
    s.wave = 0; s.retry = 0;
    s.gold = ZERO; s.burst = 0; s.od = 0;
    s.rings.forEach((r, i) => { const on = r.on, th = r.throttle; Object.assign(r, newRing(i)); r.on = on; r.throttle = th; });
    s.stats.asc = [0, 0, 0, 0];
    s.boughtThisRun = false;
    this.syncHist = []; this.pending = null;
    if (s.autoTune) this.autoTuneRings();
    this.spawn();
  }
  buyPerm(id) {
    const def = PERM.find((p) => p.id === id), s = this.state;
    if (s.perm[id] >= def.max) return false;
    const c = def.cost(s.perm[id]);
    if (s.core < c) return false;
    s.core -= c;
    s.perm[id]++;
    return true;
  }

  canChallenge() { return this.has('perm') && !this.state.challenge; }
  startChallenge(id) {
    if (!this.canChallenge()) return false;
    this.state.challenge = id;
    this.resetRun();
    this.emit({ type: 'challengeStart', id });
    return true;
  }
  finishChallenge(success) {
    const s = this.state, id = s.challenge;
    if (!id) return;
    s.challenge = null;
    if (success && !s.chDone.includes(id)) s.chDone.push(id);
    this.resetRun();
    this.emit({ type: 'challengeEnd', id, success });
  }

  canRevolution() { return this.has('revolution') && this.state.runBest >= 300; }
  revolutionGain() { return 1 + Math.floor((this.state.runBest - 300) / 50); }
  revolution() {
    const s = this.state;
    if (!this.canRevolution()) return false;
    s.memory += this.revolutionGain();
    s.stats.revolutions++;
    if (!s.features.minerals) { s.features.minerals = true; this.emit({ type: 'feature', id: 'minerals' }); }
    s.pmL = 0; s.pmSpent = 0; s.core = 0;
    const keep = { autoAsc: s.perm.autoAsc, autoRb: s.perm.autoRb };
    s.perm = Object.fromEntries(PERM.map((p) => [p.id, keep[p.id] || 0]));
    this.resetRun();
    this.emit({ type: 'revolution' });
    return true;
  }
  canTranscend() { return this.has('transcend') && this.state.memory >= 6; }
  transcend() {
    const s = this.state;
    if (!this.canTranscend()) return false;
    s.transcends++;
    s.stats.transcends++;
    s.memory = 0; s.pmL = 0; s.core = 0;
    s.mut = [[], [], [], []];
    const keep = { autoAsc: 1, autoRb: s.perm.autoRb };
    s.perm = Object.fromEntries(PERM.map((p) => [p.id, keep[p.id] || 0]));
    this.resetRun();
    this.emit({ type: 'transcend' });
    return true;
  }
  setWorld(w) {
    const s = this.state;
    if (!s.worlds.includes(w) || s.world === w) return false;
    s.world = w;
    this.resetRun();
    return true;
  }

  // ================= infinity =================
  canInfinity() {
    const s = this.state;
    if (!this.has('infinity')) return false;
    return s.infReady || (s.inf.broken && s.world === 4 && s.runBest >= 100);
  }
  ipGain() {
    const s = this.state;
    // before Break Infinity: a flat 2. After: the corridor depth is what pays.
    let g = s.inf.broken ? 1 + (s.world === 4 ? Math.floor(s.runBest / 25) : 0) : 2;
    if (this.ipHas('multi')) g *= 2;
    if (this.has('ipDouble')) g *= 2;
    if (this.epHas('ipx')) g *= 3;
    return g;
  }
  infinityReset() {
    const s = this.state;
    s.pmL = 0; s.pmSpent = 0; s.core = 0; s.transcends = 0;
    s.promo = [0, 0, 0, 0];
    s.memory = this.ipHas('mem') ? 6 : 0;
    s.mut = [[], [], [], []];
    s.pendingMut = null;
    const keep = { autoAsc: s.perm.autoAsc, autoRb: s.perm.autoRb };
    s.perm = Object.fromEntries(PERM.map((p) => [p.id, keep[p.id] || 0]));
    s.world = 0;
    s.challenge = null;
    s.infReady = false;
    this.resetRun();
  }
  infinity() {
    const s = this.state;
    if (!this.canInfinity()) return false;
    const gain = this.ipGain();
    s.ip += gain; s.ipTotal = (s.ipTotal || 0) + gain;
    s.inf.count++;
    s.infCh = null;
    this.infinityReset();
    this.emit({ type: 'infinity', gain });
    return true;
  }
  buyIp(id) {
    const s = this.state, u = IP_UP.find((x) => x.id === id);
    if (!u || s.ipUp[id] || s.ip < u.cost) return false;
    s.ip -= u.cost;
    s.ipUp[id] = 1;
    if (id === 'break') s.inf.broken = true;
    return true;
  }
  ipRepCost() { return Math.ceil(5 * Math.pow(1.4, this.state.ipRep || 0)); }
  buyIpRep() {
    const s = this.state, c = this.ipRepCost();
    if (!s.inf.broken || s.ip < c) return false;
    s.ip -= c; s.ipRep = (s.ipRep || 0) + 1;
    return true;
  }
  startInfCh(id) {
    const s = this.state;
    if (!this.ipHas('ich') || s.infCh) return false;
    s.infCh = id;
    this.infinityReset();
    this.emit({ type: 'infChStart', id });
    return true;
  }
  quitInfCh() { this.state.infCh = null; }

  // ================= promotion =================
  canPromote(i) { const s = this.state; return this.has('promotion') && this.on(i) && s.pmL - PROMO.costL(s.promo[i]) >= 1; }
  promote(i) {
    const s = this.state;
    if (!this.canPromote(i)) return false;
    const c = PROMO.costL(s.promo[i]);
    s.pmL -= c; s.pmSpent = (s.pmSpent || 0) + c;
    s.promo[i]++;
    s.stats.promos = (s.stats.promos || 0) + 1;
    return true;
  }

  // ================= eternity =================
  canEternity() { const s = this.state; return this.has('eternity') && s.world === 4 && s.runBest >= 300; }
  epGain() { const s = this.state; return (1 + Math.floor(Math.max(0, s.runBest - 300) / 100)) * (this.has('epDouble') ? 2 : 1); }
  eternity() {
    const s = this.state;
    if (!this.canEternity()) return false;
    const gain = this.epGain();
    s.ep += gain; s.epTotal = (s.epTotal || 0) + gain;
    s.eter.count++;
    if (s.dilOn) this.endDilation(true);
    s.ip = 0; s.ipRep = 0;
    if (!this.epHas('keepIp')) s.ipUp = {};
    s.inf.broken = !!s.ipUp.break;
    this.infinityReset();
    this.emit({ type: 'eternity', gain });
    return true;
  }
  buyEp(id) {
    const s = this.state, u = EP_UP.find((x) => x.id === id);
    if (!u || s.epUp[id] || s.ep < u.cost) return false;
    s.ep -= u.cost; s.epUp[id] = 1;
    if (id === 'cardSlot') s.cslots = (s.cslots || 3) + 1;
    return true;
  }

  // ================= dilation =================
  startDilation() {
    const s = this.state;
    if (!this.epHas('dil') || s.dilOn) return false;
    s.dilOn = true; s.dilBest = 0;
    this.infinityReset();
    this.emit({ type: 'dilStart' });
    return true;
  }
  dilGain() { return Math.max(0, Math.floor(((this.state.dilBest || 0) - 40) / 10)); }
  endDilation(silent) {
    const s = this.state;
    if (!s.dilOn) return 0;
    const g = this.dilGain();
    s.tp = (s.tp || 0) + g; s.tpTotal = (s.tpTotal || 0) + g;
    s.dilOn = false;
    if (!silent) { this.infinityReset(); this.emit({ type: 'dilEnd', gain: g }); }
    return g;
  }
  buyDil(id) {
    const s = this.state, u = DIL_UP.find((x) => x.id === id), lv = this.dl(id);
    if (!u || (u.max && lv >= u.max) || (s.tp || 0) < u.cost(lv)) return false;
    s.tp -= u.cost(lv); s.dilUp[id] = lv + 1;
    return true;
  }

  // ================= smithing / tarot / zodiac / codes =================
  refineCost(id) { const it = ITEMS.find((x) => x.id === id), r = (this.state.refine || {})[id] || 0, R = REFINE[it.rar]; return { ore: R.ore, n: R.n(r), lv: r }; }
  refineItem(id) {
    const s = this.state;
    if (!s.items[id]) return false;
    const c = this.refineCost(id);
    if (c.lv >= 10 || (s.ores[c.ore] || 0) < c.n) return false;
    s.ores[c.ore] -= c.n;
    s.stats.oreUsed = (s.stats.oreUsed || 0) + c.n;
    s.refine[id] = c.lv + 1;
    s.stats.refines = (s.stats.refines || 0) + 1;
    return true;
  }
  drawTarot(free = false) {
    const s = this.state;
    if (!free) { if ((s.ores.black || 0) < 1) return null; s.ores.black--; }
    const card = TAROT[Math.floor(Math.random() * TAROT.length)];
    s.stats.tarot = (s.stats.tarot || 0) + 1;
    if (!s.tarotSeen.includes(card.id)) s.tarotSeen.push(card.id);
    let result = card.text;
    const B = (id) => { s.buffs[id] = 600; };
    switch (card.id) {
      case 't0': this.addFlux(1800); break;
      case 't1': case 't2': case 't4': case 't6': case 't18': case 't19': B(card.id); break;
      case 't3': s.gold = ladd(s.gold, this.goldPerKillL(false) + 3); break;
      case 't7': if (this.has('burst')) s.burst = 100; break;
      case 't8': s.tarotPerm.pow++; break;
      case 't9': this.rollDrop(true, true); break;
      case 't10': { const r = this.drawTarot(true); result = 'La Rueda de la Fortuna →' + (r ? r.card.name : ''); break; }
      case 't15': if (Math.random() < 0.66) { s.tarotPerm.devil++; s.stats.devilWin = (s.stats.devilWin || 0) + 1; result = '¡Trato hecho! Permanente: todo el daño ×1.5'; } else { s.ores.black = Math.max(0, s.ores.black - 3); result = 'Precio: Mena negra -3'; } break;
      case 't17': s.tarotPerm.lap++; break;
      case 't21': for (const i of this.active()) s.rings[i].lv = Math.min(this.cap(i), s.rings[i].lv + 10); break;
    }
    this.emit({ type: 'tarot', card, result });
    return { card, result };
  }
  zodiacOpen(id) { const z = ZODIAC.find((x) => x.id === id); return this.epHas('zodiac') && (this.state.ach || []).length >= z.need; }
  toggleZodiac(id) {
    const s = this.state;
    if (s.zodiac.includes(id)) { s.zodiac = s.zodiac.filter((x) => x !== id); return true; }
    if (!this.zodiacOpen(id) || s.zodiac.length >= (s.zslots || 3)) return false;
    s.zodiac.push(id);
    return true;
  }
  // ================= shop & ads (rewards only; the platform layer handles payment) =================
  coinPackL(kills) { return this.goldPerKillL(false) + L(kills); }

  grant(productId) {
    const s = this.state;
    s.owned = s.owned || [];
    const prod = SHOP.find((p) => p.id === productId) || {}, once = prod.once;
    if (once && s.owned.includes(productId)) return false;
    this.recordSpend(prod);
    if (!s.owned.includes(productId)) s.owned.push(productId);
    switch (productId) {
      case 'rl_remove_ads': s.noAds = true; break;
      case 'rl_month': { const dn = this.dayNo(); s.month = { until: Math.max((s.month || {}).until || 0, dn) + 30 }; this.addFlux(3 * 3600, true); break; }
      case 'rl_pass': this.ensurePass(); s.pass.premium = true; break;
      case 'rl_grow_rb': s.core += 30; this.addFlux(4 * 3600, true); s.gold = ladd(s.gold, this.coinPackL(300)); break;
      case 'rl_grow_rev': s.core += 100; s.ores.black = (s.ores.black || 0) + 10; this.addFlux(8 * 3600, true); break;
      case 'rl_ore_s': s.ores.black = (s.ores.black || 0) + 10; break;
      case 'rl_ore_l': s.ores.black = (s.ores.black || 0) + 60; break;
      case 'rl_aura': s.aura = true; break;
      case 'rl_coin_s': s.gold = ladd(s.gold, this.coinPackL(300)); break;
      case 'rl_coin_l': s.gold = ladd(s.gold, this.coinPackL(2000)); break;
      case 'rl_starter': s.gold = ladd(s.gold, this.coinPackL(300)); this.addFlux(8 * 3600, true); s.ores.black = (s.ores.black || 0) + 10; s.core += 20; break;
      case 'rl_flux_s': this.addFlux(4 * 3600, true); break;
      case 'rl_flux_l': this.addFlux(24 * 3600, true); break;
      case 'rl_flux_xl': this.addFlux(72 * 3600, true); break;
      case 'rl_ore_m': s.ores.black = (s.ores.black || 0) + 130; break;
      case 'rl_ore_xl': s.ores.black = (s.ores.black || 0) + 200; break;
      case 'rl_bundle_3k': this.addFlux(7 * 86400, true); s.ores.black = (s.ores.black || 0) + 120; break;
      case 'rl_bundle_5k': this.addFlux(14 * 86400, true); s.ores.black = (s.ores.black || 0) + 250; s.supporter = true; break;
      case 'rl_bundle_10k': this.addFlux(30 * 86400, true); s.ores.black = (s.ores.black || 0) + 600; s.supporter = true; s.aura = true; break;
      case 'rl_infinity': s.ip += 5; s.ipTotal = (s.ipTotal || 0) + 5; break;
      case 'rl_eternity': s.ep += 3; s.epTotal = (s.epTotal || 0) + 3; break;
      case 'rl_supporter': this.addFlux(48 * 3600, true); s.ores.black = (s.ores.black || 0) + 50; s.supporter = true; break;
    }
    if (prod.skin || prod.set) { s.skins = s.skins || []; for (const k of prod.set || [prod.skin]) if (!s.skins.includes(k)) s.skins.push(k); if (!s.skin) s.skin = prod.skin || prod.set[0]; }
    this.emit({ type: 'grant', id: productId });
    return true;
  }
  adLeft(id, today) {
    const s = this.state, a = s.ads || (s.ads = { day: '', used: {} });
    if (a.day !== today) { a.day = today; a.used = {}; }
    const lim = { ad_coin: 10, ad_flux: 6, ad_burst: 6, ad_black: 3 }[id] || 0;
    return lim - (a.used[id] || 0);
  }
  adReward(id, today) {
    const s = this.state;
    if (this.adLeft(id, today) <= 0) return false;
    s.ads.used[id] = (s.ads.used[id] || 0) + 1;
    if (id === 'ad_coin') s.gold = ladd(s.gold, this.coinPackL(60));
    if (id === 'ad_flux') this.addFlux(1800);
    if (id === 'ad_burst') s.burst = 100;
    if (id === 'ad_black') s.ores.black = (s.ores.black || 0) + 1;
    return true;
  }

  // ================= time flux & daily =================
  fluxCap() { return 8 * 3600 * (this.has('fluxPlus') ? 2 : 1); }
  addFlux(sec, paid = false) {
    const s = this.state, cur = s.flux || 0;
    if (paid) { s.flux = cur + sec; return; }
    const gain = sec * (this.zod('z12') ? 2 : 1) * (1 + 0.2 * this.cardLv('c_time'));
    s.flux = Math.max(cur, Math.min(this.fluxCap(), cur + gain));
  }
  fluxMul() { return this.state.fluxOn && this.state.flux > 0 ? 2 : 1; }
  useFlux(realDt) {
    const s = this.state;
    if (!s.fluxOn || s.flux <= 0) return;
    s.flux = Math.max(0, s.flux - realDt);
    s.stats.fluxUsed = (s.stats.fluxUsed || 0) + realDt;
    if (s.flux <= 0) s.fluxOn = false;
  }
  daily(today, yesterday) {
    const s = this.state, d = s.daily || (s.daily = { last: '', streak: 0, total: 0 });
    if (d.last === today) return null;
    d.streak = d.last === yesterday ? d.streak + 1 : 1;
    d.total++;
    d.last = today;
    const core = this.has('perm') ? 2 * Math.min(d.streak, 7) : 0;
    s.core += core;
    this.addFlux(3600);
    this.passXp(50);
    let month = 0;
    if (this.monthLeft() > 0) { this.addFlux(3600); s.gold = ladd(s.gold, this.coinPackL(200)); month = this.monthLeft(); }
    return { streak: d.streak, core, flux: 3600, month };
  }

  // ================= shop extras: pass, monthly pass, offers, cosmetics, spending =================
  dayNo() { return Math.floor(Date.now() / 86400000); }
  monthLeft() { const m = this.state.month; return m ? Math.max(0, m.until - this.dayNo()) : 0; }
  offer(id) { const s = this.state; s.offers = s.offers || {}; if (!(id in s.offers)) s.offers[id] = Date.now() + 72 * 3600e3; }
  offerLeft(id) { return ((this.state.offers || {})[id] || 0) - Date.now(); }
  ringLook(i) {
    const k = RING_SKINS[this.state.skin];
    if (!k) return RINGS[i];
    const [col, hi, lo] = k.rings[i];
    return { col, hi, lo };
  }
  ensurePass() {
    const s = this.state, no = Math.floor(this.dayNo() / 30);
    if (!s.pass || s.pass.season !== no) s.pass = { season: no, xp: 0, premium: false, cf: 0, cp: 0, acc: 0 };
    return s.pass;
  }
  passDaysLeft() { return 30 - (this.dayNo() % 30); }
  passTier() { return Math.min(30, Math.floor(this.ensurePass().xp / 100)); }
  passXp(n) { const p = this.ensurePass(); p.xp = Math.min(3000, p.xp + n); }
  passTime(dt) { const p = this.ensurePass(); p.acc += dt; while (p.acc >= 60) { p.acc -= 60; this.passXp(1); } }
  passReward(track, k) {
    const ore = this.has('minerals');
    if (track === 'free') {
      if (k % 5 === 0) return ore ? { black: 1, text: 'Mena negra 1' } : { flux: 3600, text: 'Tiempo x2 1 h' };
      return k % 2 ? { coin: 100, text: 'Monedas (100 enemigos)' } : { flux: 900, text: 'Tiempo x2 15 min' };
    }
    if (k === 30) return { skin: 'season', text: 'Apariencia de anillo exclusiva' };
    if (k % 10 === 0) return { core: 30, flux: 7200, text: '30 Núcleos de renacimiento y 2 h de Tiempo x2' };
    if (k % 5 === 0) return ore ? { black: 3, text: 'Mena negra 3' } : { flux: 7200, text: 'Tiempo x2 2 h' };
    return k % 2 ? { coin: 400, text: 'Monedas (400 enemigos)' } : { flux: 1800, text: 'Tiempo x2 30 min' };
  }
  passClaimable() { const p = this.ensurePass(), t = this.passTier(); return Math.max(0, t - p.cf) + (p.premium ? Math.max(0, t - p.cp) : 0); }
  claimPass() {
    const s = this.state, p = this.ensurePass(), t = this.passTier();
    let n = 0;
    const give = (r) => {
      if (r.coin) s.gold = ladd(s.gold, this.coinPackL(r.coin));
      if (r.flux) this.addFlux(r.flux);
      if (r.black) s.ores.black = (s.ores.black || 0) + r.black;
      if (r.core) s.core += r.core;
      if (r.skin) { s.skins = s.skins || []; if (!s.skins.includes(r.skin)) s.skins.push(r.skin); }
      n++;
    };
    while (p.cf < t) give(this.passReward('free', ++p.cf));
    if (p.premium) while (p.cp < t) give(this.passReward('prem', ++p.cp));
    return n;
  }
  priceYen(p) { return parseInt(String(p.price || '').replace(/[^0-9]/g, ''), 10) || 0; }
  monthKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  spentThisMonth() { const sp = this.state.spend; return sp && sp.month === this.monthKey() ? sp.yen : 0; }
  spendCap() { const b = AGE_BANDS[this.state.ageBand]; return b ? b.cap : Infinity; }
  canSpend(p) { return this.spentThisMonth() + this.priceYen(p) <= this.spendCap(); }
  recordSpend(p) {
    const s = this.state, yen = this.priceYen(p);
    if (!yen) return;
    s.spend = { month: this.monthKey(), yen: this.spentThisMonth() + yen };
    s.purchases = (s.purchases || []).concat({ t: Date.now(), id: p.id, name: p.name, yen }).slice(-50);
  }

  // ================= offline =================
  runOffline(seconds) {
    const eff = 0.5 + 0.2 * this.state.perm.offline + (this.zod('z4') ? 0.3 : 0);
    let sim = Math.min(seconds, 12 * 3600) * eff;
    if (sim < 30) return null;
    const fluxGain = Math.floor(seconds * 0.2 + Math.max(0, seconds - 12 * 3600) * 0.5);
    this.addFlux(fluxGain);
    const before = { stage: this.state.stage, found: this.state.found.length, laps: this.state.stats.laps.reduce((a, b) => a + b, 0) };
    const step = sim > 3600 ? 2 : 1;
    const missionsDone = [];
    while (sim > 0) {
      this.tick(Math.min(step, sim));
      sim -= step;
      for (const e of this.events) if (e.type === 'mission') missionsDone.push(e.mission);
      this.events.length = 0;
    }
    if (this.state.pendingMut) this.chooseMut(0);
    missionsDone.forEach((m) => this.emit({ type: 'mission', mission: m }));
    return {
      seconds, eff,
      stage: this.state.stage - before.stage,
      laps: this.state.stats.laps.reduce((a, b) => a + b, 0) - before.laps,
      found: this.state.found.length - before.found,
      flux: fluxGain,
    };
  }
}
