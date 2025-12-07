import React, { useEffect, useRef, useState } from "react";
import type { Spark } from "./BrainstormLayout";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

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
  const [tScore, setTScore] = useState(spark.t_score);
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

  return (
    <article
      onClick={() => onView?.(spark.id)}
      className={cn(
        "relative w-full rounded-3xl px-6 py-5",
        "bg-transparent",
        "backdrop-blur-xl border border-white/10",
        "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
        "transition-all duration-300",
        "hover:scale-[1.01] hover:shadow-[0_20px_70px_rgba(0,0,0,0.5)]",
        onView ? "cursor-pointer" : ""
      )}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/6 via-transparent to-[#489FE3]/12 opacity-70"
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* avatar / initials could go here */}
            <div className="text-sm font-medium text-white">
              {spark.is_anonymous
                ? "Anonymous"
                : spark.author_display_name || "Unknown author"}
            </div>
          </div>
          <time className="text-xs text-white/60">
            {new Date(spark.created_at).toLocaleString()}
          </time>
        </header>

        {/* Body */}
        <div className="mb-4 space-y-2">
          {spark.title && (
            <h2 className="text-base font-semibold text-white leading-tight">
              {spark.title}
            </h2>
          )}
          <p className="text-sm text-white/90 leading-relaxed">
            {spark.body}
          </p>
        </div>

        {/* Footer: Metrics pill + Actions */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Glass metrics pill */}
          <div
            className={cn(
              "inline-flex items-center gap-3 rounded-full px-4 py-1.5",
              "bg-white/8 backdrop-blur-xl border border-white/15",
              "shadow-[0_0_12px_rgba(0,0,0,0.25)]",
              "transition-all duration-300",
              "hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">
                {tScore}
              </span>
              <span className="text-[11px] text-white/70">Thoughts</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">
                {viewCount}
              </span>
              <span className="text-[11px] text-white/70">views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGiveThought();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                "transition-all duration-200",
                hasGivenThought
                  ? "bg-white/15 text-white border border-white/20"
                  : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="mr-1.5">✦</span>
              <span className="hidden sm:inline">This made me think</span>
              <span className="sm:hidden">Think</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleContinueBrainstorm();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                "bg-white/5 text-white/80 border border-white/10",
                "hover:bg-white/10 hover:text-white",
                "transition-all duration-200"
              )}
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
                "bg-white/5 text-white/80 border border-white/10",
                "hover:bg-white/10 hover:text-white",
                "transition-all duration-200"
              )}
            >
              Save reference
            </button>

            {/* Preview button - circular with globe icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('pb:post:preview', { detail: { sparkId: spark.id } })
                );
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-white/5 border border-white/10",
                "hover:bg-white/10",
                "transition-all duration-200"
              )}
              title="Preview"
            >
              <Globe className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
