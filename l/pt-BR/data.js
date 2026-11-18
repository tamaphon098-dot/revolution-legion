// Static game data for REVOLUTION LEGION v2.
// Palette: ENDESGA 32 (every asset and UI colour comes from this list).
export const PAL = {
  ink: '#181425', night: '#262b44', slate: '#3a4466', steel: '#5a6988', mist: '#8b9bb4', cloud: '#c0cbdc', white: '#ffffff',
  red: '#e43b44', blood: '#a22633', orange: '#f77622', gold: '#feae34', lemon: '#fee761', leaf: '#63c74d', forest: '#3e8948',
  deep: '#265c42', sea: '#124e89', sky: '#0099db', cyan: '#2ce8f5', plum: '#68386c', rose: '#b55088', pink: '#f6757a',
  sand: '#ead4aa', tan: '#e4a672', brown: '#b86f50', bark: '#733e39', coffee: '#3e2731', rust: '#be4a2f', clay: '#d77643',
};

export const RINGS = [
  { id: 'red', name: 'Anel Vermelho', hero: 'leon', col: PAL.red, hi: PAL.pink, lo: PAL.blood, baseLap: 6, basePow: 4, costL: 1.0, icon: 'icon_sword' },
  { id: 'blue', name: 'Anel Azul', hero: 'seris', col: PAL.sky, hi: PAL.cyan, lo: PAL.sea, baseLap: 9, basePow: 30, costL: 4.0, icon: 'icon_magic' },
  { id: 'gold', name: 'Anel Dourado', hero: 'elia', col: PAL.gold, hi: PAL.lemon, lo: PAL.orange, baseLap: 12, basePow: 200, costL: 9.0, icon: 'icon_speed' },
  { id: 'purple', name: 'Anel Roxo', hero: 'nox', col: PAL.rose, hi: PAL.pink, lo: PAL.plum, baseLap: 18, basePow: 3000, costL: 16.0, icon: 'icon_summon' },
];

export const HEROES = {
  leon: { name: 'Leon', job: 'Espadachim', ring: 0, sprite: 'hero_leon', portrait: 'por_leon', type: 's', line: 'Um corte a cada volta. A lâmina só fica mais rápida.' },
  seris: { name: 'Seris', job: 'Bruxa', ring: 1, sprite: 'hero_seris', portrait: 'por_seris', type: 'm', line: 'Magia de gelo. Dano 2x no ponto fraco.' },
  elia: { name: 'Elia', job: 'Santa', ring: 2, sprite: 'hero_elia', portrait: 'por_elia', type: 'h', line: 'Acelera todos os anéis com orações.' },
  nox: { name: 'Nox', job: 'Invocador', ring: 3, sprite: 'hero_nox', portrait: 'por_nox', type: 'n', line: 'Invoca um dragão espiritual. Lento, mas golpe pesado.' },
  mina: { name: 'Mina', job: 'Espadas Gêmeas', ring: 0, sprite: 'hero_mina', portrait: 'por_mina', type: 's', line: 'Nós de ativação 2x. Golpes leves (×0.6).' },
  garou: { name: 'Garou', job: 'Berserker', ring: 0, sprite: 'hero_garou', portrait: 'por_garou', type: 's', line: 'Fica mais forte ao acertar o mesmo inimigo (máx. ×6).' },
  volt: { name: 'Volt', job: 'Mago do Trovão', ring: 1, sprite: 'hero_volt', portrait: 'por_volt', type: 'm', line: 'Raio extra a cada combo de sincronia. Margem de sincronia +50%.' },
  luna: { name: 'Luna', job: 'Leitora de Estrelas', ring: 1, sprite: 'hero_luna', portrait: 'por_luna', type: 'm', line: '30% de crítico ×8. Crescimento do anel azul +10%.' },
  brom: { name: 'Brom', job: 'Ferreiro', ring: 2, sprite: 'hero_brom', portrait: 'por_brom', type: 'h', line: 'Ouro ×100, minério 2x. Ruim de briga.' },
  tia: { name: 'Tia', job: 'Bardo', ring: 2, sprite: 'hero_tia', portrait: 'por_tia', type: 'h', line: 'Margem de sincronia ×2, multiplicador de combo ×2.' },
  zeno: { name: 'Zeno', job: 'Necromante', ring: 3, sprite: 'hero_zeno', portrait: 'por_zeno', type: 'n', line: 'Fica mais forte a cada inimigo derrotado na fase.' },
  sierra: { name: 'Sierra', job: 'Mago do Tempo', ring: 3, sprite: 'hero_sierra', portrait: 'por_sierra', type: 'n', line: 'Gira um anel sozinho a cada volta. Toda velocidade +10%.' },
};
export const LEGION = [['leon', 'mina', 'garou'], ['seris', 'volt', 'luna'], ['elia', 'brom', 'tia'], ['nox', 'zeno', 'sierra']];
export const RECRUIT = {
  mina: { text: 'Chegue à Fase 120', cond: (s) => s.stats.bestStage >= 120 },
  tia: { text: 'Sincronize 3+ cores 100 vezes', cond: (s) => s.stats.combo3 + s.stats.combo4 >= 100 },
  volt: { text: 'Faça a Revolução', cond: (s) => s.stats.revolutions >= 1 },
  brom: { text: 'Colete 100 minérios no total', cond: (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0) >= 100 },
  zeno: { text: 'Derrote 500 chefes', cond: (s) => s.stats.bossKills >= 500 },
  luna: { text: '3 Insígnias do Reide Semanal', cond: (s) => ((s.raid || {}).tokensTotal || 0) >= 3 },
  garou: { text: 'Ouro ou melhor em 3 semanas de Reide', cond: (s) => ((s.raid || {}).goldWeeks || 0) >= 3 },
  sierra: { text: 'Participe de 6 semanas de Reide ou faça a Eternidade', cond: (s) => ((s.raid || {}).weeks || 0) >= 6 || ((s.eter || {}).count || 0) >= 1 },
};

// ---- weekly raid: 60-second score attack with a rotating rule ----
export const RAID_RULES = [
  { id: 'r_red', name: 'Festival Vermelho', text: 'Dano do anel vermelho ×3, outros ×0.3' },
  { id: 'r_sync', name: 'Festival da Ressonância', text: 'Combo de sincronia ×10, ataque normal ×0.1' },
  { id: 'r_perf', name: 'Desafio da Leitura', text: 'Dano de PERFECT ×5' },
  { id: 'r_slow', name: 'Dia da Gravidade', text: 'Velocidade dos anéis ×0.5, dano ×4' },
  { id: 'r_crit', name: 'Festival Crítico', text: 'Chance de crítico +30%' },
  { id: 'r_purple', name: 'Festival da Invocação', text: 'Dano do anel roxo ×5' },
];

