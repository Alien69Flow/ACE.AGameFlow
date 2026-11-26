import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Gem, Database, Crown, Download, Loader2 } from 'lucide-react';

interface ResourceBarProps {
  minerals: number;
  data: number;
  influence: number;
  productionRates: { energy: number; minerals: number; data: number };
  onCollect: () => Promise<{
    energyGain: number; mineralsGain: number; dataGain: number;
    hoursElapsed: number;
  } | null>;
}

export const ResourceBar = ({ minerals, data, influence, productionRates, onCollect }: ResourceBarProps) => {
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<{ energyGain: number; mineralsGain: number; dataGain: number; hoursElapsed: number } | null>(null);

  const hasProduction = productionRates.minerals > 0 || productionRates.data > 0 || productionRates.energy > 0;

  const handleCollect = async () => {
    setCollecting(true);
    const result = await onCollect();
    setCollecting(false);
    if (result && (result.mineralsGain > 0 || result.dataGain > 0 || result.energyGain > 0)) {
      setCollectResult(result);
      setTimeout(() => setCollectResult(null), 3000);
    }
  };

  return (
    <div className="w-full px-4">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-muted/30 rounded-xl p-2">
        {/* Minerals */}
        <ResourceChip
          icon={<Gem className="w-3.5 h-3.5" />}
          label="Minerales"
          value={minerals}
          rate={productionRates.minerals}
          colorClass="text-blue-400"
          borderClass="border-blue-500/30"
          bgClass="bg-blue-500/10"
        />

        {/* Data */}
        <ResourceChip
          icon={<Database className="w-3.5 h-3.5" />}
          label="Datos"
          value={data}
          rate={productionRates.data}
          colorClass="text-cyan-400"
          borderClass="border-cyan-500/30"
          bgClass="bg-cyan-500/10"
        />

        {/* Influence */}
        <ResourceChip
          icon={<Crown className="w-3.5 h-3.5" />}
          label="Influencia"
          value={influence}
          rate={0}
          colorClass="text-amber-400"
          borderClass="border-amber-500/30"
          bgClass="bg-amber-500/10"
          hideRate
        />

        {/* Collect button */}
        {hasProduction && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCollect}
            disabled={collecting}
            className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {collecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="font-display text-[10px] font-bold">RECOLECTAR</span>
          </motion.button>
        )}
      </div>

      {/* Collect result toast */}
      <AnimatePresence>
        {collectResult && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="mt-2 mx-auto max-w-xs bg-card border border-primary/40 rounded-xl p-3 text-center box-glow"
          >
            <p className="font-display text-[10px] text-primary text-glow mb-1">PRODUCCIÓN RECOLECTADA</p>
            <div className="flex items-center justify-center gap-3">
              {collectResult.energyGain > 0 && (
                <span className="font-display text-xs text-secondary flex items-center gap-1">
                  +{Math.floor(collectResult.energyGain)} ⚡
                </span>
              )}
              {collectResult.mineralsGain > 0 && (
                <span className="font-display text-xs text-blue-400 flex items-center gap-1">
                  +{Math.floor(collectResult.mineralsGain)} 💎
                </span>
              )}
              {collectResult.dataGain > 0 && (
                <span className="font-display text-xs text-cyan-400 flex items-center gap-1">
                  +{Math.floor(collectResult.dataGain)} 📊
                </span>
              )}
            </div>
            <p className="font-body text-[9px] text-muted-foreground mt-1">
              {collectResult.hoursElapsed.toFixed(1)}h de producción
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ResourceChip({
  icon, label, value, rate, colorClass, borderClass, bgClass, hideRate,
}: {
  icon: React.ReactNode; label: string; value: number; rate: number;
  colorClass: string; borderClass: string; bgClass: string; hideRate?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${borderClass} ${bgClass} flex-1 min-w-0`}>
      <span className={colorClass}>{icon}</span>
      <div className="min-w-0">
        <span className={`font-display text-xs font-bold ${colorClass} block truncate`}>
          {value.toLocaleString()}
        </span>
        {!hideRate && rate > 0 && (
          <span className="font-body text-[8px] text-muted-foreground block">
            +{rate}/h
          </span>
        )}
        {hideRate && (
          <span className="font-body text-[8px] text-muted-foreground block">{label}</span>
        )}
      </div>
    </div>
  );
}
