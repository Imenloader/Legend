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

function startStabilityMiniGame(callback) {
    clearNarrative();
    narrate("<b>Qi Condensation Phase</b><br>Stop the fluctuations at their peak stability!", "System", null, false, true);
    
    const container = document.createElement('div');
    container.style.cssText = 'width:100%; height:30px; background:#222; border:1px solid #444; border-radius:15px; position:relative; overflow:hidden; margin:20px 0;';
    
    const target = document.createElement('div');
    target.style.cssText = 'position:absolute; left:45%; width:10%; height:100%; background:var(--jade); opacity:0.5;';
    
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute; left:0; width:4px; height:100%; background:#fff; box-shadow:0 0 10px #fff;';
    
    container.appendChild(target);
    container.appendChild(bar);
    document.getElementById('narrative-window').appendChild(container);

    let pos = 0;
    let dir = 1;
    let animId;

    const loop = () => {
        pos += 2 * dir;
        if (pos >= 100 || pos <= 0) dir *= -1;
        bar.style.left = pos + '%';
        animId = requestAnimationFrame(loop);
    };
    loop();

    setChoices([{
        text: "⚡ CONDENSE QI",
        callback: () => {
            cancelAnimationFrame(animId);
            const dist = Math.abs(pos - 50);
            const stability = Math.max(0, 100 - (dist * 2));
            callback(stability);
        }
    }]);
}

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
                text: `${canCraft ? '⚗️ ' : '[LOCKED] '}Brew ${r.name} | Needs: ${ingList}`,
                callback: () => {
                    if (!canCraft) return;
                    startStabilityMiniGame((stability) => {
                        const res = window.CRAFTING.brewAlchemy(state, id, stability);
                        narrate(res.message, 'System', null, false, true);
                        updateTopBar(); saveGame();
                        setTimeout(showAlchemyScreen, 2000);
                    });
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

    const backBtn = document.getElementById('return-map-btn');
    if (backBtn) backBtn.onclick = hubLoop;

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

function showAuctionHouse() {
    clearNarrative();
    if (!state.activeAuction) {
        narrate("<b>Sect Auction House</b><br>The hall is quiet. No auctions are currently active.", "System", null, false, true);
        setChoices([
            { text: "⏳ Request New Auction", callback: () => { window.AUCTION.start(state); showAuctionHouse(); } },
            { text: "↩ Return", callback: hubLoop }
        ]);
        return;
    }

    const a = state.activeAuction;
    narrate(`<b>BIDDING FOR: ${a.item.name}</b>`, "Auction", null, false, true);
    narrate(`${a.item.desc}<br><br>
        Current Bid: <b style="color:var(--secondary)">${a.currentBid} Stones</b><br>
        Highest Bidder: <b>${a.highestBidder}</b><br>
        Time Remaining: <b>${a.timeLeft}s</b>`, "Auction", null, false, true);

    const bid1 = Math.floor(a.currentBid * 1.1);
    const bid2 = Math.floor(a.currentBid * 1.5);

    setChoices([
        { text: `Bid ${bid1} Stones`, callback: () => { if(state.player.gold >= bid1) { window.AUCTION.placeBid(state, state.player.name, bid1); state.player.gold -= bid1; showAuctionHouse(); } } },
        { text: `Outbid with ${bid2} Stones`, callback: () => { if(state.player.gold >= bid2) { window.AUCTION.placeBid(state, state.player.name, bid2); state.player.gold -= bid2; showAuctionHouse(); } } },
        { text: "🔄 Refresh", callback: showAuctionHouse },
        { text: "↩ Return", callback: hubLoop }
    ]);
}

function showRebirthScreen() {
    clearNarrative();
    narrate("<b>THE HALL OF TRANSMIGRATION</b>", "System", null, false, true);
    narrate("You have reached the pinnacle of your current life. Will you shed your mortal coil and transcend into a new existence?", "System", null, false, true);
    
    if (state.player.lvl < 10) {
        narrate("<span style='color:var(--danger)'>You must reach Level 10 to Transmigrate.</span>");
        setChoices([{ text: "↩ Return", callback: hubLoop }]);
        return;
    }

    const choices = Object.values(window.REBIRTH.traits).map(t => ({
        text: `Choose ${t.name} (${t.desc})`,
        callback: () => {
            const success = window.REBIRTH.perform(state, t.id);
            if (success) {
                narrate("Your soul drifts through the void... and awakens anew.", "System");
                setTimeout(hubLoop, 2000);
            }
        }
    }));
    
    setChoices([...choices, { text: "↩ Not Yet", callback: hubLoop }]);
}

function showPropertiesScreen() {
    clearNarrative();
    const p = state.player;
    const stats = calculateTotalStats ? calculateTotalStats() : p; // Ensure fresh stats
    
    let alignmentTitle = "Neutral Wanderer";
    if (p.karma >= 100) alignmentTitle = "Radiant Saint";
    else if (p.karma >= 50) alignmentTitle = "Benevolent Disciple";
    else if (p.karma <= -100) alignmentTitle = "Demonic Overlord";
    else if (p.karma <= -50) alignmentTitle = "Shadow Path Cultivator";

    let html = `
        <div style="width:100%; text-align:left; font-family:'Inter', sans-serif;">
            <h2 style="color:var(--secondary); text-align:center;">CHARACTER PROPERTIES</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
                
                <!-- Base Stats -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--primary);">
                    <h3 style="margin-top:0; color:var(--text);">⚔️ COMBAT POTENTIAL</h3>
                    <p style="margin:5px 0; text-align:left;">Attack: <b>${p.atk}</b></p>
                    <p style="margin:5px 0; text-align:left;">Defense: <b>${p.def}</b></p>
                    <p style="margin:5px 0; text-align:left;">Health: <b>${p.hp} / ${p.maxHp}</b></p>
                    <p style="margin:5px 0; text-align:left;">Spirit Qi: <b>${p.mp} / ${p.maxMp}</b></p>
                </div>

                <!-- Spiritual Path -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--secondary);">
                    <h3 style="margin-top:0; color:var(--text);">✨ SPIRITUAL PATH</h3>
                    <p style="margin:5px 0; text-align:left;">Title: <b>${alignmentTitle}</b></p>
                    <p style="margin:5px 0; text-align:left;">Karma: <b style="color:${p.karma >= 0 ? 'var(--jade)' : 'var(--danger)'}">${p.karma}</b></p>
                    <p style="margin:5px 0; text-align:left;">Faction: <b>${p.faction || 'Unaffiliated'}</b></p>
                </div>

                <!-- Life & Background -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--primary);">
                    <h3 style="margin-top:0; color:var(--text);">🧬 LIFE IDENTITY</h3>
                    <p style="margin:5px 0; text-align:left;">Background: <b>${p.background?.name || 'Unknown'}</b></p>
                    <p style="margin:5px 0; text-align:left;">System Cheat: <b>${p.system?.name || 'None'}</b></p>
                    <p style="margin:5px 0; text-align:left;">Children: <b>${p.children || 0}</b> | Kills: <b>${p.kills || 0}</b></p>
                </div>

                <!-- Legacy & Rebirth -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--sapphire);">
                    <h3 style="margin-top:0; color:var(--text);">⏳ LEGACY RECORD</h3>
                    <p style="margin:5px 0; text-align:left;">Rebirths: <b>${state.legacy ? state.legacy.rebirthCount : 0}</b></p>
                    <p style="margin:5px 0; text-align:left;">Ancestral Traits: <b>${state.legacy && state.legacy.traits.length ? state.legacy.traits.length : 'None'}</b></p>
                </div>

            </div>
        </div>
    `;

    narrate(html, "System", null, false, true);
    setChoices([{ text: "↩ Return", callback: hubLoop }]);
}

function showManagementScreen() {
    clearNarrative();
    narrate("<b>FAMILY & SECT MANAGEMENT</b>", "System", null, false, true);
    
    let html = `<div style="text-align:left;">`;
    
    // Family Section
    html += `<h3 style="color:var(--secondary)">👨‍👩‍👧‍👦 Biological Family</h3>`;
    if (state.player.family && state.player.family.length) {
        state.player.family.forEach(f => {
            html += `<p style="margin:5px 0;">${f.relation}: <b>${f.name}</b> (Affinity: ${f.affinity}%)</p>`;
        });
    } else {
        html += `<p>You have no living relatives.</p>`;
    }
    
    // Sect Section
    html += `<h3 style="color:var(--jade); margin-top:20px;">🏛️ My Immortal Sect</h3>`;
    if (state.sect) {
        html += `<p>Sect Name: <b>${state.sect.name}</b> (Lv. ${state.sect.level})</p>
                 <p>Disciples: <b>${state.sect.disciples.length} / ${state.sect.maxDisciples}</b></p>
                 <p>Treasury: <b>${state.sect.treasury} Stones</b></p>`;
    } else {
        html += `<p>You have not founded a sect yet.</p>`;
    }
    
    html += `</div>`;
    narrate(html, "System", null, false, true);
    
    const choices = [
        { text: "🤝 Interact with Family", callback: () => { narrate("You spent time with your family, increasing affinity.", "System"); state.player.family.forEach(f => f.affinity = Math.min(100, f.affinity+5)); showManagementScreen(); } },
        { text: "🏠 Found Sect (10,000 Stones)", callback: () => { if(state.player.gold >= 10000) { state.player.gold -= 10000; window.SECTS.init(state); showManagementScreen(); } } },
        { text: "👤 Recruit Disciple", callback: () => { const res = window.SECTS.recruit(state); narrate(res.message, "System"); showManagementScreen(); } },
        { text: "↩ Return", callback: hubLoop }
    ];
    
    setChoices(choices);
}





