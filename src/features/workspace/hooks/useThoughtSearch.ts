 /**
  * Think Space: Thought Search Hook
  * 
  * Semantic search across workspace thoughts using OpenAI embeddings.
  * Calls the search-thoughts edge function.
  */
 
 import { useState, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 import type { ThoughtObject } from '../types';
 
 export interface SearchResult {
   id: string;
   content: string;
   similarity: number;
   chain_id: string | null;
   anchored_at: string | null;
   created_at: string;
 }
 
 interface UseThoughtSearchReturn {
   search: (query: string) => Promise<SearchResult[]>;
   results: SearchResult[];
   isSearching: boolean;
   error: string | null;
   clearResults: () => void;
 }
 
 export function useThoughtSearch(): UseThoughtSearchReturn {
   const { user } = useAuth();
   const [results, setResults] = useState<SearchResult[]>([]);
   const [isSearching, setIsSearching] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   const search = useCallback(async (query: string): Promise<SearchResult[]> => {
     if (!user?.id) {
       setError('Must be logged in to search');
       return [];
     }
 
     if (!query.trim()) {
       setResults([]);
       return [];
     }
 
     setIsSearching(true);
     setError(null);
 
     try {
       const { data, error: fnError } = await supabase.functions.invoke('search-thoughts', {
         body: {
           query: query.trim(),
           userId: user.id,
           limit: 20,
         },
       });
 
       if (fnError) {
         throw new Error(fnError.message);
       }
 
       if (!data?.success) {
         throw new Error(data?.error || 'Search failed');
       }
 
       const searchResults = data.results as SearchResult[];
       setResults(searchResults);
       return searchResults;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Search failed';
       console.error('Search error:', message);
       setError(message);
       return [];
     } finally {
       setIsSearching(false);
     }
   }, [user?.id]);
 
   const clearResults = useCallback(() => {
     setResults([]);
     setError(null);
   }, []);
 
   return {
     search,
     results,
     isSearching,
     error,
     clearResults,
   };
 }
 
 /**
  * Hook to trigger embedding generation after anchoring a thought
  */
 export function useEmbedThought() {
   const embedThought = useCallback(async (thoughtId: string): Promise<boolean> => {
     try {
       const { data, error } = await supabase.functions.invoke('embed-thought', {
         body: { thoughtId },
       });
 
       if (error) {
         console.error('Embed error:', error);
         return false;
       }
 
       return data?.success ?? false;
     } catch (err) {
       console.error('Embed error:', err);
       return false;
     }
   }, []);
 
   return { embedThought };
 }