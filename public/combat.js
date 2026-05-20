// ============================================================
// COMBAT.JS — محرك التدريب القتالي والقتال الصحراوي العظيم
// "Legends of the Jade and Sand: The Immortal Codex"
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.COMBAT = {

    // Initialize combat state variables
    initCombatState(state) {
        state.combatState = 'enemy_prep';
        state.momentum = 0; // -100 to 100
        state.playerForm = 'water'; // water, mountain, wind (الماء، الجبل، الرياح)
        state.enemyStaggered = false;
        state.playerGuardBroken = false;
        
        // Reset old buffs/debuffs
        state.activeBuffs = [];
        state.enemyDebuffs = [];
        state.dotEffects = []; // { type: 'burn', dmg: 10, duration: 3 }
        
        state.playerDmgBonus = 1;
        state.enemyAtkDebuff = 1;

        // --- NEW: Dynamic Hero Class Combat Specialization Counters ---
        state.swordIntent = 0;          // Sword Immortal intent counter (0 to 3)
        state.cauldronEssence = 0;      // Medicine Cultivator alchemical counter (0 to 100)
        state.staggerCounter = 0;       // Desert Knight shield/parry counter (0 to 3)
        state.magicCombosCount = 0;     // Sufi Mystic magic combo counter (0 to 2)

        // Apply active companion passive
        const activeComp = window.COMPANIONS?.getActive(state);
        if (activeComp && activeComp.passiveBuff && activeComp.passiveBuff.effect) {
            activeComp.passiveBuff.effect(state);
        }
    },

    // Process status effects at the start of turn
    processTurnEffects(state, enemy) {
        let msg = '';
        
        // 1. Process DOTs
        state.dotEffects = (state.dotEffects || []).filter(dot => {
            const dmg = Math.floor(dot.dmg);
            enemy.hp = Math.max(0, enemy.hp - dmg);
            const typeStr = dot.type === 'burn' ? 'لهب حارق' : (dot.type === 'poison' ? 'سم باطني قاتل' : dot.type);
            msg += `<br><span style="color:var(--danger)">${enemy.name} يتلقى ${dmg} ضرر ${typeStr}!</span>`;
            dot.duration--;
            return dot.duration > 0;
        });

        // 2. Process Buffs
        state.activeBuffs = (state.activeBuffs || []).filter(buff => {
            buff.duration--;
            if (buff.duration <= 0 && buff.onExpire) buff.onExpire(state);
            return buff.duration > 0;
        });

        // 3. Process Debuffs
        state.enemyDebuffs = (state.enemyDebuffs || []).filter(debuff => {
            debuff.duration--;
            return debuff.duration > 0;
        });

        // 4. Player Regens
        if (state.player.supremeMantraActive) {
            const hReg = Math.floor(state.player.maxHp * 0.05);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + hReg);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 5);
            msg += `<br><span style="color:var(--jade); font-weight:bold;">[طقم التنوير الباطني]: تجدد ${hReg} صحة و 5 تركيز باطني!</span>`;
        }
        if (state.player.hpRegen > 0) {
            const hReg = Math.floor(state.player.maxHp * state.player.hpRegen);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + hReg);
            if (hReg > 0) msg += `<br><span style="color:var(--secondary)">تجدد جسدك ونور حياتك بـ ${hReg} نقاط حياة.</span>`;
        }
        if (state.player.mpRegen > 0) {
            const mReg = Math.floor(state.player.maxMp * state.player.mpRegen);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + mReg);
            if (mReg > 0) msg += `<br><span style="color:var(--jade)">تجدد تركيزك الباطني بـ ${mReg} نقاط.</span>`;
        }

        // --- Player Poison and Fear status effects ---
        if (state.playerPoisonTurns && state.playerPoisonTurns > 0) {
            const poisonDmg = Math.max(2, Math.floor(state.player.maxHp * 0.06));
            state.player.hp = Math.max(1, state.player.hp - poisonDmg);
            msg += `<br><span style="color:#2ecc71; font-weight:bold;">🤢 [مسموم]: تسرب السم النضير في عروقك مسبباً ${poisonDmg} ضرر مستمر!</span>`;
            state.playerPoisonTurns--;
        }

        if (state.playerFearTurns && state.playerFearTurns > 0) {
            const fearMpDrain = 10;
            state.player.mp = Math.max(0, state.player.mp - fearMpDrain);
            msg += `<br><span style="color:#9b59b6; font-weight:bold;">😨 [مذعور]: يرتعد قلبك ذعراً من رهبة الكابوس فاقداً ${fearMpDrain} نقاط تركيز (عزيمة)!</span>`;
            state.playerFearTurns--;
        }

        // 4.5 Realm-Specific Start of Turn Mechanics
        const stageIdx = window.CULTIVATION ? window.CULTIVATION.stages.findIndex(s => s.name === state.player.cultivation?.stage) : -1;
        if (stageIdx === 0) { // الفارس المبتدئ: بركة الواحة
            const hReg = Math.floor(state.player.maxHp * 0.05);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + hReg);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 5);
            msg += `<br><span style="color:var(--jade); font-weight:bold;">🌴 [بركة الواحة]: تجدد ${hReg} صحة و 5 عزيمة!</span>`;
        }
        
        // Revive for Realm 10 (stageIdx === 9)
        if (stageIdx === 9 && state.player.hp <= 0 && !state._ultimateReviveUsed) {
            state.player.hp = Math.floor(state.player.maxHp * 0.5);
            state._ultimateReviveUsed = true;
            state.enemyStunned = true;
            msg += `<br><span style="color:#ffcc00; font-weight:bold; text-shadow:0 0 10px #ffcc00;">☀️ [شمس الهجير الشامخة]: نهضت من الموت بروح وضاءة مستعيداً نصف صحتك وشالاً حركة العدو لبرهة!</span>`;
        }

        // 5. Stun recovery
        if (state.enemyStunned) {
            msg += `<br><b>${enemy.name} دايخ ومغمى عليه بالكامل وميقدرش يتحرك اللفة دي!</b>`;
            state.enemyStunned = false; 
            state.skipEnemyTurn = true;
        } else {
            state.skipEnemyTurn = false;
        }

        return msg;
    },

    useCompanionAbility(state, enemy) {
        const activeComp = window.COMPANIONS?.getActive(state);
        if (!activeComp || !activeComp.uniqueAbility) return { success: false, message: 'مفيش قدرة رفيق نشطة حالياً.' };
        
        const ability = activeComp.uniqueAbility;
        const compState = state.companions[activeComp.id];
        const affinityMult = 1 + (compState.affinity / 100); 

        let msg = `<b>${activeComp.name}</b> بيستدعي ويشغل <b>${ability.name}</b>!`;
        let success = true;

        switch(ability.effect) {
            case 'triple_damage_stun':
                const dmg = Math.floor(state.player.atk * 3 * affinityMult);
                enemy.hp = Math.max(0, enemy.hp - dmg);
                state.momentum = Math.min(100, state.momentum + 40);
                msg += `<br>${activeComp.name} بيضرب بكل قوته بـ ${dmg} ضرر وبيدوخ العدو تماماً!`;
                state.enemyStaggered = true;
                break;
            case 'full_party_heal':
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
                msg += `<br>نور الهي طاهر نزل من أقاليم الصحراء ورجع دمك وقوة تركيزك الباطني كاملة مكملة!`;
                break;
            case 'honorable_surrender':
                if (enemy.hp <= enemy.maxHp * 0.4) {
                    enemy.hp = 0;
                    msg += `<br>${enemy.name} اتأثر بشرفك وعهدك وعزتك وأعلن استسلامه ورمى سيفه في الرمل!`;
                } else {
                    msg += `<br>${enemy.name} ضحك باستهزاء على طلبك للاستسلام. لسة قوته جبارة ومستحيل يستسلم دلوقتي!`;
                    success = false;
                }
                break;
            case 'reveal_all_enemy_moves':
                state.enemyMovesRevealed = true;
                msg += `<br>كل حركات وتكتيكات القتال بتاعة ${enemy.name} بقت مكشوفة قدام عنيك وجاهزة!`;
                break;
            case 'debuff_enemy_buff_player':
                state.enemyAtkDebuff = 0.7;
                state.playerDmgBonus = 1.2 * affinityMult;
                msg += `<br>قوة هجوم ${enemy.name} ضعفت وانهارت، وقوتك وموجات الأنوار والتركيز وهمة انفجرت!`;
                break;
            case 'area_damage_or_bypass':
                const areaDmg = Math.floor(state.player.atk * 2 * affinityMult);
                enemy.hp = Math.max(0, enemy.hp - areaDmg);
                msg += `<br>ضربة قاضية أسطورية سببت ${areaDmg} ضرر متجاهلة الدروع وجدران الحماية الباطنية بالكامل!`;
                break;
            case 'bluff_stun':
                state.enemyStaggered = true;
                msg += `<br>العدو واقف متثبت ومذهول بالكامل وضهره مكشوف لسيوفك الدمشقية!`;
                break;
            default:
                msg += `<br>القدرة اشتغلت بس ملهاش أي تأثير في ساحة القتال دي.`;
        }

        // Spend Qi
        state.player.mp = Math.max(0, state.player.mp - (ability.mpCost || 0));
        
        return { success, message: msg };
    },

    // Retrieve specific moves available for a given form + learned techniques
    getActionsForForm(form, state) {
        const baseMoves = {
            water: [
                { id: 'deflect', name: 'صد ضربة ثقيلة (مضاد للثقيل)', type: 'deflect', cost: 0 },
                { id: 'slipstream', name: 'مراوغة سلسة (مضاد للسريع)', type: 'evade', cost: 0 }
            ],
            mountain: [
                { id: 'earthshatter', name: 'زلزال الحجر (يدمر الدفاع)', type: 'heavy', cost: 15 },
                { id: 'mountain_stance', name: 'وضعية الجبل (امتصاص وضرب)', type: 'absorb', cost: 10 }
            ],
            wind: [
                { id: 'gale_strike', name: 'ضربة العاصفة (يقطع السحر)', type: 'fast', cost: 5 },
                { id: 'qi_blade', name: 'سيف الأنوار والتركيز وهمة (يتجاهل الدروع)', type: 'magic', cost: 20 }
            ]
        };
        
        const actions = [...(baseMoves[form] || [])];
        
        // Add learned skills
        if (state.player.skills) {
            state.player.skills.forEach(sId => {
                const s = window.SKILLS.techniques[sId];
                if (s && !s.passive) {
                    actions.push({ ...s, cost: s.mpCost });
                }
            });
        }
        
        return actions;
    },

    // ── ENEMY MEMORY & AI ──
    selectEnemyMove(enemy) {
        const archetype = enemy.archetype || 'balanced';
        let options = [];
        
        switch(archetype) {
            case 'brute': options = ['heavy', 'heavy', 'fast', 'guard']; break;
            case 'assassin': options = ['fast', 'fast', 'fast', 'evade']; break;
            case 'mage': options = ['magic', 'magic', 'deflect', 'evade']; break;
            default: options = ['heavy', 'fast', 'magic', 'guard', 'deflect'];
        }
        
        return options[Math.floor(Math.random() * options.length)];
    },

    getTelegraph(enemy, moveType) {
        const tells = {
            heavy: `${enemy.name} بيثبت رجله في الأرض، وبيرجع كتافه ووزنه لورا لضربة غاشمة ثقيلة.`,
            fast: `${enemy.name} بيوطي جسمه وجاذبيته، وسيفه بيترعش ويلمع لضربة سريعة وخاطفة.`,
            magic: `الهوا حوالين ${enemy.name} بقى ساقع وبرد جداً وهو بيرجع خطوتين لورا عشان يحضر تعويذة سحرية.`,
            guard: `${enemy.name} بيرفع سيفه وسلاحه قريب من صدره، وعنيه بتلف وتراقب حركتك للحماية والدفاع.`,
            deflect: `${enemy.name} واقف بكل هدوء واسترخاء تماماً، وسيفه متدلي ومستني أي هجوم عشان يصده بالملي.`,
            evade: `${enemy.name} واقف خفيف جداً على طراطيف صوابعه، وجاهز ينط ويطير في الهوا للمراوغة السريعة.`
        };
        return tells[moveType] || `${enemy.name} بيراقب خطواتك وعنيك بتركيز شديد.`;
    },

    // ── THE FLOWING DAO RESOLUTION ENGINE ──
    // Returns { playerDmg, enemyDmg, resultText, special, momentumShift }
    resolveMove(playerMoveId, enemyMoveType, playerAtk, enemyAtk, enemy, state) {
        let pDmg = 0;
        let eDmg = 0;
        let msg = '';
        let mom = 0; 
        let spec = null;

        // Apply dynamic clock & weather modifiers
        if (state && state.weather === 'sandstorm') {
            playerAtk = Math.max(1, Math.floor(playerAtk * 0.80));
            enemyAtk = Math.max(1, Math.floor(enemyAtk * 0.80));
            msg += `<span style="color:#e0a96d; font-weight:bold;">[عاصفة رملية: -20% دقة]</span> `;
        }
        if (state && state.weather === 'heatwave') {
            playerAtk = Math.floor(playerAtk * 1.15);
            msg += `<span style="color:#ff5500; font-weight:bold;">[حرارة الفيافي: +15% هجوم]</span> `;
        }

        const isNight = state && state.dayTime !== undefined && (state.dayTime < 5 || state.dayTime >= 21);
        if (isNight) {
            msg += `<span style="color:#8000ff; font-weight:bold;">[الليل القارس: طاقة الباطن +20%]</span> `;
        }

        // Taming Logic
        if (playerMoveId === 'tame') {
            const chance = (enemy.hp / enemy.maxHp < 0.3) ? 0.8 : 0.2;
            if (Math.random() < chance) {
                spec = 'tamed';
                msg += `عملت حركة ترويض الأرواح المباركة بإيدك. ${enemy.name} خضع وأطاع إرادتك بالكامل!`;
                mom = 100;
            } else {
                msg += `${enemy.name} كشر عن أنيابه وصرخ رافضاً محاولاتك لترويضه ولجمه بقسوة!`;
                eDmg = enemyAtk;
                mom = -30;
            }
            return { playerDmg: 0, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
        }

        // --- Handle Learned Skills Specifically ---
        const skill = window.SKILLS.techniques[playerMoveId];
        if (skill) {
            msg += `أطلقت وفجرت مهارة <b>${skill.name}</b>! `;
            let skillAtk = playerAtk;
            if (isNight) {
                skillAtk = Math.floor(skillAtk * 1.20);
            }
            pDmg = Math.floor(skillAtk * (skill.power || 1));
            
            if (skill.heal) {
                const h = Math.floor(state.player.maxHp * skill.heal);
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + h);
                msg += `رجعت وشفت ${h} من نقاط حياتك ببركتك. `;
            }
            
            if (skill.stunChance && Math.random() < skill.stunChance) {
                state.enemyStunned = true;
                msg += `العدو واقف دايخ ومغمى عليه ومبيتحركش! `;
            }
            
            if (skill.dot) {
                state.dotEffects.push({ ...skill.dot, type: 'burn' });
                msg += `العدو ولع وجسده اتحرق بنار هائلة! `;
            }
            
            if (skill.effect) {
                state.activeBuffs.push({ ...skill.effect });
                msg += `موجات طاقة تركيز وهمةك انفجرت وزادت بقوة! `;
            }
            
            if (skill.debuff) {
                state.enemyDebuffs.push({ ...skill.debuff });
                msg += `${enemy.name} ضعف وانهار تحت تأثير تعويذتك وسحرك! `;
            }

            if (skill.hpCost) {
                const cost = Math.floor(state.player.maxHp * skill.hpCost);
                state.player.hp = Math.max(1, state.player.hp - cost);
                msg += `(دفع ${cost} من جوهر الحياة الجسدية) `;
            }

            return { playerDmg: pDmg, enemyDmg: Math.floor(enemyAtk * 0.5), resultText: msg, special: 'skill', momentumShift: 20 };
        }

        // Base damage calculation
        const pBaseDmg = Math.max(1, playerAtk - (enemy.def || 0));
        const eBaseDmg = Math.max(1, enemyAtk - (state.player.def || 0));

        // Custom Enemy Archetype mechanics (Spider poison, Titan form shifters, Nightmare Fear)
        if (enemy) {
            if (enemy.id === 'crossroads_venomous_spider' && enemyMoveType === 'magic') {
                state.playerPoisonTurns = 3;
                msg += `<br><span style="color:#2ecc71; font-weight:bold;">🤢 [عض مسموم]: رش العنكبوت غيمة من السموم الباطنية لتصيب دمك بالسم لـ 3 أدوار!</span>`;
            }
            if (enemy.id === 'shaitan_nightmare' && enemyMoveType === 'magic') {
                state.playerFearTurns = 3;
                msg += `<br><span style="color:#9b59b6; font-weight:bold;">😨 [زئير الرعب]: أطلق الشيطان زئيراً عتيقاً ملأ فؤادك بذعر باطني مهول لـ 3 أدوار!</span>`;
            }
            if (enemy.id === 'sand_dune_titan') {
                if (enemyMoveType === 'heavy') {
                    enemy.def = Math.floor((enemy.def || 5) * 1.5);
                    msg += `<br><span style="color:#d4af37; font-weight:bold;">🏜️ [بلع التراب]: غاص العملاق جزئياً في الكثبان مستمداً حماية التضاريس لقوة دفاعه!</span>`;
                } else if (enemyMoveType === 'magic') {
                    if (!enemy.isStormForm) {
                        enemy.isStormForm = true;
                        enemy.name = "إعصار الكثبان الثائر (شكل العاصفة)";
                        enemy.atk = Math.floor(enemy.atk * 1.5);
                        enemy.def = Math.floor(enemy.def * 0.7);
                        msg += `<br><span style="color:#e67e22; font-weight:bold;">🌀 [تجسد الإعصار]: تطاير جسد العملاق ليتجسد كإعصار رملي نشط وهائل (+50% ضرر هجوم، -30% دفاع)!</span>`;
                    }
                }
            }
        }

        // Execution logic (Staggered state)
        if (state.enemyStaggered) {
            pDmg = pBaseDmg * 3;
            msg = `<b>ضربة قاضية قاتلة!</b> أطلقت كل سحرك وسيفك وسحقت العدو الدايخ بالكامل!`;
            spec = 'execution';
            state.enemyStaggered = false;
            state.momentum = 0; 
            return { playerDmg: pDmg, enemyDmg: 0, resultText: msg, special: spec, momentumShift: 0 };
        }

        if (state.playerGuardBroken) {
            eDmg = eBaseDmg * 2;
            msg = `دفاعك ودرعك اتدمر واتكسر بالكامل! وتلقيت ضربة مدمرة هزت عظامك!`;
            state.playerGuardBroken = false;
            state.momentum = 0;
            return { playerDmg: 0, enemyDmg: eDmg, resultText: msg, special: 'guard_broken', momentumShift: 0 };
        }

        // Action Matrix (The Flow)
        if (playerMoveId === 'deflect') {
            if (enemyMoveType === 'heavy') {
                msg = `صديت ضربته الغاشمة الثقيلة بالملي بالدقة، وخلت توازنه ووزنه يرموه على الأرض!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'magic') {
                msg = `حاولت تصد طاقة الأنوار وسحره بسيفك الدمشقي العادي. وفشلت فشل ذريع وضربك بقوة!`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `صديت ضربة عادية، وقللت الضرر الواقع عليك ببركة حركتك.`;
                mom = 5; eDmg = Math.floor(eBaseDmg * 0.3);
            }
        } 
        else if (playerMoveId === 'slipstream') {
            if (enemyMoveType === 'fast') {
                msg = `عديت وانسحبت من وسط ضرباته السريعة زي المية بين الصوابع، وضربت ضهره المكشوف بالكامل!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'heavy') {
                msg = `حاولت تزيح وتراوغ، بس موجة الصدمة لضربته الثقيلة جابتك وضربتك على الأرض بقسوة.`;
                mom = -10; eDmg = eBaseDmg;
            } else {
                msg = `راوغت هجومه بسلام، وبتدور على فرصة وضهر مكشوف للضرب.`;
                mom = 10;
            }
        }
        else if (playerMoveId === 'earthshatter') {
            if (enemyMoveType === 'guard' || enemyMoveType === 'deflect') {
                msg = `ضربتك الزلزالية الجبارة دشدشت وكسرت دفاعه ودرعه بالكامل بدون رحمة!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 2;
            } else if (enemyMoveType === 'evade') {
                msg = `ضربتك الثقيلة نزلت في الرمل الفاضي وبوظت توازنك. وضهرك بقى مكشوف للضرب بالكامل!`;
                mom = -30; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `تبادلتوا ضربات الحديد والسيوف، بس قوة جبل الطور بتاعتك نزلت أقوى وهزته بعنف.`;
                mom = 10; pDmg = pBaseDmg * 1.2; eDmg = eBaseDmg * 0.8;
            }
        }
        else if (playerMoveId === 'mountain_stance') {
            if (enemyMoveType === 'fast' || enemyMoveType === 'heavy') {
                msg = `امتصيت ضربته الجسدية كلها بجسدك الصلب، واستعملت طاقته الحركية عشان تضربه بضعف القوة!`;
                mom = 20; eDmg = Math.floor(eBaseDmg * 0.5); pDmg = pBaseDmg * 2;
            } else if (enemyMoveType === 'magic') {
                msg = `وضعية الجبل والصلابة مقدرتش تمتص نار وسحر الأنوار اللاهب! حرقتك وسممت عظامك.`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `وقفت ثابت زي الجبل الشامخ، بس مجاش أي هجوم جسدي عليك في اللحظة دي.`;
                mom = 0;
            }
        }
        else if (playerMoveId === 'gale_strike') {
            if (enemyMoveType === 'magic') {
                msg = `طرت وجريت قدام أسرع من الريح، وقطعت عليه سحره وتحضير التعويذة في ثانية!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg;
            } else if (enemyMoveType === 'heavy') {
                msg = `ضربتك السريعة طارت وارتدت من درعه وجسده الثقيل. ونزل عليك بكل هيبته وسحقك بقوة.`;
                mom = -20; eDmg = eBaseDmg * 1.5;
            } else {
                msg = `تبادلتوا ضربات سريعة وخاطفة زي البرق في الهوا.`;
                mom = 5; pDmg = pBaseDmg * 0.8; eDmg = eBaseDmg * 0.8;
            }
        }
        else if (playerMoveId === 'qi_blade') {
            if (enemyMoveType === 'guard' || enemyMoveType === 'deflect') {
                msg = `سيفك من طاقة التركيز والهمة الصافية عدي واخترق درعه ودفاعه الجسدي بالملي!`;
                mom = 30; spec = 'perfect_counter'; pDmg = pBaseDmg * 1.5;
            } else if (enemyMoveType === 'fast') {
                msg = `تحرك بسرعة البرق وقطع تدفق طاقة التركيز والهمة في عروقك في ثانية!`;
                mom = -20; eDmg = eBaseDmg * 1.2;
            } else {
                msg = `السيف البدني والتركيز والهمة ضرب ووجع قنواته البدنية من جوة بنجاح.`;
                mom = 15; pDmg = pBaseDmg * 1.2; eDmg = eBaseDmg * 0.5;
            }
        }

        pDmg = Math.floor(pDmg);
        eDmg = Math.floor(eDmg);

        if (pDmg > 0) {
            const roll = Math.random();
            const critRate = state.player.critRate || 0.05;
            if (roll < critRate) {
                let critMult = 1.5;
                if (state.player.skills && state.player.skills.includes('sword_intent')) critMult += 0.2;
                if (state.player.familyPagodaLevel >= 3) critMult += 0.15;
                
                pDmg = Math.floor(pDmg * critMult);
                msg += ` <span style="color:#ffcc00; font-weight:bold; text-shadow: 0 0 8px #ffcc00, 0 0 3px #ffcc00;">✨ ضربة قاصمة حاسمة!</span>`;
            }
        }

        if (state.player.system && state.player.system.id === 'sword_saint' && pDmg > 0) {
            pDmg *= 2;
            msg += ` <span style="color:var(--secondary); font-weight:bold;">[بركة السياف الأسطوري: 2x ضرر هائل]</span>`;
        }

        if (state.playerForm === 'water' && pDmg > 0) {
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 5);
            msg += ` (وضعية الماء السلسة استعادت 5 نقاط تركيز)`;
        }

        // ========================================================
        // DYNAMIC HERO SPECIALIZATION ENGINE
        // ========================================================
        const heroClass = state.player.class;

        // 1. Sword Intent Gauge (السياف الأسطوري)
        if (heroClass === 'Sword Immortal' && pDmg > 0) {
            state.swordIntent = (state.swordIntent || 0) + 1;
            if (state.swordIntent >= 3) {
                pDmg = Math.floor(pDmg * 2.5);
                state.swordIntent = 0;
                spec = 'perfect_counter';
                msg += `<br><span style="color:#ffd700; font-weight:bold; text-shadow: 0 0 10px #ffd700;">⚔️ ضربة النصل الأسطورية القاصمة! انطلقت نية السيف المطلقة ودمرت دفاع الخصم (ضرر مضاعف 2.5x)!</span>`;
            } else {
                msg += ` <span style="color:#ffd700; font-weight:bold;">[نية السيف: ${state.swordIntent}/3]</span>`;
            }
        }

        // 2. Alchemical Cauldron (الطبيب المعالج)
        if (heroClass === 'Medicine Cultivator') {
            if (playerMoveId !== 'deflect' && playerMoveId !== 'slipstream') {
                state.cauldronEssence = (state.cauldronEssence || 0) + 35;
                if (state.cauldronEssence >= 100) {
                    const healAmt = Math.floor(state.player.maxHp * 0.35);
                    state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmt);
                    state.dotEffects = state.dotEffects || [];
                    state.dotEffects.push({ type: 'poison', dmg: Math.max(5, Math.floor(playerAtk * 0.4)), duration: 4 });
                    state.cauldronEssence = 0;
                    msg += `<br><span style="color:#00ffbb; font-weight:bold; text-shadow: 0 0 10px #00ffbb;">⚗️ سيل الترياق وتطهير الجسد! انفجر مرجل الخيمياء، فاستعدت ${healAmt} نقاط صحة وتسمم دم العدو بسم باطني!</span>`;
                } else {
                    msg += ` <span style="color:#00ffbb; font-weight:bold;">[شحن المرجل: ${state.cauldronEssence}%]</span>`;
                }
            }
        }

        // 3. Stagger & Rage Shield Stance (فارس الصحراء)
        if (heroClass === 'Desert Knight') {
            if (playerMoveId === 'deflect' || playerMoveId === 'mountain_stance' || (eDmg > 0 && eDmg < enemyAtk * 0.5)) {
                state.staggerCounter = (state.staggerCounter || 0) + 1;
                if (state.staggerCounter >= 3) {
                    state.enemyStunned = true;
                    state.enemyStaggered = true;
                    pDmg = Math.floor(playerAtk * 2.0);
                    state.staggerCounter = 0;
                    spec = 'perfect_counter';
                    msg += `<br><span style="color:#e0a96d; font-weight:bold; text-shadow: 0 0 10px #e0a96d;">🛡️ صدمة الترس المرتدة! بعد الصد المتين الثالث، هجمت بترسك الفولاذي، شالاً حركته ومسبباً ${pDmg} ضرر حاسم!</span>`;
                } else {
                    msg += ` <span style="color:#e0a96d; font-weight:bold;">[شحن الترس: ${state.staggerCounter}/3]</span>`;
                }
            }
        }

        // 4. Celestial Flow & Focus Ecstasy (الفارس المهيب)
        if (heroClass === 'Sufi Mystic') {
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 8);
            if (playerMoveId !== 'deflect' && playerMoveId !== 'slipstream') {
                state.magicCombosCount = (state.magicCombosCount || 0) + 1;
                if (state.magicCombosCount >= 2) {
                    pDmg = Math.floor(pDmg * 1.4);
                    state.magicCombosCount = 0;
                    msg += `<br><span style="color:#00ccff; font-weight:bold; text-shadow: 0 0 10px #00ccff;">🧘 وجد السكينة والفيض السماوي! تضاعف فيض الهمة، متجاوزاً حماية الخصم ومسبباً 40% ضرر باطني إضافي!</span>`;
                } else {
                    msg += ` <span style="color:#00ccff; font-weight:bold;">[شحنات السكينة: ${state.magicCombosCount}/2]</span>`;
                }
            }
        }

        // ========================================================
        // PASSIVE BIRTH HERITAGE TRAITS
        // ========================================================
        const lineage = state.player.wombLineage;
        if (lineage === 'poor' && state.player.hp < state.player.maxHp * 0.4) {
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 10);
            eDmg = Math.max(1, Math.floor(eDmg * 0.7));
            msg += `<br><span style="color:var(--jade); font-weight:bold;">[عزيمة الصابرين (سلالة الفقراء): زاد دفاعك 30% وتجدد تركيزك الباطني!]</span>`;
        } else if (lineage === 'noble' && pDmg > 0) {
            pDmg = Math.floor(pDmg * 1.15);
            msg += ` <span style="color:var(--secondary); font-weight:bold;">[عزة الفرسان: +15%]</span>`;
        } else if (lineage === 'orphan' && pDmg > 0 && Math.random() < 0.15) {
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + 15);
            msg += ` <span style="color:#ffcc00; font-weight:bold;">[بركة البرية: استعدت 15 تركيز باطني!]</span>`;
        }

        // ========================================================
        // REALM-SPECIFIC ARABIAN PROGRESSION MECHANICS
        // ========================================================
        const realmIdx = window.CULTIVATION ? window.CULTIVATION.stages.findIndex(s => s.name === state.player.cultivation?.stage) : -1;
        if (realmIdx === 1) { // الفارس المغوار: جسارة الهجير (+15% ضرر عند انخفاض الصحة عن 50%)
            if (state.player.hp < state.player.maxHp * 0.5 && pDmg > 0) {
                pDmg = Math.floor(pDmg * 1.15);
                msg += ` <span style="color:#ffaa00; font-weight:bold;">[جسارة الهجير: +15% ضرر]</span>`;
            }
        }
        else if (realmIdx === 2) { // الفارس الصنديد: الجبل الراسخ (امتصاص 15% من الضرر الوارد)
            if (eDmg > 0) {
                eDmg = Math.floor(eDmg * 0.85);
                msg += ` <span style="color:#a88534; font-weight:bold;">[الجبل الراسخ: تم امتصاص 15% من الضرر الوارد]</span>`;
            }
        }
        else if (realmIdx === 3) { // حارس الثغور الأبي: هيبة الترس والصمود (تقليل 10% من الضرر)
            if (eDmg > 0) {
                eDmg = Math.floor(eDmg * 0.90);
                msg += ` <span style="color:#4a90e2; font-weight:bold;">[هيبة الترس والصمود: -10% ضرر وارد]</span>`;
            }
        }
        else if (realmIdx === 4) { // فارس الكثبان المغوار: وقفة ريح السموم (12% تفادي وهجوم مضاد)
            if (eDmg > 0 && Math.random() < 0.12) {
                const counter = Math.floor(playerAtk * 0.5);
                enemy.hp = Math.max(0, enemy.hp - counter);
                eDmg = 0;
                msg += `<br><span style="color:#00e5ff; font-weight:bold;">🌪️ [وقفة ريح السموم]: تفاديت الهجوم تماماً وضربت ضربة مضادة بقيمة ${counter} ضرر!</span>`;
            }
        }
        else if (realmIdx === 5) { // سيد النصال والديوان: غليان عروق الفرسان (critical hits restore 10 focus)
            if (pDmg > 0 && msg.includes('ضربة قاصمة')) {
                state.player.mp = Math.min(state.player.maxMp, state.player.mp + 10);
                msg += ` <span style="color:#e60000; font-weight:bold;">[غليان عروق الفرسان: استعدت 10 عزيمة]</span>`;
            }
        }
        else if (realmIdx === 7) { // المقاتل الأسطوري المهيب: سورة النخوة والغضب (+10% ضرر ملحمي)
            if (pDmg > 0) {
                pDmg = Math.floor(pDmg * 1.10);
                msg += ` <span style="color:#ff3b30; font-weight:bold;">[سورة النخوة والغضب: +10% ضرر]</span>`;
            }
        }
        else if (realmIdx === 8) { // شيخ فرسان بابل والشرق: هالة الشهامة المطلقة (skills restore 25% of focus cost upon use)
            if (playerMoveId !== 'deflect' && playerMoveId !== 'slipstream' && skill) {
                const refund = Math.floor((skill.mpCost || 0) * 0.25);
                if (refund > 0) {
                    state.player.mp = Math.min(state.player.maxMp, state.player.mp + refund);
                    msg += ` <span style="color:#9b59b6; font-weight:bold;">[هالة الشهامة المطلقة: استرجعت ${refund} عزيمة]</span>`;
                }
            }
        }

        // ========================================================
        // ACTIVE GEAR SET COMBAT EFFECTS
        // ========================================================
        if (state.player.immortalAscensionActive && pDmg > 0) {
            pDmg = Math.floor(pDmg * 1.20);
            msg += ` <span style="color:#ffd700; font-weight:bold;">[طقم الخلود: +20% ضرر]</span>`;
        }

        if (state.player.silkOasisActive) {
            if (playerMoveId === 'deflect' || playerMoveId === 'slipstream') {
                if (enemyAtk > 0) {
                    const refl = Math.max(1, Math.floor(enemyAtk * 0.20));
                    enemy.hp = Math.max(0, enemy.hp - refl);
                    msg += `<br><span style="color:#00ccff; font-weight:bold;">[طقم طريق الحرير]: عكست ${refl} ضرر مرتد إلى الخصم!</span>`;
                }
            }
        }

        if (state.player.supremeSovereignActive) {
            if (playerMoveId !== 'deflect' && playerMoveId !== 'slipstream' && pDmg > 0) {
                pDmg = Math.floor(pDmg * 1.30);
                const drain = Math.floor(pDmg * 0.15);
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + drain);
                msg += ` <span style="color:#ff0077; font-weight:bold;">[طقم الأساطير: +30% ضرر وشفاء +${drain}]</span>`;
            }
        }

        return { playerDmg: pDmg, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
    }
};