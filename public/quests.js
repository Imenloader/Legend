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
            },
            onComplete: (state) => {
                let count = 0;
                state.player.inventory.items = state.player.inventory.items.filter(item => {
                    if (item.id === 'herb_bundle' && count < 5) {
                        count++;
                        return false;
                    }
                    return true;
                });
            }
        }
    },

    // Check all active quests for completion
    updateQuests(state) {
        if (!state.activeQuests) state.activeQuests = ['main_01'];
        if (!state.completedQuests) state.completedQuests = [];

        const newlyCompleted = [];
        state.activeQuests = state.activeQuests.filter(qId => {
            const q = this.database[qId];
            if (q && q.isComplete(state)) {
                // Apply Rewards
                state.player.gold = (state.player.gold || 0) + (q.reward.gold || 0);
                
                let xpReward = q.reward.xp || 0;
                if (state.player.silkOasisActive && xpReward > 0) {
                    xpReward = Math.floor(xpReward * 1.25);
                }
                state.player.xp = (state.player.xp || 0) + xpReward;
                
                if (q.reward.karma) state.player.karma += q.reward.karma;
                if (q.reward.reputation) state.player.reputation = (state.player.reputation || 0) + q.reward.reputation;
                
                // Execute onComplete callback
                if (q.onComplete) q.onComplete(state);
                
                state.completedQuests.push(qId);
                newlyCompleted.push(q.title);
                return false; // Remove from active
            }
            return true; // Keep active
        });

        if (newlyCompleted.length > 0) {
            if (typeof narrate === 'function') {
                newlyCompleted.forEach(title => narrate(`Quest Complete: ${title}! Rewards sealed in your soul.`, "System"));
            }
            // Trigger recalculation if rewards affected stats (xp/karma)
            if (typeof calculateTotalStats === 'function') calculateTotalStats();
            if (typeof updateTopBar === 'function') updateTopBar();
        }
    },

    // Start a new quest
    acceptQuest(state, qId) {
        if (!state.activeQuests) state.activeQuests = [];
        if (!state.completedQuests) state.completedQuests = [];
        if (state.activeQuests.includes(qId) || state.completedQuests.includes(qId)) return false;
        state.activeQuests.push(qId);
        return true;
    }
};

