# Wrench's Journal - Legend 🔧

## 2026-05-16 - Global Resource Race Condition
Learning: Modules like `SKILLS`, `LORE`, and `CULTIVATION` are attached to the `window` object asynchronously via separate `<script>` tags. If `calculateTotalStats` runs during initial load before these scripts execute, it can encounter `undefined` references or partial objects.
Action: Always use optional chaining (`window.SKILLS?.getPassiveBonuses`) and provide fallback objects `{}` or `0` to prevent calculation crashes.

## 2026-05-16 - Transaction Safety & Free Items
Learning: A missing deduction step in the auction resolution logic allowed players to win items for free. Additionally, bidding logic was missing a gold-on-hand check, allowing for "ghost bidding".
Action: Implement strict gold-on-hand validation during bidding and ensure the resolution logic explicitly deducts gold before granting rewards.

## 2026-05-16 - Cultivation Level Bottleneck
Learning: The `meditate` function only checked for a single level-up per action. If a player gained massive Qi (e.g. from an event or idle progress), excess XP was trapped behind a "one level per turn" limit.
Action: Refactor the XP check into a `while` loop to process multiple level-ups and ensure `cultivationBonuses` are added sequentially.

## 2026-05-16 - Ghost Regions & Missing Rosters
Learning: The `Explore` feature relied on region-specific enemy rosters. One of these (`ARABIAN_ENEMIES`) was referenced in the code but never defined in `lore.js`, leading to a silent failure where the region appeared empty or crashed the turn resolution.
Action: Defined the missing rosters and implemented a robust `getRegionEnemies` helper that safely handles missing data by filtering the global registry.
