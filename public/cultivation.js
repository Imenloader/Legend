// ============================================================
// CULTIVATION.JS — خلوة التدريب وشحذ الطاقة وتأمل الجسد والنفس
// "ملحمة الشرق الساحر: وصية الفرسان وأساطير الصحراء"
// ============================================================

window.CULTIVATION = {
    
    stages: [
        { name: 'السالك المبتدئ', requiredPill: null, tribulationId: null, bonus: { hp: 0, mp: 0, atk: 0 } },
        { name: 'القلب الجسور (تأسيس البنيان)', requiredPill: 'foundation_pill', tribulationId: 'trib_foundation', bonus: { hp: 50, mp: 20, atk: 10 } },
        { name: 'فارس الطاقة الباطنية (الجوهر المتين)', requiredPill: 'golden_core_pill', tribulationId: 'trib_core', bonus: { hp: 150, mp: 50, atk: 30 } },
        { name: 'الخالد ذو السيادة (الجسد المكتمل)', requiredPill: 'nascent_pill', tribulationId: 'trib_nascent', bonus: { hp: 500, mp: 200, atk: 100 } }
    ],

    bodyRealms: [
        { name: 'الجسد العادي', bonus: { hp: 0, def: 0 } },
        { name: 'الهيكل الفولاذي الصلب', bonus: { hp: 80, def: 4 } },
        { name: 'الجلد النحاسي المنيع', bonus: { hp: 200, def: 10 } },
        { name: 'العظام الحديدية المتينة', bonus: { hp: 500, def: 25 } },
        { name: 'الدرع الفولاذي الكامل', bonus: { hp: 1200, def: 60 } },
        { name: 'الهيكل الفضي الصامد', bonus: { hp: 2500, def: 130 } },
        { name: 'الهيكل الذهبي الخارق', bonus: { hp: 6000, def: 300 } }
    ],

    // --- طرائق التدريب البدني وفنون المبارزة ---
    methods: {
        'jade_body': { 
            id: 'jade_body', 
            name: 'مخطوطة التصلب والجسد الصخري', 
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
            name: 'أنفاس عاصفة الصحراء الشديدة', 
            desc: 'بتسرع نقاط الخبرة والتدريب البدني. +15% خبرة قتالية، +20% نقاط مانا وتدريب بدني.',
            bonus: { xpGain: 0.15, mpRegen: 0.2, atk: -0.1 },
            unlocked: false 
        }
    },

    meditate(state) {
        if (!state.player.cultivation) {
            state.player.cultivation = { stage: 'السالك المبتدئ', stageLevel: 1, breakthroughReady: false };
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
                practiceMsg = `<br>📖 اتعلمت واتدربت في <b>${this.methods[active].name}</b>: كسبت <b style="color:var(--secondary);">${masteryGain} نقاط بصيرة وتدريب</b> (${m.mastery}/${reqMastery})`;
                
                if (m.mastery >= reqMastery) {
                    m.mastery = 0;
                    m.level++;
                    practiceMsg += `<br><span class="loot-epic" style="text-shadow:0 0 8px var(--jade);">⭐ ارتقى فن قتالك! <b>${this.methods[active].name}</b> وصل للدرجة ${m.level}!</span>`;
                    calculateTotalStats();
                }
            } else {
                practiceMsg = `<br>📖 <b>${this.methods[active].name}</b> وصل لأعلى إتقان لمهارات الفتوة (الدرجة 10).`;
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
        let message = `قعدت في خلوة تدريب وشحذ همة، وركزت مجهودك البدني بالكامل. جمعت <b style="color:var(--secondary)">${qiGained} نقاط خبرة وتدريب</b>.${practiceMsg}`;

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
            message += `<br><br><span class="loot-epic">🌟 ارتقاء شأنك ومقامك الباطني! مستواك زاد ${levelsGained} درجات. مستواك القتالي الحالي هو <b>الرتبة ${cult.stageLevel}</b>.</span>`;
        }

        if (window.REBIRTH && window.REBIRTH.ageChildren) {
            const ageMsg = window.REBIRTH.ageChildren(state);
            if (ageMsg) message += ageMsg;
        }

        if (cult.stageLevel >= 10 && !cult.breakthroughReady) {
            cult.breakthroughReady = true;
            message += `<br><br><span class="loot-mythic" style="text-shadow: 0 0 10px var(--secondary);">⚡ وصلت لعقبة ومحك حقيقي! قدامك عقبة اختبار رتبة <b>${cult.stage}</b>. لازم تعمل اختبار شجاعة مباغت وتخوض التحدي الأكبر.</span>`;
        }

        return { success: true, message };
    },

    attemptBreakthrough(state) {
        if (!state.player.cultivation.breakthroughReady) {
            return { success: false, message: "بنيتك ومقامك الباطني بحاجة لمزيد من التأمل والتدريب الباطني!" };
        }

        const currentStageIdx = this.stages.findIndex(s => s.name === state.player.cultivation.stage);
        const nextStage = this.stages[currentStageIdx + 1];

        if (!nextStage) return { success: false, message: "ألف مبروك! وصلت لأعلى مراتب البطولة والسيادة الأسطورية." };

        // Enforce Required Pill
        if (nextStage.requiredPill) {
            const pillIndex = (state.player.inventory.items || []).findIndex(item => item.id === nextStage.requiredPill);
            if (pillIndex === -1) {
                const pillRecipe = window.CRAFTING && window.CRAFTING.alchemyRecipes ? window.CRAFTING.alchemyRecipes[nextStage.requiredPill] : null;
                const pillName = pillRecipe ? pillRecipe.name : nextStage.requiredPill.replace(/_/g, ' ');
                return { 
                    success: false, 
                    message: `<span style="color:var(--danger)"><b>اختبار الشجاعة اتمنع!</b> محتاج <b>${pillName}</b> لتهدئة عضلاتك وحماية هيكلك الجسدي من سحق المجهود الزايد وتخطي عقبة الرتبة الجديدة. حضّر إكسيراً أولاً في مرجل الخيمياء.</span>` 
                };
            }
            // Consume the pill!
            state.player.inventory.items.splice(pillIndex, 1);
        }

        // SUCCESS CHANCE: Harder for higher realms
        let baseChance = 0.8 - (currentStageIdx * 0.3);
        if (state.player.system?.id === 'jinn_luck') baseChance += 0.1;
        
        const roll = Math.random();
        if (roll > baseChance) {
            // FAILURE: Over-exhaustion
            state.player.hp = Math.floor(state.player.maxHp * 0.1); 
            state.player.xp = Math.floor(state.player.xp * 0.5); 
            return { success: false, message: `<span style="color:var(--danger)"><b>إرهاق ووهن باطني كامل!</b> جسدك لم يستطع تحمل الضغط الرهيب للتمرين الباطني. هيبتك تأثرت وخسرت نصف نقاط خبرتك الباطنية الحالية.</span>` };
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

        return `الأتباع والفرسان يهتفون باسمك لهيبتك وشجاعتك العظيمة. نجحت في الاختبار وارتقيت لرتبة <b>${nextStage.name}</b> بسلام وجدارة فرسان!`;
    },

    temperBody(state) {
        if (!state.player.cultivation) {
            state.player.cultivation = { stage: 'السالك المبتدئ', stageLevel: 1, breakthroughReady: false };
        }
        const cult = state.player.cultivation;
        if (!cult.bodyRealm) cult.bodyRealm = 'الجسد العادي';
        if (!cult.bodyLevel) cult.bodyLevel = 1;
        if (!cult.bodyXp) cult.bodyXp = 0;

        const bodyIdx = this.bodyRealms.findIndex(r => r.name === cult.bodyRealm);
        const reqXp = Math.floor(80 * Math.pow(1.35, (bodyIdx * 10) + cult.bodyLevel));
        
        // Cost in Qi/XP:
        const qiCost = Math.floor(reqXp * 0.7);
        if ((state.player.xp || 0) < qiCost) {
            return { success: false, message: `ليس لديك نقاط خبرة وتدريب كافية. تحتاج إلى <b>${qiCost} نقاط تدريب</b> لتقوية بنيتك الباطنية.` };
        }

        state.player.xp -= qiCost;
        cult.bodyXp += qiCost;

        let msg = `وجّهت تركيزك ومجهودك التدريبي لتطهير جسدك وعظامك مباشرة لتقوية بنيتك الباطنية من الوهن والكسل. صرفت <b>${qiCost} نقاط تدريب</b>.`;
        
        if (cult.bodyXp >= reqXp) {
            cult.bodyXp = 0;
            cult.bodyLevel++;
            if (cult.bodyLevel > 10) {
                const nextIdx = bodyIdx + 1;
                if (this.bodyRealms[nextIdx]) {
                    cult.bodyRealm = this.bodyRealms[nextIdx].name;
                    cult.bodyLevel = 1;
                    msg += `<br><span class="loot-epic" style="text-shadow:0 0 8px var(--secondary);">💪 ارتقاء صلابة جسدك! هيكلك الجسدي اترقى لرتبة <b>${cult.bodyRealm}</b>!</span>`;
                } else {
                    cult.bodyLevel = 10;
                    msg += `<br>💪 وصلت لأقصى درجات صلابة الهيكل البدني الممكنة!`;
                }
            } else {
                msg += `<br>💪 قويت وعززت جزء من عضلاتك! مستوى الصلابة الحالي اترقى لـ <b>${cult.bodyLevel}/10</b>.`;
            }
            calculateTotalStats();
        }

        return { success: true, message: msg };
    }
};
