import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OrbitPost {
  id: string;
  title: string | null;
  content: string;
  relation: 'parent' | 'child' | 'cross_link';
  angle: number;
}

interface OrbitViewProps {
  centerId: string;
  isActive: boolean;
  onSelectPost?: (postId: string) => void;
}

export function OrbitView({ centerId, isActive, onSelectPost }: OrbitViewProps) {
  const [orbitPosts, setOrbitPosts] = useState<OrbitPost[]>([]);
  const [centerPost, setCenterPost] = useState<{ title: string | null; content: string } | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const fetchOrbit = async () => {
      // Fetch center post
      const { data: center } = await supabase
        .from('posts')
        .select('title, content')
        .eq('id', centerId)
        .single();

      if (center) setCenterPost(center);

      // Fetch related posts
      const { data: relations } = await supabase
        .from('post_relations')
        .select('parent_post_id, child_post_id, relation_type')
        .or(`parent_post_id.eq.${centerId},child_post_id.eq.${centerId}`)
        .limit(8);

      if (!relations?.length) return;

      const relatedIds = relations.map(r => 
        r.parent_post_id === centerId ? r.child_post_id : r.parent_post_id
      );

      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content')
        .in('id', relatedIds);

      if (posts) {
        const angleStep = (2 * Math.PI) / posts.length;
        setOrbitPosts(posts.map((p, i) => {
          const relation = relations.find(r => 
            r.parent_post_id === p.id || r.child_post_id === p.id
          );
          return {
            id: p.id,
            title: p.title,
            content: p.content,
            relation: relation?.parent_post_id === centerId ? 'child' : 
                      relation?.child_post_id === centerId ? 'parent' : 'cross_link',
            angle: angleStep * i
          };
        }));
      }
    };

    fetchOrbit();
  }, [centerId, isActive]);

  if (!isActive) return null;

  const orbitRadius = 120;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative w-full h-64 flex items-center justify-center"
      >
        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-60 h-60 rounded-full border border-white/10 animate-spin-slow" />
          <div className="absolute w-48 h-48 rounded-full border border-white/5" />
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {orbitPosts.map((post) => {
            const x = Math.cos(post.angle) * orbitRadius + 128;
            const y = Math.sin(post.angle) * orbitRadius + 128;
            return (
              <line
                key={post.id}
                x1="50%"
                y1="50%"
                x2={x}
                y2={y}
                stroke={post.relation === 'parent' ? 'rgba(72,159,227,0.3)' : 
                        post.relation === 'child' ? 'rgba(147,112,219,0.3)' : 
                        'rgba(255,255,255,0.1)'}
                strokeWidth="1"
                strokeDasharray={post.relation === 'cross_link' ? '4,4' : 'none'}
              />
            );
          })}
        </svg>

        {/* Center post */}
        <motion.div
          className={cn(
            "absolute z-10 w-24 h-24 rounded-full",
            "bg-gradient-to-br from-[var(--accent)]/30 to-purple-500/20",
            "border border-white/20 backdrop-blur-lg",
            "flex items-center justify-center text-center p-2",
            "shadow-[0_0_30px_rgba(72,159,227,0.3)]"
          )}
          whileHover={{ scale: 1.1 }}
        >
          <p className="text-xs text-white/90 line-clamp-3">
            {centerPost?.title || centerPost?.content.slice(0, 40)}
          </p>
        </motion.div>

        {/* Orbiting posts */}
        {orbitPosts.map((post, index) => {
          const x = Math.cos(post.angle) * orbitRadius;
          const y = Math.sin(post.angle) * orbitRadius;
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x,
                y
              }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200
              }}
              onClick={() => onSelectPost?.(post.id)}
              className={cn(
                "absolute w-16 h-16 rounded-full cursor-pointer",
                "bg-white/5 border backdrop-blur-sm",
                "flex items-center justify-center text-center p-1",
                "transition-all duration-200 hover:scale-110",
                post.relation === 'parent' && 'border-[var(--accent)]/40 hover:border-[var(--accent)]',
                post.relation === 'child' && 'border-purple-400/40 hover:border-purple-400',
                post.relation === 'cross_link' && 'border-white/20 hover:border-white/40'
              )}
            >
              <p className="text-[10px] text-white/70 line-clamp-2">
                {post.title || post.content.slice(0, 30)}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
