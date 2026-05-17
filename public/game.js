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
    if (!state.player.equipment) {
        state.player.equipment = { head: null, body: null, legs: null, boots: null, weapon: null, relic: null };
    } else {
        const requiredSlots = ['head', 'body', 'legs', 'boots', 'weapon', 'relic'];
        requiredSlots.forEach(s => {
            if (state.player.equipment[s] === undefined) {
                state.player.equipment[s] = null;
            }
        });
    }
    if (!state.player.cultivation) state.player.cultivation = { stage: 'Qi Condensation', stageLevel: 1, cultivationBonuses: { hp: 0, mp: 0, atk: 0, def: 0 } };
    if (!state.player.cultivation.cultivationBonuses) state.player.cultivation.cultivationBonuses = { hp: 0, mp: 0, atk: 0, def: 0 };
    
    // Lineage & Family validation
    if (!state.player.family) state.player.family = [];
    if (typeof state.player.children !== 'number') state.player.children = 0;
    if (typeof state.player.kills !== 'number') state.player.kills = 0;
    if (typeof state.player.gold !== 'number' || isNaN(state.player.gold)) state.player.gold = 50;
    if (typeof state.player.karma !== 'number' || isNaN(state.player.karma)) state.player.karma = 0;
    
    // Safety check for currentRegion
    if (window.LORE && window.LORE.REGIONS && !window.LORE.REGIONS[state.player.currentRegion]) {
        console.warn(`Region ${state.player.currentRegion} missing. Resetting to Crossroads.`);
        state.player.currentRegion = 'crossroads';
    }

    if (!state.unlockedRegions) state.unlockedRegions = ['crossroads'];
    if (window.LORE && window.LORE.REGIONS) {
        state.unlockedRegions.forEach(rId => {
            if (window.LORE.REGIONS[rId]) {
                window.LORE.REGIONS[rId].unlocked = true;
            }
        });
    }

    if (!state.activeQuests) state.activeQuests = ['main_01'];
    if (!state.completedQuests) state.completedQuests = [];
    
    // Cleanup processing flags
    state._combatLock = false;
    state._uiLock = false;
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
    unlockedRegions: ['crossroads'],
    narrative_node: 'womb_start',
    storyFlags: {},
    currentEnemy: null,
    combatState: null,
    exploreStreak: 0
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

// Typewriter Animation State
let currentTypewriteInterval = null;
let currentTypewriteResolve = null;

function typewriteText(containerElement, textHtml, speed = 8, callback = null) {
    if (currentTypewriteInterval) {
        clearInterval(currentTypewriteInterval);
        currentTypewriteInterval = null;
    }
    if (currentTypewriteResolve) {
        currentTypewriteResolve();
        currentTypewriteResolve = null;
    }

    // Separate HTML tags from text characters so tags render instantly
    const tokens = [];
    let i = 0;
    while (i < textHtml.length) {
        if (textHtml[i] === '<') {
            let tag = '';
            while (i < textHtml.length && textHtml[i] !== '>') {
                tag += textHtml[i];
                i++;
            }
            if (i < textHtml.length) {
                tag += '>';
                i++;
            }
            tokens.push({ type: 'tag', content: tag });
        } else {
            tokens.push({ type: 'text', content: textHtml[i] });
            i++;
        }
    }

    containerElement.innerHTML = '';
    let tokenIndex = 0;

    // Skip typing on click to let impatient players read quickly
    const skipTyping = () => {
        if (currentTypewriteInterval) {
            clearInterval(currentTypewriteInterval);
            currentTypewriteInterval = null;
            containerElement.innerHTML = textHtml;
            document.removeEventListener('click', skipTyping);
            if (callback) callback();
        }
    };
    
    document.addEventListener('click', skipTyping);

    currentTypewriteInterval = setInterval(() => {
        if (tokenIndex >= tokens.length) {
            clearInterval(currentTypewriteInterval);
            currentTypewriteInterval = null;
            document.removeEventListener('click', skipTyping);
            if (callback) callback();
            return;
        }

        while (tokenIndex < tokens.length && tokens[tokenIndex].type === 'tag') {
            containerElement.innerHTML += tokens[tokenIndex].content;
            tokenIndex++;
        }

        if (tokenIndex < tokens.length) {
            containerElement.innerHTML += tokens[tokenIndex].content;
            
            // Subtle sound click every 4 characters to feel premium
            if (tokenIndex % 4 === 0 && window.AUDIO) {
                window.AUDIO.playEffect('menu_click');
            }
            tokenIndex++;
        }
    }, speed);
}

