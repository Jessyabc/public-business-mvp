/**
 * Hook for managing onboarding state
 * Tracks which areas users have explored and provides methods to manage onboarding
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingState {
  enabled: boolean;
  visitedAreas: string[];
  dismissed: boolean;
}

const DEFAULT_ONBOARDING: OnboardingState = {
  enabled: true,
  visitedAreas: [],
  dismissed: false,
};

export function useOnboarding() {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load onboarding state from user settings
  useEffect(() => {
    if (!user) {
      // Fallback to localStorage for unauthenticated users (edge case)
      const stored = localStorage.getItem('onboarding_state');
      if (stored) {
        try {
          setOnboarding(JSON.parse(stored));
        } catch {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } else {
        setOnboarding(DEFAULT_ONBOARDING);
      }
      setLoading(false);
      return;
    }

    const loadOnboarding = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('preferences')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.preferences && typeof data.preferences === 'object') {
          const prefs = data.preferences as any;
          if (prefs.onboarding) {
            setOnboarding({
              ...DEFAULT_ONBOARDING,
              ...prefs.onboarding,
            });
          } else {
            setOnboarding(DEFAULT_ONBOARDING);
          }
        } else {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err);
        setOnboarding(DEFAULT_ONBOARDING);
      } finally {
        setLoading(false);
      }
    };

    loadOnboarding();
  }, [user]);

  // Save onboarding state to Supabase
  const saveOnboarding = useCallback(async (newOnboarding: OnboardingState): Promise<boolean> => {
    if (!user) {
      // Fallback to localStorage
      localStorage.setItem('onboarding_state', JSON.stringify(newOnboarding));
      setOnboarding(newOnboarding);
      return true;
    }

    setSaving(true);
    try {
      // Get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentPrefs = (currentData?.preferences as any) || {};
      const updatedPrefs = {
        ...currentPrefs,
        onboarding: newOnboarding,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: updatedPrefs,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      setOnboarding(newOnboarding);
      return true;
    } catch (err) {
      console.error('Failed to save onboarding state:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Mark an area as visited
  const markAreaVisited = useCallback(async (areaId: string): Promise<boolean> => {
    if (onboarding.visitedAreas.includes(areaId)) {
      return true; // Already visited
    }

    const newOnboarding = {
      ...onboarding,
      visitedAreas: [...onboarding.visitedAreas, areaId],
    };

    return saveOnboarding(newOnboarding);
  }, [onboarding, saveOnboarding]);

  // Check if an area has been visited
  const hasVisitedArea = useCallback((areaId: string): boolean => {
    return onboarding.visitedAreas.includes(areaId);
  }, [onboarding]);

  // Reset onboarding (clear all visited areas)
  const resetOnboarding = useCallback(async (): Promise<boolean> => {
    const newOnboarding = {
      ...DEFAULT_ONBOARDING,
      enabled: true,
    };
    return saveOnboarding(newOnboarding);
  }, [saveOnboarding]);

  // Check if onboarding is enabled
  const isOnboardingEnabled = useCallback((): boolean => {
    return onboarding.enabled && !onboarding.dismissed;
  }, [onboarding]);

  return {
    onboarding,
    loading,
    saving,
    markAreaVisited,
    hasVisitedArea,
    resetOnboarding,
    isOnboardingEnabled,
  };
}
