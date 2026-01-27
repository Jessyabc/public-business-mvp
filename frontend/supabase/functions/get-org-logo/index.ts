import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetLogoRequest {
  org_id?: string;
  logo_path?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const { org_id, logo_path }: GetLogoRequest = await req.json();

    // If org_id is provided, fetch the logo_path from database
    let finalLogoPath = logo_path;
    
    if (org_id && !logo_path) {
      const { data: org, error: orgError } = await supabaseClient
        .from('orgs')
        .select('logo_url')
        .eq('id', org_id)
        .single();

      if (orgError || !org) {
        return new Response(
          JSON.stringify({ error: 'Organization not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // logo_url should now contain the path, not full URL
      finalLogoPath = org.logo_url;
    }

    if (!finalLogoPath) {
      return new Response(
        JSON.stringify({ error: 'No logo path provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const expiresIn = 60 * 60; // 1 hour in seconds
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient
      .storage
      .from('avatars')
      .createSignedUrl(finalLogoPath, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed URL', details: signedUrlError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return new Response(
      JSON.stringify({
        url: signedUrlData.signedUrl,
        expires_at: expiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in get-org-logo:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

