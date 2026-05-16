// ============================================================
// SECTS.JS — Sect Management & Disciple Recruitment
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

window.SECTS = {
    ranks: ['Outer Court', 'Inner Court', 'Core Disciple', 'Elder', 'Grand Elder', 'Sect Master'],

    // Initial state for player's sect
    init(state) {
        if (!state.sect) {
            state.sect = {
                name: 'Unnamed Sect',
                level: 1,
                fame: 0,
                disciples: [],
                maxDisciples: 5,
                treasury: 0
            };
        }
    },

    // Recruit a random disciple
    recruit(state) {
        this.init(state);
        if (state.sect.disciples.length >= state.sect.maxDisciples) return { success: false, message: "Sect is at full capacity!" };
        
        const cost = 1000 * state.sect.level;
        if (state.player.gold < cost) return { success: false, message: "Not enough stones to recruit!" };
        
        const names = ['Jun', 'Lao', 'Xiao', 'Mei', 'Ying'];
        const d = {
            name: names[Math.floor(Math.random() * names.length)] + " " + (state.sect.disciples.length + 1),
            lvl: 1,
            atk: 5 + Math.floor(Math.random() * 5),
            quality: Math.random() > 0.9 ? 'Genius' : 'Normal'
        };
        
        state.player.gold -= cost;
        state.sect.disciples.push(d);
        return { success: true, message: `Recruited ${d.name} (${d.quality})!` };
    },

    // Sect heartbeat (Passive income/fame)
    process(state) {
        if (!state.sect) return;
        // Every cycle, disciples generate a tiny bit of fame
        state.sect.fame += state.sect.disciples.length * 0.1;
        state.sect.treasury += state.sect.disciples.length * 5;
    }
};
