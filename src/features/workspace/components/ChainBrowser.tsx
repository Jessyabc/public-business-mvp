/**
 * Think Space: Chain Browser
 *
 * Full-surface view of all chains + semantic search.
 * Opens from search icon in bottom nav, same background, no modal.
 * Supports rename and delete of chains.
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, GitBranch, Search, Loader2, List, Pencil, Trash2, Check, X } from 'lucide-react';
import { useChainStore } from '../stores/chainStore';
import { useFeedStore } from '../stores/feedStore';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useThoughtSearch, type SearchResult } from '../hooks/useThoughtSearch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// PB Blue - active cognition color
const PB_BLUE = '#489FE3';

interface ChainBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'chains' | 'search';

export function ChainBrowser({ isOpen, onClose }: ChainBrowserProps) {
  const { chains, activeChainId, setActiveChain, updateChainLabel, deleteChain } = useChainStore();
  const { viewChain, viewGlobal, scope, focusedChainId } = useFeedStore();
  const { thoughts, deleteThought } = useWorkspaceStore();
  const { search, results, isSearching, error, clearResults } = useThoughtSearch();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('chains');
  const [query, setQuery] = useState('');
  const [editingChainId, setEditingChainId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [deletingChainId, setDeletingChainId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get chains with their most recent thought time, sorted by recency
  const chainsWithActivity = useMemo(() => {
    return chains
      .map((chain) => {
        const chainThoughts = thoughts.filter(
          (t) => t.chain_id === chain.id && t.state === 'anchored'
        );
        const latestThought = chainThoughts.sort((a, b) => {
          const timeA = new Date(a.anchored_at || a.created_at).getTime();
          const timeB = new Date(b.anchored_at || b.created_at).getTime();
          return timeB - timeA;
        })[0];
        
        const firstThought = chainThoughts.sort((a, b) => {
          const timeA = new Date(a.anchored_at || a.created_at).getTime();
          const timeB = new Date(b.anchored_at || b.created_at).getTime();
          return timeA - timeB;
        })[0];
        
        return {
          ...chain,
          thoughtCount: chainThoughts.length,
          latestTime: latestThought 
            ? new Date(latestThought.anchored_at || latestThought.created_at).getTime()
            : new Date(chain.created_at).getTime(),
          firstThoughtPreview: firstThought?.content?.slice(0, 80) || null,
          latestThoughtPreview: latestThought?.content?.slice(0, 80) || null,
        };
      })
      .filter((chain) => chain.thoughtCount > 0)
      .sort((a, b) => b.latestTime - a.latestTime);
  }, [chains, thoughts]);
  
  // Handle selecting a chain
  const handleSelectChain = (chainId: string) => {
    setActiveChain(chainId);
    viewChain(chainId);
    onClose();
  };
  
  // Handle going back to global view
  const handleBackToGlobal = () => {
    viewGlobal();
    onClose();
  };

  // --- Rename ---
  const handleStartRename = useCallback((chainId: string, currentLabel: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChainId(chainId);
    setEditLabel(currentLabel || '');
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const handleSaveRename = useCallback(async () => {
    if (!editingChainId || !user) return;
    const trimmed = editLabel.trim();
    updateChainLabel(editingChainId, trimmed === '' ? null : trimmed);
    
    // Persist to Supabase
    await supabase
      .from('thought_chains')
      .update({ display_label: trimmed === '' ? null : trimmed, updated_at: new Date().toISOString() })
      .eq('id', editingChainId)
      .eq('user_id', user.id);
    
    setEditingChainId(null);
    toast.success('Chain renamed');
  }, [editingChainId, editLabel, updateChainLabel, user]);

  const handleCancelRename = useCallback(() => {
    setEditingChainId(null);
    setEditLabel('');
  }, []);

  // --- Delete ---
  const handleRequestDelete = useCallback((chainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChainId(chainId);
  }, []);

  const handleConfirmDelete = useCallback(async (chainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    // Get thoughts in this chain
    const chainThoughts = thoughts.filter(t => t.chain_id === chainId);
    
    // Delete thoughts from local store
    chainThoughts.forEach(t => deleteThought(t.id));
    
    // Delete chain from local store
    deleteChain(chainId);
    
    // Delete from Supabase (thoughts first, then chain)
    if (chainThoughts.length > 0) {
      await supabase
        .from('workspace_thoughts')
        .delete()
        .eq('chain_id', chainId)
        .eq('user_id', user.id);
    }
    await supabase
      .from('thought_chains')
      .delete()
      .eq('id', chainId)
      .eq('user_id', user.id);
    
    setDeletingChainId(null);
    
    // If we were viewing this chain, go back to global
    if (focusedChainId === chainId) {
      viewGlobal();
    }
    
    toast.success('Chain deleted');
  }, [user, thoughts, deleteThought, deleteChain, focusedChainId, viewGlobal]);

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChainId(null);
  }, []);
  
  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(value);
      }, 300);
    } else {
      clearResults();
    }
  }, [search, clearResults]);
  
  // Handle search result click
  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.chain_id) {
      viewChain(result.chain_id);
    }
    onClose();
    setQuery('');
    clearResults();
  }, [viewChain, clearResults, onClose]);
  
  // Check if currently viewing a specific chain
  const isViewingChain = scope === 'chain' && focusedChainId;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Same background as workspace */}
          <div 
            className="absolute inset-0"
            style={{ background: '#F5F1EC' }}
          />
          
          {/* Content */}
          <div className="relative h-full overflow-y-auto pb-32 pt-20 px-4">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                {/* Tab switcher */}
                <div 
                  className="flex rounded-xl p-1"
                  style={{ background: '#E5E0DB' }}
                >
                  <button
                    onClick={() => setActiveTab('chains')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    )}
                    style={{
                      background: activeTab === 'chains' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'chains' ? '#5D554D' : '#A09890',
                      boxShadow: activeTab === 'chains' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <List className="w-4 h-4" />
                    Chains
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('search');
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    )}
                    style={{
                      background: activeTab === 'search' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'search' ? PB_BLUE : '#A09890',
                      boxShadow: activeTab === 'search' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
                
                {isViewingChain && (
                  <button
                    onClick={handleBackToGlobal}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                    style={{ 
                      color: PB_BLUE,
                      background: `${PB_BLUE}10`,
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All
                  </button>
                )}
              </div>
              
              {/* Search tab content */}
              {activeTab === 'search' && (
                <div className="mb-6">
                  {/* Search input */}
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                    style={{
                      background: '#EAE5E0',
                      boxShadow: `
                        inset 2px 2px 4px rgba(180, 165, 145, 0.15),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.5)
                      `,
                    }}
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: PB_BLUE }} />
                    ) : (
                      <Search className="w-4 h-4" style={{ color: '#A09890' }} />
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      placeholder="Search your thoughts..."
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      style={{ color: '#4A443D' }}
                    />
                  </div>
                  
                  {/* Search results */}
                  {error && (
                    <div className="text-sm text-destructive/70 mb-4">
                      {error}
                    </div>
                  )}
                  
                  {results.length > 0 && (
                    <div className="space-y-2">
                      {results.map((result) => (
                        <motion.button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left p-3 rounded-xl transition-all hover:shadow-md"
                          style={{
                            background: '#EAE5E0',
                            boxShadow: `
                              inset 1px 1px 2px rgba(255, 255, 255, 0.5),
                              inset -1px -1px 2px rgba(180, 165, 145, 0.1)
                            `,
                          }}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <p 
                            className="text-sm line-clamp-2"
                            style={{ color: '#4A443D' }}
                          >
                            {result.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span 
                              className="text-xs"
                              style={{ color: '#A09890' }}
                            >
                              {result.anchored_at 
                                ? format(parseISO(result.anchored_at), 'MMM d, h:mm a')
                                : format(parseISO(result.created_at), 'MMM d, h:mm a')
                              }
                            </span>
                            <span 
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ 
                                background: `${PB_BLUE}15`,
                                color: PB_BLUE,
                              }}
                            >
                              {Math.round(result.similarity * 100)}%
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  
                  {query.length >= 2 && results.length === 0 && !isSearching && !error && (
                    <div 
                      className="text-center py-8 text-sm"
                      style={{ color: '#A09890' }}
                    >
                      No matching thoughts found
                    </div>
                  )}
                  
                  {query.length < 2 && (
                    <div 
                      className="text-center py-8 text-sm"
                      style={{ color: '#A09890' }}
                    >
                      Type at least 2 characters to search
                    </div>
                  )}
                </div>
              )}
              
              {/* Chain list - only show on chains tab */}
              {activeTab === 'chains' && (
                <div className="space-y-3">
                  {chainsWithActivity.length === 0 ? (
                    <div 
                      className="text-center py-12 text-sm"
                      style={{ color: '#A09890' }}
                    >
                      No chains yet. Start thinking to create your first chain.
                    </div>
                  ) : (
                    chainsWithActivity.map((chain, index) => {
                      const isActive = activeChainId === chain.id;
                      const isFocused = focusedChainId === chain.id;
                      const isEditingThis = editingChainId === chain.id;
                      const isDeletingThis = deletingChainId === chain.id;
                      const displayLabel = chain.display_label || 
                        format(new Date(chain.first_thought_at || chain.created_at), 'MMM d, h:mm a');
                      
                      return (
                        <motion.div
                          key={chain.id}
                          className="relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <button
                            onClick={() => !isEditingThis && !isDeletingThis && handleSelectChain(chain.id)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl transition-all",
                              "hover:shadow-md"
                            )}
                            style={{
                              background: isFocused 
                                ? `linear-gradient(135deg, ${PB_BLUE}15, ${PB_BLUE}08)`
                                : '#EAE5E0',
                              border: isFocused 
                                ? `1px solid ${PB_BLUE}40`
                                : '1px solid transparent',
                              boxShadow: `
                                inset 2px 2px 4px rgba(255, 255, 255, 0.5),
                                inset -2px -2px 4px rgba(180, 165, 145, 0.1)
                              `,
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {/* Chain label - editable inline */}
                                <div className="flex items-center gap-2 mb-1">
                                  <GitBranch 
                                    className="w-4 h-4 flex-shrink-0" 
                                    style={{ color: isActive ? PB_BLUE : '#A09890' }}
                                  />
                                  {isEditingThis ? (
                                    <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                                      <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveRename();
                                          if (e.key === 'Escape') handleCancelRename();
                                        }}
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium min-w-0"
                                        style={{ color: PB_BLUE }}
                                        placeholder="Chain name..."
                                      />
                                      <button onClick={handleSaveRename} className="p-1 rounded hover:bg-black/5">
                                        <Check className="w-3.5 h-3.5" style={{ color: '#5D9E5D' }} />
                                      </button>
                                      <button onClick={handleCancelRename} className="p-1 rounded hover:bg-black/5">
                                        <X className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span 
                                      className="font-medium text-sm truncate"
                                      style={{ color: isActive ? PB_BLUE : '#5D554D' }}
                                    >
                                      {displayLabel}
                                    </span>
                                  )}
                                  {isActive && !isEditingThis && (
                                    <span 
                                      className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                                      style={{ 
                                        background: `${PB_BLUE}20`,
                                        color: PB_BLUE,
                                      }}
                                    >
                                      active
                                    </span>
                                  )}
                                </div>
                                
                                {/* Delete confirmation */}
                                {isDeletingThis && (
                                  <div 
                                    className="flex items-center gap-2 mt-2 p-2 rounded-lg"
                                    style={{ background: 'rgba(199, 80, 80, 0.08)' }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <span className="text-xs" style={{ color: '#C75050' }}>
                                      Delete this chain and its {chain.thoughtCount} thought{chain.thoughtCount !== 1 ? 's' : ''}?
                                    </span>
                                    <button
                                      onClick={(e) => handleConfirmDelete(chain.id, e)}
                                      className="px-2 py-1 rounded text-xs font-medium"
                                      style={{ background: 'rgba(199, 80, 80, 0.15)', color: '#C75050' }}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={handleCancelDelete}
                                      className="px-2 py-1 rounded text-xs"
                                      style={{ color: '#6B635B' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                                
                                {/* Preview text */}
                                {!isDeletingThis && chain.latestThoughtPreview && (
                                  <p 
                                    className="text-sm line-clamp-2 mt-1"
                                    style={{ color: '#7A7168' }}
                                  >
                                    {chain.latestThoughtPreview}
                                    {chain.latestThoughtPreview.length >= 80 && '...'}
                                  </p>
                                )}
                                
                                {/* Meta info */}
                                {!isDeletingThis && (
                                  <div 
                                    className="flex items-center gap-3 mt-2 text-xs"
                                    style={{ color: '#A09890' }}
                                  >
                                    <span>{chain.thoughtCount} thought{chain.thoughtCount !== 1 ? 's' : ''}</span>
                                    <span>·</span>
                                    <span>{format(new Date(chain.latestTime), 'MMM d, h:mm a')}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions (rename/delete) */}
                              {!isEditingThis && !isDeletingThis && (
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleStartRename(chain.id, chain.display_label, e)}
                                    className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                    title="Rename chain"
                                  >
                                    <Pencil className="w-3.5 h-3.5" style={{ color: '#7A7168' }} />
                                  </button>
                                  <button
                                    onClick={(e) => handleRequestDelete(chain.id, e)}
                                    className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                    title="Delete chain"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" style={{ color: '#7A7168' }} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Tap outside to close - subtle overlay at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #F5F1EC, transparent)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}