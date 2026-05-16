// ============================================================
// STORY_ACTS_3_5.JS — The Conclusion of the Immortal Codex
// "Legends of the Jade and Sand"
// ============================================================

const EXTENDED_STORY_NODES = {
    // ========================================================
    // ACT III — THE MIRROR OF PAST LIVES (Stages 5-7)
    // ========================================================
    act3_intro: {
        id: 'act3_intro',
        act: 3,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `The desert heat has changed. It no longer burns; it hums. You find Scheherazade at the edge of the City, looking out toward the Great Dune.

"You look older," she says, though your face is the same. "The weight of a hundred battles is settling in your Qi. It is time you saw the truth of the Mirror."

She gestures to the horizon. "Deep in the Empty Quarter lies the Hall of Reflections. It is where the first immortals left their memories before ascending. If you wish to understand why the Jade Summit and the Sufis are at each other's throats, you must go there."`,
        choices: [
            { text: 'Set out for the Hall of Reflections', next: 'act3_journey_start', karmaChange: 1 },
            { text: '"What will I see in the mirror?"', next: 'act3_mirror_explanation', karmaChange: 0 }
        ]
    },

    act3_mirror_explanation: {
        id: 'act3_mirror_explanation',
        act: 3,
        speaker: 'Scheherazade',
        narration: `"You will see the versions of yourself that didn't make it. The ones who failed the breakthrough. The ones who chose the wrong side. And perhaps... the one who succeeded."

She smiles sadly. "The mirror doesn't show what is. It shows what could have been. And in your case, what *was* in your previous lives."`,
        choices: [
            { text: 'I am ready to face my past.', next: 'act3_journey_start', karmaChange: 2 }
        ]
    },

    act3_journey_start: {
        id: 'act3_journey_start',
        act: 3,
        speaker: 'System',
        narration: `The journey is long. The sand sings a haunting melody. You encounter a group of **Jade Summit Enforcers** blocking the path.

"State your business, traveler," the leader demands. "This region is under the Emperor's mandate. None shall pass without a Seal of Authority."`,
        choices: [
            { text: 'Show them your faction token', next: 'act3_jade_pass', karmaReq: 50 },
            { text: 'Intimidate them with your Qi', next: 'act3_enforcer_combat', karmaReq: -50 },
            { text: 'Try to find a way around', next: 'act3_stealth_path', karmaChange: 0 },
            // NEW: Background/System paths
            { text: '👑 (Imperial Prince) Demand passage by birthright', next: 'act3_royal_bypass', backgroundReq: 'royal' },
            { text: '💰 (Merchant) Bribe them with 2000 Stones', next: 'act3_merchant_bribe', backgroundReq: 'merchant', goldCost: 2000 },
            { text: '⚔️ (Sword Immortal) Draw your blade and clear the path', next: 'act3_sword_strike', systemReq: 'sword_saint' }
        ]
    },

    act3_royal_bypass: {
        id: 'act3_royal_bypass',
        act: 3,
        speaker: 'Jade Enforcer',
        narration: `The enforcer's eyes widen as he recognizes the royal seal on your ring. He immediately drops to one knee.
        
        "Your Highness! We... we were not informed of your arrival. Please, forgive our insolence. The path is yours."`,
        choices: [
            { text: 'Proceed with dignity', next: 'act3_hall_arrival', karmaChange: 5 }
        ]
    },

    act3_merchant_bribe: {
        id: 'act3_merchant_bribe',
        act: 3,
        speaker: 'Jade Enforcer',
        narration: `The leader's eyes gleam as he weighs the heavy bag of Spirit Stones. He gestures for his men to stand down.
        
        "It seems your papers are... in order. Move along, and don't let anyone else see you."`,
        choices: [
            { text: 'Continue toward the Hall', next: 'act3_hall_arrival', karmaChange: -2 }
        ]
    },

    act3_sword_strike: {
        id: 'act3_sword_strike',
        act: 3,
        speaker: 'System',
        narration: `You don't say a word. You simply draw your blade. The air screams as a single stroke of jade-light cleaves the very air. The enforcers' spears shatter before they can even react.
        
        They scramble back in terror, realizing they are facing a true Sword Immortal.`,
        choices: [
            { text: 'Sheathe your blade and walk through', next: 'act3_hall_arrival', karmaChange: -5 }
        ]
    },

    act3_hall_arrival: {
        id: 'act3_hall_arrival',
        act: 3,
        speaker: 'System',
        narration: `You arrive at the Hall of Reflections. It is a structure of white stone and blue glass, half-buried in the shifting sands.
        
        Inside, the air is perfectly still. You stand before the Mirror of Past Lives.`,
        choices: [
            { text: 'Look into the mirror', next: 'act3_mirror_vision' }
        ]
    },

    // ========================================================
    // ACT IV — THE SIEGE OF THE CROSSROADS (Stages 8-9)
    // ========================================================
    act4_intro: {
        id: 'act4_intro',
        act: 4,
        speaker: 'System',
        narration: `You return from the desert to find the City of Crossroads under siege. Not by soldiers, but by a **Spectral Fog**. 

The Jade Peak has mobilized its floating fortress. The Sufi mystics have formed a circle of protection around the central bazaar. The tension that has been building for acts is finally snapping.`,
        choices: [
            { text: 'Join the Jade Peak offensive', next: 'act4_join_offensive', storyFlag: 'siege_offensive' },
            { text: 'Defend the Sufi mystics', next: 'act4_join_defensive', storyFlag: 'siege_defensive' },
            { text: 'Protect the civilians instead', next: 'act4_protect_civilians', karmaChange: 15 }
        ]
    },

    // ========================================================
    // ACT V — THE GREAT CONVERGENCE (Stage 10)
    // ========================================================
    act5_final_confrontation: {
        id: 'act5_final_confrontation',
        act: 5,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `At the heart of the storm stands a being of pure, broken light. It is neither Eastern nor Western, neither Saintly nor Demonic. It is a creature of pure Void.

"You have come far, little spark," it whispers. its voice sounds like grinding glass. "The world is a cycle of suffering. The Jade Emperor builds walls, and the Sufis try to pray them down. Both are wrong. There is only the End."`,
        choices: [
            { text: '⚔️ "I will protect this world!"', next: 'act5_battle_righteous', karmaReq: 80 },
            { text: '💀 "I will take your power for myself!"', next: 'act5_battle_demonic', karmaReq: -80 },
            { text: '⚖️ "The balance must be maintained."', next: 'act5_battle_neutral', karmaChange: 0 }
        ],
        triggerCombat: 'fallen_immortal_final'
    }
};

// Merge into main STORY object
if (window.STORY && window.STORY.STORY_NODES) {
    Object.assign(window.STORY.STORY_NODES, EXTENDED_STORY_NODES);
} else {
    window.STORY = { STORY_NODES: EXTENDED_STORY_NODES };
}
