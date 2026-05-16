// ============================================================
// SECTS.JS — Sect Management & Disciple Recruitment
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SECTS = {
    ranks: ['Outer Court', 'Inner Court', 'Core Disciple', 'Elder', 'Grand Elder', 'Sect Master'],

    // Initial state for player's sect
    init(state) {
        if (!state.sect) {
            state.sect = {
                name: 'Unnamed Sect',
                level: 1,
                fame: 0,
                disciples: [],
                maxDisciples: 5,
                treasury: 0,
                specialization: null, // Sword, Alchemy, Array
                buildings: {
                    'meditation_hall': { lvl: 1, name: 'Meditation Hall', bonus: 'XP' },
                    'spirit_garden': { lvl: 0, name: 'Spirit Garden', bonus: 'Gold' }
                }
            };
        }
    },

    setSpecialization(state, path) {
        this.init(state);
        state.sect.specialization = path;
        // Apply immediate bonuses
        if (path === 'Sword') state.player.atk += 10;
        else if (path === 'Alchemy') state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 20;
        return { success: true, message: `Your sect has chosen the <b>${path} Path</b>!` };
    },

    // Recruit a random disciple
    recruit(state) {
        this.init(state);
        if (state.sect.disciples.length >= state.sect.maxDisciples) return { success: false, message: "Sect is at full capacity!" };
        
        const cost = 1000 * state.sect.level;
        if (state.player.gold < cost) return { success: false, message: "Not enough stones to recruit!" };
        
        const names = ['Jun', 'Lao', 'Xiao', 'Mei', 'Ying'];
        const d = {
            name: names[Math.floor(Math.random() * names.length)] + " " + (state.sect.disciples.length + 1),
            lvl: 1,
            atk: 5 + Math.floor(Math.random() * 5),
            quality: Math.random() > 0.9 ? 'Genius' : 'Normal'
        };
        
        state.player.gold -= cost;
        state.sect.disciples.push(d);
        return { success: true, message: `Recruited ${d.name} (${d.quality})!` };
    },

    // Sect heartbeat (Passive income/fame)
    process(state) {
        if (!state.sect) return;
        state.sect.fame += state.sect.disciples.length * 0.1;
        state.sect.treasury += state.sect.disciples.length * 5;
    },

    // Sect Diplomacy database
    rivalSects: [
        { id: 'demon_blade', name: 'Demon Blade Sect', relation: 'Hostile', power: 500, territory: 'Shadow Peaks' },
        { id: 'heavenly_lotus', name: 'Heavenly Lotus Sect', relation: 'Neutral', power: 300, territory: 'Mist Valley' },
        { id: 'righteous_sun', name: 'Righteous Sun Sect', relation: 'Ally', power: 450, territory: 'Solar Plateau' }
    ],

    territories: {
        'Crossroads Outskirts': { owner: 'Player', income: 100 },
        'Shadow Peaks': { owner: 'demon_blade', income: 500 },
        'Mist Valley': { owner: 'heavenly_lotus', income: 300 },
        'Solar Plateau': { owner: 'righteous_sun', income: 450 }
    },

    // Declare war on a rival
    declareWar(state, rivalId) {
        const rival = this.rivalSects.find(r => r.id === rivalId);
        if (!rival) return { success: false, message: "Rival not found." };
        rival.relation = 'War';
        return { success: true, message: `You have declared war on the <b>${rival.name}</b>!` };
    },

    // Resolve a turn of war
    resolveWarTurn(state, rivalId) {
        const rival = this.rivalSects.find(r => r.id === rivalId);
        if (!rival || rival.relation !== 'War') return;

        const playerPower = state.sect.disciples.filter(d => d.alive).reduce((acc, d) => acc + (d.atk || 5), 0);
        const winChance = playerPower / (playerPower + rival.power);

        if (Math.random() < winChance) {
            // Victory!
            const gain = Math.floor(rival.power * 0.1);
            state.sect.treasury += gain;
            rival.power -= gain;
            if (rival.power <= 0) {
                rival.relation = 'Defeated';
                this.territories[rival.territory].owner = 'Player';
                return { victory: true, message: `The <b>${rival.name}</b> has been CRUSHED! You now rule the <b>${rival.territory}</b>.` };
            }
            return { victory: true, message: `Your disciples won a major skirmish against the ${rival.name}! Looted ${gain} Stones.` };
        } else {
            // Defeat...
            const loss = Math.floor(state.sect.treasury * 0.1);
            state.sect.treasury -= loss;
            if (state.sect.disciples.length > 0) {
                const fallen = state.sect.disciples.pop();
                return { victory: false, message: `Your forces were repelled! <b>${fallen.name}</b> fell in battle. Lost ${loss} Stones.` };
            }
            return { victory: false, message: `Your sect is defenseless! The ${rival.name} plundered ${loss} Stones.` };
        }
    },

    // Sect heartbeat (Passive income/fame + Taxation)
    process(state) {
        if (!state.sect) return;
        state.sect.fame += state.sect.disciples.length * 0.1;
        state.sect.treasury += state.sect.disciples.length * 5;

        // Territory Taxation
        Object.values(this.territories).forEach(t => {
            if (t.owner === 'Player') state.sect.treasury += t.income / 10; // Per tick
        });
    },

    // Process sect-based random events
    processRandomEvent(state, narrate) {
        this.init(state);
        const roll = Math.random();

        if (roll < 0.3) {
            // Discovery Event
            const stones = Math.floor(Math.random() * 1000) + 200;
            narrate(`<b>Sect Discovery</b>: One of your disciples found a hidden spirit-vein! <b>+${stones} Spirit Stones</b> added to treasury.`, "Sect");
            state.sect.treasury += stones;
        } else if (roll < 0.6) {
            // Talent Event
            narrate(`<b>New Talent</b>: A wandering genius is impressed by your sect's fame (${Math.floor(state.sect.fame)}) and wishes to join!`, "Sect");
            const d = { name: "Genius " + (state.sect.disciples.length + 1), lvl: 2, atk: 15, quality: 'Genius', alive: true };
            state.sect.disciples.push(d);
        } else if (roll < 0.9) {
            // War Update
            const warring = this.rivalSects.filter(r => r.relation === 'War');
            if (warring.length > 0) {
                const rival = warring[Math.floor(Math.random() * warring.length)];
                const res = this.resolveWarTurn(state, rival.id);
                narrate(res.message, "War Room");
            } else {
                const rival = this.rivalSects[Math.floor(Math.random() * this.rivalSects.length)];
                if (rival.relation === 'Hostile' && Math.random() > 0.7) {
                    narrate(`<b>SKIRMISH!</b>: The <b>${rival.name}</b> has harassed your trade routes. Treasury takes a hit.`, "Sect");
                    state.sect.treasury -= 200;
                }
            }
        }
    }
};
