// ============================================================
// LORE.JS — Part 2: Arabian Heroes, Enemies, Loot & NPC Engine
// ============================================================

// --- ARABIAN & ISLAMIC LEGENDARY HEROES ---
const ARABIAN_HEROES = {
    tariq_ibn_ziyad: {
        id: 'tariq_ibn_ziyad',
        name: 'Tariq ibn Ziyad',
        title: 'Conqueror of the Pillars of Hercules',
        origin: 'crossroads',
        sprite: 'assets/tariq_ibn_ziyad.png',
        alignment: 'lawful_good',
        karmaRequirement: -100,
        affinity: 50,
        personality: 'fearless_commander',
        description: 'He burned his own ships on the shore of Iberia so his army could not retreat. He fights not to survive, but to conquer.',
        dialogue: {
            greet: [
                '"The ships are burned. There is only forward. Are you with me?"',
                '"I have crossed seas and broken kingdoms. What is one enemy to us?"'
            ],
            battle_cry: ['"Burn the ships! FORWARD!"', '"Victory or martyrdom — both are honored!"'],
            high_affinity: '"I have fought beside caliphs and kings. You fight with more purpose than any of them."',
            burn_ships_use: '"We cannot go back. We do not want to. CHARGE!"'
        },
        passiveBuff: { stat: 'atk', bonus: 0.20, label: '+20% Attack. Cannot flee combat.' },
        uniqueAbility: {
            name: 'Burn the Ships',
            mpCost: 0,
            description: 'For 3 turns, all attacks deal +50% damage. You cannot flee or defend.',
            effect: 'berserker_mode'
        },
        questArc: 'The Seventh Shore',
        secretMotivation: 'He carries guilt for the soldiers lost in his campaigns and seeks one final victory that gives their deaths meaning.'
    },
    al_khidr: {
        id: 'al_khidr',
        name: 'Al-Khidr',
        title: 'The Green One, The Immortal Guide',
        origin: 'empty_quarter',
        sprite: 'assets/al_khidr.png',
        alignment: 'true_neutral',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'cryptic_sage',
        description: 'He appears at rivers, crossroads, and moments of crisis. He does things that seem wrong — and are always right. He will never fully explain himself.',
        dialogue: {
            greet: [
                '"You will be angry at me before this is over. Come anyway."',
                '"I have been waiting at this crossroads for eighty years. I knew you would come before you did."'
            ],
            cryptic_prophecy: [
                '"The wall that seems useless holds a treasure the orphan will need in thirty years. Leave it standing."',
                '"That boat you want to destroy? Trust me."'
            ],
            high_affinity: '"Most who travel with me leave in anger. You began to understand. That is rare."',
            appear_randomly: '"I appeared because you were about to make a very permanent mistake."'
        },
        passiveBuff: { stat: 'all', bonus: 0, label: 'Appears randomly to prevent fatal mistakes. Gives quest hints.' },
        uniqueAbility: {
            name: 'The Living Water',
            mpCost: 50,
            description: 'Fully restores the player and removes all curses. Usable once per act.',
            effect: 'act_once_full_restore'
        },
        questArc: 'Where the Two Seas Meet',
        secretMotivation: 'He is testing if the player is worthy of receiving divine knowledge that could end — or ignite — the conflict between worlds.'
    },
    sinbad: {
        id: 'sinbad',
        name: 'Sinbad the Sailor',
        title: 'Seven Voyages, Zero Regrets',
        origin: 'crossroads',
        sprite: 'assets/sinbad.png',
        alignment: 'chaotic_good',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'adventurous_merchant',
        description: 'He has ridden a giant roc, escaped a valley of diamonds, and traded with kings and monsters. He is the key to unlocking the Abyssal Sea region.',
        dialogue: {
            greet: ['"Sit — let me tell you about the island that was a whale before I tell you where we\'re going."'],
            unlock_sea: '"I know a route to the Abyssal Sea of Qi. Dangerous? Catastrophically. Are you in?"',
            battle_cry: ['"Seventh voyage style!"', '"I\'ve fought bigger!"']
        },
        passiveBuff: { stat: 'exploration', bonus: 0, label: 'Unlocks Abyssal Sea. Finds double loot on sea exploration.' },
        uniqueAbility: {
            name: 'Roc Feather Summon',
            mpCost: 40,
            description: 'Summons a giant roc to carry the player over an obstacle or deal massive area damage.',
            effect: 'area_damage_or_bypass'
        },
        questArc: 'The Eighth Voyage',
        secretMotivation: 'On his seventh voyage, Sinbad lost his closest friend to the sea. He has been searching for a way back ever since.'
    },
    saladin: {
        id: 'saladin',
        name: 'Salah ad-Din Yusuf ibn Ayyub',
        title: 'Saladin, Sultan of Honor',
        origin: 'empty_quarter',
        sprite: 'assets/saladin.png',
        alignment: 'lawful_good',
        karmaRequirement: 50,
        affinity: 0,
        personality: 'chivalrous_ruler',
        description: 'He recaptured Jerusalem without massacring its people. He defines Furusiyya — the chivalric code — not as a rule but as a way of being.',
        dialogue: {
            greet: [
                '"I do not measure a warrior by their victories. I measure them by how they treat those they have defeated."',
                '"Suffering is a better teacher than triumph."'
            ],
            test_event: 'Saladin places a wounded enemy soldier at your feet and says nothing. How you treat them determines if he fights with you.',
            high_affinity: '"You remind me of what I hoped I was in my youth. Fight on."'
        },
        passiveBuff: { stat: 'karma', bonus: 10, label: '+10 Karma per battle. Unlocks Furusiyya honor moves.' },
        uniqueAbility: {
            name: 'The Chivalric Demand',
            mpCost: 25,
            description: 'Demand surrender by Furusiyya code. Low-morale enemies stand down. Grants bonus karma.',
            effect: 'honorable_surrender'
        },
        questArc: 'The Unbroken Covenant',
        secretMotivation: 'Haunted by one battle where he could not prevent a massacre. He needs one righteous act to balance that weight.'
    },
    antar_ibn_shaddad: {
        id: 'antar_ibn_shaddad',
        name: 'Antar ibn Shaddad',
        title: 'The Pre-Islamic Champion of Arabia',
        origin: 'empty_quarter',
        sprite: 'assets/desert_knight_1778872351281.png',
        alignment: 'chaotic_good',
        karmaRequirement: -30,
        affinity: 0,
        personality: 'warrior_poet',
        description: 'Born a slave, died a legend. He wrote fine pre-Islamic poetry and fought with unmatched ferocity. He challenges every worthy fighter he meets — out of respect.',
        dialogue: {
            greet: ['"They said I was nothing because of my blood. So I made my name worth more than any bloodline."'],
            duel_challenge: '"Before we speak of alliance, we duel. Not to the death — to understanding."',
            post_duel_win: '"Good. You have spirit. I can work with spirit."',
            battle_cry: ['"For Abla! For honor!"']
        },
        passiveBuff: { stat: 'atk', bonus: 0.15, label: '+15% Attack. War poems reduce enemy morale.' },
        uniqueAbility: {
            name: 'The War Poem',
            mpCost: 20,
            description: 'Reduces enemy attack by 30% and grants the player +20% damage for 2 turns.',
            effect: 'debuff_enemy_buff_player'
        },
        questArc: 'The Unfinished Poem',
        secretMotivation: 'He never finished his greatest poem about Abla, his love. He needs the player to help him find the right ending.'
    },
    fatima_al_fihri: {
        id: 'fatima_al_fihri',
        name: 'Fatima al-Fihri',
        title: 'Founder of Al-Qarawiyyin, Mother of Knowledge',
        origin: 'crossroads',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 10,
        affinity: 0,
        personality: 'scholarly_determined',
        description: 'She built the world\'s first university. She does not fight with blades — she fights with knowledge. She unlocks the Alchemy Lab and Scholar path.',
        dialogue: {
            greet: [
                '"Knowledge is the only thing that cannot be taken by force. Shall I teach you?"',
                '"The pen is mightier than the sword. Though sometimes you need the sword first."'
            ],
            unlock_alchemy: '"I have catalogued every medicinal herb on the Silk Road. Let me show you how to combine them."',
            high_affinity: '"You ask better questions each time we meet. That is all education truly is."'
        },
        passiveBuff: { stat: 'mp', bonus: 0.25, label: '+25% Max MP. Unlocks Alchemy Lab crafting.' },
        uniqueAbility: {
            name: 'The Grand Library',
            mpCost: 30,
            description: 'Research the current enemy, revealing all their moves and weaknesses for the rest of combat.',
            effect: 'reveal_all_enemy_moves'
        },
        questArc: 'The Lost Manuscripts',
        secretMotivation: 'A set of her original manuscripts were stolen by a corrupt Qadi. She needs them back before their knowledge is weaponized.'
    }
};

