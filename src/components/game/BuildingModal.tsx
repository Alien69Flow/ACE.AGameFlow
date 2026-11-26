import { motion } from 'framer-motion';
import type { BuildingInfo } from '@/hooks/useGameState';

interface BuildingModalProps {
  building: BuildingInfo;
  energy: number;
  buying: boolean;
  onBuy: () => void;
  onOpenArena: () => void;
  onClose: () => void;
}

export const BuildingModal = ({ building, energy, buying, onBuy, onOpenArena, onClose }: BuildingModalProps) => {
  const isBuilt = building.level > 0;
  const isMaxed = building.level >= building.maxLevel;
  const cost = building.nextCost;
  const canAfford = cost !== null && energy >= cost;
  const BUILDING_BENEFITS: Record<string, string> = {
    central_energy: '+10% de regeneración de stamina por nivel',
    laboratory: '+10% de recompensa en minijuegos por nivel',
    card_hangar: 'Añade una carta especial al mazo por nivel',
    arena: 'Desbloquea batallas diarias contra otros mazos',
    coliseum: '+25% de recompensa por victoria en Arena por nivel',
    surface_mine: 'Produce energía pasiva. +30/h por nivel',
    underground_mine: 'Produce el doble de minerales que la mina terrestre',
    refinery: 'Produce datos. +5/h por nivel',
    defense_center: 'Desbloquea Tower Defense en los minijuegos',
    space_hangar: 'Desbloquea Asteroid Blitz y naves espaciales',
    orbital_station: 'Estación avanzada de producción en órbita',
  };
  const benefit = BUILDING_BENEFITS[building.type] ?? 'Edificio especial';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-primary/40 rounded-2xl p-6 w-full max-w-sm text-center space-y-4"
      >
        <div className="text-4xl">{building.icon}</div>
        <h2 className="font-display text-lg font-bold text-primary">{building.name}</h2>
        <p className="font-body text-xs text-muted-foreground">
          {isBuilt ? `Nivel ${building.level} de ${building.maxLevel}` : 'Sin construir'}
        </p>
        <p className="font-body text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          {benefit}
        </p>

        {cost !== null && (
          <p className="font-body text-sm text-foreground">
            Coste: <span className="text-secondary font-bold">{cost} energía</span>
          </p>
        )}
        {cost !== null && !canAfford && (
          <p className="font-body text-xs text-destructive">Te faltan {cost - energy} de energía</p>
        )}

        <motion.button
          onClick={onBuy}
          disabled={isMaxed || !canAfford || buying}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 rounded-xl bg-primary/20 border-2 border-primary font-display text-sm font-bold text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buying ? 'PROCESANDO...' : isMaxed ? 'NIVEL MÁXIMO' : isBuilt ? 'MEJORAR' : 'CONSTRUIR'}
        </motion.button>

        {building.type === 'arena' && isBuilt && (
          <motion.button
            onClick={onOpenArena}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl bg-secondary/20 border border-secondary/60 font-display text-sm font-bold text-secondary hover:bg-secondary/30 transition-colors"
          >
            ENTRAR A LA ARENA
          </motion.button>
        )}

        <button onClick={onClose} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
};
