import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainstormForm } from '@/components/brainstorms/BrainstormForm';
import { useBrainstorms } from '@/hooks/useBrainstorms';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function BrainstormNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openIdeaId = searchParams.get('idea_id');
  const { createBrainstorm } = useBrainstorms();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    is_public: boolean;
    idea_id?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createBrainstorm(data);
      navigate('/brainstorms');
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
            You need to be logged in to create brainstorms.
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/brainstorms">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brainstorms
        </Button>
      </Link>

      {openIdeaId && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Creating brainstorm inspired by an open idea
          </p>
        </div>
      )}

      <BrainstormForm
        openIdeaId={openIdeaId || undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}