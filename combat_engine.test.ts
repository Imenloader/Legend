import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = globalThis;

import {
  initCombatState,
  processTurnEffects,
  getActionsForForm,
  selectEnemyMove,
  getTelegraph,
  resolveMove,
  escapeHtml,
  sanitizePlayerName,
  safeDeepMerge,
  createSignedSaveToken,
  parseAndVerifySaveToken,
  getTowerFloorConfig,
  evaluateAchievements,
} from './combat_engine.js';

function createMockState(overrides: Record<string, any> = {}) {
  return {
    player: {
      name: 'البطل الفارس',
      class: 'Sword Immortal',
      lvl: 1,
      hp: 200,
      maxHp: 200,
      mp: 80,
      maxMp: 80,
      atk: 25,
      def: 8,
      critRate: 0,
      dodgeRate: 0,
      skills: ['lotus_strike'],
      ...overrides.player,
    },
    ...overrides,
  };
}

test('initCombatState resets combat flags and stances cleanly', () => {
  const state: any = createMockState({ momentum: 50, swordIntent: 2 });
  initCombatState(state);
  assert.equal(state.combatState, 'enemy_prep');
  assert.equal(state.momentum, 0);
  assert.equal(state.playerForm, 'water');
  assert.equal(state.swordIntent, 0);
  assert.deepEqual(state.activeBuffs, []);
});

test('processTurnEffects applies water stance MP regen and DoT damage', () => {
  const state: any = createMockState({
    player: { hp: 180, maxHp: 200, mp: 40, maxMp: 100 },
  });
  initCombatState(state);
  state.dotEffects = [{ type: 'burn', dmg: 15, duration: 2 }];
  const enemy = { name: 'غول الصحراء', hp: 100, maxHp: 100 };

  const msg = processTurnEffects(state, enemy);
  assert.equal(enemy.hp, 85);
  assert.equal(state.dotEffects.length, 1);
  assert.equal(state.player.mp, 50); // +10% of 100
  assert.ok(msg.includes('15'));
});

test('getActionsForForm returns stance-appropriate combat moves', () => {
  const state: any = createMockState();
  initCombatState(state);
  const waterActions = getActionsForForm('water', state);
  assert.ok(Array.isArray(waterActions));
  assert.ok(waterActions.some((a: any) => a.id === 'deflect'));
  const mountainActions = getActionsForForm('mountain', state);
  assert.ok(mountainActions.some((a: any) => a.id === 'earthshatter'));
});

test('selectEnemyMove and getTelegraph produce valid enemy move and Arabic telegraph', () => {
  const enemy = { name: 'فارس الرمال', hp: 100, maxHp: 100, atk: 20 };
  const move = selectEnemyMove(enemy);
  assert.ok(['heavy', 'fast', 'magic', 'guard', 'deflect', 'evade'].includes(move));
  const telegraph = getTelegraph(enemy, move);
  assert.ok(typeof telegraph === 'string' && telegraph.length > 0);
});

test('resolveMove calculates damage, Sword Immortal stacks, and perfect counter momentum shift', () => {
  const state: any = createMockState({
    player: {
      class: 'Sword Immortal',
      hp: 200,
      maxHp: 200,
      mp: 80,
      maxMp: 80,
      atk: 30,
      def: 10,
      critRate: 0,
    },
  });
  initCombatState(state);
  const enemy = { name: 'لص القوافل', hp: 120, maxHp: 120, atk: 15, def: 4 };

  const res1 = resolveMove('deflect', 'heavy', 30, 15, enemy, state);
  assert.ok(res1.playerDmg > 0);
  assert.ok(['perfect_counter', 'crit'].includes(res1.special as string));
  assert.equal(state.swordIntent, 1);
  assert.equal(res1.momentumShift, 30);

  // Even when enemy uses deflect/guard, deflect and slipstream deal counter-strike damage (never 0-damage stall)
  const res2 = resolveMove('deflect', 'deflect', 30, 15, enemy, state);
  assert.ok(res2.playerDmg > 0);
  const res3 = resolveMove('slipstream', 'guard', 30, 15, enemy, state);
  assert.ok(res3.playerDmg > 0);
});

test('escapeHtml and sanitizePlayerName neutralize XSS and dangerous characters', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(sanitizePlayerName('  <b>عنترة</b>  '), 'bعنترة/b');
  assert.equal(sanitizePlayerName('<>""'), 'البطل الفارس');
});

test('safeDeepMerge blocks prototype pollution attacks', () => {
  const target: any = { player: { name: 'سيف', gold: 100 } };
  const maliciousPayload = JSON.parse('{"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"hacked":true}},"player":{"gold":250}}');
  safeDeepMerge(target, maliciousPayload);
  assert.equal(target.player.gold, 250);
  assert.equal(({} as any).polluted, undefined);
  assert.equal(({} as any).hacked, undefined);
});

test('createSignedSaveToken and parseAndVerifySaveToken verify valid saves and reject tampered tokens', () => {
  const state = createMockState({ player: { name: 'فارس الرمال', gold: 777, lvl: 4 } });
  const token = createSignedSaveToken(state);
  assert.ok(token.startsWith('LEGEND_V2.'));

  const verified = parseAndVerifySaveToken(token);
  assert.equal(verified.valid, true);
  assert.equal(verified.state?.player?.gold, 777);

  // Tamper with signature
  const tampered = token.replace('LEGEND_V2.', 'LEGEND_V2.00');
  const rejected = parseAndVerifySaveToken(tampered);
  assert.equal(rejected.valid, false);
});

test('getTowerFloorConfig scales enemy stats and marks every 5th floor as a boss floor', () => {
  const f1 = getTowerFloorConfig(1);
  const f5 = getTowerFloorConfig(5);
  assert.equal(f1.isBossFloor, false);
  assert.equal(f5.isBossFloor, true);
  assert.ok(f5.enemy.maxHp > f1.enemy.maxHp);
  assert.ok(f5.rewards.gold > f1.rewards.gold);
  assert.equal(f5.rewards.materialDrop, 'monster_core');
});

test('evaluateAchievements unlocks earned achievements and accumulates stat bonuses', () => {
  const state: any = createMockState({
    player: {
      name: 'بطل الأبراج',
      lvl: 6,
      kills: 2,
      gold: 6000,
      maxTowerFloor: 5,
    },
    achievements: [],
  });
  const res = evaluateAchievements(state);
  assert.ok(res.newlyUnlocked.length >= 4); // first_blood, tower_initiate, realm_ascendant, wealthy_caravan
  assert.ok(state.achievements.includes('first_blood'));
  assert.ok(state.achievements.includes('tower_initiate'));
  assert.ok(res.totalBonus.atk > 0);
  assert.ok(res.totalBonus.hp > 0);
});

