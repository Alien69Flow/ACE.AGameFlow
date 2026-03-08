import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Zap, Battery, Clock, MousePointerClick, TrendingUp, Lock } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface UpgradeInfo {
  type: string;
  currentLevel: number;
  maxLevel: number;
  currentValue: number;
  nextValue: number | null;
  nextCost: number | null;
  canAfford: boolean;
}

interface UpgradesScreenProps {
  energy: number;
  onFetchUpgrades: () => Promise<{ upgrades: UpgradeInfo[]; energy: number } | null>;
  onBuyUpgrade: (type: string) => Promise<{ success: boolean; newLevel?: number; newValue?: number; energy?: number } | null>;
}

const UPGRADE_META: Record<string, { icon: typeof Zap; label: string; unit: string; color: string }> = {
  tap_power:      { icon: MousePointerClick, label: 'Poder de Toque', unit: '/tap', color: 'text-primary' },
  passive_income: { icon: TrendingUp,        label: 'Ingreso Pasivo', unit: '/hora', color: 'text-secondary' },
  max_stamina:    { icon: Battery,           label: 'Stamina Máx',   unit: ' pts', color: 'text-primary' },
  regen_speed:    { icon: Clock,             label: 'Velocidad Regen', unit: '/min', color: 'text-secondary' },
};

export const UpgradesScreen = ({ energy, onFetchUpgrades, onBuyUpgrade }: UpgradesScreenProps) => {
  const [upgrades, setUpgrades] = useState<UpgradeInfo[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState(energy);
  const [buying, setBuying] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const data = await onFetchUpgrades();
    if (data) {
      setUpgrades(data.upgrades);
      setCurrentEnergy(data.energy);
    }
  }, [onFetchUpgrades]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBuy = async (type: string) => {
    setBuying(type);
    const result = await onBuyUpgrade(type);
    if (result?.success) {
      await fetchData();
    }
    setBuying(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-y-auto pb-24 pt-2"
    >
      <div className="px-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="font-display text-xl font-bold text-primary text-glow">
            MEJORAS
          </h1>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Invierte energía en upgrades permanentes
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="font-display text-lg font-bold text-secondary text-glow-gold">
              {currentEnergy.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Upgrade Cards */}
        <div className="space-y-3">
          {upgrades.map((upgrade, index) => {
            const meta = UPGRADE_META[upgrade.type];
            if (!meta) return null;
            const Icon = meta.icon;
            const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
            const isBuying = buying === upgrade.type;

            return (
              <motion.div
                key={upgrade.type}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  isMaxed
                    ? 'bg-card/40 border-muted/20'
                    : upgrade.canAfford
                    ? 'bg-card/80 border-primary/40 hover:border-primary/60'
                    : 'bg-card/60 border-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${isMaxed ? 'bg-muted/20' : 'bg-primary/10'}`}>
                    <Icon className={`w-6 h-6 ${isMaxed ? 'text-muted-foreground' : meta.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display text-sm font-bold ${isMaxed ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {meta.label}
                      </h3>
                      <span className="font-display text-[10px] text-muted-foreground">
                        Nv. {upgrade.currentLevel}/{upgrade.maxLevel}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="font-body text-xs text-muted-foreground">
                        <span className={meta.color + ' font-bold'}>{upgrade.currentValue}{meta.unit}</span>
                        {upgrade.nextValue !== null && (
                          <span> → <span className="text-foreground font-bold">{upgrade.nextValue}{meta.unit}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy button */}
                <div className="mt-3">
                  {isMaxed ? (
                    <div className="flex items-center justify-center gap-1 py-2 rounded-lg bg-muted/10 border border-muted/20">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-display text-xs text-muted-foreground">MÁXIMO</span>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleBuy(upgrade.type)}
                      disabled={!upgrade.canAfford || isBuying}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-2.5 rounded-lg font-display text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2
                        ${upgrade.canAfford
                          ? 'bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30'
                          : 'bg-muted/10 border border-muted/20 text-muted-foreground cursor-not-allowed'
                        }
                      `}
                    >
                      {isBuying ? (
                        <span>COMPRANDO...</span>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          <span>{upgrade.nextCost?.toLocaleString()} ENERGÍA</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {upgrades.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body text-xs text-muted-foreground">Cargando mejoras...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
