function deepMerge(target, source) {
    if (!source) return target;
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target, source);
    return target;
}

function validateState() {
    // Ensure critical structures exist
    if (!state.player) location.reload(); // Critical failure
    if (!state.player.inventory) state.player.inventory = { items: [], materials: {} };
    if (!state.player.equipment) state.player.equipment = { head: null, body: null, legs: null, boots: null, weapon: null };
    if (!state.player.cultivation) state.player.cultivation = { stage: 'Qi Condensation', stageLevel: 1, cultivationBonuses: { hp: 0, mp: 0, atk: 0, def: 0 } };
    if (!state.player.cultivation.cultivationBonuses) state.player.cultivation.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
    
    // Safety check for currentRegion
    if (window.LORE && window.LORE.REGIONS && !window.LORE.REGIONS[state.player.currentRegion]) {
        console.warn(`Region ${state.player.currentRegion} missing. Resetting to Crossroads.`);
        state.player.currentRegion = 'crossroads';
    }
    
    // Cleanup processing flags
    state._combatLock = false;
    state.isSelling = false;
}

async function loadGameCloud() {
    const saved = localStorage.getItem('legend_rpg_state');
    if (saved) {
        try {
            const loadedState = JSON.parse(saved);
            deepMerge(state, loadedState);
            validateState();
            console.log('Local state loaded and validated.');
            document.getElementById('continue-btn').style.display = 'block';
        } catch (e) { 
            console.error('Failed to parse/validate local save', e); 
            localStorage.removeItem('legend_rpg_state'); // Clear corrupt save
        }
    }

    // Then sync with Supabase for cloud-based persistence
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('game_saves')
                .select('state')
                .eq('player_id', state.playerId)
                .single();
            
            if (data && data.state) {
                deepMerge(state, data.state);
                validateState();
                console.log('Cloud state synchronized.');
                document.getElementById('continue-btn').style.display = 'block';
                return true;
            }
        } catch (e) { console.warn('Cloud sync unavailable', e); }
    }
    return false;
}

function showToast(msg) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'game-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
}

async function saveGame() {
    // Always save locally first
    localStorage.setItem('legend_rpg_state', JSON.stringify(state));
    showToast("Progress Sealed 🕯️");
    
    // Attempt cloud save
    if (supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('game_saves')
                .upsert({ 
                    player_id: state.playerId, 
                    state: state,
                    last_login: new Date().toISOString()
                }, { onConflict: 'player_id' });
            
            if (error) throw error;
            console.log('Cloud save successful.');
        } catch (e) {
            console.error('Cloud save failed:', e.message);
        }
    }
}

// Supabase Configuration
const SUPABASE_URL = 'https://zdgyluzcfcenszqtqkrm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZ3lsdXpjZmNlbnN6cXRxa3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjczNDIsImV4cCI6MjA5MzEwMzM0Mn0.W4h91ashw4TQoWzU5TU8SJhctyv3JG4Veec_lbPIMDE';
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Deep Game State
let heartbeatInterval = null;
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
        critRate: 0.05,
        dodgeRate: 0.05,
        sprite: 'assets/sword_immortal_1778872325571.png',
        karma: 0,
        gold: 50,
        children: 0,
        kills: 0,
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
        currentRegion: 'crossroads',
        cultivation: {
            stage: 'Qi Condensation',
            stageLevel: 1,
            breakthroughReady: false,
            cultivationBonuses: { hp: 0, mp: 0, atk: 0, def: 0 }
        }
    },
    companion: null,
    companions: {},
    relationships: {},
    achievements: [],
    narrative_node: 'womb_start',
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
            state.currentEnemy = null;
            showScreen('story-screen');
            hubLoop();
        });
    }
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
    document.getElementById('continue-btn').addEventListener('click', () => {
        resumeGame();
    });
    
    await loadGameCloud();
});

