import { motion } from 'framer-motion';
import { useState } from 'react';
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
  name,
  icon,
  url,
  reward,
  startedAt,
  claimed,
  verifiable = false,
  onStart,
  onClaim,
  onVerify,
  openLink,
}: MissionCardProps) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const canClaim = verifiable && !claimed && verified;
  const isAwaitingVerification = verifiable && !!startedAt && !claimed && !canClaim;

  const handleClick = () => {
    if (claimed || !verifiable) return;

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
    } else {
      setVerifyError(result?.error || 'No verificado. ¿Ya te uniste?');
    }
    setVerifying(false);
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
    if (!verifiable) {
      return <span>Próximamente</span>;
    }
    if (canClaim) {
      return (
        <>
          <Gift className="w-4 h-4" />
          <span>Reclamar +{reward}</span>
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
            : verifiable
              ? 'border-primary/50'
              : 'border-border'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl relative">
          {icon}
          {verifiable && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
            {name}
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${verifiable ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {verifiable ? 'VERIFICABLE' : 'PRÓXIMAMENTE'}
            </span>
          </h4>
          <p className="font-body text-xs text-secondary">
            +{reward} Energía
          </p>
        </div>

        <motion.button
          onClick={handleClick}
          disabled={claimed || !verifiable || isAwaitingVerification}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-display text-xs font-medium
            transition-colors
            ${claimed || !verifiable
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : canClaim
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }
          `}
          whileHover={!claimed && verifiable ? { scale: 1.02 } : {}}
          whileTap={!claimed && verifiable ? { scale: 0.98 } : {}}
        >
          {getButtonContent()}
        </motion.button>
      </div>

      {isAwaitingVerification && (
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
    </motion.div>
  );
};
