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
    $('chBar').addEventListener('click', () => this.confirm('放弃试炼？', '当前周回将被重置。', () => this.g.finishChallenge(false)));
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
        wrap.insertAdjacentHTML('beforeend', `<div class="row ghost" style="--c:${def.col}"><div class="por" style="--c:var(--steel)"><img class="px" src="px/pors_${def.hero}.png" style="filter:brightness(0)"></div><div>？？？　完成任务解锁</div></div>`);
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
    } else { $('mId').textContent = '★'; $('mName').textContent = '全部任务达成！'; $('mProg').textContent = ''; $('mBar').style.width = '100%'; }

    $('tapHint').classList.toggle('hide', (s.stats.taps || 0) >= 15 || this.scr !== 'battle');
    $('ringHint').classList.toggle('hide', (s.stats.spun || 0) >= 3);
    const e = g.enemy;
    const tr = e.trait && TRAITS[e.trait];
    $('ename').innerHTML = tr ? `<span style="color:${tr.col}">【${tr.name}】</span>${e.n}<small>${tr.tip}</small>` : e.n;
    $('ename').className = e.boss ? 'boss' : '';
    const chal = s.challenge && CHALLENGES.find((c) => c.id === s.challenge);
    $('chBar').classList.toggle('hide', !chal && !s.dilOn && !g.raid);
    if (g.raid) $('chBar').innerHTML = `突袭「${g.raid.rule.name}」剩余${Math.ceil(g.raid.t)}秒　伤害 ${fmt(g.raid.dmgL)}`;
    if (s.dilOn && !chal && !g.raid) $('chBar').innerHTML = `里世界（伤害指数×${(0.75 + 0.02 * g.dl('d_soft')).toFixed(2)}）　退出可得结晶+${g.dilGain()}`;
    if (chal && !g.raid) $('chBar').innerHTML = `试炼中：${chal.name}（${chal.rule}）　${Math.min(s.runBest, chal.goal)}/${chal.goal}　<u>放弃</u>`;
    $('btnAutoBuy').textContent = s.autoBuyOn ? '自动强化' : '手动强化';
    $('btnFlux').classList.toggle('hide', !s.features.autoBuy || !(s.flux > 0 || s.fluxOn));
    $('btnFlux').classList.toggle('on', !!s.fluxOn);
    { const f = Math.floor(s.flux || 0), h = Math.floor(f / 3600), mm = Math.floor((f % 3600) / 60); $('btnFlux').textContent = `2倍速 ${h}:${String(mm).padStart(2, '0')}`; }
    $('btnAutoBuy').classList.toggle('on', s.autoBuyOn);
    $('sDps').textContent = fmt(g.dpsL(), 1);
    $('sRps').textContent = fnum(g.active().reduce((a, i) => a + g.rps(i), 0), 2);
    $('sSync').textContent = Math.round(g.syncRate() * 100) + '%';
    $('burstBar').style.width = (s.od > 0 ? (s.od / 10) * 100 : s.burst) + '%';
    $('burst').classList.toggle('ready', s.burst >= 100 && s.od <= 0);
    $('burst').classList.toggle('od', s.od > 0);
    $('btnFast').textContent = s.autoBurst ? 'AUTO' : '手动';
    $('dexBadge').classList.toggle('hide', !(s.unseenItems > 0));
    $('btnShop').classList.toggle('alert', g.passClaimable() > 0 || SHOP.some((p) => p.offer && g.offerLeft(p.id) > 0 && !(s.owned || []).includes(p.id)));
    $('dexBadge').textContent = s.unseenItems > 9 ? '9+' : s.unseenItems || '';
    $('btnFast').classList.toggle('on', s.autoBurst);

    RINGS.forEach((def, i) => {
      if (!g.on(i) || !$('rLv' + i)) return;
      const r = s.rings[i], cap = g.cap(i);
      $('rLv' + i).innerHTML = `Lv${r.lv}/${cap}`;
      $('rAsc' + i).textContent = r.asc ? '★' + r.asc : '';
      $('rLap' + i).textContent = `圈倍率 ×${fmt(r.lapL)}`;
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
          <p>${h.name}晋升！<br>伤害×${RANKS[ev.rankUp].mult}${ev.rankUp === 3 && h.ring === 0 ? '<br>斩击增加了！' : ''}</p>
          <div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast('飞升！', `${RINGS[ev.ring].name} 上限Lv${g.cap(ev.ring)}·倍率增长+5%`);
        return;
      }
      case 'drop': this.dropCard(ev); return;
      case 'bossfail': this.toast('没能击败Boss', '蓄力45秒后再次挑战'); return;
      case 'rebirth': this.toast(`转生！ 倍率 ×${fmt(g.state.pmL, 1)}`, `核心 +${ev.core}`); this.buildRows(); return;
      case 'clear': if (ev.first) this.ending(); else this.toast('击败了虚无王！', '可在转生界面进行无限'); return;
      case 'infinity': this.toast(`无限！ 无限点数+${ev.gain}`); this.buildRows(); return;
      case 'infChStart': this.toast(`无限试炼「${INF_CH.find((c) => c.id === ev.id).name}」开始`, INF_CH.find((c) => c.id === ev.id).rule); this.show('battle'); return;
      case 'infChClear': { const c = INF_CH.find((x) => x.id === ev.id); this.modal(`<div class="sub">INFINITY CHALLENGE</div><h3>${c.name}</h3><p>永久奖励：<span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'unit': this.unitStamp(ev.u); return;
      case 'recruit': { const h = HEROES[ev.id]; this.modal(`<div class="sub">NEW HERO</div><h3>${h.name}</h3><img class="pic" src="px/por_${ev.id}.png" width="160" height="160"><p>${h.job}加入了军团！<br>${h.line}<br><span style="color:var(--lemon)">可在军团界面配置到环上</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`); return; }
      case 'card': if (!ev.free) this.toast(`作战卡「${ev.card.name}」Lv${ev.lv}`, ev.card.text); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'raidStart': this.toast(`突袭开始「${ev.rule.name}」`, ev.rule.text); this.show('battle'); return;
      case 'raidEnd': { const T = ['无评价', '铜', '银', '金', '彩虹']; this.modal(`<div class="sub">RAID RESULT</div><h3>${T[ev.tier]}</h3><p>伤害 ${fmt(ev.score)}${ev.suspicious ? '<br><span style="color:var(--red)">记录异常，无效</span>' : ev.gained ? `<br>徽章+${ev.gained}·作战卡×${ev.gained * 2}` : '<br>本周已无更多奖励'}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'heroes') this.buildHeroes(); return; }
      case 'feature': { const f = FEATURE_INFO[ev.id]; if (f) this.modal(`<div class="sub">NEW</div><h3>${f[0]}</h3><p>${f[1]}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); this.applyFeatures(true); return; }
      case 'tarot': this.modal(`<div class="sub">TAROT</div><h3>${ev.card.name}</h3><p>${ev.result}</p><div class="btns"><button class="btn" data-x>OK</button></div>`); if (this.scr === 'cosmos') this.buildCosmos(); return;
      case 'eternity': this.toast(`永劫！ 永劫点数+${ev.gain}`); this.buildRows(); return;
      case 'dilStart': this.toast('进入里世界', '伤害会减弱。走得越远，结晶越多'); this.show('battle'); return;
      case 'dilEnd': this.toast(`退出里世界 结晶+${ev.gain}`); return;
      case 'blackOre': this.toast('发现了黑矿！', '可在宇宙标签抽塔罗牌'); return;
      case 'grant': this.toast('已领取', (SHOP.find((p) => p.id === ev.id) || {}).name || ''); return;
      case 'ach': this.toast(`★成就「${ev.ach.name}」 ×1.05`); return;
      case 'mutChoice': return this.mutPicker(ev);
      case 'mutation': this.toast(`环变异！ ${ev.mutation.name}`, ev.mutation.text); return;
      case 'challengeEnd': {
        const c = CHALLENGES.find((x) => x.id === ev.id);
        if (ev.success) this.modal(`<div class="sub">CHALLENGE CLEAR</div><h3>${c.name}</h3><p>永久奖励：<span style="color:var(--lemon)">${c.reward}</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
        else this.toast(`${c.name}已放弃`);
        this.buildRows();
        return;
      }
      case 'challengeStart': this.toast(`${CHALLENGES.find((x) => x.id === ev.id).name} 开始`, CHALLENGES.find((x) => x.id === ev.id).rule); this.buildRows(); this.show('battle'); return;
    }
  }

  onMission(m) {
    const rw = m.reward;
    this.applyFeatures(true);
    if (rw.ring !== undefined || rw.feature || rw.world !== undefined) {
      const info = rw.feature && FEATURE_INFO[rw.feature];
      const pic = rw.ring !== undefined ? `<img class="pic" src="px/${HEROES[RINGS[rw.ring].hero].portrait}.png" width="160" height="160">` : '';
      this.modal(`<div class="sub">MISSION CLEAR ${m.id}</div><h3>${rw.ring !== undefined ? '新伙伴' : '已解锁！'}</h3>${pic}
        <p>${m.name}<br><span style="color:var(--lemon)">${rw.text}</span>${info ? `<br>${info[1]}` : ''}</p>
        <p>永久加成 ×${this.g.state.missions.length + 1}</p>
        <div class="btns"><button class="btn" data-x>OK</button></div>`);
    } else this.toast(`任务达成 ${m.id}`, rw.text);
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
      <div class="sub">${h.name}专用${it.fxText ? '·' + it.fxText : ''}</div>
      ${ev.better ? `<div class="bt"><button class="btn" id="dcEq">装备（×${fnum(Math.pow(10, ev.before), 1)}→×${fnum(Math.pow(10, ev.after), 1)}）</button><button class="btn red" id="dcNo">稍后</button></div>` : ''}`;
    el.classList.remove('hide');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    const hide = () => el.classList.add('hide');
    if (ev.better) {
      el.querySelector('#dcEq').addEventListener('click', (e) => { e.stopPropagation(); g.equipItem(ev.hid, it.id); this.toast(`${h.name}装备了${it.name}`); hide(); });
      el.querySelector('#dcNo').addEventListener('click', (e) => { e.stopPropagation(); hide(); });
      el.addEventListener('pointerdown', (e) => e.stopPropagation(), { once: false });
    }
    this._dropT = setTimeout(hide, ev.better ? 9000 : 4000);
  }

  unitStamp(u) {
    const el = $('stamp');
    el.innerHTML = `<b>${UNITS[u]}</b><span>达成！</span><small>单位加成 全伤害×1.15</small>`;
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
    this.modal(`<div class="sub">永久加成 ×${s.missions.length + 1}（转生后也不会消失）</div><h3>任务</h3><div class="list">${rows}</div><div class="btns"><button class="btn" data-x>关闭</button></div>`);
  }

  // ---------------- heroes ----------------
  buildHeroes() {
    const g = this.g, s = g.state;
    // weekly raid panel
    if (g.has('raid')) {
      const wk = this.hooks.week(), rule = RAID_RULES[((wk.no % RAID_RULES.length) + RAID_RULES.length) % RAID_RULES.length], R = s.raid, cur = R.week === wk.key ? R.weekTier : 0;
      $('raidBox').innerHTML = `<div class="rb panel"><h3>每周突袭「${rule.name}」</h3><p>${rule.text}<br>60秒内能打出多少伤害。目标是当前攻击力×60秒。</p>
        <div class="tierbar">${['铜', '银', '金', '彩虹'].map((t, k) => `<span class="${cur > k ? 'got' : ''}">${t}</span>`).join('')}</div>
        <p>徽章 ${R.tokens}（累计${R.tokensTotal}）　个人最佳 ${R.best ? fmt(R.best) : '-'}</p>
        <button class="btn red" id="bRaid" style="width:100%" ${g.raid ? 'disabled' : ''}>${g.raid ? '挑战中' : '挑战（可无限次）'}</button></div>`;
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
          <div class="ln">${on ? h.line : '通过任务成为伙伴'}</div>
          <div class="ln">累计飞升 ${s.stats.ascTotal[i]}${next ? `（距${next.id}还需${next.need}）` : '（最高段位）'}</div>
          ${on && g.has('items') ? `<div class="equip"><span class="slot" style="--rc:${it ? RARITY[it.rar].col : ''}">${it ? `<img class="px" src="px/${it.id}.png">` : ''}</span><span>${it ? `${it.name} Lv${g.itemLevel(it.id)}` : '未装备'}</span><button class="small-btn" data-eq="${id}">更换</button></div>` : ''}
        </div></div>`;
    }).join('');
    $('heroList').querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => this.equipPicker(b.dataset.eq)));
    $('heroList').querySelectorAll('[data-lu]').forEach((b) => b.addEventListener('click', () => { const [i, id] = b.dataset.lu.split(':'); if (g.setLineup(+i, id)) { this.buildHeroes(); this.buildRows(); } }));
  }
  equipPicker(hid) {
    const g = this.g, s = g.state, type = HEROES[hid].type;
    const own = ITEMS.filter((it) => it.type === type && s.items[it.id]);
    this.modal(`<div class="sub">${HEROES[hid].name}的装备</div><div class="list">${own.map((it) => `<div class="mrow" data-pick="${it.id}" style="cursor:pointer"><span class="slot" style="--rc:${RARITY[it.rar].col}"><img class="px" src="px/${it.id}.png"></span><div>${it.name} <span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> Lv${g.itemLevel(it.id)}<small>×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)} ${it.fxText}</small></div></div>`).join('') || '<p>尚未持有</p>'}</div><div class="btns"><button class="btn" data-x>关闭</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-pick]').forEach((r) => r.addEventListener('click', () => { s.equip[hid] = r.dataset.pick; this.close(); this.buildHeroes(); }));
  }

  // ---------------- dex ----------------
  buildDex() {
    const g = this.g, s = g.state;
    s.unseenItems = 0;
    if (!$('dexTabs')) {
      $('scr-dex').insertAdjacentHTML('afterbegin', '<div id="dexTabs" class="tabs"><button class="small-btn on" data-t="items">图鉴</button><button class="small-btn" data-t="ach">成就</button></div><div id="achList" class="hide"></div>');
      $('dexTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { this.dexTab = b.dataset.t; this.buildDex(); }));
    }
    const achTab = this.dexTab === 'ach';
    $('dexTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === (achTab ? 'ach' : 'items')));
    ['dexGrid', 'dexInfo', 'dexNote'].forEach((id) => $(id).classList.toggle('hide', achTab));
    $('scr-dex').querySelector('h2').classList.toggle('hide', achTab);
    $('achList').classList.toggle('hide', !achTab);
    if (achTab) {
      $('achList').innerHTML = `<p class="note">成就 ${s.ach.length}/${ACHIEVEMENTS.length}　全伤害×${fnum(Math.pow(1.05, s.ach.length), 2)}</p>` + ACHIEVEMENTS.map((a) => {
        const done = s.ach.includes(a.id), hide = a.secret && !done;
        return `<div class="mrow ${done ? '' : 'done'}"><span class="id">${done ? '★' : '·'}</span><div>${hide ? '？？？（隐藏成就）' : a.name}<small>${hide ? '条件保密' : a.desc}</small></div></div>`;
      }).join('');
      return;
    }
    $('dexCount').textContent = `${s.found.length}/${ITEMS.length}`;
    $('dexNote').textContent = g.has('dexBonus') ? `图鉴加成 全伤害×${fmt(g.dexL(), 1)}` : '发现的道具会被记录';
    $('dexGrid').innerHTML = ITEMS.map((it) => {
      const own = s.items[it.id];
      return `<div class="cell ${own ? '' : 'unk'} ${this.dexSel === it.id ? 'sel' : ''}" data-it="${it.id}" style="--rc:${own ? RARITY[it.rar].col : ''}"><img class="px" src="px/${it.id}.png">${own ? `<span class="lv">${g.itemLevel(it.id)}</span>` : ''}</div>`;
    }).join('');
    $('dexGrid').querySelectorAll('[data-it]').forEach((c) => c.addEventListener('click', () => { this.dexSel = c.dataset.it; this.buildDex(); }));
    const it = this.dexSel && ITEMS.find((x) => x.id === this.dexSel);
    if (!it) { $('dexInfo').innerHTML = '点击道具可查看详情'; return; }
    const own = s.items[it.id];
    const hid = Object.keys(HEROES).find((h) => HEROES[h].type === it.type);
    $('dexInfo').innerHTML = own
      ? `<span style="color:${RARITY[it.rar].col}">${RARITY[it.rar].id}</span> ${it.name}　Lv${g.itemLevel(it.id)}（${own}个）<br>${HEROES[hid].name}专用　伤害×${fnum(Math.pow(10, g.itemMultL(it.id)), 1)}<br>${it.fxText || '　'}`
        + (s.equip[hid] === it.id ? '<br><span style="color:var(--leaf)">装备中</span>' : g.on(HEROES[hid].ring) ? `<br><button class="btn" id="dexEq">装备</button>` : '')
      : '？？？　尚未发现';
    const b = $('dexEq');
    if (b) b.addEventListener('click', () => { s.equip[hid] = it.id; this.buildDex(); });
  }

  // ---------------- lab ----------------
  buildLab() {
    const g = this.g, s = g.state;
    if (!this.labView) this.labView = new RingView($('lcv'), null, g, 144);
    const rows = g.active().map((i) => `<div class="lrow" style="--c:${RINGS[i].col}"><span style="color:${RINGS[i].col}">${RINGS[i].name}</span><input type="range" min="10" max="100" value="${Math.round(s.rings[i].throttle * 100)}" id="th${i}" ${s.autoTune ? 'disabled' : ''}><span class="v" id="thv${i}"></span></div>`).join('');
    $('labRows').innerHTML = `<div class="panel">${rows}
      ${g.has('autotune') ? `<div class="tog"><span>自动调谐</span><button class="small-btn ${s.autoTune ? 'on' : ''}" id="tTune">${s.autoTune ? 'ON' : 'OFF'}</button></div>` : ''}
      <div class="tog"><span>对齐速度比</span><button class="btn" id="tNow">调整</button></div></div>
      <div class="panel" style="margin-top:6px" id="labStats"></div>`;
    g.active().forEach((i) => $('th' + i).addEventListener('input', (e) => { g.setThrottle(i, e.target.value / 100); this.refreshLab(); }));
    if ($('tTune')) $('tTune').addEventListener('click', () => { s.autoTune = !s.autoTune; if (s.autoTune) g.autoTuneRings(); this.buildLab(); });
    $('tNow').addEventListener('click', () => { g.autoTuneRings(); this.buildLab(); this.toast('速度比已对齐'); });
    this.refreshLab();
  }
  refreshLab() {
    const g = this.g, s = g.state;
    g.active().forEach((i) => { const v = $('thv' + i); if (v) v.textContent = fnum(g.rps(i), 2) + '/秒'; });
    const st = $('labStats');
    if (st) st.innerHTML = `同步率 <span style="color:var(--lemon)">${Math.round(g.syncRate() * 100)}%</span><br>`
      + [2, 3, 4].map((n) => `${COMBOS[n].name} ×${fmt(g.comboL(n), 0)}　${s.stats['combo' + n]}次`).join('<br>')
      + (s.mut.some((m) => m.length) ? '<br>变异：' + s.mut.map((m, i) => m.map((id) => `${RINGS[i].name.slice(0, 1)}${MUTATIONS.find((x) => x.id === id).name}`).join(' ')).filter(Boolean).join(' ') : '');
  }

  // ---------------- rebirth ----------------
  buildRebirth() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('infinity')) {
      h += `<div class="rb panel"><h3>无限　<span style="color:var(--cyan)">无限点数 ${s.ip}</span></h3>
        <p>${g.canInfinity() ? `现在进行无限可获得 <span class="big">+${g.ipGain()}</span>` : '击败虚无王后可进行无限' + (s.inf.broken ? '（无尽回廊关卡100以上也可）' : '')}</p>
        <p style="color:var(--mist)">转生倍率·核心·永久树·革命·超越将被重置。英雄·图鉴·成就·试炼·任务保留。</p>
        <button class="btn blue" id="bInf" style="width:100%" ${g.canInfinity() ? '' : 'disabled'}>无限（第${s.inf.count}次）</button></div>`;
      h += `<div class="rb panel"><h3>无限强化</h3>` + IP_UP.map((u) => `<div class="perm"><span>${u.name} ${g.ipHas(u.id) ? '<span style="color:var(--leaf)">已完成</span>' : ''}</span><button class="btn blue" data-ip="${u.id}" ${g.ipHas(u.id) || s.ip < u.cost ? 'disabled' : ''}>${g.ipHas(u.id) ? '已完成' : '∞' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('')
        + (s.inf.broken ? `<div class="perm"><span>无限倍率 Lv${s.ipRep || 0}</span><button class="btn blue" id="bIpRep" ${s.ip < g.ipRepCost() ? 'disabled' : ''}>∞${g.ipRepCost()}</button><span class="pt">全伤害×1e10（可无限次）</span></div>` : '') + '</div>';
      if (g.ipHas('ich')) h += `<div class="rb panel"><h3>无限试炼</h3><p>遵守规则击败虚无王即可通关。</p>` + INF_CH.map((c) => { const done = s.infChDone.includes(c.id), cur = s.infCh === c.id; return `<div class="perm"><span>${done ? '★ ' : ''}${c.name}</span><button class="btn ${cur ? 'red' : 'rose'}" data-ic="${c.id}" ${(s.infCh && !cur) || done ? 'disabled' : ''}>${cur ? '放弃' : done ? '已完成' : '挑战'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">奖励：${c.reward}</span></span></div>`; }).join('') + '</div>';
    }
    h += `<div class="rb panel"><h3>转生</h3>
      <p>当前倍率 <span class="big">×${fmt(s.pmL, 1)}</span></p>
      <p>转生后 <span class="big" id="rbTo"></span>　核心+<span id="rbCore"></span></p>
      <p style="color:var(--mist)">关卡·金币·环将被重置。英雄段位·图鉴·任务保留。增长×10以上时是参考时机。</p>
      <button class="btn red" id="bRb" style="width:100%">转生</button>
      ${s.perm.autoRb ? `<div class="tog"><span>自动转生：倍率增长到</span><button class="small-btn" id="bAutoRb">×${fmt(s.autoRbL, 0)}时</button></div>` : ''}</div>`;
    if (g.has('promotion')) {
      h += `<div class="rb panel"><h3>晋升</h3><p>献出部分转生倍率，使该环威力×2、旋转倍率增长+15%（无限时重置）。</p>` + RINGS.map((def, i) => !g.on(i) ? '' : `<div class="perm"><span style="color:${def.col}">${def.name} 晋升Lv${s.promo[i]}</span><button class="btn" data-pr="${i}" ${g.canPromote(i) ? '' : 'disabled'}>倍率÷${fmt(PROMO.costL(s.promo[i]))}</button><span class="pt">威力×${fmt(s.promo[i] * PROMO.pow)}·增长+${s.promo[i] * 15}%</span></div>`).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>永久树　<span style="color:var(--rose)">核心 ${s.core}</span></h3>` + PERM.map((p) => {
        const lv = s.perm[p.id], max = lv >= p.max;
        return `<div class="perm"><span>${p.name} <span style="color:var(--mist)">${p.max > 1 ? `${lv}/${p.max}` : lv ? '已完成' : ''}</span></span><button class="btn rose" data-p="${p.id}" ${max || s.core < p.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '核心' + p.cost(lv)}</button><span class="pt">${p.text}</span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('perm')) {
      h += `<div class="rb panel"><h3>试炼</h3><p>带限制的周回。到达目标关卡即通关，可获得永久奖励。</p>` + CHALLENGES.map((c) => {
        const done = s.chDone.includes(c.id), cur = s.challenge === c.id;
        return `<div class="perm"><span>${done ? '★ ' : ''}${c.name} <span style="color:var(--mist)">目标${c.goal}</span></span><button class="btn ${cur ? 'red' : 'blue'}" data-ch="${c.id}" ${(s.challenge && !cur) ? 'disabled' : ''}>${cur ? '放弃' : done ? '再次挑战' : '挑战'}</button><span class="pt">${c.rule}<br><span style="color:var(--lemon)">奖励：${c.reward}</span></span></div>`;
      }).join('') + '</div>';
    }
    if (g.has('revolution')) {
      h += `<div class="rb panel"><h3>革命</h3><p>单次周回到达关卡300以上可执行。舍弃转生倍率·核心·永久树（自动化除外），获得革命记忆。</p>
        <p>革命记忆 <span class="big">${s.memory}</span>（每个 伤害×3·旋转倍率增长+20%）</p>
        <button class="btn rose" id="bRev" style="width:100%" ${g.canRevolution() ? '' : 'disabled'}>进行革命（记忆+${g.canRevolution() ? g.revolutionGain() : 0}）</button></div>`;
    }
    if (g.has('transcend')) {
      h += `<div class="rb panel"><h3>超越</h3><p>记忆6以上可执行。舍弃一切，全伤害×100·全速度+25%。通往最终世界的大门将开启。</p>
        <button class="btn red" id="bTr" style="width:100%" ${g.canTranscend() ? '' : 'disabled'}>进行超越</button></div>`;
    }
    if (s.worlds.length > 1) {
      h += `<div class="rb panel"><h3>世界</h3><div class="worlds">` + s.worlds.map((w) => `<button class="${s.world === w ? 'on' : ''}" data-w="${w}">${WORLDS[w].name}<small>${WORLDS[w].law}　最高${s.worldBest[w] || 0}</small></button>`).join('') + '</div><p style="color:var(--mist)">切换世界会重置当前周回。</p></div>';
    }
    const R = s.rules;
    const rules = [];
    if (g.has('promotion')) rules.push(`<div class="rule"><span>自动晋升</span><button class="small-btn ${R.autoPromo ? 'on' : ''}" data-rt="autoPromo">${R.autoPromo ? 'ON' : 'OFF'}</button></div>`);
    if (g.ipHas('autoRev')) rules.push(`<div class="rule"><span>自动革命：关卡</span><input type="number" data-rn="revStage" value="${R.revStage}" min="300" step="50"></div>`);
    if (g.ipHas('autoTr')) rules.push(`<div class="rule"><span>自动超越</span><button class="small-btn ${R.autoTr ? 'on' : ''}" data-rt="autoTr">${R.autoTr ? 'ON' : 'OFF'}</button></div>`);
    if (g.epHas('autoInf')) rules.push(`<div class="rule"><span>自动∞：获得点数（0=OFF）</span><input type="number" data-rn="infGain" value="${R.infGain}" min="0"></div>`);
    if (g.has('eternity')) rules.push(`<div class="rule"><span>自动永劫：回廊关卡（0=OFF）</span><input type="number" data-rn="eterStage" value="${R.eterStage}" min="0" step="100"></div>`);
    if (rules.length) h += `<div class="rb panel"><h3>自动化规则</h3>${rules.join('')}</div>`;
    $('rbBody').innerHTML = h;
    $('rbBody').querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => { if (g.promote(+b.dataset.pr)) this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rt]').forEach((b) => b.addEventListener('click', () => { R[b.dataset.rt] = !R[b.dataset.rt]; this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-rn]').forEach((inp) => inp.addEventListener('change', () => { R[inp.dataset.rn] = Math.max(0, parseInt(inp.value, 10) || 0); }));
    $('bRb').addEventListener('click', () => { if (g.rebirth()) { this.buildRebirth(); this.hooks.onSave(); } });
    if ($('bInf')) $('bInf').addEventListener('click', () => this.confirm('进行无限？', `无限点数+${g.ipGain()}。转生·革命·超越的进度将被重置。`, () => { g.infinity(); this.buildRebirth(); }));
    $('rbBody').querySelectorAll('[data-ip]').forEach((b) => b.addEventListener('click', () => { if (g.buyIp(b.dataset.ip)) { this.buildRebirth(); this.toast('无限强化', IP_UP.find((u) => u.id === b.dataset.ip).text); } }));
    if ($('bIpRep')) $('bIpRep').addEventListener('click', () => { if (g.buyIpRep()) this.buildRebirth(); });
    $('rbBody').querySelectorAll('[data-ic]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.ic; if (s.infCh === id) { g.quitInfCh(); this.buildRebirth(); } else this.confirm('挑战无限试炼？', '会发生与无限相同的重置（不会获得点数）。', () => { g.startInfCh(id); this.buildRebirth(); }); }));
    $('rbBody').querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.ch;
      if (s.challenge === id) this.confirm('放弃试炼？', '当前周回将被重置。', () => { g.finishChallenge(false); this.buildRebirth(); });
      else this.confirm('挑战试炼？', '当前周回将被重置（不会失去转生倍率和核心）。', () => { g.startChallenge(id); this.buildRebirth(); });
    }));
    $('rbBody').querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { if (g.buyPerm(b.dataset.p)) { this.buildRebirth(); this.applyFeatures(true); } }));
    if ($('bAutoRb')) $('bAutoRb').addEventListener('click', () => { s.autoRbL = (s.autoRbL % 6) + 1; this.buildRebirth(); });
    if ($('bRev')) $('bRev').addEventListener('click', () => this.confirm('进行革命？', '转生倍率·核心·永久树将消失。', () => { g.revolution(); this.buildRebirth(); this.buildRows(); }));
    if ($('bTr')) $('bTr').addEventListener('click', () => this.confirm('进行超越？', '记忆·倍率·变异将全部消失。', () => { g.transcend(); this.buildRebirth(); this.buildRows(); }));
    $('rbBody').querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (g.setWorld(+b.dataset.w)) { this.buildRebirth(); this.toast(`${WORLDS[+b.dataset.w].name} →`, WORLDS[+b.dataset.w].law); } }));
    this.refreshRebirth();
  }
  refreshRebirth() {
    const g = this.g;
    if (!$('rbTo')) return;
    const can = g.canRebirth();
    $('rbTo').textContent = can ? '×' + fmt(g.rebirthTargetL(), 1) : '（暂时不会增长）';
    $('rbCore').textContent = can ? g.rebirthCore() : 0;
    $('bRb').disabled = !can;
  }
  confirm(title, text, fn) {
    this.modal(`<h3>${title}</h3><p>${text}</p><div class="btns"><button class="btn red" id="cfYes">执行</button><button class="btn" data-x>取消</button></div>`);
    this.onOpen = (box) => box.querySelector('#cfYes').addEventListener('click', () => { fn(); this.close(); this.hooks.onSave(); });
  }

  // ---------------- misc ----------------
  menu() {
    const s = this.g.state;
    this.modal(`<h3>菜单</h3><div class="btns" style="flex-direction:column">
      <button class="btn" id="mSave">存档</button>
      <button class="btn blue" id="mShare">分享到X</button>
      <button class="btn" id="mLang">Language / 语言</button>
      <button class="btn" id="mNews">公告（v${VERSION}）</button>
      <button class="btn" id="mBgm">BGM：${this.hooks.bgm && this.hooks.bgm().on ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mEq">自动装备：${s.autoEquipOn ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mFx">光效：${s.fxLow ? '弱' : '强'}</button>
      <button class="btn" id="mBk">从备份恢复</button>
      ${this.hooks.debug ? `<button class="btn blue" id="mFast">测试用 时间×${s.timeScale >= 10 ? 1 : 10}</button>` : ''}
      <button class="btn red" id="mReset">删除数据</button>
      <button class="btn" data-x>关闭</button></div>
      <p style="color:var(--mist)">游玩时间 ${fnum(s.stats.playTime / 3600, 1)}小时</p>`);
    this.onOpen = (box) => {
      box.querySelector('#mSave').addEventListener('click', () => { this.hooks.onSave(); this.close(); this.toast('已存档'); });
      if (box.querySelector('#mFast')) box.querySelector('#mFast').addEventListener('click', () => { s.timeScale = s.timeScale >= 10 ? 1 : 10; this.close(); });
      box.querySelector('#mShare').addEventListener('click', () => { this.close(); this.share(); });
      box.querySelector('#mLang').addEventListener('click', () => { this.close(); this.langPicker(); });
      box.querySelector('#mNews').addEventListener('click', () => { this.close(); this.news(false); });
      box.querySelector('#mBgm').addEventListener('click', () => { const b = this.hooks.bgm(); b.setOn(!b.on); b.start(); this.close(); this.toast('BGM ' + (b.on ? 'ON' : 'OFF')); });
      box.querySelector('#mEq').addEventListener('click', () => { s.autoEquipOn = !s.autoEquipOn; this.close(); this.toast('自动装备 ' + (s.autoEquipOn ? 'ON' : 'OFF')); });
      box.querySelector('#mFx').addEventListener('click', () => { s.fxLow = !s.fxLow; document.getElementById('app').classList.toggle('fxlow', s.fxLow); this.close(); });
      box.querySelector('#mBk').addEventListener('click', () => { this.close(); this.backupPicker(); });
      box.querySelector('#mReset').addEventListener('click', () => { if (confirm('真的要全部删除吗？')) this.hooks.onReset(); });
    };
  }
  mutPicker(ev) {
    const h = RINGS[ev.ring];
    this.modal(`<div class="sub">RING MUTATION</div><h3>环变异</h3><p><span style="color:${h.col}">${h.name}</span>即将发生变异。选一个吧。</p><div class="list">${ev.opts.map((m, k) => `<div class="mrow" data-mu="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${m.name}<small>${m.text}</small></div></div>`).join('')}</div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-mu]').forEach((r) => r.addEventListener('click', () => { this.g.chooseMut(+r.dataset.mu); this.close(); }));
  }
  backupPicker() {
    const list = this.hooks.backups();
    this.modal(`<h3>备份</h3><div class="list">${list.length ? list.map((b, k) => `<div class="mrow" data-bk="${k}" style="cursor:pointer"><span class="id">${k + 1}</span><div>${new Date(b.time).toLocaleString('ja-JP')}<small>关卡${b.stage}·任务${b.missions}</small></div></div>`).join('') : '<p>暂无（每5分钟自动保存）</p>'}</div><div class="btns"><button class="btn" data-x>关闭</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-bk]').forEach((r) => r.addEventListener('click', () => { if (confirm('恢复到这个备份？当前数据将被覆盖。')) this.hooks.restore(+r.dataset.bk); }));
  }
  offline(r) {
    const h = Math.floor(r.seconds / 3600), m = Math.floor((r.seconds % 3600) / 60);
    this.modal(`<div class="sub">欢迎回来！</div><h3>${h}小时${m}分钟</h3><p>这段时间环也在转动（效率${Math.round(r.eff * 100)}%）<br>关卡 +${r.stage}　旋转 +${fnum(r.laps, 0)}${r.found ? `<br>新道具 ${r.found}种` : ''}${r.flux ? `<br>双倍时间 +${Math.floor(r.flux / 60)}分钟` : ''}</p><div class="btns">${r.seconds >= 600 ? `<button class="btn blue" id="offAd">${this.g.state.noAds ? '再领一份' : '看广告翻倍'}</button>` : ''}<button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => { const b = box.querySelector('#offAd'); if (b) b.addEventListener('click', async () => { this.close(); const ok = this.g.state.noAds ? true : await this.hooks.monetize().showRewarded(); if (ok) { const r2 = this.g.runOffline(r.seconds); if (r2) this.toast('挂机奖励翻倍！', `关卡 +${r2.stage}`); } else this.toast('广告加载失败', '请检查网络或广告拦截器（如AdGuard）'); }); };
  }
  intro() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>转起来，军团</h3><img class="pic" src="px/por_leon.png" width="120" height="120">
      <p>最初只有剑士莱昂和红环。<br>但每完成一个任务……</p>
      <div class="teaser"><img src="px/hero_seris.png"><img src="px/hero_elia.png"><img src="px/hero_nox.png"><img src="px/hero_garou.png"><img src="px/hero_sierra.png"></div>
      <div class="teaser-list">·<b>伙伴增加</b>（最多12人，环的动作各不相同）<br>·<b>环变成4色</b>，重合时触发同步连击<br>·转生·每周突袭·图鉴·宇宙…<br>　<b>玩法本身会越来越多</b></div>
      <div class="btns"><button class="btn" data-x>开始</button></div>`);
  }
  introOld() {
    this.modal(`<div class="sub">REVOLUTION LEGION</div><h3>红环</h3><img class="pic" src="px/por_leon.png" width="160" height="160">
      <p><span style="color:var(--lemon)">用手指转动环！</span><br>宝石到达顶点的瞬间点击战场触发<span style="color:var(--lemon)">PERFECT</span>！<br>转得越快旋转越快，攻击和倍率（每圈×1.01）随之提升。<br>点击战场莱昂就会挥剑。<br>挂机也能前进，但手动转更快。</p><div class="btns"><button class="btn" data-x>开始</button></div>`);
  }
  // ---------------- cosmos ----------------
  buildCosmos() {
    const g = this.g, s = g.state;
    let h = '';
    if (g.has('eternity')) {
      h += `<div class="rb panel"><h3>永劫　<span style="color:var(--pink)">永劫点数 ${s.ep}</span></h3><p>无尽回廊关卡300以上可执行。无限点数、无限强化（有永劫记忆则保留）及无限进度将被重置。</p>
        <button class="btn rose" id="bEter" style="width:100%" ${g.canEternity() ? '' : 'disabled'}>${g.canEternity() ? '进行永劫（+' + g.epGain() + '）' : '回廊关卡300解锁'}</button></div>`;
      h += '<div class="rb panel"><h3>永劫强化</h3>' + EP_UP.map((u) => `<div class="perm"><span>${u.name}</span><button class="btn rose" data-ep="${u.id}" ${g.epHas(u.id) || s.ep < u.cost ? 'disabled' : ''}>${g.epHas(u.id) ? '已完成' : 'EP' + u.cost}</button><span class="pt">${u.text}</span></div>`).join('') + '</div>';
    }
    if (g.epHas('dil')) {
      h += `<div class="rb panel"><h3>里世界　<span style="color:var(--cyan)">结晶 ${s.tp || 0}</span></h3><p>环逆向吱嘎作响的反转世界。伤害指数会变小，走得越远结晶越多。进出时发生与无限相同的重置。</p>
        <button class="btn ${s.dilOn ? 'red' : 'blue'}" id="bDil" style="width:100%">${s.dilOn ? '退出里世界（结晶+' + g.dilGain() + '）' : '进入里世界'}</button>`
        + DIL_UP.map((u) => { const lv = g.dl(u.id), max = u.max && lv >= u.max; return `<div class="perm"><span>${u.name} Lv${lv}</span><button class="btn blue" data-dl="${u.id}" ${max || (s.tp || 0) < u.cost(lv) ? 'disabled' : ''}>${max ? 'MAX' : '结晶' + u.cost(lv)}</button><span class="pt">${u.text}</span></div>`; }).join('') + '</div>';
    }
    if (false) {
      h += `<div class="rb panel"><h3>星座盘　${s.zodiac.length}/${s.zslots}</h3><p>随成就数量解锁星座。最多装备${s.zslots}个。</p><div class="zgrid">`
        + ZODIAC.map((z) => { const open = g.zodiacOpen(z.id), on = s.zodiac.includes(z.id); return `<button class="${on ? 'on' : open ? '' : 'lock'}" data-z="${z.id}">${open ? z.name : '？？？'}<small>${open ? z.text : '成就' + z.need}</small></button>`; }).join('') + '</div></div>';
    }
    if (g.has('minerals')) {
      h += `<div class="rb panel"><h3>作战卡　<span style="color:var(--rose)">黑矿 ${s.ores.black || 0}</span>　${s.deck.length}/${s.cslots}张</h3><p><small style="color:var(--lemon)">概率：共${CARDS.length}种 各${(100 / CARDS.length).toFixed(1)}%（无稀有度）</small><br>1个黑矿抽1张。重复的卡会叠加升级（最高Lv10）。只有装备中的卡生效。突袭奖励也能获得。</p>
        <button class="btn rose" id="bCard" style="width:100%" ${(s.ores.black || 0) < 1 ? 'disabled' : ''}>抽卡</button>
        <div class="cards" style="margin-top:6px">${CARDS.map((c) => { const lv = s.cards[c.id] || 0, on = s.deck.includes(c.id); return `<button class="${on ? 'on' : lv ? '' : 'lock'}" data-cd="${c.id}">${lv ? c.name + ' Lv' + lv : '？？？'}<small>${lv ? c.text : '未获得'}</small></button>`; }).join('')}</div></div>`;
      h += '<div class="rb panel"><h3>矿石与锻造</h3><div class="ores">' + ORES.map((o) => `<span style="color:${o.col}">${o.name} <b>${s.ores[o.id] || 0}</b></span>`).join('') + '</div><p>精炼装备中的道具（每级威力+50%，最高10级）。</p>'
        + Object.keys(HEROES).map((hid) => { const id = s.equip[hid]; if (!id || !g.on(HEROES[hid].ring)) return ''; const it = ITEMS.find((x) => x.id === id), c = g.refineCost(id), ore = ORES.find((o) => o.id === c.ore); return `<div class="perm"><span>${it.name} +${c.lv}</span><button class="btn" data-rf="${id}" ${c.lv >= 10 || (s.ores[c.ore] || 0) < c.n ? 'disabled' : ''}>${c.lv >= 10 ? 'MAX' : ore.name + c.n}</button><span class="pt">${HEROES[hid].name}的装备</span></div>`; }).join('') + '</div>';
    }
    $('cosBody').innerHTML = h || '<p class="note">革命后宇宙之门将开启。</p>';
    const re = () => this.buildCosmos();
    if ($('bEter')) $('bEter').addEventListener('click', () => this.confirm('进行永劫？', '无限点数与无限进度将被重置。', () => { g.eternity(); re(); }));
    $('cosBody').querySelectorAll('[data-ep]').forEach((b) => b.addEventListener('click', () => { if (g.buyEp(b.dataset.ep)) re(); }));
    if ($('bDil')) $('bDil').addEventListener('click', () => { if (s.dilOn) this.confirm('退出扭曲？', '结晶+' + g.dilGain() + '。将发生重置。', () => { g.endDilation(); re(); }); else this.confirm('进入时间扭曲？', '会发生与无限相同的重置。', () => { g.startDilation(); re(); }); });
    $('cosBody').querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => { if (g.buyDil(b.dataset.dl)) re(); }));
    $('cosBody').querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { if (g.toggleZodiac(b.dataset.z)) re(); }));
    if ($('bCard')) $('bCard').addEventListener('click', () => g.drawCard());
    $('cosBody').querySelectorAll('[data-cd]').forEach((b) => b.addEventListener('click', () => { if (g.toggleCard(b.dataset.cd)) re(); }));
    $('cosBody').querySelectorAll('[data-rf]').forEach((b) => b.addEventListener('click', () => { if (g.refineItem(b.dataset.rf)) { this.toast('精炼成功！'); re(); } }));
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
      const tag = left > 0 ? `<span class="tag">还剩${Math.floor(left / 3600000)}小时${Math.floor(left / 60000) % 60}分钟</span>` : '';
      return `<div class="mrow">${p.skin ? sw(p.skin) : ''}<div style="flex:1">${p.name}${tag}<small>${p.text}</small></div><button class="btn" data-buy="${p.id}" ${dis ? 'disabled' : ''}>${dis ? '已购买' : m.price(p)}</button></div>`;
    };
    const list = (cat) => SHOP.filter((p) => p.cat === cat && vis(p)).map(row).join('');
    let body = '';
    if (tab === 'top') {
      const c = g.passClaimable();
      body = `<div class="mrow"><div style="flex:1">军团通行证　级 ${g.passTier()}/30<small>${c ? `可领取的奖励有${c}个！` : `赛季剩余${g.passDaysLeft()}天·玩得越多级别越高`}</small></div><button class="btn blue" data-tab="pass">查看</button></div>`;
      if (g.monthLeft() > 0) body += `<p class="note">月度通行证 生效中：剩余${g.monthLeft()}天</p>`;
      body += list('top');
    } else if (tab === 'pass') {
      const t = g.passTier(), p = s.pass, c = g.passClaimable();
      let rows = '';
      for (let k = 1; k <= 30; k++) rows += `<div class="prow ${k <= t ? 'got' : ''}"><b>${k}</b><span>${g.passReward('free', k).text}${k <= p.cf ? ' ✓' : ''}</span><span class="pr">${g.passReward('prem', k).text}${p.premium && k <= p.cp ? ' ✓' : ''}</span></div>`;
      body = `<div class="passhead">赛季剩余${g.passDaysLeft()}天　级 <b>${t}</b>/30<i class="pbar"><b style="width:${t >= 30 ? 100 : p.xp % 100}%"></b></i><small>每玩1分钟+1·每日登录+50·完成任务+30（100升1级）</small></div>
        <div class="btnrow"><button class="btn" id="passClaim" ${c ? '' : 'disabled'}>全部领取${c ? '（' + c + '）' : ''}</button>${p.premium ? '<span class="tag">高级版已生效</span>' : `<button class="btn rose" data-buy="rl_pass">高级版 ${m.price(SHOP.find((x) => x.id === 'rl_pass'))}</button>`}</div>
        <div class="prow head"><b>级</b><span>免费</span><span class="pr">高级版</span></div>${rows}`;
    } else if (tab === 'look') {
      const mine = ['', ...Object.keys(RING_SKINS).filter((k) => (s.skins || []).includes(k))];
      body = '<p class="note">环换装（仅外观，不影响强度）</p>' + mine.map((id) => `<div class="mrow">${sw(id)}<div style="flex:1">${id ? RING_SKINS[id].name : '默认'}</div><button class="btn blue" data-skin="${id}" ${(s.skin || '') === id ? 'disabled' : ''}>${(s.skin || '') === id ? '使用中' : '使用'}</button></div>`).join('')
        + '<p class="note">购买</p>' + list('look');
    } else if (tab === 'item') {
      body = list('item');
    } else {
      body = AD_REWARDS.filter((a) => !a.need || g.has(a.need)).map((a) => { const left = g.adLeft(a.id, today); return `<div class="mrow"><div style="flex:1">${a.name}<small>今天还剩${left}次</small></div><button class="btn blue" data-ad="${a.id}" ${left <= 0 ? 'disabled' : ''}>${s.noAds || m.web ? '领取' : '看广告'}</button></div>`; }).join('')
        + '<p class="note">每日登录：双倍时间1小时（连续登录还送转生核心）<br>从挂机回来时，看广告也能让奖励翻倍</p>';
    }
    const TABS = [['top', '超值'], ['pass', '通行证'], ['look', '外观'], ['item', '道具'], ['free', '免费']];
    const cap = g.spendCap();
    box.innerHTML = `<h3>商店</h3>${m.web ? '<p style="color:var(--cyan)">网页版：免费奖励无需看广告即可领取。购买请使用Android应用版</p>' : m.native ? '' : '<p style="color:var(--pink)">网页版为测试模式（不会产生支付）</p>'}
      <div class="tabs">${TABS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}${k === 'pass' && g.passClaimable() ? '!' : ''}</button>`).join('')}</div>
      <div class="list">${body}</div>
      <p class="legal">本月购买 ¥${g.spentThisMonth().toLocaleString()}${cap < Infinity ? ` / 上限 ¥${cap.toLocaleString()}` : ''}　通关无需充值</p>
      <div class="btns"><button class="btn blue" id="bHist">购买记录·设置</button>${m.native ? '<button class="btn blue" id="bRestore">恢复</button>' : ''}<button class="btn" id="bShopX">关闭</button></div>`;
    box.querySelector('#bShopX').addEventListener('click', () => this.close());
    box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.drawShop(box, b.dataset.tab)));
    box.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => this.buyFlow(b.dataset.buy)));
    box.querySelectorAll('[data-skin]').forEach((b) => b.addEventListener('click', () => { s.skin = b.dataset.skin; this.drawShop(box, tab); }));
    const pc = box.querySelector('#passClaim');
    if (pc) pc.addEventListener('click', () => { const n = g.claimPass(); this.toast('已领取通行证奖励', n + '个'); this.hooks.onSave && this.hooks.onSave(); this.drawShop(box, tab); });
    box.querySelectorAll('[data-ad]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.ad;
      this.close();
      const ok = s.noAds ? true : await m.showRewarded();
      if (ok && g.adReward(id, today)) this.toast('已领取奖励', AD_REWARDS.find((a) => a.id === id).name);
      else if (!ok) this.toast('广告加载失败', '请检查网络或广告拦截器（如AdGuard）');
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
      this.modal(`<div class="sub">无法购买</div><h3>本月上限</h3><p>${AGE_BANDS[s.ageBand].name}用户的每月购买上限为 ¥${g.spendCap().toLocaleString()}。<br>本月还可购买 ¥${Math.max(0, g.spendCap() - g.spentThisMonth()).toLocaleString()}。<br>将于下月1日重置。</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
      return;
    }
    this.hooks.monetize().buy(id);
  }
  ageGate(next) {
    this.close();
    this.modal(`<div class="sub">首次购买前</div><h3>请选择年龄</h3><p>未成年用户每月购买金额有上限。<br>未满18岁的用户请在取得监护人同意后购买。</p><div class="btns col">${Object.entries(AGE_BANDS).map(([k, b]) => `<button class="btn" data-age="${k}">${b.name}${b.cap < Infinity ? `（每月最多¥${b.cap.toLocaleString()}）` : ''}</button>`).join('')}<button class="btn red" data-x>取消</button></div>`);
    this.onOpen = (box) => box.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => { this.g.state.ageBand = b.dataset.age; this.hooks.onSave && this.hooks.onSave(); next(); }));
  }
  purchaseInfo() {
    const g = this.g, s = g.state, list = (s.purchases || []).slice().reverse();
    const rows = list.length ? list.map((x) => { const d = new Date(x.t); return `<div class="mrow"><span style="color:var(--mist)">${d.getMonth() + 1}/${d.getDate()}</span><div style="flex:1">${x.name}</div><span>¥${x.yen.toLocaleString()}</span></div>`; }).join('') : '<p class="note">暂无购买记录</p>';
    const band = AGE_BANDS[s.ageBand];
    this.modal(`<h3>购买记录</h3><p>本月 ¥${g.spentThisMonth().toLocaleString()}${band && band.cap < Infinity ? ` / 上限 ¥${band.cap.toLocaleString()}` : ''}<br>年龄设置：${band ? band.name : '未设置'}</p><div class="list">${rows}</div>
      <p class="legal">·没有付费货币（直接购买商品）<br>·作战卡概率：共${CARDS.length}种 各${(100 / CARDS.length).toFixed(1)}%<br>·集齐全部也没有特殊奖励<br>·退款遵循Google Play的退款政策<br>·通关游戏无需充值</p>
      <div class="btns"><button class="btn blue" id="bAge">更改年龄设置</button><button class="btn" data-x>关闭</button></div>`);
    this.onOpen = (box) => box.querySelector('#bAge').addEventListener('click', () => this.ageGate(() => { this.close(); this.purchaseInfo(); }));
  }
  fakeAd() {
    return new Promise((res) => {
      this.modal(`<div class="sub">测试广告</div><div class="fake-ad" id="fakeAd">广告（测试） 3</div><p>正式Android版会在此播放AdMob视频广告。</p>`);
      this.onOpen = (box) => {
        let n = 3;
        const iv = setInterval(() => { n--; const el = box.querySelector('#fakeAd'); if (el) el.textContent = n > 0 ? '广告（测试） ' + n : '获得奖励！'; if (n <= 0) { clearInterval(iv); setTimeout(() => { this.close(); res(true); }, 400); } }, 1000);
      };
    });
  }
  testPurchase(p) {
    return new Promise((res) => {
      this.modal(`<div class="sub">测试购买</div><h3>${p.name}</h3><p>${p.text}<br>正式价格 ${p.price}<br><span style="color:var(--pink)">测试模式下不会产生支付。</span></p><div class="btns"><button class="btn" id="tpYes">领取</button><button class="btn red" id="tpNo">取消</button></div>`);
      this.onOpen = (box) => {
        box.querySelector('#tpYes').addEventListener('click', () => { this.close(); res(true); });
        box.querySelector('#tpNo').addEventListener('click', () => { this.close(); res(false); });
      };
    });
  }

  daily(r) {
    this.modal(`<div class="sub">LOGIN BONUS</div><h3>${r.streak}天</h3><p>双倍时间 +1小时${r.core ? `<br>转生核心 +${r.core}` : ''}${r.month ? `<br><span style="color:var(--lemon)">月度通行证：双倍时间+1小时·硬币（剩余${r.month}天）</span>` : ''}<br><span style="color:var(--mist)">${this.g.has('autoBuy') ? '点击环旁的「2倍速」按钮，游戏将以2倍速进行' : '关卡40解锁（可储存）'}</span></p><div class="btns"><button class="btn" data-x>领取</button></div>`);
  }
  appOnly() {
    this.close();
    this.modal(`<div class="sub">网页版</div><h3>购买请使用应用版</h3><p>网页版可免费直接游玩。<br>道具购买请使用Android应用版（Google Play）。</p><div class="btns"><button class="btn" id="bPlay">在Google Play查看</button><button class="btn red" data-x>关闭</button></div>`);
    this.onOpen = (box) => box.querySelector('#bPlay').addEventListener('click', () => { openUrl(PLAY_URL); this.close(); });
  }
  share() {
    const g = this.g, s = g.state;
    const text = `我在REVOLUTION LEGION中到达了关卡${s.stats.bestStage}！ 倍率×${fmt(g.totalMultL(), 1)}`;
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
    this.modal(`<div class="sub">${onlyNew ? 'UPDATE' : '公告'}</div><h3>${onlyNew ? '已更新' : '更新记录'}</h3><div class="list" style="text-align:left">${list.map((u) => `<p class="note"><b style="color:var(--lemon)">v${u.v}</b>（${u.date}）${u.title}<br>${u.items.map((x) => '·' + x).join('<br>')}</p>`).join('')}</div><p style="color:var(--cyan)">${NEXT_CHAPTER}</p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
  trueEnding() {
    this.modal(`<div class="sub">TRUE END</div><h3>回廊尽头</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>在无尽回廊的1000层，环合为了一个圆。<br>游玩时间 ${fnum(this.g.state.stats.playTime / 3600, 1)}小时<br><span style="color:var(--cyan)">但故事还没有结束。</span><br>${NEXT_CHAPTER}<br>在那之前，先刷新回廊记录、挑战突袭磨练身手吧。</p><div class="btns"><button class="btn blue" id="bShareEnd">分享到X</button><button class="btn" data-x>OK</button></div>`);
    this.onOpen = (box) => box.querySelector('#bShareEnd').addEventListener('click', () => this.share());
  }
  ending() {
    this.modal(`<div class="sub">THE END</div><h3>击败了虚无王</h3><img class="pic" src="px/por_leon.png" width="120" height="120"><p>不停转动的环，终于抵达了世界尽头。<br>游玩时间 ${fnum(this.g.state.stats.playTime / 3600, 1)}小时<br>但∞之后世界仍在继续。<br><span style="color:var(--cyan)">已在转生界面解锁无限。</span></p><div class="btns"><button class="btn" data-x>OK</button></div>`);
  }
}
void IMG;
