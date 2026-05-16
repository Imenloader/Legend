async function loadGameCloud() {
    const saved = localStorage.getItem('legend_rpg_state');
    if (saved) {
        try {
            const loadedState = JSON.parse(saved);
            Object.assign(state, loadedState);
            console.log('Game state loaded.');
            return true;
        } catch (e) {
            console.error('Failed to parse save data', e);
        }
    }
    return false;
}

function saveGame() {
    localStorage.setItem('legend_rpg_state', JSON.stringify(state));
    console.log('Game saved to localStorage.');
}

// Supabase Configuration
const SUPABASE_URL = 'https://zdgyluzcfcenszqtqkrm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZ3lsdXpjZmNlbnN6cXRxa3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjczNDIsImV4cCI6MjA5MzEwMzM0Mn0.W4h91ashw4TQoWzU5TU8SJhctyv3JG4Veec_lbPIMDE';
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Deep Game State
let state = {
    screen: 'menu',
    playerId: localStorage.getItem('rpg_player_id') || `guest_${Math.random().toString(36).substr(2, 9)}`,
    settings: { perspective: 'second' },
    player: {
        name: 'Cultivator',
        class: 'Sword Immortal',
        lvl: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 15,
        def: 5,
        sprite: 'assets/sword_immortal_1778872325571.png',
        karma: 0,
        gold: 50,
        inventory: {
            potions: 2,
            elixirs: 0,
            items: [],
            materials: {},
            blueprints: [] // NEW: For Spirit Forge & Furnace
        },
        equipment: {
            head: null,
            body: null,
            legs: null,
            boots: null,
            weapon: null,
            relic: null,
            necklace: null,
            ring: null
        },
        cultivation: {
            stage: 'Qi Condensation',
            stageLevel: 1,
            breakthroughReady: false
        }
    },
    companion: null,
    companions: {},
    relationships: {},
    achievements: [],
    narrative_node: 'hub',
    storyFlags: {},
    currentEnemy: null,
    combatState: null
};

// --- DOM Elements ---
const UI_ELEMENTS = {};
let narrativeWindow, choiceEngine;

function initUIElements() {
    narrativeWindow = document.getElementById('narrative-window');
    choiceEngine = document.getElementById('choice-engine');
    UI_ELEMENTS.storyPlayerName = document.getElementById('story-player-name');
    UI_ELEMENTS.storyHp = document.getElementById('story-hp');
    UI_ELEMENTS.storyMp = document.getElementById('story-mp');
    UI_ELEMENTS.storyHpBar = document.getElementById('story-hp-bar');
    UI_ELEMENTS.enemyContainer = document.getElementById('story-enemy-stats-container');
    UI_ELEMENTS.storyEnemyName = document.getElementById('story-enemy-name');
    UI_ELEMENTS.storyEnemyHp = document.getElementById('story-enemy-hp');
    UI_ELEMENTS.storyEnemyHpBar = document.getElementById('story-enemy-hp-bar');
    UI_ELEMENTS.storyGold = document.getElementById('story-gold');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initUIElements();
    if (!localStorage.getItem('rpg_player_id')) {
        localStorage.setItem('rpg_player_id', state.playerId);
    }
    document.getElementById('start-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('char-name').value;
        const perspective = document.getElementById('perspective-select').value;
        if (nameInput) state.player.name = nameInput;
        state.settings.perspective = perspective;
        showScreen('creation-screen');
    });    // Bind Character Creation Button
    const createBtn = document.getElementById('create-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name').value;
            if (nameInput) state.player.name = nameInput;

            const selectedCard = document.querySelector('.class-card.selected');
            if (selectedCard) {
                state.player.class = selectedCard.dataset.class;
                state.player.sprite = selectedCard.dataset.sprite;
                if (state.player.class === 'Sword Immortal') { state.player.atk += 5; }
                else if (state.player.class === 'Medicine Cultivator') { state.player.maxHp += 30; state.player.hp = state.player.maxHp; }
                else if (state.player.class === 'Sufi Mystic') { state.player.maxMp += 20; state.player.mp = state.player.maxMp; }
            }
            initGame();
        });
    }

    // Safety Fallback UI: Bind any emergency return buttons
    const rescueBtn = document.getElementById('rescue-btn');
    if (rescueBtn) {
        rescueBtn.addEventListener('click', () => {
            narrate("Emergency state reset initiated. Returning to Crossroads...", "System");
            state.screen = 'story-screen';
            state.currentEnemy = null;
            hubLoop();
        });
    }
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
    await loadGameCloud();
});

