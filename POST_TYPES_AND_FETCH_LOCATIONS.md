# Post Types and Fetch Locations

## Post Type Definitions

### Post `type` Field (from `src/types/post.ts`)
- `'brainstorm'` - Public brainstorming posts
- `'insight'` - Business insights
- `'report'` - Reports (defined but not actively used)
- `'whitepaper'` - Whitepapers (defined but not actively used)
- `'webinar'` - Webinars (defined but not actively used)
- `'video'` - Videos (defined but not actively used)

### Post `kind` Field (from `src/types/post.ts`)
- `'Spark'` - Public brainstorming posts (type='brainstorm')
- `'BusinessInsight'` - Business insights (type='insight', mode='business')
- `'Insight'` - Legacy business insights (for backward compatibility)

### Post `mode` Field
- `'public'` - Public posts (Sparks)
- `'business'` - Business posts (Business Insights)

### Post `visibility` Field
- `'public'` - Visible to everyone
- `'my_business'` - Visible to organization members
- `'other_businesses'` - Visible to other business members
- `'draft'` - Draft posts (not published)

## Canonical Post Types (Actively Used)

### 1. Spark
**Definition:**
- `type`: `'brainstorm'`
- `kind`: `'Spark'`
- `mode`: `'public'`
- `visibility`: `'public'`
- `org_id`: `null`
- **Builder:** `buildSparkPayload()` in `src/lib/posts/builders.ts`

**Where Fetched:**
1. **`src/lib/feedQueries.ts`** - `fetchUniversalFeed()`
   - Filters: `mode='public'`, `visibility='public'`, `kind='Spark'`
   - Used by: Public feed in Discuss page

2. **`src/data/posts.ts`** - `fetchPublicBrainstorms()`
   - Filters: `type='brainstorm'`, `visibility='public'`, `mode='public'`, `status='active'`, `published_at IS NOT NULL`
   - Used by: Legacy brainstorm fetching

3. **`src/features/brainstorm/adapters/spaceAdapter.ts`** - `recent()`
   - Filters: `type='brainstorm'`, `status='active'`
   - Used by: Brainstorm space adapter for recent posts

4. **`src/components/composer/BusinessInsightComposer.tsx`** - `loadSparks()`
   - Filters: `type='brainstorm'`, `kind='Spark'`, `mode='public'`, `visibility='public'`, `status='active'`
   - Used by: Spark selector when creating Business Insights

5. **`src/pages/Research.tsx`** - `fetchData()`
   - Filters: `type='brainstorm'`, `status='active'`, `visibility='public'`
   - Used by: Research page "Sparks" tab

6. **`src/pages/Discuss.tsx`** - `fetchPostById()`
   - Filters: `id=postId`, `status='active'`
   - Used by: Fetching individual post for modal display

7. **`src/hooks/usePosts.ts`** - `fetchPosts()`
   - Filters: `status='active'`, optional `mode` filter
   - Used by: General post fetching hook

8. **`src/hooks/useThreadView.ts`** - `useThreadView()`
   - Filters: `id=postId`, `status='active'`
   - Used by: Thread view for continuations

### 2. Business Insight
**Definition:**
- `type`: `'insight'`
- `kind`: `'BusinessInsight'` (or legacy `'Insight'`)
- `mode`: `'business'`
- `visibility`: `'my_business'` (default, can be `'public'` or `'other_businesses'`)
- `org_id`: Required (UUID)
- **Builder:** `buildBusinessInsightPayload()` in `src/lib/posts/builders.ts`

**Where Fetched:**
1. **`src/lib/feedQueries.ts`** - `fetchUniversalFeed()`
   - Filters: `mode='business'`, `published_at IS NOT NULL`, `kind IN ('BusinessInsight', 'Insight')`
   - Visibility: `'my_business'`, `'other_businesses'`, or `'public'` (depending on org_id)
   - Used by: Business feed in Discuss page

2. **`src/data/posts.ts`** - `fetchOrgInsights()`
   - Filters: `type='insight'`, `visibility='my_business'`, `mode='business'`, `org_id=org_id`, `status='active'`, `published_at IS NOT NULL`
   - Used by: Organization-specific insights fetching

