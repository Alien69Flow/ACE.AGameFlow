import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Toroid } from '@/components/game/Toroid';
import { getTutorialHighlight } from '@/components/game/Tutorial';

interface MineScreenProps {
  onTap: () => Promise<boolean>;
  onBack: () => void;
  stamina: number;
  tutorialStep: number | null;
}

export const MineScreen = ({ onTap, onBack, stamina, tutorialStep }: MineScreenProps) => {
  const highlight = tutorialStep !== null ? getTutorialHighlight(tutorialStep) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Back button */}
      <motion.button
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="absolute top-20 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-display text-sm">Planeta</span>
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-20 left-0 right-0 text-center"
      >
        <h1 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          CORE MINA
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Toroide Gravitatorio Nivel 1
        </p>
      </motion.div>

      {/* Toroid */}
      <Toroid
        onTap={onTap}
        stamina={stamina}
        isHighlighted={highlight === 'toroid'}
      />

      {/* Instructions */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-32 text-center font-body text-sm text-muted-foreground px-8"
      >
        {stamina > 0
          ? 'Pulsa el Toroide para extraer Energía Punto Cero'
          : 'Sin Stamina. Espera recarga automática (+1/min)'}
      </motion.p>

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(108_100%_54%_/_0.05)_0%,_transparent_50%)]" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(108 100% 54% / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(108 100% 54% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
        </div>
      </div>
    </motion.div>
  );
};
