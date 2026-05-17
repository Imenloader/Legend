// ============================================================
// CULTIVATION.JS — الأوراد والارتقاء الروحي وتطهير الهيكل الفاني
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.CULTIVATION = {
    
    stages: [
        { name: 'مقابلة السالك المبتدئ', requiredPill: null, tribulationId: null, bonus: { hp: 0, mp: 0, atk: 0 } },
        { name: 'مقام التمكين والولاية', requiredPill: 'foundation_pill', tribulationId: 'trib_foundation', bonus: { hp: 50, mp: 20, atk: 10 } },
        { name: 'تجلي الجوهر والسر الصافي', requiredPill: 'golden_core_pill', tribulationId: 'trib_core', bonus: { hp: 150, mp: 50, atk: 30 } },
        { name: 'مقام الروح النورانية اللطيفة', requiredPill: 'nascent_pill', tribulationId: 'trib_nascent', bonus: { hp: 500, mp: 200, atk: 100 } }
    ],

    bodyRealms: [
        { name: 'الجسد الطيني الفاني', bonus: { hp: 0, def: 0 } },
        { name: 'العظام السبجية الصلبة', bonus: { hp: 80, def: 4 } },
        { name: 'الجلد النحاسي الحصين', bonus: { hp: 200, def: 10 } },
        { name: 'عظام المرجان والبركة', bonus: { hp: 500, def: 25 } },
        { name: 'الجسد الياقوتي المتين', bonus: { hp: 1200, def: 60 } },
        { name: 'جوهر البلور السحري', bonus: { hp: 2500, def: 130 } },
        { name: 'الهيكل الصلب الكامل', bonus: { hp: 6000, def: 300 } }
    ],

    // --- طرائق الأذكار والفنون الروحية (Cultivation Methods) ---
    methods: {
        'jade_body': { 
            id: 'jade_body', 
            name: 'سر الجسد الصخري الصلب', 
            desc: 'بيركز على زيادة متانة الهيكل وقوة تحمله الجسدية. +25% صحة قصوى، +10% دفاع.',
            bonus: { maxHp: 0.25, def: 0.1, atk: -0.05 },
            unlocked: true 
        },
        'sword_heart': { 
            id: 'sword_heart', 
            name: 'مخطوطة السيف الدمشقي الحاد', 
            desc: 'قوة هجومية لا يعلى عليها تكسر دروع الأعداء. +30% هجوم، +5% ضربات قاضية.',
            bonus: { atk: 0.3, critRate: 0.05, maxHp: -0.1 },
            unlocked: false 
        },
        'desert_wind': { 
            id: 'desert_wind', 
            name: 'أنفاس رياح الصحراء السحرية', 
            desc: 'بتسرع كسب البركة الروحية والمانا وتنشيط قنوات النور. +15% خبرة روحية، +20% مانا تأمل.',
            bonus: { xpGain: 0.15, mpRegen: 0.2, atk: -0.1 },
            unlocked: false 
        }
    },

    meditate(state) {
        if (!state.player.cultivation) {
            state.player.cultivation = { stage: 'مقابلة السالك المبتدئ', stageLevel: 1, breakthroughReady: false };
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
                practiceMsg = `<br>📖 اتعلمت وتأملت في <b>${this.methods[active].name}</b>: كسبت <b style="color:var(--secondary);">${masteryGain} بصيرة روحية</b> (${m.mastery}/${reqMastery})`;
                
                if (m.mastery >= reqMastery) {
                    m.mastery = 0;
                    m.level++;
                    practiceMsg += `<br><span class="loot-epic" style="text-shadow:0 0 8px var(--jade);">⭐ ارتقى الفن الروحي! <b>${this.methods[active].name}</b> وصل للدرجة ${m.level}!</span>`;
                    calculateTotalStats();
                }
            } else {
                practiceMsg = `<br>📖 <b>${this.methods[active].name}</b> وصل لأعلى تجلي وقمة الإتقان (الدرجة 10).`;
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
        let message = `قعدت في خلوة وصومعة، وممرت المانا والأنوار الروحانية في قنواتك. جمعت <b style="color:var(--secondary)">${qiGained} نور روحي</b>.${practiceMsg}`;

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
            message += `<br><br><span class="loot-epic">🌟 ارتقاء وتجلي النواة الروحية! مستواك زاد ${levelsGained} درجات. مستواك الروحي الحالي هو <b>الدرجة ${cult.stageLevel}</b>.</span>`;
        }

        if (cult.stageLevel >= 10 && !cult.breakthroughReady) {
            cult.breakthroughReady = true;
            message += `<br><br><span class="loot-mythic" style="text-shadow: 0 0 10px var(--secondary);">⚡ وصلت لعنق زجاجة وعقبة روحية! قدامك عقبة مقام <b>${cult.stage}</b>. لازم تعمل طقس ارتقاء مباغت وتخوض التجربة.</span>`;
        }

        return { success: true, message };
    },

    attemptBreakthrough(state) {
        if (!state.player.cultivation.breakthroughReady) {
            return { success: false, message: "قنواتك الروحية لسة ضيقة أوي. محتاج تعمل خلوة وتأمل أكتر!" };
        }

        const currentStageIdx = this.stages.findIndex(s => s.name === state.player.cultivation.stage);
        const nextStage = this.stages[currentStageIdx + 1];

        if (!nextStage) return { success: false, message: "ألف مبروك! وصلت لأعلى مراتب الروحانية والولاية العظمى للفانيين." };

        // Enforce Required Pill
        if (nextStage.requiredPill) {
            const pillIndex = (state.player.inventory.items || []).findIndex(item => item.id === nextStage.requiredPill);
            if (pillIndex === -1) {
                const pillRecipe = window.CRAFTING && window.CRAFTING.alchemyRecipes ? window.CRAFTING.alchemyRecipes[nextStage.requiredPill] : null;
                const pillName = pillRecipe ? pillRecipe.name : nextStage.requiredPill.replace(/_/g, ' ');
                return { 
                    success: false, 
                    message: `<span style="color:var(--danger)"><b>الارتقاء اتمنع!</b> محتاج <b>${pillName}</b> لحماية روحك وجسدك من الفرقعة وتخطي عقبة المقام. اطبخ حبة أولاً في موقد الكيمياء.</span>` 
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
            return { success: false, message: `<span style="color:var(--danger)"><b>تشتت وهلاك روحي!</b> قنواتك مقدرتش تتحمل الضغط الرهيب. هالتك اتصابت وخسرت نص خبرتك ونورك الحالي.</span>` };
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

        return `السما بتنور والرعد بيلعلع وروحك بتتجلى كليا كأولياء الله الصالحين. ارتقيت لمقام <b>${nextStage.name}</b> بسلام وبركة!`;
    },

    temperBody(state) {
        if (!state.player.cultivation) {
            state.player.cultivation = { stage: 'مقابلة السالك المبتدئ', stageLevel: 1, breakthroughReady: false };
        }
        const cult = state.player.cultivation;
        if (!cult.bodyRealm) cult.bodyRealm = 'الجسد الطيني الفاني';
        if (!cult.bodyLevel) cult.bodyLevel = 1;
        if (!cult.bodyXp) cult.bodyXp = 0;

        const bodyIdx = this.bodyRealms.findIndex(r => r.name === cult.bodyRealm);
        const reqXp = Math.floor(80 * Math.pow(1.35, (bodyIdx * 10) + cult.bodyLevel));
        
        // Cost in Qi/XP:
        const qiCost = Math.floor(reqXp * 0.7);
        if ((state.player.xp || 0) < qiCost) {
            return { success: false, message: `معندكش نور روحي كفاية. محتاج <b>${qiCost} نور</b> لتطهير وتصلين هيكلك الجسدي الطيني.` };
        }

        state.player.xp -= qiCost;
        cult.bodyXp += qiCost;

        let msg = `وجهت الأنوار الروحية لعضامك وعضلاتك مباشرة لتطهير جسدك الفاني من الطين والوهن. صرفت <b>${qiCost} نور</b>.`;
        
        if (cult.bodyXp >= reqXp) {
            cult.bodyXp = 0;
            cult.bodyLevel++;
            if (cult.bodyLevel > 10) {
                const nextIdx = bodyIdx + 1;
                if (this.bodyRealms[nextIdx]) {
                    cult.bodyRealm = this.bodyRealms[nextIdx].name;
                    cult.bodyLevel = 1;
                    msg += `<br><span class="loot-epic" style="text-shadow:0 0 8px var(--secondary);">💪 ارتقاء صلابة الجسد! هيكلك الجسدي اترقى لدرجة <b>${cult.bodyRealm}</b>!</span>`;
                } else {
                    cult.bodyLevel = 10;
                    msg += `<br>💪 وصلت لأقصى درجات صلابة الهيكل الفاني الممكنة!`;
                }
            } else {
                msg += `<br>💪 طهرت جزء من جسدك! مستوى الصلابة الحالي اترقى لـ <b>${cult.bodyLevel}/10</b>.`;
            }
            calculateTotalStats();
        }

        return { success: true, message: msg };
    }
};
