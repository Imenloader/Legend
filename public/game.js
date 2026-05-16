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
    settings: {
        perspective: 'second' // 'first' or 'second'
    },
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
        karma: 0, // -100 Demonic to 100 Righteous
        gold: 50, // starting gold
        inventory: {
            potions: 2,
            elixirs: 0,
            items: [],
            materials: {}
        },
        equipment: {
            weapon: null,
            armor: null,
            relic: null
        },
        cultivation: {
            stage: 'Qi Condensation',
            stageLevel: 1,
            breakthroughReady: false
        }
    },
    companion: null,
    companions: {}, // { id: { affinity, memories, active, questStarted } }
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

    // Generate UUID if first time
    if (!localStorage.getItem('rpg_player_id')) {
        localStorage.setItem('rpg_player_id', state.playerId);
    }
    
    // Bind Menu Start Button
    document.getElementById('start-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('char-name').value;
        const perspective = document.getElementById('perspective-select').value;
        if (nameInput) {
            state.player.name = nameInput;
            const creationNameInput = document.getElementById('player-name');
            if (creationNameInput) creationNameInput.value = nameInput;
        }
        state.settings.perspective = perspective;
        
        showScreen('creation-screen');
    });

    // Bind Character Creation Button
    document.getElementById('create-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('player-name').value;
        if (nameInput) state.player.name = nameInput;

        // Get selected class
        const selectedCard = document.querySelector('.class-card.selected');
        if (selectedCard) {
            state.player.class = selectedCard.dataset.class;
            state.player.sprite = selectedCard.dataset.sprite;
            
            // Set base stats based on class
            if (state.player.class === 'Sword Immortal') {
                state.player.atk += 5; state.player.crit = 0.15;
            } else if (state.player.class === 'Medicine Cultivator') {
                state.player.maxHp += 30; state.player.hp = state.player.maxHp;
            } else if (state.player.class === 'Sufi Mystic') {
                state.player.maxMp += 20; state.player.mp = state.player.maxMp;
            }
        }

        initGame();
    });

    // Setup class cards keyboard and click interaction
    document.querySelectorAll('.class-card').forEach(card => {
        const toggleClassCard = () => {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };
        card.addEventListener('click', toggleClassCard);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleClassCard();
            }
        });
    });

    // Attempt to load cloud save silently
    await loadGameCloud();
});

// --- Core Narrative Engine ---
function parsePerspective(text) {
    if (state.settings.perspective === 'first') {
        return text
            .replace(/\bYourself\b/g, 'Myself')
            .replace(/\byourself\b/g, 'myself')
            .replace(/\bYour\b/g, 'My')
            .replace(/\byour\b/g, 'my')
            .replace(/\bYou are\b/g, 'I am')
            .replace(/\byou are\b/g, 'I am')
            .replace(/clips you/g, 'clips me')
            .replace(/observe you/g, 'observe me')
            .replace(/blocks you/g, 'blocks me')
            .replace(/\bYou\b/g, 'I')
            .replace(/\byou\b/g, 'I');
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
    
    // Formatting text based on perspective, unless it's a system message or dialogue
    const finalText = isSystem ? text : parsePerspective(text);
    contentHtml += `<p style="margin: 0; color: ${isSystem ? 'var(--secondary)' : 'var(--text)'};">${finalText}</p>`;
    
    block.innerHTML = contentHtml;
    narrativeWindow.appendChild(block);
    
    // Auto scroll to the latest message
    block.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function clearNarrative() {
    narrativeWindow.innerHTML = '';
}

function setChoices(choicesArray) {
    choiceEngine.innerHTML = '';
    if (!choicesArray || choicesArray.length === 0) return;
    
    choicesArray.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.innerHTML = choice.text;
        btn.onclick = () => {
            choiceEngine.innerHTML = ''; // Lock choices
            if (choice.callback) choice.callback();
        };
        choiceEngine.appendChild(btn);
    });
}

function updateTopBar() {
    if (!UI_ELEMENTS.storyPlayerName) return; // Failsafe if DOM not ready

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
}

// --- Screen Management ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    state.screen = screenId;
    updateTopBar();
}

