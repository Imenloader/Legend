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
