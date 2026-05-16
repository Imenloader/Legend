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
            group.appendChild(circle);
        });
    }
}
