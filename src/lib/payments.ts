export const DAO_WALLET_ADDRESS = "UQDpx7rfaaO-P6-Lnu0IrR1kWEo2Geo1VMx1UYy0IyyCJJ20"; 

export interface EnergyPack {
  id: string;
  name: string;
  staminaGain: number;
  priceTon: string;
  featured?: boolean;
}

export interface MultiplierPack {
  id: string;
  name: string;
  multiplier: number;
  durationHours: number;
  priceTon: string;
}

// Catálogo de Inyección de Neutrinos
export const ENERGY_PACKS: EnergyPack[] = [
  { id: 'flux_starter', name: 'Flux Starter', staminaGain: 1000, priceTon: "0.1" },
  { id: 'tesla_burst', name: 'Tesla Burst', staminaGain: 5000, priceTon: "0.4" },
  { id: 'void_core', name: 'Void Core', staminaGain: 20000, priceTon: "1.2" },
  { id: 'quantum_surge', name: 'Quantum Surge', staminaGain: 50000, priceTon: "3.0", featured: true },
  { id: 'singularity', name: 'Singularity', staminaGain: 100000, priceTon: "5.0", featured: true },
];

// Multiplicadores Premium
export const MULTIPLIER_PACKS: MultiplierPack[] = [
  { id: 'boost_2x', name: '2× Boost', multiplier: 2, durationHours: 24, priceTon: "0.5" },
];

// Conversor de TON a NanoTON (1 TON = 10^9 NanoTON)
export const toNano = (ton: string) => (parseFloat(ton) * 1e9).toString();