// --- ARABIAN ENEMY ROSTER ---
const ARABIAN_ENEMIES = {
    desert_ghoul: {
        id: 'desert_ghoul',
        name: 'Desert Ghoul (Ghul)',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 70, baseAtk: 16, xpReward: 55,
        description: 'A shapeshifter that feasts on the dead. It has taken the shape of a fallen traveler and walks among the living.',
        moves: {
            heavy: { name: 'Grave Crush', text: 'The Ghul drops its disguise and slams you with arms that can crack stone.' },
            fast: { name: 'Shapeshifter Lunge', text: 'It takes the face of someone you trust and slips past your guard.' },
            magic: { name: 'Death Mimicry', text: 'It replicates your ally\'s voice, causing a split-second distraction.' }
        },
        weakness: 'spiritual_sense_reveals_disguise',
        loot: ['Ghul\'s Shed Skin', 'Stolen Traveler\'s Ring', 'Shapeshifter Core'],
        dialogue: '"(It speaks in your mother\'s voice.) Come closer. I won\'t hurt you."'
    },
    ifrit: {
        id: 'ifrit',
        name: 'Ifrit of the Smokeless Flame',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 140, baseAtk: 28, xpReward: 110,
        description: 'Born from smokeless fire, older than any human civilization. It is not evil — it is ancient and does not like being disturbed.',
        moves: {
            heavy: { name: 'Pillar of Fire', text: 'It draws a column of smokeless flame from the earth directed at your feet.' },
            fast: { name: 'Ember Rush', text: 'It dissolves into embers and reforms directly inside your guard.' },
            magic: { name: 'Binding Contract', text: 'It attempts to trap your soul in a spiritual contract. Agree and you owe a favor; refuse and suffer backlash.' }
        },
        weakness: 'zamzam_water_or_water_qi',
        nonCombatOption: 'Offer a binding gift or invoke a Name of Power. Requires Sufi Mystic class or high karma.',
        loot: ['Smokeless Flame Ember', 'Ifrit\'s Binding Ring', 'Jinn-Sealed Vessel'],
        dialogue: '"YOU DISTURB A BEING OLDER THAN YOUR CIVILIZATION. Explain yourself — quickly."'
    },
    whispering_shaitan: {
        id: 'whispering_shaitan',
        name: 'The Whispering Shaitan',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 60, baseAtk: 20, xpReward: 65,
        description: 'You cannot see it. You can only hear it. It speaks your deepest insecurities and uses them against you.',
        moves: {
            heavy: { name: 'Crushing Doubt', text: '"You were never good enough." Your attack drops by half for one turn.' },
            fast: { name: 'Paranoid Vision', text: 'It shows your companion\'s face on the enemy. Strike wrong and lose your turn.' },
            magic: { name: 'Temptation Offer', text: 'Accept: gain 50 HP but lose 20 Karma. Refuse: it recoils in pain.' }
        },
        weakness: 'dhikr_chanting_or_high_karma',
        loot: ['Whisper Fragment', 'Corrupted Thought Shard'],
        dialogue: '"You know what you really are. I\'m the only one honest enough to say it."'
    },
    marid_soldier: {
        id: 'marid_soldier',
        name: 'Marid Palace Guard',
        region: 'brass_city',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 110, baseAtk: 24, xpReward: 85,
        description: 'A Jinn of the water-type, bound in service to the Marid King. It carries a trident of crystallized ocean pressure.',
        moves: {
            heavy: { name: 'Tidal Slam', text: 'The guard plunges its trident — a shockwave of pressurized water erupts outward.' },
            fast: { name: 'Current Step', text: 'It flows around your attack like water and strikes from the blind side.' },
            magic: { name: 'Marid Bond', text: 'A binding water chain restricts your movement and drains HP each turn.' }
        },
        weakness: 'earth_qi_or_interrupt',
        loot: ['Marid Guard Trident Fragment', 'Ocean Pressure Crystal', 'Jinn Binding Chain'],
        dialogue: '"By order of the Marid King Murkabad — you shall not pass."'
    },
    sand_wraith: {
        id: 'sand_wraith',
        name: 'Sand Wraith',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 50, baseAtk: 15, xpReward: 40,
        description: 'The spirit of a traveler who died alone in the desert. It seeks to drag others into the same fate — not out of malice, but loneliness.',
        moves: {
            heavy: { name: 'Dune Burial', text: 'The sand rises up and tries to swallow you whole.' },
            fast: { name: 'Mirage Dash', text: 'It becomes a heat haze, striking from an impossible angle.' },
            magic: { name: 'Desert\'s Despair', text: 'Unbearable heat and thirst — MP drains as your will weakens.' }
        },
        weakness: 'water_or_speak_their_name',
        nonCombatOption: 'Identify their lost name from environment clues to put them to rest peacefully for bonus karma.',
        loot: ['Sand Wraith Essence', 'Lost Traveler\'s Journal'],
        dialogue: '"...don\'t leave... please... don\'t leave me here alone..."'
    }
};

