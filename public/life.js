// ============================================================
// LIFE.JS — The Birth & Life Simulation Engine
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.LIFE = {
    backgrounds: {
        'beggar': { id: 'beggar', name: 'Beggar Child', gold: 0, trait: 'Hungry Soul', desc: 'Born in the gutters. +20% XP gain but starts with nothing.', xpMult: 1.2 },
        'merchant': { id: 'merchant', name: 'Merchant Scion', gold: 5000, trait: 'Golden Tongue', desc: 'Born into wealth. -20% Shop prices.', priceMult: 0.8 },
        'royal': { id: 'royal', name: 'Imperial Prince', gold: 10000, trait: 'Heavenly Aura', desc: 'Born in the palace. +20% Base Stats but +50 Karma Debt.', statMult: 1.2, karma: -50 },
        'farmer': { id: 'farmer', name: 'Peasant Farmer', gold: 100, trait: 'Earth Root', desc: 'Born in the fields. +20% Max HP.', hpMult: 1.2 }
    },

    systems: {
        'many_children': { id: 'many_children', name: 'Many Children Many Blessings', desc: 'Gain +2% stats for every child born.' },
        'killing': { id: 'killing', name: 'God of Slaughter System', desc: 'Gain +1 Atk for every 10 kills.' },
        'sword_saint': { id: 'sword_saint', name: 'Sword Immortal System', desc: '2x Sword damage and auto-mastery of techniques.' }
    },

    // Roll a new life
    rollLife(state) {
        const bgKeys = Object.keys(this.backgrounds);
        const sysKeys = Object.keys(this.systems);
        
        state.player.background = this.backgrounds[bgKeys[Math.floor(Math.random() * bgKeys.length)]];
        state.player.system = this.systems[sysKeys[Math.floor(Math.random() * sysKeys.length)]];
        
        // Apply immediate background changes
        state.player.gold = state.player.background.gold;
        if (state.player.background.karma) state.player.karma = state.player.background.karma;
        
        this.generateFamily(state);
    },

    // Generate random family
    generateFamily(state) {
        const family = [];
        const names = ['Ali', 'Zhang', 'Wei', 'Layla', 'Omar', 'Fatima', 'Zhao'];
        const types = ['Father', 'Mother', 'Brother', 'Sister'];
        
        types.forEach(type => {
            family.push({
                name: names[Math.floor(Math.random() * names.length)],
                relation: type,
                affinity: 50, // 0-100
                alive: true
            });
        });
        
        state.player.family = family;
    }
};
