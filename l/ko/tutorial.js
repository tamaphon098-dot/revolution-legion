// First-run tutorial: spotlights one thing at a time, shows a pointing hand, and advances
// only when the player has actually done it. The game keeps running underneath.
const $ = (id) => document.getElementById(id);

export const STEPS = [
  { target: '#bwrap', hand: 'tap', text: '전장을 탭!<br>레온이 베어 든다', done: (s) => (s.stats.taps || 0) >= 3, hint: (s) => `앞으로${Math.max(0, 3 - (s.stats.taps || 0))}회` },
  { target: '#rcv', hand: 'circle', text: '링을 손가락으로 빙글 돌려 보자!<br>돌릴수록 빨리 돌고, 공격과 배율이 오른다', done: (s) => (s.stats.spun || 0) >= 0.8 },
  { target: '#rcv', hand: 'tapTop', text: '보석이 위쪽 ▼에 겹치는 순간<br>전장을 탭하면 <b>PERFECT</b>(데미지 3배)', done: (s) => (s.stats.perfects || 0) >= 1, timeout: 25, hint: () => '(잘 안 돼도 다음으로 넘어갈 수 있어요)' },
  { target: '#bLv0', hand: 'tap', text: '골드가 모이면<br><b>Lv+</b>로 강화하자', done: (s) => s.rings[0].lv >= 3 },
  { target: '#mission', hand: 'tap', text: '미션을 달성하면<br><b>동료·링·새로운 플레이 요소가 계속 늘어나요</b><br>여기를 탭하면 목록', done: (s, t) => t.flags.missionOpened, timeout: 20 },
];

export class Tutorial {
  constructor(game, root) {
    this.g = game;
    this.flags = {};
    this.root = root;
    this.el = document.createElement('div');
    this.el.id = 'tut';
    this.el.innerHTML = '<div class="tut-spot"></div><div class="tut-hand"></div><div class="tut-box"><div class="tut-text"></div><div class="tut-hint"></div><button class="small-btn tut-skip">건너뛰기</button></div>';
    root.appendChild(this.el);
    this.el.querySelector('.tut-skip').addEventListener('click', () => this.finish());
    this.t = 0;
  }
  get step() { return this.g.state.tut || 0; }
  active() { return this.step < STEPS.length && !this.paused; }

  // called ~10x per second
  update(dt, modalOpen) {
    const s = this.g.state;
    if (this.step >= STEPS.length) { this.el.style.display = 'none'; return; }
    if (modalOpen) { this.el.style.display = 'none'; return; }
    const st = STEPS[this.step];
    this.t += dt;
    if (st.done(s, this) || (st.timeout && this.t > st.timeout)) {
      s.tut = this.step + 1;
      this.t = 0;
      if (s.tut >= STEPS.length) return this.finish(true);
      return;
    }
    const tgt = document.querySelector(st.target);
    if (!tgt) return;
    this.el.style.display = 'block';
    const app = this.root.getBoundingClientRect(), r = tgt.getBoundingClientRect(), k = app.width / 360;
    const x = (r.left - app.left) / k, y = (r.top - app.top) / k, w = r.width / k, h = r.height / k;
    const spot = this.el.querySelector('.tut-spot');
    Object.assign(spot.style, { left: x - 4 + 'px', top: y - 4 + 'px', width: w + 8 + 'px', height: h + 8 + 'px' });
    const box = this.el.querySelector('.tut-box');
    this.el.querySelector('.tut-text').innerHTML = `<span class="tut-no">${this.step + 1}/${STEPS.length}</span>${st.text}`;
    this.el.querySelector('.tut-hint').textContent = st.hint ? st.hint(s) : '';
    // put the text box above or below the target, whichever has room
    const below = y + h + 12 + 110 < app.height / k;
    box.style.top = (below ? y + h + 12 : Math.max(4, y - 120)) + 'px';
    const hand = this.el.querySelector('.tut-hand');
    hand.className = 'tut-hand ' + st.hand;
    const cx = x + w / 2, cy = st.hand === 'tapTop' ? y + 16 : y + h / 2;
    Object.assign(hand.style, { left: cx + 'px', top: cy + 'px' });
  }
  finish(done) {
    this.g.state.tut = STEPS.length;
    this.el.style.display = 'none';
    if (this.onDone) this.onDone(!!done);
  }
}
