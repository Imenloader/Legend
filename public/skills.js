// ============================================================
// SKILLS.JS — Martial Arts & Spiritual Techniques
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SKILLS = {
    // Database of learnable techniques
    techniques: {
        // --- Martial Techniques (Active) ---
        'lotus_strike': { id: 'lotus_strike', name: 'Lotus Strike', desc: 'A rapid flurry of strikes.', mpCost: 10, power: 1.5, type: 'fast', reqLvl: 1 },
        'mountain_peak_cleave': { id: 'mountain_peak_cleave', name: 'Mountain Peak Cleave', desc: 'A heavy blow that breaks guard.', mpCost: 20, power: 2.2, type: 'heavy', reqLvl: 5 },
        'shadow_step': { id: 'shadow_step', name: 'Shadow Step', desc: 'Increase dodge chance by 20% for 3 turns.', mpCost: 15, effect: { dodge: 0.2, duration: 3 }, type: 'buff', reqLvl: 3 },
        'earth_shatter': { id: 'earth_shatter', name: 'Earth Shatter', desc: 'Massive impact with a 30% stun chance.', mpCost: 25, power: 2.5, stunChance: 0.3, type: 'heavy', reqLvl: 8 },
        'blood_qi_burst': { id: 'blood_qi_burst', name: 'Blood Qi Burst', desc: 'Sacrifice 10% HP for a 50% ATK boost next turn.', mpCost: 0, hpCost: 0.1, effect: { atkBuff: 1.5, duration: 2 }, type: 'buff', reqLvl: 12 },
        'dragon_roar': { id: 'dragon_roar', name: 'Roar of the Azure Dragon', desc: 'Stun all enemies and deal 3x damage.', mpCost: 50, power: 3.0, stunChance: 1.0, type: 'heavy', reqLvl: 18 },
        'void_step': { id: 'void_step', name: 'Void Flicker Step', desc: 'Become untargetable for 1 turn.', mpCost: 45, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 22 },
        
        // --- Spiritual Spells (Active) ---
        'badr_blessing': { id: 'badr_blessing', name: 'Blessing of Badr', desc: 'Holy light restores 30% HP.', mpCost: 30, heal: 0.3, type: 'magic', reqLvl: 3 },
        'heavenly_rain': { id: 'heavenly_rain', name: 'Heavenly Sword Rain', desc: 'Multiple hits of spirit blades.', mpCost: 40, power: 3.5, type: 'magic', reqLvl: 15 },
        'sun_incineration': { id: 'sun_incineration', name: 'Nine Suns Incineration', desc: 'Immortal Spell: Massive burn damage over 5 turns.', mpCost: 60, power: 5.0, dot: { dmg: 0.5, duration: 5 }, type: 'magic', reqLvl: 25 },
        'phoenix_rebirth': { id: 'phoenix_rebirth', name: 'Ascension of the Phoenix', desc: 'Fully restore HP and gain 25% ATK/DEF for 3 turns.', mpCost: 80, heal: 1.0, effect: { atkBuff: 1.25, defBuff: 1.25, duration: 3 }, type: 'magic', reqLvl: 35 },
        'heaven_seal': { id: 'heaven_seal', name: 'Great Heaven Seal', desc: 'Immortal Spell: Reduce enemy ATK/DEF by 40%.', mpCost: 75, debuff: { atk: -0.4, def: -0.4, duration: 5 }, type: 'magic', reqLvl: 30 },

        // --- Passive Techniques ---
        'spirit_surge': { id: 'spirit_surge', name: 'Spirit Surge', desc: 'Passive: +10% MP recovery.', passive: true, stat: 'mpRegen', bonus: 0.1, reqLvl: 10 },
        'iron_bone_body': { id: 'iron_bone_body', name: 'Iron Bone Body', desc: 'Passive: +15% Max HP.', passive: true, stat: 'maxHp', bonus: 0.15, reqLvl: 12 },
        'sword_intent': { id: 'sword_intent', name: 'Sword Intent', desc: 'Passive: +20% Critical Damage.', passive: true, stat: 'critDmg', bonus: 0.2, reqLvl: 18 },
        'unending_dao': { id: 'unending_dao', name: 'Concept of the Unending Dao', desc: 'Passive: +25% Qi Gain and +10% to all stats.', passive: true, stat: 'allStats', bonus: 0.1, reqLvl: 40 },
        'eternal_breath': { id: 'eternal_breath', name: 'Eternal Breath', desc: 'Passive: Recover 5% HP every turn in combat.', passive: true, stat: 'hpRegen', bonus: 0.05, reqLvl: 22 }
    },

    // Get passive bonuses
    getPassiveBonuses: function(state) {
        let bonuses = { atk: 0, def: 0, hpRegen: 0, mpRegen: 0, maxHp: 0, critDmg: 0 };
        const learned = state.player.skills || [];
        
        // Manual Bonuses
        if (learned.includes('jade_body')) bonuses.def += 0.20;
        if (learned.includes('sword_heart')) bonuses.atk += 0.15;
        if (learned.includes('immortal_breath')) bonuses.hpRegen += 0.02;

        // Generic Passive System
        learned.forEach(id => {
            const skill = this.techniques[id];
            if (skill && skill.passive) {
                bonuses[skill.stat] = (bonuses[skill.stat] || 0) + skill.bonus;
            }
        });
        
        return bonuses;
    },

    checkUnlocks: function(state) {
        if (!state.player.skills) state.player.skills = [];
        Object.values(this.techniques).forEach(skill => {
            if (state.player.lvl >= skill.reqLvl && !state.player.skills.includes(skill.id)) {
                state.player.skills.push(skill.id);
                if (typeof narrate === 'function') {
                    narrate(`<b>New Technique Learned:</b> ${skill.name}!`, "System");
                }
            }
        });
    },

    getActiveSkills: function(state) {
        if (!state.player.skills) return [];
        return state.player.skills
            .map(id => this.techniques[id])
            .filter(s => s && !s.passive);
    }
};
