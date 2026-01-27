import { useCallback, useEffect, useState } from 'react';

export interface ConsentPreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export const CONSENT_STORAGE_KEY = 'user-consent-preferences';
export const CONSENT_TIMESTAMP_KEY = 'user-consent-timestamp';

export function useConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);

    if (stored && timestamp) {
      const consentAge = Date.now() - parseInt(timestamp, 10);
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      if (consentAge < thirtyDaysMs) {
        setPreferences(JSON.parse(stored));
      } else {
        setShowDialog(true);
      }
    } else {
      setShowDialog(true);
    }
  }, []);

  const updateConsent = useCallback((prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
    setPreferences(prefs);
  }, []);

  const handleConsentChange = useCallback((prefs: ConsentPreferences) => {
    updateConsent(prefs);
    setShowDialog(false);
  }, [updateConsent]);

  const hasConsent = useCallback(
    (type: keyof ConsentPreferences) => preferences?.[type] ?? false,
    [preferences],
  );

  return {
    preferences,
    showDialog,
    hasConsent,
    updateConsent,
    handleConsentChange,
  };
}
