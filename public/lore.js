// ============================================================
// LORE.JS — Part 1: World Regions, Chinese Characters, Enemies
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

// --- THE SIX GREAT REGIONS ---
const REGIONS = {
    crossroads: {
        id: 'crossroads',
        name: 'City of Crossroads',
        subtitle: 'Where Two Worlds Collide',
        description: 'The beating heart of the Silk Road. Frankincense and spirit-refined steel fill the air. Here, Taoist sages share tea with Sufi scholars, and every shadow hides a secret.',
        stageRange: [1, 3],
        unlocked: true,
        ambientColor: '#8a4a00',
        enemies: ['silk_road_bandit', 'corrupted_merchant', 'street_ghost'],
        npcs: ['scheherazade', 'harun_al_rashid', 'li_bai'],
        lootTable: 'crossroads_loot'
    },
    jade_peak: {
        id: 'jade_peak',
        name: 'The Jade Peak Heavens',
        subtitle: 'Where Immortals Walk Among Clouds',
        description: 'Towering mountains pierce the clouds. Immortal Sects carve their names into cliff-faces with sword intent. The air itself hums with Dragon Vein energy.',
        stageRange: [2, 6],
        unlocked: false,
        ambientColor: '#00a86b',
        enemies: ['corrupted_taoist', 'hungry_ghost', 'dragon_carp', 'fallen_disciple', 'jade_golem'],
        npcs: ['guan_yu', 'ne_zha', 'nuwa', 'zhuge_liang', 'dugu_qiubai'],
        lootTable: 'jade_loot'
    },
    empty_quarter: {
        id: 'empty_quarter',
        name: 'The Empty Quarter',
        subtitle: 'Where Jinn Kingdoms Slumber Beneath the Sand',
        description: 'An ocean of dunes stretching to infinity. The stars here tell futures. Brass towers of extinct civilizations pierce the horizon. Something ancient stirs beneath.',
        stageRange: [4, 8],
        unlocked: false,
        ambientColor: '#c8860a',
        enemies: ['desert_ghoul', 'ifrit', 'whispering_shaitan', 'sand_wraith', 'marid_soldier'],
        npcs: ['al_khidr', 'sinbad', 'antar_ibn_shaddad', 'fatima_al_fihri'],
        lootTable: 'arabian_loot'
    },
    abyssal_sea: {
        id: 'abyssal_sea',
        name: 'The Abyssal Sea of Qi',
        subtitle: 'An Ocean of Pure Spiritual Energy',
        description: 'No water — only liquid Qi stretching to the horizon. Sea Dragons coil around sunken palaces. Cultivators who fall in either ascend instantly or are dissolved into pure energy.',
        stageRange: [6, 10],
        unlocked: false,
        ambientColor: '#0f52ba',
        enemies: ['sea_dragon_young', 'drowned_immortal', 'qi_leech', 'phantom_admiral', 'celestial_crab'],
        npcs: ['sinbad', 'nuwa'],
        lootTable: 'sea_loot'
    },
    brass_city: {
        id: 'brass_city',
        name: 'The Brass City of Irem',
        subtitle: 'The City of a Thousand Pillars',
        description: 'The legendary city buried beneath the Empty Quarter, now unearthed by spiritual upheaval. Its pillars reach the sky. Its ruler, the Marid King Murkabad, has not been seen in centuries.',
        stageRange: [8, 12],
        unlocked: false,
        ambientColor: '#8a1c1c',
        enemies: ['brass_guardian', 'marid_king_guard', 'corrupted_jinn', 'iron_ghoul', 'shaitan_elder'],
        npcs: ['marid_king_murkabad', 'scheherazade'],
        lootTable: 'brass_loot'
    },
    celestial_court: {
        id: 'celestial_court',
        name: 'The Celestial Court',
        subtitle: 'Where Heaven Judges the Living',
        description: 'Above the clouds, beyond the reach of mortal eyes. The Jade Emperor sits on his throne of carved starlight. The Divine Council of Prophets stands opposite. Both realms are in crisis. Only you can decide what comes next.',
        stageRange: [12, 15],
        unlocked: false,
        ambientColor: '#d4af37',
        enemies: ['heavenly_guard', 'fallen_immortal_patriarch', 'jade_emperor_guardian', 'divine_council_enforcer'],
        npcs: ['jade_emperor', 'al_khidr', 'nuwa', 'sun_wukong'],
        lootTable: 'celestial_loot'
    }
};

