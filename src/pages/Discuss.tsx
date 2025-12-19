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
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const { openComposer, closeComposer, isOpen: composerOpen } = useComposerStore();
  const { lens, toggleLens } = useDiscussLens();
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

  const isPublic = lens === 'public';

  return (
    <>
      {/* Ambient particles background - only for public lens */}
      {isPublic && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute w-full h-full">
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
      )}

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

export default function Discuss() {
  return <DiscussContent />;
}
