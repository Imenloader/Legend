// ============================================================
// CULTIVATION SCREEN - The Inner Sea (بحر اليقين الباطني)
// ============================================================
function showCultivationScreen() {
    clearNarrative();
    if (!state.player.cultivation) {
        state.player.cultivation = { stage: 'Qi Condensation', stageLevel: 1, breakthroughReady: false };
    }
    const cult = state.player.cultivation;
    const stageColors = { 'Qi Condensation': '#8888aa', 'Foundation Establishment': '#00a86b', 'Core Formation': '#d4af37', 'Nascent Soul': '#e040fb' };
    const col = stageColors[cult.stage] || '#aaa';
    
    const stageNamesArabic = {
        'Qi Condensation': 'تكثيف المانا (التحضير الروحي)',
        'Foundation Establishment': 'تأسيس البنيان والأساس الروحي',
        'Core Formation': 'تكوين النواة الذهبية الصلبة',
        'Nascent Soul': 'البعث والولادة الروحية الثانية'
    };
    const currentStageArabic = stageNamesArabic[cult.stage] || cult.stage;

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">بحر اليقين الباطني</b>', 'النظام', null, false, true);
    narrate(`يقينك الحالي في ملكوت <span style="color:${col};font-weight:bold;">${currentStageArabic}</span>، الرتبة <b>${cult.stageLevel}</b>/9.`, 'النظام', null, false, true);
    
    // Show active method
    const activeMethodId = cult.activeMethod || 'jade_body';
    const activeMethod = window.CULTIVATION && window.CULTIVATION.methods ? window.CULTIVATION.methods[activeMethodId] : null;
    if (activeMethod) {
        const methodNameArabic = activeMethod.name === 'Jade Lotus Meditation' ? 'تأمل لوتس اليشم الطاهر' : activeMethod.name === 'Sufi Heart Breath' ? 'أنفاس الوجد والقلب الصوفي' : activeMethod.name === 'Sword Heart Manual' ? 'مخطوطة قلب السيف البصير' : activeMethod.name;
        narrate(`الفن الروحي النشط: <span class="loot-epic">${methodNameArabic}</span><br><small>جوهر الفن: تأمل وتوجيه المانا في قنوات الجسد لزيادة سعة اليقين.</small>`, 'النظام', null, false, true);
    }

    // Render Dual Progress Bars & Technique Mastery Panels
    const currentXp = state.player.xp || 0;
    const maxXp = state.player.maxXp || 100;
    const percent = Math.min(100, Math.floor((currentXp / maxXp) * 100));

    const majorPercent = Math.min(100, Math.floor(((cult.stageLevel - 1) / 9) * 100));

    // Render Physical Stature progress bar
    if (!cult.bodyRealm) cult.bodyRealm = 'Mortal Flesh';
    if (!cult.bodyLevel) cult.bodyLevel = 1;
    if (!cult.bodyXp) cult.bodyXp = 0;
    
    const bodyIdx = window.CULTIVATION && window.CULTIVATION.bodyRealms ? window.CULTIVATION.bodyRealms.findIndex(r => r.name === cult.bodyRealm) : 0;
    const reqBodyXp = Math.floor(80 * Math.pow(1.35, (bodyIdx * 10) + cult.bodyLevel));
    const bodyPercent = Math.min(100, Math.floor((cult.bodyXp / reqBodyXp) * 100));

    const bodyRealmNamesArabic = {
        'Mortal Flesh': 'الجسد الفاني الضعيف',
        'Bronze Skin': 'الجلد البرونزي المحصن',
        'Iron Bones': 'العظام الفولاذية الصلبة',
        'Golden Marrow': 'النخاع الذهبي القدسي'
    };
    const currentBodyRealmArabic = bodyRealmNamesArabic[cult.bodyRealm] || cult.bodyRealm;

    let techProgressHtml = "";
    if (activeMethod && cult.methodsState && cult.methodsState[activeMethodId]) {
        const m = cult.methodsState[activeMethodId];
        const reqMastery = Math.floor(100 * Math.pow(1.6, m.level));
        const masteryPercent = Math.min(100, Math.floor((m.mastery / reqMastery) * 100));
        const methodNameArabic = activeMethod.name === 'Jade Lotus Meditation' ? 'تأمل لوتس اليشم الطاهر' : activeMethod.name === 'Sufi Heart Breath' ? 'أنفاس الوجد والقلب الصوفي' : activeMethod.name === 'Sword Heart Manual' ? 'مخطوطة قلب السيف البصير' : activeMethod.name;
        techProgressHtml = `
            <div style="margin-top: 12px; text-align: left; background: rgba(255,215,0,0.02); padding: 10px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.2);">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 5px;">
                    <span style="color:var(--secondary);">📖 <b>${methodNameArabic}</b> (الرتبة ${m.level}/10):</span>
                    <span style="color:var(--secondary); font-weight:bold;">${m.mastery} / ${reqMastery} (${masteryPercent}%)</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${masteryPercent}%; height: 100%; background: linear-gradient(90deg, var(--secondary), #fff); border-radius: 3px; box-shadow: 0 0 6px var(--secondary);"></div>
                </div>
            </div>
        `;
    }

    let progressBarsHtml = `
        <div style="margin: 15px 0; padding: 15px; background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,160,0.2); border-radius: 12px; font-family:'Inter',sans-serif;">
            <div style="margin-bottom: 12px; text-align: left;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                    <span style="color:#a8e6cf;">🔮 <b>مستوى ارتقاء المانا الفرعي</b>:</span>
                    <span style="color:var(--jade); font-weight:bold;">${currentXp} / ${maxXp} خبرة (${percent}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--jade), #00ffbc); border-radius: 4px; box-shadow: 0 0 8px var(--jade);"></div>
                </div>
            </div>
            
            <div style="text-align: left; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                    <span style="color:#ffd3b6;">☯️ <b>حاجز الارتقاء الأعظم للرتب</b>:</span>
                    <span style="color:#e0a96d; font-weight:bold;">المستوى ${cult.stageLevel}/9 (${majorPercent}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: ${majorPercent}%; height: 100%; background: linear-gradient(90deg, #e0a96d, #d4af37); border-radius: 4px; box-shadow: 0 0 8px #d4af37;"></div>
                </div>
            </div>
 
            <div style="text-align: left;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                    <span style="color:#b2bec3;">💪 <b>الجسد المادي المطور (${currentBodyRealmArabic})</b>:</span>
                    <span style="color:#dfe6e9; font-weight:bold;">رتبة ${cult.bodyLevel}/10 (${bodyPercent}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: ${bodyPercent}%; height: 100%; background: linear-gradient(90deg, #7f8c8d, #b2bec3); border-radius: 4px; box-shadow: 0 0 8px #b2bec3;"></div>
                </div>
            </div>
            ${techProgressHtml}
        </div>
    `;

    narrate(progressBarsHtml, 'النظام', null, false, true);

    narrate(`الصحة العامة: <b>${state.player.maxHp}</b> | يقين المانا: <b>${state.player.maxMp}</b> | القوة الهجومية: <b>${state.player.atk}</b> | الصلابة الدفاعية: <b>${state.player.def}</b>`, 'النظام', null, false, true);

    const choices = [
        {
            text: '🧘 خلوة وتأمل عميق (امتصاص المانا وتدفق اليقين)',
            callback: () => {
                const result = window.CULTIVATION ? window.CULTIVATION.meditate(state) : { success: true, message: 'You meditate, drawing in ambient Qi.' };
                
                // Translate result messages
                let msgArabic = result.message;
                if (result.message.includes("meditate")) {
                    msgArabic = "جلست في وضعية زهرة اللوتس الطاهرة، وسحبت أنوار طاقة اليقين لتتدفق في عروقك كالشلال العذب. زادت المانا الكامنة في جسدك!";
                } else if (result.message.includes("BREAKTHROUGH")) {
                    msgArabic = "🎉 <b>ارتقاء روحي مبهج!</b> تحطمت الأغلال وارتفعت رتبتك الفرعية لآفاق جديدة!";
                }
                
                narrate(msgArabic, 'النظام', null, false, true);
                
                // Visual FX
                const screen = document.querySelector('.screen.active');
                if (screen) {
                    screen.classList.add('meditation-glow');
                    const particles = document.createElement('div');
                    particles.className = 'qi-gathering';
                    screen.appendChild(particles);
                    setTimeout(() => { particles.remove(); screen.classList.remove('meditation-glow'); }, 2000);
                }
                if (typeof triggerFlash === 'function') triggerFlash('heal');

                // Play procedural sound effects
                if (window.AUDIO) {
                    if (result.message.includes("BREAKTHROUGH")) {
                        window.AUDIO.playEffect('level_up');
                    } else {
                        window.AUDIO.playEffect('story_beat');
                    }
                }

                calculateTotalStats(); updateTopBar(); saveGame();
                setTimeout(showCultivationScreen, 2200);
            }
        },
        {
            text: '💪 تطهير البنيان المادي والجسد الفاني',
            callback: () => {
                const res = window.CULTIVATION ? window.CULTIVATION.temperBody(state) : { success: false, message: 'Cultivation module unavailable.' };
                
                let msgArabic = res.message;
                if (res.message.includes("purged impurities")) {
                    msgArabic = "تحملت آلاماً شديدة بينما قمت بحرق وطرد شوائب جسدك الفاني. صلابة بنيانك المادي تقترب من الخلود!";
                } else if (res.message.includes("lack resources") || res.message.includes("mats")) {
                    msgArabic = "معندكش خامات ومؤن كفاية لتطهير جسدك في صومعتك حالياً.";
                }
                
                narrate(msgArabic, 'النظام', null, false, true);
                
                if (res.success) {
                    const screen = document.querySelector('.screen.active');
                    if (screen) {
                        screen.classList.add('meditation-glow');
                        setTimeout(() => screen.classList.remove('meditation-glow'), 1000);
                    }
                    if (typeof triggerFlash === 'function') triggerFlash('damage');
                    if (window.AUDIO) window.AUDIO.playEffect('combat_hit');
                }
                
                updateTopBar(); saveGame();
                setTimeout(showCultivationScreen, 2200);
            }
        },
        {
            text: '🏠 دخول الصومعة والخلوة الروحية (ال Dwelling)',
            callback: showDwellingScreen
        },
        {
            text: '🌀 سياحة الروح وإرسال البصيرة (Soul Wandering)',
            callback: showSoulWanderingScreen
        },
        {
            text: '📜 تغيير الفن الروحي المتبع',
            callback: () => {
                clearNarrative();
                narrate("<b>اختر فنك الروحي ومسار يقينك</b>", "النظام", null, false, true);
                const methodChoices = Object.values(window.CULTIVATION.methods).map(m => {
                    const methodNameArabic = m.name === 'Jade Lotus Meditation' ? 'تأمل لوتس اليشم الطاهر' : m.name === 'Sufi Heart Breath' ? 'أنفاس الوجد والقلب الصوفي' : m.name === 'Sword Heart Manual' ? 'مخطوطة قلب السيف البصير' : m.name;
                    return {
                        text: `${m.unlocked ? (m.id === activeMethodId ? '✅ ' : '✨ ') : '🔒 '}${methodNameArabic}`,
                        callback: () => {
                            if (!m.unlocked) {
                                narrate("الفن ده مقفول دلوقتي وعصي على إدراكك. ابحث عن مخطوطته وتدبر سطورها في أنحاء العالم.", "النظام");
                                setTimeout(showCultivationScreen, 1800);
                                return;
                            }
                            cult.activeMethod = m.id;
                            calculateTotalStats();
                            narrate(`لقد تحولت بنجاح لدراسة وممارسة <b>${methodNameArabic}</b>. تعيد بنيتك تنظيم ممراتها الروحية لتنسجم مع هذا التدفق.`, "النظام");
                            updateTopBar(); saveGame();
                            setTimeout(showCultivationScreen, 1800);
                        }
                    };
                });
                setChoices([...methodChoices, { text: "↩ رجوع", callback: showCultivationScreen }]);
            }
        }
    ];

    if (window.ASCENSION && window.ASCENSION.checkEligible(state)) {
        choices.push({
            text: '⚡ الاقتراب من بوابة الارتقاء السماوي العظيم (محنة الملوك)',
            callback: showAscensionScreen
        });
    }

    if (cult.breakthroughReady) {
        choices.push({
            text: '⚡ خوض محنة البرق السماوي للارتقاء الأعظم!',
            callback: () => {
                const res = window.CULTIVATION ? window.CULTIVATION.attemptBreakthrough(state) : { success: false, message: 'Cultivation module unavailable.' };
                if (!res.success) {
                    let msgArabic = res.message;
                    if (res.message.includes("not ready")) {
                        msgArabic = "بنيانك الروحي لم يكتمل تماماً لتحدي البرق السماوي العاتى بعد.";
                    }
                    narrate(msgArabic, 'النظام', null, false, true);
                    setTimeout(showCultivationScreen, 2000);
                } else {
                    narrate('تظلم السماوات فجأة، وترعد بقوة البرق العارم! وحش المحنة السماوية الكاسر يهبط أمامك ساداً الأفق!', 'النظام', null, false, true);
                    const tribBeast = {
                        name: 'وحش محنة البرق السماوي',
                        hp: 250 + state.player.lvl * 20,
                        maxHp: 250 + state.player.lvl * 20,
                        atk: 30 + state.player.lvl * 5,
                        dialogue: 'تنشق السماء بقوة البرق العارم. هذه هي محنتك السماوية المكتوبة لتمحيص روحك وصهر معدنك!',
                        nextMove: null
                    };
                    state._pendingBreakthroughStage = res.nextStage;
                    setTimeout(() => startCombat(tribBeast), 1500);
                }
            }
        });
    }

    choices.push({ text: '↩ عودة إلى واحة التقاطع', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// ALCHEMY SCREEN - The Furnace of Heaven (فرن الخيمياء والأسرار السماوية)
// ============================================================

function startStabilityMiniGame(callback) {
    clearNarrative();
    narrate("<b>مرحلة تركيز وتثبيت المانا</b><br>اضغط لتثبيت المانا عند ذروة استقرارها الطاهر لتنجح الطبخة ويقوى الإكسير!", "النظام", null, false, true);
    
    const container = document.createElement('div');
    container.style.cssText = 'width:100%; height:30px; background:#222; border:1px solid #444; border-radius:15px; position:relative; overflow:hidden; margin:20px 0;';
    
    const target = document.createElement('div');
    target.style.cssText = 'position:absolute; left:45%; width:10%; height:100%; background:var(--jade); opacity:0.5;';
    
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute; left:0; width:4px; height:100%; background:#fff; box-shadow:0 0 10px #fff;';
    
    container.appendChild(target);
    container.appendChild(bar);
    document.getElementById('narrative-window').appendChild(container);

    let pos = 0;
    let dir = 1;
    let animId;

    const loop = () => {
        pos += 2 * dir;
        if (pos >= 100 || pos <= 0) dir *= -1;
        bar.style.left = pos + '%';
        animId = requestAnimationFrame(loop);
    };
    loop();

    setChoices([{
        text: "⚡ ركز المانا الروحية وثبت المرجل!",
        callback: () => {
            cancelAnimationFrame(animId);
            const dist = Math.abs(pos - 50);
            const stability = Math.max(0, 100 - (dist * 2));
            callback(stability);
        }
    }]);
}

function showAlchemyScreen() {
    clearNarrative();
    const mats = state.player.inventory.materials || {};
    
    const materialsArabic = {
        'spirit_herb': 'عشبة المانا',
        'iron_ore': 'خام الحديد الدمشقي',
        'monster_core': 'قلب وحش البراري',
        'dragon_vein_shard': 'شظية عرق التنين',
        'celestial_silk': 'حرير سماوي خالد',
        'wood': 'خشب جبلي'
    };

    const matList = Object.entries(mats).filter(([,v]) => v > 0).map(([k,v]) => `${materialsArabic[k] || k.replace(/_/g,' ')}: <b>x${v}</b>`).join(', ') || '<i>مفيش خامات متوفرة</i>';

    if (!state.player.alchemyCauldronLevel) state.player.alchemyCauldronLevel = 1;
    const cauldronLvl = state.player.alchemyCauldronLevel;
    const cauldronNames = ["لا يوجد", "فرن الطين الناري البسيط", "مرجل البرونز الثلاثي القديم", "مرجل التنانين التسعة الأسطوري", "فرن الفراغ السماوي الخالد"];
    const cauldronBonuses = [0, 0, 12, 25, 40];

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">فرن الخيمياء والأسرار السماوية</b>', 'النظام', null, false, true);
    narrate(`المرجل المتاح: <b style="color:var(--secondary)">${cauldronNames[cauldronLvl]} (رتبة ${cauldronLvl})</b><br><small style="color:var(--text-dim)">بركة التقطير التلقائي: +${cauldronBonuses[cauldronLvl]}% ثبات واستقرار في الصناعة</small>`, 'النظام', null, false, true);
    narrate(`الخامات المتوفرة في الحقيبة: ${matList}`, 'النظام', null, false, true);

    const choices = [];
    if (window.CRAFTING) {
        Object.entries(window.CRAFTING.alchemyRecipes).forEach(([id, r]) => {
            const ingList = Object.entries(r.ingredients).map(([k,v]) => `${v}x ${materialsArabic[k] || k.replace(/_/g,' ')}`).join(', ');
            const canCraft = Object.entries(r.ingredients).every(([k,v]) => (mats[k] || 0) >= v);
            
            const recipeNamesArabic = {
                'essence_pill': 'حبة تنشيط جوهر الدم والروح (+50 صحة)',
                'qi_elixir': 'إكسير المانا وتكثيف اليقين (+25 مانا)',
                'dragon_soup': 'حساء السلف وقوة التنين الجبارة (+10 هجوم دائم)'
            };
            const currentRecipeArabic = recipeNamesArabic[id] || r.name;

            choices.push({
                text: `${canCraft ? '⚗️ ' : '[مغلق] '}طبخ وتقطير: ${currentRecipeArabic} | يتطلب: ${ingList}`,
                callback: () => {
                    if (!canCraft) {
                        narrate(`<span style="color:var(--danger)"><b>التقطير تعذر!</b> معندكش الخامات الكافية لتقطير إكسير ${currentRecipeArabic}.</span>`, "النظام");
                        setTimeout(showAlchemyScreen, 2000);
                        return;
                    }
                    startStabilityMiniGame((stability) => {
                        const bonus = cauldronBonuses[state.player.alchemyCauldronLevel || 1];
                        const finalStability = Math.min(100, stability + bonus);
                        const res = window.CRAFTING.brewAlchemy(state, id, finalStability);
                        
                        let msgArabic = res.message;
                        if (res.message.includes("successfully brewed")) {
                            msgArabic = `🎉 <b>نجاح التقطير!</b> استقرت المانا في مرجلك ونجحت في تقطير إكسير <b>${currentRecipeArabic}</b> بنقاء وجودة عالية!`;
                        } else if (res.message.includes("exploded")) {
                            msgArabic = `💥 <b>انفجار وتناثر للمرجل!</b> تذبذبت طاقة المانا بعنف وانفجر الفرن وخسرت الخامات المغلية في عصف من الدخان الأسود!`;
                        }

                        narrate(msgArabic, 'النظام', null, false, true);
                        updateTopBar(); saveGame();
                        setTimeout(showAlchemyScreen, 2200);
                    });
                }
            });
        });
    }

    // Upgrade Cauldron Option
    if (cauldronLvl < 4) {
        const nextLvl = cauldronLvl + 1;
        const upgradeCosts = {
            2: { gold: 300, iron_ore: 10, wood: 10 },
            3: { gold: 800, iron_ore: 25, wood: 20 },
            4: { gold: 2000, iron_ore: 50, wood: 40 }
        };
        const cost = upgradeCosts[nextLvl];
        const hasGold = (state.player.gold || 0) >= cost.gold;
        const hasIron = (mats.iron_ore || 0) >= cost.iron_ore;
        const hasWood = (mats.wood || 0) >= cost.wood;
        const canUpgrade = hasGold && hasIron && hasWood;
        
        choices.push({
            text: `💎 ترقية المرجل لرتبة ${nextLvl} (${cauldronNames[nextLvl]}) | التكلفة: ${cost.gold} أحجار، ${cost.iron_ore} حديد، ${cost.wood} خشب`,
            callback: () => {
                if (!canUpgrade) {
                    narrate(`<span style="color:var(--danger)"><b>الترقية فشلت!</b> معندكش أحجار أو خامات كفاية لتطوير مرجل خيميائك.</span>`, "النظام");
                    setTimeout(showAlchemyScreen, 2000);
                    return;
                }
                state.player.gold -= cost.gold;
                state.player.inventory.materials.iron_ore -= cost.iron_ore;
                state.player.inventory.materials.wood -= cost.wood;
                state.player.alchemyCauldronLevel = nextLvl;
                
                narrate(`<span class="loot-epic">🔥 <b>تم ترقية المرجل بنجاح!</b> توسع فرن خيميائك وأصبح <b>${cauldronNames[nextLvl]}</b> الجبار ذو القنوات النارية!</span>`, "النظام");
                updateTopBar(); saveGame();
                setTimeout(showAlchemyScreen, 2200);
            }
        });
    }

    choices.push({ text: '↩ عودة إلى واحة التقاطع', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// BLACKSMITH SCREEN - The Spirit Forge (ورشة سحر الحديد والأسلحة)
// ============================================================
function showForgeScreen() {
    clearNarrative();
    const mats = state.player.inventory.materials || {};
    
    const materialsArabic = {
        'spirit_herb': 'عشبة المانا',
        'iron_ore': 'خام الحديد الدمشقي',
        'monster_core': 'قلب وحش البراري',
        'dragon_vein_shard': 'شظية عرق التنين',
        'celestial_silk': 'حرير سماوي خالد',
        'wood': 'خشب جبلي'
    };

    const matList = Object.entries(mats).filter(([,v]) => v > 0).map(([k,v]) => `${materialsArabic[k] || k.replace(/_/g,' ')}: <b>x${v}</b>`).join(', ') || '<i>مفيش خامات متوفرة</i>';

    if (!state.player.forgeHammerLevel) state.player.forgeHammerLevel = 1;
    const hammerLvl = state.player.forgeHammerLevel;
    const hammerNames = ["لا يوجد", "مطرقة الحديد البسيط للحدادين", "مطرقة الفولاذ البارد المحصن", "مطرقة قلب الحمم البركانية الساخنة", "مطرقة رعد الآلهة الأزلي"];
    const hammerBonuses = [0, 0, 5, 12, 20];

    narrate('<b style="font-size:1.3em;letter-spacing:2px;">ورشة سحر الحديد والأسلحة</b>', 'النظام', null, false, true);
    narrate(`المطرقة المتاحة: <b style="color:var(--secondary)">${hammerNames[hammerLvl]} (رتبة ${hammerLvl})</b><br><small style="color:var(--text-dim)">بركة صهر ونقش الحديد: +${hammerBonuses[hammerLvl]}% جودة إضافية في العتاد المصنوع</small>`, 'النظام', null, false, true);
    narrate(`الخامات المتوفرة في الحقيبة: ${matList}`, 'النظام', null, false, true);

    const choices = [];
    if (window.CRAFTING) {
        Object.entries(window.CRAFTING.forgeRecipes).forEach(([id, r]) => {
            const ingList = Object.entries(r.ingredients).map(([k,v]) => `${v}x ${materialsArabic[k] || k.replace(/_/g,' ')}`).join(', ');
            const canCraft = Object.entries(r.ingredients).every(([k,v]) => (mats[k] || 0) >= v);

            const recipeNamesArabic = {
                'refined_sword': 'سيف الفولاذ المصفى ذو الحدين (weapon)',
                'sufi_robe': 'رداء الصوف الطاهر لدرء الأضرار (body)',
                'sand_boots': 'أحذية المسافر لتجاوز رمال الصحراء (boots)',
                'dragon_vein_pendant': 'قلادة عروق التنين القديمة لتعزيز الهالة (relic)'
            };
            const currentRecipeArabic = recipeNamesArabic[id] || r.name;
            const slotArabic = r.slot === 'head' ? 'خوذة للرأس' : r.slot === 'body' ? 'درع للجسد' : r.slot === 'legs' ? 'رداء للأرجل' : r.slot === 'boots' ? 'حذاء للمسير' : r.slot === 'weapon' ? 'سيف هجومي' : 'أثر روحي';

            choices.push({
                text: `${canCraft ? '🔨 ' : '[مغلق] '}صهر وصنع: ${currentRecipeArabic} (${slotArabic}) | يتطلب: ${ingList}`,
                callback: () => {
                    if (!canCraft) {
                        narrate(`<span style="color:var(--danger)"><b>الحدادة تعذرت!</b> معندكش الخامات الكافية لصنع ${currentRecipeArabic}.</span>`, "النظام");
                        setTimeout(showForgeScreen, 2000);
                        return;
                    }
                    const res = window.CRAFTING.craftItem(state, id);
                    
                    let msgArabic = res.message;
                    if (res.message.includes("Successfully crafted")) {
                        msgArabic = `🔨 <b>تم صهر العتاد بنجاح!</b> صهلت النار في ورشتك واستخرجت <b>${currentRecipeArabic}</b> بجودة ممتازة وسحرت حروفه ونقوشه الروحية!`;
                    }

                    narrate(msgArabic, 'النظام', null, false, true);
                    updateTopBar(); saveGame();
                    setTimeout(showForgeScreen, 2500);
                }
            });
        });
    }

    // Upgrade Hammer Option
    if (hammerLvl < 4) {
        const nextLvl = hammerLvl + 1;
        const upgradeCosts = {
            2: { gold: 400, iron_ore: 15, wood: 10 },
            3: { gold: 1000, iron_ore: 30, wood: 25 },
            4: { gold: 2500, iron_ore: 60, wood: 45 }
        };
        const cost = upgradeCosts[nextLvl];
        const hasGold = (state.player.gold || 0) >= cost.gold;
        const hasIron = (mats.iron_ore || 0) >= cost.iron_ore;
        const hasWood = (mats.wood || 0) >= cost.wood;
        const canUpgrade = hasGold && hasIron && hasWood;

        choices.push({
            text: `💎 ترقية مطرقة الحداد لرتبة ${nextLvl} (${hammerNames[nextLvl]}) | التكلفة: ${cost.gold} أحجار، ${cost.iron_ore} حديد، ${cost.wood} خشب`,
            callback: () => {
                if (!canUpgrade) {
                    narrate(`<span style="color:var(--danger)"><b>الترقية فشلت!</b> معندكش أحجار أو خامات كفاية لتطوير مطرقة ورشتك.</span>`, "النظام");
                    setTimeout(showForgeScreen, 2000);
                    return;
                }
                state.player.gold -= cost.gold;
                state.player.inventory.materials.iron_ore -= cost.iron_ore;
                state.player.inventory.materials.wood -= cost.wood;
                state.player.forgeHammerLevel = nextLvl;

                narrate(`<span class="loot-epic">⚡ <b>تم ترقية المطرقة بنجاح!</b> ضرب البرق مطرقتك وسكنت فيها هالة من القوة والرعد الروحي؛ تكونت مطرقة <b>${hammerNames[nextLvl]}</b>!</span>`, "النظام");
                updateTopBar(); saveGame();
                setTimeout(showForgeScreen, 2200);
            }
        });
    }

    choices.push({ text: '↩ عودة إلى واحة التقاطع', callback: hubLoop });
    setChoices(choices);
}

// ============================================================
// WORLD MAP SCREEN - SVG Navigation (خريطة العالم الأسطوري)
// ============================================================
function showWorldMap() {
    showScreen('map-screen');
    const container = document.getElementById('game-container');
    const group = document.getElementById('map-regions-group');
    if (!group) return;
    group.innerHTML = '';

    const backBtn = document.getElementById('map-back-btn');
    if (backBtn) backBtn.textContent = '↩ عودة للواحة';
    if (backBtn) backBtn.onclick = hubLoop;

    const lore = window.LORE;
    if (!lore || !lore.REGIONS) {
        narrate("لفائف الخرائط السحرية ما زالت تنفتح... تمهل قليلاً.", "النظام");
        return;
    }

    Object.values(lore.REGIONS).forEach(region => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = region.x || 400;
        const y = region.y || 280;
        
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '14');
        
        const isCurrent = state.player.currentRegion === region.id || (region.id === 'crossroads' && !state.player.currentRegion);
        const isUnlocked = region.unlocked === true;
        
        let fillColor = '#333333'; 
        if (isCurrent) fillColor = '#00e5a0'; 
        else if (isUnlocked) fillColor = '#d4af37'; 
        
        circle.style.fill = fillColor;
        circle.style.stroke = '#ffffff';
        circle.style.strokeWidth = isCurrent ? '3px' : '1px';
        circle.style.strokeOpacity = isCurrent ? '1' : '0.5';
        circle.style.cursor = 'pointer';
        circle.classList.add('map-node');
        
        if (isCurrent) {
            circle.style.filter = 'drop-shadow(0 0 12px #00e5a0)';
        }
        
        circle.onmouseenter = (e) => {
            const tooltip = document.getElementById('map-tooltip');
            if (!tooltip) return;
            
            const regionNamesArabic = {
                'crossroads': 'سوق واحة التقاطع العظيم',
                'jade_peak': 'طائفة قمة اليشم العظمى',
                'ancient_tomb': 'الضريح الأثري للسلف الهابط',
                'desert_oasis': 'واحة النخيل والمياه العذبة'
            };
            const regionSubtitlesArabic = {
                'crossroads': 'قلب طرق القوافل وطريق الحرير',
                'jade_peak': 'قمة السحب المقدسة حيث التأمل الصامت',
                'ancient_tomb': 'أطلال تحرسها نقوش وأرواح منسية',
                'desert_oasis': 'منبع الحياة وسط رمال التيه العاتية'
            };
            const regionDescsArabic = {
                'crossroads': 'ملتقى التجار والدراويش والمريدين من كل صقع، يضم السوق والحرف وسجلات المهام.',
                'jade_peak': 'موطن طائفة السيف واليشم الأبرز، قنوات مانا نشطة ومواضع خلوة وتأمل شيوخ الطائفة.',
                'ancient_tomb': 'دهاليز وكنوز مظلمة تحيط بتابوت أسطوري، تحرسه قوى غامضة ووحوش محنة لا ترحم.',
                'desert_oasis': 'واحة تحفها الواحات الخضراء والوديان المورقة في عمق بحر الرمال الروحي العظيم.'
            };

            document.getElementById('map-tooltip-name').textContent = regionNamesArabic[region.id] || region.name || 'ملكوت مجهول';
            document.getElementById('map-tooltip-subtitle').textContent = regionSubtitlesArabic[region.id] || region.subtitle || 'برية مقفرة';
            document.getElementById('map-tooltip-desc').textContent = regionDescsArabic[region.id] || region.description || 'مكان غامض يلفه سحر قديم.';
            
            const status = document.getElementById('map-tooltip-status');
            status.textContent = isUnlocked ? 'مفتوحة للاستكشاف' : 'مغلقة حالياً';
            status.className = 'map-status-badge ' + (isUnlocked ? 'status-unlocked' : 'status-locked');
            
            const travelBtn = document.getElementById('map-travel-btn');
            travelBtn.textContent = '⚔️ ارتحل واستكشف';
            travelBtn.style.display = isUnlocked ? 'block' : 'none';
            travelBtn.onclick = (ev) => {
                ev.stopPropagation();
                tooltip.style.display = 'none';
                showScreen('story-screen');
                exploreRegion(region.id);
            };

            tooltip.style.display = 'block';
            
            const mapScreen = document.getElementById('map-screen') || container;
            const rect = mapScreen.getBoundingClientRect();
            let tx = e.clientX - rect.left + 20;
            let ty = e.clientY - rect.top + 20;
            
            const tooltipWidth = 280;
            const tooltipHeight = 180;

            if (tx + tooltipWidth > rect.width) tx = (e.clientX - rect.left) - tooltipWidth - 20;
            if (ty + tooltipHeight > rect.height) ty = (e.clientY - rect.top) - tooltipHeight - 20;
            
            tooltip.style.position = 'absolute';
            tooltip.style.left = Math.max(10, Math.min(tx, rect.width - tooltipWidth - 10)) + 'px';
            tooltip.style.top = Math.max(10, Math.min(ty, rect.height - tooltipHeight - 10)) + 'px';
            tooltip.style.zIndex = '1000';
            
            circle.setAttribute('r', '18');
        };

        circle.onmouseleave = () => {
            circle.setAttribute('r', '14');
        };

        group.appendChild(circle);
    });

    document.getElementById('map-screen').onclick = (e) => {
        if (e.target.id === 'map-screen' || e.target.tagName === 'svg') {
            document.getElementById('map-tooltip').style.display = 'none';
        }
    };
}

// ============================================================
// SYSTEM SCREENS: Quests, Shop, Skills (العهود، الدكاكين، المهارات)
// ============================================================

function showSkillsScreen() {
    clearNarrative();
    narrate('<b style="font-size:1.3em;letter-spacing:2px;">ديوان المهارات والفنون القتالية</b>', 'النظام', null, false, true);
    
    if (!state.player.skills || state.player.skills.length === 0) {
        narrate("ديوان مهاراتك فارغ حالياً. خض ارتقاءات روغ ومحناً لتتعلم وتتقن الفنون القتالية الفاخرة.", "النظام");
    } else {
        const skillNamesArabic = {
            'strike': 'الضربة المصفاة الأساسية',
            'heal': 'دفق الطهارة والاستشفاء',
            'shield': 'درع اليقين العاكس للضربات',
            'slash': 'شق السيف الناري الحارق'
        };
        const skillDescsArabic = {
            'strike': 'ضربة سيف سريعة وموجهة نحو ثغرات العدو المادية.',
            'heal': 'استرجاع فوري لحيويتك ونقاط حياتك بتوجيه طاقة المانا الشافية.',
            'shield': 'استدعاء حائظ ودرع روحي يمتص هجمات العدو ويقلل تأثيرها.',
            'slash': 'قطع هجومي جبار مستمد من صهر السيف بلهب وشرارات النور.'
        };

        state.player.skills.forEach(sId => {
            const s = window.SKILLS.techniques[sId];
            if (s) {
                const typeColor = s.passive ? '#00e5a0' : '#d4af37';
                narrate(`<span style="color:${typeColor};font-weight:bold;">[${s.passive ? 'مهارة كامنة' : 'فن روحي نشط'}] ${skillNamesArabic[sId] || s.name}</span><br><small>${skillDescsArabic[sId] || s.desc}</small>`, 'النظام', null, false, true);
            }
        });
    }

    setChoices([{ text: '↩ عودة إلى واحة التقاطع', callback: hubLoop }]);
}

function showQuestLog() {
    clearNarrative();
    narrate("<b>📜 لوحة المهام والطلبات بملتقى القوافل</b><br>ملتقى دروب الطلبات ومهمات الأقدار الروحية والعثور على الأبطال", "النظام", null, false, true);
    
    // Ensure lists exist
    if (!state.activeQuests) state.activeQuests = [];
    if (!state.completedQuests) state.completedQuests = [];

    // --- Active Quests ---
    let html = `<div style="text-align:left; margin-bottom:20px;">
        <h3 style="color:var(--secondary); font-family:'Cinzel'; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">⚔️ العهود والمهام الجارية حالياً</h3>`;
    
    const activeList = state.activeQuests.map(qId => window.QUESTS.database[qId]).filter(Boolean);
    
    const questTitlesArabic = {
        'main_01': 'مسار يقين الصحراء المجهول',
        'main_02': 'طرد وحش عاصفة الرمال الكاسر',
        'main_03': 'فك أختام السلف الهابط بالأطلال'
    };
    const questDescsArabic = {
        'main_01': 'تحدث مع دراويش واحة التقاطع لتأمين القوافل والبدء في استكشاف براري درب الحرير الأثري.',
        'main_02': 'دمر وحش عاصفة الرمال الذي سد درب قوافل الواحة وروع التجار وعابري الأقدار.',
        'main_03': 'ابحث عن مفاتيح وأختام ضريح السلف لتوقظ بصيرتك وتتصل مع الإرث الأبدي المفقود.'
    };
    const questObjectivesArabic = {
        'main_01': 'استكشف واحة التقاطع بنجاح وواجه أول خصومك.',
        'main_02': 'اهزم وحش عاصفة الرمال في مواجهة قتالية ضارية.',
        'main_03': 'افتح دهاليز الضريح الأثري واقض على حراس النقوش.'
    };

    if (activeList.length === 0) {
        html += `<p style="color:var(--text-dim); font-style:italic; padding-left:10px;">صحيفة عهودك النشطة فارغة حالياً. مفيش التزامات جارية.</p>`;
    } else {
        activeList.forEach(q => {
            html += `
                <div style="background:rgba(212, 175, 55, 0.05); padding:10px; border-left:4px solid var(--secondary); margin-bottom:10px; border-radius: 0 4px 4px 0;">
                    <b style="color:var(--secondary)">${questTitlesArabic[q.id] || q.title}</b> <span style="font-size:0.75rem; text-transform:uppercase; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:3px; margin-left:5px;">${q.type === 'main' ? 'أساسي' : 'فرعي'}</span><br>
                    <span style="font-size:0.9rem; color:var(--text-dim);">${questDescsArabic[q.id] || q.desc}</span><br>
                    <span style="font-size:0.85rem; color:var(--jade); margin-top:5px; display:inline-block;"><b>المطلوب:</b> ${questObjectivesArabic[q.id] || q.objective}</span>
                </div>
            `;
        });
    }
    
    // --- Available Quests ---
    html += `<h3 style="color:var(--jade); font-family:'Cinzel'; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-top:25px;">📜 العهود والمهام المتاحة باللوحة</h3>`;
    
    const availableList = Object.values(window.QUESTS.database).filter(q => 
        !state.activeQuests.includes(q.id) && !state.completedQuests.includes(q.id)
    );
    
    if (availableList.length === 0) {
        html += `<p style="color:var(--text-dim); font-style:italic; padding-left:10px;">لوحة المهام فارغة تماماً دلوقتي. ارجع بعد ما ترتقي خلوتك الجاية.</p>`;
    } else {
        availableList.forEach(q => {
            html += `
                <div style="background:rgba(255,255,255,0.02); padding:10px; border-left:4px solid var(--text-dim); margin-bottom:10px; border-radius: 0 4px 4px 0;">
                    <b>${questTitlesArabic[q.id] || q.title}</b> <span style="font-size:0.75rem; text-transform:uppercase; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:3px; margin-left:5px; color:var(--text-dim);">${q.type === 'main' ? 'أساسي' : 'فرعي'}</span><br>
                    <span style="font-size:0.9rem; color:var(--text-dim);">${questDescsArabic[q.id] || q.desc}</span><br>
                    <span style="font-size:0.8rem; color:var(--secondary-glow); display:inline-block; margin-top:5px;"><b>المكافآت الموعودة:</b> ${q.reward.gold ? `${q.reward.gold} حجر روحي ` : ''}${q.reward.xp ? `| ${q.reward.xp} خبرة يقين ` : ''}</span>
                </div>
            `;
        });
    }
    
    html += `</div>`;
    narrate(html, "النظام", null, false, true);

    const choices = [];
    
    // Add choice buttons for each available quest to let the player accept it
    availableList.forEach(q => {
        choices.push({
            text: `📜 قبول عهد: ${questTitlesArabic[q.id] || q.title}`,
            callback: () => {
                const accepted = window.QUESTS.acceptQuest(state, q.id);
                if (accepted) {
                    narrate(`لقد ارتبطت بعهد ومهمة بقلبك وعزيمتك: <b>${questTitlesArabic[q.id] || q.title}</b>. ليكن التوفيق حليفك في درب اليقين.`, "النظام");
                    setTimeout(showQuestLog, 1500);
                } else {
                    showQuestLog();
                }
            }
        });
    });

    choices.push({ text: "↩ عودة", callback: hubLoop });
    setChoices(choices);
}


function showMarket() {
    clearNarrative();
    narrate("<b>سوق واحة التقاطع العظيم</b> - اشترِ الجرعات الشافية والمؤن الفاخرة لرحلتك، أو بع الغنائم الزائدة.", "النظام", null, false, true);
    
    const stock = window.SHOP.stocks.crossroads_market;
    
    const stockNamesArabic = {
        'small_potion': 'جرعة الشفاء العشبية الصغرى (+30 صحة)',
        'qi_elixir': 'إكسير المانا وتكثيف اليقين (+20 مانا)',
        'ancient_blueprint': 'مخطوطة الصهر والحدادة لسيف مصفى أسطوري'
    };

    const choices = stock.map(item => ({
        text: `شراء: ${stockNamesArabic[item.id] || item.name} (${item.price} حجر روحي)`,
        callback: () => {
            const res = window.SHOP.buy(state, 'crossroads_market', item.id);
            
            let msgArabic = res.message;
            if (res.message.includes("Successfully purchased")) {
                msgArabic = `🎉 <b>تم الشراء بنجاح!</b> وضعت <b>${stockNamesArabic[item.id] || item.name}</b> في صرة حقيبتك، ودفعت الثمن من أحجارك الروحية.`;
            } else if (res.message.includes("gold") || res.message.includes("stones")) {
                msgArabic = `معندكش أحجار روحية كافية في صرتك لدفع تمن السلعة دي.`;
            }

            narrate(msgArabic, "النظام");
            if (res.success) {
                updateTopBar();
                saveGame();
            }
            setTimeout(showMarket, 1200);
        }
    }));

    choices.push({ text: "💰 بيع الممتلكات من الحقيبة", callback: () => {
        state.isSelling = true;
        showInventory();
    }});
    choices.push({ text: "↩ عودة", callback: () => { state.isSelling = false; hubLoop(); }});
    setChoices(choices);
}

function showSkillTree() {
    showSkillsScreen();
}

function showRebirthScreen() {
    clearNarrative();
    narrate("<b>قاعة انتقال الأرواح والبعث السماوي</b>", "النظام", null, false, true);
    narrate("لقد وصلت إلى ذروة ونهاية حياتك الروحية الحالية. هل أنت مستعد للتخلي عن جسدك المادي الفاني، والتحول بطاقة روحك الطاهرة في سياحة أبدية، لتولد من جديد بجسد أسطوري يحمل صفات موروثة تعينك في سلالتك القادمة؟", "النظام", null, false, true);
    
    if (state.player.lvl < 10) {
        narrate("<span style='color:var(--danger)'>يجب أن تصل بحد قتالك للمستوى 10 لتتمكن من خوض البعث والارتقاء الروحي.</span>");
        setChoices([{ text: "↩ عودة", callback: hubLoop }]);
        return;
    }

    const traitNamesArabic = {
        'strength_legacy': 'إرث السيف والصلابة الفولاذية (+15 هجوم دائم)',
        'vitality_legacy': 'إرث زهرة اللوتس وحيوية الخلود (+80 صحة دائم)',
        'spirit_legacy': 'إرث الشيخ وسعة اليقين والأسرار (+40 مانا دائم)'
    };

    const choices = Object.values(window.REBIRTH.traits).map(t => ({
        text: `اختر بركة: ${traitNamesArabic[t.id] || t.name}`,
        callback: () => {
            const success = window.REBIRTH.perform(state, t.id);
            if (success) {
                narrate("تطفو روحك الطاهرة في فراغ الملوك والأزليين... لتستيقظ بجسد وخلية جديدة فائقة القوة!", "النظام");
                setTimeout(hubLoop, 2500);
            }
        }
    }));
    
    setChoices([...choices, { text: "↩ ليس الآن", callback: hubLoop }]);
}

function showPropertiesScreen() {
    clearNarrative();
    const p = state.player;
    if (calculateTotalStats) calculateTotalStats();
    
    let alignmentTitle = "سالك عابر (متوازن)";
    if (p.karma >= 100) alignmentTitle = "ولّي طاهر (سماوي)";
    else if (p.karma >= 50) alignmentTitle = "مريد صالح (خَيِّر)";
    else if (p.karma <= -100) alignmentTitle = "طاغية مظلم (شيطاني)";
    else if (p.karma <= -50) alignmentTitle = "سائر في مسار الظل الوعر";

    const classNamesArabic = {
        'Sword Immortal': 'خالد السيف الأسطوري',
        'Medicine Cultivator': 'كبير خيمياء الشفاء العشبي',
        'Sufi Mystic': 'الدرويش العارف بالله',
        'Desert Knight': 'فارس الصحراء ونصل الرمال'
    };

    let html = `
        <div style="width:100%; text-align:left; font-family:'Inter', sans-serif;">
            <h2 style="color:var(--secondary); text-align:center;">مخطوطة صفات وجوهر المريد السالك</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
                
                <!-- Base Stats -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--primary);">
                    <h3 style="margin-top:0; color:var(--text); text-align:right;">⚔️ الجوهر والقدرة القتالية</h3>
                    <p style="margin:5px 0; text-align:left;">الهجوم الحاد: <b>${p.atk}</b></p>
                    <p style="margin:5px 0; text-align:left;">الدفاع المحصن: <b>${p.def}</b></p>
                    <p style="margin:5px 0; text-align:left;">صحة الجسد: <b>${p.hp} / ${p.maxHp}</b></p>
                    <p style="margin:5px 0; text-align:left;">طاقة المانا الروحية: <b>${p.mp} / ${p.maxMp}</b></p>
                </div>
 
                <!-- Spiritual Path -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--secondary);">
                    <h3 style="margin-top:0; color:var(--text); text-align:right;">✨ مسار اليقين والروح</h3>
                    <p style="margin:5px 0; text-align:left;">المرتبة واللقب الروحي: <b>${alignmentTitle}</b></p>
                    <p style="margin:5px 0; text-align:left;">جوهر الكارما: <b style="color:${p.karma >= 0 ? 'var(--jade)' : 'var(--danger)'}">${p.karma}</b></p>
                    <p style="margin:5px 0; text-align:left;">العقيدة المهيمنة: <b>${classNamesArabic[p.class] || p.class}</b></p>
                    <p style="margin:5px 0; text-align:left;">الطائفة الحليفة: <b>${p.faction === 'Jade Summit Sect' ? 'طائفة قمة اليشم العظمى' : p.faction === 'Sufi Order of the Empty Quarter' ? 'طريقة الربع الخالي الصوفية' : 'بلا طائفة (حر)'}</b></p>
                </div>

                <!-- Life & Background -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--primary);">
                    <h3 style="margin-top:0; color:var(--text); text-align:right;">🧬 هوية الحياة الروحية</h3>
                    <p style="margin:5px 0; text-align:left;">النشأة والأصول: <b>${p.background?.name === 'Rogue Cultivator' ? 'سالك براري حر' : p.background?.name === 'Sect Disciple' ? 'مريد طائفة متدين' : p.background?.name || 'مجهول النسب'}</b></p>
                    <p style="margin:5px 0; text-align:left;">القدرة الإلهية الكامنة: <b>${p.system?.name === 'Ancestral Sword Intent' ? 'بصيرة نصل السلف الخالد' : p.system?.name === 'Pure Yang Qi' ? 'شمس طاقة اليانغ النقية' : p.system?.name || 'لا يوجد'}</b></p>
                    <p style="margin:5px 0; text-align:left;">الأبناء والذرية: <b>${p.children || 0}</b> | وحوش وأعداء هزموا: <b>${p.kills || 0}</b></p>
                </div>

                <!-- Legacy & Rebirth -->
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:4px solid var(--sapphire);">
                    <h3 style="margin-top:0; color:var(--text); text-align:right;">⏳ سجل السلف والبعث</h3>
                    <p style="margin:5px 0; text-align:left;">عدد مرات البعث: <b>${state.legacy ? state.legacy.rebirthCount : 0}</b></p>
                    <p style="margin:5px 0; text-align:left;">الصفات والبركات الموروثة: <b>${state.legacy && state.legacy.traits.length ? state.legacy.traits.length : 'لا توجد'}</b></p>
                </div>
            </div>
        </div>
    `;
    narrate(html, "النظام", null, false, true);
    setChoices([{ text: "↩ عودة للواحة", callback: hubLoop }]);
}

function showManagementScreen() {
    clearNarrative();
    narrate("<b>ديوان العائلة والطائفة الروحية</b>", "النظام", null, false, true);
    
    let html = `<div class="management-container">`;
    
    // --- Family Card ---
    let pagodaLvl = state.player.familyPagodaLevel || 0;
    const pagodaNames = ["مفيش معبد أثري", "مزار الذكرى الخاشعة", "بهو شيوخ الأقدار الأبطال", "الضريح الإمبراطوري المهيب لملوك الشرق"];
    
    html += `
        <div class="management-card">
            <div class="management-header">
                <h3 style="color:var(--secondary)">👨‍👩‍👧‍👦 السلالة والروابط العائلية</h3>
                ${state.player.spouse ? `<span class="management-badge badge-alive">متزوج من الشريكة الطاهرة ${state.player.spouse.name}</span>` : '<span class="management-badge" style="background:rgba(255,255,255,0.1)">أعزب (لا شريكة له)</span>'}
            </div>
            <div style="background:rgba(255,215,0,0.04); border: 1px solid rgba(212,175,55,0.2); padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 0.82rem;">
                🏛️ <b>معبد الأسلاف الأثري:</b> الرتبة ${pagodaLvl}/3 (${pagodaNames[pagodaLvl]})
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
    `;
    
    if (state.player.family && state.player.family.length) {
        state.player.family.forEach(f => {
            const statusClass = f.alive ? 'badge-alive' : 'badge-deceased';
            const statusText = f.alive ? 'بصحة جيدة' : 'ارتحل (سقط)';
            let crisisLabel = "";
            
            const crisisTranslations = {
                'Kidnapped': 'تم اختطافه من لصوص جبل اليشم!',
                'Spiritual Poisoning': 'تسمم هالة قنوات مانا مهدد لحياته!',
                'Demonic Incursion': 'هجوم كوابيس وأرواح مظلمة سلب بصيرته!'
            };

            if (f.crisis) {
                crisisLabel = `<div style="color:var(--danger); font-size:0.75rem; margin-top:4px; font-weight:bold;">⚠️ محنة وخطورة: ${crisisTranslations[f.crisis] || f.crisis}</div>`;
            }
            
            const relationArabic = f.relation === 'Spouse' ? 'شريكة الحياة' : f.relation === 'Child' ? 'ابن السلالة' : f.relation;

            html += `
                <div class="management-stat-row" style="background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; border-left: 3px solid ${f.crisis ? 'var(--danger)' : 'var(--secondary)'};">
                    <div>
                        <div class="management-stat-label">${relationArabic}</div>
                        <div class="management-stat-value">${f.name}</div>
                        ${crisisLabel}
                    </div>
                    <div style="text-align:right;">
                        <div class="management-badge ${statusClass}">${statusText}</div>
                        <div style="font-size:0.7rem; color:var(--secondary); margin-top:4px;">الألفة: ${f.affinity}%</div>
                    </div>
                </div>
            `;
        });
    } else {
        html += `<p style="grid-column: span 2; color:var(--text-dim); font-style:italic;">لا يوجد روابط دم وعائلة مسجلة في حياتك الحالية.</p>`;
    }
    
    html += `
            </div>
            ${state.player.children ? `<div style="margin-top:10px; text-align:center; color:var(--jade); font-family:'Cinzel';">إجمالي أفراد الذرية الممتدة: ${state.player.children}</div>` : ''}
        </div>
    `;
    
    // --- Sect Card ---
    html += `
        <div class="management-card" style="border-left:4px solid var(--jade);">
            <div class="management-header">
                <h3 style="color:var(--jade)">🏛️ منشآت ومباني الطائفة العظمى</h3>
                ${state.sect ? `<span class="management-badge badge-alive">مستوى الطائفة: ${state.sect.level}</span>` : ''}
            </div>
    `;
    
    if (state.sect) {
        const specTranslations = {
            'Sword': 'عقيدة نصل السيف القاطع',
            'Alchemy': 'عقيدة خيمياء الإكسير الطاهر',
            'Array': 'عقيدة النقوش والتشكيلات الدفاعية'
        };
        const currentSpecArabic = specTranslations[state.sect.specialization] || 'لم تختر عقيدة بعد';

        html += `
            <div class="management-stat-row">
                <span class="management-stat-label">اسم الطائفة الروحية</span>
                <span class="management-stat-value">${state.sect.name}</span>
            </div>
            <div class="management-stat-row">
                <span class="management-stat-label">العقيدة المتبعة</span>
                <span class="management-stat-value" style="color:var(--jade)">${currentSpecArabic}</span>
            </div>
            <div class="management-stat-row">
                <span class="management-stat-label">خزينة الطائفة</span>
                <span class="management-stat-value" style="color:var(--secondary)">${state.sect.treasury} حجر روحي</span>
            </div>
            <div class="management-stat-row">
                <span class="management-stat-label">الشهرة والذكر بين الخلايق</span>
                <span class="management-stat-value">${Math.floor(state.sect.fame)}</span>
            </div>
            
            <div style="margin-top:15px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        `;
        
        Object.values(state.sect.buildings || {}).forEach(b => {
            const bNamesArabic = {
                'Main Hall': 'ديوان القاعة الكبرى والعرش',
                'Meditation Chamber': 'قاعة تأمل وخلوات الأتباع',
                'Treasury': 'خزنة الطائفة والكنوز العتيقة',
                'Training Ground': 'ساحة المبارزات وتدريب النصال'
            };
            html += `
                <div style="background:rgba(0,168,107,0.1); padding:8px; border-radius:4px; border:1px solid rgba(0,168,107,0.2);">
                    <div style="font-size:0.7rem; color:var(--jade); text-transform:uppercase;">${bNamesArabic[b.name] || b.name}</div>
                    <div style="font-size:0.85rem;">المستوى ${b.lvl} <small style="color:var(--text-dim)">(ترقية مضافة)</small></div>
                </div>
            `;
        });
        
        html += `</div>`;

        // Render Active Disciples list inside Sect Card
        if (state.sect.disciples && state.sect.disciples.length) {
            html += `
                <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                    <div style="font-size:0.9rem; color:var(--secondary); font-family:'Cinzel'; margin-bottom:10px; display:flex; justify-content:space-between;">
                        <span>👤 المريدين والأتباع النشطين</span>
                        <span>(${state.sect.disciples.length}/${state.sect.maxDisciples})</span>
                    </div>
            `;
            state.sect.disciples.forEach(d => {
                const statusClass = (d.alive !== false) ? 'badge-alive' : 'badge-deceased';
                const statusText = (d.alive !== false) ? 'نشط في مهامه' : 'سقط (ارتحل)';
                
                const dutyTranslations = {
                    'array': '🌌 صف التشكيل الدفاعي لدعم المانا',
                    'harvest': '🌾 جمع وحصاد الموارد بالأقاليم',
                    'patrol': '🛡️ دوريات حراسة وحماية حدود الطائفة'
                };
                let dutyText = d.assignment ? (dutyTranslations[d.assignment] || d.assignment.toUpperCase()) : "في خلوة تأمل هادئة";
                if (d.assignment === 'expedition') {
                    dutyText = `في بعثة استكشافية بالبرية المهجورة (${d.expeditionTicks} ثانية متبقية)`;
                }
                html += `
                    <div style="background:rgba(255,255,255,0.02); margin-bottom:8px; padding:8px 12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
                        <div>
                            <span style="font-weight:bold; color:var(--secondary);">${d.name}</span>
                            <span style="font-size:0.75rem; color:var(--text-dim); margin-left:8px;">مستوى ${d.lvl} | هجوم ${d.atk}</span>
                            <div style="font-size:0.75rem; color:var(--jade); margin-top:2px;">العهد المعين: <b>${dutyText}</b></div>
                        </div>
                        <span class="management-badge ${statusClass}">${statusText}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }
    } else {
        html += `<p style="color:var(--text-dim); font-style:italic; text-align:center;">لم تؤسس طائفة سماوية أو عائلية لتخليد اسمك وجمع الأتباع بعد.</p>`;
    }
    
    html += `</div>`; // End Sect Card
    
    // --- Diplomacy Card ---
    if (state.sect) {
        html += `
            <div class="management-card">
                <div class="management-header">
                    <h3 style="color:var(--danger)">🚩 العلاقات الدبلوماسية والخصوم بالشرق</h3>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:10px;">
        `;
        
        if (window.SECTS && window.SECTS.rivalSects) {
            window.SECTS.rivalSects.forEach(r => {
                let badgeClass = 'badge-ally';
                let relationArabic = 'حليف استراتيجي طاهر';
                if (r.relation === 'Hostile') { badgeClass = 'badge-hostile'; relationArabic = 'علاقات عدائية مستعرة'; }
                if (r.relation === 'War') { badgeClass = 'badge-war'; relationArabic = 'حرب وسيوف معلنة!'; }
                if (r.relation === 'Neutral') { badgeClass = 'management-badge'; relationArabic = 'هدوء حيادي حذر'; }
                
                const rivalNamesArabic = {
                    'shadow_fang': 'طائفة مخلب الظل الشيطانية',
                    'golden_lotus': 'طريقة لوتس البرق الصوفية',
                    'vanguard_sect': 'فرسان طليعة نصل الرمل الكاسر'
                };

                html += `
                    <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; flex:1; min-width:140px;">
                        <div style="font-size:0.85rem; margin-bottom:5px;">${rivalNamesArabic[r.id] || r.name}</div>
                        <span class="management-badge ${badgeClass}">${relationArabic}</span>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += `</div>`; // End Container
    narrate(html, "النظام", null, false, true);
    
    const choices = [
        { text: "🤝 قضاء وقت عائلي لتقوية الألفة والود", callback: () => {
            if (state.player.family && state.player.family.length > 0) {
                narrate("قضيت وقتاً طاهراً ودافئاً مع عائلتك، تجاذبتم أطراف الحديث عن دروب اليقين مما عمق الألفة والروابط الروحية بينكم.", "النظام");
                state.player.family.forEach(f => f.affinity = Math.min(100, f.affinity + 5));
            } else {
                narrate("جلست في خلوة صامتة مع بصيرتك تتأمل صفحة الملكوت، لكن حياتك الحالية تخلو من شريكة أو أبناء سلالة يشاركونك الخشوع.", "النظام");
            }
            showManagementScreen();
        }},
        { text: "🏛️ خيارات معبد الأسلاف وتعديلاته", callback: showPagodaUpgradeScreen }
    ];

    // Crises resolving options
    if (state.player.family) {
        state.player.family.forEach(f => {
            if (f.crisis) {
                choices.push({
                    text: `⚠️ فك محنة وإنقاذ ${f.name}`,
                    callback: () => showResolveCrisisScreen(f.id)
                });
            }
        });
    }

    if (!state.sect) {
        choices.push({ text: "🏛️ تأسيس طائفة أسطورية جديدة (يكلف 10,000 حجر روحي)", callback: () => {
            if (state.player.gold >= 10000) {
                state.player.gold -= 10000;
                window.SECTS.init(state);
                narrate("مبارك! لقد شحذت أحجارك الروحية ووضعت حجر الأساس لدیوان طائفتك الكبرى لتخليد اسمك في سلالات التاريخ الروحي للشرق العظيم.", "النظام");
                updateTopBar();
                saveGame();
            } else {
                narrate("معندكش أحجار روحية كافية لتأسيس صرح طائفة عظيم. (تتطلب 10,000 حجر روحي في صرتك)", "النظام");
            }
            showManagementScreen();
        }});
    } else {
        choices.push({ text: "👥 تعيين وإدارة مهام المريدين والأتباع", callback: showManageDiscipleScreen });
        choices.push({ text: "📜 اختيار العقيدة العقائدية لمسار الطائفة الروحية", callback: () => {
            setChoices([
                { text: "🗡️ عقيدة نصل السيف القاطع (تزيد الهجوم)", callback: () => { 
                    const res = window.SECTS.setSpecialization(state, "Sword");
                    narrate("تم اعتناق عقيدة نصل السيف القاطع! شحذ مريدوك نصالهم ووهبوا أنفسهم للبراعة الهجومية الحادة.", "النظام");
                    calculateTotalStats(); updateTopBar(); saveGame(); showManagementScreen();
                }},
                { text: "⚗️ عقيدة خيمياء الإكسير الطاهر (تزيد بركة التقطير)", callback: () => { 
                    const res = window.SECTS.setSpecialization(state, "Alchemy");
                    narrate("تم اعتناق عقيدة خيمياء الإكسير الطاهر! فاحت عطور الأعشاب المقدسة وزادت نسب استقرار التقطير في طائفتك.", "النظام");
                    calculateTotalStats(); updateTopBar(); saveGame(); showManagementScreen();
                }},
                { text: "🌌 عقيدة النقوش والتشكيلات الدفاعية (تزيد الدفاع)", callback: () => { 
                    const res = window.SECTS.setSpecialization(state, "Array");
                    narrate("تم اعتناق عقيدة النقوش والتشكيلات الدفاعية! اصطفت جدران ونقوش مانا المدافعة زادت صلابة بنيانك.", "النظام");
                    calculateTotalStats(); updateTopBar(); saveGame(); showManagementScreen();
                }},
                { text: "↩ رجوع", callback: showManagementScreen }
            ]);
        }});
        choices.push({ text: "👤 جذب وتجنيد مريد جديد للطائفة", callback: () => {
            const res = window.SECTS.recruit(state);
            let msgArabic = res.message;
            if (res.message.includes("recruited")) {
                msgArabic = "🎉 <b>مريد جديد يدخل محرابك!</b> سمع سالك براري موهوب بذكر طائفتك، وقدم راكعاً يرجو قبول عهد ولائه وطاعته.";
            } else if (res.message.includes("max")) {
                msgArabic = "قاعات طائفتك ممتلئة بالمريدين حالياً. قم بترقية المنشآت أولاً لتتسع للمزيد.";
            } else if (res.message.includes("stones") || res.message.includes("gold")) {
                msgArabic = "معندكش أحجار روحية كافية بالخزنة لجذب وتوظيف مريد جديد حالياً.";
            }
            narrate(msgArabic, "النظام");
            if (res.success) {
                updateTopBar(); saveGame();
            }
            showManagementScreen();
        }});
        choices.push({ text: "⚔️ دخول غرفة العمليات والحروب الاستراتيجية", callback: showWarRoom });
    }

    choices.push({ text: "💍 البحث عن شريكة حياة بالزواج الشرعي (يكلف 5,000 حجر روحي)", callback: () => {
        if (state.player.spouse) {
            narrate(`أنت بالفعل متزوج من شريكتك الطاهرة <b>${state.player.spouse.name}</b> ومثبتين في رباط أبدي!`, "النظام");
            showManagementScreen();
        } else if (window.LIFE) {
            const res = window.LIFE.seekMarriage(state, narrate);
            let msgArabic = res.message;
            if (res.message.includes("married")) {
                msgArabic = `💍 <b>عقد رباط طاهر مبارك!</b> ارتبطت بقلبك وروحك مع الشريكة الطاهرة <b>${state.player.spouse.name}</b> لتشاركك خلوة المسار وتشد أزرك!`;
            } else if (res.message.includes("gold") || res.message.includes("stones")) {
                msgArabic = "معندكش أحجار روحية كافية لتجهيز مهر وهدايا تليق بخطبة شريكة حياة طاهرة.";
            }
            narrate(msgArabic, "النظام");
            if (res.success) {
                calculateTotalStats(); updateTopBar(); saveGame();
            }
            showManagementScreen();
        }
    }});

    choices.push({ text: "📜 قاعة الطائفة والمهارات العظمى (Sect Hall)", callback: showSectHallScreen });

    if (state.player.spouse) {
        choices.push({ 
            text: "💖 تأمل مشترك مع شريكة الحياة لتغذية المانا", 
            callback: () => {
                const res = window.LIFE.dualCultivate(state);
                let msgArabic = res.message;
                if (res.message.includes("deepened your bonds")) {
                    msgArabic = "جلس كلاكما متقابلين متقاطعي الأيدي في تأمل مشترك طاهر. امتزجت هالتكما لتزيد طاقتكما الروحية وتعمق الألفة بينكما بشكل عجيب!";
                }
                narrate(msgArabic, "النظام");
                showManagementScreen();
            } 
        });
    }

    choices.push({ text: "↩ رجوع إلى واحة التقاطع", callback: hubLoop });

    setChoices(choices);
}

// --- Sub-Screens for Management Screen ---
function showPagodaUpgradeScreen() {
    clearNarrative();
    narrate("<b>معبد الأسلاف الأثري وتعديلات السلالة</b>", "النظام", null, false, true);
    
    let pagodaLvl = state.player.familyPagodaLevel || 0;
    const pagodaNames = ["مفيش معبد أثري", "مزار الذكرى الخاشعة", "بهو شيوخ الأقدار الأبطال", "الضريح الإمبراطوري المهيب لملوك الشرق"];
    const benefits = [
        "بناء وتأسيس مزار الذكرى الخاشعة (يمنح +10% تدفق إضافي في تأمل المانا وجلسات الروح).",
        "الترقية لبهو شيوخ الأقدار الأبطال (يمنح +15% زيادة في ألفة وود الأبطال ورفقاء الدرب).",
        "الترقية للضريح الإمبراطوري المهيب لملوك الشرق (يمنح +15% ضرر حرج إضافي مطلق في المعارك)."
    ];
    
    let html = `
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; font-family:'Inter', sans-serif;">
            <p>معبد أسلاف عائلتك يقف حالياً عند: <b>الرتبة ${pagodaLvl} / 3</b> (${pagodaNames[pagodaLvl]})</p>
            ${pagodaLvl < 3 ? `<p style="color:var(--secondary); text-align:left;"><b>بركات ومنافع الترقية القادمة:</b><br>${benefits[pagodaLvl]}</p>` : `<p style="color:var(--jade);">لقد وصل صرح أسلافك لذروة التناغم الكوني والروحي المطلق!</p>`}
        </div>
    `;
    narrate(html, "النظام", null, false, true);
    
    const choices = [];
    if (pagodaLvl < 3) {
        const costs = [
            "1,000 أحجار روحية، 500 خشب، 200 حديد",
            "3,000 أحجار روحية، 1,500 خشب، 800 حديد",
            "8,000 أحجار روحية، 4,000 خشب، 2,000 حديد"
        ];
        choices.push({
            text: `🧱 ترقية وتطوير معبد الأسلاف الأثري (التكلفة: ${costs[pagodaLvl]})`,
            callback: () => {
                const res = window.LIFE.upgradeAncestralPagoda(state);
                let msgArabic = res.message;
                if (res.message.includes("Upgraded ancestral pagoda")) {
                    msgArabic = `🧱 <b>تم ترقية الصرح بنجاح!</b> صفق البناؤون وارتفعت أعمدة اليشم والغرانيت، وأصبح معبد أسلافك هو <b>${pagodaNames[pagodaLvl + 1]}</b>!`;
                } else {
                    msgArabic = `<b>الترقية فشلت!</b> معندكش الأحجار أو الخشب أو الحديد الكافي في حقيبتك لإنجاز الترقية المعمارية.`;
                }

                narrate(msgArabic, "النظام");
                if (res.success) {
                    calculateTotalStats(); updateTopBar(); saveGame();
                }
                setTimeout(showManagementScreen, 2200);
            }
        });
    }
    choices.push({ text: "↩ Back", callback: showManagementScreen });
    setChoices(choices);
}

function showResolveCrisisScreen(memberId) {
    clearNarrative();
    const member = (state.player.family || []).find(f => f.id === memberId);
    if (!member || !member.crisis) {
        narrate("عضو العائلة ده آمن وبصحة كويسة في الواحة.", "النظام");
        setTimeout(showManagementScreen, 1500);
        return;
    }
    
    const crisisTranslations = {
        'Kidnapped': 'تم اختطافه من لصوص جبل اليشم!',
        'Spiritual Poisoning': 'تسمم هالة قنوات مانا مهدد لحياته!',
        'Demonic Incursion': 'هجوم كوابيس وأرواح مظلمة سلب بصيرته!'
    };

    narrate(`<b>حل وتفريج محنة عائلية:</b> إنقاذ <b>${member.name}</b>`, "النظام", null, false, true);
    narrate(`قريبك ودمك سقط في محنة عاتية: <b>${crisisTranslations[member.crisis] || member.crisis}</b>. كيف ستنقذه وتفرج كربه؟`, "النظام", null, false, true);
    
    const cost = member.crisis === 'Kidnapped' ? 2000 : 1500;
    
    const choices = [
        {
            text: `💎 دفع فدية التخليص / جلب الحكيم المعالج (${cost} حجر روحي)`,
            callback: () => {
                const res = window.LIFE.resolveFamilyCrisis(state, memberId, 'pay');
                let msgArabic = res.message;
                if (res.message.includes("paid")) {
                    msgArabic = `💎 <b>تم فك كرب قريبتك بنجاح!</b> دفعت الغرامة المطلوبة للحكيم أو اللصوص، وعاد <b>${member.name}</b> سالماً معافى لبيتك.`;
                }
                narrate(msgArabic, "النظام");
                if (res.success) {
                    updateTopBar(); saveGame();
                }
                setTimeout(showManagementScreen, 2200);
            }
        },
        {
            text: `⚔️ شن هجوم شخصي ساحق للاسترداد (خوض معركة!)`,
            callback: () => {
                const res = window.LIFE.resolveFamilyCrisis(state, memberId, 'fight');
                // Starts combat automatically via system callback
                let msgArabic = "شحذت نصلك وسحبت طاقتك متجهاً لمعقل اللصوص أو الأرواح المظلمة؛ المعركة بدأت!";
                narrate(msgArabic, "النظام");
            }
        }
    ];
    
    if (state.sect && state.sect.disciples && state.sect.disciples.length > 0) {
        choices.push({
            text: `👤 تفويض وإرسال مريد من الطائفة للإنقاذ (فرصة النجاح: مستوى المريد * 15%)`,
            callback: () => {
                const res = window.LIFE.resolveFamilyCrisis(state, memberId, 'disciple');
                let msgArabic = res.message;
                if (res.message.includes("succeeded")) {
                    msgArabic = `👤 <b>مهمة إنقاذ ناجحة للأتباع!</b> اقتحم مريدوك المعقل بقوة وشجاعة وأرجعوا <b>${member.name}</b> معززاً مكرماً للواحة!`;
                } else if (res.message.includes("failed")) {
                    msgArabic = `👤 <b>فشلت البعثة!</b> عاد مريدوك مثخنين بالجراح يعتذرون عن العجز في تخليص قريبتك من معقل الأعداء الأقوياء.`;
                }
                narrate(msgArabic, "النظام");
                if (res.success) {
                    saveGame();
                }
                setTimeout(showManagementScreen, 2500);
            }
        });
    }
    
    choices.push({ text: "↩ Back", callback: showManagementScreen });
    setChoices(choices);
}

function showManageDiscipleScreen() {
    clearNarrative();
    narrate("<b>تعيين وإدارة مهام وتكاليف المريدين والأتباع</b>", "النظام", null, false, true);
    
    if (!state.sect || !state.sect.disciples || state.sect.disciples.length === 0) {
        narrate("معندكش مريدين أتباع في طائفتك حالياً لتكليفهم بالمهام. اجذب مريدين أولاً.", "النظام");
        setTimeout(showManagementScreen, 1500);
        return;
    }
    
    const choices = state.sect.disciples.map((d, index) => {
        const dutyTranslations = {
            'array': ' صف التشكيل الدفاعي لدعم المانا',
            'harvest': ' جمع وحصاد الموارد بالأقاليم',
            'patrol': ' دوريات حراسة وحماية حدود الطائفة'
        };
        let duty = d.assignment ? (dutyTranslations[d.assignment] || d.assignment.toUpperCase()) : "في خلوة تأمل هادئة";
        if (d.assignment === 'expedition') duty = `في بعثة استكشافية بالبرية المهجورة (${d.expeditionTicks} ثانية متبقية)`;
        return {
            text: `👤 ${d.name} (مستوى ${d.lvl} | ${duty})`,
            callback: () => showDiscipleAssignmentScreen(index)
        };
    });
    
    choices.push({ text: "↩ Back", callback: showManagementScreen });
    setChoices(choices);
}

function showDiscipleAssignmentScreen(index) {
    clearNarrative();
    const d = state.sect.disciples[index];
    narrate(`<b>تعيين وتوجيه عهد ومهمة للمريد:</b> <b>${d.name}</b>`, "النظام", null, false, true);
    
    const duties = [
        { name: "🌌 تعيين في التشكيل الدفاعي لدعم تدفق المانا (+5% تأمل مانا لكل مستوى)", id: "array" },
        { name: "🌾 إرسال لحصاد خامات الموارد الطبيعية (أعشاب/حديد/خشب)", id: "harvest" },
        { name: "🛡️ تعيين لحراسة ودوريات تأمين حدود الطائفة", id: "patrol" },
        { name: "💤 استدعاء وإرجاع لخلوة التأمل الهادئة", id: null }
    ];
    
    const choices = duties.map(du => ({
        text: du.name,
        callback: () => {
            const res = window.SECTS.assignDisciple(state, index, du.id);
            narrate(`تم تعديل مهمة المريد <b>${d.name}</b> بنجاح إلى العهد الجديد.`, "النظام");
            saveGame();
            setTimeout(showManageDiscipleScreen, 1500);
        }
    }));
    
    choices.push({
        text: "🌀 إرساله في بعثة استكشافية كبرى للبرية المهجورة (يكلف 500 مؤن)",
        callback: () => {
            const res = window.SECTS.sendOnExpedition(state, index);
            let msgArabic = res.message;
            if (res.message.includes("sent")) {
                msgArabic = `🌀 <b>بعثة انطلقت!</b> ارتدى المريد درعه وصرة طعامه، وانطلق يستكشف دروب البراري المقفرة بحثاً عن الكنوز الغابرة.`;
            } else if (res.message.includes("food") || res.message.includes("mats")) {
                msgArabic = "مخازن طائفتك خالية من المؤن الكافية لتغطية احتياجات بعثة المريد الروحي حالياً. (تتطلب 500 طعام)";
            }
            narrate(msgArabic, "النظام");
            saveGame();
            setTimeout(showManageDiscipleScreen, 2000);
        }
    });
    
    choices.push({ text: "↩ Back", callback: showManageDiscipleScreen });
    setChoices(choices);
}

function showWarRoom() {
    clearNarrative();
    narrate("<b>غرفة الحرب والتخطيط الاستراتيجي للطائفة</b> — العرش العسكري", "النظام", null, false, true);
    
    let html = `<div style="text-align:left;">
        <h3 style="color:var(--danger)">🚩 الحروب الجارية والخصوم المباشرين</h3>`;
    
    const rivalNamesArabic = {
        'shadow_fang': 'طائفة مخلب الظل الشيطانية',
        'golden_lotus': 'طريقة لوتس البرق الصوفية',
        'vanguard_sect': 'فرسان طليعة نصل الرمل الكاسر'
    };

    if (window.SECTS && window.SECTS.rivalSects) {
        window.SECTS.rivalSects.forEach(r => {
            const status = r.relation === 'War' ? '<b style="color:var(--danger)">[في حالة حرب معلنة وسيوف مشهورة!]</b>' : r.relation === 'Neutral' ? 'هدوء حيادي حذر' : r.relation;
            html += `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                <b>${rivalNamesArabic[r.id] || r.name}</b> (${status})<br>
                القوة الحربية الكامنة: ${r.power} | أراضي مقاطعاتهم: ${r.territory}
            </div>`;
        });
    }

    html += `<h3 style="color:var(--secondary); margin-top:20px;">🗺️ السيطرة الإقليمية وجباية الموارد</h3>`;
    if (window.SECTS && window.SECTS.territories) {
        Object.entries(window.SECTS.territories).forEach(([name, t]) => {
            const ownerColor = t.owner === 'Player' ? 'var(--success)' : 'var(--danger)';
            const ownerArabic = t.owner === 'Player' ? 'تحت سيطرة طائفتك الطاهرة' : `مغتصبة من ${rivalNamesArabic[t.owner] || t.owner}`;
            html += `<p>المقاطعة الروحية ${name}: <b style="color:${ownerColor}">${ownerArabic}</b> (+${t.income} أحجار روحية جباية لكل دورة)</p>`;
        });
    }
    
    html += `</div>`;
    narrate(html, "النظام", null, false, true);

    const choices = [];
    if (window.SECTS) {
        window.SECTS.rivalSects.filter(r => r.relation !== 'War' && r.relation !== 'Defeated').forEach(r => {
            choices.push({ text: `⚔️ إعلان الحرب الحربية الشاملة على طائفة ${rivalNamesArabic[r.id] || r.name}`, callback: () => {
                const res = window.SECTS.declareWar(state, r.id);
                narrate(`أعلنت بوق وجحافل الحرب على طائفة <b>${rivalNamesArabic[r.id] || r.name}</b>! اصطفت جحافلك وقرعت الطبول وسحبت السيوف من أغمادها!`, "النظام");
                showWarRoom();
            }});
        });
    }
    
    choices.push({ text: "↩ Back to Management", callback: showManagementScreen });
    setChoices(choices);
}

function showDwellingScreen() {
    clearNarrative();
    if (window.DWELLING) window.DWELLING.init(state);
    const d = state.dwelling;
    
    narrate('<b style="font-size:1.3em;letter-spacing:2px;color:var(--secondary);">🏡 صومعة الخلوة والروح الطاهرة</b>', 'النظام', null, false, true);
    
    let html = `<div style="background:rgba(212,175,55,0.05); padding:15px; border-radius:8px; border:1px solid var(--secondary); margin-bottom:15px; text-align:left;">
        <b>الخدم والعمال الروحيين:</b> <span class="loot-epic">${d.servants}/${d.maxServants}</span><br>
        <small style="color:var(--text-dim);">الخدم والعمال يجمعون الخامات تلقائياً. تأمين الطعام والمؤن يبقيهم بكامل طاقتهم وكفاءتهم.</small>
    </div>`;

    html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px; text-align:left;">
        <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
            🍏 <b>المؤن والطعام:</b> <b>${d.resources.food}</b><br>
            <small style="color:var(--text-dim);">العمال المخصصين: ${d.nodes.food}</small>
        </div>
        <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
            🪵 <b>الخشب الجبلي:</b> <b>${d.resources.wood}</b><br>
            <small style="color:var(--text-dim);">العمال المخصصين: ${d.nodes.wood}</small>
        </div>
        <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
            🪙 <b>الحديد الدمشقي:</b> <b>${d.resources.iron}</b><br>
            <small style="color:var(--text-dim);">العمال المخصصين: ${d.nodes.iron}</small>
        </div>
        <div style="background:rgba(0,229,160,0.03); padding:10px; border-radius:6px; border:1px solid var(--jade);">
            ✨ <b>طاقة النقوش الإلهية (Array Qi):</b> <b style="color:var(--jade);">${d.qi}</b><br>
            <small style="color:var(--text-dim);">العمال المخصصين: ${d.nodes.qi} | رتبة تشكيل النقش: ${d.qiArrayLevel}</small>
        </div>
    </div>`;

    html += `<div style="background:rgba(0,168,107,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); text-align:left;">
        <b style="color:var(--jade);">🌱 الجذور والينابيع الروحية لعناصر الطبيعة (Spiritual Roots)</b><br>
        🛡️ نبع الذهب (لتعزيز الهجوم): <b>المرتبة ${d.roots.gold}</b> (+${d.roots.gold * 10} هجوم)<br>
        🪵 نبع الخشب (لتعزيز الصحة): <b>المرتبة ${d.roots.wood}</b> (+${d.roots.wood * 50} صحة)<br>
        💧 نبع الماء (لتعزيز الدفاع): <b>المرتبة ${d.roots.water}</b> (+${d.roots.water * 8} دفاع)<br>
        🔥 نبع النار (لتعزيز فرصة الضرب القاطع): <b>المرتبة ${d.roots.fire}</b> (+${d.roots.fire * 1}% فرصة ضربة قاضية حاسمة)<br>
        🌍 نبع الأرض (لتعزيز سعة طاقة اليقين): <b>المرتبة ${d.roots.earth}</b> (+${d.roots.earth * 25} أقصى مانا)<br>
    </div>`;

    narrate(html, 'النظام', null, false, true);

    const choices = [
        {
            text: `👤 توظيف خادم روحي جديد (التكلفة: ${200 + d.servants * 100} حجر روحي)`,
            callback: () => {
                const res = window.DWELLING.buyServant(state);
                let msgArabic = res.message;
                if (res.message.includes("recruited")) {
                    msgArabic = "👤 <b>خادم روحي جديد يبدأ مهامه!</b> تم جلب خادم روحي مخلص في صومعتك لرعاية وتنمية منابع الموارد.";
                } else if (res.message.includes("stones") || res.message.includes("gold")) {
                    msgArabic = "معندكش أحجار روحية كافية بالخزنة لتوظيف خادم روحي جديد حالياً.";
                }
                narrate(msgArabic, 'النظام');
                updateTopBar(); saveGame();
                setTimeout(showDwellingScreen, 1500);
            }
        },
        {
            text: "👷 إدارة وتوجيه مهام الخدم",
            callback: () => {
                clearNarrative();
                narrate("<b>توزيع العمال على منابع الموارد الروحية بداخل صومعتك:</b>", "النظام", null, false, true);
                setChoices([
                    { text: "🍏 نبع المؤن والزراعة [+] زيادة عامل", callback: () => { window.DWELLING.assignServant(state, 'food', 1); showDwellingScreen(); }},
                    { text: "🍏 نبع المؤن والزراعة [-] سحب عامل", callback: () => { window.DWELLING.assignServant(state, 'food', -1); showDwellingScreen(); }},
                    { text: "🪵 غابة الخشب الجبلي [+] زيادة عامل", callback: () => { window.DWELLING.assignServant(state, 'wood', 1); showDwellingScreen(); }},
                    { text: "🪵 غابة الخشب الجبلي [-] سحب عامل", callback: () => { window.DWELLING.assignServant(state, 'wood', -1); showDwellingScreen(); }},
                    { text: "🪙 منجم الحديد الدمشقي [+] زيادة عامل", callback: () => { window.DWELLING.assignServant(state, 'iron', 1); showDwellingScreen(); }},
                    { text: "🪙 منجم الحديد الدمشقي [-] سحب عامل", callback: () => { window.DWELLING.assignServant(state, 'iron', -1); showDwellingScreen(); }},
                    { text: "✨ تشكيل نقش المانا [+] زيادة عامل", callback: () => { window.DWELLING.assignServant(state, 'qi', 1); showDwellingScreen(); }},
                    { text: "✨ تشكيل نقش المانا [-] سحب عامل", callback: () => { window.DWELLING.assignServant(state, 'qi', -1); showDwellingScreen(); }},
                    { text: "↩ Back", callback: showDwellingScreen }
                ]);
            }
        },
        {
            text: `⚗️ ترقية وتطوير تشكيل المانا الدفاعي (التكلفة: ${d.qiArrayLevel * 150} خشب / ${d.qiArrayLevel * 80} حديد)`,
            callback: () => {
                const res = window.DWELLING.upgradeQiArray(state);
                let msgArabic = res.message;
                if (res.message.includes("Upgraded")) {
                    msgArabic = `⚗️ <b>تم ترقية التشكيل الدفاعي بنجاح!</b> صفت النقوش ورسمت خطوط اليقين العظيمة، لترتفع رتبة التشكيل إلى <b>المستوى ${d.qiArrayLevel}</b>!`;
                } else {
                    msgArabic = "معندكش الخشب أو الحديد الكافي لتشييد وتطوير نقش المانا حالياً.";
                }
                narrate(msgArabic, 'النظام');
                saveGame();
                setTimeout(showDwellingScreen, 1500);
            }
        },
        {
            text: "🌱 ترقية وتطهير الينابيع الروحية لعناصر الطبيعة",
            callback: () => {
                clearNarrative();
                narrate("<b>طهر ورقّ الينابيع الروحية لعناصر جسدك باستخدام طاقة النقوش الإلهية المتراكمة:</b>", "النظام", null, false, true);
                const upgradeChoices = Object.keys(d.roots).map(key => {
                    const cost = Math.floor(100 * Math.pow(1.5, d.roots[key]));
                    
                    const rootArabic = key === 'gold' ? 'نبع الذهب' : key === 'wood' ? 'نبع الخشب' : key === 'water' ? 'نبع الماء' : key === 'fire' ? 'نبع النار' : 'نبع الأرض';
                    return {
                        text: `⚡ رتبة ${d.roots[key] + 1} لـ ${rootArabic} (التكلفة: ${cost} طاقة مانا من النقوش)`,
                        callback: () => {
                            const res = window.DWELLING.upgradeRoot(state, key);
                            let msgArabic = res.message;
                            if (res.message.includes("Upgraded")) {
                                msgArabic = `🌱 <b>تطهير وترقية نجحت!</b> طهرت شجر وينابيع عنصر <b>${rootArabic}</b> بداخل روحك لترتقي للرتبة <b>الرابعة ${d.roots[key]}</b>!`;
                            } else {
                                msgArabic = "معندكش طاقة مانا كافية بداخل نقوش صومعتك لإنجاز الترقية الروحية حالياً.";
                            }
                            narrate(msgArabic, 'النظام');
                            calculateTotalStats(); updateTopBar(); saveGame();
                            setTimeout(showDwellingScreen, 1500);
                        }
                    };
                });
                setChoices([...upgradeChoices, { text: "↩ Back", callback: showDwellingScreen }]);
            }
        },
        { text: "↩ عودة للتأمل وقنوات اليقين", callback: showCultivationScreen }
    ];

    setChoices(choices);
}

function showSoulWanderingScreen() {
    clearNarrative();
    if (window.SOUL_WANDERING) window.SOUL_WANDERING.init(state);
    const sw = state.soulWandering;

    narrate('<b style="font-size:1.3em;letter-spacing:2px;color:var(--secondary);">🌀 سياحة الروح وإرسال البصيرة في الملكوت</b>', 'النظام', null, false, true);

    if (sw.active) {
        const swRegionsArabic = {
            'wandering_forest': 'الغابة الروحية الكثيفة بالأعشاب',
            'iron_mountain': 'سلسلة جبال الحديد والدمشقي العالية',
            'void_rift': 'شق الفراغ الكوني وأسرار الملوك'
        };
        const rNameArabic = swRegionsArabic[sw.regionId] || sw.regionId;

        narrate(`روحك وبصيرتك تسبح حالياً وتستكشف نواحي <b style="color:var(--secondary);">${rNameArabic}</b>.<br>الدورات والأنفاس المتبقية للبعثة: <b>${sw.ticksRemaining}/${sw.totalTicks} دورة نفسية</b>.`, 'النظام', null, false, true);
        
        let logHtml = `<div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px; max-height:200px; overflow-y:auto; text-align:left; font-size:0.9rem; font-family:monospace; line-height:1.4;">
            ${sw.log.map(line => {
                let lineArabic = line;
                if (line.includes("Gathered")) {
                    lineArabic = "حصدت بصيرتك خامات جديدة وأرسلتها في الفراغ لصومعتك.";
                } else if (line.includes("Meditated")) {
                    lineArabic = "جلست بصيرتك الطاهرة في خلوة عابرة وامتصت تدفقاً نقياً من مانا الملكوت.";
                } else if (line.includes("Defeated")) {
                    lineArabic = "واجهت روحك وحشاً كامناً في الفراغ وسحقته في معركة روحية مذهلة.";
                }
                return `• ${lineArabic}`;
            }).join('<br>')}
        </div>`;
        narrate(logHtml, 'سجل السياحة الروحية الجاري', null, false, true);

        setChoices([
            { text: "🔄 تحديث سجل السياحة الروحية", callback: showSoulWanderingScreen },
            {
                text: "🛑 استدعاء البصيرة والروح فوراً (واستلام الغنائم)",
                callback: () => {
                    const res = window.SOUL_WANDERING.stop(state);
                    narrate("أغلقت أثر الفراغ وسحبت طيف روحك وبصيرتك بأمان لجسدك المادي، محتفظاً بكل الغنائم والكنوز واليقين المتراكم خلال الرحلة!", 'النظام');
                    setTimeout(showSoulWanderingScreen, 1800);
                }
            },
            { text: "↩ Back", callback: showCultivationScreen }
        ]);
    } else {
        narrate("أرسل طيف بصيرتك وروائح روحك خارج مدارات جسدك الفاني وميريدياناتك لتسبح في أقاليم الملكوت البعيدة، وتجمع خامات المانا وتأمل اليقين تلقائياً وبشكل سلبي وآمن تماماً.", 'النظام', null, false, true);

        const swRegionsArabic = {
            'wandering_forest': 'الغابة الروحية الكثيفة بالأعشاب (مستوى 1)',
            'iron_mountain': 'سلسلة جبال الحديد والدمشقي العالية (مستوى 8)',
            'void_rift': 'شق الفراغ الكوني وأسرار الملوك (مستوى 15)'
        };

        const choices = Object.entries(window.SOUL_WANDERING.regions).map(([id, r]) => {
            const unlocked = (state.player.lvl || 1) >= r.minLvl;
            return {
                text: `${unlocked ? '✨' : '🔒'} ${swRegionsArabic[id] || r.name} (أدنى مستوى: ${r.minLvl})`,
                callback: () => {
                    if (!unlocked) {
                        narrate("بنيانك المادي والروحي أضعف من أن يتحمل إرسال بصيرتك إلى غياهب هذا الشق الإقليمي حالياً.", "النظام");
                        setTimeout(showSoulWanderingScreen, 1500);
                        return;
                    }
                    clearNarrative();
                    narrate(`حدد مدة ودورات سياحة روحك وبصيرتك في أنحاء <b>${swRegionsArabic[id] || r.name}</b>:`, "النظام", null, false, true);
                    setChoices([
                        { text: "🌀 سياحة قصيرة الخلوة (10 دورات / دقيقة تقريباً)", callback: () => { window.SOUL_WANDERING.start(state, id, 10); showSoulWanderingScreen(); }},
                        { text: "🌀 سياحة عادية الدروب (30 دورات / 3 دقائق تقريباً)", callback: () => { window.SOUL_WANDERING.start(state, id, 30); showSoulWanderingScreen(); }},
                        { text: "🌀 سياحة كبرى المدى (50 دورات / 5 دقائق تقريباً)", callback: () => { window.SOUL_WANDERING.start(state, id, 50); showSoulWanderingScreen(); }},
                        { text: "↩ Back", callback: showSoulWanderingScreen }
                    ]);
                }
            };
        });

        setChoices([...choices, { text: "↩ عودة للتأمل وقنوات اليقين", callback: showCultivationScreen }]);
    }
}

function showSectHallScreen() {
    clearNarrative();
    if (window.SECTS) window.SECTS.init(state);
    
    narrate('<b style="font-size:1.3em;letter-spacing:2px;color:var(--secondary);">📜 ديوان قاعة الطائفة الكبرى</b>', 'النظام', null, false, true);

    if (state.sect) {
        const s = (window.SECTS && window.SECTS.sectsDb && state.sect.id && window.SECTS.sectsDb[state.sect.id]) || {
            ultName: "Primordial Jade Grand Ultimate",
            ult: "grand_dao",
            tier: state.sect.tier || 1
        };
        const ultArabic = s.ultName === 'Primordial Jade Grand Ultimate' ? 'تأمل اليشم المطلق للأزليين' : s.ultName === 'Sufi Fana Transcendence' ? 'فناء العارفين الروحي العظيم' : s.ultName;

        narrate(`الطائفة المنتمي إليها: <b style="color:var(--secondary);">${state.sect.name}</b> (الرتبة ${state.sect.tier})<br>نقاط المساهمة والولاء في الطائفة: <span class="loot-epic">${state.sect.contribution || 0}</span>`, 'النظام', null, false, true);

        setChoices([
            {
                text: `✨ إتقان وتنشيط فن الطائفة المطلق: ${ultArabic} (يتطلب: ${s.tier * 500} ولاء)`,
                callback: () => {
                    const res = window.SECTS.learnUltimate(state);
                    let msgArabic = res.message;
                    if (res.message.includes("learned")) {
                        msgArabic = `✨ <b>إتقان تام للفن المطلق!</b> ركعت في بهو الطائفة ووهبك الشيوخ أسرار ومخطوطة <b>${ultArabic}</b> ليتغلغل في مهاراتك القتالية!`;
                    } else {
                        msgArabic = "معندكش نقاط مساهمة وولاء كافية لطلب تلقين الفن المطلق من شيوخ الطائفة.";
                    }
                    narrate(msgArabic, 'النظام');
                    saveGame();
                    setTimeout(showSectHallScreen, 2200);
                }
            },
            {
                text: "❌ الانشقاق والخروج من الطائفة (يمسح الفن المطلق إلا لو دفعت 1,000 حجر روحي)",
                callback: () => {
                    const res = window.SECTS.leaveSect(state);
                    let msgArabic = res.message;
                    if (res.message.includes("betrayed")) {
                        msgArabic = "❌ <b>لقد انشققت وغادرت الطائفة!</b> تم مسح اسمك من سجلاتهم ومسحت نقوش فنهم المطلق من عروقك كعقوبة خيانة.";
                    }
                    narrate(msgArabic, 'النظام');
                    saveGame();
                    setTimeout(showSectHallScreen, 2500);
                }
            },
            { text: "↩ عودة لديوان الإدارة", callback: showManagementScreen }
        ]);
    } else {
        narrate("ارتحل للمرتفعات والجبال الروحية العالية بالشرق، وقدم التماساً مكتوباً وتضحيات من الأحجار لتنضم لإحدى الطوائف العظمى المتاحة وتكتسب فنونهم المطلقة.", 'النظام', null, false, true);

        const choices = Object.entries(window.SECTS.sectsDb).map(([id, s]) => {
            const currentRealm = state.player.cultivation?.stage || 'Qi Condensation';
            const realms = ['Qi Condensation', 'Foundation Establishment', 'Core Formation', 'Nascent Soul'];
            const playerRealmIdx = realms.indexOf(currentRealm);
            const reqRealmIdx = realms.indexOf(s.reqRealm);
            const eligible = playerRealmIdx >= reqRealmIdx;

            const sectNameArabic = s.name === 'Jade Summit Sect' ? 'طائفة قمة اليشم العظمى' : s.name === 'Sufi Order of the Empty Quarter' ? 'طريقة الربع الخالي الصوفية' : s.name;
            const reqRealmArabic = s.reqRealm === 'Qi Condensation' ? 'تكثيف المانا' : s.reqRealm === 'Foundation Establishment' ? 'تأسيس البنيان' : s.reqRealm === 'Core Formation' ? 'النواة الذهبية' : 'البعث الروحي';

            return {
                text: `${eligible ? '✨' : '🔒'} تقديم التماس انضمام لـ ${sectNameArabic} (الرتبة ${s.tier} | الرسوم: ${s.cost} حجر روحي | يتطلب: ملكوت ${reqRealmArabic})`,
                callback: () => {
                    const res = window.SECTS.joinSect(state, id);
                    let msgArabic = res.message;
                    if (res.message.includes("joined")) {
                        msgArabic = `✨ <b>تم قبول التماسك ودخلت المحراب!</b> رحب بك شيوخ طائفة <b>${sectNameArabic}</b> وألبسوك رداءهم الروحي المميز!`;
                    } else if (res.message.includes("gold") || res.message.includes("stones")) {
                        msgArabic = "معندكش أحجار روحية كافية لدفع رسوم الانضمام لهذه الطائفة العريقة.";
                    } else if (res.message.includes("realm") || res.message.includes("stage")) {
                        msgArabic = `بنيانك الروحي ضعيف، شيوخ الطائفة يتطلبون سالكاً في ملكوت <b>${reqRealmArabic}</b> على الأقل ليقبلوا نظره.`;
                    }
                    narrate(msgArabic, 'النظام');
                    updateTopBar(); saveGame();
                    setTimeout(showSectHallScreen, 2200);
                }
            };
        });

        setChoices([...choices, { text: "↩ عودة لديوان الإدارة", callback: showManagementScreen }]);
    }
}

function showAscensionScreen() {
    clearNarrative();
    narrate('<b style="font-size:1.4em;letter-spacing:2px;color:var(--secondary); text-shadow:0 0 8px var(--secondary);">⚡ بوابة الارتقاء السماوي المطلق</b>', 'النظام', null, false, true);
    narrate("تقف روحك وجسدك الفاني أمام الحاجز الكوني الأخير للملكوت الأرضي. خلف البوابة تترامى بلاد السماوات السبع الخالدة حيث اليقين المطلق والارتقاء لمرتبة Deity الأبدية. اختر مسار وسبيل ارتقائك الكوني:", 'النظام', null, false, true);

    setChoices([
        {
            text: "🛡️ ارتقاء البنيان والجسد المادي المطور (يتطلب 100 دفاع على الأقل)",
            callback: () => {
                const res = window.ASCENSION.attemptPhysical(state);
                if (!res.success) {
                    let msgArabic = "صلابة جسدك المادي ضعيفة! سحق وفتت ضغط الرياح الكونية مريدك وأعاده ذليلاً للصومعة.";
                    narrate(msgArabic, 'النظام', null, false, true);
                    setTimeout(showCultivationScreen, 3500);
                } else {
                    clearNarrative();
                    narrate("<div class='cinematic-transition' style='text-align:center; padding: 40px;'><h1 style='font-family:Cinzel; letter-spacing:3px; animation: pulse 2s infinite; color:var(--secondary);'>الفصل الرابع: الارتقاء السماوي الأعظم</h1><p>تحول جسدك الفاني إلى تمثال من اليشم والذهب، مقاوماً الرياح الساحقة للحدود الكونية. عبرت بوابات السماء السبع خالدأ لا تموت!</p></div>", 'النظام', null, false, true);
                    window.ASCENSION.complete(state);
                    setTimeout(hubLoop, 4000);
                }
            }
        },
        {
            text: "⚔️ ارتقاء السيف القاطع (تحدي البطل الحارس للبوابات الكونية!)",
            callback: () => {
                const res = window.ASCENSION.attemptCombat(state);
                if (!res.success) {
                    narrate("حارس البوابة الكونية يرفض التحدي حالياً؛ لم تكتمل كل فصول وشروط الأقدار اللازمة لمواجهته.", 'النظام');
                }
            }
        },
        { text: "↩ عودة لقنوات اليقين", callback: showCultivationScreen }
    ]);
}

function showAuctionHouse() {
    clearNarrative();
    if (!window.AUCTION) {
        narrate("دار المزادات مغلقة حالياً بقرار من شيوخ طائفة قمة اليشم لتعديل نقوش الحماية.", "النظام");
        setTimeout(hubLoop, 2000);
        return;
    }

    const auction = state.activeAuction || window.AUCTION.start(state);
    state.activeAuction = auction;

    const item = auction.item;
    
    const auctionItemsArabic = {
        'dragon_bone': 'عظم التنين الأزلي المحفور بالنار',
        'nirvana_pill': 'حبة نيرفانا الكبرى لتمحيص الأغلال الروحية',
        'ancient_manual': 'مخطوطة السيف البصير الكبرى المكتوبة بالدم والذهب'
    };
    const auctionItemDescsArabic = {
        'dragon_bone': 'شريحة عظم من وحش كاسر عتيق، تنبعث منها طاقة نارية عارمة ومثالية لورش الصهر وسحر السيف.',
        'nirvana_pill': 'حبة خيمياء أسطورية طهرها حكماء الشرق لزيادة حظوظك وفرص ارتقاء عقيدتك بمعدل 50%!',
        'ancient_manual': 'مخطوطة جلدية قديمة تحوي تفاصيل الفن المطلق لقلب السيف، تفتح فنوناً هجومية إضافية عند دراستها.'
    };

    narrate('<b style="font-size:1.3em;letter-spacing:2px;color:var(--secondary); text-shadow: 0 0 10px rgba(255,215,0,0.2);">🏛️ دار المزايدات السماوية ببهو القوافل</b>', 'النظام', null, false, true);
    narrate(`حشد صاخب ورهيب من سالكي البراري والتجار المتنافسين يملأ بهو المزايدة. الكنز المعروض على الحامل المخملي الفاخر أمام الجميع هو:`, 'النظام', null, false, true);
    
    // Display item card
    narrate(`
        <div style="background:rgba(255,215,0,0.03); padding:15px; border-radius:8px; border:1px solid rgba(212,175,55,0.3); text-align:left; margin:15px 0;">
            <b class="loot-epic" style="font-size:1.15rem; letter-spacing:1px;">✨ ${auctionItemsArabic[item.id] || item.name}</b><br>
            <span style="color:var(--text-dim); font-size:0.88rem;">${auctionItemDescsArabic[item.id] || item.desc}</span><br><br>
            <span style="color:var(--text)">سعر البدء المبدئي المعروض: <b>${item.basePrice} حجر روحي</b></span>
        </div>
    `, 'النظام', null, false, true);

    narrate(`
        <div style="padding:10px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:6px; display:flex; justify-content:space-between; margin-bottom:15px;">
            <span>صاحب أعلى عرض حالياً: <b style="color:var(--secondary);">${auction.highestBidder === state.player.name ? 'أنت (المريد السالك)' : auction.highestBidder}</b></span>
            <span>العرض الأعلى الحالي: <b style="color:var(--jade); font-size:1.1rem;">${auction.currentBid} حجر</b></span>
        </div>
        <div style="color:var(--danger); font-weight:bold; letter-spacing:1px; text-shadow:0 0 4px rgba(255,75,75,0.2);">
            ⏳ الوقت المتبقي لحسم المزاد: ${auction.timeLeft} ثانية
        </div>
    `, 'النظام', null, false, true);

    const gold = state.player.gold || 0;
    const bid10 = Math.floor(auction.currentBid * 1.10);
    const bid25 = Math.floor(auction.currentBid * 1.25);

    const choices = [
        {
            text: `⚡ تقديم مزايدة طفيفة (+10%): عرض ${bid10} حجر روحي`,
            callback: () => {
                if (gold < bid10) {
                    narrate("<span style='color:var(--danger)'><b>مزايدة تعذرت!</b> صرتك خالية من الأحجار الروحية الكافية لتقديم هذا العرض الشجاع.</span>", "النظام");
                    setTimeout(showAuctionHouse, 2000);
                    return;
                }
                const success = window.AUCTION.placeBid(state, state.player.name, bid10);
                if (success) {
                    narrate(`رفعت لوح المزايدة بثقة تامة أمام التجار! أنت الآن صاحب أعلى عرض بقيمة <b>${bid10} حجر روحي</b>!`, "النظام");
                    if (window.AUDIO) window.AUDIO.playEffect('menu_click');
                }
                setTimeout(showAuctionHouse, 1800);
            }
        },
        {
            text: `🔥 اكتساح المزايدة بقوة وجرأة (+25%): عرض ${bid25} حجر روحي`,
            callback: () => {
                if (gold < bid25) {
                    narrate("<span style='color:var(--danger)'><b>مزايدة تعذرت!</b> صرتك خالية من الأحجار الروحية الكافية لتقديم هذا العرض الشجاع.</span>", "النظام");
                    setTimeout(showAuctionHouse, 2000);
                    return;
                }
                const success = window.AUCTION.placeBid(state, state.player.name, bid25);
                if (success) {
                    narrate(`صحت بقوة وهيبة في أرجاء قاعة المزايدة، معلناً عن عرض جبار بقيمة <b>${bid25} حجر روحي</b>! همس الحاضرون في دهول وتراجع المنافسون!`, "النظام");
                    if (window.AUDIO) window.AUDIO.playEffect('combat_hit');
                }
                setTimeout(showAuctionHouse, 1800);
            }
        },
        {
            text: `⏳ تمهل وترقب (جولة مزايدة التجار الآخرين بالبهو)`,
            callback: () => {
                window.AUCTION.processNPCs(state);
                auction.timeLeft = Math.max(0, auction.timeLeft - 10);
                
                if (auction.timeLeft <= 0) {
                    // Auction Ends!
                    clearNarrative();
                    narrate('<b>دق ناقوس المزاد ودق المطرقة! تم البيع بنجاح!</b>', 'المنادي بصوت جوهري', null, false, true);
                    
                    if (auction.highestBidder === state.player.name) {
                        state.player.gold -= auction.currentBid;
                        if (!state.player.inventory.items) state.player.inventory.items = [];
                        
                        // Create item in inventory
                        if (item.id === 'dragon_bone') {
                            if (!state.player.inventory.materials) state.player.inventory.materials = {};
                            state.player.inventory.materials['dragon_vein_shard'] = (state.player.inventory.materials['dragon_vein_shard'] || 0) + 3;
                            narrate(`<div class="cinematic-transition" style="background:rgba(0,229,160,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); text-align:center;"><span class="loot-epic" style="font-size:1.2rem; font-weight:bold;">🎉 انتصار باهر ومطلق في المزاد!</span><br>تم رسو المزاد عليك وفزت بـ <b>${auctionItemsArabic[item.id] || item.name}</b>! قام العمال بصهرها فوراً وتحويلها لـ <b>3x شظايا عروق تنين</b> ذهبية أضيفت لحقيبتك!</div>`, 'النظام', null, false, true);
                        } else if (item.id === 'nirvana_pill') {
                            const newItem = {
                                id: 'nirvana_pill',
                                name: auctionItemsArabic[item.id] || item.name,
                                type: 'consumable',
                                effect: { breakthroughRateUp: 0.50 }
                            };
                            if (!state.player.inventory.items) state.player.inventory.items = [];
                            state.player.inventory.items.push(newItem);
                            narrate(`<div class="cinematic-transition" style="background:rgba(0,229,160,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); text-align:center;"><span class="loot-epic" style="font-size:1.2rem; font-weight:bold;">🎉 انتصار باهر ومطلق في المزاد!</span><br>تم رسو المزاد عليك وفزت بـ <b>${auctionItemsArabic[item.id] || item.name}</b> الأسطورية! أضيفت لجرعات حقيبتك؛ يمكنك بلعها لرفع حظوظ الارتقاء القادم!</div>`, 'System', null, false, true);
                        } else {
                            const newItem = {
                                id: 'ancient_manual',
                                name: auctionItemsArabic[item.id] || item.name,
                                type: 'manual',
                                manualSkill: 'sword_heart'
                            };
                            if (!state.player.inventory.items) state.player.inventory.items = [];
                            state.player.inventory.items.push(newItem);
                            narrate(`<div class="cinematic-transition" style="background:rgba(0,229,160,0.05); padding:15px; border-radius:8px; border:1px solid var(--jade); text-align:center;"><span class="loot-epic" style="font-size:1.2rem; font-weight:bold;">🎉 انتصار باهر ومطلق في المزاد!</span><br>تم رسو المزاد عليك وفزت بـ <b>${auctionItemsArabic[item.id] || item.name}</b>! يمكنك الآن دراسة <b>مخطوطة قلب السيف البصير</b> وتفعيل فنها الروحي!</div>`, 'System', null, false, true);
                            if (window.CULTIVATION && window.CULTIVATION.methods && window.CULTIVATION.methods['sword_heart']) {
                                window.CULTIVATION.methods['sword_heart'].unlocked = true;
                            }
                        }
                        if (window.AUDIO) window.AUDIO.playEffect('level_up');
                    } else {
                        // Rival wins
                        narrate(`<div style="background:rgba(255,75,75,0.05); padding:15px; border-radius:8px; border:1px solid var(--danger); text-align:center;"><b style="color:var(--danger)">أغلق المزاد وعاد الحشد</b><br>طار الكنز وجرف المزاد منافس آخر! فاز به <b>${auction.highestBidder}</b> بسعر <b>${auction.currentBid} حجر روحي</b>.</div>`, 'النظام', null, false, true);
                    }
                    
                    state.activeAuction = null;
                    setChoices([{ text: "↩ عودة إلى سوق الواحة", callback: hubLoop }]);
                } else {
                    narrate("تراقب المزايدين المنافسين بكتم أنفاس وترقب، والعيون تتأجج شحاً وتنافساً...", "النظام");
                    setTimeout(showAuctionHouse, 1500);
                }
            }
        },
        {
            text: "↩ انسحب واخرج من القاعة",
            callback: () => {
                state.activeAuction = null;
                hubLoop();
            }
        }
    ];

    setChoices(choices);
}
