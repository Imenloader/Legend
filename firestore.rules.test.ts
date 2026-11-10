import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

test('Firestore rules enforce default deny, verified auth, strict schema, and Dirty Dozen defenses', () => {
  const rules = fs.readFileSync(rulesPath, 'utf8');

  // 1. Rules version 2 & default deny catch-all
  assert.ok(rules.includes("rules_version = '2';"), 'Must use rules_version = 2');
  assert.ok(rules.includes('match /{document=**} {\n      allow read, write: if false;\n    }'), 'Must start with global default-deny catch-all');

  // 2. Verified user & ID hardening primitives
  assert.ok(rules.includes('request.auth.token.email_verified == true'), 'Must require verified email');
  assert.ok(rules.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"), 'Must validate document IDs with regex');

  // 3. Anti-Update-Gap & Shadow Field protection
  assert.ok(rules.includes('isValidGameSave(incoming())'), 'Must validate incoming payload on create and update');
  assert.ok(rules.includes("data.keys().hasOnly(["), 'Must block shadow/ghost fields via hasOnly');
  assert.ok(rules.includes("affectedKeys().hasOnly(["), 'Must restrict update affectedKeys via hasOnly');

  // 4. Temporal & Immutability guards
  assert.ok(rules.includes('incoming().createdAt == request.time'), 'Must enforce server timestamp on create');
  assert.ok(rules.includes('incoming().updatedAt == request.time'), 'Must enforce server timestamp on update');
  assert.ok(rules.includes('incoming().ownerUid == existing().ownerUid'), 'Must enforce ownerUid immutability');
});
