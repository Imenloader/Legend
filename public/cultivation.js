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
        state.player.hp = state.player.maxHp;
        state.player.mp = state.player.maxMp;

        // Gather ambient Qi (XP)
        const qiGained = 15 + (state.player.cultivation.stageLevel * 5);
        state.player.xp += qiGained;

        let message = `You sit in lotus position, drawing heaven and earth essence into your meridians. Restored all HP/MP. Gathered ${qiGained} Qi.`;

        // Check for level up
        if (state.player.xp >= state.player.maxXp) {
            state.player.xp -= state.player.maxXp;
            state.player.lvl++;
            state.player.cultivation.stageLevel++;
            state.player.maxXp = Math.floor(state.player.maxXp * 1.5);
            state.player.maxHp += 10;
            state.player.maxMp += 5;
            state.player.atk += 2;
            state.player.hp = state.player.maxHp;
            message += `<br><br><span class="loot-epic">🌟 BREAKTHROUGH! Your cultivation deepens to ${state.player.cultivation.stage} Level ${state.player.cultivation.stageLevel}!</span>`;

            // Check if ready for major stage breakthrough
            if (state.player.cultivation.stageLevel >= 9) {
                state.player.cultivation.breakthroughReady = true;
                message += `<br><br><span class="loot-mythic">⚡ You have reached the absolute peak of this stage. You must face a Heavenly Tribulation to advance further!</span>`;
            }
        }

        return { success: true, message };
    },

    attemptBreakthrough(state) {
        if (!state.player.cultivation.breakthroughReady) {
            return { success: false, message: "Your Qi foundation is not yet solid enough. Continue meditating." };
        }

        const currentStageIdx = this.stages.findIndex(s => s.name === state.player.cultivation.stage);
        const nextStage = this.stages[currentStageIdx + 1];

        if (!nextStage) {
            return { success: false, message: "You have reached the pinnacle of mortal cultivation." };
        }

        // Check required pill
        if (nextStage.requiredPill) {
            const hasPill = state.player.inventory.items && state.player.inventory.items.some(it => 
                (typeof it === 'string' && it === nextStage.requiredPill) || 
                (typeof it === 'object' && it.name.toLowerCase().replace(/ /g, '_') === nextStage.requiredPill)
            );
            if (!hasPill) {
                return { success: false, message: `You require a ${nextStage.requiredPill.replace(/_/g, ' ')} to protect your meridians during this breakthrough.` };
            }
        }

        return { success: true, tribulationId: nextStage.tribulationId, nextStage: nextStage };
    },

    completeBreakthrough(state, nextStage) {
        // Consume pill
        if (nextStage.requiredPill) {
            const idx = state.player.inventory.items.indexOf(nextStage.requiredPill);
            if (idx > -1) state.player.inventory.items.splice(idx, 1);
        }

        state.player.cultivation.stage = nextStage.name;
        state.player.cultivation.stageLevel = 1;
        state.player.cultivation.breakthroughReady = false;

        // Apply massive bonuses
        state.player.maxHp += nextStage.bonus.hp;
        state.player.maxMp += nextStage.bonus.mp;
        state.player.atk += nextStage.bonus.atk;
        state.player.hp = state.player.maxHp;

        return `The dark clouds part. Golden light bathes your spirit root. You have successfully stepped into the <b>${nextStage.name}</b> realm!`;
    }
};
