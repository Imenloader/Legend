## 2024-05-15 - DOM Queries in Hot Loops
**Learning:** The application's `updateTopBar` function was calling `document.getElementById` for 8 different elements very frequently (e.g., inside combat loops and on every screen transition). This caused unnecessary DOM querying overhead.
**Action:** Always verify if functions called inside frequent loops (`requestAnimationFrame`, combat loops, etc.) perform redundant DOM queries. Cache these elements at the module level upon initialization.
