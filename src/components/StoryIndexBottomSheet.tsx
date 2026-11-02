/**
 * @file src/components/StoryIndexBottomSheet.tsx
 * @description Bottom Sheet listing all stories grouped by section for rapid timeline navigation.
 *
 * Implements User Requirement 8 & 9:
 * 1. "In the story list sheet, number stories from 1 within each section, or remove the numbers."
 * 2. "No text smaller than 13 px on a phone, including chart labels."
 * 3. Grouped by section (World, UK, F1, Robotics) with two-line wrapping headlines.
 *
 * USE CASES:
 * - Reader tapping the list button in the Story View to view full edition index and jump directly to any story.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { Story } from '../types/news.ts';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface StoryIndexBottomSheetProps {
  isOpen: boolean;
  stories: Story[];
  currentStoryId: string;
  onSelectStory: (id: string) => void;
  onClose: () => void;
}

export function StoryIndexBottomSheet({
  isOpen,
  stories,
  currentStoryId,
  onSelectStory,
  onClose
}: StoryIndexBottomSheetProps): React.ReactElement {
  const config = getAppConfig();

  logFunctionCall('StoryIndexBottomSheet:render', {
    isOpen,
    currentStoryId,
    storiesCount: stories.length
  });

  // Group stories by section in natural order
  const sectionsOrder = ['World', 'UK', 'F1', 'Robotics'];
  const groupedSections: { section: string; stories: Story[] }[] = [];

  sectionsOrder.forEach((section) => {
    const sectionStories = stories.filter((s) => s.section.toLowerCase() === section.toLowerCase());
    if (sectionStories.length > 0) {
      groupedSections.push({ section, stories: sectionStories });
    }
  });

  // Catch any remaining sections
  stories.forEach((s) => {
    if (!sectionsOrder.some((sec) => sec.toLowerCase() === s.section.toLowerCase())) {
      let group = groupedSections.find((g) => g.section === s.section);
      if (!group) {
        group = { section: s.section, stories: [] };
        groupedSections.push(group);
      }
      group.stories.push(s);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 max-w-[640px] mx-auto bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] border-t border-stone-200"
          >
            {/* Sheet Handle & Header */}
            <div className="p-4 pb-3 border-b border-stone-100 flex items-center justify-between">
              <div>
                <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Edition Index
                </h3>
                <p className="text-[13px] text-stone-500 font-mono">
                  {stories.length} stories across {groupedSections.length} sections
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close index"
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Story List grouped by section */}
            <div className="p-4 overflow-y-auto space-y-6">
              {groupedSections.map((group) => (
                <div key={group.section} className="space-y-2">
                  <div className="text-[13px] font-mono font-bold text-stone-500 uppercase tracking-wider px-1">
                    {group.section}
                  </div>

                  <div className="divide-y divide-stone-100 bg-stone-50/70 rounded-lg border border-stone-200 overflow-hidden">
                    {/* Numbered from 1 within each section */}
                    {group.stories.map((story, itemIdx) => {
                      const isCurrent = story.id === currentStoryId;
                      const sectionIndex = itemIdx + 1;

                      return (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => {
                            logFunctionCall('StoryIndexBottomSheet:selectStory', { id: story.id });
                            onSelectStory(story.id);
                            onClose();
                          }}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                            isCurrent
                              ? 'bg-stone-200/70 text-stone-900'
                              : 'hover:bg-stone-100 text-stone-800'
                          }`}
                        >
                          {/* Numbered from 1 within section: strictly >= 13px */}
                          <span className="font-mono text-[13px] font-bold text-stone-400 pt-0.5 shrink-0 w-5">
                            {sectionIndex}
                          </span>

                          <div className="flex-1 min-w-0">
                            {/* Two-line headline that wraps neatly */}
                            <div className="font-serif text-[14px] font-semibold text-stone-900 line-clamp-2 leading-snug">
                              {story.headline}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className="text-[13px] font-semibold px-1.5 py-0.5 rounded text-white uppercase tracking-wider"
                                style={{
                                  backgroundColor:
                                    story.statusTag === 'Updated'
                                      ? config.accentColorHex
                                      : '#57534e'
                                }}
                              >
                                {story.statusTag}
                              </span>
                              {story.changeDate && (
                                <span className="text-[13px] text-stone-600 font-mono">
                                  {story.changeDate}
                                </span>
                              )}
                              {story.market && (
                                <span className="text-[13px] font-mono text-stone-700 bg-stone-200/80 px-1.5 py-0.5 rounded">
                                  Market {story.market.probabilityFormatted}
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-1" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
