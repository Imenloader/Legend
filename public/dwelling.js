// ============================================================
// DWELLING.JS — Dwelling & Spiritual Roots System
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.DWELLING = {
    init(state) {
        if (!state.dwelling) {
            state.dwelling = {
                servants: 1,
                maxServants: 10,
                resources: {
                    food: 200,
                    wood: 100,
                    iron: 50
                },
                nodes: {
                    food: 1,
                    wood: 0,
                    iron: 0,
                    qi: 0
                },
                qiArrayLevel: 1,
                qi: 0,
                roots: {
                    gold: 0,  // ATK (+10)
                    wood: 0,  // HP (+50)
                    water: 0, // DEF (+8)
                    fire: 0,  // CRIT RATE (+1%)
                    earth: 0  // MP/QI (+25)
                }
            };
        }
    },

    // Passive heartbeat gathering
    process(state) {
        this.init(state);
        const d = state.dwelling;

        // Servant food consumption: 1 Food per servant per tick
        const foodConsumed = d.servants * 1;
        let efficiency = 1.0;

        if (d.resources.food < foodConsumed) {
            d.resources.food = 0;
            efficiency = 0.2; // Starving servants are only 20% productive!
        } else {
            d.resources.food -= foodConsumed;
        }

        // Production rates
        const foodGained = Math.floor(d.nodes.food * 5 * efficiency);
        const woodGained = Math.floor(d.nodes.wood * 3 * efficiency);
        const ironGained = Math.floor(d.nodes.iron * 1.5 * efficiency);
        
        d.resources.food += foodGained;
        d.resources.wood += woodGained;
        d.resources.iron += ironGained;

        // Passive Qi Array accumulation: increases by array level + servants allocated
        const baseQiGained = d.qiArrayLevel * 10;
        const allocatedQiGained = d.nodes.qi * 5 * efficiency;
        d.qi += Math.floor(baseQiGained + allocatedQiGained);
    },

    buyServant(state) {
        this.init(state);
        const d = state.dwelling;
        
        if (d.servants >= d.maxServants) {
            return { success: false, message: "Your Dwelling has reached its maximum servant capacity!" };
        }

        const cost = 200 + d.servants * 100;
        if (state.player.gold < cost) {
            return { success: false, message: `Not enough Spirit Stones! Requires ${cost} Stones.` };
        }

        state.player.gold -= cost;
        d.servants++;
        d.nodes.food++; // Put new servants to work gathering food by default
        return { success: true, message: `Recruited 1 Spiritual Servant for ${cost} Spirit Stones.` };
    },

    assignServant(state, nodeKey, amount) {
        this.init(state);
        const d = state.dwelling;

        if (amount > 0) {
            // Find a servant currently working on another node to re-allocate
            const sources = ['food', 'wood', 'iron', 'qi'].filter(k => k !== nodeKey);
            let reallocated = false;
            for (let src of sources) {
                if (d.nodes[src] > 0) {
                    d.nodes[src]--;
                    d.nodes[nodeKey]++;
                    reallocated = true;
                    break;
                }
            }
            if (!reallocated) {
                return { success: false, message: "All servants are already assigned! Recruit more servants." };
            }
        } else if (amount < 0) {
            if (d.nodes[nodeKey] <= 0) {
                return { success: false, message: "No servants working on this task." };
            }
            d.nodes[nodeKey]--;
            d.nodes.food++; // Move them back to food farming
        }

        return { success: true, message: `Servant allocated successfully.` };
    },

    upgradeQiArray(state) {
        this.init(state);
        const d = state.dwelling;

        const woodCost = d.qiArrayLevel * 150;
        const ironCost = d.qiArrayLevel * 80;

        if (d.resources.wood < woodCost || d.resources.iron < ironCost) {
            return { success: false, message: `Insufficient materials! Requires ${woodCost} Wood and ${ironCost} Iron.` };
        }

        d.resources.wood -= woodCost;
        d.resources.iron -= ironCost;
        d.qiArrayLevel++;

        return { success: true, message: `Qi-Gathering Array upgraded to Level ${d.qiArrayLevel}!` };
    },

    upgradeRoot(state, rootKey) {
        this.init(state);
        const d = state.dwelling;

        if (d.roots[rootKey] === undefined) return { success: false, message: "Invalid root type." };

        const currentLvl = d.roots[rootKey];
        const qiCost = Math.floor(100 * Math.pow(1.5, currentLvl));

        if (d.qi < qiCost) {
            return { success: false, message: `Insufficient Qi in Array! Requires ${qiCost} Qi.` };
        }

        d.qi -= qiCost;
        d.roots[rootKey]++;

        return { success: true, message: `Your ${rootKey.toUpperCase()} Root has reached Grade ${d.roots[rootKey]}!` };
    }
};
