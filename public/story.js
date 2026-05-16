// ============================================================
// STORY.JS — Part 1: Acts I & II — The 5-Act Narrative Tree
// "Legends of the Jade and Sand: The Immortal Codex"
// ============================================================

const STORY_NODES = {

    // ========================================================
    // PHASE 0 — THE WOMB (The Pre-Birth Choice)
    // ========================================================
    womb_start: {
        id: 'womb_start',
        act: 0,
        title: 'The Great Dark',
        narration: `The world is only warmth and the steady drumbeat of a heart that is not yours. You are a soul waiting for a vessel. The Great Dao flows around you, offering gifts before you enter the mortal coil. 

What will you grasp in the silence?`,
        choices: [
            { text: '☀️ Grasp the light (Atk focus)', next: 'womb_birth', onEnter: (s) => { s.player.atk += 10; s._wombGift = 'Strength'; } },
            { text: '🌊 Flow with the energy (HP focus)', next: 'womb_birth', onEnter: (s) => { s.player.maxHp += 50; s.player.hp = s.player.maxHp; s._wombGift = 'Vitality'; } },
            { text: '🧘 Quietly observe (Karma/Qi focus)', next: 'womb_birth', onEnter: (s) => { s.player.karma += 20; s.player.maxMp += 30; s.player.mp = s.player.maxMp; s._wombGift = 'Spirituality'; } }
        ]
    },

    womb_birth: {
        id: 'womb_birth',
        act: 0,
        title: 'The First Cry',
        narration: `Sudden cold. Blinding light. The roar of a world that does not care for your comfort. You feel your spirit anchoring into a body.

Your cry echoes in the room. A voice speaks — your father? Your mother? The environment around you begins to take shape.`,
        onEnter: (s) => {
            if (window.LIFE) window.LIFE.rollLife(s);
        },
        choices: [
            { text: 'Open your eyes to your new life', next: 'act1_intro' }
        ]
    },

    // ========================================================
    // ACT I — THE CROSSROADS AWAKENING (Stages 1-3)
    // Theme: Discovery. The player is a nobody.
    // ========================================================

    act1_intro: {
        id: 'act1_intro',
        act: 1,
        title: 'The Crossroads Awakening',
        onEnter: (s) => {
            const bg = s.player.background || { name: 'Unknown' };
            const sys = s.player.system || { name: 'None' };
            
            // Dramatic Background Narrative
            let introText = "";
            if (bg.id === 'royal') introText = "You remember the smell of incense in the Forbidden City, the weight of silk, and the cold eyes of your tutors.";
            else if (bg.id === 'beggar') introText = "You remember the bite of winter on the stone floors, the taste of stolen bread, and the hunger that never left.";
            else introText = "The memories of your early years are a blur of hard work and simple dreams.";

            narrate(`<div style="background:rgba(212, 175, 55, 0.1); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--secondary);">
                <i style="color:var(--secondary)">${introText}</i><br><br>
                <b>ORIGIN:</b> You are a <b>${bg.name}</b> born with the <b>${sys.name}</b>.<br>
                <small>${bg.desc}</small>
            </div>`, "System", null, false, true);
        },
        narration: `Years pass like sand through an hourglass. You are no longer a child. You find yourself at the City of Crossroads.
        
The minarets catch the last light of the sun. The air smells of frankincense and spirit-incense. You have arrived with the weight of your birthright — whether it be a golden crown or a beggar's bowl.

A woman in storyteller's robes sits at the central fountain. She has been there, you sense, for a very long time.`,
        bgImage: 'assets/mythology_bg_1778872403707.png',
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        choices: [
            { text: '🙏 Approach her respectfully', next: 'act1_scheherazade_meet', karmaChange: 3 },
            { text: '👁️ Observe from a distance first', next: 'act1_scheherazade_cautious', karmaChange: 0 },
            { text: '🚶 Walk past — you have your own path', next: 'act1_scheherazade_ignore', karmaChange: -2 }
        ]
    },

    act1_scheherazade_meet: {
        id: 'act1_scheherazade_meet',
        act: 1,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She looks up before you reach her. Her eyes are the color of candlelight through amber.

"Ah. You came." She says it as though she has been expecting you for years. "Sit. Every great story begins with someone who doesn't yet know they are the main character."

She pours tea from a brass pot that wasn't there a moment ago.

"There is a fracture forming. Between the Eastern Heavens and the Western Spirit World. Something old is waking in the desert — something that was buried for a reason. And you, traveler, are standing precisely at the point where both stories will collide."`,
        choices: [
            { text: '"What do you need me to do?"', next: 'act1_accept_call', karmaChange: 2 },
            { text: '"Why me? I\'m no one."', next: 'act1_doubt', karmaChange: 0 },
            { text: '"How do you know all this?"', next: 'act1_question_scheherazade', karmaChange: 1 }
        ]
    },

    act1_scheherazade_cautious: {
        id: 'act1_scheherazade_cautious',
        act: 1,
        speaker: 'System',
        narration: `You watch her from behind a merchant's stall. She does not look up. But she speaks — loud enough for only you to hear.

"You can keep watching if you like. I have a thousand and one nights of patience."

You feel your cover evaporate. The storyteller smiles at her tea.`,
        choices: [
            { text: 'Walk over and sit', next: 'act1_scheherazade_meet', karmaChange: 1 },
            { text: 'Leave entirely', next: 'act1_scheherazade_ignore', karmaChange: -3 }
        ]
    },

    act1_scheherazade_ignore: {
        id: 'act1_scheherazade_ignore',
        act: 1,
        speaker: 'System',
        narration: `You walk past. Behind you, Scheherazade's voice drifts like smoke:

"The story finds its protagonist whether they like it or not. It always does."

Three streets later, a Silk Road Bandit King steps out of an alley directly in front of you. He has six men behind him.

"Wallet or blood, stranger. Your choice."

The city's first test has found you regardless.`,
        choices: [
            { text: '⚔️ Fight them', next: 'act1_bandit_combat', karmaChange: 0 },
            { text: '💰 Try to negotiate', next: 'act1_bandit_negotiate', karmaChange: 2 }
        ],
        triggerCombat: 'silk_road_bandit'
    },

    act1_accept_call: {
        id: 'act1_accept_call',
        act: 1,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She nods slowly, as though your answer was the correct one.

"First — survive. The Silk Road is not gentle to those without power. Build your strength. When you reach your third stage of cultivation, come back to me."

She stands, and you realize she is taller than she appeared.

"One more thing. There are two powers that will each want to claim you. The Jade Peak Immortal Sects — and the Sufi Orders of the Empty Quarter. Neither is purely good. Neither is purely corrupt. Choose carefully. Or don't choose at all, and let fate make the choice for you."

She folds into the crowd and is simply... gone.`,
        choices: [
            { text: 'Begin your cultivation journey', next: 'act1_hub_open', karmaChange: 0 }
        ],
        unlockRegion: 'crossroads',
        storyFlag: 'act1_started'
    },

    act1_doubt: {
        id: 'act1_doubt',
        act: 1,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"'I am no one' is the most common beginning of every great story I have ever told." She sips her tea. "No one becomes someone. That is the entire point."

She sets her cup down with finality.

"The question is not whether you are ready. The question is whether you will reach for it when the moment arrives. Most don't."`,
        choices: [
            { text: '"I will reach for it."', next: 'act1_accept_call', karmaChange: 5 },
            { text: '"I need to think."', next: 'act1_hub_open', karmaChange: 0 }
        ]
    },

    act1_question_scheherazade: {
        id: 'act1_question_scheherazade',
        act: 1,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She smiles for the first time — genuinely, not performatively.

"A questioner. Good. The ones who don't ask questions are the most dangerous kind of hero."

"I know because I have been telling this story for a very long time. I know every version of it. I know the version where you refuse. I know the version where you succeed beyond any expectation. I know the version where you break something that cannot be repaired."

"I am here to try to steer us toward the last option not happening."`,
        choices: [
            { text: '"That\'s not ominous at all. Fine. What do I do?"', next: 'act1_accept_call', karmaChange: 3 }
        ]
    },

    act1_hub_open: {
        id: 'act1_hub_open',
        act: 1,
        speaker: 'System',
        narration: `The City of Crossroads opens before you. The Jade Peak looms to the east, and the Empty Quarter shimmers beyond the western gate. Your journey begins here.

Reach Stage 3 to trigger Act II.`,
        choices: [],
        returnToHub: true,
        storyFlag: 'act1_hub_open'
    },

    // Act I Boss: Silk Road Bandit King
    act1_bandit_intro: {
        id: 'act1_bandit_intro',
        act: 1,
        speaker: 'Silk Road Bandit King',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `He is larger than he needs to be. A scar runs from his left ear to his chin. His men fan out behind him with practiced ease — this is not their first ambush.

"I heard there was a new cultivator in town. Young. Inexperienced. Exactly the kind we welcome to the Crossroads." He grins. "Welcome tax. Everything in your pockets."`,
        choices: [
            { text: '⚔️ "I don\'t pay taxes to bandits."', next: null, triggerCombat: 'silk_road_bandit', karmaChange: 0 },
            { text: '🧠 "What if I offered you something worth more?"', next: 'act1_bandit_negotiate', karmaChange: 2 },
            { text: '💀 "I am more dangerous than I look."', next: 'act1_bandit_bluff', karmaChange: -1 }
        ]
    },

    act1_bandit_negotiate: {
        id: 'act1_bandit_negotiate',
        act: 1,
        speaker: 'Silk Road Bandit King',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `He pauses. Negotiations interest him — they are rarer than fights.

"Talk fast. My patience is short and my men are hungry."

You offer your skills as a cultivator, or information about a rival gang, or simply a future favor from someone who might be powerful one day.

He squints for a long moment. Then he laughs — a genuine one.

"You've got stones. Alright. I'll remember you. If you become worth anything, maybe I'll collect that favor. If you become nothing..." He shrugs. "I'll find you anyway."

He waves his men off. They melt back into the alleys.`,
        choices: [
            { text: 'Continue', next: 'act1_hub_open', karmaChange: 3 }
        ],
        storyFlag: 'bandit_king_negotiated',
        affinityChange: { npcId: 'bandit_king', delta: 20 }
    },

    act1_bandit_bluff: {
        id: 'act1_bandit_bluff',
        act: 1,
        speaker: 'System',
        narration: `He looks you up and down. Then he looks at his men. Then he looks back at you.

"Kill them."

The bluff didn't work. Time to make it true.`,
        choices: [
            { text: '⚔️ Fight', next: null, triggerCombat: 'silk_road_bandit', karmaChange: -2 }
        ]
    },

    // ========================================================
    // ACT II — THE TWO WORLDS AT WAR (Stages 4-6)
    // Theme: Conflict. Two factions recruit the player.
    // ========================================================

    act2_intro: {
        id: 'act2_intro',
        act: 2,
        title: 'The Two Worlds at War',
        requiredStage: 3,
        requiredFlag: 'act1_started',
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She is at the fountain again, as though she never left.

"You have grown. Good." She stands. "Act II begins, whether you are ready or not."

"Two delegations arrived this week. The first — Elder Zhao of the Jade Summit Sect, who has not left the Jade Peak in sixty years. The second — Sheikh Mahmoud of the Sufi Order of the Empty Quarter, who has never before come to the Crossroads."

"Both of them are here for you. Both of them are being corroded from within by something they do not understand. And both of them believe the other side is responsible."

Her voice drops.

"They are both wrong. There is a third party."`,
        choices: [
            { text: 'Meet Elder Zhao first (Chinese path)', next: 'act2_meet_elder_zhao', karmaChange: 0 },
            { text: 'Meet Sheikh Mahmoud first (Arabian path)', next: 'act2_meet_sheikh', karmaChange: 0 },
            { text: '"Tell me about this third party first."', next: 'act2_third_party_hint', karmaChange: 1 }
        ],
        storyFlag: 'act2_started'
    },

    act2_third_party_hint: {
        id: 'act2_third_party_hint',
        act: 2,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"Clever. Most heroes charge directly into the conflict."

She lowers her voice to nearly nothing.

"Once, long ago, a disciple of the Jade Emperor crossed into the Islamic spirit world on a diplomatic mission. He saw the divine light of Tawhid — the oneness of God — and it shattered everything he believed about the Dao. He returned... changed. Broken. He spent a thousand years trying to reconcile two truths that he felt could not coexist."

"He failed. And in his failure, he chose to destroy both rather than live with the contradiction."

"He is called the Fallen Immortal. And he has been quietly poisoning both the Jade Sects and the Sufi Orders from the inside, making each believe the other is the enemy."

She looks at you directly.

"Now you know. The question is whether knowing makes you more careful — or more reckless."`,
        choices: [
            { text: 'Meet Elder Zhao', next: 'act2_meet_elder_zhao', karmaChange: 0 },
            { text: 'Meet Sheikh Mahmoud', next: 'act2_meet_sheikh', karmaChange: 0 }
        ]
    },

    act2_meet_elder_zhao: {
        id: 'act2_meet_elder_zhao',
        act: 2,
        speaker: 'Elder Zhao',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `He is ancient. The kind of ancient where age becomes presence rather than frailty. His white robes are immaculate. His beard reaches his belt.

"Cultivator." He does not bow, but he inclines his head — which, from an Elder of his standing, is significant. "I have watched your progress from the Jade Peak. You have talent, but no foundation. We offer you both."

He produces a jade token — the seal of the Jade Summit Sect.

"Join us. Train on the Peak. In exchange, help us find the source of the darkness that is corrupting our junior disciples. Three of them have had their meridians shattered from the inside. Something is targeting us."

His eyes are clear. He genuinely does not know it is the Fallen Immortal.`,
        choices: [
            { text: '🏔️ Accept — join the Jade Summit Sect', next: 'act2_join_jade', karmaChange: 5, storyFlag: 'aligned_jade' },
            { text: '🤝 "I will help, but I join no one."', next: 'act2_neutral_jade', karmaChange: 2 },
            { text: '👁️ "I need to hear the other side first."', next: 'act2_meet_sheikh', karmaChange: 1 }
        ]
    },

    act2_meet_sheikh: {
        id: 'act2_meet_sheikh',
        act: 2,
        speaker: 'Sheikh Mahmoud',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `He sits cross-legged on a prayer rug in the courtyard, utterly calm despite the noise of the city around him. His robes are simple white wool. His misbaha moves through his fingers like water.

"Sit." It is an invitation, not a command.

"I did not travel to this city lightly. Something is wrong in the Empty Quarter. The Jinn who have been our silent neighbors for centuries are becoming hostile. Our Murids who go to meditate at the desert shrines are not returning."

He opens his eyes. They are the color of the desert at dawn.

"We believe it is the Chinese cultivators — their dragon-lines are disrupting the spiritual ecology of the desert. But I am told by those I trust that the truth is more complicated." He pauses. "Are you one who can find what is complicated and not flinch from it?"`,
        choices: [
            { text: '🌙 Accept — join the Sufi Order', next: 'act2_join_sufi', karmaChange: 5, storyFlag: 'aligned_sufi' },
            { text: '🤝 "I will help, but I remain independent."', next: 'act2_neutral_sufi', karmaChange: 2 },
            { text: '"I already know who is behind this."', next: 'act2_reveal_fallen_early', karmaChange: 0 }
        ]
    },

    act2_reveal_fallen_early: {
        id: 'act2_reveal_fallen_early',
        act: 2,
        speaker: 'Sheikh Mahmoud',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `He goes very still.

"Say that again."

You tell him about the Fallen Immortal — a disciple of the Jade Emperor who was broken by the encounter with Islamic divine light, and has been corrupting both sides ever since.

A long silence. The misbaha stops moving.

"That would explain..." He exhales slowly. "That would explain a great deal. A being in spiritual crisis does not destroy what threatens them. They destroy everything, so that their crisis has company."

He stands. "If you are right, this is larger than a territorial conflict. This is a soul in collapse trying to bring the world down with it."

His expression hardens into something like resolve.

"Then we must find it. Together."`,
        choices: [
            { text: 'Form an alliance between both factions', next: 'act2_dual_alliance', karmaChange: 10, storyFlag: 'dual_alliance' }
        ]
    },

    act2_join_jade: {
        id: 'act2_join_jade',
        act: 2,
        speaker: 'System',
        narration: `You take the jade token. Elder Zhao's approval registers as the faintest softening of his expression.

"Report to the Jade Peak. Your training begins at dawn."

The Jade Summit Sect is now your faction. The Sufi Order will be harder to access, though not impossible. Some doors close; others open.

Your cultivation accelerates. The Dragon Vein energy of the Jade Peak calls to your core.`,
        choices: [{ text: 'Continue', next: null, returnToHub: true }],
        storyFlag: 'jade_sect_member',
        unlockRegion: 'jade_peak',
        onEnter: (state) => {
            state.player.faction = 'Jade Summit Sect';
            state.player.factionRank = 1;
            calculateTotalStats();
        }
    },

    act2_join_sufi: {
        id: 'act2_join_sufi',
        act: 2,
        speaker: 'System',
        narration: `You nod your acceptance. The Sheikh produces a green cord — the mark of a Murid initiate — and ties it around your wrist with a brief prayer.

"May your Ruh be clarified by what you find."

The Sufi Order of the Empty Quarter is your faction. The Empty Quarter opens fully to you. The Jade Sects will require more careful navigation.

The desert calls to your spirit with a strange, resonant pull.`,
        choices: [{ text: 'Continue', next: null, returnToHub: true }],
        storyFlag: 'sufi_order_member',
        unlockRegion: 'empty_quarter',
        onEnter: (state) => {
            state.player.faction = 'Sufi Order of the Empty Quarter';
            state.player.factionRank = 1;
            calculateTotalStats();
        }
    },

    act2_dual_alliance: {
        id: 'act2_dual_alliance',
        act: 2,
        speaker: 'System',
        narration: `You have done what neither faction thought possible: convinced both Elder Zhao and Sheikh Mahmoud that their true enemy is not each other.

A fragile, tense, historically unprecedented alliance forms in the courtyard of the City of Crossroads. Two elders who have never sat at the same table now share tea — badly — and argue about everything except the thing that matters.

They agree on one thing: the Fallen Immortal must be found.

Both regions unlock simultaneously. Both factions trust you — which means both factions will ask things of you that conflict with each other. Choose carefully.`,
        choices: [{ text: 'Continue', next: null, returnToHub: true }],
        storyFlag: 'dual_alliance',
        unlockRegion: 'jade_peak',
        unlockRegion2: 'empty_quarter'
    },

    act2_harun_crisis: {
        id: 'act2_harun_crisis',
        act: 2,
        requiredFlag: 'act2_started',
        requiredStage: 4,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"The Caliph Harun al-Rashid is dying."

Scheherazade delivers the news without preamble.

"He has been poisoned — not with something from a market stall, but with a spiritual toxin. Something that is dissolving his Ruh from within. His physicians are baffled. His court is fracturing."

"He has asked for you specifically. Apparently word travels quickly in this city."

She pauses.

"I should tell you — Harun is not a simple man. He is sometimes just, sometimes cruel, sometimes both in the same afternoon. But he is the linchpin of the Crossroads. If he dies, the political structure that keeps the city neutral collapses. The Jade Sects and the Sufi Orders will no longer have a reason to tolerate each other here."`,
        choices: [
            { text: '🏃 Go to the Caliph immediately', next: 'act2_harun_palace', karmaChange: 3 },
            { text: '⏳ Finish other business first', next: null, returnToHub: true, storyFlag: 'harun_waiting' },
            { text: '❌ This is not your problem', next: 'act2_harun_refuse', karmaChange: -8 }
        ]
    },

    act2_harun_refuse: {
        id: 'act2_harun_refuse',
        act: 2,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `Scheherazade's expression does not change. But something in the air does.

"I see." A pause. "Then let me tell you a version of the story where you made that choice. It is a shorter story than the other versions. It ends in rubble."

She gestures around at the city.

"Every person in this market. Every sect. Every order. They exist in this space because Harun holds it open. Without him, this city becomes a battlefield within a month."

She tilts her head.

"I am not telling you this to guilt you. I am telling you because I think you do not fully understand what you are refusing. Understanding it — and still refusing — is at least an honest choice."`,
        choices: [
            { text: '...Go to the Caliph', next: 'act2_harun_palace', karmaChange: 2 },
            { text: 'Still refuse', next: null, returnToHub: true, karmaChange: -15, storyFlag: 'harun_refused' }
        ]
    },

    act2_harun_palace: {
        id: 'act2_harun_palace',
        act: 2,
        speaker: 'Harun al-Rashid',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `The Caliph's palace is quieter than you expected. Servants move in hushed urgency. Guards watch everything.

Harun al-Rashid lies propped on silk cushions, and even diminished by illness he carries an authority that fills the room.

"They told me you were coming." His voice is thinner than it should be. "Sit. I do not have energy to shout across a room."

You sit. He studies you with the eyes of a man who has read thousands of people over a long reign.

"There is something in me that does not belong. I have felt it for six weeks — a coldness that is not cold, a silence that is louder than noise." He pauses. "My physicians say I have a year. My body says they are optimistic."

"I will ask you what I have not asked anyone else, because everyone else has something to gain from my death or my survival." He looks at you steadily. "Can you find what is inside me?"`,
        choices: [
            { text: '🩺 "I will try to identify the spiritual toxin."', next: 'act2_harun_diagnosis', karmaChange: 3 },
            { text: '⚠️ "I suspect I know who did this."', next: 'act2_harun_fallen_reveal', karmaChange: 2 },
            { text: '"What do you offer in return?"', next: 'act2_harun_bargain', karmaChange: -3 }
        ],
        storyFlag: 'harun_met'
    }
};

// ============================================================
// STORY ENGINE — Processes nodes and integrates with game.js
// ============================================================
window.STORY = {
    nodes: STORY_NODES,

    // Get a node by ID
    get(id) { return this.nodes[id] || null; },

    // Check if a node is accessible given current state
    canAccess(node, state) {
        if (node.requiredStage && state.player.lvl < node.requiredStage) return false;
        if (node.requiredFlag && !state.storyFlags?.[node.requiredFlag]) return false;
        return true;
    },

    // Set a story flag
    setFlag(state, flag) {
        if (!state.storyFlags) state.storyFlags = {};
        state.storyFlags[flag] = true;
    },

    // Check a story flag
    hasFlag(state, flag) {
        return !!(state.storyFlags?.[flag]);
    },

    // Get the next story beat to trigger based on player stage
    getNextBeat(state) {
        if (!this.hasFlag(state, 'act1_started')) return 'act1_intro';
        if (state.player.lvl >= 3 && !this.hasFlag(state, 'act2_started')) return 'act2_intro';
        if (state.player.lvl >= 4 && this.hasFlag(state, 'act2_started') && !this.hasFlag(state, 'harun_met')) return 'act2_harun_crisis';
        return null; // No pending beat — continue free roam
    },

    // Unlock a region in the LORE data
    unlockRegion(regionId) {
        if (window.LORE?.REGIONS[regionId]) {
            window.LORE.REGIONS[regionId].unlocked = true;
        }
    },

    // ── CORE RUNNER ── called from game.js to play a node
    runNode(nodeId, state, narrateFn, setChoicesFn, onComplete) {
        const node = this.get(nodeId);
        if (!node) { if (onComplete) onComplete(); return; }

        // Set story flags from node
        if (node.storyFlag) this.setFlag(state, node.storyFlag);

        // Unlock regions
        if (node.unlockRegion) this.unlockRegion(node.unlockRegion);
        if (node.unlockRegion2) this.unlockRegion(node.unlockRegion2);

        // Execute onEnter if it exists
        if (node.onEnter) node.onEnter(state);

        // Build choices with karma filtering
        const filteredChoices = (node.choices || []).filter(c => {
            if (c.karmaReq > 0 && (state.player.karma || 0) < c.karmaReq) return false;
            if (c.karmaReq < 0 && (state.player.karma || 0) > c.karmaReq) return false;
            if (c.backgroundReq && (!state.player.background || state.player.background.id !== c.backgroundReq)) return false;
            if (c.systemReq && (!state.player.system || state.player.system.id !== c.systemReq)) return false;
            if (c.goldCost && (state.player.gold || 0) < c.goldCost) return false;
            return true;
        });

        // Narrate
        narrateFn(node.narration, node.speaker || null, node.speakerSprite || null, false, false, node.bgImage || null);

        // Build choices
        if (filteredChoices.length === 0) {
            setChoicesFn([]); // Clear previous choices
            if (node.returnToHub && onComplete) { setTimeout(onComplete, 1500); }
            return;
        }

        const choiceObjects = filteredChoices.map(c => ({
            text: c.text,
            callback: () => {
                // Apply karma
                if (c.karmaChange) state.player.karma = Math.max(-100, Math.min(100, (state.player.karma || 0) + c.karmaChange));

                // Apply gold cost
                if (c.goldCost) state.player.gold -= c.goldCost;

                // Apply affinity change
                if (c.affinityChange && window.COMPANIONS) {
                    window.COMPANIONS.adjustAffinity(state, c.affinityChange.npcId, c.affinityChange.delta, nodeId);
                }

                // Set choice flag
                if (c.storyFlag) this.setFlag(state, c.storyFlag);

                // Unlock regions from choice
                if (c.unlockRegion) this.unlockRegion(c.unlockRegion);

                // Trigger combat
                if (c.triggerCombat && onComplete) {
                    state.pendingCombatEnemy = c.triggerCombat;
                    onComplete('combat');
                    return;
                }

                // Continue to next node or hub
                if (c.next) {
                    setTimeout(() => this.runNode(c.next, state, narrateFn, setChoicesFn, onComplete), 600);
                } else if ((c.returnToHub || node.returnToHub) && onComplete) {
                    setTimeout(onComplete, 600);
                }
            }
        }));

        setChoicesFn(choiceObjects);
    }
};

// ============================================================
// ACTS III, IV & V — Append to STORY_NODES
// ============================================================
Object.assign(window.STORY.nodes, {

    // ========================================================
    // ACT III — THE GREAT TRIBULATION (Stages 7-9)
    // Theme: Loss. Everything falls apart.
    // ========================================================

    act3_intro: {
        id: 'act3_intro',
        act: 3,
        title: 'The Great Tribulation',
        requiredStage: 6,
        requiredFlag: 'act2_started',
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She is not at the fountain.

You find her at the western gate, looking out at the desert. The horizon glows an unnatural violet.

"It has begun." She does not turn around. "The Fallen Immortal has stopped hiding. He wanted enough corruption in place before he revealed himself — enough that both sides would be too fractured to unite."

She finally looks at you. Something in her expression is different. She looks... tired.

"A companion of yours may be in danger. The Fallen Immortal targets connections — he will try to use the people you care about as leverage or as weapons."

"And the path forward goes through the Abyssal Sea of Qi. It is the only place where the border between the Jade Heavens and the Islamic spirit world is thin enough to cross."

She reaches into her robes and hands you a sealed letter.

"From Al-Khidr. He appeared this morning. He said to give it to you and that you would know what it means."

The letter contains a single line in Arabic: 'The wall you wanted to destroy holds everything.'`,
        choices: [
            { text: 'Head to the Abyssal Sea', next: 'act3_sea_crossing', karmaChange: 0, unlockRegion: 'abyssal_sea' },
            { text: 'Find your companion first', next: 'act3_companion_danger', karmaChange: 3 }
        ],
        storyFlag: 'act3_started'
    },

    act3_companion_danger: {
        id: 'act3_companion_danger',
        act: 3,
        speaker: 'System',
        narration: `You find them — your companion — in a state you have never seen them in before. Cornered. Afraid. Behind them, painted in dark spiritual energy on a warehouse wall, is the sigil of the Fallen Immortal.

"He came in the night," your companion says. "He knew things. Things I have never told anyone. Things I barely admitted to myself."

"He said you were going to fail. That every hero who has tried to stop him has been used as a tool against the people they tried to protect."

They look at you. In their eyes: fear. And beneath the fear, something else. Trust.

"He wanted me to deliver you a message: 'Come to the Abyssal Sea. Alone. Or I start with those who cannot defend themselves.'"`,
        choices: [
            { text: '⚔️ "We go together. No one comes for my people alone."', next: 'act3_sea_crossing', karmaChange: 5, storyFlag: 'companion_protected' },
            { text: '🛡️ "Stay here. I will go alone and end this."', next: 'act3_sea_alone', karmaChange: 0 }
        ]
    },

    act3_sea_crossing: {
        id: 'act3_sea_crossing',
        act: 3,
        speaker: 'Sinbad',
        speakerSprite: 'assets/sinbad.png',
        narration: `Sinbad is already at the shore when you arrive — as though he knew.

"I know that look," he says. "That's the look someone gets when they need to cross something impossible." He gestures at the roiling sea of liquid Qi before you. "Seventh voyage didn't kill me. This won't either."

"Probably."

The crossing takes three days. The Abyssal Sea is unlike anything in either world — pure spiritual energy in liquid form, shifting colors, containing drowned memories of cultivators who fell in and dissolved into pure experience.

Sinbad navigates it by instinct and old songs.

On the third day, you see it: the border. A shimmering wall of light where two spiritual traditions meet and cannot fully merge.

The Fallen Immortal is waiting on the other side.`,
        choices: [
            { text: 'Cross into the border space', next: 'act3_fallen_confrontation', karmaChange: 0, unlockRegion: 'abyssal_sea' }
        ]
    },

    act3_fallen_confrontation: {
        id: 'act3_fallen_confrontation',
        act: 3,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `He looks like a scholar. That is the most disorienting thing.

A man in torn Taoist robes with a misbaha tangled in his fingers, as though he could not decide which tradition to abandon. His eyes are the color of the border itself — two different lights trying to occupy the same space.

"You are younger than I expected." His voice is calm. Eerily calm. "They always send young ones. The old ones know better than to come here."

"I assume you know who I am. What I am trying to do."

"I am not cruel. I want you to understand this. I am not destroying out of hatred. I am destroying because I sat for a thousand years with two truths that I was told could not coexist — and the pain of holding both was worse than anything I have experienced before or since."

He looks at you with something that might be hope.

"Tell me I am wrong. If you can. I have been waiting a thousand years for someone to tell me I am wrong about this."`,
        choices: [
            { text: '"The Dao and Tawhid are not opposites. Both point toward the same infinite."', next: 'act3_philosophical_resolution', karmaChange: 15 },
            { text: '"Your pain is real. But destruction is not an answer."', next: 'act3_empathy_path', karmaChange: 8 },
            { text: '⚔️ "You have hurt too many people. This ends now."', next: null, triggerCombat: 'fallen_immortal_patriarch', karmaChange: -3 }
        ],
        storyFlag: 'fallen_immortal_met'
    },

    act3_philosophical_resolution: {
        id: 'act3_philosophical_resolution',
        act: 3,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `He goes very still.

The border light behind him flickers.

"...Say that again."

You say it again, differently. You speak of the Dao as the fabric — the is-ness of all things. And Tawhid as the source — the One from which the fabric emerges. Not opposites. Not even parallel. One is the song; the other is the singer.

Something cracks in his face. Not breaks. Cracks — like light coming through.

"I tried to reach this conclusion for a thousand years." His voice is barely above a whisper. "I could not get there alone."

The dark spiritual energy begins to recede.

"I can... I can stop. I can stop the corruption. But what has been poisoned will take time to heal. And I..." He looks at his hands. "I will need somewhere to go. I cannot simply cease to exist."`,
        choices: [
            { text: '"The Jade Peak can receive you."', next: 'act3_redemption_jade', karmaChange: 5, storyFlag: 'fallen_redeemed' },
            { text: '"The Sufi Order can give you a place."', next: 'act3_redemption_sufi', karmaChange: 5, storyFlag: 'fallen_redeemed' },
            { text: '"Face what you have done first. Then we discuss what comes next."', next: 'act3_redemption_both', karmaChange: 10, storyFlag: 'fallen_redeemed' }
        ]
    },

    act3_empathy_path: {
        id: 'act3_empathy_path',
        act: 3,
        speaker: 'System',
        narration: `He does not respond immediately. You can see him fighting something — the habit of a thousand years, the momentum of a plan already in motion.

"Pain as an excuse," he finally says. "I have told myself that. I know I have." A pause. "The worst part is that it is also true."

He does not stand down. But he slows.

"If you can show me — not tell me, show me — that coexistence is possible. If you can reach the Celestial Court and broker actual peace between the Jade Emperor and the Divine Council..."

"Then I will stop. And I will spend whatever time I have left trying to undo what I have done."

A conditional surrender. The hardest kind.`,
        choices: [
            { text: 'Accept this terms — reach the Celestial Court', next: 'act4_intro', karmaChange: 5, storyFlag: 'fallen_conditional', unlockRegion: 'brass_city' }
        ]
    },

    // ========================================================
    // ACT IV — THE CELESTIAL GATE (Stages 10-12)
    // Theme: Power. The player transcends mortality.
    // ========================================================

    act4_intro: {
        id: 'act4_intro',
        act: 4,
        title: 'The Celestial Gate',
        requiredStage: 9,
        requiredFlag: 'act3_started',
        speaker: 'Nuwa',
        speakerSprite: 'assets/nuwa.png',
        narration: `She appears without announcement — simply there, in the center of the Brass City, as though she has been standing there for ten thousand years.

"Child." Her voice carries the weight of geological time. "You have done something I did not expect. You reached the one who was broken and found a thread of him that was not."

"The Celestial Court will not receive you easily. The Jade Emperor is proud and does not admit crisis. The Divine Council is cautious and does not trust outsiders."

"You will need to prove yourself to both. Not through power — you could have done that three acts ago. Through understanding."

She places her palm flat against your chest. Something settles into alignment inside you — a cultivation breakthrough that was almost impossible at your current stage.

"I am giving you a head start. The rest is yours."

She looks at you for a long moment.

"I know how this ends. I will not tell you. But I will say this: every version of this story in which something good survives... you make the same choice at the final moment. Every single time."`,
        choices: [
            { text: 'Enter the Celestial Court', next: 'act4_celestial_gate', karmaChange: 0, unlockRegion: 'celestial_court' }
        ],
        storyFlag: 'act4_started'
    },

    act4_celestial_gate: {
        id: 'act4_celestial_gate',
        act: 4,
        speaker: 'System',
        narration: `The Celestial Court sits above the clouds, reached by a staircase of compressed starlight. The Jade Emperor's hall is to the left. The Chamber of the Divine Council is to the right.

Both doors are closed.

Between them, a massive Heavenly Guard bars your path — not hostile, but absolute. Behind them you can hear voices in urgent, dangerous debate.

"The Eastern Heavens will not yield."
"The Western Spirit World does not negotiate from weakness."

The guard looks at you. "Prove you are worthy. Both doors will open for one who earns it."

A gauntlet awaits.`,
        choices: [
            { text: '⚔️ Face the Heavenly Gauntlet', next: null, triggerCombat: 'heavenly_guard', karmaChange: 0 }
        ]
    },

    act4_after_gauntlet: {
        id: 'act4_after_gauntlet',
        act: 4,
        speaker: 'The Jade Emperor',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `Both doors open simultaneously.

The Jade Emperor and the leader of the Divine Council face each other across a chamber that should not be large enough to contain both their presences.

They both turn to look at you.

"Mortal." The Jade Emperor's voice is like struck jade. "You have climbed to a height that should have destroyed you three times over. That earns you the right to speak."

A pause.

"Speak, then. Say whatever it is you climbed this mountain to say."`,
        choices: [
            { text: '"Both worlds are being destroyed by a third party. Unite or lose both."', next: 'act4_unity_speech', karmaChange: 10 },
            { text: '"The Fallen Immortal is willing to stand down if you prove coexistence is possible."', next: 'act4_fallen_leverage', karmaChange: 5 },
            { text: '"I have already stopped the threat. I came to witness you make peace."', next: 'act4_done_deal', karmaChange: 8, requiredFlag: 'fallen_redeemed' }
        ],
        storyFlag: 'reached_celestial_court'
    },

    // ========================================================
    // ACT V — THE CONVERGENCE (Stages 13+)
    // Theme: Legacy. Three endings.
    // ========================================================

    act5_righteous_ending: {
        id: 'act5_righteous_ending',
        act: 5,
        title: 'The Bridge Immortal',
        requiredFlag: 'reached_celestial_court',
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `She is at the fountain. She was always going to be at the fountain for this moment.

"You did it." She sounds genuinely surprised. "I have told this story in many versions. In most of them it ends differently."

The two worlds have not merged — they were never meant to. But the walls between them are now doors. Real ones, with handles.

The Jade Emperor acknowledged the existence of a divine principle beyond his Heavenly Court. The Divine Council acknowledged that cultivation and spiritual discipline were not in contradiction.

The Fallen Immortal — freed of his thousand-year burden — wept. That was unexpected.

And you. You stand at the Crossroads, where you began, and you are not the person who arrived here.

"There is a title being argued about in both courts," Scheherazade says. "The Bridge Immortal. Someone who belongs to neither world completely, and therefore can move between both."

She looks at you.

"It is yours if you want it. Or you can simply go home. Both are valid endings."`,
        choices: [
            { text: '🌉 Accept: Become the Bridge Immortal', next: 'act5_ascension_bridge', karmaChange: 0 },
            { text: '🏠 Return home — the world is saved, that is enough', next: 'act5_humble_end', karmaChange: 5 }
        ],
        requiredKarma: 40
    },

    act5_demonic_ending: {
        id: 'act5_demonic_ending',
        act: 5,
        title: 'The Dark Sovereign',
        requiredFlag: 'reached_celestial_court',
        speaker: 'System',
        narration: `The Celestial Court burns.

You did not come to negotiate. You came because you finally understood what the Fallen Immortal understood: that both courts were corrupt, both powers were self-serving, and no one was going to fix this from the outside.

So you fixed it from the inside.

The Jade Emperor fled. The Divine Council dissolved. The power vacuum left behind was immense — and you were standing in it.

The Crossroads is yours now. Both worlds will pay tribute or face the alternative.

This is not the version Scheherazade was trying to steer you toward. You find her later, at what used to be the fountain, which is now broken.

She looks at you for a long time.

"I have told this story before," she says finally. "This version is shorter than the others. Not because it ends soon. Because stories about fear are always shorter than stories about hope."

She walks away.

You have won everything. The silence of absolute power is louder than you expected.`,
        choices: [
            { text: 'Rule the combined realm as the Dark Sovereign', next: null, returnToHub: true }
        ],
        requiredKarma: -40
    },

    act5_ascension_ending: {
        id: 'act5_ascension_ending',
        act: 5,
        title: 'Nameless Ascension',
        requiredFlag: 'reached_celestial_court',
        speaker: 'Al-Khidr',
        speakerSprite: 'assets/al_khidr.png',
        narration: `Al-Khidr appears one final time. He always does, at moments like this.

"You have a choice that no one else has been given. Not in my memory — and I remember a great deal."

"Both courts want you to become something. A symbol. A weapon. A bridge. A sovereign."

He looks at you with eyes that have seen everything.

"But there is a third option. Beyond all of it. Beyond names and courts and mythology. Where the Dao and Tawhid both dissolve into something that has no human word."

He extends his hand.

"It requires you to leave everything behind. Every name. Every relationship. Every version of yourself you have built."

"Most people refuse. It is, I think, the correct choice to refuse. The world needs people in it."

He waits.`,
        choices: [
            { text: '🌌 Take his hand — ascend beyond all names', next: 'act5_true_ascension', karmaChange: 0 },
            { text: '❤️ "No. The world needs me in it."', next: 'act5_righteous_ending', karmaChange: 10 }
        ]
    }
});

