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
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="flex items-center gap-4">
        {/* Stamina */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Battery className="w-4 h-4 text-primary" />
            <span className="font-display text-xs text-primary text-glow">
              STAMINA
            </span>
            {isMultiplierActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/40"
              >
                <Star className="w-3 h-3 text-secondary" />
                <span className="font-display text-[9px] text-secondary font-bold">{multiplier}×</span>
              </motion.span>
            )}
            {achievementCounts && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/40">
                <Trophy className="w-3 h-3 text-secondary" />
                <span className="font-display text-[9px] text-secondary font-bold">{achievementCounts.unlocked}/{achievementCounts.total}</span>
              </span>
            )}
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/30">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${staminaPercent}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{
                boxShadow: '0 0 10px hsl(108 100% 54% / 0.5)',
              }}
            />
          </div>
          <span className="font-body text-xs text-muted-foreground mt-0.5 block">
            {stamina}/{maxStamina}
          </span>
        </div>

        {/* Energy counter */}
        <motion.div
          className="bg-card border border-secondary/50 rounded-xl px-4 py-2 box-glow-gold"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            <div>
              <span className="font-display text-xs text-secondary/70 block">
                ENERGÍA
              </span>
              <motion.span
                key={energy}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-display text-lg font-bold text-secondary text-glow-gold"
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
