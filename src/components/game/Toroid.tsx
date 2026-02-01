import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface ToroidProps {
  onTap: () => Promise<boolean>;
  stamina: number;
  isHighlighted?: boolean;
}

export const Toroid = ({ onTap, stamina, isHighlighted }: ToroidProps) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleTap = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    if (stamina <= 0) return;

    const success = await onTap();
    if (!success) return;

    // Add ripple effect
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    // Pulse effect
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 150);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [onTap, stamina]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-80 h-80 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full border border-primary/30"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Toroid container */}
      <motion.button
        onClick={handleTap}
        disabled={stamina <= 0}
        className={`
          relative w-56 h-56 rounded-full overflow-hidden
          ${stamina <= 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isHighlighted ? 'z-50' : ''}
        `}
        whileTap={stamina > 0 ? { scale: 0.95 } : {}}
        animate={isPulsing ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card rounded-full" />
        
        {/* Toroid SVG */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full"
        >
          {/* Outer torus */}
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="40"
            fill="none"
            stroke="hsl(108 100% 54%)"
            strokeWidth="3"
            opacity="0.8"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="60"
            ry="30"
            fill="none"
            stroke="hsl(108 100% 54%)"
            strokeWidth="2"
            opacity="0.6"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="40"
            ry="20"
            fill="none"
            stroke="hsl(108 100% 54%)"
            strokeWidth="2"
            opacity="0.4"
          />
          
          {/* Central vortex */}
          <motion.circle
            cx="100"
            cy="100"
            r="25"
            fill="url(#vortexGradient)"
            animate={{
              r: [25, 28, 25],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="vortexGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(108 100% 60%)" />
              <stop offset="50%" stopColor="hsl(108 100% 40%)" />
              <stop offset="100%" stopColor="hsl(108 100% 20%)" />
            </radialGradient>
          </defs>
        </svg>

        {/* Rotating energy flow */}
        <motion.div
          className="absolute inset-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{
                left: `${50 + 35 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                top: `${50 + 35 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>

        {/* Inner particles */}
        <motion.div
          className="absolute inset-8"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-neon-glow"
              style={{
                left: `${50 + 25 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                top: `${50 + 25 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>

        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute w-4 h-4 rounded-full bg-primary/50"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 10, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>

        {/* Highlight ring for tutorial */}
        {isHighlighted && (
          <motion.div
            className="absolute -inset-4 rounded-full border-4 border-primary"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>

      {/* Energy burst on tap */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-64 h-64 rounded-full border-2 border-primary"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
