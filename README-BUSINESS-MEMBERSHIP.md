# Business Membership MVP System

This document describes the MVP business-membership system for Public Business.

## Setup

1. **Set Admin UID Environment Variable**

   Add to your `.env` file:
   ```
   VITE_PUBLIC_ADMIN_UID=your-supabase-user-id-here
   ```

   To find your Supabase user ID:
   - Go to your Supabase dashboard
   - Navigate to Authentication > Users
   - Copy your user ID (UUID)

2. **Run Database Migration**

   The migration file `supabase/migrations/20251117203215_add_business_membership_fields.sql` adds the following fields to the `profiles` table:
   - `request_business_membership` (boolean)
   - `is_business_member` (boolean)
   - `business_profile_id` (uuid, references orgs.id)

   Run the migration using your Supabase CLI or dashboard.

## Features

### 1. Admin Detection

The `isAdmin()` helper function checks if a user ID matches the `VITE_PUBLIC_ADMIN_UID` environment variable.

```typescript
import { isAdmin } from '@/lib/admin';

if (isAdmin(user.id)) {
  // Admin-only logic
}
```

### 2. Business Membership Request

**Route:** `/become-business-member`

Users can submit a business membership request with:
- Company name (required)
- Website
- Industry
- Mission
- Logo URL

On submit:
- Updates `profiles.request_business_membership = true`
- Creates a `business_profiles` record with status 'pending'

### 3. Admin Review Page

**Route:** `/admin/requests`

Only accessible to admins (checked via `isAdmin()`).

Shows all pending business membership requests from:
- `profiles` where `request_business_membership = true`
- `business_profiles` where `status = 'pending'`

### 4. Approval Flow

When admin clicks "Approve":

1. Creates an organization in `orgs` table
2. Inserts org membership in `org_members` with role 'owner'
3. Updates `business_profiles` status to 'approved'
4. Updates `profiles`:
   - `is_business_member = true`
   - `business_profile_id = org.id`
   - `request_business_membership = false`
5. Grants `business_user` role in `user_roles` table

### 5. Business Mode Unlock

**Route:** `/business/dashboard`

When a user has:
- `profile.is_business_member === true`
- `profile.business_profile_id != null`

The app will:
- Automatically set mode to 'business'
- Redirect to `/business/dashboard` on login
- Show business dashboard with org info

### 6. Public Mode (Default)

If `is_business_member === false`, users see the default Public Mode UI.

## Routes

- `/become-business-member` - Request business membership form
- `/admin/requests` - Admin approval dashboard
- `/business/dashboard` - Business member dashboard

## Database Schema

### Profiles Table (new fields)
- `request_business_membership` (boolean, default: false)
- `is_business_member` (boolean, default: false)
- `business_profile_id` (uuid, nullable, references orgs.id)

### Business Profiles Table
- Used to store request details (company_name, website, bio, etc.)
- Status: 'pending' → 'approved'

### Organizations (orgs)
- Created when admin approves a request
- Linked to user via `org_members` table

### Org Members
- Links users to organizations
- Role: 'owner' for approved business members

## Usage

1. User visits `/become-business-member` and submits request
2. Admin visits `/admin/requests` to see pending requests
3. Admin clicks "Approve" on a request
4. User is automatically granted business membership
5. User is redirected to `/business/dashboard` on next login

## Notes

- This is an MVP implementation - no advanced RLS or permissions yet
- Admin detection is simple (ENV variable comparison)
- All business members get 'owner' role in their org
- Business mode is automatically enabled for approved members

