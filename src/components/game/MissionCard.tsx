import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExternalLink, Check, Loader2, Gift } from 'lucide-react';

interface MissionCardProps {
  id: string;
  name: string;
  icon: string;
  url: string;
  reward: number;
  startedAt: Date | null;
  claimed: boolean;
  onStart: () => void;
  onClaim: () => void;
  openLink: (url: string) => void;
}

export const MissionCard = ({
  id,
  name,
  icon,
  url,
  reward,
  startedAt,
  claimed,
  onStart,
  onClaim,
  openLink,
}: MissionCardProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (!startedAt || claimed) {
      setCountdown(null);
      setCanClaim(false);
      return;
    }

    const checkTime = () => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const remaining = 33 - elapsed;

      if (remaining <= 0) {
        setCountdown(null);
        setCanClaim(true);
      } else {
        setCountdown(remaining);
        setCanClaim(false);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [startedAt, claimed]);

  const handleClick = () => {
    if (claimed) return;

    if (canClaim) {
      onClaim();
    } else if (!startedAt) {
      onStart();
      openLink(url);
    }
  };

  const getButtonContent = () => {
    if (claimed) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Completado</span>
        </>
      );
    }
    if (canClaim) {
      return (
        <>
          <Gift className="w-4 h-4" />
          <span>Reclamar +{reward}</span>
        </>
      );
    }
    if (countdown !== null) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verificando... {countdown}s</span>
        </>
      );
    }
    return (
      <>
        <ExternalLink className="w-4 h-4" />
        <span>Ir a la misión</span>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-card border rounded-xl p-4 transition-all
        ${claimed 
          ? 'border-primary/30 opacity-60' 
          : canClaim 
            ? 'border-secondary box-glow-gold' 
            : 'border-border hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-foreground">
            {name}
          </h4>
          <p className="font-body text-xs text-secondary">
            +{reward} Energía
          </p>
        </div>

        {/* Action button */}
        <motion.button
          onClick={handleClick}
          disabled={claimed}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-display text-xs font-medium
            transition-colors
            ${claimed
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : canClaim
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }
          `}
          whileHover={!claimed ? { scale: 1.02 } : {}}
          whileTap={!claimed ? { scale: 0.98 } : {}}
        >
          {getButtonContent()}
        </motion.button>
      </div>
    </motion.div>
  );
};
