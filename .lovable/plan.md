

## Plan: Achievements/Badges System + Launch Polish

### 1. Achievements System

**New DB table: `achievements`**
| Column | Type |
|---|---|
| id | uuid PK |
| profile_id | uuid FK (not actual FK, just reference) |
| achievement_id | text |
| unlocked_at | timestamptz |
| claimed | boolean default false |
| UNIQUE(profile_id, achievement_id) |

RLS: Deny all direct access (same pattern as other tables — all access via edge function).

**Achievement Catalog (hardcoded server-side):**

| ID | Name | Condition | Reward |
|---|---|---|---|
| first_tap | Primer Toque | First tap | 10 |
| energy_1k | Colector | Reach 1,000 energy | 100 |
| energy_10k | Minero Experto | Reach 10,000 energy | 500 |
| energy_100k | Magnate | Reach 100,000 energy | 2000 |
| first_referral | Embajador | First referral | 200 |
| referrals_5 | Reclutador | 5 referrals | 500 |
| referrals_25 | Líder | 25 referrals | 2000 |
| streak_7 | Constante | 7-day streak | 300 |
| streak_30 | Dedicado | 30-day streak | 1500 |
| max_upgrade | Maxed Out | Any upgrade at level 5 | 1000 |
| join_clan | Camarada | Join a clan | 100 |
| spin_10 | Apostador | 10 wheel spins | 200 |
| all_missions | Completista | Complete all missions | 500 |

**Edge function endpoints:**
- `get-achievements` — returns unlocked + available achievements with progress %
- `check-achievements` — called after tap/claim/upgrade/referral to auto-unlock new ones
- `claim-achievement` — claims energy reward for unlocked achievement

**Auto-check triggers:** After each `tap`, `claim-mission`, `buy-upgrade`, `apply-referral`, `claim-daily`, `join-clan`, `spin-wheel` — call an internal `checkAchievements()` function that evaluates all conditions and inserts newly unlocked ones. Returns list of newly unlocked achievements so the client can show a toast.

### 2. UI — Achievements Screen

New tab approach: Rather than adding a 6th nav tab, add achievements as a section inside `NetworkScreen` (new "LOGROS" tab alongside existing MISIONES/REFERIDOS/etc.) or as a modal accessible from the StaminaBar (trophy icon).

**Decision:** Add as a new sub-tab "LOGROS" in NetworkScreen — keeps navigation clean and groups social features together.

**UI components:**
- Achievement cards with icon, name, description, progress bar, reward amount
- Locked (greyed out) vs unlocked (glowing) vs claimed (checkmark) states
- Toast notification when achievement unlocks during gameplay

### 3. Additional Launch Polish

**Improvements observed from codebase review:**

- **Achievement toast notifications** — When `check-achievements` returns newly unlocked badges, show animated toast overlay
- **Profile stats summary** — Add total achievements count to StaminaBar or profile area (e.g., "🏆 5/13")

### Files Modified

1. **DB migration** — `achievements` table
2. **`supabase/functions/game-api/index.ts`** — `get-achievements`, `claim-achievement`, internal `checkAchievements()` helper called from existing endpoints
3. **`src/screens/NetworkScreen.tsx`** — new "LOGROS" tab with achievement cards
4. **`src/hooks/useGameState.ts`** — achievements state, fetch/claim callbacks
5. **`src/pages/Index.tsx`** — wire achievements + toast for new unlocks
6. **`src/components/game/StaminaBar.tsx`** — trophy counter badge

### Implementation Order
1. DB migration
2. Edge function achievement logic
3. NetworkScreen "LOGROS" tab UI
4. Hook integration + toast notifications

