

## Comprehensive UI/UX Enhancement Plan

This plan addresses multiple interconnected features: bottom navigation swipe gestures, profile access, spark continuations visualization, business feed improvements, and insights depth display.

---

## Overview

The changes are organized into 6 main work areas:

1. **Bottom Navigation Restructure** - Reduce to 3 visible items with swipe-based profile/business access
2. **Swipe Gesture Navigation** - Mobile swipe gestures on bottom nav bar
3. **Spark Continuations Enhancement** - Up to 5 visible, fading effects, thread hierarchy
4. **Insights Depth UI** - 3-level visual hierarchy (big/medium/small)
5. **Business Feed Fixes** - Trail persistence, tab visibility, redundant button removal, spacing
6. **Feed Spacing & Corner Fixes** - Address cramped layout and double-corner issues

---

## 1. Bottom Navigation Restructure

**Current state:** 4 visible items (Think, Discuss, Plus, Profile)

**Target state:** 3 visible items (Think, Plus, Discuss) with profile accessed via swipe

### Changes to `src/components/navigation/BottomNavigation.tsx`

- Remove the Profile NavLink from the visible mobile navigation
- Keep the Plus button centered
- Show only Think and Discuss as the two main navigation items
- Add a visual indicator (small arrow or dots) suggesting swipe availability
- Desktop navigation remains unchanged (profile icon stays visible)

---

## 2. Swipe Gesture Navigation System

**Behavior:**
- Swipe left-to-right on bottom nav bar opens Profile panel
- Swipe right-to-left returns to previous screen
- For business members: second left-to-right swipe opens Business Dashboard
- Swipe must occur on the bottom menu bar area (not full screen)
- Profile picture in header remains a fallback to access full menu

### New files and changes

1. **Create `src/hooks/useBottomNavSwipe.ts`** - Custom hook for swipe detection
   - Track swipe direction and position
   - Detect if swipe occurred on bottom nav bar
   - Maintain swipe state (prevent consecutive same-direction swipes)
   - Expose navigation callbacks for profile and business panels

2. **Create `src/components/navigation/ProfileSlidePanel.tsx`** - Sliding profile panel
   - Slide-in panel from right side
   - Contains profile sections currently in Profile.tsx
   - Remove "Business Dashboard & Tools" button (move to swipe)
   - Animated entry/exit with framer-motion

3. **Create `src/components/navigation/BusinessSlidePanel.tsx`** - Business interface panel
   - Only visible for business members
   - Contains business dashboard quick actions
   - Accessible via second right swipe from profile panel

4. **Modify `src/components/navigation/BottomNavigation.tsx`**
   - Integrate swipe hook
   - Add touch event handlers for swipe area
   - Render ProfileSlidePanel and BusinessSlidePanel conditionally
   - Track navigation history for "back" swipe functionality

---

## 3. Spark Continuations Enhancement

**Current state:** Shows 3 continuations at depth 1, basic indentation

**Target state:** 
- Up to 5 visible continuations
- Fading effect for 10-15 continuations
- First post of thread is larger/semi-opened (anchor node)
- Swipe up shows continuation with most sparks
- Swipe left shows next second-level continuation

### Changes

1. **Modify `src/features/feed/LineageClusterCard.tsx`**
   - Increase `getTopContinuations` call from 3 to 5
   - Add fade-out effect for items 6-15 (gradual opacity reduction)
   - Make anchor spark card larger with semi-expanded state
   - Add swipe gesture detection for navigation within thread

2. **Modify `src/features/feed/ContinuationCard.tsx`**
   - Add opacity prop for fade effect (controlled by parent)
   - Add size variant (normal/faded) based on position
   - Synchronize expansion animation with scroll speed

3. **Modify `src/lib/clusterUtils.ts`**
   - Update `getTopContinuations` to support up to 5 items
   - Add helper for weighted continuation ordering by t_score

4. **Create `src/components/brainstorm/ThreadSwipeHandler.tsx`**
   - Swipe up: navigate to highest-scoring continuation
   - Swipe left: navigate to next sibling continuation
   - Wrap spark viewer content

---

## 4. Insights Depth UI (3 Levels)

**Current state:** AccordionCard shows uniform sizing

**Target state:** 
- Big: Featured/top insights (full width, expanded preview)
- Medium: Standard insights (normal card)
- Small: Lower priority (compact view)

### Changes

1. **Modify `src/components/posts/AccordionCard.tsx`**
   - Add `depth` prop: 'big' | 'medium' | 'small'
   - Big: larger title, expanded content preview, prominent metrics
   - Medium: current styling (default)
   - Small: compact layout, smaller text, condensed actions
   - Fix double-corner issue (nested border-radius causing artifacts)

