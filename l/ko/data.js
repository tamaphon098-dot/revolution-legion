// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: '빨강 링', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: '파랑 링', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: '황금 링', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: '보라 링', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: '레온', job: '검사', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: '한 바퀴마다 참격. 검은 한없이 빨라진다.' },
  seris: { name: '세리스', job: '마녀', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: '얼음 마법. 약점을 찌르면 위력 2배.' },
  elia: { name: '엘리아', job: '성녀', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: '기도로 모든 링을 가속시킨다.' },
  nox: { name: '녹스', job: '소환사', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: '정령룡을 부른다. 느리지만 한 방이 묵직하다.' },
  mina: { name: '미나', job: '쌍검사', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: '발동 노드 2배. 1타는 가볍다(×0.6).' },
  garou: { name: '가로우', job: '광전사', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: '같은 적을 계속 때릴수록 강해진다(최대 ×6).' },
  volt: { name: '볼트', job: '번개술사', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: '동기 콤보마다 낙뢰로 추격. 동기 유예 +50%.' },
  luna: { name: '루나', job: '점성술사', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30%로 치명타 ×8. 파랑 링 배율 증가 +10%.' },
  brom: { name: '브롬', job: '대장장이', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: '골드 ×100, 광석 2배. 전투는 서툴다.' },
  tia: { name: '티아', job: '음유시인', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: '동기 유예 ×2, 콤보 배율 ×2.' },
  zeno: { name: '제노', job: '강령술사', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: '그 스테이지에서 쓰러뜨린 수만큼 강해진다.' },
  sierra: { name: '시에라', job: '시간 마도사', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: '한 바퀴마다 링을 자동으로 돌린다. 전체 속도 +10%.' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: '스테이지 120 도달', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: '3색 이상 동기 100회', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: '혁명하기', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: '광석을 합계 100개 모으기', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: '보스를 500마리 쓰러뜨리기', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '주간 레이드 휘장 3개', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: '레이드에서 3주 \'금\' 이상', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: '레이드 6주 참가 또는 영겁하기', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: '붉은 축제', text: '빨강 링 데미지 ×3, 나머지는 ×0.3' },
  { id: 'r_sync', name: '공명제', text: '동기 콤보 ×10, 일반 공격 ×0.1' },
  { id: 'r_perf', name: '간파의 시련', text: 'PERFECT 데미지 ×5' },
  { id: 'r_slow', name: '중력의 날', text: '링 속도 ×0.5, 데미지 ×4' },
  { id: 'r_crit', name: '급소제', text: '치명타율 +30%' },
  { id: 'r_purple', name: '소환제', text: '보라 링 데미지 ×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: '속공', text: '전체 링 속도 +5%/Lv' },
  { id: 'c_edge', name: '예리한 칼날', text: '빨강 링 위력 ×100/Lv' },
  { id: 'c_frost', name: '서리의 진', text: '파랑 링 위력 ×100/Lv' },
  { id: 'c_choir', name: '성가', text: '황금 링 위력 ×100/Lv' },
  { id: 'c_horde', name: '백귀', text: '보라 링 위력 ×100/Lv' },
  { id: 'c_link', name: '연계', text: '콤보 배율 +50%/Lv' },
  { id: 'c_gold', name: '약탈', text: '골드 ×10/Lv' },
  { id: 'c_ore', name: '채굴', text: '광석 출현 +50%/Lv' },
  { id: 'c_crit', name: '급소', text: '치명타율 +5%/Lv' },
  { id: 'c_boss', name: '대물 사냥', text: '보스 대상 데미지 ×100/Lv' },
  { id: 'c_perf', name: '간파', text: 'PERFECT 유예 +20%·배율 +0.5/Lv' },
  { id: 'c_time', name: '시간의 톱니바퀴', text: '2배속 타임 획득 +20%/Lv' },
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
  IT('it_s1', '나무 검', 's', 0), IT('it_s2', '철검', 's', 0), IT('it_s3', '불꽃 검', 's', 1), IT('it_s4', '쌍검', 's', 1, 'node', '발동 노드 +1'),
  IT('it_s5', '시공도', 's', 2, 'extraLap', '한 바퀴마다 15%로 추가 회전'), IT('it_s6', '용살 대검', 's', 2, 'boss', '보스에게 2배'), IT('it_s7', '성검', 's', 3), IT('it_s8', '혁명의 대검', 's', 4, 'fullSync', '완전 동기 위력 ×20'),
  IT('it_m1', '나무 지팡이', 'm', 0), IT('it_m2', '수정 지팡이', 'm', 0), IT('it_m3', '빙결의 지팡이', 'm', 1, 'freeze', '명중 시 빙결(받는 데미지 ×1.5)'), IT('it_m4', '번개 지팡이', 'm', 1),
  IT('it_m5', '공명의 지팡이', 'm', 2, 'syncWin', '동기 유예 ×2.5'), IT('it_m6', '별의 지팡이', 'm', 2), IT('it_m7', '달의 지팡이', 'm', 3, 'node', '발동 노드 +1'), IT('it_m8', '현자의 지팡이', 'm', 4),
  IT('it_h1', '기도의 방울', 'h', 0), IT('it_h2', '성스러운 반지', 'h', 0), IT('it_h3', '천사의 날개', 'h', 1), IT('it_h4', '치유의 성배', 'h', 1),
  IT('it_h5', '태양의 로사리오', 'h', 2, 'haste', '전체 링 속도 +20%'), IT('it_h6', '성광의 방패', 'h', 2), IT('it_h7', '여신의 왕관', 'h', 3, 'haste', '전체 링 속도 +20%'), IT('it_h8', '축복의 서', 'h', 4),
  IT('it_n1', '흑의 마도서', 'n', 0), IT('it_n2', '용의 알', 'n', 0), IT('it_n3', '정령의 병', 'n', 1), IT('it_n4', '소환의 열쇠', 'n', 1),
  IT('it_n5', '마안의 보주', 'n', 2, 'crit', '25%로 치명타 ×4'), IT('it_n6', '용골 피리', 'n', 2), IT('it_n7', '계약의 반지', 'n', 3), IT('it_n8', '명계의 낫', 'n', 4, 'crit', '25%로 치명타 ×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: '슬라임', weak: 1 }, { s: 'en_w1_mush', n: '화난버섯', weak: 0 }, { s: 'en_w1_wolf', n: '초원늑대', weak: 1 }, { s: 'enemy_skeleton', n: '망자의 기사', weak: 0 }, { s: 'enemy_imp', n: '임프', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: '빙아 울프', weak: 0 }, { s: 'en_w2_wraith', n: '프로스트 레이스', weak: 0 }, { s: 'en_w2_yeti', n: '꼬마눈 예티', weak: 1 }, { s: 'en_w2_bat', n: '빙정 박쥐', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: '톱니바퀴 병사', weak: 1 }, { s: 'en_w3_owl', n: '시계 부엉이', weak: 0 }, { s: 'en_w3_mage', n: '모래시계 마도사', weak: 0 }, { s: 'enemy_golem', n: '황동 골렘', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: '텅 빈 눈', weak: 1 }, { s: 'en_w4_jelly', n: '별해파리', weak: 0 }, { s: 'en_w4_knight', n: '그림자 기사', weak: 1 }, { s: 'enemy_imp', n: '공허 임프', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: '회랑의 망령', weak: 0 }, { s: 'en_w3_mage', n: '무한의 마도사', weak: 1 }, { s: 'en_w4_knight', n: '회랑의 파수꾼', weak: 0 }, { s: 'en_w1_wolf', n: '길 잃은 늑대', weak: 1 }, { s: 'en_w4_jelly', n: '시공해파리', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: '거암왕 가르돔', scale: 1.6 }, { s: 'boss_dragon', n: '심연룡 발그레이스', scale: 1 }],
  [{ s: 'bo_w2', n: '빙정여제 네베', scale: 1 }, { s: 'en_w2_yeti', n: '대설수 기가 예티', scale: 2 }],
  [{ s: 'bo_w3', n: '시계거신 크로노스', scale: 1 }, { s: 'en_w3_gear', n: '톱니바퀴 장군', scale: 2 }],
  [{ s: 'boss_dragon', n: '공허룡', scale: 1 }, { s: 'en_w4_knight', n: '그림자 왕', scale: 1.8 }],
  [{ s: 'bo_w2', n: '회랑의 여제', scale: 1 }, { s: 'bo_w3', n: '회랑의 거신', scale: 1 }, { s: 'boss_dragon', n: '회랑의 용', scale: 1 }, { s: 'bo_w4', n: '공허왕의 그림자', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: '공허왕 네뷸러스', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: '물리 저항', tip: '빨강 링 데미지 1/100', col: PAL.red },
  magic: { name: '마법 저항', tip: '파랑 링 데미지 1/100', col: PAL.sky },
  barrier: { name: '결계', tip: '동기 콤보 외에는 거의 무효', col: PAL.lemon },
  regen: { name: '재생', tip: '매초 HP가 2% 회복', col: PAL.leaf },
  rush: { name: '기습', tip: '제한 시간 15초', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: '일섬의 시련', rule: '빨강 링만으로 싸운다', goal: 60, reward: '빨강 링 발동 노드 +1' },
  { id: 'nospeed', name: '정지의 시련', rule: '속도 강화 불가', goal: 60, reward: '전체 링 속도 +15%' },
  { id: 'noasc', name: '불굴의 시련', rule: '어센션 불가', goal: 70, reward: '어센션 후 남는 파워 50%→65%' },
  { id: 'sync', name: '공명의 시련', rule: '동기 콤보 외 데미지 1/100', goal: 70, reward: '콤보 배율 ×2' },
  { id: 'nopm', name: '원점의 시련', rule: '환생 배율 무효', goal: 90, reward: '환생 배율 증가 ×1.2' },
  { id: 'rush', name: '찰나의 시련', rule: '보스 제한 시간 10초', goal: 100, reward: 'BURST 지속 +5초' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', '첫 번째 바퀴', '링을 합계 100바퀴', (s) => lapsTotal(s) >= 100),
  A('a_lap2', '회전의 달인', '링을 합계 1,000바퀴', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', '영구기관', '링을 합계 10,000바퀴', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', '세계가 돈다', '링을 합계 100,000바퀴', (s) => lapsTotal(s) >= 100000),
  A('a_u1', '만의 힘', '공격력 1만 도달', (s) => s.units >= 1),
  A('a_u2', '억의 힘', '공격력 1억 도달', (s) => s.units >= 2),
  A('a_u3', '조의 힘', '공격력 1조 도달', (s) => s.units >= 3),
  A('a_u4', '경의 힘', '공격력 1경 도달', (s) => s.units >= 4),
  A('a_u8', '구 너머로', '공격력 1구 도달', (s) => s.units >= 8),
  A('a_u12', '극한으로', '공격력 1극 도달', (s) => s.units >= 12),
  A('a_u17', '무량대수', '공격력 무량대수 도달', (s) => s.units >= 17),
  A('a_as1', '첫 상한 돌파', '어센션 1회', (s) => ascTotal(s) >= 1),
  A('a_as2', '돌파의 단골', '어센션 합계 20회', (s) => ascTotal(s) >= 20),
  A('a_as3', '한계 없는 자', '어센션 합계 100회', (s) => ascTotal(s) >= 100),
  A('a_rb1', '다시 태어나다', '환생 1회', (s) => s.stats.rebirths >= 1),
  A('a_rb2', '윤회', '환생 10회', (s) => s.stats.rebirths >= 10),
  A('a_rb3', '윤회의 끝', '환생 100회', (s) => s.stats.rebirths >= 100),
  A('a_c2', '겹치는 궤도', '동기 콤보 10회', (s) => s.stats.combos >= 10),
  A('a_c3', '삼중주', '3색 동기 50회', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', '완전 동기', '4색 동기 100회', (s) => s.stats.combo4 >= 100),
  A('a_b1', '보스 헌터', '보스 10마리 격파', (s) => s.stats.bossKills >= 10),
  A('a_b2', '보스 슬레이어', '보스 100마리 격파', (s) => s.stats.bossKills >= 100),
  A('a_b3', '전설의 토벌자', '보스 1,000마리 격파', (s) => s.stats.bossKills >= 1000),
  A('a_tr', '기믹 공략', '특성 보유 보스 5마리 쓰러뜨리기', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', '수집가', '아이템 8종', (s) => s.found.length >= 8),
  A('a_d2', '감식안', '아이템 16종', (s) => s.found.length >= 16),
  A('a_d3', '대수집가', '아이템 24종', (s) => s.found.length >= 24),
  A('a_d4', '도감 컴플리트', '아이템 32종 전부', (s) => s.found.length >= 32),
  A('a_ur', '무지개빛 광채', 'UR 아이템 획득', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', '시련의 입구', '시련 1개 클리어', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', '시련의 구도자', '시련 3개 클리어', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', '전 시련 제패', '시련 6개 모두 클리어', (s) => (s.chDone || []).length >= 6),
  A('a_mu', '돌연변이', '링 변이를 일으키기', (s) => s.stats.mutations >= 1),
  A('a_rv', '혁명가', '혁명 1회', (s) => s.stats.revolutions >= 1),
  A('a_w2', '얼음의 나그네', '빙정 협곡에서 스테이지 100', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', '시간의 나그네', '태엽 도시에서 스테이지 100', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', '초월자', '초월하기', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', '공허왕을 쓰러뜨리기', (s) => s.stats.cleared),
  // secrets
  A('s_harm', '조화', '4색 링의 속도비를 1:2:4:8로 맞추기', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', '전광석화', '보스를 남은 25초 이상으로 쓰러뜨리기', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', '지켜보는 자', '환생 직후부터 한 번도 강화하지 않고 스테이지 15 도달', (s) => !!s.stats.lazy, true),
  A('s_od', '폭주', '오버드라이브 중에 보스를 쓰러뜨리기', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: '시작의 초원', bg: 'bgw_1', law: '평범한 세계', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: '빙정 협곡', bg: 'bgw_2', law: '파랑 링 ×5／빨강 링 ×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: '태엽 도시', bg: 'bgw_3', law: '회전 속도가 불규칙하게 변화／회전 배율 증가 ×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: '공허의 우주 영역', bg: 'bgw_4', law: '최종 세계. 스테이지 300에 공허왕', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: '무한 회랑', bg: 'bg_temple', law: '끝없는 회랑. 나아갈수록 인피니티 포인트가 늘어난다', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: '마법검', mult: 3 }, 3: { name: '성광진', mult: 10 }, 4: { name: '혁명연참', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: '이중 회전', text: '한 바퀴에 두 바퀴 분량 배율 증가' },
  { id: 'reverse', name: '역회전', text: '배율 증가 ×1.6·속도 ×0.8' },
  { id: 'split', name: '분열', text: '발동 노드 +2' },
  { id: 'crit', name: '치명타 특화', text: '30%로 치명타 ×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: '다중 회전', text: '전체 링 속도 +10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: '황금의 흐름', text: '획득 골드 ×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: '회전의 극의', text: '회전 배율 증가 +10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: '다중 노드', text: '전체 링의 발동 노드 +1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: '자동 어센션', text: 'Lv 상한에서 자동 어센션', max: 1, cost: () => 8 },
  { id: 'start', name: '가속의 시공', text: '환생 후 스테이지 +10부터', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: '꿈의 회전', text: '오프라인 효율 +20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: '자동 환생', text: '배율이 지정 배수에 도달하면 환생', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', '빨강 링을 15바퀴 돌리기', (s) => [s.stats.laps[0], 15], { text: '골드 +100', gold: 2 }),
  M('M02', '빨강 링을 Lv10으로 만들기', (s) => [s.rings[0].lv, 10], { text: '속도 강화 해금', feature: 'speed' }),
  M('M03', '스테이지 10 보스를 쓰러뜨리기', (s) => [s.stats.bestStage - 1, 10], { text: '아이템 드롭과 도감 해금', feature: 'items' }),
  M('M06', '스테이지 20 도달', (s) => [s.stats.bestStage, 20], { text: '새 동료: 마녀 세리스＋파랑 링', ring: 1 }),
  M('M07', '동기 콤보 3회', (s) => [s.stats.combos, 3], { text: '링 랩 해금(속도비 조정)', feature: 'lab' }),
  M('M05', '빨강 링을 Lv30으로 만들고 어센션', (s) => [s.stats.asc[0], 1], { text: '레온 승격(공격 ×1.5)·군단 화면', feature: 'heroes' }),
  M('M41', '스테이지 40 도달', (s) => [s.stats.bestStage, 40], { text: '자동 강화(Lv+를 자동 구매)', feature: 'autoBuy' }),
  M('M09', '스테이지 60 도달', (s) => [s.stats.bestStage, 60], { text: '환생 해금', feature: 'rebirth' }),
  M('M10', '환생하기', (s) => [s.stats.rebirths, 1], { text: '영구 트리·시련·주간 레이드 해금', feature: 'perm', feature2: 'raid' }),
  M('M08', '아이템 3종류 발견', (s) => [s.found.length, 3], { text: '도감 보너스 해금', feature: 'dexBonus' }),
  M('M11', '빨강 링 3회 어센션(누적)', (s) => [s.stats.ascTotal[0], 3], { text: '빨강 링 노드 +1', node: 0 }),
  M('M12', '1회 주행으로 스테이지 100', (s) => [s.runBest, 100], { text: '성녀 엘리아＋황금 링', ring: 2 }),
  M('M13', '3색 동기 30회', (s) => [s.stats.combo3, 30], { text: 'BURST 해금', feature: 'burst' }),
  M('M14', '아이템 12종류 발견', (s) => [s.found.length, 12], { text: '장비 슬롯이 빛난다(드롭률 UP)', feature: 'luck' }),
  M('M15', '환생 5회', (s) => [s.stats.rebirths, 5], { text: '파랑 링 노드 +1', node: 1 }),
  M('M16', '스테이지 150 도달', (s) => [s.runBest, 150], { text: '자동 튜닝 해금', feature: 'autotune' }),
  M('M17', '1회 주행으로 스테이지 250', (s) => [s.runBest, 250], { text: '소환사 녹스＋보라 링', ring: 3 }),
  M('M18', '4색 동기 50회', (s) => [s.stats.combo4, 50], { text: '보라 링 노드 +1', node: 3 }),
  M('M19', '영웅을 SSR로(누적 어센션 10)', (s) => [Math.max(...s.stats.ascTotal), 10], { text: '보스 토벌 시 반드시 레어 이상' }),
  M('M20', '아이템 20종류 발견', (s) => [s.found.length, 20], { text: '도감 보너스 강화' }),
  M('M21', '1회 주행으로 스테이지 300', (s) => [s.runBest, 300], { text: '혁명(상위 환생) 해금', feature: 'revolution' }),
  M('M22', '혁명하기', (s) => [s.stats.revolutions, 1], { text: '링 변이·세계 \'빙정 협곡\'', feature: 'mutation', world: 1 }),
  M('M23', '링 변이를 3회 일으키기', (s) => [s.stats.mutations, 3], { text: '황금 링 노드 +1', node: 2 }),
  M('M24', '빙정 협곡에서 스테이지 200', (s) => [s.worldBest[1] || 0, 200], { text: '세계 \'태엽 도시\'', world: 2 }),
  M('M25', '혁명 3회', (s) => [s.stats.revolutions, 3], { text: '초월 해금', feature: 'transcend' }),
  M('M26', '아이템 28종류 발견', (s) => [s.found.length, 28], { text: '도감 보너스 강화' }),
  M('M27', '초월하기', (s) => [s.stats.transcends, 1], { text: '최종 세계 \'공허의 우주 영역\'', world: 3 }),
  M('M28', '공허왕을 쓰러뜨리기', (s) => [s.stats.cleared ? 1 : 0, 1], { text: '인피니티 해금', feature: 'infinity' }),
  M('M29', '인피니티하기', (s) => [s.inf ? s.inf.count : 0, 1], { text: '2배속 타임 상한 ×2', feature: 'fluxPlus' }),
  M('M30', '인피니티 3회', (s) => [s.inf ? s.inf.count : 0, 3], { text: '무한의 시련으로 가는 길이 보였다' }),
  M('M31', '한계 돌파하기', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: '무한 회랑이 열린다', world: 4 }),
  M('M32', '무한 회랑에서 스테이지 100', (s) => [s.worldBest[4] || 0, 100], { text: '인피니티 포인트 +5', ip: 5 }),
  M('M33', '무한의 시련 3개 클리어', (s) => [(s.infChDone || []).length, 3], { text: '인피니티 포인트 획득 ×2', feature: 'ipDouble' }),
  M('M34', '무한 회랑에서 스테이지 300', (s) => [s.worldBest[4] || 0, 300], { text: '영겁(이터니티) 해금', feature: 'eternity' }),
  M('M35', '영겁하기', (s) => [s.eter ? s.eter.count : 0, 1], { text: '영겁 강화 해금' }),
  M('M36', '시간 왜곡에서 결정 10개', (s) => [s.tp || 0, 10], { text: '왜곡 강화가 빛난다' }),
  M('M37', '작전 카드 3장 장착', (s) => [(s.deck || []).length, 3], { text: '작전 카드 슬롯 +1', cslot: 1 }),
  M('M38', '군단을 8명으로 만들기', (s) => [(s.recruits || []).length, 8], { text: '흑광 +10', black: 10 }),
  M('M39', '영겁 5회', (s) => [s.eter ? s.eter.count : 0, 5], { text: '영겁 포인트 ×2', feature: 'epDouble' }),
  M('M40', '무한 회랑에서 스테이지 1000', (s) => [s.worldBest[4] || 0, 1000], { text: '진 엔딩' }),
];

export const FEATURE_INFO = {
  speed: ['속도 강화', '빨리 돌수록 공격 횟수도 배율 증가도 올라간다.'],
  items: ['아이템＆도감', '적이 드물게 장비를 떨어뜨린다. 도감을 채우면 전체가 강해진다.'],
  heroes: ['영웅 승격', '어센션할 때마다 영웅이 성장해 외형과 공격이 진화한다.'],
  lab: ['링 랩', '속도비가 1:2나 1:2:4 같은 정수비면 링이 동기되어 콤보가 나온다.'],
  dexBonus: ['도감 보너스', '발견한 아이템 종류만큼 전체 데미지가 오른다.'],
  rebirth: ['환생', '배율이 충분히 오르면 환생하자. 타이밍은 직접 정한다.'],
  perm: ['영구 트리', '환생 코어로 자동화와 영구 강화를 해금할 수 있다.'],
  burst: ['BURST', '게이지가 가득 차면 10초간 링이 5배속.'],
  autoBuy: ['자동 강화', 'Lv와 속도를 자동으로 살 수 있게 되었다(오른쪽 버튼으로 ON/OFF).'],
  luck: ['행운', '드롭률이 올랐다.'],
  autotune: ['자동 튜닝', '최적의 속도비를 자동으로 유지한다.'],
  revolution: ['혁명', '환생 배율과 영구 트리를 버리고 혁명의 기억을 얻는 상위 환생.'],
  mutation: ['링 변이', '어센션할 때 드물게 링이 돌연변이를 일으킨다.'],
  transcend: ['초월', '혁명마저 뛰어넘는 최상위 환생.'],
  infinity: ['인피니티', '∞에 도달했다. 모든 것을 인피니티 포인트로 바꿔 더 먼 곳으로.'],
  eternity: ['영겁', '인피니티마저 넘어선 층. 우주 탭에서 영겁할 수 있다.'],
  minerals: ['광석과 대장간', '적이 광석을 떨어뜨리게 되었다. 우주 탭에서 아이템을 정련할 수 있다.'],
  promotion: ['승진', '환생 배율을 바쳐 링을 영구적으로 강화할 수 있다.'],
  fluxPlus: ['2배속 타임', '모을 수 있는 2배속 타임이 2배가 되었다.'],
  ipDouble: ['무한의 샘', '인피니티 포인트 획득이 2배가 되었다.'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: '무한의 가속', text: '전체 링 속도 ×3', cost: 1 },
  { id: 'pow', name: '무한의 힘', text: '전체 데미지 ×1e30', cost: 1 },
  { id: 'core', name: '무한의 코어', text: '환생 코어 ×3', cost: 1 },
  { id: 'mem', name: '기억의 계승', text: '혁명의 기억 6개를 가지고 시작(바로 초월 가능)', cost: 2 },
  { id: 'autoRev', name: '자동 혁명', text: '조건을 채우면 자동으로 혁명', cost: 2 },
  { id: 'autoTr', name: '자동 초월', text: '조건을 채우면 자동으로 초월', cost: 2 },
  { id: 'ich', name: '무한의 시련', text: '무한의 시련 해금', cost: 3 },
  { id: 'gain', name: '영겁의 회전', text: '회전 배율 증가 ×1.5', cost: 3 },
  { id: 'break', name: '한계 돌파', text: '∞를 넘을 수 있다·무한 회랑', cost: 6 },
  { id: 'multi', name: '다중 우주', text: '인피니티 포인트 획득 ×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: '단번에 그리기', rule: '환생 불가', reward: '환생 배율 증가 ×1.5' },
  { id: 'i_noitem', name: '맨손의 영웅', rule: '아이템 효과 없음', reward: '아이템 배율 ×2' },
  { id: 'i_norank', name: '이름 없는 자', rule: '영웅 랭크 배율 없음', reward: '랭크 배율 ×2' },
];

ACHIEVEMENTS.push(
  A('i_1', '무한에 도달', '인피니티 1회', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', '무한의 단골', '인피니티 5회', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', '무한의 주민', '인피니티 20회', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', '한계 돌파', '∞를 넘다', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', '무한의 샘', '인피니티 포인트 합계 30 획득', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', '회랑의 나그네', '무한 회랑에서 스테이지 50', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', '회랑의 패자', '무한 회랑에서 스테이지 300', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', '끝없는 길', '무한 회랑에서 스테이지 1000', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', '무한의 시련', '무한의 시련 1개 클리어', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', '무한의 구도자', '무한의 시련 모두 클리어', (s) => (s.infChDone || []).length >= 3),
  A('f_use', '시간을 다루는 자', '2배속 타임을 합계 1시간 사용', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', '일주일의 여행', '7일 연속 로그인', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', '한 달의 여행', '로그인 합계 30일', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', '회전의 신', '링을 합계 1,000,000바퀴', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', '돌파의 신', '어센션 합계 500회', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', '무한 환생', '환생 1,000회', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', '혁명의 시대', '혁명 10회', (s) => s.stats.revolutions >= 10),
  A('s_e1e', '차원이 다른 자릿수', '공격력 1e400 도달', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: '영겁의 기억', text: '영겁해도 무한의 강화가 남는다', cost: 1 },
  { id: 'autoInf', name: '자동 인피니티', text: '자동화 규칙으로 인피니티', cost: 1 },
  { id: 'epPow', name: '영겁의 힘', text: '전체 데미지 ×1e50', cost: 2 },
  { id: 'ipx', name: '무한의 용출', text: '인피니티 포인트 획득 ×3', cost: 2 },
  { id: 'cardSlot', name: '작전의 재능', text: '작전 카드 슬롯 +1', cost: 2 },
  { id: 'dil', name: '이면 세계', text: '이면 세계(뒤집힌 세계) 해금', cost: 3 },
  { id: 'startCorr', name: '회랑의 지름길', text: '무한 회랑을 스테이지 101부터', cost: 4 },
  { id: 'lapx', name: '영겁의 회전', text: '회전 배율 증가 ×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: '뒤틀린 회전', text: '회전 배율 증가 +25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: '왜곡 완화', text: '왜곡 중 지수 +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: '결정의 칼날', text: '전체 데미지 ×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: '동광', col: PAL.clay },
  { id: 'ag', name: '은광', col: PAL.cloud },
  { id: 'au', name: '금광', col: PAL.gold },
  { id: 'star', name: '성광', col: PAL.cyan },
  { id: 'black', name: '흑광', col: PAL.plum },
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
  { id: 't0', name: '바보', text: '2배속 타임 +30분' },
  { id: 't1', name: '마법사', text: '10분간 전체 데미지 ×1e5' },
  { id: 't2', name: '여교황', text: '10분간 회전 배율 증가 ×2' },
  { id: 't3', name: '여제', text: '골드가 대량으로 쏟아진다' },
  { id: 't4', name: '황제', text: '10분간 전체 링 속도 ×2' },
  { id: 't6', name: '연인', text: '10분간 동기 유예 ×2' },
  { id: 't7', name: '전차', text: 'BURST 게이지 가득' },
  { id: 't8', name: '힘', text: '영구 전체 데미지 ×1.1' },
  { id: 't9', name: '은둔자', text: '아이템 1개 획득' },
  { id: 't10', name: '운명의 수레바퀴', text: '다른 카드를 한 장 더' },
  { id: 't15', name: '악마', text: '66%로 영구 전체 데미지 ×1.5／34%로 흑광 -3' },
  { id: 't17', name: '별', text: '영구 회전 배율 증가 +2%' },
  { id: 't18', name: '달', text: '10분간 치명타율 +20%' },
  { id: 't19', name: '태양', text: '10분간 골드 ×1e10' },
  { id: 't21', name: '세계', text: '전체 링 Lv +10(상한까지)' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: '양자리', text: '빨강 링 위력 ×1e8', need: 5 },
  { id: 'z2', name: '황소자리', text: '골드 ×1e5', need: 10 },
  { id: 'z3', name: '쌍둥이자리', text: '전체 링의 발동 노드 +1', need: 15 },
  { id: 'z4', name: '게자리', text: '오프라인 효율 +30%', need: 20 },
  { id: 'z5', name: '사자자리', text: '보스 대상 데미지 ×1e6', need: 25 },
  { id: 'z6', name: '처녀자리', text: '아이템과 광석 드롭 ×2', need: 30 },
  { id: 'z7', name: '천칭자리', text: '동기 유예 ×2', need: 35 },
  { id: 'z8', name: '전갈자리', text: '치명타율 +15%', need: 40 },
  { id: 'z9', name: '사수자리', text: '파랑 링 위력 ×1e8', need: 45 },
  { id: 'z10', name: '염소자리', text: '환생 배율 증가 ×1.1', need: 50 },
  { id: 'z11', name: '물병자리', text: '회전 배율 증가 +10%', need: 55 },
  { id: 'z12', name: '물고기자리', text: '2배속 타임 획득 ×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', '채굴자', '광석을 합계 #개', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', '대장장이', '정련을 합계 #회', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', '작전가', '작전 카드를 #장 뽑기', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', '간파', 'PERFECT를 합계 #회', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', '레이더', '레이드 휘장을 합계 #개', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', '승진자', '승진을 합계 #회', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', '영겁의 나그네', '영겁 #회', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', '왜곡의 수집가', '왜곡 결정을 합계 #개', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', '돌리는 사람', '링을 손으로 #바퀴 돌리기', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', '연타', '전장을 #회 탭', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', '섬멸', '적을 #마리 쓰러뜨리기', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', '작전의 달인', '작전 카드 1장을 Lv10으로 만들기', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', '군단 결성', '영웅 12명 집결', (s) => (s.recruits || []).length >= 12),
  A('s_devil', '신기', 'PERFECT를 50연속으로 성공', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', '전설의 레이더', '레이드에서 \'무지개\' 평가', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: '월간 패스(30일)', price: '¥370', text: '즉시 2배속 타임 3시간＋30일간 매일 로그인 시 2배속 타임 1시간과 코인(적 200마리 분량)', cat: 'top' },
  { id: 'rl_grow_rb', name: '환생 응원 팩', price: '¥300', text: '환생 코어 30·2배속 타임 4시간·코인 주머니(환생 해금 후 72시간 한정)', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: '혁명 응원 팩', price: '¥480', text: '환생 코어 100·흑광 10·2배속 타임 8시간(혁명 해금 후 72시간 한정)', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: '스타터 팩', price: '¥400', text: '코인 주머니＋2배속 타임 8시간(후반 소재 포함)', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: '광고 제거', price: '¥980', text: '광고 없이 광고 보상을 바로 받을 수 있다', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: '영웅 번들', price: '¥3,000', text: '2배속 타임 7일·흑광 120·한정 스킨 \'홍련\'(몇 번이든 구매 가능. 2회째부터는 스킨·오라 제외)', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: '군단 번들', price: '¥5,000', text: '2배속 타임 14일·흑광 250·한정 스킨 \'창천\'·금 오라(몇 번이든 구매 가능. 2회째부터는 스킨·오라 제외)', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: '전설 번들', price: '¥10,000', text: '2배속 타임 30일·흑광 600·한정 스킨 \'전설\'·무지개와 금 오라(몇 번이든 구매 가능. 2회째부터는 스킨·오라 제외)', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: '레기온 패스 프리미엄', price: '¥610', text: '이번 시즌(30일)의 프리미엄 보상. 이미 도달한 단도 소급해서 받을 수 있다', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: '코인 주머니', price: '¥120', text: '현재 스테이지 적 300마리 분량의 코인(환생으로 초기화)', cat: 'item' },
  { id: 'rl_coin_l', name: '코인 금고', price: '¥480', text: '현재 스테이지 적 2000마리 분량의 코인(환생으로 초기화)', cat: 'item' },
  { id: 'rl_flux_s', name: '2배속 타임(소)', price: '¥120', text: '게임이 2배속으로 진행되는 시간 4시간 분량', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: '2배속 타임(대)', price: '¥500', text: '게임이 2배속으로 진행되는 시간 24시간 분량', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: '흑광 ×10', price: '¥160', text: '작전 카드를 10회 뽑을 수 있다(배출률: 각 카드 균등)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: '흑광 ×60', price: '¥800', text: '작전 카드를 60회 뽑을 수 있다(배출률: 각 카드 균등)', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: '2배속 타임(특대)', price: '¥980', text: '게임이 2배속으로 진행되는 시간 72시간 분량(플레이하는 동안에만 줄어든다)', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: '흑광 ×130', price: '¥1,500', text: '작전 카드를 130회 뽑을 수 있다(배출률: 각 카드 균등)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: '흑광 ×200', price: '¥2,200', text: '작전 카드를 200회 뽑을 수 있다(배출률: 각 카드 균등)', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: '인피니티 팩', price: '¥800', text: '인피니티 포인트 +5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: '영겁 팩', price: '¥800', text: '영겁 포인트 +3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: '서포터 팩', price: '¥2,000', text: '2배속 타임 48시간·영웅에게 금 오라(후반 소재 포함)', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: '링 스킨: 네온', price: '¥160', text: '외형만 바뀝니다. 강함은 그대로', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: '링 스킨: 황금', price: '¥160', text: '외형만 바뀝니다. 강함은 그대로', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: '링 스킨: 벚꽃', price: '¥160', text: '외형만 바뀝니다. 강함은 그대로', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: '스킨 3종 세트', price: '¥360', text: '네온·황금·벚꽃을 한 번에(셋 다 없는 분께)', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: '무지개 오라', price: '¥240', text: '영웅에게서 무지갯빛 빛이 흩날린다(외형만)', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: '네온', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: '황금', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: '벚꽃', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: '홍련(영웅 번들)', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: '창천(군단 번들)', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: '전설(전설 번들)', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: '허공(패스 한정)', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: '16세 미만', cap: 5000 }, u18: { name: '16~17세', cap: 10000 }, adult: { name: '18세 이상', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: '코인(적 60마리 분량)', limit: 10 },
  { id: 'ad_flux', name: '2배속 타임 +30분', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'BURST 게이지 가득', limit: 6, need: 'burst' },
  { id: 'ad_black', name: '흑광 +1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: '2026년 12월', title: '출시', items: ['12명의 영웅과 4개의 링', '환생·혁명·초월·인피니티·영겁', '주간 레이드와 레기온 패스', '오리지널 BGM'] },
];
export const NEXT_CHAPTER = '매달 조금씩 새로운 영웅·월드·레이드 규칙을 추가해 나갑니다.';
