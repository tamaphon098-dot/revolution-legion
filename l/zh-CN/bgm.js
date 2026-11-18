// Original chiptune BGM, synthesized live with WebAudio (no audio files, no licensing).
// Three loops: field (bright), boss (driving minor), night (deep worlds / dilation).
// Notation: 16 tokens per bar, '-' holds the previous note, '.' is a rest.
const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const hz = (n) => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return 440 * Math.pow(2, ((+m[2] + 1) * 12 + NOTE[m[1]] - 69) / 12); };

const TRACKS = {
  field: {
    bpm: 132, lead: 'square', leadVol: 0.07,
    bass: ['C2', 'G2', 'A2', 'F2', 'C2', 'G2', 'F2', 'G2'],
    chords: ['C4 E4 G4', 'G3 B3 D4', 'A3 C4 E4', 'F3 A3 C4', 'C4 E4 G4', 'G3 B3 D4', 'F3 A3 C4', 'G3 B3 D4'],
    drums: 'k.h.s.h.k.h.s.hh',
    melody: [
      'E5 - G5 - C6 - G5 - E5 - D5 - C5 - D5 -',
      'B4 - D5 - G5 - - - F5 - E5 - D5 - - -',
      'C5 - E5 - A5 - G5 - E5 - C5 - E5 - G5 -',
      'F5 - - - E5 - D5 - C5 - - - . . . .',
      'G5 - E5 - G5 - C6 - D6 - C6 - B5 - G5 -',
      'D6 - - - B5 - G5 - A5 - B5 - D6 - - -',
      'C6 - A5 - F5 - A5 - C6 - D6 - C6 - A5 -',
      'B5 - - - A5 - G5 - D5 - - - G5 - - -',
    ],
  },
  boss: {
    bpm: 160, lead: 'square', leadVol: 0.07,
    bass: ['A2', 'F2', 'G2', 'E2', 'A2', 'F2', 'G2', 'E2'],
    chords: ['A4 C5 E5', 'F4 A4 C5', 'G4 B4 D5', 'E4 G#4 B4', 'A4 C5 E5', 'F4 A4 C5', 'G4 B4 D5', 'E4 G#4 B4'],
    drums: 'k.hkshk.k.hkshkh',
    melody: [
      'A5 . A5 . C6 . E6 . D6 - C6 - B5 . A5 .',
      'F5 - - - A5 . C6 . B5 . A5 . G5 - - -',
      'G5 . G5 . B5 . D6 . C6 - B5 - A5 . G5 .',
      'G#5 - - - B5 - - - E6 - - - D6 . B5 .',
      'E6 - - - D6 - C6 - B5 - A5 - C6 - E6 -',
      'F6 - - - E6 - C6 - A5 - - - C6 - - -',
      'D6 - - - C6 - B5 - G5 - B5 - D6 - - -',
      'E6 - - - - - - - G#5 - - - B5 - - -',
    ],
  },
  night: {
    bpm: 104, lead: 'triangle', leadVol: 0.16,
    bass: ['D2', 'C2', 'Bb1', 'C2', 'D2', 'C2', 'Bb1', 'A1'],
    chords: ['D4 F4 A4', 'C4 E4 G4', 'Bb3 D4 F4', 'C4 E4 G4', 'D4 F4 A4', 'C4 E4 G4', 'Bb3 D4 F4', 'A3 C#4 E4'],
    drums: 'k.....h.s.....h.',
    melody: [
      'D5 - - - F5 - A5 - - - G5 - F5 - E5 -',
      'E5 - - - G5 - - - C6 - - - . . . .',
      'D5 - F5 - Bb5 - A5 - F5 - - - D5 - - -',
      'E5 - - - C5 - - - . . . . . . . .',
      'A5 - - - G5 - F5 - G5 - A5 - C6 - - -',
      'G5 - - - E5 - - - C5 - D5 - E5 - - -',
      'F5 - - - D5 - Bb4 - D5 - F5 - Bb5 - - -',
      'A5 - - - - - - - C#5 - - - E5 - - -',
    ],
  },
};

