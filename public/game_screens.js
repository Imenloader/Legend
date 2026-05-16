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
    narrate(`XP: <b>${state.player.xp}</b> / <b>${state.player.maxXp}</b> | Level: <b>${state.player.lvl}</b>`, 'System', null, false, true);

    const choices = [
        {
            text: 'Deep Meditation (Gather Qi & XP)',
            callback: () => {
                const result = window.CULTIVATION ? window.CULTIVATION.meditate(state) : { success: true, message: 'You meditate, drawing in ambient Qi.' };
                narrate(result.message, 'System', null, false, true);
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
                    narrate('The heavens darken. Nine thunderbolts crack across the sky. A Tribulation Beast descends!', 'System', null, false, true);
                    narrate('<span style="color:#e040fb;font-size:1.2em;font-weight:bold;">HEAVENLY TRIBULATION INITIATED</span>', 'System', null, false, true);
                    const tribBeast = {
                        name: 'Heavenly Tribulation Beast',
                        sprite: null,
                        hp: 200 + state.player.lvl * 20,
                        maxHp: 200 + state.player.lvl * 20,
                        atk: 25 + state.player.lvl * 4,
                        def: 5,
                        stageLevel: 10,
                        xpReward: 0,
                        dialogue: 'The sky tears open. A divine beast of pure lightning crashes before you — this is your Heavenly Trial.',
                        archetype: 'mage',
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
    if (!state.player.inventory.materials) state.player.inventory.materials = {};
    const mats = state.player.inventory.materials;
    const matList = Object.entries(mats).filter(([,v]) => v > 0).map(([k,v]) => `${k.replace(/_/g,' ')}: <b>${v}</b>`).join(', ') || '<i>None</i>';

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">THE FURNACE OF HEAVEN</b>', 'System', null, false, true);
    narrate(`Materials: ${matList}`, 'System', null, false, true);
    narrate('Combine spirit herbs, monster cores, and ores to craft potions, elixirs, and Breakthrough Pills.', 'System', null, false, true);

    const choices = [];
    if (window.CRAFTING) {
        Object.entries(window.CRAFTING.alchemyRecipes).forEach(([id, r]) => {
            const ingList = Object.entries(r.ingredients).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ');
            const canCraft = Object.entries(r.ingredients).every(([k,v]) => (mats[k] || 0) >= v);
            choices.push({
                text: `${canCraft ? '[CRAFT]' : '[LOCKED]'} ${r.name} - ${r.desc} | Needs: ${ingList}`,
                callback: canCraft ? () => {
                    const res = window.CRAFTING.craftAlchemy(state, id);
                    narrate(res.message, 'System', null, false, true);
                    updateTopBar(); saveGame();
                    setTimeout(showAlchemyScreen, 1500);
                } : () => {
                    narrate(`You need: ${ingList} to craft ${r.name}.`, 'System', null, false, true);
                    setTimeout(showAlchemyScreen, 1500);
                }
            });
        });
    }

    if (!choices.length) {
        narrate('No recipes are available. Gather materials by defeating enemies on the World Map.', 'System', null, false, true);
    }

    choices.push({ text: 'Return to Crossroads', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// BLACKSMITH SCREEN - The Spirit Forge
// ============================================================
function showForgeScreen() {
    clearNarrative();
    if (!state.player.inventory.materials) state.player.inventory.materials = {};
    const eq = state.player.equipment;
    const mats = state.player.inventory.materials;

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">THE SPIRIT FORGE</b>', 'System', null, false, true);
    narrate(`Weapon: <b>${eq.weapon || 'None'}</b> | Armor: <b>${eq.armor || 'None'}</b> | Relic: <b>${eq.relic || 'None'}</b>`, 'System', null, false, true);

    const matLine = Object.entries(mats).filter(([,v]) => v > 0).map(([k,v]) => `${k.replace(/_/g,' ')}: ${v}`).join(' | ') || 'No materials';
    narrate(`Materials: ${matLine}`, 'System', null, false, true);

    const choices = [];
    ['weapon','armor','relic'].forEach(slot => {
        if (eq[slot]) {
            choices.push({
                text: `Upgrade ${slot}: ${eq[slot]}`,
                callback: () => {
                    const res = window.CRAFTING ? window.CRAFTING.upgradeEquipment(state, slot) : { success: false, message: 'Crafting module unavailable.' };
                    narrate(res.message, 'System', null, false, true);
                    updateTopBar(); saveGame();
                    setTimeout(showForgeScreen, 1500);
                }
            });
        }
    });

    if (!choices.length) {
        narrate('You have no equipment to upgrade. Find gear by exploring regions and defeating enemies.', 'System', null, false, true);
    }

    choices.push({ text: 'Return to Crossroads', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// INVENTORY SCREEN - Satchel Tabs
// ============================================================
function switchSatchelTab(tab) {
    const grid = document.getElementById('item-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const inv = state.player.inventory;
    if (!inv.materials) inv.materials = {};

    if (tab === 'consumables') {
        const items = [
            { label: 'Recovery Potions', value: inv.potions, color: '#00a86b' },
            { label: 'Spirit Elixirs', value: inv.elixirs, color: '#d4af37' },
            { label: 'Gold Coins', value: state.player.gold || 0, color: '#f5c842' }
        ];
        items.forEach(it => {
            const div = document.createElement('div');
            div.className = 'inventory-slot';
            div.style.cssText = 'width:auto;padding:12px 16px;text-align:center;min-width:120px;';
            div.innerHTML = `<div style="font-size:0.75rem;color:#888;">${it.label}</div><div style="font-size:1.4rem;font-weight:bold;color:${it.color};">${it.value}</div>`;
            grid.appendChild(div);
        });
    } else if (tab === 'equipment') {
        const gear = (inv.items || []).filter(i => i && i.rarity);
        if (!gear.length) {
            grid.innerHTML = '<div style="color:#555;padding:20px;"><i>No equipment. Explore regions to find gear.</i></div>';
        } else {
            gear.forEach(item => {
                const div = document.createElement('div');
                div.className = `inventory-slot ${item.css || ''}`;
                div.style.cssText = 'width:auto;padding:10px 14px;cursor:pointer;min-width:120px;';
                div.innerHTML = `<div style="font-weight:bold;">${item.name}</div><div style="font-size:0.75rem;color:#888;">${item.rarity}</div>`;
                grid.appendChild(div);
            });
        }
    } else if (tab === 'materials') {
        const entries = Object.entries(inv.materials).filter(([,v]) => v > 0);
        if (!entries.length) {
            grid.innerHTML = '<div style="color:#555;padding:20px;"><i>No materials. Defeat enemies to gather resources.</i></div>';
        } else {
            entries.forEach(([k, v]) => {
                const div = document.createElement('div');
                div.className = 'inventory-slot';
                div.style.cssText = 'width:auto;padding:10px 14px;min-width:100px;text-align:center;';
                div.innerHTML = `<div style="font-size:0.8rem;text-transform:capitalize;">${k.replace(/_/g,' ')}</div><div style="font-size:1.3rem;font-weight:bold;color:#d4af37;">x${v}</div>`;
                grid.appendChild(div);
            });
        }
    }
}

function showInventory() {
    const eq = state.player.equipment || {};
    document.getElementById('eq-weapon-name').textContent = eq.weapon || 'None';
    document.getElementById('eq-armor-name').textContent = eq.armor || 'Basic Robes';
    document.getElementById('eq-relic-name').textContent = eq.relic || 'None';
    document.getElementById('eq-weapon-stats').textContent = eq.weapon ? '+ATK' : '';
    document.getElementById('eq-armor-stats').textContent = eq.armor ? '+DEF' : '+5 DEF';

    let karmaText = 'Neutral';
    if (state.player.karma > 20) karmaText = 'Righteous';
    if (state.player.karma > 80) karmaText = 'Saintly';
    if (state.player.karma < -20) karmaText = 'Corrupted';
    if (state.player.karma < -80) karmaText = 'Demonic Sovereign';

    showScreen('inventory-screen');
    clearNarrative();
    narrate(`<b>Karma:</b> ${state.player.karma} (${karmaText}) | <b>Gold:</b> ${state.player.gold || 0} coins`, 'System', null, false, true);
    narrate(`<b>Cultivation:</b> ${state.player.cultivation?.stage || 'Qi Condensation'} Lv.${state.player.cultivation?.stageLevel || 1}`, 'System', null, false, true);

    if (state.companion && window.COMPANIONS) {
        const comp = window.COMPANIONS.getActive(state);
        const compState = state.companions[state.companion];
        if (comp && compState) {
            const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
            narrate(`<b>Companion:</b> ${comp.name} | Affinity: <span style="color:${tier.color}">${compState.affinity}/100 (${tier.label})</span>`, 'System', null, false, true);
        }
    }

    switchSatchelTab('consumables');
    document.getElementById('back-hub-btn').onclick = () => { showScreen('story-screen'); hubLoop(); };
}
