// ============================================================
// QUESTS.JS — المهام والعهود البدنية ومكافآت القدر
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.QUESTS = {
    // قاعدة بيانات المهام والعهود
    database: {
        'main_01': {
            id: 'main_01',
            title: 'بداية الأسطورة الكبرى والأنوار',
            desc: 'قابل الست شهرزاد في واحة القوافل وابدأ طريق خلوتك وتأملك البدني.',
            objective: 'ارتقِ للمستوى البدني الثاني (مستوى 2)',
            type: 'main',
            reward: { gold: 100, xp: 50 },
            isComplete: (state) => state.player.lvl >= 2
        },
        'sect_01': {
            id: 'sect_01',
            title: 'اختبارات القلعة وديوان والطائفة البدنية',
            desc: 'أثبت هيبتك وولائك لفرسان طائفتك وصومعتك الكبرى.',
            objective: 'اهزم 3 أعداء في المعارك لتثبت جدارتك وقوتك.',
            type: 'sect',
            reward: { gold: 500, karma: 5 },
            isComplete: (state) => (state.player.kills || 0) >= 3
        },
        'daily_gathering': {
            id: 'daily_gathering',
            title: 'مهمة الجمع اليومية لخيرات الأرض',
            desc: 'القلعة وديوان والفرسان محتاجين أعشاب طبية نادرة لطبخ العقاقير الشافية.',
            objective: 'اجمع 5 حزم من أعشاب النور البدنية.',
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
                newlyCompleted.forEach(title => narrate(`<b>تم إنجاز المهمة:</b> ${title}! البركة والمكافآت اتختمت في تركيزك وهمتك وجسدك بنجاح.`, "ديوان الفتوة"));
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
