import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassCard } from '@/ui/components/GlassCard';
import { brainstormService, type MockBrainstorm } from '@/services/mock';
import { BrainstormComposer } from './BrainstormComposer';
import { Skeleton } from '@/ui/feedback/Skeleton';
import { ArrowLeft, TrendingUp, User, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

export function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  const [brainstorm, setBrainstorm] = useState<MockBrainstorm | null>(null);
  const [branches, setBranches] = useState<MockBrainstorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      const data = brainstormService.getBrainstorm(id);
      const branchData = brainstormService.listBranches(id);
      setBrainstorm(data);
      setBranches(branchData);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  const handleNewBranch = (text: string) => {
    if (!id) return;
    const newBranch = brainstormService.createBrainstorm(text, id);
    setBranches([newBranch, ...branches]);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-8">
        <Skeleton lines={1} />
        <Skeleton lines={3} avatar />
        <Skeleton lines={2} />
      </div>
    );
  }

  if (!brainstorm) {
    return (
      <div className="pt-8">
        <GlassCard className="text-center">
          <p className="text-muted-foreground">Brainstorm not found</p>
          <Link to="/public/brainstorms">
            <Button variant="outline" className="mt-4">
              Back to Brainstorms
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Back Button */}
      <Link to="/public/brainstorms">
        <Button variant="ghost" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Brainstorms</span>
        </Button>
      </Link>

      {/* Main Brainstorm */}
      <GlassCard>
        <div className="space-y-4">
          <p className="text-lg text-foreground leading-relaxed">
            {brainstorm.text}
          </p>
          
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
      </GlassCard>

      {/* Reply Composer */}
      <BrainstormComposer
        onSubmit={handleNewBranch}
        placeholder="Continue this brainstorm with your ideas..."
        parentId={brainstorm.id}
      />

      {/* Branches */}
      {branches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Continuations ({branches.length})</span>
          </h3>
          
          {branches.map((branch) => (
            <GlassCard key={branch.id}>
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  {branch.text}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{branch.authorName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">{branch.tScore}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      
      {branches.length === 0 && (
        <GlassCard className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No continuations yet. Be the first to extend this brainstorm!</p>
        </GlassCard>
      )}
    </div>
  );
}