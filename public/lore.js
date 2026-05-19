// ============================================================
// LORE.JS — Part 1: World Regions, Arabian Characters, Enemies
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

// --- الستة أقاليم العظيمة للشرق ---
const REGIONS = {
    crossroads: {
        id: 'crossroads',
        name: 'واحة القوافل ولقاء العالمين',
        subtitle: 'حيث تلتقي القوافل والقلوب',
        description: 'قلب طريق الحرير النابض. ريحة البخور وعطور الشرق بتملى الجو. هنا الشيوخ والأبطال بيقعدوا مع أصحاب الطرق، وكل ركن فيه سر مكتوب من آلاف السنين.',
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
        name: 'جبل الطور المقدّس',
        subtitle: 'حيث تتجلى أسرار النور وأقاليم الصحراء',
        description: 'جبال عالية بتشق السحاب وتوصل للسما. الزهاد والفرسان ينحتون رموز عزيمتهم على الصخور بفيض القوة البدنية. الهوا نفسه بيتهز ببركة الينابيع السحرية.',
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
        name: 'الربع الخالي العظيم',
        subtitle: 'مملكة الجن النائمة تحت الرمال',
        description: 'بحر من الكثبان الرملية اللي ملهاش نهاية. النجوم هنا بتقول المستقبل والماضي. أبراج النحاس لبلاد بادت وضاعت بتشق الأفق. وحاجة قديمة وجبارة بتتحرك تحت الرمل.',
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
        name: 'بحر النور اللجي',
        subtitle: 'محيط من البركة والقوة البدنية والنقاء الصافي',
        description: 'مفيش مية عادية — ده نهر جاري من النور السائل الممتد للأفق. تنانين الرمل ومردة البحر بيلتفوا حوالين القصور الغرقانة. السالكين اللي بيقعوا فيه يا إما بيرتقوا للقمة والسيادة أو يدوبوا في فيض الجلال البدني.',
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
        name: 'مدينة النحاس الأسطورية',
        subtitle: 'مدينة الألف عمود وحارس الجن',
        description: 'المدينة الأسطورية المدفونة تحت رمال الربع الخالي، اللي ظهرت تاني بسبب زلزال طاقة عظيم. عواميدها بتلمس السما. وحاكمها، ملك المردة القديم "مُرقَباد"، اختفى من قرون وساب كنوزه محروسة بالطلسم.',
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
        name: 'المجلس السلطاني الأعلى',
        subtitle: 'حيث يُقضى بالحق وتُوزن الأعمال',
        description: 'فوق السحاب، بعيد عن عيون البشر العاديين. السلطان الأسطوري قاعد على عرش من النور والنجم الساطع. مجلس الحكماء والفرسان الصالحين واقفين قدامه. الأرض والسما في فتنة عظيمة، ومفيش غيرك يقدر يقرر إيه اللي هيحصل بعد كدة.',
        stageRange: [12, 15],
        unlocked: false,
        ambientColor: '#d4af37',
        enemies: ['heavenly_guard', 'fallen_immortal_patriarch', 'jade_emperor_guardian', 'divine_council_enforcer'],
        npcs: ['jade_emperor', 'al_khidr', 'nuwa', 'sun_wukong'],
        lootTable: 'celestial_loot',
        x: 415, y: 72
    }
};

