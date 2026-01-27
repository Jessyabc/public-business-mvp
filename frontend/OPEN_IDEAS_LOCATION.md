# Where Open Ideas Live

## Database Tables (Canonical)

Open ideas are stored in **two separate tables** based on whether the submitter is authenticated:

### 1. `open_ideas_user` ✅
- **Purpose**: Authenticated user submissions
- **Location**: `supabase/migrations/`
- **Columns**:
  - `id` (UUID)
  - `text` (content, 10-280 chars)
  - `user_id` (UUID, references auth.users)
  - `status` (enum: 'pending', 'approved', 'spam', 'flagged')
  - `created_at`, `updated_at`
  - `ip_hash` (for rate limiting)

### 2. `open_ideas_intake` ✅
- **Purpose**: Anonymous/unauthenticated submissions
- **Location**: `supabase/migrations/`
- **Columns**:
  - `id` (UUID)
  - `text` (content, 10-280 chars)
  - `email` (optional, for notifications)
  - `status` (enum: 'pending', 'approved', 'spam', 'flagged')
  - `created_at`, `updated_at`
  - `ip_hash` (for rate limiting)
  - `notify_on_interaction` (boolean)
  - `subscribe_newsletter` (boolean)

### 3. `open_ideas_legacy` 🔒
- **Status**: FROZEN (quarantined with deny-all RLS)
- **Purpose**: Legacy data from before the split
- **Action**: Do not use - data has been migrated

## Database Views

### Public Views (Use These)

1. **`open_ideas_public_view`** ✅ **PRIMARY VIEW**
   - **Purpose**: Union of approved ideas from both `open_ideas_user` and `open_ideas_intake`
   - **Used by**: `src/pages/OpenIdeas.tsx` (line 41)
   - **Columns**: `id`, `content`, `source` ('user' or 'intake'), `created_at`
   - **Filter**: Only shows `status = 'approved'`

2. **`my_open_ideas_view`** ✅
   - **Purpose**: Current authenticated user's open ideas
   - **Shows**: User's own ideas from `open_ideas_user` table

### Legacy Views (Deprecated)

3. **`open_ideas_public`** ❌ **DEPRECATED**
   - **Status**: Legacy view - do not use
   - **Replacement**: Use `open_ideas_public_view` instead

4. **`open_ideas_members`** ❓
   - **Status**: Unknown purpose - needs investigation

5. **`open_ideas_teaser`** ❓
   - **Status**: Likely preview/teaser data - needs investigation

## Frontend Components

### Pages
- **`src/pages/OpenIdeas.tsx`**
  - Main page displaying public open ideas
  - Uses `open_ideas_public_view`
  - Implements infinite scroll with pagination

- **`src/pages/OpenIdeaNew.tsx`**
  - Form for creating new open ideas

### Components
- **`src/components/OpenIdeaForm.tsx`**
  - Form component for submitting open ideas
  - Handles both authenticated and anonymous submissions

## Data Flow

### Creating an Open Idea
1. User fills form in `OpenIdeaForm.tsx` or `OpenIdeaNew.tsx`
2. If authenticated → inserts into `open_ideas_user`
3. If anonymous → inserts into `open_ideas_intake`
4. Status defaults to `'pending'`
5. Admin approves → status changes to `'approved'`

### Reading Open Ideas
1. Frontend queries `open_ideas_public_view`
2. View automatically unions approved ideas from both tables
3. Returns: `id`, `content`, `source`, `created_at`

## Related Tables

- **`idea_interactions`**: Interactions (replies, branches, likes) on open ideas
- **`email_subscriptions`**: Newsletter subscriptions from open idea submissions
- **`leads`**: Lead capture from open idea submissions

## Routes

- `/open-ideas` or `/research` → `OpenIdeas.tsx` (displays public ideas)
- `/open-ideas/new` → `OpenIdeaNew.tsx` (create new idea)

## Key Files Reference

```
Database:
├── supabase/migrations/
│   ├── 20250905033731_*.sql (open_ideas_user table)
│   ├── 20251030132832_*.sql (open_ideas_intake table)
│   └── 20251030210033_*.sql (views: open_ideas_public_view)

Frontend:
├── src/pages/
│   ├── OpenIdeas.tsx (main display page)
│   └── OpenIdeaNew.tsx (create form page)
└── src/components/
    └── OpenIdeaForm.tsx (form component)
```

## Important Notes

1. **Always use `open_ideas_public_view`** for reading public ideas (not `open_ideas_public`)
2. **Two tables** = authenticated vs anonymous submissions
3. **Status workflow**: `pending` → `approved` (by admin) → visible in public view
4. **Legacy table** `open_ideas_legacy` is frozen - do not query it