// ---- tactic cards (replace tarot): collect, level up by duplicates, equip a deck ----
export const CARDS = [
  { id: 'c_rush', name: 'Ataque Rápido', text: 'Vel. de todos os anéis +5%/Lv' },
  { id: 'c_edge', name: 'Lâmina Afiada', text: 'Poder do anel vermelho ×100/Lv' },
  { id: 'c_frost', name: 'Círculo de Gelo', text: 'Poder do anel azul ×100/Lv' },
  { id: 'c_choir', name: 'Hino', text: 'Poder do anel dourado ×100/Lv' },
  { id: 'c_horde', name: 'Cem Demônios', text: 'Poder do anel roxo ×100/Lv' },
  { id: 'c_link', name: 'Trabalho em Equipe', text: 'Multiplicador de combo +50%/Lv' },
  { id: 'c_gold', name: 'Pilhagem', text: 'Ouro ×10/Lv' },
  { id: 'c_ore', name: 'Mineração', text: 'Aparição de minério +50%/Lv' },
  { id: 'c_crit', name: 'Ponto Fraco', text: 'Chance de crítico +5%/Lv' },
  { id: 'c_boss', name: 'Caçador de Gigantes', text: 'Dano em chefes ×100/Lv' },
  { id: 'c_perf', name: 'Leitura', text: 'Margem do PERFECT +20% · multiplicador +0.5/Lv' },
  { id: 'c_time', name: 'Engrenagem do Tempo', text: 'Ganho de Tempo 2x +20%/Lv' },
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
  IT('it_s1', 'Espada de Madeira', 's', 0), IT('it_s2', 'Espada de Ferro', 's', 0), IT('it_s3', 'Espada Flamejante', 's', 1), IT('it_s4', 'Espadas Gêmeas', 's', 1, 'node', 'Nós de ativação +1'),
  IT('it_s5', 'Lâmina Espaço-Tempo', 's', 2, 'extraLap', '15% de giro extra a cada volta'), IT('it_s6', 'Espadão Mata-Dragões', 's', 2, 'boss', '2x contra chefes'), IT('it_s7', 'Espada Sagrada', 's', 3), IT('it_s8', 'Espadão da Revolução', 's', 4, 'fullSync', 'Poder da sincronia perfeita ×20'),
  IT('it_m1', 'Cajado de Madeira', 'm', 0), IT('it_m2', 'Cajado de Cristal', 'm', 0), IT('it_m3', 'Cajado Glacial', 'm', 1, 'freeze', 'Congela ao acertar (dano recebido ×1.5)'), IT('it_m4', 'Cajado do Trovão', 'm', 1),
  IT('it_m5', 'Cajado da Ressonância', 'm', 2, 'syncWin', 'Margem de sincronia ×2.5'), IT('it_m6', 'Cajado Estelar', 'm', 2), IT('it_m7', 'Cajado Lunar', 'm', 3, 'node', 'Nós de ativação +1'), IT('it_m8', 'Cajado do Sábio', 'm', 4),
  IT('it_h1', 'Sino da Oração', 'h', 0), IT('it_h2', 'Anel Sagrado', 'h', 0), IT('it_h3', 'Pena de Anjo', 'h', 1), IT('it_h4', 'Cálice Curativo', 'h', 1),
  IT('it_h5', 'Rosário Solar', 'h', 2, 'haste', 'Vel. de todos os anéis +20%'), IT('it_h6', 'Escudo da Luz Sagrada', 'h', 2), IT('it_h7', 'Coroa da Deusa', 'h', 3, 'haste', 'Vel. de todos os anéis +20%'), IT('it_h8', 'Livro da Bênção', 'h', 4),
  IT('it_n1', 'Grimório Negro', 'n', 0), IT('it_n2', 'Ovo de Dragão', 'n', 0), IT('it_n3', 'Frasco de Espírito', 'n', 1), IT('it_n4', 'Chave da Invocação', 'n', 1),
  IT('it_n5', 'Orbe do Olho Mágico', 'n', 2, 'crit', '25% de crítico ×4'), IT('it_n6', 'Flauta de Osso de Dragão', 'n', 2), IT('it_n7', 'Anel do Pacto', 'n', 3), IT('it_n8', 'Foice do Submundo', 'n', 4, 'crit', '25% de crítico ×4'),
];

export const ENEMIES = [
  // world 1: meadow
  [{ s: 'enemy_slime', n: 'Slime', weak: 1 }, { s: 'en_w1_mush', n: 'Cogu-raiva', weak: 0 }, { s: 'en_w1_wolf', n: 'Lobo da Campina', weak: 1 }, { s: 'enemy_skeleton', n: 'Cavaleiro Morto-Vivo', weak: 0 }, { s: 'enemy_imp', n: 'Diabrete', weak: 1 }],
  // world 2: ice canyon
  [{ s: 'en_w2_wolf', n: 'Lobo Presa de Gelo', weak: 0 }, { s: 'en_w2_wraith', n: 'Espectro Gélido', weak: 0 }, { s: 'en_w2_yeti', n: 'Yeti Fofinho', weak: 1 }, { s: 'en_w2_bat', n: 'Morcego de Cristal', weak: 0 }],
  // world 3: clockwork city
  [{ s: 'en_w3_gear', n: 'Soldado Engrenagem', weak: 1 }, { s: 'en_w3_owl', n: 'Coruja Relógio', weak: 0 }, { s: 'en_w3_mage', n: 'Mago da Ampulheta', weak: 0 }, { s: 'enemy_golem', n: 'Golem de Latão', weak: 1 }],
  // world 4: void
  [{ s: 'en_w4_eye', n: 'Olho Vazio', weak: 1 }, { s: 'en_w4_jelly', n: 'Água-viva Estelar', weak: 0 }, { s: 'en_w4_knight', n: 'Cavaleiro Sombrio', weak: 1 }, { s: 'enemy_imp', n: 'Diabrete do Vazio', weak: 0 }],
  // endless corridor
  [{ s: 'en_w2_wraith', n: 'Fantasma do Corredor', weak: 0 }, { s: 'en_w3_mage', n: 'Mago Infinito', weak: 1 }, { s: 'en_w4_knight', n: 'Guardião do Corredor', weak: 0 }, { s: 'en_w1_wolf', n: 'Lobo Perdido', weak: 1 }, { s: 'en_w4_jelly', n: 'Água-viva Espaço-Tempo', weak: 0 }],
];
export const BOSSES = [
  [{ s: 'enemy_golem', n: 'Gardom, Rei das Rochas', scale: 1.6 }, { s: 'boss_dragon', n: 'Valgrace, Dragão do Abismo', scale: 1 }],
  [{ s: 'bo_w2', n: 'Neve, Imperatriz de Cristal', scale: 1 }, { s: 'en_w2_yeti', n: 'Giga Yeti, Fera da Nevasca', scale: 2 }],
  [{ s: 'bo_w3', n: 'Cronos, Titã do Relógio', scale: 1 }, { s: 'en_w3_gear', n: 'General Engrenagem', scale: 2 }],
  [{ s: 'boss_dragon', n: 'Dragão do Vazio', scale: 1 }, { s: 'en_w4_knight', n: 'Rei das Sombras', scale: 1.8 }],
  [{ s: 'bo_w2', n: 'Imperatriz do Corredor', scale: 1 }, { s: 'bo_w3', n: 'Titã do Corredor', scale: 1 }, { s: 'boss_dragon', n: 'Dragão do Corredor', scale: 1 }, { s: 'bo_w4', n: 'Sombra do Rei do Vazio', scale: 1 }],
];
export const VOID_KING = { s: 'bo_w4', n: 'Nebulus, Rei do Vazio', scale: 1, king: true };

