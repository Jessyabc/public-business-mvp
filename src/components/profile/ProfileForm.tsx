import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppMode } from "@/contexts/AppModeContext";
import { useToast } from "@/hooks/use-toast";
import { User, Building, MapPin, Globe, Linkedin, Save, Camera, Check, Users, Mail } from "lucide-react";
import { DisconnectButton } from "./DisconnectButton";
import { useUserRoles } from "@/hooks/useUserRoles";
import { BusinessMemberBadge } from "@/components/business/BusinessMemberBadge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  linkedin_url: string | null;
  company: string | null;
  role: string | null;
  location: string | null;
}

export function ProfileForm() {
  const { user } = useAuth();
  const { mode } = useAppMode();
  const { toast } = useToast();
  const { userRoles, refetch: refetchRoles } = useUserRoles();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  
  const isBusiness = userRoles.includes('business_member') || userRoles.includes('admin');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create a new profile if none exists
        const newProfile = {
          id: user?.id || '',
          display_name: user?.user_metadata?.name || '',
          avatar_url: null,
          bio: null,
          website: null,
          linkedin_url: null,
          company: null,
          role: null,
          location: null,
        };
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const handleSave = async () => {
  if (!profile || !user) return;

  setSaving(true);

  try {
    const updatedProfile = {
      id: user.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      website: profile.website,
      linkedin_url: profile.linkedin_url,
      company: profile.company,
      location: profile.location,
      is_completed: true,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(updatedProfile);

    if (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      // Refresh profile data
      await fetchProfile();
    }

  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while updating your profile",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};


  const updateField = (field: keyof Profile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
      setHasChanges(true);
    }
  };

  const handleAcceptInvite = async () => {
    if (!inviteToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite token",
        variant: "destructive",
      });
      return;
    }

    setAcceptingInvite(true);
    try {
      const { error } = await supabase.rpc('consume_invite', { 
        p_token: inviteToken.trim() 
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Welcome to Business Membership! You now have access to business features.",
      });
      
      setInviteToken('');
      await refetchRoles();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invite. Please check your token.",
        variant: "destructive",
      });
    } finally {
      setAcceptingInvite(false);
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
            Loading profile...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card backdrop-blur-xl border transition-all duration-700 ${
      mode === 'public'
        ? 'border-white/20 bg-black/20'
        : 'border-blue-200/30 bg-white/40'
    }`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${
          mode === 'public' ? 'text-white' : 'text-slate-800'
        }`}>
          <User className={`w-5 h-5 ${
            mode === 'public' ? 'text-white' : 'text-slate-600'
          }`} />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Display Name */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className={`text-lg ${
              mode === 'public' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-blue-500/20 text-blue-600'
            }`}>
              {profile?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="display_name" className={mode === 'public' ? 'text-white' : 'text-slate-700'}>
              Display Name
            </Label>
            <Input
              id="display_name"
              value={profile?.display_name || ''}
              onChange={(e) => updateField('display_name', e.target.value)}
              placeholder="Your display name"
              className={`backdrop-blur-sm transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className={mode === 'public' ? 'text-white' : 'text-slate-700'}>
            Bio
          </Label>
          <Textarea
            id="bio"
            value={profile?.bio || ''}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            className={`backdrop-blur-sm transition-all duration-300 ${
              mode === 'public'
                ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* Professional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company" className={`flex items-center gap-2 ${
              mode === 'public' ? 'text-white' : 'text-slate-700'
            }`}>
              <Building className={`w-4 h-4 ${
                mode === 'public' ? 'text-white' : 'text-slate-600'
              }`} />
              Company
            </Label>
            <Input
              id="company"
              value={profile?.company || ''}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Your company"
              className={`backdrop-blur-sm transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
              }`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className={mode === 'public' ? 'text-white' : 'text-slate-700'}>
              Role
            </Label>
            <Input
              id="role"
              value={profile?.role || ''}
              onChange={(e) => updateField('role', e.target.value)}
              placeholder="Your role/title"
              className={`backdrop-blur-sm transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className={`flex items-center gap-2 ${
            mode === 'public' ? 'text-white' : 'text-slate-700'
          }`}>
            <MapPin className={`w-4 h-4 ${
              mode === 'public' ? 'text-white' : 'text-slate-600'
            }`} />
            Location
          </Label>
          <Input
            id="location"
            value={profile?.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="Your location"
            className={`backdrop-blur-sm transition-all duration-300 ${
              mode === 'public'
                ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
            }`}
          />
        </div>

        {/* Links */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website" className={`flex items-center gap-2 ${
              mode === 'public' ? 'text-white' : 'text-slate-700'
            }`}>
              <Globe className={`w-4 h-4 ${
                mode === 'public' ? 'text-white' : 'text-slate-600'
              }`} />
              Website
            </Label>
            <Input
              id="website"
              value={profile?.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className={`backdrop-blur-sm transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
              }`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className={`flex items-center gap-2 ${
              mode === 'public' ? 'text-white' : 'text-slate-700'
            }`}>
              <Linkedin className={`w-4 h-4 ${
                mode === 'public' ? 'text-white' : 'text-slate-600'
              }`} />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              value={profile?.linkedin_url || ''}
              onChange={(e) => updateField('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`backdrop-blur-sm transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  : 'bg-white/50 border-blue-200/30 text-slate-800 placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className={`flex-1 transition-all duration-300 ${
              mode === 'public'
                ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 disabled:opacity-50'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 border border-blue-500/20 disabled:opacity-50'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </Button>
          
          {hasChanges && (
            <Button 
              variant="outline"
              onClick={fetchProfile}
              className={`transition-all duration-300 ${
                mode === 'public'
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-blue-200/30 text-slate-600 hover:bg-blue-50/50'
              }`}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Business Membership Section */}
        <Collapsible>
          <CollapsibleTrigger className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
            mode === 'public'
              ? 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
              : 'bg-blue-50/50 border border-blue-200/30 text-slate-700 hover:bg-blue-50'
          }`}>
            <div className="flex items-center gap-2">
              <Users className={`w-5 h-5 ${
                mode === 'public' ? 'text-white' : 'text-blue-600'
              }`} />
              <span className="font-medium">Business Membership</span>
              {isBusiness && <BusinessMemberBadge />}
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              isBusiness
                ? 'bg-green-500/20 text-green-600'
                : 'bg-yellow-500/20 text-yellow-600'
            }`}>
              {isBusiness ? 'Active' : 'Invite-Only'}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            {isBusiness ? (
              <div className={`p-4 rounded-lg ${
                mode === 'public'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <BusinessMemberBadge />
                  <span className={`text-sm font-medium ${
                    mode === 'public' ? 'text-green-400' : 'text-green-700'
                  }`}>
                    Business Member Active
                  </span>
                </div>
                <p className={`text-sm ${
                  mode === 'public' ? 'text-green-300' : 'text-green-600'
                }`}>
                  You have access to business features, can create business posts, and send invitations to other users.
                </p>
                <Button 
                  onClick={() => window.open('/business-profile', '_blank')}
                  variant="outline"
                  size="sm"
                  className={`mt-3 ${
                    mode === 'public'
                      ? 'border-green-400/20 text-green-400 hover:bg-green-400/10'
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Edit Business Profile
                </Button>
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${
                mode === 'public'
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  mode === 'public' ? 'text-yellow-400' : 'text-yellow-700'
                }`}>
                  Business Membership (Invite-Only)
                </h4>
                <p className={`text-sm mb-4 ${
                  mode === 'public' ? 'text-yellow-300' : 'text-yellow-600'
                }`}>
                  Business membership is invite-only. If you have an invite token, paste it below to upgrade your account.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="Paste your invite token here..."
                      className={`flex-1 ${
                        mode === 'public'
                          ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                          : 'bg-white border-yellow-200 text-slate-800'
                      }`}
                    />
                    <Button 
                      onClick={handleAcceptInvite}
                      disabled={acceptingInvite || !inviteToken.trim()}
                      className={
                        mode === 'public'
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }
                    >
                      {acceptingInvite ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                  <p className={`text-xs ${
                    mode === 'public' ? 'text-yellow-300/80' : 'text-yellow-600/80'
                  }`}>
                    Need an invite? Ask an existing business member or admin to send you one.
                  </p>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Disconnect Button */}
        <DisconnectButton />
      </CardContent>
    </Card>
  );
}