function resumeGame() {
    console.log("Resuming legend...");
    if (window.AUDIO) { window.AUDIO.init(); window.AUDIO.playRegion('crossroads'); }
    
    // Restore correct screen
    if (state.screen && state.screen !== 'menu') {
        showScreen(state.screen);
    } else {
        showScreen('story-screen');
    }
    
    calculateTotalStats();
    updateTopBar();
    
    // Resume loop
    if (state.currentEnemy) {
        combatLoop();
    } else {
        hubLoop();
    }
    
    narrate("<b>Echoes of the Past</b>: You have returned to your path.", "System", null, false, true);
}

// --- Narrative Engine ---
function parsePerspective(text) {
    if (typeof text !== 'string') return String(text || '');
    if (state.settings?.perspective === 'first') {
        return text.replace(/\bYourself\b/g, 'Myself').replace(/\byourself\b/g, 'myself').replace(/\bYour\b/g, 'My').replace(/\byour\b/g, 'my').replace(/\bYou are\b/g, 'I am').replace(/\byou are\b/g, 'I am').replace(/\bYou\b/g, 'I').replace(/\byou\b/g, 'I');
    }
    return text;
}

function narrate(text, speaker = null, speakerSprite = null, isEnemy = false, isSystem = false, bgImage = null) {
    try {
        const safeText = text || '...';
        
        // Cinematic Mode logic
        if (bgImage) {
            const overlay = document.getElementById('cinematic-overlay');
            const box = document.getElementById('novel-box');
            const spk = document.getElementById('novel-speaker');
            const cnt = document.getElementById('novel-content');
            if (overlay && box && spk && cnt) {
                overlay.style.backgroundImage = `url('${bgImage}')`;
                overlay.classList.add('active');
                spk.textContent = speaker || "???";
                cnt.innerHTML = safeText;
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                return;
            }
        } else {
            const overlay = document.getElementById('cinematic-overlay');
            if (overlay) overlay.classList.remove('active');
        }

        const narrativeWindow = document.getElementById('narrative-window');
        if (!narrativeWindow) {
            console.error("Narrative window missing from DOM.");
            return;
        }

        const block = document.createElement('div');
        block.className = 'narrative-block';
        let contentHtml = '';
        
        if (speakerSprite) {
            const alignClass = isEnemy ? 'enemy-portrait' : '';
            contentHtml += `<img src="${speakerSprite}" class="story-portrait ${alignClass}" alt="${speaker || 'Speaker'}">`;
        }
        
        if (speaker) {
            const color = isEnemy ? 'var(--danger)' : (speaker === 'System' ? 'var(--secondary)' : 'var(--jade)');
            contentHtml += `<span class="narrative-speaker" style="color: ${color};">${speaker}</span>`;
        }
        
        const finalText = isSystem ? safeText : parsePerspective(safeText);
        contentHtml += `<p style="margin: 0; color: ${isSystem ? 'var(--secondary)' : 'var(--text)'};">${finalText}</p>`;
        
        block.innerHTML = contentHtml;
        narrativeWindow.appendChild(block);
        block.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (err) {
        console.error("Narrative Error:", err);
        // Fallback: simple alert or toast if critical
        showToast("The Dao is clouded... (Rendering Error)");
    }
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
    if (!choiceEngine) choiceEngine = document.getElementById('choice-engine');
    if (!choiceEngine) return;

    choiceEngine.innerHTML = '';
    if (!choicesArray || choicesArray.length === 0) return;

    choicesArray.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.id = `choice-btn-${idx}`;
        btn.innerHTML = choice.text;
        btn.onclick = () => {
            if (state._uiLock) return;
            state._uiLock = true;
            choiceEngine.classList.add('ui-locked');
            
            try {
                choiceEngine.innerHTML = ''; 
                if (choice.callback) choice.callback();
            } catch (err) {
                console.error("Choice Callback Error:", err);
                showToast("The Dao flickers... (Interaction Error)");
                setTimeout(() => { 
                    state._uiLock = false; 
                    choiceEngine.classList.remove('ui-locked');
                    hubLoop(); 
                }, 1000);
            } finally {
                setTimeout(() => { 
                    state._uiLock = false; 
                    if (choiceEngine) choiceEngine.classList.remove('ui-locked');
                }, 200);
            }
        };
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

    // --- HEARTBEAT ENGINE ---
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        if (state.activeAuction && !state.activeAuction.isClosed) {
            state.activeAuction.timeLeft--;
            if (window.AUCTION) window.AUCTION.processNPCs(state);
            
            if (state.activeAuction.timeLeft <= 0) {
                state.activeAuction.isClosed = true;
                const a = state.activeAuction;
                if (a.highestBidder === state.player.name) {
                    if (state.player.gold >= a.currentBid) {
                        state.player.gold -= a.currentBid;
                        state.player.inventory.items.push({...a.item});
                        narrate(`SOLD! You won the ${a.item.name} for ${a.currentBid} stones!`, "Auction");
                    } else {
                        narrate(`CRITICAL: You won the auction but lack the stones! The ${a.item.name} is forfeited.`, "Auction");
                    }
                } else {
                    narrate(`SOLD! ${a.highestBidder} won the ${a.item.name}.`, "Auction");
                }
                state.activeAuction = null;
                updateTopBar();
            }
        }
        if (window.SECTS) window.SECTS.process(state);

        // --- DYNAMIC EVENT HEARTBEAT ---
        if (Math.random() < 0.05) {
            const eventType = Math.random() > 0.5 ? 'LIFE' : 'SECT';
            if (eventType === 'LIFE' && window.LIFE && window.LIFE.processRandomEvent) {
                window.LIFE.processRandomEvent(state, narrate);
                if (window.LIFE.processBirth) window.LIFE.processBirth(state, narrate);
            } else if (eventType === 'SECT' && window.SECTS && window.SECTS.processRandomEvent) {
                window.SECTS.processRandomEvent(state, narrate);
            }
        }
    }, 5000); // 5s heartbeat for performance

    showScreen('story-screen');
    if (window.AUDIO) { window.AUDIO.init(); window.AUDIO.playRegion('crossroads'); }
    clearNarrative();
    calculateTotalStats();
    saveGame();
    narrate("The wind whispers of a Great Convergence. Your path begins now.", "System", null, false, true);
    hubLoop();
}

