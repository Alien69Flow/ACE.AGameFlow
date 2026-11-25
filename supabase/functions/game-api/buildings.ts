export const BUILDING_CATALOG = {
  2: { type: 'central_energy', name: 'Central Energética', icon: '⚡', costs: [1000, 5000, 20000], category: 'energy' },
  3: { type: 'laboratory', name: 'Laboratorio', icon: '🔬', costs: [1500, 6000, 25000], category: 'data' },
  4: { type: 'card_hangar', name: 'Hangar de Cartas', icon: '🃏', costs: [2000, 8000, 30000], category: 'arena' },
  5: { type: 'arena', name: 'Arena', icon: '⚔️', costs: [2500, 10000, 40000], category: 'arena' },
  6: { type: 'coliseum', name: 'Coliseo', icon: '🏟️', costs: [5000, 20000, 80000], category: 'arena' },
  7: { type: 'surface_mine', name: 'Mina Terrestre', icon: '⛏️', costs: [800, 4000, 16000], category: 'mining' },
  8: { type: 'underground_mine', name: 'Mina Subterránea', icon: '🕳️', costs: [3000, 12000, 48000], category: 'mining' },
  9: { type: 'refinery', name: 'Refinería', icon: '🏭', costs: [2000, 8000, 30000], category: 'mining' },
  10: { type: 'defense_center', name: 'Centro de Defensa', icon: '🛡️', costs: [2500, 10000, 40000], category: 'defense' },
  11: { type: 'space_hangar', name: 'Hangar Espacial', icon: '🚀', costs: [8000, 30000, 100000], category: 'space' },
  12: { type: 'orbital_station', name: 'Estación Orbital', icon: '🛰️', costs: [15000, 60000, 200000], category: 'space' },
} as const;

export type BuildingSlotId = keyof typeof BUILDING_CATALOG;

export const BUILDING_SLOT_IDS = Object.keys(BUILDING_CATALOG).map(Number) as BuildingSlotId[];

export const ARENA_DAILY_BATTLE_LIMIT = 10;

export const CENTRAL_ENERGY_SLOT_ID = 2;
export const LABORATORY_SLOT_ID = 3;
export const CARD_HANGAR_SLOT_ID = 4;
export const COLOSSEUM_SLOT_ID = 6;
export const SURFACE_MINE_SLOT_ID = 7;
export const UNDERGROUND_MINE_SLOT_ID = 8;
export const REFINERY_SLOT_ID = 9;
export const DEFENSE_CENTER_SLOT_ID = 10;
export const SPACE_HANGAR_SLOT_ID = 11;
export const ORBITAL_STATION_SLOT_ID = 12;

// IDs that require a previous building to be at least level 1
export const BUILDING_PREREQUISITES: Partial<Record<BuildingSlotId, { slot: BuildingSlotId; level: number }>> = {
  8: { slot: 7, level: 1 }, // Underground requires surface mine
  9: { slot: 7, level: 1 }, // Refinery requires surface mine
  10: { slot: 3, level: 1 }, // Defense requires laboratory
  11: { slot: 9, level: 1 }, // Space hangar requires refinery
  12: { slot: 11, level: 1 }, // Orbital requires space hangar
};

export function minigameBonusMultiplier(laboratoryLevel: number): number {
  return 1 + 0.1 * laboratoryLevel;
}

export function regenBonusMultiplier(centralEnergyLevel: number): number {
  return 1 + 0.1 * centralEnergyLevel;
}

// Mineral production rate per building level (per hour)
export function mineralProductionRate(level: number): number {
  return 20 * level + 10 * level * (level - 1);
}

// Data production rate per lab level (per hour)
export function dataProductionRate(level: number): number {
  return 15 * level;
}

// Energy passive production per surface mine level (per hour)
export function mineEnergyProductionRate(level: number): number {
  return 30 * level;
}

export interface ArenaCard {
  id: string;
  name: string;
  attack: number;
  health: number;
}

export const ARENA_CARDS: ArenaCard[] = [
  { id: 'spark', name: 'Chispa', attack: 2, health: 3 },
  { id: 'drone', name: 'Dron', attack: 3, health: 2 },
  { id: 'golem', name: 'Gólem', attack: 2, health: 6 },
  { id: 'raptor', name: 'Raptor', attack: 4, health: 3 },
  { id: 'titan', name: 'Titán', attack: 5, health: 5 },
  { id: 'ghost', name: 'Fantasma', attack: 3, health: 4 },
  { id: 'bulwark', name: 'Baluarte', attack: 1, health: 8 },
  { id: 'nova', name: 'Nova', attack: 6, health: 2 },
];

const STARTER_DECK_IDS = ['spark', 'drone', 'golem', 'raptor', 'bulwark'];
const HANGAR_CARD_IDS = ['ghost', 'nova', 'titan'];

export function starterDeck(hangarLevel = 0): ArenaCard[] {
  const cardIds = [...STARTER_DECK_IDS, ...HANGAR_CARD_IDS.slice(0, hangarLevel)];
  return cardIds.map(id => ARENA_CARDS.find(c => c.id === id)!).map(c => ({ ...c }));
}

