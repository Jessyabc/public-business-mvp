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
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { post_id, rating } = await req.json();

    // Validate inputs
    if (!post_id) {
      return new Response(
        JSON.stringify({ error: 'post_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return new Response(
        JSON.stringify({ error: 'rating must be a number between 1 and 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} rating post ${post_id} with ${rating}`);

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .maybeSingle();

    if (postError || !post) {
      console.error('Post not found:', postError);
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert rating (insert or update)
    const { error: upsertError } = await supabase
      .from('post_utility_ratings')
      .upsert(
        {
          post_id,
          user_id: user.id,
          rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'post_id,user_id',
        }
      );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save rating' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch updated aggregate
    const { data: scoreData, error: scoreError } = await supabase
      .from('view_post_u_score')
      .select('u_score_avg, u_score_count')
      .eq('post_id', post_id)
      .maybeSingle();

    if (scoreError) {
      console.error('Score fetch error:', scoreError);
    }

    console.log(`Rating saved. New aggregate: avg=${scoreData?.u_score_avg}, count=${scoreData?.u_score_count}`);

    return new Response(
      JSON.stringify({
        success: true,
        rating,
        u_score_avg: scoreData?.u_score_avg ?? null,
        u_score_count: scoreData?.u_score_count ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
