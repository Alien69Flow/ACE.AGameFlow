

## Plan: Next-Level Features — Copying What Works + Innovating

After analyzing the codebase and studying patterns from top Telegram mini-apps (Hamster Kombat, Notcoin, TapSwap, Catizen), here are the highest-impact features to implement next:

---

### 1. Upgrade Cards System (Hamster Kombat pattern)
The #1 retention mechanic in top apps. Users spend energy to buy permanent upgrades that increase passive and active earnings.

**New DB table: `upgrades`**
| Column | Type |
|---|---|
| id | uuid PK |
| profile_id | uuid FK |
| upgrade_type | text (tap_power, passive_income, max_stamina, regen_speed) |
| level | integer default 1 |
| purchased_at | timestamp |

**Upgrade catalog (hardcoded server-side):**
- **Tap Power** — increases energy per tap (1→2→3→5→8). Costs: 100, 500, 2000, 8000, 25000 energy
- **Passive Income** — earns energy/hour even offline (0→5→15→30→60/h). Costs: 200, 1000, 5000, 15000, 40000
- **Max Stamina** — increases cap (100→200→500→1000→2000). Costs: 150, 800, 3000, 10000, 30000
- **Regen Speed** — faster stamina recovery (1/min→2→3→5→8/min). Costs: 300, 1200, 4000, 12000, 35000

**UI:** New "Upgrades" tab in Navigation with card-style layout showing current level, cost, and effect preview.

### 2. Passive/Offline Income
When user returns, calculate hours away × passive income rate and show a "Welcome back! You earned X energy while away" modal. This is THE hook that brings users back daily beyond the daily reward.

**Edge function change:** `init-profile` calculates offline earnings on login based on `passive_income_level` and `last_seen_at` timestamp.

### 3. Daily Combo / Secret Code
Each day, a 3-card combination is "correct." Users who find it get a massive bonus (1000 energy). Creates daily buzz and social sharing.

**New DB table: `daily_combos`**
- `date` (date PK), `combo` (text[] — 3 upgrade types), `claimed_by` (jsonb array of profile IDs)

**UI:** A "Daily Combo" section in PlanetScreen showing 3 mystery slots. When user buys the right 3 upgrades that day, combo unlocks.

### 4. Clan/Squad System
Groups of players compete together. Top clans get weekly rewards. Drives viral growth.

**New DB tables:**
- `clans`: id, name, created_by, member_count, total_energy
- `clan_members`: profile_id, clan_id, role (leader/member), joined_at

**UI:** New section in NetworkScreen to create/join clans, see clan leaderboard.

### 5. Airdrop / Token Pre-Launch Page
Every top mini-app has an "Airdrop" tab showing users their future token allocation based on energy mined. Creates FOMO and retention.

**UI only (no backend needed yet):**
- New "Airdrop" screen showing: total energy mined, estimated $ALIEN allocation, countdown to TGE
- Tier badges: Bronze (0-1k), Silver (1k-10k), Gold (10k-100k), Diamond (100k+)
- "Tasks to boost allocation" linking to missions

### Files Modified
1. **DB migration** — `upgrades` table, `daily_combos` table, `clans` + `clan_members` tables, add `passive_income_level`, `tap_power_level`, `last_seen_at` to profiles
2. **`supabase/functions/game-api/index.ts`** — new endpoints: `buy-upgrade`, `get-upgrades`, `check-daily-combo`, `create-clan`, `join-clan`, `clan-leaderboard`; update `init-profile` for offline earnings
3. **`src/screens/UpgradesScreen.tsx`** — NEW: card-based upgrade shop
4. **`src/screens/AirdropScreen.tsx`** — NEW: airdrop allocation preview
5. **`src/screens/PlanetScreen.tsx`** — offline earnings modal, daily combo section
6. **`src/screens/NetworkScreen.tsx`** — clan section
7. **`src/components/game/Navigation.tsx`** — add Upgrades + Airdrop tabs (5 tabs total)
8. **`src/hooks/useGameState.ts`** — new state for upgrades, clans, offline earnings
9. **`src/pages/Index.tsx`** — wire new screens

### Implementation Order
1. DB migration (all tables at once)
2. Upgrade cards system (biggest retention impact)
3. Passive/offline income
4. Airdrop page (no backend, pure motivation)
5. Clan system
6. Daily combo

