/**
 * Pillar #1: Individual Workspace
 * 
 * Public exports for the workspace feature.
 * Pull-the-Thread system: Raw chains are source of truth.
 */

// Components
export { WorkspaceCanvas } from './components/WorkspaceCanvas';
export { DayThread } from './components/DayThread';
export { ChainThread } from './components/ChainThread';
export { OpenCircle } from './components/OpenCircle';

// Stores
export { useWorkspaceStore } from './useWorkspaceStore';
export { useChainStore } from './stores/chainStore';

// Sync hooks
export { useWorkspaceSync } from './useWorkspaceSync';
export { useChainSync } from './useChainSync';

// Gesture hooks
export { useChainGestures } from './hooks/useChainGestures';

// Types
export type { ThoughtObject, ThoughtState, DayThread as DayThreadType, WorkspaceStore, ChainId } from './types';
export type { ThoughtChain, ThoughtLens, ChainStore, ChainViewMode, PullGestureState } from './types/chain';