function hubLoop() {
    showScreen('story-screen'); // Ensure we are on the narrative/hub screen
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
    const regionId = state.player.currentRegion || 'crossroads';
    const region = window.LORE && window.LORE.REGIONS ? window.LORE.REGIONS[regionId] : null;
    const regionName = region ? region.name : "Unknown Realm";

    const comp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
    if (comp) {
        const greeting = window.COMPANIONS.getDialogue(state, state.companion, 'greet');
        if (greeting) narrate(greeting, comp.name, comp.sprite, false);
    }

    narrate(`<b style="font-size:1.4em;letter-spacing:2px;color:var(--secondary);">${regionName.toUpperCase()}</b>`, 'System', null, false, true);
    if (region) narrate(`<i style="color:var(--text-dim);">${region.subtitle}</i><br>${region.description}`, 'System', null, false, true);

    const choices = [];
    if (typeof showWorldMap === 'function') choices.push({ text: "🗺️ Open World Map", callback: showWorldMap });
    
    // Exploration
    choices.push({ text: `⚔️ Explore ${regionName}`, callback: () => exploreRegion(regionId) });

    if (regionId === 'crossroads') {
        if (typeof showQuestLog === 'function') choices.push({ text: "📜 Mission Board", callback: showQuestLog });
        if (typeof showMarket === 'function') choices.push({ text: "⚖️ Crossroads Market", callback: showMarket });
        if (typeof showAuctionHouse === 'function') choices.push({ text: "🏛️ Sect Auction House", callback: showAuctionHouse });
        if (typeof showManagementScreen === 'function') choices.push({ text: "👨‍👩‍👧‍👦 Manage Family & Sect", callback: showManagementScreen });
    } else if (regionId === 'jade_peak') {
        choices.push({ text: "🏯 Jade Summit Sect Pagoda", callback: () => narrate("The Sect elders are in deep meditation.", "System") });
        choices.push({ text: "🗡️ Sword Intent Cliff", callback: () => narrate("You feel a sharp intent in the air.", "System") });
    }
    
    if (state.player.lvl >= 10) {
        choices.push({ text: "✨ Hall of Transmigration", callback: showRebirthScreen });
    }
    
    if (state.player.lvl >= 20 && !state.player.isAscended) {
        choices.push({ text: "⚡ Attempt Heavenly Tribulation", callback: () => {
            if (window.ASCENSION) window.ASCENSION.startTribulation(state, narrate, startCombat);
        }});
    }
    
    if (typeof showCultivationScreen === 'function') choices.push({ text: "🧘 Cultivate Qi", callback: showCultivationScreen });
    if (typeof showAlchemyScreen === 'function') choices.push({ text: "⚗️ Alchemy Furnace", callback: showAlchemyScreen });
    if (typeof showForgeScreen === 'function') choices.push({ text: "🔨 Spirit Forge", callback: showForgeScreen });
    
    choices.push({ text: "📜 Martial Library (Skills)", callback: showSkillsScreen });
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
function exploreRegion(regionId) {
    if (!window.LORE || !window.LORE.REGIONS || !window.LORE.REGIONS[regionId]) {
        narrate("This region is lost in the mists of time.", "System");
        hubLoop();
        return;
    }
    const region = window.LORE.REGIONS[regionId];
    state.player.currentRegion = regionId;
    
    // Get enemies using the more robust helper
    const enemies = window.LORE.getRegionEnemies ? window.LORE.getRegionEnemies(regionId) : [];
    
    if (enemies.length === 0) {
        narrate(`You wander the ${region.name}, but the paths are currently quiet. Perhaps you should return later.`, "System");
        setTimeout(hubLoop, 2000);
        return;
    }

    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    const scaledEnemy = {
        ...enemy,
        hp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, region.minLevel || 1) : 1)),
        maxHp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, region.minLevel || 1) : 1)),
        atk: Math.floor(enemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(state.player.lvl, region.minLevel || 1) : 1))
    };

    narrate(`Traveling to ${region.name}...`, "System");
    setTimeout(() => {
        showScreen('story-screen');
        startCombat(scaledEnemy);
    }, 1000);
}

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
    
    // 1. Process turn effects (DOTs, Buffs, Stuns)
    const effectMsg = window.COMBAT ? window.COMBAT.processTurnEffects(state, enemy) : '';
    if (effectMsg) narrate(effectMsg, "System", null, false, true);
    
    if (enemy.hp <= 0) { setTimeout(handleVictory, 1000); return; }

    // 2. Enemy turn (if not stunned)
    if (!state.skipEnemyTurn) {
        enemy.nextMove = window.COMBAT ? window.COMBAT.selectEnemyMove(enemy) : 'heavy';
        narrate(window.COMBAT ? window.COMBAT.getTelegraph(enemy, enemy.nextMove) : 'Enemy attacks!', enemy.name, enemy.sprite, true);
    } else {
        narrate(`${enemy.name} is recovering from the stun...`, "System");
    }

    setTimeout(() => {
        // 3. Player choices
        const moves = window.COMBAT ? window.COMBAT.getActionsForForm(state.playerForm, state) : [];
        const choices = moves.map(m => ({
            text: m.name + (m.cost > 0 ? ` (${m.cost} Qi)` : '') + (m.hpCost ? ` (${Math.floor(state.player.maxHp * m.hpCost)} HP)` : ''),
            callback: () => {
                if (m.cost > (state.player.mp || 0)) { narrate("Not enough Qi!", "System"); combatLoop(); return; }
                if (m.hpCost && (state.player.hp <= Math.floor(state.player.maxHp * m.hpCost))) { narrate("Not enough Life Essence!", "System"); combatLoop(); return; }
                
                if (m.cost > 0) state.player.mp -= m.cost;
                resolveCombatTurn(m.id);
            }
        }));
        
        choices.push({ text: "🌊 Water Form", callback: () => { state.playerForm = 'water'; combatLoop(); }});
        choices.push({ text: "🏔️ Mountain Form", callback: () => { state.playerForm = 'mountain'; combatLoop(); }});
        choices.push({ text: "🌪️ Wind Form", callback: () => { state.playerForm = 'wind'; combatLoop(); }});
        
        if (enemy.archetype === 'beast') choices.push({ text: "🐾 Attempt Taming", callback: () => resolveCombatTurn('tame') });

        setChoices(choices);
    }, 1000);
}

