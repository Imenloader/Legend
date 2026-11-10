# Security Specification — Legend of the Immortal East (ملحمة الشرق الخالدة)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched is denied for both `read` and `write`.
2. **Verified Identity**: Only authenticated users with `request.auth != null && request.auth.token.email_verified == true` may create, update, get, or delete their own save document in `/game_saves/{playerId}`.
3. **Strict Path & Ownership Binding**: A save document at `/game_saves/{playerId}` must have `isValidId(playerId)`, `playerId == request.auth.uid`, and `data.ownerUid == request.auth.uid` and `data.playerId == playerId`.
4. **No Blanket Reads / List Queries**: Players only ever fetch their own `/game_saves/{playerId}` document via `get`; `list` is restricted by `resource.data.ownerUid == request.auth.uid`.
5. **Strict Schema & Volumetric Bounds (`isValidGameSave`)**:
   - Exact key allowlist (`hasAll` and `hasOnly` on `['playerId', 'ownerUid', 'playerName', 'lvl', 'gold', 'statePayload', 'signature', 'createdAt', 'updatedAt']`).
   - Every string field enforces `.size()` limits (`playerName <= 40`, `statePayload <= 900000`, `signature <= 64`).
   - Numeric bounds enforced on `lvl` (`1 <= lvl <= 999`) and `gold` (`0 <= gold <= 999999999`).
6. **Temporal & Immutable Field Integrity**:
   - On `create`: `createdAt == request.time && updatedAt == request.time`.
   - On `update`: `ownerUid`, `playerId`, and `createdAt` are immutable (`incoming().field == existing().field`), `updatedAt == request.time`, and `affectedKeys().hasOnly(['playerName', 'lvl', 'gold', 'statePayload', 'signature', 'updatedAt'])`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Writing to `/game_saves/user_1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: Writing to `/game_saves/user_1` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-Tenant Ownership Spoof**: User `user_1` writing to `/game_saves/user_2` or setting `ownerUid: "user_2"` -> `PERMISSION_DENIED`.
4. **Cross-Tenant Read (PII/Save Leak)**: User `user_2` attempting `get` on `/game_saves/user_1` -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: Including `"isAdmin": true` in `/game_saves/user_1` create or update -> `PERMISSION_DENIED`.
6. **ID Poisoning Attack**: Document ID containing illegal characters or exceeding 128 chars -> `PERMISSION_DENIED`.
7. **Denial-of-Wallet Oversized String**: `playerName` with 500 characters (> 40 max) -> `PERMISSION_DENIED`.
8. **Value Poisoning on Update**: Updating `lvl` with a string `"999"` or out-of-range integer `99999` -> `PERMISSION_DENIED`.
9. **Immutable Field Mutation**: Updating `createdAt` or `ownerUid` during an update operation -> `PERMISSION_DENIED`.
10. **Forged Client Timestamp**: Setting `updatedAt` to a past/future timestamp instead of `request.time` -> `PERMISSION_DENIED`.
11. **Missing Required Field on Create**: Omitting `signature` or `statePayload` -> `PERMISSION_DENIED`.
12. **Unauthorized Blanket Collection List**: Listing `/game_saves` without filtering `ownerUid == request.auth.uid` -> `PERMISSION_DENIED`.
