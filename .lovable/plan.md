

# Plan: Fix Build Failure - TypeScript Return Type Mismatch

## Problem Summary

The build is failing because of a **TypeScript type error** in the `useChainGestures` hook. The function's declared return type doesn't match what it actually returns.

## Root Cause

The `useChainGestures` hook in `src/features/workspace/hooks/useChainGestures.ts` declares this return type:

```text
{
  gestureState: PullGestureState;
  visualOffset: number;
  handlers: GestureHandlers;
}
```

But the function actually returns:

```text
{
  gestureState,
  visualOffset,
  wasGestureConsumed,  ← Missing from type declaration!
  handlers,
}
```

The `OpenCircle` component tries to use `wasGestureConsumed`, but TypeScript sees it as undefined since it's not in the declared type. This breaks the build.

## Fix

Update the return type declaration to include `wasGestureConsumed`.

## Changes Required

### 1. Fix `src/features/workspace/hooks/useChainGestures.ts`

Update lines 52-56 to include `wasGestureConsumed` in the return type:

```typescript
export function useChainGestures({
  onBreak,
  onMerge,
  enabled = true,
}: UseChainGesturesOptions): {
  gestureState: PullGestureState;
  visualOffset: number;
  wasGestureConsumed: () => boolean;  // ADD THIS
  handlers: GestureHandlers;
}
```

### 2. Sync to Frontend Directory

The same file exists at `frontend/src/features/workspace/hooks/useChainGestures.ts` and needs the identical fix.

## Why This Happened

During a recent code change to fix the click-vs-drag detection, the `wasGestureConsumed` function was added to the return object but the TypeScript return type declaration wasn't updated to match.

## Expected Outcome

After this fix:
- The build will complete successfully
- The preview will generate correctly
- You'll be able to publish your project
- The Think Space "Pull-to-break" gesture will work as designed

---

## Technical Details

**Files to modify:**
1. `src/features/workspace/hooks/useChainGestures.ts` — line 55
2. `frontend/src/features/workspace/hooks/useChainGestures.ts` — line 55

**Type of change:** TypeScript type declaration fix (single line addition per file)