// --- Narrative Engine ---
function parsePerspective(text) {
    if (state.settings.perspective === 'first') {
        return text.replace(/\bYourself\b/g, 'Myself').replace(/\byourself\b/g, 'myself').replace(/\bYour\b/g, 'My').replace(/\byour\b/g, 'my').replace(/\bYou are\b/g, 'I am').replace(/\byou are\b/g, 'I am').replace(/\bYou\b/g, 'I').replace(/\byou\b/g, 'I');
    }
    return text;
}

function narrate(text, speaker = null, speakerSprite = null, isEnemy = false, isSystem = false) {
    const block = document.createElement('div');
    block.className = 'narrative-block';
    let contentHtml = '';
    if (speakerSprite) {
        const alignClass = isEnemy ? 'enemy-portrait' : '';
        contentHtml += `<img src="${speakerSprite}" class="story-portrait ${alignClass}" alt="${speaker}">`;
    }
    if (speaker) {
        const color = isEnemy ? 'var(--danger)' : (speaker === 'System' ? 'var(--secondary)' : 'var(--jade)');
        contentHtml += `<span class="narrative-speaker" style="color: ${color};">${speaker}</span>`;
    }
    const finalText = isSystem ? text : parsePerspective(text);
    contentHtml += `<p style="margin: 0; color: ${isSystem ? 'var(--secondary)' : 'var(--text)'};">${finalText}</p>`;
    block.innerHTML = contentHtml;
    narrativeWindow.appendChild(block);
    block.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// --- Visual Effects ---
function spawnFloatingText(text, x, y, color = '#fff') {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerHTML = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}
function triggerScreenShake() {
    const screen = document.querySelector('.screen.active');
    if (screen) { screen.classList.add('shake'); setTimeout(() => screen.classList.remove('shake'), 400); }
}
function triggerFlash(type = 'damage') {
    const screen = document.querySelector('.screen.active');
    if (!screen) return;
    const cls = type === 'damage' ? 'damage-flash' : 'heal-flash';
    screen.classList.add(cls);
    setTimeout(() => screen.classList.remove(cls), 500);
}
function clearNarrative() { narrativeWindow.innerHTML = ''; }
function setChoices(choicesArray) {
    choiceEngine.innerHTML = '';
    if (!choicesArray || choicesArray.length === 0) return;
    choicesArray.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.innerHTML = choice.text;
        btn.onclick = () => { choiceEngine.innerHTML = ''; if (choice.callback) choice.callback(); };
        choiceEngine.appendChild(btn);
    });
}

function updateTopBar() {
    if (!UI_ELEMENTS.storyPlayerName) return;
    UI_ELEMENTS.storyPlayerName.innerText = `${state.player.name} (Lvl ${state.player.lvl})`;
    UI_ELEMENTS.storyHp.innerText = state.player.hp;
    UI_ELEMENTS.storyMp.innerText = state.player.mp;
    UI_ELEMENTS.storyHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
    if (UI_ELEMENTS.storyGold) UI_ELEMENTS.storyGold.innerText = state.player.gold || 0;
    if (state.currentEnemy) {
        UI_ELEMENTS.enemyContainer.style.display = 'block';
        UI_ELEMENTS.storyEnemyName.innerText = state.currentEnemy.name;
        UI_ELEMENTS.storyEnemyHp.innerText = state.currentEnemy.hp;
        UI_ELEMENTS.storyEnemyHpBar.style.width = `${(state.currentEnemy.hp / state.currentEnemy.maxHp) * 100}%`;
    } else {
        UI_ELEMENTS.enemyContainer.style.display = 'none';
    }
    updateAuras();
}

function updateAuras() {
    const portrait = document.querySelector('.portrait-container');
    if (!portrait) return;
    portrait.classList.remove('aura-saintly', 'aura-demonic');
    if (state.player.karma >= 50) portrait.classList.add('aura-saintly');
    else if (state.player.karma <= -50) portrait.classList.add('aura-demonic');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    state.screen = screenId;
    updateTopBar();
}

