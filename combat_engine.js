// combat_engine.js – Pure combat, security, tower progression & achievement logic ES module

const w = typeof window !== 'undefined' ? window : globalThis;

// ============================================================
// 1. SECURITY, SANITIZATION & SAVE INTEGRITY
// ============================================================

const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

export function escapeHtml(input) {
    if (input === null || input === undefined) return '';
    return String(input).replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch] || ch);
}

export function sanitizePlayerName(rawName, fallback = 'البطل الفارس') {
    if (typeof rawName !== 'string') return fallback;
    const stripped = rawName.replace(/[<>'"&`\\]/g, '').trim().slice(0, 24);
    return stripped.length > 0 ? stripped : fallback;
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function safeDeepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    if (!target || typeof target !== 'object') return source;
    for (const key of Object.keys(source)) {
        if (FORBIDDEN_KEYS.has(key)) continue;
        const srcVal = source[key];
        const tgtVal = target[key];
        if (
            srcVal &&
            typeof srcVal === 'object' &&
            !Array.isArray(srcVal) &&
            tgtVal &&
            typeof tgtVal === 'object' &&
            !Array.isArray(tgtVal)
        ) {
            target[key] = safeDeepMerge(tgtVal, srcVal);
        } else if (Array.isArray(srcVal)) {
            target[key] = [...srcVal];
        } else {
            target[key] = srcVal;
        }
    }
    return target;
}

export function computeSaveSignature(payloadStr) {
    // Dual 32-bit FNV-1a hash with domain salt for tamper detection
    const salted = `LEGEND_SILK_ROAD_V2::${payloadStr}::IMMORTAL_SEAL`;
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < salted.length; i++) {
        const c = salted.charCodeAt(i);
        h1 ^= c;
        h1 = Math.imul(h1, 0x01000193) >>> 0;
        h2 ^= (c + (i & 0xff));
        h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

function encodeUtf8Base64(str) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'utf8').toString('base64');
    }
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeUtf8Base64(b64) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(b64, 'base64').toString('utf8');
    }
    return decodeURIComponent(escape(atob(b64)));
}

export function sanitizeSaveState(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { valid: false, error: 'بيانات الحفظ ليست كائناً صالحاً.' };
    }
    if (!parsed.player || typeof parsed.player !== 'object') {
        return { valid: false, error: 'ملف الحفظ يفتقد بيانات البطل الأساسية.' };
    }
    const clean = safeDeepMerge({}, parsed);
    clean.player.name = sanitizePlayerName(clean.player.name);
    const clampNum = (v, min, max, def) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return def;
        return Math.max(min, Math.min(max, Math.floor(n)));
    };
    clean.player.lvl = clampNum(clean.player.lvl, 1, 999, 1);
    clean.player.maxHp = clampNum(clean.player.maxHp, 50, 9999999, 200);
    clean.player.hp = clampNum(clean.player.hp, 1, clean.player.maxHp, clean.player.maxHp);
    clean.player.maxMp = clampNum(clean.player.maxMp, 20, 9999999, 80);
    clean.player.mp = clampNum(clean.player.mp, 0, clean.player.maxMp, clean.player.maxMp);
    clean.player.gold = clampNum(clean.player.gold, 0, 999999999, 50);
    clean.player.karma = clampNum(clean.player.karma, -100, 100, 0);
    clean.player.xp = clampNum(clean.player.xp, 0, 999999999, 0);
    clean.player.maxXp = clampNum(clean.player.maxXp, 50, 999999999, 100);
    clean.player.towerFloor = clampNum(clean.player.towerFloor, 1, 500, 1);
    clean.player.maxTowerFloor = clampNum(clean.player.maxTowerFloor, 0, 500, 0);
    clean.player.bossKills = clampNum(clean.player.bossKills, 0, 999999, 0);
    clean.player.kills = clampNum(clean.player.kills, 0, 999999, 0);
    if (clean.player.activeTitle && typeof clean.player.activeTitle === 'string') {
        clean.player.activeTitle = clean.player.activeTitle.replace(/[<>'"&`\\]/g, '').trim().slice(0, 32);
    } else {
        clean.player.activeTitle = '';
    }
    return { valid: true, state: clean };
}

export function createSignedSaveToken(stateObj) {
    const check = sanitizeSaveState(stateObj);
    if (!check.valid) throw new Error(check.error);
    const json = JSON.stringify(check.state);
    const sig = computeSaveSignature(json);
    const b64 = encodeUtf8Base64(json);
    return `LEGEND_V2.${sig}.${b64}`;
}

export function parseAndVerifySaveToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
        return { valid: false, error: 'شفرة الحفظ فارغة.' };
    }
    const trimmed = rawToken.trim();
    try {
        if (trimmed.startsWith('LEGEND_V2.')) {
            const parts = trimmed.split('.');
            if (parts.length !== 3) {
                return { valid: false, error: 'صيغة ختم الحفظ غير مكتملة.' };
            }
            const [, sig, b64] = parts;
            const json = decodeUtf8Base64(b64);
            const expectedSig = computeSaveSignature(json);
            if (sig !== expectedSig) {
                return { valid: false, error: 'فشل التحقق الأمني: تم التلاعب بشفرة الحفظ أو أنها تالفة!' };
            }
            const parsed = JSON.parse(json);
            return sanitizeSaveState(parsed);
        }
        // Legacy base64 format support with strict sanitization
        const json = decodeUtf8Base64(trimmed);
        const parsed = JSON.parse(json);
        return sanitizeSaveState(parsed);
    } catch {
        return { valid: false, error: 'شفرة الحفظ غير صالحة أو تعذر فك تشفيرها.' };
    }
}

// ============================================================
// 2. TOWER OF ETERNITY (برج السراب الخالد) PURE LOGIC
// ============================================================

