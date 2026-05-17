// ============================================================
// AUCTION.JS — المزاد العلني في سوق القوافل والمزايدات الشريرة
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.AUCTION = {
    items: [
        { id: 'ancient_manual', name: 'مخطوطة السيف العتيقة الأثرية', basePrice: 2000, desc: 'بتفتح طريقة وفن "ضربة الفناء الروحية" المدمرة بسيفك.' },
        { id: 'dragon_bone', name: 'عظمة التنين الحقيقي الأثرية المباركة', basePrice: 5000, desc: 'مادة أسطورية نادرة جداً لمسبك الفولاذ وصناعة الأسلحة الفتاكة.' },
        { id: 'nirvana_pill', name: 'حبة النيرفانا واليقين المطلق الروحية', basePrice: 10000, desc: 'بتضمن النجاح التام بنسبة 100% في طقس الارتقاء الروحي القادم.' }
    ],

    // شخصيات المنافسين المزايدين (NPCs)
    rivals: [
        { name: 'الشيخ زهران العارف', aggressive: 0.7, maxBidMult: 2.5 },
        { name: 'الدرويش الجوال البسيط', aggressive: 0.3, maxBidMult: 1.5 },
        { name: 'أميرة طائفة السيوف الصحراوية', aggressive: 0.9, maxBidMult: 4.0 }
    ],

    // Start a new auction
    start(state) {
        const item = this.items[Math.floor(Math.random() * this.items.length)];
        state.activeAuction = {
            item: item,
            currentBid: item.basePrice,
            highestBidder: 'دار المزاد العلني',
            timeLeft: 30, // seconds
            isClosed: false
        };
        return state.activeAuction;
    },

    // Player or NPC places a bid
    placeBid(state, bidderName, amount) {
        if (!state.activeAuction || state.activeAuction.isClosed) return false;
        if (amount <= state.activeAuction.currentBid) return false;
        
        // Defensive check for player bidding
        if (bidderName === state.player.name && (state.player.gold || 0) < amount) {
            if (typeof showToast === 'function') showToast("معندكش دنانير روحية كفاية!");
            return false;
        }

        state.activeAuction.currentBid = amount;
        state.activeAuction.highestBidder = bidderName;
        state.activeAuction.timeLeft = Math.min(30, state.activeAuction.timeLeft + 5); 
        return true;
    },

    // Process NPC bidding logic
    processNPCs(state) {
        if (!state.activeAuction || state.activeAuction.isClosed) return;
        
        this.rivals.forEach(rival => {
            if (Math.random() < (rival.aggressive * 0.1)) {
                const nextBid = Math.floor(state.activeAuction.currentBid * (1 + (Math.random() * 0.2)));
                if (nextBid < state.activeAuction.item.basePrice * rival.maxBidMult) {
                    this.placeBid(state, rival.name, nextBid);
                    if (typeof narrate === 'function') {
                        narrate(`${rival.name} زود المزايدة لـ ${nextBid} دينار روحي!`, "المزاد");
                    }
                }
            }
        });
    }
};
