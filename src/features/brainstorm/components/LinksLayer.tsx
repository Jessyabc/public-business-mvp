import { PostLink } from '../types';

type Props = {
  links: PostLink[];
  getNodeAnchor: (id: string) => { x: number; y: number } | null;
  containerWidth: number;
  containerHeight: number;
};

export function LinksLayer({ links, getNodeAnchor, containerWidth, containerHeight }: Props) {
  const getStrokeStyle = (linkType: PostLink['link_type']): string => {
    if (linkType === 'hard') {
      return 'solid';
    } else if (linkType === 'soft') {
      return 'dashed';
    } else {
      // biz_out or biz_in
      return 'solid';
    }
  };

  const getStrokeDasharray = (linkType: PostLink['link_type']): string => {
    if (linkType === 'soft') {
      return '5,5';
    }
    return '0';
  };

  const getStrokeWidth = (weight: number): number => {
    // Clamp weight between 1 and 4
    return Math.max(1, Math.min(4, Math.round(weight)));
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={containerWidth}
      height={containerHeight}
    >
      {links.map((link) => {
        const sourceAnchor = getNodeAnchor(link.source_post_id);
        const targetAnchor = getNodeAnchor(link.target_post_id);

        // Skip if either anchor is not found
        if (!sourceAnchor || !targetAnchor) {
          return null;
        }

        const strokeWidth = getStrokeWidth(link.weight);
        const isBizLink = link.link_type === 'biz_out' || link.link_type === 'biz_in';

        return (
          <line
            key={link.id}
            x1={sourceAnchor.x}
            y1={sourceAnchor.y}
            x2={targetAnchor.x}
            y2={targetAnchor.y}
            stroke="rgb(163 163 163)" // neutral-400
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDasharray(link.link_type)}
            data-biz-link={isBizLink ? 'true' : undefined}
            className={isBizLink ? 'biz-link' : ''}
          />
        );
      })}
    </svg>
  );
}