const TOWER_GUARDIANS = [
    { name: 'حارس الكثبان الرملية', archetype: 'balanced', sprite: 'assets/desert_knight_1778872351281.png' },
    { name: 'طيف السراب الخاطف', archetype: 'assassin', sprite: 'assets/sufi_mystic_1778872363338.png' },
    { name: 'غول الأجداث المتوحش', archetype: 'brute', sprite: 'assets/desert_ghoul_1778872388305.png' },
    { name: 'كاهن الأوثان المارق', archetype: 'mage', sprite: 'assets/corrupted_taoist_1778872375046.png' },
    { name: 'عقرب السموم المدرع', archetype: 'poisoner', sprite: 'assets/desert_ghoul_1778872388305.png' }
];

const TOWER_BOSSES = [
    { name: 'أمير السراب الذهبي (زعيم الطابق)', archetype: 'shifter', sprite: 'assets/saladin.png' },
    { name: 'سيد الرمال الخالد (زعيم الطابق)', archetype: 'brute', sprite: 'assets/guan_yu.png' },
    { name: 'حكيم الفلك المظلم (زعيم الطابق)', archetype: 'mind_destroyer', sprite: 'assets/zhuge_liang.png' },
    { name: 'سلطان اللهب الأزرق (زعيم الطابق)', archetype: 'mage', sprite: 'assets/ne_zha.png' }
];

export function getTowerFloorConfig(floorNumber, playerLvl = 1) {
    const floor = Math.max(1, Math.min(100, Math.floor(Number(floorNumber) || 1)));
    const isBoss = floor % 5 === 0;
    const template = isBoss
        ? TOWER_BOSSES[Math.floor(floor / 5 - 1) % TOWER_BOSSES.length]
        : TOWER_GUARDIANS[(floor - 1) % TOWER_GUARDIANS.length];

    const effectiveTier = Math.max(floor, Math.floor(playerLvl * 0.75));
    const bossMult = isBoss ? 1.65 : 1.0;

    const hp = Math.floor((110 + effectiveTier * 48 + Math.pow(floor, 1.35) * 18) * bossMult);
    const atk = Math.floor((16 + effectiveTier * 6.5 + Math.pow(floor, 1.18) * 2.2) * (isBoss ? 1.35 : 1.0));
    const def = Math.floor((6 + effectiveTier * 2.5 + floor * 1.2) * (isBoss ? 1.25 : 1.0));

    const goldReward = Math.floor((65 + floor * 45) * (isBoss ? 2.5 : 1.0));
    const xpReward = Math.floor((55 + floor * 38) * (isBoss ? 2.2 : 1.0));

    const matDrop = isBoss
        ? (floor >= 20 ? 'celestial_silk' : floor >= 10 ? 'dragon_vein_shard' : 'monster_core')
        : (floor % 2 === 0 ? 'spirit_herb' : 'iron_ore');

    return {
        floor,
        isBoss,
        isBossFloor: isBoss,
        enemy: {
            id: `tower_floor_${floor}`,
            name: `طابق ${floor}: ${template.name}`,
            archetype: template.archetype,
            sprite: template.sprite,
            hp,
            maxHp: hp,
            atk,
            def,
            minLevel: floor,
            isTowerGuardian: true,
            towerFloor: floor,
            isTowerBoss: isBoss,
            dialogue: isBoss
                ? `أنا حارس الختم في الطابق ${floor} من برج السراب! أرني إن كان نصلك يرقى للخلود!`
                : `لا يعبر الطابق ${floor} إلا من صفت عزيمته واشتد ساعده!`
        },
        rewards: {
            gold: goldReward,
            xp: xpReward,
            guaranteedMaterial: matDrop,
            materialDrop: matDrop,
            materialCount: isBoss ? 3 : 1
        }
    };
}

// ============================================================
// 3. ACHIEVEMENTS & HEROIC TITLES (ديوان الألقاب والإنجازات)
// ============================================================

