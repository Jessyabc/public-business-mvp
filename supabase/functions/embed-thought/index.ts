 /**
  * Think Space: Embed Thought Edge Function
  * 
  * Generates OpenAI embeddings for workspace thoughts.
  * Called after a thought is anchored to enable semantic search.
  * 
  * POST /embed-thought
  * Body: { thoughtId: string }
  * 
  * Returns: { success: boolean, embedding?: number[] }
  */
 
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
 const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Get OpenAI API key
     const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
     if (!OPENAI_API_KEY) {
       throw new Error('OPENAI_API_KEY is not configured');
     }
 
     // Get Supabase credentials
     const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error('Supabase credentials not configured');
     }
 
     // Parse request body
     const { thoughtId } = await req.json();
     if (!thoughtId) {
       return new Response(
         JSON.stringify({ success: false, error: 'thoughtId is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Create Supabase client with service role (bypasses RLS)
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Fetch the thought content
     const { data: thought, error: fetchError } = await supabase
       .from('workspace_thoughts')
       .select('id, content, user_id')
       .eq('id', thoughtId)
       .single();
 
     if (fetchError || !thought) {
       console.error('Error fetching thought:', fetchError);
       return new Response(
         JSON.stringify({ success: false, error: 'Thought not found' }),
         { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Skip if content is too short
     if (!thought.content || thought.content.trim().length < 3) {
       return new Response(
         JSON.stringify({ success: true, skipped: true, reason: 'Content too short' }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Generate embedding via OpenAI
     const embeddingResponse = await fetch(OPENAI_API_URL, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${OPENAI_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: OPENAI_EMBEDDING_MODEL,
         input: thought.content.slice(0, 8000), // Limit to ~8k chars
       }),
     });
 
     if (!embeddingResponse.ok) {
       const errorData = await embeddingResponse.text();
       console.error('OpenAI API error:', errorData);
       throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
     }
 
     const embeddingData = await embeddingResponse.json();
     const embedding = embeddingData.data?.[0]?.embedding;
 
     if (!embedding || !Array.isArray(embedding)) {
       throw new Error('Invalid embedding response from OpenAI');
     }
 
     // Store embedding in database
     // Format as pgvector string: [0.1,0.2,0.3,...]
     const embeddingString = `[${embedding.join(',')}]`;
 
     const { error: updateError } = await supabase
       .from('workspace_thoughts')
       .update({ embedding: embeddingString })
       .eq('id', thoughtId);
 
     if (updateError) {
       console.error('Error updating thought with embedding:', updateError);
       throw new Error('Failed to store embedding');
     }
 
     console.log(`Successfully embedded thought ${thoughtId} (${embedding.length} dimensions)`);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         thoughtId,
         dimensions: embedding.length,
       }),
       { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Error in embed-thought:', error);
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });