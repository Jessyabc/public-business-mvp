import { GlassCard } from '@/ui/components/GlassCard';
import { FileText, Clock } from 'lucide-react';

export function BusinessReports() {
  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Business Reports</h1>
        <p className="text-muted-foreground">Manage and track your published insights</p>
      </div>

      {/* Empty State */}
      <GlassCard className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start sharing your business insights and expertise with the community. 
          Your reports help others learn and grow.
        </p>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Create Your First Report
        </button>
      </GlassCard>

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Total Views</span>
              <span className="text-lg font-semibold">Coming Soon</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="text-lg font-semibold">Coming Soon</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Shares</span>
              <span className="text-lg font-semibold">Coming Soon</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Report Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scheduled Publishing</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Report Templates</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Collaboration Tools</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}