// Boss traits (stage 50+): you must build around them.
export const TRAITS = {
  phys: { name: 'Resist. Física', tip: 'Dano do anel vermelho 1/100', col: PAL.red },
  magic: { name: 'Resist. Mágica', tip: 'Dano do anel azul 1/100', col: PAL.sky },
  barrier: { name: 'Barreira', tip: 'Quase imune, exceto combos de sincronia', col: PAL.lemon },
  regen: { name: 'Regeneração', tip: 'Recupera 2% de HP por segundo', col: PAL.leaf },
  rush: { name: 'Ataque Surpresa', tip: 'Limite de tempo: 15 s', col: PAL.orange },
};
export const TRAIT_ORDER = ['phys', 'barrier', 'magic', 'regen', 'rush'];

// Challenges: restricted runs with permanent rewards (unlocked after the first rebirth).
export const CHALLENGES = [
  { id: 'solo', name: 'Desafio do Golpe Único', rule: 'Lute só com o anel vermelho', goal: 60, reward: 'Nós de ativação do anel vermelho +1' },
  { id: 'nospeed', name: 'Desafio da Quietude', rule: 'Sem melhorar velocidade', goal: 60, reward: 'Vel. de todos os anéis +15%' },
  { id: 'noasc', name: 'Desafio da Obstinação', rule: 'Sem Ascensão', goal: 70, reward: 'Poder mantido na Ascensão 50%→65%' },
  { id: 'sync', name: 'Desafio da Ressonância', rule: 'Dano fora de combo de sincronia 1/100', goal: 70, reward: 'Multiplicador de combo ×2' },
  { id: 'nopm', name: 'Desafio da Origem', rule: 'Multiplicador de Renascimento anulado', goal: 90, reward: 'Crescimento do mult. de Renascimento ×1.2' },
  { id: 'rush', name: 'Desafio do Instante', rule: 'Limite de tempo do chefe: 10 s', goal: 100, reward: 'Duração do BURST +5 s' },
];

// Achievements: each one = permanent damage ×1.05. Secret ones show as ？？？ until done.
const A = (id, name, desc, cond, secret = false) => ({ id, name, desc, cond, secret });
const lapsTotal = (s) => s.stats.laps.reduce((a, b) => a + b, 0);
const ascTotal = (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0);
export const ACHIEVEMENTS = [
  A('a_lap1', 'Primeira Volta', 'Gire os anéis 100 voltas no total', (s) => lapsTotal(s) >= 100),
  A('a_lap2', 'Mestre do Giro', 'Gire os anéis 1.000 voltas no total', (s) => lapsTotal(s) >= 1000),
  A('a_lap3', 'Moto-Perpétuo', 'Gire os anéis 10.000 voltas no total', (s) => lapsTotal(s) >= 10000),
  A('a_lap4', 'O Mundo Gira', 'Gire os anéis 100.000 voltas no total', (s) => lapsTotal(s) >= 100000),
  A('a_u1', 'Poder de 10 Mil', 'Ataque chega a 10 mil', (s) => s.units >= 1),
  A('a_u2', 'Poder de 100 Milhões', 'Ataque chega a 100 milhões', (s) => s.units >= 2),
  A('a_u3', 'Poder de 1 Trilhão', 'Ataque chega a 1 trilhão', (s) => s.units >= 3),
  A('a_u4', 'Poder de 1e16', 'Ataque chega a 1e16', (s) => s.units >= 4),
  A('a_u8', 'Além do Abismo', 'Ataque chega a 1e32', (s) => s.units >= 8),
  A('a_u12', 'Rumo ao Extremo', 'Ataque chega a 1e48', (s) => s.units >= 12),
  A('a_u17', 'Incontável', 'Ataque chega a 1e68', (s) => s.units >= 17),
  A('a_as1', 'Primeira Quebra de Limite', '1 Ascensão', (s) => ascTotal(s) >= 1),
  A('a_as2', 'Rompedor Frequente', '20 Ascensões no total', (s) => ascTotal(s) >= 20),
  A('a_as3', 'Sem Limites', '100 Ascensões no total', (s) => ascTotal(s) >= 100),
  A('a_rb1', 'Renascido', '1 Renascimento', (s) => s.stats.rebirths >= 1),
  A('a_rb2', 'Samsara', '10 Renascimentos', (s) => s.stats.rebirths >= 10),
  A('a_rb3', 'Fim do Samsara', '100 Renascimentos', (s) => s.stats.rebirths >= 100),
  A('a_c2', 'Órbitas Sobrepostas', '10 combos de sincronia', (s) => s.stats.combos >= 10),
  A('a_c3', 'Trio', 'Sincronia de 3 cores 50 vezes', (s) => s.stats.combo3 + s.stats.combo4 >= 50),
  A('a_c4', 'Sincronia Perfeita', 'Sincronia de 4 cores 100 vezes', (s) => s.stats.combo4 >= 100),
  A('a_b1', 'Caçador de Chefes', 'Derrote 10 chefes', (s) => s.stats.bossKills >= 10),
  A('a_b2', 'Matador de Chefes', 'Derrote 100 chefes', (s) => s.stats.bossKills >= 100),
  A('a_b3', 'Caçador Lendário', 'Derrote 1.000 chefes', (s) => s.stats.bossKills >= 1000),
  A('a_tr', 'Mestre das Mecânicas', 'Derrote 5 chefes com traços', (s) => (s.stats.traitKills || 0) >= 5),
  A('a_d1', 'Colecionador', '8 itens', (s) => s.found.length >= 8),
  A('a_d2', 'Olho Clínico', '16 itens', (s) => s.found.length >= 16),
  A('a_d3', 'Grande Colecionador', '24 itens', (s) => s.found.length >= 24),
  A('a_d4', 'Códex Completo', 'Todos os 32 itens', (s) => s.found.length >= 32),
  A('a_ur', 'Brilho Arco-Íris', 'Obtenha um item UR', (s) => s.found.some((id) => /_[smhn]8$/.test(id))),
  A('a_ch1', 'Entrada dos Desafios', 'Conclua 1 desafio', (s) => (s.chDone || []).length >= 1),
  A('a_ch3', 'Buscador de Desafios', 'Conclua 3 desafios', (s) => (s.chDone || []).length >= 3),
  A('a_ch6', 'Todos os Desafios', 'Conclua todos os 6 desafios', (s) => (s.chDone || []).length >= 6),
  A('a_mu', 'Mutação', 'Cause uma mutação em um anel', (s) => s.stats.mutations >= 1),
  A('a_rv', 'Revolucionário', '1 Revolução', (s) => s.stats.revolutions >= 1),
  A('a_w2', 'Viajante do Gelo', 'Fase 100 no Desfiladeiro de Cristal', (s) => (s.worldBest[1] || 0) >= 100),
  A('a_w3', 'Viajante do Tempo', 'Fase 100 na Cidade Mecânica', (s) => (s.worldBest[2] || 0) >= 100),
  A('a_ts', 'Transcendente', 'Transcenda', (s) => s.stats.transcends >= 1),
  A('a_end', '∞', 'Derrote o Rei do Vazio', (s) => s.stats.cleared),
  // secrets
  A('s_harm', 'Harmonia', 'Ajuste a razão de velocidade dos 4 anéis para 1:2:4:8', (s, g) => !!(g && g.active().length === 4 && g.isHarmony()), true),
  A('s_fast', 'Relâmpago', 'Derrote um chefe com 25 s ou mais sobrando', (s) => !!s.stats.fastBoss, true),
  A('s_lazy', 'Observador', 'Chegue à Fase 15 após renascer, sem nenhuma melhoria', (s) => !!s.stats.lazy, true),
  A('s_od', 'Descontrole', 'Derrote um chefe durante o Overdrive', (s) => !!s.stats.odBoss, true),
];

