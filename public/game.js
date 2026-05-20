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
        console.warn(`المنطقة ${state.player.currentRegion} مفقودة. إعادة الضبط لواحة التقاطع.`);
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
            
            if (error) {
                const errMsg = error.message || '';
                if (errMsg.includes('schema cache') || error.code === 'PGRST116' || errMsg.includes('relation "game_saves" does not exist')) {
                    console.warn(
                        "⚠️ [Supabase DB Warning] 'game_saves' table not found in schema cache. " +
                        "Please run 'supabase_setup.sql' in your Supabase SQL Editor. Game will save locally using localStorage.",
                        errMsg
                    );
                } else {
                    console.warn('Cloud load sync error:', errMsg);
                }
            } else if (data && data.state) {
                deepMerge(state, data.state);
                validateState();
                console.log('Cloud state synchronized.');
                document.getElementById('continue-btn').style.display = 'block';
                return true;
            }
        } catch (e) { 
            console.warn('Cloud sync unavailable during load', e); 
        }
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
    showToast("تم حفظ وختم تقدمك بنجاح! 🕯️");
    
    // Attempt cloud save
    if (supabaseClient) {
        try {
            const saveData = { 
                player_id: state.playerId, 
                state: state,
                last_login: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };
            
            const { error } = await supabaseClient
                .from('game_saves')
                .upsert(saveData, { onConflict: 'player_id' });
            
            if (error) {
                const errMsg = error.message || '';
                // Check if it's the schema cache / missing relation issue
                if (errMsg.includes('schema cache') || error.code === 'PGRST116' || errMsg.includes('relation "game_saves" does not exist')) {
                    console.warn(
                        "⚠️ [Supabase DB Warning] 'game_saves' table not found in schema cache. " +
                        "Save succeeded locally, but cloud sync is pending. To activate cloud saving, please execute the SQL setup " +
                        "code in 'supabase_setup.sql' in your Supabase SQL Editor.", 
                        errMsg
                    );
                    return;
                }
                // Check if it's a field mismatch error (if they created table without last_login or last_updated)
                if (errMsg.includes('column') && (errMsg.includes('last_login') || errMsg.includes('last_updated'))) {
                    console.warn("⚠️ Column mismatch detected. Retrying cloud save with a minimal column set...");
                    // Retry with a minimal schema payload (just player_id and state, which are guaranteed to always exist)
                    const { error: retryError } = await supabaseClient
                        .from('game_saves')
                        .upsert({
                            player_id: state.playerId,
                            state: state
                        }, { onConflict: 'player_id' });
                    if (retryError) throw retryError;
                    console.log('Cloud save successful after column fallback retry.');
                    return;
                }
                throw error;
            }
            console.log('Cloud save successful.');
        } catch (e) {
            const errStr = e.message || String(e);
            if (errStr.includes('schema cache') || errStr.includes('does not exist') || errStr.includes('table')) {
                console.warn(
                    "⚠️ [Supabase DB Warning] 'game_saves' table not found on Supabase. " +
                    "Game saved successfully in your browser's LocalStorage. To enable cloud saves, run supabase_setup.sql in your Supabase SQL console.",
                    errStr
                );
            } else {
                console.error('Cloud save failed:', errStr);
            }
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
        name: 'البطل الفارس',
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

window.state = state;

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
    showScreen('menu-screen');
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
                
                // Clear default starting gear to avoid conflicts
                state.player.equipment = { head: null, body: null, legs: null, boots: null, weapon: null, relic: null };
                state.player.inventory.items = [];

                if (state.player.class === 'Sword Immortal') {
                    // خالد السيف الأسطوري: High Offense, Crit-focused
                    state.player.atk = 25;
                    state.player.def = 8;
                    state.player.maxHp = 200; // Doubled
                    state.player.hp = 200;
                    state.player.maxMp = 80;
                    state.player.mp = 80;
                    state.player.critRate = 0.15;
                    state.player.dodgeRate = 0.05;
                    state.player.skills = ['lotus_strike', 'sham_blade']; // Starts with 2 skills
                    
                    state.player.equipment.weapon = {
                        id: 'starting_steel_jian',
                        name: 'سيف اليشم الممشوق (سلاح مجهز)',
                        slot: 'weapon',
                        quality: 'Rare',
                        stats: { atk: 12, mp: 10 },
                        desc: 'سيف ذو شفرة مستقيمة ونقش يشم عتيق، يزيد الهجوم والمانا بشكل ملحوظ.'
                    };
                }
                else if (state.player.class === 'Medicine Cultivator') {
                    // الحكيم المعالج: High Health, Potion abundance, starting Heal skill
                    state.player.atk = 15;
                    state.player.def = 12;
                    state.player.maxHp = 300; // Doubled
                    state.player.hp = 300;
                    state.player.maxMp = 100;
                    state.player.mp = 100;
                    state.player.critRate = 0.05;
                    state.player.dodgeRate = 0.05;
                    state.player.skills = ['badr_blessing', 'dust_fist']; 
                    state.player.inventory.potions = 6;
                    state.player.inventory.elixirs = 2;

                    state.player.equipment.relic = {
                        id: 'healing_elixir_pouch',
                        name: 'قلادة الحكيم العشبية (مجهزة)',
                        slot: 'relic',
                        quality: 'Rare',
                        stats: { hp: 40, def: 10 },
                        desc: 'قلادة منسوجة يدوياً تعج برائحة الأعشاب الشافية والبلسم الحافظ.'
                    };
                }
                else if (state.player.class === 'Desert Knight') {
                    // فارس الصحراء المنيع: High Defense, Shielded, starting companion
                    state.player.atk = 18;
                    state.player.def = 25;
                    state.player.maxHp = 250; // Doubled
                    state.player.hp = 250;
                    state.player.maxMp = 60;
                    state.player.mp = 60;
                    state.player.critRate = 0.05;
                    state.player.dodgeRate = 0.10;
                    state.player.skills = ['shadow_step', 'caravan_guard']; 

                    state.player.equipment.body = {
                        id: 'desert_knight_shield',
                        name: 'درع الفرسان الجلدي (مجهز)',
                        slot: 'body',
                        quality: 'Rare',
                        stats: { def: 15, hp: 30 },
                        desc: 'درع منسوج من جلد الإبل المعزز بصفائح فولاذية خفيفة.'
                    };
                    state.player.equipment.weapon = {
                        id: 'scimitar',
                        name: 'خنجر المغاوير الدمشقي (مجهز)',
                        slot: 'weapon',
                        quality: 'Common',
                        stats: { atk: 10, def: 5 },
                        desc: 'سيف مقوس تقليدي حاد ومقاوم للصدأ والغبار الصحراوي.'
                    };
                }
                else if (state.player.class === 'Sufi Mystic') {
                    // الفارس الحر ذو الهيبة الكبرى: High Mana, high Evasion, starting Relic
                    state.player.atk = 16;
                    state.player.def = 10;
                    state.player.maxHp = 180; // Doubled
                    state.player.hp = 180;
                    state.player.maxMp = 150;
                    state.player.mp = 150;
                    state.player.critRate = 0.05;
                    state.player.dodgeRate = 0.20;
                    state.player.skills = ['shadow_step', 'badr_blessing']; 

                    state.player.equipment.relic = {
                        id: 'irem_brass_amulet',
                        name: 'تميمة النحاس الأثرية (مجهزة)',
                        slot: 'relic',
                        quality: 'Epic',
                        stats: { mp: 40, def: 8 },
                        desc: 'تميمة نحاسية منقوشة بنقوش غامضة من ديوان المعارف الأكبر.'
                    };
                }
                else if (state.player.class === 'Steelmaster') {
                    // خبير الفولاذ الدمشقي: Balanced High Stats, Damascus starting weapon
                    state.player.atk = 24;
                    state.player.def = 15;
                    state.player.maxHp = 220; // Doubled
                    state.player.hp = 220;
                    state.player.maxMp = 70;
                    state.player.mp = 70;
                    state.player.critRate = 0.10;
                    state.player.dodgeRate = 0.05;
                    state.player.skills = ['lotus_strike', 'mountain_peak_cleave'];

                    state.player.equipment.weapon = {
                        id: 'starting_damascus_scimitar',
                        name: 'سيف الفولاذ الدمشقي الأصيل (مجهز)',
                        slot: 'weapon',
                        quality: 'Rare',
                        stats: { atk: 18, def: 5 },
                        desc: 'سيف فولاذي معرج بنقوش ماء الصحراء، متزن وقوي البنية.'
                    };
                }
                else if (state.player.class === 'Horseman') {
                    // فارس الخيل المغوار: Speed, high Evasion, Stirrups relic
                    state.player.atk = 20;
                    state.player.def = 12;
                    state.player.maxHp = 210; // Doubled
                    state.player.hp = 210;
                    state.player.maxMp = 60;
                    state.player.mp = 60;
                    state.player.critRate = 0.08;
                    state.player.dodgeRate = 0.25;
                    state.player.skills = ['shadow_step', 'crescent_sweep'];

                    state.player.equipment.relic = {
                        id: 'stirrups_of_wind',
                        name: 'ركاب ريح البادية المبارك (مجهز)',
                        slot: 'relic',
                        quality: 'Rare',
                        stats: { speed: 20, evasion: 10 },
                        desc: 'ركاب خيل جلدي خفيف مطعم بنقوش هالة ريح الشمال المسرعة.'
                    };
                }
                else if (state.player.class === 'Astrologer') {
                    // خبير الفلك والأوراد: High Mana, Spell resistance
                    state.player.atk = 14;
                    state.player.def = 8;
                    state.player.maxHp = 190; // Doubled
                    state.player.hp = 190;
                    state.player.maxMp = 180;
                    state.player.mp = 180;
                    state.player.critRate = 0.05;
                    state.player.dodgeRate = 0.12;
                    state.player.skills = ['badr_blessing', 'bazaar_tactics'];

                    state.player.equipment.relic = {
                        id: 'astrolabe_of_light',
                        name: 'أسطرلاب الأنوار النحاسي (مجهز)',
                        slot: 'relic',
                        quality: 'Rare',
                        stats: { mp: 40, def: 10 },
                        desc: 'أسطرلاب نحاسي لامع مرصع بالفيروز يكشف تدفق طاقة التشي.'
                    };
                }
                else if (state.player.class === 'Lancer') {
                    // رماح البادية الأبي: High Crit, penetrative Spear starting weapon
                    state.player.atk = 26;
                    state.player.def = 10;
                    state.player.maxHp = 200; // Doubled
                    state.player.hp = 200;
                    state.player.maxMp = 50;
                    state.player.mp = 50;
                    state.player.critRate = 0.25; // Massive early crit
                    state.player.dodgeRate = 0.05;
                    state.player.skills = ['lotus_strike', 'falcon_descent'];

                    state.player.equipment.weapon = {
                        id: 'samhari_spear',
                        name: 'رمح سمهر الحجازي المسنن (مجهز)',
                        slot: 'weapon',
                        quality: 'Rare',
                        stats: { atk: 22 },
                        desc: 'رمح طويل مرن برأس فولاذي مصقول يخترق أصلب الدروع بسهولة.'
                    };
                }
            }
            calculateTotalStats();
            initGame();
        });
    }

    // Safety Fallback UI: Bind any emergency return buttons
    const rescueBtn = document.getElementById('rescue-btn');
    if (rescueBtn) {
        rescueBtn.addEventListener('click', () => {
            narrate("تم بدء إعادة ضبط الحالة الطارئة. العودة إلى واحة التقاطع...", "النظام");
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
    
    narrate("<b>أصداء الماضي الغابر</b>: لقد عدت إلى مسارك وقدرك المكتوب بنجاح.", "النظام", null, false, true);
}

// --- Narrative Engine ---
function parsePerspective(text) {
    if (typeof text !== 'string') return String(text || '');
    if (state.settings?.perspective === 'first') {
        return text.replace(/\bYourself\b/g, 'نفْسي').replace(/\byourself\b/g, 'نفسي').replace(/\bYour\b/g, 'مُلكي').replace(/\byour\b/g, 'خاصتي').replace(/\bYou are\b/g, 'أنا أكون').replace(/\byou are\b/g, 'أنا').replace(/\bYou\b/g, 'أنا').replace(/\byou\b/g, 'أنا');
    }
    return text;
}

// Typewriter Animation State
function typewriteText(containerElement, textHtml, speed = 8, callback = null) {
    if (!containerElement) return;

    // Clear any existing typing on this specific element
    if (containerElement._typewriteInterval) {
        clearInterval(containerElement._typewriteInterval);
        containerElement._typewriteInterval = null;
        if (containerElement._skipTypingHandler) {
            document.removeEventListener('click', containerElement._skipTypingHandler);
            containerElement._skipTypingHandler = null;
        }
        containerElement.innerHTML = containerElement._targetTextHtml || textHtml;
        if (containerElement._typewriteCallback) {
            const cb = containerElement._typewriteCallback;
            containerElement._typewriteCallback = null;
            cb();
        }
    }

    // Prevent typewriter from corrupting complex HTML structures (e.g. nested layout cards)
    if (textHtml.includes('<div') || textHtml.includes('<table') || textHtml.includes('<section')) {
        containerElement.innerHTML = textHtml;
        if (callback) {
            callback();
        }
        return;
    }

    // Store target text and callback on the element
    containerElement._targetTextHtml = textHtml;
    containerElement._typewriteCallback = callback;

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
        if (containerElement._typewriteInterval) {
            clearInterval(containerElement._typewriteInterval);
            containerElement._typewriteInterval = null;
            if (containerElement._skipTypingHandler) {
                document.removeEventListener('click', containerElement._skipTypingHandler);
                containerElement._skipTypingHandler = null;
            }
            containerElement.innerHTML = textHtml;
            
            const cb = containerElement._typewriteCallback;
            containerElement._typewriteCallback = null;
            if (cb) cb();
        }
    };
    
    containerElement._skipTypingHandler = skipTyping;
    document.addEventListener('click', skipTyping);

    containerElement._typewriteInterval = setInterval(() => {
        if (tokenIndex >= tokens.length) {
            clearInterval(containerElement._typewriteInterval);
            containerElement._typewriteInterval = null;
            if (containerElement._skipTypingHandler) {
                document.removeEventListener('click', containerElement._skipTypingHandler);
                containerElement._skipTypingHandler = null;
            }
            const cb = containerElement._typewriteCallback;
            containerElement._typewriteCallback = null;
            if (cb) cb();
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
            const color = isEnemy ? 'var(--danger)' : (speaker === 'System' || speaker === 'النظام' ? 'var(--secondary)' : 'var(--jade)');
            contentHtml += `<span class="narrative-speaker" style="color: ${color};">${speaker}</span>`;
        }
        
        const finalText = isSystem ? safeText : parsePerspective(safeText);
        const paragraphId = 'narrative-text-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        contentHtml += `<div id="${paragraphId}" style="margin: 0; color: ${isSystem ? 'var(--secondary)' : 'var(--text)'};"></div>`;
        
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
        showToast("طريق التركيز والقدر غائم حالياً... (خطأ في العرض)");
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
function spawnParticleExplosion(x, y, colorType = 'gold') {
    const particleCount = 16;
    const colors = {
        gold: '#ffd700',
        green: '#00ffbb',
        sand: '#e0a96d',
        blue: '#00ccff',
        red: '#ff4d4d'
    };
    const baseColor = colors[colorType] || '#fff';

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'combat-particle';
        
        const size = Math.floor(Math.random() * 8) + 6;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particle.style.left = (x - size / 2) + 'px';
        particle.style.top = (y - size / 2) + 'px';
        particle.style.color = baseColor;
        particle.style.backgroundColor = baseColor;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 60;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
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
function triggerVisualHitEffect(moveId, isPlayerHit) {
    const activeScreen = document.querySelector('.screen.active') || document.body;
    if (!activeScreen) return;
    
    if (!isPlayerHit) {
        const slash = document.createElement('div');
        slash.className = 'visual-hit-slash';
        const rot = -15 + Math.floor(Math.random() * 30);
        const top = 30 + Math.floor(Math.random() * 20);
        slash.style.top = `${top}%`;
        slash.style.transform = `rotate(${rot}deg) scaleX(0)`;
        
        // Custom animation styling dynamically adjusted based on skill types
        const skill = window.SKILLS ? window.SKILLS.techniques[moveId] : null;
        if (skill) {
            if (skill.type === 'fast') {
                slash.style.background = 'linear-gradient(90deg, transparent, #00ffcc, #39ff14, #00ffcc, transparent)';
                slash.style.boxShadow = '0 0 12px #39ff14, 0 0 24px #00ffcc';
                slash.style.height = '6px';
            } else if (skill.type === 'magic') {
                slash.style.background = 'linear-gradient(95deg, transparent, #bd00ff, #00f0ff, #bd00ff, transparent)';
                slash.style.boxShadow = '0 0 14px #00f0ff, 0 0 28px #bd00ff';
                slash.style.height = '10px';
            } else if (skill.type === 'heavy') {
                slash.style.background = 'linear-gradient(90deg, transparent, #ff3333, #ffcc00, #ff3333, transparent)';
                slash.style.boxShadow = '0 0 15px #ffcc00, 0 0 30px #ff3333';
                slash.style.height = '12px';
            }
        }
        
        activeScreen.appendChild(slash);
        setTimeout(() => slash.remove(), 400);
        
        if (skill) {
            if (moveId === 'earth_shatter' || moveId === 'dune_storm') {
                const shatter = document.createElement('div');
                shatter.className = 'visual-impact-ground';
                activeScreen.appendChild(shatter);
                setTimeout(() => shatter.remove(), 800);
                triggerScreenShake();
                setTimeout(triggerScreenShake, 200);
            } else if (moveId === 'samum_strike' || moveId === 'sun_incineration' || moveId === 'blazing_embers') {
                const fire = document.createElement('div');
                fire.className = 'visual-fire-ring';
                activeScreen.appendChild(fire);
                setTimeout(() => fire.remove(), 600);
            }
            if (skill.stunChance > 0) {
                triggerStaggerVisual();
            }
        }
    } else {
        const ring = document.createElement('div');
        ring.className = 'visual-impact-ring';
        activeScreen.appendChild(ring);
        setTimeout(() => ring.remove(), 500);
    }
}
function triggerStaggerVisual() {
    const activeScreen = document.querySelector('.screen.active') || document.body;
    if (!activeScreen) return;
    
    const stagger = document.createElement('div');
    stagger.className = 'visual-stagger-alert';
    stagger.innerHTML = '⚡ دُهش الخصم (مترنح / Staggered) ⚡';
    activeScreen.appendChild(stagger);
    setTimeout(() => stagger.remove(), 1500);
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
            if (txt.includes('form') || txt.includes('taming') || txt.includes('tame') || txt.includes('وضعية') || txt.includes('ترويض')) {
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
                showToast("طريق التركيز يتأرجح... (خطأ تفاعلي)");
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
    UI_ELEMENTS.storyPlayerName.innerText = `${state.player.name} (مستوى ${state.player.lvl})`;
    UI_ELEMENTS.storyHp.innerText = state.player.hp;
    UI_ELEMENTS.storyMp.innerText = state.player.mp;
    UI_ELEMENTS.storyHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
    if (UI_ELEMENTS.storyGold) UI_ELEMENTS.storyGold.innerText = state.player.gold || 0;
    
    // --- Mobile Top HUD Synced Updates ---
    const mobName = document.getElementById('hud-player-name-val');
    const mobClass = document.getElementById('hud-class-val');
    const mobGold = document.getElementById('hud-gold-val');
    const mobHp = document.getElementById('hud-hp-val');
    const mobMp = document.getElementById('hud-mp-val');
    const mobAvatar = document.getElementById('hud-avatar-img');

    if (mobName) mobName.innerText = `${state.player.name} (lvl ${state.player.lvl})`;
    if (mobClass) {
        const classNamesArabic = {
            'Sword Immortal': 'السياف الأسطوري',
            'Medicine Cultivator': 'الطبيب المعالج',
            'Desert Knight': 'فارس الصحراء',
            'Sufi Mystic': 'الفارس المهيب',
            'Steelmaster': 'خبير الفولاذ الدمشقي',
            'Horseman': 'فارس الخيل المغوار',
            'Astrologer': 'خبير الفلك والأوراد',
            'Lancer': 'رماح البادية الأبي'
        };
        mobClass.innerText = classNamesArabic[state.player.class] || state.player.class || 'بطل القلوب';
    }
    if (mobGold) mobGold.innerText = state.player.gold || 0;
    if (mobHp) mobHp.innerText = `${state.player.hp}/${state.player.maxHp}`;
    if (mobMp) mobMp.innerText = `${state.player.mp}/${state.player.maxMp}`;
    if (mobAvatar && state.player.sprite) {
        mobAvatar.src = state.player.sprite;
    }

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

window.highlightMobileTab = function(index) {
    document.querySelectorAll('.mobile-bottom-nav .nav-tab').forEach((tab, idx) => {
        if (idx === index) tab.classList.add('active');
        else tab.classList.remove('active');
    });
};

window.onMobileTabClick = function(index, actionFunc) {
    if (state.screen === 'menu-screen') {
        return;
    }
    if (state.currentEnemy) {
        if (typeof showToast === 'function') {
            showToast("لا يمكنك مغادرة المعركة الحامية الآن يا فتوة! ⚔️");
        }
        return;
    }
    
    // Check feature locks for caravan map (Tab 1) and logbook (Tab 4)
    if (index === 1) {
        if (!state.player.unlockedFeatures) state.player.unlockedFeatures = [];
        if (!state.player.unlockedFeatures.includes('caravan_map')) {
            window.checkFeatureLock('caravan_map', 'قافلة الترحال واستكشاف خريطة البرية الشبكية', 5, 1000, () => {
                highlightMobileTab(1);
                if (typeof actionFunc === 'function') actionFunc();
            });
            return;
        }
    }
    
    if (index === 4) {
        if (!state.player.unlockedFeatures) state.player.unlockedFeatures = [];
        if (!state.player.unlockedFeatures.includes('logbook')) {
            window.checkFeatureLock('logbook', 'ديوان حكايات البدو واليوميات اليومية', 4, 800, () => {
                highlightMobileTab(4);
                if (typeof actionFunc === 'function') actionFunc();
            });
            return;
        }
    }
    
    // Close chronicle modal if switching to any other tab
    if (index !== 4) {
        const modal = document.getElementById('chronicle-modal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    }

    highlightMobileTab(index);
    if (typeof actionFunc === 'function') {
        actionFunc();
    }
};

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

    // Hide mobile navigation and top HUD on menu screen
    const topHud = document.querySelector('.mobile-top-hud');
    const bottomNav = document.querySelector('.mobile-bottom-nav');
    
    if (screenId === 'menu-screen') {
        if (topHud) topHud.style.setProperty('display', 'none', 'important');
        if (bottomNav) bottomNav.style.setProperty('display', 'none', 'important');
    } else {
        if (topHud) topHud.style.display = '';
        if (bottomNav) bottomNav.style.display = '';
    }

    // --- Update mobile navigation active tab highlight when screen changes ---
    if (screenId === 'story-screen' || screenId === 'hub-screen') {
        highlightMobileTab(0);
    } else if (screenId === 'map-screen') {
        highlightMobileTab(1);
    } else if (screenId === 'inventory-screen') {
        highlightMobileTab(2);
    } else if (screenId === 'cultivation-screen') {
        highlightMobileTab(3);
    }
}

function initGame() {
    if (window.DWELLING) window.DWELLING.init(state);
    if (window.SOUL_WANDERING) window.SOUL_WANDERING.init(state);
    if (window.SECTS) window.SECTS.init(state);

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
            narrate(`أثناء غيابك عن الخلوة، جمعت ${idleQi} من طاقة التركيز والهمة من خلال التدريب والتركيز السلبي الطاهر.`, "النظام");
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
                        narrate(`تم البيع! لقد فزت بـ ${a.item.name} مقابل ${a.currentBid} دينار ذهبي!`, "المزاد");
                    } else {
                        narrate(`حالة حرجة: فزت بالمزاد ولكن لا تملك ما يكفي من الأحجار البدنية! تم مصادرة الـ ${a.item.name}.`, "المزاد");
                    }
                } else {
                    narrate(`تم البيع! فاز ${a.highestBidder} بـ ${a.item.name}.`, "المزاد");
                }
                state.activeAuction = null;
                updateTopBar();
            }
        }
        if (window.SECTS) window.SECTS.process(state);
        if (window.DWELLING) window.DWELLING.process(state);
        if (window.SOUL_WANDERING) window.SOUL_WANDERING.process(state);
        if (window.OASIS_CARAVAN) window.OASIS_CARAVAN.processTicks(state);

        // --- DYNAMIC EVENT HEARTBEAT ---
        if (Math.random() < 0.05) {
            const eventType = Math.random() > 0.5 ? 'LIFE' : 'SECT';
            let triggered = false;
            if (eventType === 'LIFE' && window.LIFE && window.LIFE.processRandomEvent) {
                window.LIFE.processRandomEvent(state, narrate);
                if (window.LIFE.processBirth) window.LIFE.processBirth(state, narrate);
                triggered = true;
            } else if (eventType === 'SECT' && window.SECTS && window.SECTS.processRandomEvent) {
                window.SECTS.processRandomEvent(state, narrate);
                triggered = true;
            }
            if (triggered) {
                updateTopBar();
                saveGame();
            }
        }
    }, 5000); // 5s heartbeat for performance

    showScreen('story-screen');
    if (window.AUDIO) { window.AUDIO.init(); window.AUDIO.playRegion('crossroads'); }
    clearNarrative();
    calculateTotalStats();
    saveGame();
    narrate("توشوش الرياح بأخبار عن تقارب عظيم للأقدار السماوية. مسارك يبدأ الآن.", "النظام", null, false, true);
    hubLoop();
}

window.checkFeatureLock = function(featureKey, displayName, reqLvl, goldCost, successCallback) {
    if (!state.player.unlockedFeatures) state.player.unlockedFeatures = [];
    
    // If already unlocked, proceed immediately
    if (state.player.unlockedFeatures.includes(featureKey)) {
        successCallback();
        return;
    }
    
    // If not unlocked, show confirmation screen in the narrations
    clearNarrative();
    narrate(`<b>🔒 بوابة الارتقاء والفتح الباطني</b>`, displayName, null, false, true);
    narrate(`تتطلب هذه الميزة مستوى لا يقل عن <b>${reqLvl}</b> ودفع رسم فتح مقداره <b>${goldCost} دينار ذهبي</b>.`, "بوابة الأسرار والارتقاء", null, false, true);
    narrate(`المستوى الحالي: <b>${state.player.lvl || 1}</b> | الذهب المتوفر: <b>${state.player.gold || 0} دينار ذهبي</b>.`, "بوابة الأسرار والارتقاء", null, false, true);
    
    const isLevelMet = (state.player.lvl || 1) >= reqLvl;
    const isGoldMet = (state.player.gold || 0) >= goldCost;
    
    const choiceOptions = [];
    if (isLevelMet && isGoldMet) {
        choiceOptions.push({
            text: `✨ ادفع ${goldCost} ذهب وافتح الميزة بشكل دائم`,
            callback: () => {
                state.player.gold -= goldCost;
                state.player.unlockedFeatures.push(featureKey);
                saveGame();
                narrate(`🎉 تهانينا! لقد تم فتح ميزة <b>${displayName}</b> بنجاح ودائم!`, "نظام الارتقاء", null, false, true);
                if (window.AUDIO) window.AUDIO.playEffect('level_up');
                updateTopBar();
                setTimeout(successCallback, 2000);
            }
        });
    } else {
        if (!isLevelMet) {
            narrate(`<span style="color:var(--secondary)">⚠️ مستواك منخفض جداً لفتح هذه الميزة (مطلوب مستوى ${reqLvl}).</span>`, "نظام الارتقاء", null, false, true);
        }
        if (!isGoldMet) {
            narrate(`<span style="color:var(--secondary)">⚠️ ليس لديك ما يكفي من الذهب لفتح هذه الميزة (مطلوب ${goldCost} ذهب).</span>`, "نظام الارتقاء", null, false, true);
        }
    }
    
    choiceOptions.push({
        text: "↩ العودة لواحة القوافل الكبرى",
        callback: hubLoop
    });
    
    setChoices(choiceOptions);
};

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
            triggerActTransition("الفصل الخامس: التلاقي الأكبر للأقدار", "الحاجز الأخير يتحطم ويتلاشى. اصعد إلى السماوات العلى، أو اسحق أعداءك، أو اسلك درب الوسطية الخالد.", () => hubLoop());
            return;
        }
        if (flags['act4_started'] && !flags['act4_transition_shown']) {
            flags['act4_transition_shown'] = true;
            saveGame();
            triggerActTransition("الفصل الرابع: حصار واحة التقاطع", "احم البوابات بدمك. أمن طريق الحرير العظيم من بطش الطوائف المارقة واللصوص.", () => hubLoop());
            return;
        }
        if (flags['act3_started'] && !flags['act3_transition_shown']) {
            flags['act3_transition_shown'] = true;
            saveGame();
            triggerActTransition("الفصل الثالث: مرآة الذاكرة الغابرة", "اكشف الستار عن المسار القديم للفارس الهابط وأصولك الحقيقية التي طواها الزمن.", () => hubLoop());
            return;
        }
        if (flags['act2_started'] && !flags['act2_transition_shown']) {
            flags['act2_transition_shown'] = true;
            saveGame();
            triggerActTransition("الفصل الثاني: النزاع السماوي الأعظم", "موجات الفرسان واليشم تتجمع كغيوم الرعد فوق المعبر العالي الجبلي.", () => hubLoop());
            return;
        }

        const beatId = window.STORY.getNextBeat(state);
        if (beatId) {
            clearNarrative();
            window.STORY.runNode(beatId, state, narrate, setChoices, (result) => {
                if (result === 'combat' && state.pendingCombatEnemy) {
                    const enemy = window.LORE ? window.LORE.getAllEnemies()[state.pendingCombatEnemy] : null;
                    state.pendingCombatEnemy = null;
                    if (enemy) {
                        const scaledStoryEnemy = {
                            ...enemy,
                            hp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 2)),
                            maxHp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 2)),
                            atk: Math.floor(enemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(state.player.lvl, state.player.lvl) : 1.8)),
                            def: Math.floor((enemy.baseDef || 5) * (1.2 + state.player.lvl * 0.3))
                        };
                        startCombat(scaledStoryEnemy);
                    } else { narrate("خطأ: بيانات العدو مفقودة في المخطوطة البدنية. العودة للواحة.", "النظام"); hubLoop(); }
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
    const regionName = region ? region.name : "ملكوت مجهول";

    const comp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
    if (comp) {
        const greeting = window.COMPANIONS.getDialogue(state, state.companion, 'greet');
        if (greeting) narrate(greeting, comp.name, comp.sprite, false);
    }

    narrate(`<b style="font-size:1.4em;letter-spacing:2px;color:var(--secondary);">${regionName.toUpperCase()}</b>`, 'النظام', null, false, true);
    if (region) narrate(`<i style="color:var(--text-dim);">${region.subtitle}</i><br>${region.description}`, 'النظام', null, false, true);

    if (!state.player.unlockedFeatures) state.player.unlockedFeatures = [];
    const isUnlocked = (key) => state.player.unlockedFeatures.includes(key);
    const getLockText = (key, text, reqLvl, goldCost) => {
        return isUnlocked(key) ? text : `🔒 ${text} (مستوى ${reqLvl} و ${goldCost} ذهب)`;
    };

    const choices = [];
    if (typeof showWorldMap === 'function') choices.push({ text: "🗺️ افتح خريطة العالم الأسطوري", callback: showWorldMap });
    
    // Exploration
    choices.push({ text: `⚔️ استكشف ${regionName}`, callback: () => exploreRegion(regionId) });
    
    // Epic Sagas Tent
    if ((state.player.lvl >= 10) || state._completedMainStory) {
        choices.push({
            text: '⛺ ديوان الملاحم والأساطير الكبرى (حبكات وشخصيات تاريخية)',
            callback: () => {
                clearNarrative();
                narrate("داخل خيمة الديباج والنحاس، يجلس شيوخ التاريخ العربي وشعراء العراق والبادية، مستعدين لفتح مخطوطات ملاحم لم تروَ من قبل.", "النظام");
                setChoices([
                    { text: "🦅 ملحمة عنترة بن شداد العبسي (سيف البطولة)", callback: () => { if(window.STORY && window.STORY.runNode) window.STORY.runNode('saga_antarah', state, narrate, setChoices, hubLoop); else narrate('جاري تجهيز الملحمة...', 'النظام'); setTimeout(hubLoop, 2000); } },
                    { text: "⚒️ ورشة صقل السيف الدمشقي المفقودة", callback: () => { if(window.STORY && window.STORY.runNode) window.STORY.runNode('saga_forge_start', state, narrate, setChoices, hubLoop); } },
                    { text: "🌊 إمبراطورية الجان وسعلوة العراق (الفصل السادس)", callback: () => { if(window.STORY && window.STORY.runNode) window.STORY.runNode('act6_intro', state, narrate, setChoices, hubLoop); } },
                    { text: "🧘 محنة شيخ الطريقة الأكبر (جبل قاف)", callback: () => { if(window.STORY && window.STORY.runNode) window.STORY.runNode('saga_sufi_start', state, narrate, setChoices, hubLoop); } },
                    { text: "↩ عودة لواحة القوافل", callback: hubLoop }
                ]);
            }
        });
    }

    // Oasis & Caravan expansion buttons
    choices.push({
        text: getLockText('oasis', '⛺ إدارة وتطوير الواحة الباطنية (إنتاج تلقائي خامل)', 3, 500),
        callback: () => window.checkFeatureLock('oasis', 'إدارة وتطوير الواحة الباطنية', 3, 500, () => { if (window.showOasisScreen) window.showOasisScreen(); })
    });
    choices.push({
        text: getLockText('caravan_map', '🐪 قافلة الترحال واستكشاف خريطة البرية الشبكية', 5, 1000),
        callback: () => window.checkFeatureLock('caravan_map', 'قافلة الترحال واستكشاف خريطة البرية الشبكية', 5, 1000, () => { if (window.showCaravanMapScreen) window.showCaravanMapScreen(); })
    });
    choices.push({
        text: getLockText('logbook', '📜 ديوان حكايات البدو واليوميات اليومية', 4, 800),
        callback: () => window.checkFeatureLock('logbook', 'ديوان حكايات البدو واليوميات اليومية', 4, 800, () => { if (window.showNomadLogbookScreen) window.showNomadLogbookScreen(); })
    });

    if (regionId === 'crossroads') {
        if (typeof showQuestLog === 'function') {
            choices.push({
                text: getLockText('quests', '📜 لوحة المهام والطلبات', 3, 400),
                callback: () => window.checkFeatureLock('quests', 'لوحة المهام والطلبات', 3, 400, showQuestLog)
            });
        }
        if (typeof showMarket === 'function') {
            choices.push({
                text: getLockText('market', '⚖️ سوق واحة التقاطع', 2, 200),
                callback: () => window.checkFeatureLock('market', 'سوق واحة التقاطع', 2, 200, showMarket)
            });
        }
        if (typeof showAuctionHouse === 'function') {
            choices.push({
                text: getLockText('auction', '🏛️ دار مزادات الطائفة العظمى', 10, 4000),
                callback: () => window.checkFeatureLock('auction', 'دار مزادات الطائفة العظمى', 10, 4000, showAuctionHouse)
            });
        }
        if (typeof showManagementScreen === 'function') {
            choices.push({
                text: getLockText('family', '👨‍👩‍👧‍👦 إدارة العائلة والطائفة', 12, 6000),
                callback: () => window.checkFeatureLock('family', 'إدارة العائلة والطائفة', 12, 6000, showManagementScreen)
            });
        }
    } else if (regionId === 'jade_peak') {
        choices.push({ text: "🏯 معبد قمة اليشم والرهبان", callback: () => narrate("شيوخ ورهبان الطائفة في حالة تجلي وتدريب بدني عميق في قنوات المانا.", "النظام") });
        choices.push({ text: "🗡️ منحدر بصير السيف الناري", callback: () => narrate("تشعر بهالة سيف حادة تقطع النسمات وتحفر الصخر في الهواء.", "النظام") });
    }
    
    if (state.player.lvl >= 10) {
        choices.push({ text: "📜 ديوان وصية الأجداد والميراث", callback: showRebirthScreen });
    }
    
    if (state.player.lvl >= 20 && !state.player.isAscended) {
        choices.push({ text: "⚡ خوض محنة البرق السماوي", callback: () => {
            if (window.ASCENSION) window.ASCENSION.startTribulation(state, narrate, startCombat);
        }});
    }
    
    if (typeof showCultivationScreen === 'function') choices.push({ text: "🧘 راحة واجمع طاقة التركيز والهمة", callback: showCultivationScreen });
    
    if (typeof showAlchemyScreen === 'function') {
        choices.push({
            text: getLockText('alchemy', '⚗️ فرن الخيمياء وتقطير الإكسير', 6, 1500),
            callback: () => window.checkFeatureLock('alchemy', 'فرن الخيمياء وتقطير الإكسير', 6, 1500, showAlchemyScreen)
        });
    }
    if (typeof showForgeScreen === 'function') {
        choices.push({
            text: getLockText('forge', '🔨 ورشة سحر الحديد والأسلحة', 8, 2500),
            callback: () => window.checkFeatureLock('forge', 'ورشة سحر الحديد والأسلحة', 8, 2500, showForgeScreen)
        });
    }
    
    choices.push({ text: "📜 مكتبة الفنون والمهارات", callback: showSkillsScreen });
    choices.push({ text: "🎒 الحقيبة وجوهر الكارما", callback: showInventory });
    choices.push({ text: "🧘 خلوة وتأمل (استشفاء كامل)", callback: () => {
        state.player.hp = state.player.maxHp; state.player.mp = state.player.maxMp;
        narrate("استعدت كامل جوهر الجسد وطاقة التركيز والهمة الكامنة.", "النظام", null, false, true);
        if (window.QUESTS) window.QUESTS.updateQuests(state);
        updateTopBar(); saveGame(); setTimeout(hubLoop, 1500);
    }});
    choices.push({
        text: getLockText('companion', '👥 إدارة الرفيق البطل', 7, 2000),
        callback: () => window.checkFeatureLock('companion', 'إدارة الرفيق البطل', 7, 2000, showCompanionScreen)
    });
    setChoices(choices);
}

