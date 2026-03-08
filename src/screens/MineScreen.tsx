import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { Toroid } from '@/components/game/Toroid';
import { getTutorialHighlight } from '@/components/game/Tutorial';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { ENERGY_PACKS, DAO_WALLET_ADDRESS, toNano } from '@/lib/payments';

interface MineScreenProps {
  onTap: () => Promise<boolean>;
  onBack: () => void;
  stamina: number;
  tutorialStep: number | null;
}

export const MineScreen = ({ onTap, onBack, stamina, tutorialStep }: MineScreenProps) => {
  const highlight = tutorialStep !== null ? getTutorialHighlight(tutorialStep) : null;
  const [tonConnectUI] = useTonConnectUI();

  const handleBuyPack = async (priceTon: string) => {
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: DAO_WALLET_ADDRESS,
            amount: toNano(priceTon),
          },
        ],
      });
    } catch (e) {
      console.error('Transaction failed:', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center relative overflow-y-auto pb-24"
    >
      {/* Back button */}
      <motion.button
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-display text-xs">Energía</span>
      </motion.button>

      {/* Wallet Connect */}
      <div className="absolute top-4 right-4 z-10">
        <TonConnectButton />
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-14 text-center"
      >
        <h1 className="font-display text-xl font-bold text-primary text-glow mb-0.5">
          CORE MINA
        </h1>
        <p className="font-body text-xs text-muted-foreground">
          Toroide Gravitatorio Nivel 1
        </p>
      </motion.div>

      {/* Toroid */}
      <div className="flex-shrink-0 my-4">
        <Toroid
          onTap={onTap}
          stamina={stamina}
          isHighlighted={highlight === 'toroid'}
        />
      </div>

      {/* Instructions */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center font-body text-xs text-muted-foreground px-8 mb-6"
      >
        {stamina > 0
          ? 'Pulsa el Toroide para extraer Energía Punto Cero'
          : 'Sin Stamina. Espera recarga automática (+1/min)'}
      </motion.p>

      {/* Energy Pack Store */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full px-4 space-y-3"
      >
        <h2 className="font-display text-sm font-bold text-secondary text-glow-gold text-center">
          ⚡ INYECCIÓN DE NEUTRINOS
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_PACKS.map((pack) => (
            <motion.button
              key={pack.id}
              onClick={() => handleBuyPack(pack.priceTon)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-secondary/30 bg-card/80 
                         hover:border-secondary/60 hover:bg-secondary/5 transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5 text-secondary" />
              <span className="font-display text-[10px] font-bold text-secondary text-glow-gold">
                {pack.name}
              </span>
              <span className="font-body text-[10px] text-muted-foreground">
                +{pack.staminaGain.toLocaleString()}
              </span>
              <span className="font-display text-xs font-bold text-foreground">
                {pack.priceTon} TON
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(108_100%_54%_/_0.05)_0%,_transparent_50%)]" />
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
