# Public Business Platform: Vision and Current Issues

## 🎯 The Greater Goal

### Platform Vision

**Public Business** is a dual-mode knowledge-sharing and networking platform that connects **public members** (individuals, thinkers, creators) with **business members** (organizations, companies, decision-makers). The platform serves as a bridge between ideas and innovation, enabling:

1. **Public Members** to:
   - Share "Sparks" (public conversational posts/brainstorms)
   - Build idea timelines with T-score tracking
   - Access premium business content (white papers, investor reports)
   - Compete for "Most Influential" recognition
   - Connect with business leaders in their industries
   - Submit anonymous "Open Ideas" for community consideration

2. **Business Members** to:
   - Share structured "Insights" (business-focused posts with evidence, metrics, goals)
   - Create and manage organizations
   - Build business profiles and company information
   - Network with public members and other businesses
   - Access advanced collaboration tools
   - Publish white papers and exclusive content

### Core Architecture: Two-Pillar System

The platform is built on a **two-pillar architecture** that separates private thinking from public discussion:

#### Pillar #1: **Think (Workspace)**
- **Purpose**: Private, non-social thinking space
- **Storage**: `workspace_thoughts` table
- **Characteristics**:
  - Completely private (user-only, RLS enforced)
  - No social metrics (likes, views, shares)
  - No organization affiliation
  - Never becomes public posts (by design)

#### Pillar #2: **Discuss (Social Space)**
- **Purpose**: Public and business-facing content sharing
- **Storage**: `posts` table (unified)
- **Content Types**:
  - **Sparks** (`kind='brainstorm'`): Public conversational posts
  - **Insights** (`kind='insight'`): Business-structured posts with org affiliation
  - **Open Ideas** (`kind='open_idea'`): Anonymous community submissions
- **Features**:
  - Post lineage/relations (continuations, references, quotes)
  - Organization-scoped content for business insights
  - Public and business visibility modes

### Key Differentiators

1. **Dual-Mode Experience**: Users can switch between Public and Business "lenses" in the Discuss section
2. **Organization System**: Businesses can create organizations, manage members, and share org-scoped insights
3. **Lineage System**: Posts can be linked (hard links for continuations, soft links for references)
4. **T-Score Tracking**: Measures intellectual engagement and idea progression
5. **Influence Recognition**: Leaderboard system for most influential public members

---

## ⚠️ Where Things Are Going Wrong

### Critical Issues (Blocking Core Functionality)

#### 1. **RLS Policy 403 Errors** 🔴 **CRITICAL**

**Problem:**
- Users get 403 (Forbidden) errors when accessing Business Dashboard and Admin Panel
- Queries to `org_members` with joins to `orgs(*)` fail
- Frontend cannot load membership data
- "Owner" badges don't appear
- Business features are inaccessible

**Root Cause:**
- The `orgs` table is missing RLS (Row Level Security) policies
- When querying `SELECT *, org:orgs(*) FROM org_members`, Supabase blocks access to `orgs` because no policy allows members to read their organizations
- The `is_org_member()` function may not be properly configured as SECURITY DEFINER

**Impact:**
- Business Dashboard: Cannot load org membership data
- Admin Panel: Cannot display ownership status
- Organization features: Completely broken for authenticated users
- Business insights: Cannot be created or viewed properly

**Status:** 
- ✅ SQL fix script ready: `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql`
- ⏳ **Needs to be run in Supabase SQL Editor**

#### 2. **Missing Organization Setup** 🔴 **CRITICAL**

**Problem:**
- "Public Business" organization doesn't exist in the database
- User `monojessy25@gmail.com` is not set as owner/admin
- No organization to associate business insights with
- Business features cannot function without an org

**Root Cause:**
- Organization creation flow exists but hasn't been executed
- Initial seed data missing

**Impact:**
- Cannot create business insights (requires `org_id`)
- Cannot test business features
- Admin functionality unavailable
- Business Dashboard has no data to display

**Status:**
- ✅ SQL script ready: `docs/QUICK-FIX-SQL.sql`
- ⏳ **Needs to be run in Supabase SQL Editor**

#### 3. **Business Insights Not Appearing in Discuss** 🟡 **FIXED**

**Problem:**
- Business insights appeared in Research Hub but not in Discuss section
- Feed queries weren't passing `org_id` for business mode