// --- Companion Screen ---
function showCompanionScreen() {
    clearNarrative();
    const comp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
    
    let html = `<b>سجل رفقاء الدرب</b> — اختر البطل الذي يشد عضدك ويسير بجانبك.<br><br>`;
    
    if (comp) {
        const tier = window.COMPANIONS.getAffinityTier(comp.affinity);
        let bonusText = "";
        if (comp.passiveBuff) {
            bonusText = `يقدم بركة إيجابية في القتال بنسبة: <b>+${Math.floor(comp.passiveBuff.bonus * (0.5 + comp.affinity / 100) * 100)}% ${comp.passiveBuff.stat === 'atk' ? 'هجوم' : comp.passiveBuff.stat === 'def' ? 'دفاع' : comp.passiveBuff.stat.toUpperCase()}</b>`;
        }
        
        let synergyStatus = comp.affinity >= 75 
            ? `<span style="color:var(--secondary); font-weight:bold;">🔥 مهارة التآزر القصوى: مفتوحة ومتاحة!</span>` 
            : `<span style="color:var(--text-dim);">🔒 مهارة التآزر القصوى تفتح عند 75% ألفة</span>`;
            
        html = `
            <div class="management-card" style="border-left:4px solid var(--secondary); font-family:'Inter', sans-serif;">
                <div class="management-header">
                    <h3 style="color:var(--secondary); margin:0;">👥 الرفيق النشط: ${comp.name}</h3>
                    <span class="management-badge" style="background:${tier.color}; color:#fff;">${tier.label}</span>
                </div>
                <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; margin:10px 0; font-size:0.9rem; text-align:left;">
                    <p style="margin:5px 0;">مستوى الألفة والود: <b style="color:var(--secondary);">${comp.affinity}%</b></p>
                    <p style="margin:5px 0;">${bonusText}</p>
                    <p style="margin:5px 0;">${synergyStatus}</p>
                </div>
            </div>
            <br>
        `;
    }
    
    narrate(html, "ديوان الرفقاء", null, false, true);
    
    const available = window.COMPANIONS ? window.COMPANIONS.getAvailable(state) : [];
    const choices = [];
    
    if (comp) {
        choices.push({
            text: "🗣️ محادثة تفاعلية ذكية (ذكاء اصطناعي)",
            callback: () => { window.AIDialogue.talkToNPC('companion'); }
        });

        choices.push({
            text: "💬 استشارة استراتيجية (تستعيد 30% صحة وعزيمة؛ تكلف 50 دينار ذهبي)",
            callback: () => {
                if (state.player.gold < 50) {
                    narrate("معندكش دنانير ذهبية كفاية في صرتك لتكلفة الاستشارة.", "النظام");
                    setTimeout(showCompanionScreen, 1500);
                    return;
                }
                state.player.gold -= 50;
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.floor(state.player.maxHp * 0.3));
                state.player.mp = Math.min(state.player.maxMp, state.player.mp + Math.floor(state.player.maxMp * 0.3));
                
                const counsel = window.COMPANIONS.getDialogue(state, state.companion, 'greet') || "تقدم للأمام بثقة يا سالك، فالقدر يكتبه الشجعان وسيوفهم.";
                narrate(`<b>${comp.name}</b> يوجهك بكلماته: "${counsel}"<br><br><span class="loot-refined">تم استعادة 30% من صحتك وطاقة تركيزك!</span>`, "النظام");
                updateTopBar();
                saveGame();
                setTimeout(showCompanionScreen, 3000);
            }
        });
        
        choices.push({
            text: "⚔️ جلسة تدريب وقتال ودي (تحدي الرفيق، تكلف 15 عزيمة)",
            callback: () => {
                if (state.player.mp < 15) {
                    narrate("معندكش تركيز بدني كافي في خلاياك لبدء المبارزة والتدريب الودي.", "النظام");
                    setTimeout(showCompanionScreen, 1500);
                    return;
                }
                state.player.mp -= 15;
                
                const mult = state.player.familyPagodaLevel === 2 ? 1.15 : 1.0;
                const gain = Math.floor(5 * mult);
                window.COMPANIONS.adjustAffinity(state, state.companion, gain, "مبارزة قتالية ودية راقية.");
                
                const statChoice = Math.random() < 0.5 ? 'atk' : 'def';
                if (statChoice === 'atk') {
                    state.player.atk = (state.player.atk || 10) + 1;
                    narrate(`خضت مبارزة وتدريباً حاداً مع <b>${comp.name}</b>. زادت الألفة بنسبة <b>+${gain}%</b> وارتفعت فرسانك وقافلتك القتالية بشكل دائم (<b>+1 هجوم</b>)!`, "النظام");
                } else {
                    state.player.def = (state.player.def || 5) + 1;
                    narrate(`خضت مبارزة وتدريباً حاداً مع <b>${comp.name}</b>. زادت الألفة بنسبة <b>+${gain}%</b> وارتفعت فرسانك وقافلتك القتالية بشكل دائم (<b>+1 دفاع</b>)!`, "النظام");
                }
                
                calculateTotalStats();
                updateTopBar();
                saveGame();
                setTimeout(showCompanionScreen, 3000);
            }
        });
        
        choices.push({
            text: "🎁 تقديم هدية فاخرة (100 دينار ذهبي)",
            callback: () => {
                if (state.player.gold < 100) {
                    narrate("معندكش دنانير ذهبية كفاية لشراء هدية تليق بقدسية الدرب.", "النظام");
                    setTimeout(showCompanionScreen, 1500);
                    return;
                }
                state.player.gold -= 100;
                const mult = state.player.familyPagodaLevel === 2 ? 1.15 : 1.0;
                const gain = Math.floor(10 * mult);
                window.COMPANIONS.adjustAffinity(state, state.companion, gain, "تقديم قلادة يشم الصحراء المذهبة.");
                narrate(`قدمت قلادة اليشم البدني الفاخرة كهدية عظيمة لـ <b>${comp.name}</b>. زادت الألفة بنسبة <b>+${gain}%</b>!`, "النظام");
                updateTopBar();
                saveGame();
                setTimeout(showCompanionScreen, 2200);
            }
        });
    }
    
    choices.push({
        text: "👥 تغيير الرفيق النشط",
        callback: () => {
            clearNarrative();
            narrate("اختر البطل الذي يشد عضدك ويسير بجانبك في ساحة القتال:", "النظام", null, false, true);
            const subchoices = available.map(hero => ({
                text: `${hero.id === state.companion ? '✅ ' : ''}${hero.name}`,
                callback: () => {
                    window.COMPANIONS.activate(state, hero.id);
                    calculateTotalStats();
                    updateTopBar();
                    saveGame();
                    showCompanionScreen();
                }
            }));
            setChoices([...subchoices, { text: "↩ رجوع", callback: showCompanionScreen }]);
        }
    });
    
    setChoices([...choices, { text: "↩ عودة", callback: hubLoop }]);
}

