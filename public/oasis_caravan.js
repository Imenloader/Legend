// ============================================================================
// SHADOW REALM CHRONICLES — OASIS DEVELOPMENT & GRID CARAVAN ENGINE
// ============================================================================

window.OASIS_CARAVAN = {
    // 1. Core State Initialization
    init(state) {
        if (!state) return;
        
        // Oasis state
        state.oasis = state.oasis || {
            buildings: { well: 0, garden: 0, forge: 0 },
            resources: { water: 15, herbs: 5, ore: 5 }
        };

        // Caravan exploration state
        state.caravan = state.caravan || {
            x: 3,
            y: 3,
            resWater: 20,
            resDates: 20,
            maxWater: 40,
            maxDates: 40,
            map: [],
            resuppliedCount: 0
        };

        // Time Clock & Weather Cycle
        state.dayTime = state.dayTime !== undefined ? state.dayTime : 8; // Start at 8 AM
        state.weather = state.weather || 'clear'; // clear, sandstorm, heatwave
        state.logbookPage = state.logbookPage || 0;

        // Initialize grid map if empty
        if (!state.caravan.map || state.caravan.map.length === 0) {
            this.generateMap(state);
        }
    },

    // 2. Map Generation (7x7 tictactoe-like wilderness grid)
    generateMap(state) {
        const grid = [];
        const size = 7;
        
        // Types: sand (empty), well (water), oasis (treasures), shrine (stat boost), bandit (combat encounter)
        const typesPool = [
            'well', 'well', 'well', 'well',
            'oasis', 'oasis', 'oasis', 'oasis',
            'shrine', 'shrine', 'shrine',
            'bandit', 'bandit', 'bandit', 'bandit', 'bandit', 'bandit'
        ];

        // Shuffle helper
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };
        shuffle(typesPool);

        let poolIndex = 0;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let cellType = 'sand';
                
                // Keep the starting node at center (3,3) clear and empty
                if (x === 3 && y === 3) {
                    grid.push({ x, y, type: 'sand', cleared: true, discovered: true });
                    continue;
                }

                // 40% chance of an interesting encounter cell
                if (Math.random() < 0.40 && poolIndex < typesPool.length) {
                    cellType = typesPool[poolIndex++];
                }

                grid.push({
                    x,
                    y,
                    type: cellType,
                    cleared: false,
                    discovered: false
                });
            }
        }
        state.caravan.map = grid;
    },

    // 3. Heartbeat Loop Ticks (Called dynamically every active tick in game.js)
    processTicks(state) {
        this.init(state);

        // A. Passive Resource gathering based on building levels
        const b = state.oasis.buildings;
        const res = state.oasis.resources;

        if (b.well > 0) {
            res.water = Math.min(200, res.water + (b.well * 0.4));
        }
        if (b.garden > 0) {
            res.herbs = Math.min(100, res.herbs + (b.garden * 0.2));
        }
        if (b.forge > 0) {
            res.ore = Math.min(100, res.ore + (b.forge * 0.1));
        }

        // Round resources nicely to 1 decimal place
        res.water = parseFloat(res.water.toFixed(1));
        res.herbs = parseFloat(res.herbs.toFixed(1));
        res.ore = parseFloat(res.ore.toFixed(1));

        // B. Day / Night Clock Progress
        state.dayTime = (state.dayTime + 1) % 24;

        // C. Weather dynamics (5% chance of weather shifts)
        if (Math.random() < 0.05) {
            const roll = Math.random();
            if (roll < 0.6) state.weather = 'clear';
            else if (roll < 0.85) {
                state.weather = 'sandstorm';
                if (window.showToast) window.showToast("💨 تحذير: هبت عاصفة رملية عاتية تحجب الرؤية في الصحراء!");
            } else {
                state.weather = 'heatwave';
                if (window.showToast) window.showToast("☀️ تحذير: بدأت موجة حر لاهبة تصهر الرمال والحديد!");
            }
        }

        // D. Random Oasis Bandit Raid (1.5% chance per tick if player has buildings and is in Act 2+)
        if (Math.random() < 0.015 && (b.well > 0 || b.garden > 0 || b.forge > 0) && (state.storyFlags || {})['act2_started']) {
            this.triggerAmbushOasisRaid(state);
        }
    },

    // 4. Trigger Random Oasis Bandit Raid
    triggerAmbushOasisRaid(state) {
        if (state.currentEnemy) return; // Do not interrupt existing fights

        const b = state.oasis.buildings;
        const res = state.oasis.resources;
        
        // Randomly damage building or steal resources
        const lostWater = Math.floor(res.water * 0.3);
        const lostHerbs = Math.floor(res.herbs * 0.3);
        
        res.water = Math.max(0, res.water - lostWater);
        res.herbs = Math.max(0, res.herbs - lostHerbs);

        const raidEnemy = {
            name: "زعيم قطاع الطرق المغيرين",
            baseHp: 180,
            baseAtk: 22,
            baseDef: 12,
            sprite: "", 
            dialogue: "⚔️ هاها! واحتك الدافئة مليئة بالمياه العذبة والذهب! سنأخذ كل شيء ونهدم بئرك الفخم!"
        };

        const scaledEnemy = {
            ...raidEnemy,
            hp: Math.floor(raidEnemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 2)),
            maxHp: Math.floor(raidEnemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(state.player.lvl, state.player.lvl) : 2)),
            atk: Math.floor(raidEnemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(state.player.lvl, state.player.lvl) : 1.8)),
            def: Math.floor(raidEnemy.baseDef * (1.2 + state.player.lvl * 0.3))
        };

        if (window.showScreen) window.showScreen('story-screen');
        if (window.narrate) {
            window.narrate(`🚨 <b>إنذار غزو الواحة!</b><br>تسللت عصابة من لصوص الصحراء البدو لنهب واحتمك الدافئة! نجحوا في سرقة <span style="color:var(--secondary)">${lostWater} ماء</span> و <span style="color:var(--success)">${lostHerbs} أعشاب</span>، ويهددون بتدمير بئرك المبارك!`, "النظام");
            setTimeout(() => {
                if (window.startCombat) window.startCombat(scaledEnemy);
            }, 3000);
        }
    }
};

