export const BUILDING_CATALOG = {
  2: { type: 'central_energy', name: 'Central Energética', icon: '⚡', costs: [1000, 5000, 20000] },
  3: { type: 'laboratory', name: 'Laboratorio', icon: '🔬', costs: [1500, 6000, 25000] },
  4: { type: 'card_hangar', name: 'Hangar de Cartas', icon: '🃏', costs: [2000, 8000, 30000] },
  5: { type: 'arena', name: 'Arena', icon: '⚔️', costs: [2500, 10000, 40000] },
  6: { type: 'coliseum', name: 'Coliseo', icon: '🏟️', costs: [5000, 20000, 80000] },
} as const;

export type BuildingSlotId = keyof typeof BUILDING_CATALOG;

export const BUILDING_SLOT_IDS = Object.keys(BUILDING_CATALOG).map(Number) as BuildingSlotId[];

export const ARENA_DAILY_BATTLE_LIMIT = 10;

export const CENTRAL_ENERGY_SLOT_ID = 2;

export const LABORATORY_SLOT_ID = 3;

export function minigameBonusMultiplier(laboratoryLevel: number): number {
  return 1 + 0.1 * laboratoryLevel;
}

export function regenBonusMultiplier(centralEnergyLevel: number): number {
  return 1 + 0.1 * centralEnergyLevel;
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

export function starterDeck(): ArenaCard[] {
  return STARTER_DECK_IDS.map(id => ARENA_CARDS.find(c => c.id === id)!).map(c => ({ ...c }));
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