export const ACHIEVEMENTS_CATALOG = [
    {
        id: 'first_blood',
        title: 'سيف البداية المسلول',
        desc: 'اهزم أول خصم لك في دروب الصحراء أو برج السراب.',
        bonus: { atk: 5, hp: 20 },
        bonusText: '+5 هجوم، +20 صحة',
        check: (s) => (s.player?.kills || 0) >= 1 || (s.exploreStreak || 0) >= 1 || (s.player?.maxTowerFloor || 0) >= 1
    },
    {
        id: 'boss_slayer_10',
        title: 'قاهر العتاة وقامع الزعماء',
        desc: 'اهزم 10 وحوش من فئة الزعماء وحراس أختام الأبراج.',
        bonus: { atk: 35, def: 18, hp: 150 },
        bonusText: '+35 هجوم، +18 دفاع، +150 صحة',
        check: (s) => (s.player?.bossKills || 0) >= 10
    },
    {
        id: 'boss_slayer_25',
        title: 'سفاح الجبابرة وقاطع الرؤوس',
        desc: 'اهزم 25 وحشاً من فئة الزعماء والجبابرة العظام في البرج والصحراء.',
        bonus: { atk: 70, def: 35, hp: 350, mp: 50 },
        bonusText: '+70 هجوم، +35 دفاع، +350 صحة، +50 عزيمة',
        check: (s) => (s.player?.bossKills || 0) >= 25
    },
    {
        id: 'monster_scourge_50',
        title: 'مبيد الوحوش والفيافي',
        desc: 'اقضِ على 50 وحشاً أو قاطع طريق في رحلتك.',
        bonus: { atk: 25, hp: 120 },
        bonusText: '+25 هجوم، +120 صحة',
        check: (s) => (s.player?.kills || 0) >= 50
    },
    {
        id: 'rising_knight',
        title: 'فارس البادية الصاعد',
        desc: 'ارفع مستوى بطلك إلى المستوى 5 أو أعلى.',
        bonus: { atk: 12, def: 6, hp: 50 },
        bonusText: '+12 هجوم، +6 دفاع، +50 صحة',
        check: (s) => (s.player?.lvl || 1) >= 5
    },
    {
        id: 'grand_master',
        title: 'سيد الفرسان المهيب',
        desc: 'ارفع مستوى بطلك إلى المستوى 15 أو أعلى.',
        bonus: { atk: 35, def: 18, hp: 180, mp: 40 },
        bonusText: '+35 هجوم، +18 دفاع، +180 صحة، +40 عزيمة',
        check: (s) => (s.player?.lvl || 1) >= 15
    },
    {
        id: 'legend_hero_lvl30',
        title: 'أسطورة طريق الحرير الخالدة',
        desc: 'ارتقِ ببطلك إلى المستوى 30 أو أعلى واقترب من قمة المجد.',
        bonus: { atk: 60, def: 30, hp: 300, mp: 60 },
        bonusText: '+60 هجوم، +30 دفاع، +300 صحة، +60 عزيمة',
        check: (s) => (s.player?.lvl || 1) >= 30
    },
    {
        id: 'tower_initiate',
        title: 'قاهر السراب الأول',
        desc: 'اطوِ الطابق 5 في برج السراب الخالد.',
        bonus: { atk: 18, mp: 25 },
        bonusText: '+18 هجوم، +25 عزيمة',
        check: (s) => (s.player?.maxTowerFloor || 0) >= 5
    },
    {
        id: 'tower_sovereign',
        title: 'سلطان برج السراب',
        desc: 'اطوِ الطابق 15 في برج السراب الخالد.',
        bonus: { atk: 45, def: 25, hp: 220 },
        bonusText: '+45 هجوم، +25 دفاع، +220 صحة',
        check: (s) => (s.player?.maxTowerFloor || 0) >= 15
    },
    {
        id: 'tower_ascendant_30',
        title: 'خالد البرج السماوي',
        desc: 'اطوِ الطابق 30 في برج السراب الخالد وتجاوز حدود الفناء.',
        bonus: { atk: 80, def: 40, hp: 400, mp: 70 },
        bonusText: '+80 هجوم، +40 دفاع، +400 صحة، +70 عزيمة',
        check: (s) => (s.player?.maxTowerFloor || 0) >= 30
    },
    {
        id: 'silk_tycoon',
        title: 'أمير قوافل الذهب',
        desc: 'اجمع 1,000 دينار ذهبي أو أكثر في خزانتك.',
        bonus: { hp: 80, mp: 30 },
        bonusText: '+80 صحة، +30 عزيمة',
        check: (s) => (s.player?.gold || 0) >= 1000
    },
    {
        id: 'gold_croesus_10k',
        title: 'قارون الفيافي والقفار',
        desc: 'اجمع 10,000 دينار ذهبي أو أكثر في ثروتك الخاصة.',
        bonus: { hp: 220, mp: 60 },
        bonusText: '+220 صحة، +60 عزيمة',
        check: (s) => (s.player?.gold || 0) >= 10000
    },
    {
        id: 'beast_legend',
        title: 'مروض الكواسر الأسطوري',
        desc: 'روّض 2 أو أكثر من الوحوش والدواب لتسير في ركابك.',
        bonus: { atk: 20, def: 15, hp: 100 },
        bonusText: '+20 هجوم، +15 دفاع، +100 صحة',
        check: (s) => (s.player?.pets?.length || 0) >= 2
    },
    {
        id: 'alchemist_supreme',
        title: 'حكيم الكيمياء والإكسير الكوني',
        desc: 'اصنع واقطف 10 إكسيرات أو أدوية في مرجل الكيمياء الصيدلاني.',
        bonus: { hp: 120, mp: 50 },
        bonusText: '+120 صحة، +50 عزيمة',
        check: (s) => (s.player?.questProgress?.refines || 0) >= 10 || (s.player?.alchemyCount || 0) >= 10
    },
    {
        id: 'saint_of_light',
        title: 'الولي الصالح النوراني',
        desc: 'حقق مقام كارما نورانية +50 أو أعلى.',
        bonus: { hp: 150, def: 15 },
        bonusText: '+150 صحة، +15 دفاع',
        check: (s) => (s.player?.karma || 0) >= 50
    },
    {
        id: 'lord_of_shadows',
        title: 'سيد الظلال المهاب',
        desc: 'ادخل مقام الكارما المظلمة -50 أو أقل.',
        bonus: { atk: 30 },
        bonusText: '+30 هجوم حاسم',
        check: (s) => (s.player?.karma || 0) <= -50
    }
];

export function evaluateAchievements(state) {
    if (!state || !state.player) {
        return { unlockedIds: [], newlyUnlocked: [], totalBonus: { atk: 0, def: 0, hp: 0, mp: 0 } };
    }
    if (!Array.isArray(state.achievements)) state.achievements = [];

    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS_CATALOG) {
        if (!state.achievements.includes(ach.id) && ach.check(state)) {
            state.achievements.push(ach.id);
            newlyUnlocked.push(ach);
        }
    }

    const totalBonus = { atk: 0, def: 0, hp: 0, mp: 0 };
    for (const ach of ACHIEVEMENTS_CATALOG) {
        if (state.achievements.includes(ach.id)) {
            totalBonus.atk += ach.bonus.atk || 0;
            totalBonus.def += ach.bonus.def || 0;
            totalBonus.hp += ach.bonus.hp || 0;
            totalBonus.mp += ach.bonus.mp || 0;
        }
    }

    if (!state.player.activeTitle && state.achievements.length > 0) {
        const firstAch = ACHIEVEMENTS_CATALOG.find(a => a.id === state.achievements[state.achievements.length - 1]);
        if (firstAch) state.player.activeTitle = firstAch.title;
    }

    return {
        unlockedIds: state.achievements,
        newlyUnlocked,
        totalBonus
    };
}

// ============================================================
// 4. CORE COMBAT ENGINE: STANCE FLOWS & AWAKENING LIMIT BREAK
// ============================================================