function initGame() {
    // Initialize default companion state from lore roster
    if (window.COMPANIONS) {
        window.COMPANIONS.getRoster().forEach(hero => {
            window.COMPANIONS.init(state, hero.id);
        });
        // Auto-activate Tariq for desert knight / Sun Wukong for others as default
        const defaultId = state.player.class === 'Desert Knight' ? 'tariq_ibn_ziyad' : 'sun_wukong';
        window.COMPANIONS.activate(state, defaultId);
    }

    showScreen('story-screen');
    if (window.AUDIO) { window.AUDIO.init(); window.AUDIO.playRegion('crossroads'); }
    clearNarrative();
    saveGame();

    narrate("The wind whispers of a Great Convergence. The barriers between realms are thinning. Your path begins now.", "System", null, false, true);
    hubLoop();
}

// --- Hub Loop ---
function hubLoop() {
    state.narrative_node = 'hub';
    if (window.AUDIO) { window.AUDIO.resume(); window.AUDIO.playRegion('crossroads'); }
    state.currentEnemy = null;
    updateTopBar();

    // Check for pending story beat (triggered by stage progression)
    if (window.STORY) {
        const beatId = window.STORY.getNextBeat(state);
        if (beatId) {
            clearNarrative();
            window.STORY.runNode(beatId, state, narrate, setChoices, (result) => {
                if (result === 'combat' && state.pendingCombatEnemy) {
                    const enemy = window.LORE ? window.LORE.getAllEnemies()[state.pendingCombatEnemy] : null;
                    state.pendingCombatEnemy = null;
                    if (enemy) startCombat({ ...enemy, hp: enemy.baseHp, maxHp: enemy.baseHp, atk: enemy.baseAtk });
                    else hubLoop();
                } else { saveGame(); hubLoop(); }
            });
            return; // Story takes over; don't render regular hub yet
        }
    }

    // Karma alignment check Ã¢â‚¬â€ companion may leave
    if (window.COMPANIONS) {
        const alignCheck = window.COMPANIONS.checkKarmaAlignment(state);
        if (alignCheck && alignCheck.leave) {
            narrate(alignCheck.reason, "System", null, false, true);
            state.companion = null;
        }

        // Side quest trigger
        const quest = window.COMPANIONS.checkSideQuest(state);
        if (quest && quest.triggered) {
            setTimeout(() => narrate(`Ã°Å¸â€œÅ“ <b>${quest.title}:</b> ${quest.intro}`, "System", null, false, true), 1000);
        }
    }

    // Companion greeting
    const comp = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
    if (comp) {
        const greeting = window.COMPANIONS.getDialogue(state, state.companion, 'greet');
        if (greeting) setTimeout(() => narrate(greeting, comp.name, comp.sprite, false), 600);
    }

    const unlockedRegions = window.LORE ? Object.values(window.LORE.REGIONS).filter(r => r.unlocked) : [];
    narrate(`You stand at the heart of the City of Crossroads. The air is thick with spice and spirit-energy.`);

    const regionChoices = unlockedRegions.map(region => ({
        text: `🗺️ ${region.name} — <em>${region.subtitle}</em>`,
        callback: () => exploreRegion(region.id)
    }));

    setChoices([
        ...regionChoices,
        { text: "Open World Map", callback: showWorldMap },
        { text: "The Inner Sea (Cultivation)", callback: showCultivationScreen },
        { text: "The Furnace of Heaven (Alchemy)", callback: showAlchemyScreen },
        { text: "The Spirit Forge (Blacksmith)", callback: showForgeScreen },
        { text: "Manage Companion", callback: showCompanionScreen },
        { text: "🧘 Meditate (Restore HP & MP)", callback: () => {
            state.player.hp = state.player.maxHp;
            state.player.mp = state.player.maxMp;
            narrate("You sit beneath a spirit-tree and draw in ambient Qi. Fully restored.", "System", null, false, true);
            updateTopBar(); saveGame();
            setTimeout(hubLoop, 1800);
        }},
        { text: "🎒 Inventory & Karma", callback: showInventory }
    ]);
}

