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
        inventory: {
            potions: 2,
            elixirs: 0,
            items: []
        },
        equipment: {
            weapon: null,
            armor: null,
            relic: null
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
const narrativeWindow = document.getElementById('narrative-window');
const choiceEngine = document.getElementById('choice-engine');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Generate UUID if first time
    if (!localStorage.getItem('rpg_player_id')) {
        localStorage.setItem('rpg_player_id', state.playerId);
    }
    
    // Bind Start Button
    document.getElementById('start-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('char-name').value;
        const perspective = document.getElementById('perspective-select').value;
        if (nameInput) state.player.name = nameInput;
        state.settings.perspective = perspective;
        
        // Randomly assign class for testing if not set via UI (assuming base classes from previous turn)
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
    
    // Auto scroll
    narrativeWindow.scrollTop = narrativeWindow.scrollHeight;
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
    document.getElementById('story-player-name').innerText = `${state.player.name} (Lvl ${state.player.lvl})`;
    document.getElementById('story-hp').innerText = state.player.hp;
    document.getElementById('story-mp').innerText = state.player.mp;
    document.getElementById('story-hp-bar').style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
    
    const enemyContainer = document.getElementById('story-enemy-stats-container');
    if (state.currentEnemy) {
        enemyContainer.style.display = 'block';
        document.getElementById('story-enemy-name').innerText = state.currentEnemy.name;
        document.getElementById('story-enemy-hp').innerText = state.currentEnemy.hp;
        document.getElementById('story-enemy-hp-bar').style.width = `${(state.currentEnemy.hp / state.currentEnemy.maxHp) * 100}%`;
    } else {
        enemyContainer.style.display = 'none';
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

    // Karma alignment check — companion may leave
    if (window.COMPANIONS) {
        const alignCheck = window.COMPANIONS.checkKarmaAlignment(state);
        if (alignCheck && alignCheck.leave) {
            narrate(alignCheck.reason, "System", null, false, true);
            state.companion = null;
        }

        // Side quest trigger
        const quest = window.COMPANIONS.checkSideQuest(state);
        if (quest && quest.triggered) {
            setTimeout(() => narrate(`📜 <b>${quest.title}:</b> ${quest.intro}`, "System", null, false, true), 1000);
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
        { text: "Open World Map", callback: showWorldMap },
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

    narrate(`<b>Companion Roster</b> — Your karma of <b>${state.player.karma}</b> unlocks ${available.length} companions. Choose who walks beside you.`, "System", null, false, true);

    if (activeId && window.COMPANIONS) {
        const activeComp = window.COMPANIONS.getActive(state);
        if (activeComp) {
            const compState = state.companions[activeId];
            const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
            narrate(`Current Companion: <b>${activeComp.name}</b> | Affinity: <span style="color:${tier.color}">${compState.affinity}/100 — ${tier.label}</span><br><em>${activeComp.passiveBuff.label}</em>`, "System", null, false, true);
        }
    }

    const choices = available.map(hero => {
        const compState = state.companions[hero.id] || { affinity: 50 };
        const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
        const isActive = hero.id === activeId;
        return {
            text: `${isActive ? '✅ ' : ''}${hero.name} | ${hero.passiveBuff.label} | Affinity: <span style="color:${tier.color}">${tier.label}</span>`,
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

    setChoices([...choices, { text: "↩️ Return to Crossroads", callback: hubLoop }]);
}

function showInventory() {
    let karmaText = "Neutral";
    if (state.player.karma > 20) karmaText = "Righteous";
    if (state.player.karma > 80) karmaText = "Saintly";
    if (state.player.karma < -20) karmaText = "Corrupted";
    if (state.player.karma < -80) karmaText = "Demonic Sovereign";

    let invHtml = `<b>Karma:</b> ${state.player.karma} (${karmaText})<br><br><b>Inventory:</b><br>`;
    invHtml += `- Recovery Potions: ${state.player.inventory.potions}<br>`;
    invHtml += `- Spirit Elixirs: ${state.player.inventory.elixirs}<br>`;

    if (state.player.inventory.items.length > 0) {
        state.player.inventory.items.forEach(item => {
            invHtml += `- <span class="${item.css}">${item.name}</span><br>`;
        });
    } else {
        invHtml += "<i>Your pack is empty...</i>";
    }

    // Show active companion affinity
    if (state.companion && window.COMPANIONS) {
        const compState = state.companions[state.companion];
        const comp = window.COMPANIONS.getActive(state);
        if (compState && comp) {
            const tier = window.COMPANIONS.getAffinityTier(compState.affinity);
            invHtml += `<br><b>Companion:</b> ${comp.name}<br>Affinity: <span style="color:${tier.color}">${compState.affinity}/100 — ${tier.label}</span>`;
        }
    }

    narrate(invHtml, "System", null, false, true);
    setChoices([{ text: "↩️ Return", callback: hubLoop }]);
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
        regionId
    };
}

// --- Dynamic Dialogue System ---
function triggerDialogueEvent(npc) {
    narrate(`You encounter ${npc.name}. They have ${npc.hook}. They observe you silently.`, "System");
    
    setChoices([
        { text: "🙏 Greet them respectfully (Diplomatic)", callback: () => resolveDialogue(npc, 'greet') },
        { text: "👁️ Observe their aura (Cautious)", callback: () => resolveDialogue(npc, 'observe') },
        { text: "⚔️ Draw your weapon (Aggressive)", callback: () => startCombat(npc) }
    ]);
}

function resolveDialogue(npc, action) {
    if (action === 'greet') {
        narrate(`"The Dao flows through us all, traveler," ${npc.name} replies warmly. They hand you a small vial before departing.`, npc.name, npc.sprite, false);
        state.player.inventory.potions += 1;
        state.player.karma += 5;
        narrate("Obtained 1x Potion. Karma +5.", "System", null, false, true);

        // Companion reacts to good karma action
        if (window.COMPANIONS && state.companion) {
            const line = window.COMPANIONS.getInterjection(state, 'good_karma');
            if (line) setTimeout(() => narrate(line, window.COMPANIONS.getActive(state)?.name || 'Companion'), 800);
            window.COMPANIONS.adjustAffinity(state, state.companion, 5, 'Player chose diplomacy');
        }

        setChoices([{ text: "Continue", callback: hubLoop }]);
        saveGame();
    } else if (action === 'observe') {
        narrate(`You focus your spiritual sense. You realize they ${npc.secret}. They vanish, leaving behind a glowing stone.`, "System");
        const regionId = (state.narrative_node || '').replace('exploring_', '') || 'crossroads';
        generateLoot(regionId);
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
        narrate("🏆 Achievement Unlocked: First Mythic Drop!", "System", null, false, true);
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

// --- COMBAT ENGINE (powered by combat.js) ---
function startCombat(enemy) {
    state.currentEnemy = enemy;
    state.combatState = 'enemy_prep';
    
    // Reset per-battle flags
    state.nextEnemyAttackNegated = false;
    state.enemyStunned = false;
    state.enemyStunTurns = 0;
    state.enemyMovesRevealed = false;
    state.berserkerTurns = 0;
    state.berserkerBonus = 1;
    state.playerDmgBonus = 1;
    state.enemyAtkDebuff = 1;
    state.comboMultiplier = 1.0;
    state.enemyStagger = 0;
    
    // Aura Suppression Logic
    const playerStage = Math.floor(state.player.maxHp / 20); 
    const enemyStage = enemy.baseHp ? Math.floor(enemy.baseHp / 25) : 3;
    
    if (playerStage > enemyStage + 2) {
        state.enemyAtkDebuff = 0.8;
        narrate(`Your towering Cultivation Aura suppresses the enemy. Their attacks are weakened.`, "System", null, false, true);
    } else if (enemyStage > playerStage + 2) {
        state.playerDmgBonus = 0.8;
        narrate(`The enemy's oppressive Aura crushes your breath. Your attacks are weakened.`, "System", null, false, true);
    }

    updateTopBar();

    // Opening line
    const openLine = enemy.dialogue || `${enemy.name} steps forward with killing intent.`;
    narrate(openLine, enemy.name, enemy.sprite, true);
    setTimeout(combatLoop, 1800);
}

function combatLoop() {
    if (state.player.hp <= 0) { handleDefeat(); return; }
    if (state.currentEnemy.hp <= 0) { handleVictory(); return; }

    // Status effect tick
    if (window.COMBAT) {
        const msgs = window.COMBAT.tickStatusEffects(state);
        msgs.forEach(m => narrate(m, 'System', null, false, true));
    }

    if (state.enemyStunned) {
        narrate(`${state.currentEnemy.name} is stunned and cannot act!`, 'System', null, false, true);
        state.combatState = 'player_turn';
        buildPlayerChoices();
        return;
    }

    if (state.combatState === 'enemy_prep') {
        const timesDefeated = window.COMBAT?.memory[state.currentEnemy.id]?.timesDefeated || 0;
        state.currentEnemy.nextMove = window.COMBAT
            ? window.COMBAT.selectEnemyMove(state.currentEnemy, timesDefeated)
            : ['heavy','fast','magic'][Math.floor(Math.random()*3)];

        // If moves are revealed, show exactly what's coming
        const moveName = state.currentEnemy.moves?.[state.currentEnemy.nextMove]?.name || state.currentEnemy.nextMove;
        const telegraph = window.COMBAT
            ? window.COMBAT.getTelegraph(state.currentEnemy, state.currentEnemy.nextMove)
            : `${state.currentEnemy.name} prepares to attack.`;

        const revealText = state.enemyMovesRevealed
            ? ` <em class="loot-rare">[Revealed: ${moveName}]</em>`
            : '';

        narrate(telegraph + revealText, state.currentEnemy.name, state.currentEnemy.sprite, true);
        state.combatState = 'player_turn';
        setTimeout(buildPlayerChoices, 1000);
    }
}

function buildPlayerChoices() {
    if (!window.COMBAT) {
        // Fallback
        setChoices([
            { text: '⚔️ Strike', callback: () => resolveCombatTurn('fast') },
            { text: '🛡️ Guard', callback: () => resolveCombatTurn('guard') },
            { text: '🌀 Dodge', callback: () => resolveCombatTurn('dodge') }
        ]);
        return;
    }

    const choices = window.COMBAT.getCombatChoices(
        state,
        (move) => resolveCombatTurn(move),
        () => {
            // Potion
            state.player.inventory.potions--;
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 40);
            narrate('You consume a Recovery Potion — vital essence surges back.', 'System');
            updateTopBar();
            resolveCombatTurn('potion');
        },
        () => {
            // Companion ability
            const result = window.COMBAT.useCompanionAbility(state, state.currentEnemy);
            if (result?.success) {
                narrate(result.message, window.COMPANIONS.getActive(state)?.name, null, false, true);
                updateTopBar();
                if (state.currentEnemy.hp <= 0) { handleVictory(); return; }
                state.combatState = 'enemy_prep';
                setTimeout(combatLoop, 2000);
            } else {
                narrate(result?.message || 'Cannot use ability.', 'System');
                buildPlayerChoices();
            }
        }
    );
    setChoices(choices);
}

function resolveCombatTurn(playerMove) {
    const enemy = state.currentEnemy;
    const enemyMove = enemy.nextMove;

    if (window.COMBAT && playerMove !== 'potion') {
        window.COMBAT.recordPlayerMove(enemy.id || enemy.name, playerMove);
    }

    if (playerMove === 'potion') {
        const dmg = Math.floor(enemy.atk * (state.enemyAtkDebuff || 1));
        state.player.hp -= dmg;
        narrate(`${enemy.name}'s attack lands while you drink! You take ${dmg} damage.`, 'System', null, false, true);
        state.comboMultiplier = 1.0; 
        updateTopBar();
        state.combatState = 'enemy_prep';
        setTimeout(combatLoop, 1800);
        return;
    }

    let result;
    if (window.COMBAT) {
        const buffedAtk = Math.floor(state.player.atk * (state.berserkerBonus || 1) * (state.playerDmgBonus || 1));
        const effectiveEnemyAtk = Math.floor(enemy.atk * (state.enemyAtkDebuff || 1));
        result = window.COMBAT.resolveMove(playerMove, enemyMove, buffedAtk, effectiveEnemyAtk, enemy, state);
    } else {
        result = { playerDmg: state.player.atk, enemyDmg: enemy.atk, resultText: 'You clash!', special: null };
    }

    if (state.nextEnemyAttackNegated) {
        result.enemyDmg = 0;
        state.nextEnemyAttackNegated = false;
        narrate(`${state.companion ? window.COMPANIONS.getActive(state)?.name : 'An ally'} negates the incoming attack!`, 'System');
    }

    enemy.hp = Math.max(0, enemy.hp - result.playerDmg);
    state.player.hp = Math.max(0, state.player.hp - result.enemyDmg);

    narrate(result.resultText, 'System', null, false, true);
    
    if (state.comboMultiplier > 1.0) {
        narrate(`🔥 Combo! Damage multiplier: <b>x${state.comboMultiplier.toFixed(1)}</b>`, 'System', null, false, true);
    }
    if (state.enemyStagger > 0 && state.enemyStagger < 3) {
        narrate(`💢 Enemy Stagger: <b>${state.enemyStagger}/3</b>`, 'System', null, false, true);
    }

    if (result.playerDmg > 0) narrate(`You deal <b>${result.playerDmg}</b> damage.`, 'System', null, false, true);
    if (window.AUDIO && result.playerDmg > 0) window.AUDIO.playEffect('combat_hit');
    if (result.enemyDmg > 0) narrate(`You take <b>${result.enemyDmg}</b> damage.`, 'System', null, true, true);
    if (result.special) {
        if (window.AUDIO && result.special.includes('perfect')) window.AUDIO.playEffect('combat_block');
        const specials = {
            interrupt: '<span class="loot-rare">⚡ Interrupt! Spell cancelled.</span>',
            perfect_block: '<span class="loot-epic">🛡️ Perfect Block! Riposte!</span>',
            perfect_dodge: '<span class="loot-epic">💨 Perfect Dodge! Counter!</span>',
            guard_crush: '<span class="loot-legendary">💥 Guard Crushed!</span>',
            magic_burst: '<span class="loot-mythic">🔮 Spiritual Overpower!</span>',
            guard_broken: '<span class="loot-common">💥 Guard Broken! Magic ignores armor!</span>',
            interrupted: '<span class="loot-common">❌ Interrupted!</span>',
            execution: '<span class="loot-mythic" style="font-size: 1.3em;">💀 EXECUTION!</span>'
        };
        if (specials[result.special]) narrate(specials[result.special], 'System', null, false, true);
    }

    updateTopBar();

    if (state.player.hp <= 0) { setTimeout(handleDefeat, 1500); return; }
    if (enemy.hp <= 0) { setTimeout(handleVictory, 1500); return; }

    state.combatState = 'enemy_prep';
    setTimeout(combatLoop, 2500);
}

function handleVictory() {
    narrate(`${state.currentEnemy.name} collapses. The spiritual pressure lifts. Victory.`, "System");

    // Companion combat-win interjection
    if (window.COMPANIONS) {
        const line = window.COMPANIONS.getInterjection(state, 'combat_win');
        if (line) setTimeout(() => narrate(line, state.companion ? window.COMPANIONS.getActive(state)?.name : 'System'), 800);
        // Victory increases affinity slightly
        if (state.companion) window.COMPANIONS.adjustAffinity(state, state.companion, 3, 'Won a battle together');
    }

    const xpGained = state.currentEnemy.xpReward || 40;
    state.player.xp += xpGained;
    narrate(`Gained ${xpGained} Experience.`, "System", null, false, true);

    if (state.player.xp >= state.player.maxXp) {
        state.player.lvl++;
        state.player.xp -= state.player.maxXp;
        state.player.maxXp = Math.floor(state.player.maxXp * (window.BALANCE ? window.BALANCE.xpMultiplier : 1.5));
        state.player.maxHp += window.BALANCE ? window.BALANCE.hpPerLevel : 22;
        state.player.hp = state.player.maxHp;
        state.player.atk  += window.BALANCE ? window.BALANCE.atkPerLevel : 6;
        narrate("🌟 BREAKTHROUGH! You have reached a new Stage of Cultivation!", "System", null, false, true);
    if (window.AUDIO) window.AUDIO.playEffect('level_up');
    }

    const regionId = (state.narrative_node || '').replace('exploring_', '') || 'crossroads';
    generateLoot(regionId);
    state.currentEnemy = null;
    saveGame();
    setChoices([{ text: "Continue", callback: hubLoop }]);
}

function handleDefeat() {
    // Companion defeat interjection
    if (window.COMPANIONS && state.companion) {
        const line = window.COMPANIONS.getInterjection(state, 'combat_lose');
        if (line) narrate(line, window.COMPANIONS.getActive(state)?.name || 'System');
        window.COMPANIONS.adjustAffinity(state, state.companion, -5, 'Fell in battle');
    }
    narrate("Your vision fades to black as your life essence is drained. Your journey ends here... for now.", "System");
    setChoices([{ text: "Reincarnate (Restart)", callback: () => { localStorage.removeItem('rpg_player_id'); location.reload(); }}]);
}

// --- Supabase Sync Engine ---
async function saveGame() {
    try {
        localStorage.setItem('rpg_save', JSON.stringify(state));
        
        if (supabaseClient) {
            const { error } = await supabaseClient
                .from('game_saves')
                .upsert({
                    player_id: state.playerId,
                    name: state.player.name,
                    class: state.player.class,
                    level: state.player.lvl,
                    hp: state.player.hp,
                    max_hp: state.player.maxHp,
                    mp: state.player.mp,
                    max_mp: state.player.maxMp,
                    xp: state.player.xp,
                    max_xp: state.player.maxXp,
                    attack: state.player.atk,
                    defense: state.player.def,
                    companion: state.companion,
                    inventory_items: state.player.inventory,
                    equipment: state.player.equipment,
                    karma: state.player.karma,
                    achievements: state.achievements,
                    relationships: state.relationships,
                    narrative_node: state.narrative_node,
                    perspective: state.settings.perspective
                }, { onConflict: 'player_id' });

            if (error) console.error("Cloud Save Error:", error);
        }
    } catch(e) {
        console.error("Save failed", e);
    }
}

async function loadGameCloud() {
    try {
        if (!supabaseClient) {
            loadGameLocal();
            return;
        }

        const { data, error } = await supabaseClient
            .from('game_saves')
            .select('*')
            .eq('player_id', state.playerId)
            .single();

        if (error || !data) {
            loadGameLocal();
            return;
        }

        applyLoadData(data);
    } catch(e) {
        console.error("Cloud Load Error:", e);
        loadGameLocal();
    }
}

function loadGameLocal() {
    const saved = localStorage.getItem('rpg_save');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge or overwrite state logic here. For brevity, simplistic overwrite:
        state = { ...state, ...parsed };
        
        // Resume from narrative node
        if (state.screen === 'story-screen') {
            if (state.narrative_node === 'hub') {
                showScreen('story-screen');
                hubLoop();
            } else {
                // Failsafe
                showScreen('story-screen');
                hubLoop();
            }
        }
    }
}

function applyLoadData(data) {
    state.player.name = data.name;
    state.player.class = data.class;
    state.player.lvl = data.level;
    state.player.hp = data.hp;
    state.player.maxHp = data.max_hp;
    state.player.mp = data.mp;
    state.player.maxMp = data.max_mp;
    state.player.xp = data.xp;
    state.player.maxXp = data.max_xp;
    state.player.atk = data.attack;
    state.player.def = data.defense;
    state.companion = data.companion;
    
    if (data.inventory_items) state.player.inventory = data.inventory_items;
    if (data.equipment) state.player.equipment = data.equipment;
    if (data.karma !== undefined) state.player.karma = data.karma;
    if (data.achievements) state.achievements = data.achievements;
    if (data.relationships) state.relationships = data.relationships;
    if (data.perspective) state.settings.perspective = data.perspective;
    
    // Resume
    if (state.screen === 'story-screen' || localStorage.getItem('rpg_save')) {
        showScreen('story-screen');
        hubLoop();
    }
}

// -----------------------------------------------------------
// WORLD MAP ENGINE
// -----------------------------------------------------------

// SVG coordinates for each region node
const REGION_COORDS = {
    crossroads:     { x: 400, y: 280, icon: '&#x2726;', color: '#d4af37' },
    jade_peak:      { x: 590, y: 175, icon: '&#x2726;', color: '#00a86b' },
    empty_quarter:  { x: 185, y: 360, icon: '&#x2726;', color: '#c8860a' },
    abyssal_sea:    { x: 625, y: 370, icon: '&#x2726;', color: '#0f52ba' },
    brass_city:     { x: 135, y: 195, icon: '&#x2726;', color: '#8a1c1c' },
    celestial_court:{ x: 415, y: 72,  icon: '&#x2726;', color: '#e8d080' }
};

function showWorldMap() {
    showScreen('map-screen');
    renderMapRegions();
    document.getElementById('map-tooltip').style.display = 'none';

    document.getElementById('map-back-btn').onclick = () => {
        showScreen('story-screen');
        hubLoop();
    };

    document.getElementById('map-travel-btn').onclick = () => {
        const rid = document.getElementById('map-travel-btn').dataset.region;
        if (rid && window.LORE && window.LORE.REGIONS[rid]?.unlocked) {
            showScreen('story-screen');
            exploreRegion(rid);
        }
    };
}

function renderMapRegions() {
    const svg = document.getElementById('map-regions-group');
    if (!svg || !window.LORE) return;
    svg.innerHTML = '';

    const regions = window.LORE.REGIONS;
    const currentRegion = (state.narrative_node || '').replace('exploring_', '');

    Object.values(regions).forEach(region => {
        const coord = REGION_COORDS[region.id];
        if (!coord) return;

        const unlocked = region.unlocked;
        const isCurrent = region.id === currentRegion;
        const nodeColor = unlocked ? coord.color : '#3a3a3a';
        const ringColor = isCurrent ? '#00e5a0' : (unlocked ? coord.color : '#444');

        // Build SVG group
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `map-region-node${unlocked ? '' : ' locked'}`);
        g.setAttribute('data-region', region.id);

        // Pulse ring (only unlocked)
        if (unlocked) {
            const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulse.setAttribute('cx', coord.x);
            pulse.setAttribute('cy', coord.y);
            pulse.setAttribute('r', '26');
            pulse.setAttribute('fill', 'none');
            pulse.setAttribute('stroke', nodeColor);
            pulse.setAttribute('stroke-width', '1.5');
            pulse.setAttribute('opacity', '0.4');
            pulse.setAttribute('class', 'region-pulse');
            g.appendChild(pulse);
        }

        // Outer ring
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', coord.x);
        ring.setAttribute('cy', coord.y);
        ring.setAttribute('r', '22');
        ring.setAttribute('fill', `${nodeColor}22`);
        ring.setAttribute('stroke', ringColor);
        ring.setAttribute('stroke-width', isCurrent ? '2.5' : '1.5');
        ring.setAttribute('class', 'region-ring');
        ring.setAttribute('stroke-opacity', unlocked ? '0.8' : '0.3');
        g.appendChild(ring);

        // Inner filled circle
        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        inner.setAttribute('cx', coord.x);
        inner.setAttribute('cy', coord.y);
        inner.setAttribute('r', '14');
        inner.setAttribute('fill', unlocked ? `${nodeColor}55` : '#1a1a1a');
        g.appendChild(inner);

        // Icon text
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', coord.x);
        icon.setAttribute('y', coord.y + 5);
        icon.setAttribute('text-anchor', 'middle');
        icon.setAttribute('font-size', '13');
        icon.setAttribute('fill', unlocked ? nodeColor : '#555');
        icon.setAttribute('filter', unlocked ? 'url(#glow-node)' : '');
        icon.textContent = unlocked ? coord.icon : '??';
        g.appendChild(icon);

        // Region label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', coord.x);
        label.setAttribute('y', coord.y + 38);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '9');
        label.setAttribute('font-family', 'Cinzel, serif');
        label.setAttribute('fill', unlocked ? coord.color : '#555');
        label.setAttribute('opacity', unlocked ? '0.9' : '0.4');
        label.textContent = region.name.length > 18 ? region.name.slice(0,18)+'�' : region.name;
        g.appendChild(label);

        // Stage range badge
        if (unlocked) {
            const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            badge.setAttribute('x', coord.x);
            badge.setAttribute('y', coord.y - 30);
            badge.setAttribute('text-anchor', 'middle');
            badge.setAttribute('font-size', '8');
            badge.setAttribute('font-family', 'Inter, sans-serif');
            badge.setAttribute('fill', '#8a8a8a');
            badge.textContent = `Stages ${region.stageRange[0]}�${region.stageRange[1]}`;
            g.appendChild(badge);
        }

        // Click handler
        g.addEventListener('click', () => showMapTooltip(region, unlocked, isCurrent));
        svg.appendChild(g);
    });
}

function showMapTooltip(region, unlocked, isCurrent) {
    const tip = document.getElementById('map-tooltip');
    document.getElementById('map-tooltip-name').textContent = region.name;
    document.getElementById('map-tooltip-subtitle').textContent = region.subtitle;
    document.getElementById('map-tooltip-desc').textContent = region.description;

    // Status badge
    const badge = document.getElementById('map-tooltip-status');
    if (isCurrent) {
        badge.textContent = 'Current';
        badge.className = 'map-status-badge badge-current';
    } else if (unlocked) {
        badge.textContent = 'Unlocked';
        badge.className = 'map-status-badge badge-unlocked';
    } else {
        badge.textContent = 'Locked';
        badge.className = 'map-status-badge badge-locked';
    }

    // Enemy tags
    const enemyBox = document.getElementById('map-tooltip-enemies');
    enemyBox.innerHTML = '';
    if (region.enemies && region.enemies.length) {
        const allEnemies = window.LORE.getAllEnemies();
        region.enemies.slice(0, 5).forEach(eid => {
            const e = allEnemies[eid];
            if (e) {
                const tag = document.createElement('span');
                tag.className = 'enemy-tag';
                tag.textContent = e.name;
                enemyBox.appendChild(tag);
            }
        });
    }

    // Travel button
    const travelBtn = document.getElementById('map-travel-btn');
    travelBtn.dataset.region = region.id;
    if (unlocked && !isCurrent) {
        travelBtn.textContent = `?? Travel to ${region.name}`;
        travelBtn.style.display = 'block';
        travelBtn.disabled = false;
        travelBtn.style.opacity = '1';
    } else if (isCurrent) {
        travelBtn.textContent = `? You are here`;
        travelBtn.disabled = true;
        travelBtn.style.opacity = '0.5';
    } else {
        const req = region.stageRange[0];
        travelBtn.textContent = `?? Requires Stage ${req}`;
        travelBtn.disabled = true;
        travelBtn.style.opacity = '0.4';
    }

    tip.style.display = 'block';
}
