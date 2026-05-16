// ============================================================
// LORE_MYTHS.JS — Mythological Heroes from All Traditions
// Greek, Norse, Arabian, Persian, Egyptian, Yoruba, Aztec
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

const MYTH_HEROES = {
    // ── GREEK MYTHOLOGY ──
    odysseus: {
        id: 'odysseus',
        name: 'Odysseus',
        title: 'The Cunning One, Sacker of Cities',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_neutral',
        karmaRequirement: -20,
        affinity: 50,
        personality: 'cunning',
        description: 'Ten years at war, ten years lost at sea — and still he found his way home. Odysseus carries not just a sword but a mind sharper than any blade. He has stared into the eye of a Cyclops, heard the Sirens\' song, and lived.',
        dialogue: {
            greet: [
                '"I have seen monsters that would make your boldest nightmares seem timid. Walk with me, and let us see what this world hides."',
                '"A clever mind wins more battles than ten thousand swords. Remember that when the odds seem impossible."'
            ],
            battle_cry: ['"For home! For cunning! CHARGE!"', '"A man who survives becomes more dangerous each time!"'],
            victory: ['"Every enemy falls, eventually. Patience is the greatest weapon."'],
            defeat: ['"Even the gods tire eventually. We retreat — and plan."']
        },
        passiveBuff: {
            label: '+20% Gold from all encounters (Cunning Plunder)',
            effect: (state) => { state.player.gold = Math.floor((state.player.gold || 0) * 1.2); }
        },
        uniqueAbility: {
            name: "Trojan Stratagem",
            mpCost: 30,
            effect: 'bypass_social_gate',
            description: 'Through clever words and disguise, bypass one hostile encounter entirely this battle.'
        }
    },
    achilles: {
        id: 'achilles',
        name: 'Achilles',
        title: 'Swift-Footed Champion of the Achaeans',
        origin: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'chaotic_good',
        karmaRequirement: -40,
        affinity: 50,
        personality: 'fierce',
        description: 'Dipped in the River Styx, nearly invulnerable, and driven by a rage that shook Troy to its foundations. Achilles chose a short life of glory over a long life of mediocrity — and the world has never forgotten him.',
        dialogue: {
            greet: [
                '"GLORY! That is all that matters. Will this quest be worthy of a song? If not, I have no interest."',
                '"They said I would die young. I said — let the songs last forever."'
            ],
            battle_cry: ['"FOR GLORY! NONE SHALL STAND!"', '"My rage is my shield and my sword!!"'],
            victory: ['"This is what the gods intended. Victory. Always victory."'],
            defeat: ['"Not... yet. I have more left to prove."']
        },
        passiveBuff: {
            label: '+25% ATK, -15% DEF (The Rage of Achilles)',
            effect: (state) => { state.player.atk = Math.floor(state.player.atk * 1.25); state.player.def = Math.floor(state.player.def * 0.85); }
        },
        uniqueAbility: {
            name: "Wrath of Peleus",
            mpCost: 35,
            effect: 'triple_damage_stun',
            description: 'A single catastrophic strike at 3x damage that stuns the enemy for 1 turn.'
        }
    },
    // ── NORSE MYTHOLOGY ──
    sigurd: {
        id: 'sigurd',
        name: 'Sigurd Fafnirsbane',
        title: 'Dragonslayer, Rider of Grani',
        origin: 'celestial_court',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'lawful_good',
        karmaRequirement: 10,
        affinity: 50,
        personality: 'noble',
        description: 'He bathed in dragon blood and gained the knowledge of birds. He rode through a ring of fire. He wielded Gram, the sword that had killed his own father\'s killer. Sigurd Fafnirsbane is the hero of heroes in the cold North.',
        dialogue: {
            greet: [
                '"I have faced a dragon. What stands before us now? Show me."',
                '"The Norns weave our fate, but we hold the sword. Come."'
            ],
            battle_cry: ['"FOR GLORY AND THE ALLFATHER!"', '"By Gram — FALL!"'],
            victory: ['"The wyrm falls. As all enemies must."'],
            defeat: ['"Even heroes fall. But not forever."']
        },
        passiveBuff: {
            label: '+15% ATK against named enemies, +10 DEF (Dragon-Blood Skin)',
            effect: (state) => { state.player.def += 10; }
        },
        uniqueAbility: {
            name: "Gram, the Dragon-Cleaver",
            mpCost: 40,
            effect: 'area_damage_or_bypass',
            description: 'A blow that deals 2x damage, ignoring all armor and resistances.'
        }
    },
    // ── ARABIAN / ISLAMIC HEROES (expanded) ──
    // Saladin and Sinbad moved to lore_part2.js for consistency
    ali_baba: {
        id: 'ali_baba',
        name: 'Ali Baba',
        title: 'Master of Open Sesame, Thief-King',
        origin: 'brass_city',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        alignment: 'chaotic_good',
        karmaRequirement: -60,
        affinity: 50,
        personality: 'cunning',
        description: 'He found a cave full of thieves\' gold and walked out alive. He outsmarted Morgiana, the forty thieves, and fate itself. Ali Baba knows that the best treasure is never the one you can see — it\'s the one others protect.',
        dialogue: {
            greet: [
                '"Open Sesame! Ha — works every time. Come, friend, let us find what is hidden."',
                '"I have stolen from forty thieves and the gods themselves. What are a few enemies to us?"'
            ],
            battle_cry: ['"Surprise is the sharpest blade!"', '"They never see us coming!"'],
            victory: ['"And we vanish before they know what happened."'],
            defeat: ['"Ah. Perhaps we misjudged their number."']
        },
        passiveBuff: {
            label: '+30% chance of bonus loot, can unlock locked regions early (Thief\'s Eye)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "Open Sesame",
            mpCost: 20,
            effect: 'reveal_all_enemy_moves',
            description: 'All hidden enemy move patterns are revealed for the rest of the battle.'
        }
    },
    scheherazade: {
        id: 'scheherazade',
        name: 'Scheherazade',
        title: 'Weaver of a Thousand Tales',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 20,
        affinity: 50,
        personality: 'wise',
        description: 'She saved herself and a kingdom with nothing but words and stories — a story so compelling that a king who killed a wife each morning kept her alive for a thousand and one nights. She understands that the greatest weapon is narrative.',
        dialogue: {
            greet: [
                '"There was once a traveler who thought their journey had no end... Shall we continue your story?"',
                '"Every battle is just another tale. Tell me — how does yours end?"'
            ],
            battle_cry: ['"Let us write a story worth remembering!"', '"The greatest tale is the one you survive!"'],
            victory: ['"And the hero triumphed. As always."'],
            defeat: ['"...this is merely the dark before dawn. Every good story needs its setbacks."']
        },
        passiveBuff: {
            label: '+20 Max Qi (MP), all dialogues unlock bonus outcomes (Voice of a Thousand Tales)',
            effect: (state) => { state.player.maxMp += 20; }
        },
        uniqueAbility: {
            name: "A Thousand and One Nights",
            mpCost: 45,
            effect: 'bluff_stun',
            description: 'A story so captivating the enemy stands dumbstruck for 2 turns.'
        }
    },
    // ── PERSIAN MYTHOLOGY ──
    rustam: {
        id: 'rustam',
        name: 'Rustam of Zabulistan',
        title: 'Champion of Iran, Rider of Rakhsh',
        origin: 'empty_quarter',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'lawful_good',
        karmaRequirement: 0,
        affinity: 50,
        personality: 'noble',
        description: 'The greatest hero of the Shahnameh, Rustam fought for centuries with his divine horse Rakhsh. He defeated the White Demon, survived the Seven Labors, and wrestled fate itself. His only defeat was tragedy — not war.',
        dialogue: {
            greet: [
                '"I have wrestled demons before dawn and slept with my armor on. What challenge do you bring?"',
                '"By Rakhsh\'s thunder and my father\'s honor — let us ride into whatever awaits."'
            ],
            battle_cry: ['"IRAN ZAMIN! FOR THE HOMELAND!"', '"By the grace of heaven — FORWARD!"'],
            victory: ['"The seven trials taught me: perseverance breaks all walls."'],
            defeat: ['"The truly great hero learns more from defeat than victory."']
        },
        passiveBuff: {
            label: '+30 Max HP, +10 ATK (Champion\'s Endurance)',
            effect: (state) => { state.player.maxHp += 30; state.player.hp = Math.min(state.player.hp + 30, state.player.maxHp); state.player.atk += 10; }
        },
        uniqueAbility: {
            name: "The Seventh Labor",
            mpCost: 35,
            effect: 'debuff_enemy_buff_player',
            description: 'Enemy ATK -30%, your damage +20% for 2 turns. Forged from the Seven Trials.'
        }
    },
    // ── EGYPTIAN MYTHOLOGY ──
    imhotep: {
        id: 'imhotep',
        name: 'Imhotep',
        title: 'Architect of Eternity, Sage of Memphis',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 40,
        affinity: 50,
        personality: 'wise',
        description: 'The only commoner to be deified in ancient Egypt, Imhotep built the Step Pyramid, invented medicine, and wrote texts so profound they survived millennia. His weapon is knowledge. His armor is understanding.',
        dialogue: {
            greet: [
                '"The pyramids taught me one thing: anything can be built if the foundation is correct. Let us build your victory."',
                '"Medicine, architecture, philosophy — I have mastered all three. Combat? Another discipline to study."'
            ],
            battle_cry: ['"Knowledge is the sharpest weapon!"', '"By Thoth and all his wisdom — FORWARD!"'],
            victory: ['"The correct application of knowledge. As always."'],
            defeat: ['"Every failed experiment teaches. We have learned much today."']
        },
        passiveBuff: {
            label: 'Full HP/MP restore once per act (Sage\'s Remedy)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "The Sage's Restoration",
            mpCost: 0,
            effect: 'act_once_full_restore',
            description: 'Full HP and MP restoration once per act. Ancient medicine at its finest.'
        }
    },
    // ── YORUBA MYTHOLOGY ──
    shango: {
        id: 'shango',
        name: 'Shango',
        title: 'Orisha of Thunder, King of the Oyo',
        origin: 'celestial_court',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'chaotic_good',
        karmaRequirement: -50,
        affinity: 50,
        personality: 'fierce',
        description: 'The divine king who became thunder itself. Shango commands lightning, drums, and the primal forces of justice. He is as terrifying as a storm and as necessary as rain.',
        dialogue: {
            greet: [
                '"SHANGO DOES NOT WHISPER. I thunder. You follow. This is how we win."',
                '"The drums are speaking. Can you hear them? They say we are going to win."'
            ],
            battle_cry: ['"THUNDER! LIGHTNING! SHANGO!"', '"The storm obeys ME!"'],
            victory: ['"THUNDER WINS. ALWAYS."'],
            defeat: ['"Even thunder must recharge. But it returns — LOUDER."']
        },
        passiveBuff: {
            label: '+20 ATK, 20% chance to stun enemy each turn (Thunder Strike)',
            effect: (state) => { state.player.atk += 20; }
        },
        uniqueAbility: {
            name: "Edun Ara (Thunder Stone)",
            mpCost: 30,
            effect: 'triple_damage_stun',
            description: 'A bolt from heaven. 3x damage + enemy stunned for 1 turn.'
        }
    }
};

