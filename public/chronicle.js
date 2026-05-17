// ────────────────────────────────────────────────────────
// CHRONICLE.JS — Visual Novel Gallery & Story Log
// ────────────────────────────────────────────────────────

window.toggleChronicleModal = function() {
    const modal = document.getElementById('chronicle-modal');
    if (!modal) return;
    
    const active = modal.classList.toggle('active');
    
    // Play transition chime if possible
    if (active && window.AUDIO) {
        window.AUDIO.playEffect('menu_click');
    }
    
    // Auto-update contents if opening
    if (active && window.state) {
        window.updateChronicleUI(window.state);
    }
};

// Robust flag checking that supports both objects (true/false) and arrays (includes) formats
function hasChronicleFlag(state, flag) {
    if (!state || !state.storyFlags) return false;
    if (Array.isArray(state.storyFlags)) {
        return state.storyFlags.includes(flag);
    }
    return !!state.storyFlags[flag];
}

window.updateChronicleUI = function(state) {
    if (!state) return;
    
    // 1. Update Karma Slider pointer
    const pointer = document.getElementById('chronicle-karma-pointer');
    if (pointer) {
        const karma = state.player.karma || 0;
        // Map -100 to 100 onto 0% to 100%
        const pct = Math.max(0, Math.min(100, ((karma + 100) / 2)));
        pointer.style.left = `${pct}%`;
    }
    
    // 2. Update Ending Projections based on Alignment
    const projectionBox = document.getElementById('ending-projection-box');
    if (projectionBox) {
        const karma = state.player.karma || 0;
        if (karma >= 60) {
            projectionBox.innerHTML = `
                <span style="color:var(--jade); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">☀️ Path of Celestial Saint</span>
                Your righteous actions echo through the Jade mountains. You are currently walking the noble path, on course for the <b>Saintly Ascension Ending</b>. You will seal the chaotic Rifts, bring eternal peace, and unify both jade and sand realms.
            `;
        } else if (karma <= -60) {
            projectionBox.innerHTML = `
                <span style="color:var(--danger); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">💀 Path of Demonic Sovereign</span>
                You have forged your soul in the crucible of absolute ambition and dark flame. You are on course for the <b>Demonic Sovereign Ending</b>. You will seize the rifts' power, tear down the ancient sects, and reign supreme over the sand.
            `;
        } else {
            projectionBox.innerHTML = `
                <span style="color:var(--secondary); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">⚖️ Path of the Great Balance</span>
                You steer clear of extremism, holding the central line of the neutral sage. You are on course for the <b>Wandering Balance Ending</b>. You will maintain the eternal cycle, keeping both shadow and light in perfect dynamic tension.
            `;
        }
    }
    
    // 3. Populate Story Timeline
    const timeline = document.getElementById('chronicle-timeline');
    if (timeline) {
        timeline.innerHTML = '';
        
        const nodes = [];
        
        // Background node
        if (state.player.background) {
            nodes.push({
                title: "Origin Decided",
                desc: `Awakened as a <b>${state.player.background.name}</b>, carrying the trait of <i>${state.player.background.trait}</i> into the mortal realms.`,
                type: 'neutral'
            });
        }
        
        // System node
        if (state.player.system) {
            nodes.push({
                title: "Destiny System Unlocked",
                desc: `Blessed by the cosmos with the unique <b>${state.player.system.name}</b>: <i>${state.player.system.desc}</i>`,
                type: 'saintly'
            });
        }
        
        // Act completions & decisions
        if (hasChronicleFlag(state, 'womb_completed')) {
            nodes.push({
                title: "First Steps into the Dao",
                desc: "Passed the heavenly trials of youth, successfully tempering your spirit roots and emerging into the wider desert.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'harun_met')) {
            nodes.push({
                title: "The Crossroads Merchant",
                desc: "Met Harun the Jinn Merchant, learning of the poisoning that corrupts both Sand and Jade realms.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act2_started')) {
            nodes.push({
                title: "The Celestial Conflict",
                desc: "Witnessed the growing tensions between the mystical Sufi Orders and the proud Jade Sects.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act3_pass_visited')) {
            nodes.push({
                title: "Passage of the Sacred Duke",
                desc: "Faced the Jade Pass protectors. Resolved the conflict with righteous diplomacy and high resolve.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'act3_mirror_completed')) {
            nodes.push({
                title: "The Mirror of Past Lives",
                desc: "Stared deep into the Abyssal Sea Mirror. Unlocked the memories of the Fallen Immortal.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act4_started')) {
            nodes.push({
                title: "Siege of the Crossroads",
                desc: "Took a stand during the massive invasion, defending the heart of the Silk Road from rogue sects.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act4_completed')) {
            nodes.push({
                title: "The Siege Broken",
                desc: "Shattered the phantom armies and restored peace to the city, gaining the respect of both factions.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'act5_started')) {
            nodes.push({
                title: "The Great Convergence",
                desc: "Ascended to the final rift, ready to decide the ultimate fate of sand, jade, and sky.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'ending_saint')) {
            nodes.push({
                title: "☀️ Saintly Ascension",
                desc: "Achieved perfect cosmic union. Sealed the rifts with celestial grace, becoming the guardian saint of both worlds.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'ending_demon')) {
            nodes.push({
                title: "💀 Demonic Sovereign Rule",
                desc: "Crushed all resistance under your boots. Formed a new empire ruled by absolute strength.",
                type: 'demonic'
            });
        }
        if (hasChronicleFlag(state, 'ending_balance')) {
            nodes.push({
                title: "⚖️ The Great Neutral Balance",
                desc: "Refused extremes. Preserved both shadow and light, walking the endless road of the dynamic Tao.",
                type: 'neutral'
            });
        }
        
        if (nodes.length === 0) {
            timeline.innerHTML = '<div style="color:var(--text-dim); text-align:center; margin-top:50px;">Your story has just begun...</div>';
        } else {
            nodes.forEach(n => {
                const item = document.createElement('div');
                item.className = `timeline-node ${n.type}`;
                item.innerHTML = `
                    <div style="font-weight:bold; color:var(--secondary); font-size:0.95rem; margin-bottom:2px;">${n.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-dim); line-height:1.4;">${n.desc}</div>
                `;
                timeline.appendChild(item);
            });
        }
    }
    
    // 4. Update Hub Story Progress bars
    updateHubStoryProgress(state);
};

window.updateHubStoryProgress = function(state) {
    if (!state) return;
    
    const progress = calculateStoryProgress(state);
    
    // 1. Hub Screen elements
    const hudActName = document.getElementById('hud-act-name');
    const hudActPct = document.getElementById('hud-act-pct');
    const hudBar = document.getElementById('hud-act-progress-bar');
    
    if (hudActName) hudActName.textContent = progress.actName;
    if (hudActPct) hudActPct.textContent = `${progress.pct}% Complete`;
    if (hudBar) hudBar.style.width = `${progress.pct}%`;
    
    // 2. Narrative Screen elements
    const storyHudActName = document.getElementById('story-hud-act-name');
    const storyHudActPct = document.getElementById('story-hud-act-pct');
    const storyHudBar = document.getElementById('story-hud-act-progress-bar');
    
    if (storyHudActName) storyHudActName.textContent = progress.actName;
    if (storyHudActPct) storyHudActPct.textContent = `${progress.pct}% Complete`;
    if (storyHudBar) storyHudBar.style.width = `${progress.pct}%`;
};

function calculateStoryProgress(state) {
    let actName = "Act I: Shifting Sands";
    let pct = 0;
    
    if (window.STORY && typeof window.STORY.getCurrentAct === 'function') {
        const act = window.STORY.getCurrentAct(state);
        const names = {
            1: "Act I: Shifting Sands",
            2: "Act II: Celestial Conflict",
            3: "Act III: Mirror of Past Lives",
            4: "Act IV: Crossroads Siege",
            5: "Act V: Convergence"
        };
        actName = names[act] || "Act I: Shifting Sands";
        pct = window.STORY.getActProgress(state);
    } else {
        // Fallback to legacy calculation if STORY isn't loaded yet
        if (hasChronicleFlag(state, 'act5_started')) {
            actName = "Act V: Convergence";
            pct = 50;
        } else if (hasChronicleFlag(state, 'act4_started')) {
            actName = "Act IV: Crossroads Siege";
            pct = 40;
        } else if (hasChronicleFlag(state, 'act3_started')) {
            actName = "Act III: Mirror of Past Lives";
            pct = 30;
        } else if (hasChronicleFlag(state, 'act2_started')) {
            actName = "Act II: Celestial Conflict";
            pct = 50;
        } else {
            actName = "Act I: Shifting Sands";
            pct = 10;
        }
    }
    
    return { actName, pct };
}
