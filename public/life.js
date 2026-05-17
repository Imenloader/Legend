// ============================================================
// LIFE.JS — محرك محاكاة الولادة والنشأة والعزوة الشرقية
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.LIFE = {
    backgrounds: {
        'beggar': { id: 'beggar', name: 'ابن الشوارع الفقير', gold: 0, trait: 'الروح الجعانة', desc: 'اتولدت في أزقة الحواري الضلمة. +20% زيادة في كسب الخبرة الروحية بس بتبدأ من الصفر تماماً.', xpMult: 1.2 },
        'merchant': { id: 'merchant', name: 'ابن التاجر الغني', gold: 5000, trait: 'اللسان الفصيح', desc: 'اتولدت في بيت غنى ومال. -20% أسعار في سوق القوافل والخصومات.', priceMult: 0.8 },
        'royal': { id: 'royal', name: 'ابن الباشا والأمير', gold: 10000, trait: 'الهيبة السلطانية', desc: 'اتولدت في القصور الفخمة. +20% لكل الإحصائيات الأساسية بس بتبدأ بـ +50 ديون سيئات وكارما.', statMult: 1.2, karma: -50 },
        'farmer': { id: 'farmer', name: 'ابن الفلاح الطيب', gold: 100, trait: 'طينة الأرض المباركة', desc: 'اتولدت في الغيطان وسط الخير. +20% للصحة والتحمل الأقصى.', hpMult: 1.2 }
    },

    systems: {
        'many_children': { id: 'many_children', name: 'بركة العزوة والذرية', desc: 'بتاخد +2% لكل الإحصائيات مع كل طفل بيتولد في عيلتك وصومعتك.' },
        'killing': { id: 'killing', name: 'سر الفارس الجزار', desc: 'بتاخد +1 نقطة هجوم مع كل 10 أعداء بتهزمهم وتخلص الأرض من شرهم.' },
        'sword_saint': { id: 'sword_saint', name: 'طلسم السيف الدمشقي الأسطوري', desc: '2x ضرر السيف وبتتعلم وتتقن الفنون الروحية القتالية في ثانية.' }
    },

    // Roll a new life
    rollLife(state) {
        const bgKeys = Object.keys(this.backgrounds);
        const sysKeys = Object.keys(this.systems);
        
        state.player.background = this.backgrounds[bgKeys[Math.floor(Math.random() * bgKeys.length)]];
        state.player.system = this.systems[sysKeys[Math.floor(Math.random() * sysKeys.length)]];
        
        // Apply immediate background changes
        state.player.gold = state.player.background.gold;
        if (state.player.background.karma) state.player.karma = state.player.background.karma;
        
        this.generateFamily(state);
    },

    // Generate random family
    generateFamily(state) {
        const family = [];
        const maleNames = ['علي', 'عمر', 'خالد', 'حسن', 'أحمد', 'يوسف', 'مصطفى', 'طارق', 'حمزة', 'سليم', 'عثمان', 'ابراهيم'];
        const femaleNames = ['ليلى', 'فاطمة', 'عائشة', 'فرح', 'نور', 'زهراء', 'مريم', 'ياسمين', 'زينب', 'خديجة', 'رانية', 'أمينة'];
        
        const types = [
            { relation: 'الوالد (الأب)', gender: 'male' },
            { relation: 'الوالدة (الأم)', gender: 'female' },
            { relation: 'الأخ الشقيق', gender: 'male' },
            { relation: 'الأخت الشقيقة', gender: 'female' }
        ];
        
        const usedNames = new Set();
        
        types.forEach(t => {
            const namePool = t.gender === 'male' ? maleNames : femaleNames;
            let name;
            let attempts = 0;
            do {
                name = namePool[Math.floor(Math.random() * namePool.length)];
                attempts++;
            } while (usedNames.has(name) && attempts < 10);
            
            usedNames.add(name);
            
            family.push({
                id: `fam_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                relation: t.relation,
                affinity: 50 + Math.floor(Math.random() * 20), // Start with slight positive affinity
                alive: true,
                lvl: 1
            });
        });
        
        state.player.family = family;
    },

    // Process life-based random events
    processRandomEvent(state, narrate) {
        if (!state.player.family) return;
        
        const roll = Math.random();
        const aliveFamily = state.player.family.filter(f => f.alive);
        if (aliveFamily.length === 0) return;

        const member = aliveFamily[Math.floor(Math.random() * aliveFamily.length)];

        if (roll < 0.4) {
            // Affinity Event
            const gift = Math.random() > 0.5 ? 'عشبة النور' : 'كيس دنانير الروح';
            narrate(`<b>زيارة عائلية</b>: ${member.relation} ${member.name} زارك في واحة القوافل. هما فخورين بيك وبطريقك الروحي وادولك <b>${gift}</b>.`, "العائلة");
            member.affinity = Math.min(100, member.affinity + 5);
            if (gift === 'عشبة النور') { state.player.xp += 100; narrate(`كسبت 100 نقطة نور!`, "النظام الروحي"); }
            else { state.player.gold += 500; narrate(`كسبت 500 دينار روحي سحري!`, "النظام الروحي"); }
        } else if (roll < 0.7) {
            // Marriage / Sibling Event
            narrate(`<b>أخبار العيلة المفرحة</b>: ${member.relation} ${member.name} وصل لدرجة ارتقاء روحي جديدة في خلوته وصومعته! مودة عيلتك زادت وإنت بتشاركه الفرحة.`, "العائلة");
            member.affinity = Math.min(100, member.affinity + 10);
            member.lvl++;
        } else if (roll < 0.85) {
            // Family Crisis
            const crisisType = Math.random() > 0.5 ? 'Kidnapped' : 'Sick';
            narrate(`<b>كرب ومصيبة عائلية!</b>: ${member.relation} ${member.name} ${crisisType === 'Kidnapped' ? 'مخطوف ومحبوس عند طائفة السيف الأسود الشرير!' : 'بيعانى من تسمم روحي خطير في قنوات المانا ونور الروح!'}`, "العائلة");
            narrate(`لازم تتحرك وتنقذهم بسرعة قبل ما يموتوا. (تقدر تحل الكرب ده من شاشة العائلة)`, "النظام الروحي");
            member.crisis = crisisType;
        } else if (state.player.karma < -50 && roll < 0.95) {
            // Karma Tribulation
            narrate(`<b>تحذير من الملكوت الأعلى</b>: السما غاضبة من ذنوبك وسرقاتك وغفلتك. صاعقة عقاب من الملكوت ضربت صومعة تأملك الروحي!`, "العدالة الروحية");
            state.player.hp = Math.max(1, Math.floor(state.player.hp * 0.7));
            if (typeof triggerScreenShake === 'function') triggerScreenShake();
        }
    },

    // Marriage System
    seekMarriage(state, narrate) {
        if (state.player.gold < 5000) return { success: false, message: "الجوازة والشبكة وكتب الكتاب محتاجة على الأقل 5000 دينار سحري!" };
        
        const candidateNames = ['ليلى', 'ياسمين', 'فاطمة', 'عائشة', 'نور'];
        const name = candidateNames[Math.floor(Math.random() * candidateNames.length)];
        
        state.player.gold -= 5000;
        state.player.spouse = { name, affinity: 70, children: 0 };
        
        return { success: true, message: `ألف مبروك! اتجوزت من الست <b>${name}</b>! وعملت فرح هبط البلد وسط واحة القوافل.` };
    },

    processBirth(state, narrate) {
        if (!state.player.spouse) return;
        if (Math.random() < 0.1) { // 10% chance per heartbeat if married
            state.player.children = (state.player.children || 0) + 1;
            narrate(`<b>زيادة في العزوة والولد!</b>: شريكة حياتك ${state.player.spouse.name} ولدت طفل سليم معافى. عزوتك ونسبك بقى أقوى وبصحتك زادت ببركة الله.`, "العائلة");
            if (window.BALANCE) window.BALANCE.applyToState(state); // Re-calculate stat bonuses
        }
    },

    dualCultivate(state) {
        if (!state.player.spouse) {
            return { success: false, message: "لازم تتجوز الأول عشان تعمل تأمل روحي مشترك مع شريكة حياتك!" };
        }
        
        const now = Date.now();
        if (state._lastDualCultivate && now - state._lastDualCultivate < 30000) { 
            const waitTime = Math.ceil((30000 - (now - state._lastDualCultivate)) / 1000);
            return { success: false, message: `قنواتك الروحية لسة تعبانة وبتستريح. استنى كمان ${waitTime} ثانية.` };
        }
        
        state._lastDualCultivate = now;
        
        const baseXP = state.player.lvl * 80;
        const xpBonus = Math.floor(baseXP * (1 + (state.player.spouse.affinity || 70) / 100));
        state.player.xp += xpBonus;
        
        let levelUp = false;
        if (state.player.xp >= state.player.maxXp) {
            state.player.lvl++;
            state.player.xp -= state.player.maxXp;
            state.player.maxXp = 100 + (state.player.lvl - 1) * 80;
            if (state.player.cultivation) {
                state.player.cultivation.stageLevel++;
            }
            levelUp = true;
        }

        state.player.spouse.affinity = Math.min(100, (state.player.spouse.affinity || 70) + 5);

        let message = `إنت والست <b>${state.player.spouse.name}</b> قعدتوا قصاد بعض، ودمجتوا هالات الأنوار الروحانية في دايرة تأمل واحدة صافية. كسبت <span class="loot-epic">+${xpBonus} خبرة روحية</span>! محبتها ليك بقت <b>${state.player.spouse.affinity}%</b>.`;
        if (levelUp) {
            message += `<br><br><span class="loot-epic">🌟 تجلي روحي وارتقاء! مستواك زاد درجة كاملة!</span>`;
        }

        if (Math.random() < 0.3) {
            if (!state.player.inventory.materials) state.player.inventory.materials = {};
            state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 1;
            message += `<br><small style="color:var(--secondary)">🎁 شريكة حياتك أهدتك <b>عشبة النور</b> من جنينة صومعتها الخاصة.</small>`;
        }

        calculateTotalStats();
        if (typeof updateTopBar === 'function') updateTopBar();
        saveGame();
        
        return { success: true, message };
    },

    // --- Ancestral Pagoda Upgrade Matrix ---
    upgradeAncestralPagoda(state) {
        if (!state.player.familyPagodaLevel) state.player.familyPagodaLevel = 0;
        const currentLvl = state.player.familyPagodaLevel;
        if (currentLvl >= 3) return { success: false, message: "صومعة الأجداد والمقبرة الملكية وصلت لأعلى درجة عز وجلال!" };
        
        const costs = [
            { wood: 500, iron: 200, stones: 1000 },
            { wood: 1500, iron: 800, stones: 3000 },
            { wood: 4000, iron: 2000, stones: 8000 }
        ];
        
        const cost = costs[currentLvl];
        const dw = state.dwelling || { resources: { wood: 0, iron: 0 } };
        
        if ((dw.resources.wood || 0) < cost.wood || (dw.resources.iron || 0) < cost.iron || (state.player.gold || 0) < cost.stones) {
            return { 
                success: false, 
                message: `الموارد مش كفاية للتطوير!<br>محتاج: 🪵 ${cost.wood} خشب، 🪙 ${cost.iron} حديد، و 💎 ${cost.stones} دنانير سحرية.` 
            };
        }
        
        // Deduct resources
        dw.resources.wood -= cost.wood;
        dw.resources.iron -= cost.iron;
        state.player.gold -= cost.stones;
        state.player.familyPagodaLevel++;
        
        const names = [
            "مقام الذكرى والترحم والبركة (+10% مانا تأمل)",
            "ديوان الفرسان الأبطال والعزوة (+15% سرعة مودة الرفاق)",
            "المقبرة السلطانية الملكية الكبرى (+15% ضرر الضربات القاضية)"
        ];
        
        return { 
            success: true, 
            message: `<b>تم تطوير صومعة الأجداد بنجاح!</b><br>أنشأت <b>${names[currentLvl]}</b>!` 
        };
    },

    // --- Interactive Family Crisis Resolutions ---
    resolveFamilyCrisis(state, memberId, option) {
        const member = (state.player.family || []).find(f => f.id === memberId);
        if (!member || !member.crisis) return { success: false, message: "عيلتك بخير وصحة ومفيش أي كرب بيواجههم دلوقتي." };
        
        if (option === 'pay') {
            const cost = member.crisis === 'Kidnapped' ? 2000 : 1500;
            if (state.player.gold < cost) return { success: false, message: `معندكش الـ ${cost} دينار سحري المطلوبة للحل الودي.` };
            
            state.player.gold -= cost;
            member.crisis = null;
            member.affinity = Math.min(100, member.affinity + 20);
            return { 
                success: true, 
                message: `دفعت الفدية الودية. <b>${member.name}</b> رجع لبيته وصومعته بسلام وأمان! المودة بينكم بقت <b>${member.affinity}</b>.` 
            };
        }
        
        if (option === 'disciple') {
            if (!state.sect || !state.sect.disciples || state.sect.disciples.length === 0) {
                return { success: false, message: "معندكش صومعة أو مريدين تبعتهم للمهمة الصعبة دي!" };
            }
            
            // Find highest level available disciple not on expedition
            const disciple = state.sect.disciples.find(d => d.alive && d.assignment !== 'expedition');
            if (!disciple) return { success: false, message: "كل المريدين بتوعك مشغولين في قوافل تانية أو مصابين!" };
            
            const chance = disciple.lvl * 0.15;
            const roll = Math.random();
            
            if (roll <= chance) {
                member.crisis = null;
                member.affinity = Math.min(100, member.affinity + 25);
                disciple.lvl++;
                disciple.atk += 3;
                return {
                    success: true,
                    message: `<b>نصر ونجاح!</b> المريد <b>${disciple.name}</b> هزم قطاع الطرق وحرر ${member.name}! المريد ارتقى لـ <b>مستوى ${disciple.lvl}</b>.`
                };
            } else {
                disciple.lvl = Math.max(1, disciple.lvl - 1);
                return {
                    success: false,
                    message: `<b>فشل وخسارة!</b> المريد <b>${disciple.name}</b> اتهزم ورجع الصومعة متصاب بجروح شديدة. ${member.name} لسة في خطر!`
                };
            }
        }
        
        if (option === 'fight') {
            member._pendingRescue = true;
            const boss = {
                id: 'rescue_boss',
                name: member.crisis === 'Kidnapped' ? 'كبير قطاع الطرق الأثيم' : 'طيف السموم الغادر الرهيب',
                baseHp: 180 + state.player.lvl * 20,
                hp: 180 + state.player.lvl * 20,
                maxHp: 180 + state.player.lvl * 20,
                baseAtk: 18 + state.player.lvl * 3,
                atk: 18 + state.player.lvl * 3,
                dialogue: "جاي بجد تواجه ملوك الصحرا عشان تاخد رهنك؟! هتدفع التمن من دم قلبك!",
                sprite: 'boss'
            };
            
            setTimeout(() => { startCombat(boss); }, 500);
            return { success: true, message: "سحبت سيفك الدمشقي بنفسك، وخرجت فوراً تواجه التهديد وجهاً لوجه!" };
        }
        
        return { success: false, message: "طريقة غير صالحة للتعامل مع الأزمة." };
    }
};
