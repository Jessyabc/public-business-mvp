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
      <Card className={`glass-card backdrop-blur-xl border transition-all duration-700 ${
        mode === 'public'
          ? 'border-white/20 bg-black/20'
          : 'border-blue-200/30 bg-white/40'
      }`}>
        <CardContent className="p-6">
          <div className={`text-center ${
            mode === 'public' ? 'text-white' : 'text-slate-800'
          }`}>
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
    <Card className={`glass-card backdrop-blur-xl border transition-all duration-700 ${
      mode === 'public'
        ? 'border-white/20 bg-black/20'
        : 'border-blue-200/30 bg-white/40'
    }`}>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${
          mode === 'public' ? 'text-white' : 'text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <Building className={`w-5 h-5 ${
              mode === 'public' ? 'text-white' : 'text-slate-600'
            }`} />
            Business Account
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!profile ? (
          <>
            <p className={`text-sm ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              Request a business account to access advanced features, create business insights, and connect with other companies.
            </p>
            <Button 
              onClick={handleRequestClick}
              className={`w-full transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 border border-blue-500/20'
              }`}
            >
              {getStatusIcon()}
              Request Business Account
            </Button>
          </>
        ) : (
          <>
            <div className={`text-sm ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
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
                className={`w-full transition-all duration-300 ${
                  mode === 'public'
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-blue-200/30 text-blue-600 hover:bg-blue-50/50'
                }`}
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