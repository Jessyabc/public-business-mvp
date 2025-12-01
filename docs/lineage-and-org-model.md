# Lineage and Organization Model - Current State Analysis

## Executive Summary

This document analyzes the current state of lineage/relationship tracking and organization membership in the Public Business app, identifying inconsistencies and proposing a canonical model.

## Current State

### 1. Post Lineage Tables

#### `public.posts` (Canonical Post Table)
- **Purpose**: Primary table for all content types
- **Key columns**: `id`, `user_id`, `org_id`, `type`, `kind`, `mode`, `visibility`, `status`
- **Types**: `'brainstorm'`, `'insight'`, etc.
- **Kinds**: `'Spark'`, `'BusinessInsight'`, `'Insight'`
- **Modes**: `'public'`, `'business'`
- **Status**: Currently used, properly indexed, has RLS

#### `public.post_relations` (Main Lineage Table)
- **Purpose**: Track relationships between posts
- **Schema**:
  - `id` (uuid, primary key)
  - `parent_post_id` (uuid, FK to posts)
  - `child_post_id` (uuid, FK to posts)
  - `relation_type` (text)
  - `created_at` (timestamptz)
- **Current relation types**: Mixed - includes `'hard'`, `'soft'`, `'biz_in'`, `'biz_out'`, `'origin'`, `'reply'`, `'quote'`, `'cross_link'`
- **Indexes**: 
  - `idx_post_relations_parent` on parent_post_id
  - `idx_post_relations_child` on child_post_id
- **RLS**: Enabled with policies for authenticated users
- **Status**: ✅ Currently used by `usePosts`, `BrainstormSupabaseAdapter`

#### `public.idea_links` (Legacy Alternative)
- **Purpose**: Separate lineage tracking with typed entities
- **Schema**:
  - `id` (uuid, primary key)
  - `source_id` (uuid)
  - `source_type` (text: 'open_idea', 'brainstorm', 'business_insight')
  - `target_id` (uuid)
  - `target_type` (text)
  - `created_by` (uuid)
  - `created_at` (timestamptz)
- **Indexes**: Multiple on source/target combinations
- **RLS**: Enabled with separate policies
- **Status**: ⚠️ **DUPLICATE** - Used by `useIdeaLinks` hook but overlaps with post_relations

### 2. Organization & Membership

#### `public.orgs`
- **Purpose**: Organization entities
- **Key columns**: `id`, `name`, `created_by`, `slug`
- **Status**: ✅ Canonical org table

#### `public.org_members`
- **Purpose**: User membership in organizations
- **Schema**:
  - `id` (uuid)
  - `org_id` (uuid, FK to orgs)
  - `user_id` (uuid)
  - `role` (text: 'member', 'business_admin', 'owner')
  - `created_at` (timestamptz)
- **Status**: ✅ Source of truth for membership

#### Helper Functions

**`public.get_user_org_id()`**
- Returns the primary org_id for current user
- Used in: ComposerModal, useUserOrgId hook
- Status: ✅ Exists and is used

**`public.get_primary_org()`**
- Returns primary org (likely duplicate of above)
- Status: ⚠️ Exists but relationship to get_user_org_id unclear

**`public.get_user_org()`**
- Returns user org (likely duplicate of above)
- Status: ⚠️ Exists but relationship to others unclear

**`public.is_business_member()`**
- Boolean check for business membership
- Status: ✅ Exists and documented

**`public.is_org_member(p_org_id)`**
- Boolean check for specific org membership
- Status: ✅ Exists and used in RLS

### 3. Code Usage Analysis

#### Files Using `post_relations`
1. **`src/hooks/usePosts.ts`** (lines 173-255)
   - `createPostWithRelation()` - Creates post and relation
   - `fetchPostRelations()` - Fetches child relations
   - Uses `'hard'` and `'soft'` relation types
   - ✅ Properly validates with `lineageRules.ts`

2. **`supabaseAdapter.ts`** (lines 226-294)
   - `saveEdge()` - Creates relations for brainstorm graph
   - `loadEdgesForNodes()` - Fetches relations
   - Uses `'hard'` and `'soft'` types
   - ✅ Maps to BrainstormEdge interface

3. **RPC Functions**
   - `api_list_brainstorm_edges_for_nodes()` - Reads post_relations
   - `api_create_soft_links()` - Creates soft relations in bulk
   - `api_space_chain_hard()` - Follows hard relation chains

#### Files Using `idea_links` (LEGACY)
1. **`src/hooks/useIdeaLinks.ts`** (entire file)
   - ⚠️ **LEGACY** - Manages idea_links table
   - Provides: fetchLinks, createLink, buildLineageChain
   - Types: 'open_idea', 'brainstorm', 'business_insight'
   - **Problem**: Duplicates post_relations functionality

2. **`src/features/feed/hooks/useFeedLinks.ts`**
   - Currently a stub returning empty data
   - May be intended to replace useIdeaLinks

