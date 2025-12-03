import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RatingData {
  userRating: number | null;
  averageScore: number | null;
  ratingCount: number;
  isLoading: boolean;
  error: string | null;
}

interface UsePostRatingReturn extends RatingData {
  submitRating: (rating: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePostRating(postId: string): UsePostRatingReturn {
  const { user } = useAuth();
  const [data, setData] = useState<RatingData>({
    userRating: null,
    averageScore: null,
    ratingCount: 0,
    isLoading: true,
    error: null,
  });

  const fetchRatingData = useCallback(async () => {
    if (!postId) return;

    setData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch aggregate score from view
      const { data: scoreData, error: scoreError } = await supabase
        .from('view_post_u_score')
        .select('u_score_avg, u_score_count')
        .eq('post_id', postId)
        .maybeSingle();

      if (scoreError) throw scoreError;

      // Fetch user's rating if logged in
      let userRating: number | null = null;
      if (user) {
        const { data: userRatingData, error: userRatingError } = await supabase
          .from('post_utility_ratings')
          .select('rating')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userRatingError && userRatingError.code !== 'PGRST116') {
          throw userRatingError;
        }

        userRating = userRatingData?.rating ?? null;
      }

      setData({
        userRating,
        averageScore: scoreData?.u_score_avg ?? null,
        ratingCount: scoreData?.u_score_count ?? 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch rating data:', error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load rating data',
      }));
    }
  }, [postId, user]);

  useEffect(() => {
    fetchRatingData();
  }, [fetchRatingData]);

  const submitRating = useCallback(async (rating: number) => {
    if (!user) throw new Error('Must be logged in to rate');
    if (rating < 1 || rating > 10) throw new Error('Rating must be between 1 and 10');

    const { data: result, error } = await supabase.functions.invoke('rate-post', {
      body: {
        post_id: postId,
        rating,
      },
    });

    if (error) {
      console.error('Rate post error:', error);
      throw error;
    }

    // Optimistically update local state
    setData((prev) => ({
      ...prev,
      userRating: rating,
      averageScore: result?.u_score_avg ?? prev.averageScore,
      ratingCount: result?.u_score_count ?? prev.ratingCount,
    }));

    // Refetch to ensure accuracy
    await fetchRatingData();
  }, [postId, user, fetchRatingData]);

  return {
    ...data,
    submitRating,
    refetch: fetchRatingData,
  };
}