// --- Companion Management Screen ---
function showCompanionScreen() {
    clearNarrative();
    const available = window.COMPANIONS ? window.COMPANIONS.getAvailable(state) : [];
    const activeId = state.companion;

    narrate(`<b>Companion Roster</b> Ã¢â‚¬â€ Your karma of <b>${state.player.karma}</b> unlocks ${available.length} companions. Choose who walks beside you.`, "System", null, false, true);

    if (activeId && window.COMPANIONS) {
        const activeComp = window.COMPANIONS.getActive(state);
        if (activeComp) {
            const compState = state.companions[activeId];
            const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
            narrate(`Current Companion: <b>${activeComp.name}</b> | Affinity: <span style="color:${tier.color}">${compState.affinity}/100 Ã¢â‚¬â€ ${tier.label}</span><br><em>${activeComp.passiveBuff.label}</em>`, "System", null, false, true);
        }
    }

    const choices = available.map(hero => {
        const compState = state.companions[hero.id] || { affinity: 50 };
        const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
        const isActive = hero.id === activeId;
        return {
            text: `${isActive ? 'Ã¢Å“â€¦ ' : ''}${hero.name} | ${hero.passiveBuff.label} | Affinity: <span style="color:${tier.color}">${tier.label}</span>`,
            callback: () => {
                window.COMPANIONS.activate(state, hero.id);
                const greet = window.COMPANIONS.getDialogue(state, hero.id, 'greet');
                clearNarrative();
                if (greet) narrate(greet, hero.name, hero.sprite, false);
                narrate(`${hero.name} now walks beside you. ${hero.passiveBuff.label}.`, "System", null, false, true);
                saveGame();
                setTimeout(hubLoop, 2000);
            }
        };
    });

    setChoices([...choices, { text: "Ã¢â€ Â©Ã¯Â¸Â Return to Crossroads", callback: hubLoop }]);
}


function exploreRegion(regionId) {
    state.narrative_node = `exploring_${regionId}`;
    if (window.AUDIO) { window.AUDIO.resume(); window.AUDIO.playRegion(regionId); }
    const region = window.LORE ? window.LORE.REGIONS[regionId] : null;
    if (!region) { hubLoop(); return; }

    clearNarrative();
    narrate(`You venture into <b>${region.name}</b>. ${region.description}`);

    const roll = Math.random();
    if (roll < 0.20) {
        const npc = generateNPC(regionId);
        setTimeout(() => triggerDialogueEvent(npc), 1200);
    } else if (roll < 0.40) {
        setTimeout(triggerTreasureEvent, 1200);
    } else {
        const enemy = generateEnemy(regionId);
        setTimeout(() => startCombat(enemy), 1200);
    }
}

// Keep legacy for any leftover references
function exploreWilderness() { exploreRegion('crossroads'); }

// --- Procedural NPC Generator (LORE-driven) ---
function generateNPC(regionId = 'crossroads') {
    const eng = window.LORE ? window.LORE.NPC_ENGINE : null;
    if (!eng) return { name: 'Wandering Stranger', sprite: 'assets/sufi_mystic_1778872363338.png', hook: '', secret: '', hp: 40, maxHp: 40, atk: 10 };

    const isChinese = ['jade_peak', 'abyssal_sea'].includes(regionId) || Math.random() > 0.5;
    const nameList = isChinese ? eng.chinese_names : eng.arabian_names;
    const titleList = isChinese ? eng.chinese_titles : eng.arabian_titles;

    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const title = titleList[Math.floor(Math.random() * titleList.length)];
    const hook = eng.visual_hooks[Math.floor(Math.random() * eng.visual_hooks.length)];
    const secret = eng.secrets[Math.floor(Math.random() * eng.secrets.length)];
    const sprite = isChinese ? 'assets/corrupted_taoist_1778872375046.png' : 'assets/desert_ghoul_1778872388305.png';
    const scale = state.player.lvl;

    return {
        name: `${name}, the ${title}`,
        isHostile: false,
        sprite,
        hook,
        secret,
        hp: 30 + scale * 15,
        maxHp: 30 + scale * 15,
        atk: 8 + scale * 3
    };
}

// --- Region-Aware Enemy Generator ---
function generateEnemy(regionId = 'crossroads') {
    const enemies = window.LORE ? window.LORE.getRegionEnemies(regionId) : [];
    if (!enemies.length) return generateNPC(regionId);

    const base = enemies[Math.floor(Math.random() * enemies.length)];
    const scale = state.player.lvl;

    return {
        name: base.name,
        sprite: base.sprite,
        hp: Math.floor(base.baseHp * (1 + scale * 0.3)),
        maxHp: Math.floor(base.baseHp * (1 + scale * 0.3)),
        atk: Math.floor(base.baseAtk * (1 + scale * 0.2)),
        xpReward: Math.floor(base.xpReward * (1 + scale * 0.1)),
        moves: base.moves,
        dialogue: base.dialogue,
        nextMove: null,
        regionId,
        archetype: base.archetype || 'balanced',
        def: Math.floor(2 + scale * 1.5)
    };
}