// --- TIERED LOOT TABLES BY REGION ---
const LOOT_TABLES = {
    crossroads_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Iron Merchant\'s Sword', 'Road-worn Amulet', 'Sack of Silk Coins'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Crossroads Spirit Compass', 'Merchant Prince\'s Ring'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Silk Road Map Fragment', 'Sufi Scholar\'s Tome'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['The Grand Vizier\'s Lost Signet', 'Crossroads Gate Key'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['The Eternal Caravan Bell — Its ring echoes across all six realms'] }
    ],
    jade_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Rough Jade Stone', 'Qi Gathering Pill (Low Grade)', 'Sect Disciple Robe'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Steel Jian with Qi Groove', 'Meridian Expansion Scroll', 'Cloud-Step Boots'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Dragon Vein Shard', 'Heaven-Tier Formation Plate', 'Nascent Soul Stabilizing Elixir'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['Dugu Qiubai\'s Forgotten Wooden Sword', 'Jade Emperor\'s Broken Seal Fragment'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['The Ruyi Jingu Bang — A replica of the Monkey King\'s staff, radiating divine rage'] }
    ],
    arabian_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Desert Iron Scimitar', 'Camel-Leather Water Skin', 'Faded Prayer Beads'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Silver Misbaha of Clarity', 'Jinn-Sight Kohl', 'Oasis Spring Water Vial'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Antar\'s Battle Poem Tablet', 'Ifrit-Forged Scimitar', 'Sufi Dhikr Ring'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['Sinbad\'s Roc Feather', 'Al-Khidr\'s Reed Staff Fragment'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['Tariq\'s Lost Scabbard — Inscribed: "There is no retreat"'] }
    ],
    sea_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Sea Glass Shard', 'Qi-Saturated Kelp', 'Drowned Sailor\'s Compass'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Dragon Pearl (Minor)', 'Abyssal Armor Plate', 'Sea Dragon Scale'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Sunken Palace Key', 'Leviathan Tooth Blade', 'Void-Sea Navigation Chart'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['Dragon King\'s Coral Throne Fragment', 'Drowned Immortal\'s Core'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['The Sea-Calming Pearl — Calms all Jinn and sea enemies on sight'] }
    ],
    brass_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Brass City Coin', 'Jinn-Forged Iron Shard', 'Ancient Lamp Oil'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Irem Brass Amulet', 'Marid Water Crystal', 'Pillar City Stone Fragment'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Irem Throne Room Key', 'Marid King\'s Binding Chain', 'City of Pillars Map'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.07, items: ['Murkabad\'s Trident Shard', 'Brass City Founding Tablet'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['The Lamp of Irem — Contains a djinn bound to serve one act of justice, then it shatters'] }
    ],
    celestial_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.50, items: ['Heavenly Guard Insignia', 'Celestial Bronze Arrow', 'Star Dust Vial'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Heaven Peach (Minor)', 'Divine Council Seal', 'Celestial Silk Robe'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.15, items: ['Jade Emperor\'s Edict Scroll', 'Immortal Peach Elixir'] },
        { rarity: 'Legendary', css: 'loot-legendary', chance: 0.09, items: ['Nuwa\'s Five-Colored Stone', 'Heaven-Spanning Bridge Shard'] },
        { rarity: 'Mythic', css: 'loot-mythic', chance: 0.01, items: ['The Celestial Crown — Wearing it triggers the Ascension Ending'] }
    ]
};

