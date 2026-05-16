// ============================================================
// COMBAT.JS — Phase 4: "The Flowing Dao" Engine
// Momentum, Forms (Stances), and execution Staggers
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.COMBAT = {

    // Initialize combat state variables
    // Initialize combat state variables
    initCombatState(state) {
        state.combatState = 'enemy_prep';
        state.momentum = 0; // -100 to 100
        state.playerForm = 'water'; // water, mountain, wind
        state.enemyStaggered = false;
        state.playerGuardBroken = false;
        
        // Reset old buffs/debuffs
        state.activeBuffs = [];
        state.enemyDebuffs = [];
        state.dotEffects = []; // { type: 'burn', dmg: 10, duration: 3 }
        
        state.playerDmgBonus = 1;
        state.enemyAtkDebuff = 1;

        // Apply active companion passive
        const activeComp = window.COMPANIONS?.getActive(state);
        if (activeComp && activeComp.passiveBuff && activeComp.passiveBuff.effect) {
            activeComp.passiveBuff.effect(state);
        }
    },

    // Process status effects at the start of turn
    processTurnEffects(state, enemy) {
        let msg = '';
        
        // 1. Process DOTs
        state.dotEffects = (state.dotEffects || []).filter(dot => {
            const dmg = Math.floor(dot.dmg);
            enemy.hp = Math.max(0, enemy.hp - dmg);
            msg += `<br><span style="color:var(--danger)">${enemy.name} takes ${dmg} ${dot.type} damage!</span>`;
            dot.duration--;
            return dot.duration > 0;
        });

        // 2. Process Buffs
        state.activeBuffs = (state.activeBuffs || []).filter(buff => {
            buff.duration--;
            if (buff.duration <= 0 && buff.onExpire) buff.onExpire(state);
            return buff.duration > 0;
        });

        // 3. Process Debuffs
        state.enemyDebuffs = (state.enemyDebuffs || []).filter(debuff => {
            debuff.duration--;
            return debuff.duration > 0;
        });

        // 4. Player Regens
        if (state.player.hpRegen > 0) {
            const hReg = Math.floor(state.player.maxHp * state.player.hpRegen);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + hReg);
            if (hReg > 0) msg += `<br><span style="color:var(--secondary)">You regenerate ${hReg} HP.</span>`;
        }
        if (state.player.mpRegen > 0) {
            const mReg = Math.floor(state.player.maxMp * state.player.mpRegen);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + mReg);
            if (mReg > 0) msg += `<br><span style="color:var(--jade)">You regenerate ${mReg} Qi.</span>`;
        }

        // 5. Stun recovery
        if (state.enemyStunned) {
            msg += `<br><b>${enemy.name} is stunned and cannot move!</b>`;
            state.enemyStunned = false; 
            state.skipEnemyTurn = true;
        } else {
            state.skipEnemyTurn = false;
        }

        return msg;
    },

    useCompanionAbility(state, enemy) {
        const activeComp = window.COMPANIONS?.getActive(state);
        if (!activeComp || !activeComp.uniqueAbility) return { success: false, message: 'No active companion ability.' };
        
        const ability = activeComp.uniqueAbility;
        const compState = state.companions[activeComp.id];
        const affinityMult = 1 + (compState.affinity / 100); 

        let msg = `<b>${activeComp.name}</b> uses <b>${ability.name}</b>!`;
        let success = true;

        switch(ability.effect) {
            case 'triple_damage_stun':
                const dmg = Math.floor(state.player.atk * 3 * affinityMult);
                enemy.hp = Math.max(0, enemy.hp - dmg);
                state.momentum = Math.min(100, state.momentum + 40);
                msg += `<br>${activeComp.name} strikes for ${dmg} damage and stuns the enemy!`;
                state.enemyStaggered = true;
                break;
            case 'full_party_heal':
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
                msg += `<br>A divine light restores your health and Qi to full!`;
                break;
            case 'honorable_surrender':
                if (enemy.hp <= enemy.maxHp * 0.4) {
                    enemy.hp = 0;
                    msg += `<br>${enemy.name} is moved by your honor and surrenders!`;
                } else {
                    msg += `<br>${enemy.name} scoffs at your request for surrender. They are still too strong!`;
                    success = false;
                }
                break;
            case 'reveal_all_enemy_moves':
                state.enemyMovesRevealed = true;
                msg += `<br>All of ${enemy.name}'s combat patterns are now visible to you!`;
                break;
            case 'debuff_enemy_buff_player':
                state.enemyAtkDebuff = 0.7;
                state.playerDmgBonus = 1.2 * affinityMult;
                msg += `<br>${enemy.name}'s attack is lowered, and your power surges!`;
                break;
            case 'area_damage_or_bypass':
                const areaDmg = Math.floor(state.player.atk * 2 * affinityMult);
                enemy.hp = Math.max(0, enemy.hp - areaDmg);
                msg += `<br>A massive strike deals ${areaDmg} damage, ignoring defenses!`;
                break;
            case 'bluff_stun':
                state.enemyStaggered = true;
                msg += `<br>The enemy is completely entranced and wide open!`;
                break;
            default:
                msg += `<br>The ability activates but has no combat effect.`;
        }

        // Spend Qi
        state.player.mp = Math.max(0, state.player.mp - (ability.mpCost || 0));
        
        return { success, message: msg };
    },

    // Retrieve specific moves available for a given form + learned techniques
    getActionsForForm(form, state) {
        const baseMoves = {
            water: [
                { id: 'deflect', name: 'Deflect (Counter Heavy)', type: 'deflect', cost: 0 },
                { id: 'slipstream', name: 'Slipstream (Counter Fast)', type: 'evade', cost: 0 }
            ],
            mountain: [
                { id: 'earthshatter', name: 'Earthshatter (Break Guard)', type: 'heavy', cost: 15 },
                { id: 'mountain_stance', name: 'Mountain Stance (Absorb & Strike)', type: 'absorb', cost: 10 }
            ],
            wind: [
                { id: 'gale_strike', name: 'Gale Strike (Interrupt Magic)', type: 'fast', cost: 5 },
                { id: 'qi_blade', name: 'Qi Blade (Ignore Armor)', type: 'magic', cost: 20 }
            ]
        };
        
        const actions = [...(baseMoves[form] || [])];
        
        // Add learned skills
        if (state.player.skills) {
            state.player.skills.forEach(sId => {
                const s = window.SKILLS.techniques[sId];
                if (s && !s.passive) {
                    actions.push({ ...s, cost: s.mpCost });
                }
            });
        }
        
        return actions;
    },

    // ── ENEMY MEMORY & AI ──
    selectEnemyMove(enemy) {
        const archetype = enemy.archetype || 'balanced';
        let options = [];
        
        switch(archetype) {
            case 'brute': options = ['heavy', 'heavy', 'fast', 'guard']; break;
            case 'assassin': options = ['fast', 'fast', 'fast', 'evade']; break;
            case 'mage': options = ['magic', 'magic', 'deflect', 'evade']; break;
            default: options = ['heavy', 'fast', 'magic', 'guard', 'deflect'];
        }
        
        return options[Math.floor(Math.random() * options.length)];
    },

    getTelegraph(enemy, moveType) {
        const tells = {
            heavy: `${enemy.name} plants their feet, shifting weight entirely backward.`,
            fast: `${enemy.name} lowers their center of gravity, blade twitching.`,
            magic: `The air around ${enemy.name} grows unnaturally cold as they step back.`,
            guard: `${enemy.name} raises their weapon close to their chest, eyes scanning.`,
            deflect: `${enemy.name} stands completely relaxed, weapon hanging loosely.`,
            evade: `${enemy.name} stays light on their toes, ready to spring.`
        };
        return tells[moveType] || `${enemy.name} watches you closely.`;
    },

    // ── THE FLOWING DAO RESOLUTION ENGINE ──
    // Returns { playerDmg, enemyDmg, resultText, special, momentumShift }
    resolveMove(playerMoveId, enemyMoveType, playerAtk, enemyAtk, enemy, state) {
        let pDmg = 0;
        let eDmg = 0;
        let msg = '';
        let mom = 0; 
        let spec = null;

        // Taming Logic
        if (playerMoveId === 'tame') {
            const chance = (enemy.hp / enemy.maxHp < 0.3) ? 0.8 : 0.2;
            if (Math.random() < chance) {
                spec = 'tamed';
                msg = `You perform the spirit-binding mudra. ${enemy.name} yields!`;
                mom = 100;
            } else {
                msg = `${enemy.name} snarls at your attempts to bind it!`;
                eDmg = enemyAtk;
                mom = -30;
            }
            return { playerDmg: 0, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
        }

        // --- Handle Learned Skills Specifically ---
        const skill = window.SKILLS.techniques[playerMoveId];
        if (skill) {
            msg = `You unleash <b>${skill.name}</b>! `;
            pDmg = Math.floor(playerAtk * (skill.power || 1));
            
            if (skill.heal) {
                const h = Math.floor(state.player.maxHp * skill.heal);
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + h);
                msg += `Restored ${h} HP. `;
            }
            
            if (skill.stunChance && Math.random() < skill.stunChance) {
                state.enemyStunned = true;
                msg += `Enemy is STUNNED! `;
            }
            
            if (skill.dot) {
                state.dotEffects.push({ ...skill.dot, type: 'burn' });
                msg += `The enemy is set ablaze! `;
            }
            
            if (skill.effect) {
                state.activeBuffs.push({ ...skill.effect });
                msg += `Your spirit energy surges! `;
            }

            if (skill.debuff) {
                state.enemyDebuffs.push({ ...skill.debuff });
                msg += `${enemy.name} is weakened by your spell! `;
            }

            if (skill.hpCost) {
                const cost = Math.floor(state.player.maxHp * skill.hpCost);
                state.player.hp = Math.max(1, state.player.hp - cost);
                msg += `(Paid ${cost} Life Essence) `;
            }

            return { playerDmg: pDmg, enemyDmg: Math.floor(enemyAtk * 0.5), resultText: msg, special: 'skill', momentumShift: 20 };
        }

        // Base damage calculation
        const pBaseDmg = Math.max(1, playerAtk - (enemy.def || 0));
        const eBaseDmg = Math.max(1, enemyAtk - (state.player.def || 0));

        // Execution logic (Staggered state)
        if (state.enemyStaggered) {
            pDmg = pBaseDmg * 3;
            msg = `<b>FATAL STRIKE!</b> You unleash everything on the staggered enemy!`;
            spec = 'execution';
            state.enemyStaggered = false;
            state.momentum = 0; 
            return { playerDmg: pDmg, enemyDmg: 0, resultText: msg, special: spec, momentumShift: 0 };
        }

        if (state.playerGuardBroken) {
            eDmg = eBaseDmg * 2;
            msg = `Your guard is broken! You take a devastating hit!`;
            state.playerGuardBroken = false;
            state.momentum = 0;
            return { playerDmg: 0, enemyDmg: eDmg, resultText: msg, special: 'guard_broken', momentumShift: 0 };
        }

        // Action Matrix (The Flow)
        if (playerMoveId === 'deflect') {
            if (enemyMoveType === 'heavy') {
                msg = `You perfectly deflect their massive blow, letting their own weight throw them off balance!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'magic') {
                msg = `You try to deflect spiritual energy with steel. It fails horribly.`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `You deflect a regular strike, mitigating damage.`;
                mom = 5; eDmg = Math.floor(eBaseDmg * 0.3);
            }
        } 
        else if (playerMoveId === 'slipstream') {
            if (enemyMoveType === 'fast') {
                msg = `You slip past their flurry like water through fingers, striking their exposed flank!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'heavy') {
                msg = `You evade, but the shockwave of their heavy blow catches you.`;
                mom = -10; eDmg = eBaseDmg;
            } else {
                msg = `You dodge the attack, looking for an opening.`;
                mom = 10;
            }
        }
        else if (playerMoveId === 'earthshatter') {
            if (enemyMoveType === 'guard' || enemyMoveType === 'deflect') {
                msg = `Your earth-shattering blow crushes right through their defense!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 2;
            } else if (enemyMoveType === 'evade') {
                msg = `Your heavy blow smashes the ground where they used to be. You are wide open!`;
                mom = -30; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `You trade blows, but your mountain force hits harder.`;
                mom = 10; pDmg = pBaseDmg * 1.2; eDmg = eBaseDmg * 0.8;
            }
        }
        else if (playerMoveId === 'mountain_stance') {
            if (enemyMoveType === 'fast' || enemyMoveType === 'heavy') {
                msg = `You absorb the physical blow with your body, using the kinetic energy to strike back twice as hard!`;
                mom = 20; eDmg = Math.floor(eBaseDmg * 0.5); pDmg = pBaseDmg * 2;
            } else if (enemyMoveType === 'magic') {
                msg = `Mountain stance cannot absorb spiritual fire! It burns through you.`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `You stand firm, but no physical blow comes.`;
                mom = 0;
            }
        }
        else if (playerMoveId === 'gale_strike') {
            if (enemyMoveType === 'magic') {
                msg = `You dash forward faster than the wind, interrupting their spell casting!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg;
            } else if (enemyMoveType === 'heavy') {
                msg = `Your fast strike bounces off their heavy wind-up. They crush you.`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `A flurry of quick exchanges.`;
                mom = 5; pDmg = pBaseDmg * 0.8; eDmg = eBaseDmg * 0.8;
            }
        }
        else if (playerMoveId === 'qi_blade') {
            if (enemyMoveType === 'guard' || enemyMoveType === 'deflect') {
                msg = `Your blade of pure Qi phases right through their physical defense!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'fast') {
                msg = `They move too fast, interrupting your Qi flow!`;
                mom = -20; eDmg = eBaseDmg * 1.2;
            } else {
                msg = `The spiritual blade connects deeply.`;
                mom = 15; pDmg = pBaseDmg * 1.2; eDmg = eBaseDmg * 0.5;
            }
        }

        pDmg = Math.floor(pDmg);
        eDmg = Math.floor(eDmg);

        if (state.playerForm === 'water' && pDmg > 0) {
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 5);
            msg += ` (Water restores 5 Qi)`;
        }

        return { playerDmg: pDmg, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
    }
};