export function useFeedLinks() {
  return {
    getLinksFor: async (_postId: string) => ([]),
    linkCounts: (_postId: string) => ({ in: 0, out: 0 }),
  };
}

