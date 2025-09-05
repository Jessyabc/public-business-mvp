import { useEffect, useState } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { reportService, type MockReport } from '@/services/mock';
import { SkeletonList } from '@/ui/feedback/Skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Eye, Share2, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BusinessReports() {
  const [reports, setReports] = useState<MockReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedOnly, setHighlightedOnly] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const data = reportService.listReports({ highlightedOnly });
      setReports(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightedOnly]);

  const handleToggleFilter = (checked: boolean) => {
    setHighlightedOnly(checked);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Header with Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Reports</h1>
          <p className="text-muted-foreground">Manage and track your published insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="highlighted-toggle" className="text-sm text-muted-foreground">
            Highlighted only
          </Label>
          <Switch
            id="highlighted-toggle"
            checked={highlightedOnly}
            onCheckedChange={handleToggleFilter}
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <GlassCard key={report.id} hover>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
                    {report.highlighted && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        <span>Highlighted</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.summary}
                  </p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(report.publishedAt), { addSuffix: true })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{report.readTime} min read</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-blue-500">
                    <Eye className="w-4 h-4" />
                    <span>2.4K</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-green-500">
                    <Share2 className="w-4 h-4" />
                    <span>156</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {reports.length === 0 && (
        <GlassCard className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {highlightedOnly ? 'No highlighted reports found' : 'No reports yet. Start publishing your insights!'}
          </p>
        </GlassCard>
      )}
    </div>
  );
}