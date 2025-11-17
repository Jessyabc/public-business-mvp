import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePostRequest {
  kind: 'open_idea' | 'brainstorm' | 'brainstorm_continue' | 'insight' | 'white_paper' | 'video_brainstorm' | 'video_insight';
  title?: string;
  content: string;
  parent_post_id?: string;
  tags?: string[];
  represented_org_id?: string;
  media_url?: string;
  meta?: Record<string, any>;
  email?: string;
  notify_on_interaction?: boolean;
  subscribe_newsletter?: boolean;
}

serve(async (req) => {
  console.log('Create post function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const { 
      kind, 
      title, 
      content, 
      parent_post_id, 
      tags = [], 
      represented_org_id, 
      media_url, 
      meta = {},
      email,
      notify_on_interaction = false,
      subscribe_newsletter = false 
    }: CreatePostRequest = await req.json();

    console.log('Received post data:', { kind, title, content: content?.slice(0, 50) + '...' });

    // Validate content based on kind
    const validationRules = {
      open_idea: { minLength: 20, maxLength: 600, titleRequired: false },
      brainstorm: { minLength: 80, maxLength: 2500, titleRequired: false },
      brainstorm_continue: { minLength: 40, maxLength: 1800, titleRequired: false, parentRequired: true },
      insight: { minLength: 300, maxLength: 6000, titleRequired: true },
      white_paper: { minLength: 800, maxLength: 15000, titleRequired: true },
      video_brainstorm: { minLength: 10, maxLength: 1000, titleRequired: false, mediaRequired: true },
      video_insight: { minLength: 100, maxLength: 2000, titleRequired: true, mediaRequired: true },
    };

    const rules = validationRules[kind];
    if (!rules) {
      return new Response(
        JSON.stringify({ error: 'Invalid post kind' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length
    if (content.length < rules.minLength || content.length > rules.maxLength) {
      return new Response(
        JSON.stringify({ 
          error: `Content must be between ${rules.minLength} and ${rules.maxLength} characters` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate title if required
    if (rules.titleRequired && (!title || title.trim().length < 3 || title.trim().length > 120)) {
      return new Response(
        JSON.stringify({ error: 'Title is required and must be 3-120 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate parent for continuation posts
    if ('parentRequired' in rules && rules.parentRequired && !parent_post_id) {
      return new Response(
        JSON.stringify({ error: 'Parent post ID is required for continuation posts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate media for video posts
    if ('mediaRequired' in rules && rules.mediaRequired && !media_url) {
      return new Response(
        JSON.stringify({ error: 'Media URL is required for video posts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tags
    if (tags.length > 8) {
      return new Response(
        JSON.stringify({ error: 'Maximum 8 tags allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth context for authenticated requests
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let author_user_id = null;

    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (!authError && authUser) {
        user = authUser;
        author_user_id = authUser.id;
      }
    }

    // For authenticated users, use client with their auth
    let clientToUse = supabaseClient;
    if (authHeader) {
      clientToUse = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      );
    }

    console.log('Creating post for user:', author_user_id || 'anonymous');

    // Create the post
    const { data: post, error: postError } = await clientToUse
      .from('posts')
      .insert({
        kind,
        title: title?.trim() || null,
        content: content.trim(),
        author_user_id,
        represented_org_id,
        parent_post_id,
        tags,
        media_url,
        meta,
        status: 'pending', // All posts start as pending for moderation
        visibility: 'public', // Default visibility
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return new Response(
        JSON.stringify({ error: 'Failed to create post', details: postError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Post created successfully:', post.id);

    // Handle email subscription for open_idea posts
    if (kind === 'open_idea' && email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        const { error: subscriptionError } = await supabaseClient
          .from('notification_subscriptions')
          .insert({
            email: email.toLowerCase().trim(),
            post_id: post.id,
            notify_on_interaction,
            subscribe_newsletter,
          });

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          // Don't fail the entire request if subscription fails
        } else {
          console.log('Email subscription created for:', email);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        post_id: post.id, 
        status: post.status,
        message: 'Post created successfully and is pending approval' 
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