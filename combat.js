// combat.js – ES module shim
// Imports the pure combat engine and exposes it globally for all legacy scripts.

import { CombatEngine } from './combat_engine.js';

window.COMBAT = CombatEngine;

export default CombatEngine;