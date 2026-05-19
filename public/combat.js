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
            msg += `<br><span style="color:var(--danger)">${enemy.name} يتلقى ${dmg} ضرر ${dot.type === 'burn' ? 'لهب حارق' : dot.type}!</span>`;
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

        // Taming Logic
        if (playerMoveId === 'tame') {
            const chance = (enemy.hp / enemy.maxHp < 0.3) ? 0.8 : 0.2;
            if (Math.random() < chance) {
                spec = 'tamed';
                msg = `عملت حركة ترويض الأرواح المباركة بإيدك. ${enemy.name} خضع وأطاع إرادتك بالكامل!`;
                mom = 100;
            } else {
                msg = `${enemy.name} كشر عن أنيابه وصرخ رافضاً محاولاتك لترويضه ولجمه بقسوة!`;
                eDmg = enemyAtk;
                mom = -30;
            }
            return { playerDmg: 0, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
        }

        // --- Handle Learned Skills Specifically ---
        const skill = window.SKILLS.techniques[playerMoveId];
        if (skill) {
            msg = `أطلقت وفجرت مهارة <b>${skill.name}</b>! `;
            pDmg = Math.floor(playerAtk * (skill.power || 1));
            
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

        return { playerDmg: pDmg, enemyDmg: eDmg, resultText: msg, special: spec, momentumShift: mom };
    }
};