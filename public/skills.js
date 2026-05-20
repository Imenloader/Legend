// ============================================================
// SKILLS.JS — الفنون البدنية والقتالية لفرسان الشرق
// "ملحمة الشرق الساحر: مخطوطة اليقين والأساطير الشرقية"
// ============================================================

window.SKILLS = {
    // Database of 100 completely unique learnable techniques
    techniques: {
        // --- الفنون الخاصة بسلالات المولد والمنشأ والأولية (Level 1 Starter Skills) ---
        'dust_fist': { id: 'dust_fist', name: 'قبضة التراب الكادحة', desc: 'ضربة باطنية من قهر الفقراء تسبب 1.3x ضرر وتعطل دقة هجوم الخصم بنسبة 25% لدورين.', mpCost: 5, power: 1.3, debuff: { atk: -0.25, duration: 2 }, type: 'fast', reqLvl: 1 },
        'sham_blade': { id: 'sham_blade', name: 'سيف النور الشامي', desc: 'ضربتان متتاليتان خاطفتان بنصل من الفولاذ الدمشقي تسببان 1.6x ضرر كلي.', mpCost: 12, power: 1.6, type: 'fast', reqLvl: 1 },
        'wolf_claw': { id: 'wolf_claw', name: 'مخلب الذئب البري', desc: 'مزقة قوية بأظافر حادة كالخنجر تسبب 1.4x ضرر وتحدث نزيفاً باطنياً مستمراً لـ 3 أدوار.', mpCost: 10, power: 1.4, dot: { dmg: 12, duration: 3 }, type: 'heavy', reqLvl: 1 },
        'lotus_strike': { id: 'lotus_strike', name: 'ضربة الياسمين الوهيجة', desc: 'وابل خاطف من الضربات السريعة والمتعاقبة بنصلك المضيء تسبب 1.5x ضرر.', mpCost: 10, power: 1.5, type: 'fast', reqLvl: 1 },

        // --- المهارات المبكرة والبدنية العامة (Levels 2-10) ---
        'crescent_sweep': { id: 'crescent_sweep', name: 'ضربة هلال الصحراء الخاطفة', desc: 'ضربة قوسية واسعة بحد النصل تضرب بقوة 1.4x ضرر وتسبب خفض دفاع الخصم 10% لدورين.', mpCost: 8, power: 1.4, debuff: { def: -0.1, duration: 2 }, type: 'fast', reqLvl: 2 },
        'shadow_step': { id: 'shadow_step', name: 'خطوة الطيف الصحراوي', desc: 'تزيد فرصة تفادي ضربات الأعداء وتجنب الهجمات بنسبة 20% لـ 3 أدوار قتالية.', mpCost: 15, effect: { dodge: 0.2, duration: 3 }, type: 'buff', reqLvl: 3 },
        'badr_blessing': { id: 'badr_blessing', name: 'عزيمة التركيز والصلابة الصافية', desc: 'تركيز بدني صافي يستعيد 30% من نقاط الصحة القصوى فوراً.', mpCost: 30, heal: 0.3, type: 'magic', reqLvl: 3 },
        'bedouin_grit': { id: 'bedouin_grit', name: 'صلابة البدو وعزيمة الصمود', desc: 'عزيمة مستوحاة من رماح البادية تزيد دفاعك بنسبة 25% لـ 3 أدوار قتالية.', mpCost: 12, effect: { defBuff: 1.25, duration: 3 }, type: 'buff', reqLvl: 4 },
        'mountain_peak_cleave': { id: 'mountain_peak_cleave', name: 'شطر الصخرة والقمم الفولاذي', desc: 'ضربة غاشمة هائلة تسحق دروع الخصم وتهز بنيانه بالكامل تسبب 2.2x ضرر.', mpCost: 20, power: 2.2, type: 'heavy', reqLvl: 5 },
        'sand_veil': { id: 'sand_veil', name: 'رداء الرمال الباردة الحامي', desc: 'حاجز من غبار الكثبان يرفع فرصة التفادي بنسبة 25% لـ 2 أدوار قتالية.', mpCost: 14, effect: { dodge: 0.25, duration: 2 }, type: 'buff', reqLvl: 5 },
        'falcon_descent': { id: 'falcon_descent', name: 'انقضاض صقر شاهين الكاسر الحاد', desc: 'فن رماية متقن ينقض به الصقر لشق ثغرة بنقاط الضعف، يسبب 2.0x ضرر قاصم ونسبة ضربة قاضية عالية.', mpCost: 15, power: 2.0, type: 'fast', reqLvl: 6 },
        'dune_crest': { id: 'dune_crest', name: 'وثبة ذروة الكثبان الصحراوية', desc: 'تزيد من سرعة تحرك الفارس وتمنحه زيادة 15% هجوم في الدور التالي.', mpCost: 10, effect: { atkBuff: 1.15, duration: 2 }, type: 'buff', reqLvl: 7 },
        'earth_shatter': { id: 'earth_shatter', name: 'زوبعة دكة الأرض الرهيبة', desc: 'ضربة ززلزالية عنيفة للأرض تشل حركة العدو مذهولاً بنسبة 30% وتسبب 2.5x ضرر.', mpCost: 25, power: 2.5, stunChance: 0.3, type: 'heavy', reqLvl: 8 },
        'bazaar_tactics': { id: 'bazaar_tactics', name: 'دهاء تاجر درب الحرير وفنون المفاوضة', desc: 'تكتيك باطني يشتت انتباه الأعداء بالدينار والذهب، يقلل دفاع الخصم بنسبة 35% لـ 4 أدوار قتالية.', mpCost: 18, debuff: { def: -0.35, duration: 4 }, type: 'buff', reqLvl: 8 },
        'desert_sarab': { id: 'desert_sarab', name: 'مكر سراب البادية المتلألئ الخاطف', desc: 'حيلة قتالية بدوية، تظهر كطيف سراب يشتت تركيز العدو ويزيد فرصة التفادي بنسبة 50% لـ 3 أدوار.', mpCost: 20, effect: { dodge: 0.5, duration: 3 }, type: 'buff', reqLvl: 9 },
        'caravan_guard': { id: 'caravan_guard', name: 'حراسة الركب وتأمين السبيل', desc: 'ضربة دفاعية فولاذية تحمي قوافل الشرق وتضرب الخصم بقوة 1.8x ضرر مع استعادة 10 عزيمة.', mpCost: 5, power: 1.8, type: 'heavy', reqLvl: 9 },
        'spirit_surge': { id: 'spirit_surge', name: 'فيض طاقة مقر الطائفة', desc: 'قدرة كامنة: +10% سرعة استرجاع الطاقة البدنية والتركيز.', passive: true, stat: 'mpRegen', bonus: 0.1, reqLvl: 10 },

        // --- المهارات المتوسطة وفنون المبارزة الصافية (Levels 11-20) ---
        'damascus_wall': { id: 'damascus_wall', name: 'جدار الصفيح الدمشقي الحصين المنيع', desc: 'تكتيك دفاعي فولاذي يستند لمتانة الحديد والشهب، يقلل هجوم الخصم بنسبة 50% لـ 3 أدوار.', mpCost: 25, debuff: { atk: -0.5, duration: 3 }, type: 'buff', reqLvl: 11 },
        'mirage_strike': { id: 'mirage_strike', name: 'ضربة السراب اللامع المشتتة', desc: 'ضربة باطنية من نصل مضلل يضرب 1.9x ضرر ويعطل هجوم العدو بنسبة 20% لـ 2 أدوار.', mpCost: 15, power: 1.9, debuff: { atk: -0.2, duration: 2 }, type: 'fast', reqLvl: 11 },
        'blood_qi_burst': { id: 'blood_qi_burst', name: 'غليان عروق الفرسان الحامية', desc: 'تضحية طاهرة بـ 10% من جوهر الصحة لمضاعفة الهجوم بنسبة 50% في الدور التالي.', mpCost: 0, hpCost: 0.1, effect: { atkBuff: 1.5, duration: 2 }, type: 'buff', reqLvl: 12 },
        'iron_bone_body': { id: 'iron_bone_body', name: 'هيكل الحديد والصلابة الصخرية', desc: 'قدرة كامنة: +15% زيادة للصحة والتحمل الأقصى.', passive: true, stat: 'maxHp', bonus: 0.15, reqLvl: 12 },
        'oasis_dew': { id: 'oasis_dew', name: 'ندى الواحة الحامي من الهلاك', desc: 'جرعة من مياه الواحة المصفاة بالأعشاب الطبية تستعيد 40% من صحة الفارس.', mpCost: 25, heal: 0.4, type: 'magic', reqLvl: 13 },
        'furusiyya_charge': { id: 'furusiyya_charge', name: 'صولة الفروسية الهلالية الجسورة', desc: 'صولة فارس يركب خيلاً كحيلاً أصيلاً، يندفع بقوة 2.8x ضرر ويشل حركة الخصم لدورين بنسبة 45%.', mpCost: 35, power: 2.8, stunChance: 0.45, type: 'heavy', reqLvl: 14 },
        'heavenly_rain': { id: 'heavenly_rain', name: 'عاصفة السيوف السلطانية الهابطة', desc: 'إعصار من شظايا السيوف الفولاذية المنهمرة على الأعداء تسبب 3.5x ضرر.', mpCost: 40, power: 3.5, type: 'magic', reqLvl: 15 },
        'scimitar_gale': { id: 'scimitar_gale', name: 'عاصفة السيوف الهوائية السريعة', desc: 'فولاذ دمك بالرياح يضرب ضربتين بقوة 2.1x ضرر إجمالي ونسبة ضربة قاضية عالية.', mpCost: 22, power: 2.1, type: 'fast', reqLvl: 15 },
        'dhikr_trance': { id: 'dhikr_trance', name: 'تركيز السكينة والهدوء الباطني', desc: 'جلسة تركيز وسكينة باطنية حكيمة، تستعيد 50% من صحتك وتزيد تفاديك للضربات بنسبة 30% لـ 3 أدوار.', mpCost: 40, heal: 0.5, effect: { dodge: 0.3, duration: 3 }, type: 'magic', reqLvl: 16 },
        'iron_anchor': { id: 'iron_anchor', name: 'مرساة الفرسان الفولاذية الراسخة', desc: 'وقفة قتالية صلبة تزيد دفاعك بنسبة 35% وتمنحك مناعة ضد الشلل لدورين.', mpCost: 18, effect: { defBuff: 1.35, duration: 2 }, type: 'buff', reqLvl: 17 },
        'dragon_roar': { id: 'dragon_roar', name: 'صرخة مارد النار الزاجر', desc: 'صرخة باطنية مهيبة تشل حركة العدو تماماً وتسبب ثلاثة أضعاف الضرر 3.0x.', mpCost: 50, power: 3.0, stunChance: 1.0, type: 'heavy', reqLvl: 18 },
        'sword_intent': { id: 'sword_intent', name: 'همة السيف الدمشقي العازمة', desc: 'قدرة كامنة: +20% ضرر للضربات القاضية البديعة.', passive: true, stat: 'critDmg', bonus: 0.2, reqLvl: 18 },
        'damascus_edge': { id: 'damascus_edge', name: 'حد السيف الدمشقي الحاسم', desc: 'قدرة كامنة: +10% زيادة دائمة لقوة الهجوم والضرب الباطني.', passive: true, stat: 'atk', bonus: 0.1, reqLvl: 19 },

        // --- المهارات المتقدمة وتكتيكات الجيش وحماية الواحات (Levels 21-40) ---
        'shield_wall': { id: 'shield_wall', name: 'ترس الفولاذ وسد ثغور البادية', desc: 'ترفع دفاعك بنسبة 40% وتقلل هجوم العدو بنسبة 20% لـ 3 أدوار قتالية.', mpCost: 20, effect: { defBuff: 1.4, duration: 3 }, debuff: { atk: -0.2, duration: 3 }, type: 'buff', reqLvl: 21 },
        'void_step': { id: 'void_step', name: 'ومضة حركة المباغتة', desc: 'حركة طيفية خاطفة تتجنب بها كافة أشكال الهجوم تماماً لدور كامل.', mpCost: 45, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 22 },
        'eternal_breath': { id: 'eternal_breath', name: 'أنفاس الصمود الممتدة', desc: 'قدرة كامنة: تستعيد 5% من صحتك وطاقتك البدنية تلقائياً مع كل دور في المعركة.', passive: true, stat: 'hpRegen', bonus: 0.05, reqLvl: 22 },
        'firasah_gaze': { id: 'firasah_gaze', name: 'فراسة العقل وكشف نوايا المبارز', desc: 'بصيرة ذهنية دقيقة ترفع فرصة ضرباتك القاضية بنسبة 15% لـ 3 أدوار.', mpCost: 15, effect: { critBuff: 0.15, duration: 3 }, type: 'buff', reqLvl: 23 },
        'astrolabe_glow': { id: 'astrolabe_glow', name: 'وهج النجوم الباطني الحفيظ', desc: 'توجيه طاقة الأسطرلاب لتضرب العدو بقوة 2.7x ضرر مشع وتمنع تفاديه تماماً.', mpCost: 30, power: 2.7, type: 'magic', reqLvl: 24 },
        'sun_incineration': { id: 'sun_incineration', name: 'لهب البروق السبعة المحرق', desc: 'تركيز بدني باطني جبار يحرق الخصم بلهب حارق مستمر لـ 5 أدوار قتالية.', mpCost: 60, power: 5.0, dot: { dmg: 18, duration: 5 }, type: 'magic', reqLvl: 25 },
        'star_alignment': { id: 'star_alignment', name: 'محاذاة كواكب الصحراء الحامية', desc: 'تنسيق قنوات العزيمة وفق النجوم يزيد تفاديك 35% وهجومك 20% لـ 3 أدوار.', mpCost: 28, effect: { dodge: 0.35, atkBuff: 1.2, duration: 3 }, type: 'buff', reqLvl: 26 },
        'herbal_infusion': { id: 'herbal_infusion', name: 'إكسير شيوخ الواحة العتيق الشافي', desc: 'شراب دافئ يستخلص من أعشاب البركة لشفاء 60% من جروح الجسد.', mpCost: 35, heal: 0.6, type: 'magic', reqLvl: 27 },
        'zulfiqar_fury': { id: 'zulfiqar_fury', name: 'غضب نصل ذي الفقار الحاسم الماحق', desc: 'فن سيف الخلود القاطع للظلام، يستحضر طاقة وهمة الفرسان الباطنية ليضرب 4.0x ضرر فوري ساحق.', mpCost: 50, power: 4.0, type: 'heavy', reqLvl: 28 },
        'lung_expansion': { id: 'lung_expansion', name: 'اتساع أنفاس الرئة الصافية', desc: 'قدرة كامنة: تزيد الحد الأقصى لصحة الفارس بنسبة 12% إضافية لقوة البدن.', passive: true, stat: 'maxHp', bonus: 0.12, reqLvl: 29 },
        'heaven_seal': { id: 'heaven_seal', name: 'ختم أقاليم الصحراء العالي الحافظ', desc: 'أسلوب أسطوري يشل هالة الأعداء ويقلل من هجومهم ودفاعهم بنسبة 40% لـ 5 أدوار.', mpCost: 75, debuff: { atk: -0.4, def: -0.4, duration: 5 }, type: 'magic', reqLvl: 30 },
        'andalusian_lunge': { id: 'andalusian_lunge', name: 'طعنة طليطلة الرشيقة الحادة', desc: 'اندفاعة مبارز أندلسي خاطفة تسبب 2.5x ضرر بدني مباشر وتتجاهل جزءاً من دفاع الخصم.', mpCost: 24, power: 2.5, type: 'fast', reqLvl: 31 },
        'agile_step': { id: 'agile_step', name: 'رقصة الخطوات الموزونة السريعة', desc: 'قدرة كامنة: تزيد دفاعك بنسبة 8% وسرعة تفاديك بنسبة 5%.', passive: true, stat: 'def', bonus: 0.08, reqLvl: 32 },
        'swift_parry': { id: 'swift_parry', name: 'رد الضربات بحد السيف المرتد', desc: 'ترس هجومي من السيوف الخاطفة يضمن تفادي 40% من الضربات لثلاثة أدوار مع رد جزء من الضرر.', mpCost: 22, effect: { dodge: 0.4, duration: 3 }, type: 'buff', reqLvl: 33 },
        'qi_focus': { id: 'qi_focus', name: 'تركيز قنوات الهمة المتين', desc: 'قدرة كامنة: ترفع معدل استرجاع العزيمة والتركيز بنسبة 15% إضافية.', passive: true, stat: 'mpRegen', bonus: 0.15, reqLvl: 34 },
        'phoenix_rebirth': { id: 'phoenix_rebirth', name: 'قوة نهوض العنقاء الأسطورية', desc: 'عزيمة أسطورية تستعيد كامل الصحة وتزيد الهجوم والدفاع بنسبة 25% لـ 3 أدوار.', mpCost: 80, heal: 1.0, effect: { atkBuff: 1.25, defBuff: 1.25, duration: 3 }, type: 'magic', reqLvl: 35 },
        'celestial_shield': { id: 'celestial_shield', name: 'درع الأنوار السماوية البارق الواقي', desc: 'درع منيع يحميك تماماً من الضرر (حصانة مطلقة) لدور واحد كامل.', mpCost: 55, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 36 },
        'spear_thrust': { id: 'spear_thrust', name: 'طعنة الرمح الخطي البعيدة المفاجئة', desc: 'طعنة لانس بعيدة المدى تصيب العدو في مقتل تسبب 2.8x ضرر وتخفض سرعته.', mpCost: 25, power: 2.8, type: 'fast', reqLvl: 37 },
        'shield_bash': { id: 'shield_bash', name: 'ضربة حافة الترس الحاطمة للجبهات', desc: 'ضربة ترس ثقيل بقوة 3.0x ضرر تشل العدو بنسبة 40% لدورين كاملين.', mpCost: 32, power: 3.0, stunChance: 0.4, type: 'heavy', reqLvl: 38 },
        'desert_winds': { id: 'desert_winds', name: 'رياح السموم الحارة المشتتة للعدو', desc: 'استدعاء عاصفة ترابية خانقة تقلل دقة هجوم الخصم 35% ودفاعه 25% لـ 3 أدوار.', mpCost: 30, debuff: { atk: -0.35, def: -0.25, duration: 3 }, type: 'magic', reqLvl: 39 },
        'unending_dao': { id: 'unending_dao', name: 'فلسفة الصمود وسر القوة', desc: 'قدرة كامنة: +25% سرعة كسب الخبرة والتركيز، و +10% لكل إحصائيات الجسد.', passive: true, stat: 'allStats', bonus: 0.1, reqLvl: 40 },

        // --- المهارات النخبوية المتقدمة وبسالة قادة الجيش (Levels 41-60) ---
        'date_nourishment': { id: 'date_nourishment', name: 'زاد التمر وقوة التحمل المستمرة', desc: 'قدرة كامنة: تجديد تلقائي مستمر للصحة بنسبة 3% إضافية لكل دور.', passive: true, stat: 'hpRegen', bonus: 0.03, reqLvl: 41 },
        'noble_will': { id: 'noble_will', name: 'عزيمة الملوك وبسالة الفتوة الخالدة', desc: 'قدرة كامنة: تزيد من قوة جميع إحصائيات الجسد الأساسية بنسبة 6% دائمة.', passive: true, stat: 'allStats', bonus: 0.06, reqLvl: 42 },
        'shadow_lunge': { id: 'shadow_lunge', name: 'طعنة الظل الخاطفة المباغتة للفرسان', desc: 'اندفاع خاطف في سكون الليل يضرب العدو 3.2x ضرر سريع ومباغت.', mpCost: 28, power: 3.2, type: 'fast', reqLvl: 43 },
        'bazaar_wealth': { id: 'bazaar_wealth', name: 'دهاء الصراف وجذب الدينار الباطني', desc: 'قدرة كامنة: تزيد من الغنائم الذهبية المكتسبة من المعارك بنسبة 15%.', passive: true, stat: 'goldMult', bonus: 0.15, reqLvl: 44 },
        'sandstorm_wall': { id: 'sandstorm_wall', name: 'جدار عاصفة الرمال المنيع المظلم', desc: 'إعصار ترابي ملتف حول الفارس يقلل هجوم الخصم بنسبة 45% لـ 4 أدوار.', mpCost: 35, debuff: { atk: -0.45, duration: 4 }, type: 'buff', reqLvl: 45 },
        'double_parry': { id: 'double_parry', name: 'مزدوج الدفاع والصد المتقن للنصال', desc: 'وقفة مبارزة متطورة تزيد تفادي الضربات بنسبة 45% لـ 3 أدوار متتالية.', mpCost: 26, effect: { dodge: 0.45, duration: 3 }, type: 'buff', reqLvl: 46 },
        'steel_courage': { id: 'steel_courage', name: 'ثبات الحديد وهيبة الفرسان الشجعان', desc: 'قدرة كامنة: زيادة دائمة لصلابة دفاع الجسد والفروسية بنسبة 10%.', passive: true, stat: 'def', bonus: 0.1, reqLvl: 47 },
        'insight_strike': { id: 'insight_strike', name: 'ضربة الفراسة الموجهة لثغور الدروع', desc: 'ضربة سريعة بنصل دمشي مصقول يضرب بقوة 3.4x ضرر بدني حاسم.', mpCost: 30, power: 3.4, type: 'fast', reqLvl: 48 },
        'blazing_embers': { id: 'blazing_embers', name: 'لهب جمر الغضا الحارق المستمر', desc: 'استحضار لهب الفيافي لضرب العدو 2.5x ضرر فوري مع حرق مستمر 20 ضرر لـ 4 أدوار.', mpCost: 45, power: 2.5, dot: { dmg: 20, duration: 4 }, type: 'magic', reqLvl: 49 },
        'zenith_focus': { id: 'zenith_focus', name: 'تجلي ذروة الجبل الباطني الصافي', desc: 'قدرة كامنة: تزيد قوة الضربة القاضية بنسبة 15% إضافية.', passive: true, stat: 'critDmg', bonus: 0.15, reqLvl: 51 },
        'cavalry_gallop': { id: 'cavalry_gallop', name: 'صولة الخيالة وكر السيوف العنيف', desc: 'هجوم خيالة منسق يكتسح جبهة الأعداء بقوة 3.6x ضرر بدني ساحق.', mpCost: 40, power: 3.6, type: 'heavy', reqLvl: 52 },
        'nomad_healing': { id: 'nomad_healing', name: 'علاج البادية ولبن الإبل الطبيعي', desc: 'تكتيك استشفائي بدوي يستعيد 70% من نقاط الصحة فوراً ويزيل السموم.', mpCost: 45, heal: 0.7, type: 'magic', reqLvl: 53 },
        'meteor_strike': { id: 'meteor_strike', name: 'انقضاض النجم البارق الهابط للفرسان', desc: 'هجمة انقضاض من علٍ بقوة 3.8x ضرر مع شل الخصم بنسبة 35% لدورين.', mpCost: 38, power: 3.8, stunChance: 0.35, type: 'heavy', reqLvl: 54 },
        'moon_eclipse': { id: 'moon_eclipse', name: 'هدوء خسوف النور والظلال الحامية', desc: 'رداء طيفي يجعلك غير قابل للضرب تماماً (حصانة) لدور قتالي كامل مع استعادة 20 عزيمة.', mpCost: 50, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 55 },
        'dune_drift': { id: 'dune_drift', name: 'انسياب رمال الكثبان الحامية الخاطف', desc: 'حركة انزلاق رملية رائعة ترفع معدل التفادي بنسبة 40% لدورين.', mpCost: 20, effect: { dodge: 0.4, duration: 2 }, type: 'buff', reqLvl: 56 },
        'falcon_eye': { id: 'falcon_eye', name: 'نظرة صقر الشاهين كاشفة الثغرات للفرسان', desc: 'قدرة كامنة: تزيد فرصة الضربات القاضية الحاسمة بنسبة 8%.', passive: true, stat: 'crit', bonus: 0.08, reqLvl: 57 },
        'desert_resilience': { id: 'desert_resilience', name: 'تحمل الهجير وظمأ البادية العظيم', desc: 'قدرة كامنة: ترفع صحتك القصوى بنسبة 10% إضافية ودفاعك بنسبة 5%.', passive: true, stat: 'maxHp', bonus: 0.1, reqLvl: 58 },
        'sabre_storm': { id: 'sabre_storm', name: 'إعصار شفرات الفرسان الماحقة لصفوف العدو', desc: 'عاصفة دائرية من المبارزة السريعة تقطع صفوف العدو بقوة 4.0x ضرر بدني خارق.', mpCost: 48, power: 4.0, type: 'fast', reqLvl: 59 },

        // --- مهارات السادة والشيوخ الفرسان الكبار (Levels 61-80) ---
        'granite_stance': { id: 'granite_stance', name: 'وقفة الصخر الصلد العنيدة المانعة للكسر', desc: 'ترفع دفاعك بنسبة 50% وتمنحك درعاً باطنياً يقلل كافة أشكال الضرر لـ 3 أدوار.', mpCost: 35, effect: { defBuff: 1.5, duration: 3 }, type: 'buff', reqLvl: 61 },
        'wisdom_shield': { id: 'wisdom_shield', name: 'درع الفيلسوف وحكمة الأنوار الأندلسية', desc: 'تكتيك حماية علمي يمنح حصانة تامة ضد كافة أنواع الهجمات لدور واحد.', mpCost: 60, effect: { invulnerable: true, duration: 1 }, type: 'buff', reqLvl: 62 },
        'alchemy_vapor': { id: 'alchemy_vapor', name: 'بخار فرن تقطير الإكسير الشافي البديع', desc: 'استحضار بخار علاجي مستخلص يعيد 80% من الصحة فوراً ويجدد الهمة والتركيز.', mpCost: 50, heal: 0.8, type: 'magic', reqLvl: 63 },
        'strike_of_justice': { id: 'strike_of_justice', name: 'ضربة فرسان العدل والفتوة الأبية', desc: 'ضربة قاصمة بالسيف تسبب 4.2x ضرر وتخفض دفاع العدو بنسبة 35% لـ 3 أدوار.', mpCost: 42, power: 4.2, debuff: { def: -0.35, duration: 3 }, type: 'heavy', reqLvl: 64 },
        'swift_escape': { id: 'swift_escape', name: 'كر وفر الخيالة الرشيقة بالبادية', desc: 'مناورة تراجع خاطفة تزيد تفاديك بنسبة 60% لدورين كاملين لاستجماع القوى.', mpCost: 25, effect: { dodge: 0.6, duration: 2 }, type: 'buff', reqLvl: 65 },
        'sand_spout': { id: 'sand_spout', name: 'إعصار رمال البادية الهادر القاصم', desc: 'هجوم ترابي دوار عنيف يسبب 4.4x ضرر باطني ويشل حركة الخصم لدورين كاملين بنسبة 40%.', mpCost: 50, power: 4.4, stunChance: 0.4, type: 'heavy', reqLvl: 66 },
        'vitality_surge': { id: 'vitality_surge', name: 'فيض طاقة الصدر الباطنية الأسطوري', desc: 'قدرة كامنة: تزيد صحتك بنسبة 15% ومقاومتك لدفاع الخصم بنسبة 5%.', passive: true, stat: 'maxHp', bonus: 0.15, reqLvl: 67 },
        'parry_riposte': { id: 'parry_riposte', name: 'صد السيف المرتد والضرب الخاطف المعاكس', desc: 'تكتيك دفاعي يعقبه هجوم مضاد يضرب العدو بقوة 3.5x ضرر خاطف.', mpCost: 35, power: 3.5, type: 'fast', reqLvl: 68 },
        'eternal_patience': { id: 'eternal_patience', name: 'صبر فرسان الصحراء الخالد للشدائد', desc: 'قدرة كامنة: زيادة دائمة للدفاع بنسبة 12% وتحمل جروح الجسد.', passive: true, stat: 'def', bonus: 0.12, reqLvl: 69 },
        'sun_flare': { id: 'sun_flare', name: 'شروق لهب البروق السبعة العالي', desc: 'تركيز طاقة شمسية يضرب العدو بقوة 4.8x ضرر ناري ويحرق درعه تماماً.', mpCost: 65, power: 4.8, type: 'magic', reqLvl: 71 },
        'quicksand_trap': { id: 'quicksand_trap', name: 'فخ الرمال المتحركة المربك لصفوف العدو', desc: 'يشل حركة العدو تماماً بنسبة 50% ويخفض دفاعه بنسبة 40% لثلاثة أدوار.', mpCost: 40, debuff: { def: -0.4, duration: 3 }, stunChance: 0.5, type: 'heavy', reqLvl: 72 },
        'oasis_sanctuary': { id: 'oasis_sanctuary', name: 'حرم الواحة العتيق وظل نخيل التقاطع', desc: 'استشفاء كامل وعميق يستعيد 90% من الصحة فوراً ويريح عضلات الفارس.', mpCost: 60, heal: 0.9, type: 'magic', reqLvl: 73 },
        'sabre_dancing': { id: 'sabre_dancing', name: 'رقصة السيوف الأندلسية البديعة الخاطفة', desc: 'هجوم سريع راقص بنصلين يضرب 4.2x ضرر خاطف متتالي في لمح البصر.', mpCost: 38, power: 4.2, type: 'fast', reqLvl: 74 },
        'heavy_maul': { id: 'heavy_maul', name: 'شطر الدروع بمطرقة بني هاشم الثقيلة', desc: 'ضربة هراوة ثقيلة تسحق دروع العدو وتسبب 4.6x ضرر مباشر مع شل الخصم.', mpCost: 45, power: 4.6, stunChance: 0.3, type: 'heavy', reqLvl: 75 },
        'qi_barrier': { id: 'qi_barrier', name: 'حاجز العزيمة الواقي من وهن وهجير البادية', desc: 'درع طاقة باطني يرفع دفاع الفارس بنسبة 60% لثلاثة أدوار قتالية.', mpCost: 40, effect: { defBuff: 1.6, duration: 3 }, type: 'buff', reqLvl: 76 },
        'furious_gale': { id: 'furious_gale', name: 'عاصفة السموم الهوجاء القارسة الحارقة', desc: 'عاصفة ترابية جليدية خارقة تسبب 4.5x ضرر باطني مستمر لـ 3 أدوار.', mpCost: 55, power: 4.5, type: 'heavy', reqLvl: 77 },
        'silent_stalker': { id: 'silent_stalker', name: 'خطوة الفهد الصامتة المباغتة للفرسان', desc: 'يختفي الفارس في الظل مما يضمن له تفادي الضربات 50% ورفع الهجوم 30% لدورين.', mpCost: 32, effect: { dodge: 0.5, atkBuff: 1.3, duration: 2 }, type: 'buff', reqLvl: 78 },
        'noble_heart': { id: 'noble_heart', name: 'نقاء القلب وهمة الفتوة الباطنية', desc: 'قدرة كامنة: تزيد تجديد العزيمة بنسبة 18% ودفاع الفارس بنسبة 5%.', passive: true, stat: 'mpRegen', bonus: 0.18, reqLvl: 79 },

        // --- المهارات الأسطورية ودروس الأساتذة الكبار واليقين (Levels 81-120) ---
        'legendary_charge': { id: 'legendary_charge', name: 'صولة الفرسان الكبرى الحاشدة للجيوش', desc: 'صولة تاريخية خارقة تكتسح معاقل الأعداء بقوة 5.0x ضرر بدني كاسر للخطوط.', mpCost: 55, power: 5.0, stunChance: 0.5, type: 'heavy', reqLvl: 81 },
        'astrolabe_insight': { id: 'astrolabe_insight', name: 'بصيرة أسطرلاب الفلك الحكيم البارقة', desc: 'قدرة كامنة: تزيد سرعة تحركات الفارس وتفاديه بنسبة 15% دائمة.', passive: true, stat: 'speed', bonus: 15, reqLvl: 82 },
        'miracle_heal': { id: 'miracle_heal', name: 'معجزة حبة البركة والشفاء الكلي للبدن', desc: 'استشفاء كامل خارق يعيد 100% من الصحة البدنية والطاقة الباطنية فوراً.', mpCost: 75, heal: 1.0, type: 'magic', reqLvl: 83 },
        'blade_harmony': { id: 'blade_harmony', name: 'انسجام نصل الفولاذ والروح العظيم', desc: 'قدرة كامنة: تزيد هجوم الفرسان بنسبة 12% وضرر الضربة القاضية بنسبة 25%.', passive: true, stat: 'critDmg', bonus: 0.25, reqLvl: 84 },
        'grand_vortex': { id: 'grand_vortex', name: 'عاصفة التلاقي الأكبر للأقدار والأمم', desc: 'ضربة إعصارية هائلة بنور الشرق تجذب وتضرب العدو بقوة 5.2x ضرر باطني.', mpCost: 65, power: 5.2, type: 'heavy', reqLvl: 85 },
        'earth_armor': { id: 'earth_armor', name: 'درع الصفيح والتراب المنيع للسالك', desc: 'درع فولاذي يحميك تماماً من جراح وضربات الأعداء (حصانة مطلقة) لـ 2 أدوار قتالية.', mpCost: 80, effect: { invulnerable: true, duration: 2 }, type: 'buff', reqLvl: 86 },
        'celestial_blade': { id: 'celestial_blade', name: 'سيف اليقين القاطع للظلال البائسة', desc: 'هجمة سيف سماوية تسلط هالة ساطعة بقوة 5.5x ضرر قاصم للدروع الحصينة.', mpCost: 70, power: 5.5, type: 'heavy', reqLvl: 87 },
        'unbreakable_focus': { id: 'unbreakable_focus', name: 'تركيز شيوخ معبد قمة اليشم العالي', desc: 'قدرة كامنة: تزيد من جميع إحصائيات الجسد الأساسية بنسبة 10% دائمة.', passive: true, stat: 'allStats', bonus: 0.1, reqLvl: 88 },
        'ultimate_rebirth': { id: 'ultimate_rebirth', name: 'نهوض العنقاء الزمردي الحكيم العظيم', desc: 'عزيمة أسطورية عليا تستعيد كامل الصحة وتزيد الدفاع بنسبة 50% لـ 4 أدوار.', mpCost: 90, heal: 1.0, effect: { defBuff: 1.5, duration: 4 }, type: 'magic', reqLvl: 89 },
        'desert_sovereign': { id: 'desert_sovereign', name: 'هيبة ملك الصحراء الحازمة لكسر النفوس', desc: 'زلزلة هيبة الفرسان تقلل هجوم ودفاع وسرعة العدو بنسبة 50% لـ 4 أدوار قتالية.', mpCost: 85, debuff: { atk: -0.5, def: -0.5, duration: 4 }, type: 'magic', reqLvl: 91 },
        'immortal_guard': { id: 'immortal_guard', name: 'حراسة مقامات اليقين الباطني الحامية', desc: 'ترفع دفاع الفارس بنسبة 80% وتمنحه تفادي 30% لثلاثة أدوار قتالية كاملة.', mpCost: 60, effect: { defBuff: 1.8, dodge: 0.3, duration: 3 }, type: 'buff', reqLvl: 93 },
        'divine_breath': { id: 'divine_breath', name: 'أنفاس اليقين الباطني الممتدة العظيمة', desc: 'قدرة كامنة: تجديد تلقائي أسطوري للصحة والعزيمة بنسبة 8% في كل دور قتالي.', passive: true, stat: 'hpRegen', bonus: 0.08, reqLvl: 95 },
        'cosmic_harmony': { id: 'cosmic_harmony', name: 'تلاقي قنوات العزيمة والكون الأكبر للسالكين', desc: 'قدرة كامنة أسطورية عظمى: تزيد هجومك ودفاعك وصحتك وعزيمتك بنسبة 15% دائمة ونسبة تفادي 5%.', passive: true, stat: 'allStats', bonus: 0.15, reqLvl: 100 },

        // --- فنون ومهارات مكتبة الفرسان واليقين الحصرية (Premium Library Exclusive) ---
        'fursan_blade': { id: 'fursan_blade', name: 'سيف الفرسان الفاتح الأبي', desc: 'سيف طاقة الأنوار يضرب 2.4x ضرر مادي باهر ويتجاهل 30% من دفاع العدو.', mpCost: 15, power: 2.4, type: 'fast', reqLvl: 5, libraryOnly: true, cost: 500 },
        'resolve_breath': { id: 'resolve_breath', name: 'همة اليقين والاسترجاع الباطني', desc: 'فن شحذ واسترجاع باطني يسترجع 60 من العزيمة و30% من نقاط حياتك القصوى.', mpCost: 0, heal: 0.3, type: 'magic', reqLvl: 8, libraryOnly: true, cost: 1200 },
        'dune_storm': { id: 'dune_storm', name: 'عاصفة رمال البادية وعزم الأوائل', desc: 'يطلق زوبعة رملية خانقة تشل العدو بنسبة 50% وتسبب 3.2x ضرر مادي.', mpCost: 35, power: 3.2, stunChance: 0.5, type: 'heavy', reqLvl: 12, libraryOnly: true, cost: 1800 },
        'baraka_divine': { id: 'baraka_divine', name: 'درع العزم والبسالة النوراني', desc: 'درع من عزم الفتوة الحفيظ يمنح حصانة تامة ضد الضربات لدورين كاملين.', mpCost: 50, effect: { invulnerable: true, duration: 2 }, type: 'buff', reqLvl: 15, libraryOnly: true, cost: 2500 },
        'samum_strike': { id: 'samum_strike', name: 'غضب السموم ولهب البادية الماحق', desc: 'إطلاق ريح السموم الساخنة تسبب 4.2x ضرر ناري باطني وتحدث حرقاً مستمراً للعدو بمقدار 25 ضرر لـ 3 أدوار.', mpCost: 45, power: 4.2, dot: { dmg: 25, duration: 3 }, type: 'heavy', reqLvl: 18, libraryOnly: true, cost: 3500 },
        'sufi_clarity': { id: 'sufi_clarity', name: 'صفاء النفس وتجلي الهمة الأسمى', desc: 'قدرة كامنة أسطورية حصرية ترفع تجديد العزيمة بنسبة 30% وتزيد سرعة تفاديك بنسبة 10%.', passive: true, stat: 'mpRegen', bonus: 0.3, reqLvl: 20, libraryOnly: true, cost: 5000 }
    },

    // Get passive bonuses
    getPassiveBonuses: function(state) {
        let bonuses = { atk: 0, def: 0, hpRegen: 0, mpRegen: 0, maxHp: 0, critDmg: 0, speed: 0, goldMult: 0, crit: 0, allStats: 0 };
        const learned = state.player.skills || [];
        
        // Manual Background / Legacy Bonuses
        if (learned.includes('jade_body')) bonuses.def += 0.20;
        if (learned.includes('sword_heart')) bonuses.atk += 0.15;
        if (learned.includes('immortal_breath')) bonuses.hpRegen += 0.02;

        // Generic Passive System
        learned.forEach(id => {
            const skill = this.techniques[id];
            if (skill && skill.passive) {
                const stat = skill.stat;
                bonuses[stat] = (bonuses[stat] || 0) + skill.bonus;
            }
        });
        
        return bonuses;
    },

    checkUnlocks: function(state) {
        if (!state.player.skills) state.player.skills = [];
        Object.values(this.techniques).forEach(skill => {
            if (skill.libraryOnly) return; // Skip library-exclusive premium skills!
            if (state.player.lvl >= skill.reqLvl && !state.player.skills.includes(skill.id)) {
                state.player.skills.push(skill.id);
                if (typeof narrate === 'function') {
                    narrate(`<b>تم تعلم مهارة وفن جديد:</b> ${skill.name}!`, "ديوان الفرسان");
                }
            }
        });
    },

    getActiveSkills: function(state) {
        if (!state.player.skills) return [];
        return state.player.skills
            .map(id => this.techniques[id])
            .filter(s => s && !s.passive);
    }
};
