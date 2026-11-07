import { motion } from 'framer-motion';
import { CoreMineScene } from '@/components/game/CoreMineScene';

interface ToroidProps {
  onTap: () => Promise<boolean>;
  stamina: number;
  isHighlighted?: boolean;
}

export const Toroid = ({ onTap, stamina, isHighlighted }: ToroidProps) => {
  return (
    <div className={`relative flex items-center justify-center w-80 h-80 ${isHighlighted ? 'z-50' : ''}`}>
      <motion.div
        className="absolute w-80 h-80 rounded-full border border-primary/20 pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={`relative w-72 h-72 transition-opacity duration-300 ${stamina <= 0 ? 'opacity-50 saturate-0' : ''}`}>
        <CoreMineScene onTap={onTap} canTap={stamina > 0} />
      </div>

      {isHighlighted && (
        <motion.div
          className="absolute w-72 h-72 rounded-full border-4 border-primary pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};