// Worlds = "laws". Unlocked by revolution / transcendence.
export const WORLDS = [
  { id: 'w1', name: 'Campina Inicial', bg: 'bgw_1', law: 'Mundo Comum', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false },
  { id: 'w2', name: 'Desfiladeiro de Cristal', bg: 'bgw_2', law: 'Anel azul ×5 / anel vermelho ×0.5', dmg: [0.5, 5, 1, 1], lapGain: 1, chaos: false, drop: 1 },
  { id: 'w3', name: 'Cidade Mecânica', bg: 'bgw_3', law: 'Velocidade de giro varia / crescimento do mult. de voltas ×1.3', dmg: [1, 1, 1, 1], lapGain: 1.3, chaos: true, drop: 2 },
  { id: 'w4', name: 'Cosmos do Vazio', bg: 'bgw_4', law: 'Mundo final. Rei do Vazio na Fase 300', dmg: [1, 1, 1, 1], lapGain: 1, chaos: false, drop: 3, final: 300 },
  { id: 'w5', name: 'Corredor Infinito', bg: 'bg_temple', law: 'Um corredor sem fim. Quanto mais longe, mais Pontos de Infinito', dmg: [1, 1, 1, 1], lapGain: 1.2, chaos: false, drop: 4, endless: true },
];

export const COMBOS = { 2: { name: 'Espada Mágica', mult: 3 }, 3: { name: 'Círculo Sagrado', mult: 10 }, 4: { name: 'Cortes da Revolução', mult: 50 } };

export const MUTATIONS = [
  { id: 'double', name: 'Giro Duplo', text: '1 volta rende o multiplicador de 2 voltas' },
  { id: 'reverse', name: 'Giro Inverso', text: 'Crescimento do mult. ×1.6 · velocidade ×0.8' },
  { id: 'split', name: 'Divisão', text: 'Nós de ativação +2' },
  { id: 'crit', name: 'Especialista em Crítico', text: '30% de crítico ×5' },
];

// Permanent tree bought with 転生コア. Automation lives here (Revolution Idle style relief rewards).
export const PERM = [
  { id: 'spd', name: 'Giro Múltiplo', text: 'Vel. de todos os anéis +10%', max: 10, cost: (l) => 2 + l * 2 },
  { id: 'gold', name: 'Fluxo Dourado', text: 'Ouro ganho ×4', max: 20, cost: (l) => 1 + l * 2 },
  { id: 'gain', name: 'Segredo do Giro', text: 'Crescimento do mult. de voltas +10%', max: 10, cost: (l) => 5 + l * 5 },
  { id: 'node', name: 'Nós Múltiplos', text: 'Nós de ativação de todos os anéis +1', max: 2, cost: (l) => 10 + l * 25 },
  { id: 'autoAsc', name: 'Auto-Ascensão', text: 'Ascensão automática no Lv máximo', max: 1, cost: () => 8 },
  { id: 'start', name: 'Espaço-Tempo Acelerado', text: 'Começa +10 fases após renascer', max: 10, cost: (l) => 6 + l * 4 },
  { id: 'offline', name: 'Giro dos Sonhos', text: 'Eficiência offline +20%', max: 3, cost: (l) => 4 + l * 6 },
  { id: 'autoRb', name: 'Auto-Renascimento', text: 'Renasce quando o multiplicador atinge o valor definido', max: 1, cost: () => 25 },
];

