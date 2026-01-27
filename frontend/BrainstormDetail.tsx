import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBrainstorms, type Brainstorm } from '@/hooks/useBrainstorms';
import { useAuth } from '@/contexts/AuthContext';
import { formatContent, sanitizeText } from '@/lib/sanitize';

export default function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brainstorm, setBrainstorm] = useState<Brainstorm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getBrainstorm, deleteBrainstorm } = useBrainstorms();

  useEffect(() => {
    const fetchBrainstorm = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      const data = await getBrainstorm(id);
      if (!data) {
        setError('Brainstorm not found or you do not have permission to view it');
      } else {
        setBrainstorm(data);
      }
      setLoading(false);
    };

    fetchBrainstorm();
  }, [id, getBrainstorm]);

  const handleDelete = async () => {
    if (!brainstorm) return;
    
    try {
      await deleteBrainstorm(brainstorm.id);
      navigate('/brainstorms');
    } catch (error) {
      console.error('Failed to delete brainstorm:', error);
    }
  };

  const isOwner = user && brainstorm && brainstorm.author_user_id === user.id;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
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
          <h2 className="text-xl font-semibold mb-2">Brainstorm Not Found</h2>
          <p className="text-muted-foreground">
            {error || 'This brainstorm may be private or may not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/brainstorms">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brainstorms
          </Button>
        </Link>
        
        {isOwner && (
          <div className="flex gap-2">
            <Link to={`/brainstorms/${brainstorm.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Brainstorm</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this brainstorm? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-3">{sanitizeText(brainstorm.title)}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="w-4 h-4" />
                <span>{brainstorm.author_display_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(brainstorm.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Badge variant={brainstorm.is_public ? 'default' : 'secondary'}>
              {brainstorm.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: formatContent(brainstorm.content) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}