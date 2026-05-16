// ============================================================
// CULTIVATION.JS — Phase 4: Cultivation & Progression
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.CULTIVATION = {
    
    stages: [
        { name: 'Qi Condensation', requiredPill: null, tribulationId: null, bonus: { hp: 0, mp: 0, atk: 0 } },
        { name: 'Foundation Establishment', requiredPill: 'foundation_pill', tribulationId: 'trib_foundation', bonus: { hp: 50, mp: 20, atk: 10 } },
        { name: 'Core Formation', requiredPill: 'golden_core_pill', tribulationId: 'trib_core', bonus: { hp: 150, mp: 50, atk: 30 } },
        { name: 'Nascent Soul', requiredPill: 'nascent_soul_elixir', tribulationId: 'trib_nascent', bonus: { hp: 500, mp: 200, atk: 100 } }
    ],

    meditate(state) {
        // Restore HP and MP
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + (state.player.maxHp * 0.1));
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + (state.player.maxMp * 0.1));

        // Gather ambient Qi (Diminishing returns as you reach peak)
        const stageProgress = (state.player.cultivation.stageLevel / 10);
        const baseQi = 10 + (state.player.lvl * 2);
        const qiGained = Math.max(1, Math.floor(baseQi * (1.1 - stageProgress)));
        
        state.player.xp += qiGained;

        let message = `You sit in lotus position. Meridians pulse with ${qiGained} gathered Qi.`;

        // Check for level up (Harder scaling)
        if (state.player.xp >= state.player.maxXp) {
            state.player.xp -= state.player.maxXp;
            state.player.lvl++;
            state.player.cultivation.stageLevel++;
            state.player.maxXp = Math.floor(state.player.maxXp * 2.1); // HELL SCALING
            state.player.maxHp += 15;
            state.player.maxMp += 8;
            state.player.atk += 3;
            state.player.hp = state.player.maxHp;
            message += `<br><br><span class="loot-epic">🌟 LEVEL UP! You are now Level ${state.player.lvl}. Your Qi foundation deepens.</span>`;

            if (state.player.cultivation.stageLevel >= 10) {
                state.player.cultivation.breakthroughReady = true;
                message += `<br><br><span class="loot-mythic">⚡ PEAK REACHED. The bottleneck of the ${state.player.cultivation.stage} realm is before you. You must risk a Breakthrough.</span>`;
            }
        }

        return { success: true, message };
    },

    attemptBreakthrough(state) {
        if (!state.player.cultivation.breakthroughReady) {
            return { success: false, message: "Your meridians are still too narrow. Meditate more." };
        }

        const currentStageIdx = this.stages.findIndex(s => s.name === state.player.cultivation.stage);
        const nextStage = this.stages[currentStageIdx + 1];

        if (!nextStage) return { success: false, message: "You have reached the pinnacle of mortality." };

        // SUCCESS CHANCE: Harder for higher realms
        // Foundation: 80%, Core: 50%, Nascent: 20%
        let baseChance = 0.8 - (currentStageIdx * 0.3);
        if (state.player.system?.id === 'jinn_luck') baseChance += 0.1;
        
        const roll = Math.random();
        if (roll > baseChance) {
            // FAILURE: Qi Deviation
            state.player.hp = Math.floor(state.player.maxHp * 0.1); // Dropped to 10%
            state.player.xp = Math.floor(state.player.xp * 0.5); // Lose half current XP
            return { success: false, message: `<span style="color:var(--danger)"><b>Qi Deviation!</b> Your meridians buckled under the pressure. You have suffered internal injuries and lost half your XP progress.</span>` };
        }

        return { success: true, tribulationId: nextStage.tribulationId, nextStage: nextStage };
    },

    completeBreakthrough(state, nextStage) {
        state.player.cultivation.stage = nextStage.name;
        state.player.cultivation.stageLevel = 1;
        state.player.cultivation.breakthroughReady = false;

        state.player.maxHp += nextStage.bonus.hp;
        state.player.maxMp += nextStage.bonus.mp;
        state.player.atk += nextStage.bonus.atk;
        state.player.hp = state.player.maxHp;

        return `The heavens tremble as your soul crystallizes. You have ascended to the <b>${nextStage.name}</b> realm!`;
    }
};
