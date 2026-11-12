import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Trophy, Zap, ArrowLeft, Brain, Target, Rocket, Pickaxe, Timer, Flame, Award } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface MinigamesScreenProps {
  onSubmitScore: (gameId: string, score: number) => Promise<{ success: boolean; reward: number; energy: number; isHighScore: boolean } | null>;
  minigameScores: { game_id: string; high_score: number; total_plays: number; last_played_at: string }[];
  onFetchScores: () => Promise<void>;
}

type GameState = 'hub' | 'memory_match' | 'reaction_rush' | 'asteroid_blitz' | 'core_drill';

const GAME_INFO: Record<string, { icon: typeof Brain; label: string; description: string; color: string; accent: string; difficulty: string }> = {
  memory_match:   { icon: Brain,     label: 'Memory Match',   description: 'Encuentra los pares alienígenas',     color: 'text-primary',   accent: 'from-primary/20 to-primary/5',     difficulty: 'Fácil' },
  reaction_rush:  { icon: Target,    label: 'Reaction Rush',  description: 'Toca los alienígenas lo más rápido posible', color: 'text-secondary', accent: 'from-secondary/20 to-secondary/5', difficulty: 'Medio' },
  asteroid_blitz: { icon: Rocket,    label: 'Asteroid Blitz', description: 'Destruye asteroides antes de que escapen',   color: 'text-primary',   accent: 'from-primary/20 to-primary/5',     difficulty: 'Difícil' },
  core_drill:     { icon: Pickaxe,   label: 'Core Drill',     description: 'Extrae vetas de energía antes de que se agoten', color: 'text-secondary', accent: 'from-secondary/20 to-secondary/5', difficulty: 'Medio' },
};

