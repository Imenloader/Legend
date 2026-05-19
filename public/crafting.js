// ============================================================
// CRAFTING.JS — محرك الخيمياء ومصفوفة صقل الفولاذ الدمشقي العتيق
// "ملحمة الشرق الساحر: وصية الفرسان وأساطير الصحراء"
// ============================================================

window.CRAFTING = {

    // --- ALCHEMY (مرجل الخيمياء لجابر بن حيان) ---
    alchemyRecipes: {
        'minor_health_potion': {
            name: 'مشروب الصحة البسيط',
            desc: 'بيرجع 40 نقطة صحة.',
            ingredients: { 'spirit_herb': 2 },
            type: 'potion',
            effect: { hp: 40 }
        },
        'foundation_pill': {
            name: 'إكسير القوة والصلابة الباطنية',
            desc: 'مطلوب لتخطي عقبة اختبار القلب الجسور (تأسيس البنيان).',
            ingredients: { 'spirit_herb': 5, 'monster_core': 2 },
            type: 'special',
            effect: { breakthrough: true }
        },
        'golden_core_pill': {
            name: 'إكسير القوة الخارقة للفرسان',
            desc: 'مطلوبة لتخطي عقبة اختبار فارس الطاقة الباطنية (الجوهر المتين).',
            ingredients: { 'spirit_herb': 8, 'monster_core': 4 },
            type: 'special',
            effect: { breakthrough: true }
        },
        'nascent_pill': {
            name: 'مشروب الصمود الأسطوري الجبار',
            desc: 'إكسير أثري يمنح مناعة ويحمي الجسد من وهن الإرهاق والهلاك الباطني.',
            ingredients: { 'spirit_herb': 15, 'dragon_vein_shard': 1 },
            type: 'special',
            effect: { breakthrough: true, maxHp: 100 }
        },
        'immortal_elixir': {
            name: 'إكسير الطاقة اللانهائية والتحمل الأقصى',
            desc: 'بيدي +10 هجوم دايم وبيشفي جروح الجسد بالكامل.',
            ingredients: { 'celestial_silk': 2, 'dragon_vein_shard': 2 },
            type: 'permanent',
            effect: { atk: 10, fullHeal: true }
        }
    },

    // --- BLACKSMITH (مصفوفة صقل الفولاذ وورشة الحدادة الباطنية) ---
    forgeRecipes: {
        'spirit_scimitar': { 
            name: 'سيف الفارس المستجد الفولاذي', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 5, 'spirit_herb': 2 },
            baseStats: { atk: 12 },
            set: 'xianxia'
        },
        'spirit_turban': { 
            name: 'عمامة الفرسان المطرزة بالخيوط الذهبية الفخمة', 
            slot: 'head', 
            ingredients: { 'spirit_herb': 4 },
            baseStats: { def: 5, mp: 10 },
            set: 'xianxia'
        },
        'robe_of_zuhd': { 
            name: 'عباءة السفر والترحال المتينة', 
            slot: 'body', 
            ingredients: { 'spirit_herb': 6, 'iron_ore': 2 },
            baseStats: { def: 12, hp: 20 },
            set: 'xianxia'
        },
        'mantra_beads': {
            name: 'مسبحة التركيز والطاقة العالية',
            slot: 'weapon',
            ingredients: { 'wood': 15, 'monster_core': 6 },
            baseStats: { atk: 45, mp: 40 },
            set: 'vedic'
        },
        'dhoti_of_enlightenment': {
            name: 'رداء الفرسان الصامدين المنسوج بدقة',
            slot: 'body',
            ingredients: { 'spirit_herb': 12, 'monster_core': 4 },
            baseStats: { def: 25, hp: 80 },
            set: 'vedic'
        },
        'dune_crest_scimitar': {
            name: 'سيف هلال الكثبان الدمشقي العريق',
            slot: 'weapon',
            ingredients: { 'iron_ore': 15, 'monster_core': 5 },
            baseStats: { atk: 55 },
            set: 'silk_road'
        },
        'nomad_tunic': {
            name: 'سترة الفارس البدوي الحصينة الفخمة',
            slot: 'body',
            ingredients: { 'spirit_herb': 10, 'wood': 10 },
            baseStats: { def: 35, hp: 60 },
            set: 'silk_road'
        },
        'jade_emperor_plate': {
            name: 'درع سليمان الأسطوري النحاسي البديع',
            slot: 'body',
            ingredients: { 'iron_ore': 20, 'dragon_vein_shard': 5 },
            baseStats: { def: 80, hp: 200 },
            set: 'mythology'
        },
        'phoenix_crown': {
            name: 'تاج بطل الأبطال المزين بريش العنقاء الأسطوري',
            slot: 'head',
            ingredients: { 'spirit_herb': 10, 'celestial_silk': 3 },
            baseStats: { def: 30, mp: 100, mpRegen: 5 },
            set: 'mythology'
        },
        'heavenly_halberd': {
            name: 'حربة العاصفة الجبارة الفولاذية المصقولة',
            slot: 'weapon',
            ingredients: { 'iron_ore': 30, 'celestial_silk': 5, 'dragon_vein_shard': 8 },
            baseStats: { atk: 120 },
            set: 'mythology'
        }
    },

    rollQuality(state) {
        const hammerLvl = state?.player?.forgeHammerLevel || 1;
        const bonuses = [0, 0, 5, 12, 20];
        const bonus = bonuses[hammerLvl] || 0;

        const roll = Math.random() * 100 - bonus;
        if (roll < 1) return 'Super';
        if (roll < 5) return 'Elite';
        if (roll < 15) return 'Unique';
        if (roll < 40) return 'Refined';
        return 'Normal';
    },

    getQualityMult(quality) {
        const map = { 'Normal': 1, 'Refined': 1.2, 'Unique': 1.5, 'Elite': 2.0, 'Super': 3.0 };
        return map[quality] || 1;
    },

    craftItem(state, recipeId) {
        const recipe = this.forgeRecipes[recipeId];
        if (!recipe) return { success: false, message: "وصفة مجهولة وغير معروفة لمصفوفة الصقل." };

        const matMap = {
            'spirit_herb': 'العشبة الطبية الجبلية',
            'monster_core': 'نواة الوحش البري',
            'dragon_vein_shard': 'شظية الصخرة البلورية النادرة',
            'celestial_silk': 'حرير الواحة الفخم والنادر',
            'iron_ore': 'خام الحديد الدمشقي',
            'wood': 'خشب الصنوبر الأثري'
        };

        // Check ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            const current = state.player.inventory.materials[item] || 0;
            const matName = matMap[item] || item.replace(/_/g, ' ');
            if (current < count) return { success: false, message: `ليس لديك ${matName} كفاية في قلعتك.` };
        }

        // Consume ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            state.player.inventory.materials[item] -= count;
        }

        // Roll Quality
        const quality = this.rollQuality(state);
        const mult = this.getQualityMult(quality);

        const qualMap = { 'Normal': 'عادي', 'Refined': 'مصقول', 'Unique': 'نادر', 'Elite': 'نخبة', 'Super': 'أسطوري' };
        const qualName = qualMap[quality] || quality;
        const finalName = quality === 'Normal' ? recipe.name : `${recipe.name} (${qualName})`;

        const newItem = {
            id: `${recipeId}_${Date.now()}`,
            name: finalName,
            slot: recipe.slot,
            quality: quality,
            set: recipe.set,
            stats: {}
        };

        // Scale stats
        Object.entries(recipe.baseStats).forEach(([stat, val]) => {
            newItem.stats[stat] = Math.floor(val * mult);
        });

        if (!state.player.inventory.items) state.player.inventory.items = [];
        state.player.inventory.items.push(newItem);

        return { 
            success: true, 
            message: `نيران مصفوفة الصقل متقدة والحديد ذاب! صقلت وصنعت <b class="loot-${quality.toLowerCase()}">${newItem.name}</b> بنجاح!`,
            item: newItem
        };
    },

    brewAlchemy(state, recipeId, stability = 75) {
        const recipe = this.alchemyRecipes[recipeId];
        if (!recipe) return { success: false, message: "وصفة مجهولة ومستعصية على إناء الكيمياء." };

        const matMap = {
            'spirit_herb': 'العشبة الطبية الجبلية',
            'monster_core': 'نواة الوحش البري',
            'dragon_vein_shard': 'شظية الصخرة البلورية النادرة',
            'celestial_silk': 'حرير الواحة الفخم والنادر',
            'iron_ore': 'خام الحديد الدمشقي',
            'wood': 'خشب الصنوبر الأثري'
        };

        // Check ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            const current = state.player.inventory.materials[item] || 0;
            const matName = matMap[item] || item.replace(/_/g, ' ');
            if (current < count) return { success: false, message: `ليس لديك ${matName} كفاية للتحضير.` };
        }

        // Consume
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            state.player.inventory.materials[item] -= count;
        }

        let quality = 'Normal';
        let mult = 1;
        let success = true;

        if (stability >= 90) { quality = 'Perfect'; mult = 2; }
        else if (stability >= 50) { quality = 'Normal'; mult = 1; }
        else { quality = 'Failed'; success = false; }

        if (success) {
            const qualMap = { 'Perfect': 'مثالي', 'Normal': 'عادي' };
            const qualName = qualMap[quality] || quality;
            const finalName = quality === 'Normal' ? recipe.name : `${recipe.name} (${qualName})`;

            const newItem = {
                id: recipeId,
                name: finalName,
                type: 'consumable',
                effect: { ...recipe.effect }
            };
            if (newItem.effect.hp) newItem.effect.hp *= mult;
            if (newItem.effect.mp) newItem.effect.mp *= mult;

            if (!state.player.inventory.items) state.player.inventory.items = [];
            state.player.inventory.items.push(newItem);
            return { success: true, message: `حضّرت <b>${newItem.name}</b> بنجاح داخل مرجل الخيمياء الباطني!`, item: newItem };
        } else {
            return { success: false, message: "طاقة التشي والتركيز اضطربا فجأة في المرجل! المشروب فسد تماماً وتلاشى." };
        }
    }
};
