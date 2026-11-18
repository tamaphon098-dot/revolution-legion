// DOM UI for v2. Minimal text, pixel styling; the battle screen shows only what you act on.
import { RINGS, HEROES, RANKS, RARITY, ITEMS, WORLDS, PERM, MISSIONS, FEATURE_INFO, COMBOS, MUTATIONS, TRAITS, CHALLENGES, ACHIEVEMENTS, IP_UP, INF_CH, PROMO, EP_UP, DIL_UP, ORES, TAROT, ZODIAC, SHOP, AD_REWARDS, LEGION, RECRUIT, RAID_RULES, CARDS, RING_SKINS, AGE_BANDS, VERSION, UPDATES, NEXT_CHAPTER } from './data.js';
import { fmt, fnum, UNITS } from './num.js';
import { IMG } from './px.js';
import { RingView } from './rings.js';
import { PLAY_URL, WEB_URL } from './monetize.js';
// open outside the app (Capacitor hands non-app URLs to the system browser)
const openUrl = (url) => { if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) location.href = url; else window.open(url, '_blank', 'noopener'); };

const $ = (id) => document.getElementById(id);
// coins are whole numbers on screen: prices round up, the purse rounds down
const short = (l) => (l < 4 ? String(Math.ceil(Math.pow(10, l) - 1e-9)) : fmt(l));
const purse = (l) => (l < 4 ? String(Math.max(0, Math.floor(Math.pow(10, l) + 1e-9))) : fmt(l));
const RANK_TXT = (r) => `<span style="color:${RANKS[r].col}">${RANKS[r].id}</span>`;

export class UI {
  constructor(game, hooks) {
    this.g = game;
    this.hooks = hooks;
    this.scr = 'battle';
    this.modalQ = [];
    this.rowKey = '';
    this.dexSel = null;
    this.bind();
    this.applyFeatures(false);
    this.buildRows();
  }

  // ---------------- wiring ----------------
  bind() {
    document.querySelectorAll('#nav button').forEach((b) => b.addEventListener('click', () => this.show(b.dataset.s)));
    $('burst').addEventListener('click', () => this.g.burstNow());
    $('btnFast').addEventListener('click', () => { this.g.state.autoBurst = !this.g.state.autoBurst; });
    $('btnAutoBuy').addEventListener('click', () => { this.g.state.autoBuyOn = !this.g.state.autoBuyOn; });
    $('btnFlux').addEventListener('click', () => { const s = this.g.state; if (s.flux > 0) s.fluxOn = !s.fluxOn; });
    $('chBar').addEventListener('click', () => this.confirm('Quit the Challenge?', 'This run will be reset.', () => this.g.finishChallenge(false)));
    $('btnMenu').addEventListener('click', () => this.menu());
    $('btnShop').addEventListener('click', () => this.shop());
    $('mission').addEventListener('click', () => this.missionList());
    // rewards must not vanish under rapid tapping: no backdrop dismiss
  }

  show(s) {
    this.scr = s;
    document.querySelectorAll('#nav button').forEach((b) => { b.classList.toggle('on', b.dataset.s === s); if (b.dataset.s === s) b.classList.remove('new'); });
    document.querySelectorAll('.screen').forEach((el) => el.classList.toggle('on', el.id === 'scr-' + s));
    if (s === 'heroes') this.buildHeroes();
    if (s === 'dex') this.buildDex();
    if (s === 'lab') this.buildLab();
    if (s === 'rebirth') this.buildRebirth();
    if (s === 'cosmos') this.buildCosmos();
    this.hooks.onScreen && this.hooks.onScreen(s);
  }

  applyFeatures(animate) {
    const s = this.g.state;
    document.querySelectorAll('[data-f]').forEach((el) => {
      const on = !!s.features[el.dataset.f];
      const was = !el.classList.contains('hide');
      el.classList.toggle('hide', !on);
      if (on && !was && animate && el.closest('#nav')) el.classList.add('new');
    });
    document.querySelectorAll('[data-ring]').forEach((el) => el.classList.toggle('hide', !s.rings[+el.dataset.ring].on));
    $('btnFast').classList.toggle('hide', !s.features.burst);
    $('btnAutoBuy').classList.toggle('hide', !s.features.autoBuy);
  }

  // ---------------- ring rows (the main buttons) ----------------
  buildRows() {
    const g = this.g, wrap = $('rows');
    wrap.innerHTML = '';
    let ghost = false;
    RINGS.forEach((def, i) => {
      if (!g.on(i)) {
        if (ghost) return;
        ghost = true;
        wrap.insertAdjacentHTML('beforeend', `<div class="row ghost" style="--c:${def.col}"><div class="por" style="--c:var(--steel)"><img class="px" src="px/pors_${def.hero}.png" style="filter:brightness(0)"></div><div>???  Unlocked by Missions</div></div>`);
        return;
      }
      wrap.insertAdjacentHTML('beforeend', `
        <div class="row" style="--c:${def.col}">
          <div class="por"><img class="px" src="px/pors_${g.heroId(i)}.png"><span class="rk" id="rRk${i}"></span><span class="asc" id="rAsc${i}"></span></div>
          <div><div class="nm"><span>${def.name}</span><small id="rLv${i}"></small></div><div class="lvbar"><b id="rBar${i}"></b></div><div class="lapm" id="rLap${i}"></div></div>
          <button class="btn" id="bLv${i}"><span id="bLvT${i}">Lv+</span><span class="c" id="bLvC${i}"></span></button>
          <button class="btn blue" id="bSp${i}"><span>Speed+</span><span class="c" id="bSpC${i}"></span></button>
        </div>`);
      this.holdable($('bLv' + i), () => (g.canAsc(i) ? (g.ascend(i), false) : g.buyLv(i)));
      this.holdable($('bSp' + i), () => g.buySpd(i));
    });
    this.rowKey = this.key();
  }
  key() { return this.g.state.rings.map((r) => +r.on).join('') + (this.g.has('speed') ? 's' : '') + (this.g.state.lineup || []).join(','); }

  // tap = buy once, hold = keep buying (feels good with cheap early levels)
  holdable(el, fn) {
    let timer = null, delay = null;
    const stop = () => { clearTimeout(delay); clearInterval(timer); timer = delay = null; };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (el.disabled) return;
      if (fn() === false) return;
      this.refresh();
      delay = setTimeout(() => { timer = setInterval(() => { if (!fn()) stop(); this.refresh(); }, 70); }, 350);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
  }

