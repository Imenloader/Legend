// ============================================================
// ASCENSION.JS — Gate of Ascension & Heavenly Continent
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.ASCENSION = {
    checkEligible(state) {
        if (!state.player.cultivation) return false;
        const stage = state.player.cultivation.stage;
        const stageLvl = state.player.cultivation.stageLevel;
        // Peak of Nascent Soul is level 10 and breakthrough is ready!
        return (stage === 'Nascent Soul' && stageLvl >= 10 && state.player.cultivation.breakthroughReady);
    },

    attemptPhysical(state) {
        if (!this.checkEligible(state)) {
            return { success: false, message: "Your soul has not yet crystallized to the peak of Nascent Soul." };
        }

        // Physical Ascension requires raw physical toughness: Defense >= 100
        if ((state.player.def || 0) < 100) {
            return { 
                success: false, 
                message: `<span style="color:var(--danger)"><b>Flesh Ascension Failed!</b> Your physical body was instantly torn apart by the spatial tribulation winds. You require at least <b>100 Defense</b> to walk through. Upgrade your Water Roots or Jade Body Refinement manual first!</span>` 
            };
        }

        return { success: true, method: 'physical' };
    },

    attemptCombat(state) {
        if (!this.checkEligible(state)) {
            return { success: false, message: "Your soul has not yet crystallized to the peak of Nascent Soul." };
        }

        // Spawns the legendary Gatekeeper Boss!
        const gatekeeper = {
            name: 'Heavenly Gatekeeper Shen',
            hp: 1500,
            maxHp: 1500,
            atk: 75,
            def: 40,
            dialogue: 'A mortal wishes to challenge the laws of heaven? Prove your right to tread upon the celestial path!',
            nextMove: null
        };

        state._pendingAscension = true;
        setTimeout(() => startCombat(gatekeeper), 1500);

        return { success: true, method: 'combat', message: "The sky rips open. Heavenly Gatekeeper Shen descends in a flash of gold light!" };
    },

    complete(state) {
        state.player.ascended = true;
        state.player.cultivation.stage = 'Deity Realm';
        state.player.cultivation.stageLevel = 1;
        state.player.cultivation.breakthroughReady = false;

        // Reset XP limits for celestial progression
        state.player.xp = 0;
        state.player.maxXp = 1000;

        // Massive celestial attribute bonuses!
        if (!state.player.cultivation.cultivationBonuses) {
            state.player.cultivation.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
        }
        const cb = state.player.cultivation.cultivationBonuses;
        cb.hp += 1000;
        cb.mp += 500;
        cb.atk += 200;
        cb.def += 100;

        // Fully restore player HP and MP
        calculateTotalStats();
        state.player.hp = state.player.maxHp;
        state.player.mp = state.player.maxMp;

        saveGame();
    }
};
