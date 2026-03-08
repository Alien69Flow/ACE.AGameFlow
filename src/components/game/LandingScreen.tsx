import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Globe, MessageCircle, Rocket, BookOpen, FileText,
  Instagram, Facebook, Linkedin, Music, AtSign, Github, MessageSquare
} from 'lucide-react';

const RINGS = [
  { size: 640, opacity: 0.06, delay: 0 },
  { size: 500, opacity: 0.10, delay: 0.1 },
  { size: 370, opacity: 0.15, delay: 0.2 },
  { size: 250, opacity: 0.22, delay: 0.3 },
  { size: 140, opacity: 0.32, delay: 0.4 },
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 8 + Math.random() * 84,
  y: 8 + Math.random() * 84,
  size: 1 + Math.random() * 3,
  duration: 3 + Math.random() * 5,
  delay: Math.random() * 3,
  isGold: i % 4 === 0,
}));

const STATS = [
  { label: '3.14M+', sub: 'MINERS' },
  { label: '∞', sub: 'ENERGY' },
  { label: 'TON', sub: 'BLOCKCHAIN' },
];

const SOCIAL_LINKS = [
  { name: 'Discord', icon: MessageCircle, url: '#', soon: true },
  { name: 'DoraHacks', icon: Rocket, url: 'https://dorahacks.io/org/alien69flow' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/Alien69Flow' },
  { name: 'Farcaster', icon: AtSign, url: 'https://warpcast.com/alien69flow' },
  { name: 'GitHub', icon: Github, url: 'https://github.com/Alien69Flow' },
  { name: 'GitBook', icon: BookOpen, url: 'https://alienflowspace.gitbook.io/dao/' },
  { name: 'HackMD', icon: FileText, url: 'https://hackmd.io/@Alien69Flow' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/alien69flow' },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/alienflow' },
  { name: 'Reddit', icon: MessageSquare, url: 'https://reddit.com/u/Alien69Flow' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/AlienFlow' },
  { name: 'Threads', icon: AtSign, url: 'https://threads.net/@alien69flow' },
  { name: 'TikTok', icon: Music, url: 'https://tiktok.com/@Alien69Flow' },
  { name: 'Website', icon: Globe, url: 'https://alienflow.space' },
  { name: 'X', icon: () => <span className="font-bold text-xs">𝕏</span>, url: 'https://x.com/alien69flow' },
];

const SUBTITLE_TEXT = 'ZERO-POINT ENERGY MINING · NEUTRINO PROTOCOL';

// Web Audio API sound helpers
function useHoverSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playBlip = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayRef.current < 80) return; // debounce
    lastPlayRef.current = now;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch { /* silent */ }
  }, [getCtx]);

  const playWhoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* silent */ }
  }, [getCtx]);

  return { playBlip, playWhoosh };
}

