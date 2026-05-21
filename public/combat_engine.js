// combat_engine.js – Pure combat logic ES module

export function initCombatState(state) {
    state.combatState = 'enemy_prep';
    state.momentum = 0;
    state.playerForm = 'water';
    state.enemyStaggered = false;
    state.playerGuardBroken = false;
    state.activeBuffs = [];
    state.enemyDebuffs = [];
    state.dotEffects = [];
    state.playerDmgBonus = 1;
    state.enemyAtkDebuff = 1;
    state.swordIntent = 0;
    state.cauldronEssence = 0;
    state.staggerCounter = 0;
    state.magicCombosCount = 0;
    state.playerPoisonTurns = 0;
    state.playerFearTurns = 0;
    state._ultimateReviveUsed = false;
    const comp = window.COMPANIONS?.getActive(state);
    if (comp?.passiveBuff?.effect) comp.passiveBuff.effect(state);
}

export function processTurnEffects(state, enemy) {
    let msg = '';
    state.dotEffects = (state.dotEffects || []).filter(dot => {
        const d = Math.floor(dot.dmg);
        enemy.hp = Math.max(0, enemy.hp - d);
        const t = dot.type === 'burn' ? 'لهب' : dot.type === 'poison' ? 'سم' : dot.type;
        msg += `<br><span style="color:var(--danger)">${enemy.name} يتلقى ${d} ${t}!</span>`;
        return --dot.duration > 0;
    });
    state.activeBuffs = (state.activeBuffs || []).filter(b => {
        if (--b.duration <= 0 && b.onExpire) b.onExpire(state);
        return b.duration > 0;
    });
    state.enemyDebuffs = (state.enemyDebuffs || []).filter(d => --d.duration > 0);

    if (state.player.supremeMantraActive) {
        const h = Math.floor(state.player.maxHp * 0.05);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + h);
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + 5);
        msg += `<br><span style="color:var(--jade);font-weight:bold;">[التنوير] +${h} صحة +5 تركيز</span>`;
    }
    if ((state.player.hpRegen || 0) > 0) {
        const h = Math.floor(state.player.maxHp * state.player.hpRegen);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + h);
        if (h > 0) msg += `<br><span style="color:var(--secondary)">تجدد +${h} صحة</span>`;
    }
    if ((state.player.mpRegen || 0) > 0) {
        const m = Math.floor(state.player.maxMp * state.player.mpRegen);
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + m);
        if (m > 0) msg += `<br><span style="color:var(--jade)">تجدد +${m} تركيز</span>`;
    }
    // Water Stance: Flowing Focus Regeneration (Recover 10% Focus MP)
    if (state.playerForm === 'water') {
        const flowRegen = Math.max(8, Math.floor(state.player.maxMp * 0.10));
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + flowRegen);
        msg += `<br><span style="color:#00e5a0;font-weight:bold;">🌊 [وضعية المية] تجدد انسيابي +${flowRegen} تركيز</span>`;
    }
    if ((state.playerPoisonTurns || 0) > 0) {
        const d = Math.max(2, Math.floor(state.player.maxHp * 0.06));
        state.player.hp = Math.max(1, state.player.hp - d);
        msg += `<br><span style="color:#2ecc71;font-weight:bold;">🤢 [سم] ${d} ضرر!</span>`;
        state.playerPoisonTurns--;
    }
    if ((state.playerFearTurns || 0) > 0) {
        state.player.mp = Math.max(0, state.player.mp - 10);
        msg += `<br><span style="color:#9b59b6;font-weight:bold;">😨 [ذعر] -10 تركيز!</span>`;
        state.playerFearTurns--;
    }
    if (state.player.hp <= 0 && !state._ultimateReviveUsed) {
        const stageIdx = window.CULTIVATION?.stages?.findIndex(s => s.name === state.player.cultivation?.stage) ?? -1;
        if (stageIdx >= 9) {
            state.player.hp = Math.floor(state.player.maxHp * 0.5);
            state._ultimateReviveUsed = true;
            state.enemyStunned = true;
            msg += `<br><span style="color:#ffcc00;font-weight:bold;text-shadow:0 0 10px #ffcc00;">☀️ [شمس الهجير]: نهضت من الموت!</span>`;
        }
    }
    if (state.enemyStunned) {
        msg += `<br><b>${enemy.name} مشلول تماماً!</b>`;
        state.enemyStunned = false;
        state.skipEnemyTurn = true;
    } else {
        state.skipEnemyTurn = false;
    }

    // Weather effects during combat
    if (window.WEATHER_SYSTEM && typeof window.WEATHER_SYSTEM.getModifiers === 'function') {
        const wMods = window.WEATHER_SYSTEM.getModifiers();
        if (wMods.hpDrainMult > 0) {
            const d = Math.max(1, Math.floor(state.player.maxHp * wMods.hpDrainMult));
            state.player.hp = Math.max(1, state.player.hp - d);
            
            // Also drain enemy/monster health in heatwave!
            const ed = Math.max(1, Math.floor(enemy.maxHp * wMods.hpDrainMult));
            enemy.hp = Math.max(0, enemy.hp - ed);
            
            msg += `<br><span style="color:#ff4500;font-weight:bold;">🔥 [حر الهجير] استنزفت ضربات الشمس الحارقة -${d} صحة منك و -${ed} صحة من ${enemy.name}!</span>`;
            window.COMBAT_UI?.playEffect('fire', 'player');
            window.COMBAT_UI?.playEffect('fire', 'enemy');
        }
        if (wMods.mpRegenMult > 1) {
            const regen = Math.floor(state.player.maxMp * 0.15);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + regen);
            msg += `<br><span style="color:#9b59b6;font-weight:bold;">🔮 [ضباب الأثير] تشرب هالتك التشي الباطني: +${regen} تركيز!</span>`;
            window.COMBAT_UI?.playEffect('heal', 'player');
        }
        
        // Show subtle ambient particles during active weather states in combat
        const activeWeather = window.WEATHER_SYSTEM.currentWeather;
        if (activeWeather === 'sandstorm' && Math.random() < 0.3) {
            window.COMBAT_UI?.playEffect('poison', 'enemy');
        } else if (activeWeather === 'eclipse' && Math.random() < 0.3) {
            window.COMBAT_UI?.playEffect('fear', 'enemy');
        }
        
        window.WEATHER_SYSTEM.advanceTurns(state, 1);
    }
    return msg;
}