// --- Dynamic Dialogue System ---
function triggerDialogueEvent(npc) {
    narrate(`You encounter ${npc.name}. ${npc.hook || "They observe you silently."}`, "System");
    
    setChoices([
        { text: "🤝 Greet them respectfully (Diplomatic)", callback: () => resolveDialogue(npc, 'greet') },
        { text: "👁️ Observe their aura (Cautious)", callback: () => resolveDialogue(npc, 'observe') },
        { text: "⚔️ Draw your weapon (Aggressive)", callback: () => startCombat(npc) }
    ]);
}

function resolveDialogue(npc, action) {
    if (action === 'greet') {
        narrate(`"The Dao flows through us all, traveler," ${npc.name} replies warmly. They hand you a small gift before departing.`, npc.name, npc.sprite, false);
        const goldGift = 5 + Math.floor(Math.random() * 15);
        state.player.gold = (state.player.gold || 0) + goldGift;
        state.player.karma += 5;
        narrate(`Obtained ${goldGift} Gold. Karma +5.`, "System", null, false, true);

        // Companion reacts to good karma action
        if (window.COMPANIONS && state.companion) {
            const line = window.COMPANIONS.getInterjection(state, 'good_karma');
            if (line) setTimeout(() => narrate(line, window.COMPANIONS.getActive(state)?.name || 'Companion'), 800);
            window.COMPANIONS.adjustAffinity(state, state.companion, 5, 'Player chose diplomacy');
        }
        setChoices([{ text: "Continue", callback: hubLoop }]);
    } else if (action === 'observe') {
        narrate(`You focus your inner eye. ${npc.name} seems to be ${npc.secret || "just a traveler"}.`, "System");
        state.player.mp = Math.max(0, state.player.mp - 5);
        updateTopBar();
        setChoices([{ text: "Continue", callback: hubLoop }]);
    }
}

// --- Variable Reward Loot Engine (region-aware) ---
function triggerTreasureEvent() {
    const regionId = (state.narrative_node || '').replace('exploring_', '') || 'crossroads';
    narrate("You stumble upon an ancient ruin half-buried in the sand. A chest hums with spiritual energy.");
    setChoices([
        { text: "🔓 Open it carefully", callback: () => {
            generateLoot(regionId);
            setChoices([{ text: "Continue", callback: hubLoop }]);
        }}
    ]);
}


function generateLoot(regionId = 'crossroads') {
    const table = window.LORE ? window.LORE.getLootTable(regionId) : null;
    const tiers = table || lootTiers;

    const roll = Math.random();
    let cumulative = 0;
    let selectedTier = tiers[0];

    for (const tier of tiers) {
        cumulative += tier.chance;
        if (roll <= cumulative) { selectedTier = tier; break; }
    }

    const itemName = selectedTier.items[Math.floor(Math.random() * selectedTier.items.length)];
    const lootObj = { name: itemName, rarity: selectedTier.rarity, css: selectedTier.css };
    state.player.inventory.items.push(lootObj);
    narrate(`You acquired: <span class="${selectedTier.css}">${itemName} (${selectedTier.rarity})</span>!`, "System", null, false, true);

    if (selectedTier.rarity === 'Mythic' && !state.achievements.includes('First Mythic')) {
        if (window.AUDIO) window.AUDIO.playEffect('loot_mythic');
        state.achievements.push('First Mythic');
        narrate("Ã°Å¸Ââ€  Achievement Unlocked: First Mythic Drop!", "System", null, false, true);
    }
    saveGame();
}