// --- Combat Integration ---
function exploreRegion(regionId) {
    if (!window.LORE || !window.LORE.REGIONS || !window.LORE.REGIONS[regionId]) {
        narrate("هذه المنطقة ضائعة في غياهب النسيان وعواصف الزمن القديم.", "النظام");
        hubLoop();
        return;
    }
    const region = window.LORE.REGIONS[regionId];
    state.player.currentRegion = regionId;
    
    // Get enemies using the more robust helper
    const enemies = window.LORE.getRegionEnemies ? window.LORE.getRegionEnemies(regionId) : [];
    
    if (enemies.length === 0) {
        narrate(`تجولت طويلاً في نواحي ${region.name}، لكن دروب الرمل واليشم هادئة وصامتة حالياً. ربما يجب أن تعود لاحقاً.`, "النظام");
        setTimeout(hubLoop, 2000);
        return;
    }

    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    const scaledEnemy = {
        ...enemy,
        hp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, region.minLevel || 1) : 1.8)),
        maxHp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, region.minLevel || 1) : 1.8)),
        atk: Math.floor(enemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(state.player.lvl, region.minLevel || 1) : 1.5)),
        def: Math.floor((enemy.baseDef || 5) * (1.2 + state.player.lvl * 0.3))
    };

    narrate(`ترتحل وتسافر بنورك وعنادك إلى ${region.name}...`, "النظام");
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
    const formNames = { water: '🌊 وضعية المية السلسة', mountain: '🏔️ وضعية الجبل الشامخ', wind: '🌪️ وضعية الرياح العاتية' };
    if (indicator) indicator.textContent = 'الوضعية الحالية: ' + (formNames[state.playerForm] || 'لا توجد');
    const portrait = document.querySelector('.portrait-container');
    if (portrait) {
        portrait.classList.remove('aura-water', 'aura-mountain', 'aura-wind');
        if (state.currentEnemy) portrait.classList.add(`aura-${state.playerForm}`);
    }
}

