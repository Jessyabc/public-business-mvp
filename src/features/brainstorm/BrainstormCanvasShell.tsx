import React, { useState } from 'react';
import { NodesLayer } from './components/NodesLayer';
import { BasePost } from './types';

type Props = {
  /** Optional: posts to display. If not provided, uses mock data */
  posts?: BasePost[];
  className?: string;
};

export function BrainstormCanvasShell({ posts: providedPosts, className }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div className={className}>
      <NodesLayer
        posts={mockPosts}
        onSelect={handleSelect}
        onHover={handleHover}
        selectedId={selectedId}
        hoveredId={hoveredId}
      />
    </div>
  );
}

