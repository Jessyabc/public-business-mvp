# Half-Built Features Audit & Action Plan
**Date:** 2025-01-02  
**Status:** Comprehensive audit complete

---

## Executive Summary

This audit identified **12 incomplete features** across the platform, categorized by priority and completion effort. The plan below provides a clear roadmap for either completing or removing these features to maintain code quality and user experience.

---

## 🔴 HIGH PRIORITY - User-Facing Incomplete Features

### 1. **Landing Page Composer Still References Open Ideas**
**Location:** `src/components/landing/ComposerSection.tsx`  
**Issue:** Placeholder text says "Drop your open idea…" and form still references open ideas  
**Impact:** Confusing UX after open ideas removal  
**Effort:** ⚡ Low (15 min)  
**Action:** 
- Update placeholder to "Share your spark of an idea..."
- Remove any open idea submission logic
- Redirect to `/discuss` or show auth prompt instead

---

### 2. **Business Analytics Dashboard - "Coming Soon"**
**Location:** `src/components/dashboard/BusinessMemberDashboard.tsx` (line 242)  
**Issue:** Analytics section shows placeholder with "Analytics Coming Soon"  
**Impact:** Promised feature not delivered, reduces trust  
**Effort:** 🔨 Medium (2-3 days)  
**Options:**
- **Option A:** Remove section entirely until ready
- **Option B:** Implement basic analytics using existing `useOrgAnalytics` hook
- **Option C:** Show "Start posting to see analytics" with link to create insight

**Recommendation:** Option C - Keep UI but make it actionable

---

### 3. **Premium Features - Multiple "Coming Soon" References**
**Locations:** 
- `src/pages/PublicMembers.tsx` (lines 61, 76)
- `src/pages/BusinessMembers.tsx` (line 33)

**Issue:** Premium tiers marked "Coming Soon" with email capture that doesn't work  
**Impact:** User frustration, potential lost revenue  
**Effort:** 🔨 Medium (1-2 days)  
**Options:**
- **Option A:** Remove premium tiers entirely until ready
- **Option B:** Implement email capture and waitlist system
- **Option C:** Hide premium sections behind feature flag

**Recommendation:** Option A - Remove until you have a clear monetization plan

---

### 4. **Business Settings - Empty Privacy & Visibility Tab**
**Location:** `src/pages/BusinessSettings.tsx` (Settings tab)  
**Issue:** Tab exists but only shows "More settings coming soon..."  
**Impact:** Confusing navigation, incomplete feature  
**Effort:** ⚡ Low (30 min)  
**Action:**
- Remove empty tab or add at least one meaningful setting
- Consider: public profile toggle, content visibility defaults

---

## 🟡 MEDIUM PRIORITY - Developer/Internal Features

### 5. **Breadcrumbs Feature - Placeholder Only**
**Location:** `src/components/brainstorm/BrainstormLayout.tsx` (line 126)  
**Issue:** Sidebar shows "Breadcrumbs will go here" placeholder  
**Impact:** Incomplete UI, unclear purpose  
**Effort:** 🔨 Medium (1-2 days)  
**Options:**
- **Option A:** Remove breadcrumbs section entirely
- **Option B:** Implement actual breadcrumb navigation for post lineage
- **Option C:** Replace with "Recent Activity" or "Your Threads"

**Recommendation:** Option C - More useful than breadcrumbs for this use case

---

### 6. **Link Counts - Returns Empty Array**
**Location:** `src/features/brainstorm/adapters/spaceAdapter.ts` (line 52-56)  
**Issue:** `linkCounts()` method always returns empty array with comment "we don't have the proper RPC"  
**Impact:** Missing functionality, UI may show incorrect counts  
**Effort:** 🔨 Medium (1 day)  
**Action:**
- Implement RPC function or direct query to count post_relations
- Or remove link count badges if not needed

---

### 7. **Feed Links Hook - Stub Implementation**
**Location:** `src/features/feed/hooks/useFeedLinks.ts`  
**Issue:** Always returns empty arrays, no actual implementation  
**Impact:** Cross-linking features may not work  
**Effort:** 🔨 Medium (1-2 days)  
**Action:**
- Implement actual query to `post_relations` table
- Or remove if cross-linking handled elsewhere

