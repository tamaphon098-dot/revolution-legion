// First-run tutorial: spotlights one thing at a time, shows a pointing hand, and advances
// only when the player has actually done it. The game keeps running underneath.
const $ = (id) => document.getElementById(id);

export const STEPS = [
  { target: '#bwrap', hand: 'tap', text: 'Tap the battlefield!<br>Leon swings his sword', done: (s) => (s.stats.taps || 0) >= 3, hint: (s) => `${Math.max(0, 3 - (s.stats.taps || 0))} taps left` },
  { target: '#rcv', hand: 'circle', text: 'Spin the Ring with your finger!<br>The faster it spins, the more your attack and multiplier grow', done: (s) => (s.stats.spun || 0) >= 0.8 },
  { target: '#rcv', hand: 'tapTop', text: 'Tap the battlefield the moment a gem<br>lines up with the ▼ above for <b>PERFECT</b> (triple damage)', done: (s) => (s.stats.perfects || 0) >= 1, timeout: 25, hint: () => '(You can continue even if it doesn\'t work out)' },
  { target: '#bLv0', hand: 'tap', text: 'Once you\'ve saved up Gold,<br>power up with <b>Lv+</b>', done: (s) => s.rings[0].lv >= 3 },
  { target: '#mission', hand: 'tap', text: 'Clear Missions to<br><b>keep unlocking allies, Rings and new ways to play</b><br>Tap here for the list', done: (s, t) => t.flags.missionOpened, timeout: 20 },
];

export class Tutorial {
  constructor(game, root) {
    this.g = game;
    this.flags = {};
    this.root = root;
    this.el = document.createElement('div');
    this.el.id = 'tut';
    this.el.innerHTML = '<div class="tut-spot"></div><div class="tut-hand"></div><div class="tut-box"><div class="tut-text"></div><div class="tut-hint"></div><button class="small-btn tut-skip">Skip</button></div>';
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
