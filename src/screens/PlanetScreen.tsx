import { motion } from 'framer-motion';
import { Earth3D } from '@/components/game/Earth3D';
import { HexSlot } from '@/components/game/HexSlot';
import { getTutorialHighlight } from '@/components/game/Tutorial';

interface PlanetScreenProps {
  onEnterMine: () => void;
  tutorialStep: number | null;
}

const slots = [
  { id: 1, name: 'Core Mina', isUnlocked: true },
  { id: 2, name: 'Slot 2', isUnlocked: false },
  { id: 3, name: 'Slot 3', isUnlocked: false },
  { id: 4, name: 'Slot 4', isUnlocked: false },
  { id: 5, name: 'Slot 5', isUnlocked: false },
  { id: 6, name: 'Slot 6', isUnlocked: false },
];

export const PlanetScreen = ({ onEnterMine, tutorialStep }: PlanetScreenProps) => {
  const highlight = tutorialStep !== null ? getTutorialHighlight(tutorialStep) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
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

      {/* Earth and Hex Slots container */}
      <div className="relative w-80 h-80">
        {/* Earth 3D */}
        <Earth3D className="absolute inset-0 w-full h-full" />

        {/* Hexagonal slots orbiting */}
        {slots.map((slot, index) => (
          <HexSlot
            key={slot.id}
            index={index}
            isUnlocked={slot.isUnlocked}
            name={slot.name}
            onClick={slot.isUnlocked ? onEnterMine : undefined}
            isHighlighted={highlight === 'core-mina' && slot.id === 1}
          />
        ))}
      </div>

      {/* Decorative particles */}
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