2. **Modify `src/components/feeds/BusinessFeed.tsx`**
   - Assign depth based on post score/position in feed
   - First 2 posts: 'big'
   - Next 5 posts: 'medium'
   - Remaining: 'small'

3. **CSS fix for double-corner issue**
   - Review `.glass-low` and `.rounded-*` nesting
   - Ensure inner content doesn't have conflicting border-radius
   - Add `overflow: hidden` where needed

---

## 5. Business Feed Fixes

### 5.1 Remove Redundant Plus Button

**File: `src/pages/Discuss.tsx`** (line 265-277)
- The header already has a Plus button next to profile avatar
- Remove the redundant Plus button from business feed header
- Keep only header Plus button

### 5.2 Feed/Trail Tab Visibility

**File: `src/features/brainstorm/components/BrainstormLayoutShell.tsx`**
- Increase tab button size and contrast
- Add border or stronger background for visibility
- Make "FEED" and "TRAIL" text larger (from `text-xs` to `text-sm`)
- Add subtle glow/shadow for better visibility on both lenses

### 5.3 Trail Persistence Fix

**Current issue:** RightSidebar fetches recent public sparks, doesn't track user's path

**Solution:**
1. **Create `src/stores/trailStore.ts`** - Zustand store for trail
   - Store visited post IDs with timestamps
   - Persist to localStorage
   - Limit to last 20 posts

2. **Modify `src/components/layout/RightSidebar.tsx`**
   - Use trailStore instead of fetching recent brainstorms
   - Display user's actual navigation path
   - Add "Clear Trail" button
   - Show posts in order visited

3. **Track navigation events**
   - Listen for `pb:brainstorm:show-thread` events
   - Add post to trail when viewed
   - Update on navigation

### 5.4 Business Feed Spacing

**File: `src/features/feed/FeedList.tsx` and `src/components/feeds/BusinessFeed.tsx`**
- Increase `space-y-6` to `space-y-8` for feed items
- Add more padding around cards (`p-6` to `p-8`)
- Increase margin between sections

---

## 6. General Feed Spacing & Corner Fixes

### Spacing improvements

**Files affected:**
- `src/features/feed/FeedList.tsx`: Increase `space-y-6` to `space-y-8`
- `src/features/feed/ClusterFeedList.tsx`: Increase `space-y-8` to `space-y-10`
- `src/components/posts/AccordionCard.tsx`: Add more internal padding

### Double-corner fix

**Issue visible in screenshots:** Nested rounded corners creating visual artifacts

**Fix in `src/components/brainstorm/SparkCard.tsx` and `AccordionCard.tsx`:**
- Remove inner border-radius where outer container already has it
- Add `overflow: hidden` to parent containers
- Ensure glass effects don't stack border-radius

---

## Technical Details

### File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/navigation/BottomNavigation.tsx` | Modify | Reduce to 3 items, add swipe detection |
| `src/hooks/useBottomNavSwipe.ts` | Create | Swipe gesture handling |
| `src/components/navigation/ProfileSlidePanel.tsx` | Create | Sliding profile panel |
| `src/components/navigation/BusinessSlidePanel.tsx` | Create | Sliding business panel |
| `src/stores/trailStore.ts` | Create | Trail persistence store |
| `src/components/layout/RightSidebar.tsx` | Modify | Use trail store |
| `src/features/brainstorm/components/BrainstormLayoutShell.tsx` | Modify | Improve tab visibility |
| `src/features/feed/LineageClusterCard.tsx` | Modify | 5 continuations, fading |
| `src/features/feed/ContinuationCard.tsx` | Modify | Opacity/fade support |
| `src/components/posts/AccordionCard.tsx` | Modify | Depth variants, corner fix |
| `src/components/feeds/BusinessFeed.tsx` | Modify | Depth assignment |
| `src/components/brainstorm/SparkCard.tsx` | Modify | Corner fix |
| `src/pages/Profile.tsx` | Modify | Remove business dashboard button |
| `src/pages/Discuss.tsx` | Modify | Remove redundant Plus button |

### Dependencies

- framer-motion (existing) for slide animations
- zustand (existing) for trail persistence store

### Important Considerations

- React Hook Order: All new hooks will be appended at end of hook lists
- Swipe gestures constrained to bottom nav area to prevent conflicts
- Business features only visible to users with appropriate roles
- Trail data persisted to localStorage for session continuity

