// ============================================================
// COMPANIONS.JS — Affinity, Memory & Emotional Arc System
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.COMPANIONS = {

    // --- Active companion state (merged with game state) ---
    // state.companions = { id: { affinity: 0, memories: [], active: false } }

    // Initialize a companion in state
    init(state, id) {
        if (!state.companions) state.companions = {};
        if (!state.companions[id]) {
            state.companions[id] = { affinity: 50, memories: [], active: false };
        }
        return state.companions[id];
    },

    // Set active companion
    activate(state, id) {
        if (!state.companions) state.companions = {};
        Object.keys(state.companions).forEach(k => state.companions[k].active = false);
        this.init(state, id);
        state.companions[id].active = true;
        state.companion = id;
    },

    // Get active companion data
    getActive(state) {
        if (!state.companion || !state.companions) return null;
        const id = state.companion;
        const all = window.LORE ? (typeof window.LORE.getAllHeroes === 'function' ? window.LORE.getAllHeroes() : {
            ...(window.LORE.CHINESE_HEROES || {}),
            ...(window.LORE.ARABIAN_HEROES || {}),
            ...(window.LORE.MYTH_HEROES || {}),
            ...(window.LORE.EXTRA_HEROES || {})
        }) : {};
        const loreData = all[id];
        const stateData = state.companions[id] || { affinity: 50, memories: [] };
        return loreData ? { ...loreData, ...stateData } : null;
    },

    // Record a memory event
    addMemory(state, id, event) {
        this.init(state, id);
        state.companions[id].memories.push({ event, turn: state.player.lvl });
        if (state.companions[id].memories.length > 10) {
            state.companions[id].memories.shift(); // Keep last 10
        }
    },

    // Adjust affinity
    adjustAffinity(state, id, delta, reason) {
        this.init(state, id);
        const comp = state.companions[id];
        comp.affinity = Math.max(0, Math.min(100, comp.affinity + delta));
        this.addMemory(state, id, reason);
        return comp.affinity;
    },

    // Get affinity tier label
    getAffinityTier(affinity) {
        if (affinity >= 90) return { label: 'Sworn Bond', color: 'var(--secondary)' };
        if (affinity >= 70) return { label: 'Deep Trust', color: '#9b59b6' };
        if (affinity >= 50) return { label: 'Respected Ally', color: 'var(--jade)' };
        if (affinity >= 30) return { label: 'Cautious Partner', color: 'var(--text-dim)' };
        return { label: 'Strained', color: 'var(--danger)' };
    },

    // Get contextual dialogue based on affinity + memories
    getDialogue(state, id, context) {
        const all = window.LORE ? (typeof window.LORE.getAllHeroes === 'function' ? window.LORE.getAllHeroes() : {
            ...(window.LORE.CHINESE_HEROES || {}),
            ...(window.LORE.ARABIAN_HEROES || {}),
            ...(window.LORE.MYTH_HEROES || {}),
            ...(window.LORE.EXTRA_HEROES || {})
        }) : {};
        const loreData = all[id];
        if (!loreData || !loreData.dialogue) return null;

        this.init(state, id);
        const affinity = state.companions[id].affinity;

        // High affinity unlocks special lines
        if (affinity >= 80 && loreData.dialogue.high_affinity) return loreData.dialogue.high_affinity;
        if (affinity < 30 && loreData.dialogue.low_affinity) return loreData.dialogue.low_affinity;

        // Context-specific
        const contextLines = loreData.dialogue[context];
        if (Array.isArray(contextLines)) {
            return contextLines[Math.floor(Math.random() * contextLines.length)];
        }
        return contextLines || null;
    },

    // Get passive combat buff from active companion
    getCombatBuff(state) {
        const comp = this.getActive(state);
        if (!comp || !comp.passiveBuff) return null;
        const affinity = state.companions[state.companion]?.affinity || 50;
        // Buff scales with affinity: 50% affinity = 100% buff, 100% affinity = 150% buff
        const scale = 0.5 + (affinity / 100);
        return { ...comp.passiveBuff, scale };
    },

    // Calculate player stats with companion buff applied
    getBuffedStats(state) {
        const base = { atk: state.player.atk, def: state.player.def, maxHp: state.player.maxHp, maxMp: state.player.maxMp };
        const buff = this.getCombatBuff(state);
        if (!buff) return base;

        const result = { ...base };
        if (buff.stat === 'atk') result.atk = Math.floor(base.atk * (1 + buff.bonus * buff.scale));
        if (buff.stat === 'def') result.def = Math.floor(base.def * (1 + buff.bonus * buff.scale));
        if (buff.stat === 'maxHp') result.maxHp = Math.floor(base.maxHp * (1 + buff.bonus * buff.scale));
        if (buff.stat === 'mp') result.maxMp = Math.floor(base.maxMp * (1 + buff.bonus * buff.scale));
        return result;
    },

    // Check if a companion would leave due to karma misalignment
    checkKarmaAlignment(state) {
        const comp = this.getActive(state);
        if (!comp) return null;
        const karma = state.player.karma;
        const req = comp.karmaRequirement;

        // Companions with positive requirement leave if karma drops too low
        if (req > 0 && karma < req - 40) {
            return { leave: true, id: state.companion, reason: `${comp.name} cannot follow a path this dark.` };
        }
        // Companions with negative requirement leave if karma rises too high (demons won't follow saints)
        if (req < -50 && karma > 60) {
            return { leave: true, id: state.companion, reason: `${comp.name} disappears — your righteousness blinds them.` };
        }
        return null;
    },

    // --- COMPANION ROSTER for the selection screen ---
    getRoster() {
        if (!window.LORE) return [];
        const all = typeof window.LORE.getAllHeroes === 'function' ? window.LORE.getAllHeroes() : {
            ...(window.LORE.CHINESE_HEROES || {}),
            ...(window.LORE.ARABIAN_HEROES || {}),
            ...(window.LORE.MYTH_HEROES || {}),
            ...(window.LORE.EXTRA_HEROES || {})
        };
        return Object.values(all);
    },

    // Get companions available to the player given karma
    getAvailable(state) {
        return this.getRoster().filter(c => state.player.karma >= c.karmaRequirement);
    },

    // --- Companion Interjection Events ---
    // Called at random points in narrative to show companion reacting
    getInterjection(state, context) {
        const comp = this.getActive(state);
        if (!comp) return null;

        const interjections = {
            combat_win: [
                `${comp.name} nods with quiet approval.`,
                `"${comp.name.split(',')[0]} grins: Not bad. Keep that up."`,
                `${comp.name} sheathes their weapon without a word — which, from them, is high praise.`
            ],
            combat_lose: [
                `${comp.name} catches you before you fall. "Not yet," they say. "Not here."`,
                `${comp.name} stands over you. "Get up. This is not your end."`,
                `"${comp.name.split(',')[0]} looks away — you can't tell if it's disappointment or grief."`
            ],
            loot_mythic: [
                `${comp.name} stares at the item in silence for a long moment. "...I've heard stories about that."`,
                `"${comp.name.split(',')[0]}: Where did THAT come from?!"`
            ],
            good_karma: [
                `${comp.name} seems lighter somehow. The air between you warms.`,
                `"${comp.name.split(',')[0]} says quietly: That was the right thing. I won't forget it."`
            ],
            evil_karma: [
                `${comp.name} says nothing. But their hand moves slightly away from yours.`,
                `"${comp.name.split(',')[0]} watches what you did, expression unreadable. Something has shifted."`
            ]
        };

        const lines = interjections[context] || [];
        return lines.length ? lines[Math.floor(Math.random() * lines.length)] : null;
    },

    // --- Companion Side Quest Triggers ---
    checkSideQuest(state) {
        const comp = this.getActive(state);
        if (!comp) return null;
        const compState = state.companions[state.companion];
        if (!compState) return null;

        // Trigger side quest at affinity 75+ if not yet started
        if (compState.affinity >= 75 && !compState.questStarted) {
            compState.questStarted = true;
            return {
                triggered: true,
                title: comp.questArc,
                intro: `${comp.name} pulls you aside with unusual solemnity. "There is something I have not told you. Something I need your help with. It concerns... ${comp.secretMotivation}"`
            };
        }
        return null;
    }
};