export const STANCE_FLOWS = {
    'water->mountain': {
        id: 'surging_shockwave',
        name: 'زلزال المد العارم',
        desc: 'موجة ارتدادية (+35% ضرر وزعزعة اتزان الخصم)',
        apply: (state, enemy, res) => {
            res.playerDmg = Math.floor(res.playerDmg * 1.35);
            state.staggerCounter = (state.staggerCounter || 0) + 1;
            res.resultText += `<br><span style="color:#f5c842;font-weight:bold;">🌊➔🏔️ [سلسلة المقامات: زلزال المد العارم]: تحول انسياب الماء إلى ثقل الجبل الصادم (+35% ضرر وزعزعة)!</span>`;
        }
    },
    'mountain->wind': {
        id: 'gale_flash',
        name: 'خاطفة العاصفة الصخرية',
        desc: 'ضربة حرجة مؤكدة 100% وزخم متدفق +25',
        apply: (state, enemy, res) => {
            res.special = 'crit';
            res.playerDmg = Math.floor(res.playerDmg * 1.5);
            res.momentumShift = (res.momentumShift || 0) + 25;
            res.resultText += `<br><span style="color:#38bdf8;font-weight:bold;">🏔️➔🌪️ [سلسلة المقامات: خاطفة العاصفة]: تفجرت طاقة الجبل الكامنة برياح خاطفة (ضربة حرجة مؤكدة وزخم +25)!</span>`;
        }
    },
    'wind->water': {
        id: 'vortex_recovery',
        name: 'انسياب النهر السلسبيل',
        desc: 'تجدد +12% صحة و +15% تركيز وطهارة من العلل',
        apply: (state, enemy, res) => {
            const h = Math.max(10, Math.floor(state.player.maxHp * 0.12));
            const m = Math.max(10, Math.floor(state.player.maxMp * 0.15));
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + h);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + m);
            if (state.playerPoisonTurns > 0) state.playerPoisonTurns = Math.max(0, state.playerPoisonTurns - 1);
            if (state.playerFearTurns > 0) state.playerFearTurns = Math.max(0, state.playerFearTurns - 1);
            res.resultText += `<br><span style="color:#00e5a0;font-weight:bold;">🌪️➔🌊 [سلسلة المقامات: انسياب النهر السلسبيل]: ركدت العاصفة إلى جدول رقراق شفى +${h} صحة و +${m} تركيز!</span>`;
        }
    }
};

export function checkStanceFlow(fromForm, toForm) {
    if (!fromForm || !toForm || fromForm === toForm) return null;
    const key = `${fromForm}->${toForm}`;
    return STANCE_FLOWS[key] || null;
}

export function getStanceFlow(flowIdOrKey) {
    if (!flowIdOrKey) return null;
    if (STANCE_FLOWS[flowIdOrKey]) return STANCE_FLOWS[flowIdOrKey];
    return Object.values(STANCE_FLOWS).find(f => f.id === flowIdOrKey) || null;
}

