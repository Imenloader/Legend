// ============================================================
// SOUL_WANDERING.JS — Background Auto-Adventure Engine
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SOUL_WANDERING = {
    regions: {
        'crossroads': { name: 'Crossroads Outskirts', minLvl: 1, monsters: ['Sand Jackal', 'Desert Bandit', 'Scorpion'], mats: ['spirit_herb', 'iron_ore'] },
        'empty_quarter': { name: 'The Empty Quarter', minLvl: 5, monsters: ['Jinn Wraith', 'Oasis Serpent', 'Sandstorm Elemental'], mats: ['monster_core', 'spirit_herb'] },
        'shadow_peaks': { name: 'Shadow Peaks', minLvl: 12, monsters: ['Demon Cultist', 'Void Raven', 'Abyssal Tiger'], mats: ['dragon_vein_shard', 'monster_core'] }
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
            return { success: false, message: "Your soul is already wandering!" };
        }

        const r = this.regions[regionId];
        if (!r) return { success: false, message: "Invalid wilderness region." };

        if ((state.player.lvl || 1) < r.minLvl) {
            return { success: false, message: `Your cultivation is too weak! Requires Level ${r.minLvl}.` };
        }

        sw.active = true;
        sw.regionId = regionId;
        sw.ticksRemaining = ticks;
        sw.totalTicks = ticks;
        sw.log = [`[Journey Started] Your soul exits your mortal body and drifts towards the ${r.name}...`];
        sw.loots = { gold: 0, xp: 0, items: [], materials: {} };

        return { success: true, message: `Your soul has departed to wander the ${r.name} for ${ticks} cycles.` };
    },

    stop(state) {
        this.init(state);
        const sw = state.soulWandering;
        if (!sw.active) return { success: false, message: "Your soul is not wandering." };

        // Force stop: claim whatever has been accumulated so far
        sw.ticksRemaining = 0;
        this.complete(state);
        return { success: true, message: "You forcibly recalled your soul back to your vessel!" };
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

        let roundMsg = `[Round ${sw.totalTicks - sw.ticksRemaining}] Defeated <b>${monster}</b>. Gained +${xpGained} XP, +${goldGained} Stones.`;

        // Resource Drop Roll (50% chance)
        if (Math.random() < 0.5) {
            const mat = r.mats[Math.floor(Math.random() * r.mats.length)];
            sw.loots.materials[mat] = (sw.loots.materials[mat] || 0) + 1;
            const matName = mat.replace(/_/g, ' ').toUpperCase();
            roundMsg += ` Found: <span style="color:var(--secondary)">${matName}</span>.`;
        }

        // Equipment Drop Roll (15% chance)
        if (Math.random() < 0.15 && window.EQUIPMENT_DATA) {
            const eligible = Object.values(window.EQUIPMENT_DATA).filter(item => (item.reqLevel || 1) <= (state.player.lvl || 1));
            if (eligible.length > 0) {
                const proto = eligible[Math.floor(Math.random() * eligible.length)];
                const newItem = { ...proto, id: `${proto.id}_${Date.now()}` };
                sw.loots.items.push(newItem);
                const qClass = `loot-${proto.quality.toLowerCase()}`;
                roundMsg += ` Discovered: <b class="${qClass}">[${proto.name}]</b>!`;
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
            state.player.maxXp = 100 + (state.player.lvl - 1) * 80;
            if (window.CULTIVATION && state.player.cultivation) {
                state.player.cultivation.stageLevel++;
            }
        }

        sw.log.unshift(`<b style="color:var(--jade)">[Journey Complete] Your soul returns to your physical meridians. Gained ${sw.loots.gold} Spirit Stones and ${sw.loots.xp} XP total!</b>`);
        
        calculateTotalStats();
        if (typeof updateTopBar === 'function') updateTopBar();
        saveGame();
    }
};
