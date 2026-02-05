 /**
  * Think Space: Search Thoughts Edge Function
  * 
  * Semantic search across workspace thoughts using vector similarity.
  * Calls OpenAI to embed the query, then uses Supabase's search_thoughts RPC.
  * 
  * POST /search-thoughts
  * Body: { query: string, userId: string, limit?: number }
  * 
  * Returns: { success: boolean, results: ThoughtSearchResult[] }
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
     const { query, userId, limit = 10 } = await req.json();
     
     if (!query || typeof query !== 'string') {
       return new Response(
         JSON.stringify({ success: false, error: 'query is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     if (!userId) {
       return new Response(
         JSON.stringify({ success: false, error: 'userId is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Generate embedding for the search query
     const embeddingResponse = await fetch(OPENAI_API_URL, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${OPENAI_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: OPENAI_EMBEDDING_MODEL,
         input: query.slice(0, 8000),
       }),
     });
 
     if (!embeddingResponse.ok) {
       const errorData = await embeddingResponse.text();
       console.error('OpenAI API error:', errorData);
       throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
     }
 
     const embeddingData = await embeddingResponse.json();
     const queryEmbedding = embeddingData.data?.[0]?.embedding;
 
     if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
       throw new Error('Invalid embedding response from OpenAI');
     }
 
     // Create Supabase client with service role
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Call the search_thoughts RPC function
     const { data: results, error: searchError } = await supabase
       .rpc('search_thoughts', {
         query_embedding: queryEmbedding,
         match_threshold: 0.5, // Similarity threshold (0-1, higher = more similar)
         match_count: Math.min(limit, 50), // Cap at 50 results
         search_user_id: userId,
       });
 
     if (searchError) {
       console.error('Search error:', searchError);
       throw new Error('Search query failed');
     }
 
     console.log(`Search "${query.slice(0, 50)}" returned ${results?.length ?? 0} results`);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         results: results || [],
         query,
       }),
       { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Error in search-thoughts:', error);
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });