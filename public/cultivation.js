// ============================================================
// CULTIVATION.JS — Phase 4: Cultivation & Progression
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.CULTIVATION = {
    
    stages: [
        { name: 'Qi Condensation', requiredPill: null, tribulationId: null, bonus: { hp: 0, mp: 0, atk: 0 } },
        { name: 'Foundation Establishment', requiredPill: 'foundation_pill', tribulationId: 'trib_foundation', bonus: { hp: 50, mp: 20, atk: 10 } },
        { name: 'Core Formation', requiredPill: 'golden_core_pill', tribulationId: 'trib_core', bonus: { hp: 150, mp: 50, atk: 30 } },
        { name: 'Nascent Soul', requiredPill: 'nascent_pill', tribulationId: 'trib_nascent', bonus: { hp: 500, mp: 200, atk: 100 } }
    ],

    // --- Cultivation Methods (Manuals) ---
    methods: {
        'jade_body': { 
            id: 'jade_body', 
            name: 'Jade Body Refinement', 
            desc: 'Focus on physical toughness. +25% Max HP, +10% Defense.',
            bonus: { maxHp: 0.25, def: 0.1, atk: -0.05 },
            unlocked: true 
        },
        'sword_heart': { 
            id: 'sword_heart', 
            name: 'Sword Heart Manual', 
            desc: 'Unmatched offensive power. +30% Attack, +5% Crit Rate.',
            bonus: { atk: 0.3, critRate: 0.05, maxHp: -0.1 },
            unlocked: false 
        },
        'desert_wind': { 
            id: 'desert_wind', 
            name: 'Desert Wind Qi', 
            desc: 'Faster XP gain and MP recovery. +15% XP Gain, +20% MP Regen.',
            bonus: { xpGain: 0.15, mpRegen: 0.2, atk: -0.1 },
            unlocked: false 
        }
    },

    meditate(state) {
        if (!state.player.cultivation) {
            state.player.cultivation = { stage: 'Qi Condensation', stageLevel: 1, breakthroughReady: false };
        }
        const cult = state.player.cultivation;

        // Initialize techniques state if absent
        if (!cult.methodsState) {
            cult.methodsState = {
                'jade_body': { level: 1, mastery: 0 },
                'sword_heart': { level: 0, mastery: 0 },
                'desert_wind': { level: 0, mastery: 0 }
            };
        }

        // Restore HP and MP
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + (state.player.maxHp * 0.1));
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + (state.player.maxMp * 0.1));

        // 1. Practice Active Cultivation Technique (Scientific Mastery Formula)
        let practiceMsg = "";
        const active = cult.activeMethod;
        if (active && cult.methodsState[active]) {
            const m = cult.methodsState[active];
            if (m.level < 10) {
                const arrayLvl = state.dwelling?.qiArrayLevel || 1;
                const earthRoot = state.dwelling?.roots?.earth || 1;
                const masteryGain = Math.floor(arrayLvl * 2 + earthRoot * 1.5 + 10);
                
                m.mastery += masteryGain;
                const reqMastery = Math.floor(100 * Math.pow(1.6, m.level));
                practiceMsg = `<br>📖 Practiced <b>${this.methods[active].name}</b>: Gained <b style="color:var(--secondary);">${masteryGain} Mastery</b> (${m.mastery}/${reqMastery})`;
                
                if (m.mastery >= reqMastery) {
                    m.mastery = 0;
                    m.level++;
                    practiceMsg += `<br><span class="loot-epic" style="text-shadow:0 0 8px var(--jade);">⭐ TECHNIQUE UPGRADED! <b>${this.methods[active].name}</b> ascended to Grade ${m.level}!</span>`;
                    calculateTotalStats();
                }
            } else {
                practiceMsg = `<br>📖 <b>${this.methods[active].name}</b> has reached its ultimate pinnacle (Grade 10).`;
            }
        }

        // 2. Gather Ambient Qi (Scientific Matrix)
        let techLvlSum = 0;
        Object.values(cult.methodsState).forEach(tech => {
            techLvlSum += tech.level || 0;
        });

        // Family Shrine Modifier
        let pagodaMult = 1.0;
        if (state.player.familyPagodaLevel >= 1) pagodaMult += 0.10;

        // Sect Cultivation Array modifier
        let sectArrayMult = 1.0;
        if (state.sect && state.sect.disciples) {
            state.sect.disciples.forEach(d => {
                if (d.alive && d.assignment === 'array') {
                    sectArrayMult += (d.lvl || 1) * 0.05;
                }
            });
        }

        const stageProgress = (cult.stageLevel / 10);
        const methodBonus = state.player.xpGainBonus || 0;
        const baseQi = 15 + (state.player.lvl * 5);
        
        // Multiplier based on all masteries + background + family shrine
        const qiMultiplier = 1.0 + techLvlSum * 0.08;
        const qiGained = Math.max(5, Math.floor(baseQi * (1.2 - stageProgress) * qiMultiplier * (1 + methodBonus) * pagodaMult * sectArrayMult));
        
        state.player.xp += qiGained;
        let levelsGained = 0;
        let message = `You sit in a lotus position, cycling spiritual Qi through your meridians. You gather <b style="color:var(--secondary)">${qiGained} ambient Qi</b>.${practiceMsg}`;

        // Handle level breakthroughs using dynamic curves
        while (state.player.xp >= state.player.maxXp && cult.stageLevel < 10) {
            state.player.xp -= state.player.maxXp;
            state.player.lvl++;
            cult.stageLevel++;
            state.player.maxXp = 100 + (state.player.lvl - 1) * 80;
            levelsGained++;
            
            if (!cult.cultivationBonuses) {
                cult.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
            }
            const cb = cult.cultivationBonuses;
            cb.hp += 25; 
            cb.mp += 15;
            cb.atk += 5;
            cb.def += 2;
        }

        if (levelsGained > 0) {
            message += `<br><br><span class="loot-epic">🌟 CORE BREATHING breakthrough! Gained ${levelsGained} level(s). Current cultivation level is now <b>Level ${cult.stageLevel}</b>.</span>`;
        }

        if (cult.stageLevel >= 10 && !cult.breakthroughReady) {
            cult.breakthroughReady = true;
            message += `<br><br><span class="loot-mythic" style="text-shadow: 0 0 10px var(--secondary);">⚡ REALM BOTTLENECK REACHED. The bottleneck of the <b>${cult.stage}</b> realm is before you. You must risk a Breakthrough.</span>`;
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

        // Enforce Required Pill
        if (nextStage.requiredPill) {
            const pillIndex = (state.player.inventory.items || []).findIndex(item => item.id === nextStage.requiredPill);
            if (pillIndex === -1) {
                const pillRecipe = window.CRAFTING && window.CRAFTING.alchemyRecipes ? window.CRAFTING.alchemyRecipes[nextStage.requiredPill] : null;
                const pillName = pillRecipe ? pillRecipe.name : nextStage.requiredPill.replace(/_/g, ' ');
                return { 
                    success: false, 
                    message: `<span style="color:var(--danger)"><b>Breakthrough Blocked!</b> You require a <b>${pillName}</b> to protect your soul and cross the breakthrough threshold. Brew one in the Alchemy Furnace first.</span>` 
                };
            }
            // Consume the pill!
            state.player.inventory.items.splice(pillIndex, 1);
        }

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

        // Reset XP progress parameters for the new realm
        state.player.xp = 0;
        state.player.maxXp = 100 + (state.player.lvl - 1) * 80;

        if (!state.player.cultivation.cultivationBonuses) {
            state.player.cultivation.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
        }
        const cb = state.player.cultivation.cultivationBonuses;
        cb.hp += nextStage.bonus.hp || 0;
        cb.mp += nextStage.bonus.mp || 0;
        cb.atk += nextStage.bonus.atk || 0;

        return `The heavens tremble as your soul crystallizes. You have ascended to the <b>${nextStage.name}</b> realm!`;
    }
};
