import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrainstormForm } from '@/components/brainstorms/BrainstormForm';
import { useBrainstorms, type Brainstorm } from '@/hooks/useBrainstorms';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrainstormEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBrainstorm, updateBrainstorm } = useBrainstorms();
  const { user } = useAuth();
  const [brainstorm, setBrainstorm] = useState<Brainstorm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrainstorm = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      const data = await getBrainstorm(id);
      if (!data) {
        setError('Brainstorm not found');
      } else if (user && data.author_user_id !== user.id) {
        setError('You do not have permission to edit this brainstorm');
      } else {
        setBrainstorm(data);
      }
      setLoading(false);
    };

    fetchBrainstorm();
  }, [id, getBrainstorm, user]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    is_public: boolean;
  }) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateBrainstorm(id, data);
      navigate(`/brainstorms/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/brainstorms">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brainstorms
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to edit brainstorms.
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="w-full max-w-2xl mx-auto">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error || !brainstorm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/brainstorms">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brainstorms
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Cannot Edit Brainstorm</h2>
          <p className="text-muted-foreground">
            {error || 'This brainstorm may not exist or you may not have permission to edit it.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to={`/brainstorms/${id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brainstorm
        </Button>
      </Link>

      <BrainstormForm
        initialData={{
          title: brainstorm.title ?? '',
          content: brainstorm.content,
          is_public: brainstorm.is_public,
        }}
        onSubmit={handleSubmit}
        isEditing={true}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}