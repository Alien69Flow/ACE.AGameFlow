import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CoreMineScene } from '@/components/game/CoreMineScene';

interface ToroidProps {
  onTap: () => Promise<boolean>;
  stamina: number;
  isHighlighted?: boolean;
}

class ToroidErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Toroid 3D render failed:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export const Toroid = ({ onTap, stamina, isHighlighted }: ToroidProps) => {
  const canTap = stamina > 0;

  const fallback = (
    <div className="w-full h-full flex items-center justify-center">
      <button
        onClick={() => { if (canTap) onTap(); }}
        disabled={!canTap}
        className="w-40 h-40 rounded-full border-4 border-[#39FF14] flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(92,255,42,0.15) 0%, rgba(45,55,72,0.8) 70%)',
          boxShadow: canTap ? '0 0 30px rgba(92,255,42,0.4)' : 'none',
        }}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">⛏️</div>
          <div className="text-[10px] text-[#39FF14] font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {canTap ? 'TAP' : 'SIN STAMINA'}
          </div>
        </div>
      </button>
    </div>
  );

  return (
    <div className={`relative flex items-center justify-center w-80 h-80 ${isHighlighted ? 'z-50' : ''}`}>
      <motion.div
        className="absolute w-80 h-80 rounded-full border border-primary/20 pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={`relative w-72 h-72 transition-opacity duration-300 ${!canTap ? 'opacity-50 saturate-0' : ''}`}>
        <ToroidErrorBoundary fallback={fallback}>
          <CoreMineScene onTap={onTap} canTap={canTap} />
        </ToroidErrorBoundary>
      </div>

      {isHighlighted && (
        <motion.div
          className="absolute w-72 h-72 rounded-full border-4 border-primary pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};
