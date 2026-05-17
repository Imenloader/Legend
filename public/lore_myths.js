// ============================================================
// LORE_MYTHS.JS — الأبطال والرفاق الأسطوريين وطبائع الأعداء
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

const MYTH_HEROES = {
    // ── أبطال الحيل والجسارة المغاوير ──
    odysseus: {
        id: 'odysseus',
        name: 'سنان العيار البصري',
        title: 'سيد الحيل ودهاء العيارين في بغداد',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_neutral',
        karmaRequirement: -20,
        affinity: 50,
        personality: 'cunning',
        description: 'عاش عشر سنين يحارب، وعشر سنين تايه في بحار الجن، ومع ذلك عرف يرجع لبلده وأهله بذكائه. سنان مبيعتمدش على السيف بس، عقله أشد وأقوى من أي شفرة حديد. وقف قدام الغيلان، وسمع نداء النداهة، ونجا بذكائه ودهاء العيارين.',
        dialogue: {
            greet: [
                '"أنا شفت وحوش تخلي أجرأ كوابيسك تترعب وتجري. امشي معايا وخلينا نكتشف أسرار العوالم دي."',
                '"العقل الذكي بيكسب معارك أكتر من عشرة آلاف سيف. افتكر ده دايماً لما العقبات تبقى مستحيلة."'
            ],
            battle_cry: ['"باسم الوطن والذكاء والحيلة! هجوووم!"', '"الراجل اللي بينجو من المحال بيبقى أخطر في كل مرة!"'],
            victory: ['"كل عدو بيقع في الآخر. الصبر هو أقوى سلاح عند العيارين."'],
            defeat: ['"حتى الشيوخ الأكابر بيتعبوا في الآخر. هنتراجع.. ونرتب الخطة الجاية."'
            ]
        },
        passiveBuff: {
            label: '+20% دنانير إضافية من كل المعارك (نهب العيارين)',
            effect: (state) => { state.player.gold = Math.floor((state.player.gold || 0) * 1.2); }
        },
        uniqueAbility: {
            name: "حيلة التمويه والعيارين",
            mpCost: 30,
            effect: 'bypass_social_gate',
            description: 'بكلام موزون وحيلة ذكية، تقدر تتفادى وتتخطى معركة كاملة في طريقك بنجاح.'
        }
    },
    achilles: {
        id: 'achilles',
        name: 'صخر الفارس المنيع',
        title: 'المغوار الفولاذي قاهر الجان والغيلان',
        origin: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'chaotic_good',
        karmaRequirement: -40,
        affinity: 50,
        personality: 'fierce',
        description: 'استحم في نبع الإرادة والخلود، فبقى جسده فولاذي ضد أي سيف أو خنجر، ومبيحركوش غير نخوة الشرف والجسارة. اختار يعيش حياة قصيرة مليانة بطولات وصيت في الملاحم، بدل ما يعيش طويل مغمور ومحدش يسمع عنه.',
        dialogue: {
            greet: [
                '"الصيت والبطولة! ده كل اللي بيهمنا. تفتكر رحلتنا دي تستحق يكتبوا عنها سيرة أسطورية؟ لو لأ، مليش مصلحة فيها!"',
                '"قالوا إني هموت شاب.. وأنا قلت — السيرة والبطولة هتعيش للأبد!"'
            ],
            battle_cry: ['"عشان البطولة! مفيش حد هيقف قدامنا!"', '"غضبي هو درعي وسيفي الفتاك!"'],
            victory: ['"ده اللي ربنا كاتبه لينا. النصر. دايماً النصر والتمكين!"'],
            defeat: ['"لسة.. الموت ملمسنيش كلي. لسة عندي جولات أثبت فيها شرفي ونخوتي!"']
        },
        passiveBuff: {
            label: '+25% هجوم، -15% دفاع (ثورة الجسارة والصلابة الفولاذية)',
            effect: (state) => { state.player.atk = Math.floor(state.player.atk * 1.25); state.player.def = Math.floor(state.player.def * 0.85); }
        },
        uniqueAbility: {
            name: "ضربة الصخرة الماحية",
            mpCost: 35,
            effect: 'triple_damage_stun',
            description: 'ضربة جبارة بتسبب تلات أضعاف الضرر وبتشل حركة العدو لدور كامل من الخوف.'
        }
    },
    // ── أبطال العهد والولاية الأسطوريين ──
    sigurd: {
        id: 'sigurd',
        name: 'فهد قاهر التنانين',
        title: 'فارس الغدران وصاحب سيف الجلال الروحاني',
        origin: 'celestial_court',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'lawful_good',
        karmaRequirement: 10,
        affinity: 50,
        personality: 'noble',
        description: 'استحم بدم تنين الجبل المبارك فكسب ملمساً لا يخترق وذكاء ولغة طيور الصحرا. عبر جدار نيران الجن، وشال سيف الجلال اللي قطع راس الغادرين. فهد هو قدوة الفرسان النبلاء في قمم الشرق الصامتة.',
        dialogue: {
            greet: [
                '"أنا واجهت تنانين الصحرا ومردة البحر. إيه اللي واقف قدامنا دلوقتي؟ وريني همتك."',
                '"القدر مكتوب عند ربنا، بس السيف في إيدينا. ياللا بينا."'
            ],
            battle_cry: ['"باسم الحق والعدل والنور السماوي!"', '"بسيف الجلال — موووت!"'],
            victory: ['"سقط التنين وعاد النور لربوعه. زي ما كل شر لازم ينتهي كدة."', '"الحمد لله.. طهرنا الأرض من وساوسهم."'],
            defeat: ['"حتى الفرسان بيقعوا.. بس مش للأبد. الروح هترجع أقوى."'
            ]
        },
        passiveBuff: {
            label: '+10 دفاع إضافي و +15% هجوم ضد الوحوش الأقوياء (جلد دم التنين)',
            effect: (state) => { state.player.def += 10; }
        },
        uniqueAbility: {
            name: "شفرة شق التنانين والبروق",
            mpCost: 40,
            effect: 'area_damage_or_bypass',
            description: 'ضربة قاطعة بتسبب ضعفين الضرر وبتتجاهل دروع وحصانة العدو بالكامل.'
        }
    },
    ali_baba: {
        id: 'ali_baba',
        name: 'علي بابا العيار',
        title: 'سيد الكنز الخفي وصاحب كلمة السر',
        origin: 'brass_city',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        alignment: 'chaotic_good',
        karmaRequirement: -60,
        affinity: 50,
        personality: 'cunning',
        description: 'عثر على مغارة دهب قطاع الطرق، وخرج منها حي وسليم. غلب الأربعين حرامي والمردة والقدر بذكائه وفطنته. علي بابا عارف إن الكنز الحقيقي مش الدهب اللي بتشوفه بعينك — الكنز هو اللي في عقول وقلوب الأصحاب والفرسان.',
        dialogue: {
            greet: [
                '"افتح يا سمسم! ها — بتشتغل في كل مرة. تعال يا شريكي خلينا ندور على المستخبي."',
                '"أنا سرقت من أربعين حرامي ومن أسياد الجن نفسهم. تفتكر كام عدو خايب هيوقفنا؟!"'
            ],
            battle_cry: ['"المباغتة هي أشد سيف!"', '"عمرهم ما هيشوفونا وإحنا جايين!"'],
            victory: ['"وبنختفي في ثانية قبل ما يعرفوا إيه اللي حصل أصلاً!"'],
            defeat: ['"آه.. يمكن نكون غلطنا في عددهم المرة دي."'
            ]
        },
        passiveBuff: {
            label: '+30% فرصة كسب غنائم إضافية نادرة (عين الحرامي الفطن)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "افتح يا سمسم",
            mpCost: 20,
            effect: 'reveal_all_enemy_moves',
            description: 'بيقرأ حركات وخطط ورموز العدو ويكشفها ليك بالكامل لبقية المعركة.'
        }
    },
    scheherazade: {
        id: 'scheherazade',
        name: 'شهرزاد راوية الأساطير',
        title: 'ناسجة الحكايات وألف ليلة وليلة المضيئة',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 20,
        affinity: 50,
        personality: 'wise',
        description: 'أنقذت نفسها وبلد كامل بكلامها وحكاياتها بس — حكاية ساحرة خلت الملك الجبار اللي كان بيقتل زوجاته الصبح يسيبها تعيش ألف ليلة وليلة. هي فاهمة وعارفة إن السرد والقصة هما أقوى سلاح في الدنيا.',
        dialogue: {
            greet: [
                '"كان ياما كان، في قديم الزمان.. سالك روحي افتكر إن رحلته ملهاش نهاية.. تحب نكمل حكايتك سوا؟"',
                '"كل معركة بنخوضها هي مجرد قصة جديدة. قولي — تحب قصتك تخلص إزاي؟"'
            ],
            battle_cry: ['"خلينا نكتب حكاية الناس تفتخر وتفتكرها!"', '"أحلى قصة هي اللي بتعيش بعد ما تخلص!"'],
            victory: ['"وانتصر البطل ورجع الحق لربوعه. كالعادة في كل حكاية طيبة."'],
            defeat: ['"...دي مجرد الضلمة اللي قبل الفجر. كل قصة حلوة لازم يكون فيها شوية عقبات ومحن."'
            ]
        },
        passiveBuff: {
            label: '+20 مانا روحية قصوى، وفتح حوارات ونتائج إضافية طيبة (صوت الألف ليلة)',
            effect: (state) => { state.player.maxMp += 20; }
        },
        uniqueAbility: {
            name: "سحر ألف ليلة وليلة",
            mpCost: 45,
            effect: 'bluff_stun',
            description: 'حكاية ساحرة وغامضة بتخلي العدو يقف في مكانه مذهول تماماً لدورين كاملين.'
        }
    },
    rustam: {
        id: 'rustam',
        name: 'بهرام الجبار',
        title: 'قاهر ديو الأكبر وصاحب الحصان البرق الأثير',
        origin: 'empty_quarter',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'lawful_good',
        karmaRequirement: 0,
        affinity: 50,
        personality: 'noble',
        description: 'أعظم بطل في ملاحم الشرق، حارب لقرون مع حصانه البرق وسيفه الأثير. هزم شيطان الفوضى الأبيض، ونجا من المحن السبعة العظيمة بالصحرا، وصارع القدر نفسه بالحق والعدالة الروحية.',
        dialogue: {
            greet: [
                '"أنا صارعت غيلان الصحرا قبل الفجر ونمت ودرعي حديدي عليا. إيه التحدي اللي جايبه لينا المرة دي؟"',
                '"ببركة الحق وقوة حصاني البرق وشرف أهلي — خلينا نندفع لأي خطر مستنينا!"'
            ],
            battle_cry: ['"من أجل كرامة الديار والأهل!"', '"ببركة العرش الأعلى — للآمااام!"'],
            victory: ['"علمتني المحن السبعة: الصبر والهمة بيكسروا أي حصن وجدار."'],
            defeat: ['"البطل الحقيقي بيتعلم من الخسارة أكتر بكتير من المكسب. قوم على حيلك!"'
            ]
        },
        passiveBuff: {
            label: '+30 صحة قصوى و +10 هجوم دايم (صبر وتحمل الجبابرة)',
            effect: (state) => { state.player.maxHp += 30; state.player.hp = Math.min(state.player.hp + 30, state.player.maxHp); state.player.atk += 10; }
        },
        uniqueAbility: {
            name: "المحنة السابعة الماحية",
            mpCost: 35,
            effect: 'debuff_enemy_buff_player',
            description: 'بتقلل هجوم العدو بـ 30% وتزود هجومك وضرر ضرباتك بـ 20% لمدتين كاملين.'
        }
    },
    imhotep: {
        id: 'imhotep',
        name: 'لقمان الحكيم الأثري',
        title: 'مهندس الأبدية وطبيب القلوب والنفوس',
        origin: 'brass_city',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 40,
        affinity: 50,
        personality: 'wise',
        description: 'الرجل الصالح العارف بالله اللي خُلد اسمه وحكمته لآلاف السنين. اخترع الطبابة والأعشاب، وبنى عواميد صوامع العبادة، وكتب وصايا وحكم خلدتها الأرواح. سلاحه الحقيقي هو العلم والبركة. ودرعه هو البصيرة والسكينة.',
        dialogue: {
            greet: [
                '"علمتني العواميد القديمة حاجة واحدة: كل بناء عظيم بيحتاج أساس روحي ثابت. خلينا نبني نصرك."',
                '"الطب، البناء، الفلسفة الإلهية — أتقنتهم كلهم. والقتال والدفاع؟ مجرد فن وعلم تالت هندرسه وننصره بالحق."'
            ],
            battle_cry: ['"العلم والبركة هما أمضى سلاح!"', '"ببركة الحكمة والأنوار — اندفعوا بالحق!"'],
            victory: ['"تطبيق سليم ومبارك للحكمة الروحية. كالعادة في طريق الأبرار."'],
            defeat: ['"كل خطأ بيعلم صاحبه حكمة. كسبنا بصيرة ونور النهاردة، متزعلش."'
            ]
        },
        passiveBuff: {
            label: 'رجوع كامل للصحة والمانا مرة واحدة في كل عهد (طبابة لقمان)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "رِقية النقاء والطبابة الكبرى",
            mpCost: 0,
            effect: 'act_once_full_restore',
            description: 'ترجع صحتك ومانتك بالكامل مرة واحدة في كل عهد. بركة من أعظم الأوراد الطبية العتيقة.'
        }
    },
    shango: {
        id: 'shango',
        name: 'شعلان مارد الرعد',
        title: 'سلطان الصواعق والعدالة السماوية الأكيدة',
        origin: 'celestial_court',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        alignment: 'chaotic_good',
        karmaRequirement: -50,
        affinity: 50,
        personality: 'fierce',
        description: 'مارد الجن الناري الجبار اللي بيتحكم في الرعد والصواعق وطبول المعارك الروحية. شعلان سريع كعاصفة، ومخيف كبرق السما، وحاسم ضد أي ظلم وفساد بقنوات النور.',
        dialogue: {
            greet: [
                '"شعلان مبيتكلمش بصوت واطي! أنا برعد وببرق في الرماد.. امشي معايا وهتشوف نصر جبار!"',
                '"طبول المعركة والذكر بتهز الجبال.. سامع صوتها؟ بتقول إننا هنطحن قطاع الطرق دول!"'
            ],
            battle_cry: ['"الرعد! الصاعقة! شعلان هنااا!"', '"السما والغيوم بتسمع لأمري وتخضع!"'],
            victory: ['"صوت الرعد والتمكين كسب دايماً! كالعادة!"'],
            defeat: ['"حتى الرعد بيحتاج يجمع طاقته تاني. بس هنرجع بصوت وصاعقة أشد وأعلى!"'
            ]
        },
        passiveBuff: {
            label: '+20 هجوم إضافي، و 20% فرصة شل حركة العدو في كل دور (صاعقة الرعد)',
            effect: (state) => { state.player.atk += 20; }
        },
        uniqueAbility: {
            name: "حجر الصاعقة شعلان",
            mpCost: 30,
            effect: 'triple_damage_stun',
            description: 'صاعقة نارية هابطة من العرش. تسبب 3 أضعاف الضرر وتشل حركة العدو لدور كامل من الرعب.'
        }
    }
};

