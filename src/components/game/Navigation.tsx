import { motion } from 'framer-motion';
import { Zap, Pickaxe, Users, ArrowUpCircle, Rocket, Volume2, VolumeX, Languages } from 'lucide-react';
import type { Language } from '@/hooks/useLanguage';

type Screen = 'planet' | 'mine' | 'network' | 'upgrades' | 'airdrop';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  language: Language;
  onToggleLanguage: () => void;
  t: (key: string) => string;
}

const navItems: { id: Screen; icon: typeof Zap; labelKey: string }[] = [
  { id: 'planet', icon: Zap, labelKey: 'nav.planet' },
  { id: 'mine', icon: Pickaxe, labelKey: 'nav.mine' },
  { id: 'upgrades', icon: ArrowUpCircle, labelKey: 'nav.upgrades' },
  { id: 'network', icon: Users, labelKey: 'nav.network' },
  { id: 'airdrop', icon: Rocket, labelKey: 'nav.airdrop' },
];

export const Navigation = ({ currentScreen, onNavigate, isMuted, onToggleMute, language, onToggleLanguage, t }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2"
    >
      <div className="bg-card/95 backdrop-blur-lg border border-primary/30 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-2xl shadow-primary/10">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          const label = t(item.labelKey);

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl
                transition-colors duration-200 flex-1
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
              whileTap={{ scale: 0.92 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/15 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] relative z-10 ${isActive ? 'text-glow' : ''}`} />
              <span className={`font-display text-[8px] relative z-10 leading-tight text-center ${isActive ? 'text-glow font-bold' : ''}`}>
                {label}
              </span>
            </motion.button>
          );
        })}

        <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 border-l border-muted/20 ml-1">
          <motion.button
            onClick={onToggleLanguage}
            className="relative flex items-center justify-center w-[18px] h-[18px] rounded-lg text-muted-foreground hover:text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
            title="Change language"
          >
            <Languages className="w-[16px] h-[16px]" />
          </motion.button>
          <span className="font-display text-[8px] text-muted-foreground uppercase">{language}</span>
        </div>

        <motion.button
          onClick={onToggleMute}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? (
            <VolumeX className="w-[18px] h-[18px]" />
          ) : (
            <Volume2 className="w-[18px] h-[18px]" />
          )}
          <span className="font-display text-[8px] text-muted-foreground uppercase">
            {isMuted ? 'OFF' : 'ON'}
          </span>
        </motion.button>
      </div>
    </motion.nav>
  );
};
