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
        lootTable: 'crossroads_loot',
        x: 400, y: 280
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
        lootTable: 'jade_loot',
        x: 590, y: 175
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
        lootTable: 'arabian_loot',
        x: 185, y: 360
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
        lootTable: 'sea_loot',
        x: 625, y: 370
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
        lootTable: 'brass_loot',
        x: 135, y: 195
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
        lootTable: 'celestial_loot',
        x: 415, y: 72
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
        title: 'The Sacred Duke / Supreme of War',
        origin: 'jade_peak',
        sprite: 'assets/guan_yu.png',
        alignment: 'lawful_good',
        karmaRequirement: 40, // Only righteous players can ally
        affinity: 0,
        personality: 'stoic',
        description: 'He does not speak unless necessary. His presence alone bends the spiritual pressure of a room. The Supreme of War measures a person\'s worth by their loyalty, not their power.',
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
        }
    }
};

// --- CROSSROADS ENEMY ROSTER ---
const CROSSROADS_ENEMIES = {
    silk_road_bandit: {
        id: 'silk_road_bandit',
        name: 'Silk Road Bandit',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 40, baseAtk: 10, xpReward: 20,
        description: 'A desperate thief preying on merchants. They are fast but poorly armored.',
        moves: {
            heavy: { name: 'Thug Smash', text: 'The bandit raises a heavy club, ready to crush your guard.' },
            fast: { name: 'Dagger Lunge', text: 'A quick, dirty strike aimed at your vitals.' },
            magic: { name: 'Sand Throw', text: 'A handful of sand aimed at your eyes to blind your next move.' }
        },
        archetype: 'assassin',
        loot: ['Silk Coin Pouch', 'Rusty Dagger']
    },
    corrupted_merchant: {
        id: 'corrupted_merchant',
        name: 'Corrupted Merchant Prince',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 60, baseAtk: 12, xpReward: 35,
        description: 'A man who traded his soul for gold. He fights with coins that explode with greed.',
        moves: {
            heavy: { name: 'Gold Weight', text: 'He hurls a bag of cursed gold, weighing down your spirit.' },
            fast: { name: 'Bribe Strike', text: 'A strike that attempts to drain your MP to "buy" your defeat.' },
            magic: { name: 'Greed Explosion', text: 'His coins burst into spiritual fire, fueled by pure avarice.' }
        },
        archetype: 'balanced',
        loot: ['Cursed Gold Coin', 'Silk Road Contract']
    },
    street_ghost: {
        id: 'street_ghost',
        name: 'Vengeful Street Ghost',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 35, baseAtk: 15, xpReward: 25,
        description: 'The spirit of a beggar who died in the shadows. It seeks warmth by draining yours.',
        moves: {
            heavy: { name: 'Cold Grasp', text: 'Its touch is like ice, slowing your movements.' },
            fast: { name: 'Whispering Lunge', text: 'It vanishes and reappears, its wail echoing in your ears.' },
            magic: { name: 'Life Drain', text: 'It attempts to pull your life essence directly into its hollow chest.' }
        },
        archetype: 'mage',
        loot: ['Ghost Essence', 'Faded Beggar\'s Bowl']
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

const ARABIAN_ENEMIES = {
    desert_ghoul: {
        id: 'desert_ghoul', name: 'Desert Ghoul', region: 'empty_quarter',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 70, baseAtk: 22, xpReward: 50,
        description: 'A scavenger of the dunes, toughened by the heat and hungry for flesh.',
        moves: {
            heavy: { name: 'Bone Cracker', text: 'It lunges with supernatural strength, aiming to break your guard.' },
            fast: { name: 'Sand Claw', text: 'A swift, raking strike from its jagged nails.' },
            magic: { name: 'Heat Mirage', text: 'It shimmers in the heat, making it harder to hit while it recovers.' }
        },
        loot: ['Ghoul Tooth', 'Desert Sand Stone']
    },
    ifrit: {
        id: 'ifrit', name: 'Scorching Ifrit', region: 'empty_quarter',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 120, baseAtk: 28, xpReward: 100,
        description: 'A jinn of fire and smoke. It sees your mortality as a fuel to be consumed.',
        moves: {
            heavy: { name: 'Supernova Slam', text: 'A massive burst of thermal energy that melts the surrounding sand.' },
            fast: { name: 'Flame Lash', text: 'A whip of spiritual fire that burns through physical armor.' },
            magic: { name: 'Smoke Veil', text: 'It vanishes into a cloud of sulfur, preparing its next ambush.' }
        },
        loot: ['Fire Essence', 'Brass Lamp Shard']
    },
    jade_enforcer_squad: {
        id: 'jade_enforcer_squad', name: 'Jade Summit Enforcer Squad', region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 300, baseAtk: 45, xpReward: 300,
        description: 'An elite patrol of the Jade Peak, armed with spears of divine law.',
        moves: {
            heavy: { name: 'Sect Phalanx', text: 'The enforcers lock their jade shields, raising physical defense while lunging forward.' },
            fast: { name: 'Piercing Lunge', text: 'A rapid flurry of cold jade spears aiming for vital meridians.' },
            magic: { name: 'Formation Lock', text: 'They chant a restraining formula, threatening to cage your movements.' }
        },
        loot: ['Broken Jade Pendant', 'Sect Archive Key']
    },
    desert_jinn_rebel: {
        id: 'desert_jinn_rebel', name: 'Gargantuan Desert Jinn Rebel', region: 'desert_rift',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        baseHp: 450, baseAtk: 60, xpReward: 500,
        description: 'A giant spirit of fire who refuses the order of the Emperor.',
        moves: {
            heavy: { name: 'Dune Smasher', text: 'A heavy sand-hammer blow that pulverizes shields.' },
            fast: { name: 'Desert Vortex', text: 'A blazing spin-attack of sand and fire.' },
            magic: { name: 'Flame Tempest', text: 'A searing wave of spiritual flame.' }
        },
        loot: ['Fire Essence', 'Monster Core']
    },
    corrupted_jade_specter: {
        id: 'corrupted_jade_specter', name: 'Corrupted Jade Specter', region: 'desert_rift',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 450, baseAtk: 60, xpReward: 500,
        description: 'A haunting ghost of celestial jade, driven mad by the desert storms.',
        moves: {
            heavy: { name: 'Spectral Claw', text: 'A sweeping physical strike of cold phantom energy.' },
            fast: { name: 'Jade Spike', text: 'Fires high-speed jade shards from the sky.' },
            magic: { name: 'Qi Leach', text: 'A chilling siphon that steals HP and MP.' }
        },
        loot: ['Living Jade Chip', 'Monster Core']
    },
    fog_golem: {
        id: 'fog_golem', name: 'Spectral Fog Golem', region: 'desert_rift',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 500, baseAtk: 55, xpReward: 500,
        description: 'A mass of rock and dust, held together by corrupted mist.',
        moves: {
            heavy: { name: 'Mist Hammer', text: 'A heavy, slow smash of solid granite.' },
            fast: { name: 'Dust Storm', text: 'Blinds you with a swirling cloud of sharp dust.' },
            magic: { name: 'Stone Armor', text: 'Draws mineral components to reinforce its physical shell.' }
        },
        loot: ['Iron Ore', 'Monster Core']
    },
    fallen_immortal_final: {
        id: 'fallen_immortal_final', name: 'The Fallen Immortal (Void)', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1000, baseAtk: 90, xpReward: 2000,
        description: 'The final boss, holding the broken threads of both East and West.',
        moves: {
            heavy: { name: 'Abyssal Void Slam', text: 'Gathers the crushing gravity of the empty space to smash your physical body.' },
            fast: { name: 'Void Piercer', text: 'A laser spike of dark, concentrated spiritual light.' },
            magic: { name: 'Cosmic Dissolution', text: 'Draws spiritual energy from the surrounding ley lines to heal and burn.' }
        },
        loot: ['Varunastra Core', 'Pangu\'s Axe Fragment']
    },
    fallen_immortal_righteous: {
        id: 'fallen_immortal_righteous', name: 'The Fallen Immortal (Ashes of Order)', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1100, baseAtk: 95, xpReward: 2000,
        description: 'The avatar of the Void, reacting to your sterile order by gathering all of reality\'s ashes.',
        moves: {
            heavy: { name: 'Imperial Ruin', text: 'Crushes with the weight of fallen celestial empires.' },
            fast: { name: 'Lawbreaker Spear', text: 'A lance of pure white anti-matter.' },
            magic: { name: 'Sterile Vacuum', text: 'Sucks away all breath and spiritual Qi from the air.' }
        },
        loot: ['Rigveda Pages', 'Seven Star Sword of Dao']
    },
    fallen_immortal_demonic: {
        id: 'fallen_immortal_demonic', name: 'The Fallen Immortal (Core of Chaos)', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1200, baseAtk: 105, xpReward: 2000,
        description: 'The avatar of the Void, matching your dark flame with the icy vacuum of absolute space.',
        moves: {
            heavy: { name: 'Asura Devastator', text: 'Unleashes six massive phantom arm strikes simultaneously.' },
            fast: { name: 'Chaos Blade', text: 'A dark slice that ignores 50% of your defense.' },
            magic: { name: 'Black Sun Eruption', text: 'A supernova of negative karma that consumes everything.' }
        },
        loot: ['Kavacha Golden Breastplate', 'Wukong\'s Golden Band']
    },
    fallen_immortal_neutral: {
        id: 'fallen_immortal_neutral', name: 'The Fallen Immortal (Fractured Balance)', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1150, baseAtk: 100, xpReward: 2000,
        description: 'The avatar of the Void, challenging your claim to the center of the world.',
        moves: {
            heavy: { name: 'World Balance Cracker', text: 'Splits the ground in two, throwing you off stance.' },
            fast: { name: 'Symmetrical Strike', text: 'A double blow targeting both body and spirit.' },
            magic: { name: 'Yin-Yang Devastation', text: 'Unleashes twin beams of absolute heat and absolute cold.' }
        },
        loot: ['Trishula of the Three Realms', 'Taiji Yin-Yang Ring']
    }
};

window.LORE = Object.assign(window.LORE || {}, { 
    REGIONS, 
    CHINESE_HEROES, 
    CHINESE_ENEMIES,
    CROSSROADS_ENEMIES,
    ARABIAN_ENEMIES,
    getAllEnemies: function() {
        return { 
            ...(this.CHINESE_ENEMIES || {}), 
            ...(this.ARABIAN_ENEMIES || {}), 
            ...(this.CROSSROADS_ENEMIES || {}) 
        };
    },
    getRegionEnemies: function(regionId) {
        const all = this.getAllEnemies();
        return Object.values(all).filter(e => e.region === regionId);
    }
});

// ============================================================
// EQUIPMENT DATA - The Immortal Armory
// ============================================================
window.EQUIPMENT_DATA = {
    // === CHINESE XIANXIA SET ===
    seven_star_sword: { id: 'seven_star_sword', name: 'Seven Star Sword of Dao', slot: 'weapon', quality: 'Super', stats: { atk: 85, mp: 30 }, reqLevel: 20, reqStage: 'Core Formation', desc: 'Inscribed with the Big Dipper constellation, aligning your blade with the celestial axis.' },
    qingping_sword: { id: 'qingping_sword', name: 'Qingping Sword of Harmony', slot: 'weapon', quality: 'Elite', stats: { atk: 50 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'A famous sword of ancient sects, radiating pure clear Qi.' },
    xuanwu_plate: { id: 'xuanwu_plate', name: 'Xuanwu Turtle Scale Plate', slot: 'body', quality: 'Super', stats: { def: 75, hp: 200 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'Forged from the scales of the black tortoise Xuanwu. Virtually unbreakable.' },
    phoenix_feather_crown: { id: 'phoenix_feather_crown', name: 'Phoenix Feather Crown', slot: 'head', quality: 'Super', stats: { def: 25, mp: 50 }, reqLevel: 22, reqStage: 'Core Formation', desc: 'Woven with the glowing tail-feathers of a divine phoenix, granting mental clarity.' },
    nine_dragons_cauldron: { id: 'nine_dragons_cauldron', name: 'Nine Dragons Spirit Cauldron', slot: 'relic', quality: 'Super', stats: { mp: 120 }, reqLevel: 24, reqStage: 'Core Formation', desc: 'A miniature bronze cauldron that constantly purifies the user\'s internal meridians.' },
    taiji_yin_yang_ring: { id: 'taiji_yin_yang_ring', name: 'Taiji Yin-Yang Ring', slot: 'ring', quality: 'Unique', stats: { def: 12, mp: 40 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'A jade ring depicting the cosmic balance, allowing effortless shifting between hard and soft styles.' },
    kunlun_frost_boots: { id: 'kunlun_frost_boots', name: 'Kunlun Frost-Riding Boots', slot: 'boots', quality: 'Elite', stats: { def: 18, speed: 12 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'Boots forged from glacier-ice of Mount Kunlun, leaving cold footprints in the hot desert.' },
    pangu_axe_fragment: { id: 'pangu_axe_fragment', name: 'Pangu\'s World-Cleaving Fragment', slot: 'relic', quality: 'Super', stats: { atk: 40, def: 20 }, reqLevel: 28, reqStage: 'Core Formation', desc: 'A tiny flake of obsidian from the primeval axe that split heaven and earth.' },
    fuxi_zither: { id: 'fuxi_zither', name: 'Fuxi\'s Jade Zither', slot: 'relic', quality: 'Elite', stats: { mp: 80 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'Strumming this zither calms wild spiritual beast souls.' },
    bagua_mirror: { id: 'bagua_mirror', name: 'Daoist Bagua Mirror', slot: 'relic', quality: 'Normal', stats: { def: 8 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'A simple bronze mirror used to ward off street ghosts and low-level demons.' },
    demon_slaying_cord: { id: 'demon_slaying_cord', name: 'Demon-Slaying Gold Cord', slot: 'relic', quality: 'Refined', stats: { atk: 15 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'A shimmering gold thread used to bind corrupted disciples and rogue beasts.' },
    gilded_dragon_greaves: { id: 'gilded_dragon_greaves', name: 'Gilded Dragon-Vein Greaves', slot: 'legs', quality: 'Elite', stats: { def: 35, hp: 60 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'Leg armor infused with the solid heavy energy of local dragon ley-lines.' },
    cloud_walk_trousers: { id: 'cloud_walk_trousers', name: 'Cloud-Walk Silk Trousers', slot: 'legs', quality: 'Refined', stats: { def: 15, speed: 8 }, reqLevel: 8, reqStage: 'Qi Condensation', desc: 'Lightweight pants favored by scouts and outer sect messengers.' },
    taiyang_necklace: { id: 'taiyang_necklace', name: 'Taiyang Sun-Core Pendant', slot: 'necklace', quality: 'Elite', stats: { atk: 25 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'A necklace holding a hot solar crystal, melting away cold poison and fatigue.' },
    wukong_golden_band: { id: 'wukong_golden_band', name: 'Golden Fillet of the Great Sage', slot: 'ring', quality: 'Super', stats: { def: 40, mp: 60 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'A gold ring shaped like the crown that bound the Monkey King, granting absolute mental fortitude.' },

    // === INDIAN VEDIC SET ===
    trishula_of_shiva: { id: 'trishula_of_shiva', name: 'Trishula of the Three Realms', slot: 'weapon', quality: 'Super', stats: { atk: 130 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'The sacred trident representing creation, maintenance, and destruction. Hum with absolute power.' },
    brahmastra_scroll: { id: 'brahmastra_scroll', name: 'Brahmastra Divine Seal', slot: 'relic', quality: 'Super', stats: { atk: 60, mp: 100 }, reqLevel: 28, reqStage: 'Core Formation', desc: 'A copper scroll inscribed with the mantra to summon the weapon of Brahma. Handle with extreme caution.' },
    pinaka_bow: { id: 'pinaka_bow', name: 'Pinaka Divine Bow', slot: 'weapon', quality: 'Super', stats: { atk: 90 }, reqLevel: 23, reqStage: 'Core Formation', desc: 'The bow of Shiva. Its release sound shakes the heavens and makes mountains tremble.' },
    kaumodaki_gada: { id: 'kaumodaki_gada', name: 'Kaumodaki Mace of Vishnu', slot: 'weapon', quality: 'Elite', stats: { atk: 65, def: 20 }, reqLevel: 18, reqStage: 'Foundation Establishment', desc: 'A massive gold mace capable of crushing whole armies of asuras.' },
    gilded_sitar_saraswati: { id: 'gilded_sitar_saraswati', name: 'Saraswati\'s Gilded Sitar', slot: 'relic', quality: 'Elite', stats: { mp: 70 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'An exquisite sitar. Its music purifies spiritual flow, accelerating Qi gathering.' },
    rudraksha_mala: { id: 'rudraksha_mala', name: 'Rudraksha Mala of Focus', slot: 'necklace', quality: 'Normal', stats: { mp: 20 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'One hundred and eight dried seeds that help calm breathing and center the spiritual core.' },
    kavacha_of_karna: { id: 'kavacha_of_karna', name: 'Kavacha Golden Breastplate', slot: 'body', quality: 'Super', stats: { def: 90, hp: 300 }, reqLevel: 29, reqStage: 'Core Formation', desc: 'The legendary golden armor born with Karna. It negates a massive portion of all incoming physical blows.' },
    kundala_earrings: { id: 'kundala_earrings', name: 'Kundala Divine Earrings', slot: 'head', quality: 'Elite', stats: { def: 20, mp: 50 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'Glorious gold earrings that allow the wearer to hear celestial messages.' },
    agneyastra_ring: { id: 'agneyastra_ring', name: 'Agneyastra Fire Ring', slot: 'ring', quality: 'Elite', stats: { atk: 35 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'Forged in the fire of Agni. Releases heat bursts with every strike.' },
    varunastra_core: { id: 'varunastra_core', name: 'Varunastra Water Core', slot: 'relic', quality: 'Elite', stats: { def: 30 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'A heavy sapphire sphere containing the rushing force of cosmic oceans.' },
    gandiva_bow: { id: 'gandiva_bow', name: 'Gandiva Bow of Arjuna', slot: 'weapon', quality: 'Super', stats: { atk: 105 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'A celestial bow that glows when drawn, automatically shaping arrows out of raw energy.' },
    sudarshana_chakra: { id: 'sudarshana_chakra', name: 'Sudarshana Chakra Replica', slot: 'weapon', quality: 'Super', stats: { atk: 115 }, reqLevel: 27, reqStage: 'Core Formation', desc: 'A spinning, saw-toothed disc of pure golden starlight, slicing through all spiritual obstacles.' },
    yudhisthira_crown: { id: 'yudhisthira_crown', name: 'Crown of Yudhisthira', slot: 'head', quality: 'Elite', stats: { def: 22, mp: 30 }, reqLevel: 17, reqStage: 'Foundation Establishment', desc: 'The simple, noble crown of the king of dharma, representing absolute truth.' },
    shiva_tandava_drums: { id: 'shiva_tandava_drums', name: 'Tandava Damru Drum', slot: 'relic', quality: 'Elite', stats: { atk: 30, speed: 8 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'A small hourglass-shaped drum. Its rhythmic beat accelerates your heart rate and reaction times.' },
    naga_pearl_necklace: { id: 'naga_pearl_necklace', name: 'Naga Pearl Necklace', slot: 'necklace', quality: 'Refined', stats: { def: 12, hp: 30 }, reqLevel: 7, reqStage: 'Qi Condensation', desc: 'Gleaming pearls guarded by the serpent kings of the underworld.' },
    dharma_wheel_ring: { id: 'dharma_wheel_ring', name: 'Dharma Wheel Signet', slot: 'ring', quality: 'Refined', stats: { def: 6, mp: 15 }, reqLevel: 6, reqStage: 'Qi Condensation', desc: 'A ring shaped like the eight-spoked wheel, reminding the soul of the noble path.' },
    rigveda_pages: { id: 'rigveda_pages', name: 'Sanskrit Rigveda Pages', slot: 'relic', quality: 'Elite', stats: { mp: 90 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'Ancient birch-bark sheets containing the earliest hymns of the Supremes.' },
    somaras_flask: { id: 'somaras_flask', name: 'Earthen Somaras Flask', slot: 'relic', quality: 'Normal', stats: { hp: 20 }, reqLevel: 2, reqStage: 'Qi Condensation', desc: 'A simple jug that keeps spiritual drinks fresh for hours.' },
    garuda_feather_boots: { id: 'garuda_feather_boots', name: 'Garuda-Feather Sandals', slot: 'boots', quality: 'Elite', stats: { def: 10, speed: 20 }, reqLevel: 11, reqStage: 'Foundation Establishment', desc: 'Sandals adorned with feathers of the giant eagle mount Garuda. Walk on air.' },
    vajra_trousers: { id: 'vajra_trousers', name: 'Vajra Body-Tempering Pants', slot: 'legs', quality: 'Elite', stats: { def: 40 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'Pants woven with diamond-hard threads, protecting the legs during fierce stance shifts.' },

    // === SILK ROAD & ARABIAN SET ===
    spirit_scimitar: { id: 'spirit_scimitar', name: 'Spirit Scimitar', slot: 'weapon', quality: 'Normal', stats: { atk: 12 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'A standard blade tempered with a small amount of spiritual Qi.' },
    blade_of_badr: { id: 'blade_of_badr', name: 'Blade of Badr', slot: 'weapon', quality: 'Elite', stats: { atk: 45 }, reqLevel: 10, reqStage: 'Foundation Establishment', desc: 'A blessed blade that shines with the resolve of the faithful.' },
    heaven_cleaving_sword: { id: 'heaven_cleaving_sword', name: 'Heaven-Cleaving Sword', slot: 'weapon', quality: 'Super', stats: { atk: 120 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'An immortal relic said to have been used to divide the clouds of the five heavens.' },
    spirit_turban: { id: 'spirit_turban', name: 'Spirit Turban', slot: 'head', quality: 'Refined', stats: { def: 5, mp: 10 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'A silk turban woven with protective sutras.' },
    imamah_of_light: { id: 'imamah_of_light', name: 'Imamah of Divine Light', slot: 'head', quality: 'Elite', stats: { def: 15, mp: 40 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'A radiant head covering that clarifies the mind and strengthens the soul.' },
    robe_of_zuhd: { id: 'robe_of_zuhd', name: 'Robe of Zuhd', slot: 'body', quality: 'Refined', stats: { def: 12, hp: 20 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'A simple, humble robe that offers surprising protection through detachment.' },
    cloak_of_the_dervish: { id: 'cloak_of_the_dervish', name: 'Cloak of the Whirling Dervish', slot: 'body', quality: 'Unique', stats: { def: 25 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'Flows like the wind, making it difficult for enemies to land a solid blow.' },
    ihram_of_purity: { id: 'ihram_of_purity', name: 'Ihram of Purity', slot: 'body', quality: 'Super', stats: { def: 60, hp: 150 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'The ultimate armor for a righteous cultivator, vibrating with the power of Hajj.' },
    dhikr_beads_iron: { id: 'dhikr_beads_iron', name: 'Iron Dhikr Beads', slot: 'relic', quality: 'Normal', stats: { mp: 15 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'Heavy beads that help ground your Qi during meditation.' },
    misbaha_of_the_saints: { id: 'misbaha_of_the_saints', name: 'Misbaha of the Saints', slot: 'relic', quality: 'Super', stats: { mp: 100, atk: 20 }, reqLevel: 20, reqStage: 'Foundation Establishment', desc: 'Ancient beads that have absorbed the prayers of generations of holy men.' },
    seal_of_solomon: { id: 'seal_of_solomon', name: 'Seal of Solomon', slot: 'ring', quality: 'Elite', stats: { atk: 15, mp: 20 }, reqLevel: 18, reqStage: 'Foundation Establishment', desc: 'A legendary ring that grants dominion over jinn and elements.' },
    sandals_of_buraq: { id: 'sandals_of_buraq', name: 'Sandals of Buraq', slot: 'boots', quality: 'Unique', stats: { def: 8, speed: 10 }, reqLevel: 10, reqStage: 'Qi Condensation', desc: 'Woven with the speed of the heavenly steed.' },
    damascus_scimitar: { id: 'damascus_scimitar', name: 'Damascus Steel Scimitar', slot: 'weapon', quality: 'Elite', stats: { atk: 48 }, reqLevel: 11, reqStage: 'Foundation Establishment', desc: 'Pattern-welded blade, holding an edge that can slice silk floating in the air.' },
    silk_scholar_headdress: { id: 'silk_scholar_headdress', name: 'Headdress of the House of Wisdom', slot: 'head', quality: 'Refined', stats: { def: 6, mp: 15 }, reqLevel: 6, reqStage: 'Qi Condensation', desc: 'Favored by scholars studying the stars and coordinates of the desert.' },
    persian_lion_plate: { id: 'persian_lion_plate', name: 'Lion-Embossed Persian Plate', slot: 'body', quality: 'Elite', stats: { def: 42, hp: 90 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'Engraved with a roaring lion of the royal Persian guard.' },
    steppe_rider_pants: { id: 'steppe_rider_pants', name: 'Steppe Rider Leather Pants', slot: 'legs', quality: 'Normal', stats: { def: 6 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'Sturdy leather trousers perfect for long days on horseback.' },
    boots_of_caravan_king: { id: 'boots_of_caravan_king', name: 'Boots of the Caravan King', slot: 'boots', quality: 'Elite', stats: { def: 12, speed: 14 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'Reinforced boots inured to the heat of the desert floor and mountain scree.' },
    amber_sufi_necklace: { id: 'amber_sufi_necklace', name: 'Amber Sufi Rosary', slot: 'necklace', quality: 'Refined', stats: { mp: 30 }, reqLevel: 8, reqStage: 'Qi Condensation', desc: 'Glowing amber beads that radiate warmth when held.' },
    ring_of_al_khidr: { id: 'ring_of_al_khidr', name: 'Emerald Ring of Al-Khidr', slot: 'ring', quality: 'Super', stats: { hp: 120, mp: 60 }, reqLevel: 26, reqStage: 'Core Formation', desc: 'An emerald ring hum with the life-giving energy of the legendary green guide.' },
    glassmorphism_compass: { id: 'glassmorphism_compass', name: 'Astro-Qi Glass Compass', slot: 'relic', quality: 'Elite', stats: { def: 10, mp: 40 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'A complex brass mechanism displaying regional Qi flows instead of magnetic north.' },

    // === CLASSIC FANTASY RPG SET ===
    excalibur_shard: { id: 'excalibur_shard', name: 'Excalibur Sword Shard', slot: 'weapon', quality: 'Super', stats: { atk: 95 }, reqLevel: 24, reqStage: 'Core Formation', desc: 'A glowing metal shard carrying the unbreakable vow of a long-lost Western king.' },
    aegis_shield: { id: 'aegis_shield', name: 'Aegis Bronze Seal', slot: 'relic', quality: 'Super', stats: { def: 55 }, reqLevel: 22, reqStage: 'Core Formation', desc: 'A heavy circular disc depicting a terrifying gorgon face, petrifying close-range foes.' },
    muramasa_blade: { id: 'muramasa_blade', name: 'Muramasa Cursed Blade', slot: 'weapon', quality: 'Super', stats: { atk: 110 }, reqLevel: 26, reqStage: 'Core Formation', desc: 'A beautiful Eastern katana that demands blood when drawn, increasing damage immensely.' },
    sandals_of_hermes: { id: 'sandals_of_hermes', name: 'Winged Sandals of Hermes', slot: 'boots', quality: 'Super', stats: { def: 14, speed: 30 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'Lightweight sandals equipped with small feather-wings, granting unparalleled speed.' },
    ring_of_nibelung: { id: 'ring_of_nibelung', name: 'Ring of the Nibelung', slot: 'ring', quality: 'Super', stats: { atk: 25, def: 25 }, reqLevel: 27, reqStage: 'Core Formation', desc: 'A cursed gold ring of massive power, bringing fate-twisting wealth and danger.' },
    boots_of_haste: { id: 'boots_of_haste', name: 'Swift Boots of Haste', slot: 'boots', quality: 'Refined', stats: { def: 6, speed: 12 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'Enchanted running shoes designed to slip through wind currents.' },
    draupnir_armlet: { id: 'draupnir_armlet', name: 'Draupnir Gold Armlet', slot: 'ring', quality: 'Elite', stats: { def: 18, mp: 30 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'A heavy Norse gold band. It splits into copies of itself, keeping gold-flows steady.' },
    gungnir_replica: { id: 'gungnir_replica', name: 'Replica Spear Gungnir', slot: 'weapon', quality: 'Elite', stats: { atk: 55 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'A masterwork ash-wood spear. Once thrown, it seeks the target\'s weak spot automatically.' },
    mjolnir_fragment: { id: 'mjolnir_fragment', name: 'Mjolnir Lightning Fragment', slot: 'relic', quality: 'Super', stats: { atk: 45, mp: 50 }, reqLevel: 23, reqStage: 'Core Formation', desc: 'A chipped metal fragment of the hammer of storm, sparks of static energy crackling on its surface.' }
};
