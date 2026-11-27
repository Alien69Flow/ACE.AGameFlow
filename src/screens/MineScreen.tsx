import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Star, Clock, Gamepad2, Pickaxe } from 'lucide-react';
import { useState } from 'react';
import { Toroid } from '@/components/game/Toroid';
import { getTutorialHighlight } from '@/components/game/Tutorial';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { ENERGY_PACKS, MULTIPLIER_PACKS, DAO_WALLET_ADDRESS, toNano } from '@/lib/payments';
import { toast } from 'sonner';
import { MinigamesScreen } from '@/screens/MinigamesScreen';
import type { Language } from '@/hooks/useLanguage';

interface MineScreenProps {
  onTap: () => Promise<boolean>;
  onBack: () => void;
  stamina: number;
  tutorialStep: number | null;
  multiplier: number;
  multiplierExpiresAt: string | null;
  onActivateMultiplier: (txHash: string) => Promise<boolean>;
  onApplyEnergyPack?: (packId: string, txHash: string) => Promise<boolean>;
  isGuest?: boolean;
  onSubmitScore: (gameId: string, score: number) => Promise<{ success: boolean; reward: number; energy: number; isHighScore: boolean } | null>;
  minigameScores: { game_id: string; high_score: number; total_plays: number; last_played_at: string }[];
  onFetchScores: () => Promise<void>;
  gamesHubData?: {
    games: {
      id: string; category: string; label: string; description: string; icon: string;
      difficulty: string; rewardResource: string; unlocked: boolean;
      playsToday: number; dailyPlayLimit: number; highScore: number; boostMultiplier: number;
    }[];
  } | null;
  onFetchGamesHub?: () => Promise<void>;
  t: (key: string) => string;
  language: Language;
}