function initGame() {
    if (window.COMPANIONS) {
        window.COMPANIONS.getRoster().forEach(hero => window.COMPANIONS.init(state, hero.id));
        const defaultId = state.player.class === 'Desert Knight' ? 'tariq_ibn_ziyad' : 'sun_wukong';
        window.COMPANIONS.activate(state, defaultId);
    }

    // --- IDLE / OFFLINE PROGRESSION ---
    const now = Date.now();
    if (state.lastLogin) {
        const diffMs = now - state.lastLogin;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= 1) {
            const idleQi = Math.floor(diffHours * 10 * (state.player.lvl || 1));
            state.player.xp += idleQi;
            narrate(`While you were away, you gathered ${idleQi} Qi through passive meditation.`, "System");
        }
    }
    state.lastLogin = now;

    // --- AUCTION HEARTBEAT ---
    setInterval(() => {
        if (state.activeAuction && !state.activeAuction.isClosed) {
            state.activeAuction.timeLeft--;
            if (window.AUCTION) window.AUCTION.processNPCs(state);
            
            if (state.activeAuction.timeLeft <= 0) {
                state.activeAuction.isClosed = true;
                const a = state.activeAuction;
                if (a.highestBidder === state.player.name) {
                    state.player.inventory.items.push({...a.item});
                    narrate(`SOLD! You won the ${a.item.name}!`, "Auction");
                } else {
                    narrate(`SOLD! ${a.highestBidder} won the ${a.item.name}.`, "Auction");
                }
                state.activeAuction = null;
                updateTopBar();
            }
        }
    }, 1000);

    showScreen('story-screen');
    if (window.AUDIO) { window.AUDIO.init(); window.AUDIO.playRegion('crossroads'); }
    clearNarrative();
    calculateTotalStats();
    saveGame();
    narrate("The wind whispers of a Great Convergence. Your path begins now.", "System", null, false, true);
    hubLoop();
}

function hubLoop() {
    state.narrative_node = 'hub';
    state.currentEnemy = null;
    updateTopBar();
    if (window.STORY) {
        const beatId = window.STORY.getNextBeat(state);
        if (beatId) {
            clearNarrative();
            window.STORY.runNode(beatId, state, narrate, setChoices, (result) => {
                if (result === 'combat' && state.pendingCombatEnemy) {
                    const enemy = window.LORE ? window.LORE.getAllEnemies()[state.pendingCombatEnemy] : null;
                    state.pendingCombatEnemy = null;
                    if (enemy) startCombat({ ...enemy, hp: enemy.baseHp, maxHp: enemy.baseHp, atk: enemy.baseAtk });
                    else { narrate("Error: Enemy data missing. Returning to hub.", "System"); hubLoop(); }
                } else { 
                    if (window.QUESTS) window.QUESTS.updateQuests(state);
                    if (window.SKILLS) window.SKILLS.checkUnlocks(state);
                    saveGame(); 
                    hubLoop(); 
                }
            });
            return;
        }
    }
    clearNarrative();
    const comp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
    if (comp) {
        const greeting = window.COMPANIONS.getDialogue(state, state.companion, 'greet');
        if (greeting) narrate(greeting, comp.name, comp.sprite, false);
    }
    narrate(`You stand at the City of Crossroads. The air is thick with spirit-energy.`);
    const choices = [];
    if (typeof showWorldMap === 'function') choices.push({ text: "🗺️ Open World Map", callback: showWorldMap });
    if (typeof showQuestLog === 'function') choices.push({ text: "📜 Mission Board", callback: showQuestLog });
    if (typeof showMarket === 'function') choices.push({ text: "⚖️ Crossroads Market", callback: showMarket });
    if (typeof showAuctionHouse === 'function') choices.push({ text: "🏛️ Sect Auction House", callback: showAuctionHouse });
    if (typeof showSkillTree === 'function') choices.push({ text: "☯️ Martial Techniques", callback: showSkillTree });
    if (typeof showPropertiesScreen === 'function') choices.push({ text: "👤 View Properties", callback: showPropertiesScreen });
    
    if (state.player.lvl >= 10) {
        choices.push({ text: "✨ Hall of Transmigration", callback: showRebirthScreen });
    }
    
    if (typeof showCultivationScreen === 'function') choices.push({ text: "🧘 Cultivate Qi", callback: showCultivationScreen });
    if (typeof showAlchemyScreen === 'function') choices.push({ text: "⚗️ Alchemy Furnace", callback: showAlchemyScreen });
    if (typeof showForgeScreen === 'function') choices.push({ text: "🔨 Spirit Forge", callback: showForgeScreen });
    
    choices.push({ text: "🎒 Inventory & Karma", callback: showInventory });
    choices.push({ text: "🧘 Meditate (Restore)", callback: () => {
        state.player.hp = state.player.maxHp; state.player.mp = state.player.maxMp;
        narrate("Fully restored Essence and Qi.", "System", null, false, true);
        if (window.QUESTS) window.QUESTS.updateQuests(state);
        updateTopBar(); saveGame(); setTimeout(hubLoop, 1500);
    }});
    choices.push({ text: "Manage Companion", callback: showCompanionScreen });
    setChoices(choices);
}