function resolveCombatTurn(moveId) {
    if (state._combatLock) return;
    state._combatLock = true;

    const enemy = state.currentEnemy;
    if (!enemy) { state._combatLock = false; return; }

    const result = window.COMBAT ? window.COMBAT.resolveMove(moveId, enemy.nextMove, state.player.atk, enemy.atk, enemy, state) : { playerDmg: 10, enemyDmg: 5, resultText: 'Clash!' };
    
    // Handle Tamed result
    if (result.special === 'tamed') {
        narrate(result.resultText, "System");
        if (window.PETS) window.PETS.tame(state, enemy.id);
        setTimeout(() => { state._combatLock = false; handleVictory(); }, 1500);
        return;
    }

    enemy.hp = Math.max(0, enemy.hp - (result.playerDmg || 0));
    state.player.hp = Math.max(0, state.player.hp - (result.enemyDmg || 0));
    state.momentum = Math.max(-100, Math.min(100, (state.momentum || 0) + (result.momentumShift || 0)));
    
    narrate(result.resultText, 'System', null, false, true);
    updateTopBar(); updateMomentumUI();
    
    if (result.playerDmg > 0) spawnFloatingText(`-${result.playerDmg}`, window.innerWidth*0.7, window.innerHeight*0.4, 'var(--secondary)');
    if (result.enemyDmg > 0) { 
        spawnFloatingText(`-${result.enemyDmg}`, window.innerWidth*0.3, window.innerHeight*0.4, 'var(--danger)'); 
        triggerScreenShake(); triggerFlash('damage'); 
    }

    if (state.player.hp <= 0) {
        setTimeout(() => { state._combatLock = false; handleDefeat(); }, 1500);
    } else if (enemy.hp <= 0) {
        setTimeout(() => { state._combatLock = false; handleVictory(); }, 1500);
    } else {
        setTimeout(() => { state._combatLock = false; combatLoop(); }, 2000);
    }
}

