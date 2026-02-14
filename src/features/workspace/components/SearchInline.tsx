 /**
  * Think Space: SearchInline Component
  * 
  * Inline search interface for semantic thought search.
  * Shows in the workspace header, results appear inline.
  */
 
 import { useState, useCallback, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Search, X, Loader2 } from 'lucide-react';
 import { useThoughtSearch, type SearchResult } from '../hooks/useThoughtSearch';
 import { useFeedStore } from '../stores/feedStore';
 import { cn } from '@/lib/utils';
 import { format, parseISO } from 'date-fns';
 
 const PB_BLUE = '#489FE3';
 
 interface SearchInlineProps {
   className?: string;
 }
 
export function SearchInline({ className }: SearchInlineProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { search, results, isSearching, error, clearResults } = useThoughtSearch();
    const { viewChain } = useFeedStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Focus input when opening
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

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

    // Handle result click - navigate to that chain
    const handleResultClick = useCallback((result: SearchResult) => {
      if (result.chain_id) {
        viewChain(result.chain_id);
      }
      setIsOpen(false);
      setQuery('');
      clearResults();
    }, [viewChain, clearResults]);

    // Close search
    const handleClose = useCallback(() => {
      setIsOpen(false);
      setQuery('');
      clearResults();
    }, [clearResults]);

    // Handle keyboard
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    }, [handleClose]);

    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-all opacity-50 hover:opacity-100 shrink-0", className)}
          style={{ 
            background: `${PB_BLUE}10`,
            border: `1px solid ${PB_BLUE}20`,
          }}
          title="Search thoughts (semantic)"
        >
          <Search className="w-3.5 h-3.5" style={{ color: PB_BLUE }} />
          <span className="text-xs" style={{ color: PB_BLUE }}>Search</span>
        </button>
      );
    }

    return (
      <div className={cn("search-inline relative w-full", className)}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'rgba(234, 229, 224, 0.95)',
            border: `1px solid ${PB_BLUE}30`,
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
          }}
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: PB_BLUE }} />
          ) : (
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: PB_BLUE }} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your thoughts..."
            className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
            style={{ color: '#4A443D' }}
          />
          <button
            onClick={handleClose}
            className="p-0.5 rounded hover:bg-black/5 shrink-0"
          >
            <X className="w-3.5 h-3.5" style={{ color: '#6B635B' }} />
          </button>
        </div>

        {/* Results dropdown */}
        {(results.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-50"
            style={{
              background: 'rgba(234, 229, 224, 0.98)',
              border: `1px solid ${PB_BLUE}20`,
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.12)`,
            }}
          >
            {error ? (
              <div className="p-3 text-sm text-destructive/70">
                {error}
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 hover:bg-white/50 transition-colors"
                  >
                    <div className="text-sm line-clamp-2" style={{ color: '#4A443D' }}>
                      {result.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs opacity-50">
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
                        {Math.round(result.similarity * 100)}% match
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }