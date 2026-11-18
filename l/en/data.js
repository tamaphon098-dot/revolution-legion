// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: 'Red Ring', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: 'Blue Ring', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: 'Gold Ring', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: 'Purple Ring', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: 'Leon', job: 'Swordsman', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: 'Slashes every lap. The blade only gets faster.' },
  seris: { name: 'Seris', job: 'Witch', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: 'Ice magic. Double damage on weak points.' },
  elia: { name: 'Elia', job: 'Saint', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: 'Prays to speed up every Ring.' },
  nox: { name: 'Nox', job: 'Summoner', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: 'Calls a spirit dragon. Slow, but hits hard.' },
  mina: { name: 'Mina', job: 'Dual Blader', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: 'Double the trigger nodes. Each hit is weak (×0.6).' },
  garou: { name: 'Garou', job: 'Berserker', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: 'Grows stronger the longer he hits the same enemy (max ×6).' },
  volt: { name: 'Volt', job: 'Thunder Mage', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: 'Lightning strikes after every Sync combo. Sync window +50%.' },
  luna: { name: 'Luna', job: 'Stargazer', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30% chance of ×8 crits. Blue Ring multiplier growth +10%.' },
  brom: { name: 'Brom', job: 'Blacksmith', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: 'Gold ×100, Ore doubled. Bad at fighting.' },
  tia: { name: 'Tia', job: 'Bard', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: 'Sync window ×2, combo multiplier ×2.' },
  zeno: { name: 'Zeno', job: 'Necromancer', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: 'Gets stronger with every enemy defeated this stage.' },
  sierra: { name: 'Sierra', job: 'Chrono Mage', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: 'Spins the Rings automatically every lap. All speed +10%.' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: 'Reach Stage 120', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: 'Sync 3+ colors 100 times', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: 'Do a Revolution', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: 'Collect 100 Ore in total', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: 'Defeat 500 bosses', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: 'Get 3 Weekly Raid Badges', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: 'Reach Gold or better in the Raid for 3 weeks', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: 'Join the Raid for 6 weeks, or go Eternity', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: 'Red Festival', text: 'Red Ring damage ×3, others ×0.3' },
  { id: 'r_sync', name: 'Resonance Fest', text: 'Sync combo ×10, normal attacks ×0.1' },
  { id: 'r_perf', name: 'Foresight Challenge', text: 'PERFECT damage ×5' },
  { id: 'r_slow', name: 'Gravity Day', text: 'Ring speed ×0.5, damage ×4' },
  { id: 'r_crit', name: 'Weak Point Fest', text: 'Crit rate +30%' },
  { id: 'r_purple', name: 'Summon Fest', text: 'Purple Ring damage ×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: 'Swift Strike', text: 'All Ring speed +5%/Lv' },
  { id: 'c_edge', name: 'Sharp Edge', text: 'Red Ring power ×100/Lv' },
  { id: 'c_frost', name: 'Frost Formation', text: 'Blue Ring power ×100/Lv' },
  { id: 'c_choir', name: 'Hymn', text: 'Gold Ring power ×100/Lv' },
  { id: 'c_horde', name: 'Demon Horde', text: 'Purple Ring power ×100/Lv' },
  { id: 'c_link', name: 'Teamwork', text: 'Combo multiplier +50%/Lv' },
  { id: 'c_gold', name: 'Plunder', text: 'Gold ×10/Lv' },
  { id: 'c_ore', name: 'Mining', text: 'Ore drops +50%/Lv' },
  { id: 'c_crit', name: 'Weak Spot', text: 'Crit rate +5%/Lv' },
  { id: 'c_boss', name: 'Big Game Hunter', text: 'Boss damage ×100/Lv' },
  { id: 'c_perf', name: 'Foresight', text: 'PERFECT window +20%, multiplier +0.5/Lv' },
  { id: 'c_time', name: 'Cog of Time', text: '2x Time gain +20%/Lv' },
];


// Hero rank comes from lifetime ascensions of that hero's ring (never lost).
export const RANKS = [
  { id: 'N', need: 0, col: PAL.mist, mult: 1 },
  { id: 'R', need: 1, col: PAL.sky, mult: 1.5 },
  { id: 'SR', need: 4, col: PAL.rose, mult: 2.5 },
  { id: 'SSR', need: 10, col: PAL.gold, mult: 5 },
  { id: 'UR', need: 25, col: PAL.red, mult: 10 },
];

export const RARITY = [
  { id: 'N', col: PAL.mist, mult: 1.2 },
  { id: 'R', col: PAL.sky, mult: 1.5 },
  { id: 'SR', col: PAL.rose, mult: 2 },
  { id: 'SSR', col: PAL.gold, mult: 3 },
  { id: 'UR', col: PAL.red, mult: 5 },
];

// 32 items: 8 per hero type. fx = special effect id.
const IT = (id, name, type, rar, fx = null, fxText = '') => ({ id, name, type, rar, fx, fxText });
export const ITEMS = [
  IT('it_s1', 'Wooden Sword', 's', 0), IT('it_s2', 'Iron Sword', 's', 0), IT('it_s3', 'Flame Sword', 's', 1), IT('it_s4', 'Twin Blades', 's', 1, 'node', 'Trigger nodes +1'),
  IT('it_s5', 'Spacetime Blade', 's', 2, 'extraLap', '15% chance of an extra spin every lap'), IT('it_s6', 'Dragonslayer Greatsword', 's', 2, 'boss', 'Double damage vs. bosses'), IT('it_s7', 'Holy Sword', 's', 3), IT('it_s8', 'Revolution Greatsword', 's', 4, 'fullSync', 'Perfect Sync power ×20'),
  IT('it_m1', 'Wooden Staff', 'm', 0), IT('it_m2', 'Crystal Staff', 'm', 0), IT('it_m3', 'Frozen Staff', 'm', 1, 'freeze', 'Freezes on hit (damage taken ×1.5)'), IT('it_m4', 'Thunder Staff', 'm', 1),
  IT('it_m5', 'Resonance Staff', 'm', 2, 'syncWin', 'Sync window ×2.5'), IT('it_m6', 'Star Staff', 'm', 2), IT('it_m7', 'Moon Staff', 'm', 3, 'node', 'Trigger nodes +1'), IT('it_m8', 'Sage\'s Staff', 'm', 4),
  IT('it_h1', 'Prayer Bell', 'h', 0), IT('it_h2', 'Holy Ring', 'h', 0), IT('it_h3', 'Angel Wing', 'h', 1), IT('it_h4', 'Healing Grail', 'h', 1),
  IT('it_h5', 'Sun Rosary', 'h', 2, 'haste', 'All Ring speed +20%'), IT('it_h6', 'Shield of Holy Light', 'h', 2), IT('it_h7', 'Goddess Crown', 'h', 3, 'haste', 'All Ring speed +20%'), IT('it_h8', 'Book of Blessings', 'h', 4),
  IT('it_n1', 'Black Grimoire', 'n', 0), IT('it_n2', 'Dragon Egg', 'n', 0), IT('it_n3', 'Spirit Bottle', 'n', 1), IT('it_n4', 'Summoning Key', 'n', 1),
  IT('it_n5', 'Evil Eye Orb', 'n', 2, 'crit', '25% chance of ×4 crits'), IT('it_n6', 'Dragonbone Flute', 'n', 2), IT('it_n7', 'Pact Ring', 'n', 3), IT('it_n8', 'Underworld Scythe', 'n', 4, 'crit', '25% chance of ×4 crits'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: 'Slime', weak: 1 }, { s: 'en_w1_mush', n: 'Angry Shroom', weak: 0 }, { s: 'en_w1_wolf', n: 'Plains Wolf', weak: 1 }, { s: 'enemy_skeleton', n: 'Undead Knight', weak: 0 }, { s: 'enemy_imp', n: 'Imp', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: 'Icefang Wolf', weak: 0 }, { s: 'en_w2_wraith', n: 'Frost Wraith', weak: 0 }, { s: 'en_w2_yeti', n: 'Little Yeti', weak: 1 }, { s: 'en_w2_bat', n: 'Ice Crystal Bat', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: 'Gear Soldier', weak: 1 }, { s: 'en_w3_owl', n: 'Clock Owl', weak: 0 }, { s: 'en_w3_mage', n: 'Hourglass Mage', weak: 0 }, { s: 'enemy_golem', n: 'Brass Golem', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: 'Hollow Eye', weak: 1 }, { s: 'en_w4_jelly', n: 'Star Jelly', weak: 0 }, { s: 'en_w4_knight', n: 'Shadow Knight', weak: 1 }, { s: 'enemy_imp', n: 'Void Imp', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: 'Corridor Specter', weak: 0 }, { s: 'en_w3_mage', n: 'Infinity Mage', weak: 1 }, { s: 'en_w4_knight', n: 'Corridor Warden', weak: 0 }, { s: 'en_w1_wolf', n: 'Lost Wolf', weak: 1 }, { s: 'en_w4_jelly', n: 'Spacetime Jelly', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: 'Boulder King Galdom', scale: 1.6 }, { s: 'boss_dragon', n: 'Abyss Dragon Valgrace', scale: 1 }],
  [{ s: 'bo_w2', n: 'Ice Crystal Empress Neve', scale: 1 }, { s: 'en_w2_yeti', n: 'Great Snow Beast Giga Yeti', scale: 2 }],
  [{ s: 'bo_w3', n: 'Clock Titan Chronos', scale: 1 }, { s: 'en_w3_gear', n: 'Gear General', scale: 2 }],
  [{ s: 'boss_dragon', n: 'Void Dragon', scale: 1 }, { s: 'en_w4_knight', n: 'Shadow King', scale: 1.8 }],
  [{ s: 'bo_w2', n: 'Corridor Empress', scale: 1 }, { s: 'bo_w3', n: 'Corridor Titan', scale: 1 }, { s: 'boss_dragon', n: 'Corridor Dragon', scale: 1 }, { s: 'bo_w4', n: 'Void King\'s Shadow', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: 'Void King Nebulus', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: 'Physical Resist', tip: 'Red Ring damage 1/100', col: PAL.red },
  magic: { name: 'Magic Resist', tip: 'Blue Ring damage 1/100', col: PAL.sky },
  barrier: { name: 'Barrier', tip: 'Nearly immune except to Sync combos', col: PAL.lemon },
  regen: { name: 'Regen', tip: 'Recovers 2% HP per second', col: PAL.leaf },
  rush: { name: 'Ambush', tip: '15 second limit', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: 'Flash Challenge', rule: 'Fight with the Red Ring only', goal: 60, reward: 'Red Ring trigger nodes +1' },
  { id: 'nospeed', name: 'Stillness Challenge', rule: 'Can\'t upgrade speed', goal: 60, reward: 'All Ring speed +15%' },
  { id: 'noasc', name: 'Unyielding Challenge', rule: 'Can\'t Ascend', goal: 70, reward: 'Power kept after Ascension 50% → 65%' },
  { id: 'sync', name: 'Resonance Challenge', rule: 'Non-Sync-combo damage 1/100', goal: 70, reward: 'Combo multiplier ×2' },
  { id: 'nopm', name: 'Origin Challenge', rule: 'Rebirth multiplier disabled', goal: 90, reward: 'Rebirth multiplier growth ×1.2' },
  { id: 'rush', name: 'Instant Challenge', rule: 'Boss time limit 10 seconds', goal: 100, reward: 'BURST lasts +5 seconds' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', 'The First Lap', 'Spin the Rings 100 laps in total', (s) => lapsTotal(s) >= 100),
  A('a_lap2', 'Spin Master', 'Spin the Rings 1,000 laps in total', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', 'Perpetual Motion', 'Spin the Rings 10,000 laps in total', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', 'The World Spins', 'Spin the Rings 100,000 laps in total', (s) => lapsTotal(s) >= 100000),
  A('a_u1', 'Power of 10K', 'Reach 10K attack', (s) => s.units >= 1),
  A('a_u2', 'Power of 100M', 'Reach 100M attack', (s) => s.units >= 2),
  A('a_u3', 'Power of 1T', 'Reach 1T attack', (s) => s.units >= 3),
  A('a_u4', 'Power of 10Qa', 'Reach 10Qa attack', (s) => s.units >= 4),
  A('a_u8', 'Beyond the Trench', 'Reach 1e32 attack', (s) => s.units >= 8),
  A('a_u12', 'To the Extreme', 'Reach 1e48 attack', (s) => s.units >= 12),
  A('a_u17', 'Muryotaisu', 'Reach 1e68 attack', (s) => s.units >= 17),
  A('a_as1', 'First Limit Break', 'Ascend once', (s) => ascTotal(s) >= 1),
  A('a_as2', 'Breakthrough Regular', 'Ascend 20 times in total', (s) => ascTotal(s) >= 20),
  A('a_as3', 'The Limitless', 'Ascend 100 times in total', (s) => ascTotal(s) >= 100),
  A('a_rb1', 'Reborn', 'Rebirth once', (s) => s.stats.rebirths >= 1),
  A('a_rb2', 'Samsara', 'Rebirth 10 times', (s) => s.stats.rebirths >= 10),
  A('a_rb3', 'End of Samsara', 'Rebirth 100 times', (s) => s.stats.rebirths >= 100),
  A('a_c2', 'Overlapping Orbits', '10 Sync combos', (s) => s.stats.combos >= 10),
  A('a_c3', 'Trio', '50 three-color Syncs', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', 'Perfect Sync', '100 four-color Syncs', (s) => s.stats.combo4 >= 100),
  A('a_b1', 'Boss Hunter', 'Defeat 10 bosses', (s) => s.stats.bossKills >= 10),
  A('a_b2', 'Boss Slayer', 'Defeat 100 bosses', (s) => s.stats.bossKills >= 100),
  A('a_b3', 'Legendary Slayer', 'Defeat 1,000 bosses', (s) => s.stats.bossKills >= 1000),
  A('a_tr', 'Gimmick Breaker', 'Defeat 5 bosses with traits', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', 'Collector', '8 items', (s) => s.found.length >= 8),
  A('a_d2', 'Keen Eye', '16 items', (s) => s.found.length >= 16),
  A('a_d3', 'Grand Collector', '24 items', (s) => s.found.length >= 24),
  A('a_d4', 'Codex Complete', 'All 32 items', (s) => s.found.length >= 32),
  A('a_ur', 'Rainbow Radiance', 'Obtain a UR item', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', 'Gateway to Challenges', 'Clear 1 Challenge', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', 'Challenge Seeker', 'Clear 3 Challenges', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', 'All Challenges Conquered', 'Clear all 6 Challenges', (s) => (s.chDone || []).length >= 6),
  A('a_mu', 'Mutation', 'Trigger a Ring mutation', (s) => s.stats.mutations >= 1),
  A('a_rv', 'Revolutionary', 'Revolution once', (s) => s.stats.revolutions >= 1),
  A('a_w2', 'Ice Traveler', 'Reach Stage 100 in the Crystal Gorge', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', 'Time Traveler', 'Reach Stage 100 in the Clockwork City', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', 'Transcendent', 'Transcend', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', 'Defeat the Void King', (s) => s.stats.cleared),
  // secrets
  A('s_harm', 'Harmony', 'Set the 4 Rings\' speed ratio to 1:2:4:8', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', 'Lightning Fast', 'Defeat a boss with 25+ seconds left', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', 'The Watcher', 'Reach Stage 15 after Rebirth without a single upgrade', (s) => !!s.stats.lazy, true),
  A('s_od', 'Rampage', 'Defeat a boss during Overdrive', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: 'Plains of Beginnings', bg: 'bgw_1', law: 'An ordinary world', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: 'Crystal Gorge', bg: 'bgw_2', law: 'Blue Ring ×5 / Red Ring ×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: 'Clockwork City', bg: 'bgw_3', law: 'Spin speed changes erratically / Lap multiplier growth ×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: 'Void Sector', bg: 'bgw_4', law: 'The final world. The Void King awaits at Stage 300', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: 'Endless Corridor', bg: 'bg_temple', law: 'A corridor without end. Infinity Points grow the further you go', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: 'Magic Sword', mult: 3 }, 3: { name: 'Holy Radiance Array', mult: 10 }, 4: { name: 'Revolution Slash', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: 'Double Spin', text: 'One lap grows the multiplier as much as two' },
  { id: 'reverse', name: 'Reverse Spin', text: 'Multiplier growth ×1.6, speed ×0.8' },
  { id: 'split', name: 'Split', text: 'Trigger nodes +2' },
  { id: 'crit', name: 'Crit Focus', text: '30% chance of ×5 crits' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: 'Multi-Spin', text: 'All Ring speed +10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: 'Golden Flow', text: 'Gold gained ×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: 'Secret of the Spin', text: 'Lap multiplier growth +10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: 'Multi-Node', text: 'All Rings\' trigger nodes +1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: 'Auto-Ascension', text: 'Auto-Ascend at max Lv', max: 1, cost: () => 8 },
  { id: 'start', name: 'Accelerated Spacetime', text: 'Start from Stage +10 after Rebirth', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: 'Dream Spin', text: 'Offline efficiency +20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: 'Auto-Rebirth', text: 'Rebirth once the multiplier hits your target', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', 'Spin the Red Ring 15 laps', (s) => [s.stats.laps[0], 15], { text: 'Gold +100', gold: 2 }),
  M('M02', 'Get the Red Ring to Lv10', (s) => [s.rings[0].lv, 10], { text: 'Unlock speed upgrades', feature: 'speed' }),
  M('M03', 'Defeat the Stage 10 boss', (s) => [s.stats.bestStage - 1, 10], { text: 'Unlock item drops and the Codex', feature: 'items' }),
  M('M06', 'Reach Stage 20', (s) => [s.stats.bestStage, 20], { text: 'New ally: Witch Seris + Blue Ring', ring: 1 }),
  M('M07', 'Get 3 Sync combos', (s) => [s.stats.combos, 3], { text: 'Unlock the Ring Lab (adjust speed ratios)', feature: 'lab' }),
  M('M05', 'Get the Red Ring to Lv30 and Ascend', (s) => [s.stats.asc[0], 1], { text: 'Leon Promotion (attack ×1.5) and Legion screen', feature: 'heroes' }),
  M('M41', 'Reach Stage 40', (s) => [s.stats.bestStage, 40], { text: 'Auto-upgrade (buys Lv+ automatically)', feature: 'autoBuy' }),
  M('M09', 'Reach Stage 60', (s) => [s.stats.bestStage, 60], { text: 'Unlock Rebirth', feature: 'rebirth' }),
  M('M10', 'Do a Rebirth', (s) => [s.stats.rebirths, 1], { text: 'Unlock the Permanent tree, Challenges and Weekly Raid', feature: 'perm', feature2: 'raid' }),
  M('M08', 'Find 3 kinds of items', (s) => [s.found.length, 3], { text: 'Unlock Codex bonuses', feature: 'dexBonus' }),
  M('M11', 'Ascend the Red Ring 3 times (total)', (s) => [s.stats.ascTotal[0], 3], { text: 'Red Ring nodes +1', node: 0 }),
  M('M12', 'Reach Stage 100 in a single run', (s) => [s.runBest, 100], { text: 'Saint Elia + Gold Ring', ring: 2 }),
  M('M13', 'Get 30 three-color Syncs', (s) => [s.stats.combo3, 30], { text: 'Unlock BURST', feature: 'burst' }),
  M('M14', 'Find 12 kinds of items', (s) => [s.found.length, 12], { text: 'Equipment slots glow (drop rate UP)', feature: 'luck' }),
  M('M15', 'Rebirth 5 times', (s) => [s.stats.rebirths, 5], { text: 'Blue Ring nodes +1', node: 1 }),
  M('M16', 'Reach Stage 150', (s) => [s.runBest, 150], { text: 'Unlock Auto-tuning', feature: 'autotune' }),
  M('M17', 'Reach Stage 250 in a single run', (s) => [s.runBest, 250], { text: 'Summoner Nox + Purple Ring', ring: 3 }),
  M('M18', 'Get 50 four-color Syncs', (s) => [s.stats.combo4, 50], { text: 'Purple Ring nodes +1', node: 3 }),
  M('M19', 'Raise a hero to SSR (10 total Ascensions)', (s) => [Math.max(...s.stats.ascTotal), 10], { text: 'Bosses always drop Rare or better' }),
  M('M20', 'Find 20 kinds of items', (s) => [s.found.length, 20], { text: 'Codex bonus boost' }),
  M('M21', 'Reach Stage 300 in a single run', (s) => [s.runBest, 300], { text: 'Unlock Revolution (advanced Rebirth)', feature: 'revolution' }),
  M('M22', 'Do a Revolution', (s) => [s.stats.revolutions, 1], { text: 'Ring mutations and the world "Crystal Gorge"', feature: 'mutation', world: 1 }),
  M('M23', 'Trigger Ring mutations 3 times', (s) => [s.stats.mutations, 3], { text: 'Gold Ring nodes +1', node: 2 }),
  M('M24', 'Reach Stage 200 in the Crystal Gorge', (s) => [s.worldBest[1] || 0, 200], { text: 'The world "Clockwork City"', world: 2 }),
  M('M25', 'Revolution 3 times', (s) => [s.stats.revolutions, 3], { text: 'Unlock Transcend', feature: 'transcend' }),
  M('M26', 'Find 28 kinds of items', (s) => [s.found.length, 28], { text: 'Codex bonus boost' }),
  M('M27', 'Transcend', (s) => [s.stats.transcends, 1], { text: 'The final world "Void Sector"', world: 3 }),
  M('M28', 'Defeat the Void King', (s) => [s.stats.cleared ? 1 : 0, 1], { text: 'Unlock Infinity', feature: 'infinity' }),
  M('M29', 'Go Infinity', (s) => [s.inf ? s.inf.count : 0, 1], { text: '2x Time cap ×2', feature: 'fluxPlus' }),
  M('M30', 'Infinity 3 times', (s) => [s.inf ? s.inf.count : 0, 3], { text: 'The path to the Infinity Challenges is revealed' }),
  M('M31', 'Break Infinity', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: 'The Endless Corridor opens', world: 4 }),
  M('M32', 'Reach Stage 100 in the Endless Corridor', (s) => [s.worldBest[4] || 0, 100], { text: 'Infinity Points +5', ip: 5 }),
  M('M33', 'Clear 3 Infinity Challenges', (s) => [(s.infChDone || []).length, 3], { text: 'Infinity Points gain ×2', feature: 'ipDouble' }),
  M('M34', 'Reach Stage 300 in the Endless Corridor', (s) => [s.worldBest[4] || 0, 300], { text: 'Unlock Eternity', feature: 'eternity' }),
  M('M35', 'Go Eternity', (s) => [s.eter ? s.eter.count : 0, 1], { text: 'Unlock Eternity upgrades' }),
  M('M36', 'Get 10 Crystals in Time Dilation', (s) => [s.tp || 0, 10], { text: 'Dilation upgrades start to glow' }),
  M('M37', 'Equip 3 Tactic Cards', (s) => [(s.deck || []).length, 3], { text: 'Tactic Card slots +1', cslot: 1 }),
  M('M38', 'Field 8 heroes in your Legion', (s) => [(s.recruits || []).length, 8], { text: 'Black Ore +10', black: 10 }),
  M('M39', 'Eternity 5 times', (s) => [s.eter ? s.eter.count : 0, 5], { text: 'Eternity Points ×2', feature: 'epDouble' }),
  M('M40', 'Reach Stage 1000 in the Endless Corridor', (s) => [s.worldBest[4] || 0, 1000], { text: 'The True Ending' }),
];

export const FEATURE_INFO = {
  speed: ['Speed Upgrades', 'The faster they spin, the more attacks and the faster multiplier growth.'],
  items: ['Items & Codex', 'Enemies sometimes drop gear. Fill the Codex to power up everything.'],
  heroes: ['Hero Promotion', 'Heroes grow with every Ascension, evolving in looks and attack.'],
  lab: ['Ring Lab', 'With whole-number speed ratios like 1:2 or 1:2:4, the Rings sync up and trigger combos.'],
  dexBonus: ['Codex Bonus', 'All damage rises with every kind of item you\'ve found.'],
  rebirth: ['Rebirth', 'Rebirth once your multiplier has grown enough. The timing is up to you.'],
  perm: ['Permanent Tree', 'Spend Rebirth Cores to unlock automation and permanent upgrades.'],
  burst: ['BURST', 'With a full gauge, Rings spin 5x faster for 10 seconds.'],
  autoBuy: ['Auto-upgrade', 'Lv and speed can now be bought automatically (toggle ON/OFF with the button on the right).'],
  luck: ['Luck', 'Drop rate went up.'],
  autotune: ['Auto-tuning', 'Automatically keeps the best speed ratio.'],
  revolution: ['Revolution', 'An advanced Rebirth. Give up your Rebirth multiplier and Permanent tree to gain Revolution Memories.'],
  mutation: ['Ring Mutation', 'Rings may rarely mutate when you Ascend.'],
  transcend: ['Transcend', 'The ultimate Rebirth, beyond even Revolution.'],
  infinity: ['Infinity', 'You reached ∞. Turn it all into Infinity Points and go even further.'],
  eternity: ['Eternity', 'A layer beyond even Infinity. You can Eternity in the Cosmos tab.'],
  minerals: ['Ore & Smithing', 'Enemies now drop Ore. Refine items in the Cosmos tab.'],
  promotion: ['Advancement', 'Sacrifice your Rebirth multiplier to permanently strengthen your Rings.'],
  fluxPlus: ['2x Time', 'You can now store twice as much 2x Time.'],
  ipDouble: ['Infinity Spring', 'Infinity Points gain is doubled.'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: 'Infinite Acceleration', text: 'All Ring speed ×3', cost: 1 },
  { id: 'pow', name: 'Infinite Power', text: 'All damage ×1e30', cost: 1 },
  { id: 'core', name: 'Infinity Core', text: 'Rebirth Cores ×3', cost: 1 },
  { id: 'mem', name: 'Inherited Memory', text: 'Start with 6 Revolution Memories (you can Transcend right away)', cost: 2 },
  { id: 'autoRev', name: 'Auto-Revolution', text: 'Revolution automatically once conditions are met', cost: 2 },
  { id: 'autoTr', name: 'Auto-Transcend', text: 'Transcend automatically once conditions are met', cost: 2 },
  { id: 'ich', name: 'Infinity Challenge', text: 'Unlock Infinity Challenges', cost: 3 },
  { id: 'gain', name: 'Eternal Spin', text: 'Lap multiplier growth ×1.5', cost: 3 },
  { id: 'break', name: 'Break Infinity', text: 'Go beyond ∞ and the Endless Corridor', cost: 6 },
  { id: 'multi', name: 'Multiverse', text: 'Infinity Points gain ×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: 'One Stroke', rule: 'Can\'t Rebirth', reward: 'Rebirth multiplier growth ×1.5' },
  { id: 'i_noitem', name: 'Bare-Handed Hero', rule: 'No item effects', reward: 'Item multiplier ×2' },
  { id: 'i_norank', name: 'The Nameless', rule: 'No hero Rank multiplier', reward: 'Rank multiplier ×2' },
];

ACHIEVEMENTS.push(
  A('i_1', 'Reaching Infinity', 'Infinity once', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', 'Infinity Regular', 'Infinity 5 times', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', 'Infinity Resident', 'Infinity 20 times', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', 'Break Infinity', 'Beyond ∞', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', 'Infinity Spring', 'Earn 30 Infinity Points in total', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', 'Corridor Traveler', 'Reach Stage 50 in the Endless Corridor', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', 'Corridor Conqueror', 'Reach Stage 300 in the Endless Corridor', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', 'The Endless Road', 'Reach Stage 1000 in the Endless Corridor', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', 'Infinity Challenge', 'Clear 1 Infinity Challenge', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', 'Infinity Seeker', 'Clear all Infinity Challenges', (s) => (s.infChDone || []).length >= 3),
  A('f_use', 'Master of Time', 'Use 2x Time for 1 hour in total', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', 'A Week\'s Journey', 'Log in 7 days in a row', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', 'A Month\'s Journey', 'Log in 30 days in total', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', 'God of Spin', 'Spin the Rings 1,000,000 laps in total', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', 'God of Breakthrough', 'Ascend 500 times in total', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', 'Endless Rebirth', 'Rebirth 1,000 times', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', 'Age of Revolution', 'Revolution 10 times', (s) => s.stats.revolutions >= 10),
  A('s_e1e', 'Off the Charts', 'Reach 1e400 attack', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: 'Eternal Memory', text: 'Infinity upgrades remain even after Eternity', cost: 1 },
  { id: 'autoInf', name: 'Auto-Infinity', text: 'Infinity via automation rules', cost: 1 },
  { id: 'epPow', name: 'Eternal Power', text: 'All damage ×1e50', cost: 2 },
  { id: 'ipx', name: 'Infinity Gusher', text: 'Infinity Points gain ×3', cost: 2 },
  { id: 'cardSlot', name: 'Tactical Talent', text: 'Tactic Card slots +1', cost: 2 },
  { id: 'dil', name: 'Dilation', text: 'Unlock Dilation (the inverted world)', cost: 3 },
  { id: 'startCorr', name: 'Corridor Shortcut', text: 'Start the Endless Corridor from Stage 101', cost: 4 },
  { id: 'lapx', name: 'Eternal Spin', text: 'Lap multiplier growth ×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: 'Warped Spin', text: 'Lap multiplier growth +25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: 'Dilation Relief', text: 'Exponent during Dilation +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: 'Crystal Blade', text: 'All damage ×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: 'Copper Ore', col: PAL.clay },
  { id: 'ag', name: 'Silver Ore', col: PAL.cloud },
  { id: 'au', name: 'Gold Ore', col: PAL.gold },
  { id: 'star', name: 'Star Ore', col: PAL.cyan },
  { id: 'black', name: 'Black Ore', col: PAL.plum },
];
// refine an item: N(0)..UR(4) need these ores per refine level
export const REFINE = [
  { ore: 'cu', n: (r) => 5 + r * 5 },
  { ore: 'ag', n: (r) => 5 + r * 5 },
  { ore: 'au', n: (r) => 5 + r * 5 },
  { ore: 'star', n: (r) => 5 + r * 5 },
  { ore: 'star', n: (r) => 10 + r * 10 },
];

// ===== Tarot: draw with 黒鉱 =====
export const TAROT = [
  { id: 't0', name: 'The Fool', text: '2x Time +30 min' },
  { id: 't1', name: 'The Magician', text: 'All damage ×1e5 for 10 min' },
  { id: 't2', name: 'The High Priestess', text: 'Lap multiplier growth ×2 for 10 min' },
  { id: 't3', name: 'The Empress', text: 'Gold pours in' },
  { id: 't4', name: 'The Emperor', text: 'All Ring speed ×2 for 10 min' },
  { id: 't6', name: 'The Lovers', text: 'Sync window ×2 for 10 min' },
  { id: 't7', name: 'The Chariot', text: 'BURST gauge full' },
  { id: 't8', name: 'Strength', text: 'Permanent ALL damage ×1.1' },
  { id: 't9', name: 'The Hermit', text: 'Get 1 item' },
  { id: 't10', name: 'Wheel of Fortune', text: 'Draw one more card' },
  { id: 't15', name: 'The Devil', text: '66%: permanent ALL damage ×1.5 / 34%: Black Ore -3' },
  { id: 't17', name: 'The Star', text: 'Permanent lap multiplier growth +2%' },
  { id: 't18', name: 'The Moon', text: 'Crit rate +20% for 10 min' },
  { id: 't19', name: 'The Sun', text: 'Gold ×1e10 for 10 min' },
  { id: 't21', name: 'The World', text: 'All Rings Lv+10 (up to the cap)' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: 'Aries', text: 'Red Ring power ×1e8', need: 5 },
  { id: 'z2', name: 'Taurus', text: 'Gold ×1e5', need: 10 },
  { id: 'z3', name: 'Gemini', text: 'All Rings\' trigger nodes +1', need: 15 },
  { id: 'z4', name: 'Cancer', text: 'Offline efficiency +30%', need: 20 },
  { id: 'z5', name: 'Leo', text: 'Boss damage ×1e6', need: 25 },
  { id: 'z6', name: 'Virgo', text: 'Item and Ore drops ×2', need: 30 },
  { id: 'z7', name: 'Libra', text: 'Sync window ×2', need: 35 },
  { id: 'z8', name: 'Scorpio', text: 'Crit rate +15%', need: 40 },
  { id: 'z9', name: 'Sagittarius', text: 'Blue Ring power ×1e8', need: 45 },
  { id: 'z10', name: 'Capricorn', text: 'Rebirth multiplier growth ×1.1', need: 50 },
  { id: 'z11', name: 'Aquarius', text: 'Lap multiplier growth +10%', need: 55 },
  { id: 'z12', name: 'Pisces', text: '2x Time gain ×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', 'Miner', 'Collect # Ore in total', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', 'Blacksmith', 'Refine # times in total', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', 'Tactician', 'Draw # Tactic Cards', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', 'Foresight', 'Land # PERFECTs in total', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', 'Raider', 'Earn # Raid Badges in total', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', 'Advancer', 'Advance # times in total', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', 'Eternity Traveler', 'Eternity # times', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', 'Dilation Collector', 'Collect # Dilation Crystals in total', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', 'Spinner', 'Spin the Rings by hand # laps', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', 'Rapid Tapper', 'Tap the battlefield # times', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', 'Annihilation', 'Defeat # enemies', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', 'Tactics Master', 'Get 1 Tactic Card to Lv10', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', 'Legion Assembled', 'Gather all 12 heroes', (s) => (s.recruits || []).length >= 12),
  A('s_devil', 'Divine Skill', 'Land 50 PERFECTs in a row', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', 'Legendary Raider', 'Get a Rainbow rank in the Raid', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: 'Monthly Pass (30 days)', price: '¥370', text: 'Instant 3 hours of 2x Time, plus 30 days of daily login rewards: 1 hour of 2x Time and Coins (200 enemies\' worth)', cat: 'top' },
  { id: 'rl_grow_rb', name: 'Rebirth Support Pack', price: '¥300', text: '30 Rebirth Cores, 4 hours of 2x Time, Coin Pouch (only for 72 hours after Rebirth unlocks)', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: 'Revolution Support Pack', price: '¥480', text: '100 Rebirth Cores, 10 Black Ore, 8 hours of 2x Time (only for 72 hours after Revolution unlocks)', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: 'Starter Pack', price: '¥400', text: 'Coin Pouch + 8 hours of 2x Time (with late-game materials)', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: 'Remove Ads', price: '¥980', text: 'Claim ad rewards instantly, without ads', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: 'Hero Bundle', price: '¥3,000', text: '7 days of 2x Time, 120 Black Ore, limited Skin "Crimson" (can be bought any number of times; from the 2nd purchase, everything except Skin and Aura)', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: 'Legion Bundle', price: '¥5,000', text: '14 days of 2x Time, 250 Black Ore, limited Skin "Azure Sky", Gold Aura (can be bought any number of times; from the 2nd purchase, everything except Skin and Aura)', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: 'Legend Bundle', price: '¥10,000', text: '30 days of 2x Time, 600 Black Ore, limited Skin "Legend", Rainbow and Gold Auras (can be bought any number of times; from the 2nd purchase, everything except Skin and Aura)', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: 'Legion Pass Premium', price: '¥610', text: 'Premium rewards for this season (30 days). Tiers you\'ve already reached can be claimed retroactively', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: 'Coin Pouch', price: '¥120', text: 'Coins worth 300 enemies at your current stage (resets on Rebirth)', cat: 'item' },
  { id: 'rl_coin_l', name: 'Coin Vault', price: '¥480', text: 'Coins worth 2000 enemies at your current stage (resets on Rebirth)', cat: 'item' },
  { id: 'rl_flux_s', name: '2x Time (S)', price: '¥120', text: '4 hours of the game running at 2x speed', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: '2x Time (L)', price: '¥500', text: '24 hours of the game running at 2x speed', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: 'Black Ore ×10', price: '¥160', text: '10 Tactic Card draws (odds: equal for every card)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: 'Black Ore ×60', price: '¥800', text: '60 Tactic Card draws (odds: equal for every card)', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: '2x Time (XL)', price: '¥980', text: '72 hours of the game running at 2x speed (only counts down while you play)', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: 'Black Ore ×130', price: '¥1,500', text: '130 Tactic Card draws (odds: equal for every card)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: 'Black Ore ×200', price: '¥2,200', text: '200 Tactic Card draws (odds: equal for every card)', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: 'Infinity Pack', price: '¥800', text: 'Infinity Points +5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: 'Eternity Pack', price: '¥800', text: 'Eternity Points +3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: 'Supporter Pack', price: '¥2,000', text: '48 hours of 2x Time, Gold Aura for your heroes (with late-game materials)', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: 'Ring Skin: Neon', price: '¥160', text: 'Cosmetic only. Doesn\'t change your strength', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: 'Ring Skin: Golden', price: '¥160', text: 'Cosmetic only. Doesn\'t change your strength', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: 'Ring Skin: Sakura', price: '¥160', text: 'Cosmetic only. Doesn\'t change your strength', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: '3-Skin Set', price: '¥360', text: 'Neon, Golden and Sakura together (for players who own none of them)', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: 'Rainbow Aura', price: '¥240', text: 'Rainbow light dances around your heroes (cosmetic only)', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: 'Neon', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: 'Golden', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: 'Sakura', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: 'Crimson (Hero Bundle)', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: 'Azure Sky (Legion Bundle)', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: 'Legend (Legend Bundle)', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: 'Void (Pass only)', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: 'Under 16', cap: 5000 }, u18: { name: '16-17', cap: 10000 }, adult: { name: '18 and over', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: 'Coins (60 enemies\' worth)', limit: 10 },
  { id: 'ad_flux', name: '2x Time +30 min', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'BURST gauge full', limit: 6, need: 'burst' },
  { id: 'ad_black', name: 'Black Ore +1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: 'December 2026', title: 'Release', items: ['12 heroes and 4 Rings', 'Rebirth, Revolution, Transcend, Infinity, Eternity', 'Weekly Raid and Legion Pass', 'Original BGM'] },
];
export const NEXT_CHAPTER = 'Every month we\'ll add new heroes, worlds and Raid rules, bit by bit.';
