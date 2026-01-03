import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteractRequest {
  post_id: string;
  type: 'branch' | 'reply' | 'like' | 'share' | 'view';
}

// Rate limit: 20 anonymous interactions per hour per IP (lowered from 100)
const ANONYMOUS_RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  console.log('Post interaction function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const { post_id, type }: InteractRequest = await req.json();

    console.log('Received interaction:', { post_id, type });

    if (!post_id || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing post_id or type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate post_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(post_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid post_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate interaction type
    const validTypes = ['branch', 'reply', 'like', 'share', 'view'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid interaction type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth context
    const authHeader = req.headers.get('Authorization');
    let actor_user_id = null;

    if (authHeader) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (!authError && user) {
        actor_user_id = user.id;
      }
    }

    console.log('Creating interaction for user:', actor_user_id || 'anonymous');

    // Variables for anonymous tracking
    let ipHash: string | null = null;

    // Rate limit anonymous interactions (view/share only)
    if (!actor_user_id && (type === 'view' || type === 'share')) {
      // Get client IP - use cf-connecting-ip first (Cloudflare), then x-forwarded-for
      const clientIP = req.headers.get('cf-connecting-ip') || 
                       (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) || 
                       'unknown';
      
      // Hash the IP for privacy using the database function
      const { data: ipHashData, error: hashError } = await supabaseClient.rpc('hash_ip', { ip_address: clientIP });
      
      if (hashError) {
        console.error('Error hashing IP:', hashError);
        return new Response(
          JSON.stringify({ error: 'Failed to process request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      ipHash = ipHashData as string | null;
      
      if (ipHash) {
        // FIXED: Check rate limit per IP hash, not globally
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
        const { count, error: countError } = await supabaseClient
          .from('post_interactions')
          .select('*', { count: 'exact', head: true })
          .is('user_id', null)
          .eq('ip_hash', ipHash)  // Filter by this specific IP
          .gte('created_at', windowStart);
        
        if (countError) {
          console.error('Error checking rate limit:', countError);
        } else if (count !== null && count >= ANONYMOUS_RATE_LIMIT) {
          console.log('Rate limit exceeded for IP:', ipHash.substring(0, 8) + '...');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Require authentication for like, branch, reply
    if (!actor_user_id && (type === 'like' || type === 'branch' || type === 'reply')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required for this interaction type' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For 'like' type, check if it already exists and toggle it
    if (type === 'like' && actor_user_id) {
      const { data: existing } = await supabaseClient
        .from('post_interactions')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_id', actor_user_id)
        .eq('kind', 'like')
        .maybeSingle();

      if (existing) {
        // Unlike: delete the interaction
        const { error: deleteError } = await supabaseClient
          .from('post_interactions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          console.error('Error removing like:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to remove like' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Decrement likes count and t_score
        await supabaseClient.rpc('decrement_post_likes', { p_post_id: post_id });

        return new Response(
          JSON.stringify({ action: 'unliked', message: 'Like removed successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create the interaction record with ip_hash for anonymous users
    const insertData: Record<string, unknown> = {
      post_id,
      kind: type,
      user_id: actor_user_id,
    };
    
    // Only store ip_hash for anonymous interactions
    if (!actor_user_id && ipHash) {
      insertData.ip_hash = ipHash;
    }

    const { data: interaction, error: interactionError } = await supabaseClient
      .from('post_interactions')
      .insert(insertData)
      .select()
      .maybeSingle();

    // If duplicate key error, treat as success (idempotent operation)
    if (interactionError) {
      if (interactionError.code === '23505') {
        console.log('Interaction already exists, treating as success');
        return new Response(
          JSON.stringify({ 
            message: 'Interaction already recorded',
            action: 'duplicate'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('Error creating interaction:', interactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create interaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Interaction created successfully:', interaction?.id);

    // Update post engagement counters based on interaction type
    switch (type) {
      case 'like': {
        const { error: likeError } = await supabaseClient.rpc('increment_post_likes', { p_post_id: post_id });
        if (likeError) console.error('Error updating likes:', likeError);
        break;
      }

      case 'view': {
        const { error: viewError } = await supabaseClient.rpc('increment_post_views', { p_post_id: post_id });
        if (viewError) console.error('Error updating views:', viewError);
        break;
      }

      case 'share': {
        const { error: shareError } = await supabaseClient.rpc('increment_post_shares', { p_post_id: post_id });
        if (shareError) console.error('Error updating shares:', shareError);
        break;
      }

      case 'reply':
      case 'branch': {
        const { error: commentError } = await supabaseClient.rpc('increment_post_comments', { post_id });
        if (commentError) console.error('Error updating comments:', commentError);
        break;
      }
    }

    return new Response(
      JSON.stringify({ 
        interaction_id: interaction?.id,
        message: 'Interaction recorded successfully' 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