// Missions: sequential. Each completion = permanent damage ×(1+count). Rewards unlock systems.
const M = (id, name, cond, reward) => ({ id, name, cond, reward });
export const MISSIONS = [
  M('M01', 'Gire o anel vermelho 15 voltas', (s) => [s.stats.laps[0], 15], { text: 'Ouro +100', gold: 2 }),
  M('M02', 'Leve o anel vermelho ao Lv 10', (s) => [s.rings[0].lv, 10], { text: 'Desbloqueia melhoria de velocidade', feature: 'speed' }),
  M('M03', 'Derrote o chefe da Fase 10', (s) => [s.stats.bestStage - 1, 10], { text: 'Desbloqueia drops de itens e o Códex', feature: 'items' }),
  M('M06', 'Chegue à Fase 20', (s) => [s.stats.bestStage, 20], { text: 'Novo aliado: a bruxa Seris + anel azul', ring: 1 }),
  M('M07', 'Faça 3 combos de sincronia', (s) => [s.stats.combos, 3], { text: 'Desbloqueia o Laboratório de Anéis (ajuste de razão de velocidade)', feature: 'lab' }),
  M('M05', 'Leve o anel vermelho ao Lv 30 e faça a Ascensão', (s) => [s.stats.asc[0], 1], { text: 'Promoção de Leon (ataque ×1.5) · tela da Legião', feature: 'heroes' }),
  M('M41', 'Chegue à Fase 40', (s) => [s.stats.bestStage, 40], { text: 'Auto-upgrade (compra Lv+ sozinho)', feature: 'autoBuy' }),
  M('M09', 'Chegue à Fase 60', (s) => [s.stats.bestStage, 60], { text: 'Desbloqueia o Renascimento', feature: 'rebirth' }),
  M('M10', 'Renasça', (s) => [s.stats.rebirths, 1], { text: 'Desbloqueia árvore permanente, Desafios e Reide Semanal', feature: 'perm', feature2: 'raid' }),
  M('M08', 'Encontre 3 tipos de item', (s) => [s.found.length, 3], { text: 'Desbloqueia o bônus do Códex', feature: 'dexBonus' }),
  M('M11', 'Faça 3 Ascensões do anel vermelho (total)', (s) => [s.stats.ascTotal[0], 3], { text: 'Nó do anel vermelho +1', node: 0 }),
  M('M12', 'Fase 100 em uma única run', (s) => [s.runBest, 100], { text: 'A santa Elia + anel dourado', ring: 2 }),
  M('M13', 'Sincronia de 3 cores 30 vezes', (s) => [s.stats.combo3, 30], { text: 'Desbloqueia o BURST', feature: 'burst' }),
  M('M14', 'Encontre 12 tipos de item', (s) => [s.found.length, 12], { text: 'Os slots de equipamento brilham (mais drops)', feature: 'luck' }),
  M('M15', 'Renasça 5 vezes', (s) => [s.stats.rebirths, 5], { text: 'Nó do anel azul +1', node: 1 }),
  M('M16', 'Chegue à Fase 150', (s) => [s.runBest, 150], { text: 'Desbloqueia o Auto-Ajuste', feature: 'autotune' }),
  M('M17', 'Fase 250 em uma única run', (s) => [s.runBest, 250], { text: 'O invocador Nox + anel roxo', ring: 3 }),
  M('M18', 'Sincronia de 4 cores 50 vezes', (s) => [s.stats.combo4, 50], { text: 'Nó do anel roxo +1', node: 3 }),
  M('M19', 'Herói SSR (10 Ascensões no total)', (s) => [Math.max(...s.stats.ascTotal), 10], { text: 'Chefes sempre dropam item raro ou melhor' }),
  M('M20', 'Encontre 20 tipos de item', (s) => [s.found.length, 20], { text: 'Bônus do Códex melhorado' }),
  M('M21', 'Fase 300 em uma única run', (s) => [s.runBest, 300], { text: 'Desbloqueia a Revolução (Renascimento superior)', feature: 'revolution' }),
  M('M22', 'Faça a Revolução', (s) => [s.stats.revolutions, 1], { text: 'Mutação de anel · mundo "Desfiladeiro de Cristal"', feature: 'mutation', world: 1 }),
  M('M23', 'Cause 3 mutações de anel', (s) => [s.stats.mutations, 3], { text: 'Nó do anel dourado +1', node: 2 }),
  M('M24', 'Fase 200 no Desfiladeiro de Cristal', (s) => [s.worldBest[1] || 0, 200], { text: 'Mundo "Cidade Mecânica"', world: 2 }),
  M('M25', 'Faça 3 Revoluções', (s) => [s.stats.revolutions, 3], { text: 'Desbloqueia a Transcendência', feature: 'transcend' }),
  M('M26', 'Encontre 28 tipos de item', (s) => [s.found.length, 28], { text: 'Bônus do Códex melhorado' }),
  M('M27', 'Transcenda', (s) => [s.stats.transcends, 1], { text: 'Mundo final "Cosmos do Vazio"', world: 3 }),
  M('M28', 'Derrote o Rei do Vazio', (s) => [s.stats.cleared ? 1 : 0, 1], { text: 'Desbloqueia o Infinito', feature: 'infinity' }),
  M('M29', 'Alcance o Infinito', (s) => [s.inf ? s.inf.count : 0, 1], { text: 'Limite do Tempo 2x ×2', feature: 'fluxPlus' }),
  M('M30', 'Alcance o Infinito 3 vezes', (s) => [s.inf ? s.inf.count : 0, 3], { text: 'O caminho para o Desafio do Infinito se revelou' }),
  M('M31', 'Quebre o Infinito', (s) => [s.inf && s.inf.broken ? 1 : 0, 1], { text: 'O Corredor Infinito se abre', world: 4 }),
  M('M32', 'Fase 100 no Corredor Infinito', (s) => [s.worldBest[4] || 0, 100], { text: 'Pontos de Infinito +5', ip: 5 }),
  M('M33', 'Conclua 3 Desafios do Infinito', (s) => [(s.infChDone || []).length, 3], { text: 'Pontos de Infinito ganhos ×2', feature: 'ipDouble' }),
  M('M34', 'Fase 300 no Corredor Infinito', (s) => [s.worldBest[4] || 0, 300], { text: 'Desbloqueia a Eternidade', feature: 'eternity' }),
  M('M35', 'Alcance a Eternidade', (s) => [s.eter ? s.eter.count : 0, 1], { text: 'Desbloqueia melhorias da Eternidade' }),
  M('M36', 'Obtenha 10 cristais na Dilatação do Tempo', (s) => [s.tp || 0, 10], { text: 'As melhorias da Dilatação brilham' }),
  M('M37', 'Equipe 3 Cartas de Tática', (s) => [(s.deck || []).length, 3], { text: 'Slots de Carta de Tática +1', cslot: 1 }),
  M('M38', 'Tenha 8 heróis na Legião', (s) => [(s.recruits || []).length, 8], { text: 'Minério Negro +10', black: 10 }),
  M('M39', 'Alcance a Eternidade 5 vezes', (s) => [s.eter ? s.eter.count : 0, 5], { text: 'Pontos de Eternidade ×2', feature: 'epDouble' }),
  M('M40', 'Fase 1000 no Corredor Infinito', (s) => [s.worldBest[4] || 0, 1000], { text: 'O verdadeiro final' }),
];

export const FEATURE_INFO = {
  speed: ['Melhoria de Velocidade', 'Quanto mais rápido gira, mais ataques e crescimento do multiplicador.'],
  items: ['Itens e Códex', 'Inimigos às vezes dropam equipamentos. Completar o Códex fortalece todos.'],
  heroes: ['Promoção de Heróis', 'A cada Ascensão o herói evolui, mudando de visual e ataque.'],
  lab: ['Laboratório de Anéis', 'Com razões inteiras de velocidade, como 1:2 ou 1:2:4, os anéis sincronizam e geram combos.'],
  dexBonus: ['Bônus do Códex', 'Todo o dano aumenta conforme os tipos de item encontrados.'],
  rebirth: ['Renascimento', 'Renasça quando o multiplicador crescer bastante. O momento é você quem decide.'],
  perm: ['Árvore Permanente', 'Use Núcleos de Renascimento para desbloquear automações e bônus permanentes.'],
  burst: ['BURST', 'Com a barra cheia, os anéis ficam 5x mais rápidos por 10 s.'],
  autoBuy: ['Auto-upgrade', 'Agora Lv e velocidade são comprados sozinhos (ON/OFF no botão à direita).'],
  luck: ['Sorte', 'A taxa de drop aumentou.'],
  autotune: ['Auto-Ajuste', 'Mantém sozinho a melhor razão de velocidade.'],
  revolution: ['Revolução', 'Um Renascimento superior: abre mão do multiplicador de Renascimento e da árvore permanente em troca de Memórias da Revolução.'],
  mutation: ['Mutação de Anel', 'Na Ascensão, um anel pode sofrer uma mutação repentina.'],
  transcend: ['Transcendência', 'O Renascimento supremo, que supera até a Revolução.'],
  infinity: ['Infinito', 'Você alcançou ∞. Converta tudo em Pontos de Infinito e vá além.'],
  eternity: ['Eternidade', 'Uma camada além do Infinito. Faça a Eternidade na aba Cosmos.'],
  minerals: ['Minério e Forja', 'Inimigos agora dropam minério. Refine itens na aba Cosmos.'],
  promotion: ['Promoção', 'Sacrifique o multiplicador de Renascimento para fortalecer os anéis para sempre.'],
  fluxPlus: ['Tempo 2x', 'O Tempo 2x armazenável dobrou.'],
  ipDouble: ['Fonte do Infinito', 'O ganho de Pontos de Infinito dobrou.'],
};

