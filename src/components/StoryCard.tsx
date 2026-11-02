/**
 * @file src/components/StoryCard.tsx
 * @description Single Story Card Component adhering strictly to minimalist card specifications.
 *
 * Implements User Requirement 2:
 * 1. "Cards: show only the section and status tag, the headline, the 'Day N · X updates · Next' line, the 'What changed' line and, if the story has one, the market block."
 * 2. "Move the summary, coverage and like and dislike buttons into the story view."
 * 3. "The whole card is one button: add a chevron at the right of the headline, and show a pressed state (scale to 0.98) when tapped."
 * 4. "Remove the 'Tap card to view timeline' text."
 * 5. Strictly no text smaller than 13 px.
 *
 * USE CASES:
 * - Rendering minimalist, high-density story cards on the Today screen.
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Story } from '../types/news.ts';
import { getTimelineForStory } from '../data/backfillData.ts';
import { formatStoryMetadataLine } from '../utils/storyMetadata.ts';
import { MarketCardBlock } from './MarketCardBlock.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface StoryCardProps {
  story: Story;
  onOpenStory: (id: string) => void;
}

/**
 * StoryCard renders the minimalist news card as a single interactive button.
 *
 * @param {StoryCardProps} props Component props.
 * @returns {React.ReactElement} Story card element.
 */
export function StoryCard({
  story,
  onOpenStory
}: StoryCardProps): React.ReactElement {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();
  const timelineNodes = getTimelineForStory(story.id);

  logFunctionCall('StoryCard:render', { id: story.id, headline: story.headline });

  const springTransition = shouldReduceMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  const metadataLine = formatStoryMetadataLine(story.id, story.dateFirstSeen, timelineNodes);
  const storyMarkets = story.markets && story.markets.length > 0
    ? story.markets
    : story.market
    ? [story.market]
    : [];

  return (
    <motion.article
      layoutId={shouldReduceMotion ? undefined : `story-card-${story.id}`}
      transition={springTransition}
      whileTap={{ scale: 0.98 }}
      id={`story-${story.id}`}
      onClick={() => onOpenStory(story.id)}
      className="bg-white border border-stone-200 rounded-lg p-4 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer hover:border-stone-300 transition-colors select-none text-left w-full block"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenStory(story.id);
        }
      }}
    >
      {/* 1. Status Tag & Section Name: strictly >= 13px */}
      <div className="flex items-center gap-2 mb-2">
        {story.statusTag === 'Updated' ? (
          <span
            className="text-[13px] font-semibold text-white px-2 py-0.5 rounded tracking-wide uppercase shrink-0"
            style={{ backgroundColor: config.accentColorHex }}
          >
            Updated
          </span>
        ) : (
          <span className="text-[13px] font-semibold bg-stone-700 text-white px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
            New
          </span>
        )}
        <span className="text-[13px] font-medium text-stone-500 uppercase tracking-wider">
          {story.section}
        </span>
      </div>

      {/* 2. Headline with Chevron at the right */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <motion.h2
          layoutId={shouldReduceMotion ? undefined : `story-headline-${story.id}`}
          transition={springTransition}
          className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-snug flex-1"
        >
          {story.headline}
        </motion.h2>

        <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* 3. "Day N · X updates · Next: <date>" Line */}
      <div className="text-[13px] font-mono text-stone-500 mb-2">
        {metadataLine}
      </div>

      {/* 4. Dated "What changed" Line for Updated stories, or one-sentence summary for New stories */}
      {story.statusTag === 'Updated' && story.changeSummary && story.changeDate ? (
        <div
          className="text-[13px] sm:text-sm leading-relaxed pl-3 my-2 border-l-2"
          style={{
            borderColor: config.accentColorHex,
            color: config.accentColorHex
          }}
        >
          <span className="font-semibold">
            What changed · {story.changeDate}:
          </span>{' '}
          <span className="text-stone-800">{story.changeSummary}</span>
        </div>
      ) : (
        <p className="text-[13px] sm:text-sm text-stone-700 leading-relaxed my-2">
          {story.summary.includes('.') ? story.summary.slice(0, story.summary.indexOf('.') + 1) : story.summary}
        </p>
      )}

      {/* 5. In-Card Market Block (if the story has one) */}
      {storyMarkets.length > 0 && (
        <MarketCardBlock
          markets={storyMarkets}
          onOpenStory={() => onOpenStory(story.id)}
        />
      )}
    </motion.article>
  );
}
