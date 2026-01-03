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
import { Bell, Plus, Brain, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useDiscussLens } from '@/contexts/DiscussLensContext';
import type { Post } from '@/types/post';

function DiscussContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Clear activePostId immediately on mount to prevent auto-opening modals
  const [hasClearedOnMount, setHasClearedOnMount] = useState(false);
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const { openComposer, closeComposer, isOpen: composerOpen } = useComposerStore();
  const { lens, toggleLens } = useDiscussLens();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadingRef = useRef(false);
  const [readerModalPost, setReaderModalPost] = useState<Post | null>(null);
  const allowModalOpenRef = useRef(false); // Prevent modal from opening during initial load

  // Clear activePostId synchronously on first render to prevent auto-opening
  if (!hasClearedOnMount) {
    useBrainstormExperienceStore.setState({ activePostId: null });
    setHasClearedOnMount(true);
  }

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
  };

  // Clear selected post and close modals when lens changes
  useEffect(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
    setReaderModalPost(null);
    closeComposer();
    
    // Temporarily block modal from opening during lens transition
    allowModalOpenRef.current = false;
    const timer = setTimeout(() => {
      allowModalOpenRef.current = true;
    }, 100);
    
    const currentActivePostId = useBrainstormExperienceStore.getState().activePostId;
    if (currentActivePostId) {
      useBrainstormExperienceStore.setState({ activePostId: null });
    }
    
    return () => clearTimeout(timer);
  }, [lens, closeComposer]);

  // Clear all post-related state on mount for both public and business lenses
  // This ensures no post card shows automatically when landing on either side
  useEffect(() => {
    // Clear store state (redundant but ensures it's cleared)
    useBrainstormExperienceStore.setState({ activePostId: null });
    
    // Clear local state
    setReaderModalPost(null);
    setSelectedPost(null);
    setSelectedPostId(null);
    
    // Clear URL params if they exist (e.g., ?post=xxx)
    const postIdParam = searchParams.get('post');
    if (postIdParam) {
      setSearchParams({}, { replace: true });
    }
    
    // Wait a bit before allowing modal to open (prevents race conditions)
    const timer = setTimeout(() => {
      allowModalOpenRef.current = true;
      setIsInitialMount(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Run once on mount, regardless of lens

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
      // Don't open modal during initial mount/clear period
      if (!allowModalOpenRef.current || isInitialMount) {
        return;
      }
      
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
  }, [fetchPostById, isInitialMount]);

  useEffect(() => {
    // Only process URL params after initial mount and modal is allowed to open
    if (!allowModalOpenRef.current || isInitialMount) {
      return;
    }
    
    const postId = searchParams.get('post');
    if (postId) {
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

  const isPublic = lens === 'public';

  return (
    <>
      {/* Header with lens toggle and notifications */}
      <div className={cn(
        "relative z-10 flex items-center justify-between px-4 py-3 lg:px-6",
        isPublic ? "text-white" : "text-slate-800"
      )}>
        <div className="flex items-center gap-3">
          <h1 className={cn(
            "text-lg font-semibold",
            isPublic ? "text-white/90" : "text-slate-800"
          )}>
            Discuss
          </h1>
          
          {/* Lens Selector */}
          <div className={cn(
            "flex items-center rounded-full p-0.5 border",
            isPublic 
              ? "bg-white/10 border-white/20" 
              : "bg-slate-100 border-slate-200"
          )}>
            <button
              onClick={() => lens !== 'public' && toggleLens()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all",
                lens === 'public'
                  ? isPublic 
                    ? "bg-primary text-white" 
                    : "bg-primary text-white"
                  : isPublic
                    ? "text-white/60 hover:text-white/80"
                    : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public</span>
            </button>
            <button
              onClick={() => lens !== 'business' && toggleLens()}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all",
                lens === 'business'
                  ? "bg-blue-600 text-white"
                  : isPublic
                    ? "text-white/60 hover:text-white/80"
                    : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Business</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative w-10 h-10 rounded-full transition-all duration-200",
                isPublic
                  ? "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                  : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-800"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className={cn(
                "absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse",
                isPublic ? "bg-[var(--accent)]" : "bg-blue-500"
              )} />
            </Button>
          </Link>
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-10 h-10 rounded-full transition-all duration-200",
              isPublic
                ? "bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 border border-[var(--accent)]/30 hover:border-[var(--accent)]/50 text-[var(--accent)] hover:text-white shadow-[0_0_15px_rgba(72,159,227,0.3)] hover:shadow-[0_0_25px_rgba(72,159,227,0.5)]"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            )}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <BrainstormLayoutShell
          main={<FeedContainer mode={lens === 'business' ? 'business' : 'public'} activePostId={null} key={`${refreshKey}-${lens}`} />}
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

export default function Discuss() {
  return <DiscussContent />;
}