// ===== Infinity layer (after the Void King): IP upgrades, Break Infinity, infinity challenges =====
export const IP_UP = [
  { id: 'spd', name: 'Aceleração Infinita', text: 'Vel. de todos os anéis ×3', cost: 1 },
  { id: 'pow', name: 'Poder Infinito', text: 'Todo dano ×1e30', cost: 1 },
  { id: 'core', name: 'Núcleo Infinito', text: 'Núcleos de Renascimento ×3', cost: 1 },
  { id: 'mem', name: 'Herança de Memória', text: 'Comece com 6 Memórias da Revolução (transcenda de imediato)', cost: 2 },
  { id: 'autoRev', name: 'Auto-Revolução', text: 'Faz a Revolução sozinho ao cumprir as condições', cost: 2 },
  { id: 'autoTr', name: 'Auto-Transcendência', text: 'Transcende sozinho ao cumprir as condições', cost: 2 },
  { id: 'ich', name: 'Desafio do Infinito', text: 'Desbloqueia o Desafio do Infinito', cost: 3 },
  { id: 'gain', name: 'Giro da Eternidade', text: 'Crescimento do mult. de voltas ×1.5', cost: 3 },
  { id: 'break', name: 'Quebra de Limite', text: 'Ultrapasse ∞ · Corredor Infinito', cost: 6 },
  { id: 'multi', name: 'Multiverso', text: 'Pontos de Infinito ganhos ×2', cost: 8 },
];

// Infinity challenges: run a whole infinity under a rule. Clear = defeat the Void King while it is active.
export const INF_CH = [
  { id: 'i_norb', name: 'Traço Único', rule: 'Sem Renascimento', reward: 'Crescimento do mult. de Renascimento ×1.5' },
  { id: 'i_noitem', name: 'Herói de Mãos Nuas', rule: 'Sem efeito de itens', reward: 'Multiplicador de itens ×2' },
  { id: 'i_norank', name: 'Sem Nome', rule: 'Sem multiplicador de rank de herói', reward: 'Multiplicador de rank ×2' },
];