function handleVictory() {
    const enemy = state.currentEnemy;
    narrate(`Victory! You have defeated ${enemy.name}.`, 'System');
    
    const xpBase = window.BALANCE ? window.BALANCE.xpForEnemy(enemy.minLevel || 1) : 50;
    const bg = state.player.background || {};
    const xpReward = Math.floor(xpBase * (bg.xpMult || 1));
    
    const goldReward = Math.floor((enemy.minLevel || 1) * 10 * (1 + Math.random()));
    
    state.player.xp += xpReward;
    state.player.gold += goldReward;
    
    narrate(`Gained ${xpReward} Qi and found ${goldReward} Spirit Stones.`, "System");

    if (state.player.xp >= state.player.maxXp) { 
        state.player.lvl++; 
        state.player.xp -= state.player.maxXp; 
        state.player.maxXp = Math.floor(state.player.maxXp * (window.BALANCE ? window.BALANCE.xpMultiplier : 2.1)); 
        calculateTotalStats(); 
        narrate("<b>BREAKTHROUGH!</b> Your cultivation has reached a new height.", "System"); 
    }
    
    state.currentEnemy = null;
    saveGame(); 
    setTimeout(hubLoop, 2000);
}

function handleDefeat() {
    narrate("You have fallen.", "System");
    setChoices([{ text: "Restart", callback: () => location.reload() }]);
}