export const MinigamesScreen = ({ onSubmitScore, minigameScores, onFetchScores }: MinigamesScreenProps) => {
  const { hapticFeedback } = useTelegram();
  const [gameState, setGameState] = useState<GameState>('hub');
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [lastHighScore, setLastHighScore] = useState(false);
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
      setLastHighScore(result.isHighScore);
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
            <Gamepad2 className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="font-display text-2xl font-bold text-primary text-glow">ARENA DE JUEGOS</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Juega y gana energía extra</p>
            {lastReward !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/30"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="font-display text-lg font-bold text-secondary text-glow-gold">+{lastReward} energía</span>
                </div>
                {lastHighScore && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-primary" />
                    <span className="font-display text-[10px] text-primary text-glow">¡NUEVO RÉCORD!</span>
                  </div>
                )}
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
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setLastReward(null); setLastHighScore(false); setGameState(id as GameState); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-primary/20 bg-gradient-to-br ${info.accent} hover:border-primary/50 transition-all relative overflow-hidden`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-24 opacity-5">
                    <Icon className="w-full h-full" />
                  </div>
                  <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm relative z-10">
                    <Icon className={`w-7 h-7 ${info.color}`} />
                  </div>
                  <div className="flex-1 text-left relative z-10">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">{info.label}</h3>
                      <span className="font-body text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-card/60 border border-muted/20">
                        {info.difficulty}
                      </span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{info.description}</p>
                    {scoreEntry && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="font-display text-[10px] text-secondary flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> {scoreEntry.high_score}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <Gamepad2 className="w-3 h-3" /> {scoreEntry.total_plays}
                        </span>
                      </div>
                    )}
                  </div>
                  <Trophy className="w-5 h-5 text-muted-foreground/30 relative z-10" />
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
        <span className="font-display text-xs text-primary text-glow ml-2">{GAME_INFO[gameState]?.label}</span>
      </div>
      {gameState === 'memory_match' && <MemoryMatchGame onEnd={handleSubmitScore} />}
      {gameState === 'reaction_rush' && <ReactionRushGame onEnd={handleSubmitScore} />}
      {gameState === 'asteroid_blitz' && <AsteroidBlitzGame onEnd={handleSubmitScore} />}
      {gameState === 'core_drill' && <CoreDrillGame onEnd={handleSubmitScore} />}
    </motion.div>
  );
};

// ===================== MEMORY MATCH =====================
const MEMORY_EMOJIS = ['👽', '🛸', '🌌', '👾', '🚀', '⭐'];

function MemoryMatchGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [cards, setCards] = useState<{ emoji: string; id: number; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const deck = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5).map((emoji, i) => ({
      emoji, id: i, flipped: false, matched: false,
    }));
    setCards(deck);
  }, []);

  useEffect(() => {
    if (ended) return;
    if (timeLeft <= 0 || matches === MEMORY_EMOJIS.length) {
      setEnded(true);
      const comboBonus = combo * 5;
      const score = matches * 10 + Math.max(0, timeLeft * 2) - moves + comboBonus;
      onEnd('memory_match', Math.max(0, score));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, matches, moves, combo, ended, onEnd]);

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
          setCombo(c => c + 1);
          setFlipped([]);
        }, 400);
      } else {
        setCombo(0);
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
      <div className="flex gap-3 mb-3">
        <StatChip icon={<Brain className="w-3 h-3" />} label="Pares" value={`${matches}/${MEMORY_EMOJIS.length}`} color="primary" />
        <StatChip icon={<Timer className="w-3 h-3" />} label="Tiempo" value={`${timeLeft}s`} color="secondary" />
        <StatChip icon={<Target className="w-3 h-3" />} label="Mov" value={moves} color="muted" />
      </div>
      {combo >= 2 && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-2">
          <span className="font-display text-xs text-secondary text-glow-gold flex items-center gap-1">
            <Flame className="w-3 h-3" /> COMBO x{combo}
          </span>
        </motion.div>
      )}
      <div className="grid grid-cols-4 gap-2 max-w-xs">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ rotateY: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-card/90 border-primary/60 shadow-lg shadow-primary/10'
                : 'bg-card/40 border-muted/20 hover:border-primary/30'
            } ${card.matched ? 'opacity-40 scale-90' : ''}`}
          >
            <AnimatePresence>
              {(card.flipped || card.matched) && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {card.emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===================== REACTION RUSH =====================
function ReactionRushGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [target, setTarget] = useState<{ x: number; y: number; type: 'alien' | 'bomb'; size: number } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<'hit' | 'bomb' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    if (endedRef.current) return;
    if (timeLeft <= 0) {
      endedRef.current = true;
      onEnd('reaction_rush', Math.max(0, score - misses * 5 + combo * 3));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, misses, combo, onEnd]);

  const spawnTarget = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = 10 + Math.random() * (rect.width - 70);
    const y = 10 + Math.random() * (rect.height - 70);
    const type: 'alien' | 'bomb' = Math.random() < 0.2 ? 'bomb' : 'alien';
    const size = type === 'bomb' ? 44 : 36 + Math.random() * 16;
    setTarget({ x, y, type, size });
  }, []);

  useEffect(() => {
    spawnTarget();
    const spawnInterval = setInterval(spawnTarget, 1200);
    return () => clearInterval(spawnInterval);
  }, [spawnTarget]);

  const handleHit = (type: 'alien' | 'bomb') => {
    if (type === 'alien') {
      const points = 10 + combo * 2;
      setScore(s => s + points);
      setCombo(c => c + 1);
      setFlash('hit');
      setTimeout(() => setFlash(null), 200);
    } else {
      setScore(s => Math.max(0, s - 15));
      setMisses(m => m + 1);
      setCombo(0);
      setFlash('bomb');
      setTimeout(() => setFlash(null), 300);
    }
    spawnTarget();
  };

  const handleMiss = () => {
    setMisses(m => m + 1);
    setCombo(0);
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-3 mb-3">
        <StatChip icon={<Target className="w-3 h-3" />} label="Puntos" value={score} color="primary" />
        <StatChip icon={<Timer className="w-3 h-3" />} label="Tiempo" value={`${timeLeft}s`} color="secondary" />
        <StatChip icon={<Flame className="w-3 h-3" />} label="Combo" value={`x${combo}`} color="muted" />
      </div>
      <div
        ref={containerRef}
        onClick={handleMiss}
        className={`relative w-full max-w-sm flex-1 rounded-2xl border-2 bg-gradient-to-b from-card/60 to-card/30 min-h-[400px] overflow-hidden transition-all duration-150 ${
          flash === 'hit' ? 'border-primary ring-4 ring-primary/20' : flash === 'bomb' ? 'border-red-500 ring-4 ring-red-500/20' : 'border-primary/20'
        }`}
      >
        {target && (
          <motion.button
            key={`${target.x}-${target.y}-${target.type}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => { e.stopPropagation(); handleHit(target.type); }}
            style={{ position: 'absolute', left: target.x, top: target.y, width: target.size, height: target.size }}
            className={`rounded-full flex items-center justify-center border-2 ${
              target.type === 'alien'
                ? 'bg-primary/30 border-primary shadow-lg shadow-primary/30'
                : 'bg-red-500/30 border-red-500 shadow-lg shadow-red-500/30'
            }`}
          >
            <span className="text-xl">{target.type === 'alien' ? '👽' : '💣'}</span>
          </motion.button>
        )}
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <span className="font-body text-[10px] text-muted-foreground/60">
            Evita las bombas — toca solo alienígenas
          </span>
        </div>
      </div>
    </div>
  );
}

// ===================== ASTEROID BLITZ =====================
function AsteroidBlitzGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number; speed: number; size: number; hp: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const explosionIdRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    if (endedRef.current) return;
    if (timeLeft <= 0) {
      endedRef.current = true;
      onEnd('asteroid_blitz', score + combo * 5);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, combo, onEnd]);

  useEffect(() => {
    const spawn = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.random() * (rect.width - 50);
      const size = 24 + Math.random() * 20;
      const hp = size > 36 ? 2 : 1;
      setAsteroids(prev => [...prev, { id: idRef.current++, x, y: -30, speed: 0.8 + Math.random() * 2.2, size, hp }]);
    }, 800);
    return () => clearInterval(spawn);
  }, []);

  useEffect(() => {
    const move = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAsteroids(prev => {
        const moved = prev.map(a => ({ ...a, y: a.y + a.speed }));
        const escaped = moved.filter(a => a.y > rect.height);
        if (escaped.length > 0) {
          setScore(s => Math.max(0, s - escaped.length * 3));
          setCombo(0);
        }
        return moved.filter(a => a.y <= rect.height);
      });
    }, 40);
    return () => clearInterval(move);
  }, []);

  const handleHit = (id: number, x: number, y: number) => {
    setAsteroids(prev => {
      const ast = prev.find(a => a.id === id);
      if (!ast) return prev;
      if (ast.hp > 1) {
        return prev.map(a => a.id === id ? { ...a, hp: a.hp - 1, size: a.size * 0.7 } : a);
      }
      const points = Math.floor(ast.size / 10) * 5 + combo * 2;
      setScore(s => s + points);
      setCombo(c => c + 1);
      const expId = explosionIdRef.current++;
      setExplosions(e => [...e, { id: expId, x, y }]);
      setTimeout(() => setExplosions(e => e.filter(ex => ex.id !== expId)), 500);
      return prev.filter(a => a.id !== id);
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-3 mb-3">
        <StatChip icon={<Rocket className="w-3 h-3" />} label="Puntos" value={score} color="primary" />
        <StatChip icon={<Timer className="w-3 h-3" />} label="Tiempo" value={`${timeLeft}s`} color="secondary" />
        <StatChip icon={<Flame className="w-3 h-3" />} label="Combo" value={`x${combo}`} color="muted" />
      </div>
      <div
        ref={containerRef}
        className="relative w-full max-w-sm flex-1 rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-background/80 to-card/40 overflow-hidden min-h-[400px]"
      >
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8,
            }} />
          ))}
        </div>
        {asteroids.map(a => (
          <motion.button
            key={a.id}
            style={{ position: 'absolute', left: a.x, top: a.y, width: a.size, height: a.size }}
            whileTap={{ scale: 0.6 }}
            onClick={(e) => {
              e.stopPropagation();
              handleHit(a.id, a.x + a.size / 2, a.y + a.size / 2);
            }}
            className={`rounded-full flex items-center justify-center border-2 transition-all ${
              a.hp > 1
                ? 'bg-orange-500/30 border-orange-500'
                : 'bg-secondary/20 border-secondary/50'
            }`}
          >
            <span style={{ fontSize: a.size * 0.5 }}>☄️</span>
          </motion.button>
        ))}
        {explosions.map(exp => (
          <motion.div
            key={exp.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', left: exp.x - 15, top: exp.y - 15 }}
            className="w-8 h-8 rounded-full bg-secondary/40 border-2 border-secondary pointer-events-none"
          />
        ))}
        {combo >= 3 && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="font-display text-xs text-secondary text-glow-gold flex items-center gap-1">
              <Flame className="w-3 h-3" /> x{combo}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== CORE DRILL =====================
const VEIN_TYPES = [
  { color: 'bg-secondary/30 border-secondary', glow: 'shadow-secondary/30', points: 10, emoji: '💎', label: 'Veta Rica' },
  { color: 'bg-primary/30 border-primary', glow: 'shadow-primary/30', points: 5, emoji: '⛏', label: 'Veta Normal' },
  { color: 'bg-amber-500/30 border-amber-500', glow: 'shadow-amber-500/30', points: 20, emoji: '🌟', label: 'Veta Rara' },
];

function CoreDrillGame({ onEnd }: { onEnd: (gameId: string, score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [vein, setVein] = useState<{ x: number; y: number; typeIndex: number }>({ x: 50, y: 50, typeIndex: 1 });
  const [combo, setCombo] = useState(0);
  const [pop, setPop] = useState<{ id: number; x: number; y: number; value: number } | null>(null);
  const popIdRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    if (endedRef.current) return;
    if (timeLeft <= 0) {
      endedRef.current = true;
      onEnd('core_drill', score + combo * 3);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, combo, onEnd]);

  const mine = () => {
    const veinType = VEIN_TYPES[vein.typeIndex];
    const points = veinType.points + combo * 2;
    setScore(value => value + points);
    setCombo(c => c + 1);
    const newTypeIndex = Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 0 : 1;
    setVein({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 70, typeIndex: newTypeIndex });
    const id = popIdRef.current++;
    setPop({ id, x: vein.x, y: vein.y, value: points });
    setTimeout(() => setPop(null), 600);
  };

  const currentVein = VEIN_TYPES[vein.typeIndex];

  return (
    <div className="flex-1 flex flex-col items-center px-4">
      <div className="flex gap-3 mb-3">
        <StatChip icon={<Pickaxe className="w-3 h-3" />} label="Energía" value={score} color="secondary" />
        <StatChip icon={<Timer className="w-3 h-3" />} label="Tiempo" value={`${timeLeft}s`} color="primary" />
        <StatChip icon={<Flame className="w-3 h-3" />} label="Combo" value={`x${combo}`} color="muted" />
      </div>
      <div className="relative w-full max-w-sm flex-1 min-h-[400px] rounded-2xl border-2 border-secondary/30 bg-gradient-to-b from-card/60 to-background/40 overflow-hidden">
        {/* Cave texture background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-secondary/20" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 12}px`,
              height: `${4 + Math.random() * 12}px`,
            }} />
          ))}
        </div>

        <motion.button
          key={`${vein.x}-${vein.y}-${vein.typeIndex}`}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0, left: `${vein.x}%`, top: `${vein.y}%` }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          whileTap={{ scale: 0.7 }}
          onClick={mine}
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border-2 ${currentVein.color} ${currentVein.glow} shadow-lg flex items-center justify-center text-2xl`}
        >
          {currentVein.emoji}
        </motion.button>

        {pop && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1, y: 0 }}
            animate={{ scale: 1.5, opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'absolute', left: `${pop.x}%`, top: `${pop.y}%` }}
            className="pointer-events-none -translate-x-1/2 -translate-y-1/2 font-display text-lg font-bold text-secondary text-glow-gold"
          >
            +{pop.value}
          </motion.div>
        )}

        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="font-display text-[10px] text-secondary/80">{currentVein.label}</span>
        </div>
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <p className="font-body text-[10px] text-muted-foreground/60">
            Las vetas raras dan más energía — no dejes que se escape el combo
          </p>
        </div>
      </div>
    </div>
  );
}

// ===================== SHARED UI =====================
function StatChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: 'primary' | 'secondary' | 'muted' }) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-secondary' : 'text-muted-foreground';
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-card/60 border border-muted/20">
      <span className={`font-display text-sm font-bold ${colorClass} flex items-center gap-1`}>
        {icon} {value}
      </span>
      <span className="font-body text-[8px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
