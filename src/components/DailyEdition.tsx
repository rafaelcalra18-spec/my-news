/**
 * @file src/components/DailyEdition.tsx
 * @description Today's Morning Edition Screen for "My news" with Section & Market Filtering.
 *
 * Implements User Requirement 1:
 * - "Add 'Markets' as the last item in the section bar. It shows only stories that have a market, sorted by the size of the market's move over seven days."
 * - When a standard section or 'All' is selected, stories are displayed chronologically/editorially.
 * - When 'Markets' is selected, shows only stories linked to prediction markets sorted by 7-day momentum magnitude.
 *
 * USE CASES:
 * - Daily briefing reading on phone and desktop with instant section and market filtering.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoryCard } from './StoryCard.tsx';
import { SectionFilterBar } from './SectionFilterBar.tsx';
import { Story } from '../types/news.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface DailyEditionProps {
  stories: Story[];
  readerTopics: string[];
  onOpenStory: (id: string) => void;
}

/**
 * Calculates the maximum 7-day price move magnitude among markets attached to a story.
 *
 * @param {Story} story News story item.
 * @returns {number} Absolute move size.
 */
function getStoryMaxMarketMove(story: Story): number {
  const mList = story.markets && story.markets.length > 0
    ? story.markets
    : story.market
    ? [story.market]
    : [];
  if (mList.length === 0) return 0;
  return Math.max(...mList.map((m) => Math.abs(m.change7d || 0)));
}

/**
 * Daily edition component displaying the morning news feed.
 *
 * @param {DailyEditionProps} props Component props.
 * @returns {React.ReactElement} Daily edition feed.
 */
export function DailyEdition({
  stories,
  readerTopics,
  onOpenStory
}: DailyEditionProps): React.ReactElement {
  const [selectedSection, setSelectedSection] = useState<string>('All');

  logFunctionCall('DailyEdition:render', {
    storyCount: stories.length,
    selectedSection,
    readerTopics
  });

  // Filter & sort stories based on selected section tab
  let displayStories: Story[] = [];

  if (selectedSection.toLowerCase() === 'all') {
    displayStories = stories;
  } else if (selectedSection.toLowerCase() === 'markets') {
    // Shows only stories that have a market, sorted by the size of the market's move over 7 days
    const marketStories = stories.filter(
      (s) => (s.markets && s.markets.length > 0) || !!s.market
    );
    displayStories = [...marketStories].sort(
      (a, b) => getStoryMaxMarketMove(b) - getStoryMaxMarketMove(a)
    );
  } else {
    displayStories = stories.filter(
      (s) => s.section.toLowerCase() === selectedSection.toLowerCase()
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Sticky Section Filter Bar */}
      <SectionFilterBar
        selectedSection={selectedSection}
        onSelectSection={(sec) => setSelectedSection(sec)}
        readerTopics={readerTopics}
      />

      <main className="px-3 pt-3 pb-16 max-w-[640px] mx-auto w-full">
        {/* Animated feed with short crossfade upon section switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="space-y-4"
          >
            {displayStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onOpenStory={onOpenStory}
              />
            ))}

            {displayStories.length === 0 && (
              <div className="text-center py-12 text-[13px] font-mono text-stone-500">
                No stories in {selectedSection} today.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
