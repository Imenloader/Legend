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
            type: 'potion',
            resultItem: 'potion'
        },
        'foundation_pill': {
            name: 'Foundation Pill',
            desc: 'Required to breakthrough to Foundation Establishment.',
            ingredients: { 'spirit_herb': 5, 'monster_core': 1 },
            type: 'elixir',
            resultItem: 'foundation_pill'
        },
        'iron_skin_elixir': {
            name: 'Iron Skin Elixir',
            desc: 'Permanently increases Defense by 2.',
            ingredients: { 'iron_ore': 3, 'monster_core': 1 },
            type: 'elixir',
            resultItem: 'iron_skin_elixir'
        }
    },

    craftAlchemy(state, recipeId) {
        const recipe = this.alchemyRecipes[recipeId];
        if (!recipe) return { success: false, message: "Unknown recipe." };

        // Check ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            const current = state.player.inventory.materials[item] || 0;
            if (current < count) {
                return { success: false, message: `Not enough ${item}. Need ${count}.` };
            }
        }

        // Consume ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            state.player.inventory.materials[item] -= count;
        }

        // Add result
        if (recipe.type === 'potion') {
            state.player.inventory.potions++;
        } else if (recipe.type === 'elixir') {
            state.player.inventory.elixirs++;
            if (!state.player.inventory.items) state.player.inventory.items = [];
            state.player.inventory.items.push(recipe.resultItem);
        }

        return { success: true, message: `Successfully crafted ${recipe.name}!` };
    },

    // --- BLACKSMITH (The Spirit Forge) ---
    upgradeCosts: {
        1: { gold: 50, materials: { 'iron_ore': 2 } },
        2: { gold: 100, materials: { 'iron_ore': 4, 'spirit_herb': 1 } },
        3: { gold: 250, materials: { 'meteor_iron': 1, 'monster_core': 1 } }
    },

    upgradeEquipment(state, slot) {
        const eqId = state.player.equipment[slot];
        if (!eqId) return { success: false, message: `No equipment in ${slot} slot.` };

        // We assume eqId is like "iron_sword_1" where 1 is the level.
        // If it's just "iron_sword", level is 0.
        let baseId = eqId;
        let currentLevel = 0;
        const match = eqId.match(/(.*)_(\d+)$/);
        if (match) {
            baseId = match[1];
            currentLevel = parseInt(match[2]);
        }

        const nextLevel = currentLevel + 1;
        const cost = this.upgradeCosts[nextLevel];

        if (!cost) return { success: false, message: "Equipment cannot be upgraded further." };

        // Check gold (assuming karma acts as currency for now, or add gold)
        // For simplicity, we'll just check materials
        for (const [item, count] of Object.entries(cost.materials)) {
            const current = state.player.inventory.materials[item] || 0;
            if (current < count) {
                return { success: false, message: `Not enough ${item}. Need ${count}.` };
            }
        }

        // Consume materials
        for (const [item, count] of Object.entries(cost.materials)) {
            state.player.inventory.materials[item] -= count;
        }

        // Upgrade
        const newEqId = `${baseId}_${nextLevel}`;
        state.player.equipment[slot] = newEqId;

        // Apply stat changes (In reality, we recalculate stats globally, but we'll bump a base stat here for effect)
        if (slot === 'weapon') state.player.atk += 5;
        if (slot === 'armor') state.player.def += 3;

        return { success: true, message: `Upgraded ${slot} to +${nextLevel}!` };
    }
};
