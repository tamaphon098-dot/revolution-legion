// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: '赤リング', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: '青リング', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: '黄リング', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: '紫リング', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: 'レオン', job: '剣士', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: '一周ごとに斬撃。剣はどこまでも速くなる。' },
  seris: { name: 'セリス', job: '魔女', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: '氷の魔法。弱点を突くと威力2倍。' },
  elia: { name: 'エリア', job: '聖女', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: '祈りで全リングを加速させる。' },
  nox: { name: 'ノクス', job: '召喚士', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: '精霊竜を呼ぶ。遅いが一撃が重い。' },
  mina: { name: 'ミナ', job: '双剣士', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: '発動ノードが2倍。1撃は軽い（×0.6）。' },
  garou: { name: 'ガロウ', job: '狂戦士', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: '同じ敵に当て続けるほど強くなる（最大×6）。' },
  volt: { name: 'ヴォルト', job: '雷術士', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: '同期コンボのたびに落雷で追撃。同期の猶予+50%。' },
  luna: { name: 'ルナ', job: '星詠み', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30%で会心×8。青リングの倍率の伸び+10%。' },
  brom: { name: 'ブロム', job: '鍛冶師', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: 'ゴールド×100、鉱石2倍。戦いは苦手。' },
  tia: { name: 'ティア', job: '吟遊詩人', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: '同期の猶予×2、コンボ倍率×2。' },
  zeno: { name: 'ゼノ', job: '死霊術師', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: 'そのステージで倒した数だけ強くなる。' },
  sierra: { name: 'シエラ', job: '時魔導士', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: '1周ごとにリングを自動で回す。全速度+10%。' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: 'ステージ120に到達', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: '3色以上の同期を100回', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: '革命する', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: '鉱石を合計100個集める', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: 'ボスを500体倒す', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '週替わりレイドの徽章を3つ', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: 'レイドで3週「金」以上', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: 'レイドで6週参加、または永劫する', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: '赤の祭典', text: '赤リングのダメージ×3、他は×0.3' },
  { id: 'r_sync', name: '共鳴祭', text: '同期コンボ×10、通常攻撃×0.1' },
  { id: 'r_perf', name: '見切りの試練', text: 'PERFECTのダメージ×5' },
  { id: 'r_slow', name: '重力の日', text: 'リング速度×0.5、ダメージ×4' },
  { id: 'r_crit', name: '急所祭', text: '会心率+30%' },
  { id: 'r_purple', name: '召喚祭', text: '紫リングのダメージ×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: '速攻', text: '全リング速度+5%/Lv' },
  { id: 'c_edge', name: '鋭刃', text: '赤リング威力×100/Lv' },
  { id: 'c_frost', name: '霜の陣', text: '青リング威力×100/Lv' },
  { id: 'c_choir', name: '聖歌', text: '黄リング威力×100/Lv' },
  { id: 'c_horde', name: '百鬼', text: '紫リング威力×100/Lv' },
  { id: 'c_link', name: '連携', text: 'コンボ倍率+50%/Lv' },
  { id: 'c_gold', name: '略奪', text: 'ゴールド×10/Lv' },
  { id: 'c_ore', name: '採掘', text: '鉱石の出現+50%/Lv' },
  { id: 'c_crit', name: '急所', text: '会心率+5%/Lv' },
  { id: 'c_boss', name: '大物狩り', text: 'ボスへのダメージ×100/Lv' },
  { id: 'c_perf', name: '見切り', text: 'PERFECTの猶予+20%・倍率+0.5/Lv' },
  { id: 'c_time', name: '時の歯車', text: '倍速タイムの獲得+20%/Lv' },
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
  IT('it_s1', '木の剣', 's', 0), IT('it_s2', '鉄の剣', 's', 0), IT('it_s3', '炎の剣', 's', 1), IT('it_s4', '双剣', 's', 1, 'node', '発動ノード+1'),
  IT('it_s5', '時空刀', 's', 2, 'extraLap', '1周ごと15%で追加回転'), IT('it_s6', '竜殺しの大剣', 's', 2, 'boss', 'ボスに2倍'), IT('it_s7', '聖剣', 's', 3), IT('it_s8', '革命の大剣', 's', 4, 'fullSync', '完全同期の威力×20'),
  IT('it_m1', '木の杖', 'm', 0), IT('it_m2', '水晶の杖', 'm', 0), IT('it_m3', '氷結の杖', 'm', 1, 'freeze', '命中で凍結（被ダメ×1.5）'), IT('it_m4', '雷の杖', 'm', 1),
  IT('it_m5', '共鳴の杖', 'm', 2, 'syncWin', '同期の猶予×2.5'), IT('it_m6', '星の杖', 'm', 2), IT('it_m7', '月の杖', 'm', 3, 'node', '発動ノード+1'), IT('it_m8', '賢者の杖', 'm', 4),
  IT('it_h1', '祈りの鈴', 'h', 0), IT('it_h2', '聖なる指輪', 'h', 0), IT('it_h3', '天使の羽', 'h', 1), IT('it_h4', '癒しの聖杯', 'h', 1),
  IT('it_h5', '太陽のロザリオ', 'h', 2, 'haste', '全リング速度+20%'), IT('it_h6', '聖光の盾', 'h', 2), IT('it_h7', '女神の冠', 'h', 3, 'haste', '全リング速度+20%'), IT('it_h8', '祝福の書', 'h', 4),
  IT('it_n1', '黒の魔導書', 'n', 0), IT('it_n2', '竜の卵', 'n', 0), IT('it_n3', '精霊の瓶', 'n', 1), IT('it_n4', '召喚の鍵', 'n', 1),
  IT('it_n5', '魔眼の宝珠', 'n', 2, 'crit', '25%で会心×4'), IT('it_n6', '竜骨の笛', 'n', 2), IT('it_n7', '契約の指輪', 'n', 3), IT('it_n8', '冥界の鎌', 'n', 4, 'crit', '25%で会心×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: 'スライム', weak: 1 }, { s: 'en_w1_mush', n: 'いかりダケ', weak: 0 }, { s: 'en_w1_wolf', n: '草原オオカミ', weak: 1 }, { s: 'enemy_skeleton', n: '亡者の騎士', weak: 0 }, { s: 'enemy_imp', n: 'インプ', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: '氷牙ウルフ', weak: 0 }, { s: 'en_w2_wraith', n: 'フロストレイス', weak: 0 }, { s: 'en_w2_yeti', n: 'こゆきイエティ', weak: 1 }, { s: 'en_w2_bat', n: '氷晶コウモリ', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: '歯車兵', weak: 1 }, { s: 'en_w3_owl', n: '時計フクロウ', weak: 0 }, { s: 'en_w3_mage', n: '砂時計の魔導士', weak: 0 }, { s: 'enemy_golem', n: '真鍮ゴーレム', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: '虚ろな眼', weak: 1 }, { s: 'en_w4_jelly', n: '星くらげ', weak: 0 }, { s: 'en_w4_knight', n: '影の騎士', weak: 1 }, { s: 'enemy_imp', n: '虚無インプ', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: '回廊の亡霊', weak: 0 }, { s: 'en_w3_mage', n: '無限の魔導士', weak: 1 }, { s: 'en_w4_knight', n: '回廊の番人', weak: 0 }, { s: 'en_w1_wolf', n: '迷い狼', weak: 1 }, { s: 'en_w4_jelly', n: '時空くらげ', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: '巨岩王ガルドム', scale: 1.6 }, { s: 'boss_dragon', n: '深淵竜ヴァルグレイス', scale: 1 }],
  [{ s: 'bo_w2', n: '氷晶女帝ネーヴェ', scale: 1 }, { s: 'en_w2_yeti', n: '大雪獣ギガイエティ', scale: 2 }],
  [{ s: 'bo_w3', n: '時計巨神クロノス', scale: 1 }, { s: 'en_w3_gear', n: '歯車将軍', scale: 2 }],
  [{ s: 'boss_dragon', n: '虚無竜', scale: 1 }, { s: 'en_w4_knight', n: '影の王', scale: 1.8 }],
  [{ s: 'bo_w2', n: '回廊の女帝', scale: 1 }, { s: 'bo_w3', n: '回廊の巨神', scale: 1 }, { s: 'boss_dragon', n: '回廊の竜', scale: 1 }, { s: 'bo_w4', n: '虚無王の影', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: '虚無王ネビュラス', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: '物理耐性', tip: '赤リングのダメージ1/100', col: PAL.red },
  magic: { name: '魔法耐性', tip: '青リングのダメージ1/100', col: PAL.sky },
  barrier: { name: '結界', tip: '同期コンボ以外ほぼ無効', col: PAL.lemon },
  regen: { name: '再生', tip: '毎秒HPが2%回復', col: PAL.leaf },
  rush: { name: '急襲', tip: '制限時間15秒', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: '一閃の試練', rule: '赤リングだけで戦う', goal: 60, reward: '赤リングの発動ノード+1' },
  { id: 'nospeed', name: '静止の試練', rule: '速度強化ができない', goal: 60, reward: '全リング速度+15%' },
  { id: 'noasc', name: '不屈の試練', rule: 'アセンションできない', goal: 70, reward: 'アセンションで残るパワー 50%→65%' },
  { id: 'sync', name: '共鳴の試練', rule: '同期コンボ以外のダメージ1/100', goal: 70, reward: 'コンボ倍率×2' },
  { id: 'nopm', name: '原点の試練', rule: '転生倍率が無効', goal: 90, reward: '転生倍率の伸び×1.2' },
  { id: 'rush', name: '刹那の試練', rule: 'ボスの制限時間10秒', goal: 100, reward: 'BURSTの持続+5秒' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', 'はじめの一周', 'リングを合計100周', (s) => lapsTotal(s) >= 100),
  A('a_lap2', '回転の達人', 'リングを合計1,000周', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', '永久機関', 'リングを合計10,000周', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', '世界が回る', 'リングを合計100,000周', (s) => lapsTotal(s) >= 100000),
  A('a_u1', '万の力', '攻撃力が1万に到達', (s) => s.units >= 1),
  A('a_u2', '億の力', '攻撃力が1億に到達', (s) => s.units >= 2),
  A('a_u3', '兆の力', '攻撃力が1兆に到達', (s) => s.units >= 3),
  A('a_u4', '京の力', '攻撃力が1京に到達', (s) => s.units >= 4),
  A('a_u8', '溝の彼方', '攻撃力が1溝に到達', (s) => s.units >= 8),
  A('a_u12', '極みへ', '攻撃力が1極に到達', (s) => s.units >= 12),
  A('a_u17', '無量大数', '攻撃力が無量大数に到達', (s) => s.units >= 17),
  A('a_as1', 'はじめての上限突破', 'アセンション1回', (s) => ascTotal(s) >= 1),
  A('a_as2', '突破の常連', 'アセンション合計20回', (s) => ascTotal(s) >= 20),
  A('a_as3', '限界なき者', 'アセンション合計100回', (s) => ascTotal(s) >= 100),
  A('a_rb1', '生まれ変わり', '転生1回', (s) => s.stats.rebirths >= 1),
  A('a_rb2', '輪廻', '転生10回', (s) => s.stats.rebirths >= 10),
  A('a_rb3', '輪廻の果て', '転生100回', (s) => s.stats.rebirths >= 100),
  A('a_c2', '重なる軌道', '同期コンボ10回', (s) => s.stats.combos >= 10),
  A('a_c3', '三重奏', '3色同期50回', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', '完全同期', '4色同期100回', (s) => s.stats.combo4 >= 100),
  A('a_b1', 'ボスハンター', 'ボス10体撃破', (s) => s.stats.bossKills >= 10),
  A('a_b2', 'ボススレイヤー', 'ボス100体撃破', (s) => s.stats.bossKills >= 100),
  A('a_b3', '伝説の討伐者', 'ボス1,000体撃破', (s) => s.stats.bossKills >= 1000),
  A('a_tr', 'ギミック攻略', '特性つきボスを5体倒す', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', '収集家', 'アイテム8種', (s) => s.found.length >= 8),
  A('a_d2', '目利き', 'アイテム16種', (s) => s.found.length >= 16),
  A('a_d3', '大収集家', 'アイテム24種', (s) => s.found.length >= 24),
  A('a_d4', '図鑑コンプリート', 'アイテム32種すべて', (s) => s.found.length >= 32),
  A('a_ur', '虹色の輝き', 'URアイテムを手に入れる', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', '試練の入口', '試練を1つクリア', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', '試練の求道者', '試練を3つクリア', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', '全試練制覇', '試練を6つすべてクリア', (s) => (s.chDone || []).length >= 6),
  A('a_mu', '突然変異', 'リング変異を起こす', (s) => s.stats.mutations >= 1),
  A('a_rv', '革命家', '革命1回', (s) => s.stats.revolutions >= 1),
  A('a_w2', '氷の旅人', '氷晶の峡谷でステージ100', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', '時の旅人', '時計仕掛けの都でステージ100', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', '超越者', '超越する', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', '虚無王を倒す', (s) => s.stats.cleared),
  // secrets
  A('s_harm', '調和', '4色のリングの速度比を1:2:4:8にそろえる', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', '電光石火', 'ボスを残り25秒以上で倒す', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', '見守る者', '転生直後から一度も強化せずにステージ15に到達', (s) => !!s.stats.lazy, true),
  A('s_od', '暴走', 'オーバードライブ中にボスを倒す', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: 'はじまりの草原', bg: 'bgw_1', law: 'ふつうの世界', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: '氷晶の峡谷', bg: 'bgw_2', law: '青リング×5／赤リング×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: '時計仕掛けの都', bg: 'bgw_3', law: '回転速度が不規則に変化／回転倍率の伸び×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: '虚無の宙域', bg: 'bgw_4', law: '最終世界。ステージ300に虚無王', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: '無限回廊', bg: 'bg_temple', law: '終わりのない回廊。進むほど無限ポイントが増える', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: '魔法剣', mult: 3 }, 3: { name: '聖煌陣', mult: 10 }, 4: { name: '革命連斬', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: '二重回転', text: '1周で2周ぶん倍率が伸びる' },
  { id: 'reverse', name: '逆回転', text: '倍率の伸び×1.6・速度×0.8' },
  { id: 'split', name: '分裂', text: '発動ノード+2' },
  { id: 'crit', name: '会心特化', text: '30%で会心×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: '多重回転', text: '全リング速度+10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: '黄金の流れ', text: '獲得ゴールド×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: '回転の極意', text: '回転倍率の伸び+10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: '多重ノード', text: '全リングの発動ノード+1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: '自動アセンション', text: 'Lv上限で自動アセンション', max: 1, cost: () => 8 },
  { id: 'start', name: '加速の時空', text: '転生後ステージ+10から', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: '夢の回転', text: 'オフライン効率+20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: '自動転生', text: '倍率が指定倍に届いたら転生', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', '赤リングを15周させる', (s) => [s.stats.laps[0], 15], { text: 'ゴールド+100', gold: 2 }),
  M('M02', '赤リングをLv10にする', (s) => [s.rings[0].lv, 10], { text: '速度強化を解放', feature: 'speed' }),
  M('M03', 'ステージ10のボスを倒す', (s) => [s.stats.bestStage - 1, 10], { text: 'アイテムドロップと図鑑を解放', feature: 'items' }),
  M('M06', 'ステージ20に到達', (s) => [s.stats.bestStage, 20], { text: '新しい仲間：魔女セリス＋青リング', ring: 1 }),
  M('M07', '同期コンボを3回', (s) => [s.stats.combos, 3], { text: 'リングラボを解放（速度比の調整）', feature: 'lab' }),
  M('M05', '赤リングをLv30にしてアセンション', (s) => [s.stats.asc[0], 1], { text: 'レオン昇格（攻撃×1.5）・軍団画面', feature: 'heroes' }),
  M('M41', 'ステージ40に到達', (s) => [s.stats.bestStage, 40], { text: '自動強化（Lv+を自動で買う）', feature: 'autoBuy' }),
  M('M09', 'ステージ60に到達', (s) => [s.stats.bestStage, 60], { text: '転生を解放', feature: 'rebirth' }),
  M('M10', '転生する', (s) => [s.stats.rebirths, 1], { text: '永続ツリー・試練・週替わりレイドを解放', feature: 'perm', feature2: 'raid' }),
  M('M08', 'アイテムを3種類見つける', (s) => [s.found.length, 3], { text: '図鑑ボーナスを解放', feature: 'dexBonus' }),
  M('M11', '赤リングを3回アセンション（累計）', (s) => [s.stats.ascTotal[0], 3], { text: '赤リングのノード+1', node: 0 }),
  M('M12', '1回の周回でステージ100', (s) => [s.runBest, 100], { text: '聖女エリア＋黄リング', ring: 2 }),
  M('M13', '3色同期を30回', (s) => [s.stats.combo3, 30], { text: 'BURSTを解放', feature: 'burst' }),
  M('M14', 'アイテムを12種類見つける', (s) => [s.found.length, 12], { text: '装備スロットが光る（ドロップ率UP）', feature: 'luck' }),
  M('M15', '転生を5回', (s) => [s.stats.rebirths, 5], { text: '青リングのノード+1', node: 1 }),
  M('M16', 'ステージ150に到達', (s) => [s.runBest, 150], { text: '自動チューニングを解放', feature: 'autotune' }),
  M('M17', '1回の周回でステージ250', (s) => [s.runBest, 250], { text: '召喚士ノクス＋紫リング', ring: 3 }),
  M('M18', '4色同期を50回', (s) => [s.stats.combo4, 50], { text: '紫リングのノード+1', node: 3 }),
  M('M19', '英雄をSSRに（累計アセンション10）', (s) => [Math.max(...s.stats.ascTotal), 10], { text: 'ボス討伐で必ずレア以上' }),
  M('M20', 'アイテムを20種類見つける', (s) => [s.found.length, 20], { text: '図鑑ボーナス強化' }),
  M('M21', '1回の周回でステージ300', (s) => [s.runBest, 300], { text: '革命（上位転生）を解放', feature: 'revolution' }),
  M('M22', '革命する', (s) => [s.stats.revolutions, 1], { text: 'リング変異・世界「氷晶の峡谷」', feature: 'mutation', world: 1 }),
  M('M23', 'リング変異を3回起こす', (s) => [s.stats.mutations, 3], { text: '黄リングのノード+1', node: 2 }),
  M('M24', '氷晶の峡谷でステージ200', (s) => [s.worldBest[1] || 0, 200], { text: '世界「時計仕掛けの都」', world: 2 }),
  M('M25', '革命を3回', (s) => [s.stats.revolutions, 3], { text: '超越を解放', feature: 'transcend' }),
  M('M26', 'アイテムを28種類見つける', (s) => [s.found.length, 28], { text: '図鑑ボーナス強化' }),
  M('M27', '超越する', (s) => [s.stats.transcends, 1], { text: '最終世界「虚無の宙域」', world: 3 }),
  M('M28', '虚無王を倒す', (s) => [s.stats.cleared ? 1 : 0, 1], { text: 'インフィニティを解放', feature: 'infinity' }),
  M('M29', 'インフィニティする', (s) => [s.inf ? s.inf.count : 0, 1], { text: '倍速タイムの上限×2', feature: 'fluxPlus' }),
  M('M30', 'インフィニティを3回', (s) => [s.inf ? s.inf.count : 0, 3], { text: '無限の試練への道が見えた' }),
  M('M31', '限界突破する', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: '無限回廊が開く', world: 4 }),
  M('M32', '無限回廊でステージ100', (s) => [s.worldBest[4] || 0, 100], { text: '無限ポイント+5', ip: 5 }),
  M('M33', '無限の試練を3つクリア', (s) => [(s.infChDone || []).length, 3], { text: '無限ポイント獲得×2', feature: 'ipDouble' }),
  M('M34', '無限回廊でステージ300', (s) => [s.worldBest[4] || 0, 300], { text: '永劫（エタニティ）を解放', feature: 'eternity' }),
  M('M35', '永劫する', (s) => [s.eter ? s.eter.count : 0, 1], { text: '永劫の強化を解放' }),
  M('M36', '時間の歪みで結晶を10個', (s) => [s.tp || 0, 10], { text: '歪みの強化が光る' }),
  M('M37', '作戦カードを3枚装備', (s) => [(s.deck || []).length, 3], { text: '作戦カードの枠+1', cslot: 1 }),
  M('M38', '軍団を8人にする', (s) => [(s.recruits || []).length, 8], { text: '黒鉱+10', black: 10 }),
  M('M39', '永劫を5回', (s) => [s.eter ? s.eter.count : 0, 5], { text: '永劫ポイント×2', feature: 'epDouble' }),
  M('M40', '無限回廊でステージ1000', (s) => [s.worldBest[4] || 0, 1000], { text: '真のエンディング' }),
];

export const FEATURE_INFO = {
  speed: ['速度強化', '速く回るほど攻撃回数も倍率の伸びも上がる。'],
  items: ['アイテム＆図鑑', '敵がまれに装備を落とす。図鑑を埋めると全体が強くなる。'],
  heroes: ['英雄の昇格', 'アセンションするたびに英雄が育ち、見た目と攻撃が進化する。'],
  lab: ['リングラボ', '速度比が1:2や1:2:4のような整数比だとリングが同期してコンボが出る。'],
  dexBonus: ['図鑑ボーナス', '見つけたアイテムの種類だけ全ダメージが上がる。'],
  rebirth: ['転生', '倍率が十分伸びたら転生しよう。タイミングは自分で決める。'],
  perm: ['永続ツリー', '転生コアで自動化や永続強化を解放できる。'],
  burst: ['BURST', 'ゲージが満タンで10秒間リングが5倍速。'],
  autoBuy: ['自動強化', 'Lvと速度を自動で買えるようになった（右のボタンでON/OFF）。'],
  luck: ['幸運', 'ドロップ率が上がった。'],
  autotune: ['自動チューニング', '最適な速度比を自動で維持する。'],
  revolution: ['革命', '転生倍率と永続ツリーを捨て、革命の記憶を得る上位転生。'],
  mutation: ['リング変異', 'アセンション時にまれにリングが突然変異する。'],
  transcend: ['超越', '革命すら超える最上位の転生。'],
  infinity: ['インフィニティ', '∞に到達した。すべてを無限ポイントに変え、さらに先へ。'],
  eternity: ['永劫', 'インフィニティすら越える層。宇宙タブで永劫できる。'],
  minerals: ['鉱石と鍛冶', '敵が鉱石を落とすようになった。宇宙タブでアイテムを精錬できる。'],
  promotion: ['昇進', '転生倍率を差し出して、リングを永続的に強化できる。'],
  fluxPlus: ['倍速タイム', '貯められる倍速タイムが2倍になった。'],
  ipDouble: ['無限の泉', '無限ポイントの獲得が2倍になった。'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: '無限の加速', text: '全リング速度×3', cost: 1 },
  { id: 'pow', name: '無限の力', text: '全ダメージ×1e30', cost: 1 },
  { id: 'core', name: '無限のコア', text: '転生コア×3', cost: 1 },
  { id: 'mem', name: '記憶の継承', text: '革命の記憶を6つ持って始まる（すぐ超越できる）', cost: 2 },
  { id: 'autoRev', name: '自動革命', text: '条件を満たしたら自動で革命', cost: 2 },
  { id: 'autoTr', name: '自動超越', text: '条件を満たしたら自動で超越', cost: 2 },
  { id: 'ich', name: '無限の試練', text: '無限の試練を解放', cost: 3 },
  { id: 'gain', name: '永劫の回転', text: '回転倍率の伸び×1.5', cost: 3 },
  { id: 'break', name: '限界突破', text: '∞を超えられる・無限回廊', cost: 6 },
  { id: 'multi', name: '多重宇宙', text: '無限ポイント獲得×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: '一筆書き', rule: '転生できない', reward: '転生倍率の伸び×1.5' },
  { id: 'i_noitem', name: '素手の英雄', rule: 'アイテム効果なし', reward: 'アイテム倍率×2' },
  { id: 'i_norank', name: '名もなき者', rule: '英雄ランクの倍率なし', reward: 'ランク倍率×2' },
];

ACHIEVEMENTS.push(
  A('i_1', '無限への到達', 'インフィニティ1回', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', '無限の常連', 'インフィニティ5回', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', '無限の住人', 'インフィニティ20回', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', '限界突破', '∞を超える', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', '無限の泉', '無限ポイントを合計30獲得', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', '回廊の旅人', '無限回廊でステージ50', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', '回廊の覇者', '無限回廊でステージ300', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', '果てなき道', '無限回廊でステージ1000', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', '無限の試練', '無限の試練を1つクリア', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', '無限の求道者', '無限の試練をすべてクリア', (s) => (s.infChDone || []).length >= 3),
  A('f_use', '時を操る者', '倍速タイムを合計1時間使う', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', '一週間の旅', 'ログイン7日連続', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', '一か月の旅', 'ログイン合計30日', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', '回転の神', 'リングを合計1,000,000周', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', '突破の神', 'アセンション合計500回', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', '無限転生', '転生1,000回', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', '革命の時代', '革命10回', (s) => s.stats.revolutions >= 10),
  A('s_e1e', '桁外れ', '攻撃力が1e400に到達', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: '永劫の記憶', text: '永劫しても無限の強化が残る', cost: 1 },
  { id: 'autoInf', name: '自動インフィニティ', text: '自動化ルールでインフィニティ', cost: 1 },
  { id: 'epPow', name: '永劫の力', text: '全ダメージ×1e50', cost: 2 },
  { id: 'ipx', name: '無限の湧出', text: '無限ポイント獲得×3', cost: 2 },
  { id: 'cardSlot', name: '作戦の才', text: '作戦カードの枠+1', cost: 2 },
  { id: 'dil', name: '裏世界', text: '裏世界（反転した世界）を解放', cost: 3 },
  { id: 'startCorr', name: '回廊の近道', text: '無限回廊をステージ101から', cost: 4 },
  { id: 'lapx', name: '永劫の回転', text: '回転倍率の伸び×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: '歪んだ回転', text: '回転倍率の伸び+25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: '歪みの緩和', text: '歪み中の指数 +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: '結晶の刃', text: '全ダメージ×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: '銅鉱', col: PAL.clay },
  { id: 'ag', name: '銀鉱', col: PAL.cloud },
  { id: 'au', name: '金鉱', col: PAL.gold },
  { id: 'star', name: '星鉱', col: PAL.cyan },
  { id: 'black', name: '黒鉱', col: PAL.plum },
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
  { id: 't0', name: '愚者', text: '倍速タイム+30分' },
  { id: 't1', name: '魔術師', text: '10分間 全ダメージ×1e5' },
  { id: 't2', name: '女教皇', text: '10分間 回転倍率の伸び×2' },
  { id: 't3', name: '女帝', text: 'ゴールドが大量に湧く' },
  { id: 't4', name: '皇帝', text: '10分間 全リング速度×2' },
  { id: 't6', name: '恋人', text: '10分間 同期の猶予×2' },
  { id: 't7', name: '戦車', text: 'BURSTゲージ満タン' },
  { id: 't8', name: '力', text: '永続 全ダメージ×1.1' },
  { id: 't9', name: '隠者', text: 'アイテムを1つ入手' },
  { id: 't10', name: '運命の輪', text: '他のカードをもう1枚' },
  { id: 't15', name: '悪魔', text: '66%で永続 全ダメージ×1.5／34%で黒鉱-3' },
  { id: 't17', name: '星', text: '永続 回転倍率の伸び+2%' },
  { id: 't18', name: '月', text: '10分間 会心率+20%' },
  { id: 't19', name: '太陽', text: '10分間 ゴールド×1e10' },
  { id: 't21', name: '世界', text: '全リングLv+10（上限まで）' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: '牡羊座', text: '赤リング威力×1e8', need: 5 },
  { id: 'z2', name: '牡牛座', text: 'ゴールド×1e5', need: 10 },
  { id: 'z3', name: '双子座', text: '全リングの発動ノード+1', need: 15 },
  { id: 'z4', name: '蟹座', text: 'オフライン効率+30%', need: 20 },
  { id: 'z5', name: '獅子座', text: 'ボスへのダメージ×1e6', need: 25 },
  { id: 'z6', name: '乙女座', text: 'アイテムと鉱石のドロップ×2', need: 30 },
  { id: 'z7', name: '天秤座', text: '同期の猶予×2', need: 35 },
  { id: 'z8', name: '蠍座', text: '会心率+15%', need: 40 },
  { id: 'z9', name: '射手座', text: '青リング威力×1e8', need: 45 },
  { id: 'z10', name: '山羊座', text: '転生倍率の伸び×1.1', need: 50 },
  { id: 'z11', name: '水瓶座', text: '回転倍率の伸び+10%', need: 55 },
  { id: 'z12', name: '魚座', text: '倍速タイムの獲得×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', '採掘者', '鉱石を合計#個', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', '鍛冶師', '精錬を合計#回', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', '作戦家', '作戦カードを#枚引く', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', '見切り', 'PERFECTを合計#回', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', 'レイダー', 'レイドの徽章を合計#つ', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', '昇進者', '昇進を合計#回', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', '永劫の旅人', '永劫#回', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', '歪みの収集家', '歪みの結晶を合計#個', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', '回し屋', 'リングを手で#周回す', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', '連打', '戦場を#回タップ', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', '殲滅', '敵を#体倒す', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', '作戦の達人', '作戦カードを1枚Lv10にする', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', '軍団結成', '英雄12人がそろう', (s) => (s.recruits || []).length >= 12),
  A('s_devil', '神業', 'PERFECTを50連続で決める', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', '伝説のレイダー', 'レイドで「虹」評価', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: '月間パス（30日）', price: '¥370', text: 'すぐ倍速タイム3時間＋30日間、毎日ログインで倍速タイム1時間とコイン（敵200体ぶん）', cat: 'top' },
  { id: 'rl_grow_rb', name: '転生応援パック', price: '¥300', text: '転生コア30・倍速タイム4時間・コイン袋（転生解放から72時間だけ）', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: '革命応援パック', price: '¥480', text: '転生コア100・黒鉱10・倍速タイム8時間（革命解放から72時間だけ）', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: 'スタートパック', price: '¥400', text: 'コイン袋＋倍速タイム8時間（後半の素材つき）', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: '広告削除', price: '¥980', text: '広告なしで広告報酬をすぐ受け取れる', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: '英雄バンドル', price: '¥3,000', text: '倍速タイム7日・黒鉱120・限定着せかえ「紅蓮」（何回でも買える。2回目からは着せかえ・オーラ以外）', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: '軍団バンドル', price: '¥5,000', text: '倍速タイム14日・黒鉱250・限定着せかえ「蒼天」・金のオーラ（何回でも買える。2回目からは着せかえ・オーラ以外）', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: '伝説バンドル', price: '¥10,000', text: '倍速タイム30日・黒鉱600・限定着せかえ「伝説」・虹と金のオーラ（何回でも買える。2回目からは着せかえ・オーラ以外）', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: 'レギオンパス プレミアム', price: '¥610', text: '今シーズン（30日）のプレミアム報酬。到達済みの段もさかのぼって受け取れる', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: 'コイン袋', price: '¥120', text: 'いまのステージの敵 300体ぶんのコイン（転生でリセット）', cat: 'item' },
  { id: 'rl_coin_l', name: 'コイン金庫', price: '¥480', text: 'いまのステージの敵 2000体ぶんのコイン（転生でリセット）', cat: 'item' },
  { id: 'rl_flux_s', name: '倍速タイム（小）', price: '¥120', text: 'ゲームが2倍速で進む時間 4時間ぶん', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: '倍速タイム（大）', price: '¥500', text: 'ゲームが2倍速で進む時間 24時間ぶん', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: '黒鉱×10', price: '¥160', text: '作戦カードを10回引ける（排出率：各カード均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: '黒鉱×60', price: '¥800', text: '作戦カードを60回引ける（排出率：各カード均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: '倍速タイム（特大）', price: '¥980', text: 'ゲームが2倍速で進む時間 72時間ぶん（遊んでいる間だけ減る）', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: '黒鉱×130', price: '¥1,500', text: '作戦カードを130回引ける（排出率：各カード均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: '黒鉱×200', price: '¥2,200', text: '作戦カードを200回引ける（排出率：各カード均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: '無限パック', price: '¥800', text: '無限ポイント+5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: '永劫パック', price: '¥800', text: '永劫ポイント+3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: 'サポーターパック', price: '¥2,000', text: '倍速タイム48時間・英雄に金のオーラ（後半の素材つき）', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: 'リング着せかえ：ネオン', price: '¥160', text: '見た目だけ。強さは変わらない', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: 'リング着せかえ：黄金', price: '¥160', text: '見た目だけ。強さは変わらない', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: 'リング着せかえ：桜', price: '¥160', text: '見た目だけ。強さは変わらない', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: '着せかえ3種セット', price: '¥360', text: 'ネオン・黄金・桜をまとめて（どれも持っていない人向け）', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: '虹のオーラ', price: '¥240', text: '英雄から虹色の光が舞う（見た目だけ）', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: 'ネオン', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: '黄金', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: '桜', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: '紅蓮（英雄バンドル）', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: '蒼天（軍団バンドル）', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: '伝説（伝説バンドル）', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: '虚空（パス限定）', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: '16歳未満', cap: 5000 }, u18: { name: '16〜17歳', cap: 10000 }, adult: { name: '18歳以上', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: 'コイン（敵60体ぶん）', limit: 10 },
  { id: 'ad_flux', name: '倍速タイム+30分', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'BURSTゲージ満タン', limit: 6, need: 'burst' },
  { id: 'ad_black', name: '黒鉱+1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: '2026年12月', title: 'リリース', items: ['12人の英雄と4つのリング', '転生・革命・超越・インフィニティ・永劫', '週替わりレイドとレギオンパス', 'オリジナルBGM'] },
];
export const NEXT_CHAPTER = '毎月少しずつ、新しい英雄・ワールド・レイドのルールを追加していきます。';