export const MineScreen = ({ onTap, onBack, stamina, tutorialStep, multiplier, multiplierExpiresAt, onActivateMultiplier, onApplyEnergyPack, isGuest = false, onSubmitScore, minigameScores, onFetchScores, gamesHubData, onFetchGamesHub, t, language }: MineScreenProps) => {
  const highlight = tutorialStep !== null ? getTutorialHighlight(tutorialStep) : null;
  const [tonConnectUI] = useTonConnectUI();
  const [processingPackId, setProcessingPackId] = useState<string | null>(null);
  const [sessionTaps, setSessionTaps] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showGames, setShowGames] = useState(false);

  const isMultiplierActive = multiplier > 1 && multiplierExpiresAt && new Date(multiplierExpiresAt) > new Date();

  const handleMineTap = async () => {
    const success = await onTap();
    if (!success) return;
    setSessionTaps(value => value + 1);
    setCombo(value => (value >= 9 ? 0 : value + 1));
  };

  const handleBuyPack = async (packId: string, priceTon: string) => {
    if (isGuest) {
      toast.info(t('guest.buy_energy'));
      return;
    }
    if (processingPackId) return;
    setProcessingPackId(packId);
    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: DAO_WALLET_ADDRESS, amount: toNano(priceTon) }],
      });
      const txHash = result?.boc || '';
      if (onApplyEnergyPack && txHash) {
        const ok = await onApplyEnergyPack(packId, txHash);
        if (ok) toast.success(language === 'es' ? 'Energía inyectada con éxito!' : 'Energy injected successfully!');
        else toast.error(language === 'es' ? 'Verificación falló. Contacta soporte.' : 'Verification failed. Contact support.');
      } else if (!txHash) {
        toast.error(language === 'es' ? 'No se obtuvo el hash. Contacta soporte.' : 'No tx hash. Contact support.');
      } else {
        toast.success(language === 'es' ? 'Transacción enviada.' : 'Transaction sent.');
      }
    } catch {
      toast.error(language === 'es' ? 'Transacción cancelada o fallida' : 'Transaction cancelled or failed');
    } finally {
      setProcessingPackId(null);
    }
  };

  const handleBuyMultiplier = async (packId: string, priceTon: string) => {
    if (isGuest) {
      toast.info(t('guest.buy_boost'));
      return;
    }
    if (processingPackId) return;
    setProcessingPackId(packId);
    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: DAO_WALLET_ADDRESS, amount: toNano(priceTon) }],
      });
      const txHash = result?.boc || '';
      if (!txHash) {
        toast.error(language === 'es' ? 'No se obtuvo el hash. Contacta soporte.' : 'No tx hash. Contact support.');
        return;
      }
      const ok = await onActivateMultiplier(txHash);
      if (ok) toast.success(language === 'es' ? 'Boost activado! 2x durante 24h' : 'Boost activated! 2x for 24h');
      else toast.error(language === 'es' ? 'No se pudo activar. Contacta soporte.' : 'Could not activate. Contact support.');
    } catch {
      toast.error(language === 'es' ? 'Transacción cancelada o fallida' : 'Transaction cancelled or failed');
    } finally {
      setProcessingPackId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center relative overflow-y-auto pb-24"
    >
      {/* Top bar: Back + Wallet — positioned below stamina bar */}
      <div className="w-full flex items-center justify-between px-3 pt-16 z-10">
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors bg-card/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-muted/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display text-[11px]">{t('mine.back')}</span>
        </motion.button>

        <div className="bg-card/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-muted/20">
          <TonConnectButton />
        </div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-3 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Pickaxe className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-primary text-glow">
            {t('mine.title')}
          </h1>
        </div>
        <p className="font-body text-[11px] text-muted-foreground mt-0.5">
          {t('mine.subtitle')}
        </p>
        {isMultiplierActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-secondary/20 border border-secondary/40"
          >
            <Star className="w-3 h-3 text-secondary" />
            <span className="font-display text-[10px] text-secondary text-glow-gold">{multiplier}x ACTIVE</span>
          </motion.div>
        )}
      </motion.div>

      {/* Toroid */}
      <div className="flex-shrink-0 my-3">
        <Toroid
          onTap={handleMineTap}
          stamina={stamina}
          isHighlighted={highlight === 'toroid'}
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-xs mb-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2"
      >
        <div className="flex items-center justify-between font-display text-[10px]">
          <span className="text-primary">{t('mine.challenge')}</span>
          <span className="text-secondary">{sessionTaps}/30</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-background/80 overflow-hidden">
          <motion.div animate={{ width: `${Math.min(100, sessionTaps / 30 * 100)}%` }} className="h-full rounded-full bg-primary" />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {sessionTaps >= 30 ? t('mine.challenge_done') : t('mine.challenge_todo')}
        </p>
      </motion.div>

      {combo > 1 && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-3 font-display text-xs text-secondary text-glow-gold">
          COMBO x{combo}
        </motion.div>
      )}

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center font-body text-xs text-muted-foreground px-8 mb-4"
      >
        {stamina > 0 ? t('mine.tap_instruction') : t('mine.no_stamina')}
      </motion.p>

      {/* Games Arena — prominent section before energy store */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs mb-4"
      >
        <motion.button
          onClick={() => setShowGames(true)}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 hover:border-primary/60 transition-all relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-20 opacity-5">
            <Gamepad2 className="w-full h-full" />
          </div>
          <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 relative z-10">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 text-left relative z-10">
            <h3 className="font-display text-base font-bold text-primary text-glow">{t('mine.games_title')}</h3>
            <p className="font-body text-[10px] text-muted-foreground">{t('mine.games_desc')}</p>
            <div className="flex gap-1 mt-1.5">
              {['Memory', 'Reaction', 'Asteroid', 'Core Drill', 'Tower Defense', 'Tech Puzzle'].map(g => (
                <span key={g} className="text-[7px] font-body text-primary/60 px-1 py-0.5 rounded bg-primary/10">{g}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 relative z-10">
            <span className="font-display text-[10px] font-bold text-primary text-glow px-3 py-1 rounded-lg bg-primary/20 border border-primary/40">{t('mine.games_play')}</span>
            <span className="text-[8px] text-muted-foreground">FREE</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Energy Pack Store */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full px-4 space-y-3"
      >
        <h2 className="font-display text-sm font-bold text-secondary text-glow-gold text-center">
          {t('mine.energy_store')}
        </h2>
        {isGuest && (
          <p className="text-center font-body text-[10px] text-muted-foreground">
            {t('mine.guest_hint')}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_PACKS.map((pack) => (
            <motion.button
              key={pack.id}
              onClick={() => handleBuyPack(pack.id, pack.priceTon)}
              disabled={processingPackId !== null}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200
                ${pack.featured
                  ? 'border-secondary/60 bg-secondary/5 hover:bg-secondary/10 relative'
                  : 'border-secondary/30 bg-card/80 hover:border-secondary/60 hover:bg-secondary/5'
                } ${processingPackId === pack.id ? 'opacity-50' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              {pack.featured && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-display font-bold text-background bg-secondary px-2 py-0.5 rounded-full">
                  BEST VALUE
                </span>
              )}
              <Zap className={`w-5 h-5 ${pack.featured ? 'text-secondary' : 'text-secondary/70'}`} />
              <span className="font-display text-[10px] font-bold text-secondary text-glow-gold">
                {pack.name}
              </span>
              <span className="font-body text-[10px] text-muted-foreground">
                +{pack.staminaGain.toLocaleString()}
              </span>
              <span className="font-display text-xs font-bold text-foreground">
                {processingPackId === pack.id ? '...' : `${pack.priceTon} TON`}
              </span>
            </motion.button>
          ))}
        </div>

        {!isMultiplierActive && (
          <>
            <h2 className="font-display text-sm font-bold text-primary text-glow text-center mt-4">
              {t('mine.boost')}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {MULTIPLIER_PACKS.map((pack) => (
                <motion.button
                  key={pack.id}
                  onClick={() => handleBuyMultiplier(pack.id, pack.priceTon)}
                  disabled={processingPackId !== null}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all duration-200 ${processingPackId === pack.id ? 'opacity-50' : ''}`}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <span className="font-display text-sm font-bold text-primary text-glow block">
                        {pack.name}
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pack.durationHours}h · {t('mine.boost_desc')}
                      </span>
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-foreground">
                    {pack.priceTon} TON
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>

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

      {showGames && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          <div className="px-4 py-3 flex items-center gap-2 border-b border-primary/20 bg-card/80 backdrop-blur-sm">
            <button
              onClick={() => setShowGames(false)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors bg-card/60 rounded-lg px-2.5 py-1.5 border border-muted/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-display text-[11px]">{t('mine.games_back')}</span>
            </button>
            <span className="font-display text-xs text-primary text-glow ml-1">{t('mine.games_back_hint')}</span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <MinigamesScreen
              onSubmitScore={onSubmitScore}
              minigameScores={minigameScores}
              onFetchScores={onFetchScores}
              gamesHubData={gamesHubData}
              onFetchGamesHub={onFetchGamesHub}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
