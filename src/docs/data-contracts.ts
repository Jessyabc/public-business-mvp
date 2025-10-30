/**
 * DATA CONTRACTS: Frontend Database Access Rules
 * ==============================================
 * 
 * CRITICAL: Frontend code MUST ONLY use Views and RPCs for database access.
 * Direct table reads are forbidden for security and permission isolation.
 * 
 * This file documents the approved data access patterns for the frontend.
 * See docs/README-DB.md for detailed documentation.
 */

/**
 * APPROVED ACCESS PATTERNS
 * ========================
 */

// ✅ CORRECT: Use RPCs for role checks
export const ROLE_CHECK_PATTERN = `
  const { data: role, error } = await supabase.rpc('get_user_role');
  const userRole = role ?? 'public_user';
  
  // Use role for conditional logic
  if (userRole === 'business_member') {
    // Show business features
  }
`;

// ✅ CORRECT: Use views for reading data
export const MY_POSTS_PATTERN = `
  const { data, error } = await supabase
    .from('my_posts_view')
    .select('*')
    .order('created_at', { ascending: false });
`;

export const PUBLIC_IDEAS_PATTERN = `
  const { data, error } = await supabase
    .from('open_ideas_public_view')
    .select('*')
    .order('created_at', { ascending: false });
`;

export const MY_IDEAS_PATTERN = `
  const { data, error } = await supabase
    .from('my_open_ideas_view')
    .select('*')
    .order('created_at', { ascending: false });
`;

// ✅ CORRECT: Use edge functions for writes that require validation
export const SUBMIT_IDEA_PATTERN = `
  const { data, error } = await supabase.functions.invoke('submit-open-idea', {
    body: { 
      content: ideaText,
      email: optionalEmail || null,
      notify_on_interaction: false,
      subscribe_newsletter: !!email
    }
  });
`;

/**
 * FORBIDDEN PATTERNS
 * ==================
 */

// ❌ WRONG: Direct table reads
export const FORBIDDEN_USER_ROLES = `
  // NEVER DO THIS
  const { data } = await supabase.from('user_roles').select('*');
`;

export const FORBIDDEN_DIRECT_POSTS = `
  // NEVER DO THIS for My Posts
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id);
`;

export const FORBIDDEN_DIRECT_IDEAS = `
  // NEVER DO THIS
  const { data } = await supabase
    .from('open_ideas')
    .insert({ content: '...' });
`;

/**
 * APPROVED VIEWS
 * ==============
 */
export const APPROVED_VIEWS = [
  'my_posts_view',           // Current user's posts (brainstorms, insights)
  'my_open_ideas_view',      // Current user's submitted ideas
  'open_ideas_public_view',  // All approved ideas (public access)
  'business_profiles_public',// Approved business profiles (public access)
  'brainstorm_stats',        // Public brainstorm statistics
] as const;

/**
 * APPROVED RPCS
 * =============
 */
export const APPROVED_RPCS = [
  'get_user_role',           // Returns user's role (never null, defaults to 'public_user')
  'get_my_roles',            // Returns array of user's roles
  'get_user_org_id',         // Returns user's primary organization ID
  'is_admin',                // Boolean check for admin status
  'is_business_member',      // Boolean check for business member status
  'is_org_member',           // Boolean check for org membership
] as const;

/**
 * APPROVED EDGE FUNCTIONS
 * =======================
 */
export const APPROVED_EDGE_FUNCTIONS = [
  'submit-open-idea',        // Submit a new open idea (with spam protection)
  'create-post',             // Create a new post with validation
  'interact-post',           // Like, comment, or interact with posts
  'contact-relay',           // Submit contact form (with rate limiting)
] as const;

/**
 * MIGRATION STATUS
 * ===============
 * Last Updated: 2025-01-XX
 * Phase: P2 - Frontend uses views/RPCs exclusively
 * 
 * Completed:
 * ✅ Role checks migrated to get_user_role RPC
 * ✅ My Posts uses my_posts_view
 * ✅ Open Ideas uses views + edge function
 * ✅ Legacy open_ideas table quarantined
 * 
 * Pending:
 * ⏳ Data migration from open_ideas_legacy (Phase 3)
 */

/**
 * TESTING CHECKLIST
 * =================
 * 
 * Before deploying changes that touch data access:
 * 
 * 1. ✅ My Posts loads without RLS errors
 * 2. ✅ Create Brainstorm → appears in My Posts immediately
 * 3. ✅ Submit Open Idea (logged out) → goes to intake table
 * 4. ✅ Submit Open Idea (logged in) → goes to user table
 * 5. ✅ Role checks return valid values
 * 6. ✅ Business features gated by role check
 * 7. ✅ No direct table reads in console/network logs
 */
