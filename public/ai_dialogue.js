// ============================================================
// AI_DIALOGUE.JS — محرك الحوار التفاعلي الذكي لرفاق وعائلة فرسان الشرق
// "ملحمة الشرق الساحر: ذكاء تفاعلي وحوارات الفرسان والرفاق"
// ============================================================

window.AIDialogue = {
    // Dynamic greeting generator
    generateGreeting(state, target) {
        const relation = target.relation || 'companion';
        const name = target.name;
        const currentRank = state.player.cultivation?.stage || 'الفارس المبتدئ';
        const playerClass = state.player.class || 'فارس الصحراء';
        const karma = state.player.karma || 0;
        const hpPercent = (state.player.hp / state.player.maxHp) * 100;

        // 1. Critical HP Check (for Mother/Spouse)
        if (hpPercent < 35 && (relation.includes('أم') || relation.includes('زوجة') || relation === 'Spouse')) {
            return `💔 <b>${name}</b> شهقت بفزع وهي تنظر لجروحك: "يا مهجة قلبي! جسدك مليء بالندوب ووجهك شاحب من الهجير والمعارك! أرجوك، دع السيف جانباً وارتح قليلاً في الخيمة، سأصنع لك شراب النعناع وترياق المروءة فوراً!"`;
        }

        // 2. Class/Role specific greetings
        if (relation === 'retired_father' || relation.includes('أب') || relation.includes('الوالد')) {
            if (karma < -30) {
                return `👴 <b>الوالد المتقاعد ${name}</b> بصلك بنظرة حازمة ومهيبة: "أسمع عنك أخباراً تقلق نومي يا بني... يقال إنك تفرط في قسوتك على الأسرى وتتبع سبيلاً مظلماً. تذكر أن سلالتنا لم تنل شرفها بالغدر، بل بالنخوة وصون العهد. عد لصوابك."`;
            }
            if (currentRank.includes('سيد')) {
                return `👴 <b>الوالد المتقاعد ${name}</b> يبتسم بفخر عظيم وتلمع عيناه: "أهلاً وسهلاً بسيد الديوان وفخر السلالة! لقد تجاوزت أحلامي القديمة يا بني، وأصبحت راية شامخة لفرسان الشرق تفخر بها الرمال والقمم."`;
            }
            return `👴 <b>الوالد المتقاعد ${name}</b> يمسح على مقبض سيفه القديم ويقول: "أهلاً بك يا بني. أرى بنيتك تشتد يوماً بعد يوم كفارس في رتبة <b>${currentRank}</b>. تذكر، عضلات الساعد المتين لا قيمة لها إن لم تحركها نفس أبية شجاعة."`;
        }

        if (relation === 'Spouse' || relation.includes('زوجة') || relation.includes('شريكة')) {
            if (karma > 50) {
                return `💍 <b>شريكة حياتك ${name}</b> تقف بوقار وابتسامة دافئة: "مرحباً بعودتك يا شمس واحتنا. كل بيت في هذه البادية يدعو لك بالبركة والصلاح بسبب كرمك وجودك مع الفقراء والضعفاء. قلبي يسعد بالانتساب إليك."`;
            }
            return `💍 <b>شريكة حياتك ${name}</b> ترحب بك وتقدم لك كأساً من الماء المصفى: "أهلاً بطلتك يا رفيق الدرب. أصلحت مصفوفة القلعة وتفقدت منابع الموارد اليوم. كل شيء هادئ هنا في انتظار عودتك سالماً وغانماً بنور عزيمتك."`;
        }

        if (relation === 'Child' || relation.includes('ابن') || relation.includes('بنت')) {
            const traitName = target.trait ? target.trait.name : 'الهمة العالية';
            return `🧒 <b>ابنك الصغير ${name}</b> يركض نحوك ممسكاً بسيف خشبي: "أبي! انظر لضربتي! الشيخ يقول إن بنيتي أصبحت قوية كـ <b>${traitName}</b>! هل سآتي معك غداً لغزو قطاع الطرق وحراسة القوافل الأسطورية؟"`;
        }

        if (relation.includes('أخ') || relation.includes('أخت')) {
            return `👥 <b>شقيقك الوفي ${name}</b> يشد على يدك: "مرحباً بك يا أخي وعزوتي. سمعت أن تدريباتك في ديوان الفرسان تزداد مشقة. سيفي ودرعي رهن إشارتك متى نادى المنادي للذود عن شرف الواحة."`;
        }

        // 3. Active Companion Greetings
        if (target.id === 'tariq_ibn_ziyad') {
            return `🛡️ <b>طارق بن زياد</b> ينظر للأفق بصلابة: "السفن احترقت خلفنا يا سالك، ولم يعد هناك متسع للالتفات للوراء. مسارنا واضح؛ إما اختراق حصون الطغيان بالحق أو الخلود المشرف. عزيمتنا أقوى من الصخر!"`;
        }
        if (target.id === 'al_khidr') {
            return `🌙 <b>المرشد الخالد الحكيم</b> يبتسم بهدوء غامض: "أرى عروق طاقتك تتجلى بنور الحكمة يا <b>${playerClass}</b>. الصبر في الهجير أثمن من درر الملوك، والسكينة هي نبع القوة الحقيقي. ماذا تريد أن تتبين اليوم؟"`;
        }
        if (target.id === 'sinbad') {
            return `⛵ <b>السندباد البحري</b> يعدل أشرعته بحماس: "مرحباً يا بطل! ركبت البحر ونجوت من واد الماس الحاد وواجهت طائر الرخ، ولكن رحلتنا الحالية تعدني بملحمة أسطورية لم تشهدها جزيرة من قبل! هل أنت مستعد للكر والفر؟"`;
        }
        if (target.id === 'saladin') {
            return `👑 <b>السلطان صلاح الدين</b> يربت على كتفك بنبل: "شرف الفارس الحقيقي يتجلى في كظم الغيظ ورحمة المغلوب يا رفيقي. بركة العدل هي سر بقاء الدول والفرسان. مرحباً بك دائماً في ديوان النخوة."`;
        }
        if (target.id === 'antar_ibn_shaddad') {
            return `⚔️ <b>عنترة بن شداد</b> يضحك بجهارة تملأ الأرجاء: "أهلاً بقرين السيف ورفيق النصال! واجهت وحوش البادية وكسبت حريتي بضربة سيفي الأسطوري، وأرى فيك جسارة تماثل شجعان عبس الأبطال. اسأل ما تشاء!"`;
        }

        return `👤 <b>${name}</b> ينظر إليك بتقدير واحترام: "مرحباً بك يا رفيقي البطل. همتنا واحدة ودربنا مشترك، ونور البركة يرعانا."`;
    },

    // Handle advice option (🌙 طلب حكمة وتوجيه في الفروسية)
    getAdvice(state, target) {
        const relation = target.relation || 'companion';
        const name = target.name;
        const playerClass = state.player.class || 'فارس الصحراء';
        const karma = state.player.karma || 0;

        const fatherAdvice = [
            `"الجسارة لا تعني التهور يا بني. الفارس الحقيقي يدرس خطوته في رمال الكثبان، ويضرب ضربته حين يرى ثغرة درع الخصم."`,
            `"إن مسلك <b>${playerClass}</b> يتطلب صبراً على شح المياه، وصلابة في مواجهة عواصف الغبار. لا تستسلم لهجير الصحراء."`,
            `"حين كنت أقود المعارك في شبابي، تعلمت أن هيبة الترس والصمود أهم بكثير من طول نصل السيف. احم عائلتك وأهلك أولاً."`
        ];

        const motherAdvice = [
            `"يا مهجة قلبي، لا تنس أن تطهر قلبك من الغل والحسد قبل أن تطهر سيفك. دعواتي لك بالبركة تفتح لك أبواب الفتح المغلقة."`,
            `"تناول وجباتك بانتظام واشرب شاي النعناع الدافئ بعد تأمل عروق طاقتك، فالصحة السليمة هي أساس الساعد القوي والظهر المتين."`,
            `"من يرحم الطير والحيوان في الفيافي يجد رحمة القدر تحيط به عند الكرب الكبار. خذ البركة رفيقاً لك في حلك وترحالك."`
        ];

        const spouseAdvice = [
            `"حين تضيق بك مسارات الدنيا ويهتز صمودك، تذكر أن واحتنا الصغيرة وعائلتنا هي حصنك الدافئ الذي لا ينكسر. نحن هنا لأجلك دائماً."`,
            `"لقد صممت لك وشاحاً من كتان البادية ليحميك من شمس الهجير الحارقة. استعن بنور العزيمة والصبر فكل عاصفة مصيرها الزوال."`
        ];

        const childAdvice = [
            `"أبي، أريد أن أكون مثلك تماماً! أتدرب كل يوم لأرفع رتبتي البدنية وأحمي أمي وإخوتي حين ترتحل أنت لقوافل الترحال."`
        ];

        const siblingAdvice = [
            `"الفارس بمفرده كعشبة في مهب الريح، أما بالظهر والذرية والعزوة يصبح جبلاً شامخاً. سيفي مسلول بجانب سيفك دائماً."`
        ];

        // Companion Advice
        if (target.id === 'tariq_ibn_ziyad') {
            return `"في اللحظة التي تظن فيها أن التراجع ممكن، سيتسلل اليأس لفرسانك وتخسر شجاعتك. احرق سفن التردد وركز هجومك بكل حيوية وهمة!"`;
        }
        if (target.id === 'al_khidr') {
            return `"كل محنة وكسر في مركب الحياة خلفها سفينة صالحة تنجو من غصب الملوك الطغاة. ثق بالتدبير العظيم، وركز تأملك الباطني لتنفتح لك مقامات الهمة الصافية."`;
        }
        if (target.id === 'sinbad') {
            return `"عندما تهب ريح عاتية تزلزل أشرعة قاربك، لا تصارع الموج بغباء، بل سر مع ريح الكر والفر ووجه الدفة بحكمة وصمود!"`;
        }
        if (target.id === 'saladin') {
            return `"لا تقابل الغدر بالغدر يا بطل، بل قابل الغادر بالصلابة ونبل الفرسان. كسب قلوب الناس بنقاء سريرتك وعفوك أثمن بآلاف المرات من كسب قلعة خاوية بالدم."`;
        }
        if (target.id === 'antar_ibn_shaddad') {
            return `"إذا واجهت جيشاً عصفورياً يحجب ضوء الشمس برماحه، فاصرخ صرخة الجسارة التي تهز واد الرمال واقتحم الصفوف! فالخوف لا يطيل العمر والشجاعة كنز لا يفنى!"`;
        }

        if (relation === 'retired_father' || relation.includes('أب')) return fatherAdvice[Math.floor(Math.random() * fatherAdvice.length)];
        if (relation === 'Spouse' || relation.includes('زوجة')) return spouseAdvice[Math.floor(Math.random() * spouseAdvice.length)];
        if (relation === 'Child' || relation.includes('ابن')) return childAdvice[Math.floor(Math.random() * childAdvice.length)];
        if (relation.includes('أم')) return motherAdvice[Math.floor(Math.random() * motherAdvice.length)];
        return siblingAdvice[Math.floor(Math.random() * siblingAdvice.length)];
    },

    // Handle home/family affairs option (💬 السؤال عن أحوال الديار والواحة)
    getAffairs(state, target) {
        const relation = target.relation || 'companion';
        const name = target.name;
        const pagodaLvl = state.player.familyPagodaLevel || 0;

        if (relation === 'retired_father' || relation.includes('أب')) {
            return `"منابع المياه في الواحة تجري بانتظام، وأشجار النخيل أثمرت خيراً وفيراً هذا العام بفضل رعايتك وتطوير القلعة. معبد الأسلاف الأثري (المرتبة ${pagodaLvl}) يمنح ديواننا ذكرى خاشعة وهيبة تسر الناظرين."`;
        }
        if (relation === 'Spouse' || relation.includes('زوجة')) {
            return `"البيت بخير وسكينة يا مهجة عيني. العمال مخلصون ويقومون بجمع الموارد ورعاية الإبل بانتظام. لا تشغل بالك بالواحة وركز عزيمتك في صقل درعك وقافلتك، فنحن بأفضل حال."`;
        }
        if (relation === 'Child' || relation.includes('ابن')) {
            return `"الوالدة صنعت لنا خبز التنور اللذيذ اليوم! وساعدت العم في رعاية مهور الخيول الأصيلة بالبستان. أريد أن أصبح خبيراً في صياغة النصال والدروع الفولاذية!"`;
        }

        if (target.id === 'tariq_ibn_ziyad') {
            return `"جنودنا في الثغور يتدربون على الكر والفر بلا كلل. البرية مليئة بالخطر ولكن انضباط فرساننا وحراستنا للسبيل جعلت قوافل الترحال تشعر بالأمان التام."`;
        }
        if (target.id === 'al_khidr') {
            return `"الواحة ليست مجرد أشجار وطين يا سالك، بل هي مرآة لصفاء روحك وهمتك الباطنية. عندما يتجلى نور قلبك، تزدهر حقول النخيل وتتفجر ينابيع البركة الصافية."`;
        }
        if (target.id === 'sinbad') {
            return `"شحذت علاقاتي مع تجار درب الحرير مؤخراً! الأسعار في سوق القوافل مستقرة، والغيلان في بحر النور اللجي يخشون الاقتراب من شواطئنا بسبب سيرة بطولاتنا الشجاعة."`;
        }

        return `"الكل يدعو لك بالخير والصلاح هنا. البرية هادئة ونشاط القلعة يسير بانتظام تام."`;
    },

    // Handle martial/nobility lore option (⚔️ التحدث عن سيرة الأبطال ونور العزيمة)
    getMartialLore(state, target) {
        const relation = target.relation || 'companion';
        const currentRank = state.player.cultivation?.stage || 'الفارس المبتدئ';

        if (relation === 'retired_father' || relation.includes('أب')) {
            return `"في زمني القديم، رأيت فرساناً برتبة <b>سيد الفرسان والديوان</b> يشقون رمال الدهناء بسيف دمشقي واحد ويهزمون مئات الغزاة. سر القوة الحقيقي ليس في الحديد يا بني، بل في شحن قنوات عزيمتك بنور اليقين والجسارة الممتدة."`;
        }
        if (relation === 'Spouse' || relation.includes('زوجة')) {
            return `"يقال في القصائد البدوية القديمة إن الفارس النبيل لا ينحني رأسه لعاصفة ترابية، بل يثبت درعه كالجبل الراسخ. أرى في وقفتك هذه الملاحم البطولية التي تغنى بها شعراء البادية العظماء."`;
        }

        if (target.id === 'antar_ibn_shaddad') {
            return `"سيف عنترة مصبوب من شهاب سماوي هبط ببادية نجد الأسطورية! كل ضربة قتالية منه تتطلب ثقة مطلقة بالنفس وحضوراً باطنياً للهمة. تذكر: 'وَلَقَد شَفَت نَفسي وَأَبرَأَ سُقمَها.. قيلُ الفَوارِسِ وَيكَ عَنترَ أَقدِمِ!'"`;
        }
        if (target.id === 'saladin') {
            return `"أبطال العرب التاريخيين لم يرفعوا سيوفهم طمعاً في ذهب أو جاه، بل صيانةً للحق ونصرةً للمظلوم. حين تشحن قنوات التركيز والعزيمة وتجعل نيتك طاهرة، تكتسب ضربات نصالك هيبة وتأثيراً ملحمياً يُرعب الغزاة الأثمة."`;
        }
        if (target.id === 'tariq_ibn_ziyad') {
            return `"النصر يكتبه من يملك نفساً أطول في ساحة المبارزة والكر والفر. عندما تطلق مهارات التآزر وتلتحم بكتف صلب مع رفقاء دربك، ينكسر صمود أي عدو مهما بلغت قوته وهجماته البدنية."`;
        }

        return `"تاريخ البادية مليء بقصص الفرسان النبلاء الذين واجهوا المحن الكبرى بثبات وشهامة. خذ من سيرتهم قبس نور يضيء لك دروب الصحراء المظلمة."`;
    },

    // Retrieve unique backstory / personal history option
    getPersonalStory(state, target) {
        const relation = target.relation || 'companion';
        const name = target.name;

        if (relation === 'retired_father' || relation.includes('أب') || relation.includes('والد')) {
            return `"قصتي يا بني بدأت في واحة الفيافي المجهولة، حيث واجهت قطاع الطرق بمساعدة سيف خالي الفولاذي. في معركة الهجير العظيمة سنة 42 بطلحة الصحراء، حميت القوافل ولقبت بالفارس الحكيم صائن العهود لأسرتنا."`;
        }
        if (relation === 'Spouse' || relation.includes('زوجة')) {
            return `"نشأت ابنة لشيخ تجار درب الحرير، كنت أراقب الفرسان الشجعان من نافذتي وأتمنى شريك طموح يحمل نور العجائب. عندما التقيتك تحمل نور عزيمة السالكين الأبية، علمت أن قدري ارتبط بك للأبد يا مهجة عيني."`;
        }
        if (relation === 'Child' || relation.includes('ابن')) {
            return `"قصتي؟ أنا ولدت في عائلة أبطال عظيمة! جدتي تحكي لي أن دم الفرسان يجري في عروقنا الكريمة، وأريد كتابة فصول قصة جديدة بهزيمة الغيلان الكبار!"`;
        }

        // Active Companions stories
        if (target.id === 'tariq_ibn_ziyad') {
            return `"ولدت في ثغور بربر طنجة الأبية، ومخرت البحار بنور عقيدتي وصمودي الصادق. قصة حياتي تلخصت في عبور المضيق الكبير وفتح الأندلس، محطماً يأس التردد ومسطراً نصر الخلود للرجال المخلصين."`;
        }
        if (target.id === 'al_khidr') {
            return `"عمري يمتد لآلاف السنين يا بني، شربت من عين الحياة الخالدة المخبأة في واد الظلمات ببركة قدسية تامة. رأيت وسرت مع ذي القرنين، ومهمتي تنوير السالكين الصادقين في شتى أزمنة الملاحم."`;
        }
        if (target.id === 'sinbad') {
            return `"سبع رحلات بحرية مذهلة غيّرت حياتي! خسرت ثروتي عدة مرات وواجهت وحيد قرن عملاق وجزيرة واق الواق الطائرة ومردة البحر اللجي؛ لكني عدت دائماً بكنوز أسطر بها قصيدة انتصار لا فناء لها!"`;
        }
        if (target.id === 'saladin') {
            return `"نشأت متعصباً لقيم الفروسية ونصرة الحق في ديوان أسد الدين جيرمان. قصة حياتي هي توحيد كلمة العرب وتحرير القدس الشريف بنبل العفو وسماحة القوة في زمن الفتن العويصة."`;
        }
        if (target.id === 'antar_ibn_shaddad') {
            return `"أنا عنترة بن عمرو بن شداد العبسي! ولدت عبداً أسود أرعى النياق ببادية نجد، لكن همتي وسيفي رفعتاني لمقام السيادة والملوك. حكايات عشقي لعبلة وجلادي في البراري ملأت طباق الأرض صموداً وفخاراً!"`;
        }

        return `"عشت حياة هادئة في أطراف درب الحرير، وتفانيت لخدمة السالكين فرسان النقاء. قصتي تدور حول البحث عن الأمل والاستقرار خلف الكثبان الحارة مع الأصدقاء الأوفياء."`;
    },

    // Main Interactive Dialogue View
    talkToNPC(npcIdOrKey) {
        clearNarrative();
        
        let target = null;
        let isSpouse = false;
        let isCompanion = false;

        if (npcIdOrKey === 'spouse') {
            if (!state.player.spouse) {
                narrate("ليس لديك شريكة حياة حالياً في هذه الحياة.", "النظام");
                setTimeout(showManagementScreen, 1500);
                return;
            }
            target = {
                id: 'spouse',
                name: state.player.spouse.name,
                relation: 'Spouse',
                affinity: state.player.spouse.affinity || 70,
                alive: true
            };
            isSpouse = true;
        } else if (npcIdOrKey === 'companion') {
            target = window.COMPANIONS ? window.COMPANIONS.getActive(state) : null;
            if (!target) {
                narrate("ليس لديك رفيق نشط حالياً يرافق رحلتك.", "النظام");
                setTimeout(showCompanionScreen, 1500);
                return;
            }
            isCompanion = true;
        } else {
            target = (state.player.family || []).find(f => f.id === npcIdOrKey);
            if (!target) {
                narrate("لم يتم العثور على فرد العائلة المحدد في السجلات.", "النظام");
                setTimeout(showManagementScreen, 1500);
                return;
            }
        }

        const relationLabel = target.relation === 'Spouse' ? 'شريكة الحياة' : target.relation === 'Child' ? 'ابن السلالة' : target.relation === 'retired_father' ? 'الوالد المتقاعد (سند العائلة)' : (target.relation || 'رفيق السلاح والترحال');
        const greeting = this.generateGreeting(state, target);

        let html = `
            <div class="management-card" style="border-left:4px solid var(--secondary); font-family:'Inter', sans-serif; text-align:left;">
                <div class="management-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 12px;">
                    <h3 style="color:var(--secondary); margin:0;">🗣️ محادثة تفاعلية: ${target.name}</h3>
                    <span class="management-badge badge-alive">${relationLabel} | الألفة: ${target.affinity}%</span>
                </div>
                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; line-height:1.7; font-size:0.95rem; color:#fff;">
                    ${greeting}
                </div>
            </div>
            <br>
        `;

        narrate(html, target.name, target.sprite || 'assets/avatar.png', false, true);

        const choices = [
            {
                text: "🌙 طلب حكمة وتوجيه في الفروسية",
                callback: () => {
                    const adv = this.getAdvice(state, target);
                    let advHtml = `
                        <div class="management-card" style="border-left:4px solid var(--jade); font-family:'Inter', sans-serif;">
                            <p style="font-size:1rem; line-height:1.7; font-style:italic; padding:10px; background:rgba(0,168,107,0.05); border-radius:6px; border:1px solid rgba(0,168,107,0.15);">
                                <b>${target.name}</b> يوجهك بحكمة بليغة:<br>"${adv}"
                            </p>
                        </div>
                    `;
                    clearNarrative();
                    narrate(advHtml, target.name, target.sprite || 'assets/avatar.png', false, true);
                    setChoices([
                        { text: "↩ عودة للمحادثة", callback: () => this.talkToNPC(npcIdOrKey) }
                    ]);
                }
            },
            {
                text: "💬 السؤال عن أحوال الديار والواحة",
                callback: () => {
                    const aff = this.getAffairs(state, target);
                    let affHtml = `
                        <div class="management-card" style="border-left:4px solid var(--secondary); font-family:'Inter', sans-serif;">
                            <p style="font-size:1rem; line-height:1.7; padding:10px; background:rgba(0,0,0,0.3); border-radius:6px;">
                                <b>${target.name}</b> يخبرك بأحوال الديار:<br>${aff}
                            </p>
                        </div>
                    `;
                    clearNarrative();
                    narrate(affHtml, target.name, target.sprite || 'assets/avatar.png', false, true);
                    setChoices([
                        { text: "↩ عودة للمحادثة", callback: () => this.talkToNPC(npcIdOrKey) }
                    ]);
                }
            },
            {
                text: "⚔️ التحدث عن سيرة الأبطال ونور العزيمة",
                callback: () => {
                    const lore = this.getMartialLore(state, target);
                    let loreHtml = `
                        <div class="management-card" style="border-left:4px solid var(--secondary); font-family:'Inter', sans-serif;">
                            <p style="font-size:1rem; line-height:1.7; padding:10px; background:rgba(255,215,0,0.04); border-radius:6px; border:1px solid rgba(212,175,55,0.15);">
                                <b>${target.name}</b> يسترسل بوقار عن سيرة شجعان الشرق:<br>${lore}
                            </p>
                        </div>
                    `;
                    clearNarrative();
                    narrate(loreHtml, target.name, target.sprite || 'assets/avatar.png', false, true);
                    setChoices([
                        { text: "↩ عودة للمحادثة", callback: () => this.talkToNPC(npcIdOrKey) }
                    ]);
                }
            },
            {
                text: "📖 الاستفسار عن قصة وتاريخ حياتهم الشخصية",
                callback: () => {
                    const story = this.getPersonalStory(state, target);
                    let storyHtml = `
                        <div class="management-card" style="border-left:4px solid #3498db; font-family:'Inter', sans-serif;">
                            <p style="font-size:1rem; line-height:1.8; padding:12px; background:rgba(52,152,219,0.05); border-radius:6px; border:1px solid rgba(52,152,219,0.15);">
                                👑 <b>المخطوطة الشخصية لـ ${target.name}:</b><br>${story}
                            </p>
                        </div>
                    `;
                    clearNarrative();
                    narrate(storyHtml, target.name, target.sprite || 'assets/avatar.png', false, true);
                    setChoices([
                        { text: "↩ عودة للمحادثة", callback: () => this.talkToNPC(npcIdOrKey) }
                    ]);
                }
            },
            {
                text: "📋 طلب مهمة أو تكليف خاص لصالح الواحة",
                callback: () => {
                    clearNarrative();
                    
                    let taskTitle = "";
                    let taskDesc = "";
                    let cost = 0;
                    let actionText = "";
                    let rewardAction = () => {};

                    if (target.relation === 'retired_father' || target.relation?.includes('أب') || target.relation?.includes('والد')) {
                        cost = 200;
                        taskTitle = "⚔️ مراجعة تدريب السيادة وتأصيل السلالة";
                        taskDesc = "الوالد الحكيم يريد تعزيز حاميات القلعة وتدريب فرسان السلالة على الجسارة البدنية ورموز السيف. يتطلب هذا تمويلاً مالياً وقدره <b>200 ذهب</b>.";
                        actionText = "👍 التبرع بـ 200 ذهب لصالح القلعة (+3% ضربات قاصمة دائمة)";
                        rewardAction = () => {
                            state.player.critRate = (state.player.critRate || 0.05) + 0.03;
                            target.affinity = Math.min(100, (target.affinity || 50) + 5);
                            narrate(`✨ <b>أثبّت جدارتك للوالد!</b> بارك تدريبك السديد قائلاً: "أرى في مهارة ضرباتك ثقة الملوك يا بني!". زاد معدل الضربات القاصمة لديك بمقدار <b>+3% بشكل دائم</b>!`, "الوالد الحكيم");
                        };
                    } else if (target.relation === 'Spouse' || target.relation?.includes('زوجة')) {
                        cost = 100;
                        taskTitle = "💍 حياكة تميمة الحماية المبروكة للديار";
                        taskDesc = "شريكة حياتك تود حبك كتان نادر مع تميمة مروكة لحماية طاقتك الباطنية وزيادة طاقتك العقلية أثناء الترحال. يتطلب شراء الموارد <b>100 ذهب</b>.";
                        actionText = "👍 تقديم 100 ذهب للموارد (+10 عزيمة هالة باطنية دائمة)";
                        rewardAction = () => {
                            state.player.maxMp = (state.player.maxMp || 100) + 10;
                            state.player.mp = (state.player.mp || 100) + 10;
                            state.player.spouse.affinity = Math.min(100, (state.player.spouse.affinity || 70) + 5);
                            narrate(`✨ <b>تمت الحياكة ببركة وسرور!</b> ألبستك شريكة حياتك التميمة بنبرة عهد دافئة. زادت مصفوفة العزيمة القصوى لديك بمقدار <b>+10 نقاط بشكل دائم</b>!`, "شريكة الحياة");
                        };
                    } else {
                        cost = 50;
                        taskTitle = "🏮 تحدي صقل عروق الهالة الباطنية";
                        taskDesc = "الرفيق النشط يقترح تنظيم تحدي فحص الهالة ودعم عروق تماسك فقراء طلائع القوافل في الواحة لزيادة قوتك البدنية. يتطلب كفالة بقيمة <b>50 ذهب</b>.";
                        actionText = "👍 كفالة التدريب بـ 50 ذهباً (+20 نقاط حياة قصوى دائمة)";
                        rewardAction = () => {
                            state.player.maxHp = (state.player.maxHp || 200) + 20;
                            state.player.hp = (state.player.hp || 200) + 20;
                            if (isCompanion) {
                                window.COMPANIONS.adjustAffinity(state, target.id, 8, "إنجاز تحدي صقل الهالة الباطنية.");
                            } else {
                                target.affinity = Math.min(100, (target.affinity || 50) + 8);
                            }
                            narrate(`✨ <b>اكتمل صقل الهالة!</b> توهجت عروق جسدك لتعزز ركائزك الجسدية ضد هجمات هجير البرية. زادت نقاط حياتك القصوى بمقدار <b>+20 نقطة بشكل دائم</b>!`, target.name);
                        };
                    }

                    let taskHtml = `
                        <div class="management-card" style="border-left:4px solid var(--secondary); font-family:'Inter', sans-serif;">
                            <h3 style="color:var(--secondary); margin-top:0;">📋 تكليف الرفيق الخاص: ${taskTitle}</h3>
                            <p style="font-size:1rem; line-height:1.7; background:rgba(0,0,0,0.35); padding:12px; border-radius:6px;">
                                ${taskDesc}
                            </p>
                        </div>
                    `;
                    narrate(taskHtml, target.name, target.sprite || 'assets/avatar.png', false, true);
                    
                    setChoices([
                        {
                            text: actionText,
                            callback: () => {
                                if (state.player.gold < cost) {
                                    narrate(`⚠️ عذراً يا بطل! ليس لديك ما يكفي من ذهب قوافل درب الحرير الحالي لإكمال التكليف (تحتاج ${cost} ذهب، لديك ${state.player.gold} ذهب).`, "النظام");
                                    setTimeout(() => this.talkToNPC(npcIdOrKey), 2500);
                                    return;
                                }
                                state.player.gold -= cost;
                                rewardAction();
                                updateTopBar();
                                saveGame();
                                setChoices([
                                    { text: "↩ عودة للمواد الحوارية", callback: () => this.talkToNPC(npcIdOrKey) }
                                ]);
                            }
                        },
                        {
                            text: "↩ تراجع، ربما لاحقاً",
                            callback: () => this.talkToNPC(npcIdOrKey)
                        }
                    ]);
                }
            },
            {
                text: `❤️ تقديم هدية الصحراء لتعزيز الألفة (التكلفة: 100 ذهب | +5 ألفة)`,
                callback: () => {
                    if (state.player.gold < 100) {
                        narrate("ليس لديك ما يكفي من دنانير الذهب (100 ذهب مطلوب) لتقديم هذه الهدية الفخمة.", "النظام");
                        setTimeout(() => this.talkToNPC(npcIdOrKey), 2000);
                        return;
                    }
                    state.player.gold -= 100;
                    
                    // Add affinity points
                    if (isSpouse) {
                        state.player.spouse.affinity = Math.min(100, (state.player.spouse.affinity || 70) + 5);
                    } else if (isCompanion) {
                        window.COMPANIONS.adjustAffinity(state, target.id, 5, "تقديم هدية صحراوية من القوافل.");
                    } else {
                        target.affinity = Math.min(100, target.affinity + 5);
                    }

                    narrate(`🎁 <b>قدمت هدية رائعة لـ ${target.name}!</b> تهللت ملامحه بالبشر والسرور وزادت روابط الألفة والمودة بينكما بمقدار <b>+5 نقاط</b>!`, "النظام");
                    updateTopBar();
                    saveGame();
                    setTimeout(() => this.talkToNPC(npcIdOrKey), 2500);
                }
            },
            {
                text: isCompanion ? "↩ رجوع لشاشة الرفقاء" : "↩ رجوع لديوان الإدارة",
                callback: isCompanion ? showCompanionScreen : showManagementScreen
            }
        ];

        setChoices(choices);
    }
};