// --- Companion Screen ---
function showCompanionScreen() {
    clearNarrative();
    const available = window.COMPANIONS ? window.COMPANIONS.getAvailable(state) : [];
    narrate(`<b>Companion Roster</b> — Choose who walks beside you.`, "System", null, false, true);
    const choices = available.map(hero => ({
        text: `${hero.id === state.companion ? '✅ ' : ''}${hero.name}`,
        callback: () => {
            window.COMPANIONS.activate(state, hero.id);
            hubLoop();
        }
    }));
    setChoices([...choices, { text: "↩ Return", callback: hubLoop }]);
}

// --- Combat Integration ---
function updateMomentumUI() {
    const bar = document.getElementById('momentum-bar-fill');
    const indicator = document.getElementById('stance-indicator');
    if (!bar) return;
    const mom = state.momentum || 0;
    bar.style.left = mom >= 0 ? '50%' : (50 + mom/2) + '%';
    bar.style.width = Math.abs(mom/2) + '%';
    bar.style.background = mom >= 0 ? 'linear-gradient(90deg, #d4af37, #00a86b)' : 'linear-gradient(90deg, #8a1c1c, #d4af37)';
    const formNames = { water: '🌊 WATER', mountain: '🏔️ MOUNTAIN', wind: '🌪️ WIND' };
    if (indicator) indicator.textContent = 'STANCE: ' + (formNames[state.playerForm] || 'NONE');
    const portrait = document.querySelector('.portrait-container');
    if (portrait) {
        portrait.classList.remove('aura-water', 'aura-mountain', 'aura-wind');
        if (state.currentEnemy) portrait.classList.add(`aura-${state.playerForm}`);
    }
}

function startCombat(enemy) {
    state.currentEnemy = enemy;
    state.momentum = 0; state.playerForm = 'water';
    updateTopBar(); updateMomentumUI();
    narrate(enemy.dialogue || `${enemy.name} challenges you!`, enemy.name, enemy.sprite, true);
    setTimeout(combatLoop, 1500);
}

function combatLoop() {
    if (state.player.hp <= 0) { handleDefeat(); return; }
    if (state.currentEnemy.hp <= 0) { handleVictory(); return; }
    const enemy = state.currentEnemy;
    enemy.nextMove = window.COMBAT ? window.COMBAT.selectEnemyMove(enemy) : 'heavy';
    narrate(window.COMBAT ? window.COMBAT.getTelegraph(enemy, enemy.nextMove) : 'Enemy attacks!', enemy.name, enemy.sprite, true);
    setTimeout(() => {
        const moves = window.COMBAT ? window.COMBAT.getActionsForForm(state.playerForm) : [];
        const choices = moves.map(m => ({
            text: m.name + (m.cost > 0 ? ` (${m.cost} Qi)` : ''),
            callback: () => {
                if (m.cost > (state.player.mp || 0)) {
                    narrate("Not enough Qi for this move!", "System");
                    combatLoop();
                    return;
                }
                if (m.cost > 0) state.player.mp -= m.cost;
                resolveCombatTurn(m.id);
            }
        }));
        
        // Add form switching if it's the start of turn (optional logic expansion)
        choices.push({ text: "🌊 Switch to Water", callback: () => { state.playerForm = 'water'; combatLoop(); }});
        choices.push({ text: "🏔️ Switch to Mountain", callback: () => { state.playerForm = 'mountain'; combatLoop(); }});
        choices.push({ text: "🌪️ Switch to Wind", callback: () => { state.playerForm = 'wind'; combatLoop(); }});
        
        if (enemy.archetype === 'beast') {
            choices.push({ text: "🐾 Attempt Taming", callback: () => resolveCombatTurn('tame') });
        }

        setChoices(choices);
    }, 1000);
}

