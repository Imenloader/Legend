// ============================================================
// PETS.JS — ديوان ترويض وحوش الجان والدواب الشرقية الباسلة
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.PETS = {
    // قاعدة بيانات الوحوش والدواب القابلة للترويض والركوب
    beasts: {
        'desert_jinn': { id: 'desert_jinn', name: 'ذئب الصحراء الأليف المطيع', rarity: 'نادر', type: 'pet', bonus: { atk: 0.08, mp: 20 }, skill: 'إعصار رمال الفتوة', desc: 'دوامة قتالية من الرمل والعزيمة الحامية في جوف الصحراء.' },
        'shadow_stalker': { id: 'shadow_stalker', name: 'فهد الظلال الصحراوية الغادر', rarity: 'غير مألوف', type: 'pet', bonus: { crit: 0.06 }, skill: 'وثبة الطيف المباغتة', desc: 'بيصطاد ويراقب الأعداء في هدوء تام من الأماكن التي لا يطالها الضوء.' },
        'desert_hawk': { id: 'desert_hawk', name: 'صقر شاهين الكاسر الحر', rarity: 'نادر', type: 'pet', bonus: { atk: 0.06, crit: 0.04 }, skill: 'مخلب الصيد البارق', desc: 'صقر بدوي حر يمتاز بعينيه الحادتين اللتين تقرآن ثغرات حركات الأعداء.' },
        'saluki_hound': { id: 'saluki_hound', name: 'كلب السلوقي العربي السريع', rarity: 'غير مألوف', type: 'pet', bonus: { atk: 0.04, hp: 30 }, skill: 'انقضاض الصيد الخاطف', desc: 'كلب صيد عربي أصيل يركض كالسهم المارق ويفزع غزلان الفيافي.' },
        'phoenix_pet': { id: 'phoenix_pet', name: 'طائر العنقاء الزمردي الخالد', rarity: 'أسطوري', type: 'pet', bonus: { atk: 0.12, mp: 30 }, skill: 'نهوض رماد الأساطير', desc: 'طائر ناري روحي يتولد من لهب ونور شيوخ قمة الخلود.' },
        
        'nomad_camel': { id: 'nomad_camel', name: 'الناقة الوضحاء المباركة', rarity: 'غير مألوف', type: 'mount', bonus: { hp: 60, mp: 10 }, skill: 'حماية البركة والعطاء', desc: 'سفينة الصحراء الوفية التي تقاوم قسوة الهجير والرمال.' },
        'arabian_kahila': { id: 'arabian_kahila', name: 'الجواد الكحيلان العربي الأصيل', rarity: 'أسطوري', type: 'mount', bonus: { def: 0.10, hp: 50 }, skill: 'صهيل الشجاعة الباسلة', desc: 'من أقدم وأكرم خيول العرب، يمتاز بوفائه المطلق للفرسان.' },
        'jade_qilin': { id: 'jade_qilin', name: 'المهر المجنح الأسطوري البارق', rarity: 'أسطوري', type: 'mount', bonus: { def: 0.12, hp: 60 }, skill: 'النظرة الباسلة المباركة', desc: 'دابة وفية تهبط من أعلى قمم قمة الخلود لتجلب النصر لصاحبها.' }
    },

    // Initialize state
    init(state) {
        if (!state.player.pets) state.player.pets = [];
        if (!state.player.activePet) state.player.activePet = null;
        if (!state.player.activeMount) state.player.activeMount = null;
    },

    // Tame/Adopt a beast
    tame(state, beastId) {
        this.init(state);
        const beast = this.beasts[beastId];
        if (!beast) return { success: false, message: "الوحش ده مش موجود في سجلات البرية." };
        
        if (state.player.pets.some(p => p.id === beastId)) {
            return { success: false, message: "الوحش ده مروض وموجود معاك في قلعتك بالفعل!" };
        }

        state.player.pets.push({ ...beast, xp: 0, level: 1 });
        
        // Auto-equip if slot empty
        if (beast.type === 'mount' && !state.player.activeMount) {
            state.player.activeMount = beastId;
        } else if (beast.type === 'pet' && !state.player.activePet) {
            state.player.activePet = beastId;
        }
        
        return { success: true, message: `مبروك! روضت <b>${beast.name}</b> وبقى دابتك الوفية بنجاح!` };
    },

    // Equip / Active toggle
    toggleEquip(state, beastId) {
        this.init(state);
        const owned = state.player.pets.find(p => p.id === beastId);
        if (!owned) return { success: false, message: "لم تقم بترويض هذا الوحش بعد!" };

        if (owned.type === 'mount') {
            if (state.player.activeMount === beastId) {
                state.player.activeMount = null;
                return { success: true, message: "تم إلغاء تجهيز الدابة بنجاح." };
            } else {
                state.player.activeMount = beastId;
                return { success: true, message: `تم ركوب وتجهيز <b>${owned.name}</b> كدابة نشطة!` };
            }
        } else {
            if (state.player.activePet === beastId) {
                state.player.activePet = null;
                return { success: true, message: "تم إلغاء تجهيز الوحش المروّض." };
            } else {
                state.player.activePet = beastId;
                return { success: true, message: `تم تجهيز <b>${owned.name}</b> كوحش مرافق نشط!` };
            }
        }
    },

    // Upgrade level using Oasis Herbs
    levelUp(state, beastId) {
        this.init(state);
        const owned = state.player.pets.find(p => p.id === beastId);
        if (!owned) return { success: false, message: "لم تقم بترويض هذا الوحش بعد!" };

        const currentLvl = owned.level || 1;
        const herbCost = 10 + currentLvl * 5;

        if (!state.oasis || !state.oasis.resources || (state.oasis.resources.herbs || 0) < herbCost) {
            return { success: false, message: `تحتاج إلى <b>${herbCost}</b> عشبة باطنية من البستان لترقية مستوى الأليف!` };
        }

        state.oasis.resources.herbs -= herbCost;
        owned.level = currentLvl + 1;
        
        return { success: true, message: `ارتقى مستوى <b>${owned.name}</b> إلى <b>مستوى ${owned.level}</b> وزادت بركته وقوته!` };
    },

    // Calculate sum of active mount + pet bonuses
    getBonuses(state) {
        this.init(state);
        const bonuses = { atk: 0, def: 0, hp: 0, mp: 0, speed: 0, crit: 0 };
        
        const applyBeast = (beast) => {
            if (!beast) return;
            const lvl = beast.level || 1;
            const scale = 1 + (lvl - 1) * 0.12; // 12% stat scaling per level!
            
            if (beast.bonus.atk) bonuses.atk += beast.bonus.atk * scale;
            if (beast.bonus.def) bonuses.def += beast.bonus.def * scale;
            if (beast.bonus.hp) bonuses.hp += Math.floor(beast.bonus.hp * scale);
            if (beast.bonus.mp) bonuses.mp += Math.floor(beast.bonus.mp * scale);
            if (beast.bonus.speed) bonuses.speed += Math.floor(beast.bonus.speed * scale);
            if (beast.bonus.crit) bonuses.crit += beast.bonus.crit * scale;
        };

        if (state.player.activePet) {
            const pet = state.player.pets.find(p => p.id === state.player.activePet);
            applyBeast(pet);
        }
        if (state.player.activeMount) {
            const mount = state.player.pets.find(p => p.id === state.player.activeMount);
            applyBeast(mount);
        }
        return bonuses;
    }
};
