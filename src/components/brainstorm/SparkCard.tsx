import React, { useEffect, useRef, useState } from "react";
import type { Spark } from "./BrainstormLayout";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useDiscussLensSafe } from "@/contexts/DiscussLensContext";

// PB Blue for accents on business lens
const PB_BLUE = '#4A7C9B';

export type SparkCardProps = {
  spark: Spark;
  onGiveThought?: (sparkId: string, alreadyGiven: boolean) => Promise<void> | void;
  onContinueBrainstorm?: (sparkId: string) => void;
  onSaveReference?: (sparkId: string) => void;
  onView?: (sparkId: string) => Promise<void> | void;
};

export const SparkCard: React.FC<SparkCardProps> = ({
  spark,
  onGiveThought,
  onContinueBrainstorm,
  onSaveReference,
  onView,
}) => {
  const { lens } = useDiscussLensSafe();
  const isBusiness = lens === 'business';
  // Determine if this is a business insight based on kind or mode
  const isBusinessInsight = spark.kind === 'BusinessInsight' || spark.mode === 'business';
  const [tScore, setTScore] = useState(spark.t_score);
  const [uScore, setUScore] = useState(spark.u_score ?? null);
  const [viewCount, setViewCount] = useState(spark.view_count);
  const [hasGivenThought, setHasGivenThought] = useState(!!spark.has_given_thought);
  const hasIncrementedViewRef = useRef(false);

  // increment views once per mount
  useEffect(() => {
    if (hasIncrementedViewRef.current || !spark.id) return;
    hasIncrementedViewRef.current = true;

    setViewCount((prev) => prev + 1);

    if (onView) {
      void Promise.resolve(onView(spark.id));
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pb:spark:view", { detail: { sparkId: spark.id } })
      );
    }
  }, [spark.id, onView]);

  const handleGiveThought = async () => {
    // For now, we assume a Thought is one-time only
    if (hasGivenThought) return;

    setHasGivenThought(true);
    setTScore((prev) => prev + 1);

    try {
      if (onGiveThought) {
        await onGiveThought(spark.id, true);
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pb:spark:thought", {
            detail: { sparkId: spark.id },
          })
        );
      }
    } catch (error) {
      // rollback if backend call fails
      setHasGivenThought(false);
      setTScore((prev) => prev - 1);
    }
  };

  const handleContinueBrainstorm = () => {
    if (onContinueBrainstorm) {
      onContinueBrainstorm(spark.id);
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pb:spark:continue", {
          detail: { sparkId: spark.id },
        })
      );
    }
  };

  const handleSaveReference = () => {
    if (onSaveReference) {
      onSaveReference(spark.id);
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pb:spark:save_reference", {
          detail: { sparkId: spark.id },
        })
      );
    }
  };

  // Business lens: transparent bg, wrapper handles neumorphic container
  // Public lens: glass aesthetic with shadows

  return (
    <article
      onClick={() => onView?.(spark.id)}
      className={cn(
        "relative w-full rounded-3xl px-6 py-5",
        "transition-all duration-300",
        onView ? "cursor-pointer" : "",
        // Public lens: dark glass aesthetic
        !isBusiness && [
          "bg-transparent",
          "backdrop-blur-xl",
          "border border-white/10",
          "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
          "hover:shadow-[0_20px_70px_rgba(0,0,0,0.5)]",
          "hover:scale-[1.01]",
        ],
        // Business lens: clean, let wrapper handle neumorphic
        isBusiness && [
          "bg-transparent",
        ]
      )}
    >
      {/* Gradient overlay - only for public lens */}
      {!isBusiness && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/6 via-transparent to-[#489FE3]/12 opacity-70"
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* avatar / initials could go here */}
            <div 
              className="text-sm font-medium"
              style={{ color: isBusiness ? '#3D3833' : 'white' }}
            >
              {spark.is_anonymous
                ? "Anonymous"
                : spark.author_display_name || "Unknown author"}
            </div>
          </div>
          <time 
            className="text-xs"
            style={{ color: isBusiness ? '#8B8580' : 'rgba(255,255,255,0.6)' }}
          >
            {new Date(spark.created_at).toLocaleString()}
          </time>
        </header>

        {/* Body */}
        <div className="mb-4 space-y-2">
          {spark.title && (
            <h2 
              className="text-base font-semibold leading-tight"
              style={{ color: isBusiness ? '#2D2926' : 'white' }}
            >
              {spark.title}
            </h2>
          )}
          <p 
            className="text-sm leading-relaxed"
            style={{ color: isBusiness ? '#4D4843' : 'rgba(255,255,255,0.9)' }}
          >
            {spark.body}
          </p>
        </div>

        {/* Footer: Metrics pill + Actions */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Metrics pill - neumorphic inset for business */}
          <div
            className={cn(
              "inline-flex items-center gap-3 rounded-full px-4 py-1.5",
              "transition-all duration-300",
              !isBusiness && "backdrop-blur-xl bg-white/8 border border-white/15 shadow-[0_0_12px_rgba(0,0,0,0.25)] hover:bg-white/10"
            )}
            style={isBusiness ? {
              background: '#DDD9D5',
              boxShadow: 'inset 2px 2px 4px rgba(166, 150, 130, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.7)'
            } : undefined}
          >
            <div className="flex items-center gap-1.5">
              {isBusinessInsight ? (
                // Show U-score for business insights
                <>
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: isBusiness ? PB_BLUE : 'white' }}
                  >
                    {uScore?.toFixed(1) ?? '—'}
                  </span>
                  <span 
                    className="text-[11px]"
                    style={{ color: isBusiness ? '#6B635B' : 'rgba(255,255,255,0.7)' }}
                  >U-score</span>
                </>
              ) : (
                // Show T-score for public sparks
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGiveThought();
                    }}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    title="Give this a thought (T-score)"
                  >
                    <span 
                      className="text-xs font-semibold"
                      style={{ color: isBusiness ? PB_BLUE : 'white' }}
                    >
                      {tScore}
                    </span>
                    <span 
                      className="text-[11px]"
                      style={{ color: isBusiness ? '#6B635B' : 'rgba(255,255,255,0.7)' }}
                    >T-score</span>
                  </button>
                </>
              )}
            </div>
            <div 
              className="w-1 h-1 rounded-full"
              style={{ background: isBusiness ? '#9B9590' : 'rgba(255,255,255,0.4)' }}
            />
            <div className="flex items-center gap-1.5">
              <span 
                className="text-xs font-semibold"
                style={{ color: isBusiness ? PB_BLUE : 'white' }}
              >
                {viewCount}
              </span>
              <span 
                className="text-[11px]"
                style={{ color: isBusiness ? '#6B635B' : 'rgba(255,255,255,0.7)' }}
              >views</span>
            </div>
          </div>

          {/* Actions - neumorphic buttons for business */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* T-Score button - only for Sparks, not Business Insights */}
            {!isBusinessInsight && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGiveThought();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                  "transition-all duration-200",
                  !isBusiness && (hasGivenThought
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white")
                )}
                style={isBusiness ? (hasGivenThought ? {
                  background: `${PB_BLUE}20`,
                  color: PB_BLUE,
                  border: `1px solid ${PB_BLUE}40`,
                  boxShadow: `inset 2px 2px 4px rgba(74, 124, 155, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.5)`
                } : {
                  background: '#E0DCD8',
                  color: '#4D4843',
                  border: 'none',
                  boxShadow: '3px 3px 6px rgba(166, 150, 130, 0.25), -3px -3px 6px rgba(255, 255, 255, 0.8)'
                }) : undefined}
              >
                <span className="mr-1.5">✦</span>
                <span className="hidden sm:inline">This made me think</span>
                <span className="sm:hidden">Think</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleContinueBrainstorm();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                "transition-all duration-200",
                !isBusiness && "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              )}
              style={isBusiness ? {
                background: '#E0DCD8',
                color: '#4D4843',
                border: 'none',
                boxShadow: '3px 3px 6px rgba(166, 150, 130, 0.25), -3px -3px 6px rgba(255, 255, 255, 0.8)'
              } : undefined}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveReference();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                "transition-all duration-200",
                !isBusiness && "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              )}
              style={isBusiness ? {
                background: '#E0DCD8',
                color: '#4D4843',
                border: 'none',
                boxShadow: '3px 3px 6px rgba(166, 150, 130, 0.25), -3px -3px 6px rgba(255, 255, 255, 0.8)'
              } : undefined}
            >
              Save reference
            </button>

            {/* Preview button - circular with globe icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('pb:post:preview', { detail: { postId: spark.id } })
                );
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "transition-all duration-200",
                !isBusiness && "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
              style={isBusiness ? {
                background: '#E0DCD8',
                border: 'none',
                boxShadow: '3px 3px 6px rgba(166, 150, 130, 0.25), -3px -3px 6px rgba(255, 255, 255, 0.8)'
              } : undefined}
              title="Preview"
            >
              <Globe 
                className="w-4 h-4"
                style={{ color: isBusiness ? '#6B635B' : 'rgba(255,255,255,0.7)' }}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