// ── EXPAND ARABIAN_HEROES with more characters ──
const EXTRA_ARABIAN_HEROES = {
    sinbad: {
        id: 'sinbad',
        name: 'Sinbad the Sailor',
        title: 'Seven Voyager, Survivor of the Impossible',
        origin: 'abyssal_sea',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        alignment: 'chaotic_good',
        karmaRequirement: -30,
        affinity: 50,
        personality: 'adventurous',
        description: 'He survived a Roc the size of a mountain, an island that was actually a whale, a valley of diamonds guarded by giant serpents — and came home seven times richer than when he left. Sinbad doesn\'t avoid danger; he profits from it.',
        dialogue: {
            greet: [
                '"You think THIS looks dangerous? Let me tell you about the time I rode a Roc..."',
                '"Seven voyages. Seven near-deaths. And I keep coming back. What\'s your excuse for hesitating?"'
            ],
            battle_cry: ['"To adventure! TO GLORY!"', '"By the sea — FORWARD!"'],
            victory: ['"Another story for the tavern."'],
            defeat: ['"...and THAT is how Sinbad\'s eighth voyage almost ended. Almost."']
        },
        passiveBuff: {
            label: '+25% loot quality, sea/water regions deal no environmental damage (Sailor\'s Fortune)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "The Seventh Voyage",
            mpCost: 25,
            effect: 'area_damage_or_bypass',
            description: 'Summon a Roc to strike from above for 2x damage to all enemies.'
        }
    },
    aladdin: {
        id: 'aladdin',
        name: 'Aladdin',
        title: 'Prince of Agrabah, Master of the Lamp',
        origin: 'brass_city',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'chaotic_good',
        karmaRequirement: -50,
        affinity: 50,
        personality: 'cunning',
        description: 'A street thief who found a genie\'s lamp and used it not just for himself but to become worthy of a princess and a kingdom. Aladdin knows that true wealth is the audacity to want more.',
        dialogue: {
            greet: [
                '"Street rat? They called me a street rat. Now I have a genie. Who\'s laughing?"',
                '"I\'ve been at the bottom, friend. The only way is up. Let\'s go."'
            ],
            battle_cry: ['"One jump ahead of the enemy!"', '"THIS is what a street fighter can do!"'],
            victory: ['"Not bad for a kid from the market, right?"'],
            defeat: ['"Even genies can\'t fix everything. We adapt."']
        },
        passiveBuff: {
            label: '+15 DEF from armor, unlocks hidden merchant NPCs (Street Wisdom)',
            effect: (state) => { state.player.def += 15; }
        },
        uniqueAbility: {
            name: "Genie's Wish",
            mpCost: 50,
            effect: 'full_party_heal',
            description: 'One wish: full HP and MP restoration. Can only be used once per battle.'
        }
    }
};

