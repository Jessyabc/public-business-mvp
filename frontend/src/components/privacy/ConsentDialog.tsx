import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, BarChart3, Cookie } from 'lucide-react';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_TIMESTAMP_KEY,
  type ConsentPreferences,
} from '@/hooks/useConsent';

interface ConsentDialogProps {
  open: boolean;
  onConsentChange: (preferences: ConsentPreferences) => void;
}

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
      <DialogContent className="max-w-2xl border-[var(--glass-border)] bg-transparent backdrop-blur-none p-0">
        <GlassSurface>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-[var(--text-primary)]">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              Privacy & Cookie Consent
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              We respect your privacy. Choose how we can use cookies and collect data to improve your experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6">
            {/* Essential Cookies */}
            <GlassSurface inset>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Essential</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Required for basic site functionality</p>
                </div>
              </div>
              <Switch 
                checked={preferences.functional} 
                disabled={true}
                  className="opacity-50"
                />
              </div>
            </GlassSurface>

            {/* Analytics */}
            <GlassSurface inset>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Analytics</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Help us understand how you use our site</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => updatePreference('analytics', checked)}
                />
              </div>
            </GlassSurface>

            {/* Marketing */}
            <GlassSurface inset>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Marketing</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Personalized content and advertisements</p>
                </div>
              </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => updatePreference('marketing', checked)}
                />
              </div>
            </GlassSurface>
          </div>

          <DialogFooter className="gap-2">
            <button 
              onClick={handleRejectAll}
              className="glassButton glassButton--muted"
            >
              Reject All
            </button>
            <button 
              onClick={handleCustomSave}
              className="glassButton"
            >
              Save Preferences
            </button>
            <button 
              onClick={handleAcceptAll}
              className="glassButton glassButton--accent"
            >
              Accept All
            </button>
          </DialogFooter>

          <p className="text-xs text-[var(--text-secondary)] mt-4">
            You can change these preferences at any time in your privacy settings. 
            For more information, see our{' '}
            <a href="/privacy-policy" className="text-[var(--accent)] hover:underline">
              Privacy Policy
            </a>.
          </p>
        </GlassSurface>
      </DialogContent>
    </Dialog>
  );
}

// The consent hook has moved to src/hooks/useConsent.ts