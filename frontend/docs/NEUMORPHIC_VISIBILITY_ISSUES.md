# Neumorphic Theme Visibility Issues - Part 1 Analysis

## Summary
Analysis of all neumorphic-themed areas (#EAE6E2 background) to identify white text on light background visibility issues.

## Files with Neumorphic Backgrounds

### 1. src/pages/BusinessDashboard.tsx
**Background:** #EAE6E2 with neumorphic box shadows

**Issues Found:**
- Line 37: `text-muted-foreground` - Icon color might be too light
- Line 39: `text-muted-foreground` - Text might be too light  
- Line 85: Button without explicit text color (uses default which might be white)
- Line 344-350: Button with variant="link" without explicit text color
- Line 374: Button with variant="outline" without explicit text color

**Already Fixed:**
- Tabs have proper colors: `text-[#6B635B]` inactive, `text-[#3A3530]` active
- Card titles have `text-[#3A3530]`
- Card content text has `text-[#6B635B]`
- Some buttons already have `text-[#3A3530]` override

### 2. src/pages/BusinessSettings.tsx
**Background:** #EAE6E2 with neumorphic box shadows

**Issues Found:**
- Line 94: `text-muted-foreground` - Icon color might be too light
- Line 96: `text-muted-foreground` - Text might be too light

**Already Fixed:**
- Tabs have proper colors: `text-[#6B635B]` inactive, `text-[#3A3530]` active
- All other text has explicit dark colors

### 3. src/pages/Admin.tsx
**Background:** #EAE6E2 with neumorphic box shadows

**Issues Found:**
- Line 388: `<h3>` without explicit text color - might inherit white
- Line 351: Button variant="outline" without explicit text color
- Line 411: Button (default variant) without explicit text color - might have white text

**Already Fixed:**
- Most text has explicit `text-[#3A3530]` or `text-[#6B635B]` colors
- Sort buttons have proper color overrides

### 4. src/components/business/BusinessInvitations.tsx
**Needs Check:** This component is used in BusinessDashboard - should check for visibility issues

### 5. Other Components
**Need to check:**
- Any Card components with neumorphic backgrounds
- Badge components on neumorphic backgrounds
- Any components using theme variables (text-foreground, text-muted-foreground) on #EAE6E2

## Pattern to Fix

**Replace:**
- `text-muted-foreground` → `text-[#6B635B]` (for secondary text)
- `text-foreground` → `text-[#3A3530]` (for primary text)  
- Buttons without explicit colors → Add `text-[#3A3530]` or `text-primary` (blue) depending on context
- Headings without colors → Add `text-[#3A3530]`

**Color Guide:**
- Primary text: `#3A3530` (dark brown/black)
- Secondary text: `#6B635B` (medium brown/gray)
- Accent/Links: Use primary blue `#489FE3` or `text-primary`
- Borders: `#D4CEC5` (light brown/gray)

## Next Steps (Part 2)
1. Fix all `text-muted-foreground` instances on neumorphic backgrounds
2. Add explicit text colors to all Buttons on neumorphic backgrounds
3. Add explicit text colors to all headings on neumorphic backgrounds
4. Check and fix BusinessInvitations component
5. Verify all Card content areas have proper text colors

