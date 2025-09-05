import { useProfile } from '@/hooks/useProfile';
import { GlassCard } from '@/ui/components/GlassCard';
import { TrendingUp, Users, FileText, Award, Eye, Share2 } from 'lucide-react';

export function BusinessDashboard() {
  const { profile } = useProfile();

  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Business Dashboard</h1>
        <p className="text-muted-foreground">Track your business insights and engagement</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">0</div>
            <p className="text-sm text-muted-foreground">Posts</p>
            <p className="text-xs text-muted-foreground mt-1">Start collaborating</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">0</div>
            <p className="text-sm text-muted-foreground">Shares</p>
            <p className="text-xs text-muted-foreground mt-1">Share your ideas</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">0</div>
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="text-xs text-muted-foreground mt-1">Create projects</p>
          </div>
        </GlassCard>
      </div>

      {/* Welcome Section */}
      <GlassCard>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your collaboration journey by sharing your first business insight, 
            connecting with other professionals, and building meaningful projects together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create First Post
            </button>
            <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
              Explore Community
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-left">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground">New Report</p>
            <p className="text-sm text-muted-foreground">Share insights</p>
          </button>
          
          <button className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-left">
            <Users className="w-6 h-6 text-blue-500 mb-2" />
            <p className="font-medium text-foreground">Find Members</p>
            <p className="text-sm text-muted-foreground">Connect with others</p>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}