// ============================================================
// QUESTS.JS — المهام والعهود البدنية ومكافآت السفر والتحدي
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.QUESTS = {
    // 1. قاعدة بيانات المهام والعهود الرئيسية والدورية (Daily, Weekly, Monthly)
    database: {
        'main_01': {
            id: 'main_01',
            title: 'بداية الأسطورة الكبرى ومغامرة البطل',
            desc: 'قابل السيدة شهرزاد في واحة القوافل وابدأ طريق تدريبك وشحذ همتك وبنائك القتالي.',
            objective: 'ارتقِ إلى مستوى القوة الثاني (مستوى 2)',
            type: 'main',
            reward: { gold: 100, xp: 50 },
            isComplete: (state) => state.player.lvl >= 2
        },
        'sect_01': {
            id: 'sect_01',
            title: 'اختبارات مقر الطائفة والفرسان',
            desc: 'أثبت هيبتك وولائك لفرسان طائفتك ومقرك الأكبر.',
            objective: 'اهزم 3 أعداء في المعارك لتثبت جدارتك وقوتك.',
            type: 'sect',
            reward: { gold: 500, karma: 5 },
            isComplete: (state) => (state.player.kills || 0) >= 3
        },
        
        // --- المهام اليومية (Daily Tasks) ---
        'daily_caravan_move': {
            id: 'daily_caravan_move',
            title: '📜 عهد اليوم: تسيير قوافل الصحراء',
            desc: 'الطرق التجارية بحاجة لحركة مستمرة وتأمين متواصل ضد الضياع.',
            objective: 'تحرك 3 خطوات بالقافلة في خريطة البرية الشبكية',
            type: 'daily',
            reward: { gold: 150, xp: 60 },
            isComplete: (state) => {
                const progress = state.player.questProgress || {};
                return (progress.caravanMoves || 0) >= 3;
            }
        },
        'daily_defeat_bandit': {
            id: 'daily_defeat_bandit',
            title: '⚔️ عهد اليوم: تطهير دروب الفيافي',
            desc: 'انقض قطاع الطرق البدو على مسارات التجار البسيطة، طهرهم فوراً.',
            objective: 'اهزم قاطع طريق صحراوي واحد في خريطة الترحال الشبكية',
            type: 'daily',
            reward: { gold: 200, xp: 80 },
            isComplete: (state) => {
                const progress = state.player.questProgress || {};
                return (progress.banditKills || 0) >= 1;
            }
        },

        // --- المهام الأسبوعية (Weekly Tasks) ---
        'weekly_refine_gear': {
            id: 'weekly_refine_gear',
            title: '🔨 عهد الأسبوع: شحذ الفولاذ والحديد الباطني',
            desc: 'الفرن والحداد بحاجة لتجربة طاقة صقل ونقوش الأسلحة لرفع جودتها.',
            objective: 'قم بصقل أو ترقية عتادك المجهز 2 مرات في ورشة الصهر والترقيات بذهبك وخاماتك',
            type: 'weekly',
            reward: { gold: 600, karma: 10 },
            isComplete: (state) => {
                const progress = state.player.questProgress || {};
                return (progress.refines || 0) >= 2;
            }
        },
        'weekly_upgrade_oasis': {
            id: 'weekly_upgrade_oasis',
            title: '⛺ عهد الأسبوع: عمارة وتوسعة الواحة المباركة',
            desc: 'شيد بنيان واحتمك الباطنية لتأمين إنتاج المياه والأعشاب وحديد الشهب.',
            objective: 'قم بترقية أي منشأة بالواحة 1 مرة على الأقل لزيادة الإنتاج التلقائي',
            type: 'weekly',
            reward: { gold: 800, karma: 15 },
            isComplete: (state) => {
                const progress = state.player.questProgress || {};
                return (progress.oasisUpgrades || 0) >= 1;
            }
        },

        // --- المهام الشهرية (Monthly Tasks) ---
        'monthly_defeat_raid': {
            id: 'monthly_defeat_raid',
            title: '☠️ عهد الشهر: حارس قوافل الصحراء العظمى',
            desc: 'تتجمع فلول الغزاة في الليل لنهب الواحة الباطنية الدافئة. دمر هجماتهم المباغتة.',
            objective: 'اهزم مداهمة اللصوص المباغتة للواحة 1 مرة لحماية مبانيك ومواردك باقتدار',
            type: 'monthly',
            reward: { gold: 2000, karma: 40 },
            isComplete: (state) => {
                const progress = state.player.questProgress || {};
                return (progress.raidKills || 0) >= 1;
            }
        },
        'monthly_ascend_lvl': {
            id: 'monthly_ascend_lvl',
            title: '🧘 عهد الشهر: ارتقاء قنوات الجسد والمانا',
            desc: 'الرحلة طويلة وتتطلب جهداً خلوياً لتدريب ودمج طاقات التركيز والهمة الباطنية.',
            objective: 'ارتقِ بمستوى شخصيتك بمقدار مستويين (2 مستويات) لرفع هيبتك',
            type: 'monthly',
            reward: { gold: 2500, karma: 50 },
            isComplete: (state) => {
                const startLvl = state.player.questProgress?.startLevel || state.player.lvl || 1;
                return state.player.lvl >= (startLvl + 2);
            }
        }
    },

    // 2. الفعاليات والأطوار العالمية النشطة (Active Global Events)
    events: {
        'daily': {
            id: 'silk_bazaar',
            name: '🏛️ سوق حرير التقاطع الفاخر',
            desc: 'يتوافد كبار التجار من أصقاع الأرض اليوم! تحصل على أرباح ذهبية ودينار إضافي (+20% ذهب مكتسب).',
            apply: (state) => { state.player.goldMult = (state.player.goldMult || 1.0) + 0.20; }
        },
        'weekly': {
            id: 'chi_blessing',
            name: '✨ بركة تدفق التشي الباطني',
            desc: 'تتلاقى موجات طاقة قنوات الكواكب هذا الأسبوع! خبرة إضافية بنسبة 50% من معارك البراري وتخفيض تكاليف فرن الصهر.',
            apply: (state) => { state.player.xpGainBonus = (state.player.xpGainBonus || 0) + 0.50; }
        },
        'monthly': {
            id: 'eclipse',
            name: '🌑 عاصفة خسوف شمس الصحراء العظيم',
            desc: 'يغطي القمر شمس الفيافي النورانية هذا الشهر! تزداد طاقة التركيز الباطني وسحر المهارات بنسبة 25%.',
            apply: (state) => { /* Processed inside resolveMove in combat.js */ }
        }
    },

    // 3. التحقق من فروق التوقيت اليومي والأسبوعي والشهري لإعادة التعيين والتنشيط
    checkResets(state) {
        if (!state) return;
        
        // Initialize reset structure
        state.questProgress = state.questProgress || { caravanMoves: 0, refines: 0, oasisUpgrades: 0, banditKills: 0, raidKills: 0, startLevel: state.player.lvl || 1 };
        state.player.questProgress = state.player.questProgress || state.questProgress;
        
        const now = Date.now();
        const oneDay = 86400000;
        const oneWeek = 604800000;
        const oneMonth = 2592000000;

        if (!state.lastDailyReset) state.lastDailyReset = now;
        if (!state.lastWeeklyReset) state.lastWeeklyReset = now;
        if (!state.lastMonthlyReset) state.lastMonthlyReset = now;

        // Daily Reset
        if (now - state.lastDailyReset >= oneDay) {
            state.lastDailyReset = now;
            // Clear daily quests from active/completed
            state.activeQuests = (state.activeQuests || []).filter(id => !id.startsWith('daily_'));
            state.completedQuests = (state.completedQuests || []).filter(id => !id.startsWith('daily_'));
            
            // Auto accept new daily quests
            state.activeQuests.push('daily_caravan_move');
            state.activeQuests.push('daily_defeat_bandit');
            
            // Reset daily counters
            state.player.questProgress.caravanMoves = 0;
            state.player.questProgress.banditKills = 0;

            if (window.showToast) window.showToast("🌅 عهود يومية جديدة مفتوحة بلوحة المهام والطلبات!");
        }

        // Weekly Reset
        if (now - state.lastWeeklyReset >= oneWeek) {
            state.lastWeeklyReset = now;
            state.activeQuests = (state.activeQuests || []).filter(id => !id.startsWith('weekly_'));
            state.completedQuests = (state.completedQuests || []).filter(id => !id.startsWith('weekly_'));
            
            state.activeQuests.push('weekly_refine_gear');
            state.activeQuests.push('weekly_upgrade_oasis');
            
            state.player.questProgress.refines = 0;
            state.player.questProgress.oasisUpgrades = 0;

            if (window.showToast) window.showToast("✨ عهود أسبوعية جديدة متاحة بالكامل للفرسان!");
        }

        // Monthly Reset
        if (now - state.lastMonthlyReset >= oneMonth) {
            state.lastMonthlyReset = now;
            state.activeQuests = (state.activeQuests || []).filter(id => !id.startsWith('monthly_'));
            state.completedQuests = (state.completedQuests || []).filter(id => !id.startsWith('monthly_'));
            
            state.activeQuests.push('monthly_defeat_raid');
            state.activeQuests.push('monthly_ascend_lvl');
            
            state.player.questProgress.raidKills = 0;
            state.player.questProgress.startLevel = state.player.lvl || 1;

            if (window.showToast) window.showToast("🌑 انطلق كسوف الشهر! عهود شهرية وفعاليات ملحمية جارية!");
        }

        // Ensure daily/weekly quests are always auto accepted at least once initially
        if (!state.activeQuests.includes('daily_caravan_move') && !state.completedQuests.includes('daily_caravan_move')) {
            state.activeQuests.push('daily_caravan_move');
            state.activeQuests.push('daily_defeat_bandit');
            state.activeQuests.push('weekly_refine_gear');
            state.activeQuests.push('weekly_upgrade_oasis');
            state.activeQuests.push('monthly_defeat_raid');
            state.activeQuests.push('monthly_ascend_lvl');
        }
    },

    // Check all active quests for completion
    updateQuests(state) {
        if (!state.activeQuests) state.activeQuests = ['main_01'];
        if (!state.completedQuests) state.completedQuests = [];

        this.checkResets(state);

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
                
                if (q.reward.karma) state.player.karma = (state.player.karma || 0) + q.reward.karma;
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
                newlyCompleted.forEach(title => narrate(`<b>تم إنجاز العهد بنجاح:</b> ${title}! نزلت المكافآت والبركة الوفيرة على همتك الباطنية.`, "ديوان الفرسان"));
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
