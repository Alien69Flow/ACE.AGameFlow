import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Trophy, Zap, ArrowLeft, Brain, Target, Rocket } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface MinigamesScreenProps {
  onSubmitScore: (gameId: string, score: number) => Promise<{ success: boolean; reward: number; energy: number; isHighScore: boolean } | null>;
  minigameScores: { game_id: string; high_score: number; total_plays: number; last_played_at: string }[];
  onFetchScores: () => Promise<void>;
}

type GameState = 'hub' | 'memory_match' | 'reaction_rush' | 'asteroid_blitz';

const GAME_INFO: Record<string, { icon: typeof Brain; label: string; description: string; color: string }> = {
  memory_match:   { icon: Brain,     label: 'Memory Match',   description: 'Encuentra los pares alienígenas',     color: 'text-primary' },
  reaction_rush:  { icon: Target,    label: 'Reaction Rush',  description: 'Toca los alienígenas lo más rápido posible', color: 'text-secondary' },
  asteroid_blitz: { icon: Rocket,    label: 'Asteroid Blitz', description: 'Destruye asteroides antes de que escapen',   color: 'text-primary' },
};

export const MinigamesScreen = ({ onSubmitScore, minigameScores, onFetchScores }: MinigamesScreenProps) => {
  const { hapticFeedback } = useTelegram();
  const [gameState, setGameState] = useState<GameState>('hub');
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    onFetchScores();
  }, [onFetchScores]);

  const handleSubmitScore = useCallback(async (gameId: string, score: number) => {
    setSubmitting(true);
    const result = await onSubmitScore(gameId, score);
    setSubmitting(false);
    if (result?.success) {
      hapticFeedback('medium');
      setLastReward(result.reward);
    }
    setGameState('hub');
    onFetchScores();
  }, [onSubmitScore, hapticFeedback, onFetchScores]);

  if (gameState === 'hub') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 overflow-y-auto pb-24 pt-2"
      >
        <div className="px-4 space-y-4">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <Gamepad2 className="w-10 h-10 text-primary mx-auto mb-2" />
            <h1 className="font-display text-xl font-bold text-primary text-glow">MINIGAMES</h1>
            <p className="font-body text-xs text-muted-foreground mt-1">Juega y gana energía extra</p>
            {lastReward !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30"
              >
                <Zap className="w-3 h-3 text-secondary" />
                <span className="font-display text-xs text-secondary">+{lastReward} energía</span>
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-3">
            {Object.entries(GAME_INFO).map(([id, info], index) => {
              const Icon = info.icon;
              const scoreEntry = minigameScores.find(s => s.game_id === id);
              return (
                <motion.button
                  key={id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setLastReward(null); setGameState(id as GameState); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-card/80 hover:bg-card/90 hover:border-primary/50 transition-all"
                >
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-display text-sm font-bold text-foreground">{info.label}</h3>
                    <p className="font-body text-xs text-muted-foreground">{info.description}</p>
                    {scoreEntry && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display text-[10px] text-secondary flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Récord: {scoreEntry.high_score}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground">
                          {scoreEntry.total_plays} jugadas
                        </span>
                      </div>
                    )}
                  </div>
                  <Trophy className="w-4 h-4 text-muted-foreground/40" />
                </motion.button>
              );
            })}
          </div>
          {submitting && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 font-display text-xs text-primary">Guardando...</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
      <div className="px-4 py-2 flex items-center gap-2">
        <button onClick={() => setGameState('hub')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display text-xs">Volver</span>
        </button>
      </div>
      {gameState === 'memory_match' && <MemoryMatchGame onEnd={handleSubmitScore} />}
      {gameState === 'reaction_rush' && <ReactionRushGame onEnd={handleSubmitScore} />}
      {gameState === 'asteroid_blitz' && <AsteroidBlitzGame onEnd={handleSubmitScore} />}
    </motion.div>
  );
};

// ===================== MEMORY MATCH =====================
function MemoryMatchGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const emojis = ['👽', '🛸', '🌌', '👾', '🚀', '⭐'];
  const [cards, setCards] = useState<{ emoji: string; id: number; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({
      emoji, id: i, flipped: false, matched: false,
    }));
    setCards(deck);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 || matches === emojis.length) {
      const score = matches * 10 + Math.max(0, timeLeft * 2) - moves;
      onEnd('memory_match', Math.max(0, score));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, matches, moves, onEnd]);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[a].matched = true;
            updated[b].matched = true;
            return updated;
          });
          setMatches(m => m + 1);
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[a].flipped = false;
            updated[b].flipped = false;
            return updated;
          });
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-4 mb-3 font-display text-xs">
        <span className="text-primary">Pares: {matches}/{emojis.length}</span>
        <span className="text-secondary">Tiempo: {timeLeft}s</span>
        <span className="text-muted-foreground">Mov: {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-lg flex items-center justify-center text-2xl border-2 transition-all ${
              card.flipped || card.matched
                ? 'bg-card/90 border-primary/50'
                : 'bg-card/40 border-muted/20 hover:border-primary/30'
            } ${card.matched ? 'opacity-50' : ''}`}
          >
            {(card.flipped || card.matched) ? card.emoji : ''}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===================== REACTION RUSH =====================
function ReactionRushGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [misses, setMisses] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd('reaction_rush', Math.max(0, score - misses * 5));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, misses, onEnd]);

  useEffect(() => {
    spawnTarget();
  }, []);

  const spawnTarget = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = 10 + Math.random() * (rect.width - 70);
    const y = 10 + Math.random() * (rect.height - 70);
    setTarget({ x, y });
  };

  const handleHit = () => {
    setScore(s => s + 10);
    spawnTarget();
  };

  const handleMiss = () => {
    setMisses(m => m + 1);
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-4 mb-3 font-display text-xs">
        <span className="text-primary">Puntos: {score}</span>
        <span className="text-secondary">Tiempo: {timeLeft}s</span>
        <span className="text-muted-foreground">Miss: {misses}</span>
      </div>
      <div
        ref={containerRef}
        onClick={handleMiss}
        className="relative w-full max-w-sm flex-1 rounded-xl border border-primary/20 bg-card/40 min-h-[400px]"
      >
        {target && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={(e) => { e.stopPropagation(); handleHit(); }}
            style={{ position: 'absolute', left: target.x, top: target.y }}
            className="w-12 h-12 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center"
          >
            <span className="text-xl">👽</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ===================== ASTEROID BLITZ =====================
function AsteroidBlitzGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number; speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd('asteroid_blitz', score);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, onEnd]);

  useEffect(() => {
    const spawn = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.random() * (rect.width - 40);
      setAsteroids(prev => [...prev, { id: idRef.current++, x, y: -20, speed: 1 + Math.random() * 2 }]);
    }, 1000);

    const move = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAsteroids(prev => {
        const moved = prev.map(a => ({ ...a, y: a.y + a.speed }));
        const escaped = moved.filter(a => a.y > rect.height);
        if (escaped.length > 0) {
          setScore(s => Math.max(0, s - escaped.length * 3));
        }
        return moved.filter(a => a.y <= rect.height);
      });
    }, 50);

    return () => { clearInterval(spawn); clearInterval(move); };
  }, []);

  const handleHit = (id: number) => {
    setAsteroids(prev => prev.filter(a => a.id !== id));
    setScore(s => s + 5);
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-4 mb-3 font-display text-xs">
        <span className="text-primary">Puntos: {score}</span>
        <span className="text-secondary">Tiempo: {timeLeft}s</span>
      </div>
      <div
        ref={containerRef}
        className="relative w-full max-w-sm flex-1 rounded-xl border border-primary/20 bg-card/40 overflow-hidden min-h-[400px]"
      >
        {asteroids.map(a => (
          <motion.button
            key={a.id}
            style={{ position: 'absolute', left: a.x, top: a.y }}
            whileTap={{ scale: 0.5 }}
            onClick={() => handleHit(a.id)}
            className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center"
          >
            <span className="text-sm">☄️</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
