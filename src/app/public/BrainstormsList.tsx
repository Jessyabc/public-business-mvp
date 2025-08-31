import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFreeBrainstorms } from '@/hooks/useOpenIdeas';
import { BrainstormCard } from '@/components/BrainstormCard';
import { SkeletonList } from '@/ui/feedback/Skeleton';
import { Page } from '@/ui/layouts/Page';

export function BrainstormsList() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');
  
  const { data: brainstorms = [], isLoading: loading } = useFreeBrainstorms();

  const handleBrainstormClick = (id: string) => {
    navigate(`/brainstorm/${id}`);
  };

  if (loading) {
    return (
      <Page>
        <div className="space-y-6 pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Free Brainstorms</h1>
            <p className="text-muted-foreground">Loading brainstorms...</p>
          </div>
          <SkeletonList count={3} />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-6 pt-8" role="main">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Free Brainstorms</h1>
          <p className="text-muted-foreground">Explore the latest brainstorms on curated ideas</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {brainstorms.length} brainstorms available
          </div>
        </div>

        {/* Brainstorms List */}
        <div className="space-y-4" aria-live="polite" aria-label="Free brainstorms list">
          {brainstorms.map((brainstorm) => (
            <BrainstormCard
              key={brainstorm.id}
              brainstorm={brainstorm}
              showFreeBadge={true}
              onClick={() => handleBrainstormClick(brainstorm.id)}
            />
          ))}
        </div>

        {brainstorms.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No free brainstorms available yet.</p>
          </div>
        )}
      </div>
    </Page>
  );
}