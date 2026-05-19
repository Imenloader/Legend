// ============================================================
// LORE_PART2.JS — الجزء الثاني: أبطال الشرق، الأعداء، الغنائم ومحرك الشخصيات
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

// --- أبطال ورفاق الشرق التاريخيين والأساطير ---
const ARABIAN_HEROES = {
    tariq_ibn_ziyad: {
        id: 'tariq_ibn_ziyad',
        name: 'طارق قائد الفرسان الأبي',
        title: 'قائد غزاة الفجر ومحرق سفن التراجع',
        origin: 'crossroads',
        sprite: 'assets/tariq_ibn_ziyad.png',
        alignment: 'lawful_good',
        karmaRequirement: -100,
        affinity: 50,
        personality: 'fearless_commander',
        description: 'حرق سفن جيشه بالكامل على شطوط الأندلس عشان يمنع التراجع أو اليأس. مبيحاربش عشان يعيش وبس، بل عشان ينشر النور ويهزم الطغيان.',
        dialogue: {
            greet: [
                '"السفن اتحرقت يا سالك. مفيش رجوع، السكة قدامنا وبس. إنت معايا؟"',
                '"أنا عبرت بحار وكسرت حصون الملوك الطغاة. تفتكر كام عدو خايب هيوقفنا النهاردة؟!"'
            ],
            battle_cry: ['"احرقوا السفن! للآمااام بالحق!"', '"النصر أو الشهادة والخلود — طريق الفرسان فيهما شرف كبير!"'],
            high_affinity: '"أنا حاربت مع ملوك وقادة جيوش.. إنت همتك ونية قلبك فيها شرف ونبل أكتر منهم كلهم."',
            burn_ships_use: '"مفيش رجوع، ومبنتمناهوش أصلاً. هجووووم بالحق!"'
        },
        passiveBuff: { stat: 'atk', bonus: 0.20, label: '+20% هجوم أساسي. ممنوع الهروب من المعارك.' },
        uniqueAbility: {
            name: 'حرق سفن التراجع',
            mpCost: 0,
            description: 'لمدة 3 أدوار، كل ضرباتك بتسبب +50% ضرر، بس ممنوع الدفاع أو الهروب من ساحة القتال.',
            effect: 'berserker_mode'
        },
        questArc: 'الشاطئ السابع والعهد الأخير',
        secretMotivation: 'شايل في قلبه حزن على الفرسان اللي راحوا في الفتوحات القديمة، وبيدور على نصر أخير يعطي لموتهم معنى بطولي خالد.'
    },
    al_khidr: {
        id: 'al_khidr',
        name: 'المرشد الخالد الحكيم',
        title: 'صاحب عين البركة والهدى والفروسية الممتد',
        origin: 'empty_quarter',
        sprite: 'assets/al_khidr.png',
        alignment: 'true_neutral',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'cryptic_sage',
        description: 'بيظهر فجأة عند الأنهار، ومفترق الطرق، ولحظات الكوارث الكبرى. بيعمل حاجات تبان للناس العادية غلط — بس نهايتها دايماً خير وبركة وتركيز وهمة. مبيشرحش نواياه لحد بسهولة.',
        dialogue: {
            greet: [
                '"أنا عارف إنك هتغضب من أفعالي قبل ما الرحلة دي تخلص. بس كمل معايا برضه."',
                '"أنا مستنيك هنا عند مفترق الطرق ده بقالي تمانين سنة. وعارف إنك جاي من قبل ما تولد أصلاً."'
            ],
            cryptic_prophecy: [
                '"الجدار اللي باين ملوش لازمة ومكسور، تحته كنز كبير ليتيمين في المدينة بعد تلاتين سنة. سيبه واقف زي ما هو."',
                '"المركب اللي إنت عايز تكسرها وتغرقها؟ ثق في التدبير العظيم والبركة."'
            ],
            high_affinity: '"معظم اللي مشيوا معايا سابوني في غضب وضيق. إنت بدأت تفهم وتصبر. وده نادر جداً في زماننا."',
            appear_randomly: '"أنا ظهرت دلوقتي لأنك كنت على وشك تعمل غلطة أبدية تقفل قنوات نورك للأبد."'
        },
        passiveBuff: { stat: 'all', bonus: 0, label: 'بيظهر عشوائي لمنع الموت المفاجئ، وبيدي تلميحات أسطورية للمهام.' },
        uniqueAbility: {
            name: 'رِقية نبع الخلود الأبدي',
            mpCost: 50,
            description: 'بترجع الصحة والمانا بالكامل وبتشيل كل اللعنات عن السالك والرفيق. تستخدم مرة واحدة في Act.',
            effect: 'act_once_full_restore'
        },
        questArc: 'مجمع البحرين والسر الصافي',
        secretMotivation: 'بيختبر نية وقلب السالك عشان يشوف هل يستحق يستلم علم البركة الأكبر اللي يقدر ينهي الحرب بين العوالم.'
    },
    sinbad: {
        id: 'sinbad',
        name: 'السندباد البحري',
        title: 'صاحب الرحلات السبع وقاهر المحال والغيلان',
        origin: 'crossroads',
        sprite: 'assets/sinbad.png',
        alignment: 'chaotic_good',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'adventurous_merchant',
        description: 'ركب على ضهر طائر الرخ، وهرب من وادي الألماس، وتاجر مع الملوك والغيلان ومردة البحر. هو المفتاح لفتح منطقة بحر النور اللجي الأسطورية.',
        dialogue: {
            greet: ['"اقعد.. ارتاح واشرب شاي، وخليني أحكيلك عن الجزيرة اللي كانت حوت نايم قبل ما أقولك إحنا رايحين فين."'],
            unlock_sea: '"أنا عارف سكة وبوابات بحر النور اللجي. خطيرة؟ جداً وبحد السيف. تحب تخوض التجربة معايا؟"',
            battle_cry: ['"على طريقة الرحلة السابعة الأسطورية!"', '"أنا واجهت غيلان وحيتان أكبر من ده بكتير!"']
        },
        passiveBuff: { stat: 'exploration', bonus: 0, label: 'بيفتح منطقة بحر النور. وبيزود غنائم الكشوفات البحرية للضعف.' },
        uniqueAbility: {
            name: 'استدعاء طائر الرخ الجبار',
            mpCost: 40,
            description: 'بيستدعي طائر الرخ الأسطوري من السما عشان يشيلك فوق العقبات أو يضرب كل الأعداء بضرر هائل.',
            effect: 'area_damage_or_bypass'
        },
        questArc: 'الرحلة الثامنة والبر الثائر',
        secretMotivation: 'في رحلته السابعة، السندباد خسر شريكه المقرب في أعماق البحر. وبيدور على طريقة سحرية عشان يرجعه من وقتها.'
    },
    saladin: {
        id: 'saladin',
        name: 'السلطان صلاح الدين النبيل',
        title: 'سلطان النخوة وشرف الفرسان الأبية',
        origin: 'empty_quarter',
        sprite: 'assets/saladin.png',
        alignment: 'lawful_good',
        karmaRequirement: 50,
        affinity: 0,
        personality: 'chivalrous_ruler',
        description: 'حرر الديار والقدس من غير ما يقتل أو يغدر بالضعفاء أو يمسك مدني بسوء. بيعرف نخوة وشرف الفرسان كمنهاج حياة ورسالة فروسية كاملة.',
        dialogue: {
            greet: [
                '"أنا مبيقيس الفارس بانتصاراته وبس. أنا بقيسه بكيفية معاملته للأسرى والضعفاء اللي غلبهم."',
                '"المحن والابتلاءات بتعلم النفوس الطيبة أكتر بكتير من التمكين والجاه."'
            ],
            test_event: 'السلطان صلاح الدين بيحط قدامك جندي عدو مصاب وتعبان ومبيقولش حاجة. معاملتك للجندي ده هي اللي هتحدد هل هينضم لرحلتك كحليف وفي ولا لأ.',
            high_affinity: '"إنت بتفكرني باللي كنت بتمناه لنفسي في أيام شبابي. كمل على طريق الخير والعدل."'
        },
        passiveBuff: { stat: 'karma', bonus: 10, label: '+10 نقاط كارما وبركة مع كل معركة قتالية. بيفتح مهارات نخوة الفرسان.' },
        uniqueAbility: {
            name: 'نداء شرف الفرسان والنخوة',
            mpCost: 25,
            description: 'نداء بعهد الشرف بيخلي الأعداء ضعاف الهمة يستسلموا فوراً ويديك نقاط كارما وبركة إضافية.',
            effect: 'honorable_surrender'
        },
        questArc: 'العهد الميثاقي الذي لا ينكسر',
        secretMotivation: 'حزين بسبب معركة قديمة مقدرش يمنع فيها الغدر والدمار. ومحتاج عمل صالح عظيم يرجع السكينة لقلبه الصافي.'
    },
    antar_ibn_shaddad: {
        id: 'antar_ibn_shaddad',
        name: 'عنترة الفارس المغوار',
        title: 'سيف البادية الصامد وشاعر الحرب والجسارة',
        origin: 'crossroads',
        sprite: 'assets/desert_knight_1778872351281.png',
        alignment: 'lawful_good',
        karmaRequirement: 0,
        affinity: 0,
        personality: 'fearless_warrior',
        description: 'اتولد عبد بسيط، بس كسب حريته وود عبلة بعشرة آلاف غزوة وموقف نخوة وجسارة. هو أعظم شاعر وفارس قتالي في تاريخ البادية العريقة.',
        dialogue: {
            greet: [
                '"سيفي وقصايدي معمولين للي يستحقهم ونصرة المظلوم. تفتكر إنت مين فيهم؟"',
                '"أنا واجهت أسود وكتائب لوحدي في واد الرمال. الرحلة دي بالنسبة لينا زي النزهة الفخمة ببستان النور."'
            ],
            battle_cry: ['"عشان عبلة! عشان الشرف والكرامة!"', '"البادية والصحرا حافظة اسم عنترة وسيفه البتار!"'],
            high_affinity: '"أنا كان نفسي أكتب قصيدة فخر في جدعنتك، بس دم العدو على سيفك النهاردة أحلى وأبلغ من أي كلام!"'
        },
        passiveBuff: { stat: 'atk', bonus: 0.15, label: '+15% هجوم إضافي. قصائد الحماسة بتهز أعصاب وهمة الأعداء.' },
        uniqueAbility: {
            name: 'قصيدة الحماسة والجسارة',
            mpCost: 20,
            description: 'بتقلل هجوم الأعداء بـ 30% وتديك +20% زيادة ضرر وضياء لمدتين كاملين.',
            effect: 'debuff_enemy_buff_player'
        }
    },
    harun_al_rashid: {
        id: 'harun_al_rashid',
        name: 'الخليفة هارون الرشيد',
        title: 'سلطان الحكمة والعصر الذهبي للأنوار',
        origin: 'crossroads',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_neutral',
        karmaRequirement: 0,
        affinity: 0,
        personality: 'just_ruler',
        description: 'أشهر خلفاء ديوان الحكمة وبغداد العظمى، راعي بيت العلوم والأنوار البدنية. بيحكم بذكاء عالي، وجمع بين المنطق البدني والحكمة الفلسفية العميقة.',
        dialogue: {
            greet: [
                '"حبر العلماء والكتب البدنية أطهر عند مسار الخلود من دم الفرسان. افتكر ده كويس قبل ما تسحب سيفك."',
                '"أهلاً بيك في ديوان العصر الذهبي. حاول متكسرش أي تميمة أو إناء علم هنا."'
            ],
            high_affinity: '"أنا عندي مستشارين كتير بيكدبوا، بس الأصحاب الحقيقيين قليلين. إنت كسبت مقامك ومقعدك في ديواني."'
        },
        passiveBuff: { stat: 'xp', bonus: 0.15, label: '+15% زيادة في كسب الخبرة والبركة البدنية من كل المصادر.' },
        uniqueAbility: {
            name: 'بصيرة بيت الحكمة الكبرى',
            mpCost: 35,
            description: 'بيقرأ ويكشف كل حركات وخطط ورموز العدو ويقلل دفاعهم وقوتهم بـ 20% بالكامل.',
            effect: 'reveal_all_enemy_moves'
        }
    },
    ibn_battuta: {
        id: 'ibn_battuta',
        name: 'ابن بطوطة الرحالة',
        title: 'طائف الآفاق ومكتشف أسرار العوالم والطرق',
        origin: 'crossroads',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'true_neutral',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'curious_explorer',
        description: 'عبر أكتر من 75,000 ميل، وزار كل بلد وواحة وطريقة بدنية في أنحاء المعمورة. عارف كل السكك الضيقة والممرات السرية بين الأقاليم.',
        dialogue: {
            greet: [
                '"السفر والرحلة.. بيسيبوك مذهول وساكت الأول، وبعدين بيحولك لراوي حكايات حكيم."',
                '"أنا شفت آخر العالم وقمم السحاب. وشكلها مش مختلف كتير عن الواحة الجميلة دي."'
            ],
            high_affinity: '"من وسط كل السالكين اللي قابلتهم، جزمتك عليها تراب سكة غريب وجميل أوي. وراك حكاية."'
        },
        passiveBuff: { stat: 'speed', bonus: 0.1, label: 'تقليل فرصة وقوعك في فخ أو كمين بري، وفتح طرق وممرات سرية مختصرة.' },
        uniqueAbility: {
            name: 'خطوة طائف الآفاق السريعة',
            mpCost: 30,
            description: 'تأمل وحركة خاطفة بتخليك تفادي وتتجنب هجمات العدو بالكامل لمدتين ورا بعض.',
            effect: 'perfect_dodge_2'
        }
    },
    al_jazari: {
        id: 'al_jazari',
        name: 'الحكيم الجزري المهندس',
        title: 'صانع العجائب النحاسية ومحرك التماثيل البدنية',
        origin: 'crossroads',
        sprite: 'assets/al_jazari.png',
        alignment: 'neutral_good',
        karmaRequirement: -100,
        affinity: 0,
        personality: 'inventive_engineer',
        description: 'عبقري الميكانيكا والآلات الأثرية النحاسية. اخترع الساعات المائية، والتماثيل الآلية اللي بتتحرك بنور المانا والتروس البدنية. يقدر يصلح أي سلاح مكسور.',
        dialogue: {
            greet: [
                '"الكون كله والبرية شغالين بتروس منظمة زي الساعة لو بصيت من قريب."',
                '"عايز تصلح تميمة أو سلاح؟ أنا أقدر أصلح حتى النواة الباطنية المنكسرة لو معايا التروس الصح."'
            ]
        },
        passiveBuff: { stat: 'def', bonus: 0.1, label: '+10% دفاع دائم وتصليح مجاني وتطوير أسرع للعتاد بمصفوفة الصقل.' },
        uniqueAbility: {
            name: 'درع التروس النحاسية الحامي',
            mpCost: 25,
            description: 'بيصنع درع ترس نحاسي ميكانيكي أوتوماتيكي بيمتص الـ 30 ضربة وجرح جايين بالكامل.',
            effect: 'damage_shield'
        }
    },
    fatima_al_fihri: {
        id: 'fatima_al_fihri',
        name: 'الشيخة فاطمة القروية',
        title: 'أم المعارف ومؤسسة دار الخيمياء والعلوم الباطنية',
        origin: 'crossroads',
        sprite: 'assets/sufi_mystic_1778872363338.png',
        alignment: 'lawful_good',
        karmaRequirement: 10,
        affinity: 0,
        personality: 'scholarly_determined',
        description: 'بنت أول جامعة ومدرسة علوم ومقر للطب بالمعمورة. لا تحارب بالسيوف الحادة — هي تحارب بالبصيرة والعلم النقي. تفتح ورشة الخيمياء والأعشاب الباطنية.',
        dialogue: {
            greet: [
                '"العلم وطاقة التشي هما الشيء الوحيد الذي لا يستطيع مخلوق أخذه منك بالقوة. أتريد أن أعلمك؟"',
                '"ريشة الكاتب والفقيه أمضى وأبقى بكتير من سيف الفارس. ولو إن السيف ساعات بيبقى مطلوب الأول للعدل."'
            ],
            unlock_alchemy: '"أنا دونت وكتبت خواص كل عشبة نور ونبتة سحرية في طريق الحرير. تعال أعلمك كيف تمزجها وتحضرها سوا."',
            high_affinity: '"أسئلتك أصبحت أعمق في كل مرة نلتقي فيها. هذا دليل على أن بصيرتك وطاقتك الباطنية بدأتا ترتقيان للعلم الصافي."'
        },
        passiveBuff: { stat: 'mp', bonus: 0.25, label: '+25% طاقة باطنية قصوى. تفتح وصفات خيميائية نادرة بمرجل الخيمياء.' },
        uniqueAbility: {
            name: 'بصيرة ديوان المعارف الأكبر',
            mpCost: 30,
            description: 'دراسة سريعة للعدو بتكشف كل حركاته ورموزه ونقاط ضعفه وقنوات طاقته بالكامل.',
            effect: 'reveal_all_enemy_moves'
        }
    }
};

