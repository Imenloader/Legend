// ============================================================
// CULTIVATION SCREEN - The Inner Sea
// ============================================================
function showCultivationScreen() {
    clearNarrative();
    if (!state.player.cultivation) {
        state.player.cultivation = { stage: 'Qi Condensation', stageLevel: 1, breakthroughReady: false };
    }
    const cult = state.player.cultivation;
    const stageColors = { 'Qi Condensation': '#8888aa', 'Foundation Establishment': '#00a86b', 'Core Formation': '#d4af37', 'Nascent Soul': '#e040fb' };
    const col = stageColors[cult.stage] || '#aaa';

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">THE INNER SEA</b>', 'System', null, false, true);
    narrate(`Your cultivation is in the <span style="color:${col};font-weight:bold;">${cult.stage}</span> realm, Level <b>${cult.stageLevel}</b>/9.`, 'System', null, false, true);
    narrate(`HP: <b>${state.player.maxHp}</b> | Qi: <b>${state.player.maxMp}</b> | ATK: <b>${state.player.atk}</b> | DEF: <b>${state.player.def}</b>`, 'System', null, false, true);

    const choices = [
        {
            text: 'Deep Meditation (Gather Qi & XP)',
            callback: () => {
                const result = window.CULTIVATION ? window.CULTIVATION.meditate(state) : { success: true, message: 'You meditate, drawing in ambient Qi.' };
                narrate(result.message, 'System', null, false, true);
                
                // Visual FX
                const screen = document.querySelector('.screen.active');
                if (screen) {
                    screen.classList.add('meditation-glow');
                    const particles = document.createElement('div');
                    particles.className = 'qi-gathering';
                    screen.appendChild(particles);
                    setTimeout(() => { particles.remove(); screen.classList.remove('meditation-glow'); }, 2000);
                }
                if (typeof triggerFlash === 'function') triggerFlash('heal');

                updateTopBar(); saveGame();
                setTimeout(showCultivationScreen, 2200);
            }
        }
    ];

    if (cult.breakthroughReady) {
        choices.push({
            text: 'ATTEMPT MAJOR BREAKTHROUGH (Heavenly Tribulation!)',
            callback: () => {
                const res = window.CULTIVATION ? window.CULTIVATION.attemptBreakthrough(state) : { success: false, message: 'Cultivation module unavailable.' };
                if (!res.success) {
                    narrate(res.message, 'System', null, false, true);
                    setTimeout(showCultivationScreen, 2000);
                } else {
                    narrate('The heavens darken. A Tribulation Beast descends!', 'System', null, false, true);
                    const tribBeast = {
                        name: 'Heavenly Tribulation Beast',
                        hp: 250 + state.player.lvl * 20,
                        maxHp: 250 + state.player.lvl * 20,
                        atk: 30 + state.player.lvl * 5,
                        dialogue: 'The sky tears open. This is your Heavenly Trial.',
                        nextMove: null
                    };
                    state._pendingBreakthroughStage = res.nextStage;
                    setTimeout(() => startCombat(tribBeast), 1500);
                }
            }
        });
    }

    choices.push({ text: 'Return to Crossroads', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// ALCHEMY SCREEN - The Furnace of Heaven
// ============================================================
function showAlchemyScreen() {
    clearNarrative();
    const mats = state.player.inventory.materials || {};
    const matList = Object.entries(mats).filter(([,v]) => v > 0).map(([k,v]) => `${k.replace(/_/g,' ')}: <b>${v}</b>`).join(', ') || '<i>None</i>';

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">THE FURNACE OF HEAVEN</b>', 'System', null, false, true);
    narrate(`Materials: ${matList}`, 'System', null, false, true);

    const choices = [];
    if (window.CRAFTING) {
        Object.entries(window.CRAFTING.alchemyRecipes).forEach(([id, r]) => {
            const ingList = Object.entries(r.ingredients).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ');
            const canCraft = Object.entries(r.ingredients).every(([k,v]) => (mats[k] || 0) >= v);
            choices.push({
                text: `${canCraft ? '⚗️ ' : '[LOCKED] '}Craft ${r.name} | Needs: ${ingList}`,
                callback: () => {
                    const res = window.CRAFTING.craftAlchemy(state, id);
                    narrate(res.message, 'System', null, false, true);
                    updateTopBar(); saveGame();
                    setTimeout(showAlchemyScreen, 1500);
                }
            });
        });
    }
    choices.push({ text: 'Return to Crossroads', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// BLACKSMITH SCREEN - The Spirit Forge
// ============================================================
function showForgeScreen() {
    clearNarrative();
    const mats = state.player.inventory.materials || {};
    narrate('<b style="font-size:1.3em;letter-spacing:2px;">THE SPIRIT FORGE</b>', 'System', null, false, true);
    narrate(`Forge legendary equipment using blueprints and rare ores. Success rolls determine quality!`, 'System', null, false, true);

    const choices = [];
    if (window.CRAFTING) {
        Object.entries(window.CRAFTING.forgeRecipes).forEach(([id, r]) => {
            const ingList = Object.entries(r.ingredients).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ');
            const hasBlueprint = (state.player.inventory.blueprints || []).includes(id) || true; // For now all known
            const canCraft = Object.entries(r.ingredients).every(([k,v]) => (mats[k] || 0) >= v);

            choices.push({
                text: `${canCraft ? '🔨 ' : '[LOCKED] '}Forge ${r.name} (${r.slot.toUpperCase()}) | Needs: ${ingList}`,
                callback: () => {
                    const res = window.CRAFTING.craftItem(state, id);
                    narrate(res.message, 'System', null, false, true);
                    updateTopBar(); saveGame();
                    setTimeout(showForgeScreen, 2500);
                }
            });
        });
    }
    choices.push({ text: 'Return to Crossroads', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// WORLD MAP SCREEN - SVG Navigation
// ============================================================
function showWorldMap() {
    showScreen('map-screen');
    const group = document.getElementById('map-regions-group');
    if (!group) return;
    group.innerHTML = '';

    if (window.LORE) {
        Object.values(window.LORE.REGIONS).forEach(region => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', region.x || 100);
            circle.setAttribute('cy', region.y || 100);
            circle.setAttribute('r', '12');
            circle.setAttribute('fill', region.unlocked ? 'var(--secondary)' : '#333');
            circle.setAttribute('class', 'map-node');
            circle.style.cursor = 'pointer';
            
            circle.onclick = () => {
                if (region.unlocked) {
                    showScreen('story-screen');
                    exploreRegion(region.id);
                } else {
                    alert(`${region.name} is currently locked.`);
                }
            };
            });
    }
}

// ============================================================
// NEW RPG SCREENS: Quests, Shop, Skills
// ============================================================

function showQuestLog() {
    clearNarrative();
    narrate("<b>Active Missions & Bounties</b>", "System", null, false, true);
    
    if (!state.activeQuests || state.activeQuests.length === 0) {
        narrate("No active quests. Check back later.");
    } else {
        state.activeQuests.forEach(qId => {
            const q = window.QUESTS.database[qId];
            if (q) {
                narrate(`<div style="background:rgba(0,0,0,0.3);padding:10px;border-left:4px solid var(--secondary);margin-bottom:10px;">
                    <b style="color:var(--secondary)">${q.title}</b> [${q.type}]<br>
                    ${q.desc}<br>
                    <small>Objective: ${q.objective}</small>
                </div>`, "System", null, false, true);
            }
        });
    }
    setChoices([{ text: "↩ Return", callback: hubLoop }]);
}

function showMarket() {
    clearNarrative();
    narrate("<b>The Crossroads Market</b> - Buy supplies or sell your treasures.", "System", null, false, true);
    
    const stock = window.SHOP.stocks.crossroads_market;
    const choices = stock.map(item => ({
        text: `Buy ${item.name} (${item.price} Spirit Stones)`,
        callback: () => {
            const res = window.SHOP.buy(state, 'crossroads_market', item.id);
            narrate(res.message, "System");
            setTimeout(showMarket, 1000);
        }
    }));

    choices.push({ text: "💰 Sell Items", callback: () => {
        state.isSelling = true;
        showInventory();
    }});
    choices.push({ text: "↩ Return", callback: () => { state.isSelling = false; hubLoop(); }});
    setChoices(choices);
}

function showSkillTree() {
    clearNarrative();
    narrate("<b>Jade & Sand Martial Techniques</b>", "System", null, false, true);
    
    if (!state.player.skills || state.player.skills.length === 0) {
        narrate("You have not learned any techniques yet.");
    } else {
        state.player.skills.forEach(sId => {
            const s = window.SKILLS.techniques[sId];
            if (s) {
                narrate(`<div style="background:rgba(0,0,0,0.3);padding:10px;border-left:4px solid var(--jade);margin-bottom:10px;">
                    <b style="color:var(--jade)">${s.name}</b> ${s.passive ? '[Passive]' : `[Cost: ${s.mpCost} Qi]`}<br>
                    ${s.desc}
                </div>`, "System", null, false, true);
            }
        });
    }
    setChoices([{ text: "↩ Return", callback: hubLoop }]);
}