// ── أبطال الملاحم البحرية والأماني ──
const EXTRA_ARABIAN_HEROES = {
    sinbad: {
        id: 'sinbad',
        name: 'السندباد البحري',
        title: 'صاحب الرحلات السبع وقاهر المحال والغيلان',
        origin: 'abyssal_sea',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        alignment: 'chaotic_good',
        karmaRequirement: -30,
        affinity: 50,
        personality: 'adventurous',
        description: 'نجا من طائر الرخ العملاق اللي بحجم الجبل، وعبر جزيرة الحوت العائمة، وهرب من وادي الألماس المحروس بالحيايا الجبارة — ورجع بلده بغداد سبع مرات غني ومنصور. السندباد مبيخافش من الخطر، بيعرف يكسب منه.',
        dialogue: {
            greet: [
                '"إنت فاكر إن ده خطر بجد؟ طب خليني أحكيلك عن المرة اللي ركبت فيها على ضهر طائر الرخ..."',
                '"سبع رحلات بحرية.. سبع مرات شفت الموت بعيني ورجعت.. إيه عذرك بقى عشان تتردد؟! ياللا بينا!"'
            ],
            battle_cry: ['"للمغامرة والأساطير!"', '"ببركة البحر والريح — للآمااام!"'],
            victory: ['"حكاية جديدة هنحكيها على قهوة التجار ببغداد!"'],
            defeat: ['"...ودي الطريقة اللي رحلتي التامنة كانت هتخلص بيها.. بس لسة الروح فيها روح!"'
            ]
        },
        passiveBuff: {
            label: '+25% غنائم فخمة، والمناطق البحرية والنهارية متسببش أي ضرر بيئي لروحك (حظ البحار)',
            effect: (state) => {}
        },
        uniqueAbility: {
            name: "استدعاء طائر الرخ الجبار",
            mpCost: 25,
            effect: 'area_damage_or_bypass',
            description: 'بيستدعي طائر الرخ الأسطوري من السما عشان يضرب العدو بضعفين الضرر تماماً.'
        }
    },
    aladdin: {
        id: 'aladdin',
        name: 'علاء الدين صاحب المصباح',
        title: 'سيد المصباح السحري ومارد الأماني الروحية',
        origin: 'brass_city',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'chaotic_good',
        karmaRequirement: -50,
        affinity: 50,
        personality: 'cunning',
        description: 'فتى بسيط من شوارع واحة القوافل، لقى مصباح ناري سحري واستخدمه بنبل وذكاء مش عشان نفسه بس، بل عشان يستحق ود ونخوة الديار ويحمي صومعته. علاء الدين عارف إن الشجاعة والجسارة هما المصباح الحقيقي.',
        dialogue: {
            greet: [
                '"صعلوك الشارع؟ كانوا بيقولوا عليا صعلوك متشرد.. دلوقتي معايا مارد الجن السحري. مين اللي بيضحك في الآخر؟!"',
                '"أنا كنت في القاع يا شريكي، ومفيش طريق قدامنا غير الطلوع والارتقاء للأعلى. ياللا بينا!"'
            ],
            battle_cry: ['"خطوة سريعة وهبقى قدام العدو!"', '"ده اللي صعلوك الواحات يقدر يعمله بقوة المصباح!"'],
            victory: ['"مش بطال خالص بالنسبة لولد بسيط من البازار، صح؟!"'],
            defeat: ['"حتى مارد المصباح مبيصلحش كل حاجة.. لازم نشغل عقولنا."']
        },
        passiveBuff: {
            label: '+15 دفاع إضافي وفتح تجار وخصومات غامضة بالبازار (فطنة الشوارع)',
            effect: (state) => { state.player.def += 15; }
        },
        uniqueAbility: {
            name: "أمنية مارد المصباح الكبرى",
            mpCost: 50,
            effect: 'full_party_heal',
            description: 'أمنية روحية واحدة: ترجع صحتك ومانتك بالكامل فورا. تستخدم مرة واحدة في كل معركة.'
        }
    }
};

