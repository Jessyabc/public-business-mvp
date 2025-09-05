import { useProfile } from '@/hooks/useProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { GlassCard } from '@/ui/components/GlassCard';
import { User, Award } from 'lucide-react';

export function PublicProfile() {
  const { profile } = useProfile();

  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Manage your public profile information</p>
      </div>

      {/* Profile Form */}
      <GlassCard>
        <ProfileForm />
      </GlassCard>

      {/* Profile Preview */}
      {profile && (
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Profile Preview</h3>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {profile.display_name || 'Your Name'}
              </h2>
              
              <p className="text-muted-foreground mb-4">
                {profile.bio || 'No bio provided yet. Add one to tell others about yourself!'}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Public Member</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Getting Started */}
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Complete your profile information</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground">Share your first brainstorm</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground">Connect with other members</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}