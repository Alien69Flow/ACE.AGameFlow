

## Plan: Final Quality Pass — Payment Flow, Error Handling & Cleanup

### 1. Fix Duplicate Mission
Remove the non-verifiable `twitter` mission from `Index.tsx` since `x_follow` already covers X/Twitter with auto-verification and better reward.

**File:** `src/pages/Index.tsx`

### 2. TON Purchase Error Feedback
Add user-facing toast notifications in `MineScreen.tsx` when TON transactions fail or succeed, instead of silent `console.error`.

**File:** `src/screens/MineScreen.tsx`

### 3. Post-Purchase Stamina Application
After a successful TON transaction for energy packs, call a new `apply-energy-pack` endpoint that credits the stamina. For multipliers, call `activate-multiplier`. Currently the TON is sent but nothing happens server-side.

This requires:
- New edge function endpoint `apply-energy-pack` that takes `packId` and adds stamina (trusting client for now since `verify-payment` needs TON Center API key)
- Add toast feedback for successful purchase

**Files:** `supabase/functions/game-api/index.ts`, `src/screens/MineScreen.tsx`, `src/hooks/useGameState.ts`

### 4. Clean Up MineScreen Buy Flow
Connect `handleBuyPack` and `handleBuyMultiplier` to actually update game state after successful transaction — call the backend, update local state, show success toast.

**File:** `src/screens/MineScreen.tsx`

### Summary

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Remove duplicate twitter mission |
| `src/screens/MineScreen.tsx` | Toast feedback on TON tx success/failure, call backend after purchase |
| `supabase/functions/game-api/index.ts` | New `apply-energy-pack` endpoint |
| `src/hooks/useGameState.ts` | Add `applyEnergyPack` callback |

### Implementation Order
1. Remove duplicate mission
2. Add toast feedback to MineScreen
3. Backend `apply-energy-pack` endpoint
4. Wire purchase flow end-to-end

