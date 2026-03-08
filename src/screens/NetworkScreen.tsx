import { motion } from 'framer-motion';
import { MissionCard } from '@/components/game/MissionCard';
import { EcosystemLink } from '@/components/game/EcosystemLink';

interface Mission {
  id: string;
  name: string;
  url: string;
  icon: string;
  reward: number;
  startedAt: Date | null;
  completedAt: Date | null;
  claimed: boolean;
}

interface NetworkScreenProps {
  missions: Mission[];
  onStartMission: (id: string) => void;
  onClaimMission: (id: string, reward: number) => void;
  openLink: (url: string) => void;
}

const ecosystemLinks = [
  { name: 'AlienFlow DAO (DApp)', icon: '🛸', url: 'https://alienflow.space' },
  { name: 'Discord', icon: '💬', comingSoon: true },
  { name: 'Email', icon: '📧', url: 'mailto:alien69flow@proton.me' },
  { name: 'GitBook', icon: '📚', url: 'https://alienflowspace.gitbook.io/' },
  { name: 'GitHub', icon: '💻', url: 'https://github.com/Alien69Flow' },
  { name: 'LinkedIn Personal', icon: '👤', url: 'https://linkedin.com/in/alien69flow' },
  { name: 'Reddit', icon: '🔴', url: 'https://reddit.com/user/Alien69Flow' },
  { name: 'Threads', icon: '🧵', url: 'https://threads.net/@alien69flow' },
  { name: 'TikTok', icon: '🎵', comingSoon: true },
];

const legacyCollections = [
  { name: 'Colección Alien69Flow', icon: '🎨', url: 'https://opensea.io/es/Alien69Flow' },
  { name: 'Colección AlienFlowSpace', icon: '🌌', url: 'https://opensea.io/es/AlienFlowSpace' },
];

export const NetworkScreen = ({
  missions,
  onStartMission,
  onClaimMission,
  openLink,
}: NetworkScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-y-auto pb-24 pt-2"
    >
      <div className="px-4 space-y-5">
        {/* Missions Section */}
        <section>
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="font-display text-base font-bold text-primary text-glow mb-2"
          >
            MISIONES
          </motion.h2>
          <div className="space-y-2">
            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <MissionCard
                  {...mission}
                  onStart={() => onStartMission(mission.id)}
                  onClaim={() => onClaimMission(mission.id, mission.reward)}
                  openLink={openLink}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ecosystem Section */}
        <section>
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="font-display text-base font-bold text-primary text-glow mb-2"
          >
            ECOSISTEMA
          </motion.h2>
          <div className="space-y-1.5">
            {ecosystemLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <EcosystemLink {...link} openLink={openLink} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legacy Section */}
        <section>
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="font-display text-base font-bold text-secondary text-glow-gold mb-2"
          >
            LEGADO (OpenSea NFTs)
          </motion.h2>
          <div className="space-y-1.5">
            {legacyCollections.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <EcosystemLink {...link} openLink={openLink} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