export const LandingScreen = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const { playBlip, playWhoosh } = useHoverSound();

  useEffect(() => {
    const startDelay = 1200;
    const typingSpeed = 40;

    const startTyping = setTimeout(() => {
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= SUBTITLE_TEXT.length) {
          setTypedText(SUBTITLE_TEXT.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, typingSpeed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTyping);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Radar system */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div className="absolute w-[700px] h-px bg-primary/10" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.div className="absolute w-px h-[700px] bg-primary/10" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.div className="absolute w-[500px] h-px bg-primary/5 rotate-45" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
        <motion.div className="absolute w-[500px] h-px bg-primary/5 -rotate-45" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />

        {RINGS.map((ring) => (
          <motion.div
            key={ring.size}
            className="absolute rounded-full border border-primary"
            style={{ width: ring.size, height: ring.size, opacity: 0, borderColor: `hsl(var(--primary) / ${ring.opacity})` }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: ring.delay }}
          />
        ))}

        <motion.div
          className="absolute rounded-full overflow-hidden"
          style={{ width: 640, height: 640 }}
        >
          <motion.div
            className="w-full h-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.18) 15deg, hsl(var(--primary) / 0.06) 35deg, transparent 55deg)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <motion.div
          className="absolute rounded-full border border-primary/10"
          style={{ width: 640, height: 640 }}
          animate={{ scale: [1, 1.03, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.isGold ? 'bg-secondary/50' : 'bg-primary/40'}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 150 }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-8 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(0 0% 100% / 0.8), transparent 60%)' }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.div
            className="absolute -inset-4 rounded-full border-2 border-primary"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
          <motion.div
            className="absolute -inset-4 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)' }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-primary/60 relative box-glow">
            <img src="/ACE.jpg" alt="AlienFlow Logo" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="glitch text-5xl md:text-7xl font-black text-primary tracking-[0.12em]"
            style={{ fontFamily: "'Exo 2', 'Orbitron', sans-serif" }}
          >
            ALIENFLOW
          </h1>
          <p
            className="text-[10px] md:text-xs text-muted-foreground mt-2 tracking-[0.2em] uppercase h-4"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {typedText}
            {showCursor && <span className="text-primary animate-pulse">▌</span>}
          </p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="flex items-center justify-center gap-6 md:gap-8"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <span
                className="text-lg md:text-2xl font-bold text-secondary text-glow-gold"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {stat.label}
              </span>
              <span
                className="block text-[8px] md:text-[9px] text-muted-foreground tracking-[0.3em] mt-0.5"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {stat.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          href="https://t.me/Alien69Bot"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6, type: 'spring', stiffness: 120 }}
          className="relative group w-full max-w-xs"
          onMouseEnter={playWhoosh}
        >
          <motion.div
            className="absolute -inset-3 rounded-2xl blur-2xl"
            style={{ background: 'hsl(var(--primary) / 0.2)' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-px rounded-2xl border border-primary/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative px-6 py-4 rounded-2xl border-2 border-primary bg-card/90 backdrop-blur-md hover:bg-primary/10 transition-all duration-300 box-glow text-center">
            <span
              className="text-xl md:text-2xl font-black text-primary text-glow tracking-wider block"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ENTER THE GRID
            </span>
            <span
              className="text-[9px] text-muted-foreground mt-1 tracking-[0.2em] block"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              INITIALIZE VIA TELEGRAM
            </span>
          </div>
        </motion.a>

        {/* Social Links Grid */}
        <div className="grid grid-cols-5 max-[360px]:grid-cols-4 gap-2 mt-2 w-full max-w-sm">
          {SOCIAL_LINKS.map((social, index) => {
            const IconComponent = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.soon ? undefined : social.url}
                target={social.soon ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={social.soon ? `${social.name} (coming soon)` : `Visit ${social.name}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6 + index * 0.05, duration: 0.35 }}
                whileHover={social.soon ? {} : { scale: 1.15 }}
                onMouseEnter={social.soon ? undefined : playBlip}
                className={`
                  flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-200
                  ${social.soon 
                    ? 'opacity-30 cursor-default' 
                    : 'hover:bg-primary/10 hover:shadow-[0_0_8px_hsl(var(--primary)/0.3)] cursor-pointer'
                  }
                `}
                title={social.name}
              >
                <IconComponent className="w-4 h-4 text-primary/70" />
                <span
                  className="text-[7px] text-muted-foreground tracking-wider truncate w-full text-center"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {social.name.toUpperCase()}
                  {social.soon && ' ⏳'}
                </span>
              </motion.a>
            );
          })}
        </div>

        {/* Powered by TON badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="flex items-center gap-1.5 mt-1"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-primary/20 bg-card/60 backdrop-blur-sm"
          >
            <span className="text-[9px] text-primary/60 tracking-[0.15em] font-semibold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              ⬡ POWERED BY TON
            </span>
          </motion.div>
        </motion.div>

        {/* Bottom tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.1 }}
          className="text-[8px] text-muted-foreground/40 text-center tracking-[0.2em] mt-1"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          ALIENFLOW v1.0 · TON BLOCKCHAIN · DAO POWERED
        </motion.p>
      </div>
    </div>
  );
};
