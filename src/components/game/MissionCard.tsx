import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExternalLink, Check, Loader2, Gift, ShieldCheck, AlertCircle } from 'lucide-react';

interface MissionCardProps {
  id: string;
  name: string;
  icon: string;
  url: string;
  reward: number;
  startedAt: Date | null;
  claimed: boolean;
  verifiable?: boolean;
  verifyType?: string | null;
  onStart: () => void;
  onClaim: () => void;
  onVerify?: () => Promise<{ verified: boolean; error?: string } | null>;
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
  verifiable = false,
  verifyType,
  onStart,
  onClaim,
  onVerify,
  openLink,
}: MissionCardProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!startedAt || claimed) {
      setCountdown(null);
      setCanClaim(false);
      return;
    }

    // For verifiable missions, don't use countdown — use verify button
    if (verifiable) {
      setCanClaim(verified);
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
  }, [startedAt, claimed, verifiable, verified]);

  const handleClick = () => {
    if (claimed) return;

    if (canClaim) {
      onClaim();
    } else if (!startedAt) {
      onStart();
      openLink(url);
    }
  };

  const handleVerify = async () => {
    if (!onVerify) return;
    setVerifying(true);
    setVerifyError(null);
    const result = await onVerify();
    if (result?.verified) {
      setVerified(true);
      setCanClaim(true);
    } else {
      setVerifyError(result?.error || 'No verificado. ¿Ya te uniste?');
    }
    setVerifying(false);
  };

  const isXMission = verifyType === 'x_follow';
  const isTelegramVerifiable = verifiable && !isXMission;

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
            : verifiable && !claimed
              ? 'border-primary/50'
              : 'border-border hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl relative">
          {icon}
          {verifiable && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
            {name}
            {verifiable && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                {isXMission ? 'PRÓXIMAMENTE' : 'AUTO-VERIFY'}
              </span>
            )}
          </h4>
          <p className="font-body text-xs text-secondary">
            +{reward} Energía {verifiable && <span className="text-[9px] text-primary">(2× bonus)</span>}
          </p>
        </div>

        {/* Action button */}
        <motion.button
          onClick={handleClick}
          disabled={claimed || (verifiable && startedAt && !canClaim && !isXMission)}
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

      {/* Verify button for verifiable missions */}
      {verifiable && startedAt && !claimed && !canClaim && isTelegramVerifiable && (
        <div className="mt-3 space-y-1.5">
          <motion.button
            onClick={handleVerify}
            disabled={verifying}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2 rounded-lg bg-primary/10 border border-primary/30 font-display text-xs text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Verificando suscripción...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3" />
                <span>VERIFICAR SUSCRIPCIÓN</span>
              </>
            )}
          </motion.button>
          {verifyError && (
            <div className="flex items-center gap-1 justify-center">
              <AlertCircle className="w-3 h-3 text-destructive" />
              <span className="font-body text-[10px] text-destructive">{verifyError}</span>
            </div>
          )}
        </div>
      )}

      {/* X follow - show "coming soon" verification */}
      {isXMission && startedAt && !claimed && (
        <div className="mt-3">
          <div className="py-2 rounded-lg bg-muted/20 border border-muted/20 text-center">
            <span className="font-body text-[10px] text-muted-foreground">
              Verificación automática próximamente. Espera 33s para reclamar.
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