// ── EQUIPMENT STATS MAPPING ──
const EQUIPMENT_STATS = {
    // Weapons
    'Iron Merchant\'s Sword': { slot: 'weapon', atk: 5, crit: 2 },
    'Steel Jian with Qi Groove': { slot: 'weapon', atk: 12, crit: 5, mp: 10 },
    'Desert Iron Scimitar': { slot: 'weapon', atk: 8, def: 2 },
    'Ifrit-Forged Scimitar': { slot: 'weapon', atk: 25, fireDmg: 10 },
    'Heaven Halberd': { slot: 'weapon', atk: 45, def: 5 },
    'Tariq\'s Lost Scabbard': { slot: 'weapon', atk: 60, def: 20, lifesteal: 5 },
    'The Ruyi Jingu Bang': { slot: 'weapon', atk: 100, momentumGain: 10 },
    'Leviathan Tooth Blade': { slot: 'weapon', atk: 35, waterDmg: 15 },
    
    // Armor
    'Sect Disciple Robe': { slot: 'armor', def: 5, mp: 5 },
    'Cloud-Step Boots': { slot: 'armor', def: 3, evasion: 10 },
    'Camel-Leather Water Skin': { slot: 'armor', def: 2, heatResist: 20 },
    'Abyssal Armor Plate': { slot: 'armor', def: 25, qiResist: 15 },
    'Mantle of the Qutb': { slot: 'armor', def: 40, autoHeal: 2 },
    'Celestial Silk Robe': { slot: 'armor', def: 30, mp: 50 },
    
    // Relics
    'Merchant Prince\'s Ring': { slot: 'relic', goldBonus: 10 },
    'Ghost Fire Shard': { slot: 'relic', atk: 4, mpDrain: 2 },
    'Dragon Scale Fragment': { slot: 'relic', def: 10, fireResist: 30 },
    'Irem Brass Amulet': { slot: 'relic', mp: 20, jinnLore: 1 },
    'Nuwa\'s Five-Colored Stone': { slot: 'relic', allStats: 15 },
    'The Jade Emperor\'s Seal': { slot: 'relic', dominance: 50 }
};

