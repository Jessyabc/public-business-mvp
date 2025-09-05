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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { content, email, notify_on_interaction = false, subscribe_newsletter = false, session_id } = await req.json() as SubmitIdeaRequest;

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    console.log('Processing idea submission from IP:', clientIP);

    // Validate content
    if (!content || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Content must be at least 10 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (content.length > 280) {
      return new Response(
        JSON.stringify({ error: 'Content must be less than 280 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash IP for rate limiting
    const { data: ipHashData } = await supabase.rpc('hash_ip', { ip_address: clientIP });
    const ipHash = ipHashData;

    // Check rate limiting - max 5 submissions per IP per day
    if (ipHash) {
      const { count } = await supabase
        .from('open_ideas')
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

    // Basic spam checks
    const spamWords = ['viagra', 'casino', 'lottery', 'pills', 'sex', 'porn'];
    const lowerContent = content.toLowerCase();
    if (spamWords.some(word => lowerContent.includes(word))) {
      console.log('Spam detected:', content);
      return new Response(
        JSON.stringify({ error: 'Content not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the open idea
    const { data: ideaData, error: ideaError } = await supabase
      .from('open_ideas')
      .insert({
        content: content.trim(),
        email: email || null,
        notify_on_interaction,
        subscribe_newsletter,
        ip_hash: ipHash,
        status: 'pending' // All ideas start as pending for moderation
      })
      .select()
      .single();

    if (ideaError) {
      console.error('Error inserting idea:', ideaError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit idea' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle email subscription if provided
    if (email && subscribe_newsletter) {
      await supabase
        .from('email_subscriptions')
        .upsert({ 
          email: email.toLowerCase(),
          source: 'open_idea_composer'
        })
        .select();
    }

    // Store lead if email provided
    if (email) {
      await supabase
        .from('leads')
        .insert({
          email: email.toLowerCase(),
          source: 'open_idea'
        });
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        event_name: email ? 'share_success_email' : 'share_success_anon',
        session_id: session_id || null,
        properties: {
          has_email: !!email,
          content_length: content.length,
          notify_on_interaction,
          subscribe_newsletter
        },
        ip_hash: ipHash
      });

    console.log('Idea submitted successfully:', ideaData.id);

    return new Response(
      JSON.stringify({
        success: true,
        idea_id: ideaData.id,
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