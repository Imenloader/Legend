// ============================================================
// TOWER_AND_ACHIEVEMENTS.JS — برج السراب الخالد، ديوان الألقاب، التكليفات، ولوحة القتال الحية
// ============================================================

(function () {
    function getEngine() {
        return window.COMBAT || {};
    }

    function esc(str) {
        const fn = getEngine().escapeHtml;
        if (fn) return fn(str);
        return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // ------------------------------------------------------------
    // 1. LIVE COMBAT ARENA BANNER UPDATER
    // ------------------------------------------------------------
    window.updateCombatArenaBanner = function () {
        const banner = document.getElementById('combat-arena-banner');
        const quickDock = document.getElementById('quick-command-dock');
        const momBox = document.getElementById('combat-momentum-container');
        if (momBox) momBox.style.display = 'none';
        if (!banner || !window.state || !window.state.player) return;

        const state = window.state;
        const enemy = state.currentEnemy;

        const storyScreen = document.getElementById('story-screen');
        if (!enemy) {
            banner.style.display = 'none';
            if (quickDock) quickDock.style.display = 'flex';
            if (storyScreen) storyScreen.classList.remove('in-combat-mode');
            return;
        }

        banner.style.display = 'grid';
        if (quickDock) quickDock.style.display = 'none';
        if (storyScreen) storyScreen.classList.add('in-combat-mode');

        const p = state.player;
        const pHpPct = Math.max(0, Math.min(100, Math.round((p.hp / Math.max(1, p.maxHp)) * 100)));
        const pMpPct = Math.max(0, Math.min(100, Math.round((p.mp / Math.max(1, p.maxMp)) * 100)));
        const eHpPct = Math.max(0, Math.min(100, Math.round((enemy.hp / Math.max(1, enemy.maxHp)) * 100)));

        const stanceMap = {
            water: { label: '🌊 المية (+20% تفادي)', color: '#00e5a0' },
            mountain: { label: '🏔️ الجبل (+35% دفاع)', color: '#f5c842' },
            wind: { label: '🌪️ الرياح (+15% هجوم)', color: '#38bdf8' }
        };
        const st = stanceMap[state.playerForm] || stanceMap.water;

        // Class specialty readout
        let classSpecHtml = '';
        if (p.class === 'Sword Immortal') {
            classSpecHtml = `<span class="arena-chip" style="border-color:#ffd700;color:#ffd700;">⚔️ نية: ${state.swordIntent || 0}/3</span>`;
        } else if (p.class === 'Medicine Cultivator') {
            classSpecHtml = `<span class="arena-chip" style="border-color:#00e5a0;color:#00e5a0;">💊 مرجل: ${state.cauldronEssence || 0}/4</span>`;
        } else if (p.class === 'Lancer') {
            classSpecHtml = `<span class="arena-chip" style="border-color:#ff8c00;color:#ff8c00;">🗡️ زعزعة: ${state.staggerCounter || 0}/2</span>`;
        } else if (p.class === 'Astrologer') {
            classSpecHtml = `<span class="arena-chip" style="border-color:#bf5fff;color:#bf5fff;">🌙 طالع: ${state.magicCombosCount || 0}/3</span>`;
        } else if (p.class === 'Desert Knight') {
            classSpecHtml = `<span class="arena-chip" style="border-color:#87ceeb;color:#87ceeb;">🛡️ درع -20%</span>`;
        }

        // Enemy telegraph intent badge
        const intentMap = {
            heavy: { label: '💥 نية العدو: ضربة ثقيلة ← صدها بالماء 🌊', color: '#ff4d4d' },
            fast: { label: '⚡ نية العدو: هجوم خاطف ← راوغه بالماء 🌊', color: '#f59e0b' },
            magic: { label: '🔮 نية العدو: سحر باطني ← اقطعه بالرياح 🌪️', color: '#c084fc' },
            guard: { label: '🛡️ نية العدو: دفاع صلب ← اكسره بالجبل 🏔️', color: '#60a5fa' },
            deflect: { label: '⚔️ نية العدو: ترقب وصد ← اكسره بالجبل 🏔️', color: '#fbbf24' },
            evade: { label: '💨 نية العدو: مراوغة ← حاصره بالرياح 🌪️', color: '#34d399' }
        };
        const intent = intentMap[enemy.nextMove] || { label: '👁️ العدو يترقب حركتك', color: '#cbd5e1' };

        const mom = Math.round(state.momentum || 0);
        const momColor = mom > 0 ? '#00e5a0' : (mom < 0 ? '#ff6b6b' : '#f5c842');
        const momText = mom >= 0 ? `+${mom}` : `${mom}`;

        const awkPct = Math.max(0, Math.min(100, Math.round(state.awakeningGauge || 0)));
        const isAwkReady = awkPct >= 100;

        const pSprite = esc(p.sprite || 'assets/sword_immortal_1778872325571.png');
        const eSprite = esc(enemy.sprite || 'assets/desert_ghoul_1778872388305.png');

        const activeFlow = (typeof getEngine().getStanceFlow === 'function')
            ? getEngine().getStanceFlow(state.activeStanceFlow)
            : null;
        const flowChip = activeFlow
            ? `<span class="arena-chip stance-flow-chip" style="border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,0.15);">⚡ ${esc(activeFlow.name)}</span>`
            : '';

        const vulnChip = (state.enemyVulnerableTurns || 0) > 0
            ? `<span class="arena-chip" style="border-color:#f59e0b;color:#f59e0b;background:rgba(245,158,11,0.2);font-weight:bold;">⚡ ثغرة مكشوفة (+40% ضرر)</span>`
            : '';

        banner.innerHTML = `
            <div class="arena-fighter-card player-card">
                <div class="arena-fighter-head">
                    <img src="${pSprite}" alt="${esc(p.name)}" class="arena-avatar" onerror="this.src='assets/avatar.png'">
                    <div class="arena-fighter-meta">
                        <div class="arena-fighter-name">${p.activeTitle ? `<span class="arena-title-tag">[${esc(p.activeTitle)}]</span> ` : ''}${esc(p.name)}</div>
                        <div class="arena-fighter-sub" style="color:${st.color};">${st.label}</div>
                    </div>
                </div>
                <div class="arena-bar-row">
                    <div class="arena-bar-label"><span>❤️ صحة</span><span class="tabular-nums">${Math.round(p.hp)}/${Math.round(p.maxHp)}</span></div>
                    <div class="arena-bar-track"><div class="arena-bar-fill hp-fill" style="width:${pHpPct}%"></div></div>
                </div>
                <div class="arena-bar-row">
                    <div class="arena-bar-label"><span>🌀 عزيمة</span><span class="tabular-nums">${Math.round(p.mp)}/${Math.round(p.maxMp)}</span></div>
                    <div class="arena-bar-track"><div class="arena-bar-fill mp-fill" style="width:${pMpPct}%"></div></div>
                </div>
                <div class="arena-bar-row">
                    <div class="arena-bar-label"><span style="color:#f59e0b;">🔥 تجلّي القدر</span><span class="tabular-nums" style="color:${isAwkReady ? '#ffd700;font-weight:900;' : '#cbd5e1'}">${isAwkReady ? 'جاهز ⚡' : `${awkPct}%`}</span></div>
                    <div class="arena-bar-track arena-awakening-track"><div class="arena-bar-fill arena-awakening-fill ${isAwkReady ? 'awakening-ready' : ''}" style="width:${awkPct}%"></div></div>
                </div>
                <div class="arena-chips-row">
                    <span class="arena-chip">🗡️ ${p.atk}</span>
                    <span class="arena-chip">🛡️ ${p.def}</span>
                    ${classSpecHtml}
                    ${flowChip}
                </div>
            </div>

            <div class="arena-vs-center">
                <div class="arena-turn-badge tabular-nums">جولة ${state.combatTurnCount || 1} · <span style="color:${momColor}">⚡زخم ${momText}</span></div>
                <button type="button" class="arena-speed-btn" onclick="window.toggleCombatSpeed()" title="تبديل سرعة المعركة">${state.combatSpeed === 2 ? '⚡ 2x خاطف' : '⚡ 1x عادي'}</button>
                <div class="arena-intent-badge" style="border-color:${intent.color};color:${intent.color};">${intent.label}</div>
            </div>

            <div class="arena-fighter-card enemy-card">
                <div class="arena-fighter-head">
                    <img src="${eSprite}" alt="${esc(enemy.name)}" class="arena-avatar enemy-avatar" onerror="this.src='assets/desert_ghoul_1778872388305.png'">
                    <div class="arena-fighter-meta">
                        <div class="arena-fighter-name" style="color:var(--danger);">${esc(enemy.name)}</div>
                        <div class="arena-fighter-sub">${enemy.isTowerBoss ? '👑 زعيم البرج' : enemy.isTowerGuardian ? '🗼 حارس البرج' : '⚔️ خصم المعركة'}</div>
                    </div>
                </div>
                <div class="arena-bar-row">
                    <div class="arena-bar-label"><span>💀 صحة الخصم</span><span class="tabular-nums">${Math.round(enemy.hp)}/${Math.round(enemy.maxHp)}</span></div>
                    <div class="arena-bar-track"><div class="arena-bar-fill enemy-hp-fill" style="width:${eHpPct}%"></div></div>
                </div>
                <div class="arena-chips-row">
                    <span class="arena-chip">⚔️ ${enemy.atk}</span>
                    <span class="arena-chip">🛡️ ${enemy.def !== undefined ? enemy.def : 5}</span>
                    ${state.enemyStaggered ? '<span class="arena-chip" style="border-color:#ffcc00;color:#ffcc00;">⚡ مترنح!</span>' : ''}
                    ${vulnChip}
                </div>
            </div>
        `;
    };

    window.toggleCombatSpeed = function () {
        if (!window.state) return;
        window.state.combatSpeed = window.state.combatSpeed === 2 ? 1 : 2;
        if (typeof showToast === 'function') {
            showToast(window.state.combatSpeed === 2 ? '⚡ تم تفعيل سرعة المعارك الخاطفة (2x)!' : '⚡ تم تفعيل سرعة المعارك العادية (1x)!');
        }
        if (typeof window.updateCombatArenaBanner === 'function') {
            window.updateCombatArenaBanner();
        }
    };

    // ------------------------------------------------------------
    // 2. TOWER OF ETERNITY (برج السراب الخالد)
    // ------------------------------------------------------------
    window.showTowerOfEternityScreen = function () {
        if (!window.state || !window.state.player) return;
        const state = window.state;
        if (state.currentEnemy) {
            if (typeof showToast === 'function') showToast('أكمل معركتك الحالية أولاً يا بطل! ⚔️');
            return;
        }

        if (typeof showScreen === 'function') showScreen('story-screen');
        if (typeof window.highlightMobileTab === 'function') window.highlightMobileTab(2);
        if (typeof clearNarrative === 'function') clearNarrative();

        state.player.towerFloor = Math.max(1, Number(state.player.towerFloor) || 1);
        state.player.maxTowerFloor = Math.max(0, Number(state.player.maxTowerFloor) || 0);

        const cfg = getEngine().getTowerFloorConfig
            ? getEngine().getTowerFloorConfig(state.player.towerFloor, state.player.lvl || 1)
            : null;
        if (!cfg) return;

        const matNames = {
            spirit_herb: 'عشبة المانا',
            iron_ore: 'خام الحديد الدمشقي',
            monster_core: 'قلب وحش البراري',
            dragon_vein_shard: 'شظية عرق التنين',
            celestial_silk: 'حرير سماوي خالد'
        };

        const todayKey = new Date().toISOString().slice(0, 10);
        const canClaimTribute = state.player.maxTowerFloor > 0 && state.player.lastTowerTributeDate !== todayKey;
        const tributeGold = Math.max(50, state.player.maxTowerFloor * 85);

        const html = `
            <div style="background:rgba(5,8,12,0.92); border:1px solid var(--secondary); border-radius:10px; padding:18px; text-align:right;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,215,0,0.2); padding-bottom:10px; margin-bottom:12px;">
                    <h3 style="margin:0; color:var(--secondary); font-size:1.35rem;">🗼 برج السراب الخالد (100 طابق)</h3>
                    <span class="tabular-nums" style="color:var(--jade); font-weight:bold; font-size:0.9rem;">أعلى طابق مطوي: ${state.player.maxTowerFloor} / 100</span>
                </div>
                <p style="color:var(--text-dim); font-size:0.92rem; margin-bottom:14px;">
                    يرتفع برج السراب وسط عواصف الربع الخالي. كل طابق الخامس يحرسه زعيم أسطوري يمنح غنائم مضاعفة ومواد صقل نادرة!
                </p>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:12px;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px;">
                        <div style="color:var(--secondary); font-weight:bold; margin-bottom:6px;">⚔️ التحدي القادم: الطابق ${cfg.floor} ${cfg.isBoss ? '👑 (طابق زعيم!)' : ''}</div>
                        <div style="font-size:0.9rem; color:#fff; margin-bottom:4px;">الحارس: <b>${esc(cfg.enemy.name)}</b></div>
                        <div class="tabular-nums" style="font-size:0.82rem; color:var(--text-dim);">
                            ❤️ صحة: ${cfg.enemy.maxHp} · 🗡️ هجوم: ${cfg.enemy.atk} · 🛡️ دفاع: ${cfg.enemy.def}
                        </div>
                    </div>
                    <div style="background:rgba(0,229,160,0.04); border:1px solid rgba(0,229,160,0.25); border-radius:8px; padding:12px;">
                        <div style="color:var(--jade); font-weight:bold; margin-bottom:6px;">🎁 غنائم الفتح المضمونة</div>
                        <div class="tabular-nums" style="font-size:0.88rem; color:#fff;">
                            💰 <b>${cfg.rewards.gold}</b> دينار ذهبي · ✨ <b>${cfg.rewards.xp}</b> خبرة
                        </div>
                        <div style="font-size:0.84rem; color:var(--secondary); margin-top:4px;">
                            📦 خامة مضمونة: <b>${matNames[cfg.rewards.guaranteedMaterial] || cfg.rewards.guaranteedMaterial} ×${cfg.rewards.materialCount}</b>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof narrate === 'function') narrate(html, 'حارس برج السراب', null, false, true);

        const choices = [
            {
                text: `⚔️ اقتحام الطابق ${cfg.floor} ومنازلة ${cfg.enemy.name}`,
                callback: () => {
                    if (typeof startCombat === 'function') {
                        state._activeTowerRewards = cfg.rewards;
                        startCombat(cfg.enemy);
                    }
                }
            }
        ];

        if (canClaimTribute) {
            choices.push({
                text: `🏆 استلام خراج البرج اليومي (+${tributeGold} ذهب و +2 عشبة المانا)`,
                callback: () => {
                    state.player.lastTowerTributeDate = todayKey;
                    state.player.gold = (state.player.gold || 0) + tributeGold;
                    if (!state.player.inventory.materials) state.player.inventory.materials = {};
                    state.player.inventory.materials.spirit_herb = (state.player.inventory.materials.spirit_herb || 0) + 2;
                    if (typeof updateTopBar === 'function') updateTopBar();
                    if (typeof saveGame === 'function') saveGame();
                    if (typeof showToast === 'function') showToast(`تم استلام خراج البرج: +${tributeGold} ذهب!`);
                    window.showTowerOfEternityScreen();
                }
            });
        }

        if (state.player.towerFloor > 1) {
            choices.push({
                text: `🔄 إعادة التحدي من الطابق ${Math.max(1, state.player.towerFloor - 1)} للتدريب وجمع الغنائم`,
                callback: () => {
                    state.player.towerFloor = Math.max(1, state.player.towerFloor - 1);
                    window.showTowerOfEternityScreen();
                }
            });
        }

        choices.push({ text: '↩ عودة إلى واحة القوافل الكبرى', callback: () => { if (typeof hubLoop === 'function') hubLoop(); } });
        if (typeof setChoices === 'function') setChoices(choices);
    };

    // ------------------------------------------------------------
    // 3. HALL OF ACHIEVEMENTS & HEROIC TITLES (ديوان الألقاب والإنجازات)
    // ------------------------------------------------------------
    window.showAchievementsScreen = function () {
        if (!window.state || !window.state.player) return;
        const state = window.state;
        if (state.currentEnemy) {
            if (typeof showToast === 'function') showToast('أكمل معركتك الحالية أولاً! ⚔️');
            return;
        }

        if (typeof showScreen === 'function') showScreen('story-screen');
        if (typeof clearNarrative === 'function') clearNarrative();

        const engine = getEngine();
        const catalog = engine.ACHIEVEMENTS_CATALOG || [];
        const evalRes = engine.evaluateAchievements ? engine.evaluateAchievements(state) : { unlockedIds: [], totalBonus: { atk: 0, def: 0, hp: 0, mp: 0 } };
        if (typeof calculateTotalStats === 'function') calculateTotalStats();
        if (typeof updateTopBar === 'function') updateTopBar();

        const unlockedCount = evalRes.unlockedIds.length;
        const tb = evalRes.totalBonus;

        let cardsHtml = '';
        catalog.forEach(ach => {
            const isUnlocked = evalRes.unlockedIds.includes(ach.id);
            const isEquipped = state.player.activeTitle === ach.title;
            cardsHtml += `
                <div style="background:${isUnlocked ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isEquipped ? 'var(--jade)' : isUnlocked ? 'var(--secondary)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:10px 12px; text-align:right;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <b style="color:${isUnlocked ? 'var(--secondary)' : 'var(--text-dim)'}; font-size:0.95rem;">
                            ${isUnlocked ? '🏆' : '🔒'} ${esc(ach.title)}
                        </b>
                        <span style="font-size:0.75rem; color:${isEquipped ? 'var(--jade)' : isUnlocked ? '#fff' : 'var(--text-dim)'};">
                            ${isEquipped ? '✓ اللقب المجهز حالياً' : isUnlocked ? 'مفتوح' : 'قيد السعي'}
                        </span>
                    </div>
                    <div style="font-size:0.82rem; color:var(--text); margin-bottom:4px;">${esc(ach.desc)}</div>
                    <div style="font-size:0.78rem; color:var(--jade); font-weight:bold;">البركة الدائمة: ${esc(ach.bonusText)}</div>
                </div>
            `;
        });

        const html = `
            <div style="background:rgba(5,8,12,0.92); border:1px solid var(--glass-border); border-radius:10px; padding:16px; text-align:right;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,215,0,0.2); padding-bottom:10px; margin-bottom:12px;">
                    <h3 style="margin:0; color:var(--secondary); font-size:1.3rem;">🏆 ديوان الألقاب والإنجازات الخالدة</h3>
                    <span class="tabular-nums" style="color:var(--jade); font-weight:bold;">الألقاب المفتوحة: ${unlockedCount} / ${catalog.length}</span>
                </div>
                <div style="background:rgba(0,229,160,0.06); border:1px solid rgba(0,229,160,0.25); border-radius:6px; padding:10px; margin-bottom:12px; font-size:0.85rem;">
                    <b>إجمالي البركات الدائمة المضافة لبطلك:</b>
                    <span class="tabular-nums" style="color:var(--secondary); margin-right:8px;">
                        🗡️ +${tb.atk} هجوم · 🛡️ +${tb.def} دفاع · ❤️ +${tb.hp} صحة · 🌀 +${tb.mp} عزيمة
                    </span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
                    ${cardsHtml}
                </div>
            </div>
        `;

        if (typeof narrate === 'function') narrate(html, 'ديوان الألقاب', null, false, true);

        const choices = [];
        catalog.forEach(ach => {
            if (evalRes.unlockedIds.includes(ach.id) && state.player.activeTitle !== ach.title) {
                choices.push({
                    text: `👑 تتويج البطل بلقب «${ach.title}»`,
                    callback: () => {
                        state.player.activeTitle = ach.title;
                        if (typeof updateTopBar === 'function') updateTopBar();
                        if (typeof saveGame === 'function') saveGame();
                        if (typeof showToast === 'function') showToast(`تم تجهيز اللقب: «${ach.title}»!`);
                        window.showAchievementsScreen();
                    }
                });
            }
        });

        choices.push({ text: '↩ عودة إلى واحة القوافل الكبرى', callback: () => { if (typeof hubLoop === 'function') hubLoop(); } });
        if (typeof setChoices === 'function') setChoices(choices);
    };

    // ------------------------------------------------------------
    // 4. DAILY ROYAL BOUNTIES (ديوان التكليفات السلطانية)
    // ------------------------------------------------------------
    window.showDailyBountiesScreen = function () {
        if (!window.state || !window.state.player) return;
        const state = window.state;
        if (typeof showScreen === 'function') showScreen('story-screen');
        if (typeof clearNarrative === 'function') clearNarrative();

        if (!state.player.bountiesClaimed) state.player.bountiesClaimed = {};
        const today = new Date().toISOString().slice(0, 10);

        const bounties = [
            {
                id: `bounty_hunt_${today}`,
                title: 'تأمين قوافل الحرير',
                desc: 'خُض معركة ظافرة أو تتابع استكشاف (1 على الأقل).',
                ready: (state.player.kills || 0) >= 1 || (state.exploreStreak || 0) >= 1 || (state.player.maxTowerFloor || 0) >= 1,
                gold: 250,
                xp: 120
            },
            {
                id: `bounty_tower_${today}`,
                title: 'استكشاف برج السراب',
                desc: 'افتح أو طوِ الطابق الأول من برج السراب الخالد.',
                ready: (state.player.maxTowerFloor || 0) >= 1,
                gold: 400,
                xp: 200
            },
            {
                id: `bounty_cultivate_${today}`,
                title: 'تزكية النفس والارتقاء',
                desc: 'وصل إلى المستوى 2 أو أعلى في رحلة السلوك.',
                ready: (state.player.lvl || 1) >= 2,
                gold: 350,
                xp: 180
            }
        ];

        let listHtml = '';
        bounties.forEach(b => {
            const claimed = !!state.player.bountiesClaimed[b.id];
            listHtml += `
                <div style="background:rgba(255,255,255,0.03); border:1px solid ${claimed ? 'rgba(0,229,160,0.3)' : 'rgba(255,215,0,0.2)'}; border-radius:8px; padding:12px; margin-bottom:8px; text-align:right;">
                    <div style="display:flex; justify-content:space-between;">
                        <b style="color:var(--secondary);">${esc(b.title)}</b>
                        <span style="color:${claimed ? 'var(--jade)' : b.ready ? '#ffd700' : 'var(--text-dim)'}; font-size:0.8rem;">
                            ${claimed ? '✓ تم استلام المكافأة' : b.ready ? '🌟 جاهز للاستلام!' : '⏳ قيد الإنجاز'}
                        </span>
                    </div>
                    <div style="font-size:0.84rem; color:var(--text); margin:4px 0;">${esc(b.desc)}</div>
                    <div class="tabular-nums" style="font-size:0.8rem; color:var(--jade);">المكافأة: +${b.gold} ذهب · +${b.xp} خبرة</div>
                </div>
            `;
        });

        if (typeof narrate === 'function') {
            narrate(`<div style="text-align:right;"><h3 style="color:var(--secondary); margin-bottom:10px;">📜 ديوان التكليفات السلطانية اليومية</h3>${listHtml}</div>`, 'النظام', null, false, true);
        }

        const choices = [];
        bounties.forEach(b => {
            if (b.ready && !state.player.bountiesClaimed[b.id]) {
                choices.push({
                    text: `🎁 استلام مكافأة «${b.title}» (+${b.gold} ذهب و +${b.xp} خبرة)`,
                    callback: () => {
                        state.player.bountiesClaimed[b.id] = true;
                        state.player.gold = (state.player.gold || 0) + b.gold;
                        state.player.xp = (state.player.xp || 0) + b.xp;
                        if (typeof calculateTotalStats === 'function') calculateTotalStats();
                        if (typeof updateTopBar === 'function') updateTopBar();
                        if (typeof saveGame === 'function') saveGame();
                        if (typeof showToast === 'function') showToast(`تم استلام مكافأة التكليف: +${b.gold} ذهب!`);
                        window.showDailyBountiesScreen();
                    }
                });
            }
        });

        choices.push({ text: '↩ عودة إلى واحة القوافل الكبرى', callback: () => { if (typeof hubLoop === 'function') hubLoop(); } });
        if (typeof setChoices === 'function') setChoices(choices);
    };

    // ------------------------------------------------------------
    // 4.5 STORY CHAPTERS & EPIC SAGAS HUB (فصول القصة والملاحم البطولية)
    // ------------------------------------------------------------
    window.showStoryAndSagasScreen = function () {
        if (!window.state || !window.state.player) return;
        const state = window.state;
        if (typeof showScreen === 'function') showScreen('story-screen');
        if (typeof clearNarrative === 'function') clearNarrative();

        const compass = (window.STORY && typeof window.STORY.getStoryCompass === 'function')
            ? window.STORY.getStoryCompass(state)
            : { act: 1, chapterTitle: 'الفصل الأول: صحوة الأسطورة', questTitle: 'بدء مسيرة البطل', summary: 'تقدم في رحلتك البطولية عبر طريق الحرير.', nextNode: 'act1_intro', reqLevel: 1, isReady: true };

        const flags = state.storyFlags || {};
        const sagas = [
            {
                id: 'saga_antarah',
                title: '🦅 ملحمة عنترة بن شداد (وادي العبسيين)',
                done: !!flags['saga_antarah_done']
            },
            {
                id: 'saga_forge_start',
                title: '⚒️ سر ورشة صقل الفولاذ الدمشقي المفقودة',
                done: !!flags['saga_forge_done']
            },
            {
                id: 'saga_sufi_start',
                title: '🧘 محنة شيخ الطريقة الأكبر في جبل قاف',
                done: !!flags['saga_sufi_done']
            },
            {
                id: 'act6_intro',
                title: '🌊 الفصل السادس: إمبراطورية الجان ومدينة النحاس',
                done: !!flags['act6_complete']
            }
        ];

        const html = `
            <div style="background:rgba(5,8,12,0.94); border:1px solid var(--secondary); border-radius:10px; padding:10px 12px; text-align:right;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; border-bottom:1px solid rgba(255,215,0,0.2); padding-bottom:6px; margin-bottom:8px;">
                    <h3 style="margin:0; color:var(--secondary); font-size:1.02rem;">📖 ديوان الحبكة والملاحم البطولية</h3>
                    <span style="color:var(--jade); font-weight:bold; font-size:0.76rem;">${esc(compass.chapterTitle)}</span>
                </div>
                <div style="background:linear-gradient(135deg, rgba(212,175,55,0.14), rgba(0,229,160,0.08)); border:1px solid rgba(212,175,55,0.4); border-radius:8px; padding:8px 10px;">
                    <div style="color:#ffd700; font-weight:bold; font-size:0.86rem; margin-bottom:3px;">🧭 المهمة الحالية: ${esc(compass.questTitle)}</div>
                    <div style="color:var(--text); font-size:0.78rem; line-height:1.4;">${esc(compass.summary)}</div>
                    ${!compass.isReady && compass.nextNode ? `<div style="color:#fbbf24; font-size:0.74rem; margin-top:4px;">⚡ نصيحة شهرزاد: المستوى الموصى به ${compass.reqLevel} (مستواك الحالي ${state.player.lvl || 1}) — يمكنك خوض الفصل الآن أو التدرب أولاً.</div>` : ''}
                </div>
            </div>
        `;

        if (typeof narrate === 'function') narrate(html, null, null, false, true);

        const launchStoryNode = (nodeId) => {
            if (!window.STORY || typeof window.STORY.runNode !== 'function') return;
            clearNarrative();
            window.STORY.runNode(nodeId, state, narrate, setChoices, (result) => {
                if (result === 'combat' && state.pendingCombatEnemy) {
                    const enemy = window.LORE ? window.LORE.getAllEnemies()[state.pendingCombatEnemy] : null;
                    state.pendingCombatEnemy = null;
                    if (enemy && typeof startCombat === 'function') {
                        const scaledStoryEnemy = {
                            ...enemy,
                            hp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 1.8)),
                            maxHp: Math.floor(enemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 1.8)),
                            atk: Math.floor(enemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(state.player.lvl, state.player.lvl) : 1.5)),
                            def: Math.floor((enemy.baseDef || 5) * (1.2 + state.player.lvl * 0.3))
                        };
                        startCombat(scaledStoryEnemy);
                        return;
                    }
                }
                if (window.QUESTS) window.QUESTS.updateQuests(state);
                if (window.SKILLS) window.SKILLS.checkUnlocks(state);
                if (typeof saveGame === 'function') saveGame();
                if (typeof hubLoop === 'function') hubLoop();
            });
        };

        const choices = [];
        if (compass.nextNode) {
            choices.push({
                text: `🌟 متابعة القصة الرئيسية: ${compass.questTitle}`,
                recommended: true,
                callback: () => launchStoryNode(compass.nextNode)
            });
        }
        sagas.forEach(s => {
            choices.push({
                text: `${s.done ? '✓ ' : '⚔️ '}${s.title}`,
                callback: () => launchStoryNode(s.id)
            });
        });
        choices.push({
            text: '↩ العودة إلى واحة القوافل الكبرى',
            callback: () => { if (typeof hubLoop === 'function') hubLoop(); }
        });

        if (typeof setChoices === 'function') setChoices(choices);
    };
    window.showStoryChaptersScreen = window.showStoryAndSagasScreen;

    // ------------------------------------------------------------
    // 5. SECURE INLINE SAVE MANAGER (NO alert/prompt/confirm!)
    // ------------------------------------------------------------
    function showSaveFeedback(msg, isError = false) {
        const fb = document.getElementById('save-manager-feedback');
        if (fb) {
            fb.style.display = 'block';
            fb.style.color = isError ? 'var(--danger)' : 'var(--jade)';
            fb.textContent = msg;
        }
        if (typeof showToast === 'function') showToast(msg);
    }

    window.exportSaveData = function () {
        if (!window.state) {
            showSaveFeedback('لا توجد بيانات بطل للتصدير حالياً!', true);
            return;
        }
        try {
            const createFn = getEngine().createSignedSaveToken;
            const code = createFn
                ? createFn(window.state)
                : btoa(unescape(encodeURIComponent(JSON.stringify(window.state))));
            const box = document.getElementById('save-code-textarea');
            if (box) {
                box.style.display = 'block';
                box.value = code;
                box.select();
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).catch(() => {});
            }
            showSaveFeedback('📋 تم توليد ونسخ شفرة الحفظ المختومة أمنياً (LEGEND_V2) بنجاح!');
        } catch (e) {
            showSaveFeedback('فشل تصدير البيانات: ' + (e.message || e), true);
        }
    };

    window.importSaveData = function () {
        const box = document.getElementById('save-code-textarea');
        if (!box) return;
        if (box.style.display === 'none' || !box.value.trim()) {
            box.style.display = 'block';
            box.placeholder = 'الصق شفرة الحفظ المختومة (LEGEND_V2...) هنا ثم اضغط على زر الاستيراد مرة أخرى...';
            box.focus();
            showSaveFeedback('📥 الصق شفرة الحفظ في المربع النصي أدناه ثم اضغط "استيراد الحفظ" للتأكيد.');
            return;
        }
        const verifyFn = getEngine().parseAndVerifySaveToken;
        const result = verifyFn
            ? verifyFn(box.value)
            : { valid: false, error: 'محرك التحقق الأمني غير جاهز.' };
        if (!result.valid) {
            showSaveFeedback('⚠️ ' + result.error, true);
            return;
        }
        window.state = Object.assign(window.state || {}, result.state);
        if (typeof window.validateState === 'function') window.validateState();
        if (typeof window.calculateTotalStats === 'function') window.calculateTotalStats();
        if (typeof window.updateTopBar === 'function') window.updateTopBar();
        if (typeof window.saveGame === 'function') window.saveGame();
        showSaveFeedback('🌟 تم التحقق من التوقيع الأمني واستيراد بيانات البطل بنجاح!');
        setTimeout(() => {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.remove('active');
            if (typeof window.hubLoop === 'function') window.hubLoop();
        }, 700);
    };

    let resetArmedUntil = 0;
    window.confirmResetGame = function () {
        const now = Date.now();
        if (now > resetArmedUntil) {
            resetArmedUntil = now + 6000;
            showSaveFeedback('⚠️ تأكيد الأمان: اضغط على "مسح البيانات" مرة ثانية خلال 6 ثوانٍ لتأكيد المسح النهائي!', true);
            return;
        }
        resetArmedUntil = 0;
        localStorage.removeItem('legend_rpg_state');
        localStorage.removeItem('rpg_player_id');
        showSaveFeedback('💀 تم مسح بيانات التقدم المحفوظة. جاري إعادة التهيئة...');
        setTimeout(() => window.location.reload(), 500);
    };

    // ------------------------------------------------------------
    // 6. KEYBOARD SHORTCUTS (1-9 choices, Escape / P pause)
    // ------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            if (typeof window.toggleSettingsModal === 'function') {
                e.preventDefault();
                window.toggleSettingsModal();
            }
            return;
        }

        // Number keys 1..9 trigger active choice buttons
        if (/^[1-9]$/.test(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            const btn = document.getElementById(`choice-btn-${idx}`);
            if (btn && btn.offsetParent !== null) {
                e.preventDefault();
                btn.click();
            }
        }
    });
})();
