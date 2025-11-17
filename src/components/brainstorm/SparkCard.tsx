import React, { useEffect, useRef, useState } from "react";
import type { Spark } from "./BrainstormLayout";

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
    <article className="pb-spark-card">
      <header className="pb-spark-card__header">
        <div className="pb-spark-card__author">
          {/* avatar / initials could go here */}
          <div className="pb-spark-card__author-name">
            {spark.is_anonymous
              ? "Anonymous"
              : spark.author_display_name || "Unknown author"}
          </div>
        </div>
        <time className="pb-spark-card__timestamp">
          {new Date(spark.created_at).toLocaleString()}
        </time>
      </header>

      <div className="pb-spark-card__body">
        {spark.title && (
          <h2 className="pb-spark-card__title">{spark.title}</h2>
        )}
        <p className="pb-spark-card__text">{spark.body}</p>
      </div>

      <footer className="pb-spark-card__footer">
        <div className="pb-spark-card__metrics">
          <span className="pb-spark-card__metric">
            {tScore} Thoughts
          </span>
          <span className="pb-spark-card__metric">
            {viewCount} views
          </span>
        </div>

        <div className="pb-spark-card__actions">
          <button
            type="button"
            onClick={handleGiveThought}
            className={
              "pb-spark-card__thought-button" +
              (hasGivenThought ? " pb-spark-card__thought-button--active" : "")
            }
          >
            {/* This icon will later get a nice animation in CSS / Lovable */}
            <span className="pb-spark-card__thought-icon">✦</span>
            <span className="pb-spark-card__thought-label">
              This made me think
            </span>
          </button>

          <button
            type="button"
            onClick={handleContinueBrainstorm}
            className="pb-spark-card__button"
          >
            Continue brainstorm
          </button>

          <button
            type="button"
            onClick={handleSaveReference}
            className="pb-spark-card__button"
          >
            Save reference
          </button>
        </div>
      </footer>
    </article>
  );
};
