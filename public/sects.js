// ============================================================
// SECTS.JS — إدارة القلعة ورابطة الفرسان والجدعان الأحرار
// "ملحمة الشرق الساحر: وصية الفتوة وأساطير الصحراء"
// ============================================================

window.SECTS = {
    ranks: ['الفارس المستجد', 'المقاتل الشجاع', 'حارس الراية والعهد', 'القائد الجسور', 'كبير الفرسان المعتمد', 'سيد الديوان والقلعة'],

    sectsDb: {
        'jade_summit': { 
            id: 'jade_summit', 
            name: 'ديوان جبل الطور للفرسان', 
            tier: 1, 
            reqRealm: 'الجدع المبتدئ', 
            cost: 0, 
            ult: 'jade_storm', 
            ultName: 'عاصفة الطور السحابية الجبارة' 
        },
        'sufi_order': { 
            id: 'sufi_order', 
            name: 'رابطة أبطال الربع الخالي', 
            tier: 2, 
            reqRealm: 'الفتوة الجسور', 
            cost: 1000, 
            ult: 'sand_mantra', 
            ultName: 'ضربة رمال واحة الربع الخالي الجبارة' 
        },
        'solar_temple': { 
            id: 'solar_temple', 
            name: 'ديوان الفرسان الأحرار البهي', 
            tier: 3, 
            reqRealm: 'البطل الشهم', 
            cost: 5000, 
            ult: 'solar_flare', 
            ultName: 'ضربة وميض البرق الشمسي الجبارة' 
        },
        'nascent_void': { 
            id: 'nascent_void', 
            name: 'قلعة النور والشهامة الخالصة', 
            tier: 4, 
            reqRealm: 'كبير الجدعان والزعيم', 
            cost: 15000, 
            ult: 'void_annihilation', 
            ultName: 'طلسم ضربة الإعصار الأكبر' 
        }
    },

    // Initial state for player's default sect
    init(state) {
        if (!state.sect) {
            state.sect = {
                id: 'jade_summit',
                name: 'ديوان جبل الطور للفرسان',
                tier: 1,
                contribution: 50,
                level: 1,
                fame: 10,
                disciples: [],
                maxDisciples: 5,
                treasury: 100,
                specialization: null, // Sword, Alchemy, Array
                buildings: {
                    'meditation_hall': { lvl: 1, name: 'ديوان التدريب وشحذ الهمة', bonus: 'XP' },
                    'spirit_garden': { lvl: 0, name: 'بستان الأعشاب الطبية النادرة', bonus: 'Gold' }
                }
            };
        }
    },

    leaveSect(state) {
        if (!state.sect) return { success: false, message: "إنت مش منضم لأي رابطة أو ديوان فرسان حالياً!" };
        const oldSectName = state.sect.name;
        
        let message = `لقد خرجت رسمياً وتنحيت عن <b>${oldSectName}</b>.`;
        if (state.player.gold >= 1000) {
            state.player.gold -= 1000;
            message += ` دفعت 1,000 دينار ذهبي عشان تحافظ على الفنون اللي اتعلمتها بدون مسح.`;
        } else {
            // Betrayal purges learned sect ultimates from skills array!
            state.player.skills = (state.player.skills || []).filter(s => !s.startsWith('sect_'));
            message += ` <span style="color:var(--danger)">عقوبة لخروجك المفاجئ وغدرك بالعهد، اتمسح منك كل أسرار مهارات القتال الخاصة بالرابطة!</span>`;
        }
        state.sect = null;
        return { success: true, message };
    },

    joinSect(state, sectId) {
        if (state.sect) return { success: false, message: `إنت بالفعل عضو في ${state.sect.name}! لازم تسيبهم الأول.` };
        const s = this.sectsDb[sectId];
        if (!s) return { success: false, message: "الرابطة دي مش موجودة في سجلات العوالم." };
        
        // Check realm requirement
        const currentRealm = state.player.cultivation?.stage || 'الجدع المبتدئ';
        if (s.tier > 1) {
            const realms = ['الجدع المبتدئ', 'الفتوة الجسور', 'البطل الشهم', 'كبير الجدعان والزعيم'];
            const playerRealmIdx = realms.indexOf(currentRealm);
            const reqRealmIdx = realms.indexOf(s.reqRealm);
            if (playerRealmIdx < reqRealmIdx) {
                return { success: false, message: `رتبة فروسيتك وجدعنتك لسة قليلة جداً! محتاج رتبة <b>${s.reqRealm}</b> على الأقل.` };
            }
        }

        if (state.player.gold < s.cost) {
            return { success: false, message: `معندكش دنانير ذهبية كفاية! محتاج ${s.cost} دينار ذهبي.` };
        }
        
        state.player.gold -= s.cost;
        state.sect = {
            id: s.id,
            name: s.name,
            tier: s.tier,
            contribution: 0,
            level: 1,
            fame: s.tier * 20,
            disciples: [],
            maxDisciples: 5,
            treasury: 0,
            specialization: null,
            buildings: {
                'meditation_hall': { lvl: 1, name: 'ديوان التدريب وشحذ الهمة', bonus: 'XP' },
                'spirit_garden': { lvl: 0, name: 'بستان الأعشاب الطبية النادرة', bonus: 'Gold' }
            }
        };

        return { success: true, message: `أهلاً بك! تم قبولك وتعيينك في <b>${s.name}</b> ببركة العهد الأبدي!` };
    },

    learnUltimate(state) {
        if (!state.sect) return { success: false, message: "لازم تنضم لديوان أو رابطة الأول!" };
        const s = this.sectsDb[state.sect.id] || {
            ultName: "مهارة الإعصار الأكبر المدمر",
            ult: "grand_dao",
            tier: state.sect.tier || 1
        };

        const cost = s.tier * 500;
        if ((state.sect.contribution || 0) < cost) {
            return { success: false, message: `معندكش نقاط مساهمة كافية في الديوان! محتاج ${cost} نقطة.` };
        }

        state.sect.contribution -= cost;
        const ultSkillId = 'sect_' + s.ult;
        if ((state.player.skills || []).includes(ultSkillId)) {
            return { success: false, message: "إنت بالفعل أتقنت مهارة القتال الكبرى دي!" };
        }

        if (!state.player.skills) state.player.skills = [];
        state.player.skills.push(ultSkillId);

        // Dynamically append skill registration so combat systems can trigger it
        if (window.SKILLS) {
            window.SKILLS.techniques[ultSkillId] = {
                id: ultSkillId,
                name: s.ultName,
                desc: `مهارة الرابطة الكبرى والأعظم. بتسبب ضرر هجومي جبار بيساوي ${s.tier * 2.5}x هجومك الجسدي الأساسي.`,
                mpCost: s.tier * 15,
                damageMult: s.tier * 2.5
            };
        }

        return { success: true, message: `ألف مبروك! أتقنت وفتحت مهارة القتال الأسطورية للرابطة: <b>${s.ultName}</b>!` };
    },

    setSpecialization(state, path) {
        this.init(state);
        state.sect.specialization = path;
        // Apply immediate bonuses
        if (path === 'طريق السيف الدمشقي') state.player.atk += 10;
        else if (path === 'طريق الكيمياء والطب') state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 20;
        return { success: true, message: `رابطتك وديوانك اختاروا <b>${path}</b>!` };
    },

    // Recruit a random disciple
    recruit(state) {
        this.init(state);
        if (state.sect.disciples.length >= state.sect.maxDisciples) return { success: false, message: "القلعة مليانة فرسان على الآخر!" };
        
        const cost = 1000 * state.sect.level;
        if (state.player.gold < cost) return { success: false, message: "معندكش دنانير كفاية لتعيين ودعوة فرسان جدد!" };
        
        const names = ['سعد', 'سليم', 'كريم', 'فارس', 'نجم', 'بشير', 'أمين'];
        const d = {
            name: names[Math.floor(Math.random() * names.length)] + " " + (state.sect.disciples.length + 1),
            lvl: 1,
            atk: 5 + Math.floor(Math.random() * 5),
            quality: Math.random() > 0.9 ? 'Genius' : 'Normal',
            alive: true
        };
        
        state.player.gold -= cost;
        state.sect.disciples.push(d);
        
        const qualMap = { 'Genius': 'عبقري اللب', 'Normal': 'عادي' };
        return { success: true, message: `عينت الفارس <b>${d.name}</b> (${qualMap[d.quality] || d.quality}) بنجاح!` };
    },

    // Sect Diplomacy database
    rivalSects: [
        { id: 'demon_blade', name: 'طائفة السيف الأسود الغادرة', relation: 'Hostile', power: 500, territory: 'جبال الظلال الوعرة' },
        { id: 'heavenly_lotus', name: 'قلعة الياقوت والصلابة البدنية', relation: 'Neutral', power: 300, territory: 'وادي الرمال الساحرة' },
        { id: 'righteous_sun', name: 'ديوان شمس المشرق العادلة', relation: 'Ally', power: 450, territory: 'هضبة الأنوار الشمسية' }
    ],

    territories: {
        'ضواحي واحة القوافل': { owner: 'Player', income: 100 },
        'جبال الظلال الوعرة': { owner: 'demon_blade', income: 500 },
        'وادي الرمال الساحرة': { owner: 'heavenly_lotus', income: 300 },
        'هضبة الأنوار الشمسية': { owner: 'righteous_sun', income: 450 }
    },

    // Declare war on a rival
    declareWar(state, rivalId) {
        const rival = this.rivalSects.find(r => r.id === rivalId);
        if (!rival) return { success: false, message: "الخصم ده مش موجود." };
        rival.relation = 'War';
        return { success: true, message: `أعلنت الحرب الضروس ورفعت سيفك ضد <b>${rival.name}</b>!` };
    },

    // Resolve a turn of war
    resolveWarTurn(state, rivalId) {
        const rival = this.rivalSects.find(r => r.id === rivalId);
        if (!rival || rival.relation !== 'War') return;

        const playerPower = state.sect.disciples.filter(d => d.alive !== false).reduce((acc, d) => acc + (d.atk || 5), 0);
        const winChance = playerPower / (playerPower + rival.power);

        if (Math.random() < winChance) {
            const gain = Math.floor(rival.power * 0.1);
            state.sect.treasury += gain;
            rival.power -= gain;
            if (rival.power <= 0) {
                rival.relation = 'Defeated';
                this.territories[rival.territory].owner = 'Player';
                return { victory: true, message: `تم سحق <b>${rival.name}</b> بالكامل! إنت دلوقتي بتحكم <b>${rival.territory}</b> بالكامل برفع سيفك.` };
            }
            return { victory: true, message: `الفرسان بتوعك انتصروا في معركة خاطفة ضد ${rival.name}! ونهبوا ${gain} دينار ذهبي.` };
        } else {
            const loss = Math.floor(state.sect.treasury * 0.1);
            state.sect.treasury -= loss;
            if (state.sect.disciples.length > 0) {
                const fallen = state.sect.disciples.pop();
                return { victory: false, message: `قواتك اتهزمت ورجعت متراجعة! الفارس <b>${fallen.name}</b> سقط في المعركة. وخسرت ${loss} دينار ذهبي.` };
            }
            return { victory: false, message: `قلعتك مكشوفة ومفيش دفاع! طائفة ${rival.name} نهبت ${loss} دينار ذهبي من الخزنة.` };
        }
    },

    assignDisciple(state, index, task) {
        this.init(state);
        const d = state.sect.disciples[index];
        if (!d) return { success: false, message: "الفارس مش موجود." };
        if (d.assignment === 'expedition') return { success: false, message: "الفارس في قافلة استكشاف حالياً ومينفعش تغير مهمته!" };
        
        d.assignment = task; // 'array', 'harvest', 'patrol', or undefined (idle)
        
        const taskMap = { 'array': 'التدريب على مهارات القتال', 'harvest': 'جمع الأعشاب والخيرات', 'patrol': 'حراسة ودوريات القلعة', 'expedition': 'قافلة واستكشاف الصحراء' };
        const taskName = taskMap[task] || 'مستريح';
        return { success: true, message: `عينت <b>${d.name}</b> في مهام <b>${taskName}</b>.` };
    },

    sendOnExpedition(state, index) {
        this.init(state);
        const d = state.sect.disciples[index];
        if (!d) return { success: false, message: "الفارس مش موجود." };
        if (d.assignment === 'expedition') return { success: false, message: "الفارس في قافلة استكشاف بالفعل!" };
        
        const dw = state.dwelling || { resources: { food: 0 } };
        if ((dw.resources.food || 0) < 500) {
            return { success: false, message: "معندكش 500 حزمة طعام لتأمين وتزويد القافلة دي!" };
        }
        
        dw.resources.food -= 500;
        d.assignment = 'expedition';
        d.expeditionTicks = 12; // 1 minute (12 ticks of 5s heartbeat)
        return { success: true, message: `بعت الفارس <b>${d.name}</b> في قافلة استكشاف مخاطرة للصحراء! وأمنته بـ 500 حزمة طعام.` };
    },

    // Passive heartbeat (Passive income/fame + Taxation + Sect Contribution Gain)
    process(state) {
        if (!state.sect) return;
        this.init(state);

        state.sect.fame += state.sect.disciples.length * 0.1;
        state.sect.treasury += state.sect.disciples.length * 5;
        state.sect.contribution = (state.sect.contribution || 0) + 15; // Passive contribution over time!

        // Process disciple operations & expeditions
        if (state.sect.disciples) {
            state.sect.disciples.forEach(d => {
                if (!d.alive) return;
                
                // Handle Expeditions
                if (d.assignment === 'expedition') {
                    d.expeditionTicks--;
                    if (d.expeditionTicks <= 0) {
                        d.assignment = undefined; // Return to idle
                        d.lvl++;
                        d.atk += 4;
                        
                        const mats = ['spirit_herb', 'iron_ore', 'monster_core', 'dragon_vein_shard'];
                        const rewardMat = mats[Math.floor(Math.random() * mats.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        
                        if (!state.player.inventory.materials) state.player.inventory.materials = {};
                        state.player.inventory.materials[rewardMat] = (state.player.inventory.materials[rewardMat] || 0) + qty;
                        
                        const matMap = {
                            'spirit_herb': 'العشبة الطبية الجبلية',
                            'iron_ore': 'خام الحديد الدمشقي',
                            'monster_core': 'نواة الوحش البري',
                            'dragon_vein_shard': 'شظية الصخرة البلورية النادرة'
                        };

                        let pillMsg = "";
                        if (Math.random() < 0.4) {
                            if (!state.player.inventory.items) state.player.inventory.items = [];
                            state.player.inventory.items.push({
                                id: 'qi_pill',
                                name: 'حبة الطاقة والهمة',
                                slot: 'pill',
                                quality: 'Rare',
                                desc: 'تمنح 100 نقطة خبرة وتدريب بدني فوراً عند بلعها.'
                            });
                            pillMsg = " وحبة واحدة من <b>إكسير الطاقة والهمة</b>";
                        }
                        
                        if (typeof narrate === 'function') {
                            const matDisplayName = matMap[rewardMat] || rewardMat.replace(/_/g, ' ').toUpperCase();
                            narrate(`<b>عودة القافلة الاستكشافية</b>: الفارس <b>${d.name}</b> رجع بالسلامة من الصحراء! وارتقى مستوى (مستوى ${d.lvl}) ولاقى <b>${qty}x ${matDisplayName}</b>${pillMsg}!`, "الديوان");
                        }
                    }
                }
                
                // Handle Resource Harvesting
                if (d.assignment === 'harvest') {
                    if (!state.player.inventory.materials) state.player.inventory.materials = {};
                    const harvestRoll = Math.random();
                    if (harvestRoll < 0.3) {
                        state.player.inventory.materials['spirit_herb'] = (state.player.inventory.materials['spirit_herb'] || 0) + 1;
                    } else if (harvestRoll < 0.6) {
                        state.player.inventory.materials['iron_ore'] = (state.player.inventory.materials['iron_ore'] || 0) + 1;
                    }
                    if (state.dwelling && state.dwelling.resources) {
                        state.dwelling.resources.food = (state.dwelling.resources.food || 0) + 2;
                    }
                }
            });
        }

        // Territory Taxation
        Object.values(this.territories).forEach(t => {
            if (t.owner === 'Player') state.sect.treasury += t.income / 10;
        });
    },

    processRandomEvent(state, narrate) {
        this.init(state);
        const roll = Math.random();

        if (roll < 0.3) {
            const stones = Math.floor(Math.random() * 1000) + 200;
            narrate(`<b>اكتشاف في القلعة</b>: أحد الفرسان لاقى منبع مياه عذبة مخفي في الجبل! وتم إضافة <b>+${stones} دينار ذهبي</b> للخزينة العائلية.`, "القلعة");
            state.sect.treasury += stones;
        } else if (roll < 0.6) {
            narrate(`<b>موهبة جديدة مباركة</b>: فارس عبقري جوال انبهر بهيبة قلعتك المدوية (${Math.floor(state.sect.fame)}) وعايز ينضم ليك!`, "القلعة");
            const d = { name: "العبقري سعد " + (state.sect.disciples.length + 1), lvl: 2, atk: 15, quality: 'Genius', alive: true };
            state.sect.disciples.push(d);
        } else if (roll < 0.9) {
            const warring = this.rivalSects.filter(r => r.relation === 'War');
            if (warring.length > 0) {
                const rival = warring[Math.floor(Math.random() * warring.length)];
                const res = this.resolveWarTurn(state, rival.id);
                narrate(res.message, "غرفة الحرب والقيادة");
            } else {
                const rival = this.rivalSects[Math.floor(Math.random() * this.rivalSects.length)];
                if (rival.relation === 'Hostile' && Math.random() > 0.7) {
                    narrate(`<b>معركة خاطفة!</b>: رابطة <b>${rival.name}</b> ضايقت قوافل التجارة بتاعتك في وضح النهار. الخزنة اتأثرت وخسرت 200 دينار.`, "القلعة");
                    state.sect.treasury -= 200;
                }
            }
        }
    }
};
