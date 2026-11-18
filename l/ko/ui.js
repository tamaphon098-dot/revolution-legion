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
    $('chBar').addEventListener('click', () => this.confirm('시련을 그만둘까?', '지금의 주행은 초기화된다.', () => this.g.finishChallenge(false)));
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
        wrap.insertAdjacentHTML('beforeend', `<div class="row ghost" style="--c:${def.col}"><div class="por" style="--c:var(--steel)"><img class="px" src="px/pors_${def.hero}.png" style="filter:brightness(0)"></div><div>???　미션으로 해금</div></div>`);
        return;
      }
      wrap.insertAdjacentHTML('beforeend', `
        <div class="row" style="--c:${def.col}">
          <div class="por"><img class="px" src="px/pors_${g.heroId(i)}.png"><span class="rk" id="rRk${i}"></span><span class="asc" id="rAsc${i}"></span></div>
          <div><div class="nm"><span>${def.name}</span><small id="rLv${i}"></small></div><div class="lvbar"><b id="rBar${i}"></b></div><div class="lapm" id="rLap${i}"></div></div>
          <button class="btn" id="bLv${i}"><span id="bLvT${i}">Lv+</span><span class="c" id="bLvC${i}"></span></button>
          <button class="btn blue" id="bSp${i}"><span>속도+</span><span class="c" id="bSpC${i}"></span></button>
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
    } else { $('mId').textContent = '★'; $('mName').textContent = '전체 미션 달성!'; $('mProg').textContent = ''; $('mBar').style.width = '100%'; }

    $('tapHint').classList.toggle('hide', (s.stats.taps || 0) >= 15 || this.scr !== 'battle');
    $('ringHint').classList.toggle('hide', (s.stats.spun || 0) >= 3);
    const e = g.enemy;
    const tr = e.trait && TRAITS[e.trait];
    $('ename').innerHTML = tr ? `<span style="color:${tr.col}">【${tr.name}】</span>${e.n}<small>${tr.tip}</small>` : e.n;
    $('ename').className = e.boss ? 'boss' : '';
    const chal = s.challenge && CHALLENGES.find((c) => c.id === s.challenge);
    $('chBar').classList.toggle('hide', !chal && !s.dilOn && !g.raid);
    if (g.raid) $('chBar').innerHTML = `레이드「${g.raid.rule.name}」남은 시간${Math.ceil(g.raid.t)}초　데미지 ${fmt(g.raid.dmgL)}`;
    if (s.dilOn && !chal && !g.raid) $('chBar').innerHTML = `이면 세계(데미지 지수 ×${(0.75 + 0.02 * g.dl('d_soft')).toFixed(2)})　나가면 결정 +${g.dilGain()}`;
    if (chal && !g.raid) $('chBar').innerHTML = `시련 중:${chal.name}(${chal.rule})　${Math.min(s.runBest, chal.goal)}/${chal.goal}　<u>그만두기</u>`;
    $('btnAutoBuy').textContent = s.autoBuyOn ? '자동 강화' : '수동 강화';
    $('btnFlux').classList.toggle('hide', !s.features.autoBuy || !(s.flux > 0 || s.fluxOn));
    $('btnFlux').classList.toggle('on', !!s.fluxOn);
    { const f = Math.floor(s.flux || 0), h = Math.floor(f / 3600), mm = Math.floor((f % 3600) / 60); $('btnFlux').textContent = `2배속 ${h}:${String(mm).padStart(2, '0')}`; }
    $('btnAutoBuy').classList.toggle('on', s.autoBuyOn);
    $('sDps').textContent = fmt(g.dpsL(), 1);
    $('sRps').textContent = fnum(g.active().reduce((a, i) => a + g.rps(i), 0), 2);
    $('sSync').textContent = Math.round(g.syncRate() * 100) + '%';
    $('burstBar').style.width = (s.od > 0 ? (s.od / 10) * 100 : s.burst) + '%';
    $('burst').classList.toggle('ready', s.burst >= 100 && s.od <= 0);
    $('burst').classList.toggle('od', s.od > 0);
    $('btnFast').textContent = s.autoBurst ? 'AUTO' : '수동';
    $('dexBadge').classList.toggle('hide', !(s.unseenItems > 0));
    $('btnShop').classList.toggle('alert', g.passClaimable() > 0 || SHOP.some((p) => p.offer && g.offerLeft(p.id) > 0 && !(s.owned || []).includes(p.id)));
    $('dexBadge').textContent = s.unseenItems > 9 ? '9+' : s.unseenItems || '';
    $('btnFast').classList.toggle('on', s.autoBurst);

    RINGS.forEach((def, i) => {
      if (!g.on(i) || !$('rLv' + i)) return;
      const r = s.rings[i], cap = g.cap(i);
      $('rLv' + i).innerHTML = `Lv${r.lv}/${cap}`;
      $('rAsc' + i).textContent = r.asc ? '★' + r.asc : '';
      $('rLap' + i).textContent = `바퀴 배율 ×${fmt(r.lapL)}`;
      $('rBar' + i).style.width = (r.lv / cap) * 100 + '%';
      const rk = g.rank(g.heroId(i));
      $('rRk' + i).innerHTML = RANK_TXT(rk);
      const asc = g.canAsc(i);
      const bl = $('bLv' + i);
      bl.classList.toggle('asc', asc);
      $('bLvT' + i).textContent = asc ? '상한 돌파' : 'Lv+';
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
          <p>${h.name} 승격!<br>데미지 ×${RANKS[ev.rankUp].mult}${ev.rankUp === 3 && h.ring === 0 ? '<br>참격이 늘었다!' : ''}</p>
          <div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast('어센션!', `${RINGS[ev.ring].name} 상한 Lv${g.cap(ev.ring)}·배율 증가 +5%`);
        return;
      }
      case 'drop': this.dropCard(ev); return;
      case 'bossfail': this.toast('보스를 쓰러뜨리지 못했다', '45초 힘을 모아 재도전'); return;
      case 'rebirth': this.toast(`환생! 배율 ×${fmt(g.state.pmL, 1)}`, `코어 +${ev.core}`); this.buildRows(); return;
      case 'clear': if (ev.first) this.ending(); else this.toast('공허왕을 쓰러뜨렸다!', '환생 화면에서 인피니티할 수 있다'); return;
      case 'infinity': this.toast(`인피니티! 인피니티 포인트+${ev.gain}`); this.buildRows(); return;
      case 'infChStart': this.toast(`무한의 시련「${INF_CH.find((c) => c.id === ev.id).name}」 시작`, INF_CH.find((c) => c.id === ev.id).rule); this.show('battle'); return;
      case 'infChClear': { const c = INF_CH.find((x) => x.id === ev.id); this.modal(`<div class="sub">INFINITY CHALLENGE</div><h3>${c.name}</h3><p>영구 보상: <span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'unit': this.unitStamp(ev.u); return;
      case 'recruit': { const h = HEROES[ev.id]; this.modal(`<div class="sub">NEW HERO</div><h3>${h.name}</h3><img class="pic" src="px/por_${ev.id}.png" width="160" height="160"><p>${h.job}, 군단에 합류!<br>${h.line}<br><span style="color:var(--lemon)">군단 화면에서 링에 배치할 수 있다</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'card': if (!ev.free) this.toast(`작전 카드「${ev.card.name}」Lv${ev.lv}`, ev.card.text); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'raidStart': this.toast(`레이드 시작「${ev.rule.name}」`, ev.rule.text); this.show('battle'); return;
      case 'raidEnd': { const T = ['평가 없음', '동', '은', '금', '무지개']; this.modal(`<div class="sub">RAID RESULT</div><h3>${T[ev.tier]}</h3><p>데미지 ${fmt(ev.score)}${ev.suspicious ? '<br><span style="color:var(--red)">기록이 부자연스러워 무효</span>' : ev.gained ? `<br>휘장+${ev.gained}·작전 카드×${ev.gained * 2}` : '<br>이번 주는 더 이상 보상 없음'}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'heroes') this.buildHeroes(); return; }
      case 'feature': { const f = FEATURE_INFO[ev.id]; if (f) this.modal(`<div class="sub">NEW</div><h3>${f[0]}</h3><p>${f[1]}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); this.applyFeatures(true); return; }
      case 'tarot': this.modal(`<div class="sub">TAROT</div><h3>${ev.card.name}</h3><p>${ev.result}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'eternity': this.toast(`영겁! 영겁 포인트+${ev.gain}`); this.buildRows(); return;
      case 'dilStart': this.toast('이면 세계에 진입했다', '데미지가 약해진다. 멀리 갈수록 결정이 늘어난다'); this.show('battle'); return;
      case 'dilEnd': this.toast(`이면 세계에서 나왔다 결정+${ev.gain}`); return;
      case 'blackOre': this.toast('흑광을 발견했다!', '우주 탭에서 타로를 뽑을 수 있다'); return;
      case 'grant': this.toast('받았습니다', (SHOP.find((p) => p.id === ev.id) || {}).name || ''); return;
      case 'ach': this.toast(`★업적「${ev.ach.name}」 ×1.05`); return;
      case 'mutChoice': return this.mutPicker(ev);
      case 'mutation': this.toast(`링 변이! ${ev.mutation.name}`, ev.mutation.text); return;
      case 'challengeEnd': {
        const c = CHALLENGES.find((x) => x.id === ev.id);
        if (ev.success) this.modal(`<div class="sub">CHALLENGE CLEAR</div><h3>${c.name}</h3><p>영구 보상: <span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast(`${c.name} 중단`);
        this.buildRows();
        return;
      }
      case 'challengeStart': this.toast(`${CHALLENGES.find((x) => x.id === ev.id).name} 시작`, CHALLENGES.find((x) => x.id === ev.id).rule); this.buildRows(); this.show('battle'); return;
    }
  }

  onMission(m) {
    const rw = m.reward;
    this.applyFeatures(true);
    if (rw.ring !== undefined || rw.feature || rw.world !== undefined) {
      const info = rw.feature && FEATURE_INFO[rw.feature];
      const pic = rw.ring !== undefined ? `<img class="pic" src="px/${HEROES[RINGS[rw.ring].hero].portrait}.png" width="160" height="160">` : '';
      this.modal(`<div class="sub">MISSION CLEAR ${m.id}</div><h3>${rw.ring !== undefined ? '새로운 동료' : '해금!'}</h3>${pic}
        <p>${m.name}<br><span style="color:var(--lemon)">${rw.text}</span>${info ? `<br>${info[1]}` : ''}</p>
        <p>영구 보너스 ×${this.g.state.missions.length + 1}</p>
        <div class="btns"><button class="btn" data-x>OK</button></div>`);
    } else this.toast(`미션 달성 ${m.id}`, rw.text);
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
      <div class="sub">${h.name} 전용${it.fxText ? '·' + it.fxText : ''}</div>
      ${ev.better ? `<div class="bt"><button class="btn" id="dcEq">장착하기(×${fnum(Math.pow(10, ev.before), 1)}→×${fnum(Math.pow(10, ev.after), 1)})</button><button class="btn red" id="dcNo">나중에</button></div>` : ''}`;
    el.classList.remove('hide');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    const hide = () => el.classList.add('hide');
    if (ev.better) {
      el.querySelector('#dcEq').addEventListener('click', (e) => { e.stopPropagation(); g.equipItem(ev.hid, it.id); this.toast(`${h.name}:${it.name} 장착`); hide(); });
      el.querySelector('#dcNo').addEventListener('click', (e) => { e.stopPropagation(); hide(); });
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { once: false });
    }
    this._dropT = setTimeout(hide, ev.better ? 9000 : 4000);
  }

  unitStamp(u) {
    const el = $('stamp');
    el.innerHTML = `<b>${UNITS[u]}</b><span>도달!</span><small>단위 보너스 전체 데미지×1.15</small>`;
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
    this.modal(`<div class="sub">영구 보너스 ×${s.missions.length + 1}(환생해도 사라지지 않음)</div><h3>미션</h3><div class="list">${rows}</div><div class="btns"><button class="btn" data-x>닫기</button></div>`);
  }

  // ---------------- heroes ----------------
  buildHeroes() {
    const g = this.g, s = g.state;
    // weekly raid panel
    if (g.has('raid')) {
      const wk = this.hooks.week(), rule = RAID_RULES[((wk.no % RAID_RULES.length) + RAID_RULES.length) % RAID_RULES.length], R = s.raid, cur = R.week === wk.key ? R.weekTier : 0;
      $('raidBox').innerHTML = `<div class="rb panel"><h3>주간 레이드「${rule.name}」</h3><p>${rule.text}<br>60초 동안 얼마나 데미지를 낼 수 있을까. 목표는 지금 공격력×60초.</p>
        <div class="tierbar">${['동', '은', '금', '무지개'].map((t, k) => `<span class="${cur > k ? 'got' : ''}">${t}</span>`).join('')}</div>
        <p>휘장 ${R.tokens}(누계${R.tokensTotal})　최고 기록 ${R.best ? fmt(R.best) : '-'}</p>
        <button class="btn red" id="bRaid" style="width:100%" ${g.raid ? 'disabled' : ''}>${g.raid ? '도전 중' : '도전하기(몇 번이든)'}</button></div>`;
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
        <div><div class="nm">${on ? `${h.name}　<span style="color:var(--cloud)">${h.job}</span>` : '???'}</div>
          <div class="ln">${on ? h.line : '미션으로 동료가 된다'}</div>
          <div class="ln">누적 어센션 ${s.stats.ascTotal[i]}${next ? `(${next.id}까지${next.need})` : '(최고 랭크)'}</div>
          ${on && g.has('items') ? `<div class="equip"><span class="slot" style="--rc:${it ? RARITY[it.rar].col : ''}">${it ? `<img class="px" src="px/${it.id}.png">` : ''}</span><span>${it ? `${it.name} Lv${g.itemLevel(it.id)}` : '장비 없음'}</span><button class="small-btn" data-eq="${id}">변경</button></div>` : ''}
        </div></div>`;
    }).join('');
    $('heroList').querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => this.equipPicker(b.dataset.eq)));
    $('heroList').querySelectorAll('[data-lu]').forEach((b) => b.addEventListener('click', () => { const [i, id] = b.dataset.lu.split(':'); if (g.setLineup(+i, id)) { this.buildHeroes(); this.buildRows(); } }));
  }
  equipPicker(hid) {
    const g = this.g, s = g.state, type = HEROES[hid].type;
    const own = ITEMS.filter((it) => it.type === type && s.items[it.id]);
    this.modal(`<div class="sub">${HEROES[hid].name} 장비</div><div class="list">${own.map((it) => `<div class="mrow" data-pick="${it.id}" style="cursor:pointer"><span class="slot" style="--rc:${RARITY[it.rar].col}"><img class="px" src="px/${it.id}.png"></span><div>${it.name} <span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> Lv${g.itemLevel(it.id)}<small>×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)} ${it.fxText}</small></div></div>`).join('') || '<p>아직 가지고 있지 않다</p>'}</div><div class="btns"><button class="btn" data-x>닫기</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-pick]').forEach((r) => r.addEventListener('click', () => { s.equip[hid] = r.dataset.pick; this.close(); this.buildHeroes(); }));
  }

  // ---------------- dex ----------------
  buildDex() {
    const g = this.g, s = g.state;
    s.unseenItems = 0;
    if (!$('dexTabs')) {
      $('scr-dex').insertAdjacentHTML('afterbegin', '<div id="dexTabs" class="tabs"><button class="small-btn on" data-t="items">도감</button><button class="small-btn" data-t="ach">업적</button></div><div id="achList" class="hide"></div>');
      $('dexTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { this.dexTab = b.dataset.t; this.buildDex(); }));
    }
    const achTab = this.dexTab === 'ach';
    $('dexTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === (achTab ? 'ach' : 'items')));
    ['dexGrid', 'dexInfo', 'dexNote'].forEach((id) => $(id).classList.toggle('hide', achTab));
    $('scr-dex').querySelector('h2').classList.toggle('hide', achTab);
    $('achList').classList.toggle('hide', !achTab);
    if (achTab) {
      $('achList').innerHTML = `<p class="note">업적 ${s.ach.length}/${ACHIEVEMENTS.length}　전체 데미지×${fnum(Math.pow(1.05, s.ach.length), 2)}</p>` + ACHIEVEMENTS.map((a) => {
        const done = s.ach.includes(a.id), hide = a.secret && !done;
        return `<div class="mrow ${done ? '' : 'done'}"><span class="id">${done ? '★' : '·'}</span><div>${hide ? '???(숨은 업적)' : a.name}<small>${hide ? '조건은 비밀' : a.desc}</small></div></div>`;
      }).join('');
      return;
    }
    $('dexCount').textContent = `${s.found.length}/${ITEMS.length}`;
    $('dexNote').textContent = g.has('dexBonus') ? `도감 보너스 전체 데미지×${fmt(g.dexL(), 1)}` : '발견한 아이템이 기록된다';
    $('dexGrid').innerHTML = ITEMS.map((it) => {
      const own = s.items[it.id];
      return `<div class="cell ${own ? '' : 'unk'} ${this.dexSel === it.id ? 'sel' : ''}" data-it="${it.id}" style="--rc:${own ? RARITY[it.rar].col : ''}"><img class="px" src="px/${it.id}.png">${own ? `<span class="lv">${g.itemLevel(it.id)}</span>` : ''}</div>`;
    }).join('');
    $('dexGrid').querySelectorAll('[data-it]').forEach((c) => c.addEventListener('click', () => { this.dexSel = c.dataset.it; this.buildDex(); }));
    const it = this.dexSel && ITEMS.find((x) => x.id === this.dexSel);
    if (!it) { $('dexInfo').innerHTML = '아이템을 탭하면 상세를 볼 수 있다'; return; }
    const own = s.items[it.id];
    const hid = Object.keys(HEROES).find((h) => HEROES[h].type === it.type);
    $('dexInfo').innerHTML = own
      ? `<span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> ${it.name}　Lv${g.itemLevel(it.id)}(${own}개)<br>${HEROES[hid].name} 전용　데미지×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)}<br>${it.fxText || '　'}`
        + (s.equip[hid] === it.id ? '<br><span style="color:var(--leaf)">장착 중</span>' : g.on(HEROES[hid].ring) ? `<br><button class="btn" id="dexEq">장착하기</button>` : '')
      : '???　아직 발견하지 못했다';
    const b = $('dexEq');
    if (b) b.addEventListener('click', () => { s.equip[hid] = it.id; this.buildDex(); });
  }

  // ---------------- lab ----------------
  buildLab() {
    const g = this.g, s = g.state;
    if (!this.labView) this.labView = new RingView($('lcv'), null, g, 144);
    const rows = g.active().map((i) => `<div class="lrow" style="--c:${RINGS[i].col}"><span style="color:${RINGS[i].col}">${RINGS[i].name}</span><input type="range" min="10" max="100" value="${Math.round(s.rings[i].throttle * 100)}" id="th${i}" ${s.autoTune ? 'disabled' : ''}><span class="v" id="thv${i}"></span></div>`).join('');
    $('labRows').innerHTML = `<div class="panel">${rows}
      ${g.has('autotune') ? `<div class="tog"><span>자동 튜닝</span><button class="small-btn ${s.autoTune ? 'on' : ''}" id="tTune">${s.autoTune ? 'ON' : 'OFF'}</button></div>` : ''}
      <div class="tog"><span>속도비 맞추기</span><button class="btn" id="tNow">정렬</button></div></div>
      <div class="panel" style="margin-top:6px" id="labStats"></div>`;
    g.active().forEach((i) => $('th' + i).addEventListener('input', (e) => { g.setThrottle(i, e.target.value / 100); this.refreshLab(); }));
    if ($('tTune')) $('tTune').addEventListener('click', () => { s.autoTune = !s.autoTune; if (s.autoTune) g.autoTuneRings(); this.buildLab(); });
    $('tNow').addEventListener('click', () => { g.autoTuneRings(); this.buildLab(); this.toast('속도비를 맞췄다'); });
    this.refreshLab();
  }
  refreshLab() {
    const g = this.g, s = g.state;
    g.active().forEach((i) => { const v = $('thv' + i); if (v) v.textContent = fnum(g.rps(i), 2) + '/초'; });
    const st = $('labStats');
    if (st) st.innerHTML = `동기율 <span style="color:var(--lemon)">${Math.round(g.syncRate() * 100)}%</span><br>`
      + [2, 3, 4].map((n) => `${COMBOS[n].name} ×${fmt(g.comboL(n), 0)}　${s.stats['combo' + n]}회`).join('<br>')
      + (s.mut.some((m) => m.length) ? '<br>변이:' + s.mut.map((m, i) => m.map((id) => `${RINGS[i].name.slice(0, 1)}${MUTATIONS.find((x) => x.id === id).name}`).join(' ')).filter(Boolean).join(' ') : '');
  }

  // ---------------- rebirth ----------------
  buildRebirth() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('infinity')) {
      h += `<div class="rb panel"><h3>인피니티　<span style="color:var(--cyan)">인피니티 포인트 ${s.ip}</span></h3>
        <p>${g.canInfinity() ? `지금 인피니티하면 <span class="big">+${g.ipGain()}</span>` : '공허왕을 쓰러뜨리면 인피니티할 수 있다' + (s.inf.broken ? '(무한 회랑 스테이지 100 이상에서도 가능)' : '')}</p>
        <p style="color:var(--mist)">환생 배율·코어·영구 트리·혁명·초월이 초기화된다. 영웅·도감·업적·시련·미션은 남는다.</p>
        <button class="btn blue" id="bInf" style="width:100%" ${g.canInfinity() ? '' : 'disabled'}>인피니티(${s.inf.count}회차)</button></div>`;
      h += `<div class="rb panel"><h3>무한 강화</h3>` + IP_UP.map((u) => `<div class="perm"><span>${u.name} ${g.ipHas(u.id) ? '<span style="color:var(--leaf)">완료</span>' : ''}</span><button class="btn blue" data-ip="${u.id}" ${g.ipHas(u.id) || s.ip < u.cost ? 'disabled' : ''}>${g.ipHas(u.id) ? '완료' : '∞' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('')
        + (s.inf.broken ? `<div class="perm"><span>무한 배율 Lv${s.ipRep || 0}</span><button class="btn blue" id="bIpRep" ${s.ip < g.ipRepCost() ? 'disabled' : ''}>∞${g.ipRepCost()}</button><span class="pt">전체 데미지×1e10(몇 번이든)</span></div>` : '') + '</div>';
      if (g.ipHas('ich')) h += `<div class="rb panel"><h3>무한의 시련</h3><p>규칙을 지킨 채 공허왕을 쓰러뜨리면 클리어.</p>` + INF_CH.map((c) => { const done = s.infChDone.includes(c.id), cur = s.infCh === c.id; return `<div class="perm"><span>${done ? '★ ' : ''}${c.name}</span><button class="btn ${cur ? 'red' : 'rose'}" data-ic="${c.id}" ${(s.infCh && !cur) || done ? 'disabled' : ''}>${cur ? '그만두기' : done ? '완료' : '도전'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">보상:${c.reward}</span></span></div>`; }).join('') + '</div>';
    }
    h += `<div class="rb panel"><h3>환생</h3>
      <p>현재 배율 <span class="big">×${fmt(s.pmL, 1)}</span></p>
      <p>환생하면 <span class="big" id="rbTo"></span>　코어+<span id="rbCore"></span></p>
      <p style="color:var(--mist)">스테이지·골드·링이 초기화된다. 영웅 랭크·도감·미션은 남는다. ×10 이상 오를 때가 기준.</p>
      <button class="btn red" id="bRb" style="width:100%">환생하기</button>
      ${s.perm.autoRb ? `<div class="tog"><span>자동 환생: 배율이</span><button class="small-btn" id="bAutoRb">×${fmt(s.autoRbL, 0)}오르면</button></div>` : ''}</div>`;
    if (g.has('promotion')) {
      h += `<div class="rb panel"><h3>승진</h3><p>환생 배율의 일부를 바쳐 그 링의 위력 ×2와 회전 배율 증가 +15%를 얻는다(인피니티로 초기화).</p>` + RINGS.map((def, i) => !g.on(i) ? '' : `<div class="perm"><span style="color:${def.col}">${def.name} 승진 Lv${s.promo[i]}</span><button class="btn" data-pr="${i}" ${g.canPromote(i) ? '' : 'disabled'}>배율÷${fmt(PROMO.costL(s.promo[i]))}</button><span class="pt">위력×${fmt(s.promo[i] * PROMO.pow)}·증가+${s.promo[i] * 15}%</span></div>`).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>영구 트리　<span style="color:var(--rose)">코어 ${s.core}</span></h3>` + PERM.map((p) => {
        const lv = s.perm[p.id], max = lv >= p.max;
        return `<div class="perm"><span>${p.name} <span style="color:var(--mist)">${p.max > 1 ? `${lv}/${p.max}` : lv ? '완료' : ''}</span></span><button class="btn rose" data-p="${p.id}" ${max || s.core < p.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '코어' + p.cost(lv)}</button><span class="pt">${p.text}</span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>시련</h3><p>제약이 있는 주행. 목표 스테이지에 도달하면 클리어, 영구 보상을 받는다.</p>` + CHALLENGES.map((c) => {
        const done = s.chDone.includes(c.id), cur = s.challenge === c.id;
        return `<div class="perm"><span>${done ? '★ ' : ''}${c.name} <span style="color:var(--mist)">목표${c.goal}</span></span><button class="btn ${cur ? 'red' : 'blue'}" data-ch="${c.id}" ${(s.challenge && !cur) ? 'disabled' : ''}>${cur ? '그만두기' : done ? '재도전' : '도전'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">보상:${c.reward}</span></span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('revolution')) {
      h += `<div class="rb panel"><h3>혁명</h3><p>1회 주행에서 스테이지 300 이상일 때 실행할 수 있다. 환생 배율·코어·영구 트리(자동화 제외)를 버리고 혁명의 기억을 얻는다.</p>
        <p>혁명의 기억 <span class="big">${s.memory}</span>(1개마다 데미지×3·회전 배율 증가 +20%)</p>
        <button class="btn rose" id="bRev" style="width:100%" ${g.canRevolution() ? '' : 'disabled'}>혁명하기(기억+${g.canRevolution() ? g.revolutionGain() : 0})</button></div>`;
    }
    if (g.has('transcend')) {
      h += `<div class="rb panel"><h3>초월</h3><p>기억 6 이상일 때 실행. 모든 것을 버리고 전체 데미지×100·전체 속도 +25%. 최종 세계의 문이 열린다.</p>
        <button class="btn red" id="bTr" style="width:100%" ${g.canTranscend() ? '' : 'disabled'}>초월하기</button></div>`;
    }
    if (s.worlds.length > 1) {
      h += `<div class="rb panel"><h3>세계</h3><div class="worlds">` + s.worlds.map((w) => `<button class="${s.world === w ? 'on' : ''}" data-w="${w}">${WORLDS[w].name}<small>${WORLDS[w].law}　최고${s.worldBest[w] || 0}</small></button>`).join('') + '</div><p style="color:var(--mist)">세계를 옮기면 현재 주행은 초기화된다.</p></div>';
    }
    const R = s.rules;
    const rules = [];
    if (g.has('promotion')) rules.push(`<div class="rule"><span>자동 승진</span><button class="small-btn ${R.autoPromo ? 'on' : ''}" data-rt="autoPromo">${R.autoPromo ? 'ON' : 'OFF'}</button></div>`);
    if (g.ipHas('autoRev')) rules.push(`<div class="rule"><span>자동 혁명: 스테이지</span><input type="number" data-rn="revStage" value="${R.revStage}" min="300" step="50"></div>`);
    if (g.ipHas('autoTr')) rules.push(`<div class="rule"><span>자동 초월</span><button class="small-btn ${R.autoTr ? 'on' : ''}" data-rt="autoTr">${R.autoTr ? 'ON' : 'OFF'}</button></div>`);
    if (g.epHas('autoInf')) rules.push(`<div class="rule"><span>자동 ∞: 획득 포인트(0=OFF)</span><input type="number" data-rn="infGain" value="${R.infGain}" min="0"></div>`);
    if (g.has('eternity')) rules.push(`<div class="rule"><span>자동 영겁: 회랑 스테이지(0=OFF)</span><input type="number" data-rn="eterStage" value="${R.eterStage}" min="0" step="100"></div>`);
    if (rules.length) h += `<div class="rb panel"><h3>자동화 규칙</h3>${rules.join('')}</div>`;
    $('rbBody').innerHTML = h;
    $('rbBody').querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => { if (g.promote(+b.dataset.pr)) this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rt]').forEach((b) => b.addEventListener('click', () => { R[b.dataset.rt] = !R[b.dataset.rt]; this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rn]').forEach((inp) => inp.addEventListener('change', () => { R[inp.dataset.rn] = Math.max(0, parseInt(inp.value, 10) || 0); }));
    $('bRb').addEventListener('click', () => { if (g.rebirth()) { this.buildRebirth(); this.hooks.onSave(); } });
    if ($('bInf')) $('bInf').addEventListener('click', () => this.confirm('인피니티할까?', `인피니티 포인트+${g.ipGain()}. 환생·혁명·초월 진행이 초기화된다.`, () => { g.infinity(); this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-ip]').forEach((b) => b.addEventListener('click', () => { if (g.buyIp(b.dataset.ip)) { this.buildRebirth(); this.toast('무한 강화', IP_UP.find((u) => u.id === b.dataset.ip).text); } }));
    if ($('bIpRep')) $('bIpRep').addEventListener('click', () => { if (g.buyIpRep()) this.buildRebirth(); });
    $('rbBody').querySelectorAll('[data-ic]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.ic; if (s.infCh === id) { g.quitInfCh(); this.buildRebirth(); } else this.confirm('무한의 시련에 도전할까?', '인피니티와 같은 초기화가 일어난다(포인트는 받지 못한다).', () => { g.startInfCh(id); this.buildRebirth(); }); }));
    $('rbBody').querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.ch;
      if (s.challenge === id) this.confirm('시련을 그만둘까?', '지금의 주행은 초기화된다.', () => { g.finishChallenge(false); this.buildRebirth(); });
      else this.confirm('시련에 도전할까?', '현재 주행은 초기화된다(환생 배율과 코어는 잃지 않는다).', () => { g.startChallenge(id); this.buildRebirth(); });
    }));
    $('rbBody').querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { if (g.buyPerm(b.dataset.p)) { this.buildRebirth(); this.applyFeatures(true); } }));
    if ($('bAutoRb')) $('bAutoRb').addEventListener('click', () => { s.autoRbL = (s.autoRbL % 6) + 1; this.buildRebirth(); });
    if ($('bRev')) $('bRev').addEventListener('click', () => this.confirm('혁명할까?', '환생 배율·코어·영구 트리가 사라진다.', () => { g.revolution(); this.buildRebirth(); this.buildRows(); }));
    if ($('bTr')) $('bTr').addEventListener('click', () => this.confirm('초월할까?', '기억·배율·변이가 모두 사라진다.', () => { g.transcend(); this.buildRebirth(); this.buildRows(); }));
    $('rbBody').querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (g.setWorld(+b.dataset.w)) { this.buildRebirth(); this.toast(`${WORLDS[+b.dataset.w].name} 이동`, WORLDS[+b.dataset.w].law); } }));
    this.refreshRebirth();
  }
  refreshRebirth() {
    const g = this.g;
    if (!$('rbTo')) return;
    const can = g.canRebirth();
    $('rbTo').textContent = can ? '×' + fmt(g.rebirthTargetL(), 1) : '(아직 오르지 않음)';
    $('rbCore').textContent = can ? g.rebirthCore() : 0;
    $('bRb').disabled = !can;
  }
  confirm(title, text, fn) {
    this.modal(`<h3>${title}</h3><p>${text}</p><div class="btns"><button class="btn red" id="cfYes">실행</button><button class="btn" data-x>취소</button></div>`);
    this.onOpen = (box) => box.querySelector('#cfYes').addEventListener('click', () => { fn(); this.close(); this.hooks.onSave(); });
  }

  // ---------------- misc ----------------
  menu() {
    const s = this.g.state;
    this.modal(`<h3>메뉴</h3><div class="btns" style="flex-direction:column">
      <button class="btn" id="mSave">저장</button>
      <button class="btn blue" id="mShare">X로 공유</button>
      <button class="btn" id="mLang">Language / 언어</button>
      <button class="btn" id="mNews">공지(v${VERSION})</button>
      <button class="btn" id="mBgm">BGM:${this.hooks.bgm && this.hooks.bgm().on ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mEq">자동 장착:${s.autoEquipOn ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mFx">빛 연출:${s.fxLow ? '약' : '강'}</button>
      <button class="btn" id="mBk">백업에서 복원</button>
      ${this.hooks.debug ? `<button class="btn blue" id="mFast">테스트용 시간×${s.timeScale >= 10 ? 1 : 10}</button>` : ''}
      <button class="btn red" id="mReset">데이터 삭제</button>
      <button class="btn" data-x>닫기</button></div>
      <p style="color:var(--mist)">플레이 시간 ${fnum(s.stats.playTime / 3600, 1)}시간</p>`);
    this.onOpen = (box) => {
      box.querySelector('#mSave').addEventListener('click', () => { this.hooks.onSave(); this.close(); this.toast('저장했다'); });
      if (box.querySelector('#mFast')) box.querySelector('#mFast').addEventListener('click', () => { s.timeScale = s.timeScale >= 10 ? 1 : 10; this.close(); });
      box.querySelector('#mShare').addEventListener('click', () => { this.close(); this.share(); });
      box.querySelector('#mLang').addEventListener('click', () => { this.close(); this.langPicker(); });
      box.querySelector('#mNews').addEventListener('click', () => { this.close(); this.news(false); });
      box.querySelector('#mBgm').addEventListener('click', () => { const b = this.hooks.bgm(); b.setOn(!b.on); b.start(); this.close(); this.toast('BGM ' + (b.on ? 'ON' : 'OFF')); });
      box.querySelector('#mEq').addEventListener('click', () => { s.autoEquipOn = !s.autoEquipOn; this.close(); this.toast('자동 장착 ' + (s.autoEquipOn ? 'ON' : 'OFF')); });
      box.querySelector('#mFx').addEventListener('click', () => { s.fxLow = !s.fxLow; document.getElementById('app').classList.toggle('fxlow', s.fxLow); this.close(); });
      box.querySelector('#mBk').addEventListener('click', () => { this.close(); this.backupPicker(); });
      box.querySelector('#mReset').addEventListener('click', () => { if (confirm('정말 전부 지울까?')) this.hooks.onReset(); });
    };
  }
  mutPicker(ev) {
    const h = RINGS[ev.ring];
    this.modal(`<div class="sub">RING MUTATION</div><h3>링 변이</h3><p><span style="color:${h.col}">${h.name}</span>, 변이 직전. 하나를 골라라.</p><div class="list">${ev.opts.map((m, k) => `<div class="mrow" data-mu="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${m.name}<small>${m.text}</small></div></div>`).join('')}</div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-mu]').forEach((r) => r.addEventListener('click', () => { this.g.chooseMut(+r.dataset.mu); this.close(); }));
  }
  backupPicker() {
    const list = this.hooks.backups();
    this.modal(`<h3>백업</h3><div class="list">${list.length ? list.map((b, k) => `<div class="mrow" data-bk="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${new Date(b.time).toLocaleString('ja-JP')}<small>스테이지${b.stage}·미션${b.missions}</small></div></div>`).join('') : '<p>아직 없음(5분마다 자동 저장)</p>'}</div><div class="btns"><button class="btn" data-x>닫기</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-bk]').forEach((r) => r.addEventListener('click', () => { if (confirm('이 백업으로 되돌릴까? 현재 데이터는 덮어쓰기된다.')) this.hooks.restore(+r.dataset.bk); }));
  }
  offline(r) {
    const h = Math.floor(r.seconds / 3600), m = Math.floor((r.seconds % 3600) / 60);
    this.modal(`<div class="sub">어서 와!</div><h3>${h}시간${m}분</h3><p>그동안에도 링은 돌고 있었다(효율${Math.round(r.eff * 100)}%)<br>스테이지 +${r.stage}　회전 +${fnum(r.laps, 0)}${r.found ? `<br>새 아이템 ${r.found}종` : ''}${r.flux ? `<br>2배속 타임 +${Math.floor(r.flux / 60)}분` : ''}</p><div class="btns">${r.seconds >= 600 ? `<button class="btn blue" id="offAd">${this.g.state.noAds ? '한 번 더 받기' : '광고 보고 2배로 받기'}</button>` : ''}<button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => { const b = box.querySelector('#offAd'); if (b) b.addEventListener('click', async () => { this.close(); const ok = this.g.state.noAds ? true : await this.hooks.monetize().showRewarded(); if (ok) { const r2 = this.g.runOffline(r.seconds); if (r2) this.toast('방치 보상 2배!', `스테이지 +${r2.stage}`); } else this.toast('광고를 불러오지 못했다', '통신 상태나 광고 차단기(AdGuard 등)를 확인해 줘'); }); };
  }
  intro() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>돌려라, 군단</h3><img class="pic" src="px/por_leon.png" width="120" height="120">
      <p>처음엔 검사 레온과 빨강 링뿐.<br>하지만 미션을 클리어할 때마다…</p>
      <div class="teaser"><img src="px/hero_seris.png"><img src="px/hero_elia.png"><img src="px/hero_nox.png"><img src="px/hero_garou.png"><img src="px/hero_sierra.png"></div>
      <div class="teaser-list">·<b>동료가 늘어난다</b>(최대 12명, 링의 움직임이 달라진다)<br>·<b>링이 4색으로</b>, 겹치면 동기 콤보<br>·환생·주간 레이드·도감·우주…<br>　<b>플레이 방식 자체가 계속 늘어난다</b></div>
      <div class="btns"><button class="btn" data-x>시작하기</button></div>`);
  }
  introOld() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>빨강 링</h3><img class="pic" src="px/por_leon.png" width="160" height="160">
      <p><span style="color:var(--lemon)">링을 손가락으로 빙글빙글 돌려라!</span><br>보석이 꼭대기에 온 순간 전장을 탭하면 <span style="color:var(--lemon)">PERFECT</span>!<br>돌릴수록 빨리 회전하고, 공격과 배율(1바퀴×1.01)이 오른다.<br>전장을 탭하면 레온이 벤다.<br>방치해도 진행되지만, 돌리면 더 빠르다.</p><div class="btns"><button class="btn" data-x>시작하기</button></div>`);
  }
  // ---------------- cosmos ----------------
  buildCosmos() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('eternity')) {
      h += `<div class="rb panel"><h3>영겁　<span style="color:var(--pink)">영겁 포인트 ${s.ep}</span></h3><p>무한 회랑 스테이지 300 이상에서 실행. 인피니티 포인트와 무한 강화(영겁의 기억이 있으면 유지)·인피니티 진행이 초기화된다.</p>
        <button class="btn rose" id="bEter" style="width:100%" ${g.canEternity() ? '' : 'disabled'}>${g.canEternity() ? '영겁하기(+' + g.epGain() + ')' : '회랑 스테이지 300에서 해금'}</button></div>`;
      h += '<div class="rb panel"><h3>영겁 강화</h3>' + EP_UP.map((u) => `<div class="perm"><span>${u.name}</span><button class="btn rose" data-ep="${u.id}" ${g.epHas(u.id) || s.ep < u.cost ? 'disabled' : ''}>${g.epHas(u.id) ? '완료' : 'EP' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('') + '</div>';
    }
    if (g.epHas('dil')) {
      h += `<div class="rb panel"><h3>이면 세계　<span style="color:var(--cyan)">결정 ${s.tp || 0}</span></h3><p>링이 거꾸로 삐걱이는 뒤집힌 세계. 데미지 지수가 작아진다. 멀리 갈수록 결정이 늘어난다. 드나들 때 인피니티와 같은 초기화가 일어난다.</p>
        <button class="btn ${s.dilOn ? 'red' : 'blue'}" id="bDil" style="width:100%">${s.dilOn ? '이면 세계에서 나가기(결정+' + g.dilGain() + ')' : '이면 세계에 들어가기'}</button>`
        + DIL_UP.map((u) => { const lv = g.dl(u.id), max = u.max && lv >= u.max; return `<div class="perm"><span>${u.name} Lv${lv}</span><button class="btn blue" data-dl="${u.id}" ${max || (s.tp || 0) < u.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '결정' + u.cost(lv)}</button><span class="pt">${u.text}</span></div>`; }).join('') + '</div>';
    }
    if (false) {
      h += `<div class="rb panel"><h3>별자리판　${s.zodiac.length}/${s.zslots}</h3><p>업적 수에 따라 별자리가 열린다. 최대${s.zslots}개 장착.</p><div class="zgrid">`
        + ZODIAC.map((z) => { const open = g.zodiacOpen(z.id), on = s.zodiac.includes(z.id); return `<button class="${on ? 'on' : open ? '' : 'lock'}" data-z="${z.id}">${open ? z.name : '???'}<small>${open ? z.text : '업적' + z.need}</small></button>`; }).join('') + '</div></div>';
    }
    if (g.has('minerals')) {
      h += `<div class="rb panel"><h3>작전 카드　<span style="color:var(--rose)">흑광 ${s.ores.black || 0}</span>　${s.deck.length}/${s.cslots}장</h3><p><small style="color:var(--lemon)">배출률: 전${CARDS.length}종 각${(100 / CARDS.length).toFixed(1)}%(레어도 없음)</small><br>흑광 1개로 1장 뽑는다. 같은 카드는 겹쳐서 Lv 업(최대 10). 장착 중인 카드만 효과가 있다. 레이드 보상으로도 받을 수 있다.</p>
        <button class="btn rose" id="bCard" style="width:100%" ${(s.ores.black || 0) < 1 ? 'disabled' : ''}>카드 뽑기</button>
        <div class="cards" style="margin-top:6px">${CARDS.map((c) => { const lv = s.cards[c.id] || 0, on = s.deck.includes(c.id); return `<button class="${on ? 'on' : lv ? '' : 'lock'}" data-cd="${c.id}">${lv ? c.name + ' Lv' + lv : '???'}<small>${lv ? c.text : '미획득'}</small></button>`; }).join('')}</div></div>`;
      h += '<div class="rb panel"><h3>광석과 대장간</h3><div class="ores">' + ORES.map((o) => `<span style="color:${o.col}">${o.name} <b>${s.ores[o.id] || 0}</b></span>`).join('') + '</div><p>장착 중인 아이템을 정련한다(1단마다 위력 +50%, 최대 10단).</p>'
        + Object.keys(HEROES).map((hid) => { const id = s.equip[hid]; if (!id || !g.on(HEROES[hid].ring)) return ''; const it = ITEMS.find((x) => x.id === id), c = g.refineCost(id), ore = ORES.find((o) => o.id === c.ore); return `<div class="perm"><span>${it.name} +${c.lv}</span><button class="btn" data-rf="${id}" ${c.lv >= 10 || (s.ores[c.ore] || 0) < c.n ? 'disabled' : ''}>${c.lv >= 10 ? 'MAX' : ore.name + c.n}</button><span class="pt">${HEROES[hid].name} 장비</span></div>`; }).join('') + '</div>';
    }
    $('cosBody').innerHTML = h || '<p class="note">혁명하면 우주의 문이 열린다.</p>';
    const re = () => this.buildCosmos();
    if ($('bEter')) $('bEter').addEventListener('click', () => this.confirm('영겁할까?', '인피니티 포인트와 인피니티 진행이 초기화된다.', () => { g.eternity(); re(); }));
    $('cosBody').querySelectorAll('[data-ep]').forEach((b) => b.addEventListener('click', () => { if (g.buyEp(b.dataset.ep)) re(); }));
    if ($('bDil')) $('bDil').addEventListener('click', () => { if (s.dilOn) this.confirm('왜곡에서 나갈까?', '결정+' + g.dilGain() + '. 초기화가 일어난다.', () => { g.endDilation(); re(); }); else this.confirm('시간 왜곡에 들어갈까?', '인피니티와 같은 초기화가 일어난다.', () => { g.startDilation(); re(); }); });
    $('cosBody').querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => { if (g.buyDil(b.dataset.dl)) re(); }));
    $('cosBody').querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { if (g.toggleZodiac(b.dataset.z)) re(); }));
    if ($('bCard')) $('bCard').addEventListener('click', () => g.drawCard());
    $('cosBody').querySelectorAll('[data-cd]').forEach((b) => b.addEventListener('click', () => { if (g.toggleCard(b.dataset.cd)) re(); }));
    $('cosBody').querySelectorAll('[data-rf]').forEach((b) => b.addEventListener('click', () => { if (g.refineItem(b.dataset.rf)) { this.toast('정련 성공!'); re(); } }));
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
      const tag = left > 0 ? `<span class="tag">남은${Math.floor(left / 3600000)}시간${Math.floor(left / 60000) % 60}분</span>` : '';
      return `<div class="mrow">${p.skin ? sw(p.skin) : ''}<div style="flex:1">${p.name}${tag}<small>${p.text}</small></div><button class="btn" data-buy="${p.id}" ${dis ? 'disabled' : ''}>${dis ? '구매 완료' : m.price(p)}</button></div>`;
    };
    const list = (cat) => SHOP.filter((p) => p.cat === cat && vis(p)).map(row).join('');
    let body = '';
    if (tab === 'top') {
      const c = g.passClaimable();
      body = `<div class="mrow"><div style="flex:1">레기온 패스　단 ${g.passTier()}/30<small>${c ? `받을 수 있는 보상이${c}개!` : `시즌 남은 기간${g.passDaysLeft()}일·플레이할수록 단이 오른다`}</small></div><button class="btn blue" data-tab="pass">보기</button></div>`;
      if (g.monthLeft() > 0) body += `<p class="note">월간 패스 활성: 남은${g.monthLeft()}일</p>`;
      body += list('top');
    } else if (tab === 'pass') {
      const t = g.passTier(), p = s.pass, c = g.passClaimable();
      let rows = '';
      for (let k = 1; k <= 30; k++) rows += `<div class="prow ${k <= t ? 'got' : ''}"><b>${k}</b><span>${g.passReward('free', k).text}${k <= p.cf ? ' ✓' : ''}</span><span class="pr">${g.passReward('prem', k).text}${p.premium && k <= p.cp ? ' ✓' : ''}</span></div>`;
      body = `<div class="passhead">시즌 남은 기간${g.passDaysLeft()}일　단 <b>${t}</b>/30<i class="pbar"><b style="width:${t >= 30 ? 100 : p.xp % 100}%"></b></i><small>플레이 1분마다 +1·매일 로그인 +50·미션 달성 +30(100마다 1단)</small></div>
        <div class="btnrow"><button class="btn" id="passClaim" ${c ? '' : 'disabled'}>한꺼번에 받기${c ? '(' + c + ')' : ''}</button>${p.premium ? '<span class="tag">프리미엄 활성</span>' : `<button class="btn rose" data-buy="rl_pass">프리미엄 ${m.price(SHOP.find((x) => x.id === 'rl_pass'))}</button>`}</div>
        <div class="prow head"><b>단</b><span>무료</span><span class="pr">프리미엄</span></div>${rows}`;
    } else if (tab === 'look') {
      const mine = ['', ...Object.keys(RING_SKINS).filter((k) => (s.skins || []).includes(k))];
      body = '<p class="note">링 스킨(외형만·강함은 그대로)</p>' + mine.map((id) => `<div class="mrow">${sw(id)}<div style="flex:1">${id ? RING_SKINS[id].name : '기본'}</div><button class="btn blue" data-skin="${id}" ${(s.skin || '') === id ? 'disabled' : ''}>${(s.skin || '') === id ? '사용 중' : '사용'}</button></div>`).join('')
        + '<p class="note">구매</p>' + list('look');
    } else if (tab === 'item') {
      body = list('item');
    } else {
      body = AD_REWARDS.filter((a) => !a.need || g.has(a.need)).map((a) => { const left = g.adLeft(a.id, today); return `<div class="mrow"><div style="flex:1">${a.name}<small>오늘 남은${left}회</small></div><button class="btn blue" data-ad="${a.id}" ${left <= 0 ? 'disabled' : ''}>${s.noAds || m.web ? '받기' : '광고 보기'}</button></div>`; }).join('')
        + '<p class="note">매일 로그인: 2배속 타임 1시간(연속 로그인 시 환생 코어도)<br>방치 후 돌아왔을 때도 광고로 보상 2배</p>';
    }
    const TABS = [['top', '혜택'], ['pass', '패스'], ['look', '외형'], ['item', '도구'], ['free', '무료']];
    const cap = g.spendCap();
    box.innerHTML = `<h3>상점</h3>${m.web ? '<p style="color:var(--cyan)">브라우저판: 무료 보너스는 광고 없이 받을 수 있다. 구매는 Android 앱판에서</p>' : m.native ? '' : '<p style="color:var(--pink)">브라우저판은 테스트 모드(결제는 발생하지 않습니다)</p>'}
      <div class="tabs">${TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}${k === 'pass' && g.passClaimable() ? '!' : ''}</button>`).join('')}</div>
      <div class="list">${body}</div>
      <p class="legal">이번 달 구매 ¥${g.spentThisMonth().toLocaleString()}${cap < Infinity ? ` / 상한 ¥${cap.toLocaleString()}` : ''}　클리어에 과금은 필요 없음</p>
      <div class="btns"><button class="btn blue" id="bHist">구매 내역·설정</button>${m.native ? '<button class="btn blue" id="bRestore">복원</button>' : ''}<button class="btn" id="bShopX">닫기</button></div>`;
    box.querySelector('#bShopX').addEventListener('click', () => this.close());
    box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.drawShop(box, b.dataset.tab)));
    box.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => this.buyFlow(b.dataset.buy)));
    box.querySelectorAll('[data-skin]').forEach((b) => b.addEventListener('click', () => { s.skin = b.dataset.skin; this.drawShop(box, tab); }));
    const pc = box.querySelector('#passClaim');
    if (pc) pc.addEventListener('click', () => { const n = g.claimPass(); this.toast('패스 보상을 받았다', n + '개'); this.hooks.onSave && this.hooks.onSave(); this.drawShop(box, tab); });
    box.querySelectorAll('[data-ad]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.ad;
      this.close();
      const ok = s.noAds ? true : await m.showRewarded();
      if (ok && g.adReward(id, today)) this.toast('보너스를 받았다', AD_REWARDS.find((a) => a.id === id).name);
      else if (!ok) this.toast('광고를 불러오지 못했다', '통신 상태나 광고 차단기(AdGuard 등)를 확인해 줘');
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
      this.modal(`<div class="sub">구매할 수 없습니다</div><h3>이번 달 상한</h3><p>${AGE_BANDS[s.ageBand].name} 이용자의 월 상한은 ¥${g.spendCap().toLocaleString()} 입니다.<br>이번 달 남은 구매 가능 금액은 ¥${Math.max(0, g.spendCap() - g.spentThisMonth()).toLocaleString()} 입니다.<br>다음 달 1일에 초기화됩니다.</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
      return;
    }
    this.hooks.monetize().buy(id);
  }
  ageGate(next) {
    this.close();
    this.modal(`<div class="sub">첫 구매 전에</div><h3>연령을 선택해 주세요</h3><p>미성년자는 1개월 구매 금액에 상한이 있습니다.<br>18세 미만은 보호자의 동의를 받은 후 구매해 주세요.</p><div class="btns col">${Object.entries(AGE_BANDS).map(([k, b]) => `<button class="btn" data-age="${k}">${b.name}${b.cap < Infinity ? `(월 ¥${b.cap.toLocaleString()}까지)` : ''}</button>`).join('')}<button class="btn red" data-x>취소</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => { this.g.state.ageBand = b.dataset.age; this.hooks.onSave && this.hooks.onSave(); next(); }));
  }
  purchaseInfo() {
    const g = this.g, s = g.state, list = (s.purchases || []).slice().reverse();
    const rows = list.length ? list.map((x) => { const d = new Date(x.t); return `<div class="mrow"><span style="color:var(--mist)">${d.getMonth() + 1}/${d.getDate()}</span><div style="flex:1">${x.name}</div><span>¥${x.yen.toLocaleString()}</span></div>`; }).join('') : '<p class="note">아직 구매 내역이 없습니다</p>';
    const band = AGE_BANDS[s.ageBand];
    this.modal(`<h3>구매 내역</h3><p>이번 달 ¥${g.spentThisMonth().toLocaleString()}${band && band.cap < Infinity ? ` / 상한 ¥${band.cap.toLocaleString()}` : ''}<br>연령 설정:${band ? band.name : '미설정'}</p><div class="list">${rows}</div>
      <p class="legal">·유료 재화는 없습니다(상품을 직접 구매)<br>·작전 카드 배출률: 전${CARDS.length}종 각${(100 / CARDS.length).toFixed(1)}%<br>·전부 모아도 특별한 보상은 없습니다<br>·환불은 Google Play 환불 정책에 따릅니다<br>·게임 클리어에 과금은 필요하지 않습니다</p>
      <div class="btns"><button class="btn blue" id="bAge">연령 설정 변경</button><button class="btn" data-x>닫기</button></div>`);
    this.onOpen = (box) => box.querySelector('#bAge').addEventListener('click', () => this.ageGate(() => { this.close(); this.purchaseInfo(); }));
  }
  fakeAd() {
    return new Promise((res) => {
      this.modal(`<div class="sub">테스트 광고</div><div class="fake-ad" id="fakeAd">광고(테스트) 3</div><p>실제 Android판에서는 여기에 AdMob 동영상 광고가 들어간다.</p>`);
      this.onOpen = (box) => {
        let n = 3;
        const iv = setInterval(() => { n--; const el = box.querySelector('#fakeAd'); if (el) el.textContent = n > 0 ? '광고(테스트) ' + n : '보상 GET!'; if (n <= 0) { clearInterval(iv); setTimeout(() => { this.close(); res(true); }, 400); } }, 1000);
      };
    });
  }
  testPurchase(p) {
    return new Promise((res) => {
      this.modal(`<div class="sub">테스트 구매</div><h3>${p.name}</h3><p>${p.text}<br>실제 가격 ${p.price}<br><span style="color:var(--pink)">테스트 모드라서 결제는 발생하지 않습니다.</span></p><div class="btns"><button class="btn" id="tpYes">받기</button><button class="btn red" id="tpNo">취소</button></div>`);
      this.onOpen = (box) => {
        box.querySelector('#tpYes').addEventListener('click', () => { this.close(); res(true); });
        box.querySelector('#tpNo').addEventListener('click', () => { this.close(); res(false); });
      };
    });
  }

  daily(r) {
    this.modal(`<div class="sub">LOGIN BONUS</div><h3>${r.streak}일째</h3><p>2배속 타임 +1시간${r.core ? `<br>환생 코어 +${r.core}` : ''}${r.month ? `<br><span style="color:var(--lemon)">월간 패스: 2배속 타임+1시간·코인(남은${r.month}일)</span>` : ''}<br><span style="color:var(--mist)">${this.g.has('autoBuy') ? '링 옆 \'2배속\' 버튼으로 게임이 2배속이 된다' : '스테이지 40에서 사용할 수 있다(모아둘 수 있다)'}</span></p><div class="btns"><button class="btn" data-x>받기</button></div>`);
  }
  appOnly() {
    this.close();
    this.modal(`<div class="sub">브라우저판</div><h3>구매는 앱판에서</h3><p>브라우저판은 무료로 그대로 즐길 수 있어요.<br>아이템 구매는 Android 앱판(Google Play)에서 할 수 있어요.</p><div class="btns"><button class="btn" id="bPlay">Google Play에서 보기</button><button class="btn red" data-x>닫기</button></div>`);
    this.onOpen = (box) => box.querySelector('#bPlay').addEventListener('click', () => { openUrl(PLAY_URL); this.close(); });
  }
  share() {
    const g = this.g, s = g.state;
    const text = `REVOLUTION LEGION에서 스테이지${s.stats.bestStage} 도달! 배율×${fmt(g.totalMultL(), 1)}`;
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
    this.modal(`<div class="sub">${onlyNew ? 'UPDATE' : '공지'}</div><h3>${onlyNew ? '업데이트했습니다' : '업데이트 내역'}</h3><div class="list" style="text-align:left">${list.map((u) => `<p class="note"><b style="color:var(--lemon)">v${u.v}</b>(${u.date})${u.title}<br>${u.items.map((x) => '·' + x).join('<br>')}</p>`).join('')}</div><p style="color:var(--cyan)">${NEXT_CHAPTER}</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
  trueEnding() {
    this.modal(`<div class="sub">TRUE END</div><h3>회랑의 끝</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>무한 회랑 1000층에서 링은 하나의 고리가 되었다.<br>플레이 시간 ${fnum(this.g.state.stats.playTime / 3600, 1)}시간<br><span style="color:var(--cyan)">하지만 이야기는 아직 끝나지 않았다.</span><br>${NEXT_CHAPTER}<br>그때까지는 회랑 기록 갱신과 레이드로 실력을 갈고닦자.</p><div class="btns"><button class="btn blue" id="bShareEnd">X로 공유</button><button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => box.querySelector('#bShareEnd').addEventListener('click', () => this.share());
  }
  ending() {
    this.modal(`<div class="sub">THE END</div><h3>공허왕을 쓰러뜨렸다</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>돌고 돌던 링은 마침내 세계의 끝에 닿았다.<br>플레이 시간 ${fnum(this.g.state.stats.playTime / 3600, 1)}시간<br>하지만 ∞ 너머에도 세계는 이어진다.<br><span style="color:var(--cyan)">환생 화면에서 인피니티가 해금되었다.</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
}
void IMG;