// --- CHINESE LEGENDARY HEROES ---
const CHINESE_HEROES = {
    sun_wukong: {
        id: 'sun_wukong',
        name: 'Sun Wukong',
        title: 'The Great Sage Equal to Heaven',
        origin: 'jade_peak',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'chaotic_good',
        karmaRequirement: -30, // Anyone above -30 can recruit him
        affinity: 50,
        personality: 'boisterous',
        description: 'Immortal. Indestructible. Irreverent. The Monkey King spent 500 years under a mountain for defying the Jade Emperor, and came out stronger. He fights not out of duty, but because it\'s fun.',
        dialogue: {
            greet: [
                '"Old Sun was wondering when you\'d show up! You have the smell of destiny on you — and also road dust."',
                '"Ha! Another mortal seeking immortality? Most of them bore me. You... might be interesting."',
                '"This staff hasn\'t tasted a good fight in decades. You want to team up? Try to keep up."'
            ],
            battle_cry: [
                '"72 transformations! And this is the form I use on WEAKLINGS!"',
                '"Strike fast! Old Sun will cover your back — unless something shinier appears."',
                '"Feel the weight of my staff, you stinking ghost!"'
            ],
            high_affinity: '"You know, of all the masters I\'ve followed, you\'re the least annoying. That\'s a compliment."',
            low_affinity: '"Keep acting like that and Old Sun will find a more entertaining mortal to bother."',
            death_line: '"Even... old Sun... can be... surprised..."'
        },
        passiveBuff: { stat: 'atk', bonus: 0.20, label: '+20% Attack' },
        uniqueAbility: {
            name: 'Seventy-Two Changes',
            mpCost: 25,
            description: 'Transform into the current enemy\'s form, confusing them and negating their next attack entirely.',
            effect: 'negate_enemy_attack'
        },
        questArc: 'The Pilgrimage Reborn',
        secretMotivation: 'Searching for a worthy successor before his immortal body finally crumbles from the weight of Heaven\'s resentment.'
    },
    guan_yu: {
        id: 'guan_yu',
        name: 'Guan Yu',
        title: 'The Sacred Duke / God of War',
        origin: 'jade_peak',
        sprite: 'assets/guan_yu.png',
        alignment: 'lawful_good',
        karmaRequirement: 40, // Only righteous players can ally
        affinity: 0,
        personality: 'stoic',
        description: 'He does not speak unless necessary. His presence alone bends the spiritual pressure of a room. The God of War measures a person\'s worth by their loyalty, not their power.',
        dialogue: {
            greet: [
                '"Your Qi is unstable. Your heart is not yet decided. Come back when you know who you are."',
                '"I have seen ten thousand warriors. Few had the eyes you have. Do not waste them."'
            ],
            battle_cry: [
                '"For righteousness."',
                '"Face your enemy with a clear heart."'
            ],
            high_affinity: '"You remind me of Liu Bei in his youth. That is not a small thing to say."',
            low_affinity: '"The path of demons leads only to ashes. I will not follow you there."',
            test_event: 'Guan Yu appears in your path. He says nothing, only raises his blade. This is a test of your worth.'
        },
        passiveBuff: { stat: 'def', bonus: 0.25, label: '+25% Defense' },
        uniqueAbility: {
            name: 'Green Dragon Crescent Slash',
            mpCost: 30,
            description: 'A single, devastating strike that deals triple damage and stuns the enemy for 1 turn.',
            effect: 'triple_damage_stun'
        },
        questArc: 'The Test of Loyalty',
        secretMotivation: 'The Jade Emperor has tasked him with evaluating the player as a candidate for a divine post. He has not told the player this.'
    },
    hua_mulan: {
        id: 'hua_mulan',
        name: 'Hua Mulan',
        title: 'The Unbroken Blade',
        origin: 'crossroads',
        sprite: 'assets/hua_mulan.png',
        alignment: 'neutral_good',
        karmaRequirement: -100, // Anyone can recruit
        affinity: 0,
        personality: 'determined',
        description: 'She fought twelve years in disguise and never lost a battle. Now she walks the Silk Road looking for a cause worth fighting for. She speaks little, but every word counts.',
        dialogue: {
            greet: [
                '"I don\'t care about your cultivation rank. Show me what you fight for."',
                '"The road is dangerous alone. I\'ve been watching you. You\'re not entirely hopeless."'
            ],
            battle_cry: [
                '"For family. For honor. Forward!"',
                '"They underestimate us. That is their last mistake."'
            ],
            high_affinity: '"In all my travels I\'ve met generals and emperors. You fight with more heart than all of them."',
            unique_ability_use: '"Disguise Protocol — I become whoever they least expect."'
        },
        passiveBuff: { stat: 'def', bonus: 0.15, label: '+15% Defense & stealth in dialogue events' },
        uniqueAbility: {
            name: 'The Disguise Protocol',
            mpCost: 20,
            description: 'Mulan disguises you as a local, bypassing a social gate or reducing enemy suspicion in dialogue.',
            effect: 'bypass_social_gate'
        },
        questArc: 'Twelve Years, One Name',
        secretMotivation: 'Her father is being held by a corrupt Jade Peak Sect Elder. She needs the player\'s help to free him without sparking a war.'
    },
    ne_zha: {
        id: 'ne_zha',
        name: 'Ne Zha',
        title: 'The Third Prince, Lotus-Born',
        origin: 'jade_peak',
        sprite: 'assets/ne_zha.png',
        alignment: 'chaotic_neutral',
        karmaRequirement: -60,
        affinity: 0,
        personality: 'rebellious',
        description: 'He tore out his own bones to free his family from Heaven\'s debt, was reborn from lotus flowers, and has been causing chaos ever since. Death holds no meaning for him.',
        dialogue: {
            greet: [
                '"Hah! You actually came this far? Not bad for a mortal bag of bones."',
                '"Old Heaven hates me. Old Dragon Kings hate me. And I\'m STILL here. What does that tell you?"'
            ],
            battle_cry: [
                '"UNIVERSE RING — GO!"',
                '"I died once already. Try harder!"'
            ],
            high_affinity: '"If I had a big brother worth having, I\'d want them to be like you. Don\'t make it weird."',
            revive_proc: '"Did you forget? Lotus rebirth. I\'m fine. You should see the other guy."'
        },
        passiveBuff: { stat: 'hp', bonus: 0, label: 'Once per battle: revives with 30% HP on fatal blow' },
        uniqueAbility: {
            name: 'Lotus Rebirth',
            mpCost: 0,
            description: 'Passive. Once per battle when HP reaches 0, Ne Zha revives with 30% maximum HP.',
            effect: 'one_time_revive'
        },
        questArc: 'Debt of the Dragon Sea',
        secretMotivation: 'The Dragon King\'s third son has placed a spiritual brand on Ne Zha that is slowly eroding his lotus-body. He needs a specific herb only the player can find.'
    },
    nuwa: {
        id: 'nuwa',
        name: 'Nuwa',
        title: 'Mother of Creation, Patcher of Heaven',
        origin: 'celestial_court',
        sprite: 'assets/nuwa.png',
        alignment: 'lawful_neutral',
        karmaRequirement: 60, // Very righteous only
        affinity: 0,
        personality: 'ancient_serene',
        description: 'She repaired the sky with five-colored stones when Heaven cracked. She shaped humanity from clay. She does not involve herself in mortal affairs lightly — when she does, the world listens.',
        dialogue: {
            greet: [
                '"Child. I have watched ten thousand cultivators walk this path. Few understood what they were truly seeking. What do you seek?"',
                '"The cracks in Heaven are widening again. This time, even I cannot repair them alone."'
            ],
            repair_event: '"Your cultivation path was broken. Let me mend it. Do not flinch — creation always requires pain."',
            high_affinity: '"You are beginning to understand something that most Immortals never grasp. I am... proud of you."'
        },
        passiveBuff: { stat: 'maxHp', bonus: 0.30, label: '+30% Max HP & can repair broken cultivation' },
        uniqueAbility: {
            name: 'Five-Colored Mending Stone',
            mpCost: 40,
            description: 'Restores full HP and removes all debuffs from both the player and one companion.',
            effect: 'full_party_heal'
        },
        questArc: 'The Second Crack in Heaven',
        secretMotivation: 'She already knows how this story ends. She is here to ensure the player chooses the right ending — but she cannot interfere directly.'
    },
    zhuge_liang: {
        id: 'zhuge_liang',
        name: 'Zhuge Liang',
        title: 'The Sleeping Dragon, Prime Minister of Shu',
        origin: 'crossroads',
        sprite: 'assets/zhuge_liang.png',
        alignment: 'lawful_good',
        karmaRequirement: 20,
        affinity: 0,
        personality: 'calculating',
        description: 'The greatest strategist who ever lived. He borrowed 100,000 arrows from the enemy using only fog and scarecrows. He does not fight — he makes fighting unnecessary.',
        dialogue: {
            greet: [
                '"I have been studying your moves from a distance. You have talent. Unfortunately, talent without strategy is simply fast dying."',
                '"Come. Let us discuss the empty city strategy. There are times when showing strength is weakness, and weakness is ultimate strength."'
            ],
            strategy_hint: '"The enemy expects a frontal assault. Do the opposite. Always the opposite."',
            high_affinity: '"You have learned to think three moves ahead. Now learn to think of the move your enemy hasn\'t considered yet."'
        },
        passiveBuff: { stat: 'intelligence', bonus: 0, label: 'Reveals enemy next move type 1 turn early' },
        uniqueAbility: {
            name: 'Empty City Strategy',
            mpCost: 35,
            description: 'Bluff an enemy into standing down for 2 turns without dealing any damage. Fails against enemies with high spiritual sense.',
            effect: 'bluff_stun'
        },
        questArc: 'The Unfinished Northern Campaign',
        secretMotivation: 'His spirit is bound to this world because his final military campaign failed. He needs the player to symbolically complete it by defeating a specific warlord-type enemy.'
    }
};

