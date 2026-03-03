export const DAO_WALLET_ADDRESS = "UQA_CAMBIA_ESTO_POR_TU_WALLET_TON"; 

export interface EnergyPack {
  id: string;
  name: string;
  staminaGain: number;
  priceTon: string;
}

// Catálogo de Inyección de Neutrinos
export const ENERGY_PACKS: EnergyPack[] = [
  { id: 'flux_starter', name: 'Flux Starter', staminaGain: 1000, priceTon: "0.1" },
  { id: 'tesla_burst', name: 'Tesla Burst', staminaGain: 5000, priceTon: "0.4" },
  { id: 'void_core', name: 'Void Core', staminaGain: 20000, priceTon: "1.2" }
];

// Conversor de TON a NanoTON (1 TON = 10^9 NanoTON)
export const toNano = (ton: string) => (parseFloat(ton) * 1e9).toString();