// --- قائمة غيلان وأعداء الصحراء والجن ---
const ARABIAN_ENEMIES = {
    desert_ghoul: {
        id: 'desert_ghoul',
        name: 'غيلان الربع الخالي',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 70, baseAtk: 16, xpReward: 55,
        description: 'مخلوقات برية مسخوطة بتاكل لحم الموتى والتايهين. تقدر تتشكل في صورة سالك وفيّ ضال عشان تغدر بيك وسط الرمل.',
        moves: {
            heavy: { name: 'هبدة كسر العظام الصحراوية', text: 'الغول بيشيل قناعه ويضربك بقبضة خشنة بتكسر دروعك الفانية.' },
            fast: { name: 'اندفاعة مخالب الغدر الخاطفة', text: 'بيظهر فجأة بوش صاحب قديم ليك عشان يعدي دفاعك ويسرق دمك.' },
            magic: { name: 'تقليد صرخة الأطياف', text: 'بيقلد صوت حد وفي ليك، فبيشتت تركيزك ويخليك تفوت دورك.' }
        },
        weakness: 'spiritual_sense_reveals_disguise',
        loot: ['Ghul\'s Shed Skin', 'Stolen Traveler\'s Ring', 'Shapeshifter Core'],
        dialogue: '"(بيقلد صوت والدتك الحنين..) تعال يا بني.. ارتاح هنا في حضني.. أنا مش هأذيك..."'
    },
    ifrit: {
        id: 'ifrit',
        name: 'عفريت النيران المتمرد الجبار',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 140, baseAtk: 28, xpReward: 110,
        description: 'اتخلق من نار السموم والكبريت الحامي من قبل عهد البشر بآلاف السنين. مش شرير بطبعه — بس قديم وغاضب ومبيحبش حد يزعج صومعته.',
        moves: {
            heavy: { name: 'إعصار جحيم النيران الماحي', text: 'بيسحب عمود من نار الكبريت من باطن الأرض مباشرة تحت رجلك.' },
            fast: { name: 'ومضة لهب الكبريت المباغتة', text: 'بيتحول لشرارات لهب طايرة ويظهر فجأة وراك جوة درعك الحامي.' },
            magic: { name: 'طلسم عقد عهد الجن الأزرق', text: 'بيحاول يقيد تركيزك وهمتك بطلسم عهد جن ملعون: لو وافقت بتكسب مانا بس بتخسر بركة وكارما.' }
        },
        weakness: 'zamzam_water_or_water_qi',
        nonCombatOption: 'قدم ليه ماء بئر زمزم البدني النقي أو تميمة جلال طيبة. بيطلب مهارة السالك المتصوف أو كارما عالية جداً لتهديته بسلام.',
        loot: ['Smokeless Flame Ember', 'Ifrit\'s Binding Ring', 'Jinn-Sealed Vessel'],
        dialogue: '"أنت تتحدى كائناً أقدم من سلالتك الفانية بالكامل! اشرح نيتك فوراً — وإلا ستحترق حطباً!"'
    },
    whispering_shaitan: {
        id: 'whispering_shaitan',
        name: 'شياطين الوسواس الخناس بالبرية',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 60, baseAtk: 20, xpReward: 65,
        description: 'متقدرش تشوفه بعينك الفانية. بتسمع وسوسته وهمسه في ودانك بس. بيقولك كلام يهد عزمك ويشكك في إيمانك ونورك البدني.',
        moves: {
            heavy: { name: 'ثقل وسواس الشك والندم', text: '"إنت فاشل وعمرك ما هترتقي للسيادة والفروسية." هجومك بيقل للنص لدور كامل من الإحباط.' },
            fast: { name: 'خيال خيانة الأصحاب والرفاق', text: 'بيوريك ورموز وش أصحابك كأنهم أعداء، فتضرب غلط وتضيع دورك.' },
            magic: { name: 'عقد وساوس الجاه والذهب', text: 'بيعرض عليك جاه زائف: لو قبلت بتاخد صحة بس بتخسر 20 نقطة كارما وبركة.' }
        },
        weakness: 'dhikr_chanting_or_high_karma',
        loot: ['Whisper Fragment', 'Corrupted Thought Shard'],
        dialogue: '"إنت عارف حقيقتك الطينية الضعيفة كويس.. أنا الوحيد الجدع اللي بقولهالك في وشك وبصراحة!"'
    },
    marid_soldier: {
        id: 'marid_soldier',
        name: 'حارس ديوان مردة البحر الأزرق',
        region: 'brass_city',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 110, baseAtk: 24, xpReward: 85,
        description: 'جن مائي قوي من مردة الأعماق، مربوط بعهد طاعة أزلي لحماية ديوان ملك المردة القديم مُرقَباد. ماسك حربة نحاسية مباركة بضغط المحيط الرهيب.',
        moves: {
            heavy: { name: 'دكة طوفان المحيط الجبارة', text: 'بيهبد حافته النحاسية في الأرض، وبيطلق موجة ضغط مائي بتهد دروعك.' },
            fast: { name: 'خطوة تيار الماء المتدفق الخاطفة', text: 'بيتحرك بخفة المية حوالين ضربتك ويطعنك من الزاوية الميتة.' },
            magic: { name: 'عقد قيد الأمواج الزرقاء', text: 'سلسلة مية سحرية بتلف حوالين رجلك وقنوات مانا تركيزك وهمتك وتسحب طاقتك تلقائي.' }
        },
        weakness: 'earth_qi_or_interrupt',
        loot: ['Marid Guard Trident Fragment', 'Ocean Pressure Crystal', 'Jinn Binding Chain'],
        dialogue: '"بأمر ملك المردة المعظم مُرقَباد — خطوتك اتقطعت هنا وممنوع تعدي البوابات دي للأبد."'
    },
    sand_wraith: {
        id: 'sand_wraith',
        name: 'أطياف رمال الصحراء التائهة',
        region: 'empty_quarter',
        sprite: 'assets/desert_ghoul_1778872388305.png',
        baseHp: 50, baseAtk: 15, xpReward: 40,
        description: 'طيف سالك ضاع ومات وحيد في الصحرا الكبيرة بسبب حر الشمس والعطش. عايز يسحب أي سالك تاني لنفس نهايته الموحشة عشان يونس وحدته بس.',
        moves: {
            heavy: { name: 'طمر الكثبان الرملية القاسية', text: 'بيتحكم في الرمل ويحاول يدفن رجلك ويهد هيكلك الطيني.' },
            fast: { name: 'ومضة سراب الكثبان الرملية', text: 'بيتحول لسراب هوا سخن ويضربك من زاوية خيالية صعبة الصد.' },
            magic: { name: 'عطش وحيرة ليل الصحراء الصامت', text: 'هجير ونشفان ريق رهيب بيخلي مانا تركيزك وهمتك تتسرب وهمتك تقع.' }
        },
        weakness: 'water_or_speak_their_name',
        nonCombatOption: 'لو قرأت مذكرات رحال قديم وعرفت اسمه وندهت عليه، الطيف بيهدى ويرحل في سلام ويديك كنز بدني وكارما عالية.',
        loot: ['Sand Wraith Essence', 'Lost Traveler\'s Journal'],
        dialogue: '"...متمشيش وتسبني... أرجوك... الصحرا ضلمة أوي بليل والوحدة بتموت..."'
    }
};

