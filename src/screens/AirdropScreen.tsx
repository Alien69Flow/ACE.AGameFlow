import { motion } from 'framer-motion';
import { Zap, Rocket, Trophy, Clock, Star, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AirdropScreenProps {
  energy: number;
  referralCount: number;
  dailyStreak: number;
}

const TIERS = [
  { name: 'Bronze', min: 0, max: 1000, color: 'text-orange-400', icon: Shield, allocation: '0.1×' },
  { name: 'Silver', min: 1000, max: 10000, color: 'text-muted-foreground', icon: Shield, allocation: '0.5×' },
  { name: 'Gold', min: 10000, max: 100000, color: 'text-secondary', icon: Star, allocation: '1.0×' },
  { name: 'Diamond', min: 100000, max: Infinity, color: 'text-primary', icon: Trophy, allocation: '5.0×' },
];

// TGE countdown — placeholder date
const TGE_DATE = new Date('2026-06-01T00:00:00Z');

export const AirdropScreen = ({ energy, referralCount, dailyStreak }: AirdropScreenProps) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const currentTier = TIERS.find(t => energy >= t.min && energy < t.max) || TIERS[TIERS.length - 1];
  const currentTierIndex = TIERS.indexOf(currentTier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  const progressInTier = nextTier 
    ? Math.min(((energy - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100)
    : 100;

  // Estimated allocation (fake but motivational)
  const baseAllocation = energy * 0.01;
  const referralBonus = referralCount * 50;
  const streakBonus = dailyStreak * 10;
  const totalAllocation = Math.floor(baseAllocation + referralBonus + streakBonus);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = TGE_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-y-auto pb-24 pt-2"
    >
      <div className="px-4 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Rocket className="w-10 h-10 text-secondary mx-auto mb-2" />
          </motion.div>
          <h1 className="font-display text-xl font-bold text-secondary text-glow-gold">
            $ALIEN AIRDROP
          </h1>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Tu energía minada = tokens futuros
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card/80 border border-secondary/30 rounded-xl p-4 box-glow-gold"
        >
          <div className="flex items-center justify-center gap-1 mb-2">
            <Clock className="w-4 h-4 text-secondary" />
            <span className="font-display text-xs text-secondary">TOKEN GENERATION EVENT</span>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { value: countdown.days, label: 'DÍAS' },
              { value: countdown.hours, label: 'HRS' },
              { value: countdown.minutes, label: 'MIN' },
              { value: countdown.seconds, label: 'SEG' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <motion.span
                  key={item.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-display text-2xl font-bold text-secondary text-glow-gold block"
                >
                  {String(item.value).padStart(2, '0')}
                </motion.span>
                <span className="font-body text-[9px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Estimated Allocation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/80 border border-primary/30 rounded-xl p-4"
        >
          <h3 className="font-display text-xs text-primary text-glow text-center mb-3">
            TU ASIGNACIÓN ESTIMADA
          </h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-8 h-8 text-secondary" />
            <motion.span
              key={totalAllocation}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-display text-3xl font-bold text-secondary text-glow-gold"
            >
              {totalAllocation.toLocaleString()}
            </motion.span>
            <span className="font-display text-sm text-secondary/70">$ALIEN</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/10 rounded-lg p-2">
              <span className="font-body text-[9px] text-muted-foreground block">Energía</span>
              <span className="font-display text-xs text-foreground">{Math.floor(baseAllocation)}</span>
            </div>
            <div className="bg-muted/10 rounded-lg p-2">
              <span className="font-body text-[9px] text-muted-foreground block">Referidos</span>
              <span className="font-display text-xs text-foreground">+{referralBonus}</span>
            </div>
            <div className="bg-muted/10 rounded-lg p-2">
              <span className="font-body text-[9px] text-muted-foreground block">Racha</span>
              <span className="font-display text-xs text-foreground">+{streakBonus}</span>
            </div>
          </div>
        </motion.div>

        {/* Tier Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card/80 border border-muted/20 rounded-xl p-4"
        >
          <h3 className="font-display text-xs text-primary text-glow text-center mb-3">
            TU RANGO
          </h3>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <currentTier.icon className={`w-8 h-8 ${currentTier.color}`} />
            <span className={`font-display text-2xl font-bold ${currentTier.color}`}>
              {currentTier.name}
            </span>
            <span className="font-display text-sm text-muted-foreground">
              ({currentTier.allocation})
            </span>
          </div>

          {nextTier && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="font-body text-muted-foreground">{currentTier.name}</span>
                <span className="font-body text-muted-foreground">{nextTier.name}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-neon"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressInTier}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="font-body text-[10px] text-muted-foreground text-center">
                {(nextTier.min - energy).toLocaleString()} energía para {nextTier.name}
              </p>
            </div>
          )}
        </motion.div>

        {/* Tier List */}
        <div className="space-y-1.5">
          {TIERS.map((tier, i) => {
            const TierIcon = tier.icon;
            const isCurrentTier = tier === currentTier;
            return (
              <motion.div
                key={tier.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  isCurrentTier ? 'bg-card/90 border-primary/40 box-glow' : 'bg-card/40 border-muted/10'
                }`}
              >
                <TierIcon className={`w-5 h-5 ${tier.color}`} />
                <div className="flex-1">
                  <span className={`font-display text-xs font-bold ${isCurrentTier ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {tier.name}
                  </span>
                  <span className="font-body text-[9px] text-muted-foreground block">
                    {tier.max === Infinity ? `${tier.min.toLocaleString()}+` : `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}`} energía
                  </span>
                </div>
                <span className={`font-display text-sm font-bold ${tier.color}`}>
                  {tier.allocation}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
