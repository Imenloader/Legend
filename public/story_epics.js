// ============================================================
// STORY_EPICS.JS — ملاحم التوسع الكبرى: ما وراء الصحراء وإمبراطورية الجان
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

const EPIC_STORY_NODES = {
    // ========================================================
    // EPIC SIDE SAGA: ANTARAH IBN SHADDAD
    // ========================================================
    saga_antarah: {
        id: 'saga_antarah',
        act: 'side',
        speaker: 'عنترة بن شداد',
        speakerSprite: 'assets/desert_knight_1778872351281.png',
        narration: `في قلب الصحراء القاحلة، وجدت فارساً أسمر اللون كأنه نُحت من صخور الليل، يقف وحيداً وممسكاً بسيف يقطر منه دم غيلان الصحراء.
        
"يا مسافر الرمل، السيف أصدق أنباءً من الكتب! لقد رأيت بعيني كيف يتكاثر غيلان الربع الخالي وسعلوة الأنهار. إذا كنت فارساً حقاً، قف بجانبي لنصد هذا الهجوم، أو ارجع إلى ديار أهلك آمناً!"`,
        choices: [
            { text: '⚔️ سأقاتل معك يا عنترة! هات ما عندك!', next: 'saga_antarah_battle', triggerCombat: 'desert_ghoul' },
            { text: 'لست مستعداً لمواجهة أهوال البادية الآن.', next: null, returnToHub: true }
        ]
    },

    saga_antarah_battle: {
        id: 'saga_antarah_battle',
        act: 'side',
        speaker: 'عنترة بن شداد',
        speakerSprite: 'assets/desert_knight_1778872351281.png',
        narration: `بعد المعركة الطاحنة، مسح عنترة دماء الغول عن سيفه ونظر إليك باحترام شديد.
        
"شجاعة نادرة وذراع لا تكل! أنت حقاً فتوة البادية وسيفها المخلص. سأعلمك سر 'ضربة العبسي القاصمة'، لعلها تنفعك في الأيام المظلمة القادمة."`,
        choices: [
            { text: '📜 تقبل شكر الفارس وتعلم المهارة', next: null, returnToHub: true, storyFlag: 'antarah_skill_unlocked', onEnter: (s) => {
                s.player.atk += 15;
                if (!s.player.skills) s.player.skills = [];
                if (!s.player.skills.includes('absi_strike')) s.player.skills.push('absi_strike');
            }}
        ]
    },

    // ========================================================
    // ACT VI — THE SUNKEN JINN EMPIRE (Stage 10+ Expansion)
    // ========================================================
    act6_intro: {
        id: 'act6_intro',
        act: 6,
        speaker: 'شيخ ديوان الفرسان',
        narration: `بعد ما وحدت ديوان الفرسان والأبطال الأحرار ورجعت الميزان لواحة القوافل، بدأ يظهر صدى غريب من أعماق "بحر الظلمات" المخفي ورا الربع الخالي. أمواج من النحاس السايل بتضرب شواطئ من الرمل الأسود، وصوت دقات طبول الجان القديمة بتتردد في السما.
        
شهرزاد وقفت جنبك على حافة الهاوية وبصت بحزن للدوامة المائية العملاقة. "دي بوابة مدينة النحاس الأسطورية، عاصمة إمبراطورية ملوك الجان السبعة. الفجوة اللي قفلتها في الفصل اللي فات كانت مجرد شرخ صغير من غضبهم. لو مسكتش ملوك الجان في معقلهم، هيغرقوا عوالم الشرق كلها في بحر من النحاس المنصهر."`,
        choices: [
            { text: '⛵ ابحر في بحر الظلمات وتحدى ملوك الجان!', next: 'act6_jinn_gates', storyFlag: 'act6_started' },
            { text: 'محتاج أرتاح وأتجهز أكتر قبل الملحمة دي.', next: null, returnToHub: true }
        ]
    },

    act6_jinn_gates: {
        id: 'act6_jinn_gates',
        act: 6,
        speaker: 'حارس البوابات النحاسية',
        narration: `الدوامة بلعتك ونزلتك لعمق مدينة النحاس الأسطورية. الحيطان كلها مبنية من صخور نحاسية بتلمع في ضوء أخضر شاحب، ومفيش أي أثر للشمس المألوفة.
        
وفجأة، البوابات العملاقة اتفتحت وخرج منها مارد من الجان النحاسي، لابس دروع من العهد السليماني القديم، وبيحمل سيف أطول من النخلة!
"من يتجرأ على إزعاج سلاطين وملوك الجان؟ لن تعبر إلا على جثتي المشتعلة!"`,
        choices: [
            { text: '⚔️ اسحق المارد النحاسي واكسر البوابة!', next: 'act6_jinn_inner_city', triggerCombat: 'brass_guardian', karmaChange: 5 },
            { text: 'حاول تستخدم حيلة وخدعة لتخطيه.', next: 'act6_jinn_stealth', karmaChange: 0 }
        ]
    },

    act6_jinn_stealth: {
        id: 'act6_jinn_stealth',
        act: 6,
        speaker: 'شهرزاد',
        narration: `استخدمت مهاراتك الباطنية عشان تتخفى في ظلال النحاس وتعدي من المارد الجبار. قدرت توصل للساحة الداخلية، لكن التوتر في الهوا أضعف تركيزك البدني شوية.`,
        choices: [
            { text: 'ادخل القصر الأعظم لمواجهة النمرود الجبار', next: 'act6_jinn_king', onEnter: (s) => { s.player.mp = Math.max(0, s.player.mp - 20); } }
        ]
    },

    act6_jinn_inner_city: {
        id: 'act6_jinn_inner_city',
        act: 6,
        speaker: 'ديوان الفتوة',
        narration: `جثة المارد النحاسي دابت وتحولت لبركة من النحاس المنصهر. أبواب القصر الأعظم فتحت من تلقاء نفسها، تدعوك لغرفة العرش المظلمة لمواجهة الملك الذي خلد نفسه.`,
        choices: [
            { text: 'ادخل القصر الأعظم وتحدى الملك النمرود', next: 'act6_jinn_king' }
        ]
    },

    act6_jinn_king: {
        id: 'act6_jinn_king',
        act: 6,
        speaker: 'النمرود الجبار',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `في وسط الغرفة، جالس على عرش من الجماجم النحاسية المشتعلة، النمرود الجبار ملك بابل الملعون. عينيه زي جمر النار، وهيبته بتخنق الأنفاس.
        
"يا ابن الطين الفاني، كيف تجرؤ على تحدي من خُلقوا من مارج من نار وحكموا بابل والأقدار؟ سأحرق أسطورتك وأصهر سيفك وأجعلك تمثالاً في حديقة النحاس!"`,
        choices: [
            { text: '⚔️ أنا سيد ملوك الأقدار، وسأطفئ نارك بتركيزي الباطني!', next: 'act6_victory', triggerCombat: 'immortal_nimrod', karmaChange: 10 }
        ]
    },

    act6_victory: {
        id: 'act6_victory',
        act: 6,
        speaker: 'ديوان الفتوة',
        narration: `النمرود الجبار صرخ صرخة هزت أركان مدينة النحاس كلها وهو بيتحول لرماد أسود بارد. أخذت من فوق عرشه "تاج النحاس الأسطوري"، حسيت بطاقة مهولة بتسري في عروقك وتضاعف تركيزك البدني!
        
نجحت في إنقاذ الشرق من طوفان النحاس وإمبراطورية الجان، واسمك أصبح رعباً في قلوب الجان وأملاً لكل البشر. لقد أتممت ملحمة الفصل السادس!`,
        choices: [
            { text: '👑 العودة منتصراً لواحة القوافل', next: null, returnToHub: true, storyFlag: 'act6_completed', onEnter: (s) => { 
                s.player.maxMp = Math.floor(s.player.maxMp * 1.5);
                s.player.gold += 10000;
            }}
        ]
    },

    // ========================================================
    // EPIC SIDE SAGA: THE LOST DAMASCUS FORGE
    // ========================================================
    saga_forge_start: {
        id: 'saga_forge_start',
        act: 'side',
        speaker: 'حداد القوافل الشيبة',
        narration: `الحداد العجوز في واحة القوافل شاورلك بإيده المليانة حروق. "يا فتوة، في خريطة قديمة اشتريتها من بدوي... بتشير لمكان ورشة دمشق المفقودة المدفونة تحت رمال 'وادي النار'. الورشة دي فيها أسرار صقل الفولاذ الدمشقي الخالص اللي يقدر يقطع الحديد زي الحلاوة."
        
لكن الوادي ده مليان فخاخ وحراس آليين من العصور القديمة وطناطلة خبيثة. هل عندك الشجاعة تستعيد أسرار أجدادنا؟`,
        choices: [
            { text: 'هسافر لوادي النار وأجيب السر!', next: 'saga_forge_valley' },
            { text: 'مش فاضي للكلام الفاضي ده دلوقتي.', next: null, returnToHub: true }
        ]
    },

    saga_forge_valley: {
        id: 'saga_forge_valley',
        act: 'side',
        speaker: 'الطنطل الغادر',
        speakerSprite: 'assets/desert_ghoul_1778872388305.png',
        narration: `وصلت لوادي النار، وبمجرد ما خطيت جوا المعبد المدفون، اشتغلت مصفوفات دفاعية ميكانيكية نارية، وظهر قدامك الطنطل العراقي الغادر، يتشكل في هيئة وحش ضخم من الظلال والحديد لسد الطريق!`,
        choices: [
            { text: '⚔️ دمر الطنطل البابلي!', next: 'saga_forge_puzzle', triggerCombat: 'iraqi_tantal' }
        ]
    },

    saga_forge_puzzle: {
        id: 'saga_forge_puzzle',
        act: 'side',
        speaker: 'مصفوفة الفولاذ',
        narration: `بعد ما سحقت الطنطل، لقيت باب الورشة مقفول بمصفوفة ألغاز نارية. لازم ترتب تدفق طاقة التركيز الباطني عشان تفتح الباب.`,
        choices: [
            { text: 'استخدم الوضعية السلسة (Water Form) لتبريد المصفوفة', next: 'saga_forge_victory' },
            { text: 'اضرب الباب بأقصى قوة غاشمة!', next: 'saga_forge_fail' }
        ]
    },

    saga_forge_fail: {
        id: 'saga_forge_fail',
        act: 'side',
        speaker: 'نظام الحماية',
        narration: `ضربتك الغاشمة خلت الباب ينفجر في وشك، وخدت ضرر كبير، لكن الباب اتكسر في النهاية.`,
        choices: [
            { text: 'ادخل الورشة', next: 'saga_forge_victory', onEnter: (s) => { s.player.hp = Math.floor(s.player.hp * 0.5); } }
        ]
    },

    saga_forge_victory: {
        id: 'saga_forge_victory',
        act: 'side',
        speaker: 'حداد القوافل الشيبة',
        narration: `جوة الورشة لقيت مخطوطة "صقل الصمصامة الدمشقي" وكمية من حديد الشهب! رجعت للمدينة والحداد بكى من الفرحة وهو بيشوف المخطوطة.
        
"يا بطل، من النهاردة أنا هرفع سقف صقل أسلحتك وعتادك لأضعاف مضاعفة!"`,
        choices: [
            { text: '🎉 رائع! العودة للواحة', next: null, returnToHub: true, storyFlag: 'damascus_forge_unlocked', onEnter: (s) => {
                if(window.CRAFTING) window.CRAFTING.maxRefineLevel = 15;
            }}
        ]
    },

    // ========================================================
    // EPIC SIDE SAGA: THE GRANDMASTER'S TRIAL
    // ========================================================
    saga_sufi_start: {
        id: 'saga_sufi_start',
        act: 'side',
        speaker: 'صوت مجهول في الرياح',
        narration: `في ليلة هادية، سمعت صوت السعلوة النهرية تناديك من بين غابات الأهوار العراقية المخيفة:
"يا من تسعى لليقين... هل تظن أنك طهرت قلبك حقاً؟ اتبع صوتي في الأهوار واختبر نقاء روحك في محنة شيخ الطريقة الأكبر."`,
        choices: [
            { text: 'تتبع الصوت لاختبار شجاعتك في الأهوار', next: 'saga_sufi_trial' },
            { text: 'هذه أوهام الشياطين والسعالي، سأتجاهلها.', next: null, returnToHub: true }
        ]
    },

    saga_sufi_trial: {
        id: 'saga_sufi_trial',
        act: 'side',
        speaker: 'السعلوة النهرية',
        speakerSprite: 'assets/mythology_bg_1778872403707.png',
        narration: `على ضفاف النهر، انقشع ضباب الأهوار لتكشف السعلوة عن وجهها المرعب وأنيابها القاتلة.
"أنا طموحك المدفون! أنا الغضب والشهوة التي تخبيها تحت قناع الشهامة! لن تفلت من شباكي المائية!"`,
        choices: [
            { text: '⚔️ طهر النهر من السعلوة المتوحشة!', next: 'saga_sufi_victory', triggerCombat: 'iraqi_silawah' }
        ]
    },

    saga_sufi_victory: {
        id: 'saga_sufi_victory',
        act: 'side',
        speaker: 'شيخ الطريقة الأكبر',
        narration: `الظل المظلم تبخر وبقى مكانه نور صافي. ظهر طيف لشيخ عجوز مبتسم وقالك:
"نجحت يا ولدي. انتصرت على أسوأ عدو... الغرور والخديعة الشيطانية في نفسك. خد مني البركة دي هدية في طريقك."
زاد سقف صحتك وطاقتك القصوى بشكل ملحوظ!`,
        choices: [
            { text: '✨ تقبل البركة والعودة للواحة', next: null, returnToHub: true, storyFlag: 'sufi_trial_completed', onEnter: (s) => {
                s.player.maxHp += 200;
                s.player.hp = s.player.maxHp;
                s.player.maxMp += 50;
            }}
        ]
    }
};

// Merge into main STORY object
if (typeof window !== 'undefined') {
    if (window.STORY && window.STORY.STORY_NODES) {
        Object.assign(window.STORY.STORY_NODES, EPIC_STORY_NODES);
    } else {
        window.STORY = { STORY_NODES: EPIC_STORY_NODES };
    }
}
