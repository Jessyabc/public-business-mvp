import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AccordionCard } from '@/components/posts/AccordionCard';
import { useBrainstorms } from '@/hooks/useBrainstorms';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

export default function Brainstorms() {
  const [filter, setFilter] = useState<'newest' | 'most_interacted' | 'mine'>('newest');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { brainstorms, loading, fetchBrainstorms } = useBrainstorms();

  useEffect(() => {
    fetchBrainstorms(filter, debouncedSearch);
  }, [filter, debouncedSearch]);

  const handleTabChange = (value: string) => {
    setFilter(value as any);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brainstorm Hub</h1>
          <p className="text-muted-foreground">
            Explore and share creative ideas with the community
          </p>
        </div>
        {user && (
          <Link to="/brainstorms/new">
            <Button className="mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              New Brainstorm
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search brainstorms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={filter} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="most_interacted">Most Interacted</TabsTrigger>
          {user && <TabsTrigger value="mine">My Brainstorms</TabsTrigger>}
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : brainstorms.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No brainstorms found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'mine' 
                  ? "You haven't created any brainstorms yet."
                  : search 
                    ? "Try adjusting your search terms."
                    : "Be the first to share your ideas!"
                }
              </p>
              {user && (
                <Link to="/brainstorms/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Brainstorm
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {brainstorms.map((brainstorm) => (
                <AccordionCard
                  key={brainstorm.id}
                  post={{
                    id: brainstorm.id,
                    title: brainstorm.title,
                    content: brainstorm.content,
                    created_at: brainstorm.created_at,
                    mode: 'public',
                    views_count: 0,
                  }}
                  onView={(id) => navigate(`/brainstorms/${id}`)}
                  onSave={(id) => console.log('Save brainstorm:', id)}
                  onShare={(id) => console.log('Share brainstorm:', id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}