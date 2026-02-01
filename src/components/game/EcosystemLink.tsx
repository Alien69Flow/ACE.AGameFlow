import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';

interface EcosystemLinkProps {
  name: string;
  icon: string;
  url?: string;
  comingSoon?: boolean;
  openLink: (url: string) => void;
}

export const EcosystemLink = ({ name, icon, url, comingSoon, openLink }: EcosystemLinkProps) => {
  const handleClick = () => {
    if (url && !comingSoon) {
      openLink(url);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={comingSoon}
      className={`
        flex items-center gap-3 w-full p-3 rounded-lg text-left
        transition-colors
        ${comingSoon
          ? 'bg-muted/30 cursor-not-allowed'
          : 'bg-card hover:bg-card/80 border border-border hover:border-primary/30'
        }
      `}
      whileHover={!comingSoon ? { scale: 1.01, x: 4 } : {}}
      whileTap={!comingSoon ? { scale: 0.99 } : {}}
    >
      <span className="text-lg">{icon}</span>
      <span className={`font-body text-sm flex-1 ${comingSoon ? 'text-muted-foreground' : 'text-foreground'}`}>
        {name}
      </span>
      {comingSoon ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Próximamente
        </span>
      ) : (
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      )}
    </motion.button>
  );
};
