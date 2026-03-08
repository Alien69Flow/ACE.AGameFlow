import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Sparkles, Zap, Star, Clock } from 'lucide-react';

interface Prize {
  id: string;
  label: string;
  value: number;
  type: 'energy' | 'boost' | 'empty';
  color: string;
  weight: number;
}

const PRIZES: Prize[] = [
  { id: '1', label: '10', value: 10, type: 'energy', color: 'hsl(108, 100%, 54%)', weight: 25 },
  { id: '2', label: '25', value: 25, type: 'energy', color: 'hsl(120, 80%, 45%)', weight: 20 },
  { id: '3', label: '50', value: 50, type: 'energy', color: 'hsl(43, 74%, 52%)', weight: 15 },
  { id: '4', label: '100', value: 100, type: 'energy', color: 'hsl(35, 80%, 50%)', weight: 12 },
  { id: '5', label: '250', value: 250, type: 'energy', color: 'hsl(280, 70%, 50%)', weight: 8 },
  { id: '6', label: '2×', value: 2, type: 'boost', color: 'hsl(200, 100%, 50%)', weight: 5 },
  { id: '7', label: '500', value: 500, type: 'energy', color: 'hsl(0, 80%, 55%)', weight: 4 },
  { id: '8', label: '💀', value: 0, type: 'empty', color: 'hsl(0, 0%, 20%)', weight: 11 },
];

interface LuckyWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSpin: () => Promise<{ prize: { type: string; value: number; label: string } | null; canSpinFree: boolean; error?: string }>;
  canSpinFree: boolean;
}

export const LuckyWheel = ({ isOpen, onClose, onSpin, canSpinFree }: LuckyWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [localCanSpinFree, setLocalCanSpinFree] = useState(canSpinFree);

  const segmentAngle = 360 / PRIZES.length;

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    try {
      const response = await onSpin();
      
      if (response.error || !response.prize) {
        setIsSpinning(false);
        return;
      }

      // Find the prize index
      const prizeIndex = PRIZES.findIndex(p => p.label === response.prize!.label);
      if (prizeIndex === -1) {
        setIsSpinning(false);
        return;
      }

      // Calculate rotation: multiple full spins + landing on prize segment
      const fullSpins = 5 + Math.floor(Math.random() * 3);
      const prizeAngle = prizeIndex * segmentAngle + segmentAngle / 2;
      const targetRotation = fullSpins * 360 + (360 - prizeAngle);
      
      setRotation(prev => prev + targetRotation);
      setLocalCanSpinFree(response.canSpinFree);

      // Show result after spin
      setTimeout(() => {
        setResult(PRIZES[prizeIndex]);
        setShowResult(true);
        setIsSpinning(false);
      }, 4000);
    } catch {
      setIsSpinning(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-sm mx-4"
        >
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-card/80 border border-primary/30 text-muted-foreground hover:text-foreground transition-colors z-10"
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Title */}
          <motion.div className="text-center mb-4">
            <h2 className="font-display text-xl font-bold text-secondary text-glow-gold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              RUEDA DE LA SUERTE
              <Sparkles className="w-5 h-5" />
            </h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {localCanSpinFree ? '¡Tienes 1 giro gratis hoy!' : 'Próximo giro gratis: mañana'}
            </p>
          </motion.div>

          {/* Wheel Container */}
          <div className="relative aspect-square">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -mt-1">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-secondary drop-shadow-lg" />
            </div>

            {/* Wheel */}
            <motion.div
              className="w-full h-full rounded-full border-4 border-secondary/60 shadow-[0_0_40px_hsl(43_74%_52%_/_0.3)] overflow-hidden"
              style={{ rotate: rotation }}
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {PRIZES.map((prize, index) => {
                  const startAngle = index * segmentAngle - 90;
                  const endAngle = startAngle + segmentAngle;
                  
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 100 + 100 * Math.cos(startRad);
                  const y1 = 100 + 100 * Math.sin(startRad);
                  const x2 = 100 + 100 * Math.cos(endRad);
                  const y2 = 100 + 100 * Math.sin(endRad);
                  
                  const largeArc = segmentAngle > 180 ? 1 : 0;
                  
                  const textAngle = startAngle + segmentAngle / 2;
                  const textRad = (textAngle * Math.PI) / 180;
                  const textX = 100 + 60 * Math.cos(textRad);
                  const textY = 100 + 60 * Math.sin(textRad);
                  
                  return (
                    <g key={prize.id}>
                      <path
                        d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                        fill={prize.color}
                        stroke="hsl(0, 0%, 10%)"
                        strokeWidth="1"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={prize.type === 'boost' ? '14' : '12'}
                        fontWeight="bold"
                        style={{ 
                          transform: `rotate(${textAngle + 90}deg)`,
                          transformOrigin: `${textX}px ${textY}px`,
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {prize.type === 'energy' && '⚡'}
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="18" fill="hsl(0, 0%, 5%)" stroke="hsl(43, 74%, 52%)" strokeWidth="3" />
                <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="hsl(43, 74%, 52%)" fontSize="16" fontWeight="bold">
                  🛸
                </text>
              </svg>
            </motion.div>
          </div>

          {/* Spin Button */}
          <motion.button
            onClick={handleSpin}
            disabled={isSpinning || !localCanSpinFree}
            className={`w-full mt-4 py-3 rounded-xl font-display text-base font-bold transition-all duration-200
              ${localCanSpinFree 
                ? 'bg-secondary/20 border-2 border-secondary text-secondary text-glow-gold hover:bg-secondary/30' 
                : 'bg-muted border border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
              } disabled:opacity-50`}
            whileTap={localCanSpinFree ? { scale: 0.97 } : {}}
          >
            {isSpinning ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                GIRANDO...
              </span>
            ) : localCanSpinFree ? (
              '🎰 GIRAR GRATIS'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                ESPERA HASTA MAÑANA
              </span>
            )}
          </motion.button>

          {/* Result Modal */}
          <AnimatePresence>
            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl"
              >
                <div className="text-center p-6">
                  {result.type === 'empty' ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-5xl mb-4"
                      >
                        💀
                      </motion.div>
                      <h3 className="font-display text-lg font-bold text-muted-foreground mb-2">
                        ¡MALA SUERTE!
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        Inténtalo de nuevo mañana
                      </p>
                    </>
                  ) : result.type === 'boost' ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <Star className="w-16 h-16 text-secondary mx-auto" />
                      </motion.div>
                      <h3 className="font-display text-xl font-bold text-secondary text-glow-gold mt-4 mb-2">
                        ¡BOOST {result.value}× ACTIVADO!
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        Doble energía por 1 hora
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Zap className="w-12 h-12 text-secondary" />
                        <span className="font-display text-4xl font-bold text-secondary text-glow-gold">
                          +{result.value}
                        </span>
                      </motion.div>
                      <h3 className="font-display text-lg font-bold text-primary text-glow mt-4 mb-2">
                        ¡ENERGÍA GANADA!
                      </h3>
                    </>
                  )}
                  <motion.button
                    onClick={handleCloseResult}
                    className="mt-4 px-6 py-2 rounded-xl bg-primary/20 border border-primary/40 font-display text-sm text-primary hover:bg-primary/30 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    CONTINUAR
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