// Fallback tier table if LORE not loaded yet
const lootTiers = [
    { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Iron Sword', 'Prayer Beads', 'Jade Ring'] },
    { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Steel Jian', 'Silver Misbaha', 'Qi Pill'] },
    { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Lightning Blade', 'Ruby of the Quarter', 'Soul Elixir'] },
    { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['Heaven Halberd', 'Mantle of the Qutb'] },
    { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['Tariq\'s Lost Scabbard', 'The Jade Emperor\'s Seal'] }
];

// ============================================================
// COMBAT ENGINE â€” The Flowing Dao (powered by combat.js)
// ============================================================

function updateMomentumUI() {
    const bar = document.getElementById('momentum-bar-fill');
    const indicator = document.getElementById('stance-indicator');
    const container = document.getElementById('combat-momentum-container');
    if (!bar) return;
    const mom = state.momentum || 0;
    // mom range -100 to +100; bar starts at 50% and grows right (positive) or left (negative)
    if (mom >= 0) {
        bar.style.left = '50%';
        bar.style.width = (mom / 2) + '%';
        bar.style.background = 'linear-gradient(90deg, #d4af37, #00a86b)';
    } else {
        const w = (-mom / 2);
        bar.style.left = (50 - w) + '%';
        bar.style.width = w + '%';
        bar.style.background = 'linear-gradient(90deg, #8a1c1c, #d4af37)';
    }
    if (container) container.style.display = state.currentEnemy ? 'block' : 'none';
    const formNames = { water: '?? WATER FORM', mountain: '?? MOUNTAIN FORM', wind: '?? WIND FORM' };
    if (indicator) indicator.textContent = 'STANCE: ' + (formNames[state.playerForm] || 'NONE');
}

function startCombat(enemy) {
    state.currentEnemy = enemy;
    state.momentum = 0;
    state.playerForm = 'water';
    state.enemyStaggered = false;
    state.playerGuardBroken = false;
    state.nextEnemyAttackNegated = false;
    state.playerDmgBonus = 1;
    state.enemyAtkDebuff = 1;

    // Aura suppression
    const pStage = state.player.cultivation ? state.player.cultivation.stageLevel : 1;
    const eStage = enemy.stageLevel || 1;
    if (pStage > eStage + 2) {
        state.enemyAtkDebuff = 0.7;
        narrate('Your Cultivation Aura suppresses them. Their attacks are weakened.', 'System', null, false, true);
    } else if (eStage > pStage + 2) {
        state.playerDmgBonus = 0.7;
        narrate("The enemy's overwhelming aura crushes your Qi flow.", 'System', null, false, true);
    }

    updateTopBar();
    updateMomentumUI();
    const openLine = enemy.dialogue || `${enemy.name} steps forward, killing intent radiating like heat.`;
    narrate(openLine, enemy.name, enemy.sprite, true);
    setTimeout(combatLoop, 1800);
}

function combatLoop() {
    if (state.player.hp <= 0) { handleDefeat(); return; }
    if (state.currentEnemy.hp <= 0) { handleVictory(); return; }

    // Enemy telegraph
    const enemy = state.currentEnemy;
    enemy.nextMove = window.COMBAT ? window.COMBAT.selectEnemyMove(enemy) : ['heavy','fast','magic'][Math.floor(Math.random()*3)];
    const telegraph = window.COMBAT ? window.COMBAT.getTelegraph(enemy, enemy.nextMove) : `${enemy.name} prepares to attack.`;
    narrate(telegraph, enemy.name, enemy.sprite, true);

    // If momentum >= 100, enemy is staggered
    if (state.momentum >= 100) {
        state.enemyStaggered = true;
        state.momentum = 0;
        narrate('<span class="loot-mythic">?? STAGGER BREAK! The enemy is wide open for an EXECUTION strike!</span>', 'System', null, false, true);
    }
    if (state.momentum <= -100) {
        state.playerGuardBroken = true;
        state.momentum = 0;
        narrate('<span class="loot-common">?? YOUR GUARD IS BROKEN! You are exposed!</span>', 'System', null, false, true);
    }

    updateMomentumUI();
    state.combatState = 'player_turn';
    setTimeout(buildFormSelection, 1000);
}

// Step 1: Choose your Form
function buildFormSelection() {
    const forms = [
        { id: 'water', label: '?? Water Form', hint: 'Deflect heavies Â· Counter fasts Â· Regenerates Qi' },
        { id: 'mountain', label: '?? Mountain Form', hint: 'Break guards Â· Absorb & counter physicals (15+ Qi)' },
        { id: 'wind', label: '?? Wind Form', hint: 'Interrupt magic Â· Qi blade ignores armor (5+ Qi)' }
    ];

    const choices = forms.map(f => ({
        text: `${f.label} <em style="font-size:0.8em;color:#888;">${f.hint}</em>`,
        callback: () => {
            state.playerForm = f.id;
            updateMomentumUI();
            buildActionChoices();
        }
    }));

    // Always allow potion
    if (state.player.inventory.potions > 0) {
        choices.push({ text: `?? Use Potion (x${state.player.inventory.potions}) â€” Heals 40 HP, take a free hit`, callback: usePotion });
    }

    // Companion ability
    const comp = window.COMPANIONS?.getActive(state);
    if (comp?.uniqueAbility && state.player.mp >= comp.uniqueAbility.mpCost) {
        choices.push({ text: `? ${comp.name.split(',')[0]}: ${comp.uniqueAbility.name} (${comp.uniqueAbility.mpCost} Qi)`, callback: useCompanionAbility });
    }

    setChoices(choices);
}

// Step 2: Choose your Action within the chosen Form
function buildActionChoices() {
    if (!window.COMBAT) { resolveCombatTurn('gale_strike'); return; }
    const actions = window.COMBAT.getActionsForForm(state.playerForm);
    const choices = actions
        .filter(a => a.cost === 0 || state.player.mp >= a.cost)
        .map(a => ({
            text: `${a.name}${a.cost > 0 ? ` <em>(${a.cost} Qi)</em>` : ''}`,
            callback: () => {
                if (a.cost > 0) state.player.mp = Math.max(0, state.player.mp - a.cost);
                resolveCombatTurn(a.id);
            }
        }));

    choices.push({ text: '? Change Form', callback: buildFormSelection });
    setChoices(choices);
}

function usePotion() {
    state.player.inventory.potions--;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 40);
    const hitDmg = Math.floor(state.currentEnemy.atk * (state.enemyAtkDebuff || 1));
    state.player.hp = Math.max(0, state.player.hp - hitDmg);
    narrate(`You drink a potion (+40 HP) but ${state.currentEnemy.name} seizes the opening, hitting you for ${hitDmg} damage!`, 'System', null, false, true);
    updateTopBar();
    if (state.player.hp <= 0) { setTimeout(handleDefeat, 1200); return; }
    state.combatState = 'enemy_prep';
    setTimeout(combatLoop, 2000);
}

function useCompanionAbility() {
    const result = window.COMBAT?.useCompanionAbility ? window.COMBAT.useCompanionAbility(state, state.currentEnemy) : null;
    if (result?.success) {
        narrate(result.message, window.COMPANIONS?.getActive(state)?.name || 'Companion', null, false, true);
        updateTopBar();
        if (state.currentEnemy.hp <= 0) { handleVictory(); return; }
    }
    state.combatState = 'enemy_prep';
    setTimeout(combatLoop, 2000);
}

function resolveCombatTurn(playerMoveId) {
    const enemy = state.currentEnemy;
    const enemyMove = enemy.nextMove || 'heavy';

    let result;
    if (window.COMBAT && window.COMBAT.resolveMove) {
        const pAtk = Math.floor(state.player.atk * (state.playerDmgBonus || 1));
        const eAtk = Math.floor(enemy.atk * (state.enemyAtkDebuff || 1));
        result = window.COMBAT.resolveMove(playerMoveId, enemyMove, pAtk, eAtk, enemy, state);
    } else {
        result = { playerDmg: state.player.atk, enemyDmg: enemy.atk, resultText: 'You clash!', special: null, momentumShift: 0 };
    }

    // Apply damage
    enemy.hp = Math.max(0, enemy.hp - result.playerDmg);
    state.player.hp = Math.max(0, state.player.hp - result.enemyDmg);

    // Apply momentum
    state.momentum = Math.max(-100, Math.min(100, (state.momentum || 0) + (result.momentumShift || 0)));

    // Narrate result
    narrate(result.resultText, 'System', null, false, true);
    if (result.playerDmg > 0) narrate(`<b>You deal ${result.playerDmg} damage.</b> Enemy HP: ${enemy.hp}/${enemy.maxHp}`, 'System', null, false, true);
    if (result.enemyDmg > 0) narrate(`<b>You take ${result.enemyDmg} damage.</b> Your HP: ${state.player.hp}/${state.player.maxHp}`, 'System', null, true, true);

    // Special effects
    const specialLabels = {
        perfect_counter: '<span class="loot-epic">? PERFECT COUNTER! Momentum surge!</span>',
        execution: '<span class="loot-mythic" style="font-size:1.3em">?? EXECUTION STRIKE!</span>',
        guard_broken: '<span class="loot-common">?? Guard Broken â€” you are exposed!</span>'
    };
    if (result.special && specialLabels[result.special]) narrate(specialLabels[result.special], 'System', null, false, true);
    if (window.AUDIO && result.playerDmg > 0) window.AUDIO.playEffect('combat_hit');

    updateTopBar();
    updateMomentumUI();

    if (state.player.hp <= 0) { setTimeout(handleDefeat, 1500); return; }
    if (enemy.hp <= 0) { setTimeout(handleVictory, 1500); return; }

    setTimeout(combatLoop, 2200);
}

function handleVictory() {
    narrate(`${state.currentEnemy.name} crumbles. The killing intent lifts from the air. Victory is yours.`, 'System');
    if (window.COMBAT) { document.getElementById('combat-momentum-container').style.display = 'none'; }

    if (window.COMPANIONS) {
        const line = window.COMPANIONS.getInterjection(state, 'combat_win');
        if (line) setTimeout(() => narrate(line, window.COMPANIONS.getActive(state)?.name || 'System'), 800);
        if (state.companion) window.COMPANIONS.adjustAffinity(state, state.companion, 3, 'Won a battle together');
    }

    const xpGained = state.currentEnemy.xpReward || 40;
    state.player.xp += xpGained;
    narrate(`Gained <b>${xpGained}</b> Experience.`, 'System', null, false, true);

    // Gold reward
    const goldGained = 10 + Math.floor(Math.random() * 20) + state.player.lvl * 3;
    state.player.gold = (state.player.gold || 0) + goldGained;
    narrate(`Gold earned: <b style="color:#f5c842">${goldGained} coins</b>. Total: ${state.player.gold}`, 'System', null, false, true);

    // Materials drop
    const matDrops = ['spirit_herb', 'iron_ore', 'monster_core'];
    if (Math.random() < 0.6) {
        const mat = matDrops[Math.floor(Math.random() * matDrops.length)];
        state.player.inventory.materials[mat] = (state.player.inventory.materials[mat] || 0) + 1;
        narrate(`Material Found: <span class="loot-rare">${mat.replace(/_/g,' ')}</span>`, 'System', null, false, true);
    }

    if (state.player.xp >= state.player.maxXp) {
        state.player.xp -= state.player.maxXp;
        state.player.lvl++;
        state.player.cultivation.stageLevel++;
        state.player.maxXp = Math.floor(state.player.maxXp * 1.5);
        state.player.maxHp += 15; state.player.hp = state.player.maxHp;
        state.player.atk += 4; state.player.def += 1;
        narrate('?? <b>BREAKTHROUGH!</b> Your Cultivation deepens. Stats increased!', 'System', null, false, true);
        if (window.AUDIO) window.AUDIO.playEffect('level_up');
        if (state.player.cultivation.stageLevel >= 9) {
            state.player.cultivation.breakthroughReady = true;
            narrate('? <b>Your cultivation nears its peak.</b> Visit the Inner Sea to attempt a Major Breakthrough!', 'System', null, false, true);
        }
    }

    const regionId = (state.narrative_node || '').replace('exploring_', '') || 'crossroads';
    generateLoot(regionId);
    state.currentEnemy = null;
    updateTopBar();
    saveGame();

    // Tribulation victory check
    if (state._pendingBreakthroughStage) {
        const bs = state._pendingBreakthroughStage;
        state._pendingBreakthroughStage = null;
        const msg = window.CULTIVATION ? window.CULTIVATION.completeBreakthrough(state, bs) : 'Breakthrough achieved!';
        narrate(msg, 'System', null, false, true);
        updateTopBar(); saveGame();
        setChoices([{ text: 'Continue', callback: hubLoop }]);
        return;
    }

    setChoices([{ text: 'Continue', callback: hubLoop }]);
}

function handleDefeat() {
    if (window.COMPANIONS && state.companion) {
        const line = window.COMPANIONS.getInterjection(state, 'combat_lose');
        if (line) narrate(line, window.COMPANIONS.getActive(state)?.name || 'System');
        window.COMPANIONS.adjustAffinity(state, state.companion, -5, 'Fell in battle');
    }
    narrate('Your vision dims. The Dao does not end here â€” only this chapter does.', 'System');
    setChoices([{ text: 'Reincarnate (Restart)', callback: () => { localStorage.removeItem('rpg_player_id'); location.reload(); } }]);
}

// ============================================================
// CULTIVATION SCREEN â€” The Inner Sea
// ============================================================
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
                        dialogue: 'The sky tears open. A divine beast of pure lightning crashes before you â€” this is your Heavenly Trial.',
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
function recalculatePlayerStats() {
    // Reset to base stats based on level
    const lvl = state.player.lvl;
    state.player.maxHp = 100 + (lvl - 1) * 15;
    state.player.maxMp = 50 + (lvl - 1) * 5;
    state.player.atk = 15 + (lvl - 1) * 3;
    state.player.def = 5 + (lvl - 1) * 1;

    // Apply Cultivation Realm bonuses
    if (window.CULTIVATION && window.CULTIVATION.stages) {
        const stageObj = window.CULTIVATION.stages.find(s => s.name === state.player.cultivation.stage);
        if (stageObj) {
            state.player.maxHp += stageObj.bonus.hp || 0;
            state.player.maxMp += stageObj.bonus.mp || 0;
            state.player.atk += stageObj.bonus.atk || 0;
        }
    }

    // Apply Equipment bonuses
    const eq = state.player.equipment;
    const stats = window.LORE?.EQUIPMENT_STATS || {};
    
    Object.values(eq).forEach(itemName => {
        if (itemName && stats[itemName]) {
            const s = stats[itemName];
            if (s.atk) state.player.atk += s.atk;
            if (s.def) state.player.def += s.def;
            if (s.hp) state.player.maxHp += s.hp;
            if (s.mp) state.player.maxMp += s.mp;
            if (s.allStats) {
                state.player.atk += s.allStats;
                state.player.def += s.allStats;
                state.player.maxHp += s.allStats;
            }
        }
    });

    // Final clamps
    state.player.hp = Math.min(state.player.hp, state.player.maxHp);
    state.player.mp = Math.min(state.player.mp, state.player.maxMp);
}

function equipItem(itemName) {
    const stats = window.LORE?.EQUIPMENT_STATS || {};
    const item = stats[itemName];
    if (!item) return;

    const slot = item.slot;
    const oldItem = state.player.equipment[slot];

    // Unequip old item (add back to inventory items list if needed, 
    // but for now we assume inv.items is the list of all owned items)
    state.player.equipment[slot] = itemName;
    
    narrate(`Equipped <b>${itemName}</b> to ${slot} slot.`, 'System', null, false, true);
    
    recalculatePlayerStats();
    updateTopBar();
    showInventory(); // Refresh view
}

function switchSatchelTab(tab) {
    const grid = document.getElementById('item-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const inv = state.player.inventory;
    if (!inv.materials) inv.materials = {};

    if (tab === 'consumables') {
        const items = [
            { id: 'potions', label: 'Recovery Potions', value: inv.potions, color: '#00a86b', hint: 'Heals 40 HP' },
            { id: 'elixirs', label: 'Spirit Elixirs', value: inv.elixirs, color: '#d4af37', hint: 'Increases Max HP/MP' },
            { id: 'gold', label: 'Gold Coins', value: state.player.gold || 0, color: '#f5c842', hint: 'Used for crafting' }
        ];
        items.forEach(it => {
            const div = document.createElement('div');
            div.className = 'inventory-slot';
            div.style.cssText = 'width:auto;padding:12px 16px;text-align:center;min-width:120px;cursor:pointer;';
            div.innerHTML = `<div style="font-size:0.75rem;color:#888;">${it.label}</div><div style="font-size:1.4rem;font-weight:bold;color:${it.color};">${it.value}</div><div style="font-size:0.65rem;color:#666;">${it.hint}</div>`;
            div.onclick = () => {
                if (it.id === 'potions' && inv.potions > 0) {
                    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 40);
                    inv.potions--;
                    narrate("You drink a Recovery Potion. (+40 HP)", "System", null, false, true);
                    updateTopBar(); switchSatchelTab('consumables');
                } else if (it.id === 'elixirs' && inv.elixirs > 0) {
                    state.player.maxHp += 5; state.player.maxMp += 2;
                    inv.elixirs--;
                    narrate("You consume a Spirit Elixir. Your foundation grows stronger!", "System", null, false, true);
                    updateTopBar(); switchSatchelTab('consumables');
                }
            };
            grid.appendChild(div);
        });
    } else if (tab === 'equipment') {
        const gear = (inv.items || []).filter(i => i && (typeof i === 'string' ? window.LORE?.EQUIPMENT_STATS[i] : i.rarity));
        if (!gear.length) {
            grid.innerHTML = '<div style="color:#555;padding:20px;"><i>No equipment. Explore regions to find gear.</i></div>';
        } else {
            gear.forEach(item => {
                const itemName = typeof item === 'string' ? item : item.name;
                const itemData = window.LORE?.EQUIPMENT_STATS[itemName] || item;
                const div = document.createElement('div');
                div.className = `inventory-slot ${item.css || ''}`;
                div.style.cssText = 'width:auto;padding:10px 14px;cursor:pointer;min-width:120px;';
                div.innerHTML = `<div style="font-weight:bold;">${itemName}</div><div style="font-size:0.75rem;color:#888;">${itemData.slot || item.rarity || 'Item'}</div>`;
                div.onclick = () => {
                    if (itemData.slot) {
                        equipItem(itemName);
                    } else {
                        narrate(`You examine the ${itemName}. It's a fine piece of work.`, 'System', null, false, true);
                    }
                };
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



