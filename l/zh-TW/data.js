// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: '紅環', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: '藍環', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: '金環', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: '紫環', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: '雷恩', job: '劍士', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: '每繞一圈就斬擊一次。劍會越來越快。' },
  seris: { name: '賽莉絲', job: '魔女', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: '冰之魔法。擊中弱點威力2倍。' },
  elia: { name: '艾莉雅', job: '聖女', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: '以祈禱加速所有圓環。' },
  nox: { name: '諾克斯', job: '召喚師', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: '召喚精靈龍。速度慢但一擊沉重。' },
  mina: { name: '米娜', job: '雙劍士', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: '觸發節點變2倍。單擊較輕（×0.6）。' },
  garou: { name: '加羅', job: '狂戰士', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: '持續攻擊同一敵人就越強（最大×6）。' },
  volt: { name: '沃特', job: '雷術士', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: '每次同步連擊都會落雷追擊。同步寬限+50%。' },
  luna: { name: '露娜', job: '星詠者', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30%機率暴擊×8。藍環倍率成長+10%。' },
  brom: { name: '布羅姆', job: '鍛造師', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: '黃金×100，礦石2倍。不擅長戰鬥。' },
  tia: { name: '蒂雅', job: '吟遊詩人', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: '同步寬限×2，連擊倍率×2。' },
  zeno: { name: '澤諾', job: '死靈術士', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: '在該關卡擊倒多少就變多強。' },
  sierra: { name: '希艾拉', job: '時魔導士', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: '每繞一圈就自動轉動圓環。全速度+10%。' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: '抵達關卡120', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: '3色以上同步100次', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: '進行革命', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: '累計收集100個礦石', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: '擊倒500隻頭目', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '獲得3個每週突襲徽章', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: '突襲3週達「金」以上', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: '參加突襲6週，或進行永劫', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: '紅之祭典', text: '紅環傷害×3，其他×0.3' },
  { id: 'r_sync', name: '共鳴祭', text: '同步連擊×10，普通攻擊×0.1' },
  { id: 'r_perf', name: '見切試煉', text: 'PERFECT傷害×5' },
  { id: 'r_slow', name: '重力日', text: '圓環速度×0.5，傷害×4' },
  { id: 'r_crit', name: '要害祭', text: '暴擊率+30%' },
  { id: 'r_purple', name: '召喚祭', text: '紫環傷害×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: '速攻', text: '全圓環速度+5%/Lv' },
  { id: 'c_edge', name: '銳刃', text: '紅環威力×100/Lv' },
  { id: 'c_frost', name: '霜之陣', text: '藍環威力×100/Lv' },
  { id: 'c_choir', name: '聖歌', text: '金環威力×100/Lv' },
  { id: 'c_horde', name: '百鬼', text: '紫環威力×100/Lv' },
  { id: 'c_link', name: '連攜', text: '連擊倍率+50%/Lv' },
  { id: 'c_gold', name: '掠奪', text: '黃金×10/Lv' },
  { id: 'c_ore', name: '採礦', text: '礦石出現率+50%/Lv' },
  { id: 'c_crit', name: '要害', text: '暴擊率+5%/Lv' },
  { id: 'c_boss', name: '獵大物', text: '對頭目傷害×100/Lv' },
  { id: 'c_perf', name: '見切', text: 'PERFECT寬限+20%·倍率+0.5/Lv' },
  { id: 'c_time', name: '時之齒輪', text: '倍速時間獲得量+20%/Lv' },
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
  IT('it_s1', '木劍', 's', 0), IT('it_s2', '鐵劍', 's', 0), IT('it_s3', '炎劍', 's', 1), IT('it_s4', '雙劍', 's', 1, 'node', '觸發節點+1'),
  IT('it_s5', '時空刀', 's', 2, 'extraLap', '每圈15%機率額外轉動'), IT('it_s6', '屠龍大劍', 's', 2, 'boss', '對頭目2倍'), IT('it_s7', '聖劍', 's', 3), IT('it_s8', '革命大劍', 's', 4, 'fullSync', '完全同步威力×20'),
  IT('it_m1', '木杖', 'm', 0), IT('it_m2', '水晶杖', 'm', 0), IT('it_m3', '冰結之杖', 'm', 1, 'freeze', '命中時凍結（受傷×1.5）'), IT('it_m4', '雷之杖', 'm', 1),
  IT('it_m5', '共鳴之杖', 'm', 2, 'syncWin', '同步寬限×2.5'), IT('it_m6', '星之杖', 'm', 2), IT('it_m7', '月之杖', 'm', 3, 'node', '觸發節點+1'), IT('it_m8', '賢者之杖', 'm', 4),
  IT('it_h1', '祈禱之鈴', 'h', 0), IT('it_h2', '聖戒指', 'h', 0), IT('it_h3', '天使之羽', 'h', 1), IT('it_h4', '治癒聖杯', 'h', 1),
  IT('it_h5', '太陽念珠', 'h', 2, 'haste', '全圓環速度+20%'), IT('it_h6', '聖光之盾', 'h', 2), IT('it_h7', '女神之冠', 'h', 3, 'haste', '全圓環速度+20%'), IT('it_h8', '祝福之書', 'h', 4),
  IT('it_n1', '黑魔導書', 'n', 0), IT('it_n2', '龍蛋', 'n', 0), IT('it_n3', '精靈瓶', 'n', 1), IT('it_n4', '召喚之鑰', 'n', 1),
  IT('it_n5', '魔眼寶珠', 'n', 2, 'crit', '25%機率暴擊×4'), IT('it_n6', '龍骨笛', 'n', 2), IT('it_n7', '契約之戒', 'n', 3), IT('it_n8', '冥界之鐮', 'n', 4, 'crit', '25%機率暴擊×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: '史萊姆', weak: 1 }, { s: 'en_w1_mush', n: '怒菇', weak: 0 }, { s: 'en_w1_wolf', n: '草原野狼', weak: 1 }, { s: 'enemy_skeleton', n: '亡者騎士', weak: 0 }, { s: 'enemy_imp', n: '小惡魔', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: '冰牙狼', weak: 0 }, { s: 'en_w2_wraith', n: '霜之幽魂', weak: 0 }, { s: 'en_w2_yeti', n: '小雪雪人', weak: 1 }, { s: 'en_w2_bat', n: '冰晶蝙蝠', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: '齒輪兵', weak: 1 }, { s: 'en_w3_owl', n: '時鐘貓頭鷹', weak: 0 }, { s: 'en_w3_mage', n: '沙漏魔導士', weak: 0 }, { s: 'enemy_golem', n: '黃銅魔像', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: '虛空之眼', weak: 1 }, { s: 'en_w4_jelly', n: '星水母', weak: 0 }, { s: 'en_w4_knight', n: '影之騎士', weak: 1 }, { s: 'enemy_imp', n: '虛無小惡魔', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: '迴廊亡靈', weak: 0 }, { s: 'en_w3_mage', n: '無限魔導士', weak: 1 }, { s: 'en_w4_knight', n: '迴廊守衛', weak: 0 }, { s: 'en_w1_wolf', n: '迷途之狼', weak: 1 }, { s: 'en_w4_jelly', n: '時空水母', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: '巨岩王加爾多姆', scale: 1.6 }, { s: 'boss_dragon', n: '深淵龍瓦爾格雷斯', scale: 1 }],
  [{ s: 'bo_w2', n: '冰晶女帝涅韋', scale: 1 }, { s: 'en_w2_yeti', n: '大雪獸巨雪人', scale: 2 }],
  [{ s: 'bo_w3', n: '時鐘巨神克羅諾斯', scale: 1 }, { s: 'en_w3_gear', n: '齒輪將軍', scale: 2 }],
  [{ s: 'boss_dragon', n: '虛無龍', scale: 1 }, { s: 'en_w4_knight', n: '影之王', scale: 1.8 }],
  [{ s: 'bo_w2', n: '迴廊女帝', scale: 1 }, { s: 'bo_w3', n: '迴廊巨神', scale: 1 }, { s: 'boss_dragon', n: '迴廊之龍', scale: 1 }, { s: 'bo_w4', n: '虛無王之影', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: '虛無王涅布拉斯', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: '物理抗性', tip: '紅環傷害1/100', col: PAL.red },
  magic: { name: '魔法抗性', tip: '藍環傷害1/100', col: PAL.sky },
  barrier: { name: '結界', tip: '同步連擊以外幾乎無效', col: PAL.lemon },
  regen: { name: '再生', tip: '每秒回復2%HP', col: PAL.leaf },
  rush: { name: '突襲', tip: '時限15秒', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: '一閃試煉', rule: '只用紅環戰鬥', goal: 60, reward: '紅環觸發節點+1' },
  { id: 'nospeed', name: '靜止試煉', rule: '無法強化速度', goal: 60, reward: '全圓環速度+15%' },
  { id: 'noasc', name: '不屈試煉', rule: '無法昇華', goal: 70, reward: '昇華後保留的力量 50%→65%' },
  { id: 'sync', name: '共鳴試煉', rule: '同步連擊以外的傷害1/100', goal: 70, reward: '連擊倍率×2' },
  { id: 'nopm', name: '原點試煉', rule: '轉生倍率無效', goal: 90, reward: '轉生倍率成長×1.2' },
  { id: 'rush', name: '剎那試煉', rule: '頭目時限10秒', goal: 100, reward: 'BURST持續+5秒' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', '第一圈', '圓環累計100圈', (s) => lapsTotal(s) >= 100),
  A('a_lap2', '旋轉達人', '圓環累計1,000圈', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', '永動機', '圓環累計10,000圈', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', '世界在轉動', '圓環累計100,000圈', (s) => lapsTotal(s) >= 100000),
  A('a_u1', '萬之力', '攻擊力達到1萬', (s) => s.units >= 1),
  A('a_u2', '億之力', '攻擊力達到1億', (s) => s.units >= 2),
  A('a_u3', '兆之力', '攻擊力達到1兆', (s) => s.units >= 3),
  A('a_u4', '京之力', '攻擊力達到1京', (s) => s.units >= 4),
  A('a_u8', '溝之彼端', '攻擊力達到1溝', (s) => s.units >= 8),
  A('a_u12', '邁向極致', '攻擊力達到1極', (s) => s.units >= 12),
  A('a_u17', '無量大數', '攻擊力達到無量大數', (s) => s.units >= 17),
  A('a_as1', '初次突破上限', '昇華1次', (s) => ascTotal(s) >= 1),
  A('a_as2', '突破常客', '昇華累計20次', (s) => ascTotal(s) >= 20),
  A('a_as3', '無極者', '昇華累計100次', (s) => ascTotal(s) >= 100),
  A('a_rb1', '重生', '轉生1次', (s) => s.stats.rebirths >= 1),
  A('a_rb2', '輪迴', '轉生10次', (s) => s.stats.rebirths >= 10),
  A('a_rb3', '輪迴盡頭', '轉生100次', (s) => s.stats.rebirths >= 100),
  A('a_c2', '重疊的軌道', '同步連擊10次', (s) => s.stats.combos >= 10),
  A('a_c3', '三重奏', '3色同步50次', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', '完全同步', '4色同步100次', (s) => s.stats.combo4 >= 100),
  A('a_b1', '頭目獵人', '擊敗10隻頭目', (s) => s.stats.bossKills >= 10),
  A('a_b2', '頭目殺手', '擊敗100隻頭目', (s) => s.stats.bossKills >= 100),
  A('a_b3', '傳說討伐者', '擊敗1,000隻頭目', (s) => s.stats.bossKills >= 1000),
  A('a_tr', '機關攻略', '擊倒5隻帶特性的頭目', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', '收藏家', '道具8種', (s) => s.found.length >= 8),
  A('a_d2', '鑑賞家', '道具16種', (s) => s.found.length >= 16),
  A('a_d3', '大收藏家', '道具24種', (s) => s.found.length >= 24),
  A('a_d4', '圖鑑完成', '道具32種全部', (s) => s.found.length >= 32),
  A('a_ur', '七彩光輝', '獲得UR道具', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', '試煉入口', '通過1個試煉', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', '試煉求道者', '通過3個試煉', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', '試煉全制霸', '通過全部6個試煉', (s) => (s.chDone || []).length >= 6),
  A('a_mu', '突變', '引發圓環變異', (s) => s.stats.mutations >= 1),
  A('a_rv', '革命家', '革命1次', (s) => s.stats.revolutions >= 1),
  A('a_w2', '冰之旅人', '在冰晶峽谷抵達關卡100', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', '時之旅人', '在時鐘之都抵達關卡100', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', '超越者', '進行超越', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', '擊倒虛無王', (s) => s.stats.cleared),
  // secrets
  A('s_harm', '調和', '將4色圓環的速度比調為1:2:4:8', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', '電光石火', '以剩餘25秒以上擊敗頭目', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', '守望者', '轉生後完全不強化，抵達關卡15', (s) => !!s.stats.lazy, true),
  A('s_od', '暴走', '過載中擊敗頭目', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: '起始草原', bg: 'bgw_1', law: '普通世界', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: '冰晶峽谷', bg: 'bgw_2', law: '藍環×5／紅環×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: '時鐘之都', bg: 'bgw_3', law: '旋轉速度不規則變化／旋轉倍率成長×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: '虛無星域', bg: 'bgw_4', law: '最終世界。關卡300有虛無王', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: '無限迴廊', bg: 'bg_temple', law: '沒有盡頭的迴廊。越往前，無限點數越多', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: '魔法劍', mult: 3 }, 3: { name: '聖煌陣', mult: 10 }, 4: { name: '革命連斬', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: '雙重旋轉', text: '1圈相當於2圈的倍率成長' },
  { id: 'reverse', name: '逆向旋轉', text: '倍率成長×1.6·速度×0.8' },
  { id: 'split', name: '分裂', text: '觸發節點+2' },
  { id: 'crit', name: '暴擊特化', text: '30%機率暴擊×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: '多重旋轉', text: '全圓環速度+10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: '黃金之流', text: '獲得黃金×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: '旋轉奧義', text: '旋轉倍率成長+10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: '多重節點', text: '全圓環觸發節點+1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: '自動昇華', text: 'Lv達上限時自動昇華', max: 1, cost: () => 8 },
  { id: 'start', name: '加速時空', text: '轉生後從關卡+10開始', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: '夢之旋轉', text: '離線效率+20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: '自動轉生', text: '倍率達到指定倍數時轉生', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', '讓紅環轉15圈', (s) => [s.stats.laps[0], 15], { text: '黃金+100', gold: 2 }),
  M('M02', '將紅環升到Lv10', (s) => [s.rings[0].lv, 10], { text: '解鎖速度強化', feature: 'speed' }),
  M('M03', '擊敗關卡10的頭目', (s) => [s.stats.bestStage - 1, 10], { text: '解鎖道具掉落與圖鑑', feature: 'items' }),
  M('M06', '抵達關卡20', (s) => [s.stats.bestStage, 20], { text: '新夥伴：魔女賽莉絲＋藍環', ring: 1 }),
  M('M07', '同步連擊3次', (s) => [s.stats.combos, 3], { text: '解鎖圓環實驗室（調整速度比）', feature: 'lab' }),
  M('M05', '將紅環升到Lv30並昇華', (s) => [s.stats.asc[0], 1], { text: '雷恩晉升（攻擊×1.5）·軍團畫面', feature: 'heroes' }),
  M('M41', '抵達關卡40', (s) => [s.stats.bestStage, 40], { text: '自動強化（自動購買Lv+）', feature: 'autoBuy' }),
  M('M09', '抵達關卡60', (s) => [s.stats.bestStage, 60], { text: '解鎖轉生', feature: 'rebirth' }),
  M('M10', '進行轉生', (s) => [s.stats.rebirths, 1], { text: '解鎖永久樹·試煉·每週突襲', feature: 'perm', feature2: 'raid' }),
  M('M08', '發現3種道具', (s) => [s.found.length, 3], { text: '解鎖圖鑑加成', feature: 'dexBonus' }),
  M('M11', '紅環昇華3次（累計）', (s) => [s.stats.ascTotal[0], 3], { text: '紅環節點+1', node: 0 }),
  M('M12', '單輪抵達關卡100', (s) => [s.runBest, 100], { text: '聖女艾莉雅＋金環', ring: 2 }),
  M('M13', '3色同步30次', (s) => [s.stats.combo3, 30], { text: '解鎖BURST', feature: 'burst' }),
  M('M14', '發現12種道具', (s) => [s.found.length, 12], { text: '裝備欄發光（掉落率UP）', feature: 'luck' }),
  M('M15', '轉生5次', (s) => [s.stats.rebirths, 5], { text: '藍環節點+1', node: 1 }),
  M('M16', '抵達關卡150', (s) => [s.runBest, 150], { text: '解鎖自動調校', feature: 'autotune' }),
  M('M17', '單輪抵達關卡250', (s) => [s.runBest, 250], { text: '召喚師諾克斯＋紫環', ring: 3 }),
  M('M18', '4色同步50次', (s) => [s.stats.combo4, 50], { text: '紫環節點+1', node: 3 }),
  M('M19', '英雄升為SSR（累計昇華10次）', (s) => [Math.max(...s.stats.ascTotal), 10], { text: '擊敗頭目必得稀有以上' }),
  M('M20', '發現20種道具', (s) => [s.found.length, 20], { text: '圖鑑加成強化' }),
  M('M21', '單輪抵達關卡300', (s) => [s.runBest, 300], { text: '解鎖革命（高階轉生）', feature: 'revolution' }),
  M('M22', '進行革命', (s) => [s.stats.revolutions, 1], { text: '圓環變異·世界「冰晶峽谷」', feature: 'mutation', world: 1 }),
  M('M23', '引發圓環變異3次', (s) => [s.stats.mutations, 3], { text: '金環節點+1', node: 2 }),
  M('M24', '在冰晶峽谷抵達關卡200', (s) => [s.worldBest[1] || 0, 200], { text: '世界「時鐘之都」', world: 2 }),
  M('M25', '革命3次', (s) => [s.stats.revolutions, 3], { text: '解鎖超越', feature: 'transcend' }),
  M('M26', '發現28種道具', (s) => [s.found.length, 28], { text: '圖鑑加成強化' }),
  M('M27', '進行超越', (s) => [s.stats.transcends, 1], { text: '最終世界「虛無星域」', world: 3 }),
  M('M28', '擊倒虛無王', (s) => [s.stats.cleared ? 1 : 0, 1], { text: '解鎖無限', feature: 'infinity' }),
  M('M29', '進行無限', (s) => [s.inf ? s.inf.count : 0, 1], { text: '倍速時間上限×2', feature: 'fluxPlus' }),
  M('M30', '無限3次', (s) => [s.inf ? s.inf.count : 0, 3], { text: '看見了通往無限試煉的道路' }),
  M('M31', '突破無限', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: '無限迴廊開啟', world: 4 }),
  M('M32', '在無限迴廊抵達關卡100', (s) => [s.worldBest[4] || 0, 100], { text: '無限點數+5', ip: 5 }),
  M('M33', '通過3個無限試煉', (s) => [(s.infChDone || []).length, 3], { text: '無限點數獲得×2', feature: 'ipDouble' }),
  M('M34', '在無限迴廊抵達關卡300', (s) => [s.worldBest[4] || 0, 300], { text: '解鎖永劫', feature: 'eternity' }),
  M('M35', '進行永劫', (s) => [s.eter ? s.eter.count : 0, 1], { text: '解鎖永劫強化' }),
  M('M36', '在時間扭曲取得10個結晶', (s) => [s.tp || 0, 10], { text: '扭曲強化發光' }),
  M('M37', '裝備3張作戰卡', (s) => [(s.deck || []).length, 3], { text: '作戰卡欄位+1', cslot: 1 }),
  M('M38', '軍團達8人', (s) => [(s.recruits || []).length, 8], { text: '黑礦+10', black: 10 }),
  M('M39', '永劫5次', (s) => [s.eter ? s.eter.count : 0, 5], { text: '永劫點數×2', feature: 'epDouble' }),
  M('M40', '無限迴廊抵達關卡1000', (s) => [s.worldBest[4] || 0, 1000], { text: '真結局' }),
];

export const FEATURE_INFO = {
  speed: ['速度強化', '轉得越快，攻擊次數與倍率成長都會提升。'],
  items: ['道具＆圖鑑', '敵人偶爾會掉落裝備。填滿圖鑑可強化整體。'],
  heroes: ['英雄晉升', '每次昇華英雄都會成長，外觀與攻擊也會進化。'],
  lab: ['圓環實驗室', '速度比為1:2或1:2:4等整數比時，圓環會同步並產生連擊。'],
  dexBonus: ['圖鑑加成', '依發現的道具種類提升全傷害。'],
  rebirth: ['轉生', '倍率成長足夠後就轉生吧。時機由你決定。'],
  perm: ['永久樹', '用轉生核心可解鎖自動化與永久強化。'],
  burst: ['BURST', '計量表全滿時，圓環以5倍速運轉10秒。'],
  autoBuy: ['自動強化', '現在可自動購買Lv與速度了（用右邊的按鈕切換ON/OFF）。'],
  luck: ['幸運', '掉落率提升了。'],
  autotune: ['自動調校', '自動維持最佳速度比。'],
  revolution: ['革命', '捨棄轉生倍率與永久樹，獲得革命記憶的高階轉生。'],
  mutation: ['圓環變異', '昇華時，圓環偶爾會突然變異。'],
  transcend: ['超越', '連革命都能超越的最高階轉生。'],
  infinity: ['無限', '到達∞了。將一切化為無限點數，邁向更遠的前方。'],
  eternity: ['永劫', '連無限都能超越的層級。可在宇宙分頁進行永劫。'],
  minerals: ['礦石與鍛造', '敵人會掉落礦石了。可在宇宙分頁精煉道具。'],
  promotion: ['晉升', '獻出轉生倍率，可永久強化圓環。'],
  fluxPlus: ['倍速時間', '可儲存的倍速時間變成2倍了。'],
  ipDouble: ['無限之泉', '無限點數的獲得量變成2倍了。'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: '無限加速', text: '全圓環速度×3', cost: 1 },
  { id: 'pow', name: '無限之力', text: '全傷害×1e30', cost: 1 },
  { id: 'core', name: '無限核心', text: '轉生核心×3', cost: 1 },
  { id: 'mem', name: '記憶傳承', text: '以6個革命記憶開始（可立即超越）', cost: 2 },
  { id: 'autoRev', name: '自動革命', text: '滿足條件時自動革命', cost: 2 },
  { id: 'autoTr', name: '自動超越', text: '滿足條件時自動超越', cost: 2 },
  { id: 'ich', name: '無限試煉', text: '解鎖無限試煉', cost: 3 },
  { id: 'gain', name: '永劫旋轉', text: '旋轉倍率成長×1.5', cost: 3 },
  { id: 'break', name: '突破無限', text: '可超越∞·無限迴廊', cost: 6 },
  { id: 'multi', name: '多重宇宙', text: '無限點數獲得×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: '一筆畫', rule: '無法轉生', reward: '轉生倍率成長×1.5' },
  { id: 'i_noitem', name: '空手英雄', rule: '無道具效果', reward: '道具倍率×2' },
  { id: 'i_norank', name: '無名者', rule: '無英雄階級倍率', reward: '階級倍率×2' },
];

ACHIEVEMENTS.push(
  A('i_1', '抵達無限', '無限1次', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', '無限常客', '無限5次', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', '無限居民', '無限20次', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', '突破無限', '超越∞', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', '無限之泉', '累計獲得30無限點數', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', '迴廊旅人', '在無限迴廊抵達關卡50', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', '迴廊霸者', '在無限迴廊抵達關卡300', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', '無盡之路', '無限迴廊抵達關卡1000', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', '無限試煉', '通過1個無限試煉', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', '無限求道者', '通過全部無限試煉', (s) => (s.infChDone || []).length >= 3),
  A('f_use', '操控時間者', '累計使用倍速時間1小時', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', '一週之旅', '連續登入7天', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', '一個月之旅', '累計登入30天', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', '旋轉之神', '圓環累計1,000,000圈', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', '突破之神', '昇華累計500次', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', '無限轉生', '轉生1,000次', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', '革命時代', '革命10次', (s) => s.stats.revolutions >= 10),
  A('s_e1e', '超乎常理', '攻擊力達到1e400', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: '永劫記憶', text: '即使永劫，無限強化仍會保留', cost: 1 },
  { id: 'autoInf', name: '自動無限', text: '以自動化規則進行無限', cost: 1 },
  { id: 'epPow', name: '永劫之力', text: '全傷害×1e50', cost: 2 },
  { id: 'ipx', name: '無限湧泉', text: '無限點數獲得×3', cost: 2 },
  { id: 'cardSlot', name: '作戰之才', text: '作戰卡欄位+1', cost: 2 },
  { id: 'dil', name: '裏世界', text: '解鎖裏世界（反轉的世界）', cost: 3 },
  { id: 'startCorr', name: '迴廊捷徑', text: '從關卡101開始無限迴廊', cost: 4 },
  { id: 'lapx', name: '永劫旋轉', text: '旋轉倍率成長×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: '扭曲旋轉', text: '旋轉倍率成長+25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: '扭曲緩和', text: '扭曲中的指數 +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: '結晶之刃', text: '全傷害×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: '銅礦', col: PAL.clay },
  { id: 'ag', name: '銀礦', col: PAL.cloud },
  { id: 'au', name: '金礦', col: PAL.gold },
  { id: 'star', name: '星礦', col: PAL.cyan },
  { id: 'black', name: '黑礦', col: PAL.plum },
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
  { id: 't0', name: '愚者', text: '倍速時間+30分鐘' },
  { id: 't1', name: '魔術師', text: '10分鐘 全傷害×1e5' },
  { id: 't2', name: '女教皇', text: '10分鐘 旋轉倍率成長×2' },
  { id: 't3', name: '女帝', text: '湧出大量黃金' },
  { id: 't4', name: '皇帝', text: '10分鐘 全圓環速度×2' },
  { id: 't6', name: '戀人', text: '10分鐘 同步寬限×2' },
  { id: 't7', name: '戰車', text: 'BURST計量表全滿' },
  { id: 't8', name: '力量', text: '永久 全傷害×1.1' },
  { id: 't9', name: '隱者', text: '獲得1個道具' },
  { id: 't10', name: '命運之輪', text: '再抽1張其他卡' },
  { id: 't15', name: '惡魔', text: '66%機率永久 全傷害×1.5／34%機率黑礦-3' },
  { id: 't17', name: '星星', text: '永久 旋轉倍率成長+2%' },
  { id: 't18', name: '月亮', text: '10分鐘 暴擊率+20%' },
  { id: 't19', name: '太陽', text: '10分鐘 黃金×1e10' },
  { id: 't21', name: '世界', text: '全圓環Lv+10（至上限）' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: '白羊座', text: '紅環威力×1e8', need: 5 },
  { id: 'z2', name: '金牛座', text: '黃金×1e5', need: 10 },
  { id: 'z3', name: '雙子座', text: '全圓環觸發節點+1', need: 15 },
  { id: 'z4', name: '巨蟹座', text: '離線效率+30%', need: 20 },
  { id: 'z5', name: '獅子座', text: '對頭目傷害×1e6', need: 25 },
  { id: 'z6', name: '處女座', text: '道具與礦石掉落×2', need: 30 },
  { id: 'z7', name: '天秤座', text: '同步寬限×2', need: 35 },
  { id: 'z8', name: '天蠍座', text: '暴擊率+15%', need: 40 },
  { id: 'z9', name: '射手座', text: '藍環威力×1e8', need: 45 },
  { id: 'z10', name: '摩羯座', text: '轉生倍率成長×1.1', need: 50 },
  { id: 'z11', name: '水瓶座', text: '旋轉倍率成長+10%', need: 55 },
  { id: 'z12', name: '雙魚座', text: '倍速時間獲得×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', '採礦者', '累計礦石#個', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', '鍛造師', '累計精煉#次', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', '作戰家', '抽作戰卡#張', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', '見切', '累計PERFECT #次', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', '突襲者', '累計突襲徽章#個', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', '晉升者', '累計晉升#次', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', '永劫旅人', '永劫#次', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', '扭曲收集家', '累計扭曲結晶#個', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', '轉圈達人', '親手轉動圓環#圈', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', '連打', '點擊戰場#次', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', '殲滅', '擊倒#隻敵人', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', '作戰達人', '將1張作戰卡升到Lv10', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', '軍團成軍', '集齊12位英雄', (s) => (s.recruits || []).length >= 12),
  A('s_devil', '神乎其技', '連續50次PERFECT', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', '傳說突襲者', '突襲獲得「虹」評價', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: '月票（30日）', price: '¥370', text: '立即獲得倍速時間3小時，並於30天內每天登入可得倍速時間1小時與金幣（相當於200隻敵人）', cat: 'top' },
  { id: 'rl_grow_rb', name: '轉生支援包', price: '¥300', text: '轉生核心30·倍速時間4小時·金幣袋（解鎖轉生後僅限72小時）', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: '革命支援包', price: '¥480', text: '轉生核心100·黑礦10·倍速時間8小時（解鎖革命後僅限72小時）', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: '新手包', price: '¥400', text: '金幣袋＋倍速時間8小時（附後期素材）', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: '移除廣告', price: '¥980', text: '無需看廣告即可直接領取廣告獎勵', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: '英雄組合包', price: '¥3,000', text: '倍速時間7日·黑礦120·限定換裝「紅蓮」（可重複購買。第2次起不含換裝·光環）', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: '軍團組合包', price: '¥5,000', text: '倍速時間14日·黑礦250·限定換裝「蒼天」·金色光環（可重複購買。第2次起不含換裝·光環）', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: '傳說組合包', price: '¥10,000', text: '倍速時間30日·黑礦600·限定換裝「傳說」·虹色與金色光環（可重複購買。第2次起不含換裝·光環）', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: '軍團通行證 高級', price: '¥610', text: '本賽季（30日）的高級獎勵。已達成的階也能回溯領取', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: '金幣袋', price: '¥120', text: '目前關卡300隻敵人份的金幣（轉生時重置）', cat: 'item' },
  { id: 'rl_coin_l', name: '金幣金庫', price: '¥480', text: '目前關卡2000隻敵人份的金幣（轉生時重置）', cat: 'item' },
  { id: 'rl_flux_s', name: '倍速時間（小）', price: '¥120', text: '遊戲以2倍速進行的時間 4小時份', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: '倍速時間（大）', price: '¥500', text: '遊戲以2倍速進行的時間 24小時份', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: '黑礦×10', price: '¥160', text: '可抽10次作戰卡（機率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: '黑礦×60', price: '¥800', text: '可抽60次作戰卡（機率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: '倍速時間（特大）', price: '¥980', text: '遊戲以2倍速進行的時間 72小時份（僅在遊玩時消耗）', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: '黑礦×130', price: '¥1,500', text: '可抽130次作戰卡（機率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: '黑礦×200', price: '¥2,200', text: '可抽200次作戰卡（機率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: '無限包', price: '¥800', text: '無限點數+5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: '永劫包', price: '¥800', text: '永劫點數+3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: '支持者包', price: '¥2,000', text: '倍速時間48小時·英雄金色光環（附後期素材）', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: '圓環換裝：霓虹', price: '¥160', text: '僅外觀，不影響強度', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: '圓環換裝：黃金', price: '¥160', text: '僅外觀，不影響強度', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: '圓環換裝：櫻花', price: '¥160', text: '僅外觀，不影響強度', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: '換裝3款組', price: '¥360', text: '霓虹·黃金·櫻花一次到手（適合三款都沒有的人）', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: '虹色光環', price: '¥240', text: '英雄身上散發虹色光芒（僅外觀）', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: '霓虹', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: '黃金', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: '櫻花', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: '紅蓮（英雄組合包）', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: '蒼天（軍團組合包）', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: '傳說（傳說組合包）', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: '虛空（通行證限定）', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: '未滿16歲', cap: 5000 }, u18: { name: '16〜17歲', cap: 10000 }, adult: { name: '18歲以上', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: '金幣（60隻敵人份）', limit: 10 },
  { id: 'ad_flux', name: '倍速時間+30分鐘', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'BURST計量表全滿', limit: 6, need: 'burst' },
  { id: 'ad_black', name: '黑礦+1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: '2026年12月', title: '發售', items: ['12位英雄與4種圓環', '轉生·革命·超越·無限·永劫', '每週突襲與軍團通行證', '原創BGM'] },
];
export const NEXT_CHAPTER = '今後每月將陸續追加新英雄、世界與突襲規則。';