  // ---------------- per-frame-ish refresh (10 Hz) ----------------
  refresh() {
    const g = this.g, s = g.state;
    if (this.key() !== this.rowKey) this.buildRows();
    $('gold').textContent = purse(s.gold);
    $('pm').textContent = '×' + fmt(s.pmL, 1);
    $('stage').textContent = s.stage;
    $('world').textContent = g.worldDef().name;

    const m = g.current();
    if (m) {
      const [c, t] = m.cond(s);
      $('mId').textContent = m.id;
      $('mName').textContent = m.name;
      $('mProg').textContent = `${fnum(Math.min(c, t), 0)}/${fnum(t, 0)}`;
      $('mBar').style.width = Math.min(100, (c / t) * 100) + '%';
      $('mRew').textContent = m.reward.text;
    } else { $('mId').textContent = '★'; $('mName').textContent = 'All Missions complete!'; $('mProg').textContent = ''; $('mBar').style.width = '100%'; }

    $('tapHint').classList.toggle('hide', (s.stats.taps || 0) >= 15 || this.scr !== 'battle');
    $('ringHint').classList.toggle('hide', (s.stats.spun || 0) >= 3);
    const e = g.enemy;
    const tr = e.trait && TRAITS[e.trait];
    $('ename').innerHTML = tr ? `<span style="color:${tr.col}">【${tr.name}】</span>${e.n}<small>${tr.tip}</small>` : e.n;
    $('ename').className = e.boss ? 'boss' : '';
    const chal = s.challenge && CHALLENGES.find((c) => c.id === s.challenge);
    $('chBar').classList.toggle('hide', !chal && !s.dilOn && !g.raid);
    if (g.raid) $('chBar').innerHTML = `Raid "${g.raid.rule.name}" ${Math.ceil(g.raid.t)}s left · Damage ${fmt(g.raid.dmgL)}`;
    if (s.dilOn && !chal && !g.raid) $('chBar').innerHTML = `Dilation (damage exponent ×${(0.75 + 0.02 * g.dl('d_soft')).toFixed(2)}) Exit for Crystals +${g.dilGain()}`;
    if (chal && !g.raid) $('chBar').innerHTML = `Challenge: ${chal.name} (${chal.rule}) ${Math.min(s.runBest, chal.goal)}/${chal.goal}  <u>Quit</u>`;
    $('btnAutoBuy').textContent = s.autoBuyOn ? 'Auto-upgrade' : 'Manual upgrade';
    $('btnFlux').classList.toggle('hide', !s.features.autoBuy || !(s.flux > 0 || s.fluxOn));
    $('btnFlux').classList.toggle('on', !!s.fluxOn);
    { const f = Math.floor(s.flux || 0), h = Math.floor(f / 3600), mm = Math.floor((f % 3600) / 60); $('btnFlux').textContent = `2x ${h}:${String(mm).padStart(2, '0')}`; }
    $('btnAutoBuy').classList.toggle('on', s.autoBuyOn);
    $('sDps').textContent = fmt(g.dpsL(), 1);
    $('sRps').textContent = fnum(g.active().reduce((a, i) => a + g.rps(i), 0), 2);
    $('sSync').textContent = Math.round(g.syncRate() * 100) + '%';
    $('burstBar').style.width = (s.od > 0 ? (s.od / 10) * 100 : s.burst) + '%';
    $('burst').classList.toggle('ready', s.burst >= 100 && s.od <= 0);
    $('burst').classList.toggle('od', s.od > 0);
    $('btnFast').textContent = s.autoBurst ? 'AUTO' : 'Manual';
    $('dexBadge').classList.toggle('hide', !(s.unseenItems > 0));
    $('btnShop').classList.toggle('alert', g.passClaimable() > 0 || SHOP.some((p) => p.offer && g.offerLeft(p.id) > 0 && !(s.owned || []).includes(p.id)));
    $('dexBadge').textContent = s.unseenItems > 9 ? '9+' : s.unseenItems || '';
    $('btnFast').classList.toggle('on', s.autoBurst);

    RINGS.forEach((def, i) => {
      if (!g.on(i) || !$('rLv' + i)) return;
      const r = s.rings[i], cap = g.cap(i);
      $('rLv' + i).innerHTML = `Lv${r.lv}/${cap}`;
      $('rAsc' + i).textContent = r.asc ? '★' + r.asc : '';
      $('rLap' + i).textContent = `Lap mult ×${fmt(r.lapL)}`;
      $('rBar' + i).style.width = (r.lv / cap) * 100 + '%';
      const rk = g.rank(g.heroId(i));
      $('rRk' + i).innerHTML = RANK_TXT(rk);
      const asc = g.canAsc(i);
      const bl = $('bLv' + i);
      bl.classList.toggle('asc', asc);
      $('bLvT' + i).textContent = asc ? 'Limit Break' : 'Lv+';
      $('bLvC' + i).textContent = asc ? '★+1' : short(g.lvCostL(i));
      bl.disabled = !asc && !g.canLv(i);
      const sp = $('bSp' + i);
      sp.classList.toggle('hide', !g.has('speed'));
      const spMax = r.spd >= g.spdCap(i);
      $('bSpC' + i).textContent = spMax ? `MAX` : short(g.spdCostL(i));
      sp.disabled = !g.canSpd(i);
    });

    if (this.scr === 'lab') this.refreshLab();
    if (this.scr === 'rebirth') this.refreshRebirth();
  }