function narrate(text, speaker = null, speakerSprite = null, isEnemy = false, isSystem = false, bgImage = null) {
    try {
        const safeText = text || '...';
        
        // Cinematic Novel Mode logic
        if (bgImage) {
            const overlay = document.getElementById('cinematic-overlay');
            const box = document.getElementById('novel-box');
            const spk = document.getElementById('novel-speaker');
            const cnt = document.getElementById('novel-content');
            if (overlay && box && spk && cnt) {
                overlay.style.backgroundImage = `url('${bgImage}')`;
                overlay.classList.add('active');
                spk.textContent = speaker || "???";
                
                // Animate text typing
                typewriteText(cnt, safeText, 12);
                
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                return;
            }
        } else {
            const overlay = document.getElementById('cinematic-overlay');
            if (overlay) overlay.classList.remove('active');
            
            // Restore active screen so that standard game screen shows if all were hidden
            const activeScreenExists = Array.from(document.querySelectorAll('.screen')).some(s => s.classList.contains('active'));
            if (!activeScreenExists) {
                const storyScreen = document.getElementById('story-screen');
                if (storyScreen) storyScreen.classList.add('active');
            }
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
        const paragraphId = 'narrative-text-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        contentHtml += `<p id="${paragraphId}" style="margin: 0; color: ${isSystem ? 'var(--secondary)' : 'var(--text)'};"></p>`;
        
        block.innerHTML = contentHtml;
        narrativeWindow.appendChild(block);
        
        const pElement = document.getElementById(paragraphId);
        if (pElement) {
            typewriteText(pElement, finalText, 6, () => {
                block.scrollIntoView({ behavior: 'smooth', block: 'end' });
            });
        }
        block.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (err) {
        console.error("Narrative Error:", err);
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
    if (screen) {
        screen.classList.add('screen-shake');
        setTimeout(() => screen.classList.remove('screen-shake'), 400);
    }
}
function triggerFlash(type = 'damage') {
    const activeScreen = document.querySelector('.screen.active') || document.getElementById('game-container');
    if (!activeScreen) return;
    const flash = document.createElement('div');
    flash.className = (type === 'jade' || type === 'heal') ? 'screen-flash-jade' : 'screen-flash-white';
    activeScreen.appendChild(flash);
    setTimeout(() => flash.remove(), 800);
}
function triggerActTransition(title, desc, onComplete) {
    const overlay = document.getElementById('act-transition-overlay');
    const titleEl = document.getElementById('act-transition-title');
    const descEl = document.getElementById('act-transition-desc');
    const bar = document.getElementById('act-transition-progress-bar');
    
    if (!overlay || !titleEl || !descEl || !bar) {
        if (onComplete) onComplete();
        return;
    }
    
    if (window.AUDIO) {
        window.AUDIO.playEffect('level_up');
    }
    
    titleEl.textContent = title;
    descEl.textContent = desc;
    bar.style.width = '0%';
    overlay.classList.add('active');
    
    setTimeout(() => {
        bar.style.width = '100%';
    }, 150);
    
    setTimeout(() => {
        overlay.classList.remove('active');
        if (onComplete) onComplete();
    }, 2800);
}
function clearNarrative() {
    const narrativeWindow = document.getElementById('narrative-window');
    if (narrativeWindow) narrativeWindow.innerHTML = '';
}
function setChoices(choicesArray) {
    if (!choiceEngine) choiceEngine = document.getElementById('choice-engine');
    if (!choiceEngine) return;

    choiceEngine.innerHTML = '';
    
    // Clear cinematic novel box choices if any exist
    const novelBox = document.getElementById('novel-box');
    const existingNovelChoices = document.getElementById('novel-choices');
    if (existingNovelChoices) existingNovelChoices.remove();

    if (!choicesArray || choicesArray.length === 0) return;

    const overlay = document.getElementById('cinematic-overlay');
    const isCinematic = overlay && overlay.classList.contains('active');

    let targetContainer = choiceEngine;

    if (isCinematic && novelBox) {
        const div = document.createElement('div');
        div.id = 'novel-choices';
        div.className = 'actions';
        div.style.cssText = 'margin-top: 20px; display: flex; flex-direction: column; gap: 10px; width: 100%;';
        novelBox.appendChild(div);
        targetContainer = div;
    }

    const isCombat = !!state.currentEnemy && !isCinematic;
    const isHub = state.narrative_node === 'hub' && !isCinematic;
    if (isCombat) {
        targetContainer.classList.add('combat-choice-grid');
        targetContainer.classList.remove('hub-choice-grid');
    } else if (isHub) {
        targetContainer.classList.add('hub-choice-grid');
        targetContainer.classList.remove('combat-choice-grid');
    } else {
        targetContainer.classList.remove('combat-choice-grid');
        targetContainer.classList.remove('hub-choice-grid');
    }

    choicesArray.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.id = `choice-btn-${idx}`;
        btn.innerHTML = choice.text;

        if (isCombat) {
            const txt = choice.text.toLowerCase();
            if (txt.includes('form') || txt.includes('taming') || txt.includes('tame')) {
                btn.setAttribute('data-type', 'form');
            } else {
                btn.setAttribute('data-type', 'attack');
            }
        }

        btn.onclick = () => {
            if (state._uiLock) return;
            state._uiLock = true;
            targetContainer.classList.add('ui-locked');
            if (window.AUDIO) window.AUDIO.playEffect('menu_click');
            
            try {
                targetContainer.innerHTML = ''; 
                const overlayNow = document.getElementById('cinematic-overlay');
                const isCinematicNow = overlayNow && overlayNow.classList.contains('active');
                if (!isCinematicNow) {
                    const novelChoices = document.getElementById('novel-choices');
                    if (novelChoices) novelChoices.remove();
                }
                if (choice.callback) choice.callback();
            } catch (err) {
                console.error("Choice Callback Error:", err);
                showToast("The Dao flickers... (Interaction Error)");
                setTimeout(() => { 
                    state._uiLock = false; 
                    targetContainer.classList.remove('ui-locked');
                    hubLoop(); 
                }, 1000);
            } finally {
                setTimeout(() => { 
                    state._uiLock = false; 
                    if (targetContainer) targetContainer.classList.remove('ui-locked');
                }, 200);
            }
        };
        targetContainer.appendChild(btn);
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
    const scr = document.getElementById(screenId);
    if (!scr) {
        console.warn(`Screen ${screenId} not found in DOM! Fallback to story-screen.`);
        showScreen('story-screen');
        return;
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    scr.classList.add('active');
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

    if (typeof updateHubStoryProgress === 'function') {
        updateHubStoryProgress(state);
    }

    if (window.STORY) {
        if (typeof window.STORY.validateCurrentState === 'function') {
            window.STORY.validateCurrentState(state);
        }

        // Check for Act Transitions
        const flags = state.storyFlags || {};
        if (flags['act5_started'] && !flags['act5_transition_shown']) {
            flags['act5_transition_shown'] = true;
            saveGame();
            triggerActTransition("ACT V: THE GREAT CONVERGENCE", "The final barrier shatters. Ascend, conquer, or walk the balanced path.", () => hubLoop());
            return;
        }
        if (flags['act4_started'] && !flags['act4_transition_shown']) {
            flags['act4_transition_shown'] = true;
            saveGame();
            triggerActTransition("ACT IV: SIEGE OF CROSSROADS", "Hold the gates. Secure the Silk Road from the wrath of the rogue sects.", () => hubLoop());
            return;
        }
        if (flags['act3_started'] && !flags['act3_transition_shown']) {
            flags['act3_transition_shown'] = true;
            saveGame();
            triggerActTransition("ACT III: THE MIRROR OF MEMORY", "Unveil the ancient path of the Fallen Immortal and your true origins.", () => hubLoop());
            return;
        }
        if (flags['act2_started'] && !flags['act2_transition_shown']) {
            flags['act2_transition_shown'] = true;
            saveGame();
            triggerActTransition("ACT II: CELESTIAL STRIFE", "Sufi and Jade gather like thunderclouds over the high pass.", () => hubLoop());
            return;
        }

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
    
    // Xianxia 6-piece Set: Immortal Ascension HP Heal
    if (state.player.immortalAscensionActive && state.player.hp < state.player.maxHp) {
        const healAmt = 5;
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmt);
        narrate(`<span style="color:var(--jade); font-weight:bold;">✨ Immortal Ascension:</span> Restored <b>${healAmt} HP</b> at the start of the turn.`, "System");
        updateTopBar();
        triggerFlash('heal');
    }
    
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
        const choices = moves.map(m => {
            let actualCost = m.cost;
            if (state.player.supremeMantraActive && actualCost > 0) {
                actualCost = Math.max(1, Math.floor(actualCost * 0.8));
            }
            return {
                text: m.name + (actualCost > 0 ? ` (${actualCost} Qi)` : '') + (m.hpCost ? ` (${Math.floor(state.player.maxHp * m.hpCost)} HP)` : ''),
                callback: () => {
                    if (actualCost > (state.player.mp || 0)) { narrate("Not enough Qi!", "System"); combatLoop(); return; }
                    if (m.hpCost && (state.player.hp <= Math.floor(state.player.maxHp * m.hpCost))) { narrate("Not enough Life Essence!", "System"); combatLoop(); return; }
                    
                    if (actualCost > 0) state.player.mp -= actualCost;
                    resolveCombatTurn(m.id);
                }
            };
        });
        
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

    // Mythology 6-piece Set: Supreme Sovereign Life-steal
    if (state.player.supremeSovereignActive && (result.playerDmg || 0) > 0 && state.player.hp < state.player.maxHp) {
        const stealAmt = Math.max(1, Math.floor(result.playerDmg * 0.15));
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + stealAmt);
        result.resultText += `<br><span style="color:var(--danger); font-weight:bold;">👑 Supreme Sovereign:</span> Stole <b>${stealAmt} HP</b> from ${enemy.name}'s life force.`;
        updateTopBar();
        triggerFlash('heal');
    }

    enemy.hp = Math.max(0, enemy.hp - (result.playerDmg || 0));
    state.player.hp = Math.max(0, state.player.hp - (result.enemyDmg || 0));
    state.momentum = Math.max(-100, Math.min(100, (state.momentum || 0) + (result.momentumShift || 0)));
    
    narrate(result.resultText, 'System', null, false, true);
    updateTopBar(); updateMomentumUI();
    
    // Play procedural combat audio
    if (window.AUDIO) {
        if ((result.playerDmg || 0) > 0 || (result.enemyDmg || 0) > 0) {
            window.AUDIO.playEffect('combat_hit');
        } else {
            window.AUDIO.playEffect('combat_block');
        }
    }
    
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
    
    // Check if this was a breakthrough Heavenly Tribulation
    if (state._pendingBreakthroughStage && window.CULTIVATION) {
        const msg = window.CULTIVATION.completeBreakthrough(state, state._pendingBreakthroughStage);
        state._pendingBreakthroughStage = null;
        narrate(msg, "System", null, false, true);
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
        calculateTotalStats();
        updateTopBar();
    }
    
    if (typeof state.exploreStreak !== 'number') state.exploreStreak = 0;
    const streakMult = 1 + (state.exploreStreak * 0.05);
    
    const xpBase = window.BALANCE ? window.BALANCE.xpForEnemy(enemy.minLevel || 1) : 50;
    const bg = state.player.background || {};
    const xpReward = Math.floor(xpBase * (bg.xpMult || 1) * streakMult);
    
    const goldReward = Math.floor((enemy.minLevel || 1) * 10 * (1 + Math.random()) * streakMult);
    
    state.player.xp += xpReward;
    state.player.gold += goldReward;
    
    let victoryMsg = `<div style="background:rgba(0,229,160,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); margin-bottom:15px; text-align:left;">
        <b style="color:var(--jade); font-size:1.15rem; letter-spacing:1px; font-family:'Cinzel';">🏆 COMBAT VICTORY</b><br>
        ${state.exploreStreak > 0 ? `<small style="color:var(--secondary)">🔥 Exploration Streak: ${state.exploreStreak} (+${Math.round(state.exploreStreak * 5)}% Bonus)</small><br>` : ''}<br>
        Gained <b>${xpReward} XP</b> and <b>${goldReward} Spirit Stones</b>.
    `;

    // --- Dynamic Crafting Materials Drop ---
    if (Math.random() < 0.6) {
        let matId = 'spirit_herb';
        const lvl = state.player.lvl || 1;
        if (lvl <= 5) {
            matId = Math.random() < 0.5 ? 'spirit_herb' : 'iron_ore';
        } else if (lvl <= 12) {
            const r = Math.random();
            matId = r < 0.4 ? 'monster_core' : (r < 0.7 ? 'spirit_herb' : 'iron_ore');
        } else if (lvl <= 20) {
            const r = Math.random();
            matId = r < 0.4 ? 'dragon_vein_shard' : (r < 0.7 ? 'monster_core' : 'spirit_herb');
        } else {
            const r = Math.random();
            matId = r < 0.4 ? 'celestial_silk' : (r < 0.75 ? 'dragon_vein_shard' : 'monster_core');
        }

        if (!state.player.inventory.materials) state.player.inventory.materials = {};
        state.player.inventory.materials[matId] = (state.player.inventory.materials[matId] || 0) + 1;
        
        const matName = matId.replace(/_/g, ' ').toUpperCase();
        victoryMsg += `<br><span style="color:var(--secondary)">🎁 Found Material:</span> <b class="loot-refined">${matName}</b> (Added to satchel)`;
    }

    // --- Dynamic Equipment Drop ---
    if (Math.random() < 0.35 && window.EQUIPMENT_DATA) {
        const eligible = Object.values(window.EQUIPMENT_DATA).filter(item => (item.reqLevel || 1) <= (state.player.lvl || 1));
        if (eligible.length > 0) {
            const proto = eligible[Math.floor(Math.random() * eligible.length)];
            const newItem = {
                ...proto,
                id: `${proto.id}_${Date.now()}`
            };
            if (!state.player.inventory.items) state.player.inventory.items = [];
            state.player.inventory.items.push(newItem);
            
            const qClass = `loot-${proto.quality.toLowerCase()}`;
            victoryMsg += `<br><span style="color:var(--secondary)">🗡️ Found Equipment:</span> <b class="${qClass}">[${proto.quality}] ${proto.name}</b> (Equippable)`;
        }
    }

    victoryMsg += `</div>`;
    narrate(victoryMsg, "System", null, false, true);

    if (state.player.xp >= state.player.maxXp) { 
        state.player.lvl++; 
        state.player.xp -= state.player.maxXp; 
        state.player.maxXp = Math.floor(state.player.maxXp * (window.BALANCE ? window.BALANCE.xpMultiplier : 2.1)); 
        calculateTotalStats(); 
        narrate("<span class='loot-epic'><b>🌟 BREAKTHROUGH!</b> Your cultivation has reached a new height.</span>", "System", null, false, true); 
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
    }
    
    state.exploreStreak++;
    state.currentEnemy = null;
    saveGame(); 
    
    const activeRegion = state.player.currentRegion || 'crossroads';
    setChoices([
        { text: `⚔️ Venture Deeper (+${state.exploreStreak * 5}% Bonus)`, callback: () => exploreRegion(activeRegion) },
        { text: "↩ Return to Crossroads", callback: () => {
            state.exploreStreak = 0;
            hubLoop();
        } }
    ]);
}

function handleDefeat() {
    state.exploreStreak = 0;
    const goldPenalty = Math.floor((state.player.gold || 0) * 0.2);
    state.player.gold = Math.max(0, (state.player.gold || 0) - goldPenalty);
    
    // Revive player at 50% HP/MP to enable immediate recovery and exploration
    state.player.hp = Math.floor(state.player.maxHp * 0.5);
    state.player.mp = Math.floor(state.player.maxMp * 0.5);
    
    state.currentEnemy = null;
    saveGame();
    
    narrate(`<b>DEFEAT!</b> You have been defeated by the enemy. A wandering Taoist hermit discovered your unconscious body and dragged you back to the City of Crossroads.<br><br><b>Penalty:</b> Lost <span style="color:var(--secondary)">${goldPenalty} Spirit Stones</span>. You have been revived at half Essence.`, "System");
    
    setChoices([{ text: "Stand up and continue", callback: hubLoop }]);
}

// --- Equipment & Stats Management ---
function getEquippedSetCounts(state) {
    const counts = { xianxia: 0, vedic: 0, silk_road: 0, mythology: 0 };
    if (!state.player || !state.player.equipment) return counts;
    Object.values(state.player.equipment).forEach(item => {
        if (item && item.set && counts[item.set] !== undefined) {
            counts[item.set]++;
        }
    });
    return counts;
}

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

    // Class-specific base bonuses
    const cls = state.player.class;
    if (cls === 'Sword Immortal') {
        bAtk += 5;
    } else if (cls === 'Medicine Cultivator') {
        bHp += 30;
    } else if (cls === 'Sufi Mystic') {
        bMp += 20;
    } else if (cls === 'Desert Knight') {
        bDef += 5;
        bHp += 15;
    }

    // Womb Gift bonuses
    const gift = state.player.wombGift || state._wombGift;
    if (gift === 'Strength') {
        bAtk += 10;
    } else if (gift === 'Vitality') {
        bHp += 50;
    } else if (gift === 'Spirituality') {
        bMp += 30;
    }

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

    // 7. Set Bonuses Scanner
    const setCounts = getEquippedSetCounts(state);
    
    // Set multipliers
    let eqAtkMult = 1;
    let eqDefMult = 1;
    let eqHpMult = 1;
    let eqMpMult = 1;

    // Xianxia Set: Focus ATK / DEF
    if (setCounts.xianxia >= 6) {
        eqAtkMult += 0.40;
        eqDefMult += 0.30;
        state.player.immortalAscensionActive = true;
    } else if (setCounts.xianxia >= 4) {
        eqAtkMult += 0.20;
        eqDefMult += 0.15;
        state.player.immortalAscensionActive = false;
    } else if (setCounts.xianxia >= 2) {
        eqAtkMult += 0.10;
        eqDefMult += 0.05;
        state.player.immortalAscensionActive = false;
    } else {
        state.player.immortalAscensionActive = false;
    }

    // Vedic Set: Focus ATK / HP
    if (setCounts.vedic >= 6) {
        eqAtkMult += 0.35;
        eqHpMult += 0.35;
        state.player.supremeMantraActive = true;
    } else if (setCounts.vedic >= 4) {
        eqAtkMult += 0.20;
        eqHpMult += 0.20;
        state.player.supremeMantraActive = false;
    } else if (setCounts.vedic >= 2) {
        eqAtkMult += 0.10;
        eqHpMult += 0.10;
        state.player.supremeMantraActive = false;
    } else {
        state.player.supremeMantraActive = false;
    }

    // Silk Road Set: Focus HP / MP
    if (setCounts.silk_road >= 6) {
        eqHpMult += 0.40;
        eqMpMult += 0.40;
        state.player.silkOasisActive = true;
    } else if (setCounts.silk_road >= 4) {
        eqHpMult += 0.20;
        eqMpMult += 0.20;
        state.player.silkOasisActive = false;
    } else if (setCounts.silk_road >= 2) {
        eqHpMult += 0.10;
        eqMpMult += 0.10;
        state.player.silkOasisActive = false;
    } else {
        state.player.silkOasisActive = false;
    }

    // Mythology Set: Focus ATK / DEF
    if (setCounts.mythology >= 6) {
        eqAtkMult += 0.50;
        eqDefMult += 0.40;
        state.player.supremeSovereignActive = true;
    } else if (setCounts.mythology >= 4) {
        eqAtkMult += 0.30;
        eqDefMult += 0.20;
        state.player.supremeSovereignActive = false;
    } else if (setCounts.mythology >= 2) {
        eqAtkMult += 0.15;
        eqDefMult += 0.10;
        state.player.supremeSovereignActive = false;
    } else {
        state.player.supremeSovereignActive = false;
    }

    // 8. Individual Equipment Flat Stats
    Object.values(state.player.equipment ?? {}).forEach(item => {
        const s = item?.stats ?? {};
        bAtk += s.atk ?? 0;
        bDef += s.def ?? 0;
        bHp += s.hp ?? 0;
        bMp += s.mp ?? 0;
    });

    // 9. Life System & Background Traits
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

    // 10. Final Application
    state.player.atk = Math.floor((baseAtk + bAtk) * totalStatMult * eqAtkMult);
    state.player.def = Math.floor((baseDef + bDef) * totalStatMult * eqDefMult);
    state.player.maxHp = Math.floor((baseMaxHp + bHp) * totalHpMult * eqHpMult);
    state.player.maxMp = Math.floor((baseMaxMp + bMp) * eqMpMult);
    
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

function updateEquipmentDOM(state) {
    if (!state.player || !state.player.equipment) return;
    
    const slots = ['head', 'body', 'legs', 'boots', 'weapon', 'relic'];
    slots.forEach(s => {
        const item = state.player.equipment[s];
        const nameEl = document.getElementById(`eq-${s}-name`);
        const statsEl = document.getElementById(`eq-${s}-stats`);
        
        if (nameEl) {
            nameEl.textContent = item ? item.name : 'None';
            if (item && item.quality) {
                const qClass = `loot-${item.quality.toLowerCase()}`;
                nameEl.className = qClass;
                // Add badge if part of set
                if (item.set) {
                    nameEl.innerHTML += ` <span style="font-size:0.65rem; padding: 2px 4px; background: rgba(212,175,55,0.15); border: 1px solid var(--secondary); border-radius: 4px; color: var(--secondary); margin-left: 5px;">${item.set.toUpperCase()}</span>`;
                }
            } else {
                nameEl.className = '';
                nameEl.style.color = 'var(--text-dim)';
            }
        }
        if (statsEl) {
            if (item && item.stats) {
                let statText = [];
                if (item.stats.atk) statText.push(`+${item.stats.atk} ATK`);
                if (item.stats.def) statText.push(`+${item.stats.def} DEF`);
                if (item.stats.hp) statText.push(`+${item.stats.hp} HP`);
                if (item.stats.mp) statText.push(`+${item.stats.mp} MP`);
                statsEl.textContent = statText.join(', ');
            } else {
                statsEl.textContent = '';
            }
        }
    });

    // Populate active set bonuses
    const activeSetEl = document.getElementById('active-set-bonuses');
    if (activeSetEl) {
        const counts = getEquippedSetCounts(state);
        let bonusHtml = '';
        
        const setDetails = {
            xianxia: {
                name: 'Immortal Ascension (Xianxia)',
                color: 'var(--jade)',
                effects: {
                    2: '+10% ATK, +5% DEF',
                    4: '+20% ATK, +15% DEF',
                    6: '⚔️ <b>Immortal Ascension</b>: +40% ATK, +30% DEF, and auto-heals 5 HP at start of each combat round!'
                }
            },
            vedic: {
                name: 'Supreme Mantra (Vedic)',
                color: '#d4af37',
                effects: {
                    2: '+10% ATK, +10% HP',
                    4: '+20% ATK, +20% HP',
                    6: '🕉️ <b>Supreme Mantra</b>: +35% ATK, +35% HP, and reduces active skill MP costs by 20%!'
                }
            },
            silk_road: {
                name: 'Silk Oasis (Silk Road)',
                color: 'var(--secondary)',
                effects: {
                    2: '+10% HP, +10% MP',
                    4: '+20% HP, +20% MP',
                    6: '🐪 <b>Silk Oasis</b>: +40% HP, +40% MP, and boosts all experience gains by 25%!'
                }
            },
            mythology: {
                name: 'Supreme Sovereign (Mythology)',
                color: 'var(--danger)',
                effects: {
                    2: '+15% ATK, +10% DEF',
                    4: '+30% ATK, +20% DEF',
                    6: '👑 <b>Supreme Sovereign</b>: +50% ATK, +40% DEF, and grants 15% life-steal on all combat hits!'
                }
            }
        };

        let hasAnyBonus = false;
        Object.entries(counts).forEach(([setKey, count]) => {
            if (count >= 2) {
                hasAnyBonus = true;
                const details = setDetails[setKey];
                let currentBonusText = '';
                if (count >= 6) currentBonusText = details.effects[6];
                else if (count >= 4) currentBonusText = details.effects[4];
                else currentBonusText = details.effects[2];

                bonusHtml += `<div style="margin-bottom: 8px; padding: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <span style="color:${details.color}; font-weight:bold;">${details.name} [${count}/6]</span><br>
                    <span style="color:#fff; font-size:0.75rem;">${currentBonusText}</span>
                </div>`;
            }
        });

        if (!hasAnyBonus) {
            bonusHtml = `<div style="text-align:center; color:var(--text-dim); padding:10px 0;">None. Equip matching set pieces to unlock bonuses.</div>`;
        }
        
        activeSetEl.innerHTML = bonusHtml;
    }
}

window.unequipItemSlot = function(slot) {
    unequipItem(slot);
};

function showInventory() {
    showScreen('inventory-screen');
    clearNarrative();
    
    // Dynamically update the visual equipment panel slots and set bonuses
    updateEquipmentDOM(state);
    
    const factionBenefit = state.player.faction === 'Jade Summit Sect' ? '+10% ATK' : '+10% Qi';
    const factionText = state.player.faction ? `<br><b>Faction:</b> ${state.player.faction} (Rank ${state.player.factionRank})<br><small style="color:var(--jade)">Benefit: ${factionBenefit} per rank</small>` : '';

    narrate(`<div style="background:rgba(0,0,0,0.5);padding:15px;border-radius:10px;border:1px solid var(--secondary)">
        <b>Cultivator:</b> ${state.player.name} | Lvl ${state.player.lvl}<br>
        <b>Spirit Stones:</b> ${state.player.gold} | <b>Karma:</b> ${state.player.karma}${factionText}
    </div>`, "System", null, false, true);
    
    const slots = Object.keys(state.player.equipment).filter(s => ['head', 'body', 'legs', 'boots', 'weapon', 'relic'].includes(s));
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:15px 0;">';
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