export const AWAKENING_MOVES = {
    'Sword Immortal': {
        id: 'awakening_burst',
        name: '⚔️ تجلّي القدر: تسعة أسياف شهابية',
        shortName: 'تسعة أسياف شهابية',
        desc: 'تسعة سيوف شبحية تخترق 50% من دفاع العدو وتملأ نية السيف المطلقة!',
        damageMultiplier: 4.2,
        ignoreDefPct: 0.50,
        specialEffect: (state, enemy, res) => {
            state.swordIntent = 3;
            res.resultText += `<br><span style="color:#ffd700;font-weight:bold;">✨ [تسعة أسياف شهابية]: تشظى فضاء المعركة بتسعة أسياف نورانية خارقة للدروع، وامتلكت نية السيف العظمى!</span>`;
        }
    },
    'Medicine Cultivator': {
        id: 'awakening_burst',
        name: '🌸 تجلّي القدر: تطهير لوتس الألف بتلة',
        shortName: 'تطهير لوتس الألف بتلة',
        desc: 'شفاء كامل لصحتك، استرداد 50 تركيز، وإشعال سم سماوي حارق بالخصم!',
        damageMultiplier: 2.8,
        specialEffect: (state, enemy, res) => {
            state.player.hp = state.player.maxHp;
            state.player.mp = Math.min(state.player.maxMp, (state.player.mp || 0) + 50);
            state.playerPoisonTurns = 0;
            state.playerFearTurns = 0;
            state.dotEffects = state.dotEffects || [];
            state.dotEffects.push({ type: 'burn', dmg: Math.max(30, Math.floor(state.player.atk * 0.8)), duration: 4 });
            res.resultText += `<br><span style="color:#00e5a0;font-weight:bold;">🌿 [لوتس الألف بتلة]: انفتحت زهرة اللوتس الكونية فطهّرت جسدك من كل علّة واستعادت صحتك كاملة وأحرقت جوهر الخصم!</span>`;
        }
    },
    'Desert Knight': {
        id: 'awakening_burst',
        name: '🏜️ تجلّي القدر: زلزال القيامة الرملي',
        shortName: 'زلزال القيامة الرملي',
        desc: 'سحق غاشم يحطم 35% من دفاع الخصم للأبد ويشله لدور كامل!',
        damageMultiplier: 3.5,
        specialEffect: (state, enemy, res) => {
            enemy.def = Math.max(0, Math.floor((enemy.def || 5) * 0.65));
            state.enemyStunned = true;
            res.resultText += `<br><span style="color:#e67e22;font-weight:bold;">🌪️ [زلزال القيامة]: هدمت قوى الرمال دروع ${escapeHtml(enemy.name)} بنسبة 35% وشلّت حركته تماماً!</span>`;
        }
    },
    'Lancer': {
        id: 'awakening_burst',
        name: '🗡️ تجلّي القدر: طعنة التنين الماحقة',
        shortName: 'طعنة التنين الماحقة',
        desc: 'طعنة تخترق دروع الخصم وتضعه في حالة ترنح وزعزعة تامة للضربة القاضية!',
        damageMultiplier: 3.6,
        specialEffect: (state, enemy, res) => {
            state.enemyStaggered = true;
            res.resultText += `<br><span style="color:#ff8c00;font-weight:bold;">🐉 [طعنة التنين الماحقة]: اخترق رمحك مركز توازن العدو وجعله مذهولاً ومترنحاً لتوجيه الضربة القاضية!</span>`;
        }
    },
    'Horseman': {
        id: 'awakening_burst',
        name: '🐎 تجلّي القدر: صاعقة خيول الفاتحين',
        shortName: 'صاعقة خيول الفاتحين',
        desc: 'غارة فرسان ساحقة تمنح +60 زخماً وتكشف ثغرة قاتلة بالخصم لدورين!',
        damageMultiplier: 3.8,
        specialEffect: (state, enemy, res) => {
            state.momentum = Math.min(100, (state.momentum || 0) + 60);
            state.enemyVulnerableTurns = 2;
            res.resultText += `<br><span style="color:#90ee90;font-weight:bold;">⚡ [صاعقة خيول الفاتحين]: زلزلت سنابك الخيل الأرض كاشفة ثغرة قاتلة في الخصم ورفعت معنوياتك لأعلى ذروة!</span>`;
        }
    },
    'Astrologer': {
        id: 'awakening_burst',
        name: '🌌 تجلّي القدر: انفجار النجم المستعر',
        shortName: 'انفجار النجم المستعر',
        desc: 'انفجار كوني يمتص هجوم الخصم ويسترد عزيمتك بالكامل!',
        damageMultiplier: 4.0,
        specialEffect: (state, enemy, res) => {
            enemy.atk = Math.max(1, Math.floor(enemy.atk * 0.75));
            state.player.mp = state.player.maxMp;
            res.resultText += `<br><span style="color:#bf5fff;font-weight:bold;">✨ [انفجار النجم المستعر]: شهاب سديمي سحق هجوم العدو بنسبة 25% وملأ بئر عزيمتك حتى فيضانه!</span>`;
        }
    },
    'Steelmaster': {
        id: 'awakening_burst',
        name: '🛡️ تجلّي القدر: سحق السندان السماوي',
        shortName: 'سحق السندان السماوي',
        desc: 'ضربة فولاذية ثقيلة تمنحك درعاً مانعاً للضرر في الجولة التالية!',
        damageMultiplier: 3.5,
        specialEffect: (state, enemy, res) => {
            state.player_invulnerable_turn = true;
            res.resultText += `<br><span style="color:#c0c0c0;font-weight:bold;">⚙️ [سحق السندان السماوي]: صلابة فولاذ دمشقي حصنت جسدك بحصانة كاملة للجولة القادمة!</span>`;
        }
    },
    'Sufi Mystic': {
        id: 'awakening_burst',
        name: '✨ تجلّي القدر: سر الوجد والفيض الرباني',
        shortName: 'سر الوجد والفيض الرباني',
        desc: 'تحويل كامل لكافة السموم والعلل إلى نور، مع زخم مطلق 100%!',
        damageMultiplier: 3.8,
        specialEffect: (state, enemy, res) => {
            state.playerPoisonTurns = 0;
            state.playerFearTurns = 0;
            const heal = Math.floor(state.player.maxHp * 0.5);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
            state.momentum = 100;
            res.resultText += `<br><span style="color:#f59e0b;font-weight:bold;">🕊️ [سر الوجد والفيض]: صعدت روحك في فلك السكينة، فطهرت كل أذى واسترددت +${heal} صحة وبلغت ذروة الزخم!</span>`;
        }
    },
    default: {
        id: 'awakening_burst',
        name: '🔥 تجلّي القدر: الصاعقة الكبرى',
        shortName: 'الصاعقة الكبرى',
        desc: 'ضربة قصوى تطلق كامل طاقة البطل الكامنة وتحدث دماراً شاملاً!',
        damageMultiplier: 3.6,
        specialEffect: (state, enemy, res) => {
            state.momentum = Math.min(100, (state.momentum || 0) + 50);
            res.resultText += `<br><span style="color:#ffd700;font-weight:bold;">🔥 [الصاعقة الكبرى]: تفجرت طاقة القدر في ساحة المعركة بضربة قاضية مهيبة!</span>`;
        }
    }
};

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
    state.combatTurnCount = 0;
    state._ultimateReviveUsed = false;
    state.awakeningGauge = Math.max(0, Math.min(100, Number(state.awakeningGauge) || 0));
    state.lastActionForm = null;
    state.activeStanceFlow = null;
    state.enemyVulnerableTurns = 0;
    state.combatSpeed = state.combatSpeed || 1;
    const comp = w.COMPANIONS?.getActive(state);
    if (comp?.passiveBuff?.effect) comp.passiveBuff.effect(state);
}

