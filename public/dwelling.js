// ============================================================
// DWELLING.JS — القلعة والديوان الحربي ونظام عروق الهمة والتركيز
// "ملحمة الشرق الساحر: وصية الفتوة وأساطير الصحراء"
// ============================================================

window.DWELLING = {
    init(state) {
        if (!state.dwelling) {
            state.dwelling = {
                servants: 1,
                maxServants: 10,
                resources: {
                    food: 200,
                    wood: 100,
                    iron: 50
                },
                nodes: {
                    food: 1,
                    wood: 0,
                    iron: 0,
                    qi: 0 // Allocated workers to focus/mana gathering
                },
                qiArrayLevel: 1, // Focus/Mana production array lvl
                qi: 0, // Accumulated focus points
                roots: {
                    gold: 0,  // ATK (+10)
                    wood: 0,  // HP (+50)
                    water: 0, // DEF (+8)
                    fire: 0,  // CRIT RATE (+1%)
                    earth: 0  // MP/QI (+25)
                }
            };
        }
    },

    // Passive heartbeat gathering
    process(state) {
        this.init(state);
        const d = state.dwelling;

        // Worker food consumption: 1 Food per worker per tick
        const foodConsumed = d.servants * 1;
        let efficiency = 1.0;

        if (d.resources.food < foodConsumed) {
            d.resources.food = 0;
            efficiency = 0.2; // Starving workers are only 20% productive!
        } else {
            d.resources.food -= foodConsumed;
        }

        // Production rates
        const foodGained = Math.floor(d.nodes.food * 5 * efficiency);
        const woodGained = Math.floor(d.nodes.wood * 3 * efficiency);
        const ironGained = Math.floor(d.nodes.iron * 1.5 * efficiency);
        
        d.resources.food += foodGained;
        d.resources.wood += woodGained;
        d.resources.iron += ironGained;

        // Passive Focus/Mana Array accumulation
        const baseQiGained = d.qiArrayLevel * 10;
        const allocatedQiGained = d.nodes.qi * 5 * efficiency;
        d.qi += Math.floor(baseQiGained + allocatedQiGained);
    },

    buyServant(state) {
        this.init(state);
        const d = state.dwelling;
        
        if (d.servants >= d.maxServants) {
            return { success: false, message: "القلعة والديوان وصلوا للحد الأقصى من الخدم والعمال!" };
        }

        const cost = 200 + d.servants * 100;
        if (state.player.gold < cost) {
            return { success: false, message: `معندكش دنانير ذهبية كفاية! محتاج ${cost} دينار ذهبي.` };
        }

        state.player.gold -= cost;
        d.servants++;
        d.nodes.food++; // Put new servants to work gathering food by default
        return { success: true, message: `تم تعيين عامل قلعة واحد مقابل ${cost} دينار ذهبي لخدمة القلعة والديوان.` };
    },

    assignServant(state, nodeKey, amount) {
        this.init(state);
        const d = state.dwelling;

        if (amount > 0) {
            // Find a servant currently working on another node to re-allocate
            const sources = ['food', 'wood', 'iron', 'qi'].filter(k => k !== nodeKey);
            let reallocated = false;
            for (let src of sources) {
                if (d.nodes[src] > 0) {
                    d.nodes[src]--;
                    d.nodes[nodeKey]++;
                    reallocated = true;
                    break;
                }
            }
            if (!reallocated) {
                return { success: false, message: "كل الخدم والعمال شغالين بالفعل! عيّن ناس جديدة الأول." };
            }
        } else if (amount < 0) {
            if (d.nodes[nodeKey] <= 0) {
                return { success: false, message: "مفيش أي عمال شغالين في المهمة دي حالياً." };
            }
            d.nodes[nodeKey]--;
            d.nodes.food++; // Move them back to food farming
        }

        return { success: true, message: `تم تعيين وتوزيع العامل بنجاح في مهام القلعة.` };
    },

    upgradeQiArray(state) {
        this.init(state);
        const d = state.dwelling;

        const woodCost = d.qiArrayLevel * 150;
        const ironCost = d.qiArrayLevel * 80;

        if (d.resources.wood < woodCost || d.resources.iron < ironCost) {
            return { success: false, message: `المواد والخيرات مش كفاية! محتاج ${woodCost} خشب و ${ironCost} حديد.` };
        }

        d.resources.wood -= woodCost;
        d.resources.iron -= ironCost;
        d.qiArrayLevel++;

        return { success: true, message: `تم ترقية مصفوفة شحذ الهمة والتركيز لمستوى ${d.qiArrayLevel}!` };
    },

    upgradeRoot(state, rootKey) {
        this.init(state);
        const d = state.dwelling;

        if (d.roots[rootKey] === undefined) return { success: false, message: "نوع عرق غير صالح ومجهول للقلعة." };

        const currentLvl = d.roots[rootKey];
        const qiCost = Math.floor(100 * Math.pow(1.5, currentLvl));

        if (d.qi < qiCost) {
            return { success: false, message: `معندكش طاقة تركيز وهمة كافية في مسبك القلعة! محتاج ${qiCost} نقطة تركيز.` };
        }

        d.qi -= qiCost;
        d.roots[rootKey]++;

        const rootMap = {
            'gold': 'الحديدي الهجومي للفتوة',
            'wood': 'الأخضر للصحة والشفاء',
            'water': 'المائي للدفاع والصلابة',
            'fire': 'اللاهب للضربات الخاطفة',
            'earth': 'الترابي للهمة والتركيز'
        };
        const rootName = rootMap[rootKey] || rootKey.toUpperCase();

        return { success: true, message: `عرق الهمة والتركيز <b>${rootName}</b> ارتقى بنجاح للدرجة <b>الدرجة ${d.roots[rootKey]}</b>!` };
    }
};
