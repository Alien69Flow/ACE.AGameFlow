

## Plan: Landing Page Typography + Radar Polish + Social Links Update

### Changes

#### 1. Typography & Copywriting Improvements
**File: `src/components/game/LandingScreen.tsx`**
- Use explicit `fontFamily: "'Orbitron', sans-serif"` and `"'Rajdhani', sans-serif"` inline styles (since `font-display`/`font-body` classes may not be defined in Tailwind config)
- Title "ALIENFLOW" — bump to `text-6xl md:text-7xl`, tighter letter-spacing `tracking-[0.15em]`
- Subtitle: "ZERO-POINT ENERGY MINING · NEUTRINO PROTOCOL" with center dot separator
- Stats: "3.14M+" MINERS, "∞" ENERGY, "TON" BLOCKCHAIN
- CTA button text: **"ENTER THE GRID"** main, **"INITIALIZE VIA TELEGRAM"** sub
- Bottom tag: "ALIENFLOW v0.1 · TON BLOCKCHAIN · DAO POWERED"

#### 2. Radar Sweep Enhancement
- Make sweep use a rounded mask (`border-radius: 50%`) so it stays circular within the rings instead of a square conic gradient
- Slow down sweep to 6s for more dramatic feel
- Add a faint trailing afterglow ring that pulses

#### 3. Social Links — Full Official Channels
Replace the 3-icon row with a scrollable/wrapping grid of official links:
- **Primary row** (larger): Telegram (@AlienFlow), X (@alien69flow), Discord (soon), Website (alienflow.space)
- **Secondary row** (smaller): Instagram, Facebook, Reddit, GitHub, LinkedIn, TikTok, Threads, Farcaster, DoraHacks, GitBook, HackMD

URLs mapped from the user's list. "Soon" items get a disabled/muted style.

#### 4. Minor CSS tweak
**File: `src/index.css`** — no changes needed, fonts already imported.

### Files Modified
1. `src/components/game/LandingScreen.tsx` — full rewrite with typography fixes, radar polish, updated social links, better copywriting

