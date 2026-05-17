// ============================================================
// REBIRTH.JS — Transmigration & Ancestral Legacy
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.REBIRTH = {
    traits: {
        'heavenly_bones': { id: 'heavenly_bones', name: 'Heavenly Bones', desc: '+20% Base HP permanently.', bonus: { hp: 0.2 } },
        'spirit_eye': { id: 'spirit_eye', name: 'Spirit Eye', desc: '+10% Crit Rate permanently.', bonus: { crit: 0.1 } },
        'jinn_luck': { id: 'jinn_luck', name: 'Jinn Luck', desc: '+50% Spirit Stone gain.', bonus: { goldMult: 0.5 } }
    },

    // Initialize legacy state
    init(state) {
        if (!state.legacy) {
            state.legacy = {
                rebirthCount: 0,
                totalLevels: 0,
                traits: [],
                permanentStats: { atk: 0, def: 0, hp: 0, mp: 0 }
            };
        }
    },

    // Perform the rebirth
    perform(state, traitId) {
        this.init(state);
        const trait = this.traits[traitId];
        if (!trait) return false;

        // Save legacy data
        state.legacy.rebirthCount++;
        state.legacy.totalLevels += state.player.lvl;
        state.legacy.traits.push(traitId);
        
        // Carry over 5% of stats as permanent bonus
        state.legacy.permanentStats.atk += Math.floor(state.player.atk * 0.05);
        state.legacy.permanentStats.def += Math.floor(state.player.def * 0.05);
        state.legacy.permanentStats.hp += Math.floor(state.player.maxHp * 0.05);
        state.legacy.permanentStats.mp += Math.floor(state.player.maxMp * 0.05);

        // Reset Player but keep name and certain flags
        const oldName = state.player.name;
        const oldClass = state.player.class;
        const oldSprite = state.player.sprite;

        state.player = {
            name: oldName,
            class: oldClass,
            sprite: oldSprite,
            lvl: 1, xp: 0, maxXp: 100,
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            atk: 10, def: 5,
            gold: 100, karma: 0,
            children: 0, kills: 0,
            inventory: { potions: 2, elixirs: 0, items: [], materials: {}, blueprints: [] },
            equipment: { head: null, body: null, legs: null, boots: null, weapon: null, relic: null, necklace: null, ring: null },
            skills: []
        };


        return true;
    }
};
