// ============================================================
// SOUL_WANDERING.JS — محرك السفر والاسكتشاف الكشفي الهائم في البرية
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.SOUL_WANDERING = {
    regions: {
        'crossroads': { name: 'ضواحي واحة القوافل', minLvl: 1, monsters: ['ذئب الصحراء الكاسر', 'صعلوك القافلة الشرير', 'عقرب الرمال المسموم'], mats: ['spirit_herb', 'iron_ore'] },
        'empty_quarter': { name: 'الربع الخالي العظيم', minLvl: 5, monsters: ['طيف الجان الهائم', 'أفعى الواحة الرهيبة', 'مارد العواصف الرملية'], mats: ['monster_core', 'spirit_herb'] },
        'shadow_peaks': { name: 'جبال الظلال الوعرة', minLvl: 12, monsters: ['كاهن الطائفة السوداء', 'غراب الفراغ المظلم', 'نمر الفيافي الرهيب'], mats: ['dragon_vein_shard', 'monster_core'] }
    },

    init(state) {
        if (!state.soulWandering) {
            state.soulWandering = {
                active: false,
                regionId: null,
                ticksRemaining: 0,
                totalTicks: 0,
                log: [],
                loots: {
                    gold: 0,
                    xp: 0,
                    items: [],
                    materials: {}
                }
            };
        }
    },

    start(state, regionId, ticks) {
        this.init(state);
        const sw = state.soulWandering;

        if (sw.active) {
            return { success: false, message: "فارسك وقافلتك في رحلة استكشاف بالفعل حالياً!" };
        }

        const r = this.regions[regionId];
        if (!r) return { success: false, message: "منطقة برية غير صالحة للسفر." };

        if ((state.player.lvl || 1) < r.minLvl) {
            return { success: false, message: `مستوى تدريبك البدني ضعيف جداً! محتاج على الأقل مستوى ${r.minLvl}.` };
        }

        sw.active = true;
        sw.regionId = regionId;
        sw.ticksRemaining = ticks;
        sw.totalTicks = ticks;
        sw.log = [`[بداية الرحلة الاستكشافية] خرج فارسك للاستكشاف وبدأ يطوف نحو ${r.name}...`];
        sw.loots = { gold: 0, xp: 0, items: [], materials: {} };

        return { success: true, message: `انطلق فارسك وطاف نحو ${r.name} لـ ${ticks} دورات استكشافية.` };
    },

    stop(state) {
        this.init(state);
        const sw = state.soulWandering;
        if (!sw.active) return { success: false, message: "فارسك مش في رحلة استكشاف حالياً." };

        // Force stop: claim whatever has been accumulated so far
        sw.ticksRemaining = 0;
        this.complete(state);
        return { success: true, message: "استدعيت فارسك وقافلتك وأنهيت الرحلة الاستكشافية بنجاح!" };
    },

    process(state) {
        this.init(state);
        const sw = state.soulWandering;
        if (!sw.active) return;

        const r = this.regions[sw.regionId];
        if (!r) return;

        sw.ticksRemaining--;

        // Simulate combat round
        const monster = r.monsters[Math.floor(Math.random() * r.monsters.length)];
        const xpGained = Math.floor((r.minLvl * 10) * (1 + Math.random()));
        const goldGained = Math.floor((r.minLvl * 8) * (1 + Math.random()));

        sw.loots.xp += xpGained;
        sw.loots.gold += goldGained;

        let roundMsg = `[دورة ${sw.totalTicks - sw.ticksRemaining}] هزمت <b>${monster}</b>. كسبت +${xpGained} خبرة، +${goldGained} دينار.`;

        const matMap = {
            'spirit_herb': 'عشبة النور البدنية',
            'iron_ore': 'خام الحديد الدمشقي',
            'monster_core': 'نواة الوحش السحرية',
            'dragon_vein_shard': 'شظية ينابيع النور البدنية'
        };

        // Resource Drop Roll (50% chance)
        if (Math.random() < 0.5) {
            const mat = r.mats[Math.floor(Math.random() * r.mats.length)];
            sw.loots.materials[mat] = (sw.loots.materials[mat] || 0) + 1;
            const matName = matMap[mat] || mat.replace(/_/g, ' ').toUpperCase();
            roundMsg += ` لاقيت: <span style="color:var(--secondary)">${matName}</span>.`;
        }

        // Equipment Drop Roll (15% chance)
        if (Math.random() < 0.15 && window.EQUIPMENT_DATA) {
            const eligible = Object.values(window.EQUIPMENT_DATA).filter(item => (item.reqLevel || 1) <= (state.player.lvl || 1));
            if (eligible.length > 0) {
                const proto = eligible[Math.floor(Math.random() * eligible.length)];
                const newItem = { ...proto, id: `${proto.id}_${Date.now()}` };
                sw.loots.items.push(newItem);
                const qClass = `loot-${proto.quality.toLowerCase()}`;
                roundMsg += ` اكتشفت كنزاً: <b class="${qClass}">[${proto.name}]</b>!`;
            }
        }

        sw.log.unshift(roundMsg); // Push to top of logs
        if (sw.log.length > 30) sw.log.pop(); // Cap log size

        if (sw.ticksRemaining <= 0) {
            this.complete(state);
        }
    },

    complete(state) {
        const sw = state.soulWandering;
        sw.active = false;

        // Deliver accumulated rewards
        state.player.xp += sw.loots.xp;
        state.player.gold += sw.loots.gold;

        // Deliver materials
        if (!state.player.inventory.materials) state.player.inventory.materials = {};
        Object.entries(sw.loots.materials).forEach(([id, qty]) => {
            state.player.inventory.materials[id] = (state.player.inventory.materials[id] || 0) + qty;
        });

        // Deliver items
        if (!state.player.inventory.items) state.player.inventory.items = [];
        sw.loots.items.forEach(item => {
            state.player.inventory.items.push(item);
        });

        // Level up check
        if (state.player.xp >= state.player.maxXp) {
            state.player.lvl++;
            state.player.xp -= state.player.maxXp;
            state.player.maxXp = window.BALANCE && window.BALANCE.calculateMaxXp ? window.BALANCE.calculateMaxXp(state.player.lvl) : Math.floor(150 + Math.pow(state.player.lvl, 1.8) * 40);
            if (window.CULTIVATION && state.player.cultivation) {
                state.player.cultivation.stageLevel++;
            }
        }

        sw.log.unshift(`<b style="color:var(--jade)">[نهاية السفر الكشفي] رجع فارسك لمعسكرك وقنواتك البدنية بنجاح. كسبت إجمالي ${sw.loots.gold} دينار و ${sw.loots.xp} خبرة!</b>`);
        
        calculateTotalStats();
        if (typeof updateTopBar === 'function') updateTopBar();
        saveGame();
    }
};
