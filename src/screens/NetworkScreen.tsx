import { motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Send, Users, Trophy, Crown, Medal, Award, Zap, Shield, LogOut, Plus } from 'lucide-react';
import { MissionCard } from '@/components/game/MissionCard';
import { EcosystemLink } from '@/components/game/EcosystemLink';
import { Input } from '@/components/ui/input';

interface Mission {
  id: string;
  name: string;
  url: string;
  icon: string;
  reward: number;
  verifiable?: boolean;
  verifyType?: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  claimed: boolean;
}

interface LeaderboardEntry {
  username: string | null;
  energy: number;
  referral_count: number;
}

interface ClanInfo {
  id: string;
  name: string;
  member_count: number;
  total_energy: number;
}

interface NetworkScreenProps {
  missions: Mission[];
  onStartMission: (id: string) => void;
  onClaimMission: (id: string, reward: number) => void;
  openLink: (url: string) => void;
  referralCode: string | null;
  referralCount: number;
  hasReferred: boolean;
  onApplyReferral: (code: string) => Promise<{ success: boolean; error?: string }>;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  onFetchLeaderboard: () => void;
  clan: ClanInfo | null;
  clanId: string | null;
  onCreateClan: (name: string) => Promise<{ success: boolean; error?: string }>;
  onJoinClan: (clanId: string) => Promise<{ success: boolean; error?: string }>;
  onLeaveClan: () => Promise<boolean>;
  clanLeaderboard: ClanInfo[];
  onFetchClanLeaderboard: () => void;
}