// --- أبطال ورفاق الشرق الأسطوريين ---
const CHINESE_HEROES = {
    sun_wukong: {
        id: 'sun_wukong',
        name: 'سون ووكونغ (الملك القرد الجبار)',
        title: 'سيد نيران المرصاد والحرية المطلقة',
        origin: 'empty_quarter',
        sprite: 'assets/sword_immortal_1778872325571.png',
        alignment: 'chaotic_good',
        karmaRequirement: -30,
        affinity: 50,
        personality: 'boisterous',
        description: 'مارد خالد، جبار، ومتمرد. اتحبس 500 سنة تحت صخرة المرصاد بأمر سليمان الحكيم لأنه اتحدى مجلس الجن الأكبر، وطلع منها أقوى وأعنف. مبيحاربش عشان الواجب، بيحارب عشان المتعة وهزيمة الأعادي.',
        dialogue: {
            greet: [
                '"يا مرحب بالسالك! سون ووكونغ كان مستنيك.. ريحتك فيها سر وسحر، بس برضه فيها تراب السكة!"',
                '"ها! سالك جديد بيدور على الخلود في الصحرا؟ معظمهم بيزهقوني.. بس إنت.. شكلك وراك حكاية!"',
                '"العمود الفولاذي ده بقاله كتير ماداقش طعم خناقة حرشة. تحب نتحد؟ بس حاول تجري وتجاري سرعتي!"'
            ],
            battle_cry: [
                '"طلسم النور واللهب! وده الهجوم البسيط لسة مبدأناش يا ضعفاء!"',
                '"اضرب بسرعة! الملك القرد هيحمي ضهرك — إلا لو ظهرت حاجة بتلمع تشتت انتباهي!"',
                '"دوق طعم عمود الصخر البركاني يا شبح يا مسكين!"'
            ],
            high_affinity: '"على فكرة، من وسط كل الشيوخ والسالكين اللي قابلتهم، إنت أكتر واحد خفيف على قلبي. اعتبر دي شهادة لله!"',
            low_affinity: '"لو فضلت تتصرف بكبرياء كدة، سون ووكونغ هيسيبك ويروح يدور على سالك دمه خفيف يسلي وقته!"',
            death_line: '"حتى... سون ووكونغ الجبار... انطفت... شعلته..."'
        },
        passiveBuff: { stat: 'atk', bonus: 0.20, label: '+20% للهجوم الباطني' },
        uniqueAbility: {
            name: 'طلسم التشكل الباطني',
            mpCost: 25,
            description: 'بيتحول لنسخة من شكل العدو، وده بيشتته تماماً ويمنع هجومه الجاي بالكامل.',
            effect: 'negate_enemy_attack'
        },
        questArc: 'رحلة العهد والمارد السجين',
        secretMotivation: 'بيدور على سالك وفي يستحق يرث أسرار النور الناري قبل ما طلسم جسده الفاني يدوب تماماً بسبب لعنة سليمان القديمة.'
    },
    guan_yu: {
        id: 'guan_yu',
        name: 'الجنرال غوان يو (الفارس الأبي)',
        title: 'حارس حديد دمشق وصاحب العهد والميثاق الأبدي',
        origin: 'crossroads',
        sprite: 'assets/guan_yu.png',
        alignment: 'lawful_good',
        karmaRequirement: 40,
        affinity: 0,
        personality: 'stoic',
        description: 'فارس مبيتكلمش إلا لو لزم الأمر. هيبته بتخلي قلوب الأعداء تترعش أول ما يمسك سيفه الدمشقي العريق. بيقيس الناس بعهودها وأمانتها بجد، مش بقوتها وادعائها.',
        dialogue: {
            greet: [
                '"طاقاتك البدنية مشوشة يا سالك. قلبك لسة مخدش قراره. ارجعلي لما تعرف طريقك وحقيقتك بجد."',
                '"قابلت آلاف الفرسان في طريقي. قليلين اللي عيونهم فيها نفس اللمعة والنقاء اللي عندك. أوعى تضيعهم."'
            ],
            battle_cry: [
                '"باسم الحق والعدل العريق!"',
                '"واجه عدوك بقلب أبيض ونية صافية!"'
            ],
            high_affinity: '"إنت بتفكرني بشباب الفرسان الصالحين اللي حاربوا عشان حماية الضعيف. الشرف ده غالي أوي."',
            low_affinity: '"طريق الظلام والغي مبيأديش غير للرماد والهلاك. رجلي مش هتمشي معاك في السكة دي."',
            test_event: 'غوان يو يظهر في طريقك. مبيقولش ولا كلمة، بيرفع سيفه الدمشقي اللامع.. ده اختبار حقيقي لشرفك وقوتك البدنية والقتالية.'
        },
        passiveBuff: { stat: 'def', bonus: 0.25, label: '+25% للدفاع البدني والجسدي' },
        uniqueAbility: {
            name: 'ضربة الفولاذ الدمشقي الجبارة',
            mpCost: 30,
            description: 'ضربة وحدة قاطعة بتسبب تلات أضعاف الضرر وبتشل حركة العدو لدور كامل بسبب الرعب.',
            effect: 'triple_damage_stun'
        },
        questArc: 'ميثاق الفارس والعهد الدمشقي',
        secretMotivation: 'المجلس السلطاني الأعلى كلفه يراقب السالكين ويشوف مين فيهم وفي لعهودهم ويستحق الترقي لرتبة السيادة العظمى وقوة البنيان.'
    },
    hua_mulan: {
        id: 'hua_mulan',
        name: 'مولان (ياسمين فخر الفرسان)',
        title: 'سيف البادية الصامت وحامية الديار',
        origin: 'crossroads',
        sprite: 'assets/hua_mulan.png',
        alignment: 'neutral_good',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'determined',
        description: 'حاربت 12 سنة متنكرة في زي فارس عشان تدافع عن أهلها ومخسرتش ولا معركة. دلوقتي بتمشي وسط القوافل بتدور على قضية عادلة تستحق سيفها الصامت وجسارتها.',
        dialogue: {
            greet: [
                '"مبيهمنيش رتبتك البدنية ولا مقاماتك. وريني بس إنت بتحارب عشان إيه ونصرة مين بجد."',
                '"الطريق وسط الكثبان الرملية خطر أوي لوحدك. أنا كنت براقبك.. وشكلك كدة مش يائس بالكامل وفيك أمل."'
            ],
            battle_cry: [
                '"عشان الديار والشرف! ياللا يا فرسان!"',
                '"بيستخفوا بقوتنا.. ودي هتكون غلطتهم الأخيرة في الدنيا!"'
            ],
            high_affinity: '"في كل رحلاتي قابلت أمراء وقادة جيوش.. إنت بتحارب بقلب ونخوة أكتر منهم كلهم."',
            unique_ability_use: '"حيلة التنكر البدوي — هبقى الشخص اللي هما مش متوقعينه أبداً!"'
        },
        passiveBuff: { stat: 'def', bonus: 0.15, label: '+15% دفاع وقدرة تسلل فائقة' },
        uniqueAbility: {
            name: 'حيلة التنكر البدوي',
            mpCost: 20,
            description: 'ياسمين بتساعدك تتنكر في زي تاجر أو بدوي محلي، وده بيخليك تتخطى العقبات الاجتماعية وتقلل شكوك العدو.',
            effect: 'bypass_social_gate'
        },
        questArc: 'اثنا عشر عاماً باسم مستعار',
        secretMotivation: 'والدها محبوس في جبل الطور بسبب حيلة خبيثة من شيخ الطرق الفاسد، ومحتاجة مساعدتك عشان تحرره من غير ما تشعل حرب طائفية.'
    },
    ne_zha: {
        id: 'ne_zha',
        name: 'ني زا (شهاب الفتى اللهبي)',
        title: 'مولود النيران والهمة المتمردة المتجددة',
        origin: 'empty_quarter',
        sprite: 'assets/ne_zha.png',
        alignment: 'chaotic_neutral',
        karmaRequirement: -60,
        affinity: 0,
        personality: 'rebellious',
        description: 'فتى اتولد من لهب النيران المقدسة ومبيخافش من الموت. ضحى بجسده الطيني عشان ينقذ أهله وتخلص من ديون الجسد والنفس، ورجع تاني أقوى من الأول. الموت مبقاش ليه معنى عنده.',
        dialogue: {
            greet: [
                '"هههه! وصلت لحد هنا فعلاً؟ مش بطال لسالك لسة في أول مساره البدني والقتالي."',
                '"الملوك الظلمة بيكرهوني، والجن العاصي بيكرهني.. وأنا لسة واقف هنا وبتنفس وبضحك. تفتكر ده معناه إيه؟"'
            ],
            battle_cry: [
                '"طوق النار الحارق — انطلق!"',
                '"أنا مت مرة قبل كدة ورجعت. اضرب أجمد من كدة بكتير لو تقدر!"'
            ],
            high_affinity: '"لو كان ليا أخ كبير وفي بجد، كنت هعوزه يبقى شبهك كدة. متخليهوش موضوع سخيف بقى!"',
            revive_proc: '"نسيت ولا إيه؟ عزيمتي بتتولد من لهب العنقاء الأسطوري. أنا كويس.. شوف التاني بقى حصله إيه!"'
        },
        passiveBuff: { stat: 'hp', bonus: 0, label: 'مرة في المعركة: بينبعث تاني بـ 30% من صحته عند الضربة القاتلة' },
        uniqueAbility: {
            name: 'انبعاث العنقاء الأسطوري',
            mpCost: 0,
            description: 'قدرة كامنة. مرة واحدة في المعركة لما صحته توصل لـ 0، شهاب بينبعث تاني بـ 30% من صحته القصوى.',
            effect: 'one_time_revive'
        },
        questArc: 'عهد بحر النيران السبعة',
        secretMotivation: 'ملك الجن الأزرق حط ختم ظلام على جسد ني زا اللهبي وبيضيع طاقته الباطنية، ومحتاج عشبة زمردية نادرة من عمق الصحرا مفيش غيرك يقدر يجيبها.'
    },
    nuwa: {
        id: 'nuwa',
        name: 'نووا (زبيدة الحكيمة الصالحة)',
        title: 'أم السالكين ومصلحة القلوب ببركة النور الأكبر',
        origin: 'celestial_court',
        sprite: 'assets/nuwa.png',
        alignment: 'lawful_neutral',
        karmaRequirement: 60,
        affinity: 0,
        personality: 'ancient_serene',
        description: 'شيخة عارفة وحكيمة صالحة، قضت عمرها تصلح النفوس وتلم شمل التايهين في الصحراء. مبدخلش في خناقات البشر بسهولة، بس لو اتكلمت الكل بيسمع لهيبتها وبركتها.',
        dialogue: {
            greet: [
                '"يا بني.. أنا شفت آلاف السالكين بيمشوا في السكة دي، وقليلين اللي عرفوا هما بيدوروا على إيه بجد. إنت بقى.. بتدور على إيه؟"',
                '"الشر والغفلة زادوا في الأرض والسما شقها بيكبر تاني، والمرة دي حتى أنا مش هقدر أصلح كل ده لوحدي."'
            ],
            repair_event: '"مسارك البدني والقتالي كان منكسر وغافل. سيبني أصلحه ببركة النور وقوة البنيان. متخافش — النقاء والشفاء بيطلب الصبر والألم ساعات."',
            high_affinity: '"بدأت تفهم السر اللي شيوخ كتير عاشوا وماتوا ومفهموش حقيقته. أنا.. فخورة بيك بجد."'
        },
        passiveBuff: { stat: 'maxHp', bonus: 0.30, label: '+30% للصحة القصوى وقدرة إصلاح الكسر البدني والجسدي' },
        uniqueAbility: {
            name: 'رِقية الشفاء التام والبركة والشفاء البدني',
            mpCost: 40,
            description: 'بترجع الصحة بالكامل وبتشيل كل اللعنات والوهن البدني والجسدي تماماً.',
            effect: 'full_party_heal'
        },
        questArc: 'الشرخ الثاني في أسرار أقاليم الصحراء',
        secretMotivation: 'هي عارفة نهاية الحكاية دي من الأول. هي هنا عشان تتأكد إن السالك هيختار الاختيار الصالح اللي يحفظ النور في الأرض، بس ممنوعة تتدخل بشكل مباشر.'
    },
    zhuge_liang: {
        id: 'zhuge_liang',
        name: 'جوجي ليانغ (الحكيم الطغرائي)',
        title: 'صاحب البصيرة وتدبير الحيل والخطط العسكرية الأنيقة',
        origin: 'crossroads',
        sprite: 'assets/zhuge_liang.png',
        alignment: 'lawful_good',
        karmaRequirement: 20,
        affinity: 0,
        personality: 'calculating',
        description: 'أعظم عقل مدبر وحكيم في أرجاء طريق الحرير. يقدر يهزم جيش كامل من قطاع الطرق والجن بحيلة ذكية وكلام موزون من غير ما يرفع سيفه. بيحارب بعقله وبصيرته.',
        dialogue: {
            greet: [
                '"أنا كنت بدرس خطواتك وحركاتك من بعيد. عندك همة ونور بدني وقوة طيبة. بس للأسف، القوة من غير بصيرة وذكاء بيخل صاحبه يموت بسرعة وبس."',
                '"تعال.. نقعد ونتكلم في حيلة التمويه البصرية. ساعات لما تظهر قوتك بيبقى ده منتهى الضعف، ولما تظهر ضعفك بيبقى منتهى الذكاء والقوة."'
            ],
            strategy_hint: '"العدو متوقع هجوم صريح من قدام. اعمل العكس تماماً. دايماً العكس."',
            high_affinity: '"إنت اتعلمت تفكر في الخطوة الجاية. دلوقتي لازم تتعلم تفكر في الخطوة اللي عدوك لسة مفكرش فيها أصلاً."'
        },
        passiveBuff: { stat: 'intelligence', bonus: 0, label: 'بيكتشف نوع الهجوم الجاي للعدو قبل دوره بكامل تفاصيله' },
        uniqueAbility: {
            name: 'حيلة التمويه والبصيرة البصرية',
            mpCost: 35,
            description: 'بيعمل حيلة بصرية بتخلي العدو يقف مكانه مذهول لمدتين من غير ما يقدر يهاجمك أو يلمسك.',
            effect: 'bluff_stun'
        }
    }
};

