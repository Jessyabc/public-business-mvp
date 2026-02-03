
# Plan: Fix Build and Verify Auth Data Isolation

## Part 1: Build Fix (Critical - Blocking Publish)

### Issue Identified
The build error occurs in `vite.config.ts` line 23:
```
server.allowedHosts: true
```
In Vite 7.x, the `allowedHosts` type changed from `boolean` to `true | string[]`. TypeScript infers `true` as `boolean` which fails the type check.

### Fix
Change line 23 in `vite.config.ts` from:
```typescript
allowedHosts: true,
```
to:
```typescript
allowedHosts: true as const,
```
This ensures TypeScript treats it as the literal `true` type rather than `boolean`.

---

## Part 2: Auth Data Isolation Audit

### Think Space (Workspace) - VERIFIED SECURE

| Component | Status | Evidence |
|-----------|--------|----------|
| RLS on `workspace_thoughts` | SECURE | `user_id = auth.uid()` on SELECT, INSERT, UPDATE, DELETE |
| RLS on `thought_chains` | SECURE | `user_id = auth.uid()` on SELECT, INSERT, UPDATE, DELETE |
| RLS on `user_settings` | SECURE | `user_id = auth.uid()` on all operations |
| Code queries | SECURE | `useWorkspaceSync.ts` always filters `.eq('user_id', user.id)` |
| Chain sync | SECURE | `useChainSync.ts` always filters `.eq('user_id', user.id)` |

**Conclusion**: Think Space data is properly isolated at both RLS and application layers.

### Discuss Spaces (Posts) - VERIFIED SECURE

| Component | Status | Evidence |
|-----------|--------|----------|
| RLS on `posts` | SECURE | Multiple policies: own posts, public visibility, org-based visibility |
| Feed queries | SECURE | `feedQueries.ts` applies mode/visibility filters |
| Business mode | SECURE | Requires `org_id` + `is_org_member()` check in RLS |

**Conclusion**: Discuss Space data is properly isolated.

---

## Part 3: Potential Data Leakage Vectors (To Harden)

### 3.1 LocalStorage Stale Data
**Risk**: If user A logs out and user B logs in on the same device, localStorage may contain user A's cached thoughts.

**Current State**: `useWorkspaceStore` uses Zustand persist with `pb-workspace` key. On mount, it merges localStorage data with server data.

**Recommended Fix**: Clear localStorage on logout.

### 3.2 React Query Cache
**Risk**: Query cache may persist between user sessions.

**Current State**: No explicit cache clearing on auth state change.

**Recommended Fix**: Clear React Query cache when user changes.

### 3.3 Zustand Store State
**Risk**: In-memory store state persists if user switches accounts without page reload.

**Recommended Fix**: Reset workspace stores on auth state change.

---

## Implementation Roadmap

### Phase 1: Fix Build (Immediate)
1. Update `vite.config.ts` line 23 to use `true as const`
2. Verify build succeeds locally

### Phase 2: Add Auth State Cleanup (Hardening)
1. Create `useAuthCleanup` hook that:
   - Listens to `onAuthStateChange`
   - On SIGNED_OUT or user change: clears localStorage keys
   - Resets Zustand stores
   - Clears React Query cache
2. Integrate hook into `AuthContext` or root layout

### Phase 3: Verification
1. Test login/logout cycle
2. Verify no stale data appears after user switch
3. Confirm feed shows correct posts for each lens

---

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Fix `allowedHosts: true as const` |
| `src/contexts/AuthContext.tsx` | Add cleanup on logout |
| `src/features/workspace/useWorkspaceStore.ts` | Add `resetStore()` action |
| `src/features/workspace/stores/chainStore.ts` | Add `resetChains()` action |

---

## Technical Details

### Vite Config Fix
```typescript
// Before (line 23)
allowedHosts: true,

// After
allowedHosts: true as const,
```

### Auth Cleanup Pattern
```typescript
// In AuthContext or a dedicated hook
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear localStorage
      localStorage.removeItem('pb-workspace');
      localStorage.removeItem('pb-chain-store');
      
      // Reset stores
      useWorkspaceStore.setState({ thoughts: [], activeThoughtId: null });
      useChainStore.setState({ chains: [], activeChainId: null });
      
      // Clear React Query cache
      queryClient.clear();
    }
  });
  
  return () => subscription.unsubscribe();
}, []);
```

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Build fails on `allowedHosts` type | CRITICAL | Fix required |
| Think Space RLS | LOW | Already secure |
| Discuss Spaces RLS | LOW | Already secure |
| LocalStorage stale data | MEDIUM | Hardening recommended |
| React Query cache | MEDIUM | Hardening recommended |

The primary blocker is the Vite config type error. Once fixed, the build will succeed. Data isolation is already enforced at the database level via RLS policies.
