import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Lightbulb } from 'lucide-react';

interface ComposerSectionProps {
  isVisible: boolean;
}

export function ComposerSection({ isVisible }: ComposerSectionProps) {
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showAccountCTA, setShowAccountCTA] = useState(false);
  const [notifyInteraction, setNotifyInteraction] = useState(false);
  const [subscribeNews, setSubscribeNews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const analytics = useAnalytics();

  // Character limits (configurable)
  const MIN_CHARS = 10;
  const MAX_CHARS = 280;

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = email.length > 0 && emailRegex.test(email);

  // Show email field when user starts typing
  useEffect(() => {
    if (content.length > 0 && !showEmailField && !user) {
      analytics.trackComposerStartedTyping();
      const timer = setTimeout(() => {
        setShowEmailField(true);
        analytics.trackEmailShown();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content.length, showEmailField, user, analytics]);

  // Show checkboxes when email field is visible
  useEffect(() => {
    if (showEmailField && !showCheckboxes) {
      setTimeout(() => setShowCheckboxes(true), 300);
    }
  }, [showEmailField, showCheckboxes]);

  // Show account CTA when valid email is entered
  useEffect(() => {
    if (isValidEmail && !showAccountCTA && !user) {
      analytics.trackEmailValid();
      setTimeout(() => {
        setShowAccountCTA(true);
        analytics.trackCreateAccountShown();
      }, 300);
    } else if (!isValidEmail && showAccountCTA) {
      setShowAccountCTA(false);
    }
  }, [isValidEmail, showAccountCTA, user, analytics]);

  // Prefill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (content.length < MIN_CHARS || content.length > MAX_CHARS) {
      toast({
        title: 'Invalid length',
        description: `Ideas must be between ${MIN_CHARS}-${MAX_CHARS} characters.`,
        variant: 'destructive',
      });
      return;
    }

    // Email validation if provided
    if (email && !isValidEmail) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    analytics.trackShareAttempt();

    try {
      // Use the edge function for submission
      const { data, error } = await supabase.functions.invoke('submit-open-idea', {
        body: {
          content: content.trim(),
          email: email || null,
          notify_on_interaction: notifyInteraction,
          subscribe_newsletter: subscribeNews,
          session_id: (analytics as any).sessionId
        }
      });

      if (error) throw error;

      if (data?.success) {
        setSubmitted(true);
        toast({
          title: 'Spark shared! 🌱',
          description: data.message || 'We\'ll let you know when it gets action.',
        });
      } else {
        throw new Error(data?.error || 'Unknown error');
      }

    } catch (error: unknown) {
      console.error('Error submitting idea:', error);
      let description = 'Failed to submit idea. Please try again.';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setContent('');
    if (!user) {
      setEmail('');
    }
    setNotifyInteraction(false);
    setSubscribeNews(false);
    setShowEmailField(false);
    setShowCheckboxes(false);
    setShowAccountCTA(false);
  };

  if (submitted) {
    return (
      <section className={`py-20 px-6 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-8">
            <div className="scrim" />
            <div className="relative z-10">
              <Lightbulb className="w-16 h-16 text-pb-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-ink-base mb-2">
                Nice. We planted your spark.
              </h3>
              <p className="text-ink-base/70 mb-6">
                Your idea is now live and ready for collaboration.
              </p>
              <Button
                onClick={resetForm}
                variant="outline"
                className="bg-white/80 text-ink-base border border-black/10 hover:bg-white/90"
              >
                Share Another Spark
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={`py-20 px-6 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ink-base mb-4">
              Got a spark of your own?
            </h2>
            <p className="text-ink-base/70 text-lg">
              Drop your idea and watch the community build on it
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="scrim" />
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <Textarea
                  placeholder="Drop your open idea…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none border-pb-blue/20 text-ink-base placeholder:text-ink-base/50"
                  maxLength={MAX_CHARS}
                  required
                />
                <div className="flex justify-between text-sm text-ink-base/60 mt-2">
                  <span>
                    {content.length < MIN_CHARS 
                      ? `${MIN_CHARS - content.length} more characters needed` 
                      : `Perfect length`}
                  </span>
                  <span>{content.length}/{MAX_CHARS}</span>
                </div>
              </div>

              {/* Email field - appears when typing starts */}
              {(showEmailField || user) && !user && (
                <div className={`transition-all duration-300 ${
                  showEmailField ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
                }`}>
                  <Input
                    type="email"
                    placeholder="Enter your email to get notified when someone builds on your spark."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-pb-blue/20 text-ink-base placeholder:text-ink-base/50"
                  />
                </div>
              )}

              {/* Checkboxes - appear after email field */}
              {showCheckboxes && !user && (
                <div className={`space-y-3 transition-all duration-300 ${
                  showCheckboxes ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notify" 
                      checked={notifyInteraction}
                      onCheckedChange={(checked) => setNotifyInteraction(!!checked)}
                    />
                    <Label htmlFor="notify" className="text-sm text-ink-base">
                      Notify me when others interact with my spark.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter" 
                      checked={subscribeNews}
                      onCheckedChange={(checked) => setSubscribeNews(!!checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm text-ink-base">
                      Send me the brightest new sparks from PB.
                    </Label>
                  </div>
                </div>
              )}

              {/* Account creation CTA - appears when valid email entered */}
              {showAccountCTA && (
                <div className={`transition-all duration-300 ${
                  showAccountCTA ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
                }`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      analytics.trackCreateAccountClick();
                      setShowAuthModal(true);
                    }}
                    className="w-full bg-white/80 text-ink-base border border-black/10 hover:bg-white/90"
                  >
                    Create your PB account
                  </Button>
                </div>
              )}

              {/* Share button - always visible */}
              <Button
                type="submit"
                disabled={isSubmitting || content.length < MIN_CHARS || content.length > MAX_CHARS}
                className="w-full bg-pb-blue text-white shadow-pbmd hover:shadow-pblg h-12 text-lg font-medium"
              >
                {isSubmitting ? 'Sharing Spark...' : 'Share Spark'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}