// --- Equipment & Stats Management ---
function calculateTotalStats() {
    if (!state.player) return;

    // 1. Calculate Base Stats from Level
    const level = state.player.lvl || 1;
    const baseAtk = 15 + (level - 1) * 4;
    const baseDef = 5 + (level - 1) * 2;
    const baseMaxHp = 100 + (level - 1) * 20;
    const baseMaxMp = 50 + (level - 1) * 10;
    
    // Accumulators for bonuses
    let bAtk = 0, bDef = 0, bHp = 0, bMp = 0;

    // 2. Permanent Cultivation Bonuses
    const cb = state.player.cultivation?.cultivationBonuses ?? { hp: 0, mp: 0, atk: 0, def: 0 };
    bAtk += cb.atk ?? 0;
    bDef += cb.def ?? 0;
    bHp += cb.hp ?? 0;
    bMp += cb.mp ?? 0;

    // 3. Faction Benefits
    const rank = state.player.factionRank ?? 1;
    if (state.player.faction === 'Jade Summit Sect') {
        bAtk += (baseAtk * 0.1 * rank);
    } else if (state.player.faction === 'Sufi Order of the Empty Quarter') {
        bMp += (baseMaxMp * 0.1 * rank);
    }

    // 4. Technique Bonuses (Safe module access)
    const skillBonuses = window.SKILLS?.getPassiveBonuses?.(state) ?? { atk: 0, def: 0, hpRegen: 0, mpRegen: 0 };
    bAtk += baseAtk * (skillBonuses.atk ?? 0);
    bDef += baseDef * (skillBonuses.def ?? 0);
    state.player.hpRegen = skillBonuses.hpRegen ?? 0;
    state.player.mpRegen = skillBonuses.mpRegen ?? 0;

    // 5. Karma & Legacy
    if ((state.player.karma ?? 0) >= 50) bHp += baseMaxHp * 0.15;
    if ((state.player.karma ?? 0) <= -50) bAtk += baseAtk * 0.1;

    const legacyStats = state.legacy?.permanentStats ?? {};
    bAtk += legacyStats.atk ?? 0;
    bDef += legacyStats.def ?? 0;
    bHp += legacyStats.hp ?? 0;
    bMp += legacyStats.mp ?? 0;

    // 6. External Systems (Pets & Cultivation Methods)
    const petBonus = window.PETS?.getBonuses?.(state) ?? {};
    bAtk += baseAtk * (petBonus.atk ?? 0);
    bDef += baseDef * (petBonus.def ?? 0);
    bHp += petBonus.hp ?? 0;
    bMp += petBonus.mp ?? 0;

    if (state.player.cultivation?.activeMethod && window.CULTIVATION?.methods) {
        const method = window.CULTIVATION.methods[state.player.cultivation.activeMethod];
        if (method?.bonus) {
            bHp += baseMaxHp * (method.bonus.maxHp ?? 0);
            bAtk += baseAtk * (method.bonus.atk ?? 0);
            bDef += baseDef * (method.bonus.def ?? 0);
            state.player.mpRegenBonus = method.bonus.mpRegen ?? 0;
            state.player.xpGainBonus = method.bonus.xpGain ?? 0;
        }
    }

    // 7. Equipment
    Object.values(state.player.equipment ?? {}).forEach(item => {
        const s = item?.stats ?? {};
        bAtk += s.atk ?? 0;
        bDef += s.def ?? 0;
        bHp += s.hp ?? 0;
        bMp += s.mp ?? 0;
    });

    // 8. Life System & Background Traits
    const sys = state.player.system ?? {};
    const bg = state.player.background ?? {};
    
    let totalStatMult = bg.statMult ?? 1;
    let totalHpMult = bg.hpMult ?? 1;

    if (sys.id === 'many_children') {
        const bonus = 1 + ((state.player.children ?? 0) * 0.02);
        totalStatMult *= bonus;
        totalHpMult *= bonus;
    }
    if (sys.id === 'killing') {
        bAtk += Math.floor((state.player.kills ?? 0) / 10);
    }
    if (sys.id === 'sword_saint') {
        totalStatMult *= 1.5;
    }

    // 9. Final Application
    state.player.atk = Math.floor((baseAtk + bAtk) * totalStatMult);
    state.player.def = Math.floor((baseDef + bDef) * totalStatMult);
    state.player.maxHp = Math.floor((baseMaxHp + bHp) * totalHpMult);
    state.player.maxMp = Math.floor(baseMaxMp + bMp);
    
    state.player.hp = Math.min(state.player.hp ?? 0, state.player.maxHp);
    state.player.mp = Math.min(state.player.mp ?? 0, state.player.maxMp);
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
        <b>Spirit Stones:</b> ${state.player.gold} | <b>Karma:</b> ${state.player.karma}${factionText}
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
