import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/ui/components/GlassCard';
import { brainstormService, type MockBrainstorm } from '@/services/mock';
import { SkeletonList } from '@/ui/feedback/Skeleton';
import { BrainstormComposer } from './BrainstormComposer';
import { TrendingUp, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BrainstormsList() {
  const [brainstorms, setBrainstorms] = useState<MockBrainstorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const data = brainstormService.listBrainstorms();
      setBrainstorms(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleNewBrainstorm = (text: string) => {
    const newBrainstorm = brainstormService.createBrainstorm(text);
    setBrainstorms([newBrainstorm, ...brainstorms]);
  };

  if (loading) {
    return (
      <div className="pt-8">
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Brainstorms</h1>
        <p className="text-muted-foreground">Explore ideas and join the conversation</p>
      </div>

      {/* Composer */}
      <BrainstormComposer onSubmit={handleNewBrainstorm} />

      {/* Brainstorms List */}
      <div className="space-y-4">
        {brainstorms.map((brainstorm) => (
          <GlassCard key={brainstorm.id} hover>
            <Link 
              to={`/public/brainstorms/${brainstorm.id}`}
              className="block"
            >
              <div className="space-y-3">
                {/* Content */}
                <p className="text-foreground leading-relaxed">
                  {brainstorm.text}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{brainstorm.authorName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(brainstorm.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">{brainstorm.tScore}</span>
                  </div>
                </div>
              </div>
            </Link>
          </GlassCard>
        ))}
      </div>

      {brainstorms.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-muted-foreground">No brainstorms yet. Be the first to share an idea!</p>
        </GlassCard>
      )}
    </div>
  );
}