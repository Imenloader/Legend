// ============================================================
// SHOP.JS — Economy & Sect Markets
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SHOP = {
    // Current stock for different shop types
    stocks: {
        crossroads_market: [
            { id: 'iron_ore', name: 'Iron Ore', price: 10, type: 'material', desc: 'Basic forging material.' },
            { id: 'spirit_herb', name: 'Spirit Herbs', price: 15, type: 'material', desc: 'Used for basic alchemy.' },
            { id: 'healing_ointment', name: 'Healing Ointment', price: 50, type: 'consumable', desc: 'Restores 50 HP.', effect: { hp: 50 } },
            { id: 'spirit_water', name: 'Spirit Water', price: 40, type: 'consumable', desc: 'Restores 30 Qi.', effect: { mp: 30 } }
        ],
        jade_sect_shop: [
            { id: 'foundation_pill', name: 'Foundation Pill', price: 1000, type: 'consumable', desc: 'Required for Foundation Establishment.' },
            { id: 'jade_charm', name: 'Jade Charm', price: 500, type: 'relic', slot: 'relic', stats: { def: 15, mp: 20 }, desc: 'A basic protective charm.' },
            { id: 'disciple_sword', name: 'Disciple Sword', price: 800, type: 'weapon', slot: 'weapon', stats: { atk: 25 }, desc: 'Standard issue jade sect blade.' }
        ],
        sufi_bazaar: [
            { id: 'empty_quarter_dates', name: 'Sacred Dates', price: 60, type: 'consumable', desc: 'Restores 40 HP and 20 Qi.', effect: { hp: 40, mp: 20 } },
            { id: 'prayer_beads', name: 'Tasbih of Peace', price: 600, type: 'relic', slot: 'relic', stats: { mp: 50, def: 10 }, desc: 'Beads that calm the spirit.' },
            { id: 'sufi_tunic', name: 'Woolen Tunic', price: 450, type: 'body', slot: 'body', stats: { def: 20, hp: 30 }, desc: 'Simple but resilient clothing.' }
        ]
    },

    // Buy an item
    buy(state, shopId, itemId) {
        const shop = this.stocks[shopId];
        const item = shop.find(i => i.id === itemId);
        if (!item) return { success: false, message: "Item not found." };
        
        if (state.player.gold < item.price) {
            return { success: false, message: "Not enough Spirit Stones." };
        }

        state.player.gold -= item.price;
        if (item.type === 'material') {
            if (!state.player.inventory.materials) state.player.inventory.materials = {};
            state.player.inventory.materials[item.id] = (state.player.inventory.materials[item.id] || 0) + 1;
        } else {
            if (!state.player.inventory.items) state.player.inventory.items = [];
            state.player.inventory.items.push({ ...item });
        }
        
        return { success: true, message: `Purchased ${item.name}!` };
    },

    // Sell an item (standard 50% price)
    sell(state, itemIndex) {
        const item = state.player.inventory.items[itemIndex];
        if (!item) return { success: false, message: "Item not found in inventory." };
        
        const price = Math.floor((item.price || 50) * 0.5);
        state.player.gold += price;
        state.player.inventory.items.splice(itemIndex, 1);
        
        return { success: true, message: `Sold ${item.name} for ${price} Spirit Stones.` };
    }
};