// --- أعداء واحة القوافل العتيقة ---
const CROSSROADS_ENEMIES = {
    silk_road_bandit: {
        id: 'silk_road_bandit',
        name: 'قطاع الطرق البدوي',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 40, baseAtk: 10, xpReward: 20,
        description: 'حرامي صحراوي يائس بيسرق قوافل التجارة. حركته سريعة بس درعه ضعيف.',
        moves: {
            heavy: { name: 'ضربة الهراوة الثقيلة', text: 'الحرامي بيرفع الهراوة عشان يكسر دفاعك تماماً.' },
            fast: { name: 'طعنة الخنجر المباغتة', text: 'طعنة سريعة وقذرة موجهة للمناطق الضعيفة في درعك.' },
            magic: { name: 'رمي رمال الصحراء', text: 'بيحدف رمل على عيونك عشان يعميك ويشل تركيزك الجاي.' }
        },
        archetype: 'assassin',
        loot: ['Silk Coin Pouch', 'Rusty Dagger']
    },
    corrupted_merchant: {
        id: 'corrupted_merchant',
        name: 'تاجر القوافل الجشع',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 60, baseAtk: 12, xpReward: 35,
        description: 'تاجر باع ذمته ونوره عشان دنانير الذهب. بيحارب بدنانير ملعونة بتنفجر بطمع النفوس.',
        moves: {
            heavy: { name: 'ثقل دنانير الجشع', text: 'بيرمي كيس دنانير ملعونة بتتقل تركيزك وهمتك وتضعف همتك.' },
            fast: { name: 'ضربة الرشوة البدنية', text: 'ضربة بتمتص مانا تركيزك وهمتك وتشتت تركيزك عشان يشتري هزيمتك.' },
            magic: { name: 'انفجار دنانير النار', text: 'فلوسه بتنفجر بلهب أسود مدعوم بطمع جارف.' }
        },
        archetype: 'balanced',
        loot: ['Cursed Gold Coin', 'Silk Road Contract']
    },
    street_ghost: {
        id: 'street_ghost',
        name: 'شبح رمال الصحراء التايه',
        region: 'crossroads',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 35, baseAtk: 15, xpReward: 25,
        description: 'طيف سالك مات تايه في الصحرا وسط الضلمة. بيدور على أي دفء ونور بدني يسرقه منك.',
        moves: {
            heavy: { name: 'لمسة الصقيع والوحدة', text: 'لمسته متلجة زي ليل الصحرا الموحش، بتبطأ حركتك تماماً.' },
            fast: { name: 'طعنة صرخة الرياح', text: 'بيختفي ويظهر فجأة وسط صرخة رياح مروعة في ودانك.' },
            magic: { name: 'امتصاص النور البدني', text: 'بيحاول يسحب شعلة الحياة والنور من جوهر قلبك مباشرة.' }
        },
        archetype: 'mage',
        loot: ['Ghost Essence', 'Faded Beggar\'s Bowl']
    }
};

// --- أعداء جبل الطور المقدّس ---
const CHINESE_ENEMIES = {
    corrupted_taoist: {
        id: 'corrupted_taoist',
        name: 'حكيم الطرق الممسوخ',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 80,
        baseAtk: 18,
        xpReward: 60,
        description: 'شيخ غرق في الغفلة واستخدم طلاسم سحرية ملعونة عشان يسرع ارتقائه. هدومه بقت سودا ومظلمة بنوايا قلبه الفاسدة.',
        moves: {
            heavy: { name: 'ضربة الكف الأسود الملعون', text: 'الحكيم بيرفع إيديه، وهالة ظلام سودا بتلف وتضرب هالتك البدنية.' },
            fast: { name: 'طعنة طيف السيف المنحني', text: 'بيختفي في الضلمة ويظهر فجأة وراك بسيفه الفولاذي الحاد.' },
            magic: { name: 'ختم قنوات النور البدني', text: 'بيرسم طلسم مشوه في الهوا — لو صابك، قنوات النور والمانا بتاعتك هتتقفل لدور كامل.' }
        },
        weakness: 'interrupt_magic',
        loot: ['Demonic Cultivation Scroll', 'Black Qi Stone', 'Stolen Sect Token'],
        dialogue: '"نوركم ضعيف وغافل! طريقتي هي المطلقة السائدة!"'
    },
    hungry_ghost: {
        id: 'hungry_ghost',
        name: 'الغول الجائع للطاقة الباطنية',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 45,
        baseAtk: 12,
        xpReward: 35,
        description: 'نفس تاهت بين الرحيل والميراث. زوره ضيق جداً ومبيقدرش ياكل أكل عادي — فبيتغذى على سحب وامتصاص نور السالكين.',
        moves: {
            heavy: { name: 'عضة الجوع الكافر', text: 'الغول بيمد كفوفه العضم الطويلة عشان يمسكك ويقرقش همتك.' },
            fast: { name: 'لمسة سحب المانا الصامتة', text: 'بيمد صابعه الساقع زي التلج لقلب جوهرك البدني عشان يسحب طاقتك.' },
            magic: { name: 'الصرخة الموحشة المحبطة', text: 'بيصرخ صرخة بتهز أعصابك ونفسيتك، ومانا تركيزك وهمتك بتبدأ تتسرب.' }
        },
        weakness: 'guard_blocks_mp_drain',
        loot: ['Ghost Fire Shard', 'Grieving Spirit Talisman'],
        dialogue: '"...جعان... عطشان لنورك... عطشان..."'
    },
    dragon_carp: {
        id: 'dragon_carp',
        name: 'عنقاء وادي الطور الأبية',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 120,
        baseAtk: 22,
        xpReward: 90,
        description: 'عنقاء حرة وقديمة بتحاول تطير فوق القمة عشان توصل للمجلس الأعلى. هي مش شريرة — بس خايفة ومدافعة عن نفسها. فيه طريقة ودية لتهديتها.',
        moves: {
            heavy: { name: 'رفرفة جناج الإعصار', text: 'العنقاء بتهز جناحاتها الجبارة، وبتعمل عاصفة رمل ونور بتضرب اتزانك.' },
            fast: { name: 'اندفاع المخالب النحاسية', text: 'بتندفع عليك بسرعة البرق بمخالبها الحادة كالفولاذ الدمشقي.' },
            magic: { name: 'إعصار النور الناري المحرق', text: 'بتطلق لهب أبيض صافي من طاقتها بيحوطك ويحرق طاقتك.' }
        },
        weakness: 'diplomacy_lure_with_spirit_bait',
        nonCombatOption: 'قدم ليها عشبة النور البرية البريئة. العنقاء بتهدى وبتديك ريشة مباركة وتمشي بسلام.',
        loot: ['Dragon Scale Fragment', 'River Pearl', 'Ascension Carp Fin'],
        dialogue: '(العنقاء بتلف حواليك بعيون حكيمة وتعبانة. هي مش حابة تحاربك.)'
    },
    jade_golem: {
        id: 'jade_golem',
        name: 'حارس جبل الطور الحجري',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 200,
        baseAtk: 30,
        xpReward: 150,
        description: 'تمثال حجري عملاق اتصنع من صخور الجبل ومنقوش عليه طلاسم سحرية لحماية كتب أسرار الطرق القديمة.',
        moves: {
            heavy: { name: 'دكة الجبل العملاقة', text: 'العملاق بيرفع قبضته الضخمة، والخلية الأرضية بتتشقق تحت رجلك من الهبدة.' },
            fast: { name: 'عاصفة الشظايا الصخرية', text: 'جسمه الحجري بيتفتح وبيطلق شظايا صخرية حادة بسرعة خارقة.' },
            magic: { name: 'تفعيل ختم التثبيت الأرضي', text: 'عينه الحجرية بتنور ويظهر دايرة سحرية بتثبت رجلك في الأرض وتمنع دفاعك.' }
        },
        weakness: 'find_core_stone_destroy_it',
        loot: ['Formation Core Stone', 'Living Jade Chip', 'Sect Archive Key'],
        dialogue: '(التمثال مبيتكلمش. بيتقدم بخطوات بتهز الجبل وبس.)'
    },
    fallen_disciple: {
        id: 'fallen_disciple',
        name: 'السالك الضال',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 55,
        baseAtk: 14,
        xpReward: 40,
        description: 'سالك شاب تاه عن طريق النور واستخدم طلاسم فاسدة دمرت قنواته البدنية، ودلوقتي بيلوم العالم على فشله غضباً.',
        moves: {
            heavy: { name: 'ضربة الطاقة المنكسرة الهائجة', text: 'بيطلق نور منكسر وعشوائي، ملهوش كتالوج بس خطر جداً لأنه غير متوقع.' },
            fast: { name: 'اندفاعة اليأس الأعمى', text: 'كل اليأس والغضب بيتحول لاندفاعة انتحارية عليك بسيفه.' },
            magic: { name: 'انفجار شظايا النواة المكسورة', text: 'بيفرقع طاقة نواته من غير عقل، وبيطلق هالة ضارة بتضرب الكل.' }
        },
        weakness: 'diplomacy_offer_healing',
        nonCombatOption: 'سالك شيخ عارف يقدر يقدم ليه إكسير إصلاح القنوات ويصلح بنيته، وهيتحول لرفيق شاكر ويديك كنزه بسلام.',
        loot: ['Broken Jade Pendant', 'Shattered Cultivation Manual Page'],
        dialogue: '"كنت فاكر إني هبقى المعلم الأكبر.. كنت فاكر إني هطير وسط الملوك.."'
    }
};

