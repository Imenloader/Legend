// ============================================================
// SHOP.JS — اقتصاد سوق القوافل والبازارات ومتاجر الأشرار
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.SHOP = {
    // مخزون المتاجر الحالية لمختلف الأسواق والبازارات
    stocks: {
        crossroads_market: [
            { id: 'iron_ore', name: 'خام الحديد الدمشقي العتيق', price: 10, type: 'material', desc: 'مادة أساسية لصناعة الفولاذ والأسلحة بمصفوفة الصقل القتالية.' },
            { id: 'spirit_herb', name: 'أعشاب النور الطبية الطازجة', price: 15, type: 'material', desc: 'تستخدم في تحضير الإكسير والحبوب العشبية بمرجل الخيمياء.' },
            { id: 'healing_ointment', name: 'مرهم الشفاء المبارك والبركة', price: 50, type: 'consumable', desc: 'مرهم طبيعي بيرجع 50 نقطة صحة.', effect: { hp: 50 } },
            { id: 'spirit_water', name: 'ماء النخيل النقي والمنعش', price: 40, type: 'consumable', desc: 'ماء نقي منعش يستعيد 30 نقطة عزيمة وتركيز بدني.', effect: { mp: 30 } }
        ],
        jade_sect_shop: [
            { id: 'foundation_pill', name: 'إكسير التمكين وقوة البنيان', price: 1000, type: 'consumable', desc: 'مطلوب لتخطي عقبة مقام التمكين وقوة البنيان البدني.' },
            { id: 'jade_charm', name: 'تميمة العقيق الأخضر الحارسة للبركة', price: 500, type: 'relic', slot: 'relic', stats: { def: 15, mp: 20 }, desc: 'تميمة بسيطة وجميلة للحماية من ضربات الأشرار.' },
            { id: 'disciple_sword', name: 'سيف الفارس الحديدي المصقول البديع', price: 800, type: 'weapon', slot: 'weapon', stats: { atk: 25 }, desc: 'السيف المعتمد والمنشور لفرسان طائفة جبل الطور.' }
        ],
        sufi_bazaar: [
            { id: 'empty_quarter_dates', name: 'تمر الصحراء السكري اللذيذ', price: 60, type: 'consumable', desc: 'ثمرة مباركة بترجع 40 نقطة صحة و 20 نقطة عزيمة.', effect: { hp: 40, mp: 20 } },
            { id: 'prayer_beads', name: 'قلادة الخشب والسكينة للتركيز', price: 600, type: 'relic', slot: 'relic', stats: { mp: 50, def: 10 }, desc: 'قلادة من خشب العود المعطر تجلب الهدوء وتزيد التركيز والسكينة بالقلب.' },
            { id: 'sufi_tunic', name: 'عباءة الصوف المتينة للمسافرين الأحرار', price: 450, type: 'body', slot: 'body', stats: { def: 20, hp: 30 }, desc: 'ملابس سفر وبساطة متينة جداً وبتحمي من الأذى والضربات.' }
        ]
    },

    // Buy an item
    buy(state, shopId, itemId) {
        const shop = this.stocks[shopId];
        const item = shop.find(i => i.id === itemId);
        if (!item) return { success: false, message: "هذا العنصر غير متوفر في السوق حالياً." };
        
        if (state.player.gold < item.price) {
            return { success: false, message: "ليس لديك دنانير ذهبية كافية في كيسك!" };
        }

        state.player.gold -= item.price;
        if (item.type === 'material') {
            if (!state.player.inventory.materials) state.player.inventory.materials = {};
            state.player.inventory.materials[item.id] = (state.player.inventory.materials[item.id] || 0) + 1;
        } else {
            if (!state.player.inventory.items) state.player.inventory.items = [];
            state.player.inventory.items.push({ ...item });
        }
        
        return { success: true, message: `مبروك! اشتريت <b>${item.name}</b> بنجاح!` };
    },

    // Sell an item (standard 50% price)
    sell(state, itemIndex) {
        const item = state.player.inventory.items[itemIndex];
        if (!item) return { success: false, message: "هذا العنصر غير موجود في حقيبة سفرك." };
        
        const price = Math.floor((item.price || 50) * 0.5);
        state.player.gold += price;
        state.player.inventory.items.splice(itemIndex, 1);
        
        return { success: true, message: `بعت <b>${item.name}</b> مقابل <b>${price} دينار ذهبي</b> بنجاح.` };
    }
};
