// ============================================================
// ASCENSION.JS — The Final Boundary
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.ASCENSION = {
    stages: [
        { name: 'Nascent Soul', minLvl: 10, difficulty: 1 },
        { name: 'Soul Transformation', minLvl: 15, difficulty: 2 },
        { name: 'Great Perfection', minLvl: 20, difficulty: 5 }
    ],

    // Start the Heavenly Tribulation survival challenge
    startTribulation(state, narrate, triggerCombat) {
        narrate("The sky turns a bruised purple. The air crackles with the wrath of the Heavenly Dao.", "Heavenly Dao");
        narrate("To transcend the mortal coil, you must survive the <b>Nine Lightning Strikes</b>.", "System");
        
        state.tribulationStrikes = 0;
        this.nextStrike(state, narrate, triggerCombat);
    },

    nextStrike(state, narrate, triggerCombat) {
        state.tribulationStrikes++;
        if (state.tribulationStrikes > 9) {
            this.completeAscension(state, narrate);
            return;
        }

        const dmg = Math.floor(20 * state.tribulationStrikes * (window.BALANCE ? window.BALANCE.xpMultiplier : 1));
        narrate(`<b>⚡ Strike ${state.tribulationStrikes}/9</b> descends!`, "Heavenly Dao");
        
        // Survival Combat or simple Stat Check? Let's do a survival check.
        const playerDef = state.player.def || 10;
        const netDmg = Math.max(10, dmg - playerDef);
        
        state.player.hp -= netDmg;
        narrate(`The lightning shears through your Qi! You take ${netDmg} damage.`, "System");
        
        if (state.player.hp <= 0) {
            narrate("Your soul is incinerated by the heavens. You have failed to ascend.", "System");
            // handleDefeat() should be called from game.js
        } else {
            // Chance to gain stats per strike survived
            state.player.maxHp += 5;
            if (state.tribulationStrikes < 9) {
                setTimeout(() => this.nextStrike(state, narrate, triggerCombat), 2000);
            } else {
                this.completeAscension(state, narrate);
            }
        }
    },

    completeAscension(state, narrate) {
        narrate("The clouds part. A pillar of golden light descends, pulling your soul toward the Higher Realms.", "Heavenly Dao");
        narrate("<b>ASCENSION SUCCESSFUL!</b> You have transcended mortality.", "System");
        
        state.player.isAscended = true;
        state.player.lvl += 10; // Massive boost
        state.player.karma += 50; 
        
        // Unlock Celestial Legacy
        if (!state.legacy) state.legacy = { ancestralTraits: [] };
        state.legacy.ancestralTraits.push('Celestial Sovereign');
        
        setTimeout(() => {
            if (typeof hubLoop === 'function') hubLoop();
        }, 3000);
    }
};
