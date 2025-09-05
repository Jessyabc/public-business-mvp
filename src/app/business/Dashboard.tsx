import { useEffect, useState } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { profileService, reportService, type MockProfile, type MockReport } from '@/services/mock';
import { Skeleton, SkeletonList } from '@/ui/feedback/Skeleton';
import { TrendingUp, Users, FileText, Award, Eye, Share2 } from 'lucide-react';

export function BusinessDashboard() {
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [topReports, setTopReports] = useState<MockReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const userProfile = profileService.getProfile();
      const reports = reportService.listReports({ highlightedOnly: true }).slice(0, 3);
      setProfile(userProfile);
      setTopReports(reports);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-8">
        <Skeleton lines={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} lines={3} />
          ))}
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

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
            <div className="text-3xl font-bold text-foreground mb-1">
              {profile?.uScore || 0}
            </div>
            <p className="text-sm text-muted-foreground">U-Score</p>
            <p className="text-xs text-green-500 mt-1">+12 this month</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              1.2K
            </div>
            <p className="text-sm text-muted-foreground">Shares</p>
            <p className="text-xs text-green-500 mt-1">+8% this week</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              7
            </div>
            <p className="text-sm text-muted-foreground">Active Posts</p>
            <p className="text-xs text-green-500 mt-1">2 new this week</p>
          </div>
        </GlassCard>
      </div>

      {/* Top Publications */}
      <GlassCard>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Top 3 Publications</h2>
        </div>
        
        <div className="space-y-3">
          {topReports.map((report, index) => (
            <div 
              key={report.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">#{index + 1}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>2.4K views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-3 h-3" />
                    <span>156 shares</span>
                  </div>
                  <span>{report.readTime} min read</span>
                </div>
              </div>
              
              {report.highlighted && (
                <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  Highlighted
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-left">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground">New Report</p>
            <p className="text-sm text-muted-foreground">Publish insights</p>
          </button>
          
          <button className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-left">
            <Users className="w-6 h-6 text-blue-500 mb-2" />
            <p className="font-medium text-foreground">Manage Team</p>
            <p className="text-sm text-muted-foreground">Add members</p>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}