  // ---------------- events ----------------
  onEvent(ev) {
    const g = this.g;
    switch (ev.type) {
      case 'mission': if (ev.mission.id === 'M40') this.trueEnding(); return this.onMission(ev.mission);
      case 'ascend': {
        const h = HEROES[RINGS[ev.ring].hero];
        if (ev.rankUp) this.modal(`<div class="sub">RANK UP</div><h3>${RANK_TXT(ev.rankUp - 1)} → ${RANK_TXT(ev.rankUp)}</h3>
          <img class="pic" src="px/${h.portrait}.png" width="160" height="160">
          <p>${h.name} promoted!<br>Damage ×${RANKS[ev.rankUp].mult}${ev.rankUp === 3 && h.ring === 0 ? '<br>More slashes!' : ''}</p>
          <div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast('Ascension!', `${RINGS[ev.ring].name} Lv cap ${g.cap(ev.ring)} · Multiplier growth +5%`);
        return;
      }
      case 'drop': this.dropCard(ev); return;
      case 'bossfail': this.toast('Boss not defeated', 'Power up for 45s, then retry'); return;
      case 'rebirth': this.toast(`Rebirth! Multiplier ×${fmt(g.state.pmL, 1)}`, `Cores +${ev.core}`); this.buildRows(); return;
      case 'clear': if (ev.first) this.ending(); else this.toast('Void King defeated!', 'You can go Infinity from the Rebirth screen'); return;
      case 'infinity': this.toast(`Infinity! Infinity Points +${ev.gain}`); this.buildRows(); return;
      case 'infChStart': this.toast(`Infinity Challenge "${INF_CH.find((c) => c.id === ev.id).name}" started`, INF_CH.find((c) => c.id === ev.id).rule); this.show('battle'); return;
      case 'infChClear': { const c = INF_CH.find((x) => x.id === ev.id); this.modal(`<div class="sub">INFINITY CHALLENGE</div><h3>${c.name}</h3><p>Permanent reward: <span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'unit': this.unitStamp(ev.u); return;
      case 'recruit': { const h = HEROES[ev.id]; this.modal(`<div class="sub">NEW HERO</div><h3>${h.name}</h3><img class="pic" src="px/por_${ev.id}.png" width="160" height="160"><p>${h.job} joins your Legion!<br>${h.line}<br><span style="color:var(--lemon)">Place them on a Ring in the Legion screen</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'card': if (!ev.free) this.toast(`Tactic Card "${ev.card.name}" Lv${ev.lv}`, ev.card.text); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'raidStart': this.toast(`Raid started: "${ev.rule.name}"`, ev.rule.text); this.show('battle'); return;
      case 'raidEnd': { const T = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Rainbow']; this.modal(`<div class="sub">RAID RESULT</div><h3>${T[ev.tier]}</h3><p>Damage ${fmt(ev.score)}${ev.suspicious ? '<br><span style="color:var(--red)">Invalid: the record looks abnormal</span>' : ev.gained ? `<br>Badges +${ev.gained} · Tactic Cards ×${ev.gained * 2}` : '<br>No more rewards this week'}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'heroes') this.buildHeroes(); return; }
      case 'feature': { const f = FEATURE_INFO[ev.id]; if (f) this.modal(`<div class="sub">NEW</div><h3>${f[0]}</h3><p>${f[1]}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); this.applyFeatures(true); return; }
      case 'tarot': this.modal(`<div class="sub">TAROT</div><h3>${ev.card.name}</h3><p>${ev.result}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'eternity': this.toast(`Eternity! Eternity Points +${ev.gain}`); this.buildRows(); return;
      case 'dilStart': this.toast('Entered Dilation', 'Damage is weakened. The further you go, the more Crystals you get'); this.show('battle'); return;
      case 'dilEnd': this.toast(`Left Dilation. Crystals +${ev.gain}`); return;
      case 'blackOre': this.toast('Found Black Ore!', 'You can draw Tarot in the Cosmos tab'); return;
      case 'grant': this.toast('Claimed', (SHOP.find((p) => p.id === ev.id) || {}).name || ''); return;
      case 'ach': this.toast(`★Achievement "${ev.ach.name}" ×1.05`); return;
      case 'mutChoice': return this.mutPicker(ev);
      case 'mutation': this.toast(`Ring Mutation! ${ev.mutation.name}`, ev.mutation.text); return;
      case 'challengeEnd': {
        const c = CHALLENGES.find((x) => x.id === ev.id);
        if (ev.success) this.modal(`<div class="sub">CHALLENGE CLEAR</div><h3>${c.name}</h3><p>Permanent reward: <span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast(`${c.name} abandoned`);
        this.buildRows();
        return;
      }
      case 'challengeStart': this.toast(`${CHALLENGES.find((x) => x.id === ev.id).name} started`, CHALLENGES.find((x) => x.id === ev.id).rule); this.buildRows(); this.show('battle'); return;
    }
  }

  onMission(m) {
    const rw = m.reward;
    this.applyFeatures(true);
    if (rw.ring !== undefined || rw.feature || rw.world !== undefined) {
      const info = rw.feature && FEATURE_INFO[rw.feature];
      const pic = rw.ring !== undefined ? `<img class="pic" src="px/${HEROES[RINGS[rw.ring].hero].portrait}.png" width="160" height="160">` : '';
      this.modal(`<div class="sub">MISSION CLEAR ${m.id}</div><h3>${rw.ring !== undefined ? 'New Ally' : 'Unlocked!'}</h3>${pic}
        <p>${m.name}<br><span style="color:var(--lemon)">${rw.text}</span>${info ? `<br>${info[1]}` : ''}</p>
        <p>Permanent bonus ×${this.g.state.missions.length + 1}</p>
        <div class="btns"><button class="btn" data-x>OK</button></div>`);
    } else this.toast(`Mission Clear ${m.id}`, rw.text);
    this.buildRows();
  }

  // ITEM GET card: visible, non-blocking; offers "equip" only when it is an upgrade (never auto-equips unless enabled)
  dropCard(ev) {
    const g = this.g, it = ev.item, rar = RARITY[it.rar], el = $('dropCard');
    const h = HEROES[ev.hid];
    clearTimeout(this._dropT);
    el.style.setProperty('--rc', rar.col);
    el.innerHTML = `<div class="ic"><img src="px/${it.id}.png"></div>
      <div class="hd">ITEM GET!${ev.isNew ? ' <span style="color:var(--pink)">NEW</span>' : ' Lv' + ev.lv}</div>
      <div class="nm"><span style="color:${rar.col}">${rar.id}</span> ${it.name}</div>
      <div class="sub">${h.name}'s gear${it.fxText ? ' · ' + it.fxText : ''}</div>
      ${ev.better ? `<div class="bt"><button class="btn" id="dcEq">Equip (×${fnum(Math.pow(10, ev.before), 1)}→×${fnum(Math.pow(10, ev.after), 1)})</button><button class="btn red" id="dcNo">Later</button></div>` : ''}`;
    el.classList.remove('hide');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    const hide = () => el.classList.add('hide');
    if (ev.better) {
      el.querySelector('#dcEq').addEventListener('click', (e) => { e.stopPropagation(); g.equipItem(ev.hid, it.id); this.toast(`${h.name} equipped ${it.name}`); hide(); });
      el.querySelector('#dcNo').addEventListener('click', (e) => { e.stopPropagation(); hide(); });
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { once: false });
    }
    this._dropT = setTimeout(hide, ev.better ? 9000 : 4000);
  }

  unitStamp(u) {
    const el = $('stamp');
    el.innerHTML = `<b>${UNITS[u]}</b><span>Reached!</span><small>Unit bonus: ALL damage ×1.15</small>`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }

  toast(t, sub = '') {
    const d = document.createElement('div');
    d.className = 'tst';
    d.innerHTML = t + (sub ? `<small>${sub}</small>` : '');
    $('toast').appendChild(d);
    setTimeout(() => d.remove(), 2500);
    while ($('toast').children.length > 2) $('toast').firstChild.remove();
  }
  // Each queued dialog keeps its own setup callback, so queued dialogs never wire buttons to the wrong box.
  modal(html) { const e = { html, fn: null }; this.modalQ.push(e); this._last = e; if (this.modalQ.length === 1) this.open(); }
  set onOpen(fn) { const e = this._last; if (!e) return; e.fn = fn; if (this._shown === e && fn) fn($('mbox')); }
  open() {
    const box = $('mbox'), e = this.modalQ[0];
    box.innerHTML = e.html;
    box.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => this.close()));
    $('modal').classList.remove('hide');
    box.classList.add('lock');
    clearTimeout(this._lockT);
    this._lockT = setTimeout(() => box.classList.remove('lock'), 700);
    this._shown = e;
    this.hooks.onModal && this.hooks.onModal(true);
    if (e.fn) e.fn(box);
  }
  close() {
    this.modalQ.shift();
    this._shown = null;
    if (this.modalQ.length) this.open();
    else { $('modal').classList.add('hide'); this.hooks.onModal && this.hooks.onModal(false); }
  }

  missionList() {
    if (this.hooks.onMissionList) this.hooks.onMissionList();
    const s = this.g.state, cur = this.g.current();
    const ci = cur ? MISSIONS.indexOf(cur) : MISSIONS.length;
    const rows = MISSIONS.map((m, k) => {
      const done = s.missions.includes(m.id);
      const hidden = k > ci + 1;
      return `<div class="mrow ${done ? 'done' : ''}"><span class="id">${done ? '✓' : String(k + 1).padStart(2, '0')}</span><div>${hidden ? '???' : m.name}<small>${hidden ? '' : m.reward.text}</small></div></div>`;
    }).join('');
    this.modal(`<div class="sub">Permanent bonus ×${s.missions.length + 1} (kept through Rebirth)</div><h3>Missions</h3><div class="list">${rows}</div><div class="btns"><button class="btn" data-x>Close</button></div>`);
  }

  // ---------------- heroes ----------------
  buildHeroes() {
    const g = this.g, s = g.state;
    // weekly raid panel
    if (g.has('raid')) {
      const wk = this.hooks.week(), rule = RAID_RULES[((wk.no % RAID_RULES.length) + RAID_RULES.length) % RAID_RULES.length], R = s.raid, cur = R.week === wk.key ? R.weekTier : 0;
      $('raidBox').innerHTML = `<div class="rb panel"><h3>Weekly Raid "${rule.name}"</h3><p>${rule.text}<br>Deal as much damage as you can in 60 seconds. Target: your current attack × 60 sec.</p>
        <div class="tierbar">${['Bronze', 'Silver', 'Gold', 'Rainbow'].map((t, k) => `<span class="${cur > k ? 'got' : ''}">${t}</span>`).join('')}</div>
        <p>Badges ${R.tokens} (total ${R.tokensTotal})  Personal best ${R.best ? fmt(R.best) : '-'}</p>
        <button class="btn red" id="bRaid" style="width:100%" ${g.raid ? 'disabled' : ''}>${g.raid ? 'In progress' : 'Start (unlimited tries)'}</button></div>`;
      $('bRaid').addEventListener('click', () => { const w = this.hooks.week(); g.startRaid(w.key, w.no); });
    } else $('raidBox').innerHTML = '';
    // legion lineup per ring
    const lg = RINGS.map((def, i) => {
      if (!g.on(i)) return '';
      return `<div class="panel" style="margin-bottom:6px"><div class="ringhead"><span style="color:${def.col}">${def.name}</span><span>${HEROES[g.heroId(i)].name}</span></div><div class="lg">` + LEGION[i].map((id) => {
        const h = HEROES[id], have = s.recruits.includes(id), on = g.heroId(i) === id;
        return `<button class="${on ? 'on' : have ? '' : 'lock'}" data-lu="${i}:${id}"><img src="px/por_${id}.png">${have ? h.name : '???'}<small>${have ? h.job : RECRUIT[id] ? RECRUIT[id].text : ''}</small></button>`;
      }).join('') + `</div><p class="note">${HEROES[g.heroId(i)].line}</p></div>`;
    }).join('');
    $('heroList').innerHTML = lg + RINGS.map((def, i) => {
      const id = g.heroId(i), h = HEROES[id], on = g.on(i);
      const rk = g.rank(id), next = RANKS[rk + 1];
      const eq = s.equip[id], it = eq && ITEMS.find((x) => x.id === eq);
      return `<div class="hero panel ${on ? '' : 'lock'}">
        <div class="por"><img class="px" src="px/${h.portrait}.png"><span class="rk">${RANK_TXT(rk)}</span></div>
        <div><div class="nm">${on ? `${h.name} <span style="color:var(--cloud)">${h.job}</span>` : '???'}</div>
          <div class="ln">${on ? h.line : 'Joins you through Missions'}</div>
          <div class="ln">Total Ascensions ${s.stats.ascTotal[i]}${next ? ` (${next.id} at ${next.need})` : ' (Max rank)'}</div>
          ${on && g.has('items') ? `<div class="equip"><span class="slot" style="--rc:${it ? RARITY[it.rar].col : ''}">${it ? `<img class="px" src="px/${it.id}.png">` : ''}</span><span>${it ? `${it.name} Lv${g.itemLevel(it.id)}` : 'No gear'}</span><button class="small-btn" data-eq="${id}">Change</button></div>` : ''}
        </div></div>`;
    }).join('');
    $('heroList').querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => this.equipPicker(b.dataset.eq)));
    $('heroList').querySelectorAll('[data-lu]').forEach((b) => b.addEventListener('click', () => { const [i, id] = b.dataset.lu.split(':'); if (g.setLineup(+i, id)) { this.buildHeroes(); this.buildRows(); } }));
  }
  equipPicker(hid) {
    const g = this.g, s = g.state, type = HEROES[hid].type;
    const own = ITEMS.filter((it) => it.type === type && s.items[it.id]);
    this.modal(`<div class="sub">${HEROES[hid].name}'s gear</div><div class="list">${own.map((it) => `<div class="mrow" data-pick="${it.id}" style="cursor:pointer"><span class="slot" style="--rc:${RARITY[it.rar].col}"><img class="px" src="px/${it.id}.png"></span><div>${it.name} <span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> Lv${g.itemLevel(it.id)}<small>×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)} ${it.fxText}</small></div></div>`).join('') || '<p>Not owned yet</p>'}</div><div class="btns"><button class="btn" data-x>Close</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-pick]').forEach((r) => r.addEventListener('click', () => { s.equip[hid] = r.dataset.pick; this.close(); this.buildHeroes(); }));
  }

  // ---------------- dex ----------------
  buildDex() {
    const g = this.g, s = g.state;
    s.unseenItems = 0;
    if (!$('dexTabs')) {
      $('scr-dex').insertAdjacentHTML('afterbegin', '<div id="dexTabs" class="tabs"><button class="small-btn on" data-t="items">Codex</button><button class="small-btn" data-t="ach">Achievements</button></div><div id="achList" class="hide"></div>');
      $('dexTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { this.dexTab = b.dataset.t; this.buildDex(); }));
    }
    const achTab = this.dexTab === 'ach';
    $('dexTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === (achTab ? 'ach' : 'items')));
    ['dexGrid', 'dexInfo', 'dexNote'].forEach((id) => $(id).classList.toggle('hide', achTab));
    $('scr-dex').querySelector('h2').classList.toggle('hide', achTab);
    $('achList').classList.toggle('hide', !achTab);
    if (achTab) {
      $('achList').innerHTML = `<p class="note">Achievements ${s.ach.length}/${ACHIEVEMENTS.length}  ALL damage ×${fnum(Math.pow(1.05, s.ach.length), 2)}</p>` + ACHIEVEMENTS.map((a) => {
        const done = s.ach.includes(a.id), hide = a.secret && !done;
        return `<div class="mrow ${done ? '' : 'done'}"><span class="id">${done ? '★' : ' · '}</span><div>${hide ? '??? (hidden achievement)' : a.name}<small>${hide ? 'Conditions are secret' : a.desc}</small></div></div>`;
      }).join('');
      return;
    }
    $('dexCount').textContent = `${s.found.length}/${ITEMS.length}`;
    $('dexNote').textContent = g.has('dexBonus') ? `Codex bonus: ALL damage ×${fmt(g.dexL(), 1)}` : 'Items you find are recorded here';
    $('dexGrid').innerHTML = ITEMS.map((it) => {
      const own = s.items[it.id];
      return `<div class="cell ${own ? '' : 'unk'} ${this.dexSel === it.id ? 'sel' : ''}" data-it="${it.id}" style="--rc:${own ? RARITY[it.rar].col : ''}"><img class="px" src="px/${it.id}.png">${own ? `<span class="lv">${g.itemLevel(it.id)}</span>` : ''}</div>`;
    }).join('');
    $('dexGrid').querySelectorAll('[data-it]').forEach((c) => c.addEventListener('click', () => { this.dexSel = c.dataset.it; this.buildDex(); }));
    const it = this.dexSel && ITEMS.find((x) => x.id === this.dexSel);
    if (!it) { $('dexInfo').innerHTML = 'Tap an item to see its details'; return; }
    const own = s.items[it.id];
    const hid = Object.keys(HEROES).find((h) => HEROES[h].type === it.type);
    $('dexInfo').innerHTML = own
      ? `<span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> ${it.name} Lv${g.itemLevel(it.id)} (${own} owned)<br>${HEROES[hid].name} only · Damage ×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)}<br>${it.fxText || ''}`
        + (s.equip[hid] === it.id ? '<br><span style="color:var(--leaf)">Equipped</span>' : g.on(HEROES[hid].ring) ? `<br><button class="btn" id="dexEq">Equip</button>` : '')
      : '???  Not found yet';
    const b = $('dexEq');
    if (b) b.addEventListener('click', () => { s.equip[hid] = it.id; this.buildDex(); });
  }

  // ---------------- lab ----------------
  buildLab() {
    const g = this.g, s = g.state;
    if (!this.labView) this.labView = new RingView($('lcv'), null, g, 144);
    const rows = g.active().map((i) => `<div class="lrow" style="--c:${RINGS[i].col}"><span style="color:${RINGS[i].col}">${RINGS[i].name}</span><input type="range" min="10" max="100" value="${Math.round(s.rings[i].throttle * 100)}" id="th${i}" ${s.autoTune ? 'disabled' : ''}><span class="v" id="thv${i}"></span></div>`).join('');
    $('labRows').innerHTML = `<div class="panel">${rows}
      ${g.has('autotune') ? `<div class="tog"><span>Auto-tuning</span><button class="small-btn ${s.autoTune ? 'on' : ''}" id="tTune">${s.autoTune ? 'ON' : 'OFF'}</button></div>` : ''}
      <div class="tog"><span>Align speed ratios</span><button class="btn" id="tNow">Align</button></div></div>
      <div class="panel" style="margin-top:6px" id="labStats"></div>`;
    g.active().forEach((i) => $('th' + i).addEventListener('input', (e) => { g.setThrottle(i, e.target.value / 100); this.refreshLab(); }));
    if ($('tTune')) $('tTune').addEventListener('click', () => { s.autoTune = !s.autoTune; if (s.autoTune) g.autoTuneRings(); this.buildLab(); });
    $('tNow').addEventListener('click', () => { g.autoTuneRings(); this.buildLab(); this.toast('Speed ratios aligned'); });
    this.refreshLab();
  }
  refreshLab() {
    const g = this.g, s = g.state;
    g.active().forEach((i) => { const v = $('thv' + i); if (v) v.textContent = fnum(g.rps(i), 2) + '/s'; });
    const st = $('labStats');
    if (st) st.innerHTML = `Sync rate <span style="color:var(--lemon)">${Math.round(g.syncRate() * 100)}%</span><br>`
      + [2, 3, 4].map((n) => `${COMBOS[n].name} ×${fmt(g.comboL(n), 0)} · ${s.stats['combo' + n]} times`).join('<br>')
      + (s.mut.some((m) => m.length) ? '<br>Mutation: ' + s.mut.map((m, i) => m.map((id) => `${RINGS[i].name.slice(0, 1)}${MUTATIONS.find((x) => x.id === id).name}`).join(' ')).filter(Boolean).join(' ') : '');
  }

  // ---------------- rebirth ----------------
  buildRebirth() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('infinity')) {
      h += `<div class="rb panel"><h3>Infinity  <span style="color:var(--cyan)">Infinity Points ${s.ip}</span></h3>
        <p>${g.canInfinity() ? `Go Infinity now for <span class="big">+${g.ipGain()}</span>` : 'Defeat the Void King to go Infinity' + (s.inf.broken ? ' (also possible at Endless Corridor Stage 100+)' : '')}</p>
        <p style="color:var(--mist)">Resets Rebirth multiplier, Cores, Permanent tree, Revolution and Transcend. Heroes, Codex, Achievements, Challenges and Missions are kept.</p>
        <button class="btn blue" id="bInf" style="width:100%" ${g.canInfinity() ? '' : 'disabled'}>Infinity (#${s.inf.count})</button></div>`;
      h += `<div class="rb panel"><h3>Infinity Upgrades</h3>` + IP_UP.map((u) => `<div class="perm"><span>${u.name} ${g.ipHas(u.id) ? '<span style="color:var(--leaf)">Done</span>' : ''}</span><button class="btn blue" data-ip="${u.id}" ${g.ipHas(u.id) || s.ip < u.cost ? 'disabled' : ''}>${g.ipHas(u.id) ? 'Done' : '∞' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('')
        + (s.inf.broken ? `<div class="perm"><span>Infinity multiplier Lv${s.ipRep || 0}</span><button class="btn blue" id="bIpRep" ${s.ip < g.ipRepCost() ? 'disabled' : ''}>∞${g.ipRepCost()}</button><span class="pt">ALL damage ×1e10 (repeatable)</span></div>` : '') + '</div>';
      if (g.ipHas('ich')) h += `<div class="rb panel"><h3>Infinity Challenges</h3><p>Defeat the Void King while following the rules to clear.</p>` + INF_CH.map((c) => { const done = s.infChDone.includes(c.id), cur = s.infCh === c.id; return `<div class="perm"><span>${done ? '★ ' : ''}${c.name}</span><button class="btn ${cur ? 'red' : 'rose'}" data-ic="${c.id}" ${(s.infCh && !cur) || done ? 'disabled' : ''}>${cur ? 'Quit' : done ? 'Done' : 'Start'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">Reward: ${c.reward}</span></span></div>`; }).join('') + '</div>';
    }
    h += `<div class="rb panel"><h3>Rebirth</h3>
      <p>Current multiplier <span class="big">×${fmt(s.pmL, 1)}</span></p>
      <p>Rebirth for <span class="big" id="rbTo"></span>  Cores +<span id="rbCore"></span></p>
      <p style="color:var(--mist)">Resets Stage, Gold and Rings. Hero Ranks, Codex and Missions are kept. A gain of ×10 or more is a good guide.</p>
      <button class="btn red" id="bRb" style="width:100%">Rebirth</button>
${s.perm.autoRb ? `<div class="tog"><span>Auto-Rebirth at multiplier growth of</span><button class="small-btn" id="bAutoRb">×${fmt(s.autoRbL, 0)}</button></div>` : ''}</div>`;
    if (g.has('promotion')) {
      h += `<div class="rb panel"><h3>Advancement</h3><p>Sacrifice part of your Rebirth multiplier to gain ×2 power and +15% lap multiplier growth for that Ring (resets on Infinity).</p>` + RINGS.map((def, i) => !g.on(i) ? '' : `<div class="perm"><span style="color:${def.col}">${def.name} Advance Lv${s.promo[i]}</span><button class="btn" data-pr="${i}" ${g.canPromote(i) ? '' : 'disabled'}>Multiplier ÷${fmt(PROMO.costL(s.promo[i]))}</button><span class="pt">Power ×${fmt(s.promo[i] * PROMO.pow)} · Growth +${s.promo[i] * 15}%</span></div>`).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>Permanent Tree  <span style="color:var(--rose)">Cores ${s.core}</span></h3>` + PERM.map((p) => {
        const lv = s.perm[p.id], max = lv >= p.max;
        return `<div class="perm"><span>${p.name} <span style="color:var(--mist)">${p.max > 1 ? `${lv}/${p.max}` : lv ? 'Done' : ''}</span></span><button class="btn rose" data-p="${p.id}" ${max || s.core < p.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : 'Core ' + p.cost(lv)}</button><span class="pt">${p.text}</span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>Challenges</h3><p>Runs with restrictions. Reach the goal stage to clear and earn a permanent reward.</p>` + CHALLENGES.map((c) => {
        const done = s.chDone.includes(c.id), cur = s.challenge === c.id;
        return `<div class="perm"><span>${done ? '★ ' : ''}${c.name} <span style="color:var(--mist)">Goal${c.goal}</span></span><button class="btn ${cur ? 'red' : 'blue'}" data-ch="${c.id}" ${(s.challenge && !cur) ? 'disabled' : ''}>${cur ? 'Quit' : done ? 'Retry' : 'Start'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">Reward: ${c.reward}</span></span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('revolution')) {
      h += `<div class="rb panel"><h3>Revolution</h3><p>Available at Stage 300+ in a single run. Discard your Rebirth multiplier, Cores and Permanent tree (except automation) to gain Revolution Memories.</p>
        <p>Revolution Memories <span class="big">${s.memory}</span> (each: damage ×3, lap multiplier growth +20%)</p>
        <button class="btn rose" id="bRev" style="width:100%" ${g.canRevolution() ? '' : 'disabled'}>Revolution (Memories +${g.canRevolution() ? g.revolutionGain() : 0})</button></div>`;
    }
    if (g.has('transcend')) {
      h += `<div class="rb panel"><h3>Transcend</h3><p>Requires 6+ Memories. Discard everything for ALL damage ×100 and all speed +25%. Opens the door to the final world.</p>
        <button class="btn red" id="bTr" style="width:100%" ${g.canTranscend() ? '' : 'disabled'}>Transcend</button></div>`;
    }
    if (s.worlds.length > 1) {
      h += `<div class="rb panel"><h3>Worlds</h3><div class="worlds">` + s.worlds.map((w) => `<button class="${s.world === w ? 'on' : ''}" data-w="${w}">${WORLDS[w].name}<small>${WORLDS[w].law} · Best ${s.worldBest[w] || 0}</small></button>`).join('') + '</div><p style="color:var(--mist)">Switching worlds resets your current run.</p></div>';
    }
    const R = s.rules;
    const rules = [];
    if (g.has('promotion')) rules.push(`<div class="rule"><span>Auto-Advancement</span><button class="small-btn ${R.autoPromo ? 'on' : ''}" data-rt="autoPromo">${R.autoPromo ? 'ON' : 'OFF'}</button></div>`);
    if (g.ipHas('autoRev')) rules.push(`<div class="rule"><span>Auto-Revolution: Stage</span><input type="number" data-rn="revStage" value="${R.revStage}" min="300" step="50"></div>`);
    if (g.ipHas('autoTr')) rules.push(`<div class="rule"><span>Auto-Transcend</span><button class="small-btn ${R.autoTr ? 'on' : ''}" data-rt="autoTr">${R.autoTr ? 'ON' : 'OFF'}</button></div>`);
    if (g.epHas('autoInf')) rules.push(`<div class="rule"><span>Auto-∞: Points gained (0=OFF)</span><input type="number" data-rn="infGain" value="${R.infGain}" min="0"></div>`);
    if (g.has('eternity')) rules.push(`<div class="rule"><span>Auto-Eternity: Corridor Stage (0=OFF)</span><input type="number" data-rn="eterStage" value="${R.eterStage}" min="0" step="100"></div>`);
    if (rules.length) h += `<div class="rb panel"><h3>Automation Rules</h3>${rules.join('')}</div>`;
    $('rbBody').innerHTML = h;
    $('rbBody').querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => { if (g.promote(+b.dataset.pr)) this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rt]').forEach((b) => b.addEventListener('click', () => { R[b.dataset.rt] = !R[b.dataset.rt]; this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rn]').forEach((inp) => inp.addEventListener('change', () => { R[inp.dataset.rn] = Math.max(0, parseInt(inp.value, 10) || 0); }));
    $('bRb').addEventListener('click', () => { if (g.rebirth()) { this.buildRebirth(); this.hooks.onSave(); } });
    if ($('bInf')) $('bInf').addEventListener('click', () => this.confirm('Go Infinity?', `Infinity Points +${g.ipGain()}. Rebirth, Revolution and Transcend progress will reset.`, () => { g.infinity(); this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-ip]').forEach((b) => b.addEventListener('click', () => { if (g.buyIp(b.dataset.ip)) { this.buildRebirth(); this.toast('Infinity Upgrades', IP_UP.find((u) => u.id === b.dataset.ip).text); } }));
    if ($('bIpRep')) $('bIpRep').addEventListener('click', () => { if (g.buyIpRep()) this.buildRebirth(); });
    $('rbBody').querySelectorAll('[data-ic]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.ic; if (s.infCh === id) { g.quitInfCh(); this.buildRebirth(); } else this.confirm('Start an Infinity Challenge?', 'Same reset as Infinity (no Points are awarded).', () => { g.startInfCh(id); this.buildRebirth(); }); }));
    $('rbBody').querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.ch;
      if (s.challenge === id) this.confirm('Quit the Challenge?', 'This run will be reset.', () => { g.finishChallenge(false); this.buildRebirth(); });
      else this.confirm('Start a Challenge?', 'Your current run will reset (Rebirth multiplier and Cores are kept).', () => { g.startChallenge(id); this.buildRebirth(); });
    }));
    $('rbBody').querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { if (g.buyPerm(b.dataset.p)) { this.buildRebirth(); this.applyFeatures(true); } }));
    if ($('bAutoRb')) $('bAutoRb').addEventListener('click', () => { s.autoRbL = (s.autoRbL % 6) + 1; this.buildRebirth(); });
    if ($('bRev')) $('bRev').addEventListener('click', () => this.confirm('Do a Revolution?', 'Rebirth multiplier, Cores and Permanent tree will be lost.', () => { g.revolution(); this.buildRebirth(); this.buildRows(); }));
    if ($('bTr')) $('bTr').addEventListener('click', () => this.confirm('Transcend?', 'All Memories, multipliers and mutations will be lost.', () => { g.transcend(); this.buildRebirth(); this.buildRows(); }));
    $('rbBody').querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (g.setWorld(+b.dataset.w)) { this.buildRebirth(); this.toast(`${WORLDS[+b.dataset.w].name}`, WORLDS[+b.dataset.w].law); } }));
    this.refreshRebirth();
  }
  refreshRebirth() {
    const g = this.g;
    if (!$('rbTo')) return;
    const can = g.canRebirth();
    $('rbTo').textContent = can ? '×' + fmt(g.rebirthTargetL(), 1) : '(Can\'t grow yet)';
    $('rbCore').textContent = can ? g.rebirthCore() : 0;
    $('bRb').disabled = !can;
  }
  confirm(title, text, fn) {
    this.modal(`<h3>${title}</h3><p>${text}</p><div class="btns"><button class="btn red" id="cfYes">Confirm</button><button class="btn" data-x>Cancel</button></div>`);
    this.onOpen = (box) => box.querySelector('#cfYes').addEventListener('click', () => { fn(); this.close(); this.hooks.onSave(); });
  }

  // ---------------- misc ----------------
  menu() {
    const s = this.g.state;
    this.modal(`<h3>Menu</h3><div class="btns" style="flex-direction:column">
      <button class="btn" id="mSave">Save</button>
      <button class="btn blue" id="mShare">Share on X</button>
      <button class="btn" id="mLang">Language / 言語</button>
      <button class="btn" id="mNews">News (v${VERSION})</button>
      <button class="btn" id="mBgm">BGM: ${this.hooks.bgm && this.hooks.bgm().on ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mEq">Auto-equip: ${s.autoEquipOn ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mFx">Light FX: ${s.fxLow ? 'Low' : 'High'}</button>
      <button class="btn" id="mBk">Restore from backup</button>
${this.hooks.debug ? `<button class="btn blue" id="mFast">Test: time ×${s.timeScale >= 10 ? 1 : 10}</button>` : ''}
      <button class="btn red" id="mReset">Delete data</button>
      <button class="btn" data-x>Close</button></div>
      <p style="color:var(--mist)">Play time ${fnum(s.stats.playTime / 3600, 1)} hr</p>`);
    this.onOpen = (box) => {
      box.querySelector('#mSave').addEventListener('click', () => { this.hooks.onSave(); this.close(); this.toast('Saved'); });
      if (box.querySelector('#mFast')) box.querySelector('#mFast').addEventListener('click', () => { s.timeScale = s.timeScale >= 10 ? 1 : 10; this.close(); });
      box.querySelector('#mShare').addEventListener('click', () => { this.close(); this.share(); });
      box.querySelector('#mLang').addEventListener('click', () => { this.close(); this.langPicker(); });
      box.querySelector('#mNews').addEventListener('click', () => { this.close(); this.news(false); });
      box.querySelector('#mBgm').addEventListener('click', () => { const b = this.hooks.bgm(); b.setOn(!b.on); b.start(); this.close(); this.toast('BGM ' + (b.on ? 'ON' : 'OFF')); });
      box.querySelector('#mEq').addEventListener('click', () => { s.autoEquipOn = !s.autoEquipOn; this.close(); this.toast('Auto-equip ' + (s.autoEquipOn ? 'ON' : 'OFF')); });
      box.querySelector('#mFx').addEventListener('click', () => { s.fxLow = !s.fxLow; document.getElementById('app').classList.toggle('fxlow', s.fxLow); this.close(); });
      box.querySelector('#mBk').addEventListener('click', () => { this.close(); this.backupPicker(); });
      box.querySelector('#mReset').addEventListener('click', () => { if (confirm('Really delete everything?')) this.hooks.onReset(); });
    };
  }
  mutPicker(ev) {
    const h = RINGS[ev.ring];
    this.modal(`<div class="sub">RING MUTATION</div><h3>Ring Mutation</h3><p><span style="color:${h.col}">${h.name}</span> is about to mutate. Choose one.</p><div class="list">${ev.opts.map((m, k) => `<div class="mrow" data-mu="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${m.name}<small>${m.text}</small></div></div>`).join('')}</div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-mu]').forEach((r) => r.addEventListener('click', () => { this.g.chooseMut(+r.dataset.mu); this.close(); }));
  }
  backupPicker() {
    const list = this.hooks.backups();
    this.modal(`<h3>Backups</h3><div class="list">${list.length ? list.map((b, k) => `<div class="mrow" data-bk="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${new Date(b.time).toLocaleString('ja-JP')}<small>Stage ${b.stage} · Missions ${b.missions}</small></div></div>`).join('') : '<p>None yet (auto-saved every 5 minutes)</p>'}</div><div class="btns"><button class="btn" data-x>Close</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-bk]').forEach((r) => r.addEventListener('click', () => { if (confirm('Restore this backup? Your current data will be overwritten.')) this.hooks.restore(+r.dataset.bk); }));
  }
  offline(r) {
    const h = Math.floor(r.seconds / 3600), m = Math.floor((r.seconds % 3600) / 60);
    this.modal(`<div class="sub">Welcome back!</div><h3>${h} hr ${m} min</h3><p>The Rings kept spinning while you were away (efficiency${Math.round(r.eff * 100)}%)<br>Stage +${r.stage}  Laps +${fnum(r.laps, 0)}${r.found ? `<br>New items ${r.found} found` : ''}${r.flux ? `<br>2x Time +${Math.floor(r.flux / 60)} min` : ''}</p><div class="btns">${r.seconds >= 600 ? `<button class="btn blue" id="offAd">${this.g.state.noAds ? 'Claim another one' : 'Watch an ad to double it'}</button>` : ''}<button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => { const b = box.querySelector('#offAd'); if (b) b.addEventListener('click', async () => { this.close(); const ok = this.g.state.noAds ? true : await this.hooks.monetize().showRewarded(); if (ok) { const r2 = this.g.runOffline(r.seconds); if (r2) this.toast('Idle reward doubled!', `Stage +${r2.stage}`); } else this.toast('Couldn\'t load the ad', 'Check your connection or ad blocker (AdGuard, etc.)'); }); };
  }
  intro() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>Spin, Legion!</h3><img class="pic" src="px/por_leon.png" width="120" height="120">
      <p>At first, just Swordsman Leon and a red Ring.<br>But with every Mission you clear...</p>
      <div class="teaser"><img src="px/hero_seris.png"><img src="px/hero_elia.png"><img src="px/hero_nox.png"><img src="px/hero_garou.png"><img src="px/hero_sierra.png"></div>
      <div class="teaser-list">• <b>Allies join</b> (up to 12, each changes how the Rings move)<br>• <b>Rings grow to 4 colors</b>, and overlaps trigger Sync combos<br>• Rebirth, Weekly Raid, Codex, Cosmos...<br>  <b>New ways to play keep unlocking</b></div>
      <div class="btns"><button class="btn" data-x>Start</button></div>`);
  }
  introOld() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>The Red Ring</h3><img class="pic" src="px/por_leon.png" width="160" height="160">
      <p><span style="color:var(--lemon)">Spin the Ring with your finger!</span><br>Tap the battlefield the moment a gem reaches the top for <span style="color:var(--lemon)">PERFECT</span>!<br>The more you spin, the faster it goes, boosting attack and multiplier (×1.01 per lap).<br>Tap the battlefield to make Leon slash.<br>It progresses while idle, but spinning is even faster.</p><div class="btns"><button class="btn" data-x>Start</button></div>`);
  }
  // ---------------- cosmos ----------------
  buildCosmos() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('eternity')) {
      h += `<div class="rb panel"><h3>Eternity  <span style="color:var(--pink)">Eternity Points ${s.ep}</span></h3><p>Available at Endless Corridor Stage 300+. Resets Infinity Points, Infinity upgrades (kept if you have Eternal Memory) and Infinity progress.</p>
        <button class="btn rose" id="bEter" style="width:100%" ${g.canEternity() ? '' : 'disabled'}>${g.canEternity() ? 'Eternity (+' + g.epGain() + ')' : 'Unlocks at Corridor Stage 300'}</button></div>`;
      h += '<div class="rb panel"><h3>Eternity Upgrades</h3>' + EP_UP.map((u) => `<div class="perm"><span>${u.name}</span><button class="btn rose" data-ep="${u.id}" ${g.epHas(u.id) || s.ep < u.cost ? 'disabled' : ''}>${g.epHas(u.id) ? 'Done' : 'EP' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('') + '</div>';
    }
    if (g.epHas('dil')) {
      h += `<div class="rb panel"><h3>Dilation  <span style="color:var(--cyan)">Crystals ${s.tp || 0}</span></h3><p>An inverted world where the Rings creak backwards. The damage exponent shrinks. The further you go, the more Crystals you get. Entering or leaving resets like Infinity.</p>
        <button class="btn ${s.dilOn ? 'red' : 'blue'}" id="bDil" style="width:100%">${s.dilOn ? 'Leave Dilation (Crystals +' + g.dilGain() + ')' : 'Enter Dilation'}</button>`
        + DIL_UP.map((u) => { const lv = g.dl(u.id), max = u.max && lv >= u.max; return `<div class="perm"><span>${u.name} Lv${lv}</span><button class="btn blue" data-dl="${u.id}" ${max || (s.tp || 0) < u.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : 'Crystal ' + u.cost(lv)}</button><span class="pt">${u.text}</span></div>`; }).join('') + '</div>';
    }
    if (false) {
      h += `<div class="rb panel"><h3>Zodiac Chart ${s.zodiac.length}/${s.zslots}</h3><p>Zodiac signs unlock with your Achievement count. Equip up to ${s.zslots} signs.</p><div class="zgrid">`
        + ZODIAC.map((z) => { const open = g.zodiacOpen(z.id), on = s.zodiac.includes(z.id); return `<button class="${on ? 'on' : open ? '' : 'lock'}" data-z="${z.id}">${open ? z.name : '???'}<small>${open ? z.text : 'Achievements' + z.need}</small></button>`; }).join('') + '</div></div>';
    }
    if (g.has('minerals')) {
      h += `<div class="rb panel"><h3>Tactic Cards  <span style="color:var(--rose)">Black Ore ${s.ores.black || 0}</span> ${s.deck.length}/${s.cslots} cards</h3><p><small style="color:var(--lemon)">Odds: all ${CARDS.length} kinds, ${(100 / CARDS.length).toFixed(1)}% each (no rarity tiers)</small><br>1 Black Ore draws 1 card. Duplicates stack to level up (max 10). Only equipped cards take effect. Also available as Raid rewards.</p>
        <button class="btn rose" id="bCard" style="width:100%" ${(s.ores.black || 0) < 1 ? 'disabled' : ''}>Draw a card</button>
        <div class="cards" style="margin-top:6px">${CARDS.map((c) => { const lv = s.cards[c.id] || 0, on = s.deck.includes(c.id); return `<button class="${on ? 'on' : lv ? '' : 'lock'}" data-cd="${c.id}">${lv ? c.name + ' Lv' + lv : '???'}<small>${lv ? c.text : 'Not obtained'}</small></button>`; }).join('')}</div></div>`;
      h += '<div class="rb panel"><h3>Ore and Smithing</h3><div class="ores">' + ORES.map((o) => `<span style="color:${o.col}">${o.name} <b>${s.ores[o.id] || 0}</b></span>`).join('') + '</div><p>Refine equipped items (each level +50% power, max 10 levels).</p>'
        + Object.keys(HEROES).map((hid) => { const id = s.equip[hid]; if (!id || !g.on(HEROES[hid].ring)) return ''; const it = ITEMS.find((x) => x.id === id), c = g.refineCost(id), ore = ORES.find((o) => o.id === c.ore); return `<div class="perm"><span>${it.name} +${c.lv}</span><button class="btn" data-rf="${id}" ${c.lv >= 10 || (s.ores[c.ore] || 0) < c.n ? 'disabled' : ''}>${c.lv >= 10 ? 'MAX' : ore.name + c.n}</button><span class="pt">${HEROES[hid].name}'s gear</span></div>`; }).join('') + '</div>';
    }
    $('cosBody').innerHTML = h || '<p class="note">Do a Revolution to open the door to the Cosmos.</p>';
    const re = () => this.buildCosmos();
    if ($('bEter')) $('bEter').addEventListener('click', () => this.confirm('Go Eternity?', 'Infinity Points and Infinity progress will reset.', () => { g.eternity(); re(); }));
    $('cosBody').querySelectorAll('[data-ep]').forEach((b) => b.addEventListener('click', () => { if (g.buyEp(b.dataset.ep)) re(); }));
    if ($('bDil')) $('bDil').addEventListener('click', () => { if (s.dilOn) this.confirm('Leave Dilation?', 'Crystals +' + g.dilGain() + '. A reset will occur.', () => { g.endDilation(); re(); }); else this.confirm('Enter Time Dilation?', 'Same reset as Infinity.', () => { g.startDilation(); re(); }); });
    $('cosBody').querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => { if (g.buyDil(b.dataset.dl)) re(); }));
    $('cosBody').querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { if (g.toggleZodiac(b.dataset.z)) re(); }));
    if ($('bCard')) $('bCard').addEventListener('click', () => g.drawCard());
    $('cosBody').querySelectorAll('[data-cd]').forEach((b) => b.addEventListener('click', () => { if (g.toggleCard(b.dataset.cd)) re(); }));
    $('cosBody').querySelectorAll('[data-rf]').forEach((b) => b.addEventListener('click', () => { if (g.refineItem(b.dataset.rf)) { this.toast('Refine success!'); re(); } }));
  }

