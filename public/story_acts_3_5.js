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
            { text: 'Set out for the Hall of Reflections', next: 'act3_journey_start', karmaChange: 1, storyFlag: 'act3_started' },
            { text: '"What will I see in the mirror?"', next: 'act3_mirror_explanation', karmaChange: 0 }
        ]
    },

    act3_mirror_explanation: {
        id: 'act3_mirror_explanation',
        act: 3,
        speaker: 'Scheherazade',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"You will see the versions of yourself that didn't make it. The ones who failed the breakthrough. The ones who chose the wrong side. And perhaps... the one who succeeded."

She smiles sadly. "The mirror doesn't show what is. It shows what could have been. And in your case, what *was* in your previous lives."`,
        choices: [
            { text: 'I am ready to face my past.', next: 'act3_journey_start', karmaChange: 2, storyFlag: 'act3_started' }
        ]
    },

    act3_journey_start: {
        id: 'act3_journey_start',
        act: 3,
        speaker: 'System',
        narration: `The journey is long. The sand sings a haunting melody. You encounter a group of **Jade Summit Enforcers** blocking the path.

"State your business, traveler," the leader demands. "This region is under the Emperor's mandate. None shall pass without a Seal of Authority."`,
        choices: [
            { text: 'Show them your faction token (Requires Righteousness)', next: 'act3_jade_pass', karmaReq: 25 },
            { text: 'Intimidate them with your dark Qi (Requires Demonic path)', next: 'act3_enforcer_combat', karmaReq: -25 },
            { text: 'Try to find a way around', next: 'act3_stealth_path', karmaChange: 0 },
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

    act3_jade_pass: {
        id: 'act3_jade_pass',
        act: 3,
        speaker: 'Jade Enforcer',
        narration: `The Jade enforcers feel your overwhelming Righteous Karma. The captain salutes you with deep respect.
        
"Elder, your halo of pure righteousness precedes you. We would never hinder your sacred quest. Go with the blessings of the Jade Peak."`,
        choices: [
            { text: 'Thank them and proceed', next: 'act3_hall_arrival', karmaChange: 2 }
        ]
    },

    act3_enforcer_combat: {
        id: 'act3_enforcer_combat',
        act: 3,
        speaker: 'Jade Enforcer',
        narration: `The captain shudders under your oppressive, dark gaze. He draws his spear with trembling hands.
        
"Insolent rebel! Your dark Qi corrupts the sacred sand! Soldiers, capture this heretic!"`,
        choices: [
            { text: '⚔️ Crush the patrol!', next: 'act3_enforcer_victory', triggerCombat: 'jade_enforcer_squad', karmaChange: -5 }
        ]
    },

    act3_enforcer_victory: {
        id: 'act3_enforcer_victory',
        act: 3,
        speaker: 'System',
        narration: `The enforcers lie scattered on the sands, their formations shattered. The path to the reflections is yours.`,
        choices: [
            { text: 'Enter the Hall of Reflections', next: 'act3_hall_arrival' }
        ]
    },

    act3_stealth_path: {
        id: 'act3_stealth_path',
        act: 3,
        speaker: 'System',
        narration: `Moving like a shadow through wind-carved stone canyons, you successfully slip behind the patrol lines without raising any alarms.`,
        choices: [
            { text: 'Approach the Hall of Reflections', next: 'act3_hall_arrival', karmaChange: 1 }
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

    act3_mirror_vision: {
        id: 'act3_mirror_vision',
        act: 3,
        speaker: 'System',
        narration: `The glass ripples. You see your past lives: a grand Chinese Taoist General wielding a sword of pure starlight, a Sufi saint distributing clear water in a terrible drought, and a dark Asura tearing down the skies. 

"All lives are sand in the hourglass of the Great Tao," a silent voice echoes in your mind.
A wave of realization expands your spiritual consciousness, unlocking the gates to the **Abyssal Sea** and the **Brass City**!`,
        choices: [
            { text: '↩ Return to the Hub', next: null, returnToHub: true, storyFlag: 'act3_mirror_completed', unlockRegion: 'abyssal_sea', unlockRegion2: 'brass_city' }
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

    act4_join_offensive: {
        id: 'act4_join_offensive',
        act: 4,
        speaker: 'System',
        narration: `You charge alongside the battleship formation. A gargantuan Desert Jinn Rebel emerges from the fog to crush the vanguard!`,
        choices: [
            { text: '⚔️ Slay the Rebel Jinn!', next: 'act4_siege_victory', triggerCombat: 'desert_jinn_rebel', karmaChange: 5 }
        ]
    },

    act4_join_defensive: {
        id: 'act4_join_defensive',
        act: 4,
        speaker: 'System',
        narration: `You stand with the Dervishes around the central fountain. A screeching Corrupted Jade Specter descends from the storm to shatter the sanctuary!`,
        choices: [
            { text: '⚔️ Purge the Jade Specter!', next: 'act4_siege_victory', triggerCombat: 'corrupted_jade_specter', karmaChange: 5 }
        ]
    },

    act4_protect_civilians: {
        id: 'act4_protect_civilians',
        act: 4,
        speaker: 'System',
        narration: `You place yourself between a massive Spectral Fog Golem and a group of huddled, terrified merchants!`,
        choices: [
            { text: '⚔️ Smash the Fog Golem!', next: 'act4_siege_victory', triggerCombat: 'fog_golem', karmaChange: 10 }
        ]
    },

    act4_siege_victory: {
        id: 'act4_siege_victory',
        act: 4,
        speaker: 'System',
        narration: `With a final, devastating blow, the siege monster shatters! The spectral fog begins to dissolve, and the Crossroads erupts in cheers.

But the sky above the **Desert Rift** remains torn open. The final gateway is open, and the source of all instability awaits.`,
        choices: [
            { text: '↩ Return to Crossroads', next: null, returnToHub: true, storyFlag: 'act4_completed', unlockRegion: 'desert_rift' }
        ]
    },

    // ========================================================
    // ACT V — THE GREAT CONVERGENCE (Stage 10)
    // ========================================================
    act5_intro: {
        id: 'act5_intro',
        act: 5,
        speaker: 'System',
        narration: `The sky is blood-red. A giant rift of fractured light tears the desert in two. Crossroads is empty—the citizens have fled.

Scheherazade and the Sect Elders look at you one last time at the edge of the dunes. "Whichever path you choose, the future of the Silk Road rests on your shoulders."`,
        choices: [
            { text: 'Enter the Desert Rift', next: 'act5_final_confrontation', storyFlag: 'act5_started' }
        ]
    },

    act5_final_confrontation: {
        id: 'act5_final_confrontation',
        act: 5,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `At the heart of the storm stands a being of pure, broken light. It is neither Eastern nor Western, neither Saintly nor Demonic. It is a creature of pure Void.

"You have come far, little spark," it whispers, its voice sounding like grinding glass. "The world is a cycle of suffering. The Jade Emperor builds walls, and the Sufis try to pray them down. Both are wrong. There is only the End."`,
        choices: [
            { text: '⚔️ "I will protect this world!" (Requires Celestial Saint)', next: 'act5_battle_righteous', karmaReq: 60 },
            { text: '💀 "I will take your power for myself!" (Requires Demonic Sovereign)', next: 'act5_battle_demonic', karmaReq: -60 },
            { text: '⚖️ "The balance must be maintained."', next: 'act5_battle_neutral', karmaChange: 0 }
        ]
    },

    act5_battle_righteous: {
        id: 'act5_battle_righteous',
        act: 5,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `"A righteous soul," the Fallen Immortal sneers. "You are just another blind servant of sterile order! Let us see if your faith can withstand the crushing weight of the Void!"`,
        choices: [
            { text: '⚔️ Draw your righteous blade!', next: 'act5_ending_righteous_scene', triggerCombat: 'fallen_immortal_righteous' }
        ]
    },

    act5_battle_demonic: {
        id: 'act5_battle_demonic',
        act: 5,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `"A power-hungry beast," the Fallen Immortal laughs, his voice echoing like rolling thunder. "You wish to devour my Void to fuel your own ascension? Come, Asura! Let us see who consumes whom!"`,
        choices: [
            { text: '⚔️ Draw your dark blade!', next: 'act5_ending_demonic_scene', triggerCombat: 'fallen_immortal_demonic' }
        ]
    },

    act5_battle_neutral: {
        id: 'act5_battle_neutral',
        act: 5,
        speaker: 'The Fallen Immortal',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `"A seeker of balance," the Fallen Immortal sighs, a glimmer of sorrow in his eyes. "You think you can reconcile the sand and the jade? There is no middle path in the storm. Draw your weapon and prove your balance!"`,
        choices: [
            { text: '⚔️ Enter the Eye of the Storm!', next: 'act5_ending_neutral_scene', triggerCombat: 'fallen_immortal_neutral' }
        ]
    },

    // ========================================================
    // BRANCHED GAMEPLAY ENDINGS
    // ========================================================
    act5_ending_righteous_scene: {
        id: 'act5_ending_righteous_scene',
        act: 5,
        speaker: 'System',
        narration: `The Fallen Immortal shatters into countless shards of celestial light, dissolving the void. A golden bridge of spiritual Qi spans the entire length of the Silk Road. The Emperor's floating battleship descends, and the Sect Elders bow to you in awe.

You have achieved the **Saintly Ascension**, becoming a legendary guardian deity of both Sand and Jade!`,
        choices: [
            { text: '⭐ Conclude Your Legend', next: 'game_credits_page', storyFlag: 'game_completed_righteous' }
        ]
    },

    act5_ending_demonic_scene: {
        id: 'act5_ending_demonic_scene',
        act: 5,
        speaker: 'System',
        narration: `You plunge your hand into the chest of the Fallen Immortal, ripping out the core of the Void and devouring it! Black flames erupt from your meridians, turning the desert sands into dark, reflective glass. 

The Sect Elders crawl backward in absolute terror as you ascend into a **Demonic Sovereign**, claiming absolute dominion over both kingdoms!`,
        choices: [
            { text: '💀 Claim the Throne of Void', next: 'game_credits_page', storyFlag: 'game_completed_demonic' }
        ]
    },

    act5_ending_neutral_scene: {
        id: 'act5_ending_neutral_scene',
        act: 5,
        speaker: 'System',
        narration: `With a perfectly balanced strike, you neutralize the rift's energy, sealing the cosmic crack. The sands grow calm, and the sky returns to a clear, peaceful blue. 

You decline the Emperor's crowns and the mystics' invitations. Walking away silently into the setting sun, you remain the **Wandering Balance of the Great Tao**—a myth spoken of in whispers.`,
        choices: [
            { text: '⚖️ Walk into the Horizon', next: 'game_credits_page', storyFlag: 'game_completed_neutral' }
        ]
    },

    game_credits_page: {
        id: 'game_credits_page',
        act: 5,
        speaker: 'System',
        narration: `<div style="text-align:center; padding:20px; font-family:'Cinzel'; background:rgba(0,0,0,0.4); border-radius:12px; border:1px solid var(--jade);">
    <h2 style="color:var(--jade); letter-spacing:2px; font-size:2rem; margin-bottom:15px;">🌟 THE CHRONICLES OF IMMORTALITY 🌟</h2>
    <p style="color:var(--secondary); font-size:1.15rem; margin-bottom:25px;">"Legends of the Jade and Sand: The Immortal Codex"</p>
    <div style="font-family:'Outfit'; text-align:left; max-width:500px; margin:0 auto; line-height:1.6; color:#e0e6ed;">
        The great cycle of the Silk Road continues, but your name has been carved eternally into the ley lines of the world. Through cultivation, combat, and karma, you have reshaped the destiny of mortals and immortals alike.<br><br>
        <b>Design & Narrative:</b> DeepMind Advanced Coding pair programming<br>
        <b>Aesthetics:</b> Elite Glassmorphic Dark UI<br>
        <b>Cultivation Engine:</b> The Flowing Dao<br><br>
        Thank you for playing this epic RPG masterpiece. Your legacy is forever secure.
    </div>
</div>`,
        choices: [
            { text: '✨ Start a New Legacy (Main Menu)', next: null, onEnter: (state) => { location.reload(); } }
        ]
    }
};

// Merge into main STORY object
if (window.STORY && window.STORY.STORY_NODES) {
    Object.assign(window.STORY.STORY_NODES, EXTENDED_STORY_NODES);
} else {
    window.STORY = { STORY_NODES: EXTENDED_STORY_NODES };
}
