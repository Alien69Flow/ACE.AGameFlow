

## Plan: Launch-Ready Polish — Anti-cheat, Lucky Wheel, Deep Link Referrals, Payment Verification

After reviewing the full codebase, here are the critical gaps for a launchable v1:

---

### 1. Anti-Cheat Rate Limiting on Tap (CRITICAL)
Currently anyone can spam the `/tap` endpoint. Every top app rate-limits this.

**Edge function (`game-api/index.ts`)** — update `tap` case:
- Track `last_tap_at` timestamp on profiles (new column)
- Reject taps faster than 100ms apart (bot detection)
- Cap at 10 taps/second per user
- Return 429 if rate limited

**DB migration:** `ALTER TABLE profiles ADD COLUMN last_tap_at timestamptz DEFAULT now();`

### 2. Lucky Wheel (Free Daily + Paid Spins)
Proven engagement mechanic from TapSwap/Catizen. Users get 1 free spin/day, extra spins cost TON.

**Prizes:** 10, 25, 50, 100, 250, 500, 1000 energy + "2× Boost 1h" + "Empty"

**DB migration:** Add `last_free_spin timestamp`, `total_spins integer DEFAULT 0` to profiles

**Edge function:** `spin-wheel` endpoint — validates free spin eligibility, generates weighted random prize, awards energy

**UI:** New animated wheel component accessible from PlanetScreen (floating button). Framer Motion rotation animation with easing. Gold/neon aesthetic matching the app.

### 3. Telegram Deep Link Referrals (Viral Growth)
The #1 growth mechanic. When user shares their referral link via `tg://msg_url`, the bot auto-applies the referral code on first launch.

**Edge function:** Update `init-profile` to check `start_param` from Telegram initData for referral code, auto-apply on account creation

**UI:** Update referral section in NetworkScreen to use Telegram's native share API (`window.Telegram.WebApp.openTelegramLink`) with pre-filled message + bot deep link

### 4. TON Payment Server Verification
Currently payments are client-side only — no server verification. Users could skip actual payment.

**Edge function:** `verify-payment` endpoint — accepts TON transaction hash, verifies via TON Center API that payment went to DAO wallet with correct amount, then credits stamina/multiplier

**Update `MineScreen`:** After `sendTransaction`, send tx hash to `verify-payment` before crediting

### 5. Friends List (Social Proof)
Show users who they've invited and their progress. Creates competition and social proof.

**Edge function:** `get-friends` endpoint — returns profiles referred by current user (username, energy, last_seen_at)

**UI:** New tab in NetworkScreen "Amigos" showing invited friends with their energy and last active time

---

### Files Modified
1. **DB migration** — `last_tap_at`, `last_free_spin`, `total_spins` columns on profiles
2. **`supabase/functions/game-api/index.ts`** — rate limit tap, `spin-wheel`, `verify-payment`, `get-friends` endpoints, update `init-profile` for deep link referrals
3. **`src/screens/PlanetScreen.tsx`** — lucky wheel floating button + modal
4. **`src/screens/MineScreen.tsx`** — payment verification flow
5. **`src/screens/NetworkScreen.tsx`** — friends list tab, Telegram native share for referrals
6. **`src/hooks/useGameState.ts`** — new API calls (spin, verify-payment, get-friends)
7. **`src/pages/Index.tsx`** — wire new state + deep link referral handling
8. **NEW `src/components/game/LuckyWheel.tsx`** — animated wheel component

### Implementation Order
1. DB migration
2. Anti-cheat rate limiting on tap
3. Deep link referral auto-apply
4. Lucky wheel (component + backend)
5. Friends list
6. TON payment verification

