// ============================================================
// ASCENSION.JS — بوابة الملكوت العالي والارتقاء للأعلى
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.ASCENSION = {
    checkEligible(state) {
        if (!state.player.cultivation) return false;
        const stage = state.player.cultivation.stage;
        const stageLvl = state.player.cultivation.stageLevel;
        // Peak of Nascent Soul is level 10 and breakthrough is ready!
        return (stage === 'مقام الروح النورانية اللطيفة' && stageLvl >= 10 && state.player.cultivation.breakthroughReady);
    },

    attemptPhysical(state) {
        if (!this.checkEligible(state)) {
            return { success: false, message: "روحك لسة متبلورتش لقمة مقام الروح النورانية اللطيفة." };
        }

        // Physical Ascension requires raw physical toughness: Defense >= 100
        if ((state.player.def || 0) < 100) {
            return { 
                success: false, 
                message: `<span style="color:var(--danger)"><b>فشل ارتقاء الجسد!</b> هيكلك الجسدي اتمزق فوراً بفعل رياح الفراغ السحابية الرهيبة. محتاج على الأقل <b>100 دفاع</b> عشان تعبر. طور ينابيع المياه في صومعتك أو أتقن سر الجسد الصخري الصلب أولاً!</span>` 
            };
        }

        return { success: true, method: 'physical' };
    },

    attemptCombat(state) {
        if (!this.checkEligible(state)) {
            return { success: false, message: "روحك لسة متبلورتش لقمة مقام الروح النورانية اللطيفة." };
        }

        // Spawns the legendary Gatekeeper Boss!
        const gatekeeper = {
            name: 'حارس بوابة الملكوت شهاب',
            hp: 1500,
            maxHp: 1500,
            atk: 75,
            def: 40,
            dialogue: 'فاني ضعيف عايز يتحدى قوانين الملكوت والعرش الأعلى؟ وريني نيتك وقوتك عشان تستحق تمشي في طريق الأنوار!',
            nextMove: null
        };

        state._pendingAscension = true;
        setTimeout(() => startCombat(gatekeeper), 1500);

        return { success: true, method: 'combat', message: "السما بتتشق. حارس بوابة الملكوت شهاب بيهبط عليك في ومضة ضوء دهبي خاطف!" };
    },

    complete(state) {
        state.player.ascended = true;
        state.player.cultivation.stage = 'الفناء الباقي والارتقاء الأسمى';
        state.player.cultivation.stageLevel = 1;
        state.player.cultivation.breakthroughReady = false;

        // Reset XP limits for celestial progression
        state.player.xp = 0;
        state.player.maxXp = 1000;

        // Massive celestial attribute bonuses!
        if (!state.player.cultivation.cultivationBonuses) {
            state.player.cultivation.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
        }
        const cb = state.player.cultivation.cultivationBonuses;
        cb.hp += 1000;
        cb.mp += 500;
        cb.atk += 200;
        cb.def += 100;

        // Fully restore player HP and MP
        calculateTotalStats();
        state.player.hp = state.player.maxHp;
        state.player.mp = state.player.maxMp;

        saveGame();
    }
};