function resolveCombatTurn(moveId) {
    const enemy = state.currentEnemy;
    const result = window.COMBAT ? window.COMBAT.resolveMove(moveId, enemy.nextMove, state.player.atk, enemy.atk, enemy, state) : { playerDmg: 10, enemyDmg: 5, resultText: 'Clash!' };
    
    // Handle Tamed result
    if (result.special === 'tamed') {
        narrate(result.resultText, "System");
        if (window.PETS) window.PETS.tame(state, enemy.id);
        setTimeout(handleVictory, 1500);
        return;
    }

    enemy.hp = Math.max(0, enemy.hp - result.playerDmg);
    state.player.hp = Math.max(0, state.player.hp - result.enemyDmg);
    state.momentum = Math.max(-100, Math.min(100, (state.momentum || 0) + (result.momentumShift || 0)));
    narrate(result.resultText, 'System', null, false, true);
    updateTopBar(); updateMomentumUI();
    if (result.playerDmg > 0) spawnFloatingText(`-${result.playerDmg}`, window.innerWidth*0.7, window.innerHeight*0.4, 'var(--secondary)');
    if (result.enemyDmg > 0) { spawnFloatingText(`-${result.enemyDmg}`, window.innerWidth*0.3, window.innerHeight*0.4, 'var(--danger)'); triggerScreenShake(); triggerFlash('damage'); }
    if (state.player.hp <= 0) setTimeout(handleDefeat, 1500);
    else if (enemy.hp <= 0) setTimeout(handleVictory, 1500);
    else setTimeout(combatLoop, 2000);
}

function handleVictory() {
    narrate(`Victory!`, 'System');
    const xp = state.currentEnemy.xpReward || 50;
    state.player.xp += xp;
    if (state.player.xp >= state.player.maxXp) { state.player.lvl++; state.player.xp -= state.player.maxXp; state.player.maxXp *= 1.5; calculateTotalStats(); narrate("LEVEL UP!", "System"); }
    state.currentEnemy = null;
    saveGame(); hubLoop();
}

function handleDefeat() {
    narrate("You have fallen.", "System");
    setChoices([{ text: "Restart", callback: () => location.reload() }]);
}

// --- Equipment & Stats Management ---
function calculateTotalStats() {
    const baseAtk = 15 + (state.player.lvl - 1) * 4;
    const baseDef = 5 + (state.player.lvl - 1) * 2;
    const baseMaxHp = 100 + (state.player.lvl - 1) * 20;
    const baseMaxMp = 50 + (state.player.lvl - 1) * 10;
    let bAtk = 0, bDef = 0, bHp = 0, bMp = 0;

    // Faction Benefits
    if (state.player.faction === 'Jade Summit Sect') {
        bAtk += (baseAtk * 0.1 * (state.player.factionRank || 1));
    } else if (state.player.faction === 'Sufi Order of the Empty Quarter') {
        bMp += (baseMaxMp * 0.1 * (state.player.factionRank || 1));
    }

    // Technique Bonuses (Passive Skills)
    if (window.SKILLS) {
        const skillBonuses = window.SKILLS.getPassiveBonuses(state);
        if (skillBonuses.atk) bAtk += baseAtk * skillBonuses.atk;
        if (skillBonuses.mpRegen) { /* Handled in turn recovery */ }
    }

    // Karma Divine Bonuses
    if (state.player.karma >= 50) bHp += baseMaxHp * 0.15; // Saintly HP bonus
    if (state.player.karma <= -50) bAtk += baseAtk * 0.1; // Demonic ATK bonus

    // Legacy (Rebirth) Bonuses
    if (state.legacy) {
        const leg = state.legacy.permanentStats || {};
        bAtk += leg.atk || 0; bDef += leg.def || 0;
        bHp += leg.hp || 0; bMp += leg.mp || 0;

        if (window.REBIRTH) {
            (state.legacy.traits || []).forEach(tId => {
                const trait = window.REBIRTH.traits[tId];
                if (trait && trait.bonus) {
                    if (trait.bonus.hp) bHp += baseMaxHp * trait.bonus.hp;
                    if (trait.bonus.crit) { /* Handled in combat logic if needed */ }
                }
            });
        }
    }

    Object.values(state.player.equipment).forEach(item => {
        if (item && item.stats) {
            bAtk += item.stats.atk || 0; bDef += item.stats.def || 0;
            bHp += item.stats.hp || 0; bMp += item.stats.mp || 0;
        }
    });
    state.player.atk = Math.floor(baseAtk + bAtk);
    state.player.def = Math.floor(baseDef + bDef);
    state.player.maxHp = Math.floor(baseMaxHp + bHp);
    state.player.maxMp = Math.floor(baseMaxMp + bMp);
    state.player.hp = Math.min(state.player.hp, state.player.maxHp);
    state.player.mp = Math.min(state.player.mp, state.player.maxMp);
}