#### Files Using Org Helpers
1. **`src/components/composer/ComposerModal.tsx`** (line 166)
   - Calls `supabase.rpc('get_user_org_id')` for business insights
   - ✅ Correct usage

2. **`src/features/orgs/hooks/useUserOrgId.ts`**
   - React Query wrapper for `get_user_org_id()`
   - ✅ Correct usage

### 4. Lineage Rules

**`src/lib/lineageRules.ts`**
- Defines `canLink()` validation
- Allowed combinations:
  - Spark ↔ Spark
  - Spark ↔ Business Insight
  - Business Insight ↔ Business Insight
- ✅ Well-defined but only checks 'hard' and 'soft' types
- ❌ Doesn't account for 'origin', 'reply', 'quote', 'cross_link'

## Contradictions & Issues

### Critical Issues

1. **Duplicate Lineage Systems**
   - `post_relations` and `idea_links` both track relationships
   - No migration path between them
   - Different type systems ('hard'/'soft' vs typed entities)

2. **Inconsistent Relation Types**
   - `post_relations.relation_type` has multiple type systems:
     - Brainstorm system: 'hard', 'soft'
     - Semantic system: 'origin', 'reply', 'quote', 'cross_link'
     - Business system: 'biz_in', 'biz_out'
   - No clear documentation of which to use when

3. **Org Helper Duplication**
   - Three functions appear to do the same thing:
     - `get_user_org_id()`
     - `get_primary_org()`
     - `get_user_org()`
   - Unclear which is canonical

### Minor Issues

4. **RLS Policy Inconsistency**
   - Some policies check `user_id = auth.uid()`
   - Others check org membership via `is_org_member()`
   - Business admin permissions inconsistent

5. **Missing Validation**
   - No database-level enforcement of relation_type values
   - `lineageRules.ts` only validates 'hard'/'soft'
   - New types can be added without validation

6. **No Origin Tracking**
   - Despite having 'origin' as a relation type, no code uses it
   - Unclear how to track "this business insight originated from this open idea"

## Recommended Canonical Model

### Single Source of Truth: `post_relations`

**Standardized relation types**:
- `'origin'` - Parent is the origin/source of child (e.g., open idea → business insight)
- `'reply'` - Child is a reply/response to parent
- `'quote'` - Child quotes/references parent
- `'cross_link'` - Bidirectional association

**Deprecated types** (to be migrated):
- `'hard'` → map to `'origin'` or `'reply'` based on context
- `'soft'` → map to `'cross_link'`
- `'biz_in'`, `'biz_out'` → migrate to appropriate semantic type

### Organization Helpers

**Keep as canonical**:
- `get_user_org_id()` - Returns user's primary org
- `is_org_member(p_org_id)` - Checks specific org membership

**Deprecate/merge**:
- `get_primary_org()` → should be alias for `get_user_org_id()`
- `get_user_org()` → should be alias for `get_user_org_id()`

### RLS Alignment

All policies should:
1. Use `auth.uid()` for user identification
2. Use `is_org_member(org_id)` for org access checks
3. Check business_admin role via `org_members.role = 'business_admin'`
4. Be consistent between posts and post_relations

## Migration Strategy

### Phase 1: Documentation & Function Cleanup
1. ✅ Create this document
2. Consolidate org helper functions
3. Create `public.create_post_relation()` function

### Phase 2: Relation Type Standardization
1. Add CHECK constraint for relation_type
2. Migrate existing 'hard'/'soft' to semantic types
3. Update `lineageRules.ts` to validate new types

### Phase 3: Legacy Table Handling
1. Rename `idea_links` to `idea_links_legacy`
2. Add deprecation warnings to `useIdeaLinks`
3. Update code to use `post_relations`

### Phase 4: RLS Consolidation
1. Audit all policies on posts and post_relations
2. Remove contradictory policies
3. Ensure consistent permission model

## Files Requiring Updates

### TypeScript/React
- [ ] `src/hooks/useIdeaLinks.ts` - Deprecate or refactor to use post_relations
- [ ] `src/hooks/usePosts.ts` - Update to use standardized relation types
- [ ] `src/lib/lineageRules.ts` - Add validation for new types
- [ ] `src/features/feed/hooks/useFeedLinks.ts` - Implement using post_relations
- [ ] `supabaseAdapter.ts` - Update to use semantic types

### SQL/Migrations
- [ ] New migration: Standardize relation types
- [ ] New migration: Create create_post_relation() function
- [ ] New migration: Consolidate org helpers
- [ ] New migration: Update RLS policies
- [ ] New migration: Rename idea_links to idea_links_legacy

## Current Metrics

- **Migrations count**: 69 files
- **Tables with RLS**: posts, post_relations, idea_links, org_members, orgs
- **Helper functions**: ~15 (many overlapping)
- **Lineage-related hooks**: 3 (usePosts, useIdeaLinks, useFeedLinks)

---

**Document created**: 2025-01-XX  
**Last updated**: 2025-01-XX  
**Status**: Analysis Complete - Ready for Migration
