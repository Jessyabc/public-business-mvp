import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, Mail, Building, MapPin, Globe, Linkedin, Save } from "lucide-react";

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          website: profile.website,
          linkedin_url: profile.linkedin_url,
          company: profile.company,
          role: profile.role,
          location: profile.location,
        });

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Profile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card backdrop-blur-xl border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Display Name */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {profile?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={profile?.display_name || ''}
              onChange={(e) => updateField('display_name', e.target.value)}
              placeholder="Your display name"
              className="bg-background/50 border-white/10 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile?.bio || ''}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            className="bg-background/50 border-white/10 backdrop-blur-sm"
          />
        </div>

        {/* Professional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company
            </Label>
            <Input
              id="company"
              value={profile?.company || ''}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Your company"
              className="bg-background/50 border-white/10 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={profile?.role || ''}
              onChange={(e) => updateField('role', e.target.value)}
              placeholder="Your role/title"
              className="bg-background/50 border-white/10 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            id="location"
            value={profile?.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="Your location"
            className="bg-background/50 border-white/10 backdrop-blur-sm"
          />
        </div>

        {/* Links */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={profile?.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="bg-background/50 border-white/10 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              value={profile?.linkedin_url || ''}
              onChange={(e) => updateField('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="bg-background/50 border-white/10 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}