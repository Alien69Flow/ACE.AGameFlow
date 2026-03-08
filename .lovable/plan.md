

## Plan: Platform Detection Landing + UI Refactoring + Wallet Integration

### Problem
Currently the app stays stuck loading when opened outside Telegram (`isReady` stays false). The Network screen doesn't scroll properly, missions are simulated, navigation tabs could be more compact, and the wallet connect button is on the wrong screen.

### Changes

#### 1. Platform Detection & Landing Page
**File: `src/hooks/useTelegram.ts`**
- Add `isTelegram` state that detects `window.Telegram?.WebApp` presence
- When NOT in Telegram: set `isReady = true` but `initData = null` so the app can render

**File: `src/pages/Index.tsx`**
- When `!isTelegram` (no Telegram WebApp detected), render a full-screen **Landing State** instead of the game:
  - Black background with animated radar/scan effect (CSS radial animation)
  - AlienFlow logo/title with neon glow
  - Large neon-green pulsing button: **"INITIALIZE NEUTRINO LINK (TELEGRAM)"**
  - Deep link: `https://t.me/Alien69Bot` (opens Telegram bot to launch miniapp)
  - Subtle particle background reusing existing animation patterns

#### 2. Navigation Refactoring
**File: `src/components/game/Navigation.tsx`**
- Rename tabs: `Planeta` → `Energía`, keep `Mina`, `Red` → `Referidos`
- Make tabs more compact: reduce padding, smaller icons/text
- Move mute button inline as a small icon at the edge

#### 3. Network Screen Fix (scroll + real missions)
**File: `src/screens/NetworkScreen.tsx`**
- Fix scroll: ensure `overflow-y-auto` works by removing `overflow-hidden` from parent containers
- Keep the 33-second verification system (missions are server-validated via edge function)
- Add proper padding at bottom for nav clearance
- Move `TonConnectButton` out of this screen (goes to Mine)

#### 4. Wallet Integration in Mine Screen
**File: `src/screens/MineScreen.tsx`**
- Add `TonConnectButton` prominently
- Add energy pack purchase UI using `ENERGY_PACKS` from `src/lib/payments.ts`
- Show cards for Flux Starter (0.1 TON), Tesla Burst (0.4 TON), Void Core (1.2 TON)
- Wire up `useTonConnectUI` for sending transactions to `DAO_WALLET_ADDRESS`

#### 5. Hexagon Aesthetic Tightening
**File: `src/components/game/HexSlot.tsx`**
- Reduce orbit radius from 140px to 110px (more compact)
- Slightly larger hex slots (w-18 h-18)
- Thinner stroke, more glow on unlocked slots

#### 6. CSS Fix for Scrolling
**File: `src/index.css`**
- Change `html, body, #root` from `overflow-hidden` to allow scrolling within screen containers

### Files Modified
1. `src/hooks/useTelegram.ts` — platform detection, always set isReady
2. `src/pages/Index.tsx` — landing state for non-Telegram, updated tab names
3. `src/components/game/Navigation.tsx` — compact tabs, renamed labels
4. `src/screens/NetworkScreen.tsx` — fix scroll, remove TonConnect button
5. `src/screens/MineScreen.tsx` — add TonConnect + energy pack store
6. `src/components/game/HexSlot.tsx` — tighter hex layout
7. `src/index.css` — scroll fix

