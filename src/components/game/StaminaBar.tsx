import { motion } from 'framer-motion';
import { Battery, Zap, Star, Trophy } from 'lucide-react';

interface StaminaBarProps {
  stamina: number;
  maxStamina: number;
  energy: number;
  multiplier?: number;
  multiplierExpiresAt?: string | null;
  achievementCounts?: { unlocked: number; total: number };
}

export const StaminaBar = ({ stamina, maxStamina, energy, multiplier = 1, multiplierExpiresAt, achievementCounts }: StaminaBarProps) => {
  const staminaPercent = (stamina / maxStamina) * 100;
  const isMultiplierActive = multiplier > 1 && multiplierExpiresAt && new Date(multiplierExpiresAt) > new Date();

  return (
    <div className="fixed top-2 left-2 right-2 z-40 pointer-events-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 max-w-[200px] pointer-events-auto">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Battery className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-display text-[10px] text-primary text-glow">STAMINA</span>
            {isMultiplierActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-secondary/20 border border-secondary/40"
              >
                <Star className="w-2.5 h-2.5 text-secondary" />
                <span className="font-display text-[8px] text-secondary font-bold">{multiplier}x</span>
              </motion.span>
            )}
            {achievementCounts && (
              <span className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-secondary/20 border border-secondary/40">
                <Trophy className="w-2.5 h-2.5 text-secondary" />
                <span className="font-display text-[8px] text-secondary font-bold">{achievementCounts.unlocked}/{achievementCounts.total}</span>
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden border border-primary/30">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${staminaPercent}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{
                boxShadow: '0 0 8px hsl(108 100% 54% / 0.5)',
              }}
            />
          </div>
          <span className="font-body text-[10px] text-muted-foreground leading-tight block">
            {stamina}/{maxStamina}
          </span>
        </div>

        <motion.div
          className="bg-card/90 backdrop-blur-sm border border-secondary/50 rounded-lg px-2.5 py-1.5 box-glow-gold pointer-events-auto flex-shrink-0"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-secondary flex-shrink-0" />
            <div>
              <span className="font-display text-[8px] text-secondary/70 block leading-none">
                ENERGY
              </span>
              <motion.span
                key={energy}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-display text-sm font-bold text-secondary text-glow-gold leading-tight"
              >
                {energy.toLocaleString()}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
