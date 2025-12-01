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

    // Create the interaction record
    const { data: interaction, error: interactionError } = await supabaseClient
      .from('post_interactions')
      .insert({
        post_id,
        kind: type,
        user_id: actor_user_id,
      })
      .select()
      .single();

    if (interactionError) {
      console.error('Error creating interaction:', interactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create interaction', details: interactionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Interaction created successfully:', interaction.id);

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

      case 'reply':
      case 'branch': {
        const { error: commentError } = await supabaseClient.rpc('increment_post_comments', { post_id });
        if (commentError) console.error('Error updating comments:', commentError);
        break;
      }
    }

    // TODO: Trigger notification emails for subscribed users
    // This would be implemented in a separate notification service

    return new Response(
      JSON.stringify({ 
        interaction_id: interaction.id,
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