export function useCompanionAbility(state, enemy) {
    const comp = window.COMPANIONS?.getActive(state);
    if (!comp?.uniqueAbility) return { success: false, message: 'مفيش رفيق نشط.' };
    const ab = comp.uniqueAbility;
    const aff = 1 + ((state.companions?.[comp.id]?.affinity || 0) / 100);
    let msg = `<b>${comp.name}</b> يشغّل <b>${ab.name}</b>!`;
    let ok = true;
    switch (ab.effect) {
        case 'triple_damage_stun': { const d = Math.floor(state.player.atk*3*aff); enemy.hp = Math.max(0,enemy.hp-d); state.momentum = Math.min(100,state.momentum+40); msg+=`<br>${comp.name} سبب ${d} ضرر وأذهل العدو!`; state.enemyStaggered=true; break; }
        case 'full_party_heal': state.player.hp=state.player.maxHp; state.player.mp=state.player.maxMp; msg+='<br>صحة وتركيز كاملان!'; break;
        case 'honorable_surrender': if(enemy.hp<=enemy.maxHp*0.4){enemy.hp=0;msg+='<br>العدو استسلم!';}else{msg+='<br>العدو رفض!';ok=false;} break;
        case 'reveal_all_enemy_moves': state.enemyMovesRevealed=true; msg+='<br>حركات العدو مكشوفة!'; break;
        case 'debuff_enemy_buff_player': state.enemyAtkDebuff=0.7; state.playerDmgBonus=1.2*aff; msg+='<br>العدو ضعف وقوتك زادت!'; break;
        case 'area_damage_or_bypass': { const d=Math.floor(state.player.atk*2*aff); enemy.hp=Math.max(0,enemy.hp-d); msg+=`<br>ضربة ${d} تجاهلت الدروع!`; break; }
        case 'bluff_stun': state.enemyStaggered=true; msg+='<br>العدو مذهول!'; break;
        default: msg+='<br>اشتغلت.';
    }
    state.player.mp = Math.max(0, state.player.mp - (ab.mpCost||0));
    return { success: ok, message: msg };
}

