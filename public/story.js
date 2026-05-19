// ============================================================
// STORY.JS — الجزء الأول والثاني: الفصول 1-5 ومحرك التدريب القتالي والبرزخ
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

const STORY_NODES = {

    // ========================================================
    // PHASE 0 — THE WOMB (The Pre-Birth Choice)
    // ========================================================
    womb_start: {
        id: 'womb_start',
        act: 0,
        title: 'الحلم وسلالة النشأة الأولى',
        narration: `في سكون الليل وقبل أن تبدأ رحلتك الكبرى في البراري، تقف مستغرقاً في حلم عميق يحدد سلالة منشئك وقدرات عهدك للأبد. قوافل التجارة، وحوش الفيافي، قلاع الفرسان، وصليل السيوف يتردد في خيالك. تشعر بطاقة الهمة تسري في عروقك، وتتأهب لتحديد منشئك الذي سيشكل مستقبلك.

اختر سلالة منشئك ومقادير نسبك في هذه الصحراء الواسعة:`,
        choices: [
            { 
                text: '🌾 نشأت يتيماً معدماً فقيراً في هوامش المدائن (عزيمة الصابرين، فن قبضة التراب، 0 ذهب)', 
                next: 'womb_birth', 
                onEnter: (s) => { 
                    s.player.gold = 0; 
                    s.player.wombLineage = 'poor'; 
                    s.player.inheritedTrait = 'resolute_will'; 
                    if (!s.player.skills) s.player.skills = [];
                    s.player.skills.push('dust_fist'); 
                    s._wombGift = 'Vitality';
                } 
            },
            { 
                text: '🐪 ولدت سليل تجار قوافل الحرير الوفيرة (نفوذ الصراف، عتاد مذهب، 800 ذهب)', 
                next: 'womb_birth', 
                onEnter: (s) => { 
                    s.player.gold = 800; 
                    s.player.wombLineage = 'merchant'; 
                    s.player.inheritedTrait = 'bankers_eye'; 
                    if (!s.player.inventory.items) s.player.inventory.items = [];
                    s.player.inventory.items.push({ 
                        id: 'gilded_scimitar', 
                        name: 'سيف التجار البراق المذهب (فريد)', 
                        type: 'weapon', 
                        slot: 'weapon', 
                        quality: 'Unique',
                        stats: { atk: 18 }, 
                        price: 400 
                    });
                    s._wombGift = 'Strength';
                } 
            },
            { 
                text: '⚔️ نشأت وريثاً لعائلة من أعيان فرسان النبلاء (عزة الفرسان، فن السيف الشامي، 300 ذهب)', 
                next: 'womb_birth', 
                onEnter: (s) => { 
                    s.player.gold = 300; 
                    s.player.wombLineage = 'noble'; 
                    s.player.inheritedTrait = 'royal_pride'; 
                    if (!s.player.skills) s.player.skills = [];
                    s.player.skills.push('sham_blade'); 
                    if (!s.player.inventory.items) s.player.inventory.items = [];
                    s.player.inventory.items.push({ 
                        id: 'noble_shield', 
                        name: 'ترس النبلاء المذهب العريق (نادر)', 
                        type: 'relic', 
                        slot: 'relic', 
                        quality: 'Unique',
                        stats: { def: 12 }, 
                        price: 300 
                    });
                    s._wombGift = 'Strength';
                } 
            },
            { 
                text: '🐺 ترعرعت يتيماً تائهاً وسط رمال قفار الواحات الكاسرة (خفة الفهد، فن مخلب الذئب، 50 ذهب)', 
                next: 'womb_birth', 
                onEnter: (s) => { 
                    s.player.gold = 50; 
                    s.player.wombLineage = 'orphan'; 
                    s.player.inheritedTrait = 'beast_agility'; 
                    if (!s.player.skills) s.player.skills = [];
                    s.player.skills.push('wolf_claw'); 
                    s._wombGift = 'Spirituality';
                } 
            }
        ]
    },

    womb_birth: {
        id: 'womb_birth',
        act: 0,
        title: 'اليقظة وخطواتك الأولى',
        narration: `تستيقظ فجأة مع خيوط الفجر الأولى. شمس النهار الساطعة تداعب عينيك، وأصوات السوق وحركة القوافل في الواحة تملاً الأرجاء بالنشاط والهمة. تشعر بتركيزك وعزمك يشتدان مع بداية يوم جديد وحياة جديدة مليئة بالتحديات والمغامرات.

أصوات السوق والناس حواليك تملأ الوجدان بالحرارة، وتبدأ ملامح الدنيا والفرص تظهر في أفقك.`,
        onEnter: (s) => {
            if (window.LIFE) window.LIFE.rollLife(s);
        },
        choices: [
            { text: 'افتح عينك وابدأ حياتك وعهدك الجديد كبطل مغامر', next: 'act1_intro', storyFlag: 'womb_complete' }
        ]
    },

    // ========================================================
    // ACT I — THE CROSSROADS AWAKENING (Stages 1-3)
    // Theme: Discovery. The player is a nobody.
    // ========================================================

    act1_intro: {
        id: 'act1_intro',
        act: 1,
        title: 'يقظة واحة القوافل الكبرى',
        onEnter: (s) => {
            const bg = s.player.background || { name: 'مجهول النسبة' };
            const sys = s.player.system || { name: 'لا يوجد' };
            
            // Dramatic Background Narrative
            let introText = "";
            if (bg.id === 'royal') introText = "فاكر كويس ريحة البخور الملكي في غرف القصر الفخم، وتقل الحرير على كتافك، ونظرات شيوخ ومؤدبي البلاط الباردة.";
            else if (bg.id === 'beggar') introText = "فاكر وجع وقرصة البرد القاسي على بلاط الواحة الناشف، وطعم رغيف العيش اللي سرقته عشان تعيش، والجوع اللي مسبش بطنك للحظة.";
            else introText = "ذكريات طفولتك وصباحك الأولى عبارة عن شغل شاق وطلبات تجار وأحلام بسيطة وطيبة.";

            narrate(`<div style="background:rgba(212, 175, 55, 0.1); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--secondary);">
                <i style="color:var(--secondary)">${introText}</i><br><br>
                <b>النسب والمولد:</b> إنت <b>${bg.name}</b> اتولدت مع بركة وميزة قدر <b>${sys.name}</b>.<br>
                <small>${bg.desc}</small>
            </div>`, "ديوان الفتوة", null, false, true);
        },
        narration: `السنين بتعدي زي حبات الرمل في الساعة الرملية. مبقتش طفل صغير خلاص، ولقيت نفسك كبرت وبقيت في واحة القوافل والمدينة الكبرى المليانة ناس من كل فج.
        
مآذن المساجد والقلاع ودواوين بتعكس آخر خيوط ضوء الشمس الدافية وهي بتغرب. الهوا ريحته بخور العود والأنوار الشرقية. وصلت ومعاك حمل وهيبة نشأتك ومولدك — سواء كنت وارث تاج الملوك والأمراء أو كشكول الأبطال والفقراء الغلابة.

في وسط الواحة وجنب النافورة الكبرى، قاعدة ست بملابس الحكايات وحكايات زمان. بتحس بقلبك إنها قاعدة في المكان ده بقالها آلاف السنين، مستنية حضورك.`,
        bgImage: 'assets/mythology_bg_1778872403707.png',
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        choices: [
            { text: '🙏 قرب منها باحترام وأدب شديد', next: 'act1_scheherazade_meet', karmaChange: 3 },
            { text: '👁️ راقبها من بعيد الأول بحذر وفطانة', next: 'act1_scheherazade_cautious', karmaChange: 0 },
            { text: '🚶 عدي من جنبها — إنت ليك طريقك الخاص ومشوارك', next: 'act1_scheherazade_ignore', karmaChange: -2 }
        ]
    },

    act1_scheherazade_meet: {
        id: 'act1_scheherazade_meet',
        act: 1,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `بصت ورفعت راسها قبل ما توصل ليها بالظبط. عنيها ليها لون ضوء الشموع الدافية وهي بتعكس الكهرمان الأصفر النادر.

"أهلاً بيك. أخيراً جيت،" قالتها بنبرة كأنها مستنياك بقالها سنين طوال. "اتفضل اقعد وارتاح على الدكة. كل قصة عظيمة وعهد كبير بيبدأ بشخص لسة ميعرفش إنه البطل الحقيقي للرواية."

وصبت كوباية شاي بالنعناع من براد نحاسي مكنش موجود من ثانية واحدة على الطربيزة.

"في فجوة وفتنة كبيرة بدأت تتكون وتنشق بين ديوان فرسان جبل الطور وجماعات ورابطة أبطال الربع الخالي. في سر قديم وعظيم بدأ يصحى في قلب الصحراء — سر اندفن وصدر عليه حكم الكتمان لسبب قوي. وإنت يا مسافر، واقف بالظبط في النقطة اللي القصتين والعالمين هيتصادموا فيها بالكامل."`,
        choices: [
            { text: '"قوليلي محتاجة مني أعمل إيه بالظبط؟"', next: 'act1_accept_call', karmaChange: 2 },
            { text: '"ليه أنا بالذات؟ أنا مجرد شخص عادي ملوش وزن ولا قيمة."', next: 'act1_doubt', karmaChange: 0 },
            { text: '"إنتِ عرفتي كل الكلام ده منين وكيف؟"', next: 'act1_question_scheherazade', karmaChange: 1 }
        ]
    },

    act1_scheherazade_cautious: {
        id: 'act1_scheherazade_cautious',
        act: 1,
        speaker: 'ديوان الفتوة',
        narration: `بتراقبها من ورا دكان تاجر قوافل كبير في زاوية السوق. هي مبصتش ناحيتك خالص، بس اتكلمت بصوت مسموع وواضح كأنه بيرن في ودنك إنت وبس:

"تقدر تفضل تتفرج عليا من بعيد لو حابب يا بطل. أنا عندي صبر الحكايات وألف ليلة وليلة من الانتظار."

حسيت إن مكانك وسرك اتكشف بالكامل. الحكواتية شهرزاد ابتسمت وهي بتشرب الشاي بتاعها بوقار وسكينة.`,
        choices: [
            { text: 'عدي واقعد جنبها على الدكة بكل ثقة', next: 'act1_scheherazade_meet', karmaChange: 1 },
            { text: 'امشي وسيب المكان خالص ومشوارها', next: 'act1_scheherazade_ignore', karmaChange: -3 }
        ]
    },

    act1_scheherazade_ignore: {
        id: 'act1_scheherazade_ignore',
        act: 1,
        speaker: 'ديوان الفتوة',
        narration: `عديت من جنبها ومشيت في طريقك. وراك، صوت الست شهرزاد طار زي الدخان الخفيف في الهوا:

"القصة والقدر بيلاقوا بطلهم الحقيقي أياً كان، سواء حب كده أو رفض. القدر ملوش عزيز."

بعد تلات شوارع بالظبط في قلب سوق واحة القوافل، طلعلك زعيم صعاليك طريق الحرير من حارة ضلمة ووقف قدامك بالظبط. وراه ستة رجالة شايلين سيوف وجنازير بيمضغو التبغ.

"فلوسك ودنانيرك يا إما دمك ورأسك يا غريب. اختار بسرعة عشان رجالتنا جعانة وسيوفهم عطشانة."

أول اختبار وفتنة في الواحة والمدينة لاقاك أهو، هربت منه ولا مهربتوش.`,
        choices: [
            { text: '⚔️ حاربهم وسن سيفك الدمشقي!', next: 'act1_bandit_combat', karmaChange: 0 },
            { text: '💰 حاول تتفاوض معاهم بالود وعقل التجار الفطين', next: 'act1_bandit_negotiate', karmaChange: 2 }
        ],
        triggerCombat: 'silk_road_bandit'
    },

    act1_accept_call: {
        id: 'act1_accept_call',
        act: 1,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `هزت راسها ببطء ووقار، كأن إجابتك هي بالظبط اللي كانت مستنياها وعارفاها بقلبها.

"أول خطوة — عيش واحمي نفسك. طريق الحرير والصحراء مبيسموش على الغلابة والضعاف اللي معندهمش قوة وقوة بدنية وجسدية. قوي مقاماتك وبنية مانا تركيزك وهمتك. لما توصل للمرتبة والمستوى التالت في التدريب والتركيز، ارجعلي هنا عند النافورة."

وقفت على طولها، وحسيت إن قوامها مهيب وأطول بكتير مما كانت باينة وهي قاعدة.

"حاجة أخيرة. في قوتين كبار أسياد كل واحدة فيهم هتحاول تضمك لصفها وتحت جناحها. ديوان فرسان جبل الطور الأثرياء بفرسانهم — ورابطة أبطال الربع الخالي الأحرار بفرسانهم وجدعانهم الأوفياء. لا دول خير مطلق، ولا دول شر مطلق. فكر واختار كويس بقلبك وعقلك. أو متختارش خالص، وسيب القدر والميزان يختارلك ويحدد عهدك."

ولفت وسط زحمة الناس في السوق واختفت كأنها مكنتش موجودة أصلاً...`,
        choices: [
            { text: 'ابدأ رحلتك وتأملك البدني العظيم في عوالم الشرق', next: 'act1_hub_open', karmaChange: 0 }
        ],
        unlockRegion: 'crossroads',
        storyFlag: 'act1_started'
    },

    act1_doubt: {
        id: 'act1_doubt',
        act: 1,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"'عبارة أنا مجرد شخص عادي ملوش وزن هي البداية الحقيقية لكل قصة أسطورية حكيتها في حياتي،' وشربت بوقار من الشاي بالنعناع. 'الشخص العادي بيبني نفسه ويبقى بطل يهز الجبال بالجهاد والتدريب والتركيز والسلوك. ده سر الحكاية كله.'

وحطت الكوباية على الطربيزة النحاس بحسم.

"السؤال الحقيقي مش هل إنت جاهز ولا لاء. السؤال هو هل هتمد إيدك وتمسك بزمام القدر لما اللحظة الحاسمة تيجي وتناديك؟ أغلب الناس بيترعبوا ويهربوا للسلامة الفانية."`,
        choices: [
            { text: '"أنا همد إيدي وهمسك زمام قدري!"', next: 'act1_accept_call', karmaChange: 5 },
            { text: '"أنا محتاج وقت أفكر وأتأمل الموقف."', next: 'act1_hub_open', karmaChange: 0 }
        ]
    },

    act1_question_scheherazade: {
        id: 'act1_question_scheherazade',
        act: 1,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `ابتسمت لأول مرة بجد وصفاء، من غير تمثيل أو استعراض الحكايات المعتاد.

"سائل باحث عن الحقيقة. ده شيء عظيم يا بني. الأبطال اللي مبيسألوش ومبيشكوش هما أخطر نوع من البشر على نفسهم وعلينا."

"أنا عارفة الكلام ده لأني بحكي القصة دي وبشوف عهودها من زمان جداً. عارفة كل رواية ونسخة ليها. عارفة النسخة اللي رفضت فيها تكمل طريقك. وعارفة النسخة اللي نجحت فيها وعديت كل التوقعات والحدود. وعارفة النسخة اللي دمرت فيها شيء غالي وعظيم في الكون مبقاش ينفع يتصلح بعدها."

"وأنا هنا عشان أحاول مع بعض نوصل للنسخة الأفضل والأنور وميحصلش أي خراب في واحة القوافل."`,
        choices: [
            { text: '"كلام غامض ومخيف... ماشي يا ستي. قوليلي أبدأ منين وبإيه؟"', next: 'act1_accept_call', karmaChange: 3 }
        ]
    },

    act1_hub_open: {
        id: 'act1_hub_open',
        act: 1,
        speaker: 'ديوان الفتوة',
        narration: `شوارع وأسرار واحة القوافل الكبرى والمدينة بتفتح بواباتها قدامك. جبال ديوان فرسان جبل الطور بتلوح في الأفق الشرقي، وبحر رمال الربع الخالي بينادي خطواتك ورا البوابة الغربية. رحلتك وتدريبك البدني والقتالي بيبدأ دلوقتي حالا.

ارتقي لمقام وتأمل المستوى التالت عشان تفتح أحداث الفصل التاني.`,
        choices: [],
        returnToHub: true,
        storyFlag: 'act1_hub_open'
    },

    // Act I Boss: Silk Road Bandit King
    act1_bandit_intro: {
        id: 'act1_bandit_intro',
        act: 1,
        speaker: 'زعيم صعاليك طريق الحرير',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `حجمه ضخم وجسمه مليان هيبة مرعبة. في جرح قديم وندبة كبيرة واخدة من ودنه الشمال لحد دقنه. رجالته اتوزعوا وراك وقدامك بخبرة وحرفية — واضح إن ده مش أول فخ ولا أول كمين يعملوه في واحة القوافل.

"سمعت إن في سالك جديد وتاجر مبتدئ لسة واصل المدينة. صغير، وقلة خبرة. بالظبط نوعية الضيوف اللي بنحب نرحب بيهم في واحة القوافل،" وضحك بوقاحة وهيبة. "ضريبة الترحيب والأمان يا شاطر. كل اللي في جيوبك ودنانيرك تطلع هنا فوراً من غير شوشرة."`,
        choices: [
            { text: '⚔️ "أنا مبدفعش مليم لصعاليك وحرامية الصحراء."', next: null, triggerCombat: 'silk_road_bandit', karmaChange: 0 },
            { text: '🧠 "إيه رأيك لو عرضت عليك حاجة تسوى دهب وأكتر من الدنانير الفانية؟"', next: 'act1_bandit_negotiate', karmaChange: 2 },
            { text: '💀 "أنا أخطر بكتير مما تتخيل يا صعلوك، بلاش تلعب معايا."', next: 'act1_bandit_bluff', karmaChange: -1 }
        ]
    },

    act1_bandit_negotiate: {
        id: 'act1_bandit_negotiate',
        act: 1,
        speaker: 'زعيم صعاليك طريق الحرير',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `وقف وبص لرجاله بتردد. المفاوضات والعقل بتشده وبتعجبه — دي حاجة نادرة يقابلوها في مهنتهم دي.

"اتكلم بسرعة وبوقار. صبري قليل ورجالتي جعانين وسيوفهم عطشانة."

عرضت عليه تشغل مهاراتك وقدراتك البدنية لخدمته، أو تديه معلومات سرية ومهمة عن عصابة تانية منافسة ليهم في طرق التجارة، أو توعده بجميل ومعونة كبيرة لما شأنك يعلى وتبقى بطل صاحب كلمة في المدينة.

بحلق فيك ووشه كرمش لثواني طويلة وهو بيفكر بعمق. وفجأة فقع ضحكة عالية وصافية رنت في السوق.

"قلبك ميت بجد وعندك شجاعة عيال رجالة. خلاص. أنا هفتكر وشك ده كويس. لو بقيت صاحب قيمة واسم في الدنيا، هنيجي نطالبك بالجميل والمعونة ده. ولو طلعت فشنك وملقتش قيمة..." وهز كتافه ببرود. "هلاقيك برضه وأخلص عليك."

وشاور لرجاله يرجعوا سيوفهم. ودابوا في شوارع الواحة الضيقة بسرعة.`,
        choices: [
            { text: 'استمر في مغامرتك', next: 'act1_hub_open', karmaChange: 3 }
        ],
        storyFlag: 'bandit_king_negotiated',
        affinityChange: { npcId: 'bandit_king', delta: 20 }
    },

    act1_bandit_bluff: {
        id: 'act1_bandit_bluff',
        act: 1,
        speaker: 'ديوان الفتوة',
        narration: `بص عليك من فوق لتحت بتمعن. وبص لرجاله وضحكوا باستهزاء. وبعدين بص في عينك تاني وقال بحسم:

"خلصوا عليه يا رجالة."

الفهلوة والبلف منفعش مع صعاليك الجبل. جه الوقت تخلي كلامك حقيقة بالسيوف والدم!`,
        choices: [
            { text: '⚔️ قتال ودفاع عن النفس!', next: null, triggerCombat: 'silk_road_bandit', karmaChange: -2 }
        ]
    },

    // ========================================================
    // ACT II — THE TWO WORLDS AT WAR (Stages 4-6)
    // Theme: Conflict. Two factions recruit the player.
    // ========================================================

    act2_intro: {
        id: 'act2_intro',
        act: 2,
        title: 'فتنة العوالم والأنوار',
        requiredStage: 3,
        requiredFlag: 'act1_started',
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `لاقيتها واقفة جنب النافورة والماء الجاري تاني، كأنها مسبتش مكانها للحظة واحدة.

"مقامات تركيزك وهمتك وتجليك قويت وزادت ببركة وفيرة. ممتاز،" وقفت وبصت في عينك بوقار. "أحداث الفصل التاني هتبدأ دلوقتي حالا، سواء كنت جاهز أو لاء."

"في وفدين كبار وصلوا واحة القوافل الأسبوع ده. الوفد الأول — الشيخ الجليل والفقيه صاحب ديوان فرسان جبل الطور، اللي مسبش قمة الجبل بقاله ستين سنة طوال. الوفد التاني — بطل وشيخ رابطة أحرار الربع الخالي العظيم، اللي عمره ما نزل واحة القوافل ولا دخل مدينة قبل كده."

"الاتنين جايين عشانك إنت بالذات. والاتنين قنواتهم البدنية وقلوبهم بتتآكل من جوة بمرض وظلام هما مش فاهمين سببه إيه. وكل طرف فيهم مقتنع وعنده تركيز وهمة إن الطرف التاني هو اللي ورا المصيبة والشر ده."

ووطت صوتها وهمست بحذر:

"الاتنين عميان وغلطانين. في طرف تالت غامض وشرير بيلعب بيهم وبينا."`,
        choices: [
            { text: '🤝 مقابلة المعلم تشاو أولاً (طريق قلعة قمة اليشم)', next: 'act2_meet_elder_zhao', karmaChange: 0 },
            { text: '⚔️ مقابلة الشيخ محمود أولاً (طريق فرسان جبل الطور)', next: 'act2_meet_sheikh', karmaChange: 0 },
            { text: '💬 "قوليلي الأول مين هو الطرف الثالث الغامض ده؟"', next: 'act2_third_party_hint', karmaChange: 1 }
        ],
        storyFlag: 'act2_started'
    },

    act2_third_party_hint: {
        id: 'act2_third_party_hint',
        act: 2,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `"'فطين وذكي بجد. أغلب الأبطال المتهورين بيجروا بفرسهم مباشرة لوسط النار والخناقة من غير تفكير.'

ووطت صوتها ووشوشتك في ودنك:

"من زمان جداً، في سالك وبطل عظيم من قلاع ودواوين الشرق عدي ودخل عوالم النفس في الغرب وصحراء الرمال في مهمة ودية. وهناك، شاف نور التركيز البهي والصفاء البدني الأسمى — والنور ده دمر وفكك كل عقائده القديمة عن المانا وطريق السلوك. رجع لبلده وجماعته... مكسور الوجدان. قعد ألف سنة كاملة يحاول يربط ويوحد بين حقيقتين حس إنهم مستحيل يعيشوا مع بعض في نفس الكون."

"وفشل في الآخر. وفي قمة فشله ويأسه، قرر يدمر ويحرق العالمين والصومعتين بالكامل بدل ما يعيش في صراع الشك والوجع الداخلي ده."

"بينادوه بـ الخالد الساقط المكسور. وبقاله قرون طويلة بيسم وبيلوث عوالم جبل الطور وروابط الفرسان الأحرار بالراحة ومن سكات من جوة، وبيخلي كل طرف يفتكر إن التاني هو عدوه الأصيل."

وبصت في عينك مباشرة وبقوة.

"دلوقتي بقيت عارف السر العظيم. السؤال هو: هل المعرفة دي هتخليك حذر وفطين في خطواتك — ولا هتخليك متهور وتاخدك نار الفتنة؟"`,
        choices: [
            { text: '🤝 مقابلة المعلم تشاو', next: 'act2_meet_elder_zhao', karmaChange: 0 },
            { text: '⚔️ مقابلة الشيخ محمود', next: 'act2_meet_sheikh', karmaChange: 0 }
        ]
    },

    act2_meet_elder_zhao: {
        id: 'act2_meet_elder_zhao',
        act: 2,
        speaker: 'الشيخ الجليل صاحب القلعة وديوان',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `رجل طاعن في السن بشكل مهيب. من نوع السن اللي بيديك وقار وهيبة ترعب القلوب بدل الضعف والمرض. هدومه البيضاء ناصعة ومطرزة بالذهب. ولحيته البيضاء واصلة لحد حزامه.

"يا سالك الأنوار،" مهزش راسه، بس مال بكتفه ووقاره ليك — وحاجة زي دي من فقيه وجليل مقامه وعزوته تعتبر تقدير كبير جداً. "أنا راقبت سلوكك وصعود مقاماتك البدنية من فوق جبل الطور. عندك موهبة فطرية نادرة، بس معندكش أساس متين وسند قوي. إحنا بنعرض عليك الاتنين ببركة أسرارنا."

وطلع تميمة نحاسية أثرية — ختم الفتوة والشهامة الكبرى لديوان فرسان جبل الطور.

"انضم لينا وشاركنا السلوك والجهاد. اتدرب وارتري في مقامات الجبل الشاهق. وفي المقابل، ساعدنا نكشف ونبتر منبع الظلمة والفساد اللي بيسم جذور تلاميذنا الصغار في الخلوة. في تلاتة من أحبابنا اتدمرت قنواتهم البدنية تماماً من جوة من غير لمسة واحدة. في شر مجهول بيستهدفنا."

عنيه كانت صافية ورايقة بجد. هو فعلاً ميعرفش ولا يتخيل إن الخالد الساقط المكسور هو اللي بيلعب بيهم من ورا الستار.`,
        choices: [
            { text: '🏔️ وافق — انضم لفرسان ديوان فرسان جبل الطور الأوفياء', next: 'act2_join_jade', karmaChange: 5, storyFlag: 'aligned_jade' },
            { text: '🤝 "أنا هساعدكم بكل طاقتي بقوتي وعزمي، بس هفضل حر ومستقل."', next: 'act2_neutral_jade', karmaChange: 2 },
            { text: '👁️ "أنا لازم أسمع كلام ووجهة نظر الطرف التاني الأول قبل ما أقرر."', next: 'act2_meet_sheikh', karmaChange: 1 }
        ]
    },

    act2_meet_sheikh: {
        id: 'act2_meet_sheikh',
        act: 2,
        speaker: 'شيخ أحرار الربع الخالي',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `قاعد مربع رجله بوقار وتواضع على بساط قديم في حوش الخلوة، هادي ورايق تماماً رغم الدوشة والزحمة اللي مالية السوق برا السور. هدومه عبارة عن جلباب أبيض بسيط جداً. وقلادته الخشبية للتركيز بتتحرك بين صوابعه بسلاسة ونور زي المية الجارية.

"اتفضل اقعد وارتاح،" قالها بنبرة دعوة حنينة، مش أمر أسياد ورؤساء.

"أنا مسافرتش وجيت المدينة دي بالساهل يا ابني. في شر وفساد كبير بيحصل في رمال الربع الخالي العظيم. الجان الصالحين اللي عايشين جنبنا في سلام وبنحترمهم من قرون بدأوا يتحولوا لمردة أشرار ويهاجموا القوافل. وتلاميذنا اللي بيروحوا يتأملوا ويزهدوا في المقامات الصحراوية القديمة مبيرجعوش بالأسابيع."

وفتح عنيه النورانية الدافية. عنيه كانت بلون رمال الصحراء الذهبية وقت الفجر الدافئ.

"شيوخنا مقتنعين إن فرسان ديوان فرسان جبل الطور هما السبب — بمانا السيف وسحرهم الشرقي اللي بيقطع خطوط طاقة الأرض في الصحراء. بس في ناس ثقة قالولي إن الحقيقة أعقد وأعمق من الخناقة دي بكتير." وسكت لثواني. "هل إنت بقى من الرجال السالكين اللي يقدروا يواجهوا الحقيقة المعقدة من غير ما يخافوا أو يرجعوا لورا؟"`,
        choices: [
            { text: '🌙 وافق — انضم لرابطة أبطال الربع الخالي الأحرار', next: 'act2_join_sufi', karmaChange: 5, storyFlag: 'aligned_sufi' },
            { text: '🤝 "أنا هساعدكم وأقف معاكم، بس هفضل بطل مستقل ومش تابع لأي رابطة."', next: 'act2_neutral_sufi', karmaChange: 2 },
            { text: '"أنا عارف ومتاكد بالظبط مين اللي ورا الفتنة والشرور دي كلها يا شيخنا."', next: 'act2_reveal_fallen_early', karmaChange: 0 }
        ]
    },

    act2_reveal_fallen_early: {
        id: 'act2_reveal_fallen_early',
        act: 2,
        speaker: 'شيخ أحرار الربع الخالي',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `اتسمر في مكانه والقلادة وقفت بين صوابعه النورانية بذهول.

"قول الكلام ده تاني كدة وبصوت واضح وقوي."

حكيتله بالتفصيل عن الخالد الساقط المكسور — السالك اللي انهار وجدانه وقنواته البدنية بسبب عدم قدرته على الجمع بين مانا الشرق ونور التوحيد في الغرب، وبقى بيسم العالمين وينشر الفتنة والكره عشان كل طرف يظن إن التاني هو الفاعل والعدو.

سكون طويل وصمت مهيب ساد الحوش. والمسبحة فضلت واقفة.

"ده يفسر... يفسر حاجات كتيرة جداً غابت عن عقولنا وتأملنا،" وطلع تنهيدة دافية وطويلة من قلبه. "الروح المكسورة المليانة بالمرارة واليأس مبتدمرش اللي بيهددها بس. بتدمر الدنيا كلها حواليها، عشان تلاقي ونس وشريك في صراعها وانهيارها الداخلي والبدني."

ووقف بوقار وهيبة. "لو كان كلامك وتجليك ده صح، الفتنة دي أكبر بكتير من مجرد خلاف على واحة أو أرض. ده انهيار كامل لروح عظيمة بتحاول تسحب الكون كله معاها للقاع والخراب."

وملامح وشه الدافية بانت عليها شجاعة وعزيمة رجالة صلبة.

"إذن لازم نلاقيه ونوقفه عند حده. إيدي في إيدك يا بطل ونوحد القلوب."`,
        choices: [
            { text: 'اعقد صلح وتحالف أسطوري فريد بين القلعة وديوان والأبطال الأحرار', next: 'act2_dual_alliance', karmaChange: 10, storyFlag: 'dual_alliance' }
        ]
    },

    act2_join_jade: {
        id: 'act2_join_jade',
        act: 2,
        speaker: 'ديوان الفتوة',
        narration: `أخذت التميمة ورمز القلعة وديوان النحاسي الأثري. علامات الرضا والقبول بانت على ملامح الشيخ الجليل ووقاره بابتسامة خفيفة ومهيبة.

"اطلع جبل الطور وابدأ مشوارك. تدريبك وتدريبك البدني والقتالي بيبدأ مع خيوط الفجر الأولى."

ديوان فرسان جبل الطور بقت طائفتك وعزوتك الرسمية دلوقتي. الانضمام لأبطال الربع الخالي بقى أصعب ومحتاج حذر، بس مش مستحيل. في بوابات بتقفل وبوابات تانية بتفتح قدام عزمك وتركيزك.

تدريبك وتأملك البدني بيزيد ببركة وسرعة، وطاقة خطوط جبل الطور بتنادي قنواتك البدنية للتجلي الأكبر.`,
        choices: [{ text: 'استمر في مغامرتك', next: null, returnToHub: true }],
        storyFlag: 'jade_sect_member',
        unlockRegion: 'jade_peak',
        onEnter: (state) => {
            state.player.faction = 'ديوان فرسان جبل الطور الكبرى';
            state.player.factionRank = 1;
            calculateTotalStats();
        }
    },

    act2_join_sufi: {
        id: 'act2_join_sufi',
        act: 2,
        speaker: 'ديوان الفتوة',
        narration: `هزيت راسك بالموافقة الصافية. الشيخ محمود طلع خيط حرير أخضر مبارك — علامة الفارس السالك المبتدي — وربطه حوالين معصمك مع دعاء قصير وبركة ورضا.

"القدر والبركة ينوران فرسانك وقافلتك وتركيزك وهمتك باللي هتلاقيه وتكشفه في طريق السلوك والجهاد يا بني."

رابطة فرسان الربع الخالي الأحرار بقت عزوتك وطائفتك الرسمية. الربع الخالي فتح أبوابه وأسراره بالكامل لخطواتك. التعامل مع ديوان فرسان جبل الطور هيبقى محتاج منك فطنة وذكاء سياسي.

الصحراء الشاسعة بتنادي تركيزك وهمتك وسلوكك بنداء غامض وجميل بيهز وجدانك ويبعث فيك الأمل.`,
        choices: [{ text: 'استمر في مغامرتك', next: null, returnToHub: true }],
        storyFlag: 'sufi_order_member',
        unlockRegion: 'empty_quarter',
        onEnter: (state) => {
            state.player.faction = 'فرسان الربع الخالي الأحرار';
            state.player.factionRank = 1;
            calculateTotalStats();
        }
    },

    act2_dual_alliance: {
        id: 'act2_dual_alliance',
        act: 2,
        speaker: 'ديوان الفتوة',
        narration: `عملت المعجزة اللي الطرفين كانوا شايفينها مستحيلة وخيال: أقنعت الشيخ الجليل لفرسان الطور والشيخ محمود لرابطة أبطال الربع الخالي إن عدوهم الحقيقي هو الخالد الساقط المكسور مش بعض.

تحالف تاريخي هش وتنسيق عسكري غير مسبوق اتأسس في حوش المدينة الكبرى وواحة القوافل. شيخين كبار عمرهم ما قعدوا على طربيزة واحدة، بيشربوا شاي مع بعض بصعوبة وبيمهدوا الطريق لإنقاذ الناس وحقن الدماء.

الاتنين اتفقوا على حاجة واحدة بس: الخالد الساقط المكسور لازم نلاقيه ونبتر شره بالكامل.

المنطقتين وجبل الطور والربع الخالي اتفتحوا قدامك في نفس الوقت. الطائفتين بيثقوا فيك — وده معناه إن الطرفين هيطلبوا منك مهمات وتفاني ممكن يضرب مصالح بعض. فكر واختار خطواتك بذكاء الفرسان والسالكين الأوفياء.`,
        choices: [{ text: 'استمر في مغامرتك', next: null, returnToHub: true }],
        storyFlag: 'dual_alliance',
        unlockRegion: 'jade_peak',
        unlockRegion2: 'empty_quarter'
    },

    act2_harun_crisis: {
        id: 'act2_harun_crisis',
        act: 2,
        requiredFlag: 'act2_started',
        requiredStage: 4,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `الخليفة هارون الرشيد بيموت.

الست شهرزاد قالتلك الخبر الصادم ده من غير أي مقدمات ولا تمهيد.

"اتسم بـ سم بدني خبيث — مش سم تجار حرامية من السوق، سم بيدوب مانا تركيزه وجسده من جوة بالراحة في قنواته البدنية. أطباء القصر ودكاترة المدينة عاجزين ومذهولين تماماً. وحاشية البلاط بدأت تنقسم وتتخانق على الورث والسيطرة.

وهو طلب يشوفك إنت بالذات يا بطل. واضح إن سيرتك وبطولاتك بتطير في الواحة والبلاد بسرعة البرق.

ولازم تعرف — الخليفة هارون الرشيد مش راجل بسيط ولا سهل. ساعات بيبقى عادل وطيب، وساعات بيبقى شديد وباطش في نفس اليوم. بس هو صمام الأمان الحقيقي لواحة القوافل وطريق الحرير كله. لو مات، النظام السياسي والأمني اللي مأمن سلام وحياد الواحة هيتفرتك تماماً. فرسان الطور والأبطال مش هيلاقوا وازع يمنعهم من حرب طاحنة تاكل الأخضر واليابس هنا."`,
        choices: [
            { text: '🏃 الذهاب لمقابلة الخليفة فوراً', next: 'act2_harun_palace', karmaChange: 3 },
            { text: '⏳ إنهاء الأمور والمعاملات المعلقة أولاً', next: null, returnToHub: true, storyFlag: 'harun_waiting' },
            { text: '❌ دي مش مشكلتي ومش هتدخل', next: 'act2_harun_refuse', karmaChange: -8 }
        ]
    },

    act2_harun_refuse: {
        id: 'act2_harun_refuse',
        act: 2,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `ملامح ووش الست شهرزاد متغيرتش خالص. بس الجو والنور حواليك هدي واتغير بهدوء مقلق.

"فهمت،" وسكتت لثواني بحزن. "إذن خليني أحكيلك قصة ورواية تانية للنسخة اللي اخترت فيها الاختيار ده وسيبته يموت. رواية قصيرة جداً ومأساوية. بتنتهي بخراب الواحة ودمار القصر وبيوت الناس وخراب طريق الحرير بالكامل.

كل بياع وطفل وشيخ سالك بطل موجود في أمان المكان ده لإن الخليفة هارون الرشيد حامي بابه وفاتحه للكل. من غير وقاره وهيبته، الواحة دي تتحول لساحة دم وتصفية حسابات طائفية في أقل من شهر.

أنا مش بقولك الكلام ده عشان أوجع ضميرك يا بني. أنا بقوله لأنك لسة مش مستوعب حجم وخطورة رفضك ده. أنك ترفض وإنت فاهم حجم الكارثة... ده على الأقل يبقى اختيار صادق وشجاع لو كنت تقدر تعيش بنتايجه الصعبة."`,
        choices: [
            { text: '...الذهاب لمقابلة الخليفة', next: 'act2_harun_palace', karmaChange: 2 },
            { text: 'الاستمرار في الرفض', next: null, returnToHub: true, karmaChange: -15, storyFlag: 'harun_refused' }
        ]
    },

    act2_harun_palace: {
        id: 'act2_harun_palace',
        act: 2,
        speaker: 'الخليفة هارون الرشيد',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `قصر الخليفة هارون الرشيد أهدى وأكيب بكتير مما كنت تتخيل. الحاشية والخدم بيتحركوا في صمت مطبق وخوف واضح. الحراس واقفين عينيهم بتاكل الصخور وبتفتش كل ركن.

الخليفة هارون الرشيد راقد على سراير وسرير من الحرير والقطيفة الفخمة، ورغم المرض والضعف الشديد اللي باين عليه، لسة هيبته وسلطانه ماليين الأوضة بالكامل وبيرعبوا القلوب.

"قالوا ليا إنك جاي يا بطل،" صوته كان ضعيف ومهتز بس فيه نبرة الملوك الجبابرة. "اتفضل اقعد واقترب. معنديش مانا كفاية عشان أزعق وأتكلم بصوت عالي في القاعة الكبيرة."

قعدت جنبه. بص ليك بتركيز وفحصك بعينين رجل حكم بلاد وشاف آلاف الرجال والفرسان في حياته الطويلة.

"في حاجة ناصبة جوة تركيزي وجسدي مبتنتميش ليا. حاسس بيها بقالي ست أسابيع كاملة — برودة شديدة بتموت الخلايا، وسكوت رهيب صوته أعلى من الدوشة والصريخ،" وسكت ونهج بتعب. "دكاترة القصر بيقولوا قدامي سنة أعيشها. وجسدي بيقول إنهم متفائلين زيادة عن اللزوم وبيعشموني.

أنا هطلب منك خدمة وسؤال مطلبتوش من أي كائن تاني في القصر والحاشية، لإن الكل هنا ليه مصلحة ومنفعة في موتي أو حياتي وعرشي،" وبص في عينك بطلب نجدة صادق ووقار. "هل تقدر تكشف وتحدد إيه اللي ناصب وبياكل في تركيزي وجسدي من جوة؟"`,
        choices: [
            { text: '🩺 "سأحاول التعرف على هذا السم الباطني الخبيث."', next: 'act2_harun_diagnosis', karmaChange: 3 },
            { text: '⚠️ "أظن أنني أعرف من ارتكب هذا الجرم الخبيث."', next: 'act2_harun_fallen_reveal', karmaChange: 2 },
            { text: '"وماذا ستقدم لي في المقابل؟"', next: 'act2_harun_bargain', karmaChange: -3 }
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
        // Heal and validate state first
        this.validateCurrentState(state);

        if (!this.hasFlag(state, 'womb_complete')) return 'womb_start';
        if (!this.hasFlag(state, 'act1_started')) return 'act1_intro';
        if (state.player.lvl >= 3 && !this.hasFlag(state, 'act2_started')) return 'act2_intro';
        if (state.player.lvl >= 4 && this.hasFlag(state, 'act2_started') && !this.hasFlag(state, 'harun_met')) return 'act2_harun_crisis';
        if (state.player.lvl >= 6 && this.hasFlag(state, 'harun_met') && !this.hasFlag(state, 'act3_started')) return 'act3_intro';
        if (state.player.lvl >= 9 && this.hasFlag(state, 'act3_mirror_completed') && !this.hasFlag(state, 'act4_started')) return 'act4_intro';
        if (state.player.lvl >= 10 && this.hasFlag(state, 'act4_completed') && !this.hasFlag(state, 'act5_started')) return 'act5_intro';
        return null; // No pending beat — continue free roam
    },

    // Ensure story state never collapses, healing missing story links/flags automatically
    validateCurrentState(state) {
        if (!state) return;
        if (!state.storyFlags) state.storyFlags = {};
        
        // Healing rules for progressive story integrity
        if (state.player.lvl >= 3 && !state.storyFlags['womb_completed']) {
            state.storyFlags['womb_completed'] = true;
        }
        if (state.player.lvl >= 6 && !state.storyFlags['act2_started']) {
            state.storyFlags['act2_started'] = true;
            state.storyFlags['harun_met'] = true;
        }
        if (state.player.lvl >= 9 && !state.storyFlags['act3_started']) {
            state.storyFlags['act3_started'] = true;
            state.storyFlags['act3_mirror_completed'] = true;
        }
        if (state.player.lvl >= 10 && !state.storyFlags['act4_started']) {
            state.storyFlags['act4_started'] = true;
            state.storyFlags['act4_completed'] = true;
        }
        
        // Check active node integrity
        if (state.narrative_node && state.narrative_node !== 'hub' && !this.get(state.narrative_node)) {
            console.warn(`Healing narrative: Node '${state.narrative_node}' missing. Resetting to hub.`);
            state.narrative_node = 'hub';
        }
    },

    // Unlock a region in the LORE data
    unlockRegion(regionId) {
        if (window.LORE?.REGIONS[regionId]) {
            window.LORE.REGIONS[regionId].unlocked = true;
        }
        if (typeof state !== 'undefined' && state.unlockedRegions && !state.unlockedRegions.includes(regionId)) {
            state.unlockedRegions.push(regionId);
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
                // Execute choice onEnter callback if present
                if (c.onEnter) c.onEnter(state);

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
        title: 'الابتلاء والفتنة الكبرى',
        requiredStage: 6,
        requiredFlag: 'act2_started',
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `مبقتش لاقي الست شهرزاد عند النافورة والماية الجارية زي عادتها.

لاقيتها عند البوابة الغربية للمدينة، واقفة بوقار بتبص برة ناحية الصحراء والرمال البعيدة. الأفق كان بيلمع ويتموج بنور بنفسجي غريب مش طبيعي بيهز السما.

"البلا بدت علاماته والشرور طفحت،" قالتها من غير ما تلف وتبص وراها. "الخالد الساقط المكسور مبقاش مستخبي خلاص. كان عايز ينشر سمومه وظلاله بالكامل الأول في جذور الواحة والبلاد — عشان يضمن إن لما يكشف نفسه، تكون الصومعتين والطرفين منقسمين وبيتخانقوا وميقدروش يتحدوا ضده."

وبصتلك أخيراً. ملامح وشها بانت عليها حاجة غريبة... تعب وأرق وقلق شديد على الناس.

"في رفيق ليك وصاحب عزيز في خطر كبير دلوقتي. الخالد الساقط بيستهدف القلوب — وهيحاول يستعمل الناس اللي بتودهم وتحبهم كرهائن أو أسلحة ضد تركيزك وتدريبك ومقاومتك."

"والطريق اللي لازم تمشيه بيمر من بحر النور اللجي. ده المكان الوحيد اللي الباب فيه بين جبل الطور ورمال الربع الخالي رقيق جداً وينفع تعدي منه بالنفس والجسد."

ومدت إيدها وادتلك جواب مقفول بختم شمع أزرق أثري.

"ده من المرشد الخالد الجليل. ظهر الصبح فجأة عندي في الخلوة. وقالي أديهولك أول ما تيجي وإنك هتفهم معناه لوحدك يا بطل."

الجواب كان فيه سطر واحد مكتوب بخط عربي شريف وواضح: 'الجدار الذي أردت هدمه يحمل كل شيء.'`,
        choices: [
            { text: 'اتجه نحو البحر اللجي العظيم', next: 'act3_sea_crossing', karmaChange: 0, unlockRegion: 'abyssal_sea' },
            { text: 'ابحث عن رفيقك الأول واحمه أولاً', next: 'act3_companion_danger', karmaChange: 3 }
        ],
        storyFlag: 'act3_started'
    },

    act3_companion_danger: {
        id: 'act3_companion_danger',
        act: 3,
        speaker: 'ديوان الفتوة',
        narration: `لاقيت صاحبك ورفيقك العزيز في حالة عمرك ما شفته فيها قبل كده. محاصر... ومرعوب. وراه، مرسوم بطاقة بدنية سودة وظلام على جدار البستان، رمز وتوقيع الخالد الساقط المكسور.

"جالي في عز الليل وبث في قلبي الوجع،" رفيقك قال وصوته بيترعش من الخوف. "كان عارف أسرار. أسرار عمري ما حكيتها لكائن، حاجات كنت خايف أواجه بيها نفسي وعقلي."

"وقالي إنك هتفشل في طريقك وهتهلك في الفجوة. وإن كل بطل حاول يقف قدامه اتحول لأداة دمار ضد الناس اللي كان بيحاول يحميهم بالوفاء."

وبص في عينك بدموع وخشية، وتحت الدموع دي بانت لمحة صدق وعزيمة عظيمة. "سابلي رسالة ليك وقالي أوصلهالك: تعال لبحر النور اللجي. لوحدك. وإلا هبدأ بالناس الغلابة والرفاق اللي ملهمش حول ولا قوة هنا."`,
        choices: [
            { text: '⚔️ "سنذهب معاً. لن أسمح لأي أحد بتهديد أهلي بمفرده."', next: 'act3_sea_crossing', karmaChange: 5, storyFlag: 'companion_protected' },
            { text: '🛡️ "ابقى هنا. سأذهب بمفردي وأضع حداً لهذا الخراب."', next: 'act3_sea_alone', karmaChange: 0 }
        ]
    },

    act3_sea_crossing: {
        id: 'act3_sea_crossing',
        act: 3,
        speaker: 'السندباد البحري الأسطوري',
        speakerSprite: 'assets/sinbad.png',
        narration: `السندباد البحري واقف مستنيك على الشط بالظبط — كأنه كان عارف بميعادك وقدرك.

"أنا عارف النظرة دي كويس،" قال بضحكة وبص لرجاله والسفن. "دي النظرة اللي بتيجي للراجل لما يعوز يعدي بحر مستحيل يعديه مخلوق فاني." وشاور على بحر طاقة التركيز والأنوار الهائج قدامكم. "الرحلة السابعة مموتتنيش في أطراف الأرض. وبحر مانا الأرواح ده مش هيموتني برضه."

"غالباً يعني بالهمة والبركة."

العدية والعبور أخدت تلات أيام كاملة. بحر النور اللجي مش شبه أي بحر شفته في حياتك — مانا التركيز الصافية السايلة، ألوانها بتتموج وتتغير بنقاء، وجواها ذكريات هائمة لأبطال وسالكين قدام غرقوا ودابوا في مقامات الحقيقة والشك.

السندباد كان بيقود السفينة بالفطرة والأناشيد والمواويل القديمة والخبرة.

وفي اليوم التالت، شفته بعينك: الحاجز النوراني العظيم. جدار شاحب بيلمع بيتقابل فيه مقامات جبل الطور وزوايا الربع الخالي ومبيقدروش يندمجوا بالكامل.

والخالد الساقط المكسور واقف مستنيك هناك على الناحية التانية بالظبط بهدوء مميت.`,
        choices: [
            { text: 'اعبر نحو ساحة المواجهة الحاسمة', next: 'act3_fallen_confrontation', karmaChange: 0, unlockRegion: 'abyssal_sea' }
        ]
    },

    act3_fallen_confrontation: {
        id: 'act3_fallen_confrontation',
        act: 3,
        speaker: 'الخالد الساقط المكسور',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `شكله شبه الفقهاء والعلماء الحكماء. دي كانت أكتر حاجة غريبة ومربكة في اللقاء.

رجل لابس جلابية مقطعة وقلادة خشبية للتركيز متشابكة بين صوابعه وصوابع إيده، كأنه مش قادر يقرر يتخلى عن أنهي مسار وعقيدة فيهم. عنيه بلون البرزخ نفسه — نورين مختلفين بيحاولوا يقفوا في نفس المكان بالظبط ويحرقوا بعض.

"أنت أصغر بكتير مما كنت أتخيل،" قال بصوت هادي ورايق تماماً... هدوء يرعب ويهز الثقة. "دايماً بيبعتوا الصغار اللي لسة فيهم حماسة. الكبار والفرسان العواجيز عارفين كويس إن الموت والهلاك مستنيهم هنا."

"أظن إنك عارف مين أنا. وعارف أنا بحاول أعمل إيه بالظبط وعذابي."

"أنا مش شرير ولا قاسي يا بني. أنا عايزك تفهم ده بقلبك. أنا مبدمرش من كتر الكره والغل. أنا بدمر لأني قعدت ألف سنة كاملة مع حقيقتين وصومعتين شيوخي قالولي إنهم مستحيل يعيشوا مع بعض في نفس الدنيا — ووجع صراع الشك والجمع بينهم كان أصعب وأقوى من أي عذاب شفته أو هشوفه."

وبص في عينك بلمحة أمل خافتة وشفافة.

"قولي إن كلامي وعذابي ده غلط. لو تقدر. بقالي ألف سنة مستني بطل سالك يجي ويقولي إني غلطان ويثبتلي ده بقلبه وجسده وتركيز وهمةه."`,
        choices: [
            { text: '"التشي والتوحيد ليسا ضدين، كلاهما يشير إلى نفس الحقيقة اللامتناهية."', next: 'act3_philosophical_resolution', karmaChange: 15 },
            { text: '"ألمك حقيقي يا مرشدنا، لكن تدمير الواحة ليس حلاً وعلاجاً."', next: 'act3_empathy_path', karmaChange: 8 },
            { text: '⚔️ "لقد آذيت الكثير من الأبرياء يا خالد! هذا الجنون سينتهي الآن!"', next: null, triggerCombat: 'fallen_immortal_patriarch', karmaChange: -3 }
        ],
        storyFlag: 'fallen_immortal_met'
    },

    act3_philosophical_resolution: {
        id: 'act3_philosophical_resolution',
        act: 3,
        speaker: 'الخالد الساقط المكسور',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `وقف في مكانه ومتحركش تماماً.

الضوء النوراني وراه اهتز وفضل يتردد ويتموج بذبذبات رايقة.

"...قول الكلام ده تاني كدة بكل وضوح."

قولتهاله تاني، بس بنبرة وتجلي مختلف. كلمته عن مقامات السلوك والمانا كأنها النسيج والوجود والوعي للي خلق الدنيا. ونور التوحيد كأنه المصدر والواحد الأحد اللي خرج منه النسيج والأنوار دي كلها ببركته وقدرته. مش متناقضين. ولا متوازيين حتى. واحد هو اللحن؛ والتاني هو العازف وخالق اللحن العظيم.

شيء اتكسر في ملامح وشه المجهدة الحزينة. مش انكسار ذل ومهانة. انكسار نور وشروق — كأن ضوء الفجر طلع فجأة بعد ليل طويل من الكوابيس.

"أنا حاولت أوصل للتركيز وهمة ده بقالي ألف سنة،" قال بصوت خافت كأنه همس طالع من أعماق قلبه. "بس مكنتش قادر أوصل لوحدي من غير رفيق وسالك أمين يوجه بصيرتي."

طاقة الظلام والفساد والسموم بدأت ترجع وتدوب في الهوا بسلام.

"أنا... أقدر أوقف. أقدر أمنع انتشار السموم والفساد في الواحة. بس اللي اتسم وتلوث هيحتاج وقت وجهد كبير عشان يشفى بالبركة والأنوار. وأنا..." وبص لإيديه بحيرة وتوبة. "أنا هحتاج مكان يؤويني ويعلمني. مقدرش بكل بساطة أختفي من الوجود كأني مكنتش."`,
        choices: [
            { text: '"قلعة قمة اليشم ومسار التشي يمكن أن تفتح أبوابها لاستقبالك وتوبتك."', next: 'act3_redemption_jade', karmaChange: 5, storyFlag: 'fallen_redeemed' },
            { text: '"فرسان الهمة والرهبان يمكن أن يجدوا لك مكاناً لتأملك."', next: 'act3_redemption_sufi', karmaChange: 5, storyFlag: 'fallen_redeemed' },
            { text: '"واجه عواقب أفعالك أولاً، ثم نتحدث عما سيأتي بعد ذلك."', next: 'act3_redemption_both', karmaChange: 10, storyFlag: 'fallen_redeemed' }
        ]
    },

    act3_empathy_path: {
        id: 'act3_empathy_path',
        act: 3,
        speaker: 'ديوان الفتوة',
        narration: `مردش عليك في ساعتها. شفته بعينك وهو بيحارب عادات وأفكار ألف سنة كاملة، وعزم خطة مرسومة ومبنية بقالها قرون في قلبه وعقله.

"الخوف والوجع كعذر للدمار والخراب،" قال أخيراً بحزن وتنهيدة طويلة. "أنا قولت لنفسي الكلام ده كتير. وعارف إنه حقيقي برضه للأسف."

مستسلمش ولا ساب سيفه بالكامل. بس حركته وبطشه هديوا بكتير.

"لو تقدر تثبتلي — مش بالكلام، بالفعل والبرهان القاطع — إن التعايش والتوازن ممكن بجد بين القوى. لو قدرت توصل للمحكمة السحرية العليا وتعقد صلح تاريخي وأمني بين صاحب عرش جبل الطور وشيوخ الأبطال بالكامل..."

"ساعتها بس أنا هقف وأعلن توبتي. وهقضي اللي فاضل من عمري الفاني بحاول أصلح كل اللي بوظته ودمرته في قلوب وعوالم الناس."

استسلام مشروط بعهود شاقة وأعمال عظيمة. أصعب وأقوى أنواع العهود البدنية.`,
        choices: [
            { text: 'اقبل العهد والشرط البدني — وانطلق نحو المحكمة العليا وبوابة الخلود', next: 'act4_intro', karmaChange: 5, storyFlag: 'fallen_conditional', unlockRegion: 'brass_city' }
        ]
    },

    // ========================================================
    // ACT IV — THE CELESTIAL GATE (Stages 10-12)
    // Theme: Power. The player transcends mortality.
    // ========================================================

    act4_intro: {
        id: 'act4_intro',
        act: 4,
        title: 'بوابة المحكمة العليا وأقاليم الصحراء',
        requiredStage: 9,
        requiredFlag: 'act3_started',
        speaker: 'الست نون المباركة (Nuwa)',
        speakerSprite: 'assets/nuwa.png',
        narration: `ظهرت قدامك فجأة من غير أي مقدمات أو صوت — واقفة بوقار وهيبة في وسط المدينة النحاسية الأسطورية، كأنها واقفة في المكان ده من عشرة آلاف سنة لحماية السر.

"يا ابني،" صوتها كان شايل هيبة وجلال تاريخ الأرض والجبال الشامخة. "إنت عملت معجزة مكنتش أتخيلها أبداً في حكاياتي. وصلت للشخص المكسور وصحيت جواه خيط نور وتركيز وهمة كان مدفون وضاع في بحار الفتنة."

"المحكمة السحرية العليا وعروش الملوك مش هيستقبلوك بالساهل والترحاب. صاحب عرش القلعة وديوان راجل فخور وعنيد ومبيحبش يبان ضعيف أو مأزوم قدام عساكره. وشيوخ الزوايا حذرين جداً ومبيثقوش في الأغراب والسالكين الجداد بسهولة."

"إنت محتاج تثبت وتفرض وجودك وهيبتك عليهم. مش بالقوة والبطش بالسيف بس — إنت كنت تقدر تعمل ده من فصول فاتت. إنما بالحكمة والفهم والبركة وبياض النية."

وحطت كف إيدها الدافية على صدرك وجنب قلبك بالظبط. حسيت بذبذبات المانا والأنوار بتتوزع وتترتب جوة قنواتك البدنية — ارتقاء بدني عظيم وانفتاح مقامات كان شبه مستحيل توصله في سنك ومقامك ده بجهدك الفردي.

"أنا بديك نفحة وبركة البداية والخطوة الأولى. والباقي كله عليك وعلى تركيز وهمةك وسلوكك."

وبصت في عينك بتركيز وحب كبير قبل ما تتلاشى.

"أنا عارفة النهاية والرواية هتقفل على إيه. مش هقولك طبعاً عشان متكسلش. بس هقولك حاجة واحدة بس تفضل حفرها في عقلك وقلبك: كل نسخة من القصة دي بيفضل فيها خير وحياة ونور للناس... إنت بتختار فيها نفس الاختيار بالظبط في اللحظة الحاسمة الأخيرة. في كل مرة بالملي."`,
        choices: [
            { text: 'ادخل المحكمة السحرية العليا وقاعة الملوك', next: 'act4_celestial_gate', karmaChange: 0, unlockRegion: 'celestial_court' }
        ],
        storyFlag: 'act4_started'
    },

    act4_celestial_gate: {
        id: 'act4_celestial_gate',
        act: 4,
        speaker: 'ديوان الفتوة',
        narration: `المحكمة السحرية العليا وقاعة الملوك مبنية فوق السحاب الأبيض، بتوصلها بسلالم من ضوء النجوم المعصور ببركة سماوية وهيبة بدنية. قاعة صاحب عرش القلعة وديوان اليشمية على الشمال. وقاعة شيوخ الطرق والأبطال الأحرار على اليمين.

الأبواب الكبرى للطرفين مقفولة تماماً بالحديد والنحاس المقوى بأشعة المانا.

وفي النص بينهم، حارس سماوي ضخم من الجان المردة الأقوياء بيقفل الممر — مش بعداوة وغضب، بس بهيبة ومنع مطلق ومستحيل يتزحزح من مكانه. ورا البوابات، تقدر تسمع همس وخناقات شديدة ومخيفة بين الزعماء والفرسان.

"ديوان فرسان جبل الطور وجيش اليشم مش هيستسلم ولا هيخضع لأي شروط."
"رابطة أبطال الربع الخالي مش هيمضوا على اتفاق وهما في موقف ضعف أو تهديد."

الحارس بصلك بوقار وصوت جهوري. "أثبت إنك سالك شجاع وتستاهل تدخل قاعة الحكم. الأبواب دي مش هتتفتح وتخضع غير للفرسان اللي يثبتوا نفسهم بالدم والتركيز والاختبار."

في اختبار قاسي ونزال موت مستنيك ليثبت معدنك.`,
        choices: [
            { text: '⚔️ Face the Heavenly Gauntlet', next: null, triggerCombat: 'heavenly_guard', karmaChange: 0 }
        ]
    },

    act4_after_gauntlet: {
        id: 'act4_after_gauntlet',
        act: 4,
        speaker: 'صاحب العرش وصاحب القلعة وديوان',
        speakerSprite: 'assets/corrupted_taoist_1778872375046.png',
        narration: `البوابتين الكبار اتفتحوا في نفس اللحظة بهزّة كبيرة في الأرض وجدران القصر السحابي.

صاحب عرش القلعة وديوان وشيخ رابطة أحرار الربع الخالي واقفين بيبصوا لبعض بوقار وهيبة وعداوة قديمة في قاعة واسعة كأنها بتسع الكون كله بقوتهم وهيبتهم البدنية العظيمة.

الاتنين لفو وبصوا عليك إنت بالذات وباهتمام شديد لما دخلت الساحة.

"يا فاني سالك،" صاحب العرش قال وصوته قوي ومزلزل زي خبط اليشم النوراني الفخم. "إنت ارتقيت وطلعت لمقام ومكان كان المفروض يدمر قنواتك البدنية ويفنيك تلات مرات على الأقل. الشجاعة والتركيز ده بيدوك الحق الكامل إنك تقف وتتكلم بوقار قدام عروشنا."

وسكت لثواني وبص للشيخ التاني.

"قول كلامك إذن يا بطل. قول اللي صعدت الجبال وعبرت البحار والمخاطر من أجله عشان تقوله وتفرضه علينا."`,
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
        title: 'الخالد ذو البصيرة وجسر العهد',
        requiredFlag: 'reached_celestial_court',
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `لاقيتها واقفة جنب النافورة والماية الجارية تاني في واحة القوافل الكبرى. شهرزاد كانت دايماً هتبقى واقفة في المكان ده بالظبط في اللحظة الحاسمة دي عشان تسجل العهد في حكاياتها.

"عملتها ونجحت يا بني،" قالت ونبرة صوتها فيها دهشة وفرحة صادقة. "أنا حكيت القصة دي بألف رواية ونسخة طوال عمري. وفي أغلبهم كانت بتنتهي بخراب ودمار مختلف ودم كتير."

العالمين مماتوش ولا اندمجوا ببعض — هما أصلاً مكانش ليهم يندمجوا كطبيعة أرض. بس الحيطان والحدود اللي كانت بينهم بقت بوابات حقيقية وسهلة، بوابات ليها أوكر ومقابض بقوتك وتركيزك الصافي.

صاحب العرش اعترف وصدق بوجود سر سامٍ مبارك ونور أسمى برة قصر جبل الطور وجيش اليشم بتاعه. وشيوخ الأبطال أقروا وصدقوا إن طاقة التركيز وتأمل السلوك مش ضد التركيز والتناغم والاتحاد.

والخالد الساقط المكسور — لما انزاح عنه حمل ووجع ألف سنة من الشك والظلال والخراب — بكى دموع فرحة وراحة حقيقية في خلوته. ودي كانت حاجة محدش يتخيلها.

وإنت. واقف في واحة القوافل والمدينة الكبرى، بالظبط في النقطة اللي بدأت منها مشوارك، بس إنت دلوقتي مش نفس الشخص البسيط اللي وصل هنا أول يوم برجليه شايل سلاحه البسيط.

"في اسم ولقب جديد شيوخ العالمين وكبار القلاع ودواوين بيتخانقوا عليه عشان يلقبوك بيه ويسجلوه في دفاترهم،" شهرزاد قالت بابتسامة دافية. "الخالد ذو البصيرة وجسر العهد. السالك البطل اللي بينتمي لكلا العالمين وبيقدر يعدي ويمشي بينهم بسلام وبركة وأمان للناس."

وبصت في عينك بتقدير وحب كبير.

"اللقب والعرش ده ملكك لو حابب تتربع عليه وتخدم الناس وتدير شؤون عوالمنا. أو تقدر بكل بساطة ترجع لبيتك وناسك الغلابة وتعيش في هدوء كإنسان بسيط. الحالتين نهايات عظيمة وصادقة لقصتك."`,
        choices: [
            { text: '🌉 Accept: Become the Bridge Immortal', next: 'act5_ascension_bridge', karmaChange: 0 },
            { text: '🏠 Return home — the world is saved, that is enough', next: 'act5_humble_end', karmaChange: 5 }
        ],
        requiredKarma: 40
    },

    act5_demonic_ending: {
        id: 'act5_demonic_ending',
        act: 5,
        title: 'ملك الظلال والعدم المطلق',
        requiredFlag: 'reached_celestial_court',
        speaker: 'ديوان الفتوة',
        narration: `قصر المحكمة السحرية العليا بيتحرق بلهب أسود قاتم بيمحي الحجر.

إنت مجيتش هنا عشان تتفاوض أو تعمل صلح هش أو ترجو السلام. إنت جيت لإنك فهمت واستوعبت اللي الخالد الساقط المكسور فهمه زمان: إن القلاع ودواوين والعهود دي كلها مليانة طمع وغرور ونفاق، وإن مفيش حد هيصلح الكون ده من برة بالرجاء والأدعية الضعيفة.

إذن إنت قررت تصلحه وتفرضه بقبضة إيدك الدمشقية وسيفك وقوتك الغاشمة من جوة وتعتلي العرش.

صاحب العرش هرب بجلده وجيش اليشم اتفرتك وتشتت. وشيوخ الأبطال اختفوا في رمال الصحراء خايفين. الفراغ والعرش الفاضي اللي سابوه وراهم كان عظيم ومهيب — وإنت واقف لوحدك في وسطه وسيفك بيسيل منه النور المظلم والشرر الأسود.

واحة القوافل والمدينة الكبرى بقت ملكك وتحت طوعك بالكامل دلوقتي. العالمين هيدفعوا الجزية والولاء ليك ورجلك فوق كتافهم أو يواجهوا الفناء والعدم والقتل.

دي مش النسخة ولا النهاية اللي الست شهرزاد كانت بتحاول توديك وتوجهك ليها في حكاياتها الطيبة. قابلتها بعدين، عند أطلال النافورة والماية الجارية اللي اتكسرت واتدمرت بالكامل بقوتك وبطشك.

بصت عليك لثواني طويلة وصامتة ونظراتها فيها حزن وأسى لا ينتهي وصدمة.

"أنا حكيت النسخة دي قبل كده للناس،" قالت بصوت ضعيف وباهت ومرعوب. "النسخة دي دايماً أقصر بكتير من الروايات التانية. مش لإنها بتخلص بسرعة وبس. لإن القصص والروايات اللي بتتحكي عن الخوف والرعب دايماً أقصر بكتير من القصص والروايات المليانة أمل وتفاؤل بالخير والبركة الدائمة."

ولفت ومشيت بعيد عنك في صمت وعينيها مدمعة على حال البلاد.

إنت كسبت وحكمت كل شيء ودمرت أعداءك. بس سكون وبرودة القوة المطلقة والعرش الأسود طلع صوته أعلى وأوحش بكتير مما كنت تتخيل في خلوتك البدنية.`,
        choices: [
            { text: 'احكم القلاع والأراضي الصحراوية الموحدة كحاكم مظلم مهيب', next: null, returnToHub: true }
        ],
        requiredKarma: -40
    },

    act5_ascension_ending: {
        id: 'act5_ascension_ending',
        act: 5,
        title: 'الارتقاء الأسمى والتوحيد المطلق',
        requiredFlag: 'reached_celestial_court',
        speaker: 'المرشد الخالد الجليل',
        speakerSprite: 'assets/al_khidr.png',
        narration: `المرشد الخالد ظهرلك لآخر مرة ببهائه ونورانيته. هو دايماً بيظهر في اللحظات العظيمة الحاسمة اللي زي دي للسالكين الصادقين.

"قدامك اختيار وقدر معطاش لأي سالك قبلك في عهد البشر. مش في حدود ذاكرتي الطويلة — وذاكرتي طويلة جداً وشافت أجيال وأساطير وفرسان."

"الملوك والفقهاء في القلاع ودواوين والزوايا عايزينك تبقى حاجة تخدمهم وتثبت ملكهم. رمز ليهم. بطل حامي لسيوفهم. جسر يربطهم. أو ملك يحميهم بقوته وعساكره."

وبص في عينك بعينين نورانية شافت ونورت الكون كله من بدايته ببركة مسار الخلود.

"بس في اختيار تالت وعهد أعظم بكثير. ورا كل المسميات والقلاع ودواوين والأساطير والحدود البشرية الفانية. النقطة والبرزخ اللي بتدوب فيها طاقة المانا ونور الاتحاد في سر سامٍ مبارك ملوش أي كلمة أو اسم بشري ينطق بيه اللسان."

ومد إيده الدافية النورانية السامية ليك بابتسامة راضية.

"العهد ده محتاج منك تسيب وراك كل حاجة فانية. كل اسم وقبيلة ولقب تلقبت بيه. كل صاحب ورفيق وعلاقة أرضية. وكل نسخة من نفسك بنتها في رحلتك وجهادك وسلوكك."

"أغلب السالكين والفرسان بيرفضوا العهد الأعظم ده وبيخافوا يسيبوا أساميهم وعروشهم الفانية. وأنا شايف إن الرفض هو الاختيار الصح والأحن ليهم. الدنيا محتاجة فرسان يفضلوا عايشين فيها عشان يعمروها بالخير والوفاء."

ووقف مستني ردك وعزيمة قلبك بكل سكينة وهدوء الحكماء.`,
        choices: [
            { text: '🌌 Take his hand — ascend beyond all names', next: 'act5_true_ascension', karmaChange: 0 },
            { text: '❤️ "No. The world needs me in it."', next: 'act5_righteous_ending', karmaChange: 10 }
        ]
    }
});

// ============================================================
// ACT V — FINAL ENDING NODES (completing the three paths)
// ============================================================
Object.assign(window.STORY.nodes, {

    act5_ascension_bridge: {
        id: 'act5_ascension_bridge',
        act: 5,
        speaker: 'ديوان الفتوة',
        narration: `اللقب والسيادة البدنية الكبرى اتقروا في كلا العالمين والعرشين في نفس اليوم، في نفس الساعة بالظبط، وبصوتين ولغتين متناسقين في نفس الوقت ببركة سامية عظيمة.

في ديوان فرسان جبل الطور: منادي العرش وصاحب ديوان فرسان جبل الطور قرأ اسمك ولقبك الخالد ذو البصيرة وجسر العهد قدام جيش اليشم والفرسان المجتمعين. واتختم على إيدك بختم نحاسي أثري مبارك — مش كرمز ملكية أو ولاء ليهم، كرمز للمرور العرشي والأمان الأبدي بين العالمين وسهولة السفر.

في زوايا الربع الخالي وطرق الفروسية والهمة: الشيوخ والأبطال الأحرار قرأوا اسمك ولقبك بخط عربي شريف ودعاء صادق، وصوتهم فيه خشوع ورضا بأقدار السلوك والهمة — القدر اللي كان دايماً هيوصل ويتحقق، حتى لما كانت السكك مش باينة والرمال مغطية الطريق بالكامل.

إنت واقف دلوقتي في البرزخ بين كلا العهدين والمحفلتين، لا تنتمي بالكامل لأي طرف، ومقبول ومعظم ومبارك من الطرفين بالحب والوفاء والبركة.

الست شهرزاد لاقتك وقت المغربية عند النافورة والماية الجارية اللي رجعت تتدفق بسلام ونور بعد طول كدر. ولأول مرة في حياتها وحكاياتها، مكنتش بتحكي قصة للناس. كانت قاعدة في هدوء وسكينة تامة وسعيدة.

"كل شيء اكتمل وقفل بالخير والبركة،" قالت بابتسامة صافية.

"كل الحمد والثناء لمسار الخلود السامي."

"أنا حكيت ورويت القصة دي ألف ومرة طوال حياتي يا بطل،" قالت بصوت حنين ودافئ. "بس دي أول مرة في تاريخ الحكايات تقفل الرواية والنهاية هنا بالجمال والبركة والنور ده."

وبصت في عينك بفضول وبراءة الحكواتية الأبدية.

"هتعمل إيه بعد كدة يا بطل القلوب؟"

وده كان أول سؤال تسألهولك في حياتها وهي فعلاً ميعرفش إجابته ولا متوقعاه منها.

واحة القوافل والمدينة الكبرى تحت رعايتك وأمانك بالوفاء. الطرق والعهود بين العوالم مفتوحة بالخير والبركة. السلوك والجهاد لسة مستمر — بس معناه ومقامه اتغير للأبد لأعلى الدرجات الرفيعة.`,
        choices: [
            { text: 'الاستمرار في الرحلة — العالم مفتوح بالكامل أمامك بالخير', next: null, returnToHub: true, storyFlag: 'ending_bridge' }
        ]
    },

    act5_humble_end: {
        id: 'act5_humble_end',
        act: 5,
        speaker: 'شهرزاد',
        speakerSprite: 'assets/sufi_mystic_1778872363338.png',
        narration: `\"إنت راجع لبيتك وأهلك وناسك الغلابة بسلام.\"

قالتها شهرزاد وهي بتبتسم وبتبصلك، مش كسؤال شك، كعزيمة شافتها في عينك المليانة حنين وهدوء وسكينة.

إنت أنقذت العالمين من الفناء والضياع. وعقدت صلح تاريخي وأمني عظيم كبار الحكماء هيفضلوا يدرسوه ويتخانقوا في معناه لقرون طوال. ووقفت لوحدك بطل شجاع قدام الخالد الساقط المكسور واخترت طريق الفهم والرحمة بدل السيف والدم والتدمير. وطلعت لحد قصر المحكمة السحرية العليا وقولت كلمة الحق اللي غيرت القلوب وفتحت الأبواب المغلقة.

ودلوقتي كل اللي بتتمناه وقلبك عايزه هو إنك ترجع لبيتك البسيط وناسك وتعيش في هدوء وسكينة كإنسان عادي.

شهرزاد وقفت من على دكة النافورة وبصت للأفق البعيد براحة.

"أنا عايزة أقولك حاجة تفضل فخورة بيها تركيزك وهمتك وجسدك،" وقالت بصوت حنون، "في كل الروايات والنسخ اللي حكيتها للناس عن البطل ده — اللي البطل بيختار فيها العرش والقوة المطلقة والبطش، واللي بيرتقي فيها ورا المسميات وينسى الدنيا تماماً، واللي بيفشل ويموت فيها — النهاية الهادية والبسيطة بتاعتك دي هي أندر وأجمل نهاية على الإطلاق في سجلات الخلود."

ومالت براسها بوقار حكيم. "أغلب السالكين والفرسان لما بتجيلهم فرصة يبقوا أساطير وتتكتب أساميهم بدهب وتيجان، بيجروا عليها ويعموهم الطمع والغرور. والقلة النادرة اللي بترفض وتفضل ترجع للناس والهدوء والزهد الصادق..."

وسكتت لثواني وابتسمت بصفاء ونور.

"القلة دي هما الأبطال الحقيقيين اللي واجهوا وعارفين نفسهم كويس بجد ومش محتاجين تيجان ولا ملوك تثبت ده."

ومدت إيدها وطلعت من جلبابها تميمة صغيرة وجميلة مصنوعة من اليشم والذهب — مش الختم السياسي لجبل الطور، ولا رتبة الأبطال. حتة يشم خضراء بسيطة وجميلة، بس فيها شرخ وكسر قديم ومتصالح ومتعالج بماء الذهب الخالص النقي اللامع.

فن الكينتسوجي الأثري المبارك. فن تصليح الكسور بالذهب النقي. عشان يخلي الحتة اللي اتكسرت زمان هي أجمل وأنور وأقوى حتة في الشيء كله بقوته وعزيمته وصبره.

"عشان رحلتك لبيتك وناسك بسلامة وحفظ مسار الخلود،" قالت وهي بتقدمهالك باحترام، "أياً كان الطريق والتراب اللي هتمشي عليه خطواتك المباركة."`,
        choices: [
            { text: 'اقبل العهد وارجع لديوانك وقصرك بسلام', next: null, returnToHub: true, storyFlag: 'ending_humble' }
        ]
    },

    act5_true_ascension: {
        id: 'act5_true_ascension',
        act: 5,
        speaker: 'المرشد الخالد الجليل',
        speakerSprite: 'assets/al_khidr.png',
        narration: `مسكت إيده النورانية السامية الدافية.

الإحساس مكنش فيه أي استعراض قتالي ولا دوشة بصرية ولا برق. مفيش انفجار أنوار ولا رعد الكهوف بيهز القصر السحابي. النافورة والماية الجارية في واحة القوافل لسة شغالة وبتنزل ميتها بسلام وهدوء مبارك. في تاجر غلبان بيتخانق مع زبون على تمن كيس بلح وسمن في الشارع ورا السور. في طفل صغير بيضحك ويلعب في حضن أمه البعيد الهادي.

وإنت...

إنت بقيت في كل التفاصيل البسيطة دي بالكامل. وفي نفس الوقت مفيش أي حاجة فانية ولا شك لمساك. إنت مختفيتش من الدنيا — إنت اتوزعت وبقيت بركة ونور ورضا بيسري في عروقها كلها بفضل مسار الخلود. مقامات المانا والأنوار ونور الاتحاد عمرهم ما كانوا هيدوبوا في كلمة أو اسم بشري واحد فاني. هما دابوا في سر عظيم وسلطان ملوش كلمة تنطق، وإنت بقيت الفراغ والبرزخ النوراني الباقي اللي السر ده عايش وساكن فيه للأبد بالبركة والرضوان.

المرشد الخالد ساب إيدك وابتسم بوقار وهيبة ونور صافي يملأ وجودك بالكامل.

وبصلك وقال بصوت دافي: "قولتلك إن أغلب الأبطال والسالكين بيرفضوا العهد الأعظم ده وبيخافوا يسيبوا أساميهم وعروشهم الفانية خوفاً من المجهول."

"وليه إنت مر فضتوش يا شيخنا الجليل ويا مرشدنا الخالد؟" سألته بهمس حنين طالع من عروق قلبك ونورك الجديد الباقي.

"أنا رفضته زمان،" وبص للأفق البعيد بسلام دافئ ونور عظيم، "في المرة الأولى لما كنت لسة مبتدئ وبحاول أثبت نفسي."

ومشي بهدوء وسكينة في طريق الصحراء الشاسعة، وإنت بقيت الرمال والضياء والأمان في كل خطوة بيمشيها في طريق الخلود وحفظه.

الست شهرزاد شربت كوباية الشاي بالنعناع لآخر نقطة وحطت الكوباية النحاس على الطربيزة جنب النافورة وبستان البركة الواسع. وبصت حواليها بهدوء ورضا — مش على حاجة محددة، بصت على الهوا والرمال والورد والناس بابتسامة رايقة وصافية وسعيدة.

"يا سلام على كرم الأقدار،" قالت بصوت واطي وناعم.

وشالت كشكول حكاياتها الأثري وبدأت تكتب وتروي قصة وعهد جديد تماماً للناس والفرسان. الكلمات الأولى والبداية كانت مألوفة ودافية وبتتحب. والنهاية الكبرى الأبدية، ولأول مرة في تاريخ ألف ليلة وليلة... هي كمان مكنتش عارفاها وسايباها لبركة ونور الأقدار العظيمة الحبيبة من غير قيود.`,
        choices: [
            { text: 'اندمج وكن جزءًا خالدًا من هذا العالم العظيم', next: null, returnToHub: true, storyFlag: 'ending_ascension' }
        ]
    }
});

// ============================================================
// BALANCE CONSTANTS — Final pass on all stats
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

    // XP rewards — scales with enemy level
    xpForEnemy: (enemyStageMin) => Math.floor(30 + (enemyStageMin * 18)),

    // Karma thresholds
    karmaLabels: [
        { min: 60,  max: 100,  label: 'فارس النور الصالح',     color: '#d4af37' },
        { min: 25,  max: 59,   label: 'الفارس الصالح المعتدل', color: '#00e5a0' },
        { min: -24, max: 24,   label: 'السياف الهائم المعتدل',      color: '#8a9ab0' },
        { min: -59, max: -25,  label: 'الباحث في دروب الظلال',     color: '#c8a060' },
        { min: -100,max: -60,  label: 'ملك الظلال والعدم المطلق',    color: '#8a1c1c' }
    ],

    getKarmaLabel(karma) {
        return this.karmaLabels.find(k => karma >= k.min && karma <= k.max)
            || { label: 'مقام مجهول', color: '#888' };
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

const STORY_ENGINE_HELPERS = {
    getCurrentAct(state) {
        if (!state || !state.narrative_node) return 1;
        if (state.narrative_node === 'hub') {
            if (state.storyFlags?.['act5_started']) return 5;
            if (state.storyFlags?.['act4_started']) return 4;
            if (state.storyFlags?.['act3_started']) return 3;
            if (state.storyFlags?.['act2_started']) return 2;
            return 1;
        }
        const node = window.STORY ? window.STORY.get(state.narrative_node) : null;
        return node ? (node.act || 1) : 1;
    },

    getActProgress(state) {
        if (!state) return 0;
        const currentAct = this.getCurrentAct(state);
        
        // Map of key milestones/nodes by act to evaluate completion
        const actNodes = {
            1: ['womb_start', 'womb_birth', 'act1_intro', 'act1_scheherazade_meet'],
            2: ['act2_intro', 'act2_elder_zhao', 'act2_harun_crisis', 'harun_met'],
            3: ['act3_intro', 'act3_journey_start', 'act3_mirror_completed'],
            4: ['act4_intro', 'act4_siege_start', 'act4_completed'],
            5: ['act5_intro', 'act5_climax_start', 'ending_scene']
        };
        
        const nodes = actNodes[currentAct];
        if (!nodes) return 100;
        
        let completedCount = 0;
        nodes.forEach(nodeId => {
            if (state.history && state.history.includes(nodeId)) {
                completedCount++;
            } else if (state.narrative_node === nodeId) {
                completedCount++;
            } else if (state.storyFlags && (state.storyFlags[nodeId] || state.storyFlags[nodeId + '_completed'])) {
                completedCount++;
            }
        });
        
        const pct = Math.round((completedCount / nodes.length) * 100);
        return Math.min(100, Math.max(0, pct));
    }
}; 

window.STORY = Object.assign(window.STORY || {}, { STORY_NODES, ...STORY_ENGINE_HELPERS });