3. **`src/pages/Research.tsx`** - `fetchData()`
   - Filters: `type='insight'`, `status='active'`, `visibility='public'`
   - Used by: Research page "Insights" tab

4. **`src/pages/Insights.tsx`** - Filter logic
   - Filters: `kind='BusinessInsight'`, `mode='business'`, `org_id=activeOrgId`
   - Used by: Insights page for organization

5. **`src/pages/Discuss.tsx`** - `fetchPostById()`
   - Filters: `id=postId`, `status='active'`
   - Used by: Fetching individual post for modal display

6. **`src/hooks/usePosts.ts`** - `fetchPosts()`
   - Filters: `status='active'`, optional `mode='business'` filter
   - Used by: General post fetching hook

7. **`src/hooks/useThreadView.ts`** - `useThreadView()`
   - Filters: `id=postId`, `status='active'`
   - Used by: Thread view for continuations

8. **`src/components/brainstorm/LineageCard.tsx`** - Lineage fetching
   - Filters: Posts related via `post_relations` table
   - Used by: Displaying post lineage/ancestry

## Cross-Linked Posts

**Where Fetched:**
1. **`src/lib/feedQueries.ts`** - `fetchCrossLinkedPosts()`
   - Filters: Posts connected via `post_relations` with `relation_type='cross_link'`
   - Used by: Displaying cross-referenced posts

## Post Relations

**Relation Types (from `src/types/post.ts`):**
- `'origin'` - Continuation (parent → child, same type)
- `'reply'` - Legacy reply (being migrated to 'origin')
- `'quote'` - Quote reference
- `'cross_link'` - Cross-reference (any type combination)

**Where Fetched:**
1. **`src/components/brainstorm/LineageCard.tsx`**
   - Fetches: `post_relations` with `relation_type='origin'` (continuations)
   - Used by: Thread lineage display

2. **`src/lib/feedQueries.ts`** - `fetchCrossLinkedPosts()`
   - Fetches: `post_relations` with `relation_type='cross_link'`
   - Used by: Cross-links section

3. **`src/hooks/useThreadView.ts`**
   - Fetches: `post_relations` with `relation_type='reply'` (legacy, should be 'origin')
   - Used by: Thread view building

## Summary by Location

### Main Feed Queries
- **`src/lib/feedQueries.ts`**
  - `fetchUniversalFeed()` - Main feed query for both public and business modes
  - `fetchCrossLinkedPosts()` - Cross-linked posts

### Legacy/Alternative Queries
- **`src/data/posts.ts`**
  - `fetchPublicBrainstorms()` - Public Sparks
  - `fetchOrgInsights()` - Organization Business Insights

### Adapter Queries
- **`src/features/brainstorm/adapters/spaceAdapter.ts`**
  - `recent()` - Recent brainstorm posts
  - `hardChain()` - Continuation chains
  - `softNeighbors()` - Cross-linked neighbors

### Component-Specific Queries
- **`src/components/composer/BusinessInsightComposer.tsx`**
  - `loadSparks()` - Available Sparks for linking

- **`src/components/brainstorm/LineageCard.tsx`**
  - Lineage queries via `post_relations`

### Page-Specific Queries
- **`src/pages/Discuss.tsx`**
  - `fetchPostById()` - Individual post lookup

- **`src/pages/Research.tsx`**
  - `fetchData()` - Research page with tabs for Sparks/Insights

- **`src/pages/Insights.tsx`**
  - Filter logic for organization insights

### Hook Queries
- **`src/hooks/usePosts.ts`**
  - `fetchPosts()` - General post fetching
  - `fetchPostById()` - Single post lookup

- **`src/hooks/useThreadView.ts`**
  - `useThreadView()` - Thread structure building

## Notes

1. **Backward Compatibility**: The feed query in `fetchUniversalFeed()` includes both `'BusinessInsight'` and `'Insight'` kinds when filtering for business insights.

2. **Published Posts Only**: Business insights require `published_at IS NOT NULL` to appear in feeds.

3. **Status Filter**: All queries filter for `status='active'` to exclude archived/deleted posts.

4. **Legacy Types**: `'report'`, `'whitepaper'`, `'webinar'`, `'video'` are defined in types but not actively used in the codebase.


