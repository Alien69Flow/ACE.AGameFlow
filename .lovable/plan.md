

## Plan: Cinematic Landing Page — Glitch FX, Typography Upgrade, Social Icons

### 1. Typography Upgrade
**File: `index.html`** — Add Google Font **"Exo 2"** (a sleek alien/sci-fi font) alongside existing Orbitron and Rajdhani. Exo 2 gives a more alien, futuristic feel for the title while keeping Rajdhani for body text.

**File: `src/index.css`** — Update the font import to include `Exo+2` with weights 700-900.

**File: `src/components/game/LandingScreen.tsx`** — Use `Exo 2` for the main "ALIENFLOW" title (bigger, bolder alien vibe), keep `Orbitron` for stats and CTA button, `Rajdhani` for subtitles/labels.

### 2. Glitch Effect on Title
Add a CSS `@keyframes glitch` animation to `src/index.css` with color-channel offset (red/cyan shadows shifting left/right) and a slight clip-path flicker. Apply it to the "ALIENFLOW" title on entrance with a 2-second glitch burst that settles into a subtle continuous glitch loop.

### 3. Typing Effect on Subtitle
Implement a simple typing animation for the subtitle "ZERO-POINT ENERGY MINING · NEUTRINO PROTOCOL" using `framer-motion` — letters appear one by one with a blinking cursor at the end.

### 4. Logo Cinematic Entrance
Enhance the logo entrance: start with a bright flash (white→green), then scale-bounce in with a ripple ring expanding outward. More dramatic than the current simple spring.

### 5. Social Links — Official Icons, Alphabetical Order
Replace unicode symbols with **Lucide React** icons where available and SVG brand marks for the rest. Consolidate into ONE alphabetically sorted list with proper icons:

| Platform | Icon | URL | Status |
|---|---|---|---|
| Discord | `MessageCircle` | # | Soon |
| DoraHacks | `Rocket` | dorahacks.io/org/alien69flow | ✓ |
| Facebook | `Facebook` | facebook.com/Alien69Flow | ✓ |
| Farcaster | `Cast` | warpcast.com/alien69flow | ✓ |
| GitHub | `Github` | github.com/Alien69Flow | ✓ |
| GitBook | `BookOpen` | # | Soon |
| HackMD | `FileText` | hackmd.io/@Alien69Flow | ✓ |
| Instagram | `Instagram` | instagram.com/alien69flow | ✓ |
| LinkedIn | `Linkedin` | linkedin.com/company/alienflow | ✓ |
| Reddit | `MessageSquare` | reddit.com/u/Alien69Flow | ✓ |
| Telegram | `Send` | t.me/AlienFlow | ✓ |
| Threads | `AtSign` | threads.net/@alien69flow | ✓ |
| TikTok | `Music` | tiktok.com/@alien69flow | Soon |
| Website | `Globe` | alienflow.space | ✓ |
| X | `Twitter` | x.com/alien69flow | ✓ |

Rendered as a compact grid with small Lucide icons + label, sorted A-Z. "Soon" items are muted/disabled.

### Files Modified
1. `index.html` — add Exo 2 font (or move to CSS import)
2. `src/index.css` — add glitch keyframes, typing cursor animation, update font import
3. `src/components/game/LandingScreen.tsx` — full rewrite with glitch title, typing subtitle, cinematic logo entrance, alphabetical social grid with Lucide icons

