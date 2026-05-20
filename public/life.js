// ============================================================
// LIFE.JS — محرك محاكاة الولادة والنشأة والعزوة الشرقية
// "ملحمة الشرق الساحر: وصية الفتوة وأساطير الصحراء"
// ============================================================

window.LIFE = {
    backgrounds: {
        'beggar': { id: 'beggar', name: 'ابن الشوارع الفقير', gold: 0, trait: 'الهمة العالية', desc: 'اتولدت في أزقة الحواري الضلمة. +20% زيادة في كسب الخبرة والجدعنة بس بتبدأ من الصفر تماماً.', xpMult: 1.2 },
        'merchant': { id: 'merchant', name: 'ابن التاجر الغني', gold: 5000, trait: 'اللسان الفصيح', desc: 'اتولدت في بيت غنى ومال. -20% أسعار في سوق القوافل والخصومات.', priceMult: 0.8 },
        'royal': { id: 'royal', name: 'ابن الباشا والأمير', gold: 10000, trait: 'الهيبة السلطانية', desc: 'اتولدت في القصور الفخمة. +20% لكل الإحصائيات الأساسية بس بتبدأ ببعض الخصومات وحظ عاثر في السوق.', statMult: 1.2, karma: -50 },
        'farmer': { id: 'farmer', name: 'ابن الفلاح الطيب', gold: 100, trait: 'طينة الأرض المباركة', desc: 'اتولدت في الغيطان وسط الخير. +20% للصحة والتحمل الأقصى.', hpMult: 1.2 }
    },

    systems: {
        'many_children': { id: 'many_children', name: 'بركة العزوة والذرية', desc: 'بتاخد +2% لكل الإحصائيات مع كل ولد أو بنت في عيلتك وديوانك.' },
        'killing': { id: 'killing', name: 'سر الفارس الجزار', desc: 'بتاخد +1 نقطة هجوم مع كل 10 أعداء بتهزمهم وتخلص الأرض من شرهم.' },
        'sword_saint': { id: 'sword_saint', name: 'طلسم السيف الدمشقي الأسطوري', desc: '2x ضرر السيف وبتتعلم وتتقن الفنون والمهارات القتالية في ثانية.' }
    },

    // Roll a new life
    rollLife(state) {
        let bgKey = 'farmer';
        if (state.player.wombLineage) {
            if (state.player.wombLineage === 'poor') bgKey = 'beggar';
            else if (state.player.wombLineage === 'merchant') bgKey = 'merchant';
            else if (state.player.wombLineage === 'noble') bgKey = 'royal';
            else if (state.player.wombLineage === 'orphan') bgKey = 'farmer';
        } else {
            const bgKeys = Object.keys(this.backgrounds);
            bgKey = bgKeys[Math.floor(Math.random() * bgKeys.length)];
        }
        
        let sysKey = 'many_children';
        if (state.player.inheritedTrait) {
            if (state.player.inheritedTrait === 'beast_agility' || state._wombGift === 'Strength') {
                sysKey = 'sword_saint';
            } else if (state.player.inheritedTrait === 'royal_pride') {
                sysKey = 'killing';
            } else if (state.player.inheritedTrait === 'bankers_eye') {
                sysKey = 'many_children';
            } else {
                const sysKeys = Object.keys(this.systems);
                sysKey = sysKeys[Math.floor(Math.random() * sysKeys.length)];
            }
        } else {
            const sysKeys = Object.keys(this.systems);
            sysKey = sysKeys[Math.floor(Math.random() * sysKeys.length)];
        }

        state.player.background = this.backgrounds[bgKey];
        state.player.system = this.systems[sysKey];
        
        // Apply immediate background changes, respecting existing gold if higher
        if (state.player.gold === undefined || state.player.gold < state.player.background.gold) {
            state.player.gold = state.player.background.gold;
        }
        if (state.player.background.karma) {
            state.player.karma = (state.player.karma || 0) + state.player.background.karma;
        }
        
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
            const gift = Math.random() > 0.5 ? 'العشبة الطبية الجبلية' : 'كيس دنانير الذهب';
            narrate(`<b>زيارة عائلية</b>: قام ${member.relation} ${member.name} بزيارتك في واحة القوافل. إنه فخور بمسيرتك وبطولتك القتالية، وأهداك <b>${gift}</b>.`, "العائلة");
            member.affinity = Math.min(100, member.affinity + 5);
            if (gift === 'العشبة الطبية الجبلية') { state.player.xp += 100; narrate(`حصلت على 100 نقطة خبرة!`, "ديوان الفرسان"); }
            else { state.player.gold += 500; narrate(`حصلت على 500 دينار ذهبي!`, "ديوان الفرسان"); }
        } else if (roll < 0.7) {
            // Marriage / Sibling Event
            narrate(`<b>أخبار عائلية سارة</b>: ${member.relation} ${member.name} ارتقى إلى مرتبة قتالية جديدة في ديوان الفرسان وتدريباته! زادت روابط مودة عائلتك وأنت تشاركه الفرحة.`, "العائلة");
            member.affinity = Math.min(100, member.affinity + 10);
            member.lvl++;
        } else if (roll < 0.85) {
            // Family Crisis
            const crises = ['Kidnapped', 'Spiritual Poisoning', 'Demonic Incursion'];
            const crisisType = crises[Math.floor(Math.random() * crises.length)];
            const crisisArabic = {
                'Kidnapped': 'مخطوف ومحبوس عند طائفة السيف الأسود الشرير!',
                'Spiritual Poisoning': 'تسمم هالة قنوات الطاقة الباطنية مهدد لحياته!',
                'Demonic Incursion': 'هجوم كوابيس وأرواح مظلمة سلب بصيرته!'
            };
            narrate(`<b>كرب ومصيبة عائلية!</b>: ${member.relation} ${member.name} ${crisisArabic[crisisType]}`, "العائلة");
            narrate(`عليك التحرك لإنقاذهم بسرعة قبل فوات الأوان. (يمكنك حل هذه الأزمة من شاشة العائلة)`, "ديوان الفرسان");
            member.crisis = crisisType;
        } else if (state.player.karma < -50 && roll < 0.95) {
            // Karma Tribulation
            narrate(`<b>تحذير وعاصفة صحراوية</b>: ضربة برد وعاصفة ترابية شديدة ألحقت الضرر بمصفوفة القلعة ومخازنك!`, "العدالة والصمود");
            state.player.hp = Math.max(1, Math.floor(state.player.hp * 0.7));
            if (typeof triggerScreenShake === 'function') triggerScreenShake();
        }
    },

    // Marriage System
    seekMarriage(state, narrate) {
        if (state.player.gold < 5000) return { success: false, message: "gold" };
        
        const candidateNames = ['ليلى', 'ياسمين', 'فاطمة', 'عائشة', 'نور'];
        const name = candidateNames[Math.floor(Math.random() * candidateNames.length)];
        
        state.player.gold -= 5000;
        state.player.spouse = { name, affinity: 70, children: 0 };
        
        return { success: true, message: `married` };
    },

    processBirth(state, narrate) {
        if (!state.player.spouse) return;
        if (Math.random() < 0.1) { // 10% chance per heartbeat if married
            state.player.children = (state.player.children || 0) + 1;
            
            const childNamesMale = ['أحمد', 'يوسف', 'سعد', 'طارق', 'حمزة', 'سليم', 'عمر', 'علي'];
            const childNamesFemale = ['مريم', 'زينب', 'نور', 'ليلى', 'ياسمين', 'عائشة', 'فاطمة', 'فرح'];
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            const name = gender === 'male' ? childNamesMale[Math.floor(Math.random() * childNamesMale.length)] : childNamesFemale[Math.floor(Math.random() * childNamesFemale.length)];
            
            const traits = [
                { id: 'heavenly_bones', name: 'بنية بدنية صلبة', desc: '+20% صحة أساسية دائمة' },
                { id: 'spirit_eye', name: 'بصيرة حادة', desc: '+10% فرصة ضربة قاضية دائمة' },
                { id: 'jinn_luck', name: 'بركة في الرزق', desc: '+50% كسب دنانير ذهبية دائمة' },
                { id: 'sword_master', name: 'براعة النصال', desc: '+15% قوة هجوم دائم' },
                { id: 'shield_master', name: 'صلابة الدفاع', desc: '+15% قوة دفاع دائم' },
                { id: 'quick_learner', name: 'سرعة التعلم', desc: '+25% كسب خبرة وتدريب دائم' }
            ];
            const trait = traits[Math.floor(Math.random() * traits.length)];
            
            const child = {
                id: `child_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                relation: 'Child',
                gender: gender,
                age: 0,
                affinity: 85,
                lvl: 1,
                alive: true,
                trait: trait,
                education: 'None',
                trainingStats: { atk: 0, def: 0, potions: 0 }
            };
            
            if (!state.player.family) state.player.family = [];
            state.player.family.push(child);
            
            narrate(`<b>زيادة في النسل والذرية!</b>: رزقت بشريكة حياتك ${state.player.spouse.name} بمولود جديد أسميتموه <b>${name}</b>! وعززت ميزات هيكله بـ <b>${trait.name}</b>!`, "العائلة");
            if (window.BALANCE) window.BALANCE.applyToState(state); // Re-calculate stat bonuses
        }
    },

    dualCultivate(state) {
        if (!state.player.spouse) {
            return { success: false, message: "يجب عليك الزواج أولاً للقيام بالتأمل المشترك وجلسات الطاقة مع شريكة حياتك!" };
        }
        
        const now = Date.now();
        if (state._lastDualCultivate && now - state._lastDualCultivate < 30000) { 
            const waitTime = Math.ceil((30000 - (now - state._lastDualCultivate)) / 1000);
            return { success: false, message: `جسدك وقنوات طاقتك لا تزال في مرحلة الاستشفاء والاستراحة. انتظر ${waitTime} ثانية.` };
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

        let message = `جلست أنت وشريكة حياتك <b>${state.player.spouse.name}</b> في تأمل باطني مشترك وشحذتما همتكما وطاقتكما الباطنية معاً. حصلت على <span class="loot-epic">+${xpBonus} خبرة باطنية</span>! وزادت الألفة بينكما لتصبح <b>${state.player.spouse.affinity}%</b>.`;
        if (levelUp) {
            message += `<br><br><span class="loot-epic">🌟 ارتقاء وتطور روحي كامل! زاد مستواك درجة كاملة!</span>`;
        }

        if (Math.random() < 0.3) {
            if (!state.player.inventory.materials) state.player.inventory.materials = {};
            state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 1;
            message += `<br><small style="color:var(--secondary)">🎁 حديقة شريكة حياتك الخاصة أهدتك <b>العشبة الطبية الجبلية</b>.</small>`;
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
        if (currentLvl >= 3) return { success: false, message: "max" };
        
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
                message: "resources" 
            };
        }
        
        // Deduct resources
        dw.resources.wood -= cost.wood;
        dw.resources.iron -= cost.iron;
        state.player.gold -= cost.stones;
        state.player.familyPagodaLevel++;
        
        return { 
            success: true, 
            message: "Upgraded ancestral pagoda" 
        };
    },

    // --- Interactive Family Crisis Resolutions ---
    resolveFamilyCrisis(state, memberId, option) {
        const member = (state.player.family || []).find(f => f.id === memberId);
        if (!member || !member.crisis) return { success: false, message: "عائلتك بخير وصحة ولا توجد أي أزمة تواجههم الآن." };
        
        if (option === 'pay') {
            const cost = member.crisis === 'Kidnapped' ? 2000 : 1500;
            if (state.player.gold < cost) return { success: false, message: `ليس لديك الـ ${cost} دينار ذهبي المطلوبة للحل الودي.` };
            
            state.player.gold -= cost;
            member.crisis = null;
            member.affinity = Math.min(100, member.affinity + 20);
            return { 
                success: true, 
                message: "paid" 
            };
        }
        
        if (option === 'disciple') {
            if (!state.sect || !state.sect.disciples || state.sect.disciples.length === 0) {
                return { success: false, message: "ليس لديك طائفة أو فرسان لإرسالهم لهذه المهمة الصعبة!" };
            }
            
            // Find highest level available disciple not on expedition
            const disciple = state.sect.disciples.find(d => d.alive && d.assignment !== 'expedition');
            if (!disciple) return { success: false, message: "كل فرسانك مشغولون في مهام أخرى أو مصابون!" };
            
            const chance = disciple.lvl * 0.15;
            const roll = Math.random();
            
            if (roll <= chance) {
                member.crisis = null;
                member.affinity = Math.min(100, member.affinity + 25);
                disciple.lvl++;
                disciple.atk += 3;
                return {
                    success: true,
                    message: "succeeded"
                };
            } else {
                disciple.lvl = Math.max(1, disciple.lvl - 1);
                return {
                    success: false,
                    message: "failed"
                };
            }
        }
        
        if (option === 'fight') {
            member._pendingRescue = true;
            const boss = {
                id: 'rescue_boss',
                name: member.crisis === 'Kidnapped' ? 'كبير قطاع الطرق الأثيم' : 'وحش الصحراء الغادر الرهيب',
                baseHp: 180 + state.player.lvl * 20,
                hp: 180 + state.player.lvl * 20,
                maxHp: 180 + state.player.lvl * 20,
                baseAtk: 18 + state.player.lvl * 3,
                atk: 18 + state.player.lvl * 3,
                dialogue: "أجئت حقاً لتواجه ملوك الصحراء لتسترد أسيرك؟! ستدفع الثمن من دم قلبك!",
                sprite: 'boss'
            };
            
            setTimeout(() => { startCombat(boss); }, 500);
            return { success: true, message: "fight" };
        }
        
        return { success: false, message: "طريقة غير صالحة للتعامل مع الأزمة." };
    }
};
