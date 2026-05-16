// ============================================================
// SKILLS.JS — Martial Arts & Spiritual Techniques
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SKILLS = {
    // Database of learnable techniques
    techniques: {
        'lotus_strike': { id: 'lotus_strike', name: 'Lotus Strike', desc: 'A rapid flurry of strikes.', mpCost: 10, power: 1.5, type: 'fast', reqLvl: 1 },
        'mountain_peak_cleave': { id: 'mountain_peak_cleave', name: 'Mountain Peak Cleave', desc: 'A heavy blow that breaks guard.', mpCost: 20, power: 2.2, type: 'heavy', reqLvl: 5 },
        'badr_blessing': { id: 'badr_blessing', name: 'Blessing of Badr', desc: 'Holy light restores HP.', mpCost: 30, heal: 0.3, type: 'magic', reqLvl: 3 },
        'spirit_surge': { id: 'spirit_surge', name: 'Spirit Surge', desc: 'Passive: +10% MP recovery.', passive: true, stat: 'mpRegen', bonus: 0.1, reqLvl: 10 }
    },

    // Check for new skill unlocks
    checkUnlocks(state) {
        if (!state.player.skills) state.player.skills = [];
        Object.values(this.techniques).forEach(skill => {
            if (state.player.lvl >= skill.reqLvl && !state.player.skills.includes(skill.id)) {
                state.player.skills.push(skill.id);
                if (typeof narrate === 'function') {
                    narrate(`New Technique Learned: ${skill.name}!`, "System");
                }
            }
        });
    },

    // Get active skills for combat
    getActiveSkills(state) {
        if (!state.player.skills) return [];
        return state.player.skills
            .map(id => this.techniques[id])
            .filter(s => !s.passive);
    },

    // Get passive bonuses
    getPassiveBonuses(state) {
        if (!state.player.skills) return {};
        const bonuses = {};
        state.player.skills.forEach(id => {
            const skill = this.techniques[id];
            if (skill && skill.passive) {
                bonuses[skill.stat] = (bonuses[skill.stat] || 0) + skill.bonus;
            }
        });
        return bonuses;
    }
};
