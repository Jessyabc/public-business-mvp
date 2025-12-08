import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useComposerStore } from '@/hooks/useComposerStore';
import type { Post, BasePost } from '@/types/post';

export default function BrainstormFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const { openComposer, closeComposer, isOpen: composerOpen } = useComposerStore();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadingRef = useRef(false);
  const [readerModalPost, setReaderModalPost] = useState<Post | null>(null);

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
    closeComposer();
    
    const currentActivePostId = useBrainstormExperienceStore.getState().activePostId;
    if (currentActivePostId) {
      useBrainstormExperienceStore.setState({ activePostId: null });
    }
    
    setIsInitialMount(false);
  }, [closeComposer]);

  const fetchPostById = useCallback(async (id: string): Promise<Post | null> => {
    if (loadingRef.current) return null;
    
    loadingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data as Post;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleContinue = (event: CustomEvent) => {
      const { parentId } = event.detail || {};
      if (parentId) {
        // Open composer with continuation context
        openComposer({ parentPostId: parentId, relationType: 'continuation' });
      } else {
        openComposer();
      }
    };
    window.addEventListener('pb:brainstorm:continue', handleContinue as EventListener);
    return () => window.removeEventListener('pb:brainstorm:continue', handleContinue as EventListener);
  }, [openComposer]);

  useEffect(() => {
    const handleShowThread = async (event: CustomEvent) => {
      const { postId, post } = event.detail;
      if (post) {
        setReaderModalPost(post as Post);
      } else if (postId) {
        const fetchedPost = await fetchPostById(postId);
        if (fetchedPost) {
          setReaderModalPost(fetchedPost);
        }
      }
    };
    window.addEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    return () => window.removeEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
  }, [fetchPostById]);

  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && !isInitialMount) {
      fetchPostById(postId).then((post) => {
        if (post) setReaderModalPost(post);
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, isInitialMount, fetchPostById]);

  useEffect(() => {
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }
    
    fetchPostById(selectedPostId).then((post) => {
      if (post) {
        setSelectedPost(post);
      } else {
        setSelectedPost(null);
        setSelectedPostId(null);
      }
    });
  }, [selectedPostId, fetchPostById]);

  const handleSelectPost = useCallback((postId: string) => {
    if (selectedPostId !== postId) {
      setSelectedPostId(postId);
    }
  }, [selectedPostId]);

  const handleClosePostModal = useCallback(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
  }, []);

  return (
    <>
      {/* Ambient particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-full">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20 animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header with notifications */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6">
        <h1 className="text-lg font-semibold text-white/90">Feed</h1>
        <div className="flex items-center gap-2">
          <Link to="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative w-10 h-10 rounded-full",
                "bg-white/5 hover:bg-white/10",
                "border border-white/10 hover:border-white/20",
                "text-white/70 hover:text-white",
                "transition-all duration-200"
              )}
            >
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            </Button>
          </Link>
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30",
              "border border-[var(--accent)]/30 hover:border-[var(--accent)]/50",
              "text-[var(--accent)] hover:text-white",
              "shadow-[0_0_15px_rgba(72,159,227,0.3)]",
              "hover:shadow-[0_0_25px_rgba(72,159,227,0.5)]",
              "transition-all duration-200"
            )}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <BrainstormLayoutShell
          main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} key={refreshKey} />}
          crossLinks={null}
          sidebar={<RightSidebar variant="feed" onSelectPost={handleSelectPost} />}
        />
      </PullToRefresh>
      
      <ComposerModal 
        isOpen={composerOpen} 
        onClose={closeComposer}
      />
      
      <PostReaderModal
        isOpen={!!readerModalPost}
        onClose={() => setReaderModalPost(null)}
        post={readerModalPost}
      />
    </>
  );
}
