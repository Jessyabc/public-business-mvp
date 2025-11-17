import { useState } from 'react';

export type Spark = {
  id: string;
  title?: string | null;
  body: string;
  created_at: string;
  author_display_name?: string | null;
  is_anonymous: boolean;
  t_score: number;
  view_count: number;
};

export type PostSummary = {
  id: string;
  title?: string | null;
  excerpt: string;
  created_at: string;
};

export type OpenIdeaSummary = {
  id: string;
  excerpt: string;
  created_at: string;
};

export type BrainstormLayoutProps = {
  lastSeenSparks: Spark[];
  currentSpark: Spark | null;
  referencedPosts: PostSummary[];
  openIdeas: OpenIdeaSummary[];
  onSelectSpark?: (sparkId: string) => void;
};

type SidebarTab = 'breadcrumbs' | 'openIdeas';

export const BrainstormLayout = ({
  lastSeenSparks,
  currentSpark,
  referencedPosts,
  openIdeas,
  onSelectSpark,
}: BrainstormLayoutProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('breadcrumbs');

  const handleSelectSpark = (sparkId: string) => {
    onSelectSpark?.(sparkId);
  };

  const renderSparkPreview = (spark: Spark) => {
    if (spark.title && spark.title.trim().length > 0) {
      return spark.title;
    }
    if (spark.body.length <= 80) {
      return spark.body;
    }
    return `${spark.body.slice(0, 77)}...`;
  };

  return (
    <div className="pb-brainstorm-layout">
      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__last-seen">
        <h3 className="pb-brainstorm-layout__column-heading">Last seen</h3>
        <ul className="pb-brainstorm-layout__list">
          {lastSeenSparks.map((spark) => (
            <li key={spark.id}>
              <button
                type="button"
                className="pb-brainstorm-layout__list-item"
                onClick={() => handleSelectSpark(spark.id)}
              >
                {renderSparkPreview(spark)}
              </button>
            </li>
          ))}
          {lastSeenSparks.length === 0 && (
            <li className="pb-brainstorm-layout__empty">No recent sparks</li>
          )}
        </ul>
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__current">
        {currentSpark ? (
          <div className="pb-brainstorm-layout__current-card">
            <h2 className="pb-brainstorm-layout__current-title">
              {currentSpark.title || 'Untitled spark'}
            </h2>
            <p className="pb-brainstorm-layout__current-body">{currentSpark.body}</p>
            <div className="pb-brainstorm-layout__current-meta">
              <span className="pb-brainstorm-layout__current-score">
                T-score: {currentSpark.t_score}
              </span>
              <span className="pb-brainstorm-layout__current-views">
                Views: {currentSpark.view_count}
              </span>
            </div>
          </div>
        ) : (
          <div className="pb-brainstorm-layout__current-placeholder">No spark selected</div>
        )}
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__referenced-in">
        <h3 className="pb-brainstorm-layout__column-heading">Referenced in</h3>
        <div className="pb-brainstorm-layout__referenced-list">
          {referencedPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              className="pb-brainstorm-layout__referenced-item"
              onClick={() => handleSelectSpark(post.id)}
            >
              <div className="pb-brainstorm-layout__referenced-title">
                {post.title || 'Untitled post'}
              </div>
              <p className="pb-brainstorm-layout__referenced-excerpt">{post.excerpt}</p>
            </button>
          ))}
          {referencedPosts.length === 0 && (
            <div className="pb-brainstorm-layout__empty">No references yet</div>
          )}
        </div>
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__sidebar">
        <div className="pb-brainstorm-sidebar__tabs">
          <button
            type="button"
            className={`pb-brainstorm-sidebar__tab${
              activeTab === 'breadcrumbs' ? ' is-active' : ''
            }`}
            onClick={() => setActiveTab('breadcrumbs')}
          >
            Breadcrumbs
          </button>
          <button
            type="button"
            className={`pb-brainstorm-sidebar__tab${
              activeTab === 'openIdeas' ? ' is-active' : ''
            }`}
            onClick={() => setActiveTab('openIdeas')}
          >
            Open ideas
          </button>
        </div>
        <div className="pb-brainstorm-sidebar__content">
          {activeTab === 'breadcrumbs' ? (
            <div className="pb-brainstorm-sidebar__placeholder">
              Breadcrumbs will go here
            </div>
          ) : (
            <ul className="pb-brainstorm-sidebar__open-ideas">
              {openIdeas.map((idea) => (
                <li key={idea.id} className="pb-brainstorm-sidebar__open-idea">
                  <p className="pb-brainstorm-sidebar__open-idea-excerpt">{idea.excerpt}</p>
                  <span className="pb-brainstorm-sidebar__open-idea-date">{idea.created_at}</span>
                </li>
              ))}
              {openIdeas.length === 0 && (
                <li className="pb-brainstorm-layout__empty">No open ideas yet</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainstormLayout;