export function pickBotDeck(): ArenaCard[] {
  const pool = [...ARENA_CARDS];
  const deck: ArenaCard[] = [];
  while (deck.length < STARTER_DECK_IDS.length && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    deck.push({ ...pool.splice(index, 1)[0] });
  }
  return deck;
}

export function simulateBattle(playerDeck: ArenaCard[], botDeck: ArenaCard[]): { won: boolean; log: string[] } {
  const player = playerDeck.map(c => ({ ...c }));
  const bot = botDeck.map(c => ({ ...c }));
  const log: string[] = [];

  while (player.length > 0 && bot.length > 0) {
    const p = player[0];
    const b = bot[0];
    b.health -= p.attack;
    p.health -= b.attack;
    log.push(`${p.name} ataca a ${b.name} (${p.attack} daño). ${b.name} responde (${b.attack} daño).`);
    if (b.health <= 0) {
      log.push(`${b.name} cae.`);
      bot.shift();
    }
    if (p.health <= 0) {
      log.push(`${p.name} cae.`);
      player.shift();
    }
  }

  return { won: player.length > 0 && bot.length === 0, log };
}

// Minigame category metadata for the Games Hub
export type GameCategory = 'mining' | 'strategy' | 'arena' | 'racing' | 'sports' | 'arcade' | 'space';

export interface GameDefinition {
  id: string;
  category: GameCategory;
  label: string;
  description: string;
  icon: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  rewardResource: 'energy' | 'minerals' | 'data' | 'influence';
  rewardPerPoint: number;
  maxReward: number;
  dailyPlayLimit: number;
  buildingBoost?: { slot: BuildingSlotId; boostPerLevel: number };
  unlockBuilding?: { slot: BuildingSlotId; level: number };
}

export const GAME_CATALOG: GameDefinition[] = [
  { id: 'core_drill', category: 'mining', label: 'Core Drill', description: 'Extrae vetas de energía antes de que se agoten', icon: '⛏️', difficulty: 'Medio', rewardResource: 'energy', rewardPerPoint: 2, maxReward: 250, dailyPlayLimit: 5, buildingBoost: { slot: SURFACE_MINE_SLOT_ID, boostPerLevel: 0.1 } },
  { id: 'memory_match', category: 'arcade', label: 'Memory Match', description: 'Encuentra los pares alienígenas', icon: '🧠', difficulty: 'Fácil', rewardResource: 'energy', rewardPerPoint: 2, maxReward: 200, dailyPlayLimit: 5, buildingBoost: { slot: LABORATORY_SLOT_ID, boostPerLevel: 0.1 } },
  { id: 'reaction_rush', category: 'arcade', label: 'Reaction Rush', description: 'Toca los alienígenas lo más rápido posible', icon: '🎯', difficulty: 'Medio', rewardResource: 'energy', rewardPerPoint: 3, maxReward: 300, dailyPlayLimit: 5 },
  { id: 'asteroid_blitz', category: 'space', label: 'Asteroid Blitz', description: 'Destruye asteroides antes de que escapen', icon: '☄️', difficulty: 'Difícil', rewardResource: 'minerals', rewardPerPoint: 1, maxReward: 100, dailyPlayLimit: 5, unlockBuilding: { slot: SPACE_HANGAR_SLOT_ID, level: 1 } },
  { id: 'tower_defense', category: 'strategy', label: 'Tower Defense', description: 'Defiende tu base de oleadas alienígenas', icon: '🛡️', difficulty: 'Difícil', rewardResource: 'data', rewardPerPoint: 4, maxReward: 200, dailyPlayLimit: 3, unlockBuilding: { slot: DEFENSE_CENTER_SLOT_ID, level: 1 } },
  { id: 'tech_puzzle', category: 'strategy', label: 'Tech Puzzle', description: 'Conecta circuitos para generar Datos', icon: '🔌', difficulty: 'Medio', rewardResource: 'data', rewardPerPoint: 3, maxReward: 150, dailyPlayLimit: 5, buildingBoost: { slot: LABORATORY_SLOT_ID, boostPerLevel: 0.15 } },
];

export const GAME_CATEGORY_INFO: Record<GameCategory, { label: string; icon: string; color: string }> = {
  mining: { label: 'Minería', icon: '⛏️', color: 'text-secondary' },
  strategy: { label: 'Estrategia', icon: '🛡️', color: 'text-blue-400' },
  arena: { label: 'Arena', icon: '⚔️', color: 'text-red-400' },
  racing: { label: 'Carreras', icon: '🏁', color: 'text-orange-400' },
  sports: { label: 'Deportes', icon: '⚽', color: 'text-green-400' },
  arcade: { label: 'Arcade', icon: '🕹️', color: 'text-primary' },
  space: { label: 'Espaciales', icon: '🚀', color: 'text-cyan-400' },
};