// --- جداول الغنائم والكنوز الموزعة حسب الأقاليم ---
const LOOT_TABLES = {
    crossroads_loot: [
        { rarity: 'Common', css: 'loot-common', chance: 0.55, items: ['Iron Merchant\'s Sword', 'Road-worn Amulet', 'Sack of Silk Coins'] },
        { rarity: 'Rare', css: 'loot-rare', chance: 0.25, items: ['Crossroads Spirit Compass', 'Merchant Prince\'s Ring'] },
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Silk Road Map Fragment', 'Desert Scholar\'s Tome'] },
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
        { rarity: 'Epic', css: 'loot-epic', chance: 0.12, items: ['Antar\'s Battle Poem Tablet', 'Ifrit-Forged Scimitar', 'Desert Focus Ring'] },
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

// --- محرك توليد الشخصيات العشوائية وعابري السبيل بالبرية ---
const NPC_ENGINE = {
    fixed_npcs: {
        ibrahim_blacksmith: {
            id: 'ibrahim_blacksmith',
            name: 'المعلم إبراهيم الحداد',
            title: 'شيخ طائفة صناع الفولاذ الدمشقي العريق',
            location: 'crossroads',
            dialogue: '"الفولاذ الدمشقي مش مجرد حديد ناشف يا بني. ده كتابة ونقوش بتتكتب بالنار والتلج والبركة البدنية. هاتلي خامات صح وهوريك العجب!"'
        },
        zubaida_alchemist: {
            id: 'zubaida_alchemist',
            name: 'الشيخة زبيدة العارفة بمسار الخلود',
            title: 'حامية سر لوح الكيمياء والأنوار الزمردية',
            location: 'crossroads',
            dialogue: '"كل حاجة في الدنيا بتدور على أصلها ونقاء جوهرها. الكيمياء والطب هما بس الطرق اللي بتسرع الرحلة دي. وتمنع فرقعة الإناء برضه. غالباً يعني!"'
        }
    },
    chinese_names: ['لي وي', 'جين هوا', 'باو تشاي', 'تشن غونغ', 'شيويه يي', 'الشيخ ما', 'غوي ينغ', 'فينغ يون', 'لونغ مي', 'زي شوان', 'تيان باو', 'شان هو'],
    arabian_names: ['طارق', 'فاطمة', 'زيد', 'الحسن', 'خديجة', 'هارون', 'رشيد', 'زينب', 'ليلى', 'عمر', 'صفية', 'بلال', 'عمرو', 'مريم'],
    chinese_titles: ['خيميائي فارس بمقام التمكين البدني', 'معلم طريقة عرق التركيز اللطيفة', 'سالك السيف الطائر الهائم بالبراري', 'شيخ خلوة ديوان فرسان جبل الطور', 'سالك حر من شيوخ البرزخ المتمردين', 'صاحب أوراد طائفة الفراغ المظلمة', 'بطل تطهير الجسد والهيكل الفولاذي'],
    arabian_titles: ['الفارس الهائم بطريق السكينة والصبر', 'فارس الصحراء المغوار حارس القافلة', 'القاضي الفاسد الجشع بالبازار', 'بطل سالك بالربع الخالي العظيم', 'حكيم فلكي صاحب تمائم ربط الجان المطيع', 'أمير بازار القوافل الأثرية النحاسية', 'الحكيم الطبيب الجوال بطريق الحرير البدني'],
    visual_hooks: [
        'عيونه بتلمع زي السَبج والحديد المصقول، وبتعكس أنوار سحرية غريبة مش من دنيتنا',
        'لابس عباية منسوجة بخيوط دهب ونور ورمل الصحرا المبروك اللي عمره ما يتكسر أو يوسخ',
        'جلده مليان ندوب على شكل بروق وصواعق من أثر اختبار وتجربة رعد السماء القديمة',
        'ماسك في إيديه مسبحة عود معطرة حباتها بتهمس وتسبح لوحدها بقوة باطنية جبارة',
        'بيطير فوق الأرض وخطوته مرتفعة تلات صوابع بالتمام والكمال كالأولياء والفرسان الصالحين',
        'شايل سيف قديم وعريق يد مقبضه ممسوحة وناعمة من كتر سحبه وحسم المعارك بالحق والعدل',
        'لابس عباءة زاهد خشنة وفي نفس الوقت عمامة خضراء فخمة كأنه بينتمي لعالمين مع بعض',
        'زرع بلورات يشم وزمرد في عقلة صوابعه، بتنور مع كل نبضة قلب وحركة يد بدنية',
        'في جبهته أثر سجود ونور، بس ظله بيتحرك لوحده على الحيطة بنقاء وبصيرة غامضة'
    ],
    secrets: [
        'بيدور في السر على السالك الشرير اللي دمر خلوته وقلعة وديوان أهله زمان.',
        'بيحارب جواه لعنة دم جن أزرق ملعونة بتثور عليه بليل ولازم يكتمها بالأذكار.',
        'عارف مكان وراي بئر بركة الخالد السري اللي فيه غنائم أسطورية مباركة.',
        'هو في الحقيقة مارد جن متشكل في صورة بشر عشان يختبر شرف ونخوة السالكين الأبرار.',
        'شايل وصية وعهد قديم مش قادر يسلمه لأن اللي مكتوب باسمه مات من 200 سنة.',
        'هو في الأصل تنين رمل عتيق متشكل في زي بطل بسبب زهقه الشديد من الخلود الصامت.',
        'كان الفارس المقرب اللي هرب وغدر بأحد رفاقك الخالدين زمان وحاسس بالذنب.',
        'شغال جاسوس لحساب القاضي الفاسد وهيغدر بالقافلة لو سالكك مكشفوش وعاقبه.'
    ],
    motivations_hostile: [
        'عايز يسرق نواتك البدنية وقناتك النورانية عشان يصلح قنواته اللي فرقعت زمان.',
        'مأجور من قلعة وديوان شريرة منافسة عشان يقطع طريق السالكين والزهاد بالواحة.',
        'مربوط بعهد دم جن أزرق ملعون بيجبره يحارب أي سالك نوراني يمر من الممر ده.',
        'افتكرك بغباء وبدون تثبت الشخص الشرير اللي دمر عيلته وغدر بيهم زمان وعايز ينتقم.'
    ]
};

// --- التصدير العام والد مج لمحرك الأساطير ---
window.LORE = Object.assign(window.LORE || {}, {
    ARABIAN_HEROES,
    ARABIAN_ENEMIES,
    LOOT_TABLES,
    NPC_ENGINE,
    getAllHeroes: function() { 
        return { 
            ...(this.CHINESE_HEROES || {}), 
            ...(this.ARABIAN_HEROES || {}),
            ...(this.MYTH_HEROES || {}),
            ...(this.EXTRA_HEROES || {})
        }; 
    },
    getAllEnemies: function() { 
        return { 
            ...(this.CHINESE_ENEMIES || {}), 
            ...(this.ARABIAN_ENEMIES || {}),
            ...(this.CROSSROADS_ENEMIES || {})
        }; 
    },
    getRegionEnemies: function(regionId) {
        const all = Object.values(this.getAllEnemies());
        return all.filter(e => e.region === regionId);
    },
    getLootTable: function(regionId) {
        const region = this.REGIONS ? this.REGIONS[regionId] : null;
        return (region && this.LOOT_TABLES) ? (this.LOOT_TABLES[region.lootTable] || this.LOOT_TABLES['crossroads_loot']) : null;
    }
});
