// ============================================================
// PETS.JS — The Beast Pavilion & Spirit Taming
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.PETS = {
    // Database of tamable beasts
    beasts: {
        'desert_jinn': { id: 'desert_jinn', name: 'Desert Jinn', rarity: 'Rare', type: 'Spirit', bonus: { atk: 0.1, mp: 20 }, skill: 'Spirit Whirl', desc: 'A swirling vortex of sand and soul.' },
        'jade_qilin': { id: 'jade_qilin', name: 'Jade Qilin', rarity: 'Mythic', type: 'Divine', bonus: { def: 0.15, hp: 50 }, skill: 'Heavenly Gaze', desc: 'An auspicious beast that brings peace.' },
        'shadow_stalker': { id: 'shadow_stalker', name: 'Shadow Stalker', rarity: 'Uncommon', type: 'Beast', bonus: { crit: 0.1 }, skill: 'Shadow Pounce', desc: 'It hunts where the light does not reach.' }
    },

    // Initialize state
    init(state) {
        if (!state.player.pets) state.player.pets = [];
        if (!state.player.activePet) state.player.activePet = null;
    },

    // Tame a beast
    tame(state, beastId) {
        this.init(state);
        const beast = this.beasts[beastId];
        if (!beast) return { success: false, message: "Beast not found." };
        
        if (state.player.pets.some(p => p.id === beastId)) {
            return { success: false, message: "You already have this companion." };
        }

        state.player.pets.push({ ...beast, xp: 0, level: 1 });
        if (!state.player.activePet) state.player.activePet = beastId;
        
        return { success: true, message: `Successfully tamed ${beast.name}!` };
    },

    // Get active pet data
    getActive(state) {
        if (!state.player.activePet) return null;
        return state.player.pets.find(p => p.id === state.player.activePet);
    },

    // Get pet bonuses
    getBonuses(state) {
        const pet = this.getActive(state);
        return pet ? pet.bonus : {};
    }
};
