// ============================================================
// AUCTION.JS — Sect Auctions & Competitive Bidding
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.AUCTION = {
    items: [
        { id: 'ancient_manual', name: 'Ancient Sword Manual', basePrice: 2000, desc: 'Unlocks the "Void Slash" technique.' },
        { id: 'dragon_bone', name: 'True Dragon Bone', basePrice: 5000, desc: 'A mythic material for the Spirit Forge.' },
        { id: 'nirvana_pill', name: 'Nirvana Pill', basePrice: 10000, desc: 'Guarantees success in the next breakthrough.' }
    ],

    // NPCs who might bid
    rivals: [
        { name: 'Elder Zhao', aggressive: 0.7, maxBidMult: 2.5 },
        { name: 'Wandering Monk', aggressive: 0.3, maxBidMult: 1.5 },
        { name: 'Sect Heiress', aggressive: 0.9, maxBidMult: 4.0 }
    ],

    // Start a new auction
    start(state) {
        const item = this.items[Math.floor(Math.random() * this.items.length)];
        state.activeAuction = {
            item: item,
            currentBid: item.basePrice,
            highestBidder: 'House',
            timeLeft: 30, // seconds
            isClosed: false
        };
        return state.activeAuction;
    },

    // Player or NPC places a bid
    placeBid(state, bidderName, amount) {
        if (!state.activeAuction || state.activeAuction.isClosed) return false;
        if (amount <= state.activeAuction.currentBid) return false;

        state.activeAuction.currentBid = amount;
        state.activeAuction.highestBidder = bidderName;
        state.activeAuction.timeLeft = Math.min(30, state.activeAuction.timeLeft + 5); // Extend time slightly
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
                        narrate(`${rival.name} bids ${nextBid} Spirit Stones!`, "Auction");
                    }
                }
            }
        });
    }
};