  // ---------------- shop & ads ----------------
  shop(tab = 'top') {
    this.modal('<div></div>');
    this.onOpen = (box) => this.drawShop(box, tab);
  }
  drawShop(box, tab) {
    const g = this.g, s = g.state, m = this.hooks.monetize(), today = new Date().toDateString();
    g.ensurePass();
    const owned = (p) => p.once && (s.owned || []).includes(p.id);
    const vis = (p) => (!p.need || g.has(p.need)) && (!p.offer || g.offerLeft(p.id) > 0 || owned(p)) && !(p.set && p.set.some((k) => (s.skins || []).includes(k)));
    const sw = (id) => { const k = RING_SKINS[id], cols = k ? k.rings.map((r) => r[0]) : RINGS.map((r) => r.col); return `<span class="sw">${cols.map((c) => `<i style="background:${c}"></i>`).join('')}</span>`; };
    const row = (p) => {
      const dis = owned(p) || (p.id === 'rl_pass' && s.pass.premium);
      const left = p.offer && !dis ? g.offerLeft(p.id) : 0;
      const tag = left > 0 ? `<span class="tag">${Math.floor(left / 3600000)} h ${Math.floor(left / 60000) % 60} min left</span>` : '';
      return `<div class="mrow">${p.skin ? sw(p.skin) : ''}<div style="flex:1">${p.name}${tag}<small>${p.text}</small></div><button class="btn" data-buy="${p.id}" ${dis ? 'disabled' : ''}>${dis ? 'Purchased' : m.price(p)}</button></div>`;
    };
    const list = (cat) => SHOP.filter((p) => p.cat === cat && vis(p)).map(row).join('');
    let body = '';
    if (tab === 'top') {
      const c = g.passClaimable();
      body = `<div class="mrow"><div style="flex:1">Legion Pass  Tier ${g.passTier()}/30<small>${c ? `${c} rewards to claim!` : `Season: ${g.passDaysLeft()} days left · The more you play, the higher your Tier`}</small></div><button class="btn blue" data-tab="pass">View</button></div>`;
      if (g.monthLeft() > 0) body += `<p class="note">Monthly Pass active:${g.monthLeft()} days left</p>`;
      body += list('top');
    } else if (tab === 'pass') {
      const t = g.passTier(), p = s.pass, c = g.passClaimable();
      let rows = '';
      for (let k = 1; k <= 30; k++) rows += `<div class="prow ${k <= t ? 'got' : ''}"><b>${k}</b><span>${g.passReward('free', k).text}${k <= p.cf ? ' ✓' : ''}</span><span class="pr">${g.passReward('prem', k).text}${p.premium && k <= p.cp ? ' ✓' : ''}</span></div>`;
      body = `<div class="passhead">Season: ${g.passDaysLeft()} days left  Tier <b>${t}</b>/30<i class="pbar"><b style="width:${t >= 30 ? 100 : p.xp % 100}%"></b></i><small>+1 per minute played · daily login +50 · Mission clear +30 (100 = 1 Tier)</small></div>
        <div class="btnrow"><button class="btn" id="passClaim" ${c ? '' : 'disabled'}>Claim all${c ? ' (' + c + ')' : ''}</button>${p.premium ? '<span class="tag">Premium active</span>' : `<button class="btn rose" data-buy="rl_pass">Premium ${m.price(SHOP.find((x) => x.id === 'rl_pass'))}</button>`}</div>
        <div class="prow head"><b>Tier</b><span>Free</span><span class="pr">Premium</span></div>${rows}`;
    } else if (tab === 'look') {
      const mine = ['', ...Object.keys(RING_SKINS).filter((k) => (s.skins || []).includes(k))];
      body = '<p class="note">Ring skins (cosmetic only, no change in strength)</p>' + mine.map((id) => `<div class="mrow">${sw(id)}<div style="flex:1">${id ? RING_SKINS[id].name : 'Default'}</div><button class="btn blue" data-skin="${id}" ${(s.skin || '') === id ? 'disabled' : ''}>${(s.skin || '') === id ? 'In use' : 'Use'}</button></div>`).join('')
        + '<p class="note">Buy</p>' + list('look');
    } else if (tab === 'item') {
      body = list('item');
    } else {
      body = AD_REWARDS.filter((a) => !a.need || g.has(a.need)).map((a) => { const left = g.adLeft(a.id, today); return `<div class="mrow"><div style="flex:1">${a.name}<small>Today: ${left} left</small></div><button class="btn blue" data-ad="${a.id}" ${left <= 0 ? 'disabled' : ''}>${s.noAds || m.web ? 'Claim' : 'Watch ad'}</button></div>`; }).join('')
        + '<p class="note">Daily login: 1 hour of 2x Time (consecutive logins also give Rebirth Cores)<br>When you return from being idle, ads can double your rewards too</p>';
    }
    const TABS = [['top', 'Deals'], ['pass', 'Pass'], ['look', 'Looks'], ['item', 'Items'], ['free', 'Free']];
    const cap = g.spendCap();
    box.innerHTML = `<h3>Shop</h3>${m.web ? '<p style="color:var(--cyan)">Browser version: free bonuses are claimed without ads. Purchases are available in the Android app</p>' : m.native ? '' : '<p style="color:var(--pink)">Browser version is in test mode (no payments are made)</p>'}
      <div class="tabs">${TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}${k === 'pass' && g.passClaimable() ? '!' : ''}</button>`).join('')}</div>
      <div class="list">${body}</div>
      <p class="legal">Purchases this month ¥${g.spentThisMonth().toLocaleString()}${cap < Infinity ? ` / Limit ¥${cap.toLocaleString()}` : ''}  No purchase needed to clear the game</p>
      <div class="btns"><button class="btn blue" id="bHist">History and settings</button>${m.native ? '<button class="btn blue" id="bRestore">Restore</button>' : ''}<button class="btn" id="bShopX">Close</button></div>`;
    box.querySelector('#bShopX').addEventListener('click', () => this.close());
    box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.drawShop(box, b.dataset.tab)));
    box.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => this.buyFlow(b.dataset.buy)));
    box.querySelectorAll('[data-skin]').forEach((b) => b.addEventListener('click', () => { s.skin = b.dataset.skin; this.drawShop(box, tab); }));
    const pc = box.querySelector('#passClaim');
    if (pc) pc.addEventListener('click', () => { const n = g.claimPass(); this.toast('Pass rewards claimed', n + ' items'); this.hooks.onSave && this.hooks.onSave(); this.drawShop(box, tab); });
    box.querySelectorAll('[data-ad]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.ad;
      this.close();
      const ok = s.noAds ? true : await m.showRewarded();
      if (ok && g.adReward(id, today)) this.toast('Bonus claimed', AD_REWARDS.find((a) => a.id === id).name);
      else if (!ok) this.toast('Couldn\'t load the ad', 'Check your connection or ad blocker (AdGuard, etc.)');
    }));
    box.querySelector('#bHist').addEventListener('click', () => { this.close(); this.purchaseInfo(); });
    const r = box.querySelector('#bRestore');
    if (r) r.addEventListener('click', () => { m.restore(); this.close(); });
  }
  // every paid purchase passes through here: age gate first, then the monthly cap for minors
  buyFlow(id) {
    const g = this.g, s = g.state, p = SHOP.find((x) => x.id === id);
    if (!p) return;
    if (this.hooks.monetize().web) return this.appOnly();
    if (!s.ageBand) return this.ageGate(() => this.buyFlow(id));
    this.close();
    if (!g.canSpend(p)) {
      this.modal(`<div class="sub">Can't purchase</div><h3>Monthly limit</h3><p>${AGE_BANDS[s.ageBand].name} players: the monthly limit is ¥${g.spendCap().toLocaleString()} .<br>You can spend up to ¥${Math.max(0, g.spendCap() - g.spentThisMonth()).toLocaleString()} more this month.<br>Resets on the 1st of next month.</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
      return;
    }
    this.hooks.monetize().buy(id);
  }
  ageGate(next) {
    this.close();
    this.modal(`<div class="sub">Before your first purchase</div><h3>Select your age</h3><p>Minors have a monthly purchase limit.<br>If you are under 18, get a parent or guardian's consent before buying.</p><div class="btns col">${Object.entries(AGE_BANDS).map(([k, b]) => `<button class="btn" data-age="${k}">${b.name}${b.cap < Infinity ? ` (up to ¥${b.cap.toLocaleString()} per month)` : ''}</button>`).join('')}<button class="btn red" data-x>Cancel</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => { this.g.state.ageBand = b.dataset.age; this.hooks.onSave && this.hooks.onSave(); next(); }));
  }
  purchaseInfo() {
    const g = this.g, s = g.state, list = (s.purchases || []).slice().reverse();
    const rows = list.length ? list.map((x) => { const d = new Date(x.t); return `<div class="mrow"><span style="color:var(--mist)">${d.getMonth() + 1}/${d.getDate()}</span><div style="flex:1">${x.name}</div><span>¥${x.yen.toLocaleString()}</span></div>`; }).join('') : '<p class="note">No purchases yet</p>';
    const band = AGE_BANDS[s.ageBand];
    this.modal(`<h3>Purchase History</h3><p>This month ¥${g.spentThisMonth().toLocaleString()}${band && band.cap < Infinity ? ` / Limit ¥${band.cap.toLocaleString()}` : ''}<br>Age setting: ${band ? band.name : 'Not set'}</p><div class="list">${rows}</div>
      <p class="legal">• No paid currency (items are bought directly)<br>• Tactic Card odds: all${CARDS.length} kinds, ${(100 / CARDS.length).toFixed(1)}%<br>• Collecting everything gives no special reward<br>• Refunds follow Google Play's refund policy<br>• No purchase is needed to clear the game</p>
      <div class="btns"><button class="btn blue" id="bAge">Change age setting</button><button class="btn" data-x>Close</button></div>`);
    this.onOpen = (box) => box.querySelector('#bAge').addEventListener('click', () => this.ageGate(() => { this.close(); this.purchaseInfo(); }));
  }
  fakeAd() {
    return new Promise((res) => {
      this.modal(`<div class="sub">Test Ad</div><div class="fake-ad" id="fakeAd">Ad (test) 3</div><p>In the real Android version, an AdMob video ad plays here.</p>`);
      this.onOpen = (box) => {
        let n = 3;
        const iv = setInterval(() => { n--; const el = box.querySelector('#fakeAd'); if (el) el.textContent = n > 0 ? 'Ad (test) ' + n : 'Reward GET!'; if (n <= 0) { clearInterval(iv); setTimeout(() => { this.close(); res(true); }, 400); } }, 1000);
      };
    });
  }
  testPurchase(p) {
    return new Promise((res) => {
      this.modal(`<div class="sub">Test Purchase</div><h3>${p.name}</h3><p>${p.text}<br>Real price ${p.price}<br><span style="color:var(--pink)">It's test mode, so no payment is made.</span></p><div class="btns"><button class="btn" id="tpYes">Claim</button><button class="btn red" id="tpNo">Cancel</button></div>`);
      this.onOpen = (box) => {
        box.querySelector('#tpYes').addEventListener('click', () => { this.close(); res(true); });
        box.querySelector('#tpNo').addEventListener('click', () => { this.close(); res(false); });
      };
    });
  }

  daily(r) {
    this.modal(`<div class="sub">LOGIN BONUS</div><h3>${r.streak} day streak</h3><p>2x Time +1 hour${r.core ? `<br>Rebirth Cores +${r.core}` : ''}${r.month ? `<br><span style="color:var(--lemon)">Monthly Pass: 2x Time +1 hour and Coins (${r.month} days left)</span>` : ''}<br><span style="color:var(--mist)">${this.g.has('autoBuy') ? 'Use the "2x" button next to the Rings to run the game at double speed' : 'Unlocks at Stage 40 (can be stockpiled)'}</span></p><div class="btns"><button class="btn" data-x>Claim</button></div>`);
  }
  appOnly() {
    this.close();
    this.modal(`<div class="sub">Browser Version</div><h3>Purchases are in the app</h3><p>The browser version is free to play as-is.<br>Items can be bought in the Android app (Google Play).</p><div class="btns"><button class="btn" id="bPlay">View on Google Play</button><button class="btn red" data-x>Close</button></div>`);
    this.onOpen = (box) => box.querySelector('#bPlay').addEventListener('click', () => { openUrl(PLAY_URL); this.close(); });
  }
  share() {
    const g = this.g, s = g.state;
    const text = `REVOLUTION LEGION: Stage ${s.stats.bestStage} reached! Multiplier ×${fmt(g.totalMultL(), 1)}`;
    const url = WEB_URL || PLAY_URL;
    openUrl('https://x.com/intent/post?text=' + encodeURIComponent(text + ' #RevolutionLegion') + '&url=' + encodeURIComponent(url));
  }
  langPicker() {
    const cur = globalThis.RL_LANG || 'ja', list = globalThis.RL_LANGS || [['ja', 'JA']];
    this.modal(`<h3>Language</h3><div class="btns col">${list.map(([id, name]) => `<button class="btn ${id === cur ? 'blue' : ''}" data-lang="${id}">${name}</button>`).join('')}<button class="btn red" data-x>OK</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== cur) { this.hooks.onSave && this.hooks.onSave(); globalThis.RL_SET_LANG(b.dataset.lang); } else this.close(); }));
  }
  news(onlyNew = false) {
    const s = this.g.state;
    const vnum = (v) => String(v || '0').split('.').reduce((a, x) => a * 1000 + (+x || 0), 0);
    const list = onlyNew ? UPDATES.filter((u) => vnum(u.v) > vnum(s.seenVersion)) : UPDATES;
    s.seenVersion = VERSION;
    if (!list.length) return;
    this.modal(`<div class="sub">${onlyNew ? 'UPDATE' : 'News'}</div><h3>${onlyNew ? 'Updated' : 'Update history'}</h3><div class="list" style="text-align:left">${list.map((u) => `<p class="note"><b style="color:var(--lemon)">v${u.v}</b> (${u.date})${u.title}<br>${u.items.map((x) => ' · ' + x).join('<br>')}</p>`).join('')}</div><p style="color:var(--cyan)">${NEXT_CHAPTER}</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
  trueEnding() {
    this.modal(`<div class="sub">TRUE END</div><h3>End of the Corridor</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>On floor 1000 of the Endless Corridor, the Rings became a single circle.<br>Play time ${fnum(this.g.state.stats.playTime / 3600, 1)} hr<br><span style="color:var(--cyan)">But the story isn't over yet.</span><br>${NEXT_CHAPTER}<br>Until then, sharpen your skills with Corridor records and Raids.</p><div class="btns"><button class="btn blue" id="bShareEnd">Share on X</button><button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => box.querySelector('#bShareEnd').addEventListener('click', () => this.share());
  }
  ending() {
    this.modal(`<div class="sub">THE END</div><h3>The Void King Falls</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>The ceaselessly spinning Rings finally reached the edge of the world.<br>Play time ${fnum(this.g.state.stats.playTime / 3600, 1)} hr<br>But the world continues beyond ∞.<br><span style="color:var(--cyan)">Infinity has been unlocked on the Rebirth screen.</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
}
void IMG;
