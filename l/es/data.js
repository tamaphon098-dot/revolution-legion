// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: 'Anillo rojo', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: 'Anillo azul', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: 'Anillo dorado', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: 'Anillo morado', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: 'Leon', job: 'Espadachín', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: 'Un tajo por vuelta. Su espada no deja de acelerar.' },
  seris: { name: 'Seris', job: 'Bruja', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: 'Magia de hielo. Doble daño al dar en el punto débil.' },
  elia: { name: 'Elia', job: 'Santa', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: 'Acelera todos los anillos con sus plegarias.' },
  nox: { name: 'Nox', job: 'Invocador', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: 'Invoca un dragón espiritual. Lento, pero golpea fuerte.' },
  mina: { name: 'Mina', job: 'Doble espada', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: 'Doble de nodos de activación. Cada golpe es débil (×0.6).' },
  garou: { name: 'Garou', job: 'Berserker', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: 'Más fuerte cuanto más golpea al mismo enemigo (máx. ×6).' },
  volt: { name: 'Volt', job: 'Mago del rayo', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: 'Un rayo remata cada combo de sincronía. Margen de sincronía +50%.' },
  luna: { name: 'Luna', job: 'Astróloga', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30% de crítico ×8. El crecimiento del anillo azul +10%.' },
  brom: { name: 'Brom', job: 'Herrero', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: 'Oro ×100 y el doble de mena. No se le da bien pelear.' },
  tia: { name: 'Tia', job: 'Bardo', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: 'Margen de sincronía ×2, multiplicador de combo ×2.' },
  zeno: { name: 'Zeno', job: 'Nigromante', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: 'Más fuerte por cada enemigo derrotado en la etapa.' },
  sierra: { name: 'Sierra', job: 'Maga del tiempo', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: 'Gira un anillo solo cada vuelta. Velocidad total +10%.' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: 'Llega a la etapa 120', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: '100 sincronías de 3 o más colores', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: 'Haz una Revolución', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: 'Reúne 100 menas en total', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: 'Derrota a 500 jefes', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '3 insignias de la Incursión semanal', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: 'Oro o más en la Incursión durante 3 semanas', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: 'Participa 6 semanas en la Incursión, o haz una Eternidad', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: 'Festival rojo', text: 'Daño del anillo rojo ×3, los demás ×0.3' },
  { id: 'r_sync', name: 'Festival de resonancia', text: 'Combo de sincronía ×10, ataque normal ×0.1' },
  { id: 'r_perf', name: 'Desafío de precisión', text: 'Daño de PERFECT ×5' },
  { id: 'r_slow', name: 'Día de gravedad', text: 'Velocidad de anillos ×0.5, daño ×4' },
  { id: 'r_crit', name: 'Festival crítico', text: 'Prob. crítica +30%' },
  { id: 'r_purple', name: 'Festival de invocación', text: 'Daño del anillo morado ×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: 'Ataque veloz', text: 'Velocidad de todos los anillos +5%/Lv' },
  { id: 'c_edge', name: 'Filo agudo', text: 'Poder del anillo rojo ×100/Lv' },
  { id: 'c_frost', name: 'Formación de escarcha', text: 'Poder del anillo azul ×100/Lv' },
  { id: 'c_choir', name: 'Himno', text: 'Poder del anillo dorado ×100/Lv' },
  { id: 'c_horde', name: 'Cien demonios', text: 'Poder del anillo morado ×100/Lv' },
  { id: 'c_link', name: 'Trabajo en equipo', text: 'Multiplicador de combo +50%/Lv' },
  { id: 'c_gold', name: 'Saqueo', text: 'Oro ×10/Lv' },
  { id: 'c_ore', name: 'Minería', text: 'Aparición de mena +50%/Lv' },
  { id: 'c_crit', name: 'Punto débil', text: 'Prob. crítica +5%/Lv' },
  { id: 'c_boss', name: 'Cazagigantes', text: 'Daño a jefes ×100/Lv' },
  { id: 'c_perf', name: 'Previsión', text: 'Margen de PERFECT +20% y multiplicador +0.5/Lv' },
  { id: 'c_time', name: 'Engranaje del tiempo', text: 'Tiempo x2 obtenido +20%/Lv' },
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
  IT('it_s1', 'Espada de madera', 's', 0), IT('it_s2', 'Espada de hierro', 's', 0), IT('it_s3', 'Espada de fuego', 's', 1), IT('it_s4', 'Espadas gemelas', 's', 1, 'node', 'Nodos de activación +1'),
  IT('it_s5', 'Katana espaciotemporal', 's', 2, 'extraLap', '15% de giro extra cada vuelta'), IT('it_s6', 'Mandoble mataldragones', 's', 2, 'boss', 'Doble contra jefes'), IT('it_s7', 'Espada sagrada', 's', 3), IT('it_s8', 'Mandoble de la Revolución', 's', 4, 'fullSync', 'Poder de sincronía perfecta ×20'),
  IT('it_m1', 'Bastón de madera', 'm', 0), IT('it_m2', 'Bastón de cristal', 'm', 0), IT('it_m3', 'Bastón de hielo', 'm', 1, 'freeze', 'Congela al impactar (daño recibido ×1.5)'), IT('it_m4', 'Bastón del rayo', 'm', 1),
  IT('it_m5', 'Bastón de resonancia', 'm', 2, 'syncWin', 'Margen de sincronía ×2.5'), IT('it_m6', 'Bastón estelar', 'm', 2), IT('it_m7', 'Bastón lunar', 'm', 3, 'node', 'Nodos de activación +1'), IT('it_m8', 'Bastón del sabio', 'm', 4),
  IT('it_h1', 'Campana de plegaria', 'h', 0), IT('it_h2', 'Anillo sagrado', 'h', 0), IT('it_h3', 'Pluma de ángel', 'h', 1), IT('it_h4', 'Cáliz sanador', 'h', 1),
  IT('it_h5', 'Rosario solar', 'h', 2, 'haste', 'Velocidad de todos los anillos +20%'), IT('it_h6', 'Escudo de luz sagrada', 'h', 2), IT('it_h7', 'Corona de la diosa', 'h', 3, 'haste', 'Velocidad de todos los anillos +20%'), IT('it_h8', 'Libro de bendiciones', 'h', 4),
  IT('it_n1', 'Grimorio negro', 'n', 0), IT('it_n2', 'Huevo de dragón', 'n', 0), IT('it_n3', 'Botella de espíritu', 'n', 1), IT('it_n4', 'Llave de invocación', 'n', 1),
  IT('it_n5', 'Orbe del mal de ojo', 'n', 2, 'crit', '25% de crítico ×4'), IT('it_n6', 'Flauta de hueso de dragón', 'n', 2), IT('it_n7', 'Anillo del pacto', 'n', 3), IT('it_n8', 'Guadaña del inframundo', 'n', 4, 'crit', '25% de crítico ×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: 'Slime', weak: 1 }, { s: 'en_w1_mush', n: 'Hongo furioso', weak: 0 }, { s: 'en_w1_wolf', n: 'Lobo de la pradera', weak: 1 }, { s: 'enemy_skeleton', n: 'Caballero no muerto', weak: 0 }, { s: 'enemy_imp', n: 'Diablillo', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: 'Lobo colmillo de hielo', weak: 0 }, { s: 'en_w2_wraith', n: 'Espectro de escarcha', weak: 0 }, { s: 'en_w2_yeti', n: 'Yeti pequeño de nieve', weak: 1 }, { s: 'en_w2_bat', n: 'Murciélago de cristal de hielo', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: 'Soldado engranaje', weak: 1 }, { s: 'en_w3_owl', n: 'Búho reloj', weak: 0 }, { s: 'en_w3_mage', n: 'Mago del reloj de arena', weak: 0 }, { s: 'enemy_golem', n: 'Gólem de latón', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: 'Ojo vacío', weak: 1 }, { s: 'en_w4_jelly', n: 'Medusa estelar', weak: 0 }, { s: 'en_w4_knight', n: 'Caballero sombrío', weak: 1 }, { s: 'enemy_imp', n: 'Diablillo del vacío', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: 'Espectro del corredor', weak: 0 }, { s: 'en_w3_mage', n: 'Mago del infinito', weak: 1 }, { s: 'en_w4_knight', n: 'Guardián del corredor', weak: 0 }, { s: 'en_w1_wolf', n: 'Lobo errante', weak: 1 }, { s: 'en_w4_jelly', n: 'Medusa espaciotemporal', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: 'Gardom, rey de las rocas', scale: 1.6 }, { s: 'boss_dragon', n: 'Valgrays, dragón del abismo', scale: 1 }],
  [{ s: 'bo_w2', n: 'Neve, emperatriz de cristal de hielo', scale: 1 }, { s: 'en_w2_yeti', n: 'Giga Yeti, bestia de las nieves', scale: 2 }],
  [{ s: 'bo_w3', n: 'Cronos, titán del reloj', scale: 1 }, { s: 'en_w3_gear', n: 'General engranaje', scale: 2 }],
  [{ s: 'boss_dragon', n: 'Dragón del vacío', scale: 1 }, { s: 'en_w4_knight', n: 'Rey sombrío', scale: 1.8 }],
  [{ s: 'bo_w2', n: 'Emperatriz del corredor', scale: 1 }, { s: 'bo_w3', n: 'Titán del corredor', scale: 1 }, { s: 'boss_dragon', n: 'Dragón del corredor', scale: 1 }, { s: 'bo_w4', n: 'Sombra del Rey del Vacío', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: 'Rey del Vacío Nebulus', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: 'Resistencia física', tip: 'Daño del anillo rojo 1/100', col: PAL.red },
  magic: { name: 'Resistencia mágica', tip: 'Daño del anillo azul 1/100', col: PAL.sky },
  barrier: { name: 'Barrera', tip: 'Casi inmune salvo a combos de sincronía', col: PAL.lemon },
  regen: { name: 'Regeneración', tip: 'Recupera 2% de HP por segundo', col: PAL.leaf },
  rush: { name: 'Asalto', tip: 'Límite de tiempo: 15 s', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: 'Desafío del destello', rule: 'Lucha solo con el anillo rojo', goal: 60, reward: 'Nodos de activación del anillo rojo +1' },
  { id: 'nospeed', name: 'Desafío de quietud', rule: 'No se puede mejorar la velocidad', goal: 60, reward: 'Velocidad de todos los anillos +15%' },
  { id: 'noasc', name: 'Desafío de voluntad', rule: 'No se puede hacer Ascensión', goal: 70, reward: 'Poder que se conserva tras la Ascensión: 50% → 65%' },
  { id: 'sync', name: 'Desafío de resonancia', rule: 'Daño que no sea de combo de sincronía 1/100', goal: 70, reward: 'Multiplicador de combo ×2' },
  { id: 'nopm', name: 'Desafío del origen', rule: 'El multiplicador de Renacimiento no cuenta', goal: 90, reward: 'Crecimiento del multiplicador de Renacimiento ×1.2' },
  { id: 'rush', name: 'Desafío del instante', rule: 'Límite de tiempo del jefe: 10 s', goal: 100, reward: 'Duración de BURST +5 s' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', 'La primera vuelta', 'Da 100 vueltas a los anillos en total', (s) => lapsTotal(s) >= 100),
  A('a_lap2', 'Maestro del giro', 'Da 1,000 vueltas a los anillos en total', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', 'Movimiento perpetuo', 'Da 10,000 vueltas a los anillos en total', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', 'El mundo gira', 'Da 100,000 vueltas a los anillos en total', (s) => lapsTotal(s) >= 100000),
  A('a_u1', 'Poder de 10 mil', 'El ataque llega a 10 mil', (s) => s.units >= 1),
  A('a_u2', 'Poder de 100 M', 'El ataque llega a 100 millones', (s) => s.units >= 2),
  A('a_u3', 'Poder de 1e12', 'El ataque llega a 1e12', (s) => s.units >= 3),
  A('a_u4', 'Poder de 1e16', 'El ataque llega a 1e16', (s) => s.units >= 4),
  A('a_u8', 'Más allá del abismo', 'El ataque llega a 1e32', (s) => s.units >= 8),
  A('a_u12', 'Hacia el extremo', 'El ataque llega a 1e48', (s) => s.units >= 12),
  A('a_u17', 'Incontable', 'El ataque llega a 1e68', (s) => s.units >= 17),
  A('a_as1', 'Primera Ruptura de límite', '1 Ascensión', (s) => ascTotal(s) >= 1),
  A('a_as2', 'Habitual de la ruptura', '20 Ascensiones en total', (s) => ascTotal(s) >= 20),
  A('a_as3', 'Sin límites', '100 Ascensiones en total', (s) => ascTotal(s) >= 100),
  A('a_rb1', 'Renacido', '1 Renacimiento', (s) => s.stats.rebirths >= 1),
  A('a_rb2', 'Samsara', '10 Renacimientos', (s) => s.stats.rebirths >= 10),
  A('a_rb3', 'El fin del samsara', '100 Renacimientos', (s) => s.stats.rebirths >= 100),
  A('a_c2', 'Órbitas superpuestas', '10 combos de sincronía', (s) => s.stats.combos >= 10),
  A('a_c3', 'Trío', '50 sincronías de 3 colores', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', 'Sincronía perfecta', '100 sincronías de 4 colores', (s) => s.stats.combo4 >= 100),
  A('a_b1', 'Cazajefes', 'Derrota a 10 jefes', (s) => s.stats.bossKills >= 10),
  A('a_b2', 'Exterminador de jefes', 'Derrota a 100 jefes', (s) => s.stats.bossKills >= 100),
  A('a_b3', 'Vencedor legendario', 'Derrota a 1,000 jefes', (s) => s.stats.bossKills >= 1000),
  A('a_tr', 'Superar mecánicas', 'Derrota a 5 jefes con rasgos', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', 'Coleccionista', '8 tipos de objetos', (s) => s.found.length >= 8),
  A('a_d2', 'Buen ojo', '16 tipos de objetos', (s) => s.found.length >= 16),
  A('a_d3', 'Gran coleccionista', '24 tipos de objetos', (s) => s.found.length >= 24),
  A('a_d4', 'Códice completo', 'Los 32 tipos de objetos', (s) => s.found.length >= 32),
  A('a_ur', 'Brillo arcoíris', 'Consigue un objeto UR', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', 'Entrada a los desafíos', 'Supera 1 desafío', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', 'Buscador de desafíos', 'Supera 3 desafíos', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', 'Todos los desafíos', 'Supera los 6 desafíos', (s) => (s.chDone || []).length >= 6),
  A('a_mu', 'Mutación repentina', 'Provoca una mutación de anillo', (s) => s.stats.mutations >= 1),
  A('a_rv', 'Revolucionario', '1 Revolución', (s) => s.stats.revolutions >= 1),
  A('a_w2', 'Viajero del hielo', 'Etapa 100 en el Cañón de Cristal de Hielo', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', 'Viajero del tiempo', 'Etapa 100 en la Ciudad Mecánica', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', 'Trascendente', 'Trasciende', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', 'Derrota al Rey del Vacío', (s) => s.stats.cleared),
  // secrets
  A('s_harm', 'Armonía', 'Ajusta la proporción de velocidad de los 4 anillos a 1:2:4:8', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', 'Rayo veloz', 'Derrota a un jefe con 25 s o más restantes', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', 'Observador', 'Llega a la etapa 15 tras renacer sin mejorar nada', (s) => !!s.stats.lazy, true),
  A('s_od', 'Desbocado', 'Derrota a un jefe durante Overdrive', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: 'Pradera del comienzo', bg: 'bgw_1', law: 'Mundo normal', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: 'Cañón de Cristal de Hielo', bg: 'bgw_2', law: 'Anillo azul ×5 / anillo rojo ×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: 'Ciudad Mecánica', bg: 'bgw_3', law: 'La velocidad de giro cambia al azar / crecimiento del multiplicador de vueltas ×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: 'Zona del Vacío', bg: 'bgw_4', law: 'El mundo final. El Rey del Vacío aparece en la etapa 300', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: 'Corredor Infinito', bg: 'bg_temple', law: 'Un corredor sin fin. Cuanto más avanzas, más Puntos de Infinito', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: 'Espada mágica', mult: 3 }, 3: { name: 'Círculo de luz sagrada', mult: 10 }, 4: { name: 'Tajos de la Revolución', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: 'Doble giro', text: 'El multiplicador crece como 2 vueltas por cada 1' },
  { id: 'reverse', name: 'Giro inverso', text: 'Crecimiento del multiplicador ×1.6, velocidad ×0.8' },
  { id: 'split', name: 'División', text: 'Nodos de activación +2' },
  { id: 'crit', name: 'Especialista crítico', text: '30% de crítico ×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: 'Giro múltiple', text: 'Velocidad de todos los anillos +10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: 'Flujo dorado', text: 'Oro obtenido ×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: 'Secreto del giro', text: 'Crecimiento del multiplicador de vueltas +10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: 'Nodos múltiples', text: 'Nodos de activación de todos los anillos +1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: 'Ascensión automática', text: 'Ascensión automática al llegar al Lv máximo', max: 1, cost: () => 8 },
  { id: 'start', name: 'Espaciotiempo acelerado', text: 'Empieza en la etapa +10 tras renacer', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: 'Giro de ensueño', text: 'Eficiencia sin conexión +20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: 'Renacimiento automático', text: 'Renace al alcanzar el multiplicador indicado', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', 'Da 15 vueltas al anillo rojo', (s) => [s.stats.laps[0], 15], { text: 'Oro +100', gold: 2 }),
  M('M02', 'Sube el anillo rojo a Lv10', (s) => [s.rings[0].lv, 10], { text: 'Desbloquea la mejora de velocidad', feature: 'speed' }),
  M('M03', 'Derrota al jefe de la etapa 10', (s) => [s.stats.bestStage - 1, 10], { text: 'Desbloquea los drops de objetos y el Códice', feature: 'items' }),
  M('M06', 'Llega a la etapa 20', (s) => [s.stats.bestStage, 20], { text: 'Nueva aliada: la bruja Seris + anillo azul', ring: 1 }),
  M('M07', '3 combos de sincronía', (s) => [s.stats.combos, 3], { text: 'Desbloquea el Laboratorio de anillos (ajuste de proporción de velocidad)', feature: 'lab' }),
  M('M05', 'Anillo rojo Lv30 y haz Ascensión', (s) => [s.stats.asc[0], 1], { text: 'Promoción de Leon (ataque ×1.5) y pantalla de Legión', feature: 'heroes' }),
  M('M41', 'Llega a la etapa 40', (s) => [s.stats.bestStage, 40], { text: 'Auto-mejora (compra Lv+ automáticamente)', feature: 'autoBuy' }),
  M('M09', 'Llega a la etapa 60', (s) => [s.stats.bestStage, 60], { text: 'Desbloquea el Renacimiento', feature: 'rebirth' }),
  M('M10', 'Renace', (s) => [s.stats.rebirths, 1], { text: 'Desbloquea el árbol permanente, los desafíos y la Incursión semanal', feature: 'perm', feature2: 'raid' }),
  M('M08', 'Encuentra 3 tipos de objetos', (s) => [s.found.length, 3], { text: 'Desbloquea los bonos del Códice', feature: 'dexBonus' }),
  M('M11', '3 Ascensiones del anillo rojo (acumuladas)', (s) => [s.stats.ascTotal[0], 3], { text: 'Nodo del anillo rojo +1', node: 0 }),
  M('M12', 'Etapa 100 en una sola partida', (s) => [s.runBest, 100], { text: 'La santa Elia + anillo dorado', ring: 2 }),
  M('M13', '30 sincronías de 3 colores', (s) => [s.stats.combo3, 30], { text: 'Desbloquea BURST', feature: 'burst' }),
  M('M14', 'Encuentra 12 tipos de objetos', (s) => [s.found.length, 12], { text: 'Las ranuras de equipo brillan (más drops)', feature: 'luck' }),
  M('M15', '5 Renacimientos', (s) => [s.stats.rebirths, 5], { text: 'Nodo del anillo azul +1', node: 1 }),
  M('M16', 'Llega a la etapa 150', (s) => [s.runBest, 150], { text: 'Desbloquea la sintonía automática', feature: 'autotune' }),
  M('M17', 'Etapa 250 en una sola partida', (s) => [s.runBest, 250], { text: 'El invocador Nox + anillo morado', ring: 3 }),
  M('M18', '50 sincronías de 4 colores', (s) => [s.stats.combo4, 50], { text: 'Nodo del anillo morado +1', node: 3 }),
  M('M19', 'Héroes a SSR (10 Ascensiones acumuladas)', (s) => [Math.max(...s.stats.ascTotal), 10], { text: 'Los jefes siempre dan rareza R o superior' }),
  M('M20', 'Encuentra 20 tipos de objetos', (s) => [s.found.length, 20], { text: 'Mejora de los bonos del Códice' }),
  M('M21', 'Etapa 300 en una sola partida', (s) => [s.runBest, 300], { text: 'Desbloquea la Revolución (Renacimiento superior)', feature: 'revolution' }),
  M('M22', 'Haz una Revolución', (s) => [s.stats.revolutions, 1], { text: 'Mutación de anillos y mundo "Cañón de Cristal de Hielo"', feature: 'mutation', world: 1 }),
  M('M23', 'Provoca 3 mutaciones de anillo', (s) => [s.stats.mutations, 3], { text: 'Nodo del anillo dorado +1', node: 2 }),
  M('M24', 'Etapa 200 en el Cañón de Cristal de Hielo', (s) => [s.worldBest[1] || 0, 200], { text: 'Mundo "Ciudad Mecánica"', world: 2 }),
  M('M25', '3 Revoluciones', (s) => [s.stats.revolutions, 3], { text: 'Desbloquea la Trascendencia', feature: 'transcend' }),
  M('M26', 'Encuentra 28 tipos de objetos', (s) => [s.found.length, 28], { text: 'Mejora de los bonos del Códice' }),
  M('M27', 'Trasciende', (s) => [s.stats.transcends, 1], { text: 'Mundo final "Zona del Vacío"', world: 3 }),
  M('M28', 'Derrota al Rey del Vacío', (s) => [s.stats.cleared ? 1 : 0, 1], { text: 'Desbloquea el Infinito', feature: 'infinity' }),
  M('M29', 'Alcanza el Infinito', (s) => [s.inf ? s.inf.count : 0, 1], { text: 'Límite de Tiempo x2 ×2', feature: 'fluxPlus' }),
  M('M30', '3 Infinitos', (s) => [s.inf ? s.inf.count : 0, 3], { text: 'Se vislumbra el camino a los Desafíos del Infinito' }),
  M('M31', 'Rompe el infinito', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: 'Se abre el Corredor Infinito', world: 4 }),
  M('M32', 'Etapa 100 en el Corredor Infinito', (s) => [s.worldBest[4] || 0, 100], { text: 'Puntos de Infinito +5', ip: 5 }),
  M('M33', 'Supera 3 Desafíos del Infinito', (s) => [(s.infChDone || []).length, 3], { text: 'Puntos de Infinito obtenidos ×2', feature: 'ipDouble' }),
  M('M34', 'Etapa 300 en el Corredor Infinito', (s) => [s.worldBest[4] || 0, 300], { text: 'Desbloquea la Eternidad', feature: 'eternity' }),
  M('M35', 'Alcanza la Eternidad', (s) => [s.eter ? s.eter.count : 0, 1], { text: 'Desbloquea las mejoras de Eternidad' }),
  M('M36', '10 cristales en la Dilatación temporal', (s) => [s.tp || 0, 10], { text: 'Brillan las mejoras de dilatación' }),
  M('M37', 'Equipa 3 cartas tácticas', (s) => [(s.deck || []).length, 3], { text: 'Ranuras de cartas tácticas +1', cslot: 1 }),
  M('M38', 'Reúne una Legión de 8 héroes', (s) => [(s.recruits || []).length, 8], { text: 'Mena negra +10', black: 10 }),
  M('M39', '5 Eternidades', (s) => [s.eter ? s.eter.count : 0, 5], { text: 'Puntos de Eternidad ×2', feature: 'epDouble' }),
  M('M40', 'Etapa 1000 en el Corredor Infinito', (s) => [s.worldBest[4] || 0, 1000], { text: 'El verdadero final' }),
];

export const FEATURE_INFO = {
  speed: ['Mejora de velocidad', 'Cuanto más rápido giran, más ataques y más crece el multiplicador.'],
  items: ['Objetos y Códice', 'Los enemigos sueltan equipo de vez en cuando. Completar el Códice fortalece a todos.'],
  heroes: ['Promoción de héroes', 'Cada Ascensión hace crecer al héroe: cambia su aspecto y su ataque.'],
  lab: ['Laboratorio de anillos', 'Con proporciones enteras como 1:2 o 1:2:4, los anillos se sincronizan y sale el combo.'],
  dexBonus: ['Bono del Códice', 'Todo el daño sube según los tipos de objetos encontrados.'],
  rebirth: ['Renacimiento', 'Renace cuando el multiplicador haya crecido bastante. Tú eliges el momento.'],
  perm: ['Árbol permanente', 'Con los Núcleos de renacimiento desbloqueas automatización y mejoras permanentes.'],
  burst: ['BURST', 'Con la barra llena, los anillos van a velocidad x5 durante 10 s.'],
  autoBuy: ['Auto-mejora', 'Ahora Lv y velocidad se compran solos (ON/OFF con el botón de la derecha).'],
  luck: ['Suerte', 'Subió la tasa de drops.'],
  autotune: ['Sintonía automática', 'Mantiene automáticamente la mejor proporción de velocidad.'],
  revolution: ['Revolución', 'Renacimiento superior: pierdes el multiplicador y el árbol permanente, y ganas Memoria de la Revolución.'],
  mutation: ['Mutación de anillo', 'Al hacer Ascensión, un anillo puede mutar de repente.'],
  transcend: ['Trascendencia', 'El renacimiento supremo, más allá incluso de la Revolución.'],
  infinity: ['Infinito', 'Llegaste al ∞. Conviértelo todo en Puntos de Infinito y sigue adelante.'],
  eternity: ['Eternidad', 'Un nivel más allá del Infinito. Puedes hacer Eternidad en la pestaña Cosmos.'],
  minerals: ['Mena y forja', 'Los enemigos ahora sueltan mena. En la pestaña Cosmos puedes refinar objetos.'],
  promotion: ['Avance', 'Sacrifica el multiplicador de Renacimiento para fortalecer un anillo de forma permanente.'],
  fluxPlus: ['Tiempo x2', 'El Tiempo x2 que puedes acumular se duplicó.'],
  ipDouble: ['Fuente del infinito', 'Los Puntos de Infinito obtenidos se duplicaron.'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: 'Aceleración infinita', text: 'Velocidad de todos los anillos ×3', cost: 1 },
  { id: 'pow', name: 'Poder infinito', text: 'Todo el daño ×1e30', cost: 1 },
  { id: 'core', name: 'Núcleo infinito', text: 'Núcleo de renacimiento ×3', cost: 1 },
  { id: 'mem', name: 'Herencia de la Memoria', text: 'Empiezas con 6 Memorias de la Revolución (puedes trascender de inmediato)', cost: 2 },
  { id: 'autoRev', name: 'Revolución automática', text: 'Hace Revolución automáticamente al cumplir las condiciones', cost: 2 },
  { id: 'autoTr', name: 'Trascendencia automática', text: 'Trasciende automáticamente al cumplir las condiciones', cost: 2 },
  { id: 'ich', name: 'Desafíos del Infinito', text: 'Desbloquea los Desafíos del Infinito', cost: 3 },
  { id: 'gain', name: 'Giro de la Eternidad', text: 'Crecimiento del multiplicador de vueltas ×1.5', cost: 3 },
  { id: 'break', name: 'Romper el infinito', text: 'Puedes superar el ∞ · Corredor Infinito', cost: 6 },
  { id: 'multi', name: 'Multiverso', text: 'Puntos de Infinito obtenidos ×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: 'De un solo trazo', rule: 'No se puede renacer', reward: 'Crecimiento del multiplicador de Renacimiento ×1.5' },
  { id: 'i_noitem', name: 'Héroe con las manos vacías', rule: 'Sin efecto de objetos', reward: 'Multiplicador de objetos ×2' },
  { id: 'i_norank', name: 'Sin nombre', rule: 'Sin multiplicador de rango de héroe', reward: 'Multiplicador de rango ×2' },
];

ACHIEVEMENTS.push(
  A('i_1', 'Llegar al infinito', '1 Infinito', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', 'Habitual del infinito', '5 Infinitos', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', 'Habitante del infinito', '20 Infinitos', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', 'Romper el infinito', 'Superar el ∞', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', 'Fuente del infinito', 'Obtén 30 Puntos de Infinito en total', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', 'Viajero del corredor', 'Etapa 50 en el Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', 'Conquistador del corredor', 'Etapa 300 en el Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', 'Camino sin fin', 'Etapa 1000 en el Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', 'Desafíos del Infinito', 'Supera 1 Desafío del Infinito', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', 'Buscador del infinito', 'Supera todos los Desafíos del Infinito', (s) => (s.infChDone || []).length >= 3),
  A('f_use', 'Señor del tiempo', 'Usa Tiempo x2 durante 1 hora en total', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', 'Viaje de una semana', '7 días seguidos de inicio de sesión', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', 'Viaje de un mes', '30 días de inicio de sesión en total', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', 'Dios del giro', 'Da 1,000,000 de vueltas a los anillos en total', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', 'Dios de la ruptura', '500 Ascensiones en total', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', 'Renacimiento infinito', '1,000 Renacimientos', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', 'Era de la Revolución', '10 Revoluciones', (s) => s.stats.revolutions >= 10),
  A('s_e1e', 'Fuera de escala', 'El ataque llega a 1e400', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: 'Memoria de la Eternidad', text: 'Las mejoras del infinito se conservan al hacer Eternidad', cost: 1 },
  { id: 'autoInf', name: 'Infinito automático', text: 'Alcanza el Infinito con reglas de automatización', cost: 1 },
  { id: 'epPow', name: 'Poder de la Eternidad', text: 'Todo el daño ×1e50', cost: 2 },
  { id: 'ipx', name: 'Manantial del infinito', text: 'Puntos de Infinito obtenidos ×3', cost: 2 },
  { id: 'cardSlot', name: 'Talento táctico', text: 'Ranuras de cartas tácticas +1', cost: 2 },
  { id: 'dil', name: 'Dilatación', text: 'Desbloquea la Dilatación (el mundo invertido)', cost: 3 },
  { id: 'startCorr', name: 'Atajo del corredor', text: 'Empieza el Corredor Infinito desde la etapa 101', cost: 4 },
  { id: 'lapx', name: 'Giro de la Eternidad', text: 'Crecimiento del multiplicador de vueltas ×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: 'Giro distorsionado', text: 'Crecimiento del multiplicador de vueltas +25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: 'Alivio de la distorsión', text: 'Exponente en la distorsión +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: 'Filo de cristal', text: 'Todo el daño ×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: 'Cobre', col: PAL.clay },
  { id: 'ag', name: 'Plata', col: PAL.cloud },
  { id: 'au', name: 'Oro', col: PAL.gold },
  { id: 'star', name: 'Estelar', col: PAL.cyan },
  { id: 'black', name: 'Mena negra', col: PAL.plum },
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
  { id: 't0', name: 'El Loco', text: 'Tiempo x2 +30 min' },
  { id: 't1', name: 'El Mago', text: 'Todo el daño ×1e5 durante 10 min' },
  { id: 't2', name: 'La Sacerdotisa', text: 'Crecimiento del multiplicador de vueltas ×2 durante 10 min' },
  { id: 't3', name: 'La Emperatriz', text: 'Brota una gran cantidad de oro' },
  { id: 't4', name: 'El Emperador', text: 'Velocidad de todos los anillos ×2 durante 10 min' },
  { id: 't6', name: 'Los Enamorados', text: 'Margen de sincronía ×2 durante 10 min' },
  { id: 't7', name: 'El Carro', text: 'Barra de BURST llena' },
  { id: 't8', name: 'La Fuerza', text: 'Permanente: todo el daño ×1.1' },
  { id: 't9', name: 'El Ermitaño', text: 'Obtienes 1 objeto' },
  { id: 't10', name: 'La Rueda de la Fortuna', text: 'Otra carta más' },
  { id: 't15', name: 'El Diablo', text: '66%: permanente, todo el daño ×1.5 / 34%: Mena negra -3' },
  { id: 't17', name: 'La Estrella', text: 'Permanente: crecimiento del multiplicador de vueltas +2%' },
  { id: 't18', name: 'La Luna', text: 'Prob. crítica +20% durante 10 min' },
  { id: 't19', name: 'El Sol', text: 'Oro ×1e10 durante 10 min' },
  { id: 't21', name: 'El Mundo', text: 'Lv +10 en todos los anillos (hasta el límite)' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: 'Aries', text: 'Poder del anillo rojo ×1e8', need: 5 },
  { id: 'z2', name: 'Tauro', text: 'Oro ×1e5', need: 10 },
  { id: 'z3', name: 'Géminis', text: 'Nodos de activación de todos los anillos +1', need: 15 },
  { id: 'z4', name: 'Cáncer', text: 'Eficiencia sin conexión +30%', need: 20 },
  { id: 'z5', name: 'Leo', text: 'Daño a jefes ×1e6', need: 25 },
  { id: 'z6', name: 'Virgo', text: 'Drops de objetos y mena ×2', need: 30 },
  { id: 'z7', name: 'Libra', text: 'Margen de sincronía ×2', need: 35 },
  { id: 'z8', name: 'Escorpio', text: 'Prob. crítica +15%', need: 40 },
  { id: 'z9', name: 'Sagitario', text: 'Poder del anillo azul ×1e8', need: 45 },
  { id: 'z10', name: 'Capricornio', text: 'Crecimiento del multiplicador de Renacimiento ×1.1', need: 50 },
  { id: 'z11', name: 'Acuario', text: 'Crecimiento del multiplicador de vueltas +10%', need: 55 },
  { id: 'z12', name: 'Piscis', text: 'Tiempo x2 obtenido ×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', 'Minero', 'Reúne # menas en total', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', 'Herrero', 'Refina # veces en total', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', 'Estratega', 'Saca # cartas tácticas', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', 'Previsión', '# PERFECT en total', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', 'Asaltante', '# insignias de Incursión en total', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', 'Ascendido', '# Avances en total', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', 'Viajero de la Eternidad', '# Eternidades', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', 'Coleccionista de distorsión', '# cristales de distorsión en total', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', 'Girador', 'Gira los anillos a mano # vueltas', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', 'Toques rápidos', 'Toca el campo de batalla # veces', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', 'Aniquilación', 'Derrota a # enemigos', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', 'Maestro táctico', 'Sube una carta táctica a Lv10', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', 'Formación de la Legión', 'Reúne a los 12 héroes', (s) => (s.recruits || []).length >= 12),
  A('s_devil', 'Hazaña divina', '50 PERFECT seguidos', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', 'Asaltante legendario', 'Calificación "Arcoíris" en la Incursión', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: 'Pase mensual (30 días)', price: '¥370', text: 'Al instante, 3 horas de Tiempo x2. Durante 30 días, al iniciar sesión cada día: 1 hora de Tiempo x2 y monedas (equivalentes a 200 enemigos)', cat: 'top' },
  { id: 'rl_grow_rb', name: 'Pack de apoyo al Renacimiento', price: '¥300', text: '30 Núcleos de renacimiento, 4 horas de Tiempo x2 y bolsa de monedas (solo 72 horas desde que desbloqueas el Renacimiento)', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: 'Pack de apoyo a la Revolución', price: '¥480', text: '100 Núcleos de renacimiento, 10 Mena negra y 8 horas de Tiempo x2 (solo 72 horas desde que desbloqueas la Revolución)', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: 'Pack inicial', price: '¥400', text: 'Bolsa de monedas + 8 horas de Tiempo x2 (con materiales para la etapa avanzada)', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: 'Quitar anuncios', price: '¥980', text: 'Recibe al instante las recompensas de anuncios sin verlos', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: 'Pack de héroe', price: '¥3,000', text: '7 días de Tiempo x2, 120 Mena negra y la apariencia exclusiva "Carmesí" (se puede comprar varias veces. Desde la 2.ª, sin apariencia ni aura)', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: 'Pack de Legión', price: '¥5,000', text: '14 días de Tiempo x2, 250 Mena negra, la apariencia exclusiva "Cielo azul" y aura dorada (se puede comprar varias veces. Desde la 2.ª, sin apariencia ni aura)', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: 'Pack legendario', price: '¥10,000', text: '30 días de Tiempo x2, 600 Mena negra, la apariencia exclusiva "Leyenda" y aura arcoíris y dorada (se puede comprar varias veces. Desde la 2.ª, sin apariencia ni aura)', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: 'Pase de Legión Premium', price: '¥610', text: 'Recompensas Premium de esta temporada (30 días). Puedes recoger también las de los niveles ya alcanzados', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: 'Bolsa de monedas', price: '¥120', text: 'Monedas equivalentes a 300 enemigos de la etapa actual (se reinicia al renacer)', cat: 'item' },
  { id: 'rl_coin_l', name: 'Cofre de monedas', price: '¥480', text: 'Monedas equivalentes a 2000 enemigos de la etapa actual (se reinicia al renacer)', cat: 'item' },
  { id: 'rl_flux_s', name: 'Tiempo x2 (pequeño)', price: '¥120', text: '4 horas con el juego a doble velocidad', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: 'Tiempo x2 (grande)', price: '¥500', text: '24 horas con el juego a doble velocidad', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: 'Mena negra ×10', price: '¥160', text: 'Saca 10 cartas tácticas (probabilidad: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: 'Mena negra ×60', price: '¥800', text: 'Saca 60 cartas tácticas (probabilidad: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: 'Tiempo x2 (extragrande)', price: '¥980', text: '72 horas con el juego a doble velocidad (solo se gastan mientras juegas)', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: 'Mena negra ×130', price: '¥1,500', text: 'Saca 130 cartas tácticas (probabilidad: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: 'Mena negra ×200', price: '¥2,200', text: 'Saca 200 cartas tácticas (probabilidad: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: 'Pack Infinito', price: '¥800', text: 'Puntos de Infinito +5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: 'Pack Eternidad', price: '¥800', text: 'Puntos de Eternidad +3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: 'Pack Aliado', price: '¥2,000', text: '48 horas de Tiempo x2 y aura dorada para tus héroes (con materiales para la etapa avanzada)', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: 'Apariencia de anillo: Neón', price: '¥160', text: 'Solo estética. No cambia tu fuerza', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: 'Apariencia de anillo: Dorado', price: '¥160', text: 'Solo estética. No cambia tu fuerza', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: 'Apariencia de anillo: Sakura', price: '¥160', text: 'Solo estética. No cambia tu fuerza', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: 'Set de 3 apariencias', price: '¥360', text: 'Neón, Dorado y Sakura juntos (para quien no tenga ninguno)', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: 'Aura arcoíris', price: '¥240', text: 'Una luz arcoíris envuelve a tus héroes (solo estética)', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: 'Neón', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: 'Dorado', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: 'Sakura', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: 'Carmesí (Pack de héroe)', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: 'Cielo azul (Pack de Legión)', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: 'Leyenda (Pack legendario)', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: 'Vacío (exclusiva del pase)', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: 'Menos de 16 años', cap: 5000 }, u18: { name: '16 a 17 años', cap: 10000 }, adult: { name: '18 años o más', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: 'Monedas (equivalentes a 60 enemigos)', limit: 10 },
  { id: 'ad_flux', name: 'Tiempo x2 +30 min', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'Barra de BURST llena', limit: 6, need: 'burst' },
  { id: 'ad_black', name: 'Mena negra +1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: 'Diciembre de 2026', title: 'Lanzamiento', items: ['12 héroes y 4 anillos', 'Renacimiento, Revolución, Trascendencia, Infinito y Eternidad', 'Incursión semanal y Pase de Legión', 'Música original'] },
];
export const NEXT_CHAPTER = 'Cada mes añadiremos poco a poco nuevos héroes, mundos y reglas de Incursión.';