// pre-parse melodies into step -> {f, len}
for (const tr of Object.values(TRACKS)) {
  const toks = tr.melody.flatMap((bar) => { const t = bar.trim().split(/\s+/); while (t.length < 16) t.push('.'); return t.slice(0, 16); });
  tr.steps = toks.length;
  tr.notes = {};
  let cur = null;
  toks.forEach((t, i) => {
    if (t === '-') { if (cur) cur.len++; }
    else if (t === '.') cur = null;
    else { cur = { f: hz(t), len: 1 }; tr.notes[i] = cur; }
  });
  tr.chordHz = tr.chords.map((c) => c.split(' ').map(hz));
  tr.bassHz = tr.bass.map(hz);
}

const KEY = 'rl_bgm';
export class BGM {
  constructor() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { saved = null; }
    this.on = saved ? saved.on !== false : true;
    this.ctx = null;
    this.want = 'field';
    this.id = null;
  }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ on: this.on })); } catch { /* storage may be unavailable */ } }

  // must be called from a user gesture (autoplay policy)
  start() {
    if (this.ctx) { if (this.on && this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.on ? 0.55 : 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 6000;
    this.master.connect(lp); lp.connect(ctx.destination);
    const n = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = n;
    this.load(this.want);
    this.timer = setInterval(() => this.sched(), 25);
  }
  setOn(on) {
    this.on = on; this.save();
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.05);
    if (on) { this.ctx.resume(); this.nextT = this.ctx.currentTime + 0.05; }
  }
  pause() { if (this.ctx) this.ctx.suspend(); }
  resume() { if (this.ctx && this.on) { this.ctx.resume(); this.nextT = Math.max(this.nextT || 0, this.ctx.currentTime + 0.05); } }
  play(id) { if (TRACKS[id]) this.want = id; }

  load(id) {
    this.id = id; this.tr = TRACKS[id];
    this.step = 0;
    this.stepDur = 60 / this.tr.bpm / 4;
    this.nextT = this.ctx.currentTime + 0.05;
  }
  sched() {
    const ctx = this.ctx;
    if (!this.on || ctx.state !== 'running') return;
    if (this.nextT < ctx.currentTime) this.nextT = ctx.currentTime + 0.02; // after a stall, do not burst-play
    while (this.nextT < ctx.currentTime + 0.12) {
      if (this.step % 16 === 0 && this.want !== this.id) { const t = this.nextT; this.load(this.want); this.nextT = t; }
      this.playStep(this.step, this.nextT);
      this.nextT += this.stepDur;
      this.step = (this.step + 1) % this.tr.steps;
    }
  }
  playStep(i, t) {
    const tr = this.tr, bar = Math.floor(i / 16), sd = this.stepDur;
    const n = tr.notes[i];
    if (n) this.tone(tr.lead, n.f, t, n.len * sd * 0.92, tr.leadVol);
    const ch = tr.chordHz[bar % tr.chordHz.length];
    this.tone('square', ch[i % ch.length], t, sd * 0.6, 0.022);
    if (i % 2 === 0) this.tone('triangle', tr.bassHz[bar % tr.bassHz.length] * (i % 4 === 2 ? 2 : 1), t, sd * 1.8, 0.2);
    const dc = tr.drums[i % 16];
    if (dc === 'k') this.kick(t);
    if (dc === 's') this.hit(t, 'bandpass', 1800, 0.16, 0.12);
    if (dc === 'h' || dc === 's') this.hit(t, 'highpass', 7000, 0.045, 0.04);
  }
  tone(type, f, t, dur, vol) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.setTargetAtTime(vol * 0.6, t + 0.02, 0.08);
    g.gain.setTargetAtTime(0, t + Math.max(0.03, dur - 0.02), 0.025);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.15);
  }
  kick(t) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.16);
  }
  hit(t, type, f, vol, dur) {
    const ctx = this.ctx, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noise; fl.type = type; fl.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  }
}
