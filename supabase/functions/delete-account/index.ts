import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // User client to verify auth
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing account deletion for user: ${user.id}`);

    // Admin client to delete user data and auth record
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data from all tables (order matters due to FK constraints)
    const tablesToClear = [
      'workspace_thoughts',
      'post_utility_ratings',
      'post_interactions',
      'analytics_events',
      'user_settings',
      'business_invitations', // inviter_id
      'org_requests',
      'org_members',
      'business_profiles',
      // posts will cascade due to user_id
    ];

    for (const table of tablesToClear) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.log(`Note: Could not delete from ${table}: ${error.message}`);
        // Continue - some tables might not have data
      } else {
        console.log(`Deleted user data from ${table}`);
      }
    }

    // Delete posts owned by user
    const { error: postsError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('user_id', user.id);
    
    if (postsError) {
      console.log(`Note: Could not delete posts: ${postsError.message}`);
    } else {
      console.log('Deleted user posts');
    }

    // Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.log(`Note: Could not delete user_roles: ${rolesError.message}`);
    }

    // Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    if (profileError) {
      console.log(`Note: Could not delete profile: ${profileError.message}`);
    }

    // Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted user account: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
