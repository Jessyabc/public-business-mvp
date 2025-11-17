import { create } from 'zustand';
import { BasePost } from '@/types/post';

type HistoryEntry = BasePost & { viewedAt: string };

type BrainstormExperienceState = {
  activePostId: string | null;
  postsById: Record<string, BasePost>;
  lastSeen: HistoryEntry[];
  breadcrumbs: HistoryEntry[];
  hoveredPostId: string | null;
  recordPosts: (posts: BasePost[]) => void;
  setActivePost: (post: BasePost) => void;
  setActivePostById: (postId: string) => void;
  navigateBreadcrumb: (index: number) => void;
  clearBreadcrumbs: () => void;
  setHoveredPostId: (id: string | null) => void;
};

const MAX_LAST_SEEN = 20;
const MAX_BREADCRUMBS = 12;

const toHistoryEntry = (post: BasePost): HistoryEntry => ({
  ...post,
  viewedAt: new Date().toISOString(),
});

export const useBrainstormExperienceStore = create<BrainstormExperienceState>((set, get) => ({
  activePostId: null,
  postsById: {},
  lastSeen: [],
  breadcrumbs: [],
  hoveredPostId: null,

  recordPosts: (posts) => {
    if (!posts.length) return;
    set((state) => {
      const next = { ...state.postsById };
      posts.forEach((post) => {
        next[post.id] = post;
      });
      return { postsById: next };
    });
  },

  setActivePost: (post) => {
    set((state) => {
      const entry = toHistoryEntry(post);
      const filteredHistory = state.lastSeen.filter((item) => item.id !== post.id);
      const filteredBreadcrumbs = state.breadcrumbs.filter((item) => item.id !== post.id);

      return {
        activePostId: post.id,
        postsById: { ...state.postsById, [post.id]: post },
        lastSeen: [entry, ...filteredHistory].slice(0, MAX_LAST_SEEN),
        breadcrumbs: [...filteredBreadcrumbs, entry].slice(-MAX_BREADCRUMBS),
      };
    });
  },

  setActivePostById: (postId) => {
    const target = get().postsById[postId];
    if (target) {
      get().setActivePost(target);
    }
  },

  navigateBreadcrumb: (index) => {
    const state = get();
    if (index < 0 || index >= state.breadcrumbs.length) {
      return;
    }
    const selected = state.breadcrumbs[index];
    const entry = toHistoryEntry(selected);
    set((current) => {
      const filteredHistory = current.lastSeen.filter((item) => item.id !== selected.id);
      return {
        activePostId: selected.id,
        postsById: { ...current.postsById, [selected.id]: selected },
        lastSeen: [entry, ...filteredHistory].slice(0, MAX_LAST_SEEN),
        breadcrumbs: current.breadcrumbs.slice(0, index + 1),
      };
    });
  },

  clearBreadcrumbs: () => set({ breadcrumbs: [] }),

  setHoveredPostId: (id) => set({ hoveredPostId: id }),
}));
