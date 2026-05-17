// ============================================================
// SKILLS.JS — الفنون الروحية والقتالية لفرسان الشرق
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.SKILLS = {
    // Database of learnable techniques
    techniques: {
        // --- الفنون الجسدية والقتالية الفعالة (Martial Techniques - Active) ---
        'lotus_strike': { id: 'lotus_strike', name: 'ضربة الياسمين الوهيجة', desc: 'وابل من الضربات السريعة والمتتالية بسيفك.', mpCost: 10, power: 1.5, type: 'fast', reqLvl: 1 },
        'mountain_peak_cleave': { id: 'mountain_peak_cleave', name: 'شطر الصخرة والقمم الفولاذي', desc: 'ضربة ثقيلة بتكسر دروع وحماية العدو تماماً.', mpCost: 20, power: 2.2, type: 'heavy', reqLvl: 5 },
        'shadow_step': { id: 'shadow_step', name: 'خطوة الطيف الصحراوي', desc: 'بتزود فرصة تفادي وتجنب الضربات بـ 20% لـ 3 أدوار.', mpCost: 15, effect: { dodge: 0.2, duration: 3 }, type: 'buff', reqLvl: 3 },
        'earth_shatter': { id: 'earth_shatter', name: 'زوبعة دكة الأرض الرهيبة', desc: 'هبدة جبارة في الأرض مع فرصة 30% لشل حركة العدو برعب.', mpCost: 25, power: 2.5, stunChance: 0.3, type: 'heavy', reqLvl: 8 },
        'blood_qi_burst': { id: 'blood_qi_burst', name: 'غليان عروق الفرسان الحامية', desc: 'بتضحي بـ 10% من صحتك عشان تاخد +50% هجوم في دورك الجاي.', mpCost: 0, hpCost: 0.1, effect: { atkBuff: 1.5, duration: 2 }, type: 'buff', reqLvl: 12 },
        'dragon_roar': { id: 'dragon_roar', name: 'صرخة مارد النار الزاجر', desc: 'بتشل حركة الأعداء برعب هائل وتسبب تلات أضعاف الضرر.', mpCost: 50, power: 3.0, stunChance: 1.0, type: 'heavy', reqLvl: 18 },
        'void_step': { id: 'void_step', name: 'ومضة تلاشي السالك المباغتة', desc: 'بتختفي تماماً وتخفي هالتك عشان مفيش هجوم يلمسك لدور كامل.', mpCost: 45, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 22 },
        
        // --- الأوراد والأذكار الروحية الفعالة (Spiritual Spells - Active) ---
        'badr_blessing': { id: 'badr_blessing', name: 'رِقية النور والبركة الصافية', desc: 'نور روحي صافي من صومعتك بيرجع 30% من صحتك القصوى.', mpCost: 30, heal: 0.3, type: 'magic', reqLvl: 3 },
        'heavenly_rain': { id: 'heavenly_rain', name: 'عاصفة السيوف السلطانية الهابطة', desc: 'إعصار من شظايا السيوف النورانية المنهمرة على الأعداء.', mpCost: 40, power: 3.5, type: 'magic', reqLvl: 15 },
        'sun_incineration': { id: 'sun_incineration', name: 'لهب البروق السبعة المحرق', desc: 'ورد سحري جبار: بيحرق العدو بلهب مستمر وصعب يطفي لـ 5 أدوار.', mpCost: 60, power: 5.0, dot: { dmg: 0.5, duration: 5 }, type: 'magic', reqLvl: 25 },
        'phoenix_rebirth': { id: 'phoenix_rebirth', name: 'انبعاث طائر العنقاء من الرماد', desc: 'ترقية أسطورية: بترجع صحتك بالكامل وتديك +25% هجوم ودفاع لـ 3 أدوار.', mpCost: 80, heal: 1.0, effect: { atkBuff: 1.25, defBuff: 1.25, duration: 3 }, type: 'magic', reqLvl: 35 },
        'heaven_seal': { id: 'heaven_seal', name: 'ختم الملكوت العالي الحافظ', desc: 'طلسم أسطوري: بيشل هالة الأعداء ويقلل هجومهم ودفاعهم بـ 40%.', mpCost: 75, debuff: { atk: -0.4, def: -0.4, duration: 5 }, type: 'magic', reqLvl: 30 },

        // --- القدرات الروحية الكامنة (Passive Techniques) ---
        'spirit_surge': { id: 'spirit_surge', name: 'فيض مانا الصومعة', desc: 'قدرة كامنة: +10% سرعة استرجاع مانا تأمل الروح.', passive: true, stat: 'mpRegen', bonus: 0.1, reqLvl: 10 },
        'iron_bone_body': { id: 'iron_bone_body', name: 'هيكل الحديد والصلابة الصخرية', desc: 'قدرة كامنة: +15% زيادة للصحة والتحمل الأقصى.', passive: true, stat: 'maxHp', bonus: 0.15, reqLvl: 12 },
        'sword_intent': { id: 'sword_intent', name: 'روح السيف الدمشقي العازمة', desc: 'قدرة كامنة: +20% ضرر للضربات القاضية البديعة.', passive: true, stat: 'critDmg', bonus: 0.2, reqLvl: 18 },
        'unending_dao': { id: 'unending_dao', name: 'فلسفة البقاء الأزلي وسر النور', desc: 'قدرة كامنة: +25% سرعة كسب النور الروحي، و +10% لكل إحصائيات الجسد.', passive: true, stat: 'allStats', bonus: 0.1, reqLvl: 40 },
        'eternal_breath': { id: 'eternal_breath', name: 'الأنفاس المباركة الممتدة', desc: 'قدرة كامنة: بترجع 5% من صحتك وجروحك تلقائي مع كل دور في المعركة.', passive: true, stat: 'hpRegen', bonus: 0.05, reqLvl: 22 }
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
                    narrate(`<b>تم تعلم مهارة وفن جديد:</b> ${skill.name}!`, "النظام الروحي");
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