**Status:**
- ✅ **FIXED** - `FeedContainer` now passes `org_id` to feed queries
- ⚠️ Still requires RLS fix (#1) to work properly

#### 4. **Composer Org Selection** 🟡 **FIXED**

**Problem:**
- Users with multiple orgs couldn't select which org to post insights to
- Single-org users had org_id auto-filled, but multi-org users had no UI

**Status:**
- ✅ **FIXED** - `BusinessInsightComposer` now shows org selector for multi-org users
- ⚠️ Still requires RLS fix (#1) and org setup (#2) to work properly

---

## 📊 Current System State

### What's Working ✅

1. **Public Features**
   - Spark creation and sharing
   - Public feed in Discuss section
   - Open Ideas submission
   - User profiles and authentication

2. **Database Schema**
   - All tables created and structured correctly
   - Account types system implemented
   - Organization membership tables exist
   - RLS policies for most tables (except `orgs`)

3. **Frontend Components**
   - Discuss section with lens switching
   - Business Insight Composer with org selector
   - Admin Panel UI (data loading blocked by RLS)
   - Business Dashboard UI (data loading blocked by RLS)
   - Research Hub with Companies tab

4. **Code Architecture**
   - Two-pillar system properly separated
   - Post lineage system implemented
   - Organization hooks and utilities created

### What's Broken 🔴

1. **RLS Policies**
   - `orgs` table missing policies → 403 errors
   - Cannot query org membership data
   - Business features inaccessible

2. **Organization Setup**
   - No "Public Business" org exists
   - No owner/admin assigned
   - Cannot create business insights

3. **Data Flow**
   - Frontend → Backend queries blocked by RLS
   - Membership data cannot load
   - Business dashboard empty/erroring

---

## 🎯 The Path Forward

### Immediate Actions Required (Priority Order)

1. **Run RLS Fix Script** (5 minutes)
   - Execute `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` in Supabase SQL Editor
   - This fixes the 403 errors by adding proper RLS policies to `orgs` table
   - Creates trigger for auto-filling `org_id` for insights
   - Ensures helper functions are SECURITY DEFINER

2. **Create Organization** (2 minutes)
   - Execute `docs/QUICK-FIX-SQL.sql` in Supabase SQL Editor
   - Creates "Public Business" organization
   - Sets `monojessy25@gmail.com` as owner
   - Sets user role to `business_user`

3. **Verify & Test** (10 minutes)
   - Hard refresh browser (Ctrl+Shift+R)
   - Check console for 403 errors (should be none)
   - Verify Business Dashboard loads
   - Verify Admin Panel shows "Owner" badge
   - Test creating a business insight
   - Verify business insights appear in Discuss (Business lens)

### Expected State After Fixes

✅ **No 403 errors** in browser console  
✅ **Business Dashboard** loads membership data  
✅ **Admin Panel** shows ownership status  
✅ **Business insights** can be created and viewed  
✅ **Organization features** fully functional  
✅ **Multi-org users** can select org in composer  
✅ **Single-org users** have org_id auto-filled  

---

## 🏗️ Architecture Summary

### User Types

1. **Public Member** (`user_roles.role = 'public_user'`)
   - Default for all new users
   - Can create Sparks, submit Open Ideas
   - Access to public feed

2. **Business Member** (`user_roles.role = 'business_user'`)
   - Has at least one org membership (`org_members` row exists)
   - Can create Business Insights
   - Access to business feed and org-scoped content

3. **Org Owner** (`org_members.role = 'owner'`)
   - Created the organization or was assigned ownership
   - Can manage org members, approve applications
   - Full admin access to org features

### Key Database Tables

- `orgs` - Organizations (name, status, created_by, etc.)
- `org_members` - Membership linking (org_id, user_id, role)
- `org_member_applications` - Applications to join orgs
- `org_requests` - Organization creation requests (admin approval)
- `user_roles` - User role assignments
- `posts` - All posts (Sparks, Insights, Open Ideas)
- `workspace_thoughts` - Private thinking space

### Key Functions

- `is_admin()` - Check if user is global admin
- `is_org_member(org_id)` - Check membership (SECURITY DEFINER)
- `is_org_admin(org_id)` - Check ownership/admin status (SECURITY DEFINER)
- `get_user_org_id()` - Get primary org for user

---

## 📝 Notes for Developers

### Why These Issues Exist

1. **RLS Policies**: The `orgs` table RLS policies were likely missed during initial migration or were removed/not applied correctly
2. **Organization Setup**: The platform needs an initial "Public Business" organization to function, but this wasn't seeded during setup
3. **Feed Integration**: Business insights feed integration was completed but requires RLS fixes to work

### Why It's Critical

Without these fixes:
- **Business features are completely non-functional**
- **Users cannot access their organization data**
- **Admin functionality is broken**
- **Business insights cannot be created or viewed**
- **The dual-mode experience is broken**

### All Fixes Are Ready

- ✅ SQL scripts are idempotent (safe to run multiple times)
- ✅ Frontend code is already fixed
- ✅ Only database execution is needed
- ✅ No code changes required after SQL execution

---

**Last Updated:** 2025-01-30  
**Status:** Critical fixes ready, pending database execution

