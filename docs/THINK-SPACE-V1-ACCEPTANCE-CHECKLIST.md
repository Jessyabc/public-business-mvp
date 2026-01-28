# Think Space V1 Acceptance Checklist (Sticky Active Chain)

This checklist is **plan-only** and designed to be used for final V1 sign-off.

---

## 1) Production Blocker — DB Migration for `user_settings.active_chain_id`

### Migration Requirements
- Add `active_chain_id uuid` to `user_settings`.
- Add FK to `thought_chains(id)` with **ON DELETE SET NULL** (recommended).
- RLS must continue to allow `SELECT/INSERT/UPDATE` for `user_id = auth.uid()`.

### Verification (DB)
**Column exists**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name = 'active_chain_id';
```

**FK exists (active_chain_id → thought_chains.id)**
```sql
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_settings'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'active_chain_id';
```
**Expected:** `1 row`

**Upsert succeeds when row doesn’t exist**
```sql
-- Run a normal app flow or manual upsert
-- Confirm row created:
SELECT user_id, active_chain_id
FROM user_settings
WHERE user_id = 'USER_ID_HERE';
```

**Micro-add #1: Orphan guard query**
```sql
SELECT COUNT(*) AS orphan_count
FROM user_settings us
LEFT JOIN thought_chains tc ON tc.id = us.active_chain_id
WHERE us.user_id = 'USER_ID_HERE'
  AND us.active_chain_id IS NOT NULL
  AND tc.id IS NULL;
```
**Expected:** `0`

---

## 2) Sticky Active Chain Behavior (Upsert-on-Demand Safe)

### Acceptance Criteria
- If `active_chain_id` is null (row missing or empty), the app deterministically selects a chain:
  1) Most recently updated chain **by thought event_time** (`COALESCE(anchored_at, created_at)`)
  2) Legacy/default chain
  3) Create a new chain
- After selection, the app **immediately upserts** `active_chain_id`.

### Manual QA
1) Delete your `user_settings` row (or use a new account).
2) Open Think Space.
3) Confirm:
   - A deterministic chain is selected.
   - `user_settings` row is created with `active_chain_id`.
4) Refresh — confirm the same chain is active.

**Micro-add #2: Explicit rule**
> “Most recently updated chain” must be computed from **thought event_time** (`COALESCE(anchored_at, created_at)`), not `updated_at`.

---

## 3) Core Invariant — No Thought Without `chain_id`

### DB Checks (User-scoped)
**All rows**
```sql
SELECT COUNT(*) AS null_chain_count
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
  AND chain_id IS NULL;
```
**Expected:** `0`

**Anchored only**
```sql
SELECT COUNT(*) AS null_chain_count
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
  AND state = 'anchored'
  AND chain_id IS NULL;
```
**Expected:** `0`

**Drafts/active only**
```sql
SELECT COUNT(*) AS null_chain_count
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
  AND state = 'active'
  AND chain_id IS NULL;
```
**Expected:** `0`

**Draft sanity (empty drafts still require `chain_id`)**
```sql
SELECT id, created_at, updated_at, day_key, chain_id
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
  AND state = 'active'
  AND (content IS NULL OR content = '')
ORDER BY created_at DESC
LIMIT 20;
```
**Expected:** Returned rows (if any) have non-null `chain_id`.

---

## 4) Backfill — Legacy Thoughts

### DB Checks
**At least one chain exists**
```sql
SELECT COUNT(*) AS chain_count
FROM thought_chains
WHERE user_id = 'USER_ID_HERE';
```
**Expected:** `>= 1`

**Thought distribution sanity**
```sql
SELECT chain_id, COUNT(*) AS thought_count
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
GROUP BY chain_id
ORDER BY thought_count DESC;
```
**Expected:** Legacy thoughts mostly cluster in a single legacy chain; newer thoughts may span multiple chains.

### Manual QA
1) Open Think Space.
2) Confirm legacy thoughts appear as a single continuous chain.
3) Switch to another chain (if any) and confirm separation.

---

## 5) V1 UI Requirements

### All Chains View
- Chains list exists
- Ordered by last updated event_time of thoughts in that chain (`MAX(COALESCE(anchored_at, created_at))`)
- Preview text shown
- Tap a chain → opens raw chain view

**Optional DB spot-check (ordering):**
```sql
SELECT
  chain_id,
  MAX(COALESCE(anchored_at, created_at)) AS last_event_time,
  COUNT(*) AS thought_count
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
GROUP BY chain_id
ORDER BY last_event_time DESC;
```

### Chain indicator truth
- “Writing to: X” matches the active chain
- Updates on chain switch, pull-to-break, and refresh/login

---

## 6) Gesture Completion (Pull-to-Break)

### Manual QA
1) Scroll past open circle **20 times** → **0 accidental breaks**.
2) Pull-to-break **10 times** → **10/10 success**.
3) Start scrolling near the circle (not on it) → **no break**.
4) Confirm a new chain is created and becomes active immediately.

---

## 7) Timestamp Integrity (V1 Safety Gate)

**Anchored thoughts missing `anchored_at`**
```sql
SELECT COUNT(*) AS anchored_missing_timestamp
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
  AND state = 'anchored'
  AND anchored_at IS NULL;
```
**Expected:** `0` (ideal)

**Ordering spot check**
```sql
SELECT id, anchored_at, created_at
FROM workspace_thoughts
WHERE user_id = 'USER_ID_HERE'
ORDER BY COALESCE(anchored_at, created_at), id
LIMIT 50;
```
**Expected:** deterministic ordering.

---

## 8) Lint / Build Gates

**Must-pass**
- `npm run lint` → **0 errors**
- Warnings are allowed for V1 sign-off only if they are pre-existing or explicitly accepted, and they do not affect chain persistence or ordering.
- `npm run build` → **pass**

---

## Definition of Done (V1)
✅ No thought row without `chain_id` (draft or anchored)
✅ Legacy thoughts backfilled to a single chain
✅ All Chains View exists and functions
✅ Pull-to-break reliably creates + activates chain
✅ “Writing to: X” always correct
✅ Sticky active chain persists across refresh/login
✅ No settings row test passes (upsert-on-demand)
