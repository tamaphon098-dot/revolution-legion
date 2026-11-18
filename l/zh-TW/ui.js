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
    $('chBar').addEventListener('click', () => this.confirm('要放棄試煉嗎？', '目前這一輪會被重置。', () => this.g.finishChallenge(false)));
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
        wrap.insertAdjacentHTML('beforeend', `<div class="row ghost" style="--c:${def.col}"><div class="por" style="--c:var(--steel)"><img class="px" src="px/pors_${def.hero}.png" style="filter:brightness(0)"></div><div>？？？　完成任務解鎖</div></div>`);
        return;
      }
      wrap.insertAdjacentHTML('beforeend', `
        <div class="row" style="--c:${def.col}">
          <div class="por"><img class="px" src="px/pors_${g.heroId(i)}.png"><span class="rk" id="rRk${i}"></span><span class="asc" id="rAsc${i}"></span></div>
          <div><div class="nm"><span>${def.name}</span><small id="rLv${i}"></small></div><div class="lvbar"><b id="rBar${i}"></b></div><div class="lapm" id="rLap${i}"></div></div>
          <button class="btn" id="bLv${i}"><span id="bLvT${i}">Lv+</span><span class="c" id="bLvC${i}"></span></button>
          <button class="btn blue" id="bSp${i}"><span>速度+</span><span class="c" id="bSpC${i}"></span></button>
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
    } else { $('mId').textContent = '★'; $('mName').textContent = '全部任務達成！'; $('mProg').textContent = ''; $('mBar').style.width = '100%'; }

    $('tapHint').classList.toggle('hide', (s.stats.taps || 0) >= 15 || this.scr !== 'battle');
    $('ringHint').classList.toggle('hide', (s.stats.spun || 0) >= 3);
    const e = g.enemy;
    const tr = e.trait && TRAITS[e.trait];
    $('ename').innerHTML = tr ? `<span style="color:${tr.col}">【${tr.name}】</span>${e.n}<small>${tr.tip}</small>` : e.n;
    $('ename').className = e.boss ? 'boss' : '';
    const chal = s.challenge && CHALLENGES.find((c) => c.id === s.challenge);
    $('chBar').classList.toggle('hide', !chal && !s.dilOn && !g.raid);
    if (g.raid) $('chBar').innerHTML = `突襲「${g.raid.rule.name}」剩餘${Math.ceil(g.raid.t)}秒　傷害 ${fmt(g.raid.dmgL)}`;
    if (s.dilOn && !chal && !g.raid) $('chBar').innerHTML = `裏世界（傷害指數×${(0.75 + 0.02 * g.dl('d_soft')).toFixed(2)}）　離開可得結晶+${g.dilGain()}`;
    if (chal && !g.raid) $('chBar').innerHTML = `試煉中：${chal.name}（${chal.rule}）　${Math.min(s.runBest, chal.goal)}/${chal.goal}　<u>放棄</u>`;
    $('btnAutoBuy').textContent = s.autoBuyOn ? '自動強化' : '手動強化';
    $('btnFlux').classList.toggle('hide', !s.features.autoBuy || !(s.flux > 0 || s.fluxOn));
    $('btnFlux').classList.toggle('on', !!s.fluxOn);
    { const f = Math.floor(s.flux || 0), h = Math.floor(f / 3600), mm = Math.floor((f % 3600) / 60); $('btnFlux').textContent = `倍速 ${h}:${String(mm).padStart(2, '0')}`; }
    $('btnAutoBuy').classList.toggle('on', s.autoBuyOn);
    $('sDps').textContent = fmt(g.dpsL(), 1);
    $('sRps').textContent = fnum(g.active().reduce((a, i) => a + g.rps(i), 0), 2);
    $('sSync').textContent = Math.round(g.syncRate() * 100) + '%';
    $('burstBar').style.width = (s.od > 0 ? (s.od / 10) * 100 : s.burst) + '%';
    $('burst').classList.toggle('ready', s.burst >= 100 && s.od <= 0);
    $('burst').classList.toggle('od', s.od > 0);
    $('btnFast').textContent = s.autoBurst ? 'AUTO' : '手動';
    $('dexBadge').classList.toggle('hide', !(s.unseenItems > 0));
    $('btnShop').classList.toggle('alert', g.passClaimable() > 0 || SHOP.some((p) => p.offer && g.offerLeft(p.id) > 0 && !(s.owned || []).includes(p.id)));
    $('dexBadge').textContent = s.unseenItems > 9 ? '9+' : s.unseenItems || '';
    $('btnFast').classList.toggle('on', s.autoBurst);

    RINGS.forEach((def, i) => {
      if (!g.on(i) || !$('rLv' + i)) return;
      const r = s.rings[i], cap = g.cap(i);
      $('rLv' + i).innerHTML = `Lv${r.lv}/${cap}`;
      $('rAsc' + i).textContent = r.asc ? '★' + r.asc : '';
      $('rLap' + i).textContent = `圈數倍率 ×${fmt(r.lapL)}`;
      $('rBar' + i).style.width = (r.lv / cap) * 100 + '%';
      const rk = g.rank(g.heroId(i));
      $('rRk' + i).innerHTML = RANK_TXT(rk);
      const asc = g.canAsc(i);
      const bl = $('bLv' + i);
      bl.classList.toggle('asc', asc);
      $('bLvT' + i).textContent = asc ? '突破上限' : 'Lv+';
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
          <p>${h.name}晉升了！<br>傷害×${RANKS[ev.rankUp].mult}${ev.rankUp === 3 && h.ring === 0 ? '<br>斬擊增加了！' : ''}</p>
          <div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast('昇華！', `${RINGS[ev.ring].name} 上限Lv${g.cap(ev.ring)}·倍率成長+5%`);
        return;
      }
      case 'drop': this.dropCard(ev); return;
      case 'bossfail': this.toast('沒能擊倒頭目', '蓄力45秒後再次挑戰'); return;
      case 'rebirth': this.toast(`轉生！ 倍率 ×${fmt(g.state.pmL, 1)}`, `核心 +${ev.core}`); this.buildRows(); return;
      case 'clear': if (ev.first) this.ending(); else this.toast('擊倒了虛無王！', '可從轉生畫面進行無限'); return;
      case 'infinity': this.toast(`無限！ 無限點數+${ev.gain}`); this.buildRows(); return;
      case 'infChStart': this.toast(`無限試煉「${INF_CH.find((c) => c.id === ev.id).name}」開始`, INF_CH.find((c) => c.id === ev.id).rule); this.show('battle'); return;
      case 'infChClear': { const c = INF_CH.find((x) => x.id === ev.id); this.modal(`<div class="sub">INFINITY CHALLENGE</div><h3>${c.name}</h3><p>永久獎勵：<span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'unit': this.unitStamp(ev.u); return;
      case 'recruit': { const h = HEROES[ev.id]; this.modal(`<div class="sub">NEW HERO</div><h3>${h.name}</h3><img class="pic" src="px/por_${ev.id}.png" width="160" height="160"><p>${h.job}加入了軍團！<br>${h.line}<br><span style="color:var(--lemon)">可在軍團畫面配置到圓環上</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'card': if (!ev.free) this.toast(`作戰卡「${ev.card.name}」Lv${ev.lv}`, ev.card.text); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'raidStart': this.toast(`突襲開始「${ev.rule.name}」`, ev.rule.text); this.show('battle'); return;
      case 'raidEnd': { const T = ['無評價', '銅', '銀', '金', '虹']; this.modal(`<div class="sub">RAID RESULT</div><h3>${T[ev.tier]}</h3><p>傷害 ${fmt(ev.score)}${ev.suspicious ? '<br><span style="color:var(--red)">紀錄異常，視為無效</span>' : ev.gained ? `<br>徽章+${ev.gained}·作戰卡×${ev.gained * 2}` : '<br>本週已無更多獎勵'}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'heroes') this.buildHeroes(); return; }
      case 'feature': { const f = FEATURE_INFO[ev.id]; if (f) this.modal(`<div class="sub">NEW</div><h3>${f[0]}</h3><p>${f[1]}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); this.applyFeatures(true); return; }
      case 'tarot': this.modal(`<div class="sub">TAROT</div><h3>${ev.card.name}</h3><p>${ev.result}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'eternity': this.toast(`永劫！ 永劫點數+${ev.gain}`); this.buildRows(); return;
      case 'dilStart': this.toast('進入了裏世界', '傷害會減弱。走得越遠，結晶越多'); this.show('battle'); return;
      case 'dilEnd': this.toast(`離開了裏世界 結晶+${ev.gain}`); return;
      case 'blackOre': this.toast('發現了黑礦！', '可在宇宙分頁抽塔羅牌'); return;
      case 'grant': this.toast('已領取', (SHOP.find((p) => p.id === ev.id) || {}).name || ''); return;
      case 'ach': this.toast(`★成就「${ev.ach.name}」 ×1.05`); return;
      case 'mutChoice': return this.mutPicker(ev);
      case 'mutation': this.toast(`圓環變異！ ${ev.mutation.name}`, ev.mutation.text); return;
      case 'challengeEnd': {
        const c = CHALLENGES.find((x) => x.id === ev.id);
        if (ev.success) this.modal(`<div class="sub">CHALLENGE CLEAR</div><h3>${c.name}</h3><p>永久獎勵：<span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast(`${c.name} 已放棄`);
        this.buildRows();
        return;
      }
      case 'challengeStart': this.toast(`${CHALLENGES.find((x) => x.id === ev.id).name} 開始`, CHALLENGES.find((x) => x.id === ev.id).rule); this.buildRows(); this.show('battle'); return;
    }
  }

  onMission(m) {
    const rw = m.reward;
    this.applyFeatures(true);
    if (rw.ring !== undefined || rw.feature || rw.world !== undefined) {
      const info = rw.feature && FEATURE_INFO[rw.feature];
      const pic = rw.ring !== undefined ? `<img class="pic" src="px/${HEROES[RINGS[rw.ring].hero].portrait}.png" width="160" height="160">` : '';
      this.modal(`<div class="sub">MISSION CLEAR ${m.id}</div><h3>${rw.ring !== undefined ? '新夥伴' : '解鎖！'}</h3>${pic}
        <p>${m.name}<br><span style="color:var(--lemon)">${rw.text}</span>${info ? `<br>${info[1]}` : ''}</p>
        <p>永久加成 ×${this.g.state.missions.length + 1}</p>
        <div class="btns"><button class="btn" data-x>OK</button></div>`);
    } else this.toast(`任務達成 ${m.id}`, rw.text);
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
      <div class="sub">${h.name}專用${it.fxText ? '·' + it.fxText : ''}</div>
      ${ev.better ? `<div class="bt"><button class="btn" id="dcEq">裝備（×${fnum(Math.pow(10, ev.before), 1)}→×${fnum(Math.pow(10, ev.after), 1)}）</button><button class="btn red" id="dcNo">稍後</button></div>` : ''}`;
    el.classList.remove('hide');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    const hide = () => el.classList.add('hide');
    if (ev.better) {
      el.querySelector('#dcEq').addEventListener('click', (e) => { e.stopPropagation(); g.equipItem(ev.hid, it.id); this.toast(`${h.name} 裝備了 ${it.name}`); hide(); });
      el.querySelector('#dcNo').addEventListener('click', (e) => { e.stopPropagation(); hide(); });
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { once: false });
    }
    this._dropT = setTimeout(hide, ev.better ? 9000 : 4000);
  }

  unitStamp(u) {
    const el = $('stamp');
    el.innerHTML = `<b>${UNITS[u]}</b><span>達成！</span><small>單位加成 全傷害×1.15</small>`;
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
      return `<div class="mrow ${done ? 'done' : ''}"><span class="id">${done ? '✓' : String(k + 1).padStart(2, '0')}</span><div>${hidden ? '？？？' : m.name}<small>${hidden ? '' : m.reward.text}</small></div></div>`;
    }).join('');
    this.modal(`<div class="sub">永久加成 ×${s.missions.length + 1}（轉生後也不會消失）</div><h3>任務</h3><div class="list">${rows}</div><div class="btns"><button class="btn" data-x>關閉</button></div>`);
  }

  // ---------------- heroes ----------------
  buildHeroes() {
    const g = this.g, s = g.state;
    // weekly raid panel
    if (g.has('raid')) {
      const wk = this.hooks.week(), rule = RAID_RULES[((wk.no % RAID_RULES.length) + RAID_RULES.length) % RAID_RULES.length], R = s.raid, cur = R.week === wk.key ? R.weekTier : 0;
      $('raidBox').innerHTML = `<div class="rb panel"><h3>每週突襲「${rule.name}」</h3><p>${rule.text}<br>60秒內能打出多少傷害？目標是目前攻擊力×60秒。</p>
        <div class="tierbar">${['銅', '銀', '金', '虹'].map((t, k) => `<span class="${cur > k ? 'got' : ''}">${t}</span>`).join('')}</div>
        <p>徽章 ${R.tokens}（累計${R.tokensTotal}）　個人最佳 ${R.best ? fmt(R.best) : '-'}</p>
        <button class="btn red" id="bRaid" style="width:100%" ${g.raid ? 'disabled' : ''}>${g.raid ? '挑戰中' : '挑戰（無限次）'}</button></div>`;
      $('bRaid').addEventListener('click', () => { const w = this.hooks.week(); g.startRaid(w.key, w.no); });
    } else $('raidBox').innerHTML = '';
    // legion lineup per ring
    const lg = RINGS.map((def, i) => {
      if (!g.on(i)) return '';
      return `<div class="panel" style="margin-bottom:6px"><div class="ringhead"><span style="color:${def.col}">${def.name}</span><span>${HEROES[g.heroId(i)].name}</span></div><div class="lg">` + LEGION[i].map((id) => {
        const h = HEROES[id], have = s.recruits.includes(id), on = g.heroId(i) === id;
        return `<button class="${on ? 'on' : have ? '' : 'lock'}" data-lu="${i}:${id}"><img src="px/por_${id}.png">${have ? h.name : '？？？'}<small>${have ? h.job : RECRUIT[id] ? RECRUIT[id].text : ''}</small></button>`;
      }).join('') + `</div><p class="note">${HEROES[g.heroId(i)].line}</p></div>`;
    }).join('');
    $('heroList').innerHTML = lg + RINGS.map((def, i) => {
      const id = g.heroId(i), h = HEROES[id], on = g.on(i);
      const rk = g.rank(id), next = RANKS[rk + 1];
      const eq = s.equip[id], it = eq && ITEMS.find((x) => x.id === eq);
      return `<div class="hero panel ${on ? '' : 'lock'}">
        <div class="por"><img class="px" src="px/${h.portrait}.png"><span class="rk">${RANK_TXT(rk)}</span></div>
        <div><div class="nm">${on ? `${h.name}　<span style="color:var(--cloud)">${h.job}</span>` : '？？？'}</div>
          <div class="ln">${on ? h.line : '完成任務後成為夥伴'}</div>
          <div class="ln">累計昇華 ${s.stats.ascTotal[i]}${next ? `（到${next.id}還差${next.need}）` : '（最高階級）'}</div>
          ${on && g.has('items') ? `<div class="equip"><span class="slot" style="--rc:${it ? RARITY[it.rar].col : ''}">${it ? `<img class="px" src="px/${it.id}.png">` : ''}</span><span>${it ? `${it.name} Lv${g.itemLevel(it.id)}` : '無裝備'}</span><button class="small-btn" data-eq="${id}">更換</button></div>` : ''}
        </div></div>`;
    }).join('');
    $('heroList').querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => this.equipPicker(b.dataset.eq)));
    $('heroList').querySelectorAll('[data-lu]').forEach((b) => b.addEventListener('click', () => { const [i, id] = b.dataset.lu.split(':'); if (g.setLineup(+i, id)) { this.buildHeroes(); this.buildRows(); } }));
  }
  equipPicker(hid) {
    const g = this.g, s = g.state, type = HEROES[hid].type;
    const own = ITEMS.filter((it) => it.type === type && s.items[it.id]);
    this.modal(`<div class="sub">${HEROES[hid].name}的裝備</div><div class="list">${own.map((it) => `<div class="mrow" data-pick="${it.id}" style="cursor:pointer"><span class="slot" style="--rc:${RARITY[it.rar].col}"><img class="px" src="px/${it.id}.png"></span><div>${it.name} <span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> Lv${g.itemLevel(it.id)}<small>×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)} ${it.fxText}</small></div></div>`).join('') || '<p>尚未擁有</p>'}</div><div class="btns"><button class="btn" data-x>關閉</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-pick]').forEach((r) => r.addEventListener('click', () => { s.equip[hid] = r.dataset.pick; this.close(); this.buildHeroes(); }));
  }

  // ---------------- dex ----------------
  buildDex() {
    const g = this.g, s = g.state;
    s.unseenItems = 0;
    if (!$('dexTabs')) {
      $('scr-dex').insertAdjacentHTML('afterbegin', '<div id="dexTabs" class="tabs"><button class="small-btn on" data-t="items">圖鑑</button><button class="small-btn" data-t="ach">成就</button></div><div id="achList" class="hide"></div>');
      $('dexTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { this.dexTab = b.dataset.t; this.buildDex(); }));
    }
    const achTab = this.dexTab === 'ach';
    $('dexTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === (achTab ? 'ach' : 'items')));
    ['dexGrid', 'dexInfo', 'dexNote'].forEach((id) => $(id).classList.toggle('hide', achTab));
    $('scr-dex').querySelector('h2').classList.toggle('hide', achTab);
    $('achList').classList.toggle('hide', !achTab);
    if (achTab) {
      $('achList').innerHTML = `<p class="note">成就 ${s.ach.length}/${ACHIEVEMENTS.length}　全傷害×${fnum(Math.pow(1.05, s.ach.length), 2)}</p>` + ACHIEVEMENTS.map((a) => {
        const done = s.ach.includes(a.id), hide = a.secret && !done;
        return `<div class="mrow ${done ? '' : 'done'}"><span class="id">${done ? '★' : '·'}</span><div>${hide ? '？？？（隱藏成就）' : a.name}<small>${hide ? '條件保密' : a.desc}</small></div></div>`;
      }).join('');
      return;
    }
    $('dexCount').textContent = `${s.found.length}/${ITEMS.length}`;
    $('dexNote').textContent = g.has('dexBonus') ? `圖鑑加成 全傷害×${fmt(g.dexL(), 1)}` : '發現的道具會被記錄下來';
    $('dexGrid').innerHTML = ITEMS.map((it) => {
      const own = s.items[it.id];
      return `<div class="cell ${own ? '' : 'unk'} ${this.dexSel === it.id ? 'sel' : ''}" data-it="${it.id}" style="--rc:${own ? RARITY[it.rar].col : ''}"><img class="px" src="px/${it.id}.png">${own ? `<span class="lv">${g.itemLevel(it.id)}</span>` : ''}</div>`;
    }).join('');
    $('dexGrid').querySelectorAll('[data-it]').forEach((c) => c.addEventListener('click', () => { this.dexSel = c.dataset.it; this.buildDex(); }));
    const it = this.dexSel && ITEMS.find((x) => x.id === this.dexSel);
    if (!it) { $('dexInfo').innerHTML = '點擊道具可查看詳情'; return; }
    const own = s.items[it.id];
    const hid = Object.keys(HEROES).find((h) => HEROES[h].type === it.type);
    $('dexInfo').innerHTML = own
      ? `<span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> ${it.name}　Lv${g.itemLevel(it.id)}（${own}個）<br>${HEROES[hid].name}專用　傷害×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)}<br>${it.fxText || '　'}`
        + (s.equip[hid] === it.id ? '<br><span style="color:var(--leaf)">裝備中</span>' : g.on(HEROES[hid].ring) ? `<br><button class="btn" id="dexEq">裝備</button>` : '')
      : '？？？　尚未發現';
    const b = $('dexEq');
    if (b) b.addEventListener('click', () => { s.equip[hid] = it.id; this.buildDex(); });
  }

  // ---------------- lab ----------------
  buildLab() {
    const g = this.g, s = g.state;
    if (!this.labView) this.labView = new RingView($('lcv'), null, g, 144);
    const rows = g.active().map((i) => `<div class="lrow" style="--c:${RINGS[i].col}"><span style="color:${RINGS[i].col}">${RINGS[i].name}</span><input type="range" min="10" max="100" value="${Math.round(s.rings[i].throttle * 100)}" id="th${i}" ${s.autoTune ? 'disabled' : ''}><span class="v" id="thv${i}"></span></div>`).join('');
    $('labRows').innerHTML = `<div class="panel">${rows}
      ${g.has('autotune') ? `<div class="tog"><span>自動調校</span><button class="small-btn ${s.autoTune ? 'on' : ''}" id="tTune">${s.autoTune ? 'ON' : 'OFF'}</button></div>` : ''}
      <div class="tog"><span>對齊速度比</span><button class="btn" id="tNow">調整</button></div></div>
      <div class="panel" style="margin-top:6px" id="labStats"></div>`;
    g.active().forEach((i) => $('th' + i).addEventListener('input', (e) => { g.setThrottle(i, e.target.value / 100); this.refreshLab(); }));
    if ($('tTune')) $('tTune').addEventListener('click', () => { s.autoTune = !s.autoTune; if (s.autoTune) g.autoTuneRings(); this.buildLab(); });
    $('tNow').addEventListener('click', () => { g.autoTuneRings(); this.buildLab(); this.toast('已對齊速度比'); });
    this.refreshLab();
  }
  refreshLab() {
    const g = this.g, s = g.state;
    g.active().forEach((i) => { const v = $('thv' + i); if (v) v.textContent = fnum(g.rps(i), 2) + '/秒'; });
    const st = $('labStats');
    if (st) st.innerHTML = `同步率 <span style="color:var(--lemon)">${Math.round(g.syncRate() * 100)}%</span><br>`
      + [2, 3, 4].map((n) => `${COMBOS[n].name} ×${fmt(g.comboL(n), 0)}　${s.stats['combo' + n]}次`).join('<br>')
      + (s.mut.some((m) => m.length) ? '<br>變異：' + s.mut.map((m, i) => m.map((id) => `${RINGS[i].name.slice(0, 1)}${MUTATIONS.find((x) => x.id === id).name}`).join(' ')).filter(Boolean).join(' ') : '');
  }

  // ---------------- rebirth ----------------
  buildRebirth() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('infinity')) {
      h += `<div class="rb panel"><h3>無限　<span style="color:var(--cyan)">無限點數 ${s.ip}</span></h3>
        <p>${g.canInfinity() ? `現在進行無限可得 <span class="big">+${g.ipGain()}</span>` : '擊倒虛無王後可進行無限' + (s.inf.broken ? '（無限迴廊關卡100以上也可）' : '')}</p>
        <p style="color:var(--mist)">轉生倍率·核心·永久樹·革命·超越會重置。英雄·圖鑑·成就·試煉·任務會保留。</p>
        <button class="btn blue" id="bInf" style="width:100%" ${g.canInfinity() ? '' : 'disabled'}>無限（第${s.inf.count}次）</button></div>`;
      h += `<div class="rb panel"><h3>無限強化</h3>` + IP_UP.map((u) => `<div class="perm"><span>${u.name} ${g.ipHas(u.id) ? '<span style="color:var(--leaf)">已購</span>' : ''}</span><button class="btn blue" data-ip="${u.id}" ${g.ipHas(u.id) || s.ip < u.cost ? 'disabled' : ''}>${g.ipHas(u.id) ? '已購' : '∞' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('')
        + (s.inf.broken ? `<div class="perm"><span>無限倍率 Lv${s.ipRep || 0}</span><button class="btn blue" id="bIpRep" ${s.ip < g.ipRepCost() ? 'disabled' : ''}>∞${g.ipRepCost()}</button><span class="pt">全傷害×1e10（可無限次）</span></div>` : '') + '</div>';
      if (g.ipHas('ich')) h += `<div class="rb panel"><h3>無限試煉</h3><p>遵守規則擊倒虛無王即可通關。</p>` + INF_CH.map((c) => { const done = s.infChDone.includes(c.id), cur = s.infCh === c.id; return `<div class="perm"><span>${done ? '★ ' : ''}${c.name}</span><button class="btn ${cur ? 'red' : 'rose'}" data-ic="${c.id}" ${(s.infCh && !cur) || done ? 'disabled' : ''}>${cur ? '放棄' : done ? '已購' : '挑戰'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">獎勵：${c.reward}</span></span></div>`; }).join('') + '</div>';
    }
    h += `<div class="rb panel"><h3>轉生</h3>
      <p>目前倍率 <span class="big">×${fmt(s.pmL, 1)}</span></p>
      <p>轉生後 <span class="big" id="rbTo"></span>　核心+<span id="rbCore"></span></p>
      <p style="color:var(--mist)">關卡·黃金·圓環會重置。英雄階級·圖鑑·任務會保留。倍率成長達×10以上時為參考時機。</p>
      <button class="btn red" id="bRb" style="width:100%">轉生</button>
      ${s.perm.autoRb ? `<div class="tog"><span>自動轉生：當倍率成長</span><button class="small-btn" id="bAutoRb">×${fmt(s.autoRbL, 0)}時</button></div>` : ''}</div>`;
    if (g.has('promotion')) {
      h += `<div class="rb panel"><h3>晉升</h3><p>獻出部分轉生倍率，使該圓環威力×2並獲得旋轉倍率成長+15%（無限時重置）。</p>` + RINGS.map((def, i) => !g.on(i) ? '' : `<div class="perm"><span style="color:${def.col}">${def.name} 晉升Lv${s.promo[i]}</span><button class="btn" data-pr="${i}" ${g.canPromote(i) ? '' : 'disabled'}>倍率÷${fmt(PROMO.costL(s.promo[i]))}</button><span class="pt">威力×${fmt(s.promo[i] * PROMO.pow)}·成長+${s.promo[i] * 15}%</span></div>`).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>永久樹　<span style="color:var(--rose)">核心 ${s.core}</span></h3>` + PERM.map((p) => {
        const lv = s.perm[p.id], max = lv >= p.max;
        return `<div class="perm"><span>${p.name} <span style="color:var(--mist)">${p.max > 1 ? `${lv}/${p.max}` : lv ? '已購' : ''}</span></span><button class="btn rose" data-p="${p.id}" ${max || s.core < p.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '核心' + p.cost(lv)}</button><span class="pt">${p.text}</span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>試煉</h3><p>附帶限制的一輪。達到目標關卡即通關，並獲得永久獎勵。</p>` + CHALLENGES.map((c) => {
        const done = s.chDone.includes(c.id), cur = s.challenge === c.id;
        return `<div class="perm"><span>${done ? '★ ' : ''}${c.name} <span style="color:var(--mist)">目標${c.goal}</span></span><button class="btn ${cur ? 'red' : 'blue'}" data-ch="${c.id}" ${(s.challenge && !cur) ? 'disabled' : ''}>${cur ? '放棄' : done ? '重新挑戰' : '挑戰'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">獎勵：${c.reward}</span></span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('revolution')) {
      h += `<div class="rb panel"><h3>革命</h3><p>單輪抵達關卡300以上即可進行。捨棄轉生倍率、核心與永久樹（自動化除外），獲得革命記憶。</p>
        <p>革命記憶 <span class="big">${s.memory}</span>（每1個 傷害×3·旋轉倍率成長+20%）</p>
        <button class="btn rose" id="bRev" style="width:100%" ${g.canRevolution() ? '' : 'disabled'}>進行革命（記憶+${g.canRevolution() ? g.revolutionGain() : 0}）</button></div>`;
    }
    if (g.has('transcend')) {
      h += `<div class="rb panel"><h3>超越</h3><p>記憶6以上可進行。捨棄一切，全傷害×100·全速度+25%。通往最終世界的大門將開啟。</p>
        <button class="btn red" id="bTr" style="width:100%" ${g.canTranscend() ? '' : 'disabled'}>超越</button></div>`;
    }
    if (s.worlds.length > 1) {
      h += `<div class="rb panel"><h3>世界</h3><div class="worlds">` + s.worlds.map((w) => `<button class="${s.world === w ? 'on' : ''}" data-w="${w}">${WORLDS[w].name}<small>${WORLDS[w].law}　最高${s.worldBest[w] || 0}</small></button>`).join('') + '</div><p style="color:var(--mist)">移動世界會重置目前這一輪。</p></div>';
    }
    const R = s.rules;
    const rules = [];
    if (g.has('promotion')) rules.push(`<div class="rule"><span>自動晉升</span><button class="small-btn ${R.autoPromo ? 'on' : ''}" data-rt="autoPromo">${R.autoPromo ? 'ON' : 'OFF'}</button></div>`);
    if (g.ipHas('autoRev')) rules.push(`<div class="rule"><span>自動革命：關卡</span><input type="number" data-rn="revStage" value="${R.revStage}" min="300" step="50"></div>`);
    if (g.ipHas('autoTr')) rules.push(`<div class="rule"><span>自動超越</span><button class="small-btn ${R.autoTr ? 'on' : ''}" data-rt="autoTr">${R.autoTr ? 'ON' : 'OFF'}</button></div>`);
    if (g.epHas('autoInf')) rules.push(`<div class="rule"><span>自動∞：獲得點數（0=OFF）</span><input type="number" data-rn="infGain" value="${R.infGain}" min="0"></div>`);
    if (g.has('eternity')) rules.push(`<div class="rule"><span>自動永劫：迴廊關卡（0=OFF）</span><input type="number" data-rn="eterStage" value="${R.eterStage}" min="0" step="100"></div>`);
    if (rules.length) h += `<div class="rb panel"><h3>自動化規則</h3>${rules.join('')}</div>`;
    $('rbBody').innerHTML = h;
    $('rbBody').querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => { if (g.promote(+b.dataset.pr)) this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rt]').forEach((b) => b.addEventListener('click', () => { R[b.dataset.rt] = !R[b.dataset.rt]; this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rn]').forEach((inp) => inp.addEventListener('change', () => { R[inp.dataset.rn] = Math.max(0, parseInt(inp.value, 10) || 0); }));
    $('bRb').addEventListener('click', () => { if (g.rebirth()) { this.buildRebirth(); this.hooks.onSave(); } });
    if ($('bInf')) $('bInf').addEventListener('click', () => this.confirm('要進行無限嗎？', `無限點數+${g.ipGain()}。轉生·革命·超越的進度會重置。`, () => { g.infinity(); this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-ip]').forEach((b) => b.addEventListener('click', () => { if (g.buyIp(b.dataset.ip)) { this.buildRebirth(); this.toast('無限強化', IP_UP.find((u) => u.id === b.dataset.ip).text); } }));
    if ($('bIpRep')) $('bIpRep').addEventListener('click', () => { if (g.buyIpRep()) this.buildRebirth(); });
    $('rbBody').querySelectorAll('[data-ic]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.ic; if (s.infCh === id) { g.quitInfCh(); this.buildRebirth(); } else this.confirm('要挑戰無限試煉嗎？', '會發生與無限相同的重置（不會獲得點數）。', () => { g.startInfCh(id); this.buildRebirth(); }); }));
    $('rbBody').querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.ch;
      if (s.challenge === id) this.confirm('要放棄試煉嗎？', '目前這一輪會被重置。', () => { g.finishChallenge(false); this.buildRebirth(); });
      else this.confirm('要挑戰試煉嗎？', '目前這一輪會重置（不會失去轉生倍率與核心）。', () => { g.startChallenge(id); this.buildRebirth(); });
    }));
    $('rbBody').querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { if (g.buyPerm(b.dataset.p)) { this.buildRebirth(); this.applyFeatures(true); } }));
    if ($('bAutoRb')) $('bAutoRb').addEventListener('click', () => { s.autoRbL = (s.autoRbL % 6) + 1; this.buildRebirth(); });
    if ($('bRev')) $('bRev').addEventListener('click', () => this.confirm('要進行革命嗎？', '轉生倍率、核心與永久樹會消失。', () => { g.revolution(); this.buildRebirth(); this.buildRows(); }));
    if ($('bTr')) $('bTr').addEventListener('click', () => this.confirm('要超越嗎？', '記憶、倍率與變異會全部消失。', () => { g.transcend(); this.buildRebirth(); this.buildRows(); }));
    $('rbBody').querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (g.setWorld(+b.dataset.w)) { this.buildRebirth(); this.toast(`${WORLDS[+b.dataset.w].name} 已切換`, WORLDS[+b.dataset.w].law); } }));
    this.refreshRebirth();
  }
  refreshRebirth() {
    const g = this.g;
    if (!$('rbTo')) return;
    const can = g.canRebirth();
    $('rbTo').textContent = can ? '×' + fmt(g.rebirthTargetL(), 1) : '（還不會成長）';
    $('rbCore').textContent = can ? g.rebirthCore() : 0;
    $('bRb').disabled = !can;
  }
  confirm(title, text, fn) {
    this.modal(`<h3>${title}</h3><p>${text}</p><div class="btns"><button class="btn red" id="cfYes">執行</button><button class="btn" data-x>取消</button></div>`);
    this.onOpen = (box) => box.querySelector('#cfYes').addEventListener('click', () => { fn(); this.close(); this.hooks.onSave(); });
  }

  // ---------------- misc ----------------
  menu() {
    const s = this.g.state;
    this.modal(`<h3>選單</h3><div class="btns" style="flex-direction:column">
      <button class="btn" id="mSave">存檔</button>
      <button class="btn blue" id="mShare">分享到 X</button>
      <button class="btn" id="mLang">Language / 語言</button>
      <button class="btn" id="mNews">公告（v${VERSION}）</button>
      <button class="btn" id="mBgm">BGM：${this.hooks.bgm && this.hooks.bgm().on ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mEq">自動裝備：${s.autoEquipOn ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mFx">光效：${s.fxLow ? '弱' : '強'}</button>
      <button class="btn" id="mBk">從備份還原</button>
      ${this.hooks.debug ? `<button class="btn blue" id="mFast">測試用 時間×${s.timeScale >= 10 ? 1 : 10}</button>` : ''}
      <button class="btn red" id="mReset">刪除資料</button>
      <button class="btn" data-x>關閉</button></div>
      <p style="color:var(--mist)">遊玩時間 ${fnum(s.stats.playTime / 3600, 1)}小時</p>`);
    this.onOpen = (box) => {
      box.querySelector('#mSave').addEventListener('click', () => { this.hooks.onSave(); this.close(); this.toast('已存檔'); });
      if (box.querySelector('#mFast')) box.querySelector('#mFast').addEventListener('click', () => { s.timeScale = s.timeScale >= 10 ? 1 : 10; this.close(); });
      box.querySelector('#mShare').addEventListener('click', () => { this.close(); this.share(); });
      box.querySelector('#mLang').addEventListener('click', () => { this.close(); this.langPicker(); });
      box.querySelector('#mNews').addEventListener('click', () => { this.close(); this.news(false); });
      box.querySelector('#mBgm').addEventListener('click', () => { const b = this.hooks.bgm(); b.setOn(!b.on); b.start(); this.close(); this.toast('BGM ' + (b.on ? 'ON' : 'OFF')); });
      box.querySelector('#mEq').addEventListener('click', () => { s.autoEquipOn = !s.autoEquipOn; this.close(); this.toast('自動裝備 ' + (s.autoEquipOn ? 'ON' : 'OFF')); });
      box.querySelector('#mFx').addEventListener('click', () => { s.fxLow = !s.fxLow; document.getElementById('app').classList.toggle('fxlow', s.fxLow); this.close(); });
      box.querySelector('#mBk').addEventListener('click', () => { this.close(); this.backupPicker(); });
      box.querySelector('#mReset').addEventListener('click', () => { if (confirm('真的要全部刪除嗎？')) this.hooks.onReset(); });
    };
  }
  mutPicker(ev) {
    const h = RINGS[ev.ring];
    this.modal(`<div class="sub">RING MUTATION</div><h3>圓環變異</h3><p><span style="color:${h.col}">${h.name}</span>即將變異。請選擇其一。</p><div class="list">${ev.opts.map((m, k) => `<div class="mrow" data-mu="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${m.name}<small>${m.text}</small></div></div>`).join('')}</div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-mu]').forEach((r) => r.addEventListener('click', () => { this.g.chooseMut(+r.dataset.mu); this.close(); }));
  }
  backupPicker() {
    const list = this.hooks.backups();
    this.modal(`<h3>備份</h3><div class="list">${list.length ? list.map((b, k) => `<div class="mrow" data-bk="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${new Date(b.time).toLocaleString('ja-JP')}<small>關卡${b.stage}·任務${b.missions}</small></div></div>`).join('') : '<p>尚無備份（每5分鐘自動儲存）</p>'}</div><div class="btns"><button class="btn" data-x>關閉</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-bk]').forEach((r) => r.addEventListener('click', () => { if (confirm('要回到這個備份嗎？目前的資料會被覆蓋。')) this.hooks.restore(+r.dataset.bk); }));
  }
  offline(r) {
    const h = Math.floor(r.seconds / 3600), m = Math.floor((r.seconds % 3600) / 60);
    this.modal(`<div class="sub">歡迎回來！</div><h3>${h}小時${m}分鐘</h3><p>這段期間圓環也持續轉動（效率${Math.round(r.eff * 100)}%）<br>關卡 +${r.stage}　旋轉 +${fnum(r.laps, 0)}${r.found ? `<br>新道具 ${r.found}種` : ''}${r.flux ? `<br>倍速時間 +${Math.floor(r.flux / 60)}分鐘` : ''}</p><div class="btns">${r.seconds >= 600 ? `<button class="btn blue" id="offAd">${this.g.state.noAds ? '再領取一次份' : '看廣告獲得2倍'}</button>` : ''}<button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => { const b = box.querySelector('#offAd'); if (b) b.addEventListener('click', async () => { this.close(); const ok = this.g.state.noAds ? true : await this.hooks.monetize().showRewarded(); if (ok) { const r2 = this.g.runOffline(r.seconds); if (r2) this.toast('放置獎勵2倍！', `關卡 +${r2.stage}`); } else this.toast('無法載入廣告', '請檢查網路狀態或廣告攔截器（如 AdGuard）'); }); };
  }
  intro() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>轉起來，軍團</h3><img class="pic" src="px/por_leon.png" width="120" height="120">
      <p>起初只有劍士雷恩與紅環。<br>但每完成一個任務…</p>
      <div class="teaser"><img src="px/hero_seris.png"><img src="px/hero_elia.png"><img src="px/hero_nox.png"><img src="px/hero_garou.png"><img src="px/hero_sierra.png"></div>
      <div class="teaser-list">·<b>夥伴增加</b>（最多12人，圓環動作各不相同）<br>·<b>圓環增為4色</b>，重疊時觸發同步連擊<br>·轉生·每週突襲·圖鑑·宇宙…<br>　<b>玩法本身會越來越多</b></div>
      <div class="btns"><button class="btn" data-x>開始</button></div>`);
  }
  introOld() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>紅環</h3><img class="pic" src="px/por_leon.png" width="160" height="160">
      <p><span style="color:var(--lemon)">用手指轉動圓環！</span><br>寶石抵達頂點的瞬間點擊戰場即可<span style="color:var(--lemon)">PERFECT</span>！<br>轉得越多越快，攻擊與倍率（每圈×1.01）也隨之成長。<br>點擊戰場，雷恩就會揮劍。<br>放置也會前進，但轉動更快。</p><div class="btns"><button class="btn" data-x>開始</button></div>`);
  }
  // ---------------- cosmos ----------------
  buildCosmos() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('eternity')) {
      h += `<div class="rb panel"><h3>永劫　<span style="color:var(--pink)">永劫點數 ${s.ep}</span></h3><p>無限迴廊關卡300以上可進行。無限點數與無限強化（持有永劫記憶則保留）、無限的進度會重置。</p>
        <button class="btn rose" id="bEter" style="width:100%" ${g.canEternity() ? '' : 'disabled'}>${g.canEternity() ? '進行永劫（+' + g.epGain() + '）' : '迴廊關卡300解鎖'}</button></div>`;
      h += '<div class="rb panel"><h3>永劫強化</h3>' + EP_UP.map((u) => `<div class="perm"><span>${u.name}</span><button class="btn rose" data-ep="${u.id}" ${g.epHas(u.id) || s.ep < u.cost ? 'disabled' : ''}>${g.epHas(u.id) ? '已購' : 'EP' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('') + '</div>';
    }
    if (g.epHas('dil')) {
      h += `<div class="rb panel"><h3>裏世界　<span style="color:var(--cyan)">結晶 ${s.tp || 0}</span></h3><p>圓環逆向嘎吱作響的反轉世界。傷害指數會變小。走得越遠，結晶越多。進出時會發生與無限相同的重置。</p>
        <button class="btn ${s.dilOn ? 'red' : 'blue'}" id="bDil" style="width:100%">${s.dilOn ? '離開裏世界（結晶+' + g.dilGain() + '）' : '進入裏世界'}</button>`
        + DIL_UP.map((u) => { const lv = g.dl(u.id), max = u.max && lv >= u.max; return `<div class="perm"><span>${u.name} Lv${lv}</span><button class="btn blue" data-dl="${u.id}" ${max || (s.tp || 0) < u.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '結晶' + u.cost(lv)}</button><span class="pt">${u.text}</span></div>`; }).join('') + '</div>';
    }
    if (false) {
      h += `<div class="rb panel"><h3>星座盤　${s.zodiac.length}/${s.zslots}</h3><p>依成就數量開啟星座。最多裝備${s.zslots}個。</p><div class="zgrid">`
        + ZODIAC.map((z) => { const open = g.zodiacOpen(z.id), on = s.zodiac.includes(z.id); return `<button class="${on ? 'on' : open ? '' : 'lock'}" data-z="${z.id}">${open ? z.name : '？？？'}<small>${open ? z.text : '成就' + z.need}</small></button>`; }).join('') + '</div></div>';
    }
    if (g.has('minerals')) {
      h += `<div class="rb panel"><h3>作戰卡　<span style="color:var(--rose)">黑礦 ${s.ores.black || 0}</span>　${s.deck.length}/${s.cslots}張</h3><p><small style="color:var(--lemon)">機率：全${CARDS.length}種 各${(100 / CARDS.length).toFixed(1)}%（無稀有度）</small><br>每1個黑礦抽1張。重複的卡可疊加升級（最高Lv10）。只有裝備中的卡才會生效。突襲獎勵也能獲得。</p>
        <button class="btn rose" id="bCard" style="width:100%" ${(s.ores.black || 0) < 1 ? 'disabled' : ''}>抽卡</button>
        <div class="cards" style="margin-top:6px">${CARDS.map((c) => { const lv = s.cards[c.id] || 0, on = s.deck.includes(c.id); return `<button class="${on ? 'on' : lv ? '' : 'lock'}" data-cd="${c.id}">${lv ? c.name + ' Lv' + lv : '？？？'}<small>${lv ? c.text : '未獲得'}</small></button>`; }).join('')}</div></div>`;
      h += '<div class="rb panel"><h3>礦石與鍛造</h3><div class="ores">' + ORES.map((o) => `<span style="color:${o.col}">${o.name} <b>${s.ores[o.id] || 0}</b></span>`).join('') + '</div><p>精煉裝備中的道具（每1階威力+50%，最多10階）。</p>'
        + Object.keys(HEROES).map((hid) => { const id = s.equip[hid]; if (!id || !g.on(HEROES[hid].ring)) return ''; const it = ITEMS.find((x) => x.id === id), c = g.refineCost(id), ore = ORES.find((o) => o.id === c.ore); return `<div class="perm"><span>${it.name} +${c.lv}</span><button class="btn" data-rf="${id}" ${c.lv >= 10 || (s.ores[c.ore] || 0) < c.n ? 'disabled' : ''}>${c.lv >= 10 ? 'MAX' : ore.name + c.n}</button><span class="pt">${HEROES[hid].name}的裝備</span></div>`; }).join('') + '</div>';
    }
    $('cosBody').innerHTML = h || '<p class="note">進行革命後，宇宙的大門將開啟。</p>';
    const re = () => this.buildCosmos();
    if ($('bEter')) $('bEter').addEventListener('click', () => this.confirm('要進行永劫嗎？', '無限點數與無限的進度會重置。', () => { g.eternity(); re(); }));
    $('cosBody').querySelectorAll('[data-ep]').forEach((b) => b.addEventListener('click', () => { if (g.buyEp(b.dataset.ep)) re(); }));
    if ($('bDil')) $('bDil').addEventListener('click', () => { if (s.dilOn) this.confirm('要離開扭曲嗎？', '結晶+' + g.dilGain() + '。會發生重置。', () => { g.endDilation(); re(); }); else this.confirm('要進入時間扭曲嗎？', '會發生與無限相同的重置。', () => { g.startDilation(); re(); }); });
    $('cosBody').querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => { if (g.buyDil(b.dataset.dl)) re(); }));
    $('cosBody').querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { if (g.toggleZodiac(b.dataset.z)) re(); }));
    if ($('bCard')) $('bCard').addEventListener('click', () => g.drawCard());
    $('cosBody').querySelectorAll('[data-cd]').forEach((b) => b.addEventListener('click', () => { if (g.toggleCard(b.dataset.cd)) re(); }));
    $('cosBody').querySelectorAll('[data-rf]').forEach((b) => b.addEventListener('click', () => { if (g.refineItem(b.dataset.rf)) { this.toast('精煉成功！'); re(); } }));
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
      const tag = left > 0 ? `<span class="tag">還剩${Math.floor(left / 3600000)}小時${Math.floor(left / 60000) % 60}分鐘</span>` : '';
      return `<div class="mrow">${p.skin ? sw(p.skin) : ''}<div style="flex:1">${p.name}${tag}<small>${p.text}</small></div><button class="btn" data-buy="${p.id}" ${dis ? 'disabled' : ''}>${dis ? '已購買' : m.price(p)}</button></div>`;
    };
    const list = (cat) => SHOP.filter((p) => p.cat === cat && vis(p)).map(row).join('');
    let body = '';
    if (tab === 'top') {
      const c = g.passClaimable();
      body = `<div class="mrow"><div style="flex:1">軍團通行證　階 ${g.passTier()}/30<small>${c ? `可領取的獎勵有${c}個！` : `賽季剩餘${g.passDaysLeft()}天·玩得越多階數越高`}</small></div><button class="btn blue" data-tab="pass">查看</button></div>`;
      if (g.monthLeft() > 0) body += `<p class="note">月票 生效中：剩餘${g.monthLeft()}天</p>`;
      body += list('top');
    } else if (tab === 'pass') {
      const t = g.passTier(), p = s.pass, c = g.passClaimable();
      let rows = '';
      for (let k = 1; k <= 30; k++) rows += `<div class="prow ${k <= t ? 'got' : ''}"><b>${k}</b><span>${g.passReward('free', k).text}${k <= p.cf ? ' ✓' : ''}</span><span class="pr">${g.passReward('prem', k).text}${p.premium && k <= p.cp ? ' ✓' : ''}</span></div>`;
      body = `<div class="passhead">賽季剩餘${g.passDaysLeft()}天　階 <b>${t}</b>/30<i class="pbar"><b style="width:${t >= 30 ? 100 : p.xp % 100}%"></b></i><small>每遊玩1分鐘+1·每日登入+50·完成任務+30（100為1階）</small></div>
        <div class="btnrow"><button class="btn" id="passClaim" ${c ? '' : 'disabled'}>一次領取${c ? '（' + c + '）' : ''}</button>${p.premium ? '<span class="tag">高級已啟用</span>' : `<button class="btn rose" data-buy="rl_pass">高級 ${m.price(SHOP.find((x) => x.id === 'rl_pass'))}</button>`}</div>
        <div class="prow head"><b>階</b><span>免費</span><span class="pr">高級</span></div>${rows}`;
    } else if (tab === 'look') {
      const mine = ['', ...Object.keys(RING_SKINS).filter((k) => (s.skins || []).includes(k))];
      body = '<p class="note">圓環換裝（僅外觀，不影響強度）</p>' + mine.map((id) => `<div class="mrow">${sw(id)}<div style="flex:1">${id ? RING_SKINS[id].name : '預設'}</div><button class="btn blue" data-skin="${id}" ${(s.skin || '') === id ? 'disabled' : ''}>${(s.skin || '') === id ? '使用中' : '使用'}</button></div>`).join('')
        + '<p class="note">購買</p>' + list('look');
    } else if (tab === 'item') {
      body = list('item');
    } else {
      body = AD_REWARDS.filter((a) => !a.need || g.has(a.need)).map((a) => { const left = g.adLeft(a.id, today); return `<div class="mrow"><div style="flex:1">${a.name}<small>今天還剩${left}次</small></div><button class="btn blue" data-ad="${a.id}" ${left <= 0 ? 'disabled' : ''}>${s.noAds || m.web ? '領取' : '看廣告'}</button></div>`; }).join('')
        + '<p class="note">每日登入：倍速時間1小時（連續登入還可獲得轉生核心）<br>從放置回來時，看廣告也能獲得2倍獎勵</p>';
    }
    const TABS = [['top', '超值'], ['pass', '通行證'], ['look', '外觀'], ['item', '道具'], ['free', '免費']];
    const cap = g.spendCap();
    box.innerHTML = `<h3>商店</h3>${m.web ? '<p style="color:var(--cyan)">瀏覽器版：免費獎勵無需看廣告即可領取。購買請至Android應用版</p>' : m.native ? '' : '<p style="color:var(--pink)">瀏覽器版為測試模式（不會產生付款）</p>'}
      <div class="tabs">${TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}${k === 'pass' && g.passClaimable() ? '!' : ''}</button>`).join('')}</div>
      <div class="list">${body}</div>
      <p class="legal">本月購買 ¥${g.spentThisMonth().toLocaleString()}${cap < Infinity ? ` / 上限 ¥${cap.toLocaleString()}` : ''}　通關無需課金</p>
      <div class="btns"><button class="btn blue" id="bHist">購買紀錄·設定</button>${m.native ? '<button class="btn blue" id="bRestore">還原購買</button>' : ''}<button class="btn" id="bShopX">關閉</button></div>`;
    box.querySelector('#bShopX').addEventListener('click', () => this.close());
    box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.drawShop(box, b.dataset.tab)));
    box.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => this.buyFlow(b.dataset.buy)));
    box.querySelectorAll('[data-skin]').forEach((b) => b.addEventListener('click', () => { s.skin = b.dataset.skin; this.drawShop(box, tab); }));
    const pc = box.querySelector('#passClaim');
    if (pc) pc.addEventListener('click', () => { const n = g.claimPass(); this.toast('已領取通行證獎勵', n + '個'); this.hooks.onSave && this.hooks.onSave(); this.drawShop(box, tab); });
    box.querySelectorAll('[data-ad]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.ad;
      this.close();
      const ok = s.noAds ? true : await m.showRewarded();
      if (ok && g.adReward(id, today)) this.toast('已領取獎勵', AD_REWARDS.find((a) => a.id === id).name);
      else if (!ok) this.toast('無法載入廣告', '請檢查網路狀態或廣告攔截器（如 AdGuard）');
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
      this.modal(`<div class="sub">無法購買</div><h3>本月上限</h3><p>${AGE_BANDS[s.ageBand].name}的玩家每月上限為 ¥${g.spendCap().toLocaleString()}。<br>本月還剩 ¥${Math.max(0, g.spendCap() - g.spentThisMonth()).toLocaleString()} 的額度。<br>下個月1日會重置。</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
      return;
    }
    this.hooks.monetize().buy(id);
  }
  ageGate(next) {
    this.close();
    this.modal(`<div class="sub">首次購買前</div><h3>請選擇年齡</h3><p>未成年玩家每月購買金額有上限。<br>未滿18歲的玩家請在取得監護人同意後再購買。</p><div class="btns col">${Object.entries(AGE_BANDS).map(([k, b]) => `<button class="btn" data-age="${k}">${b.name}${b.cap < Infinity ? `（每月最高¥${b.cap.toLocaleString()}）` : ''}</button>`).join('')}<button class="btn red" data-x>取消</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => { this.g.state.ageBand = b.dataset.age; this.hooks.onSave && this.hooks.onSave(); next(); }));
  }
  purchaseInfo() {
    const g = this.g, s = g.state, list = (s.purchases || []).slice().reverse();
    const rows = list.length ? list.map((x) => { const d = new Date(x.t); return `<div class="mrow"><span style="color:var(--mist)">${d.getMonth() + 1}/${d.getDate()}</span><div style="flex:1">${x.name}</div><span>¥${x.yen.toLocaleString()}</span></div>`; }).join('') : '<p class="note">尚無購買紀錄</p>';
    const band = AGE_BANDS[s.ageBand];
    this.modal(`<h3>購買紀錄</h3><p>本月 ¥${g.spentThisMonth().toLocaleString()}${band && band.cap < Infinity ? ` / 上限 ¥${band.cap.toLocaleString()}` : ''}<br>年齡設定：${band ? band.name : '未設定'}</p><div class="list">${rows}</div>
      <p class="legal">·沒有付費貨幣（直接購買商品）<br>·作戰卡機率：全${CARDS.length}種 各${(100 / CARDS.length).toFixed(1)}%<br>·即使集齊全部也沒有特別獎勵<br>·退款依照 Google Play 退款政策<br>·遊戲通關無需課金</p>
      <div class="btns"><button class="btn blue" id="bAge">更改年齡設定</button><button class="btn" data-x>關閉</button></div>`);
    this.onOpen = (box) => box.querySelector('#bAge').addEventListener('click', () => this.ageGate(() => { this.close(); this.purchaseInfo(); }));
  }
  fakeAd() {
    return new Promise((res) => {
      this.modal(`<div class="sub">測試廣告</div><div class="fake-ad" id="fakeAd">廣告（測試） 3</div><p>正式的Android版會在這裡播放AdMob影片廣告。</p>`);
      this.onOpen = (box) => {
        let n = 3;
        const iv = setInterval(() => { n--; const el = box.querySelector('#fakeAd'); if (el) el.textContent = n > 0 ? '廣告（測試） ' + n : '獲得獎勵！'; if (n <= 0) { clearInterval(iv); setTimeout(() => { this.close(); res(true); }, 400); } }, 1000);
      };
    });
  }
  testPurchase(p) {
    return new Promise((res) => {
      this.modal(`<div class="sub">測試購買</div><h3>${p.name}</h3><p>${p.text}<br>正式價格 ${p.price}<br><span style="color:var(--pink)">測試模式不會產生付款。</span></p><div class="btns"><button class="btn" id="tpYes">領取</button><button class="btn red" id="tpNo">取消</button></div>`);
      this.onOpen = (box) => {
        box.querySelector('#tpYes').addEventListener('click', () => { this.close(); res(true); });
        box.querySelector('#tpNo').addEventListener('click', () => { this.close(); res(false); });
      };
    });
  }

  daily(r) {
    this.modal(`<div class="sub">LOGIN BONUS</div><h3>${r.streak}天連續登入</h3><p>倍速時間 +1小時${r.core ? `<br>轉生核心 +${r.core}` : ''}${r.month ? `<br><span style="color:var(--lemon)">月票：倍速時間+1小時·金幣（剩餘${r.month}天）</span>` : ''}<br><span style="color:var(--mist)">${this.g.has('autoBuy') ? '按圓環旁的「倍速」按鈕，遊戲就會以2倍速進行' : '關卡40解鎖使用（可存放）'}</span></p><div class="btns"><button class="btn" data-x>領取</button></div>`);
  }
  appOnly() {
    this.close();
    this.modal(`<div class="sub">瀏覽器版</div><h3>購買請至應用版</h3><p>瀏覽器版可免費直接遊玩。<br>道具購買請至Android應用版（Google Play）。</p><div class="btns"><button class="btn" id="bPlay">前往 Google Play</button><button class="btn red" data-x>關閉</button></div>`);
    this.onOpen = (box) => box.querySelector('#bPlay').addEventListener('click', () => { openUrl(PLAY_URL); this.close(); });
  }
  share() {
    const g = this.g, s = g.state;
    const text = `在REVOLUTION LEGION抵達關卡${s.stats.bestStage}！ 倍率×${fmt(g.totalMultL(), 1)}`;
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
    this.modal(`<div class="sub">${onlyNew ? 'UPDATE' : '公告'}</div><h3>${onlyNew ? '已更新' : '更新紀錄'}</h3><div class="list" style="text-align:left">${list.map((u) => `<p class="note"><b style="color:var(--lemon)">v${u.v}</b>（${u.date}）${u.title}<br>${u.items.map((x) => '·' + x).join('<br>')}</p>`).join('')}</div><p style="color:var(--cyan)">${NEXT_CHAPTER}</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
  trueEnding() {
    this.modal(`<div class="sub">TRUE END</div><h3>迴廊盡頭</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>在無限迴廊的1000層，圓環合而為一。<br>遊玩時間 ${fnum(this.g.state.stats.playTime / 3600, 1)}小時<br><span style="color:var(--cyan)">但故事還沒結束。</span><br>${NEXT_CHAPTER}<br>在那之前，就以刷新迴廊紀錄與突襲來磨練實力吧。</p><div class="btns"><button class="btn blue" id="bShareEnd">分享到 X</button><button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => box.querySelector('#bShareEnd').addEventListener('click', () => this.share());
  }
  ending() {
    this.modal(`<div class="sub">THE END</div><h3>擊倒了虛無王</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>不斷旋轉的圓環，終於抵達世界盡頭。<br>遊玩時間 ${fnum(this.g.state.stats.playTime / 3600, 1)}小時<br>然而∞的彼端，世界仍在延續。<br><span style="color:var(--cyan)">已在轉生畫面解鎖無限。</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
}
void IMG;