export function getActionsForForm(form, state) {
    const BASE = {
        water:    [{id:'deflect',name:'صد الثقيل',type:'deflect',cost:0},{id:'slipstream',name:'مراوغة السريع',type:'evade',cost:0}],
        mountain: [{id:'earthshatter',name:'زلزال الحجر',type:'heavy',cost:15},{id:'mountain_stance',name:'وضعية الجبل',type:'absorb',cost:10}],
        wind:     [{id:'gale_strike',name:'ضربة الريح',type:'fast',cost:5},{id:'qi_blade',name:'سيف النور',type:'magic',cost:20}]
    };
    const actions = [...(BASE[form]||[])];
    (state.player.skills||[]).forEach(sid => {
        const s = window.SKILLS?.techniques?.[sid];
        if (s && !s.passive) actions.push({...s, cost:s.mpCost});
    });
    return actions;
}

export function selectEnemyMove(enemy) {
    const pools = {
        brute:['heavy','heavy','fast','guard'],
        assassin:['fast','fast','fast','evade'],
        mage:['magic','magic','deflect','evade'],
        poisoner:['fast','magic','magic','evade'],
        mind_destroyer:['magic','magic','guard','evade'],
        shifter:['heavy','fast','magic','guard'],
        balanced:['heavy','fast','magic','guard','deflect']
    };
    const pool = pools[enemy.archetype]||pools.balanced;
    return pool[Math.floor(Math.random()*pool.length)];
}

export function getTelegraph(enemy, moveType) {
    if (enemy.moves && enemy.moves[moveType]) {
        return `<span style="color:var(--danger); font-weight:bold;">[${enemy.moves[moveType].name}]</span>: ${enemy.moves[moveType].text}`;
    }
    const t = {
        heavy:   `${enemy.name} يجمع ثقله لضربة مدمرة!`,
        fast:    `${enemy.name} يشحن لهجوم خاطف كالبرق!`,
        magic:   `الهواء يتجمد حول ${enemy.name} وهو يستدعي سحراً!`,
        guard:   `${enemy.name} يرفع درعه للدفاع.`,
        deflect: `${enemy.name} ينتظر هجومك ليصده.`,
        evade:   `${enemy.name} جاهز للقفز والمراوغة!`
    };
    return t[moveType]||`${enemy.name} يراقبك بعيون حادة.`;
}