// ============================================================
// ACT V � FINAL ENDING NODES (completing the three paths)
// ============================================================
Object.assign(window.STORY.nodes, {

    act5_ascension_bridge: {
        id: 'act5_ascension_bridge',
        act: 5,
        speaker: 'System',
        narration: `The title is given in both courts on the same day, at the same hour, read aloud in two languages simultaneously.

In the Eastern Heavens: The Jade Emperor's own herald proclaims you Bridge Immortal before the assembled celestial host. A jade seal is pressed into your hand � not as a symbol of ownership, but of passage.

In the Western Spirit World: The Divine Council reads your name in Arabic, each syllable carrying the weight of Qadar � destiny that was always going to arrive, even when the path to it was not visible.

You stand between both ceremonies, belonging fully to neither, accepted by both.

Scheherazade finds you that evening at the fountain. She is, for the first time, not telling a story. She is simply sitting.

"It's done," she says.

"Yes."

"I have told this story one thousand and one times," she says quietly. "This is the first time it ended here."

She looks at you.

"What do you do next?"

It is the first question she has asked that she does not already know the answer to.

The Crossroads is yours. The roads between worlds are open. The journey continues � it simply changes what it means.`,
        choices: [
            { text: 'Continue � the world is open', next: null, returnToHub: true, storyFlag: 'ending_bridge' }
        ]
    },

    act5_humble_end: {
        id: 'act5_humble_end',
        act: 5,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"You are going home."

It is not a question.

You have saved two worlds. You negotiated a peace that scholars in both traditions will argue about for centuries. You faced the Fallen Immortal and chose understanding over annihilation. You climbed to the Celestial Court and said what needed to be said.

And now you want to go home.

Scheherazade stands from the fountain.

"I want you to know," she says, "that in all the versions of this story I have told � the ones where the hero chooses power, the ones where they ascend beyond names, the ones where they fail � this ending is the rarest."

She tilts her head.

"Most people, when given the chance to become a legend, take it. The ones who don't..."

She pauses for a long time.

"The ones who don't are usually the ones who already know who they are."

She reaches into her robes and produces a small jade token � not the political seal of the Jade Peak, not the rank marker of the Sufi Order. Just a small piece of jade, unremarkable except for a tiny crack running through it that has been sealed with gold.

Kintsugi. The Japanese art of repairing with gold. Making the broken place the most beautiful part.

"For your journey home," she says. "Whatever road you take."`,
        choices: [
            { text: 'Accept and return home', next: null, returnToHub: true, storyFlag: 'ending_humble' }
        ]
    },

    act5_true_ascension: {
        id: 'act5_true_ascension',
        act: 5,
        speaker: 'Al-Khidr',
        speakerSprite: 'assets/al_khidr.png',
        narration: `You take his hand.

The sensation is not dramatic. There is no explosion of light, no cosmic fanfare. The fountain in the Crossroads continues to run. A merchant argues with a customer two streets over. A child laughs somewhere.

And you...

You are in all of it. And none of it. You have not disappeared � you have distributed. The Dao and Tawhid were never going to resolve into a single word. They resolved into something that has no word, and you have become the space where that resolution lives.

Al-Khidr releases your hand. He looks, for a moment, like he is going to say something profound.

Instead he says: "I told you most people refuse."

"Why don't you?" you ask.

"I did," he says. "The first time."

He walks away, and you are everywhere he walks.

Scheherazade finishes her tea at the fountain. She sets down her cup. She looks around � not at anything specific, but at all of it.

"Hm," she says softly.

She picks up her cup and begins a new story. The first words are familiar. The ending, for once, she does not know.`,
        choices: [
            { text: 'Become part of the world', next: null, returnToHub: true, storyFlag: 'ending_ascension' }
        ]
    }
});

// ============================================================
// BALANCE CONSTANTS � Final pass on all stats
// ============================================================
window.BALANCE = {
    // Stage-based stat scaling
    hpPerLevel:     15,   // Reduced from 22
    atkPerLevel:     3,   // Reduced from 6
    mpPerLevel:      8,   
    xpMultiplier: 2.10,   // Increased from 1.45 (HELL GRIND)

    // Starting stats
    base: { hp: 100, mp: 50, atk: 12, maxXp: 150 },

    // Enemy scaling (relative to player stage)
    enemyHpScale: (playerLvl, stageMin) => {
        const delta = Math.max(0, playerLvl - stageMin);
        return 1 + (delta * 0.25); // 25% harder per level (Aggressive scaling)
    },
    enemyAtkScale: (playerLvl, stageMin) => {
        const delta = Math.max(0, playerLvl - stageMin);
        return 1 + (delta * 0.20); // 20% harder
    },

    // XP rewards � scales with enemy level
    xpForEnemy: (enemyStageMin) => Math.floor(30 + (enemyStageMin * 18)),

    // Karma thresholds
    karmaLabels: [
        { min: 60,  max: 100,  label: 'Celestial Saint',     color: '#d4af37' },
        { min: 25,  max: 59,   label: 'Righteous Cultivator', color: '#00e5a0' },
        { min: -24, max: 24,   label: 'Wandering Sword',      color: '#8a9ab0' },
        { min: -59, max: -25,  label: 'Gray Path Seeker',     color: '#c8a060' },
        { min: -100,max: -60,  label: 'Demonic Sovereign',    color: '#8a1c1c' }
    ],

    getKarmaLabel(karma) {
        return this.karmaLabels.find(k => karma >= k.min && karma <= k.max)
            || { label: 'Unknown', color: '#888' };
    },

    // Apply balance to starting state
    applyToState(state) {
        const b = this.base;
        if (state.player.maxHp < b.hp) state.player.maxHp = b.hp;
        if (state.player.hp < b.hp)    state.player.hp    = b.hp;
        if (state.player.maxMp < b.mp) state.player.maxMp = b.mp;
        if (state.player.mp < b.mp)    state.player.mp    = b.mp;
        if (state.player.atk < b.atk)  state.player.atk   = b.atk;
        if (state.player.maxXp < b.maxXp) state.player.maxXp = b.maxXp;
    }
};

const STORY_ENGINE_HELPERS = {}; window.STORY = Object.assign(window.STORY || {}, { STORY_NODES, ...STORY_ENGINE_HELPERS });