// ── خصائص ومكافآت التروس والدروع والأسلحة ──
const EQUIPMENT_STATS = {
    // الأسلحة الروحية والسيوف
    'Iron Merchant\'s Sword': { slot: 'weapon', atk: 5, crit: 2 },
    'Steel Jian with Qi Groove': { slot: 'weapon', atk: 12, crit: 5, mp: 10 },
    'Desert Iron Scimitar': { slot: 'weapon', atk: 8, def: 2 },
    'Ifrit-Forged Scimitar': { slot: 'weapon', atk: 25, fireDmg: 10 },
    'Heaven Halberd': { slot: 'weapon', atk: 45, def: 5 },
    'Tariq\'s Lost Scabbard': { slot: 'weapon', atk: 60, def: 20, lifesteal: 5 },
    'The Ruyi Jingu Bang': { slot: 'weapon', atk: 100, momentumGain: 10 },
    'Leviathan Tooth Blade': { slot: 'weapon', atk: 35, waterDmg: 15 },
    
    // الملابس والدروع الحامية
    'Sect Disciple Robe': { slot: 'armor', def: 5, mp: 5 },
    'Cloud-Step Boots': { slot: 'armor', def: 3, evasion: 10 },
    'Camel-Leather Water Skin': { slot: 'armor', def: 2, heatResist: 20 },
    'Abyssal Armor Plate': { slot: 'armor', def: 25, qiResist: 15 },
    'Mantle of the Qutb': { slot: 'armor', def: 40, autoHeal: 2 },
    'Celestial Silk Robe': { slot: 'armor', def: 30, mp: 50 },
    
    // التمائم والبركات الأثرية
    'Merchant Prince\'s Ring': { slot: 'relic', goldBonus: 10 },
    'Ghost Fire Shard': { slot: 'relic', atk: 4, mpDrain: 2 },
    'Dragon Scale Fragment': { slot: 'relic', def: 10, fireResist: 30 },
    'Irem Brass Amulet': { slot: 'relic', mp: 20, jinnLore: 1 },
    'Nuwa\'s Five-Colored Stone': { slot: 'relic', allStats: 15 },
    'The Jade Emperor\'s Seal': { slot: 'relic', dominance: 50 }
};

