import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Earth3D } from '@/components/game/Earth3D';
import { HexSlot } from '@/components/game/HexSlot';
import { BuildingModal } from '@/components/game/BuildingModal';
import { ArenaModal } from '@/components/game/ArenaModal';
import { getTutorialHighlight } from '@/components/game/Tutorial';
import { LuckyWheel } from '@/components/game/LuckyWheel';
import { Gift, Zap, Flame, Sparkles } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import type { ArenaBattleResult, BuildingInfo } from '@/hooks/useGameState';

interface PlanetScreenProps {
  onEnterMine: () => void;
  tutorialStep: number | null;
  dailyRewardAvailable: boolean;
  dailyStreak: number;
  onClaimDaily: () => Promise<{ reward: number; streak: number } | null>;
  onSpinWheel: () => Promise<{ prize: { type: string; value: number; label: string } | null; canSpinFree: boolean; error?: string }>;
  canSpinFree: boolean;
  energy: number;
  onFetchBuildings: () => Promise<{ buildings: BuildingInfo[]; energy: number } | null>;
  onBuyBuilding: (slotId: number) => Promise<{ success: boolean } | null>;
  onArenaBattle: () => Promise<ArenaBattleResult | null>;
}

const BUILDING_SLOT_IDS = [2, 3, 4, 5, 6];

export const PlanetScreen = ({ onEnterMine, tutorialStep, dailyRewardAvailable, dailyStreak, onClaimDaily, onSpinWheel, canSpinFree, energy, onFetchBuildings, onBuyBuilding, onArenaBattle }: PlanetScreenProps) => {
  const { hapticFeedback } = useTelegram();
  const highlight = tutorialStep !== null ? getTutorialHighlight(tutorialStep) : null;
  const [showDailyModal, setShowDailyModal] = useState(dailyRewardAvailable);
  const [claimResult, setClaimResult] = useState<{ reward: number; streak: number } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [buildings, setBuildings] = useState<BuildingInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showArena, setShowArena] = useState(false);
  const [buying, setBuying] = useState(false);

  const loadBuildings = async () => {
    const data = await onFetchBuildings();
    if (data) setBuildings(data.buildings);
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleBuy = async (slotId: number) => {
    setBuying(true);
    const result = await onBuyBuilding(slotId);
    if (result?.success) {
      hapticFeedback('heavy');
      await loadBuildings();
    }
    setBuying(false);
  };

  const selectedBuilding = buildings.find(b => b.slotId === selectedSlot) ?? null;

  const slots = [
    { id: 1, name: 'Core Mina', isUnlocked: true, onClick: onEnterMine },
    ...BUILDING_SLOT_IDS.map(id => {
      const building = buildings.find(b => b.slotId === id);
      return {
        id,
        name: building?.name ?? `Slot ${id}`,
        isUnlocked: (building?.level ?? 0) > 0,
        onClick: building ? () => setSelectedSlot(id) : undefined,
      };
    }),
  ];

  const handleClaim = async () => {
    setClaiming(true);
    const result = await onClaimDaily();
    if (result) {
      setClaimResult(result);
      hapticFeedback('heavy');
    }
    setClaiming(false);
  };

  const handleClose = () => {
    setShowDailyModal(false);
    setClaimResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Daily Reward Modal */}
      <AnimatePresence>
        {showDailyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card border border-secondary/40 rounded-2xl p-6 w-full max-w-sm text-center space-y-4 box-glow-gold"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Gift className="w-12 h-12 text-secondary mx-auto" />
              </motion.div>

              {!claimResult ? (
                <>
                  <h2 className="font-display text-xl font-bold text-secondary text-glow-gold">
                    RECOMPENSA DIARIA
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="font-display text-sm text-muted-foreground">
                      Racha: <span className="text-secondary font-bold">{dailyStreak}</span> días
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    ¡Reclama tu energía diaria! La racha aumenta la recompensa.
                  </p>
                  <motion.button
                    onClick={handleClaim}
                    disabled={claiming}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 rounded-xl bg-secondary/20 border-2 border-secondary font-display text-base font-bold text-secondary text-glow-gold hover:bg-secondary/30 transition-colors disabled:opacity-50"
                  >
                    {claiming ? 'RECLAMANDO...' : '🎁 RECLAMAR'}
                  </motion.button>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold text-secondary text-glow-gold">
                    ¡RECOMPENSA!
                  </h2>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Zap className="w-8 h-8 text-secondary" />
                    <span className="font-display text-3xl font-bold text-secondary text-glow-gold">
                      +{claimResult.reward}
                    </span>
                  </motion.div>
                  <p className="font-body text-xs text-muted-foreground">
                    Racha: {claimResult.streak} días · Mañana: +{Math.min((claimResult.streak + 1) * 10, 100)} energía
                  </p>
                  <motion.button
                    onClick={handleClose}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 rounded-xl bg-primary/20 border border-primary/40 font-display text-sm text-primary hover:bg-primary/30 transition-colors"
                  >
                    CONTINUAR
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-20 left-0 right-0 text-center z-10"
      >
        <h1 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          PLANETA TIERRA
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Nivel 0 — Núcleo Activo
        </p>
      </motion.div>

      {/* Earth and Hex Slots */}
      <div className="relative w-96 h-96">
        <Earth3D className="absolute inset-0 w-full h-full" />
        {slots.map((slot, index) => (
          <HexSlot
            key={slot.id}
            index={index}
            isUnlocked={slot.isUnlocked}
            name={slot.name}
            onClick={slot.onClick}
            isHighlighted={highlight === 'core-mina' && slot.id === 1}
          />
        ))}
      </div>

      {/* Building Modal */}
      <AnimatePresence>
        {selectedBuilding && (
          <BuildingModal
            key={selectedBuilding.slotId}
            building={selectedBuilding}
            energy={energy}
            buying={buying}
            onBuy={() => handleBuy(selectedBuilding.slotId)}
            onOpenArena={() => setShowArena(true)}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>

      {/* Arena Modal */}
      <AnimatePresence>
        {showArena && (
          <ArenaModal
            onBattle={onArenaBattle}
            onClose={() => setShowArena(false)}
          />
        )}
      </AnimatePresence>

      {/* Lucky Wheel Floating Button */}
      <motion.button
        onClick={() => setShowWheel(true)}
        className={`absolute bottom-24 right-4 p-3 rounded-full border-2 transition-all z-20
          ${canSpinFree 
            ? 'bg-secondary/20 border-secondary text-secondary animate-pulse' 
            : 'bg-card/80 border-muted-foreground/30 text-muted-foreground'
          }`}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles className="w-6 h-6" />
        {canSpinFree && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping" />
        )}
      </motion.button>

      {/* Lucky Wheel Modal */}
      <LuckyWheel
        isOpen={showWheel}
        onClose={() => setShowWheel(false)}
        onSpin={onSpinWheel}
        canSpinFree={canSpinFree}
      />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