function equipItem(index) {
    const item = state.player.inventory.items[index];
    if (!item || !item.slot) return;
    const old = state.player.equipment[item.slot];
    state.player.equipment[item.slot] = item;
    state.player.inventory.items.splice(index, 1);
    if (old) state.player.inventory.items.push(old);
    calculateTotalStats(); updateTopBar(); saveGame(); showInventory();
}

function unequipItem(slot) {
    const item = state.player.equipment[slot];
    if (!item) return;
    state.player.equipment[slot] = null;
    state.player.inventory.items.push(item);
    calculateTotalStats(); updateTopBar(); saveGame(); showInventory();
}

function showInventory() {
    showScreen('inventory-screen');
    clearNarrative();
    
    const factionBenefit = state.player.faction === 'Jade Summit Sect' ? '+10% ATK' : '+10% Qi';
    const factionText = state.player.faction ? `<br><b>Faction:</b> ${state.player.faction} (Rank ${state.player.factionRank})<br><small style="color:var(--jade)">Benefit: ${factionBenefit} per rank</small>` : '';

    narrate(`<div style="background:rgba(0,0,0,0.5);padding:15px;border-radius:10px;border:1px solid var(--secondary)">
        <b>Cultivator:</b> ${state.player.name} | Lvl ${state.player.lvl}<br>
        <b>Gold:</b> ${state.player.gold} | <b>Karma:</b> ${state.player.karma}${factionText}
    </div>`, "System", null, false, true);
    
    const slots = Object.keys(state.player.equipment);
    let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0;">';
    slots.forEach(s => {
        const item = state.player.equipment[s];
        html += `<div class="inventory-slot" onclick="unequipItem('${s}')" style="height:70px;cursor:pointer;flex-direction:column;border-color:${item?'var(--secondary)':'#333'}">
            <span style="font-size:0.5rem;opacity:0.5;">${s.toUpperCase()}</span>
            <div style="font-size:0.8rem;color:${item?'#fff':'#555'}">${item ? item.name : 'Empty'}</div>
        </div>`;
    });
    html += '</div>';
    narrate(html, "System", null, false, true);
    
    switchSatchelTab('equipment');
    document.getElementById('back-hub-btn').onclick = hubLoop;
}

function switchSatchelTab(tab) {
    const grid = document.getElementById('item-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (tab === 'equipment' || tab === 'consumables') {
        const items = state.player.inventory.items.filter(it => 
            tab === 'equipment' ? it.slot : !it.slot
        );
        
        items.forEach((item, idx) => {
            const realIndex = state.player.inventory.items.indexOf(item);
            const div = document.createElement('div');
            div.className = 'inventory-slot';
            div.style.cssText = 'padding:10px;cursor:pointer;min-width:120px;flex-direction:column;';
            
            if (state.isSelling) {
                const sellPrice = Math.floor((item.price || 50) * 0.5);
                div.innerHTML = `<span style="color:var(--secondary)">SELL: ${item.name}</span><br><small>${sellPrice} Stones</small>`;
                div.onclick = () => {
                    const res = window.SHOP.sell(state, realIndex);
                    narrate(res.message, "System");
                    switchSatchelTab(tab);
                    updateTopBar();
                };
            } else {
                div.innerHTML = `<b>${item.name}</b><br><small>${item.slot || item.type || 'Consumable'}</small>`;
                div.onclick = () => {
                    if (item.slot) equipItem(realIndex);
                    else if (item.effect) {
                        if (item.effect.hp) state.player.hp = Math.min(state.player.maxHp, state.player.hp + item.effect.hp);
                        if (item.effect.mp) state.player.mp = Math.min(state.player.maxMp, state.player.mp + item.effect.mp);
                        state.player.inventory.items.splice(realIndex, 1);
                        narrate(`Used ${item.name}.`, "System");
                        updateTopBar(); switchSatchelTab(tab);
                    }
                };
            }
            grid.appendChild(div);
        });
    } else if (tab === 'materials') {
        Object.entries(state.player.inventory.materials).forEach(([k, v]) => {
            if (v <= 0) return;
            const div = document.createElement('div');
            div.className = 'inventory-slot';
            div.style.padding = '10px';
            div.innerHTML = `${k.replace(/_/g,' ')}: <b>x${v}</b>`;
            grid.appendChild(div);
        });
    }
}
function exportCombatLog() {
    const log = document.getElementById('narrative-window').innerText;
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Legend_Log_${Date.now()}.txt`;
    a.click();
}
