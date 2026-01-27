/**
 * Hook for persisting user settings to Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  // Notifications
  email_posts: boolean;
  email_comments: boolean;
  email_mentions: boolean;
  email_business_updates: boolean;
  push_posts: boolean;
  push_comments: boolean;
  push_mentions: boolean;
  // Privacy
  profile_visible: boolean;
  show_activity_status: boolean;
  allow_direct_messages: boolean;
  // Preferences
  dark_mode: boolean;
  compact_view: boolean;
  auto_refresh_feed: boolean;
  language: string;
  timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  email_posts: true,
  email_comments: false,
  email_mentions: true,
  email_business_updates: true,
  push_posts: true,
  push_comments: false,
  push_mentions: true,
  profile_visible: true,
  show_activity_status: false,
  allow_direct_messages: true,
  dark_mode: false,
  compact_view: false,
  auto_refresh_feed: true,
  language: 'en-US',
  timezone: 'UTC-08:00',
};

export function useUserSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from DB
  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('preferences')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.preferences) {
          // Merge with defaults to ensure all keys exist
          setPreferences({ ...DEFAULT_PREFERENCES, ...(data.preferences as Partial<UserPreferences>) });
        } else {
          // No settings yet, use defaults
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Update a single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<boolean> => {
    if (!user) return false;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save setting:', err);
      // Revert on error
      setPreferences(preferences);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, preferences]);

  // Update multiple preferences at once
  const updatePreferences = useCallback(async (
    updates: Partial<UserPreferences>
  ): Promise<boolean> => {
    if (!user) return false;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      setPreferences(preferences);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, preferences]);

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    updatePreferences,
  };
}
