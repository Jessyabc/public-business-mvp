import { Bell } from 'lucide-react';
import { GlassCard } from '@/ui/components/GlassCard';

export function Notifications() {
  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your activity</p>
      </div>

      {/* Empty State */}
      <GlassCard className="text-center py-12">
        <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          When you start collaborating and engaging with others, 
          you'll see notifications here about likes, comments, and updates.
        </p>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Get real-time updates in browser</p>
            </div>
            <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg">
              Disabled
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">Summary of your weekly activity</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}