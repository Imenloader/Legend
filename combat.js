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
    resolveMove(playerMove, enemyMove, playerAtk, enemyAtk, enemy) {
        let playerDmg = playerAtk;
        let enemyDmg = enemyAtk;
        let resultText = '';
        let special = null;

        // ── COUNTER MATRIX ──
        // fast (Strike) beats magic (Interrupt)
        // guard (Brace) beats heavy (Block)
        // dodge (Evade) beats fast (Slip)

        if (playerMove === 'fast') {
            if (enemyMove === 'magic') {
                resultText = `You blur forward, striking before their incantation can complete! The spell dissipates harmlessly.`;
                enemyDmg = 0;
                playerDmg = Math.floor(playerDmg * 1.6); // Interrupt bonus
                special = 'interrupt';
            } else if (enemyMove === 'fast') {
                resultText = `Speed meets speed. You trade blows in a flurry of impacts.`;
                enemyDmg = Math.floor(enemyDmg * 0.7);
                playerDmg = Math.floor(playerDmg * 0.7);
            } else { // heavy
                resultText = `Your quick strike meets the full weight of their heavy blow. You're sent staggering.`;
                enemyDmg = Math.floor(enemyDmg * 1.3);
                playerDmg = Math.floor(playerDmg * 0.5);
            }
        } else if (playerMove === 'guard') {
            if (enemyMove === 'heavy') {
                resultText = `You plant your feet and absorb the crushing blow, then drive forward in a powerful riposte!`;
                enemyDmg = Math.floor(enemyDmg * 0.1); // Nearly blocked
                playerDmg = Math.floor(playerDmg * 1.3); // Counter bonus
                special = 'perfect_block';
            } else if (enemyMove === 'fast') {
                resultText = `You guard, but their quick strike finds the gaps in your defense.`;
                enemyDmg = Math.floor(enemyDmg * 0.6);
                playerDmg = Math.floor(playerDmg * 0.7);
            } else { // magic
                resultText = `Your physical guard is utterly useless against spiritual magic. It passes through and detonates inside your guard!`;
                enemyDmg = Math.floor(enemyDmg * 1.5);
                playerDmg = 0;
                special = 'guard_broken';
            }
        } else if (playerMove === 'dodge') {
            if (enemyMove === 'fast') {
                resultText = `You slip like desert wind between their rapid strikes, leaving them overextended. A clean counter follows.`;
                enemyDmg = 0;
                playerDmg = Math.floor(playerDmg * 1.4); // Counter bonus
                special = 'perfect_dodge';
            } else if (enemyMove === 'heavy') {
                resultText = `You try to dodge the heavy blow, but its shockwave catches you regardless. The impact sends you flying.`;
                enemyDmg = Math.floor(enemyDmg * 1.4);
                playerDmg = 0;
            } else { // magic
                resultText = `You weave sideways as the magic projectile tracks you — close, but not quite close enough to matter.`;
                enemyDmg = Math.floor(enemyDmg * 0.4);
                playerDmg = Math.floor(playerDmg * 0.8);
            }
        }

        return { playerDmg: Math.floor(playerDmg), enemyDmg: Math.floor(enemyDmg), resultText, special };
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
            { text: `⚔️ Strike Quickly <em>(counters: Magic)</em>`, callback: () => resolveFn('fast') },
            { text: `🛡️ Brace & Guard <em>(counters: Heavy)</em>`, callback: () => resolveFn('guard'), disabled: inBerserker },
            { text: `🌀 Dodge & Counter <em>(counters: Fast)</em>`, callback: () => resolveFn('dodge'), disabled: inBerserker }
        ];

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
