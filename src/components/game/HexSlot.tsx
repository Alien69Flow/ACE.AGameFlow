import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';

interface HexSlotProps {
  index: number;
  isUnlocked: boolean;
  name: string;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export const HexSlot = ({ index, isUnlocked, name, onClick, isHighlighted }: HexSlotProps) => {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  const radius = 110;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
    >
      <motion.button
        onClick={isUnlocked ? onClick : undefined}
        disabled={!isUnlocked}
        className={`
          relative w-[72px] h-[72px] flex items-center justify-center
          transition-all duration-300
          ${isUnlocked 
            ? 'cursor-pointer hover:scale-110' 
            : 'cursor-not-allowed opacity-60'
          }
          ${isHighlighted ? 'z-50' : ''}
        `}
        whileHover={isUnlocked ? { scale: 1.1 } : {}}
        whileTap={isUnlocked ? { scale: 0.95 } : {}}
      >
        {/* Hexagon shape */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full ${isUnlocked ? 'animate-pulse-glow' : ''}`}
        >
          <polygon
            points="50,3 97,25 97,75 50,97 3,75 3,25"
            className={`
              fill-card
              ${isUnlocked 
                ? 'stroke-primary' 
                : 'stroke-secondary'
              }
            `}
            strokeWidth="2"
          />
          {/* Inner glow for unlocked */}
          {isUnlocked && (
            <polygon
              points="50,10 90,28 90,72 50,90 10,72 10,28"
              className="fill-primary/10 stroke-none"
            />
          )}
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isUnlocked ? (
            <>
              <Zap className="w-5 h-5 text-primary text-glow" />
              <span className="text-[8px] font-display font-bold text-primary mt-0.5 text-glow">
                {name}
              </span>
            </>
          ) : (
            <Lock className="w-4 h-4 text-secondary text-glow-gold" />
          )}
        </div>

        {/* Highlight ring for tutorial */}
        {isHighlighted && (
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-primary"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>
    </motion.div>
  );
};