function startCombat(enemy) {
    if (!document.getElementById('combat-lighting-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'combat-lighting-overlay';
        document.body.appendChild(overlay);
    }
    state.currentEnemy = enemy;
    state.momentum = 0; state.playerForm = 'water';
    state.skillCooldowns = {};
    updateTopBar(); updateMomentumUI();
    narrate(enemy.dialogue || `يقف ${enemy.name} في طريقك شاهراً سلاحه ويتحدّاك بسخرية!`, enemy.name, enemy.sprite, true);
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
        narrate(`<span style="color:var(--jade); font-weight:bold;">✨ بركة الارتقاء الأبدي:</span> شفي جسدك تلقائياً بـ <b>${healAmt} نقاط حياة</b> في بداية هذه الجولة.`, "النظام");
        updateTopBar();
        triggerFlash('heal');
    }
    
    // 1. Process turn effects (DOTs, Buffs, Stuns)
    const effectMsg = window.COMBAT ? window.COMBAT.processTurnEffects(state, enemy) : '';
    if (effectMsg) narrate(effectMsg, "النظام", null, false, true);
    
    if (enemy.hp <= 0) { setTimeout(handleVictory, 1000); return; }

    // 2. Enemy turn (if not stunned)
    if (!state.skipEnemyTurn) {
        enemy.nextMove = window.COMBAT ? window.COMBAT.selectEnemyMove(enemy) : 'heavy';
        narrate(window.COMBAT ? window.COMBAT.getTelegraph(enemy, enemy.nextMove) : 'العدو يستعد للهجوم!', enemy.name, enemy.sprite, true);
    } else {
        narrate(`${enemy.name} يستعيد وعيه من الدوار والذهول...`, "النظام");
    }

    setTimeout(() => {
        // 3. Player choices
        const moves = window.COMBAT ? window.COMBAT.getActionsForForm(state.playerForm, state) : [];
        if (!state.skillCooldowns) state.skillCooldowns = {};

        const choices = moves.map(m => {
            let actualCost = m.cost;
            if (state.player.supremeMantraActive && actualCost > 0) {
                actualCost = Math.max(1, Math.floor(actualCost * 0.8));
            }

            // Check if this skill is currently on cooldown
            const currentCD = state.skillCooldowns[m.id] || 0;
            const isOnCD = currentCD > 0;

            let btnText = m.name;
            if (isOnCD) {
                btnText += ` ⏳ فتور (${currentCD} دور)`;
            } else {
                btnText += (actualCost > 0 ? ` (${actualCost} عزيمة)` : '') + (m.hpCost ? ` (${Math.floor(state.player.maxHp * m.hpCost)} دم)` : '');
            }

            return {
                text: btnText,
                callback: () => {
                    if (isOnCD) {
                        narrate(`هذا الفن القتالي يمر بفترة فتور واسترداد حركي! انتظر ${currentCD} دور/أدوار إضافية لتمكينه.`, "النظام");
                        combatLoop();
                        return;
                    }
                    if (actualCost > (state.player.mp || 0)) { narrate("معندكش طاقة تركيز (عزيمة) كافية لتفعيل الفن!", "النظام"); combatLoop(); return; }
                    if (m.hpCost && (state.player.hp <= Math.floor(state.player.maxHp * m.hpCost))) { narrate("لا تملك ما يكفي من جوهر دم الحياة لتضحية الفن!", "النظام"); combatLoop(); return; }
                    
                    if (actualCost > 0) state.player.mp -= actualCost;

                    // Set cooldown on successful skill usage
                    const skillDef = window.SKILLS.techniques[m.id];
                    if (skillDef) {
                        state.skillCooldowns[m.id] = skillDef.cooldown || 2;
                    }

                    resolveCombatTurn(m.id);
                }
            };
        });
        
        // Check companion affinity for synergy ultimate
        const activeComp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
        if (activeComp && activeComp.affinity >= 75) {
            let synergyName = "ضربة التآزر المشترك";
            let synergyId = "synergy_strike";
            if (activeComp.id.includes('wukong')) {
                synergyName = "🐒 ضربة الهراوة الأسطورية";
                synergyId = "synergy_wukong";
            } else if (activeComp.id.includes('tariq')) {
                synergyName = "🛡️ درع رمال الصحراء";
                synergyId = "synergy_tariq";
            } else if (activeComp.id.includes('boushaki') || activeComp.id.includes('sidi')) {
                synergyName = "🌀 النفحة التكتيكية الحكيمة";
                synergyId = "synergy_boushaki";
            } else if (activeComp.id.includes('fatima')) {
                synergyName = "🌌 بصيرة الأسطرلاب";
                synergyId = "synergy_fatima";
            }
            
            choices.push({
                text: `💖 تآزر: ${synergyName} (25 عزيمة)`,
                callback: () => {
                    if ((state.player.mp || 0) < 25) { narrate("طاقة تركيزك (عزيمة) ضعيفة ولا تكفي لتفعيل التآزر مع الرفيق!", "النظام"); combatLoop(); return; }
                    state.player.mp -= 25;
                    resolveCombatTurn(synergyId);
                }
            });
        }
        
        choices.push({ text: "🌊 وضعية المية السلسة", callback: () => { state.playerForm = 'water'; combatLoop(); }});
        choices.push({ text: "🏔️ وضعية الجبل الشامخ", callback: () => { state.playerForm = 'mountain'; combatLoop(); }});
        choices.push({ text: "🌪️ وضعية الرياح العاتية", callback: () => { state.playerForm = 'wind'; combatLoop(); }});
        
        if (enemy.archetype === 'beast') choices.push({ text: "🐾 محاولة ترويض المخلوق", callback: () => resolveCombatTurn('tame') });

        setChoices(choices);
    }, 1000);
}

