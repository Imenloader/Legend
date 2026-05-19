// ============================================================
// REBIRTH.JS — الميراث ووصية العهد ومخلفات الأجداد العريقة
// "ملحمة الشرق الساحر: وصية الفتوة وأساطير الصحراء"
// ============================================================

window.REBIRTH = {
    traits: {
        'heavenly_bones': { 
            id: 'heavenly_bones', 
            name: 'بنية بدنية صلبة', 
            desc: '+20% صحة أساسية دائمة مع كتابة وصية وميراث عهد جديد.', 
            bonus: { hp: 0.2 } 
        },
        'spirit_eye': { 
            id: 'spirit_eye', 
            name: 'بصيرة حادة', 
            desc: '+10% فرصة ضربة قاضية دائمة مع كتابة وصية وميراث عهد جديد.', 
            bonus: { crit: 0.1 } 
        },
        'jinn_luck': { 
            id: 'jinn_luck', 
            name: 'بركة في الرزق', 
            desc: '+50% كسب دنانير ذهبية إضافية للأبد.', 
            bonus: { goldMult: 0.5 } 
        },
        'sword_master': { 
            id: 'sword_master', 
            name: 'براعة النصال', 
            desc: '+15% قوة هجوم دائم مع كتابة وصية وميراث عهد جديد.', 
            bonus: { atk: 0.15 } 
        },
        'shield_master': { 
            id: 'shield_master', 
            name: 'صلابة الدفاع', 
            desc: '+15% قوة دفاع دائم مع كتابة وصية وميراث عهد جديد.', 
            bonus: { def: 0.15 } 
        },
        'quick_learner': { 
            id: 'quick_learner', 
            name: 'سرعة التعلم', 
            desc: '+25% كسب خبرة وتدريب دائم مع كتابة وصية وميراث عهد جديد.', 
            bonus: { xpMult: 0.25 } 
        }
    },

    // Initialize legacy state
    init(state) {
        if (!state.legacy) {
            state.legacy = {
                rebirthCount: 0,
                totalLevels: 0,
                traits: [],
                permanentStats: { atk: 0, def: 0, hp: 0, mp: 0 }
            };
        }
        if (!state.player.family) {
            state.player.family = [];
        }
    },

    // Dynamic child aging processed during meditations (deep years passing)
    ageChildren(state) {
        if (!state.player.family) return "";
        let agedList = [];
        state.player.family.forEach(f => {
            if (f.relation === 'Child' && f.alive) {
                f.age = (f.age || 0) + 1;
                if (f.age === 6) {
                    agedList.push(`👶 كبر ابنك <b>${f.name}</b> وأصبح طفلاً صغيراً (سن 6 سنوات)!`);
                } else if (f.age === 13) {
                    agedList.push(`👦 كبر ابنك <b>${f.name}</b> وأصبح يافعاً يستطيع التدريب (سن 13 سنة)!`);
                } else if (f.age === 18) {
                    agedList.push(`⚔️ كبر ابنك <b>${f.name}</b> وبلغ سن الرشد والفروسية (سن 18 سنة)! وهو جاهز الآن لوراثة العهد.`);
                }
            }
        });
        return agedList.length > 0 ? `<br><br>` + agedList.join('<br>') : "";
    },

    // Dynamic child training
    trainChild(state, childId, path) {
        const child = (state.player.family || []).find(f => f.id === childId && f.relation === 'Child');
        if (!child) return { success: false, message: "الابن غير موجود!" };
        if (child.age < 13) return { success: false, message: "الابن لا يزال صغيراً على التدريب! يجب أن يبلغ 13 سنة على الأقل." };
        if (child.age >= 18) return { success: false, message: "لقد أتم سليلك تدريبه القتالي وبالفعل أصبح ناضجاً وجاهزاً لوراثة العهد!" };
        
        const cost = 500;
        if (state.player.gold < cost) return { success: false, message: `ليس لديك ${cost} دينار ذهبي لتغطية تكاليف التدريب والمعدات الباطنية!` };
        
        state.player.gold -= cost;
        child.lvl = (child.lvl || 1) + 1;
        child.education = path;
        
        const pathMap = {
            'combat': '⚔️ تدريب النصال والقوة الهجومية (+3 هجوم أساسي موروث)',
            'defense': '🛡️ تدريب الدروع والصلابة الدفاعية (+2 دفاع أساسي موروث)',
            'alchemy': '⚗️ دراسة الخيمياء والرقية (+1 إكسير مانا موروث)'
        };
        
        if (!child.trainingStats) {
            child.trainingStats = { atk: 0, def: 0, potions: 0 };
        }
        
        if (path === 'combat') child.trainingStats.atk += 3;
        else if (path === 'defense') child.trainingStats.def += 2;
        else if (path === 'alchemy') child.trainingStats.potions += 1;
        
        return { 
            success: true, 
            message: `قمت بتعيين <b>${child.name}</b> في <b>${pathMap[path]}</b>! مستوى مهاراته أصبح الآن <b>المرتبة ${child.lvl}</b>.` 
        };
    },

    // Appoint a successor and carry over legacy inheritance will
    performInheritance(state, childId) {
        this.init(state);
        const child = state.player.family.find(f => f.id === childId && f.relation === 'Child');
        if (!child) return { success: false, message: "لم يتم العثور على السليل المحدد." };
        if (child.age < 18) return { success: false, message: "هذا السليل لم يبلغ سن الرشد (18 سنة) ليتحمل عهد الفرسان!" };
        
        const oldName = state.player.name;
        const oldLevel = state.player.lvl;
        
        // Appoint child as the new player
        state.legacy.rebirthCount++;
        state.legacy.totalLevels += oldLevel;
        if (child.trait && child.trait.id) {
            state.legacy.traits.push(child.trait.id);
        }
        
        // Accumulate permanent inherited legacy stats from father
        const inheritedAtk = Math.floor(state.player.atk * 0.05) + (child.trainingStats?.atk || 0);
        const inheritedDef = Math.floor(state.player.def * 0.05) + (child.trainingStats?.def || 0);
        const inheritedHp = Math.floor(state.player.maxHp * 0.05);
        const inheritedMp = Math.floor(state.player.maxMp * 0.05);
        
        state.legacy.permanentStats.atk += inheritedAtk;
        state.legacy.permanentStats.def += inheritedDef;
        state.legacy.permanentStats.hp += inheritedHp;
        state.legacy.permanentStats.mp += inheritedMp;
        
        // Move parent to retired ancestors in the family array
        const retiredParent = {
            id: `fam_retired_${Date.now()}`,
            name: oldName,
            relation: `retired_father`, // Programmatic tag representing retired father
            affinity: 100,
            alive: false, // Retired from active fettle/combat
            lvl: oldLevel,
            trait: state.player.inheritedTrait || null
        };
        
        // Remove child from family and push the retired parent
        state.player.family = state.player.family.filter(f => f.id !== childId);
        state.player.family.push(retiredParent);
        
        // Inherit gold based on Pagoda upgrades
        const pagodaLvl = state.player.familyPagodaLevel || 0;
        let goldInheritRate = 0.2; // base 20%
        if (pagodaLvl === 1) goldInheritRate = 0.4;
        else if (pagodaLvl === 2) goldInheritRate = 0.7;
        else if (pagodaLvl === 3) goldInheritRate = 1.0;
        
        const inheritedGold = Math.floor(state.player.gold * goldInheritRate);
        
        // Re-initialize player state with new successor details
        const oldClass = state.player.class;
        const oldSprite = state.player.sprite;
        const oldFamily = state.player.family;
        const oldPagodaLvl = state.player.familyPagodaLevel || 0;
        const oldDwelling = state.dwelling;
        const oldSect = state.sect;
        
        state.player = {
            name: child.name,
            class: oldClass,
            sprite: oldSprite,
            lvl: 1, xp: 0, maxXp: 100,
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            atk: 10, def: 5,
            gold: inheritedGold + 100, 
            karma: 0,
            children: 0, kills: 0,
            family: oldFamily,
            familyPagodaLevel: oldPagodaLvl,
            inheritedTrait: child.trait ? child.trait.id : null,
            inventory: { 
                potions: 2 + (child.trainingStats?.potions || 0), 
                elixirs: 0, 
                items: state.player.inventory.items || [], 
                materials: state.player.inventory.materials || {}, 
                blueprints: state.player.inventory.blueprints || [] 
            },
            equipment: { head: null, body: null, legs: null, boots: null, weapon: null, relic: null, necklace: null, ring: null },
            skills: []
        };
        
        // Keep the old dwelling and sect
        state.dwelling = oldDwelling;
        state.sect = oldSect;
        
        return { 
            success: true, 
            message: "succeeded" 
        };
    },

    // Perform the generic will selection fallback if no child is chosen (Legacy compatibility)
    perform(state, traitId) {
        this.init(state);
        const trait = this.traits[traitId];
        if (!trait) return false;

        state.legacy.rebirthCount++;
        state.legacy.totalLevels += state.player.lvl;
        state.legacy.traits.push(traitId);
        
        state.legacy.permanentStats.atk += Math.floor(state.player.atk * 0.05);
        state.legacy.permanentStats.def += Math.floor(state.player.def * 0.05);
        state.legacy.permanentStats.hp += Math.floor(state.player.maxHp * 0.05);
        state.legacy.permanentStats.mp += Math.floor(state.player.maxMp * 0.05);

        const oldName = state.player.name;
        const oldClass = state.player.class;
        const oldSprite = state.player.sprite;
        const oldFamily = state.player.family;
        const oldDwelling = state.dwelling;
        const oldSect = state.sect;

        state.player = {
            name: oldName,
            class: oldClass,
            sprite: oldSprite,
            lvl: 1, xp: 0, maxXp: 100,
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            atk: 10, def: 5,
            gold: 100, karma: 0,
            children: 0, kills: 0,
            family: oldFamily,
            inheritedTrait: traitId,
            inventory: { potions: 2, elixirs: 0, items: [], materials: {}, blueprints: [] },
            equipment: { head: null, body: null, legs: null, boots: null, weapon: null, relic: null, necklace: null, ring: null },
            skills: []
        };

        state.dwelling = oldDwelling;
        state.sect = oldSect;

        return true;
    }
};
