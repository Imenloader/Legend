// ============================================================
// COMBAT.JS — Phase 3: Advanced Combat Engine
// Per-enemy move patterns, Enemy Memory, Unique Abilities
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.COMBAT = {

    // ── ENEMY MEMORY SYSTEM ──
    // Tracks what moves the player used against each enemy type
    // So enemies can adapt their telegraph patterns
    memory: {}, // { enemyId: { playerMoveHistory: [], timesDefeated: 0 } }

    recordPlayerMove(enemyId, playerMove) {
        if (!this.memory[enemyId]) this.memory[enemyId] = { playerMoveHistory: [], timesDefeated: 0 };
        this.memory[enemyId].playerMoveHistory.push(playerMove);
        // Keep last 5 moves only
        if (this.memory[enemyId].playerMoveHistory.length > 5) {
            this.memory[enemyId].playerMoveHistory.shift();
        }
    },

    recordDefeat(enemyId) {
        if (!this.memory[enemyId]) this.memory[enemyId] = { playerMoveHistory: [], timesDefeated: 0 };
        this.memory[enemyId].timesDefeated++;
    },

    // Get the player's most used move against this enemy
    getMostUsedMove(enemyId) {
        const hist = this.memory[enemyId]?.playerMoveHistory || [];
        if (!hist.length) return null;
        const counts = {};
        hist.forEach(m => counts[m] = (counts[m] || 0) + 1);
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    },

    // Determine the enemy's next move, adapting to player habits
    selectEnemyMove(enemy, timesDefeated = 0) {
        const moveTypes = ['heavy', 'fast', 'magic'];

        // If enemy has specific move pattern defined, use it
        if (enemy.moves) {
            const available = Object.keys(enemy.moves).filter(k => moveTypes.includes(k));
            if (!available.length) return moveTypes[Math.floor(Math.random() * 3)];

            const mostUsed = this.getMostUsedMove(enemy.id || enemy.name);

            // Adaptive: if player always dodges, enemy uses heavy more
            // If player always guards, enemy uses magic more
            // If player always strikes, enemy uses fast more
            if (timesDefeated >= 2 && mostUsed) {
                const counter = { fast: 'heavy', guard: 'magic', dodge: 'fast' };
                const adapted = counter[mostUsed];
                if (adapted && available.includes(adapted)) return adapted;
            }

            return available[Math.floor(Math.random() * available.length)];
        }

        return moveTypes[Math.floor(Math.random() * 3)];
    },

    // Get telegraph text for enemy move
    getTelegraph(enemy, moveType) {
        if (enemy.moves?.[moveType]?.text) return enemy.moves[moveType].text;

        // Fallback telegraphs
        const fallbacks = {
            heavy: `${enemy.name} draws back with tremendous force, preparing a devastating blow.`,
            fast: `${enemy.name} shifts into a blur of motion — a blindingly fast strike incoming.`,
            magic: `${enemy.name} begins channeling dark spiritual energy, hands glowing with power.`
        };
        return fallbacks[moveType] || `${enemy.name} prepares to attack.`;
    },

    // ── MOVE RESOLUTION ENGINE ──
    // Returns { playerDmg, enemyDmg, resultText, special }
    resolveMove(playerMove, enemyMove, playerAtk, enemyAtk, enemy, state) {
        let playerDmg = playerAtk;
        let enemyDmg = enemyAtk;
        let resultText = '';
        let special = null;

        // Ensure state variables exist
        state.comboMultiplier = state.comboMultiplier || 1.0;
        state.enemyStagger = state.enemyStagger || 0;

        // Apply Combo Multiplier to base attack
        playerDmg = Math.floor(playerDmg * state.comboMultiplier);

        // ── SYMMETRIC COUNTER MATRIX ──
        const outcomes = {
            fast: {
                magic: { text: "You blur forward, interrupting their incantation!", p: 1.6, e: 0, s: 'interrupt', type: 'perfect' },
                dodge: { text: "You strike fast, but they easily weave around it and counter.", p: 0.2, e: 1.4, s: null },
                fast:  { text: "A flurry of simultaneous strikes.", p: 0.7, e: 0.7, s: null },
                heavy: { text: "Your quick strike meets their crushing blow. You're swatted aside.", p: 0.5, e: 1.3, s: null }
            },
            guard: {
                heavy: { text: "You perfectly brace against the crushing blow and riposte!", p: 1.3, e: 0.1, s: 'perfect_block', type: 'perfect' },
                magic: { text: "Physical guard is useless against spiritual magic. Guard broken!", p: 0, e: 1.6, s: 'guard_broken' },
                guard: { text: "Both combatants hold their ground cautiously.", p: 0, e: 0, s: null },
                fast:  { text: "Their fast strikes find gaps in your guard.", p: 0.7, e: 0.6, s: null }
            },
            dodge: {
                fast:  { text: "You slip perfectly beneath their rapid strikes and counter.", p: 1.4, e: 0, s: 'perfect_dodge', type: 'perfect' },
                heavy: { text: "You try to dodge, but the heavy shockwave catches you.", p: 0, e: 1.4, s: null },
                magic: { text: "You weave away from the tracking magic, taking grazing damage.", p: 0.8, e: 0.4, s: null }
            },
            heavy: {
                guard: { text: "Your immense physical force crushes straight through their guard!", p: 1.6, e: 0, s: 'guard_crush', type: 'perfect' },
                fast:  { text: "You commit to a heavy blow, ignoring their light strikes.", p: 1.3, e: 0.5, s: null },
                dodge: { text: "Your heavy strike hits only air. You are left wide open.", p: 0, e: 1.5, s: null },
                magic: { text: "You charge through their spell, taking the hit to deliver yours.", p: 1.2, e: 1.2, s: null }
            },
            magic: {
                heavy: { text: "Your spiritual blast obliterates their heavy charge!", p: 1.6, e: 0.2, s: 'magic_burst', type: 'perfect' },
                guard: { text: "Your magic ignores their physical defense entirely.", p: 1.5, e: 0, s: 'guard_broken', type: 'perfect' },
                fast:  { text: "They move too fast, interrupting your spiritual flow.", p: 0.2, e: 1.5, s: 'interrupted' },
                dodge: { text: "Your magic tracks them partially as they dodge.", p: 0.6, e: 0.6, s: null }
            }
        };

        const outcome = outcomes[playerMove][enemyMove] || { text: 'You clash!', p: 1, e: 1, s: null };
        resultText = outcome.text;
        playerDmg = Math.floor(playerDmg * outcome.p);
        enemyDmg = Math.floor(enemyDmg * outcome.e);
        special = outcome.s;

        // ── COMBO AND STAGGER LOGIC ──
        if (outcome.type === 'perfect') {
            state.enemyStagger++;
            state.comboMultiplier = Math.min(2.5, state.comboMultiplier + 0.2); // Build combo
        } else if (enemyDmg > 0) {
            state.comboMultiplier = 1.0; // Reset combo on taking damage
        }

        // Stagger Break Execution
        if (state.enemyStagger >= 3) {
            state.enemyStagger = 0;
            state.enemyStunned = true;
            state.enemyStunTurns = 1;
            playerDmg = Math.floor(playerDmg * 3.0); // Execution damage
            special = 'execution';
            resultText += ` Their posture is completely broken! You deliver a devastating FATAL BLOW!`;
        }

        return { playerDmg, enemyDmg, resultText, special };
    },
    // ── UNIQUE ABILITY HANDLER ──
    // Processes companion unique abilities in combat
    useCompanionAbility(state, enemy) {
        const comp = window.COMPANIONS?.getActive(state);
        if (!comp || !comp.uniqueAbility) return null;

        const ability = comp.uniqueAbility;
        if (state.player.mp < ability.mpCost) {
            return { success: false, message: `${comp.name} cannot use ${ability.name} — not enough Qi.` };
        }

        state.player.mp -= ability.mpCost;
        let effectText = `${comp.name} unleashes <b>${ability.name}</b>! `;
        let enemyDmgOverride = null;

        switch (ability.effect) {
            case 'negate_enemy_attack':
                effectText += `They transform into the enemy's own form, creating a moment of complete confusion. The enemy's next attack is nullified.`;
                state.nextEnemyAttackNegated = true;
                break;
            case 'triple_damage_stun':
                const tripDmg = state.player.atk * 3;
                enemy.hp = Math.max(0, enemy.hp - tripDmg);
                effectText += `A single catastrophic strike deals ${tripDmg} damage and stuns the enemy!`;
                state.enemyStunned = true;
                break;
            case 'bypass_social_gate':
                effectText += `Through clever disguise, a hostility is bypassed entirely.`;
                break;
            case 'one_time_revive':
                effectText += `Lotus petals swirl — Ne Zha has already used his rebirth this battle.`;
                break;
            case 'full_party_heal':
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
                effectText += `A radiant light heals everything. HP and MP fully restored!`;
                break;
            case 'bluff_stun':
                state.enemyStunned = true;
                state.enemyStunTurns = 2;
                effectText += `The enemy stands confused, unable to act for 2 turns.`;
                break;
            case 'reveal_all_enemy_moves':
                effectText += `All of ${enemy.name}'s move patterns are now revealed! They cannot surprise you.`;
                state.enemyMovesRevealed = true;
                break;
            case 'berserker_mode':
                state.berserkerTurns = 3;
                state.berserkerBonus = 1.5;
                effectText += `+50% damage for 3 turns! You cannot flee or defend.`;
                break;
            case 'debuff_enemy_buff_player':
                state.playerDmgBonus = (state.playerDmgBonus || 1) * 1.2;
                state.enemyAtkDebuff = 0.7;
                effectText += `Enemy attack -30%, your damage +20% for 2 turns.`;
                break;
            case 'act_once_full_restore':
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
                effectText += `Full restoration. All curses removed.`;
                break;
            case 'honorable_surrender':
                if ((enemy.hp / enemy.maxHp) < 0.4) {
                    enemy.hp = 0; // Force surrender
                    effectText += `The enemy, cornered and honorable, accepts the demand and stands down.`;
                } else {
                    effectText += `The enemy is not yet broken enough to surrender. Their pride holds.`;
                }
                break;
            case 'area_damage_or_bypass':
                const rocDmg = state.player.atk * 2;
                enemy.hp = Math.max(0, enemy.hp - rocDmg);
                effectText += `A massive Roc swoops down, dealing ${rocDmg} damage to the enemy!`;
                break;
            default:
                effectText += ability.description;
        }

        window.COMPANIONS.adjustAffinity(state, state.companion, 2, 'Used unique ability in combat');
        return { success: true, message: effectText };
    },

    // ── STATUS EFFECT TICK ──
    tickStatusEffects(state) {
        const messages = [];

        // Berserker mode
        if (state.berserkerTurns > 0) {
            state.berserkerTurns--;
            if (state.berserkerTurns === 0) {
                state.berserkerBonus = 1;
                messages.push(`The berserker surge fades. You can defend again.`);
            }
        }

        // Enemy stun
        if (state.enemyStunTurns > 0) {
            state.enemyStunTurns--;
            if (state.enemyStunTurns === 0) state.enemyStunned = false;
        }

        // Debuffs decay
        if (state.playerDmgBonus && state.playerDmgBonus > 1) state.playerDmgBonus = 1 + ((state.playerDmgBonus - 1) * 0.5);
        if (state.enemyAtkDebuff && state.enemyAtkDebuff < 1) state.enemyAtkDebuff = 1 - ((1 - state.enemyAtkDebuff) * 0.5);

        return messages;
    },

    // ── BUILD COMBAT CHOICES ──
    // Returns the choice array shown to player, respecting active effects
    getCombatChoices(state, resolveFn, potionFn, abilityFn) {
        const inBerserker = state.berserkerTurns > 0;
        const comp = window.COMPANIONS?.getActive(state);

        const choices = [
            { text: `⚔️ Strike Fast <em>(counters: Magic)</em>`, callback: () => resolveFn('fast') },
            { text: `🛡️ Brace <em>(counters: Heavy)</em>`, callback: () => resolveFn('guard'), disabled: inBerserker },
            { text: `🌀 Dodge <em>(counters: Fast)</em>`, callback: () => resolveFn('dodge'), disabled: inBerserker }
        ];

        // Heavy attack (Costs 15 Qi)
        if (state.player.mp >= 15) {
            choices.push({ text: `💥 Heavy Smash (15 Qi) <em>(counters: Guard)</em>`, callback: () => { state.player.mp -= 15; resolveFn('heavy'); } });
        } else {
            choices.push({ text: `💥 Heavy Smash (15 Qi)`, disabled: true });
        }

        // Magic attack (Costs 25 Qi)
        if (state.player.mp >= 25) {
            choices.push({ text: `🔮 Qi Burst (25 Qi) <em>(counters: Heavy)</em>`, callback: () => { state.player.mp -= 25; resolveFn('magic'); } });
        } else {
            choices.push({ text: `🔮 Qi Burst (25 Qi)`, disabled: true });
        }

        // Potion choice
        if (state.player.inventory?.potions > 0) {
            choices.push({ text: `🧪 Use Potion (x${state.player.inventory.potions})`, callback: potionFn });
        }

        // Companion ability
        if (comp?.uniqueAbility && state.player.mp >= comp.uniqueAbility.mpCost) {
            choices.push({
                text: `✨ ${comp.name.split(',')[0]}: ${comp.uniqueAbility.name} (${comp.uniqueAbility.mpCost} Qi)`,
                callback: abilityFn
            });
        }

        return choices.filter(c => !c.disabled);
    }
};