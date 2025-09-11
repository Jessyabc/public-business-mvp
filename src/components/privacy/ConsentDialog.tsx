import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, BarChart3, Cookie } from 'lucide-react';

interface ConsentPreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface ConsentDialogProps {
  open: boolean;
  onConsentChange: (preferences: ConsentPreferences) => void;
}

const CONSENT_STORAGE_KEY = 'user-consent-preferences';
const CONSENT_TIMESTAMP_KEY = 'user-consent-timestamp';

export function ConsentDialog({ open, onConsentChange }: ConsentDialogProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    functional: true, // Essential for app functionality
    marketing: false,
  });

  const handleAcceptAll = () => {
    const allConsent = { analytics: true, functional: true, marketing: true };
    savePreferences(allConsent);
    onConsentChange(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent = { analytics: false, functional: true, marketing: false };
    savePreferences(minimalConsent);
    onConsentChange(minimalConsent);
  };

  const handleCustomSave = () => {
    savePreferences(preferences);
    onConsentChange(preferences);
  };

  const savePreferences = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Shield className="h-5 w-5 text-blue-400" />
            Privacy & Cookie Consent
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            We respect your privacy. Choose how we can use cookies and collect data to improve your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          {/* Essential Cookies */}
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-5 w-5 text-blue-400" />
                <div>
                  <h4 className="font-medium text-white">Essential</h4>
                  <p className="text-sm text-blue-200">Required for basic site functionality</p>
                </div>
              </div>
              <Switch 
                checked={preferences.functional} 
                disabled={true}
                className="opacity-50"
              />
            </div>
          </Card>

          {/* Analytics */}
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-green-400" />
                <div>
                  <h4 className="font-medium text-white">Analytics</h4>
                  <p className="text-sm text-blue-200">Help us understand how you use our site</p>
                </div>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => updatePreference('analytics', checked)}
              />
            </div>
          </Card>

          {/* Marketing */}
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-purple-400" />
                <div>
                  <h4 className="font-medium text-white">Marketing</h4>
                  <p className="text-sm text-blue-200">Personalized content and advertisements</p>
                </div>
              </div>
              <Switch 
                checked={preferences.marketing} 
                onCheckedChange={(checked) => updatePreference('marketing', checked)}
              />
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleRejectAll}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Reject All
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCustomSave}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Save Preferences
          </Button>
          <Button 
            onClick={handleAcceptAll}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept All
          </Button>
        </DialogFooter>

        <p className="text-xs text-blue-300 mt-4">
          You can change these preferences at any time in your privacy settings. 
          For more information, see our{' '}
          <a href="/privacy-policy" className="text-blue-400 hover:underline">
            Privacy Policy
          </a>.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing consent preferences
export function useConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
    
    if (stored && timestamp) {
      const consentAge = Date.now() - parseInt(timestamp);
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      if (consentAge < thirtyDaysMs) {
        // Use existing consent if less than 30 days old
        setPreferences(JSON.parse(stored));
      } else {
        // Show dialog if consent is stale
        setShowDialog(true);
      }
    } else {
      // No consent found, show dialog
      setShowDialog(true);
    }
  }, []);

  const handleConsentChange = (prefs: ConsentPreferences) => {
    setPreferences(prefs);
    setShowDialog(false);
  };

  const hasConsent = (type: keyof ConsentPreferences): boolean => {
    return preferences?.[type] ?? false;
  };

  const updateConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
    setPreferences(prefs);
  };

  return {
    preferences,
    showDialog,
    hasConsent,
    updateConsent,
    ConsentDialog: () => (
      <ConsentDialog 
        open={showDialog} 
        onConsentChange={handleConsentChange} 
      />
    )
  };
}