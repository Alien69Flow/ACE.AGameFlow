## Plan: Wallet Address + Landing Page Premium Redesign

### 1. Update TON Wallet Address

**File: `src/lib/payments.ts**` (line 1)

- Replace placeholder with real address: `UQDpx7rfaaO-P6-Lnu0IrR1kWEo2Geo1VMx1UYy0IyyCJJ20`

### 2. Landing Page Premium Redesign

**File: `src/components/game/LandingScreen.tsx**` — Complete rewrite for a cinematic, world-class miniapp landing.

New design elements:

- **Layered radar system**: 5 concentric rings with varying opacity + animated sweep line, plus crosshair lines for tactical feel
- **ACE.jpg logo**: Use the existing `public/ACE.jpg` as the central hero image inside a glowing circular frame with pulsing border
- **Title hierarchy**: "ALIENFLOW" in large glowing Orbitron text, subtitle "ZERO POINT ENERGY MINING NEUTRINO PROTOCOL" below
- **Stats ticker**: Animated row showing fake-but-impressive stats ("3.14M+ MINERS", "∞ ENERGY", "TON NETWORK") with gold accents
- **Giant CTA button**: Much larger, with layered glow effects (outer blur + inner border pulse), text "INITIALIZE" with "(OPEN IN TELEGRAM LINK)" subtitle
- **Social proof row**: Small icons linking to official socials (Twitter, Telegram, Instagram) at the bottom
- **More particles**: 20+ floating dots with varied sizes, some green, some gold
- **Scan lines overlay**: Subtle CSS scan line effect for CRT/holographic feel
- **Entrance animations**: Staggered — rings fade in first, then logo scales up, then title, then stats, then CTA slides up, then socials fade in

### Technical Approach

- All framer-motion animations with staggered delays
- Uses existing CSS utilities (`text-glow`, `box-glow`, `text-glow-gold`)
- Add scan-line keyframe animation to `index.css`
- Responsive: works on both mobile and desktop viewports

### Files Modified

1. `src/lib/payments.ts` — real wallet address
2. `src/components/game/LandingScreen.tsx` — premium redesign
3. `src/index.css` — add scan-line animation