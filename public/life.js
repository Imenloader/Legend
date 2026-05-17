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
        'killing': { id: 'killing', name: 'Supreme of Slaughter System', desc: 'Gain +1 Atk for every 10 kills.' },
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
        const maleNames = ['Ali', 'Zhang', 'Wei', 'Omar', 'Zhao', 'Ahmed', 'Khalid', 'Hassan', 'Chen', 'Li', 'Jian', 'Youssef'];
        const femaleNames = ['Layla', 'Fatima', 'Yue', 'Meiling', 'Farah', 'Aisha', 'Jing', 'Zahra', 'Mei', 'Lin', 'Noor', 'Xing'];
        
        const types = [
            { relation: 'Father', gender: 'male' },
            { relation: 'Mother', gender: 'female' },
            { relation: 'Brother', gender: 'male' },
            { relation: 'Sister', gender: 'female' }
        ];
        
        const usedNames = new Set();
        
        types.forEach(t => {
            const namePool = t.gender === 'male' ? maleNames : femaleNames;
            let name;
            let attempts = 0;
            do {
                name = namePool[Math.floor(Math.random() * namePool.length)];
                attempts++;
            } while (usedNames.has(name) && attempts < 10);
            
            usedNames.add(name);
            
            family.push({
                id: `fam_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                relation: t.relation,
                affinity: 50 + Math.floor(Math.random() * 20), // Start with slight positive affinity
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
            else { state.player.gold += 500; narrate(`Gained 500 Spirit Stones!`, "System"); }
        } else if (roll < 0.7) {
            // Marriage / Sibling Event
            narrate(`<b>Family News</b>: Your ${member.relation} ${member.name} has reached a breakthrough in their own cultivation! Their affinity towards you grows as you share in the celebration.`, "Family");
            member.affinity = Math.min(100, member.affinity + 10);
            member.lvl++;
        } else if (roll < 0.85) {
            // Family Crisis
            const crisisType = Math.random() > 0.5 ? 'Kidnapped' : 'Sick';
            narrate(`<b>CRISIS!</b>: Your ${member.relation} ${member.name} is ${crisisType === 'Kidnapped' ? 'being held for ransom by the Demon Blade Sect!' : 'suffering from a severe Qi-poisoning!'}`, "Family");
            narrate(`You must act soon, or they will perish. (Manage this in the Family screen)`, "System");
            member.crisis = crisisType;
        } else if (state.player.karma < -50 && roll < 0.95) {
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
    },

    dualCultivate(state) {
        if (!state.player.spouse) {
            return { success: false, message: "You must be married to dual cultivate!" };
        }
        
        const now = Date.now();
        if (state._lastDualCultivate && now - state._lastDualCultivate < 30000) { 
            const waitTime = Math.ceil((30000 - (now - state._lastDualCultivate)) / 1000);
            return { success: false, message: `Your meridians are still recovering. Wait ${waitTime}s.` };
        }
        
        state._lastDualCultivate = now;
        
        const baseXP = state.player.lvl * 80;
        const xpBonus = Math.floor(baseXP * (1 + (state.player.spouse.affinity || 70) / 100));
        state.player.xp += xpBonus;
        
        let levelUp = false;
        if (state.player.xp >= state.player.maxXp) {
            state.player.lvl++;
            state.player.xp -= state.player.maxXp;
            state.player.maxXp = 100 + (state.player.lvl - 1) * 80;
            if (state.player.cultivation) {
                state.player.cultivation.stageLevel++;
            }
            levelUp = true;
        }

        state.player.spouse.affinity = Math.min(100, (state.player.spouse.affinity || 70) + 5);

        let message = `You and <b>${state.player.spouse.name}</b> seat yourselves face-to-face, cycling your Yin and Yang energies in a perfect dual loop. <span class="loot-epic">+${xpBonus} XP</span> gained! Spousal affinity is now <b>${state.player.spouse.affinity}%</b>.`;
        if (levelUp) {
            message += `<br><br><span class="loot-epic">🌟 Cultivation Breakthrough! You gained a level!</span>`;
        }

        if (Math.random() < 0.3) {
            if (!state.player.inventory.materials) state.player.inventory.materials = {};
            state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 1;
            message += `<br><small style="color:var(--secondary)">🎁 Your spouse gifted you a <b>Spirit Herb</b> from their private garden.</small>`;
        }

        calculateTotalStats();
        if (typeof updateTopBar === 'function') updateTopBar();
        saveGame();
        
        return { success: true, message };
    },

    // --- Ancestral Pagoda Upgrade Matrix ---
    upgradeAncestralPagoda(state) {
        if (!state.player.familyPagodaLevel) state.player.familyPagodaLevel = 0;
        const currentLvl = state.player.familyPagodaLevel;
        if (currentLvl >= 3) return { success: false, message: "Your Ancestral Pagoda has reached its absolute peak!" };
        
        const costs = [
            { wood: 500, iron: 200, stones: 1000 },
            { wood: 1500, iron: 800, stones: 3000 },
            { wood: 4000, iron: 2000, stones: 8000 }
        ];
        
        const cost = costs[currentLvl];
        const dw = state.dwelling || { resources: { wood: 0, iron: 0 } };
        
        if ((dw.resources.wood || 0) < cost.wood || (dw.resources.iron || 0) < cost.iron || (state.player.gold || 0) < cost.stones) {
            return { 
                success: false, 
                message: `Not enough resources to upgrade!<br>Requires: 🪵 ${cost.wood} Wood, 🪙 ${cost.iron} Iron, and 💎 ${cost.stones} Spirit Stones.` 
            };
        }
        
        // Deduct resources
        dw.resources.wood -= cost.wood;
        dw.resources.iron -= cost.iron;
        state.player.gold -= cost.stones;
        state.player.familyPagodaLevel++;
        
        const names = [
            "Shrine of Remembrance (+10% Meditation Qi)",
            "Hall of Heroes (+15% Companion Affinity Rate)",
            "Imperial Mausoleum (+15% global Critical Damage)"
        ];
        
        return { 
            success: true, 
            message: `<b>Ancestral Pagoda Upgraded!</b><br>Established the <b>${names[currentLvl]}</b>!` 
        };
    },

    // --- Interactive Family Crisis Resolutions ---
    resolveFamilyCrisis(state, memberId, option) {
        const member = (state.player.family || []).find(f => f.id === memberId);
        if (!member || !member.crisis) return { success: false, message: "This family member is safe and sound." };
        
        if (option === 'pay') {
            const cost = member.crisis === 'Kidnapped' ? 2000 : 1500;
            if (state.player.gold < cost) return { success: false, message: `You lack the ${cost} Spirit Stones required for this action.` };
            
            state.player.gold -= cost;
            member.crisis = null;
            member.affinity = Math.min(100, member.affinity + 20);
            return { 
                success: true, 
                message: `You paid the sum. <b>${member.name}</b> has been safely restored to health and freedom! Affinity is now <b>${member.affinity}</b>.` 
            };
        }
        
        if (option === 'disciple') {
            if (!state.sect || !state.sect.disciples || state.sect.disciples.length === 0) {
                return { success: false, message: "You do not own a sect or have any disciples to dispatch!" };
            }
            
            // Find highest level available disciple not on expedition
            const disciple = state.sect.disciples.find(d => d.alive && d.assignment !== 'expedition');
            if (!disciple) return { success: false, message: "All disciples are currently busy or dead!" };
            
            const chance = disciple.lvl * 0.15;
            const roll = Math.random();
            
            if (roll <= chance) {
                member.crisis = null;
                member.affinity = Math.min(100, member.affinity + 25);
                disciple.lvl++;
                disciple.atk += 3;
                return {
                    success: true,
                    message: `<b>Success!</b> Disciple <b>${disciple.name}</b> defeated the threat and rescued ${member.name}! Disciple leveled up to <b>Lvl ${disciple.lvl}</b>.`
                };
            } else {
                disciple.lvl = Math.max(1, disciple.lvl - 1);
                return {
                    success: false,
                    message: `<b>Failure!</b> Disciple <b>${disciple.name}</b> was defeated and returned heavily injured. ${member.name} remains in danger!`
                };
            }
        }
        
        if (option === 'fight') {
            member._pendingRescue = true;
            const boss = {
                id: 'rescue_boss',
                name: member.crisis === 'Kidnapped' ? 'Demon Blade Enforcer' : 'Poison Spectre',
                baseHp: 180 + state.player.lvl * 20,
                hp: 180 + state.player.lvl * 20,
                maxHp: 180 + state.player.lvl * 20,
                baseAtk: 18 + state.player.lvl * 3,
                atk: 18 + state.player.lvl * 3,
                dialogue: "You dare cross the shadows to claim what is ours?! Pay in blood!",
                sprite: 'boss'
            };
            
            setTimeout(() => { startCombat(boss); }, 500);
            return { success: true, message: "Drawing your blade, you head out personally to confront the threat!" };
        }
        
        return { success: false, message: "Invalid crisis resolution option." };
    }
};