// --- CHINESE ENEMY ROSTER ---
const CHINESE_ENEMIES = {
    corrupted_taoist: {
        id: 'corrupted_taoist',
        name: 'Corrupted Taoist Patriarch',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 80,
        baseAtk: 18,
        xpReward: 60,
        description: 'A sect elder who consumed demonic pills to accelerate his cultivation. His robes are stained black from the inside out.',
        moves: {
            heavy: { name: 'Dark Palm Strike', text: 'The Patriarch raises both palms, black Qi spiraling outward in a deadly vortex.' },
            fast: { name: 'Shadow Step Slash', text: 'He vanishes into shadow, reappearing directly behind you with a curved black blade.' },
            magic: { name: 'Demonic Meridian Seal', text: 'He traces a burning sigil in the air — if it lands, your Qi meridians will be sealed for one turn.' }
        },
        weakness: 'interrupt_magic',
        loot: ['Demonic Cultivation Scroll', 'Black Qi Stone', 'Stolen Sect Token'],
        dialogue: '"Your Dao is fragile! MINE is absolute!"'
    },
    hungry_ghost: {
        id: 'hungry_ghost',
        name: 'Hungry Ghost (Egui)',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 45,
        baseAtk: 12,
        xpReward: 35,
        description: 'A soul trapped between death and rebirth. Its throat is needle-thin and it can never eat enough — it devours Qi instead of food.',
        moves: {
            heavy: { name: 'Desperate Clutch', text: 'The Egui\'s emaciated arms stretch unnaturally wide, trying to crush you.' },
            fast: { name: 'Qi Drain Touch', text: 'It reaches with a single finger — cold as absolute void — toward your cultivation core.' },
            magic: { name: 'Mournful Wail', text: 'An unearthly shriek fills the air, vibrating your very soul. Your MP begins draining.' }
        },
        weakness: 'guard_blocks_mp_drain',
        loot: ['Ghost Fire Shard', 'Grieving Spirit Talisman'],
        dialogue: '"...hungry... so... hungry..."'
    },
    dragon_carp: {
        id: 'dragon_carp',
        name: 'Dragon Carp (Pre-Ascension)',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 120,
        baseAtk: 22,
        xpReward: 90,
        description: 'A massive, ancient carp attempting to leap the Dragon Gate waterfall and ascend. It is not evil — only desperate. There is a non-combat resolution available.',
        moves: {
            heavy: { name: 'Tail Slam', text: 'The enormous carp hurls its body sideways, creating a shockwave of water and Qi.' },
            fast: { name: 'Scale Rush', text: 'It charges straight at you, scales flashing like tempered steel.' },
            magic: { name: 'River Surge', text: 'It calls the river itself, surrounding you in crushing Qi-infused water.' }
        },
        weakness: 'diplomacy_lure_with_spirit_bait',
        nonCombatOption: 'Offer a Spirit Bait item. The carp calms, and in gratitude leaves a Dragon Scale.',
        loot: ['Dragon Scale Fragment', 'River Pearl', 'Ascension Carp Fin'],
        dialogue: '(The carp circles you with desperate, ancient eyes. It does not want to fight.)'
    },
    jade_golem: {
        id: 'jade_golem',
        name: 'Jade Sect Guardian Golem',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 200,
        baseAtk: 30,
        xpReward: 150,
        description: 'Constructed from living jade and sealed with a thousand-year formation array. It guards sect archives that someone does not want the player to read.',
        moves: {
            heavy: { name: 'Formation Slam', text: 'The Golem raises its fist, and the ground cracks in a cross-shaped formation pattern beneath your feet.' },
            fast: { name: 'Jade Shard Burst', text: 'Its chest cracks open, firing crystallized jade shards at razor velocity.' },
            magic: { name: 'Sealing Array Activation', text: 'The Golem\'s eyes glow — a formation circle appears beneath you, threatening to seal your movement.' }
        },
        weakness: 'find_core_stone_destroy_it',
        loot: ['Formation Core Stone', 'Living Jade Chip', 'Sect Archive Key'],
        dialogue: '(The golem does not speak. It only advances.)'
    },
    fallen_disciple: {
        id: 'fallen_disciple',
        name: 'Fallen Sect Disciple',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 55,
        baseAtk: 14,
        xpReward: 40,
        description: 'A young cultivator who took a shortcut and shattered their meridians. They blame the world for their failure.',
        moves: {
            heavy: { name: 'Shattered Meridian Strike', text: 'They channel broken Qi — unpredictable and wild, twice as dangerous because of it.' },
            fast: { name: 'Desperate Lunge', text: 'Pure desperation channeled into a reckless forward charge.' },
            magic: { name: 'Qi Explosion', text: 'They crack their own core, releasing a burst of uncontrolled spiritual energy.' }
        },
        weakness: 'diplomacy_offer_healing',
        nonCombatOption: 'A Medicine Cultivator can offer to repair their meridians, turning them into a grateful NPC.',
        loot: ['Broken Jade Pendant', 'Shattered Cultivation Manual Page'],
        dialogue: '"I was supposed to be a genius. I was supposed to reach the heavens."'
    }
};

window.LORE = Object.assign(window.LORE || {}, { REGIONS, CHINESE_HEROES, ARABIAN_HEROES, NPC_ENGINE, ENEMIES });

window.LORE = Object.assign(window.LORE || {}, { REGIONS, CHINESE_HEROES, ARABIAN_HEROES, NPC_ENGINE, ENEMIES });
