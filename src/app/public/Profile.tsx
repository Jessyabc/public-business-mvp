import { useEffect, useState } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { profileService, type MockProfile } from '@/services/mock';
import { Skeleton } from '@/ui/feedback/Skeleton';
import { User, Building, TrendingUp, Award, Brain } from 'lucide-react';

export function PublicProfile() {
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const userProfile = profileService.getProfile();
      setProfile(userProfile);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-8">
        <Skeleton lines={3} avatar />
        <Skeleton lines={2} />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-8">
        <GlassCard className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Profile Header */}
      <GlassCard>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {profile.displayName}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <Building className="w-4 h-4" />
                <span>{profile.company}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span className="capitalize">{profile.membershipType} Member</span>
              </div>
            </div>
            
            <p className="text-foreground">{profile.bio}</p>
          </div>
        </div>
      </GlassCard>

      {/* Membership Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-muted-foreground">T-Score</span>
            </div>
            <div className="text-3xl font-bold text-primary">{profile.tScore}</div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-muted-foreground">U-Score</span>
            </div>
            <div className="text-3xl font-bold text-primary">{profile.uScore}</div>
          </div>
        </GlassCard>
      </div>

      {/* Recent History */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10">
            <Brain className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Posted new brainstorm about market trends</p>
              <p className="text-xs text-muted-foreground">2 hours ago • +5 T-Score</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Reached 40+ T-Score milestone</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10">
            <Award className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Became an active community member</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}