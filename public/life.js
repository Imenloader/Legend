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
                id: `fam_${Math.random().toString(36).substr(2, 9)}`,
                name: names[Math.floor(Math.random() * names.length)],
                relation: type,
                affinity: 50, // 0-100
                alive: true,
                lvl: 1
            });
        });
        
        state.player.family = family;
    },

    // Process life-based random events
    processRandomEvent(state, narrate) {
        if (!state.player.family) return;
        
        const roll = Math.random();
        const aliveFamily = state.player.family.filter(f => f.alive);
        if (aliveFamily.length === 0) return;

        const member = aliveFamily[Math.floor(Math.random() * aliveFamily.length)];

        if (roll < 0.4) {
            // Affinity Event
            const gift = Math.random() > 0.5 ? 'Qi Pill' : 'Spirit Stone Bag';
            narrate(`<b>Family Visit</b>: Your ${member.relation} ${member.name} visits you at the Crossroads. They are proud of your progress and give you a <b>${gift}</b>.`, "Family");
            member.affinity = Math.min(100, member.affinity + 5);
            if (gift === 'Qi Pill') { state.player.xp += 100; narrate(`Gained 100 Qi!`, "System"); }
            else { state.player.gold += 500; narrate(`Gained 500 Gold!`, "System"); }
        } else if (roll < 0.7) {
            // Marriage / Sibling Event
            narrate(`<b>Family News</b>: Your ${member.relation} ${member.name} has reached a breakthrough in their own cultivation! Their affinity towards you grows as you share in the celebration.`, "Family");
            member.affinity = Math.min(100, member.affinity + 10);
            member.lvl++;
        } else if (state.player.karma < -50 && roll < 0.9) {
            // Karma Tribulation
            narrate(`<b>TRIBULATION WARNING</b>: The heavens frown upon your demonic deeds. A bolt of karmic lightning strikes your meditation chamber!`, "Heavenly Dao");
            state.player.hp = Math.max(1, Math.floor(state.player.hp * 0.7));
            if (typeof triggerScreenShake === 'function') triggerScreenShake();
        }
    },

    // Marriage System
    seekMarriage(state, narrate) {
        if (state.player.gold < 5000) return { success: false, message: "A proper wedding requires at least 5000 Spirit Stones!" };
        
        const candidateNames = ['Xing', 'Laila', 'Farah', 'Jie', 'Yue'];
        const name = candidateNames[Math.floor(Math.random() * candidateNames.length)];
        
        state.player.gold -= 5000;
        state.player.spouse = { name, affinity: 70, children: 0 };
        
        return { success: true, message: `You have married <b>${name}</b>! A grand ceremony was held at the Crossroads.` };
    },

    processBirth(state, narrate) {
        if (!state.player.spouse) return;
        if (Math.random() < 0.1) { // 10% chance per heartbeat if married
            state.player.children = (state.player.children || 0) + 1;
            narrate(`<b>A New Life!</b>: Your spouse ${state.player.spouse.name} has given birth to a healthy child. Your lineage grows stronger.`, "Family");
            if (window.BALANCE) window.BALANCE.applyToState(state); // Re-calculate stat bonuses
        }
    }
};
