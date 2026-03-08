

## Plan: Final Polish Pass — Performance, UX, and Launch Quality

After reviewing every file in depth, here are the concrete improvements to ship a polished v1:

---

### 1. Auto-Dismiss Achievement Toast (4 seconds)
Currently the achievement notification stays until manually tapped. Add a `useEffect` with a 4-second timer that auto-calls `dismissAchievementNotification`.

**File:** `src/pages/Index.tsx`

---

### 2. Throttle Achievement Checks on Tap (Performance Critical)
`checkAchievements()` runs 4 DB queries on **every single tap** — this will crush the backend under load. Change the tap endpoint to only run achievement checks every 10th tap (using `energy % 10 === 0`).

**File:** `supabase/functions/game-api/index.ts` (tap case, ~line 437)

---

### 3. Client-Side Tap Queue Protection
The `isMiningRef` flag prevents concurrent taps, but rapid taps can still queue up. Add a 150ms cooldown on the client to prevent unnecessary API calls that will just get rate-limited.

**File:** `src/hooks/useGameState.ts` (tapToroid callback)

---

### 4. Error Toast Feedback
Currently most API failures are silently swallowed. Add user-facing toast notifications for critical failures: tap rate-limited, mission claim failed, upgrade purchase failed, spin failed.

**Files:** `src/hooks/useGameState.ts`, using existing `sonner` toast

---

### 5. Haptic Feedback on Key Actions
Add haptic feedback to: wheel spin result, achievement claim, daily reward claim, upgrade purchase. Currently only tap and mission claim have it.

**Files:** `src/screens/PlanetScreen.tsx`, `src/screens/UpgradesScreen.tsx`, `src/components/game/LuckyWheel.tsx`

---

### 6. Loading Skeletons for Tabs
The Leaderboard, Achievements, and Friends tabs show "Cargando..." text. Replace with skeleton pulse animations matching the card layout for a more polished feel.

**File:** `src/screens/NetworkScreen.tsx`

---

### 7. Version Bump + Landing Polish
Update `ALIENFLOW v0.1` to `v1.0` on the landing page. This is a small but important signal for launch.

**File:** `src/components/game/LandingScreen.tsx` (line 373)

---

### Summary of Changes

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Achievement toast auto-dismiss timer |
| `supabase/functions/game-api/index.ts` | Throttle achievement checks (every 10th tap) |
| `src/hooks/useGameState.ts` | Tap cooldown (150ms), error toasts via sonner |
| `src/screens/NetworkScreen.tsx` | Skeleton loading states for tabs |
| `src/screens/PlanetScreen.tsx` | Haptic on daily claim |
| `src/screens/UpgradesScreen.tsx` | Haptic on upgrade purchase |
| `src/components/game/LuckyWheel.tsx` | Haptic on spin result |
| `src/components/game/LandingScreen.tsx` | Version bump to v1.0 |

### Implementation Order
1. Achievement toast auto-dismiss
2. Tap throttling (server + client)
3. Error toasts
4. Haptic feedback additions
5. Skeleton loading states
6. Version bump

