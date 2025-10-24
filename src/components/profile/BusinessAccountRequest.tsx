import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useAppMode } from "@/contexts/AppModeContext";
import { BusinessProfileForm } from "@/components/business/BusinessProfileForm";
import { toast } from "sonner";

export function BusinessAccountRequest() {
  const { mode } = useAppMode();
  const { profile, loading } = useBusinessProfile();
  const [showForm, setShowForm] = useState(false);

  const getStatusIcon = () => {
    if (!profile) return <Send className="w-4 h-4" />;
    
    switch (profile.status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!profile) return null;
    
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[profile.status as keyof typeof variants] || 'outline'}>
        {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
      </Badge>
    );
  };

  const handleRequestClick = () => {
    if (!profile) {
      setShowForm(true);
    } else if (profile.status === 'rejected') {
      setShowForm(true);
      toast.info("You can update your business profile and resubmit for approval");
    }
  };

  if (loading) {
    return (
      <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
        <CardContent className="p-6">
          <div className="text-center text-[var(--text-primary)]">
            Loading business account status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return <BusinessProfileForm onClose={() => setShowForm(false)} />;
  }

  return (
    <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[var(--text-primary)]">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--text-secondary)]" />
            Business Account
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!profile ? (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Request a business account to access advanced features, create business insights, and connect with other companies.
            </p>
            <Button 
              onClick={handleRequestClick}
              className="w-full bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent)]/80"
            >
              {getStatusIcon()}
              Request Business Account
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-[var(--text-secondary)]">
              <p><strong>Company:</strong> {profile.company_name}</p>
              {profile.status === 'approved' && (
                <p className="text-green-600 mt-2">
                  ✓ Your business account is approved! You can now create business content and send invitations.
                </p>
              )}
              {profile.status === 'pending' && (
                <p className="text-yellow-600 mt-2">
                  ⏱ Your business account request is pending admin approval.
                </p>
              )}
              {profile.status === 'rejected' && (
                <p className="text-red-600 mt-2">
                  ✗ Your business account request was rejected. You can update your profile and resubmit.
                </p>
              )}
            </div>
            
            {(profile.status === 'rejected' || profile.status === 'pending') && (
              <Button 
                onClick={handleRequestClick}
                variant="outline"
                className="w-full border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)]"
              >
                {profile.status === 'rejected' ? 'Update & Resubmit' : 'Edit Request'}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}