/**
 * Pillar #1: Individual Workspace
 *
 * Public exports for the workspace feature.
 * Chain of Thoughts: Raw chains are source of truth.
 */

// Components
export { WorkspaceCanvas } from "./components/WorkspaceCanvas";
export { ActiveChainView } from "./components/ActiveChainView";
export { ChainThread } from "./components/ChainThread";
export { OpenCircle } from "./components/OpenCircle";

// Stores
export { useWorkspaceStore } from "./useWorkspaceStore";
export { useChainStore } from "./stores/chainStore";
 export { useFeedStore } from "./stores/feedStore";

// Sync hooks
export { useWorkspaceSync } from "./useWorkspaceSync";
export { useChainSync } from "./useChainSync";

// Gesture hooks
export { useChainGestures } from "./hooks/useChainGestures";

// Types
 export type { ThoughtObject, ThoughtState, FeedScope, ChainLink, WorkspaceStore, ChainId } from "./types";
export type { ThoughtChain, ThoughtLens, ChainStore, ChainViewMode, PullGestureState } from "./types/chain";