export function resolveMove(playerMoveId, enemyMoveType, playerAtk, enemyAtk, enemy, state) {
    let pDmg=0, eDmg=0, msg='', mom=0, spec=null;

    // Advanced Unified Weather modifiers
    let wMods = { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1, hpDrainMult: 0, critDamageMult: 0, skillCostMult: 1 };
    if (window.WEATHER_SYSTEM && typeof window.WEATHER_SYSTEM.getModifiers === 'function') {
        wMods = window.WEATHER_SYSTEM.getModifiers();
        const activeWeather = window.WEATHER_SYSTEM.currentWeather;
        
        if (activeWeather === 'sandstorm') {
            // Player attack already includes the 0.75x sandstorm penalty from calculateTotalStats()
            enemyAtk = Math.max(1, Math.floor(enemyAtk * wMods.atkMult));
            msg += `<span style="color:#d4af37;font-weight:bold;">[عاصفة السموم: -25% هجوم للطرفين] </span>`;
        } else if (activeWeather === 'heatwave') {
            // Player attack already includes the 1.25x heatwave boost from calculateTotalStats()
            enemyAtk = Math.floor(enemyAtk * wMods.atkMult); // Boost monster/enemy attack by 25% too!
            msg += `<span style="color:#ff4500;font-weight:bold;">[حر الهجير: +25% هجوم للطرفين] </span>`;
        } else if (activeWeather === 'spiritual_mist') {
            // Apply 10% enemy dodge rate penalty (meaning player deals 10% extra base damage)
            playerAtk = Math.floor(playerAtk * 1.10);
            msg += `<span style="color:#9b59b6;font-weight:bold;">[ضباب الأثير: +25% للمهارات وعجز 10% تفادي العدو] </span>`;
        } else if (activeWeather === 'eclipse') {
            msg += `<span style="color:#ff4d4d;font-weight:bold;">[الخسوف المظلم: ضربات الطرفين تخترق 20% من الدفاع] </span>`;
        }
    }
    const isNight = state?.dayTime!==undefined && (state.dayTime<5||state.dayTime>=21);
    if (isNight) msg+=`<span style="color:#8000ff;font-weight:bold;">[ليل: +20% هجوم باطني] </span>`;

    if (playerMoveId==='tame') {
        const ok = Math.random()<((enemy.hp/enemy.maxHp<0.3)?0.8:0.2);
        msg = ok ? `روّضت ${enemy.name}!` : `${enemy.name} رفض وهاجم!`;
        return { playerDmg:0, enemyDmg:ok?0:enemyAtk, resultText:msg, special:ok?'tamed':null, momentumShift:ok?100:-30 };
    }

    const skill = window.SKILLS?.techniques?.[playerMoveId];
    if (skill) {
        msg += `أطلقت <b>${skill.name}</b>! `;
        let sAtk = isNight ? Math.floor(playerAtk*1.2) : playerAtk;
        if (wMods.atkMult > 1 && window.WEATHER_SYSTEM?.currentWeather === 'spiritual_mist') {
            sAtk = Math.floor(sAtk * wMods.atkMult);
        }
        let ignorePct = (window.WEATHER_SYSTEM?.currentWeather === 'eclipse') ? 0.20 : 0.0;
        let enemyDef = (enemy.def || 5) * (1 - ignorePct);
        pDmg = Math.max(1, Math.floor((sAtk * (skill.power || 1)) - enemyDef));
        if (skill.heal) { 
            let h=Math.floor(state.player.maxHp*skill.heal); 
            if (wMods.healMult > 1) {
                h = Math.floor(h * wMods.healMult);
                msg+=`<span style="color:#00ffcc;">[بركة الضباب: شفاء +30%] </span>`;
            }
            state.player.hp=Math.min(state.player.maxHp,state.player.hp+h); 
            msg+=`+${h} صحة. `; 
        }
        if (skill.stunChance&&Math.random()<skill.stunChance) { state.enemyStunned=true; msg+='العدو مشلول! '; }
        if (skill.dot) { state.dotEffects.push({...skill.dot,type:'burn'}); msg+='حريق! '; }
        if (skill.effect) { state.activeBuffs.push({...skill.effect}); msg+='طاقتك زادت! '; }
        if (skill.debuff) { state.enemyDebuffs.push({...skill.debuff}); msg+=`${enemy.name} ضعف! `; }
        if (skill.hpCost) { const c=Math.floor(state.player.maxHp*skill.hpCost); state.player.hp=Math.max(1,state.player.hp-c); msg+=`(-${c} دم) `; }
        return { playerDmg:pDmg, enemyDmg:Math.floor(enemyAtk*0.5), resultText:msg, special:'skill', momentumShift:20 };
    }

    let ignorePct = (window.WEATHER_SYSTEM?.currentWeather === 'eclipse') ? 0.20 : 0.0;
    const pBase = Math.max(1, Math.floor(playerAtk - ((enemy.def || 5) * (1 - ignorePct))));
    // Eclipse lets enemies ignore 20% of player's defense too!
    const eBase = Math.max(1, Math.floor(enemyAtk - ((state.player.def || 0) * (1 - ignorePct))));

    // Enemy archetype specials
    if (enemy?.id==='crossroads_venomous_spider' && enemyMoveType==='magic') {
        // Spider uses venom glands/fangs — NOT shoulders
        state.playerPoisonTurns = 3;
        msg+=`<br><span style="color:#2ecc71;font-weight:bold;">🕷️ بخّ العنكبوت سحابة سم من غددته السامة لـ 3 أدوار!</span>`;
    }
    if (enemy?.archetype==='poisoner' && enemyMoveType==='fast') {
        if (!state.playerPoisonTurns || state.playerPoisonTurns<=0) {
            state.playerPoisonTurns = 2;
            msg+=`<br><span style="color:#2ecc71;">☠️ طعنة مسمومة: ${enemy.name} سمّ ${enemy.moves?.fast?.name||'طعنته'}!</span>`;
        }
    }
    if (enemy?.id==='shaitan_nightmare' && enemyMoveType==='magic') {
        state.playerFearTurns=3;
        msg+=`<br><span style="color:#9b59b6;font-weight:bold;">😨 [زئير الرعب]: ذعر لـ 3 أدوار!</span>`;
    }
    if (enemy?.id==='sand_dune_titan') {
        if (enemyMoveType==='heavy') { enemy.def=Math.floor((enemy.def||5)*1.5); msg+=`<br><span style="color:#d4af37;font-weight:bold;">🏜️ [بلع التراب]: دفاع العملاق ارتفع!</span>`; }
        else if (enemyMoveType==='magic'&&!enemy.isStormForm) { enemy.isStormForm=true; enemy.name='إعصار الكثبان الثائر'; enemy.atk=Math.floor(enemy.atk*1.5); enemy.def=Math.floor(enemy.def*.7); msg+=`<br><span style="color:#e67e22;font-weight:bold;">🌀 [تجسد الإعصار]: +50% هجوم -30% دفاع!</span>`; }
    }
    if (enemy?.id==='ifrit' && enemyMoveType==='heavy') { eDmg+=Math.floor(eBase*.3); msg+=`<br><span style="color:#ff5500;font-weight:bold;">🔥 نار الجحيم تخترق الدرع!</span>`; }
    if (enemy?.id==='jade_golem' && enemyMoveType==='magic') {
        if (state.playerForm === 'mountain') {
            msg+=`<br><span style="color:#00ffcc;font-weight:bold;">🏔️ [ثبات الجبل] قاومت ختم التثبيت الأرضي بالثبات المطلق!</span>`;
        } else {
            state.playerGuardBroken=true;
            msg+=`<br><span style="color:#00a86b;font-weight:bold;">🌀 ختم التثبيت الأرضي كسر دفاعك!</span>`;
        }
    }
    if (enemy?.archetype==='mind_destroyer' && enemyMoveType==='magic') { const drain=Math.min(15,state.player.mp); state.player.mp=Math.max(0,state.player.mp-drain); msg+=`<br><span style="color:#bf5fff;">🔮 سحب عزيمة: -${drain} تركيز!</span>`; }
    if (enemy?.archetype==='brute' && enemyMoveType==='heavy' && Math.random()<.25) {
        if (state.playerForm === 'mountain') {
            msg+=`<br><span style="color:#00ffcc;font-weight:bold;">🏔️ [درع الجبل] درعك الصلب قاوم كسر الدفاع بنجاح!</span>`;
        } else {
            state.playerGuardBroken=true;
            msg+=`<br><span style="color:#ff8c00;font-weight:bold;">💥 الضربة الغاشمة كسرت درعك!</span>`;
        }
    }

    if (state.enemyStaggered) {
        pDmg=pBase*3; msg=`<b>ضربة قاضية!</b> سحقت العدو الدايخ! `; spec='execution';
        state.enemyStaggered=false; state.momentum=0;
        window.COMBAT_UI?.playEffect('execution','enemy');
        return { playerDmg:Math.floor(pDmg), enemyDmg:0, resultText:msg, special:spec, momentumShift:0 };
    }
    if (state.playerGuardBroken) {
        eDmg=eBase*2; msg=`دفاعك اتكسر! ضربة مدمرة! `; spec='guard_broken';
        state.playerGuardBroken=false; state.momentum=0;
        window.COMBAT_UI?.playEffect('guard_break','player');
        return { playerDmg:0, enemyDmg:Math.floor(eDmg), resultText:msg, special:spec, momentumShift:0 };
    }

    // Action matrix
    switch(playerMoveId) {
        case 'deflect':
            if (enemyMoveType==='heavy')      { msg='صددت الثقيلة بالمللي وأسقطته!';         mom=30; spec='perfect_counter'; pDmg=pBase*1.5; }
            else if (enemyMoveType==='magic') { msg='فشلت في صد السحر!';                      mom=-20; eDmg=eBase*1.5; }
            else                              { msg='صددت وقللت الضرر.';                       mom=5; eDmg=eBase*.3; } break;
        case 'slipstream':
            if (enemyMoveType==='fast')       { msg='تفاديت وضربت ظهره!';                     mom=30; spec='perfect_counter'; pDmg=pBase*1.5; }
            else if (enemyMoveType==='heavy') { msg='موجة الصدمة رمتك!';                      mom=-10; eDmg=eBase; }
            else                              { msg='راوغت بسلام.';                             mom=10; } break;
        case 'earthshatter':
            if (enemyMoveType==='guard'||enemyMoveType==='deflect') { msg='زلزالك كسر دفاعه!'; mom=30; spec='perfect_counter'; pDmg=pBase*2; }
            else if (enemyMoveType==='evade') { msg='ضربتك في الفراغ!';                        mom=-30; eDmg=eBase*1.5; }
            else                              { msg='تبادلتم الضربات وزلزالك أقوى.';           mom=10; pDmg=pBase*1.2; eDmg=eBase*.8; } break;
        case 'mountain_stance': {
            const abs=Math.floor(eBase*.6); state.player.hp=Math.min(state.player.maxHp,state.player.hp+abs);
            msg=`وضعية الجبل: امتصصت ${abs} ضرر!`; mom=20; pDmg=pBase*.8; break;
        }
        case 'gale_strike':
            if (enemyMoveType==='magic') { msg='الريح قطعت تعويذته!'; mom=25; spec='perfect_counter'; pDmg=pBase*2; }
            else                         { msg='ضربة العاصفة أصابت!'; mom=15; pDmg=pBase*1.2; eDmg=eBase*.4; } break;
        case 'qi_blade':
            if ((state.player.mp||0)<20) { msg='تركيزك غير كافٍ!'; eDmg=eBase; }
            else { state.player.mp-=20; pDmg=pBase*1.8; msg='سيف النور اخترق الدروع!'; mom=20; } break;
        default:
            pDmg=pBase; eDmg=eBase*.8; msg='تبادلتم ضربات متكافئة.'; mom=5;
    }

    // Append unique enemy attack name if they dealt damage
    if (eDmg > 0 && enemy.moves && enemy.moves[enemyMoveType]) {
        msg += `<br><span style="color:var(--danger); font-size:0.9em;">[${enemy.moves[enemyMoveType].name}] أصابتك!</span>`;
    }

    // Heritage Trait Active Effects
    const trait = state.player.inheritedTrait;
    if (trait === 'resolute_will' && state.player.hp < state.player.maxHp * 0.3 && eDmg > 0) {
        const reduced = Math.floor(eDmg * 0.25);
        eDmg -= reduced;
        msg += `<br><span style="color:#bdc3c7;font-weight:bold;">[عزيمة الصابرين]: قلل الضرر بمقدار ${reduced}!</span>`;
    }
    if (trait === 'royal_pride' && spec === 'crit') {
        const mpGain = Math.floor(state.player.maxMp * 0.05);
        state.player.mp = Math.min(state.player.maxMp, state.player.mp + mpGain);
        msg += ` <span style="color:#9b59b6;">[عزة الفرسان: +${mpGain} تركيز]</span>`;
    }
    if (trait === 'bankers_eye' && eDmg > 0 && Math.random() < 0.15) {
        const goldDrops = Math.floor(Math.random() * 5) + 2;
        state.player.gold = (state.player.gold || 0) + goldDrops;
        msg += `<br><span style="color:#f1c40f;font-weight:bold;">💰 [نفوذ الصراف]: سقطت ${goldDrops} ذهب أثناء المعركة!</span>`;
    }
    if (trait === 'beast_agility' && eDmg === 0 && Math.random() < 0.25 && enemyMoveType !== 'guard' && enemyMoveType !== 'deflect') {
        const counter = Math.floor(playerAtk * 0.5);
        pDmg += counter;
        msg += `<br><span style="color:#e67e22;font-weight:bold;">🐺 [خفة الفهد]: هجوم مضاد سريع (${counter} ضرر)!</span>`;
        window.COMBAT_UI?.playEffect('execution', 'enemy');
    }

    pDmg=Math.floor(pDmg); eDmg=Math.floor(eDmg);

    // Apply Sandstorm Evasion/Accuracy misses
    if (pDmg > 0 && wMods.accuracyBonus < 0 && Math.random() < Math.abs(wMods.accuracyBonus)) {
        pDmg = Math.floor(pDmg * 0.35);
        msg += `<br><span style="color:#d4af37;font-weight:bold;">💨 [أتربة السموم] حجب الغبار هجومك وتسبب بضربة طفيفة (35% ضرر)!</span>`;
        window.COMBAT_UI?.playEffect('poison', 'enemy');
    }
    if (eDmg > 0 && wMods.accuracyBonus < 0 && Math.random() < Math.abs(wMods.accuracyBonus)) {
        eDmg = Math.floor(eDmg * 0.35);
        msg += `<br><span style="color:#d4af37;font-weight:bold;">💨 [تفادي العاصفة] أعمت الأتربة عيون العدو وقللت ضرر ضربته!</span>`;
        window.COMBAT_UI?.playEffect('poison', 'player');
    }

    // Critical hit
    if (pDmg>0 && Math.random()<(state.player.critRate||0.05)) {
        let cm=1.5;
        if (state.player.skills?.includes('sword_intent')) cm+=.2;
        if ((state.player.familyPagodaLevel||0)>=3) cm+=.15;
        if (wMods.critDamageMult > 0) {
            cm += wMods.critDamageMult;
            msg += ` <span style="color:#ff4d4d;font-weight:bold;">[رعب الخسوف: +30% ضرر حرج]</span>`;
        }
        pDmg=Math.floor(pDmg*cm);
        msg+=` <span style="color:#ffcc00;font-weight:bold;text-shadow:0 0 8px #ffcc00;">✨ ضربة قاصمة!</span>`;
        spec='crit';
        window.COMBAT_UI?.playEffect('crit','enemy');
    }

    // Hero class specializations
    const cls = state.player.class;
    if (cls==='Sword Immortal'&&pDmg>0) {
        state.swordIntent=(state.swordIntent||0)+1;
        if (state.swordIntent>=3) { pDmg=Math.floor(pDmg*2.5); state.swordIntent=0; spec='perfect_counter'; msg+=`<br><span style="color:#ffd700;font-weight:bold;text-shadow:0 0 10px #ffd700;">⚔️ نية السيف المطلقة! (×2.5)</span>`; window.COMBAT_UI?.playEffect('sword_intent','enemy'); }
        else msg+=` <span style="color:#ffd700;">[نية السيف: ${state.swordIntent}/3]</span>`;
    }
    if (cls==='Medicine Cultivator'&&pDmg>0) {
        state.cauldronEssence=(state.cauldronEssence||0)+1;
        if (state.cauldronEssence>=4) { const h=Math.floor(state.player.maxHp*.2); state.player.hp=Math.min(state.player.maxHp,state.player.hp+h); state.cauldronEssence=0; msg+=`<br><span style="color:#00e5a0;font-weight:bold;">💊 إكسير الحياة: +${h} صحة!</span>`; }
    }
    if (cls==='Desert Knight'&&eDmg>0) { const r=Math.floor(eDmg*.2); eDmg=Math.max(1,eDmg-r); msg+=` <span style="color:#87ceeb;">[درع: -${r}]</span>`; }
    if (cls==='Lancer'&&pDmg>0) {
        state.staggerCounter=(state.staggerCounter||0)+1;
        if (state.staggerCounter>=2) { state.enemyStaggered=true; state.staggerCounter=0; msg+=`<br><span style="color:#ff8c00;font-weight:bold;">🗡️ طعنات متتالية: العدو مزعزع!</span>`; }
    }
    if (cls==='Horseman'&&spec==='perfect_counter') { pDmg=Math.floor(pDmg*1.3); msg+=` <span style="color:#90ee90;">[فارس: +30%]</span>`; }
    if (cls==='Astrologer'&&pDmg>0) {
        state.magicCombosCount=(state.magicCombosCount||0)+1;
        if (state.magicCombosCount>=3) { pDmg=Math.floor(pDmg*2); state.magicCombosCount=0; msg+=`<br><span style="color:#bf5fff;font-weight:bold;">🌙 [طالع النجوم]: ضرر مضاعف!</span>`; }
    }
    if (cls==='Steelmaster'&&pDmg>0) { const bonus=Math.floor(pDmg*.15); pDmg+=bonus; msg+=` <span style="color:#c0c0c0;">[فولاذ: +${bonus}]</span>`; }
    if (cls==='Sufi Mystic'&&mom>0) { mom=Math.floor(mom*1.4); msg+=` <span style="color:#9b59b6;">[صفاء القلب: زخم +40%]</span>`; }

    return { playerDmg:pDmg, enemyDmg:eDmg, resultText:msg, special:spec, momentumShift:mom };
}

export const CombatEngine = { initCombatState, processTurnEffects, useCompanionAbility, getActionsForForm, selectEnemyMove, getTelegraph, resolveMove };