// ============================================================================
// GLOBAL CONTROLLERS & VIEW RENDERERS (Exported to global namespace)
// ============================================================================

// --- ⛺ OASIS SCREEN CONTROLLERS ---
window.showOasisScreen = function() {
    const s = window.state;
    window.OASIS_CARAVAN.init(s);
    window.showScreen('oasis-screen');

    const statsDiv = document.getElementById('oasis-stats');
    if (statsDiv) {
        const timeText = window.getDayTimeLabel(s.dayTime);
        const weatherText = window.getWeatherLabel(s.weather);
        
        statsDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>🕒 الوقت الباطني: <b style="color:var(--secondary);">${timeText}</b></span>
                <span>🌤️ الطقس الجوي: <b style="color:#00e5a0;">${weatherText}</b></span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9rem; color:var(--text-dim);">
                <span>🚰 إمدادات مياه الواحة: <b style="color:#00ccff;">${s.oasis.resources.water} لتر</b></span>
                <span>🌿 الأعشاب المجمعة: <b style="color:#5cd65c;">${s.oasis.resources.herbs} وحدة</b></span>
                <span>🔨 خامات صلب الشهب: <b style="color:#d4af37;">${s.oasis.resources.ore} كجم</b></span>
            </div>
            <p style="font-size:0.75rem; color:var(--text-dim); margin-top:10px; text-align:right;">
                * الموارد والماء تزداد تلقائياً في الخلفية بمرور اللفات والوقت بناءً على مستويات ترقية منشآت الواحة الخاصة بك.
            </p>
        `;
    }

    // Update descriptives and levels
    const b = s.oasis.buildings;
    document.getElementById('well-level-desc').innerHTML = `المستوى الحالي: <b style="color:#00ccff;">${b.well}</b> (${(b.well * 0.4).toFixed(1)} لتر/نبضة) <br> ترقية: <b>${Math.floor(120 * Math.pow(2.1, b.well))} ذهب</b>`;
    document.getElementById('garden-level-desc').innerHTML = `المستوى الحالي: <b style="color:#5cd65c;">${b.garden}</b> (${(b.garden * 0.2).toFixed(1)} عشبة/نبضة) <br> ترقية: <b>${Math.floor(140 * Math.pow(2.1, b.garden))} ذهب</b>`;
    document.getElementById('forge-level-desc').innerHTML = `المستوى الحالي: <b style="color:#d4af37;">${b.forge}</b> (${(b.forge * 0.1).toFixed(1)} حديد/نبضة) <br> ترقية: <b>${Math.floor(160 * Math.pow(2.1, b.forge))} ذهب</b>`;
};

window.upgradeOasisBuilding = function(type) {
    const s = window.state;
    const b = s.oasis.buildings;
    const currentLvl = b[type] || 0;
    
    // Scale costs
    const basePrices = { well: 120, garden: 140, forge: 160 };
    const cost = Math.floor(basePrices[type] * Math.pow(2.1, currentLvl));

    if (s.player.gold >= cost) {
        s.player.gold -= cost;
        b[type] = currentLvl + 1;
        
        if (window.showToast) window.showToast(`✨ تم ترقية البناء بنجاح! لفل ${b[type]}`);
        if (window.triggerFlash) window.triggerFlash('heal');
        
        window.calculateTotalStats();
        window.updateTopBar();
        window.saveGame();
        window.showOasisScreen();
    } else {
        if (window.showToast) window.showToast("❌ ذهبك لا يكفي لترقية هذه المنشأة العظيمة!");
    }
};

// --- 🐪 CARAVAN SCREEN CONTROLLERS ---
window.showCaravanMapScreen = function() {
    const s = window.state;
    window.OASIS_CARAVAN.init(s);
    window.showScreen('caravan-screen');

    // Update HUD
    const hud = document.getElementById('caravan-hud');
    if (hud) {
        const timeText = window.getDayTimeLabel(s.dayTime);
        const weatherText = window.getWeatherLabel(s.weather);
        
        hud.innerHTML = `
            <div style="text-align:right;">
                🕒 الوقت: <b style="color:var(--secondary);">${timeText}</b> | 🌤️ الطقس: <b style="color:#00ccff;">${weatherText}</b>
            </div>
            <div style="text-align:left;">
                🎒 إمدادات القافلة: 🚰 <b style="color:#00ccff;">${s.caravan.resWater}/${s.caravan.maxWater} ماء</b> | 🌴 <b style="color:#ffd700;">${s.caravan.resDates}/${s.caravan.maxDates} تمر</b>
            </div>
        `;
    }

    // Render visual map grid
    const gridContainer = document.getElementById('caravan-grid-container');
    if (gridContainer) {
        gridContainer.innerHTML = '';
        const size = 7;
        const caravan = s.caravan;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = caravan.map.find(c => c.x === x && c.y === y);
                const tile = document.createElement('div');
                tile.style.aspectRatio = '1';
                tile.style.display = 'flex';
                tile.style.alignItems = 'center';
                tile.style.justifyContent = 'center';
                tile.style.fontSize = '1.3rem';
                tile.style.borderRadius = '4px';
                tile.style.background = 'rgba(255,255,255,0.05)';
                tile.style.border = '1px solid rgba(255,255,255,0.05)';
                tile.style.transition = 'all 0.2s';

                if (x === caravan.x && y === caravan.y) {
                    // Caravan current position
                    tile.textContent = '🐪';
                    tile.style.background = 'rgba(212,175,55,0.3)';
                    tile.style.border = '1.5px solid var(--secondary)';
                    tile.style.boxShadow = '0 0 10px #d4af37';
                } else if (!cell.discovered) {
                    // Fog of war
                    tile.textContent = '🌫️';
                    tile.style.background = 'rgba(0,0,0,0.4)';
                } else {
                    // Discovered cell
                    if (cell.type === 'sand') tile.textContent = '🏜️';
                    else if (cell.type === 'well') tile.textContent = cell.cleared ? '🕳️' : '🚰';
                    else if (cell.type === 'oasis') tile.textContent = cell.cleared ? '🍂' : '🌴';
                    else if (cell.type === 'shrine') tile.textContent = cell.cleared ? '🏛️' : '🕌';
                    else if (cell.type === 'bandit') tile.textContent = cell.cleared ? '💀' : '☠️';

                    tile.style.background = 'rgba(255,255,255,0.1)';
                    if (cell.type !== 'sand' && !cell.cleared) {
                        tile.style.boxShadow = 'inset 0 0 5px rgba(212,175,55,0.2)';
                    }
                }
                gridContainer.appendChild(tile);
            }
        }
    }
};

window.moveCaravan = function(dx, dy) {
    const s = window.state;
    const caravan = s.caravan;
    const nx = caravan.x + dx;
    const ny = caravan.y + dy;

    // Bounds checking
    if (nx < 0 || nx > 6 || ny < 0 || ny > 6) {
        window.logCaravanEvent("❌ عاصفة الرياح القاسية تمنع تقدم قافلتك أبعد من حدود الواحات المعروفة!");
        return;
    }

    // Resource check
    if (caravan.resWater < 1 || caravan.resDates < 1) {
        window.logCaravanEvent("<span style='color:var(--danger); font-weight:bold;'>🚨 نفذت المياه والتمور تماماً! يرفض البدو والجِمال التقدم ملمتراً واحداً. أعد تموين القافلة من الحقيبة!</span>");
        if (window.showToast) window.showToast("🚨 لا توجد إمدادات كافية للرحيل!");
        return;
    }

    // Move caravan
    caravan.x = nx;
    caravan.y = ny;
    caravan.resWater--;
    caravan.resDates--;

    // Discover new fog cell and adjacent tiles
    const size = 7;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const distance = Math.abs(x - nx) + Math.abs(y - ny);
            if (distance <= 1) {
                const cell = caravan.map.find(c => c.x === x && c.y === y);
                if (cell && !cell.discovered) {
                    cell.discovered = true;
                }
            }
        }
    }

    // Process new tile event
    const activeCell = caravan.map.find(c => c.x === nx && c.y === ny);
    if (activeCell && !activeCell.cleared) {
        if (activeCell.type === 'well') {
            activeCell.cleared = true;
            caravan.resWater = Math.min(caravan.maxWater, caravan.resWater + 15);
            window.logCaravanEvent("<span style='color:#00ccff; font-weight:bold;'>🚰 واحة بئر مهجور: عثرت على بئر مائي نقي وعذّب! ملأت 15 لتر ماء في قِرَب القافلة.</span>");
            if (window.triggerFlash) window.triggerFlash('heal');
        } else if (activeCell.type === 'oasis') {
            activeCell.cleared = true;
            s.player.gold += 120;
            s.oasis.resources.herbs += 15;
            window.logCaravanEvent("<span style='color:#5cd65c; font-weight:bold;'>🌴 الواحة المفقودة: عثرت على أشجار نخيل مثمرة وأعشاب نادرة مباركة! ربحت 120 دينار و 15 عشبة باطنية.</span>");
            if (window.triggerFlash) window.triggerFlash('gold');
        } else if (activeCell.type === 'shrine') {
            activeCell.cleared = true;
            s.player.maxHp += 20;
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 20);
            window.logCaravanEvent("<span style='color:#ffd700; font-weight:bold;'>🕌 ضريح الفارس القديم: باركت روح الفارس جسدك وزادت صحتك القصوى بشكل دائم (+20 صحة)!</span>");
            if (window.calculateTotalStats) window.calculateTotalStats();
        } else if (activeCell.type === 'bandit') {
            // Trigger combat ambush
            activeCell.cleared = true;
            window.logCaravanEvent("<span style='color:var(--danger); font-weight:bold;'>☠️ كمين قطاع الطرق! انقض عليك لصوص الصحراء من بين التلال لنهب القافلة!</span>");
            
            const banditEnemy = {
                name: "قاطع طريق الفيافي الجسور",
                baseHp: 150,
                baseAtk: 18,
                baseDef: 8,
                sprite: "",
                dialogue: "⚔️ قف مكانك! لن نترك قوافل الحرير تمر بسلام من غير جزية أو دماء!"
            };

            const scaledEnemy = {
                ...banditEnemy,
                hp: Math.floor(banditEnemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(s.player.lvl, s.player.lvl) : 1.8)),
                maxHp: Math.floor(banditEnemy.baseHp * (window.BALANCE ? window.BALANCE.enemyHpScale(s.player.lvl, s.player.lvl) : 1.8)),
                atk: Math.floor(banditEnemy.baseAtk * (window.BALANCE ? window.BALANCE.enemyAtkScale(s.player.lvl, s.player.lvl) : 1.5)),
                def: Math.floor(banditEnemy.baseDef * (1.2 + s.player.lvl * 0.3))
            };

            setTimeout(() => {
                if (window.showScreen) window.showScreen('story-screen');
                if (window.startCombat) window.startCombat(scaledEnemy);
            }, 1200);
            return;
        } else {
            window.logCaravanEvent("🏜️ تتقدم القافلة بهدوء وسلاسة عبر التلال الرملية القاحلة.");
        }
    } else {
        window.logCaravanEvent("🏜️ تسير القافلة في دروب رملية مكتشفة وآمنة وخالية من المتاعب.");
    }

    window.saveGame();
    window.showCaravanMapScreen();
};

window.resupplyCaravan = function() {
    const s = window.state;
    const caravan = s.caravan;

    // Thematic supply replenishment
    if (s.player.gold >= 40) {
        s.player.gold -= 40;
        caravan.resWater = caravan.maxWater;
        caravan.resDates = caravan.maxDates;
        window.logCaravanEvent("<span style='color:var(--success); font-weight:bold;'>🎒 تموين القافلة: اشتريت قِرَب ماء جديدة وسلال تمر تمر فاخر من سوق التقاطع وصحّحت الإمدادات بالكامل!</span>");
        if (window.showToast) window.showToast("🎒 تم التموين بالكامل!");
        window.updateTopBar();
        window.saveGame();
        window.showCaravanMapScreen();
    } else {
        if (window.showToast) window.showToast("❌ لا تملك 40 دينار ذهبي لتموين القافلة!");
    }
};

window.logCaravanEvent = function(msg) {
    const log = document.getElementById('caravan-event-log');
    if (log) {
        log.innerHTML += `<div>• ${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }
};

// --- Helper Formatting Functions ---
window.getDayTimeLabel = function(hour) {
    if (hour >= 5 && hour < 11) return "🌅 الفجر المبارك (تداوي مستمر)";
    if (hour >= 11 && hour < 17) return "☀️ النهار اللاهب (عطش متزايد)";
    if (hour >= 17 && hour < 21) return "🌇 الأصيل والغروب (سكينة التشي)";
    return "🌙 الليل القارس (تضاعف قوى السحر الباطني)";
};

window.getWeatherLabel = function(weather) {
    if (weather === 'sandstorm') return "💨 عاصفة رملية عاتية (+تفادي، -دقة)";
    if (weather === 'heatwave') return "🔥 موجة حر لاهبة";
    return "✨ جو صافٍ وصحو";
};


// --- 📜 DIWAN LOGBOOK SCREEN CONTROLLERS ---
const logbookPages = [
    `
======================================================
           🕌 ديوان حكايات البدو واليوميات المصورة 🕌
======================================================

              * الصفحة الأولى: البداية في البرزخ *

         .---.
        /     \\
        \\     /
   .  *  '---'  *  .
    \\           /
     '---------'
      
   لقد ولدتُ من جديد وورثتُ عهد الأجداد في معبر التقاطع.
   أريج الياسمين ورياح الصحراء يعيد كتابة مصيري المفقود.
   بين رمال الفيافي الشاسعة ودفاع الواحات العتيقة،
   أخط اليوم أولى خطواتي في هذا السفر الأسطوري الطاهر...
   
======================================================
[صفحة 1 من 3]
    `,
    `
======================================================
           🕌 ديوان حكايات البدو واليوميات المصورة 🕌
======================================================

            * الصفحة الثانية: النصل الأسطوري المفقود *

              /| ________________
        O|===|* >________________>
              \\|

   روى شيوخ قمة اليشم والرهبان عن سيف أسطوري مهيب،
   صُنع من حديد الشهب الباطني في غابر الأزمان.
   يقطع نوره عواصف الظلال ويطهر دماء الشياطين المارقة.
   أشحن نية سيفي وجسدي في خلوة الواحة الباطنية المباركة،
   لأكون جديراً بحمل إرث ارتقاء الخلود العظيم...
   
======================================================
[صفحة 2 من 3]
    `,
    `
======================================================
           🕌 ديوان حكايات البدو واليوميات المصورة 🕌
======================================================

          * الصفحة الثالثة: واحة التقاطع العظيمة *

             _  _
           ( \`/ )
           _\\_/_
         ( \`/ \` )
          '-|_|-'
            | |
           /   \\
          /_____\\

   الواحة ليست مجرد مياه ونخيل، بل هي موطن روحي الطاهر.
   بئر الروح النوراني وبستان الرياحين يحرسون عهد فرساني.
   كل شعلة ترقية، كل لقمة تمر وجرعة ماء تسير بقافلتنا
   أقرب لنهاية الأقدار السعيدة ولقاء المحنة الكبرى...
   
======================================================
[صفحة 3 من 3]
    `
];

window.showNomadLogbookScreen = function() {
    const s = window.state;
    window.OASIS_CARAVAN.init(s);
    window.showScreen('logbook-screen');
    window.renderLogbookContent();
};

window.renderLogbookContent = function() {
    const s = window.state || {};
    const pageIndex = parseInt(s.logbookPage) || 0;
    const div = document.getElementById('logbook-content');
    if (div) {
        div.textContent = logbookPages[pageIndex] || "تاريخ الصحراء لم يُكتب بعد...";
    }
};

window.prevLogbookPage = function() {
    console.log("prevLogbookPage clicked");
    const s = window.state || {};
    let pageIndex = parseInt(s.logbookPage) || 0;
    console.log("Current logbook page index:", pageIndex);
    if (pageIndex > 0) {
        s.logbookPage = pageIndex - 1;
        console.log("Decremented logbook page to:", s.logbookPage);
        if (window.saveGame) window.saveGame();
        window.renderLogbookContent();
    }
};

window.nextLogbookPage = function() {
    console.log("nextLogbookPage clicked");
    const s = window.state || {};
    let pageIndex = parseInt(s.logbookPage) || 0;
    console.log("Current logbook page index:", pageIndex);
    if (pageIndex < logbookPages.length - 1) {
        s.logbookPage = pageIndex + 1;
        console.log("Incremented logbook page to:", s.logbookPage);
        if (window.saveGame) window.saveGame();
        window.renderLogbookContent();
    }
};