---

### 8. **Brainstorm Feed - Returns Empty Array**
**Location:** `src/adapters/feedsAdapter.ts` (line 51-53)  
**Issue:** `getBrainstormFeed()` always returns `[]` with comment "removed from sidebar"  
**Impact:** Dead code, potential confusion  
**Effort:** ⚡ Low (5 min)  
**Action:**
- Remove method entirely if not used
- Or implement if needed for future sidebar

---

## 🟢 LOW PRIORITY - Nice to Have / Cleanup

### 9. **Community Page - Mock Data**
**Location:** `src/pages/Community.tsx`  
**Issue:** Uses hardcoded mock data for discussions, contributors, events  
**Impact:** Misleading information, not functional  
**Effort:** 🔨 Medium (2-3 days)  
**Options:**
- **Option A:** Remove page entirely
- **Option B:** Connect to real data (posts, users, events)
- **Option C:** Replace with "Community Guidelines" or "How to Participate"

**Recommendation:** Option C - More useful than fake data

---

### 10. **Swipe Navigation - Implemented but Unclear Usage**
**Location:** `src/hooks/useSwipeNavigation.ts`, `src/components/layout/SwipeNavigationWrapper.tsx`  
**Issue:** Feature exists but unclear where it's used or if it's working  
**Impact:** Potential dead code  
**Effort:** ⚡ Low (30 min)  
**Action:**
- Audit where swipe navigation is actually used
- Remove if unused, document if used

---

### 11. **Error Handling - Console Warnings Only**
**Locations:** Multiple files (see grep results)  
**Issue:** Many errors only logged to console, no user feedback  
**Impact:** Poor UX when things fail silently  
**Effort:** 🔨 Medium (ongoing)  
**Action:**
- Add toast notifications for critical errors
- Add error boundaries for React errors
- Prioritize user-facing features first

---

### 12. **Settings Tab - Team Management Empty**
**Location:** `src/pages/BusinessSettings.tsx` (Team tab)  
**Issue:** Only has button to navigate to `/business-membership`  
**Impact:** Incomplete feature  
**Effort:** ⚡ Low (1 hour)  
**Action:**
- Add team member list inline
- Or remove tab and consolidate into one settings view

---

## 📋 Recommended Action Plan

### Phase 1: Quick Wins (1-2 days)
1. ✅ Fix landing page composer (remove open ideas reference)
2. ✅ Remove empty Business Settings tabs or add content
3. ✅ Remove `getBrainstormFeed()` stub
4. ✅ Audit and document swipe navigation usage

### Phase 2: User Experience (3-5 days)
5. ✅ Remove or hide premium features until ready
6. ✅ Replace "Coming Soon" analytics with actionable message
7. ✅ Replace Community page mock data with real content or guidelines
8. ✅ Add basic error toasts for critical failures

### Phase 3: Feature Completion (1-2 weeks)
9. ✅ Implement link counts functionality
10. ✅ Implement feed links hook
11. ✅ Replace breadcrumbs with "Recent Activity" or remove
12. ✅ Add team management to Business Settings

### Phase 4: Code Quality (Ongoing)
13. ✅ Add error boundaries
14. ✅ Improve error handling throughout
15. ✅ Remove all dead code and stubs

---

## 🎯 Decision Framework

For each incomplete feature, ask:

1. **Is it user-facing?** → High priority
2. **Does it block other features?** → High priority  
3. **Is it easy to remove?** → Remove if not needed
4. **Is it easy to complete?** → Complete if valuable
5. **Is it confusing?** → Remove or hide until ready

---

## 📊 Summary Statistics

- **Total incomplete features:** 12
- **High priority (user-facing):** 4
- **Medium priority (developer):** 4
- **Low priority (cleanup):** 4
- **Estimated total effort:** 2-3 weeks
- **Quick wins available:** 4 features (1-2 days)

---

## 🚀 Next Steps

1. Review this audit with team
2. Prioritize based on business goals
3. Create GitHub issues for each item
4. Start with Phase 1 quick wins
5. Schedule Phase 2-3 based on roadmap

---

**Last Updated:** 2025-01-02  
**Next Review:** After Phase 1 completion