// ── طبائع الأعداء والغيلان بالشرق ──
const ENEMY_ARCHETYPES = {
    brute: { label: 'العنيف الجبار', hint: 'بيفضل الضربات الثقيلة. صده وواجهه بـ رقصة سيف الماء المتدفقة.' },
    assassin: { label: 'الخاطف المباغت', hint: 'بيفضل الضربات السريعة. واجهه بـ أنفاس رياح الصحراء السحرية.' },
    mage: { label: 'الروحاني الساحر', hint: 'بيفضل السحر والأوراد. واجهه بـ درع سر الجسد الصخري الصلب.' },
    guardian: { label: 'الحارس الحصين', hint: 'بيفضل الدفاع والصد. كسر حمايته بـ زوبعة دكة الأرض الرهيبة.' },
    balanced: { label: 'المتزن اللبق', hint: 'تكتيكات مختلطة وغير متوقعة. اقرأ تلميحات هجماته كويس جداً.' }
};

// --- دمج وتصدير البيانات بالكامل لمحرك الأساطير ---
if (window.LORE) {
    window.LORE.MYTH_HEROES = MYTH_HEROES;
    window.LORE.EXTRA_HEROES = EXTRA_ARABIAN_HEROES;
    
    if (!window.LORE.ARABIAN_HEROES) window.LORE.ARABIAN_HEROES = {};
    Object.assign(window.LORE.ARABIAN_HEROES, EXTRA_ARABIAN_HEROES);
    
    window.LORE.EQUIPMENT_STATS = Object.assign(window.LORE.EQUIPMENT_STATS || {}, EQUIPMENT_STATS);
    window.LORE.ENEMY_ARCHETYPES = ENEMY_ARCHETYPES;
}
