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
        },

        // --- المأكولات والطبخ والوصفات العربية التقليدية (Traditional Arabian Cooking & Herbalism Recipes) ---
        'kabsa_feast': {
            name: 'ثريد كبسة اللحم الملكية بالبركة',
            desc: 'طبخة لحم غزلان الصحراء والأرز بالأعشاب البرية. تستعيد كامل نقاط الصحة (+100% صحة) وتمنح +30 صحة قصوى دائمة.',
            ingredients: { 'spirit_herb': 4, 'wood': 5 },
            type: 'permanent',
            effect: { hp: 300, maxHp: 30, fullHeal: true }
        },
        'mint_tea': {
            name: 'شاي النعناع البري الصحراوي المنعش',
            desc: 'شاي صحراوي ساخن معطر بالنعناع والبركة الباطنية. يستعيد كامل نقاط الطاقة البدنية (+100% مانا) وتمنح +10 مانا أقصى دائمة.',
            ingredients: { 'spirit_herb': 2 },
            type: 'permanent',
            effect: { mp: 100, maxMp: 10 }
        },
        'date_halwa': {
            name: 'حلوى التمر البري وزبد الإبل البدوية',
            desc: 'حلوى فاخرة مصنوعة من تمر الواحة النادر تمنح السالك شحنة كاملة في تركيز الجسد (+50 هجوم مؤقت).',
            ingredients: { 'spirit_herb': 3 },
            type: 'permanent',
            effect: { atk: 15, hp: 60 }
        },
        'habba_oil': {
            name: 'زيت حبة البركة الروحاني الشافي',
            desc: 'زيت طبيعي مبارك مستخلص من الحبة السوداء يعيد 200 نقطة صحة ويقهر كافة أنواع شياطين وغيلان الصحراء.',
            ingredients: { 'spirit_herb': 5, 'monster_core': 1 },
            type: 'potion',
            effect: { hp: 200 }
        }
    },

    // --- BLACKSMITH (مصفوفة صقل الفولاذ وورشة الحدادة الباطنية) ---
    forgeRecipes: {
        'spirit_scimitar': { 
            name: 'سيف نصل الهلال الفولاذي المبتدئ', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 5, 'spirit_herb': 2 },
            baseStats: { atk: 12 },
            set: 'xianxia'
        },
        'spirit_turban': { 
            name: 'عمامة فرسان التقاطع المزخرفة بالفضة', 
            slot: 'head', 
            ingredients: { 'spirit_herb': 4 },
            baseStats: { def: 5, mp: 10 },
            set: 'xianxia'
        },
        'robe_of_zuhd': { 
            name: 'عباءة الزهد الوبرية المتينة للرحالة', 
            slot: 'body', 
            ingredients: { 'spirit_herb': 6, 'iron_ore': 2 },
            baseStats: { def: 12, hp: 20 },
            set: 'xianxia'
        },
        'mantra_beads': {
            name: 'عصا الأسطرلاب النحاسي لحكماء دار الحكمة', 
            slot: 'weapon',
            ingredients: { 'wood': 15, 'monster_core': 6 },
            baseStats: { atk: 45, mp: 40 },
            set: 'vedic'
        },
        'dhoti_of_enlightenment': {
            name: 'رداء الفتوة الأندلسي المطرز بنور الياسمين', 
            slot: 'body',
            ingredients: { 'spirit_herb': 12, 'monster_core': 4 },
            baseStats: { def: 25, hp: 80 },
            set: 'vedic'
        },
        'dune_crest_scimitar': {
            name: 'سيف ذو الفقار الفولاذي البارق القاطع', 
            slot: 'weapon',
            ingredients: { 'iron_ore': 15, 'monster_core': 5 },
            baseStats: { atk: 55 },
            set: 'silk_road'
        },
        'nomad_tunic': {
            name: 'درع الفرسان البدوي المصفح بحديد الشهب', 
            slot: 'body',
            ingredients: { 'spirit_herb': 10, 'wood': 10 },
            baseStats: { def: 35, hp: 60 },
            set: 'silk_road'
        },
        'jade_emperor_plate': {
            name: 'درع سليمان الذهبي الأسطوري المرصع بالزمرد', 
            slot: 'body',
            ingredients: { 'iron_ore': 20, 'dragon_vein_shard': 5 },
            baseStats: { def: 80, hp: 200 },
            set: 'mythology'
        },
        'phoenix_crown': {
            name: 'عمامة الأنوار المذهبة بريش العنقاء العربي', 
            slot: 'head',
            ingredients: { 'spirit_herb': 10, 'celestial_silk': 3 },
            baseStats: { def: 30, mp: 100, mpRegen: 5 },
            set: 'mythology'
        },
        'heavenly_halberd': {
            name: 'رمح السنان الدمشقي المسحور ذو الرأس البرق', 
            slot: 'weapon',
            ingredients: { 'iron_ore': 30, 'celestial_silk': 5, 'dragon_vein_shard': 8 },
            baseStats: { atk: 120 },
            set: 'mythology'
        },
        'kilij_ottoman': { 
            name: 'سيف القلج العثماني البتار', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 18, 'monster_core': 6 },
            baseStats: { atk: 75 },
            set: 'silk_road'
        },
        'shamshir_persian': { 
            name: 'سيف الشمشير الفارسي الرشيق', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 12, 'spirit_herb': 6 },
            baseStats: { atk: 58 },
            set: 'xianxia'
        },
        'yemeni_blade': { 
            name: 'نصل السيف اليماني المأثور', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 8, 'spirit_herb': 4 },
            baseStats: { atk: 35 },
            set: 'silk_road'
        },
        'samsamah_legendary': { 
            name: 'سيف الصمصامة الملحمي العتيق', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 35, 'dragon_vein_shard': 10 },
            baseStats: { atk: 150 },
            set: 'mythology'
        },
        'jambiya_yemeni': { 
            name: 'خنجر الجنبية اليمانية المذهبة', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 10, 'spirit_herb': 8 },
            baseStats: { atk: 45 },
            set: 'xianxia'
        },
        'khatti_spear': { 
            name: 'الرمح الخطّي السمهراني الأصيل', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 20, 'wood': 15 },
            baseStats: { atk: 85 },
            set: 'mythology'
        },
        'composite_bow_hijaz': { 
            name: 'القوس المركب الحجازي الأصيل', 
            slot: 'weapon', 
            ingredients: { 'wood': 25, 'celestial_silk': 4 },
            baseStats: { atk: 68 },
            set: 'silk_road'
        },
        'ghadanfar_mace': { 
            name: 'دبوس غضنفر الفرسان المضلع الحديدي', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 22, 'monster_core': 8 },
            baseStats: { atk: 88 },
            set: 'silk_road'
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
