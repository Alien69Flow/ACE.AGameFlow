

## Plan: Sound FX + Referral System + Monetization Boost

### 1. Hover Sound Effects (Landing Page)
**File: `src/components/game/LandingScreen.tsx`**
- Add a lightweight Web Audio API helper that plays a subtle "blip" on hover over social icons (short 50ms sine tone at 600Hz)
- Play a deeper "whoosh" on CTA button hover (150ms frequency sweep 400→600Hz)
- Respect a simple `useRef` to avoid spamming sounds on rapid mouse movement
- No external audio files needed — all synthesized

### 2. Referral System (Database + Backend + UI)

**Database migration:**
```sql
-- Add referral_code and referred_by to profiles
ALTER TABLE public.profiles 
  ADD COLUMN referral_code text UNIQUE,
  ADD COLUMN referred_by uuid REFERENCES public.profiles(id),
  ADD COLUMN referral_count integer NOT NULL DEFAULT 0;

-- Create index for fast referral lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
```

**Edge function (`game-api/index.ts`)** — new endpoints:
- `get-referral-code`: Returns user's unique code (auto-generated on first call as 8-char alphanumeric)
- `apply-referral`: Validates and applies a referral code, rewards both referrer (+100 energy) and referred (+50 energy). Only works once per user, only if `referred_by` is null

**UI — New Referral section in NetworkScreen:**
- Show user's referral code with copy button and Telegram share link (`https://t.me/Alien69Bot?start=REF_CODE`)
- Show referral count and total earned from referrals
- Input field to enter someone else's referral code

### 3. Monetization Maximization

**A. Daily Login Rewards (retention → more IAP)**
- **DB migration:** Add `last_daily_claim timestamp`, `daily_streak integer DEFAULT 0` to profiles
- **Edge function:** `claim-daily` endpoint — rewards escalating energy (10, 20, 30... up to 100 per day streak, resets if >48h gap)
- **UI:** Daily reward modal on app open if eligible, shown in PlanetScreen

**B. Upgraded Energy Pack Store (more tiers + visual polish)**
- **File: `src/lib/payments.ts`** — Add 2 premium packs:
  - "Quantum Surge" — 50,000 stamina, 3.0 TON
  - "Singularity" — 100,000 stamina, 5.0 TON
- **File: `src/screens/MineScreen.tsx`** — Visual upgrade: featured/premium pack highlighted with gold border and "BEST VALUE" badge

**C. Leaderboard (competition → engagement → spending)**
- **DB migration:** Enable realtime on profiles for energy column
- **Edge function:** `leaderboard` endpoint — returns top 50 users by energy (username, energy, referral_count)
- **UI:** New tab or section accessible from Navigation showing ranked players with gold/silver/bronze icons

**D. Premium Multiplier (TON purchase)**
- **File: `src/lib/payments.ts`** — Add "2x Multiplier (24h)" pack at 0.5 TON
- **DB migration:** Add `multiplier integer DEFAULT 1`, `multiplier_expires_at timestamp` to profiles
- **Edge function:** Update `tap` to multiply energy gain by multiplier if not expired
- **UI:** Show active multiplier badge in StaminaBar, purchase option in MineScreen

### Files Modified
1. `src/components/game/LandingScreen.tsx` — hover sound FX
2. `src/screens/NetworkScreen.tsx` — referral UI + leaderboard section
3. `src/screens/MineScreen.tsx` — upgraded store with premium packs + multiplier
4. `src/screens/PlanetScreen.tsx` — daily reward modal
5. `src/hooks/useGameState.ts` — new API calls (referral, daily, leaderboard)
6. `src/lib/payments.ts` — new packs + multiplier product
7. `src/components/game/StaminaBar.tsx` — multiplier badge display
8. `src/components/game/Navigation.tsx` — add leaderboard tab
9. `supabase/functions/game-api/index.ts` — 5 new endpoints (get-referral-code, apply-referral, claim-daily, leaderboard, buy-multiplier)
10. **DB migration** — referral columns, daily streak columns, multiplier columns, realtime

### Implementation Order
1. DB migration (all new columns at once)
2. Edge function updates (all new endpoints)
3. Landing page hover sounds
4. Referral UI in NetworkScreen
5. Daily rewards in PlanetScreen
6. Premium packs + multiplier in MineScreen
7. Leaderboard UI

