import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitIdeaRequest {
  content: string;
  email?: string;
  notify_on_interaction?: boolean;
  subscribe_newsletter?: boolean;
  session_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user is authenticated - reject if so
    const authHeader = req.headers.get('Authorization') ?? '';
    if (authHeader) {
      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
      if (!authError && user !== null) {
        console.log('Rejecting authenticated user from open ideas:', user.id);
        return new Response(
          JSON.stringify({ error: 'Authenticated users should create Sparks instead of Open Ideas. Please use the Brainstorm composer.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { content, email, notify_on_interaction = false, subscribe_newsletter = false, session_id } = await req.json() as SubmitIdeaRequest;

    // Validate content
    if (!content || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Content must be at least 10 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (content.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Content must be less than 500 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing anonymous idea submission');

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
      // Anonymous user → insert into open_ideas_intake
      tableName = 'open_ideas_intake';

      // Hash IP for rate limiting
      const { data: ipHashData } = await supabaseAdmin.rpc('hash_ip', { ip_address: clientIP });
      const ipHash = ipHashData as string | null;

      // Check rate limiting - max 5 submissions per IP per day
      if (ipHash) {
        const { count } = await supabaseAdmin
          .from('open_ideas_intake')
          .select('*', { count: 'exact', head: true })
          .eq('ip_hash', ipHash)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (count && count >= 5) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again tomorrow.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Basic spam check
      const spamWords = ['viagra', 'casino', 'lottery', 'pills', 'sex', 'porn'];
      const lowerContent = content.toLowerCase();
      if (spamWords.some(word => lowerContent.includes(word))) {
        console.log('Spam detected:', content);
        return new Response(
          JSON.stringify({ error: 'Content not allowed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: ideaData, error: ideaError } = await supabaseAdmin
        .from('open_ideas_intake')
        .insert({
          text: content.trim(),
          ip_hash: ipHash,
          status: 'pending'
        })
        .select()
        .single();

      if (ideaError) {
        console.error('Error inserting anonymous idea:', ideaError);
        return new Response(
          JSON.stringify({ error: 'Failed to submit idea' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    const ideaId = ideaData.id;
    console.log('Anonymous idea submitted:', ideaId);

    // Log analytics event
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_name: 'open_idea_submitted',
        user_id: null,
        properties: {
          target_id: ideaId,
          table: 'open_ideas_intake',
          content_length: content.length,
          is_authenticated: false,
          has_email: !!email,
          notify_on_interaction,
          subscribe_newsletter
        }
      });

    // Handle email subscription if provided
    if (email && subscribe_newsletter) {
      await supabaseAdmin
        .from('email_subscriptions')
        .upsert({ 
          email: email.toLowerCase(),
          source: 'open_idea_composer'
        })
        .select();
    }

    // Store lead if email provided
    if (email) {
      await supabaseAdmin
        .from('leads')
        .insert({
          email: email.toLowerCase(),
          source: 'open_idea'
        });
    }

    console.log('Analytics event logged for idea:', ideaId);

    return new Response(
      JSON.stringify({
        success: true,
        id: ideaId,
        message: 'Your idea has been submitted and is pending review!'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in submit-open-idea:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});