// --- أعداء الربع الخالي العظيم وصحراء الفناء ---
const ARABIAN_ENEMIES = {
    desert_ghoul: {
        id: 'desert_ghoul', name: 'غيلان الربع الخالي', region: 'empty_quarter',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 70, baseAtk: 22, xpReward: 50,
        description: 'وحوش برية مسخوطة بتاكل لحم اللي يتوه في الصحرا، وجلدها ناشف من الشمس وحقدها ملهوش اخر.',
        moves: {
            heavy: { name: 'اندفاعة كسر العظام الصحراوية', text: 'بينط عليك بقوة جبارة بهدف كسر حمايتك ودرعك تماماً.' },
            fast: { name: 'مخالب الرمال الجارحة', text: 'ضربة سريعة وخاطفة بمخالب ملوثة برمل الصحراء الناشف.' },
            magic: { name: 'سراب الحر الشديد', text: 'بيعمل سراب بيخليه يختفي وسط سراب الرمل السخن عشان يفر من ضربتك.' }
        },
        loot: ['Ghoul Tooth', 'Desert Sand Stone']
    },
    ifrit: {
        id: 'ifrit', name: 'عفريت النيران المتمرد', region: 'empty_quarter',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 120, baseAtk: 28, xpReward: 100,
        description: 'مارد من الجن اتخلق من نار وسموم. بيشوف تركيزك وهمتك الفانية مجرد حطب يستحق الحرق بنيرانه.',
        moves: {
            heavy: { name: 'دكة الجحيم الحارق', text: 'هبدة نارية جبارة بتدوب الرمل وتطلّع نار بركانية تحت رجلك.' },
            fast: { name: 'سوط اللهب المستعر', text: 'سوط طويل من نار سحرية بيحرق درعك الجسدي مباشرة.' },
            magic: { name: 'حجاب الدخان والكبريت', text: 'بيختفي وسط سحابة ريحتها كبريت وبيحضر لهجومه المباغت الجاي.' }
        },
        loot: ['Fire Essence', 'Brass Lamp Shard']
    },
    jade_enforcer_squad: {
        id: 'jade_enforcer_squad', name: 'فرقة حرس السلطان الغليظة',
        region: 'jade_peak',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 300, baseAtk: 45, xpReward: 300,
        description: 'دورية نخبة من جنود المجلس السلطاني الأعلى، مسلحين برماح نحاسية مباركة ودروع تقيلة.',
        moves: {
            heavy: { name: 'جدار الدروع السلطاني الثقيل', text: 'بيقفلوا دروعهم النحاسية مع بعض، وبيرفعوا دفاعهم لـ 200% وهم بيندفعوا عليك.' },
            fast: { name: 'عاصفة الرماح النحاسية الخاطفة', text: 'طعنات رماح سريعة ومنظمة بتستهدف قنوات المانا والنور عندك.' },
            magic: { name: 'ختم الميثاق السلطاني العالي', text: 'بيقولوا صيحة بتعمل دايرة سحرية بتشل حركتك لمنع أي هروب.' }
        },
        loot: ['Broken Jade Pendant', 'Sect Archive Key']
    },
    desert_jinn_rebel: {
        id: 'desert_jinn_rebel', name: 'مارد الجن المتمرد الجبار', region: 'desert_rift',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        baseHp: 450, baseAtk: 60, xpReward: 500,
        description: 'مارد جن عملاق اتخلق من نار السموم وبيرفض ينصاع لقوانين المجلس السلطاني وعايز يدمر الكل.',
        moves: {
            heavy: { name: 'ضربة مطرقة الكثبان الرملية', text: 'هبدة تقيلة بـ مطرقة رملية بتدمر أي درع دفاعي في ثانية.' },
            fast: { name: 'عاصفة السموم الدوارة', text: 'لفة دوارة سريعة بتطلق نار وسموم حواليك بالكامل.' },
            magic: { name: 'زوبعة النار البركانية الأزلية', text: 'موجة نار جبارة بتسخن الهوا وتحرق مانا السالكين.' }
        },
        loot: ['Fire Essence', 'Monster Core']
    },
    corrupted_jade_specter: {
        id: 'corrupted_jade_specter', name: 'طيف الصحراء الممسوخ', region: 'desert_rift',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 450, baseAtk: 60, xpReward: 500,
        description: 'شبح عتيق من حجر الزمرد المبارك، اتجنن وفقد نوره بسبب الزوابع والشرور الملعونة.',
        moves: {
            heavy: { name: 'مخالب الطيف الزمردية القاسية', text: 'ضربة مخالب خيالية بتمزق الهالة البدنية مباشرة.' },
            fast: { name: 'شظايا النجم الزمردي المتساقطة', text: 'بيطلق شظايا زمردية حادة من السما فوق دماغك.' },
            magic: { name: 'سحب البركة والمانا الصامتة', text: 'سيفون بدني ساقع بيمتص صحتك ومانتك ويضيفها لنفسه.' }
        },
        loot: ['Living Jade Chip', 'Monster Core']
    },
    fog_golem: {
        id: 'fog_golem', name: 'عملاق الزوابع الرملية والغبار', region: 'desert_rift',
        sprite: 'assets/corrupted_taoist_1778872375046.png',
        baseHp: 500, baseAtk: 55, xpReward: 500,
        description: 'كتلة ضخمة من الصخور والتراب ممسوكة ببعضها بفضل سحر زوبعة رملية ملعونة مبتهداش.',
        moves: {
            heavy: { name: 'قبضة الغبار الصخرية القاسية', text: 'هبدة صخرية جبارة بتقلك وتطحن العضام.' },
            fast: { name: 'عاصفة التراب المعمية للعيون', text: 'بيعمي عيونك بلفحة رمل سريعة تخليك تفوت ضربتك الجاية.' },
            magic: { name: 'درع تحصين الرمال الصلبة', text: 'بيسحب معادن الأرض وبيرفع دفاعه لـ 150 دور كامل.' }
        },
        loot: ['Iron Ore', 'Monster Core']
    },
    fallen_immortal_final: {
        id: 'fallen_immortal_final', name: 'شيطان الفراغ الأعظم - الفناء الأخير', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1000, baseAtk: 90, xpReward: 2000,
        description: 'سيد الفراغ الأخير اللي ماسك خيوط دمار الشرق والغرب وعايز ينهي كل نور بدني في الكون.',
        moves: {
            heavy: { name: 'هبدة جاذبية الفراغ المطلق', text: 'بيسحب كل الهوا والجاذبية عشان يهد حيلك ويطحن عظام هيكلك الطيني.' },
            fast: { name: 'طعنة شعاع الظلام المركز الباغت', text: 'شعاع ظلام رفيع وحاد بيخترق درعك ويسيب ندبة سحرية بتنزف.' },
            magic: { name: 'زلزال الفناء وتلاشي الأكوان', text: 'بيسحب الطاقة من باطن الأرض ويفجر البركة حواليك عشان يحرق تركيزك وهمتك.' }
        },
        loot: ['Varunastra Core', 'Pangu\'s Axe Fragment']
    },
    fallen_immortal_righteous: {
        id: 'fallen_immortal_righteous', name: 'شيطان الفراغ - تراب الفوضى الجافة', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1100, baseAtk: 95, xpReward: 2000,
        description: 'تجسد الفراغ الملعون اللي بيرد على نظامك البدني الصالح بمحاولة تدمير الكون بالتراب والرماد.',
        moves: {
            heavy: { name: 'هدم الممالك والقصور القديمة', text: 'ضربة جبارة بوزن إمبراطوريات بادت وضاعت فوق دماغك.' },
            fast: { name: 'رمح محو السنن والقوانين', text: 'رمح أبيض من مادة مضادة بيمسح أي دروع أو بركة سحرية.' },
            magic: { name: 'تفريغ الهوا وقطع الأنفاس', text: 'بيسحب كل الأكسجين والمانا من الهوا ويخنق سالكين المعركة.' }
        },
        loot: ['Rigveda Pages', 'Seven Star Sword of Dao']
    },
    fallen_immortal_demonic: {
        id: 'fallen_immortal_demonic', name: 'شيطان الفراغ - شعلة الغضب والدمار', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1200, baseAtk: 105, xpReward: 2000,
        description: 'تجسد الفراغ المظلم اللي بيرد على سحرك الغاضب ببرد الفراغ المطلق السام.',
        moves: {
            heavy: { name: 'هجوم الأذرع الستة الجبار الماحي', text: 'ست ضربات خيالية متتالية بتضرب درعك في نفس الثانية.' },
            fast: { name: 'سيف فوضى الظلام الكلي الباغت', text: 'ضربة سيف حادة بتتجاهل 50% من دفاعك الجسدي وتنزفك.' },
            magic: { name: 'انفجار شمس الظلام واللعنة الكبرى', text: 'انفجار طاقة سلبية ملعونة بيمحي أي نور أو مانا متبقية.' }
        },
        loot: ['Kavacha Golden Breastplate', 'Wukong\'s Golden Band']
    },
    fallen_immortal_neutral: {
        id: 'fallen_immortal_neutral', name: 'شيطان الفراغ - اتزان منهار وتشتت كلي', region: 'desert_rift',
        sprite: 'assets/mythology_bg_1778872403707.png',
        baseHp: 1150, baseAtk: 100, xpReward: 2000,
        description: 'تجسد الفراغ المتمرد اللي بيتحداك وبيتحدى ادعائك لحماية طريق الحرير والاتزان.',
        moves: {
            heavy: { name: 'زلزال كسر اتزان العوالم السبعة', text: 'بيشق الأرض نصين تحتك ويشتت وقفتك واتزانك البدني.' },
            fast: { name: 'الضربة المتناظرة للتركيز والجسد', text: 'ضربة مزدوجة سريعة بتضرب المانا والدم في نفس الثانية.' },
            magic: { name: 'إعصار Twin الجحيم والجليد المطلق', text: ' Twin شعاعين من حرارة الشمس وبرد الفراغ المطلق بتضرب تركيزك وهمتك.' }
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
// EQUIPMENT DATA - ترسانة الأسلحة والدروع الأسطورية للشرق
// ============================================================
window.EQUIPMENT_DATA = {
    // === طقم المشرقيين العتيق (Xianxia Set) ===
    seven_star_sword: { id: 'seven_star_sword', name: 'سيف الكواكب السباعي الأثري', slot: 'weapon', set: 'xianxia', quality: 'Super', stats: { atk: 85, mp: 30 }, reqLevel: 20, reqStage: 'Core Formation', desc: 'سيف منقوش عليه أسرار النجوم السبعة، بيربط شفرتك بفيض النور الكوني.' },
    qingping_sword: { id: 'qingping_sword', name: 'سيف النقاء الصامت العريق', slot: 'weapon', set: 'xianxia', quality: 'Elite', stats: { atk: 50 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'سيف أثري عريق مر بمئات الفرسان والعارفين، بيطلق هالة نقاء وقوة رهيبة.' },
    xuanwu_plate: { id: 'xuanwu_plate', name: 'درع السلحفاة البرزخية الجبار', slot: 'body', set: 'xianxia', quality: 'Super', stats: { def: 75, hp: 200 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'درع متين اتصنع من صدف سلحفاة بحرية أسطورية عتيقة. مستحيل يتكسر بدرع عادي.' },
    phoenix_feather_crown: { id: 'phoenix_feather_crown', name: 'عمامة ريش العنقاء الأسطوري المضيئة', slot: 'head', set: 'xianxia', quality: 'Super', stats: { def: 25, mp: 50 }, reqLevel: 22, reqStage: 'Core Formation', desc: 'عمامة منسوجة بريش العنقاء المضيء الصافي، بتمنح صفاء وتركيز بدني عالي.' },
    nine_dragons_cauldron: { id: 'nine_dragons_cauldron', name: 'إناء البركة لتصفية الأنفاس والبدنية', slot: 'relic', set: 'xianxia', quality: 'Super', stats: { mp: 120 }, reqLevel: 24, reqStage: 'Core Formation', desc: 'إناء نحاسي صغير منقوش عليه نقوش البركة، بينضف قنوات المانا والنور للسالك باستمرار.' },
    taiji_yin_yang_ring: { id: 'taiji_yin_yang_ring', name: 'خاتم الاتزان البدني (الظلمة والنور)', slot: 'relic', set: 'xianxia', quality: 'Unique', stats: { def: 12, mp: 40 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'خاتم زمردي بيمثل التوازن بين الخير والشر، بيسمح بتدفق المانا بسهولة رهيبة.' },
    kunlun_frost_boots: { id: 'kunlun_frost_boots', name: 'خف السير فوق جبال الثلج والرياح', slot: 'boots', set: 'xianxia', quality: 'Elite', stats: { def: 18, speed: 12 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'خف مصنوع من جلد ذئب الجليد، بيسيب خطوط تلج ورا رجلك وأنت ماشي في عز الصحرا.' },
    pangu_axe_fragment: { id: 'pangu_axe_fragment', name: 'شظية فأس بابل لشق الصخر والجبال', slot: 'relic', set: 'xianxia', quality: 'Super', stats: { atk: 40, def: 20 }, reqLevel: 28, reqStage: 'Core Formation', desc: 'شظية صغيرة سودا من فأس أثري قديم شق جبال بابل في غابر الأزمان.' },
    fuxi_zither: { id: 'fuxi_zither', name: 'قانون العارف لتهدئة القلوب التائهة', slot: 'relic', set: 'xianxia', quality: 'Elite', stats: { mp: 80 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'آلة قانون موسيقية مباركة، عزفها بيأنس القلوب والغيلان وبيمنع تشتت النور البدني.' },
    bagua_mirror: { id: 'bagua_mirror', name: 'مرآة النحاس لرد الأرواح الشريرة المتربصة', slot: 'relic', set: 'xianxia', quality: 'Normal', stats: { def: 8 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'مرآة نحاسية بسيطة بتعكس النوايا السيئة وبترعب أشباح الشوارع الضعيفة.' },
    demon_slaying_cord: { id: 'demon_slaying_cord', name: 'حبل النور لتقييد الجان المارد العاصي', slot: 'relic', set: 'xianxia', quality: 'Refined', stats: { atk: 15 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'حبل دهبي متين منسوج من خيوط الفجر، بيقيد حركة شياطين وغيلان الصحراء المتمردة.' },
    gilded_dragon_greaves: { id: 'gilded_dragon_greaves', name: 'حجول الأرض للينابيع البركانية العميقة', slot: 'legs', set: 'xianxia', quality: 'Elite', stats: { def: 35, hp: 60 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'دروع أرجل حديدية متينة مشبعة بطاقة باطن الأرض والبراكين الثابتة.' },
    cloud_walk_trousers: { id: 'cloud_walk_trousers', name: 'سروال حرير السير فوق السحاب بهمة', slot: 'legs', set: 'xianxia', quality: 'Refined', stats: { def: 15, speed: 8 }, reqLevel: 8, reqStage: 'Qi Condensation', desc: 'سروال خفيف ومريح جداً بيساعد سالكي الكشافة والمرسلين على الجري السريع.' },
    taiyang_necklace: { id: 'taiyang_necklace', name: 'عقد عين الشمس البدني الحارق', slot: 'relic', set: 'xianxia', quality: 'Elite', stats: { atk: 25 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'عقد بيضم بلورة نارية ساخنة بتدوب أي وهن وتعب وبتشفي من لسعات برد الصحرا.' },
    wukong_golden_band: { id: 'wukong_golden_band', name: 'طوق مارد النور الجبار الذهبي الحصين', slot: 'head', set: 'xianxia', quality: 'Super', stats: { def: 40, mp: 60 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'طوق معدني دهبي كان بيقيد جمجمة المارد صخر الجبار، بيمح الذكاء والتركيز وقدرة منع الوهن البدني.' },

    // === طقم بلاد السند البدني (Indian Vedic Set) ===
    trishula_of_shiva: { id: 'trishula_of_shiva', name: 'حربة الأقاليم الثلاثة الأسطورية العتيقة', slot: 'weapon', set: 'vedic', quality: 'Super', stats: { atk: 130 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'حربة عتيقة بتمثل القوة والصلابة والانتصار مع بعض. بتهتز بقوة بدنية هائلة ترعب ملوك الجن.' },
    brahmastra_scroll: { id: 'brahmastra_scroll', name: 'مخطوطة طلسم الدمار القديم والأكوان', slot: 'relic', set: 'vedic', quality: 'Super', stats: { atk: 60, mp: 100 }, reqLevel: 28, reqStage: 'Core Formation', desc: 'مخطوطة نحاسية مكتوب عليها نقش تكتيكي عسكري جبار استدعائه بيزلزل الجبال والأرض. استخدمها بحذر شديد.' },
    pinaka_bow: { id: 'pinaka_bow', name: 'قوس الرعد والصواعق الجبار المدوي', slot: 'weapon', set: 'vedic', quality: 'Super', stats: { atk: 90 }, reqLevel: 23, reqStage: 'Core Formation', desc: 'قوس عظيم اتصنع من خشب أثري مبارك. صوته بيعمل صدمة هوا قوية تضرب عظام الأعادي.' },
    kaumodaki_gada: { id: 'kaumodaki_gada', name: 'مقام جرس الفولاذ الثقيل والمطارق الأسرية', slot: 'weapon', set: 'vedic', quality: 'Elite', stats: { atk: 65, def: 20 }, reqLevel: 18, reqStage: 'Foundation Establishment', desc: 'هراوة دهبية تقيلة وجبارة تقدر تطحن دروع كتيبة كاملة من غيلان الصحراء بضربة واحدة.' },
    gilded_sitar_saraswati: { id: 'gilded_sitar_saraswati', name: 'سيتار الحكمة والنقاء والتدريب والتركيز المضيء', slot: 'relic', set: 'vedic', quality: 'Elite', stats: { mp: 70 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'سيتار خشبي بديع مزخرف بالعاج، عزفه الموزون بيصفي الهالة البدنية ويسرع تدفق المانا.' },
    rudraksha_mala: { id: 'rudraksha_mala', name: 'قلادة الخشب والسكينة للتركيز والصفاء البدني', slot: 'relic', set: 'vedic', quality: 'Normal', stats: { mp: 20 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'قلادة مصنوعة من بذور شجر الجبل تساعد في تنظيم الأنفاس وتثبيت الطاقة والتركيز البدني.' },
    kavacha_of_karna: { id: 'kavacha_of_karna', name: 'درع الحماية الذهبي الأزلي المتين اللامع', slot: 'body', set: 'vedic', quality: 'Super', stats: { def: 90, hp: 300 }, reqLevel: 29, reqStage: 'Core Formation', desc: 'درع دهبي أسطوري مبارك ومستحيل يخترقه سهم أو خنجر عادي. بيمتص 40% من أي ضربة جسدية.' },
    kundala_earrings: { id: 'kundala_earrings', name: 'حلقان النور السمعي البدني وأسرار أقاليم الصحراء', slot: 'head', set: 'vedic', quality: 'Elite', stats: { def: 20, mp: 50 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'حلقان دهبية خفيفة بتسمح للسالك يسمع همسات النور وتحذيرات الغيب قبل الخطر.' },
    agneyastra_ring: { id: 'agneyastra_ring', name: 'خاتم لهب الصحراء الحارقة المستعرة', slot: 'relic', set: 'vedic', quality: 'Elite', stats: { atk: 35 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'خاتم مبارك بنار البروق، بيطلق ومضات نارية حامية مع كل سحبة سيف أو ضربة قبضة.' },
    varunastra_core: { id: 'varunastra_core', name: 'جوهرة عمق البحار السبعة والأمواج والماء', slot: 'relic', set: 'vedic', quality: 'Elite', stats: { def: 30 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'كرة بلورية زرقا شايلة طاقة وقوة الأمواج العظيمة للبحر اللجي.' },
    gandiva_bow: { id: 'gandiva_bow', name: 'قوس البرق الأسطوري وسهام الضوء', slot: 'weapon', set: 'vedic', quality: 'Super', stats: { atk: 105 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'قوس بيلمع أول ما تشد وتره، وبيعمل سهام من طاقة نور ومانا صافية لوحده تلقائي.' },
    sudarshana_chakra: { id: 'sudarshana_chakra', name: 'قرص الضوء الدوار القاطع الجبار المحصن', slot: 'weapon', set: 'vedic', quality: 'Super', stats: { atk: 115 }, reqLevel: 27, reqStage: 'Core Formation', desc: 'ترس دائري مسنن من دهب ونور بيدور بسرعة خيالية ويقطع دروع ملوك الجن كأنه ورق.' },
    yudhisthira_crown: { id: 'yudhisthira_crown', name: 'تاج الصدق والعدالة المطلقة العالي البهي', slot: 'head', set: 'vedic', quality: 'Elite', stats: { def: 22, mp: 30 }, reqLevel: 17, reqStage: 'Foundation Establishment', desc: 'تاج بسيط ومحترم بيمثل الاستقامة والصدق، بيثبت تركيزك ويمنع الخوف والضياع.' },
    shiva_tandava_drums: { id: 'shiva_tandava_drums', name: 'طبلة إيقاع النبض والهمة والجسارة المتقدة', slot: 'relic', set: 'vedic', quality: 'Elite', stats: { atk: 30, speed: 8 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'طبلة صغيرة من خشب وجلد غزال، إيقاع دقاتها بيسرع حركتك وردود أفعالك البدنية والجسدية.' },
    naga_pearl_necklace: { id: 'naga_pearl_necklace', name: 'عقد لآلئ ملوك الأعماق والينابيع المباركة', slot: 'relic', set: 'vedic', quality: 'Refined', stats: { def: 12, hp: 30 }, reqLevel: 7, reqStage: 'Qi Condensation', desc: 'لآلئ زرقا طبيعية بتلمع في الضلمة جابها غواصين من أعماق بحور الجنوب المحروسة بالجان.' },
    dharma_wheel_ring: { id: 'dharma_wheel_ring', name: 'خاتم عجلة الحق والعدالة والصالحين والمؤمنين', slot: 'relic', set: 'vedic', quality: 'Refined', stats: { def: 6, mp: 15 }, reqLevel: 6, reqStage: 'Qi Condensation', desc: 'خاتم حديدي عليه نقش العجلة السباعية، بيفكر السالك بأهمية الصدق ونصرة المظلوم.' },
    rigveda_pages: { id: 'rigveda_pages', name: 'أوراق البردي العتيقة للحكمة البدنية والنقوش', slot: 'relic', set: 'vedic', quality: 'Elite', stats: { mp: 90 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'أوراق شجر قديمة منقوش عليها نقوش النور والارتقاء من عهد الحكماء الأوائل.' },
    somaras_flask: { id: 'somaras_flask', name: 'إبريق الشراب البدني البارد المنعش الحفيظ', slot: 'relic', set: 'vedic', quality: 'Normal', stats: { hp: 20 }, reqLevel: 2, reqStage: 'Qi Condensation', desc: 'إبريق فخار بيحفظ الشراب البدني والعشبي بارد ومنعش حتى في قلب هجير رمال الربع الخالي.' },
    garuda_feather_boots: { id: 'garuda_feather_boots', name: 'نعل الريش للطيران فوق التلال برقة الهوا', slot: 'boots', set: 'vedic', quality: 'Elite', stats: { def: 10, speed: 20 }, reqLevel: 11, reqStage: 'Foundation Establishment', desc: 'نعل مطرز بريش طائر الرعد، بيخلي خطواتك خفيفة جداً كأنك بتطير فوق رمال وحصى الصحرا.' },
    vajra_trousers: { id: 'vajra_trousers', name: 'سروال الصلابة الألماسية والثبات الجسدي', slot: 'legs', set: 'vedic', quality: 'Elite', stats: { def: 40 }, reqLevel: 16, reqStage: 'Foundation Establishment', desc: 'سروال منسوج بخيوط ألماسية صخرية، بيثبت السالك في مكانه وبيمنع وقوعه من ضربة الجاذبية.' },

    // === طقم الفرسان وطريق الحرير (Silk Road & Arabian Set) ===
    spirit_scimitar: { id: 'spirit_scimitar', name: 'سيف الفارس المبتدئ البدني الأصيل', slot: 'weapon', set: 'silk_road', quality: 'Normal', stats: { atk: 12 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'سيف فارس بسيط ومتزن مطعم بشعاع نور بدني خفيف.' },
    blade_of_badr: { id: 'blade_of_badr', name: 'سيف بدر المبارك المضيء لنور الصادقين', slot: 'weapon', set: 'silk_road', quality: 'Elite', stats: { atk: 45 }, reqLevel: 10, reqStage: 'Foundation Establishment', desc: 'سيف عريق مبارك بنور الفجر، شفرته بتلمع أول ما سالك صالح يمسكه بنية الخير.' },
    heaven_cleaving_sword: { id: 'heaven_cleaving_sword', name: 'سيف السماء الحاد القاطع العظيم الشان', slot: 'weapon', set: 'silk_road', quality: 'Super', stats: { atk: 120 }, reqLevel: 30, reqStage: 'Core Formation', desc: 'سيف أسطوري مبارك بيشاع منه نور سماوي شديد يقدر يقطع عواصف الكثبان والغي.' },
    spirit_turban: { id: 'spirit_turban', name: 'عمامة الفرسان المطرزة بالنقوش البدنية الأثيلة', slot: 'head', set: 'silk_road', quality: 'Refined', stats: { def: 5, mp: 10 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'عمامة حرير مطرزة بخيوط دهب ونور بتثبت حماية السالك.' },
    imamah_of_light: { id: 'imamah_of_light', name: 'عمامة الأنوار والتجلي المضيء لأولياء الصفا', slot: 'head', set: 'silk_road', quality: 'Elite', stats: { def: 15, mp: 40 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'عمامة بيضا ناصعة البياض بتنور في ليل الصحرا الصامت، بتزيد البصيرة والمانا.' },
    robe_of_zuhd: { id: 'robe_of_zuhd', name: 'عباءة السفر والصفاء البدني الخشنة المباركة', slot: 'body', set: 'silk_road', quality: 'Refined', stats: { def: 12, hp: 20 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'عباءة صوف خشنة وبسيطة جداً، بس بتمنح السالك حماية رهيبة بفضل قوة السفر والصفاء البدني.' },
    cloak_of_the_dervish: { id: 'cloak_of_the_dervish', name: 'عباءة الأبطال السالكة وسر الرياح والمدد', slot: 'body', set: 'silk_road', quality: 'Unique', stats: { def: 25 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'خرقة بطل خفيفة بتطير مع الهوا، بتخلي حركتك سريعة وصعب العدو يلمسك بضربة مباشرة.' },
    ihram_of_purity: { id: 'ihram_of_purity', name: 'رداء الطهر والنية البيضاء الجلالية', slot: 'body', set: 'silk_road', quality: 'Super', stats: { def: 60, hp: 150 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'رداء أبيض طاهر معطر ببركة الأوردة العريقة، بيحمي السالك الصالح من كيد شياطين الفراغ.' },
    dhikr_beads_iron: { id: 'dhikr_beads_iron', name: 'قلادة الحديد لتركيز وثبات القلوب المرتجفة', slot: 'relic', set: 'silk_road', quality: 'Normal', stats: { mp: 15 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'قلادة حديد تقيلة بتساعدك تركز في نقوش النور البدني أثناء التدريب والتركيز والقلعة والديوان.' },
    misbaha_of_the_saints: { id: 'misbaha_of_the_saints', name: 'قلادة الفرسان والصالحين الأثرية المعطرة بالبركة', slot: 'relic', set: 'silk_road', quality: 'Super', stats: { mp: 100, atk: 20 }, reqLevel: 20, reqStage: 'Foundation Establishment', desc: 'قلادة من خشب الصندل العتيق شالت بركة ونقوش فرسان كبار عبر مئات السنين.' },
    seal_of_solomon: { id: 'seal_of_solomon', name: 'خاتم سليمان للسيادة على الجان والرياح السبعة', slot: 'relic', set: 'silk_road', quality: 'Elite', stats: { atk: 15, mp: 20 }, reqLevel: 18, reqStage: 'Foundation Establishment', desc: 'خاتم نحاسي أثري منقوش عليه ختم الملك، بيدي هيبة وبيرعب شياطين وغيلان الربع الخالي.' },
    sandals_of_buraq: { id: 'sandals_of_buraq', name: 'خف البُراق السريع الخالد فوق جبال الرمل', slot: 'boots', set: 'silk_road', quality: 'Unique', stats: { def: 8, speed: 10 }, reqLevel: 10, reqStage: 'Qi Condensation', desc: 'خف حرير خفيف جداً منسوج بطاقة وسرعة براق الليل السريع.' },
    damascus_scimitar: { id: 'damascus_scimitar', name: 'سيف الفولاذ الدمشقي الأصيل المعرج الشفرة', slot: 'weapon', set: 'silk_road', quality: 'Elite', stats: { atk: 48 }, reqLevel: 11, reqStage: 'Foundation Establishment', desc: 'سيف دمشقي أصيل بنقوش المياه المتعرجة على حد شفرته، بيقطع الحرير الطاير في الهوا بسهولة.' },
    silk_scholar_headdress: { id: 'silk_scholar_headdress', name: 'عمامة دار الحكمة والعلوم وحساب الفلك النحيف', slot: 'head', set: 'silk_road', quality: 'Refined', stats: { def: 6, mp: 15 }, reqLevel: 6, reqStage: 'Qi Condensation', desc: 'عمامة بيلبسها علماء دار الحكمة وهم بيقيسوا حركة النجوم وأبعاد رمال واحات طريق الحرير.' },
    persian_lion_plate: { id: 'persian_lion_plate', name: 'درع الأسد الفارسي العتيق المنقوش بالذهب الأثيل', slot: 'body', set: 'silk_road', quality: 'Elite', stats: { def: 42, hp: 90 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'درع منقوش عليه رسم أسد بابل الدهبي، بيمثل الشجاعة والقوة العالية لفرسان الشرق.' },
    steppe_rider_pants: { id: 'steppe_rider_pants', name: 'سروال فرسان البادية الجلدي القاسي للحماية والركوب', slot: 'legs', set: 'silk_road', quality: 'Normal', stats: { def: 6 }, reqLevel: 1, reqStage: 'Qi Condensation', desc: 'سروال جلد جمل سميك ومحمي بيقيك من برد ليل الصحرا وقساوة سرج الحصان.' },
    boots_of_caravan_king: { id: 'boots_of_caravan_king', name: 'جزمة أمير قوافل الصحراء المتينة المحصنة', slot: 'boots', set: 'silk_road', quality: 'Elite', stats: { def: 12, speed: 14 }, reqLevel: 13, reqStage: 'Foundation Establishment', desc: 'جزمة جلدية عالية بتتحمل سخونة رمل الصحرا الحارقة وحصى ممرات جبل الطور الواعرة.' },
    amber_knight_necklace: { id: 'amber_knight_necklace', name: 'قلادة الكهرمان لفرسان الصحراء والسالكين ببريق النور', slot: 'relic', set: 'silk_road', quality: 'Refined', stats: { mp: 30 }, reqLevel: 8, reqStage: 'Qi Condensation', desc: 'خرز كهرماني دافي بيشاع منه نور هادي وبركة تطرد طاقة الشياطين.' },
    ring_of_al_khidr: { id: 'ring_of_al_khidr', name: 'خاتم الخالد الزمردي العتيق المليء بنقاء الحياة والخلود', slot: 'relic', set: 'silk_road', quality: 'Super', stats: { hp: 120, mp: 60 }, reqLevel: 26, reqStage: 'Core Formation', desc: 'خاتم من حجر الزمرد الصافي المبارك ببركة المرشد الخالد الجليل، بيشفي السالك ويغذيه بنور القلعة والديوان.' },
    glassmorphism_compass: { id: 'glassmorphism_compass', name: 'أسطرلاب الأنوار النحاسي البديع المخطط بالفلك البدني', slot: 'relic', set: 'silk_road', quality: 'Elite', stats: { def: 10, mp: 40 }, reqLevel: 12, reqStage: 'Foundation Establishment', desc: 'أسطرلاب نحاسي فخم بيقيس تدفق بركة وينابيع النور السحري بدقة بدل الاتجاهات الجغرافية.' },

    // === طقم الملاحم والأساطير الغربية (Classic Fantasy RPG Set) ===
    excalibur_shard: { id: 'excalibur_shard', name: 'شظية سيف الملوك الصخرية المباركة الغربية البهاء', slot: 'weapon', set: 'mythology', quality: 'Super', stats: { atk: 95 }, reqLevel: 24, reqStage: 'Core Formation', desc: 'شظية معدنية بتلمع من سيف غربي قديم كان بيمنع الكذب ويفرض الحق بنوره الجبار.' },
    aegis_shield: { id: 'aegis_shield', name: 'ترس ميدوسا المانع للصدمات والوهن واللعنات العريق', slot: 'relic', set: 'mythology', quality: 'Super', stats: { def: 55 }, reqLevel: 22, reqStage: 'Core Formation', desc: 'ترس برونزي ثقيل مرسوم عليه وجه جرجونة مرعب بيجمد حركة الأعداء اللي بيقربوا منك.' },
    muramasa_blade: { id: 'muramasa_blade', name: 'سيف الساموراي الملعون القاطع والنزيف الدائم الحامي', slot: 'weapon', set: 'mythology', quality: 'Super', stats: { atk: 110 }, reqLevel: 26, reqStage: 'Core Formation', desc: 'سيف كاتانا شرقي ملعون بيطلب المانا والدم عشان يقطع أي درع فولاذي قدامه.' },
    sandals_of_hermes: { id: 'sandals_of_hermes', name: 'خف الرياح المجنح الأسطوري الطاير بالسرعة الأنيقة', slot: 'boots', set: 'mythology', quality: 'Super', stats: { def: 14, speed: 30 }, reqLevel: 25, reqStage: 'Core Formation', desc: 'خف خفيف جداً عليه جناحين صغيرين بيخلوك تجري بسرعة الريح العاصفة.' },
    ring_of_nibelung: { id: 'ring_of_nibelung', name: 'خاتم ذهب الراين وقدر الفرسان الوهج القديم الموهوب', slot: 'relic', set: 'mythology', quality: 'Super', stats: { atk: 25, def: 25 }, reqLevel: 27, reqStage: 'Core Formation', desc: 'خاتم ذهبي ملعون وخطير بيدي صاحبه ثروة وجاه سحري فخم بس بيجيب معاه غضب الجن وسلاطين الظلام.' },
    boots_of_haste: { id: 'boots_of_haste', name: 'خف السرعة والمبادرة العاجلة وسط الغبار والصقيع', slot: 'boots', set: 'mythology', quality: 'Refined', stats: { def: 6, speed: 12 }, reqLevel: 5, reqStage: 'Qi Condensation', desc: 'خف مريح بيساعد السالك يفادي ضربات الأعادي ويتحرك بخفة الريش.' },
    draupnir_armlet: { id: 'draupnir_armlet', name: 'سوار الملوك المتضاعف السحري الدهبي الباعث بالدنانير', slot: 'relic', set: 'mythology', quality: 'Elite', stats: { def: 18, mp: 30 }, reqLevel: 15, reqStage: 'Foundation Establishment', desc: 'سوار ذهبي ثقيل بيتضاعف لوحده تلقائي، وبيحفظ جيوب السالك مليانة دنانير البركة.' },
    gungnir_replica: { id: 'gpgnir_replica', name: 'رمح الرمي الصائب المستهدف لنقاط الضعف والعظام', slot: 'weapon', set: 'mythology', quality: 'Elite', stats: { atk: 55 }, reqLevel: 14, reqStage: 'Foundation Establishment', desc: 'رمح رمي خفيف من خشب البلوط، مرة ما ترميه بيطير لوحده ويخترق نقاط ضعف العدو مباشرة.' },
    mjolnir_fragment: { id: 'mjolnir_fragment', name: 'شظية مطرقة الرعد والصواعق الجبارة المستقاة', slot: 'relic', set: 'mythology', quality: 'Super', stats: { atk: 45, mp: 50 }, reqLevel: 23, reqStage: 'Core Formation', desc: 'شظية حديدية من مطرقة زوابع وعواصف الشمال، شرارات الكهربا والبرق بتلعلع عليها باستمرار.' }
};
