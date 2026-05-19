// ============================================================
// SKILLS.JS — الفنون البدنية والقتالية لفرسان الشرق
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.SKILLS = {
    // Database of learnable techniques
    techniques: {
        // --- الفنون الجسدية والقتالية الفعالة (Martial Techniques - Active) ---
        // --- الفنون الخاصة بسلالات المولد والمنشأ (Lineage Heritage Arts - Active) ---
        'dust_fist': { id: 'dust_fist', name: 'قبضة التراب الكادحة', desc: 'ضربة باطنية من قهر الفقراء تسبب 1.3x ضرر وتعطل دقة هجوم الخصم بنسبة 25% لدورين.', mpCost: 5, power: 1.3, debuff: { atk: -0.25, duration: 2 }, type: 'fast', reqLvl: 1 },
        'sham_blade': { id: 'sham_blade', name: 'سيف النور الشامي', desc: 'ضربتان متتاليتان خاطفتان بنصل من الفولاذ الدمشقي تسببان 1.6x ضرر كلي.', mpCost: 12, power: 1.6, type: 'fast', reqLvl: 1 },
        'wolf_claw': { id: 'wolf_claw', name: 'مخلب الذئب البري', desc: 'مزقة قوية بأظافر التشي تسبب 1.4x ضرر وتحدث نزيفاً باطنياً مستمراً لـ 3 أدوار.', mpCost: 10, power: 1.4, dot: { dmg: 12, duration: 3 }, type: 'heavy', reqLvl: 1 },

        // --- الفنون الجسدية والقتالية الفعالة (Martial Techniques - Active) ---
        'lotus_strike': { id: 'lotus_strike', name: 'ضربة الياسمين الوهيجة', desc: 'وابل خاطف من الضربات السريعة والمتعاقبة بنصلك المضيء تسبب 1.5x ضرر.', mpCost: 10, power: 1.5, type: 'fast', reqLvl: 1 },
        'mountain_peak_cleave': { id: 'mountain_peak_cleave', name: 'شطر الصخرة والقمم الفولاذي', desc: 'ضربة غاشمة هائلة تسحق دروع الخصم وتهز بنيانه بالكامل تسبب 2.2x ضرر.', mpCost: 20, power: 2.2, type: 'heavy', reqLvl: 5 },
        'shadow_step': { id: 'shadow_step', name: 'خطوة الطيف الصحراوي', desc: 'تزيد فرصة تفادي ضربات الأعداء وتجنب الهجمات بنسبة 20% لـ 3 أدوار قتالية.', mpCost: 15, effect: { dodge: 0.2, duration: 3 }, type: 'buff', reqLvl: 3 },
        'earth_shatter': { id: 'earth_shatter', name: 'زوبعة دكة الأرض الرهيبة', desc: 'ضربة زلزالية عنيفة للأرض تشل حركة العدو مذهولاً بنسبة 30% وتسبب 2.5x ضرر.', mpCost: 25, power: 2.5, stunChance: 0.3, type: 'heavy', reqLvl: 8 },
        'blood_qi_burst': { id: 'blood_qi_burst', name: 'غليان عروق الفرسان الحامية', desc: 'تضحية طاهرة بـ 10% من جوهر الصحة لمضاعفة الهجوم بنسبة 50% في الدور التالي.', mpCost: 0, hpCost: 0.1, effect: { atkBuff: 1.5, duration: 2 }, type: 'buff', reqLvl: 12 },
        'dragon_roar': { id: 'dragon_roar', name: 'صرخة مارد النار الزاجر', desc: 'صرخة باطنية مهيبة تشل حركة العدو تماماً وتسبب ثلاثة أضعاف الضرر 3.0x.', mpCost: 50, power: 3.0, stunChance: 1.0, type: 'heavy', reqLvl: 18 },
        'void_step': { id: 'void_step', name: 'ومضة حركة المباغتة', desc: 'حركة طيفية خاطفة تتجنب بها كافة أشكال الهجوم تماماً لدور كامل.', mpCost: 45, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 22 },
        
        // --- فنون التركيز والعزيمة البدنية (Martial Focus Techniques - Active) ---
        'badr_blessing': { id: 'badr_blessing', name: 'عزيمة التركيز والصلابة الصافية', desc: 'تركيز بدني صافي يستعيد 30% من نقاط الصحة القصوى فوراً.', mpCost: 30, heal: 0.3, type: 'magic', reqLvl: 3 },
        'heavenly_rain': { id: 'heavenly_rain', name: 'عاصفة السيوف السلطانية الهابطة', desc: 'إعصار من شظايا السيوف الفولاذية المنهمرة على الأعداء تسبب 3.5x ضرر.', mpCost: 40, power: 3.5, type: 'magic', reqLvl: 15 },
        'sun_incineration': { id: 'sun_incineration', name: 'لهب البروق السبعة المحرق', desc: 'تركيز بدني باطني جبار يحرق الخصم بلهب حارق مستمر لـ 5 أدوار قتالية.', mpCost: 60, power: 5.0, dot: { dmg: 18, duration: 5 }, type: 'magic', reqLvl: 25 },
        'phoenix_rebirth': { id: 'phoenix_rebirth', name: 'قوة نهوض العنقاء الأسطورية', desc: 'عزيمة أسطورية تستعيد كامل الصحة وتزيد الهجوم والدفاع بنسبة 25% لـ 3 أدوار.', mpCost: 80, heal: 1.0, effect: { atkBuff: 1.25, defBuff: 1.25, duration: 3 }, type: 'magic', reqLvl: 35 },
        'heaven_seal': { id: 'heaven_seal', name: 'ختم أقاليم الصحراء العالي الحافظ', desc: 'أسلوب أسطوري يشل هالة الأعداء ويقلل من هجومهم ودفاعهم بنسبة 40% لـ 5 أدوار.', mpCost: 75, debuff: { atk: -0.4, def: -0.4, duration: 5 }, type: 'magic', reqLvl: 30 },
        
        // --- فنون الفروسية والمبارزة العربية الخالدة (Legendary Arabian Furusiyya & Battle Arts - Active) ---
        'furusiyya_charge': { id: 'furusiyya_charge', name: 'صولة الفروسية الهلالية الجسورة', desc: 'صولة فارس يركب خيلاً كحيلاً أصيلاً، يندفع بقوة 2.8x ضرر ويشل حركة الخصم لدورين بنسبة 45%.', mpCost: 35, power: 2.8, stunChance: 0.45, type: 'heavy', reqLvl: 14 },
        'zulfiqar_fury': { id: 'zulfiqar_fury', name: 'غضب نصل ذي الفقار الحاسم الماحق', desc: 'فن سيف الخلود القاطع للظلام، يستحضر طاقة التشي الباطنية ليضرب 4.0x ضرر فوري ساحق.', mpCost: 50, power: 4.0, type: 'heavy', reqLvl: 28 },
        'dhikr_trance': { id: 'dhikr_trance', name: 'تركيز السكينة والهدوء الباطني', desc: 'جلسة تركيز وسكينة باطنية حكيمة، تستعيد 50% من صحتك وتزيد تفاديك للضربات بنسبة 30% لـ 3 أدوار.', mpCost: 40, heal: 0.5, effect: { dodge: 0.3, duration: 3 }, type: 'magic', reqLvl: 16 },
        'desert_sarab': { id: 'desert_sarab', name: 'مكر سراب البادية المتلألئ الخاطف', desc: 'حيلة قتالية بدوية، تظهر كطيف سراب يشتت تركيز العدو ويزيد فرصة التفادي بنسبة 50% لـ 3 أدوار.', mpCost: 20, effect: { dodge: 0.5, duration: 3 }, type: 'buff', reqLvl: 9 },
        'damascus_wall': { id: 'damascus_wall', name: 'جدار الصفيح الدمشقي الحصين المنيع', desc: 'تكتيك دفاعي فولاذي يستند لمتانة الحديد والشهب، يقلل هجوم الخصم بنسبة 50% لـ 3 أدوار.', mpCost: 25, debuff: { atk: -0.5, duration: 3 }, type: 'buff', reqLvl: 11 },
        'falcon_descent': { id: 'falcon_descent', name: 'انقضاض صقر شاهين الكاسر الحاد', desc: 'فن رماية متقن ينقض به الصقر لشق ثغرة بنقاط الضعف، يسبب 2.0x ضرر قاصم ونسبة ضربة قاضية عالية.', mpCost: 15, power: 2.0, type: 'fast', reqLvl: 6 },
        'bazaar_tactics': { id: 'bazaar_tactics', name: 'دهاء تاجر درب الحرير وفنون المفاوضة', desc: 'تكتيك باطني يشتت انتباه الأعداء بالدينار والذهب، يقلل دفاع الخصم بنسبة 35% لـ 4 أدوار قتالية.', mpCost: 18, debuff: { def: -0.35, duration: 4 }, type: 'buff', reqLvl: 8 },

        // --- القدرات البدنية الكامنة (Passive Techniques) ---
        'spirit_surge': { id: 'spirit_surge', name: 'فيض طاقة مقر الطائفة', desc: 'قدرة كامنة: +10% سرعة استرجاع الطاقة البدنية (المانا).', passive: true, stat: 'mpRegen', bonus: 0.1, reqLvl: 10 },
        'iron_bone_body': { id: 'iron_bone_body', name: 'هيكل الحديد والصلابة الصخرية', desc: 'قدرة كامنة: +15% زيادة للصحة والتحمل الأقصى.', passive: true, stat: 'maxHp', bonus: 0.15, reqLvl: 12 },
        'sword_intent': { id: 'sword_intent', name: 'همة السيف الدمشقي العازمة', desc: 'قدرة كامنة: +20% ضرر للضربات القاضية البديعة.', passive: true, stat: 'critDmg', bonus: 0.2, reqLvl: 18 },
        'unending_dao': { id: 'unending_dao', name: 'فلسفة الصمود وسر القوة', desc: 'قدرة كامنة: +25% سرعة كسب الخبرة والتركيز، و +10% لكل إحصائيات الجسد.', passive: true, stat: 'allStats', bonus: 0.1, reqLvl: 40 },
        'eternal_breath': { id: 'eternal_breath', name: 'أنفاس الصمود الممتدة', desc: 'قدرة كامنة: تستعيد 5% من صحتك وطاقتك البدنية تلقائياً مع كل دور في المعركة.', passive: true, stat: 'hpRegen', bonus: 0.05, reqLvl: 22 }
    },

    // Get passive bonuses
    getPassiveBonuses: function(state) {
        let bonuses = { atk: 0, def: 0, hpRegen: 0, mpRegen: 0, maxHp: 0, critDmg: 0 };
        const learned = state.player.skills || [];
        
        // Manual Bonuses
        if (learned.includes('jade_body')) bonuses.def += 0.20;
        if (learned.includes('sword_heart')) bonuses.atk += 0.15;
        if (learned.includes('immortal_breath')) bonuses.hpRegen += 0.02;

        // Generic Passive System
        learned.forEach(id => {
            const skill = this.techniques[id];
            if (skill && skill.passive) {
                bonuses[skill.stat] = (bonuses[skill.stat] || 0) + skill.bonus;
            }
        });
        
        return bonuses;
    },

    checkUnlocks: function(state) {
        if (!state.player.skills) state.player.skills = [];
        Object.values(this.techniques).forEach(skill => {
            if (state.player.lvl >= skill.reqLvl && !state.player.skills.includes(skill.id)) {
                state.player.skills.push(skill.id);
                if (typeof narrate === 'function') {
                    narrate(`<b>تم تعلم مهارة وفن جديد:</b> ${skill.name}!`, "ديوان الفرسان");
                }
            }
        });
    },

    getActiveSkills: function(state) {
        if (!state.player.skills) return [];
        return state.player.skills
            .map(id => this.techniques[id])
            .filter(s => s && !s.passive);
    }
};
