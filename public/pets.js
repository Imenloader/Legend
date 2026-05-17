// ============================================================
// PETS.JS — ديوان ترويض وحوش الجان والدواب الشرقية الباسلة
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.PETS = {
    // قاعدة بيانات الوحوش القابلة للترويض
    beasts: {
        'desert_jinn': { id: 'desert_jinn', name: 'عفريت الصحراء المطيع', rarity: 'نادر', type: 'بدني', bonus: { atk: 0.1, mp: 20 }, skill: 'إعصار رمال الفتوة', desc: 'دوامة قتالية من الرمل والمانا الحامية في جوف الصحراء.' },
        'jade_qilin': { id: 'jade_qilin', name: 'البراق المجنح الأسطوري', rarity: 'أسطوري', type: 'أسطوري', bonus: { def: 0.15, hp: 50 }, skill: 'النظرة الباسلة المباركة', desc: 'دابة وفية بتهبط من أعلى القمم لتجلب النصر والسكينة لصاحبها.' },
        'shadow_stalker': { id: 'shadow_stalker', name: 'فهد الظلال الصحراوية الغادر', rarity: 'غير مألوف', type: 'وحش كاسر', bonus: { crit: 0.1 }, skill: 'وثبة الطيف المباغتة', desc: 'بيصطاد ويراقب الأعداء في هدوء تام من الأماكن اللي مبيوصلهاش أي ضوء.' }
    },

    // Initialize state
    init(state) {
        if (!state.player.pets) state.player.pets = [];
        if (!state.player.activePet) state.player.activePet = null;
    },

    // Tame a beast
    tame(state, beastId) {
        this.init(state);
        const beast = this.beasts[beastId];
        if (!beast) return { success: false, message: "الوحش ده مش موجود في سجلات البرية." };
        
        if (state.player.pets.some(p => p.id === beastId)) {
            return { success: false, message: "الوحش ده مروض وموجود معاك في قلعتك وديوانك بالفعل!" };
        }

        state.player.pets.push({ ...beast, xp: 0, level: 1 });
        if (!state.player.activePet) state.player.activePet = beastId;
        
        return { success: true, message: `مبروك! روضت <b>${beast.name}</b> وبقى دابتك الوفية بنجاح!` };
    },

    // Get active pet data
    getActive(state) {
        if (!state.player.activePet) return null;
        return state.player.pets.find(p => p.id === state.player.activePet);
    },

    // Get pet bonuses
    getBonuses(state) {
        const pet = this.getActive(state);
        return pet ? pet.bonus : {};
    }
};