ACHIEVEMENTS.push(
  A('i_1', 'Rumo ao Infinito', '1 Infinito', (s) => (s.inf && s.inf.count >= 1)),
  A('i_5', 'Frequentador do Infinito', '5 Infinitos', (s) => (s.inf && s.inf.count >= 5)),
  A('i_20', 'Habitante do Infinito', '20 Infinitos', (s) => (s.inf && s.inf.count >= 20)),
  A('i_br', 'Quebra de Limite', 'Além do ∞', (s) => !!(s.inf && s.inf.broken)),
  A('i_ip', 'Fonte do Infinito', 'Ganhe 30 Pontos de Infinito no total', (s) => (s.ipTotal || 0) >= 30),
  A('i_e1', 'Viajante do Corredor', 'Fase 50 no Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 50),
  A('i_e2', 'Conquistador do Corredor', 'Fase 300 no Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 300),
  A('i_e3', 'Caminho Sem Fim', 'Fase 1000 no Corredor Infinito', (s) => (s.worldBest[4] || 0) >= 1000),
  A('i_ch1', 'Desafio do Infinito', 'Conclua 1 Desafio do Infinito', (s) => (s.infChDone || []).length >= 1),
  A('i_ch3', 'Buscador do Infinito', 'Conclua todos os Desafios do Infinito', (s) => (s.infChDone || []).length >= 3),
  A('f_use', 'Senhor do Tempo', 'Use o Tempo 2x por 1 hora no total', (s) => (s.stats.fluxUsed || 0) >= 3600),
  A('d_7', 'Viagem de uma Semana', 'Login por 7 dias seguidos', (s) => (s.daily && s.daily.streak >= 7)),
  A('d_30', 'Viagem de um Mês', '30 dias de login no total', (s) => (s.daily && s.daily.total >= 30)),
  A('a_lap5', 'Deus do Giro', 'Gire os anéis 1.000.000 voltas no total', (s) => s.stats.laps.reduce((a, b) => a + b, 0) >= 1e6),
  A('a_as4', 'Deus da Quebra', '500 Ascensões no total', (s) => s.stats.ascTotal.reduce((a, b) => a + b, 0) >= 500),
  A('a_rb4', 'Renascimento Infinito', '1.000 Renascimentos', (s) => s.stats.rebirths >= 1000),
  A('a_rv3', 'Era da Revolução', '10 Revoluções', (s) => s.stats.revolutions >= 10),
  A('s_e1e', 'Fora de Escala', 'Ataque chega a 1e400', (s) => (s.bestDpsL || 0) >= 400, true),
);

// ===== Promotion: trade some prestige multiplier for permanent ring growth (reset by infinity) =====
export const PROMO = { unlockL: 3, costL: (lv) => 1 + lv * 0.5, gain: 0.15, pow: 0.3 };

// ===== Eternity: the layer above infinity =====
export const EP_UP = [
  { id: 'keepIp', name: 'Memória da Eternidade', text: 'As melhorias do Infinito permanecem após a Eternidade', cost: 1 },
  { id: 'autoInf', name: 'Auto-Infinito', text: 'Alcança o Infinito por regras de automação', cost: 1 },
  { id: 'epPow', name: 'Poder da Eternidade', text: 'Todo dano ×1e50', cost: 2 },
  { id: 'ipx', name: 'Nascente do Infinito', text: 'Pontos de Infinito ganhos ×3', cost: 2 },
  { id: 'cardSlot', name: 'Talento Tático', text: 'Slots de Carta de Tática +1', cost: 2 },
  { id: 'dil', name: 'Dilatação', text: 'Desbloqueia a Dilatação (o mundo invertido)', cost: 3 },
  { id: 'startCorr', name: 'Atalho do Corredor', text: 'Corredor Infinito a partir da Fase 101', cost: 4 },
  { id: 'lapx', name: 'Giro da Eternidade', text: 'Crescimento do mult. de voltas ×2', cost: 5 },
];

// ===== Dilation: all damage exponents are shrunk; reaching far yields crystals =====
export const DIL = { power: 0.75 };
export const DIL_UP = [
  { id: 'd_lap', name: 'Giro Distorcido', text: 'Crescimento do mult. de voltas +25%', cost: (lv) => 3 + lv * 3 },
  { id: 'd_soft', name: 'Alívio da Distorção', text: 'Expoente durante a Dilatação +0.02', cost: (lv) => 5 + lv * 5, max: 5 },
  { id: 'd_pow', name: 'Lâmina de Cristal', text: 'Todo dano ×1e20', cost: (lv) => 4 + lv * 4 },
];

// ===== Ores & smithing =====
export const ORES = [
  { id: 'cu', name: 'Minério de Cobre', col: PAL.clay },
  { id: 'ag', name: 'Minério de Prata', col: PAL.cloud },
  { id: 'au', name: 'Minério de Ouro', col: PAL.gold },
  { id: 'star', name: 'Minério Estelar', col: PAL.cyan },
  { id: 'black', name: 'Minério Negro', col: PAL.plum },
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
  { id: 't0', name: 'O Louco', text: 'Tempo 2x +30 min' },
  { id: 't1', name: 'O Mago', text: '10 min: todo dano ×1e5' },
  { id: 't2', name: 'A Sacerdotisa', text: '10 min: crescimento do mult. de voltas ×2' },
  { id: 't3', name: 'A Imperatriz', text: 'Uma enxurrada de ouro' },
  { id: 't4', name: 'O Imperador', text: '10 min: vel. de todos os anéis ×2' },
  { id: 't6', name: 'Os Enamorados', text: '10 min: margem de sincronia ×2' },
  { id: 't7', name: 'O Carro', text: 'Barra de BURST cheia' },
  { id: 't8', name: 'A Força', text: 'Permanente: todo dano ×1.1' },
  { id: 't9', name: 'O Eremita', text: 'Ganhe 1 item' },
  { id: 't10', name: 'A Roda da Fortuna', text: 'Mais uma carta' },
  { id: 't15', name: 'O Diabo', text: '66%: permanente todo dano ×1.5 / 34%: Minério Negro -3' },
  { id: 't17', name: 'A Estrela', text: 'Permanente: crescimento do mult. de voltas +2%' },
  { id: 't18', name: 'A Lua', text: '10 min: chance de crítico +20%' },
  { id: 't19', name: 'O Sol', text: '10 min: ouro ×1e10' },
  { id: 't21', name: 'O Mundo', text: 'Todos os anéis Lv+10 (até o limite)' },
];

// ===== Zodiac: equip up to N signs =====
export const ZODIAC = [
  { id: 'z1', name: 'Áries', text: 'Poder do anel vermelho ×1e8', need: 5 },
  { id: 'z2', name: 'Touro', text: 'Ouro ×1e5', need: 10 },
  { id: 'z3', name: 'Gêmeos', text: 'Nós de ativação de todos os anéis +1', need: 15 },
  { id: 'z4', name: 'Câncer', text: 'Eficiência offline +30%', need: 20 },
  { id: 'z5', name: 'Leão', text: 'Dano em chefes ×1e6', need: 25 },
  { id: 'z6', name: 'Virgem', text: 'Drops de itens e minério ×2', need: 30 },
  { id: 'z7', name: 'Libra', text: 'Margem de sincronia ×2', need: 35 },
  { id: 'z8', name: 'Escorpião', text: 'Chance de crítico +15%', need: 40 },
  { id: 'z9', name: 'Sagitário', text: 'Poder do anel azul ×1e8', need: 45 },
  { id: 'z10', name: 'Capricórnio', text: 'Crescimento do mult. de Renascimento ×1.1', need: 50 },
  { id: 'z11', name: 'Aquário', text: 'Crescimento do mult. de voltas +10%', need: 55 },
  { id: 'z12', name: 'Peixes', text: 'Ganho de Tempo 2x ×2', need: 60 },
];

// ===== More achievements (tiered) =====
const tier = (pre, label, unit, vals, get) => vals.forEach((v, k) => ACHIEVEMENTS.push(A(pre + k, label + (k + 1), unit.replace('#', v.toLocaleString()), (s) => get(s) >= v)));
tier('x_ore', 'Minerador', 'Colete # minérios no total', [10, 100, 1000, 10000], (s) => Object.values(s.ores || {}).reduce((a, b) => a + b, 0) + (s.stats.oreUsed || 0));
tier('x_ref', 'Ferreiro', 'Refine # vezes no total', [1, 10, 50, 200], (s) => s.stats.refines || 0);
tier('x_tar', 'Estrategista', 'Saque # Cartas de Tática', [1, 20, 100, 500], (s) => s.stats.cards || 0);
tier('x_pf', 'Leitura', 'Faça PERFECT # vezes no total', [10, 100, 1000, 10000], (s) => s.stats.perfects || 0);
tier('x_rd', 'Reider', 'Obtenha # Insígnias de Reide no total', [1, 5, 20, 50], (s) => (s.raid || {}).tokensTotal || 0);
tier('x_pro', 'Promovido', 'Promova # vezes no total', [1, 10, 50, 200], (s) => (s.promo || []).reduce((a, b) => a + b, 0) + (s.stats.promos || 0));
tier('x_et', 'Viajante da Eternidade', 'Alcance a Eternidade # vezes', [1, 5, 20], (s) => (s.eter && s.eter.count) || 0);
tier('x_tp', 'Colecionador de Dilatação', 'Obtenha # cristais de Dilatação no total', [10, 100, 1000], (s) => s.tpTotal || 0);
tier('x_spin', 'Girador', 'Gire os anéis # voltas à mão', [10, 100, 1000], (s) => s.stats.spun || 0);
tier('x_tap', 'Toque Frenético', 'Toque o campo de batalha # vezes', [100, 1000, 10000], (s) => s.stats.taps || 0);
tier('x_kill', 'Aniquilação', 'Derrote # inimigos', [1000, 100000, 10000000], (s) => s.stats.kills || 0);
ACHIEVEMENTS.push(
  A('x_tar_all', 'Mestre da Tática', 'Leve uma Carta de Tática ao Lv 10', (s) => Object.values(s.cards || {}).some((v) => v >= 10)),
  A('x_zod', 'Legião Formada', 'Reúna os 12 heróis', (s) => (s.recruits || []).length >= 12),
  A('s_devil', 'Feito Divino', 'Acerte 50 PERFECT seguidos', (s) => (s.stats.bestStreak || 0) >= 50, true),
  A('s_raid', 'Reider Lendário', 'Nota "Arco-íris" no Reide', (s) => ((s.raid || {}).rainbow || 0) >= 1, true),
);

// ===== Shop (cheaper than the genre leader; nothing here is required to finish the game) =====
export const SHOP = [
  // おすすめ
  { id: 'rl_month', name: 'Passe Mensal (30 dias)', price: '¥370', text: 'Na hora: 3 h de Tempo 2x. Por 30 dias, login diário dá 1 h de Tempo 2x e Moedas (200 inimigos)', cat: 'top' },
  { id: 'rl_grow_rb', name: 'Pacote Apoio ao Renascimento', price: '¥300', text: '30 Núcleos de Renascimento, 4 h de Tempo 2x e saco de Moedas (só por 72 h após desbloquear o Renascimento)', once: true, offer: true, cat: 'top' },
  { id: 'rl_grow_rev', name: 'Pacote Apoio à Revolução', price: '¥480', text: '100 Núcleos de Renascimento, 10 Minérios Negros e 8 h de Tempo 2x (só por 72 h após desbloquear a Revolução)', once: true, offer: true, cat: 'top' },
  { id: 'rl_starter', name: 'Pacote Inicial', price: '¥400', text: 'Saco de Moedas + 8 h de Tempo 2x (com materiais para a fase final)', once: true, cat: 'top' },
  { id: 'rl_remove_ads', name: 'Remover Anúncios', price: '¥980', text: 'Receba recompensas de anúncios na hora, sem ver anúncios', once: true, cat: 'top' },
  { id: 'rl_bundle_3k', name: 'Pacote de Heróis', price: '¥3,000', text: '7 dias de Tempo 2x, 120 Minérios Negros, skin exclusiva "Carmesim" (compra repetível. A partir da 2ª vez, sem skin nem aura)', need: 'rebirth', skin: 'guren', cat: 'top' },
  { id: 'rl_bundle_5k', name: 'Pacote da Legião', price: '¥5,000', text: '14 dias de Tempo 2x, 250 Minérios Negros, skin exclusiva "Céu Azul" e aura dourada (compra repetível. A partir da 2ª vez, sem skin nem aura)', need: 'rebirth', skin: 'soten', cat: 'top' },
  { id: 'rl_bundle_10k', name: 'Pacote Lendário', price: '¥10,000', text: '30 dias de Tempo 2x, 600 Minérios Negros, skin exclusiva "Lenda" e auras arco-íris e dourada (compra repetível. A partir da 2ª vez, sem skin nem aura)', need: 'rebirth', skin: 'legend', cat: 'top' },
  // パス
  { id: 'rl_pass', name: 'Passe da Legião Premium', price: '¥610', text: 'Recompensas Premium desta temporada (30 dias). Níveis já alcançados podem ser resgatados retroativamente', cat: 'pass' },
  // アイテム
  { id: 'rl_coin_s', name: 'Saco de Moedas', price: '¥120', text: 'Moedas de 300 inimigos da fase atual (zera no Renascimento)', cat: 'item' },
  { id: 'rl_coin_l', name: 'Cofre de Moedas', price: '¥480', text: 'Moedas de 2000 inimigos da fase atual (zera no Renascimento)', cat: 'item' },
  { id: 'rl_flux_s', name: 'Tempo 2x (P)', price: '¥120', text: '4 horas de jogo em velocidade 2x', need: 'autoBuy', cat: 'item' },
  { id: 'rl_flux_l', name: 'Tempo 2x (G)', price: '¥500', text: '24 horas de jogo em velocidade 2x', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_s', name: 'Minério Negro ×10', price: '¥160', text: '10 saques de Carta de Tática (taxa de drop: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_l', name: 'Minério Negro ×60', price: '¥800', text: '60 saques de Carta de Tática (taxa de drop: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_flux_xl', name: 'Tempo 2x (GG)', price: '¥980', text: '72 horas de jogo em velocidade 2x (só diminui enquanto você joga)', need: 'autoBuy', cat: 'item' },
  { id: 'rl_ore_m', name: 'Minério Negro ×130', price: '¥1,500', text: '130 saques de Carta de Tática (taxa de drop: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_ore_xl', name: 'Minério Negro ×200', price: '¥2,200', text: '200 saques de Carta de Tática (taxa de drop: igual para cada carta)', need: 'minerals', cat: 'item' },
  { id: 'rl_infinity', name: 'Pacote Infinito', price: '¥800', text: 'Pontos de Infinito +5', once: true, need: 'infinity', cat: 'item' },
  { id: 'rl_eternity', name: 'Pacote Eternidade', price: '¥800', text: 'Pontos de Eternidade +3', once: true, need: 'eternity', cat: 'item' },
  { id: 'rl_supporter', name: 'Pacote Apoiador', price: '¥2,000', text: '48 h de Tempo 2x e aura dourada nos heróis (com materiais para a fase final)', once: true, cat: 'item' },
  // 見た目（強さは変わらない）
  { id: 'rl_skin_neon', name: 'Skin de Anel: Neon', price: '¥160', text: 'Só visual. Não muda a força', once: true, skin: 'neon', cat: 'look' },
  { id: 'rl_skin_gold', name: 'Skin de Anel: Dourado', price: '¥160', text: 'Só visual. Não muda a força', once: true, skin: 'gold', cat: 'look' },
  { id: 'rl_skin_sakura', name: 'Skin de Anel: Sakura', price: '¥160', text: 'Só visual. Não muda a força', once: true, skin: 'sakura', cat: 'look' },
  { id: 'rl_skin_set', name: 'Conjunto de 3 Skins', price: '¥360', text: 'Neon, Dourado e Sakura juntos (para quem não tem nenhuma)', once: true, set: ['neon', 'gold', 'sakura'], cat: 'look' },
  { id: 'rl_aura', name: 'Aura Arco-íris', price: '¥240', text: 'Luz arco-íris envolve os heróis (só visual)', once: true, cat: 'look' },
];
// ring colour themes: [col, hi, lo] per ring
export const RING_SKINS = {
  neon: { name: 'Neon', rings: [['#ff3df2', '#ffb3fa', '#7a1a73'], ['#2ce8f5', '#c4fbff', '#124e89'], ['#b6ff3d', '#eaffb3', '#3e8948'], ['#ffe23d', '#fff6b3', '#b86f00']] },
  gold: { name: 'Dourado', rings: [['#feae34', '#fee761', '#733e39'], ['#fee761', '#ffffff', '#b86f00'], ['#ead4aa', '#ffffff', '#733e39'], ['#f77622', '#fee761', '#733e39']] },
  sakura: { name: 'Sakura', rings: [['#f6757a', '#ffd1dc', '#b55088'], ['#ffb3c7', '#ffffff', '#b55088'], ['#ead4aa', '#fff0f5', '#b55088'], ['#b55088', '#f6757a', '#68386c']] },
  guren: { name: 'Carmesim (Pacote de Heróis)', pass: true, rings: [['#e43b44', '#f77622', '#3a0d14'], ['#f77622', '#fee761', '#a22633'], ['#feae34', '#ffffff', '#a22633'], ['#a22633', '#e43b44', '#181425']] },
  soten: { name: 'Céu Azul (Pacote da Legião)', pass: true, rings: [['#0099db', '#ffffff', '#124e89'], ['#2ce8f5', '#ffffff', '#0099db'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#124e89', '#2ce8f5', '#181425']] },
  legend: { name: 'Lenda (Pacote Lendário)', pass: true, rings: [['#fee761', '#ffffff', '#b86f00'], ['#ff3df2', '#ffffff', '#68386c'], ['#2ce8f5', '#ffffff', '#124e89'], ['#b6ff3d', '#ffffff', '#3e8948']] },
  season: { name: 'Vácuo (exclusiva do Passe)', pass: true, rings: [['#8b9bb4', '#ffffff', '#3a4466'], ['#5a6988', '#c0cbdc', '#262b44'], ['#c0cbdc', '#ffffff', '#5a6988'], ['#ffffff', '#ffffff', '#8b9bb4']] },
};
// monthly spending caps for minors (self-declared; JOGA-style guideline, adult age 18)
export const AGE_BANDS = { u16: { name: 'Menos de 16 anos', cap: 5000 }, u18: { name: '16 a 17 anos', cap: 10000 }, adult: { name: '18 anos ou mais', cap: Infinity } };
export const AD_REWARDS = [
  { id: 'ad_coin', name: 'Moedas (60 inimigos)', limit: 10 },
  { id: 'ad_flux', name: 'Tempo 2x +30 min', limit: 6, need: 'autoBuy' },
  { id: 'ad_burst', name: 'Barra de BURST cheia', limit: 6, need: 'burst' },
  { id: 'ad_black', name: 'Minério Negro +1', limit: 3, need: 'minerals' },
];

// ===== version & update notes (add one entry per monthly update, newest first) =====
export const VERSION = '1.0.0';
export const UPDATES = [
  { v: '1.0.0', date: 'Dezembro de 2026', title: 'Lançamento', items: ['12 heróis e 4 anéis', 'Renascimento, Revolução, Transcendência, Infinito, Eternidade', 'Reide Semanal e Passe da Legião', 'Trilha sonora original'] },
];
export const NEXT_CHAPTER = 'Todo mês vamos adicionando aos poucos novos heróis, mundos e regras de Reide.';
