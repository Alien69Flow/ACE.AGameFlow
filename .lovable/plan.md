

## Plan: Fix Social Links + Additional Landing Page Improvements

### 1. Fix GitBook & TikTok URLs
Remove `soon: true` and add real URLs:
- **GitBook**: `https://alienflowspace.gitbook.io/dao/`
- **TikTok**: `https://tiktok.com/@Alien69Flow`

### 2. Additional Improvements
- **Scroll-triggered fade on social grid**: Add a staggered `framer-motion` entrance where each icon animates in one by one (left to right, top to bottom) with a 50ms delay between each
- **Hover micro-interactions on social icons**: Scale up to 1.15x + glow border on hover for a more premium feel
- **"Powered by TON" badge**: Add a small animated badge near the bottom with the TON logo icon, pulsing subtly — adds credibility
- **Responsive polish**: On very small screens (< 360px), reduce the social grid to 4 columns instead of 5 to avoid cramping
- **Accessibility**: Add `aria-label` to all social links for screen readers

### Files Modified
1. `src/components/game/LandingScreen.tsx` — fix URLs, add staggered social grid animation, hover effects, TON badge, responsive tweaks

