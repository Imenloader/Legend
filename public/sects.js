// ============================================================
// SECTS.JS — Sect Management, Hopping & Ultimates
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SECTS = {
    ranks: ['Outer Court', 'Inner Court', 'Core Disciple', 'Elder', 'Grand Elder', 'Sect Master'],

    sectsDb: {
        'jade_summit': { 
            id: 'jade_summit', 
            name: 'Jade Summit Sect', 
            tier: 1, 
            reqRealm: 'Qi Condensation', 
            cost: 0, 
            ult: 'jade_storm', 
            ultName: 'Jade Hurricane Storm' 
        },
        'sufi_order': { 
            id: 'sufi_order', 
            name: 'Empty Quarter Sufi Order', 
            tier: 2, 
            reqRealm: 'Foundation Establishment', 
            cost: 1000, 
            ult: 'sand_mantra', 
            ultName: 'Vast Sand Oasis Mantra' 
        },
        'solar_temple': { 
            id: 'solar_temple', 
            name: 'Righteous Solar Temple', 
            tier: 3, 
            reqRealm: 'Core Formation', 
            cost: 5000, 
            ult: 'solar_flare', 
            ultName: 'Nine Heavens Solar Flare' 
        },
        'nascent_void': { 
            id: 'nascent_void', 
            name: 'Nascent Void Abyss', 
            tier: 4, 
            reqRealm: 'Nascent Soul', 
            cost: 15000, 
            ult: 'void_annihilation', 
            ultName: 'Primordial Void Annihilation' 
        }
    },

    // Initial state for player's default sect
    init(state) {
        if (!state.sect) {
            state.sect = {
                id: 'jade_summit',
                name: 'Jade Summit Sect',
                tier: 1,
                contribution: 50,
                level: 1,
                fame: 10,
                disciples: [],
                maxDisciples: 5,
                treasury: 100,
                specialization: null, // Sword, Alchemy, Array
                buildings: {
                    'meditation_hall': { lvl: 1, name: 'Meditation Hall', bonus: 'XP' },
                    'spirit_garden': { lvl: 0, name: 'Spirit Garden', bonus: 'Gold' }
                }
            };
        }
    },

    leaveSect(state) {
        if (!state.sect) return { success: false, message: "You are not currently in any sect!" };
        const oldSectName = state.sect.name;
        
        let message = `You have formally departed the <b>${oldSectName}</b>.`;
        if (state.player.gold >= 1000) {
            state.player.gold -= 1000;
            message += ` Paid 1,000 Spirit Stones to keep your techniques intact.`;
        } else {
            // Betrayal purges learned sect ultimates from skills array!
            state.player.skills = (state.player.skills || []).filter(s => !s.startsWith('sect_'));
            message += ` <span style="color:var(--danger)">As penalty for betrayal, your meridians were purged of all learned sect ultimate techniques!</span>`;
        }
        state.sect = null;
        return { success: true, message };
    },

    joinSect(state, sectId) {
        if (state.sect) return { success: false, message: `You are already a member of the ${state.sect.name}! Leave them first.` };
        const s = this.sectsDb[sectId];
        if (!s) return { success: false, message: "Sect not found." };
        
        // Check realm requirement
        const currentRealm = state.player.cultivation?.stage || 'Qi Condensation';
        if (s.tier > 1) {
            const realms = ['Qi Condensation', 'Foundation Establishment', 'Core Formation', 'Nascent Soul'];
            const playerRealmIdx = realms.indexOf(currentRealm);
            const reqRealmIdx = realms.indexOf(s.reqRealm);
            if (playerRealmIdx < reqRealmIdx) {
                return { success: false, message: `Your realm is too low! Requires <b>${s.reqRealm}</b>.` };
            }
        }

        if (state.player.gold < s.cost) {
            return { success: false, message: `Insufficient Spirit Stones! Requires ${s.cost} Stones.` };
        }
        
        state.player.gold -= s.cost;
        state.sect = {
            id: s.id,
            name: s.name,
            tier: s.tier,
            contribution: 0,
            level: 1,
            fame: s.tier * 20,
            disciples: [],
            maxDisciples: 5,
            treasury: 0,
            specialization: null,
            buildings: {
                'meditation_hall': { lvl: 1, name: 'Meditation Hall', bonus: 'XP' },
                'spirit_garden': { lvl: 0, name: 'Spirit Garden', bonus: 'Gold' }
            }
        };

        return { success: true, message: `Welcome! You have been accepted into the <b>${s.name}</b>!` };
    },

    learnUltimate(state) {
        if (!state.sect) return { success: false, message: "You are not in a sect!" };
        const s = this.sectsDb[state.sect.id] || {
            ultName: "Primordial Jade Grand Ultimate",
            ult: "grand_dao",
            tier: state.sect.tier || 1
        };

        const cost = s.tier * 500;
        if ((state.sect.contribution || 0) < cost) {
            return { success: false, message: `Not enough Sect Contribution! Requires ${cost} points.` };
        }

        state.sect.contribution -= cost;
        const ultSkillId = 'sect_' + s.ult;
        if ((state.player.skills || []).includes(ultSkillId)) {
            return { success: false, message: "You have already mastered this ultimate technique!" };
        }

        if (!state.player.skills) state.player.skills = [];
        state.player.skills.push(ultSkillId);

        // Dynamically append skill registration so combat systems can trigger it
        if (window.SKILLS) {
            window.SKILLS.techniques[ultSkillId] = {
                id: ultSkillId,
                name: s.ultName,
                desc: `Grand Sect Ultimate. Deals massive elemental damage equal to ${s.tier * 2.5}x your raw Attack.`,
                mpCost: s.tier * 15,
                damageMult: s.tier * 2.5
            };
        }

        return { success: true, message: `Congratulations! You have mastered the legendary technique: <b>${s.ultName}</b>!` };
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
        if (state.player.gold < cost) return { success: false, message: "Not enough Spirit Stones to recruit!" };
        
        const names = ['Jun', 'Lao', 'Xiao', 'Mei', 'Ying'];
        const d = {
            name: names[Math.floor(Math.random() * names.length)] + " " + (state.sect.disciples.length + 1),
            lvl: 1,
            atk: 5 + Math.floor(Math.random() * 5),
            quality: Math.random() > 0.9 ? 'Genius' : 'Normal',
            alive: true
        };
        
        state.player.gold -= cost;
        state.sect.disciples.push(d);
        return { success: true, message: `Recruited ${d.name} (${d.quality})!` };
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

        const playerPower = state.sect.disciples.filter(d => d.alive !== false).reduce((acc, d) => acc + (d.atk || 5), 0);
        const winChance = playerPower / (playerPower + rival.power);

        if (Math.random() < winChance) {
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
            const loss = Math.floor(state.sect.treasury * 0.1);
            state.sect.treasury -= loss;
            if (state.sect.disciples.length > 0) {
                const fallen = state.sect.disciples.pop();
                return { victory: false, message: `Your forces were repelled! <b>${fallen.name}</b> fell in battle. Lost ${loss} Stones.` };
            }
            return { victory: false, message: `Your sect is defenseless! The ${rival.name} plundered ${loss} Stones.` };
        }
    },

    assignDisciple(state, index, task) {
        this.init(state);
        const d = state.sect.disciples[index];
        if (!d) return { success: false, message: "Disciple not found." };
        if (d.assignment === 'expedition') return { success: false, message: "Disciple is currently on an expedition and cannot be reassigned!" };
        
        d.assignment = task; // 'array', 'harvest', 'patrol', or undefined (idle)
        return { success: true, message: `Assigned <b>${d.name}</b> to <b>${task ? task.toUpperCase() : 'IDLE'}</b> duties.` };
    },

    sendOnExpedition(state, index) {
        this.init(state);
        const d = state.sect.disciples[index];
        if (!d) return { success: false, message: "Disciple not found." };
        if (d.assignment === 'expedition') return { success: false, message: "Disciple is already on an expedition!" };
        
        const dw = state.dwelling || { resources: { food: 0 } };
        if ((dw.resources.food || 0) < 500) {
            return { success: false, message: "You lack the 500 Food required to provision this expedition." };
        }
        
        dw.resources.food -= 500;
        d.assignment = 'expedition';
        d.expeditionTicks = 12; // 1 minute (12 ticks of 5s heartbeat)
        return { success: true, message: `Dispatched <b>${d.name}</b> on a dangerous wilderness expedition! Provisioned 500 Food.` };
    },

    // Passive heartbeat (Passive income/fame + Taxation + Sect Contribution Gain)
    process(state) {
        if (!state.sect) return;
        this.init(state);

        state.sect.fame += state.sect.disciples.length * 0.1;
        state.sect.treasury += state.sect.disciples.length * 5;
        state.sect.contribution = (state.sect.contribution || 0) + 15; // Passive contribution over time!

        // Process disciple operations & expeditions
        if (state.sect.disciples) {
            state.sect.disciples.forEach(d => {
                if (!d.alive) return;
                
                // Handle Expeditions
                if (d.assignment === 'expedition') {
                    d.expeditionTicks--;
                    if (d.expeditionTicks <= 0) {
                        d.assignment = undefined; // Return to idle
                        d.lvl++;
                        d.atk += 4;
                        
                        const mats = ['spirit_herb', 'iron_ore', 'monster_core', 'dragon_vein_shard'];
                        const rewardMat = mats[Math.floor(Math.random() * mats.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        
                        if (!state.player.inventory.materials) state.player.inventory.materials = {};
                        state.player.inventory.materials[rewardMat] = (state.player.inventory.materials[rewardMat] || 0) + qty;
                        
                        let pillMsg = "";
                        if (Math.random() < 0.4) {
                            if (!state.player.inventory.items) state.player.inventory.items = [];
                            state.player.inventory.items.push({
                                id: 'qi_pill',
                                name: 'Qi Pill',
                                slot: 'pill',
                                quality: 'Rare',
                                desc: 'Instantly grants 100 Qi.'
                            });
                            pillMsg = " and 1x <b>Qi Pill</b>";
                        }
                        
                        if (typeof narrate === 'function') {
                            narrate(`<b>Expedition Return</b>: <b>${d.name}</b> has successfully returned! Gained 1 level (Lvl ${d.lvl}) and discovered <b>${qty}x ${rewardMat.replace(/_/g, ' ').toUpperCase()}</b>${pillMsg}!`, "Sect");
                        }
                    }
                }
                
                // Handle Resource Harvesting
                if (d.assignment === 'harvest') {
                    if (!state.player.inventory.materials) state.player.inventory.materials = {};
                    const harvestRoll = Math.random();
                    if (harvestRoll < 0.3) {
                        state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 1;
                    } else if (harvestRoll < 0.6) {
                        state.player.inventory.materials['iron_ore'] = (state.player.inventory.materials['iron_ore'] || 0) + 1;
                    }
                    if (state.dwelling && state.dwelling.resources) {
                        state.dwelling.resources.food = (state.dwelling.resources.food || 0) + 2;
                    }
                }
            });
        }

        // Territory Taxation
        Object.values(this.territories).forEach(t => {
            if (t.owner === 'Player') state.sect.treasury += t.income / 10;
        });
    },

    processRandomEvent(state, narrate) {
        this.init(state);
        const roll = Math.random();

        if (roll < 0.3) {
            const stones = Math.floor(Math.random() * 1000) + 200;
            narrate(`<b>Sect Discovery</b>: One of your disciples found a hidden spirit-vein! <b>+${stones} Spirit Stones</b> added to treasury.`, "Sect");
            state.sect.treasury += stones;
        } else if (roll < 0.6) {
            narrate(`<b>New Talent</b>: A wandering genius is impressed by your sect's fame (${Math.floor(state.sect.fame)}) and wishes to join!`, "Sect");
            const d = { name: "Genius " + (state.sect.disciples.length + 1), lvl: 2, atk: 15, quality: 'Genius', alive: true };
            state.sect.disciples.push(d);
        } else if (roll < 0.9) {
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