const ecosystemLinks = [
  { name: 'AlienFlow DAO (DApp)', icon: '🛸', url: 'https://alienflow.space' },
  { name: 'Discord', icon: '💬', comingSoon: true },
  { name: 'Email', icon: '📧', url: 'mailto:alien69flow@proton.me' },
  { name: 'GitBook', icon: '📚', url: 'https://alienflowspace.gitbook.io/dao/' },
  { name: 'GitHub', icon: '💻', url: 'https://github.com/Alien69Flow' },
  { name: 'LinkedIn Personal', icon: '👤', url: 'https://linkedin.com/in/alien69flow' },
  { name: 'Reddit', icon: '🔴', url: 'https://reddit.com/user/Alien69Flow' },
  { name: 'Threads', icon: '🧵', url: 'https://threads.net/@alien69flow' },
  { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@Alien69Flow' },
];

const legacyCollections = [
  { name: 'Colección Alien69Flow', icon: '🎨', url: 'https://opensea.io/es/Alien69Flow' },
  { name: 'Colección AlienFlowSpace', icon: '🌌', url: 'https://opensea.io/es/AlienFlowSpace' },
];

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ['text-secondary', 'text-muted-foreground', 'text-orange-400'];

export const NetworkScreen = ({
  missions,
  onStartMission,
  onClaimMission,
  openLink,
  referralCode,
  referralCount,
  hasReferred,
  onApplyReferral,
  leaderboard,
  userRank,
  onFetchLeaderboard,
  clan,
  clanId,
  onCreateClan,
  onJoinClan,
  onLeaveClan,
  clanLeaderboard,
  onFetchClanLeaderboard,
}: NetworkScreenProps) => {
  const [refInput, setRefInput] = useState('');
  const [refStatus, setRefStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'social' | 'leaderboard' | 'clans'>('social');
  const [clanName, setClanName] = useState('');
  const [clanStatus, setClanStatus] = useState<string | null>(null);

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTelegram = () => {
    if (referralCode) {
      const url = `https://t.me/share/url?url=https://t.me/Alien69Bot?start=${referralCode}&text=🛸 Únete a AlienFlow y mina Energía Punto Cero!`;
      openLink(url);
    }
  };

  const handleApplyReferral = async () => {
    if (!refInput || refInput.length !== 8) {
      setRefStatus('Código inválido (8 caracteres)');
      return;
    }
    const result = await onApplyReferral(refInput);
    if (result.success) {
      setRefStatus('✅ +50 Energía recibida!');
      setRefInput('');
    } else {
      setRefStatus(`❌ ${result.error}`);
    }
    setTimeout(() => setRefStatus(null), 3000);
  };

  const handleCreateClan = async () => {
    if (!clanName || clanName.length < 3) {
      setClanStatus('Nombre debe tener al menos 3 caracteres');
      return;
    }
    const result = await onCreateClan(clanName);
    if (result.success) {
      setClanStatus('✅ Clan creado!');
      setClanName('');
    } else {
      setClanStatus(`❌ ${result.error}`);
    }
    setTimeout(() => setClanStatus(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-y-auto pb-24 pt-2"
    >
      <div className="px-4 space-y-5">
        {/* Referral Section */}
        <section>
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="font-display text-base font-bold text-secondary text-glow-gold mb-2"
          >
            🛸 SISTEMA DE REFERIDOS
          </motion.h2>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card/80 border border-secondary/30 rounded-xl p-4 space-y-3"
          >
            <div>
              <span className="font-body text-xs text-muted-foreground">Tu código:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-display text-sm text-secondary text-glow-gold tracking-widest text-center">
                  {referralCode || '...'}
                </div>
                <motion.button onClick={handleCopy} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg border border-secondary/30 hover:bg-secondary/10 transition-colors">
                  <Copy className="w-4 h-4 text-secondary" />
                </motion.button>
                <motion.button onClick={handleShareTelegram} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors">
                  <Send className="w-4 h-4 text-primary" />
                </motion.button>
              </div>
              {copied && <span className="text-[10px] text-secondary mt-1 block">¡Copiado!</span>}
            </div>

            <div className="flex items-center justify-around py-2 border-t border-secondary/10">
              <div className="text-center">
                <Users className="w-4 h-4 text-secondary mx-auto mb-0.5" />
                <span className="font-display text-lg font-bold text-secondary text-glow-gold">{referralCount}</span>
                <span className="font-body text-[10px] text-muted-foreground block">Referidos</span>
              </div>
              <div className="text-center">
                <Zap className="w-4 h-4 text-secondary mx-auto mb-0.5" />
                <span className="font-display text-lg font-bold text-secondary text-glow-gold">{referralCount * 100}</span>
                <span className="font-body text-[10px] text-muted-foreground block">Energía ganada</span>
              </div>
            </div>

            {!hasReferred && (
              <div className="border-t border-secondary/10 pt-3">
                <span className="font-body text-xs text-muted-foreground">¿Tienes un código de invitación?</span>
                <div className="flex gap-2 mt-1">
                  <Input value={refInput} onChange={(e) => setRefInput(e.target.value.toUpperCase())} placeholder="XXXXXXXX" maxLength={8} className="flex-1 font-display text-sm tracking-widest text-center bg-muted border-secondary/20" />
                  <motion.button onClick={handleApplyReferral} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/40 font-display text-xs text-secondary hover:bg-secondary/30 transition-colors">
                    APLICAR
                  </motion.button>
                </div>
                {refStatus && <span className="font-body text-[10px] text-muted-foreground mt-1 block">{refStatus}</span>}
              </div>
            )}
          </motion.div>
        </section>

        {/* Tab selector */}
        <div className="flex gap-1.5">
          {[
            { id: 'social' as const, label: 'MISIONES' },
            { id: 'leaderboard' as const, label: 'RANKING', onClick: onFetchLeaderboard },
            { id: 'clans' as const, label: 'CLANES', onClick: onFetchClanLeaderboard },
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); tab.onClick?.(); }}
              className={`flex-1 py-2 rounded-lg font-display text-[10px] transition-colors ${
                activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-card/50 text-muted-foreground border border-muted/20'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {activeTab === 'social' && (
          <>
            <section>
              <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="font-display text-base font-bold text-primary text-glow mb-2">
                MISIONES
              </motion.h2>
              <div className="space-y-2">
                {missions.map((mission, index) => (
                  <motion.div key={mission.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.05 }}>
                    <MissionCard {...mission} onStart={() => onStartMission(mission.id)} onClaim={() => onClaimMission(mission.id, mission.reward)} openLink={openLink} />
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="font-display text-base font-bold text-primary text-glow mb-2">
                ECOSISTEMA
              </motion.h2>
              <div className="space-y-1.5">
                {ecosystemLinks.map((link, index) => (
                  <motion.div key={link.name} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.03 }}>
                    <EcosystemLink {...link} openLink={openLink} />
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="font-display text-base font-bold text-secondary text-glow-gold mb-2">
                LEGADO (OpenSea NFTs)
              </motion.h2>
              <div className="space-y-1.5">
                {legacyCollections.map((link, index) => (
                  <motion.div key={link.name} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.05 }}>
                    <EcosystemLink {...link} openLink={openLink} />
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <section>
            {userRank && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card/80 border border-secondary/30 rounded-xl p-3 mb-3 flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground">Tu posición</span>
                <span className="font-display text-lg font-bold text-secondary text-glow-gold">#{userRank}</span>
              </motion.div>
            )}
            <div className="space-y-1.5">
              {leaderboard.map((entry, index) => {
                const RankIcon = index < 3 ? RANK_ICONS[index] : null;
                const rankColor = index < 3 ? RANK_COLORS[index] : 'text-muted-foreground';
                return (
                  <motion.div key={index} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${index < 3 ? 'bg-card/90 border-secondary/30' : 'bg-card/50 border-muted/10'}`}
                  >
                    <div className="w-8 text-center">
                      {RankIcon ? <RankIcon className={`w-5 h-5 mx-auto ${rankColor}`} /> : <span className="font-display text-xs text-muted-foreground">{index + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-display text-xs text-foreground truncate block">{entry.username || 'Anonymous'}</span>
                      {entry.referral_count > 0 && <span className="font-body text-[9px] text-muted-foreground">{entry.referral_count} referidos</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-secondary" />
                      <span className="font-display text-sm font-bold text-secondary text-glow-gold">{entry.energy.toLocaleString()}</span>
                    </div>
                  </motion.div>
                );
              })}
              {leaderboard.length === 0 && <p className="text-center text-muted-foreground text-xs py-8">Cargando ranking...</p>}
            </div>
          </section>
        )}

        {activeTab === 'clans' && (
          <section className="space-y-4">
            {/* Current clan or create/join */}
            {clanId && clan ? (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card/80 border border-primary/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-display text-sm font-bold text-primary text-glow">{clan.name}</span>
                  </div>
                  <motion.button onClick={onLeaveClan} whileTap={{ scale: 0.95 }} className="p-1.5 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-3 h-3 text-destructive" />
                  </motion.button>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <span className="font-display text-lg font-bold text-foreground">{clan.member_count}</span>
                    <span className="font-body text-[9px] text-muted-foreground block">Miembros</span>
                  </div>
                  <div>
                    <span className="font-display text-lg font-bold text-secondary text-glow-gold">{clan.total_energy.toLocaleString()}</span>
                    <span className="font-body text-[9px] text-muted-foreground block">Energía Total</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card/80 border border-primary/30 rounded-xl p-4 space-y-3">
                <h3 className="font-display text-sm font-bold text-primary text-glow">CREAR CLAN (500 Energía)</h3>
                <div className="flex gap-2">
                  <Input value={clanName} onChange={(e) => setClanName(e.target.value)} placeholder="Nombre del clan" maxLength={20} className="flex-1 font-display text-sm bg-muted border-primary/20" />
                  <motion.button onClick={handleCreateClan} whileTap={{ scale: 0.95 }} className="px-3 py-2 rounded-lg bg-primary/20 border border-primary/40 font-display text-xs text-primary hover:bg-primary/30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                {clanStatus && <span className="font-body text-[10px] text-muted-foreground block">{clanStatus}</span>}
              </motion.div>
            )}

            {/* Clan leaderboard */}
            <h3 className="font-display text-sm font-bold text-secondary text-glow-gold">TOP CLANES</h3>
            <div className="space-y-1.5">
              {clanLeaderboard.map((c, index) => {
                const RankIcon = index < 3 ? RANK_ICONS[index] : null;
                const rankColor = index < 3 ? RANK_COLORS[index] : 'text-muted-foreground';
                const isMylan = c.id === clanId;
                return (
                  <motion.div key={c.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${isMylan ? 'bg-primary/10 border-primary/40' : index < 3 ? 'bg-card/90 border-secondary/30' : 'bg-card/50 border-muted/10'}`}
                  >
                    <div className="w-8 text-center">
                      {RankIcon ? <RankIcon className={`w-5 h-5 mx-auto ${rankColor}`} /> : <span className="font-display text-xs text-muted-foreground">{index + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-display text-xs text-foreground truncate block">{c.name}</span>
                      <span className="font-body text-[9px] text-muted-foreground">{c.member_count} miembros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-secondary" />
                      <span className="font-display text-sm font-bold text-secondary text-glow-gold">{c.total_energy.toLocaleString()}</span>
                    </div>
                    {!clanId && (
                      <motion.button onClick={() => onJoinClan(c.id)} whileTap={{ scale: 0.95 }} className="px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 font-display text-[9px] text-primary">
                        UNIRSE
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
              {clanLeaderboard.length === 0 && <p className="text-center text-muted-foreground text-xs py-8">No hay clanes aún. ¡Crea el primero!</p>}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};
