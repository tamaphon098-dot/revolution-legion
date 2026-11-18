// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: '红环', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: '蓝环', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: '金环', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: '紫环', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: '莱昂', job: '剑士', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: '每圈一记斩击。剑会越来越快。' },
  seris: { name: '塞莉丝', job: '魔女', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: '冰之魔法。攻击弱点威力翻倍。' },
  elia: { name: '艾莉娅', job: '圣女', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: '以祈祷加速所有环。' },
  nox: { name: '诺克斯', job: '召唤师', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: '召唤精灵龙。出手慢但一击很重。' },
  mina: { name: '米娜', job: '双剑士', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: '触发节点翻倍。单次攻击较轻（×0.6）。' },
  garou: { name: '加罗', job: '狂战士', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: '持续打同一个敌人会越来越强（最高×6）。' },
  volt: { name: '沃尔特', job: '雷术士', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: '每次同步连击都会落雷追击。同步容错+50%。' },
  luna: { name: '露娜', job: '占星师', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30%暴击×8。蓝环倍率增长+10%。' },
  brom: { name: '布罗姆', job: '铁匠', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: '金币×100，矿石翻倍。不擅长战斗。' },
  tia: { name: '缇雅', job: '吟游诗人', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: '同步容错×2，连击倍率×2。' },
  zeno: { name: '泽诺', job: '死灵术士', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: '该关卡击败的数量越多越强。' },
  sierra: { name: '希拉', job: '时空魔导士', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: '每圈自动转动环。全速度+10%。' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: '到达关卡120', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: '3色以上同步100次', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: '进行革命', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: '累计收集100个矿石', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: '击败500个Boss', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '获得3枚每周突袭徽章', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: '突袭3周达到「金」以上', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: '参加突袭6周，或进行永劫', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: '红之祭典', text: '红环伤害×3，其他×0.3' },
  { id: 'r_sync', name: '共鸣祭', text: '同步连击×10，普通攻击×0.1' },
  { id: 'r_perf', name: '看破试炼', text: 'PERFECT伤害×5' },
  { id: 'r_slow', name: '重力日', text: '环速度×0.5，伤害×4' },
  { id: 'r_crit', name: '要害祭', text: '暴击率+30%' },
  { id: 'r_purple', name: '召唤祭', text: '紫环伤害×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: '速攻', text: '全环速度+5%/Lv' },
  { id: 'c_edge', name: '锐刃', text: '红环威力×100/Lv' },
  { id: 'c_frost', name: '霜之阵', text: '蓝环威力×100/Lv' },
  { id: 'c_choir', name: '圣歌', text: '金环威力×100/Lv' },
  { id: 'c_horde', name: '百鬼', text: '紫环威力×100/Lv' },
  { id: 'c_link', name: '联携', text: '连击倍率+50%/Lv' },
  { id: 'c_gold', name: '掠夺', text: '金币×10/Lv' },
  { id: 'c_ore', name: '采矿', text: '矿石出现率+50%/Lv' },
  { id: 'c_crit', name: '要害', text: '暴击率+5%/Lv' },
  { id: 'c_boss', name: '猎大物', text: '对Boss伤害×100/Lv' },
  { id: 'c_perf', name: '看破', text: 'PERFECT容错+20%·倍率+0.5/Lv' },
  { id: 'c_time', name: '时之齿轮', text: '双倍时间获得量+20%/Lv' },
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
  IT('it_s1', '木剑', 's', 0), IT('it_s2', '铁剑', 's', 0), IT('it_s3', '炎之剑', 's', 1), IT('it_s4', '双剑', 's', 1, 'node', '触发节点+1'),
  IT('it_s5', '时空刀', 's', 2, 'extraLap', '每圈15%概率额外旋转'), IT('it_s6', '屠龙大剑', 's', 2, 'boss', '对Boss翻倍'), IT('it_s7', '圣剑', 's', 3), IT('it_s8', '革命大剑', 's', 4, 'fullSync', '完全同步威力×20'),
  IT('it_m1', '木杖', 'm', 0), IT('it_m2', '水晶杖', 'm', 0), IT('it_m3', '冰结之杖', 'm', 1, 'freeze', '命中时冻结（受伤×1.5）'), IT('it_m4', '雷之杖', 'm', 1),
  IT('it_m5', '共鸣之杖', 'm', 2, 'syncWin', '同步容错×2.5'), IT('it_m6', '星之杖', 'm', 2), IT('it_m7', '月之杖', 'm', 3, 'node', '触发节点+1'), IT('it_m8', '贤者之杖', 'm', 4),
  IT('it_h1', '祈祷之铃', 'h', 0), IT('it_h2', '圣洁戒指', 'h', 0), IT('it_h3', '天使之羽', 'h', 1), IT('it_h4', '治愈圣杯', 'h', 1),
  IT('it_h5', '太阳念珠', 'h', 2, 'haste', '全环速度+20%'), IT('it_h6', '圣光之盾', 'h', 2), IT('it_h7', '女神之冠', 'h', 3, 'haste', '全环速度+20%'), IT('it_h8', '祝福之书', 'h', 4),
  IT('it_n1', '黑之魔导书', 'n', 0), IT('it_n2', '龙蛋', 'n', 0), IT('it_n3', '精灵之瓶', 'n', 1), IT('it_n4', '召唤之钥', 'n', 1),
  IT('it_n5', '魔眼宝珠', 'n', 2, 'crit', '25%暴击×4'), IT('it_n6', '龙骨之笛', 'n', 2), IT('it_n7', '契约之戒', 'n', 3), IT('it_n8', '冥界之镰', 'n', 4, 'crit', '25%暴击×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: '史莱姆', weak: 1 }, { s: 'en_w1_mush', n: '怒菇', weak: 0 }, { s: 'en_w1_wolf', n: '草原狼', weak: 1 }, { s: 'enemy_skeleton', n: '亡者骑士', weak: 0 }, { s: 'enemy_imp', n: '小恶魔', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: '冰牙狼', weak: 0 }, { s: 'en_w2_wraith', n: '霜之幽魂', weak: 0 }, { s: 'en_w2_yeti', n: '小雪雪人', weak: 1 }, { s: 'en_w2_bat', n: '冰晶蝙蝠', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: '齿轮兵', weak: 1 }, { s: 'en_w3_owl', n: '时钟猫头鹰', weak: 0 }, { s: 'en_w3_mage', n: '沙漏魔导士', weak: 0 }, { s: 'enemy_golem', n: '黄铜魔像', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: '空洞之眼', weak: 1 }, { s: 'en_w4_jelly', n: '星水母', weak: 0 }, { s: 'en_w4_knight', n: '影之骑士', weak: 1 }, { s: 'enemy_imp', n: '虚无小恶魔', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: '回廊亡灵', weak: 0 }, { s: 'en_w3_mage', n: '无限魔导士', weak: 1 }, { s: 'en_w4_knight', n: '回廊守卫', weak: 0 }, { s: 'en_w1_wolf', n: '迷途狼', weak: 1 }, { s: 'en_w4_jelly', n: '时空水母', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: '巨岩王加尔多姆', scale: 1.6 }, { s: 'boss_dragon', n: '深渊龙瓦尔格雷斯', scale: 1 }],
  [{ s: 'bo_w2', n: '冰晶女帝涅瓦', scale: 1 }, { s: 'en_w2_yeti', n: '大雪兽巨型雪人', scale: 2 }],
  [{ s: 'bo_w3', n: '时钟巨神克洛诺斯', scale: 1 }, { s: 'en_w3_gear', n: '齿轮将军', scale: 2 }],
  [{ s: 'boss_dragon', n: '虚无龙', scale: 1 }, { s: 'en_w4_knight', n: '影之王', scale: 1.8 }],
  [{ s: 'bo_w2', n: '回廊女帝', scale: 1 }, { s: 'bo_w3', n: '回廊巨神', scale: 1 }, { s: 'boss_dragon', n: '回廊之龙', scale: 1 }, { s: 'bo_w4', n: '虚无王之影', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: '虚无王涅布拉斯', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: '物理抗性', tip: '红环伤害1/100', col: PAL.red },
  magic: { name: '魔法抗性', tip: '蓝环伤害1/100', col: PAL.sky },
  barrier: { name: '结界', tip: '除同步连击外几乎无效', col: PAL.lemon },
  regen: { name: '再生', tip: '每秒恢复2%HP', col: PAL.leaf },
  rush: { name: '急袭', tip: '限时15秒', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: '一闪试炼', rule: '只用红环战斗', goal: 60, reward: '红环触发节点+1' },
  { id: 'nospeed', name: '静止试炼', rule: '无法强化速度', goal: 60, reward: '全环速度+15%' },
  { id: 'noasc', name: '不屈试炼', rule: '无法飞升', goal: 70, reward: '飞升保留的力量 50%→65%' },
  { id: 'sync', name: '共鸣试炼', rule: '除同步连击外伤害1/100', goal: 70, reward: '连击倍率×2' },
  { id: 'nopm', name: '原点试炼', rule: '转生倍率无效', goal: 90, reward: '转生倍率增长×1.2' },
  { id: 'rush', name: '刹那试炼', rule: 'Boss限时10秒', goal: 100, reward: 'BURST持续+5秒' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', '最初的一圈', '环累计转100圈', (s) => lapsTotal(s) >= 100),
  A('a_lap2', '旋转达人', '环累计转1,000圈', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', '永动机', '环累计转10,000圈', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', '世界在转', '环累计转100,000圈', (s) => lapsTotal(s) >= 100000),
  A('a_u1', '万之力', '攻击力达到1万', (s) => s.units >= 1),
  A('a_u2', '亿之力', '攻击力达到1亿', (s) => s.units >= 2),
  A('a_u3', '兆之力', '攻击力达到1兆', (s) => s.units >= 3),
  A('a_u4', '京之力', '攻击力达到1京', (s) => s.units >= 4),
  A('a_u8', '沟之彼方', '攻击力达到1沟', (s) => s.units >= 8),
  A('a_u12', '迈向极致', '攻击力达到1极', (s) => s.units >= 12),
  A('a_u17', '无量大数', '攻击力达到无量大数', (s) => s.units >= 17),
  A('a_as1', '首次突破上限', '飞升1次', (s) => ascTotal(s) >= 1),
  A('a_as2', '突破常客', '飞升累计20次', (s) => ascTotal(s) >= 20),
  A('a_as3', '无极限者', '飞升累计100次', (s) => ascTotal(s) >= 100),
  A('a_rb1', '重获新生', '转生1次', (s) => s.stats.rebirths >= 1),
  A('a_rb2', '轮回', '转生10次', (s) => s.stats.rebirths >= 10),
  A('a_rb3', '轮回尽头', '转生100次', (s) => s.stats.rebirths >= 100),
  A('a_c2', '重叠的轨道', '同步连击10次', (s) => s.stats.combos >= 10),
  A('a_c3', '三重奏', '3色同步50次', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', '完全同步', '4色同步100次', (s) => s.stats.combo4 >= 100),
  A('a_b1', 'Boss猎人', '击败10个Boss', (s) => s.stats.bossKills >= 10),
  A('a_b2', 'Boss杀手', '击败100个Boss', (s) => s.stats.bossKills >= 100),
  A('a_b3', '传说讨伐者', '击败1,000个Boss', (s) => s.stats.bossKills >= 1000),
  A('a_tr', '机制攻略', '击败5个带特性的Boss', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', '收集家', '8种道具', (s) => s.found.length >= 8),
  A('a_d2', '鉴赏家', '16种道具', (s) => s.found.length >= 16),
  A('a_d3', '大收集家', '24种道具', (s) => s.found.length >= 24),
  A('a_d4', '图鉴全收集', '全部32种道具', (s) => s.found.length >= 32),
  A('a_ur', '七彩光辉', '获得UR道具', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', '试炼入口', '通关1个试炼', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', '试炼的求道者', '通关3个试炼', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', '全试炼制霸', '通关全部6个试炼', (s) => (s.chDone || []).length >= 6),
  A('a_mu', '突然变异', '引发环变异', (s) => s.stats.mutations >= 1),
  A('a_rv', '革命家', '革命1次', (s) => s.stats.revolutions >= 1),
  A('a_w2', '冰之旅人', '在冰晶峡谷到达关卡100', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', '时之旅人', '在发条之都到达关卡100', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', '超越者', '进行超越', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', '击败虚无王', (s) => s.stats.cleared),
  // secrets
  A('s_harm', '调和', '将4色环的速度比调为1:2:4:8', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', '电光石火', '剩余25秒以上击败Boss', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', '守望者', '转生后一次都不强化，到达关卡15', (s) => !!s.stats.lazy, true),
  A('s_od', '暴走', '在超载中击败Boss', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: '起始草原', bg: 'bgw_1', law: '普通世界', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: '冰晶峡谷', bg: 'bgw_2', law: '蓝环×5／红环×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: '发条之都', bg: 'bgw_3', law: '旋转速度不规则变化／旋转倍率增长×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: '虚无星域', bg: 'bgw_4', law: '最终世界。关卡300有虚无王', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: '无尽回廊', bg: 'bg_temple', law: '没有尽头的回廊。越深入无限点数越多', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: '魔法剑', mult: 3 }, 3: { name: '圣煌阵', mult: 10 }, 4: { name: '革命连斩', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: '二重旋转', text: '1圈相当于2圈的倍率增长' },
  { id: 'reverse', name: '逆旋转', text: '倍率增长×1.6·速度×0.8' },
  { id: 'split', name: '分裂', text: '触发节点+2' },
  { id: 'crit', name: '暴击特化', text: '30%暴击×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: '多重旋转', text: '全环速度+10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: '黄金之流', text: '获得金币×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: '旋转奥义', text: '旋转倍率增长+10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: '多重节点', text: '全环触发节点+1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: '自动飞升', text: '达到Lv上限时自动飞升', max: 1, cost: () => 8 },
  { id: 'start', name: '加速时空', text: '转生后从关卡+10开始', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: '梦之旋转', text: '离线效率+20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: '自动转生', text: '倍率达到指定倍数时转生', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', '让红环转15圈', (s) => [s.stats.laps[0], 15], { text: '金币+100', gold: 2 }),
  M('M02', '将红环升到Lv10', (s) => [s.rings[0].lv, 10], { text: '解锁速度强化', feature: 'speed' }),
  M('M03', '击败关卡10的Boss', (s) => [s.stats.bestStage - 1, 10], { text: '解锁道具掉落与图鉴', feature: 'items' }),
  M('M06', '到达关卡20', (s) => [s.stats.bestStage, 20], { text: '新伙伴：魔女塞莉丝＋蓝环', ring: 1 }),
  M('M07', '同步连击3次', (s) => [s.stats.combos, 3], { text: '解锁环实验室（调整速度比）', feature: 'lab' }),
  M('M05', '将红环升到Lv30并飞升', (s) => [s.stats.asc[0], 1], { text: '莱昂晋升（攻击×1.5）·军团界面', feature: 'heroes' }),
  M('M41', '到达关卡40', (s) => [s.stats.bestStage, 40], { text: '自动强化（自动购买Lv+）', feature: 'autoBuy' }),
  M('M09', '到达关卡60', (s) => [s.stats.bestStage, 60], { text: '解锁转生', feature: 'rebirth' }),
  M('M10', '进行转生', (s) => [s.stats.rebirths, 1], { text: '解锁永久树·试炼·每周突袭', feature: 'perm', feature2: 'raid' }),
  M('M08', '发现3种道具', (s) => [s.found.length, 3], { text: '解锁图鉴加成', feature: 'dexBonus' }),
  M('M11', '红环飞升3次（累计）', (s) => [s.stats.ascTotal[0], 3], { text: '红环节点+1', node: 0 }),
  M('M12', '单次周回到达关卡100', (s) => [s.runBest, 100], { text: '圣女艾莉娅＋金环', ring: 2 }),
  M('M13', '3色同步30次', (s) => [s.stats.combo3, 30], { text: '解锁BURST', feature: 'burst' }),
  M('M14', '发现12种道具', (s) => [s.found.length, 12], { text: '装备栏发光（掉落率UP）', feature: 'luck' }),
  M('M15', '转生5次', (s) => [s.stats.rebirths, 5], { text: '蓝环节点+1', node: 1 }),
  M('M16', '到达关卡150', (s) => [s.runBest, 150], { text: '解锁自动调谐', feature: 'autotune' }),
  M('M17', '单次周回到达关卡250', (s) => [s.runBest, 250], { text: '召唤师诺克斯＋紫环', ring: 3 }),
  M('M18', '4色同步50次', (s) => [s.stats.combo4, 50], { text: '紫环节点+1', node: 3 }),
  M('M19', '英雄升为SSR（累计飞升10次）', (s) => [Math.max(...s.stats.ascTotal), 10], { text: '击败Boss必掉稀有以上' }),
  M('M20', '发现20种道具', (s) => [s.found.length, 20], { text: '图鉴加成强化' }),
  M('M21', '单次周回到达关卡300', (s) => [s.runBest, 300], { text: '解锁革命（高阶转生）', feature: 'revolution' }),
  M('M22', '进行革命', (s) => [s.stats.revolutions, 1], { text: '环变异·世界「冰晶峡谷」', feature: 'mutation', world: 1 }),
  M('M23', '引发环变异3次', (s) => [s.stats.mutations, 3], { text: '金环节点+1', node: 2 }),
  M('M24', '在冰晶峡谷到达关卡200', (s) => [s.worldBest[1] || 0, 200], { text: '世界「发条之都」', world: 2 }),
  M('M25', '革命3次', (s) => [s.stats.revolutions, 3], { text: '解锁超越', feature: 'transcend' }),
  M('M26', '发现28种道具', (s) => [s.found.length, 28], { text: '图鉴加成强化' }),
  M('M27', '进行超越', (s) => [s.stats.transcends, 1], { text: '最终世界「虚无星域」', world: 3 }),
  M('M28', '击败虚无王', (s) => [s.stats.cleared ? 1 : 0, 1], { text: '解锁无限', feature: 'infinity' }),
  M('M29', '进行无限', (s) => [s.inf ? s.inf.count : 0, 1], { text: '双倍时间上限×2', feature: 'fluxPlus' }),
  M('M30', '无限3次', (s) => [s.inf ? s.inf.count : 0, 3], { text: '看到了通往无限试炼的道路' }),
  M('M31', '突破无限', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: '无尽回廊开启', world: 4 }),
  M('M32', '在无尽回廊到达关卡100', (s) => [s.worldBest[4] || 0, 100], { text: '无限点数+5', ip: 5 }),
  M('M33', '通关3个无限试炼', (s) => [(s.infChDone || []).length, 3], { text: '无限点数获得×2', feature: 'ipDouble' }),
  M('M34', '在无尽回廊到达关卡300', (s) => [s.worldBest[4] || 0, 300], { text: '解锁永劫（Eternity）', feature: 'eternity' }),
  M('M35', '进行永劫', (s) => [s.eter ? s.eter.count : 0, 1], { text: '解锁永劫强化' }),
  M('M36', '在时间扭曲中获得10个结晶', (s) => [s.tp || 0, 10], { text: '扭曲强化发光' }),
  M('M37', '装备3张作战卡', (s) => [(s.deck || []).length, 3], { text: '作战卡栏位+1', cslot: 1 }),
  M('M38', '军团达到8人', (s) => [(s.recruits || []).length, 8], { text: '黑矿+10', black: 10 }),
  M('M39', '永劫5次', (s) => [s.eter ? s.eter.count : 0, 5], { text: '永劫点数×2', feature: 'epDouble' }),
  M('M40', '在无尽回廊到达关卡1000', (s) => [s.worldBest[4] || 0, 1000], { text: '真结局' }),
];

export const FEATURE_INFO = {
  speed: ['速度强化', '转得越快，攻击次数和倍率增长都会提升。'],
  items: ['道具与图鉴', '敌人偶尔会掉落装备。填满图鉴会让整体变强。'],
  heroes: ['英雄晋升', '每次飞升英雄都会成长，外观和攻击也会进化。'],
  lab: ['环实验室', '速度比为1:2或1:2:4这样的整数比时，环会同步并触发连击。'],
  dexBonus: ['图鉴加成', '每发现一种道具，全伤害就会提升。'],
  rebirth: ['转生', '倍率增长到位就转生吧。时机由你决定。'],
  perm: ['永久树', '用转生核心可解锁自动化和永久强化。'],
  burst: ['BURST', '计量条满后10秒内环5倍速。'],
  autoBuy: ['自动强化', '现在可以自动购买Lv和速度（右侧按钮切换ON/OFF）。'],
  luck: ['幸运', '掉落率提升了。'],
  autotune: ['自动调谐', '自动维持最佳速度比。'],
  revolution: ['革命', '舍弃转生倍率和永久树，换取革命记忆的高阶转生。'],
  mutation: ['环变异', '飞升时环偶尔会突然变异。'],
  transcend: ['超越', '超越革命的最高阶转生。'],
  infinity: ['无限', '到达了∞。将一切化为无限点数，继续前进。'],
  eternity: ['永劫', '连无限都超越的层级。可在宇宙标签中进行永劫。'],
  minerals: ['矿石与锻造', '敌人开始掉落矿石。可在宇宙标签中精炼道具。'],
  promotion: ['晋升', '献出转生倍率，可永久强化环。'],
  fluxPlus: ['双倍时间', '可储存的双倍时间变为2倍。'],
  ipDouble: ['无限之泉', '无限点数的获得变为2倍。'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: '无限加速', text: '全环速度×3', cost: 1 },
  { id: 'pow', name: '无限之力', text: '全伤害×1e30', cost: 1 },
  { id: 'core', name: '无限核心', text: '转生核心×3', cost: 1 },
  { id: 'mem', name: '记忆传承', text: '带着6个革命记忆开始（可立即超越）', cost: 2 },
  { id: 'autoRev', name: '自动革命', text: '满足条件时自动革命', cost: 2 },
  { id: 'autoTr', name: '自动超越', text: '满足条件时自动超越', cost: 2 },
  { id: 'ich', name: '无限试炼', text: '解锁无限试炼', cost: 3 },
  { id: 'gain', name: '永劫旋转', text: '旋转倍率增长×1.5', cost: 3 },
  { id: 'break', name: '突破极限', text: '可超越∞·无尽回廊', cost: 6 },
  { id: 'multi', name: '多重宇宙', text: '无限点数获得×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: '一笔画', rule: '无法转生', reward: '转生倍率增长×1.5' },
  { id: 'i_noitem', name: '赤手英雄', rule: '道具效果无效', reward: '道具倍率×2' },
  { id: 'i_norank', name: '无名之辈', rule: '无英雄段位倍率', reward: '段位倍率×2' },
];

ACHIEVEMENTS.push(
  A('i_1', '抵达无限', '无限1次', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', '无限常客', '无限5次', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', '无限居民', '无限20次', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', '突破极限', '超越∞', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', '无限之泉', '累计获得30无限点数', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', '回廊旅人', '在无尽回廊到达关卡50', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', '回廊霸者', '在无尽回廊到达关卡300', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', '无尽之路', '在无尽回廊到达关卡1000', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', '无限试炼', '通关1个无限试炼', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', '无限的求道者', '通关全部无限试炼', (s) => (s.infChDone || []).length >= 3),
  A('f_use', '操控时间者', '累计使用双倍时间1小时', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', '一周之旅', '连续登录7天', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', '一个月之旅', '累计登录30天', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', '旋转之神', '环累计转1,000,000圈', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', '突破之神', '飞升累计500次', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', '无限转生', '转生1,000次', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', '革命时代', '革命10次', (s) => s.stats.revolutions >= 10),
  A('s_e1e', '超乎想象', '攻击力达到1e400', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: '永劫记忆', text: '即使永劫也保留无限强化', cost: 1 },
  { id: 'autoInf', name: '自动无限', text: '以自动化规则进行无限', cost: 1 },
  { id: 'epPow', name: '永劫之力', text: '全伤害×1e50', cost: 2 },
  { id: 'ipx', name: '无限涌泉', text: '无限点数获得×3', cost: 2 },
  { id: 'cardSlot', name: '作战之才', text: '作战卡栏位+1', cost: 2 },
  { id: 'dil', name: '里世界', text: '解锁里世界（反转的世界）', cost: 3 },
  { id: 'startCorr', name: '回廊捷径', text: '无尽回廊从关卡101开始', cost: 4 },
  { id: 'lapx', name: '永劫旋转', text: '旋转倍率增长×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: '扭曲旋转', text: '旋转倍率增长+25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: '扭曲缓和', text: '扭曲中指数 +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: '结晶之刃', text: '全伤害×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: '铜矿', col: PAL.clay },
  { id: 'ag', name: '银矿', col: PAL.cloud },
  { id: 'au', name: '金矿', col: PAL.gold },
  { id: 'star', name: '星矿', col: PAL.cyan },
  { id: 'black', name: '黑矿', col: PAL.plum },
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
  { id: 't0', name: '愚者', text: '双倍时间+30分钟' },
  { id: 't1', name: '魔术师', text: '10分钟 全伤害×1e5' },
  { id: 't2', name: '女教皇', text: '10分钟 旋转倍率增长×2' },
  { id: 't3', name: '女皇', text: '金币大量涌出' },
  { id: 't4', name: '皇帝', text: '10分钟 全环速度×2' },
  { id: 't6', name: '恋人', text: '10分钟 同步容错×2' },
  { id: 't7', name: '战车', text: 'BURST计量条已满' },
  { id: 't8', name: '力量', text: '永久 全伤害×1.1' },
  { id: 't9', name: '隐者', text: '获得1个道具' },
  { id: 't10', name: '命运之轮', text: '再抽1张其他卡' },
  { id: 't15', name: '恶魔', text: '66%永久 全伤害×1.5／34%黑矿-3' },
  { id: 't17', name: '星星', text: '永久 旋转倍率增长+2%' },
  { id: 't18', name: '月亮', text: '10分钟 暴击率+20%' },
  { id: 't19', name: '太阳', text: '10分钟 金币×1e10' },
  { id: 't21', name: '世界', text: '全环Lv+10（至上限）' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: '白羊座', text: '红环威力×1e8', need: 5 },
  { id: 'z2', name: '金牛座', text: '金币×1e5', need: 10 },
  { id: 'z3', name: '双子座', text: '全环触发节点+1', need: 15 },
  { id: 'z4', name: '巨蟹座', text: '离线效率+30%', need: 20 },
  { id: 'z5', name: '狮子座', text: '对Boss伤害×1e6', need: 25 },
  { id: 'z6', name: '处女座', text: '道具与矿石掉落×2', need: 30 },
  { id: 'z7', name: '天秤座', text: '同步容错×2', need: 35 },
  { id: 'z8', name: '天蝎座', text: '暴击率+15%', need: 40 },
  { id: 'z9', name: '射手座', text: '蓝环威力×1e8', need: 45 },
  { id: 'z10', name: '摩羯座', text: '转生倍率增长×1.1', need: 50 },
  { id: 'z11', name: '水瓶座', text: '旋转倍率增长+10%', need: 55 },
  { id: 'z12', name: '双鱼座', text: '双倍时间获得×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', '采矿者', '累计矿石#个', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', '铁匠', '累计精炼#次', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', '作战家', '抽#张作战卡', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', '看破', '累计PERFECT #次', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', '突袭者', '累计突袭徽章#枚', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', '晋升者', '累计晋升#次', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', '永劫旅人', '永劫#次', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', '扭曲收集家', '累计扭曲结晶#个', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', '转环师', '亲手转环#圈', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', '连打', '点击战场#次', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', '歼灭', '击败#个敌人', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', '作战达人', '将1张作战卡升到Lv10', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', '军团成立', '集齐12位英雄', (s) => (s.recruits || []).length >= 12),
  A('s_devil', '神技', '连续50次PERFECT', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', '传说突袭者', '突袭获得「彩虹」评价', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: '月度通行证（30天）', price: '¥370', text: '立即获得双倍时间3小时，30天内每天登录可领双倍时间1小时和硬币（相当于200个敌人）', cat: 'top' },
  { id: 'rl_grow_rb', name: '转生助力包', price: '¥300', text: '转生核心30·双倍时间4小时·硬币袋（转生解锁后仅限72小时）', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: '革命助力包', price: '¥480', text: '转生核心100·黑矿10·双倍时间8小时（革命解锁后仅限72小时）', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: '新手包', price: '¥400', text: '硬币袋＋双倍时间8小时（附后期素材）', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: '去除广告', price: '¥980', text: '无广告，立即领取广告奖励', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: '英雄礼包', price: '¥3,000', text: '双倍时间7天·黑矿120·限定换装「红莲」（可重复购买。第2次起不含换装和光环）', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: '军团礼包', price: '¥5,000', text: '双倍时间14天·黑矿250·限定换装「苍天」·金色光环（可重复购买。第2次起不含换装和光环）', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: '传说礼包', price: '¥10,000', text: '双倍时间30天·黑矿600·限定换装「传说」·彩虹与金色光环（可重复购买。第2次起不含换装和光环）', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: '军团通行证 高级版', price: '¥610', text: '本赛季（30天）的高级奖励。已达到的级别也可补领', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: '硬币袋', price: '¥120', text: '相当于当前关卡300个敌人的硬币（转生时重置）', cat: 'item' },
  { id: 'rl_coin_l', name: '硬币金库', price: '¥480', text: '相当于当前关卡2000个敌人的硬币（转生时重置）', cat: 'item' },
  { id: 'rl_flux_s', name: '双倍时间（小）', price: '¥120', text: '游戏以2倍速进行的时间 4小时', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: '双倍时间（大）', price: '¥500', text: '游戏以2倍速进行的时间 24小时', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: '黑矿×10', price: '¥160', text: '可抽10次作战卡（概率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: '黑矿×60', price: '¥800', text: '可抽60次作战卡（概率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: '双倍时间（特大）', price: '¥980', text: '游戏以2倍速进行的时间 72小时（仅在游玩时消耗）', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: '黑矿×130', price: '¥1,500', text: '可抽130次作战卡（概率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: '黑矿×200', price: '¥2,200', text: '可抽200次作战卡（概率：各卡均等）', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: '无限包', price: '¥800', text: '无限点数+5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: '永劫包', price: '¥800', text: '永劫点数+3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: '支持者包', price: '¥2,000', text: '双倍时间48小时·英雄金色光环（附后期素材）', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: '环换装：霓虹', price: '¥160', text: '仅外观，不影响强度', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: '环换装：黄金', price: '¥160', text: '仅外观，不影响强度', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: '环换装：樱花', price: '¥160', text: '仅外观，不影响强度', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: '换装3件套', price: '¥360', text: '霓虹·黄金·樱花一次打包（适合一件都没有的玩家）', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: '彩虹光环', price: '¥240', text: '英雄身上飘舞彩虹色光芒（仅外观）', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: '霓虹', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: '黄金', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: '樱花', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: '红莲（英雄礼包）', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: '苍天（军团礼包）', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: '传说（传说礼包）', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: '虚空（通行证限定）', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: '未满16岁', cap: 5000 }, u18: { name: '16〜17岁', cap: 10000 }, adult: { name: '18岁以上', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: '硬币（相当于60个敌人）', limit: 10 },
  { id: 'ad_flux', name: '双倍时间+30分钟', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'BURST计量条已满', limit: 6, need: 'burst' },
  { id: 'ad_black', name: '黑矿+1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: '2026年12月', title: '发售', items: ['12位英雄与4种环', '转生·革命·超越·无限·永劫', '每周突袭与军团通行证', '原创BGM'] },
];
export const NEXT_CHAPTER = '每月都会陆续追加新的英雄、世界和突袭规则。';
