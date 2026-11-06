import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ArenaBattleResult } from '@/hooks/useGameState';

interface ArenaModalProps {
  onBattle: () => Promise<ArenaBattleResult | null>;
  onClose: () => void;
}

export const ArenaModal = ({ onBattle, onClose }: ArenaModalProps) => {
  const [fighting, setFighting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<ArenaBattleResult | null>(null);

  const handleBattle = async () => {
    setFighting(true);
    setFailed(false);
    const data = await onBattle();
    if (data) {
      setResult(data);
    } else {
      setFailed(true);
    }
    setFighting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-secondary/40 rounded-2xl p-6 w-full max-w-sm text-center space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-secondary">ARENA</h2>

        {!result && (
          <p className="font-body text-xs text-muted-foreground">
            Tu mazo lucha contra un mazo rival. Ganar da más energía que perder.
          </p>
        )}

        {result && (
          <div className="space-y-3">
            <p className={`font-display text-xl font-bold ${result.won ? 'text-primary' : 'text-destructive'}`}>
              {result.won ? '¡VICTORIA!' : 'DERROTA'}
            </p>
            <p className="font-body text-sm text-foreground">
              Recompensa: <span className="text-secondary font-bold">+{result.reward} energía</span>
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Tu mazo: {result.playerDeck.join(', ')}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Mazo rival: {result.botDeck.join(', ')}
            </p>
            <ul className="max-h-40 overflow-y-auto text-left font-body text-xs text-muted-foreground space-y-1">
              {result.log.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
            <p className="font-body text-xs text-muted-foreground">
              Batallas restantes hoy: {result.battlesLeft}
            </p>
          </div>
        )}

        {failed && (
          <p className="font-body text-xs text-destructive">No se pudo completar la batalla. Inténtalo de nuevo.</p>
        )}

        <motion.button
          onClick={handleBattle}
          disabled={fighting || result?.battlesLeft === 0}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 rounded-xl bg-secondary/20 border-2 border-secondary font-display text-sm font-bold text-secondary hover:bg-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fighting ? 'COMBATIENDO...' : result ? 'COMBATIR DE NUEVO' : 'COMBATIR'}
        </motion.button>

        <button onClick={onClose} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
};