// ── ENEMY ARCHETYPES (add to all enemies) ──
const ENEMY_ARCHETYPES = {
    brute: { label: 'Brute', hint: 'Prefers heavy attacks. Counter with Water Form Deflect.' },
    assassin: { label: 'Assassin', hint: 'Prefers fast strikes. Counter with Wind Form Gale Strike.' },
    mage: { label: 'Mage', hint: 'Prefers magic. Counter with Mountain Form or Wind Form.' },
    guardian: { label: 'Guardian', hint: 'Prefers guarding. Counter with Mountain Form Earthshatter.' },
    balanced: { label: 'Balanced', hint: 'Mixed tactics. Read the telegraph carefully.' }
};

// --- MERGE INTO WINDOW.LORE ---
if (window.LORE) {
    const allMythHeroes = { ...MYTH_HEROES, ...EXTRA_ARABIAN_HEROES };
    window.LORE.MYTH_HEROES = MYTH_HEROES;
    window.LORE.EXTRA_HEROES = EXTRA_ARABIAN_HEROES;
    
    // Add to ARABIAN_HEROES or CHINESE_HEROES as appropriate, 
    // or just let getAllHeroes handle them.
    Object.assign(window.LORE.ARABIAN_HEROES, EXTRA_ARABIAN_HEROES);
    
    window.LORE.EQUIPMENT_STATS = Object.assign(window.LORE.EQUIPMENT_STATS || {}, EQUIPMENT_STATS);
    window.LORE.ENEMY_ARCHETYPES = ENEMY_ARCHETYPES;
}