function resolveCombatTurn(moveId) {
    if (state._combatLock) return;
    state._combatLock = true;

    const enemy = state.currentEnemy;
    if (!enemy) { state._combatLock = false; return; }

    if (moveId.startsWith('synergy_')) {
        let dmg = 0;
        let blockText = "";
        
        if (moveId === 'synergy_wukong') {
            dmg = Math.floor(state.player.atk * 2.8);
            state.skipEnemyTurn = true;
            blockText = `<span style="color:var(--secondary); font-weight:bold;">💖 ضربة الهراوة الأسطورية القاضية!</span> هوى الرفيق في الجو بهراوة الفولاذ والذهب الشامخة، ساحقاً ${enemy.name} بـ <b>${dmg} ضرر هائل</b> ودمره ودوخه بالكامل تحت سحابة ترابية عظيمة!`;
        } else if (moveId === 'synergy_tariq') {
            const heal = Math.floor(state.player.def * 8);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
            state.player_invulnerable_turn = true;
            blockText = `<span style="color:var(--secondary); font-weight:bold;">💖 درع رمال طارق بن زياد المطلق!</span> استدعى طارق قائد فرسان الأبي جدار رمال ذهبي شاهق حماك من عواصف الهلاك، مستعيداً <b>${heal} نقاط حياة</b> وجعل جسدك محصناً بالكامل تحت حماية رداء المروءة!`;
        } else if (moveId === 'synergy_boushaki') {
            const heal = Math.floor(state.player.atk * 1.5);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 50);
            blockText = `<span style="color:var(--secondary); font-weight:bold;">💖 النفحة التكتيكية الحكيمة للبطل سيدي بوشاكي!</span> رتل الشيخ دعاء السكينة والتجلي، مستعيداً طهارة عروقك وصحة بدنك بـ <b>${heal} نقاط حياة</b> و <b>50 تركيز (عزيمة)</b>!`;
        } else if (moveId === 'synergy_fatima') {
            dmg = Math.floor(state.player.atk * 2.2);
            enemy.atk = Math.max(1, Math.floor(enemy.atk * 0.6));
            blockText = `<span style="color:var(--secondary); font-weight:bold;">💖 بصيرة فاطمة الفلكية وحساب الأسطرلاب المذهل!</span> رصدت فاطمة مسارات النجوم الحارقة وخطوط الفلك، صاعقة ${enemy.name} بـ <b>${dmg} ضرر تركيزي</b> من شهاب عاتٍ وضعفت هجومه للأبد!`;
        } else {
            dmg = Math.floor(state.player.atk * 2.0);
            const heal = Math.floor(dmg * 0.15);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
            blockText = `<span style="color:var(--secondary); font-weight:bold;">💖 ضربة التآزر المشترك والنفس الواحدة الملحمية!</span> ضربتما معاً في تناغم أسطوري ومثالي، مسببين <b>${dmg} ضرر</b> واستعدت <b>${heal} نقاط حياة</b>!`;
        }

        enemy.hp = Math.max(0, enemy.hp - dmg);
        
        narrate(blockText, "النظام", null, false, true);
        updateTopBar(); updateMomentumUI();
        
        if (window.AUDIO) window.AUDIO.playEffect('combat_hit');
        if (dmg > 0) {
            window.COMBAT_UI?.showDamage(dmg, 'enemy');
            let synergyParticle = 'magic_burst';
            if (moveId === 'synergy_wukong') {
                synergyParticle = 'execution';
                triggerFlash('damage');
            } else if (moveId === 'synergy_tariq') {
                synergyParticle = 'guard_break';
                triggerFlash('damage');
            } else if (moveId === 'synergy_boushaki') {
                synergyParticle = 'heal';
                triggerFlash('heal');
            } else if (moveId === 'synergy_fatima') {
                synergyParticle = 'magic';
                triggerFlash('jade');
            }
            window.COMBAT_UI?.playEffect(synergyParticle, 'enemy');
            
            // Dramatic lighting for synergy
            const overlay = document.getElementById('combat-lighting-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
                setTimeout(() => overlay.style.opacity = '0', 600);
            }
            const pPortrait = document.getElementById('story-portrait');
            if (pPortrait) {
                pPortrait.classList.add('combat-spotlight', 'anim-attack-player');
                setTimeout(() => pPortrait.classList.remove('combat-spotlight', 'anim-attack-player'), 600);
            }
            const ePortrait = document.getElementById('story-enemy-portrait');
            if (ePortrait) {
                ePortrait.classList.add('combat-spotlight', 'anim-hit');
                setTimeout(() => ePortrait.classList.remove('combat-spotlight', 'anim-hit'), 600);
            }
        }
        
        let enemyDmg = 0;
        if (!state.skipEnemyTurn && !state.player_invulnerable_turn) {
            enemyDmg = Math.max(1, Math.floor(enemy.atk * 0.8 - state.player.def * 0.2));
            state.player.hp = Math.max(0, state.player.hp - enemyDmg);
            window.COMBAT_UI?.showDamage(enemyDmg, 'player');
            window.COMBAT_UI?.playEffect('slash', 'player');
            triggerScreenShake(); triggerFlash('damage'); 
            const pPortrait = document.getElementById('story-portrait');
            if (pPortrait) {
                pPortrait.classList.add('anim-hit-player');
                setTimeout(() => pPortrait.classList.remove('anim-hit-player'), 400);
            }
        }
        state.player_invulnerable_turn = false;
        state.skipEnemyTurn = false;
        
        setTimeout(() => {
            if (state.player.hp <= 0) {
                state._combatLock = false; handleDefeat();
            } else if (enemy.hp <= 0) {
                state._combatLock = false; handleVictory();
            } else {
                state._combatLock = false; combatLoop();
            }
        }, 1800);
        return;
    }

    const result = window.COMBAT ? window.COMBAT.resolveMove(moveId, enemy.nextMove, state.player.atk, enemy.atk, enemy, state) : { playerDmg: 10, enemyDmg: 5, resultText: 'صدام عظيم!' };
    
    // Handle Tamed result
    if (result.special === 'tamed') {
        narrate(result.resultText, "النظام");
        if (window.PETS) window.PETS.tame(state, enemy.id);
        setTimeout(() => { state._combatLock = false; handleVictory(); }, 1500);
        return;
    }

    // Mythology 6-piece Set: Supreme Sovereign Life-steal
    if (state.player.supremeSovereignActive && (result.playerDmg || 0) > 0 && state.player.hp < state.player.maxHp) {
        const stealAmt = Math.max(1, Math.floor(result.playerDmg * 0.15));
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + stealAmt);
        result.resultText += `<br><span style="color:var(--danger); font-weight:bold;">👑 السيادة المطلقة للخليفة:</span> سرقت وامتصيت <b>${stealAmt} نقاط حياة</b> من جوهر حياة ${enemy.name}.`;
        updateTopBar();
        triggerFlash('heal');
    }

    enemy.hp = Math.max(0, enemy.hp - (result.playerDmg || 0));
    state.player.hp = Math.max(0, state.player.hp - (result.enemyDmg || 0));
    state.momentum = Math.max(-100, Math.min(100, (state.momentum || 0) + (result.momentumShift || 0)));
    
    narrate(result.resultText, 'النظام', null, false, true);
    updateTopBar(); updateMomentumUI();
    
    // Play procedural combat audio
    if (window.AUDIO) {
        if ((result.playerDmg || 0) > 0 || (result.enemyDmg || 0) > 0) {
            window.AUDIO.playEffect('combat_hit');
        } else {
            window.AUDIO.playEffect('combat_block');
        }
    }
    
    if (result.playerDmg > 0) {
        window.COMBAT_UI?.showDamage(result.playerDmg, 'enemy');
        let particleType = 'slash';
        const skillDef = window.SKILLS?.techniques?.[moveId];
        if (skillDef?.type === 'magic') particleType = 'magic_burst';
        else if (skillDef?.type === 'heavy') particleType = 'execution';
        
        window.COMBAT_UI?.playEffect(particleType, 'enemy');
        triggerVisualHitEffect(moveId, false);
        
        // CSS Avatar Animations
        const pPortrait = document.getElementById('story-portrait');
        if (pPortrait) {
            pPortrait.classList.add('anim-attack-player');
            setTimeout(() => pPortrait.classList.remove('anim-attack-player'), 350);
        }
        const ePortrait = document.getElementById('story-enemy-portrait');
        if (ePortrait) {
            ePortrait.classList.add('anim-hit');
            setTimeout(() => ePortrait.classList.remove('anim-hit'), 400);
        }
        
        // Critical Light Spotlight
        if (result.special === 'crit') {
            const overlay = document.getElementById('combat-lighting-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
                setTimeout(() => overlay.style.opacity = '0', 300);
            }
            if (ePortrait) {
                ePortrait.classList.add('combat-spotlight');
                setTimeout(() => ePortrait.classList.remove('combat-spotlight'), 300);
            }
        }
    } else if (result.playerDmg === 0 && moveId !== 'tame' && !moveId.startsWith('synergy')) {
        // Player Dodged/Missed
        const pPortrait = document.getElementById('story-portrait');
        if (pPortrait) {
            pPortrait.classList.add('anim-dodge-player');
            setTimeout(() => pPortrait.classList.remove('anim-dodge-player'), 500);
        }
    }
    
    if (result.enemyDmg > 0) { 
        window.COMBAT_UI?.showDamage(result.enemyDmg, 'player');
        window.COMBAT_UI?.playEffect(enemy.nextMove === 'magic' ? 'magic_burst' : 'slash', 'player');
        triggerScreenShake(); triggerFlash('damage'); 
        triggerVisualHitEffect(moveId, true);
        
        const ePortrait = document.getElementById('story-enemy-portrait');
        if (ePortrait) {
            ePortrait.classList.add('anim-attack');
            setTimeout(() => ePortrait.classList.remove('anim-attack'), 350);
        }
        const pPortrait = document.getElementById('story-portrait');
        if (pPortrait) {
            pPortrait.classList.add('anim-hit-player');
            setTimeout(() => pPortrait.classList.remove('anim-hit-player'), 400);
        }
    } else if (result.enemyDmg === 0 && moveId !== 'tame' && !moveId.startsWith('synergy')) {
        // Enemy Dodged/Missed
        const ePortrait = document.getElementById('story-enemy-portrait');
        if (ePortrait) {
            ePortrait.classList.add('anim-dodge');
            setTimeout(() => ePortrait.classList.remove('anim-dodge'), 500);
        }
    }

    // Decrement skill cooldowns at the end of each active round
    if (state.skillCooldowns) {
        for (const sId in state.skillCooldowns) {
            if (state.skillCooldowns[sId] > 0) {
                state.skillCooldowns[sId]--;
            }
        }
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
    narrate(`النصر الحاسم! لقد سحقت وهزمت ${enemy.name} في معركة أسطورية.`, 'النظام');

    // Track quest progress for bandit defeats and raid defeats
    if (state && state.player) {
        state.player.questProgress = state.player.questProgress || { caravanMoves: 0, refines: 0, oasisUpgrades: 0, banditKills: 0, raidKills: 0 };
        if (enemy && enemy.name === "زعيم قطاع الطرق المغيرين") {
            state.player.questProgress.raidKills = (state.player.questProgress.raidKills || 0) + 1;
        } else if (enemy && (enemy.name === "قاطع طريق البرية الجسور" || enemy.name === "قاطع طريق الفيافي الجسور" || enemy.name.includes("قاطع طريق"))) {
            state.player.questProgress.banditKills = (state.player.questProgress.banditKills || 0) + 1;
        }
        if (window.QUESTS) window.QUESTS.updateQuests(state);
    }
    
    // Check if this was a breakthrough Heavenly Tribulation
    if (state._pendingBreakthroughStage && window.CULTIVATION) {
        const msg = window.CULTIVATION.completeBreakthrough(state, state._pendingBreakthroughStage);
        state._pendingBreakthroughStage = null;
        narrate(msg, "النظام", null, false, true);
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
        calculateTotalStats();
        updateTopBar();
        saveGame();
    }
    
    // Check if this was a family rescue crisis mission
    let rescuedMember = null;
    if (state.player.family) {
        rescuedMember = state.player.family.find(f => f._pendingRescue);
    }
    if (rescuedMember) {
        rescuedMember.crisis = null;
        rescuedMember._pendingRescue = null;
        rescuedMember.affinity = Math.min(100, rescuedMember.affinity + 30);
        narrate(`<b>نجاح باهر لمهمة الإنقاذ!</b> لقد حررت وفككت أسر <b>${rescuedMember.name}</b> من براثن الخطر المحدق! الألفة معه الآن هي <b>${rescuedMember.affinity}%</b>.`, "النظام", null, false, true);
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
        calculateTotalStats();
        updateTopBar();
        saveGame();
    }
    
    if (typeof state.exploreStreak !== 'number') state.exploreStreak = 0;
    const streakMult = 1 + (state.exploreStreak * 0.05);
    
    const xpBase = window.BALANCE ? window.BALANCE.xpForEnemy(enemy.minLevel || 1) : 50;
    const bg = state.player.background || {};
    const xpReward = Math.floor(xpBase * (bg.xpMult || 1) * streakMult * (1 + (state.player.xpGainBonus || 0)));
    
    let baseGoldMult = (state.player.goldMult || 1.0);
    const realmIdx = window.CULTIVATION ? window.CULTIVATION.stages.findIndex(s => s.name === state.player.cultivation?.stage) : -1;
    if (realmIdx >= 6) { // أمير القوافل والبادية (+30% غنائم ذهب)
        baseGoldMult += 0.30;
    }
    const goldReward = Math.floor((enemy.minLevel || 1) * 13 * (1 + Math.random()) * streakMult * baseGoldMult);

    if (realmIdx >= 7) { // المقاتل الأسطوري المهيب (+20% شفاء بعد سحق العدو)
        const healAmt = Math.floor(state.player.maxHp * 0.20);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmt);
        narrate(`<span style="color:#ff3b30; font-weight:bold;">[سورة النخوة والغضب الملحمية]:</span> التقطت أنفاسك واستعدت <b>${healAmt} نقاط حياة</b> إثر انتصارك الأسطوري!`, "النظام", null, false, true);
    }
    
    state.player.xp += xpReward;
    state.player.gold += goldReward;
    
    let victoryMsg = `<div style="background:rgba(0,229,160,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); margin-bottom:15px; text-align:left;">
        <b style="color:var(--jade); font-size:1.15rem; letter-spacing:1px; font-family:'Cinzel';">🏆 انتصار مجيد في المعركة</b><br>
        ${state.exploreStreak > 0 ? `<small style="color:var(--secondary)">🔥 تتابع الاستكشاف المتواصل: ${state.exploreStreak} (مكافأة إضافية +${Math.round(state.exploreStreak * 5)}%)</small><br>` : ''}<br>
        حصلت على <b>${xpReward} خبرة بدنية</b> و <b>${goldReward} دينار ذهبي</b>.
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
        victoryMsg += `<br><span style="color:var(--secondary)">🎁 عثرت على خامة:</span> <b class="loot-refined">${matName === 'SPIRIT HERB' ? 'عشبة المانا' : matName === 'IRON ORE' ? 'خام الحديد الدمشقي' : matName === 'MONSTER CORE' ? 'قلب وحش البراري' : matName === 'DRAGON VEIN SHARD' ? 'شظية عرق التنين' : 'حرير سماوي خالد'}</b> (أضيفت لصرة الحقيبة)`;
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
            victoryMsg += `<br><span style="color:var(--secondary)">🗡️ عثرت على عتاد:</span> <b class="${qClass}">[${proto.quality === 'refined' ? 'مصفى' : proto.quality === 'epic' ? 'ملحمي' : proto.quality === 'legendary' ? 'أسطوري' : 'شائع'}] ${proto.name}</b> (يمكن ارتداؤه)`;
        }
    }

    victoryMsg += `</div>`;
    narrate(victoryMsg, "النظام", null, false, true);

    let leveledUp = false;
    while (state.player.xp >= state.player.maxXp) { 
        state.player.lvl++; 
        state.player.xp -= state.player.maxXp; 
        state.player.maxXp = window.BALANCE && window.BALANCE.calculateMaxXp ? window.BALANCE.calculateMaxXp(state.player.lvl) : Math.floor(150 + Math.pow(state.player.lvl, 1.8) * 40); 
        leveledUp = true;
    }
    if (leveledUp) {
        calculateTotalStats(); 
        narrate(`<span class='loot-epic'><b>🌟 ارتقاء عظيم في الهمة والتركيز!</b> لقد طهرت تركيزك وهمتك ووصلت خلوتك البدنية إلى ذروة جديدة وجبارة (مستوى ${state.player.lvl}). زادت قدراتك البدنية والروحية بشكل جبار!</span>`, "النظام", null, false, true); 
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
    }
    
    state.exploreStreak++;
    state.currentEnemy = null;
    updateTopBar();
    saveGame(); 
    
    if (rescuedMember) {
        setChoices([
            { text: "↩ عودة إلى ديوان إدارة العائلة", callback: showManagementScreen }
        ]);
        return;
    }

    const activeRegion = state.player.currentRegion || 'crossroads';
    setChoices([
        { text: `⚔️ المغامرة بشكل أعمق (+${state.exploreStreak * 5}% مكافأة)`, callback: () => exploreRegion(activeRegion) },
        { text: "↩ عودة إلى واحة التقاطع", callback: () => {
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
    
    narrate(`<b>الهزيمة المرة!</b> لقد سقطت مغشياً عليك في المعركة. عثر عليك فارس جوال ذو بصيرة في الصحراء وقام بسحب جسدك المنهك وداوى جراحك ليعيدك لواحة التقاطع بأمان.<br><br><b>العقوبة:</b> خسرت <span style="color:var(--secondary)">${goldPenalty} دينار ذهبي</span>. وتم إنعاشك بنصف طاقتك وجوهر حياتك.`, "النظام");
    
    setChoices([{ text: "قف على قدميك واستمر في طريقك", callback: hubLoop }]);
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
        bAtk += 15;
    } else if (cls === 'Medicine Cultivator') {
        bHp += 50;
        bDef += 5;
        bMp += 10;
    } else if (cls === 'Sufi Mystic') {
        bMp += 50;
        bAtk += 4;
    } else if (cls === 'Desert Knight') {
        bDef += 18;
        bHp += 30;
    } else if (cls === 'Steelmaster') {
        bAtk += 10;
        bDef += 8;
        bHp += 10;
    } else if (cls === 'Horseman') {
        bAtk += 6;
        bDef += 4;
        bHp += 15;
        bMp += 5;
    } else if (cls === 'Astrologer') {
        bMp += 70;
        bHp += 5;
    } else if (cls === 'Lancer') {
        bAtk += 12;
        bDef += 2;
        bHp += 5;
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

    // Body Refinement Stature Bonuses
    if (state.player.cultivation?.bodyRealm && window.CULTIVATION?.bodyRealms) {
        const bodyRealmName = state.player.cultivation.bodyRealm;
        const currentIdx = window.CULTIVATION.bodyRealms.findIndex(r => r.name === bodyRealmName);
        if (currentIdx !== -1) {
            for (let i = 0; i <= currentIdx; i++) {
                const b = window.CULTIVATION.bodyRealms[i].bonus;
                bHp += b.hp ?? 0;
                bDef += b.def ?? 0;
            }
        }
    }

    // 3. Faction Benefits
    const rank = state.player.factionRank ?? 1;
    if (state.player.faction === 'Jade Summit Sect' || state.player.faction === 'طائفة قمة اليشم العظمى') {
        bAtk += (baseAtk * 0.1 * rank);
    } else if (state.player.faction === 'Sufi Order of the Empty Quarter' || state.player.faction === 'طريقة رابطة أبطال الربع الخالي' || state.player.faction === 'فرسان الربع الخالي الأحرار') {
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

    // 5.5 Apply Inherited Lineage Trait dynamic bonuses
    if (state.player.inheritedTrait && window.REBIRTH && window.REBIRTH.traits) {
        const activeTrait = window.REBIRTH.traits[state.player.inheritedTrait];
        if (activeTrait && activeTrait.bonus) {
            if (activeTrait.bonus.hp) bHp += Math.floor(baseMaxHp * activeTrait.bonus.hp);
            if (activeTrait.bonus.atk) bAtk += Math.floor(baseAtk * activeTrait.bonus.atk);
            if (activeTrait.bonus.def) bDef += Math.floor(baseDef * activeTrait.bonus.def);
            if (activeTrait.bonus.crit) state.player.critRate = (state.player.critRate || 0.05) + activeTrait.bonus.crit;
            if (activeTrait.bonus.goldMult) state.player.goldMult = (state.player.goldMult || 1.0) + activeTrait.bonus.goldMult;
            if (activeTrait.bonus.xpMult) state.player.xpGainBonus = (state.player.xpGainBonus || 0) + activeTrait.bonus.xpMult;
        }
    }

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
    if (setCounts.xianxia >= 3) {
        eqAtkMult += 0.40;
        eqDefMult += 0.30;
        state.player.immortalAscensionActive = true;
    } else if (setCounts.xianxia >= 2) {
        eqAtkMult += 0.15;
        eqDefMult += 0.10;
        state.player.immortalAscensionActive = false;
    } else {
        state.player.immortalAscensionActive = false;
    }

    // Vedic Set: Focus ATK / HP
    if (setCounts.vedic >= 3) {
        eqAtkMult += 0.35;
        eqHpMult += 0.35;
        state.player.supremeMantraActive = true;
    } else if (setCounts.vedic >= 2) {
        eqAtkMult += 0.15;
        eqHpMult += 0.15;
        state.player.supremeMantraActive = false;
    } else {
        state.player.supremeMantraActive = false;
    }

    // Silk Road Set: Focus HP / MP
    if (setCounts.silk_road >= 3) {
        eqHpMult += 0.40;
        eqMpMult += 0.40;
        state.player.silkOasisActive = true;
    } else if (setCounts.silk_road >= 2) {
        eqHpMult += 0.15;
        eqMpMult += 0.15;
        state.player.silkOasisActive = false;
    } else {
        state.player.silkOasisActive = false;
    }

    // Mythology Set: Focus ATK / DEF
    if (setCounts.mythology >= 3) {
        eqAtkMult += 0.50;
        eqDefMult += 0.40;
        state.player.supremeSovereignActive = true;
    } else if (setCounts.mythology >= 2) {
        eqAtkMult += 0.20;
        eqDefMult += 0.15;
        state.player.supremeSovereignActive = false;
    } else {
        state.player.supremeSovereignActive = false;
    }

    // 8. Individual Equipment Flat Stats with MMORPG Quality, Level, and Refine Scaling
    Object.values(state.player.equipment ?? {}).forEach(item => {
        if (!item) return;
        const s = item.stats ?? {};
        
        // Base quality multipliers
        const qualityMults = { normal: 1.0, refined: 1.35, unique: 1.75, elite: 2.30, super: 3.20 };
        const q = item.quality || 'normal';
        const qMult = qualityMults[q] || 1.0;

        // Level multipliers
        const itemLvl = item.lvl || 15;
        const lvlMult = 1.0 + (itemLvl - 15) * 0.015;

        // Base scaled stats
        let itemAtk = Math.floor((s.atk ?? 0) * qMult * lvlMult);
        let itemDef = Math.floor((s.def ?? 0) * qMult * lvlMult);
        let itemHp = Math.floor((s.hp ?? 0) * qMult * lvlMult);
        let itemMp = Math.floor((s.mp ?? 0) * qMult * lvlMult);

        // Refine Level flat bonuses (+1 to +12)
        const ref = item.refine || 0;
        if (ref > 0) {
            if (item.slot === 'weapon') itemAtk += (ref * 35);
            else if (item.slot === 'body' || item.slot === 'legs') itemDef += (ref * 20);
            else itemHp += (ref * 60);
        }

        bAtk += itemAtk;
        bDef += itemDef;
        bHp += itemHp;
        bMp += itemMp;
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

    // 9.5 Spiritual Roots Flat Stats & Class Bases
    let baseCrit = 0.05;
    let baseDodge = 0.05;
    if (cls === 'Sword Immortal') baseCrit = 0.15;
    if (cls === 'Desert Knight') baseDodge = 0.10;
    if (cls === 'Sufi Mystic') baseDodge = 0.15;
    if (cls === 'Steelmaster') { baseCrit = 0.10; baseDodge = 0.05; }
    if (cls === 'Horseman') { baseCrit = 0.08; baseDodge = 0.18; }
    if (cls === 'Astrologer') { baseCrit = 0.05; baseDodge = 0.10; }
    if (cls === 'Lancer') { baseCrit = 0.20; baseDodge = 0.05; }

    if (state.dwelling && state.dwelling.roots) {
        const r = state.dwelling.roots;
        bAtk += (r.gold || 0) * 10;
        bHp += (r.wood || 0) * 50;
        bDef += (r.water || 0) * 8;
        bMp += (r.earth || 0) * 25;
        state.player.critRate = baseCrit + (r.fire || 0) * 0.01;
    } else {
        state.player.critRate = baseCrit;
    }
    state.player.dodgeRate = baseDodge;

    // 9.7 Realm-Specific Passive Bonuses
    const stageIdx = window.CULTIVATION ? window.CULTIVATION.stages.findIndex(s => s.name === state.player.cultivation?.stage) : -1;
    if (stageIdx === 5) { // سيد النصال والديوان: غليان عروق الفرسان (+15% Crit Rate)
        state.player.critRate = (state.player.critRate || 0.05) + 0.15;
    }
    if (stageIdx === 6) { // أمير القوافل والبادية: زيادة العزيمة القصوى (+50)
        bMp += 50;
    }

    // 9.8 Weather Modifiers
    let wAtkMult = 1;
    if (window.WEATHER_SYSTEM && typeof window.WEATHER_SYSTEM.getModifiers === 'function') {
        const wMods = window.WEATHER_SYSTEM.getModifiers();
        wAtkMult = wMods.atkMult || 1;
        state.player.critRate = (state.player.critRate || 0) + (wMods.accuracyBonus || 0);
        state.player.dodgeRate = (state.player.dodgeRate || 0) + (wMods.dodgeBonus || 0);
    }

    // 10. Final Application
    state.player.atk = Math.floor((baseAtk + bAtk) * totalStatMult * eqAtkMult * wAtkMult);
    state.player.def = Math.floor((baseDef + bDef) * totalStatMult * eqDefMult);
    state.player.maxHp = Math.floor((baseMaxHp + bHp) * totalHpMult * eqHpMult);
    state.player.maxMp = Math.floor((baseMaxMp + bMp) * eqMpMult);
    
    state.player.hp = Math.min(state.player.hp ?? 0, state.player.maxHp);
    state.player.mp = Math.min(state.player.mp ?? 0, state.player.maxMp);

    // Dynamic Skill Unlocks Check
    if (window.SKILLS) {
        window.SKILLS.checkUnlocks(state);
    }
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
    
    let flatAtk = 0;
    let flatDef = 0;
    let flatHp = 0;
    let flatMp = 0;
    
    const slots = ['head', 'body', 'legs', 'boots', 'weapon', 'relic'];
    slots.forEach(s => {
        const item = state.player.equipment[s];
        const nameEl = document.getElementById(`eq-${s}-name`);
        const statsEl = document.getElementById(`eq-${s}-stats`);
        const tooltipEl = document.getElementById(`eq-${s}-tooltip`);
        
        if (nameEl) {
            nameEl.textContent = item ? item.name : 'لا يوجد';
            if (item && item.quality) {
                const qClass = `loot-${item.quality.toLowerCase()}`;
                nameEl.className = qClass;
                // Add badge if part of set
                if (item.set) {
                    nameEl.innerHTML += ` <span style="font-size:0.65rem; padding: 2px 4px; background: rgba(212,175,55,0.15); border: 1px solid var(--secondary); border-radius: 4px; color: var(--secondary); margin-left: 5px;">${item.set === 'xianxia' ? 'يشم الملوك' : item.set === 'vedic' ? 'الورد القدسي' : item.set === 'silk_road' ? 'درب القوافل' : 'أساطير الشرق'}</span>`;
                }
            } else {
                nameEl.className = '';
                nameEl.style.color = 'var(--text-dim)';
            }
        }
        
        if (item) {
            const stats = item.stats ?? {};
            // Base quality multipliers
            const qualityMults = { normal: 1.0, refined: 1.35, unique: 1.75, elite: 2.30, super: 3.20 };
            const q = item.quality || 'normal';
            const qMult = qualityMults[q] || 1.0;

            // Level multipliers
            const itemLvl = item.lvl || 15;
            const lvlMult = 1.0 + (itemLvl - 15) * 0.015;

            // Base scaled stats
            let itemAtk = Math.floor((stats.atk ?? 0) * qMult * lvlMult);
            let itemDef = Math.floor((stats.def ?? 0) * qMult * lvlMult);
            let itemHp = Math.floor((stats.hp ?? 0) * qMult * lvlMult);
            let itemMp = Math.floor((stats.mp ?? 0) * qMult * lvlMult);

            // Refine Level flat bonuses (+1 to +12)
            const ref = item.refine || 0;
            if (ref > 0) {
                if (item.slot === 'weapon') itemAtk += (ref * 35);
                else if (item.slot === 'body' || item.slot === 'legs') itemDef += (ref * 20);
                else itemHp += (ref * 60);
            }

            flatAtk += itemAtk;
            flatDef += itemDef;
            flatHp += itemHp;
            flatMp += itemMp;

            if (statsEl) {
                let statText = [];
                if (itemAtk) statText.push(`+${itemAtk} هجوم`);
                if (itemDef) statText.push(`+${itemDef} دفاع`);
                if (itemHp) statText.push(`+${itemHp} صحة`);
                if (itemMp) statText.push(`+${itemMp} مانا`);
                statsEl.textContent = statText.join(', ');
            }

            // Create individual slot tooltip
            if (tooltipEl) {
                const qualityArabic = q === 'normal' ? 'عادي (Normal)' : q === 'refined' ? 'مصقول (Refined)' : q === 'unique' ? 'نادر (Unique)' : q === 'elite' ? 'نخبة (Elite)' : 'خارق (Super)';
                const setNames = { xianxia: 'يشم الملوك', vedic: 'الورد القدسي', silk_road: 'درب القوافل', mythology: 'أساطير الشرق' };
                const setName = item.set ? setNames[item.set] : 'لا يوجد طقم';
                
                let itemStatsHtml = '';
                if (itemAtk) itemStatsHtml += `<div style="display:flex; justify-content:space-between; color:#ffcc00; margin-bottom:3px; font-weight:bold;"><span>🗡️ هجوم بدني:</span> <span>+${itemAtk}</span></div>`;
                if (itemDef) itemStatsHtml += `<div style="display:flex; justify-content:space-between; color:#00ffcc; margin-bottom:3px; font-weight:bold;"><span>🛡️ دفاع الجسد:</span> <span>+${itemDef}</span></div>`;
                if (itemHp) itemStatsHtml += `<div style="display:flex; justify-content:space-between; color:#ff4d4d; margin-bottom:3px; font-weight:bold;"><span>❤️ الصحة القصوى:</span> <span>+${itemHp}</span></div>`;
                if (itemMp) itemStatsHtml += `<div style="display:flex; justify-content:space-between; color:#33ccff; margin-bottom:3px; font-weight:bold;"><span>✨ التركيز والمانا:</span> <span>+${itemMp}</span></div>`;

                tooltipEl.innerHTML = `
                    <div style="border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:6px; margin-bottom:8px; text-align:right;">
                        <span style="font-size:0.68rem; text-transform:uppercase; color:var(--secondary); font-weight:bold; letter-spacing:0.5px;">تجهيز slot: ${s.toUpperCase()}</span>
                        <h4 style="margin:2px 0 0 0; color:#fff; font-size:0.92rem; font-family:'Cairo',sans-serif;">${item.name}</h4>
                    </div>
                    <div style="margin-bottom:8px; font-size:0.75rem; color:var(--text-dim); text-align:right;">
                        <div>• جودة العتاد: <span style="color:var(--secondary); font-weight:bold;">${qualityArabic}</span></div>
                        <div>• مستوى العتاد: <span>مستوى ${item.lvl || 1}</span></div>
                        ${ref > 0 ? `<div>• مستوى الصقل: <span style="color:#00ffcc; font-weight:bold;">+${ref}</span></div>` : ''}
                        ${item.set ? `<div>• ينتمي لطقم: <span style="color:var(--secondary); font-weight:bold;">${setName}</span></div>` : ''}
                    </div>
                    <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px; font-family:'Cairo',sans-serif; text-align:right;">
                        <span style="font-size:0.72rem; color:#fff; font-weight:bold; display:block; margin-bottom:4px;">📊 المزايا المضافة لقنوات الجسد:</span>
                        ${itemStatsHtml}
                    </div>
                `;
            }
        } else {
            if (statsEl) statsEl.textContent = '';
            if (tooltipEl) tooltipEl.innerHTML = `<div style="text-align:center; padding:5px; color:var(--text-dim);">لا يوجد عتاد مجهز حالياً في هذا الجزء.</div>`;
        }
    });

    const setCounts = getEquippedSetCounts(state);

    // Update Inline Gear Summary Pill
    const totalsSummaryEl = document.getElementById('gear-totals-summary-inline');
    if (totalsSummaryEl) {
        totalsSummaryEl.innerHTML = `🗡️ هجوم +${flatAtk} | 🛡️ دفاع +${flatDef} | ❤️ صحة +${flatHp} | ⚡ تركيز +${flatMp}`;
    }

    // Update Master Tooltip and Active List
    const summaryTooltipEl = document.getElementById('gear-summary-tooltip');
    if (summaryTooltipEl) {
        let setMultsHtml = '';
        let hasActiveSet = false;
        
        const setDetails = {
            xianxia: {
                name: 'طقم الارتقاء الأبدي (يشم الملوك)',
                color: 'var(--jade)',
                effects: {
                    2: '+15% هجوم، +10% دفاع',
                    3: '⚔️ <b>الارتقاء الأبدي</b>: +40% هجوم، +30% دفاع، ويشفي جسدك تلقائياً بـ 5 نقاط حياة في بداية كل جولة قتال!'
                }
            },
            vedic: {
                name: 'طقم الورد القدسي (الهمة والتركيز)',
                color: '#d4af37',
                effects: {
                    2: '+15% هجوم، +15% صحة',
                    3: '🕉️ <b>الهمة والتركيز العالي</b>: +35% هجوم، +35% صحة، ويقلل استهلاك طاقة التركيز للمهارات بنسبة 20%!'
                }
            },
            silk_road: {
                name: 'طقم درب القوافل (واحة الحرير)',
                color: 'var(--secondary)',
                effects: {
                    2: '+15% صحة، +15% مانا',
                    3: '🐪 <b>واحة الحرير</b>: +40% صحة، +40% مانا، ويزيد كسب خبرة التركيز في المعارك بنسبة 25%!'
                }
            },
            mythology: {
                name: 'طقم أساطير الشرق (السيادة المطلقة)',
                color: 'var(--danger)',
                effects: {
                    2: '+20% هجوم، +15% دفاع',
                    3: '👑 <b>السيادة المطلقة</b>: +50% هجوم، +40% دفاع، ويمنحك امتصاص حياة وسرقة طاقة بنسبة 15% من كل ضربة قتال!'
                }
            }
        };

        Object.entries(setCounts).forEach(([setKey, count]) => {
            if (count > 0) {
                const details = setDetails[setKey];
                let bonusActiveText = '';
                let multDesc = '';
                
                if (setKey === 'xianxia') {
                    if (count >= 3) {
                        multDesc = `<span style="color:var(--jade)">+40% هجوم، +30% دفاع (بركة الارتقاء نشطة)</span>`;
                        bonusActiveText = `<span style="color:var(--success); font-weight:bold;">● نشط [${count}/3]</span>`;
                    } else if (count === 2) {
                        multDesc = `<span style="color:#bbb">+15% هجوم، +10% دفاع</span>`;
                        bonusActiveText = `<span style="color:var(--secondary); font-weight:bold;">● نشط [2/3]</span>`;
                    } else {
                        multDesc = `<span style="color:var(--text-dim)">+15% هجوم، +10% دفاع (يتطلب قطعتين)</span>`;
                        bonusActiveText = `<span style="color:var(--text-dim);">● غير متكامل [1/3]</span>`;
                    }
                } else if (setKey === 'vedic') {
                    if (count >= 3) {
                        multDesc = `<span style="color:#d4af37">+35% هجوم، +35% صحة (بركة الهمة نشطة)</span>`;
                        bonusActiveText = `<span style="color:var(--success); font-weight:bold;">● نشط [${count}/3]</span>`;
                    } else if (count === 2) {
                        multDesc = `<span style="color:#bbb">+15% هجوم، +15% صحة</span>`;
                        bonusActiveText = `<span style="color:var(--secondary); font-weight:bold;">● نشط [2/3]</span>`;
                    } else {
                        multDesc = `<span style="color:var(--text-dim)">+15% هجوم، +15% صحة (يتطلب قطعتين)</span>`;
                        bonusActiveText = `<span style="color:var(--text-dim);">● غير متكامل [1/3]</span>`;
                    }
                } else if (setKey === 'silk_road') {
                    if (count >= 3) {
                        multDesc = `<span style="color:var(--secondary)">+40% صحة، +40% مانا (بركة الواحة نشطة)</span>`;
                        bonusActiveText = `<span style="color:var(--success); font-weight:bold;">● نشط [${count}/3]</span>`;
                    } else if (count === 2) {
                        multDesc = `<span style="color:#bbb">+15% صحة، +15% مانا</span>`;
                        bonusActiveText = `<span style="color:var(--secondary); font-weight:bold;">● نشط [2/3]</span>`;
                    } else {
                        multDesc = `<span style="color:var(--text-dim)">+15% صحة، +15% مانا (يتطلب قطعتين)</span>`;
                        bonusActiveText = `<span style="color:var(--text-dim);">● غير متكامل [1/3]</span>`;
                    }
                } else if (setKey === 'mythology') {
                    if (count >= 3) {
                        multDesc = `<span style="color:var(--danger)">+50% هجوم، +40% دفاع (بركة السيادة نشطة)</span>`;
                        bonusActiveText = `<span style="color:var(--success); font-weight:bold;">● نشط [${count}/3]</span>`;
                    } else if (count === 2) {
                        multDesc = `<span style="color:#bbb">+20% هجوم، +15% دفاع</span>`;
                        bonusActiveText = `<span style="color:var(--secondary); font-weight:bold;">● نشط [2/3]</span>`;
                    } else {
                        multDesc = `<span style="color:var(--text-dim)">+20% هجوم، +15% دفاع (يتطلب قطعتين)</span>`;
                        bonusActiveText = `<span style="color:var(--text-dim);">● غير متكامل [1/3]</span>`;
                    }
                }

                if (count >= 2) hasActiveSet = true;

                setMultsHtml += `
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-right:3px solid ${details.color}; padding:6px 10px; margin-bottom:6px; border-radius:4px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:2px; flex-direction:row-reverse;">
                            <span style="color:${details.color}; font-weight:bold;">${details.name}</span>
                            ${bonusActiveText}
                        </div>
                        <div style="font-size:0.72rem; color:#eee; text-align:right;">${multDesc}</div>
                    </div>
                `;
            }
        });

        if (!hasActiveSet) {
            setMultsHtml = `<div style="text-align:center; font-style:italic; color:var(--text-dim); font-size:0.72rem; padding:10px 0;">لا يوجد أطقم مفعّلة حالياً بالكامل. جهز قطعتين أو أكثر متطابقتين للحصول على البركة الإضافية!</div>`;
        }

        summaryTooltipEl.innerHTML = `
            <div style="border-bottom:1.5px solid var(--secondary); padding-bottom:6px; margin-bottom:10px; text-align:right;">
                <h4 style="margin:0; color:var(--secondary); font-size:0.92rem; font-family:'Cairo',sans-serif;">📜 صحيفة قوة وإضافات المعدات الحالية</h4>
            </div>
            
            <div style="margin-bottom:12px; text-align:right;">
                <span style="font-size:0.78rem; color:#fff; font-weight:bold; display:block; margin-bottom:6px; text-shadow: 0 0 2px #fff;">🛡️ مجموع المزايا الثابتة من القطع مجمعة (Raw Stats):</span>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.74rem; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; border:1px solid rgba(255,255,255,0.04); direction:rtl;">
                    <div style="color:#ffcc00; text-align:right;">🗡️ هجوم كلي: <b>+${flatAtk}</b></div>
                    <div style="color:#00ffcc; text-align:right;">🛡️ دفاع كلي: <b>+${flatDef}</b></div>
                    <div style="color:#ff4d4d; text-align:right;">❤️ صحة إضافية: <b>+${flatHp}</b></div>
                    <div style="color:#33ccff; text-align:right;">⚡ مانا وتركيز كافٍ: <b>+${flatMp}</b></div>
                </div>
            </div>

            <div style="text-align:right;">
                <span style="font-size:0.78rem; color:#fff; font-weight:bold; display:block; margin-bottom:6px;">✨ مضاعفات وبركات الأطقم النشطة (Set Multipliers):</span>
                ${setMultsHtml}
            </div>
            
            <div style="border-top:1px dashed rgba(255,255,255,0.12); padding-top:6px; margin-top:8px; font-size:0.68rem; color:var(--text-dim); text-align:center; font-style:italic;">
                المقادير المضافة السابقة تم صهرها وتكثيفها في حساب إجمالي قوة البدن الحالية للفارس.
            </div>
        `;
    }

    // Populate active set bonuses (legacy panel)
    const activeSetEl = document.getElementById('active-set-bonuses');
    if (activeSetEl) {
        let bonusHtml = '';
        
        const legacySetDetails = {
            xianxia: {
                name: 'الارتقاء الأبدي (يشم الملوك)',
                color: 'var(--jade)',
                effects: {
                    2: '+15% هجوم، +10% دفاع',
                    3: '⚔️ <b>الارتقاء الأبدي</b>: +40% هجوم، +30% دفاع، ويشفي جسدك تلقائياً بـ 5 نقاط حياة في بداية كل جولة قتال!'
                }
            },
            vedic: {
                name: 'التركيز والهمة العظيمة',
                color: '#d4af37',
                effects: {
                    2: '+15% هجوم، +15% صحة',
                    3: '🕉️ <b>الهمة والتركيز العالي</b>: +35% هجوم، +35% صحة، ويقلل استهلاك طاقة التركيز للمهارات بنسبة 20%!'
                }
            },
            silk_road: {
                name: 'واحة الحرير (درب القوافل)',
                color: 'var(--secondary)',
                effects: {
                    2: '+15% صحة، +15% مانا',
                    3: '🐪 <b>واحة الحرير</b>: +40% صحة، +40% مانا، ويزيد كسب خبرة التركيز في المعارك بنسبة 25%!'
                }
            },
            mythology: {
                name: 'السيادة المطلقة (أساطير الشرق)',
                color: 'var(--danger)',
                effects: {
                    2: '+20% هجوم، +15% دفاع',
                    3: '👑 <b>السيادة المطلقة</b>: +50% هجوم، +40% دفاع، ويمنحك امتصاص حياة وسرقة طاقة بنسبة 15% من كل ضربة قتال!'
                }
            }
        };

        let hasAnyBonus = false;
        Object.entries(setCounts).forEach(([setKey, count]) => {
            if (count >= 2) {
                hasAnyBonus = true;
                const details = legacySetDetails[setKey];
                let currentBonusText = '';
                if (count >= 3) currentBonusText = details.effects[3];
                else currentBonusText = details.effects[2];

                bonusHtml += `<div style="margin-bottom: 8px; padding: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px;">
                    <span style="color:${details.color}; font-weight:bold;">${details.name} [${count}/3]</span><br>
                    <span style="color:#fff; font-size:0.75rem;">${currentBonusText}</span>
                </div>`;
            }
        });

        if (!hasAnyBonus) {
            bonusHtml = `<div style="text-align:center; color:var(--text-dim); padding:10px 0;">مفيش مكافآت طقم نشطة. البس قطعتين أو أكتر متطابقتين لتفعيل البركات الجبارة!</div>`;
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
    
    const factionBenefit = state.player.faction === 'Jade Summit Sect' ? '+10% هجوم' : '+10% مانا بدنية';
    const factionText = state.player.faction ? `<br><b>الطائفة:</b> ${(state.player.faction === 'Jade Summit Sect' || state.player.faction === 'طائفة قمة اليشم العظمى') ? 'طائفة قمة اليشم العظمى' : 'فرسان الربع الخالي الأحرار'} (المرتبة ${state.player.factionRank})<br><small style="color:var(--jade)">المنفعة البدنية: ${factionBenefit} لكل مرتبة</small>` : '';

    narrate(`<div style="background:rgba(0,0,0,0.5);padding:15px;border-radius:10px;border:1px solid var(--secondary)">
        <b>الفارس السالك:</b> ${state.player.name} | مستوى ${state.player.lvl}<br>
        <b>الأحجار البدنية:</b> ${state.player.gold} | <b>جوهر الكارما:</b> ${state.player.karma}${factionText}
    </div>`, "النظام", null, false, true);
    
    const slots = Object.keys(state.player.equipment).filter(s => ['head', 'body', 'legs', 'boots', 'weapon', 'relic'].includes(s));
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:15px 0;">';
    slots.forEach(s => {
        const item = state.player.equipment[s];
        const slotArabic = s === 'head' ? 'الرأس' : s === 'body' ? 'الدرع' : s === 'legs' ? 'الرداء' : s === 'boots' ? 'الحذاء' : s === 'weapon' ? 'السيف' : 'الأثر';
        html += `<div class="inventory-slot" onclick="unequipItem('${s}')" style="height:70px;cursor:pointer;flex-direction:column;border-color:${item?'var(--secondary)':'#333'}">
            <span style="font-size:0.5rem;opacity:0.5;">${slotArabic}</span>
            <div style="font-size:0.8rem;color:${item?'#fff':'#555'}">${item ? item.name : 'فارغ'}</div>
        </div>`;
    });
    html += '</div>';
    narrate(html, "النظام", null, false, true);
    
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
                div.innerHTML = `<span style="color:var(--secondary)">بيع: ${item.name}</span><br><small>${sellPrice} دينار ذهبي</small>`;
                div.onclick = () => {
                    const res = window.SHOP.sell(state, realIndex);
                    narrate(res.message, "النظام");
                    switchSatchelTab(tab);
                    updateTopBar();
                };
            } else {
                const slotArabic = item.slot === 'head' ? 'الرأس' : item.slot === 'body' ? 'الدرع' : item.slot === 'legs' ? 'الرداء' : item.slot === 'boots' ? 'الحذاء' : item.slot === 'weapon' ? 'السيف' : item.slot === 'relic' ? 'الأثر' : 'جرعة استهلاك';
                div.innerHTML = `<b>${item.name}</b><br><small>${slotArabic}</small>`;
                div.onclick = () => {
                    if (item.slot) equipItem(realIndex);
                    else if (item.effect) {
                        if (item.effect.hp) state.player.hp = Math.min(state.player.maxHp, state.player.hp + item.effect.hp);
                        if (item.effect.mp) state.player.mp = Math.min(state.player.maxMp, state.player.mp + item.effect.mp);
                        state.player.inventory.items.splice(realIndex, 1);
                        narrate(`استخدمت ${item.name} بنجاح وداويت جراح تركيزك وهمتك.`, "النظام");
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
            const matArabic = k === 'spirit_herb' ? 'عشبة المانا' : k === 'iron_ore' ? 'خام الحديد الدمشقي' : k === 'monster_core' ? 'قلب وحش البراري' : k === 'dragon_vein_shard' ? 'شظية عرق التنين' : k === 'celestial_silk' ? 'حرير سماوي خالد' : k.replace(/_/g,' ');
            div.innerHTML = `${matArabic}: <b>x${v}</b>`;
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