export function processTurnEffects(state, enemy) {
    let msg = '';
    state.combatTurnCount = (state.combatTurnCount || 0) + 1;
    state.dotEffects = (state.dotEffects || []).filter(dot => {
        const d = Math.floor(dot.dmg);
        enemy.hp = Math.max(0, enemy.hp - d);
        const t = dot.type === 'burn' ? 'لهب' : dot.type === 'poison' ? 'سم' : dot.type;
        msg += `<br><span style="color:var(--danger)">${escapeHtml(enemy.name)} يتلقى ${d} ${t}!</span>`;
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
        const stageIdx = w.CULTIVATION?.stages?.findIndex(s => s.name === state.player.cultivation?.stage) ?? -1;
        if (stageIdx >= 9) {
            state.player.hp = Math.floor(state.player.maxHp * 0.5);
            state._ultimateReviveUsed = true;
            state.enemyStunned = true;
            msg += `<br><span style="color:#ffcc00;font-weight:bold;text-shadow:0 0 10px #ffcc00;">☀️ [شمس الهجير]: نهضت من الموت!</span>`;
        }
    }
    if (state.enemyStunned) {
        msg += `<br><b>${escapeHtml(enemy.name)} مشلول تماماً!</b>`;
        state.enemyStunned = false;
        state.skipEnemyTurn = true;
    } else {
        state.skipEnemyTurn = false;
    }

    if ((state.enemyVulnerableTurns || 0) > 0) {
        msg += `<br><span style="color:#f59e0b;font-weight:bold;">⚡ [ثغرة مكشوفة] الخصم يتأرجح من الصدمة ويتلقى 40% ضرراً إضافياً (${state.enemyVulnerableTurns} جولة)!</span>`;
        state.enemyVulnerableTurns--;
    }
    if ((state.momentum || 0) >= 40) {
        state.awakeningGauge = Math.min(100, (state.awakeningGauge || 0) + 4);
    }

    // Weather effects during combat
    if (w.WEATHER_SYSTEM && typeof w.WEATHER_SYSTEM.getModifiers === 'function') {
        const wMods = w.WEATHER_SYSTEM.getModifiers();
        if (wMods.hpDrainMult > 0) {
            const d = Math.max(1, Math.floor(state.player.maxHp * wMods.hpDrainMult));
            state.player.hp = Math.max(1, state.player.hp - d);
            const ed = Math.max(1, Math.floor(enemy.maxHp * wMods.hpDrainMult));
            enemy.hp = Math.max(0, enemy.hp - ed);
            msg += `<br><span style="color:#ff4500;font-weight:bold;">🔥 [حر الهجير] استنزفت ضربات الشمس الحارقة -${d} صحة منك و -${ed} صحة من ${escapeHtml(enemy.name)}!</span>`;
            w.COMBAT_UI?.playEffect('fire', 'player');
            w.COMBAT_UI?.playEffect('fire', 'enemy');
        }
        if (wMods.mpRegenMult > 1) {
            const regen = Math.floor(state.player.maxMp * 0.15);
            state.player.mp = Math.min(state.player.maxMp, state.player.mp + regen);
            msg += `<br><span style="color:#9b59b6;font-weight:bold;">🔮 [ضباب الأثير] تشرب هالتك التشي الباطني: +${regen} تركيز!</span>`;
            w.COMBAT_UI?.playEffect('heal', 'player');
        }
        const activeWeather = w.WEATHER_SYSTEM.currentWeather;
        if (activeWeather === 'sandstorm' && Math.random() < 0.3) {
            w.COMBAT_UI?.playEffect('poison', 'enemy');
        } else if (activeWeather === 'eclipse' && Math.random() < 0.3) {
            w.COMBAT_UI?.playEffect('fear', 'enemy');
        }
        w.WEATHER_SYSTEM.advanceTurns(state, 1);
    }
    return msg;
}

export function useCompanionAbility(state, enemy) {
    const comp = w.COMPANIONS?.getActive(state);
    if (!comp?.uniqueAbility) return { success: false, message: 'مفيش رفيق نشط.' };
    const ab = comp.uniqueAbility;
    const aff = 1 + ((state.companions?.[comp.id]?.affinity || 0) / 100);
    let msg = `<b>${escapeHtml(comp.name)}</b> يشغّل <b>${escapeHtml(ab.name)}</b>!`;
    let ok = true;
    switch (ab.effect) {
        case 'triple_damage_stun': { const d = Math.floor(state.player.atk*3*aff); enemy.hp = Math.max(0,enemy.hp-d); state.momentum = Math.min(100,state.momentum+40); msg+=`<br>${escapeHtml(comp.name)} سبب ${d} ضرر وأذهل العدو!`; state.enemyStaggered=true; break; }
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
        water:    [{id:'deflect',name:'🛡️ صد الثقيل (ماء)',type:'deflect',cost:0},{id:'slipstream',name:'🌊 مراوغة السريع (ماء)',type:'evade',cost:0}],
        mountain: [{id:'earthshatter',name:'🏔️ زلزال الحجر (جبل)',type:'heavy',cost:15},{id:'mountain_stance',name:'🛡️ وضعية الجبل (امتصاص)',type:'absorb',cost:10}],
        wind:     [{id:'gale_strike',name:'🌪️ ضربة الريح (خاطف)',type:'fast',cost:5},{id:'qi_blade',name:'⚡ سيف النور (اختراق)',type:'magic',cost:20}]
    };
    const actions = [...(BASE[form]||[])];
    if (state && (state.awakeningGauge || 0) >= 100) {
        const cls = state.player?.class || 'default';
        const awk = AWAKENING_MOVES[cls] || AWAKENING_MOVES['default'];
        actions.unshift({
            id: 'awakening_burst',
            name: awk.name,
            type: 'awakening',
            cost: 0,
            isAwakening: true
        });
    }
    (state?.player?.skills||[]).forEach(sid => {
        const s = w.SKILLS?.techniques?.[sid];
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
        return `<span style="color:var(--danger); font-weight:bold;">[${escapeHtml(enemy.moves[moveType].name)}]</span>: ${escapeHtml(enemy.moves[moveType].text)}`;
    }
    const safeName = escapeHtml(enemy.name);
    const t = {
        heavy:   `💥 ${safeName} يجمع ثقله لضربة ثقيلة مدمرة! (نصيحة: صدها بوضعية الماء)`,
        fast:    `⚡ ${safeName} يشحن لهجوم خاطف كالبرق! (نصيحة: راوغها بوضعية الماء)`,
        magic:   `🔮 الهواء يتجمد حول ${safeName} وهو يستدعي سحراً! (نصيحة: اقطعها بضربة الريح)`,
        guard:   `🛡️ ${safeName} يرفع درعه للدفاع. (نصيحة: حطمه بزلزال الجبل)`,
        deflect: `⚔️ ${safeName} ينتظر هجومك ليصده. (نصيحة: حطمه بزلزال الجبل)`,
        evade:   `💨 ${safeName} جاهز للقفز والمراوغة!`
    };
    return t[moveType]||`${safeName} يراقبك بعيون حادة.`;
}

export function resolveMove(playerMoveId, enemyMoveType, playerAtk, enemyAtk, enemy, state) {
    let pDmg=0, eDmg=0, msg='', mom=0, spec=null;
    const safeEnemyName = escapeHtml(enemy?.name || 'الخصم');

    let wMods = { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1, hpDrainMult: 0, critDamageMult: 0, skillCostMult: 1 };
    if (w.WEATHER_SYSTEM && typeof w.WEATHER_SYSTEM.getModifiers === 'function') {
        wMods = w.WEATHER_SYSTEM.getModifiers();
        const activeWeather = w.WEATHER_SYSTEM.currentWeather;
        if (activeWeather === 'sandstorm') {
            enemyAtk = Math.max(1, Math.floor(enemyAtk * wMods.atkMult));
            msg += `<span style="color:#d4af37;font-weight:bold;">[عاصفة السموم: -25% هجوم للطرفين] </span>`;
        } else if (activeWeather === 'heatwave') {
            enemyAtk = Math.floor(enemyAtk * wMods.atkMult);
            msg += `<span style="color:#ff4500;font-weight:bold;">[حر الهجير: +25% هجوم للطرفين] </span>`;
        } else if (activeWeather === 'spiritual_mist') {
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
        msg = ok ? `روّضت ${safeEnemyName}!` : `${safeEnemyName} رفض وهاجم!`;
        return { playerDmg:0, enemyDmg:ok?0:enemyAtk, resultText:msg, special:ok?'tamed':null, momentumShift:ok?100:-30 };
    }

    if (playerMoveId === 'awakening_burst') {
        const cls = state.player?.class || 'default';
        const awk = AWAKENING_MOVES[cls] || AWAKENING_MOVES['default'];
        let sAtk = isNight ? Math.floor(playerAtk * 1.2) : playerAtk;
        let ignoreDefPct = awk.ignoreDefPct || 0;
        let enemyDef = (enemy.def || 5) * (1 - ignoreDefPct);
        let baseDmg = Math.max(1, Math.floor(sAtk * awk.damageMultiplier - enemyDef));
        if ((state.enemyVulnerableTurns || 0) > 0) {
            baseDmg = Math.floor(baseDmg * 1.4);
        }
        state.awakeningGauge = 0;
        msg = `<span style="color:#ffd700;font-size:1.05rem;font-weight:bold;text-shadow:0 0 10px rgba(255,215,0,0.5);">🔥 [${escapeHtml(awk.name)}]!</span><br>${awk.desc}`;
        const awkRes = { playerDmg: baseDmg, enemyDmg: 0, resultText: msg, special: 'crit', momentumShift: 40 };
        if (typeof awk.specialEffect === 'function') {
            awk.specialEffect(state, enemy, awkRes);
        }
        return awkRes;
    }

    const skill = w.SKILLS?.techniques?.[playerMoveId];
    if (skill) {
        msg += `أطلقت <b>${escapeHtml(skill.name)}</b>! `;
        let sAtk = isNight ? Math.floor(playerAtk*1.2) : playerAtk;
        if (wMods.atkMult > 1 && w.WEATHER_SYSTEM?.currentWeather === 'spiritual_mist') {
            sAtk = Math.floor(sAtk * wMods.atkMult);
        }
        let ignorePct = (w.WEATHER_SYSTEM?.currentWeather === 'eclipse') ? 0.20 : 0.0;
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
        if (skill.debuff) { state.enemyDebuffs.push({...skill.debuff}); msg+=`${safeEnemyName} ضعف! `; }
        if (skill.hpCost) { const c=Math.floor(state.player.maxHp*skill.hpCost); state.player.hp=Math.max(1,state.player.hp-c); msg+=`(-${c} دم) `; }
        return { playerDmg:pDmg, enemyDmg:Math.floor(enemyAtk*0.5), resultText:msg, special:'skill', momentumShift:20 };
    }

    let ignorePct = (w.WEATHER_SYSTEM?.currentWeather === 'eclipse') ? 0.20 : 0.0;
    const enemyDefVal = (enemy && enemy.def !== undefined) ? enemy.def : 5;
    const playerDefVal = (state && state.player && state.player.def !== undefined) ? state.player.def : 0;
    const pBase = Math.max(1, Math.floor(playerAtk - (enemyDefVal * (1 - ignorePct))));
    const eBase = Math.max(1, Math.floor(enemyAtk - (playerDefVal * (1 - ignorePct))));

    // Enemy archetype specials
    if (enemy?.id==='crossroads_venomous_spider' && enemyMoveType==='magic') {
        state.playerPoisonTurns = 3;
        msg+=`<br><span style="color:#2ecc71;font-weight:bold;">🕷️ بخّ العنكبوت سحابة سم من غددته السامة لـ 3 أدوار!</span>`;
    }
    if (enemy?.archetype==='poisoner' && enemyMoveType==='fast') {
        if (!state.playerPoisonTurns || state.playerPoisonTurns<=0) {
            state.playerPoisonTurns = 2;
            msg+=`<br><span style="color:#2ecc71;">☠️ طعنة مسمومة: ${safeEnemyName} سمّ ${escapeHtml(enemy.moves?.fast?.name||'طعنته')}!</span>`;
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
        w.COMBAT_UI?.playEffect('execution','enemy');
        return { playerDmg:Math.floor(pDmg), enemyDmg:0, resultText:msg, special:spec, momentumShift:0 };
    }
    if (state.playerGuardBroken) {
        eDmg=eBase*2; msg=`دفاعك اتكسر! ضربة مدمرة! `; spec='guard_broken';
        state.playerGuardBroken=false; state.momentum=0;
        w.COMBAT_UI?.playEffect('guard_break','player');
        return { playerDmg:0, enemyDmg:Math.floor(eDmg), resultText:msg, special:spec, momentumShift:0 };
    }

    // Action matrix
    switch(playerMoveId) {
        case 'deflect':
            if (enemyMoveType==='heavy')      { msg='صددت الثقيلة بالمللي وأسقطته!';         mom=30; spec='perfect_counter'; pDmg=pBase*1.5; }
            else if (enemyMoveType==='magic') { msg='فشلت في صد السحر ولكنك خدشته!';          mom=-15; pDmg=pBase*0.5; eDmg=eBase*1.2; }
            else                              { msg='صددت الهجوم ورددت بطعنة سريعة!';         mom=10; pDmg=pBase*0.85; eDmg=eBase*.3; } break;
        case 'slipstream':
            if (enemyMoveType==='fast')       { msg='تفاديت وضربت ظهره!';                     mom=30; spec='perfect_counter'; pDmg=pBase*1.5; }
            else if (enemyMoveType==='heavy') { msg='موجة الصدمة أصابتك أثناء المراوغة!';     mom=-10; pDmg=pBase*0.5; eDmg=eBase*0.9; }
            else                              { msg='راوغت بانسيابية وسددت ضربة خاطفة!';       mom=15; pDmg=pBase*0.9; eDmg=eBase*.2; } break;
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

    if (eDmg > 0 && enemy.moves && enemy.moves[enemyMoveType]) {
        msg += `<br><span style="color:var(--danger); font-size:0.9em;">[${escapeHtml(enemy.moves[enemyMoveType].name)}] أصابتك!</span>`;
    }

    // Apply Vulnerable enemy damage bonus
    if ((state.enemyVulnerableTurns || 0) > 0 && pDmg > 0) {
        pDmg = Math.floor(pDmg * 1.4);
        msg += ` <span style="color:#f59e0b;font-weight:bold;">[ثغرة مكشوفة: +40% ضرر]</span>`;
    }

    // Apply Stance Flow combo if primed
    const activeFlow = getStanceFlow(state.activeStanceFlow);
    if (activeFlow) {
        const flowObj = { playerDmg: pDmg, resultText: msg, special: spec, momentumShift: mom };
        activeFlow.apply(state, enemy, flowObj);
        pDmg = flowObj.playerDmg;
        msg = flowObj.resultText;
        spec = flowObj.special;
        mom = flowObj.momentumShift;
        state.activeStanceFlow = null;
        state.awakeningGauge = Math.min(100, (state.awakeningGauge || 0) + 15);
    }

    // Perfect Parry & Riposte enhancement
    if (spec === 'perfect_counter') {
        state.enemyVulnerableTurns = 2;
        pDmg = Math.floor(pDmg * 1.15);
        state.awakeningGauge = Math.min(100, (state.awakeningGauge || 0) + 25);
        msg += `<br><span style="color:#f59e0b;font-weight:bold;">⚡ [صد معجز وهجوم مرتد]: انكشفت ثغرة دفاع الخصم (يتلقى +40% ضرر للجولات القادمة)!</span>`;
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
        w.COMBAT_UI?.playEffect('execution', 'enemy');
    }

    pDmg=Math.floor(pDmg); eDmg=Math.floor(eDmg);

    // Apply Sandstorm Evasion/Accuracy misses
    if (pDmg > 0 && wMods.accuracyBonus < 0 && Math.random() < Math.abs(wMods.accuracyBonus)) {
        pDmg = Math.floor(pDmg * 0.35);
        msg += `<br><span style="color:#d4af37;font-weight:bold;">💨 [أتربة السموم] حجب الغبار هجومك وتسبب بضربة طفيفة (35% ضرر)!</span>`;
        w.COMBAT_UI?.playEffect('poison', 'enemy');
    }
    if (eDmg > 0 && wMods.accuracyBonus < 0 && Math.random() < Math.abs(wMods.accuracyBonus)) {
        eDmg = Math.floor(eDmg * 0.35);
        msg += `<br><span style="color:#d4af37;font-weight:bold;">💨 [تفادي العاصفة] أعمت الأتربة عيون العدو وقللت ضرر ضربته!</span>`;
        w.COMBAT_UI?.playEffect('poison', 'player');
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
        w.COMBAT_UI?.playEffect('crit','enemy');
    }

    // Hero class specializations
    const cls = state.player.class;
    if (cls==='Sword Immortal'&&pDmg>0) {
        state.swordIntent=(state.swordIntent||0)+1;
        if (state.swordIntent>=3) { pDmg=Math.floor(pDmg*2.5); state.swordIntent=0; spec='perfect_counter'; msg+=`<br><span style="color:#ffd700;font-weight:bold;text-shadow:0 0 10px #ffd700;">⚔️ نية السيف المطلقة! (×2.5)</span>`; w.COMBAT_UI?.playEffect('sword_intent','enemy'); }
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

    // Awakening Limit Break gauge charging on active combat actions
    if (pDmg > 0) {
        state.awakeningGauge = Math.min(100, (state.awakeningGauge || 0) + 8);
    }
    if (eDmg > 0) {
        state.awakeningGauge = Math.min(100, (state.awakeningGauge || 0) + 5);
    }

    return { playerDmg:pDmg, enemyDmg:eDmg, resultText:msg, special:spec, momentumShift:mom };
}

export const CombatEngine = {
    initCombatState,
    processTurnEffects,
    useCompanionAbility,
    getActionsForForm,
    selectEnemyMove,
    getTelegraph,
    resolveMove,
    escapeHtml,
    sanitizePlayerName,
    safeDeepMerge,
    computeSaveSignature,
    createSignedSaveToken,
    parseAndVerifySaveToken,
    getTowerFloorConfig,
    ACHIEVEMENTS_CATALOG,
    evaluateAchievements,
    STANCE_FLOWS,
    checkStanceFlow,
    getStanceFlow,
    AWAKENING_MOVES
};
