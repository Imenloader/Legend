// ============================================================
// CRAFTING.JS — Phase 4: Equipment & Alchemy Engine
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.CRAFTING = {

    // --- ALCHEMY (The Furnace of Heaven) ---
    alchemyRecipes: {
        'minor_health_potion': {
            name: 'Minor Health Potion',
            desc: 'Restores 40 HP.',
            ingredients: { 'spirit_herb': 2 },
            type: 'potion'
        },
        'foundation_pill': {
            name: 'Foundation Pill',
            desc: 'Required to breakthrough to Foundation Establishment.',
            ingredients: { 'spirit_herb': 5, 'monster_core': 2 },
            type: 'special'
        }
    },

    // --- BLACKSMITH (The Spirit Forge) ---
    forgeRecipes: {
        'spirit_scimitar': { 
            name: 'Spirit Scimitar', 
            slot: 'weapon', 
            ingredients: { 'iron_ore': 5, 'spirit_herb': 2 },
            baseStats: { atk: 12 }
        },
        'spirit_turban': { 
            name: 'Spirit Turban', 
            slot: 'head', 
            ingredients: { 'spirit_herb': 4 },
            baseStats: { def: 5, mp: 10 }
        },
        'robe_of_zuhd': { 
            name: 'Robe of Zuhd', 
            slot: 'body', 
            ingredients: { 'spirit_herb': 6, 'iron_ore': 2 },
            baseStats: { def: 12, hp: 20 }
        }
    },

    rollQuality() {
        const roll = Math.random() * 100;
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
        if (!recipe) return { success: false, message: "Unknown recipe." };

        // Check ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            const current = state.player.inventory.materials[item] || 0;
            if (current < count) return { success: false, message: `Not enough ${item.replace(/_/g,' ')}.` };
        }

        // Consume ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            state.player.inventory.materials[item] -= count;
        }

        // Roll Quality
        const quality = this.rollQuality();
        const mult = this.getQualityMult(quality);

        const newItem = {
            id: `${recipeId}_${Date.now()}`,
            name: `${quality === 'Normal' ? '' : quality + ' '}${recipe.name}`,
            slot: recipe.slot,
            quality: quality,
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
            message: `The forge glows white-hot! You created a <b class="loot-${quality.toLowerCase()}">${newItem.name}</b>!`,
            item: newItem
        };
    },

    craftAlchemy(state, recipeId) {
        const recipe = this.alchemyRecipes[recipeId];
        if (!recipe) return { success: false, message: "Unknown recipe." };

        for (const [item, count] of Object.entries(recipe.ingredients)) {
            const current = state.player.inventory.materials[item] || 0;
            if (current < count) return { success: false, message: `Not enough ${item.replace(/_/g,' ')}.` };
        }

        for (const [item, count] of Object.entries(recipe.ingredients)) {
            state.player.inventory.materials[item] -= count;
        }

        if (recipe.type === 'potion') {
            state.player.inventory.potions++;
        } else if (recipe.type === 'special') {
            state.player.inventory.items.push({ name: recipe.name, type: 'consumable' });
        }

        return { success: true, message: `The furnace hums with divine Qi. Successfully brewed ${recipe.name}!` };
    }
};