// --- PROCEDURAL NPC ENGINE DATA ---
const NPC_ENGINE = {
    chinese_names: ['Li Wei', 'Jin Hua', 'Bao Zhai', 'Chen Gong', 'Xue Yi', 'Elder Ma', 'Gui Ying', 'Feng Yun', 'Long Mei', 'Zi Xuan', 'Tian Bao', 'Shan Hu'],
    arabian_names: ['Tariq', 'Fatima', 'Zayd', 'Al-Hasan', 'Khadija', 'Harun', 'Rashid', 'Zainab', 'Layla', 'Umar', 'Saffiya', 'Bilal', 'Amr', 'Miriam'],
    chinese_titles: ['Foundation Establishment Alchemist', 'Nascent Soul Patriarch', 'Wandering Sword Saint', 'Outer Sect Elder', 'Rogue Cultivator', 'Demonic Path Inheritor', 'Body Tempering Champion'],
    arabian_titles: ['Wandering Murid', 'Desert Faris (Knight)', 'Corrupt Qadi', 'Sufi Order Initiate', 'Jinn-Binder Scholar', 'Sand Merchant Prince', 'Traveling Hakeem (Physician)'],
    visual_hooks: [
        'eyes like polished obsidian, reflecting light they should not see',
        'a cloak woven from spun gold and desert sand that never wrinkles',
        'skin scarred in lightning-shaped patterns from a Heavenly Tribulation',
        'carrying a misbaha whose beads hum with barely contained power',
        'floating precisely three inches above the ground at all times',
        'a sword so worn its handle is smooth as river stone from ten thousand draws',
        'wearing both a Taoist robe and a kufiya, as if belonging to both worlds',
        'jade embedded directly into their knuckles, glowing with each heartbeat',
        'prayer marks on their forehead, but their shadow moves independently'
    ],
    secrets: [
        'is secretly hunting the cultivator who destroyed their village.',
        'is suppressing a demonic bloodline curse that resurfaces at night.',
        'knows the location of a lost Sufi shrine worth a Legendary loot drop.',
        'is an illusion cast by a greater Marid testing nearby mortals.',
        'carries a letter they cannot deliver because the recipient has been dead for 200 years.',
        'is actually a Dragon in human form, deeply bored with immortality.',
        'was the abandoned student of one of your companions.',
        'is working for the corrupt Qadi and will betray the player if not identified.'
    ],
    motivations_hostile: [
        'wants to steal your cultivation base to repair their shattered meridians.',
        'has been paid by a rival sect to intercept travelers on this road.',
        'is under a Jinn contract compelling them to fight any who pass.',
        'mistook you for someone who wronged their family generations ago.'
    ]
};

// --- MASTER EXPORT — globally accessible to game.js ---
window.LORE = {
    REGIONS,
    CHINESE_HEROES,
    ARABIAN_HEROES,
    CHINESE_ENEMIES,
    ARABIAN_ENEMIES,
    LOOT_TABLES,
    NPC_ENGINE,
    getAllHeroes: () => ({ ...CHINESE_HEROES, ...ARABIAN_HEROES }),
    getAllEnemies: () => ({ ...CHINESE_ENEMIES, ...ARABIAN_ENEMIES }),
    getRegionEnemies: (regionId) => {
        const region = REGIONS[regionId];
        if (!region) return [];
        const all = { ...CHINESE_ENEMIES, ...ARABIAN_ENEMIES };
        return region.enemies.map(id => all[id]).filter(Boolean);
    },
    getLootTable: (regionId) => {
        const region = REGIONS[regionId];
        return region ? LOOT_TABLES[region.lootTable] : LOOT_TABLES['crossroads_loot'];
    }
};
