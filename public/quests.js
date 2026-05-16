// ============================================================
// QUESTS.JS — Missions, Bounties & Destiny
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.QUESTS = {
    // Master database of all possible quests
    database: {
        'main_01': {
            id: 'main_01',
            title: 'A Legend Begins',
            desc: 'Meet Scheherazade at the Crossroads and begin your cultivation.',
            objective: 'Reach Level 2',
            type: 'main',
            reward: { gold: 100, xp: 50 },
            isComplete: (state) => state.player.lvl >= 2
        },
        'sect_01': {
            id: 'sect_01',
            title: 'Sect Trials',
            desc: 'Prove your worth to your chosen faction.',
            objective: 'Defeat 3 enemies in your faction territory.',
            type: 'sect',
            reward: { gold: 500, karma: 5 },
            isComplete: (state) => (state.player.kills || 0) >= 3
        },
        'daily_gathering': {
            id: 'daily_gathering',
            title: 'Daily Gathering',
            desc: 'The sect requires medicinal herbs.',
            objective: 'Gather 5 Spirit Herbs.',
            type: 'daily',
            reward: { gold: 200, reputation: 10 },
            isComplete: (state) => {
                const herbs = state.player.inventory.items.filter(i => i.id === 'herb_bundle').length;
                return herbs >= 5;
            }
        }
    },

    // Check all active quests for completion
    updateQuests(state) {
        if (!state.activeQuests) state.activeQuests = ['main_01'];
        if (!state.completedQuests) state.completedQuests = [];

        state.activeQuests.forEach((qId, index) => {
            const q = this.database[qId];
            if (q && q.isComplete(state)) {
                // Complete quest
                state.player.gold += q.reward.gold || 0;
                state.player.xp += q.reward.xp || 0;
                if (q.reward.karma) state.player.karma += q.reward.karma;
                
                state.completedQuests.push(qId);
                state.activeQuests.splice(index, 1);
                
                // Alert player (if UI is available)
                if (typeof narrate === 'function') {
                    narrate(`Quest Complete: ${q.title}! Received ${q.reward.gold} Spirit Stones.`, "System");
                }
            }
        });
    },

    // Start a new quest
    acceptQuest(state, qId) {
        if (!state.activeQuests) state.activeQuests = [];
        if (state.activeQuests.includes(qId) || (state.completedQuests && state.completedQuests.includes(qId))) return false;
        state.activeQuests.push(qId);
        return true;
    }
};
