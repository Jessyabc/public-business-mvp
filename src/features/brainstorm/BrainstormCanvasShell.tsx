import { useState, useCallback, useRef, useEffect } from 'react';
import { NodesLayer } from './components/NodesLayer';
import { LinksLayer } from './components/LinksLayer';
import { BasePost, PostLink } from './types';
import { cn } from '@/lib/utils';

type Props = {
  /** Optional: posts to display. If not provided, uses mock data */
  posts?: BasePost[];
  /** Optional: links to display. If not provided, uses mock data */
  links?: PostLink[];
  className?: string;
};

export function BrainstormCanvasShell({ posts: providedPosts, links: providedLinks, className }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [getNodeAnchor, setGetNodeAnchor] = useState<((id: string) => { x: number; y: number } | null) | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data for demo if no posts provided
  const mockPosts: BasePost[] = providedPosts || [
    {
      id: '1',
      author_id: 'user-1',
      org_id: null,
      type: 'spark',
      title: 'Initial Spark Idea',
      content: 'This is a spark that could lead to something bigger...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      linked_post_ids: [],
      privacy: 'public',
      mode: 'public',
      metrics: {
        views: 10,
        saves: 2,
        shares: 1,
        t_score: 6,
        involvement: 3,
      },
    },
    {
      id: '2',
      author_id: 'user-2',
      org_id: null,
      type: 'brainstorm',
      title: 'Brainstorm Session',
      content: 'Exploring multiple angles on this topic...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      linked_post_ids: ['1'],
      privacy: 'public',
      mode: 'public',
      metrics: {
        views: 25,
        saves: 5,
        shares: 3,
        t_score: 8,
        involvement: 7,
      },
    },
    {
      id: '3',
      author_id: 'user-3',
      org_id: null,
      type: 'branch',
      title: 'Branching Idea',
      content: 'Taking the brainstorm in a new direction...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      linked_post_ids: ['2'],
      privacy: 'public',
      mode: 'public',
      metrics: {
        views: 15,
        saves: 1,
        shares: 0,
        t_score: 4,
        involvement: 2,
      },
    },
  ];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    console.log('Selected post:', id);
  };

  const handleHover = (id: string | null) => {
    setHoveredId(id);
  };

  // Mock links for demo if no links provided
  const mockLinks: PostLink[] = providedLinks || [
    {
      id: 'link-1',
      source_post_id: '1',
      target_post_id: '2',
      link_type: 'hard',
      weight: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 'link-2',
      source_post_id: '2',
      target_post_id: '3',
      link_type: 'soft',
      weight: 2,
      created_at: new Date().toISOString(),
    },
  ];

  const postsToDisplay = providedPosts && providedPosts.length > 0 ? providedPosts : mockPosts;
  const linksToDisplay = providedLinks && providedLinks.length > 0 ? providedLinks : mockLinks;

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleAnchorUpdate = useCallback((getAnchor: (id: string) => { x: number; y: number } | null) => {
    setGetNodeAnchor(() => getAnchor);
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative", className)}>
      {postsToDisplay.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No posts to display</p>
        </div>
      ) : (
        <>
          {/* Links layer rendered beneath nodes */}
          {getNodeAnchor && containerSize.width > 0 && containerSize.height > 0 && (
            <LinksLayer
              links={linksToDisplay}
              getNodeAnchor={getNodeAnchor}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
            />
          )}
          {/* Nodes layer on top */}
          <NodesLayer
            posts={postsToDisplay}
            onSelect={handleSelect}
            onHover={handleHover}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onAnchorUpdate={handleAnchorUpdate}
          />
        </>
      )}
    </div>
  );
}

