/**
 * @file src/components/SectionFilterBar.tsx
 * @description Sticky Section Filter Bar for the Today Feed with Animated Sliding Underline.
 *
 * Implements User Requirement 1:
 * - "Add 'Markets' as the last item in the section bar. It shows only stories that have a market, sorted by the size of the market's move over seven days."
 * - Layout: 'All', followed by sections reader follows, then remaining sections, and 'Markets' at the end.
 * - Sliding underline indicator with shared layoutId.
 * - Strictly no text smaller than 13 px.
 *
 * USE CASES:
 * - Reader filtering Today edition stories across All, followed sections, other sections, and Markets.
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface SectionFilterBarProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
  readerTopics: string[];
}

/**
 * Renders sticky horizontal section tabs with animated underline.
 *
 * @param {SectionFilterBarProps} props Component props.
 * @returns {React.ReactElement} Section filter bar.
 */
export function SectionFilterBar({
  selectedSection,
  onSelectSection,
  readerTopics
}: SectionFilterBarProps): React.ReactElement {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();

  logFunctionCall('SectionFilterBar:render', { selectedSection, readerTopics });

  const allKnownSections = ['Sport', 'Tech', 'World', 'UK'];

  // Determine sections reader follows
  const normalizedTopics = readerTopics.map((t) => t.toLowerCase());
  const followedSections: string[] = [];
  const remainingSections: string[] = [];

  allKnownSections.forEach((sec) => {
    const secLower = sec.toLowerCase();
    const isFollowed = normalizedTopics.some(
      (topic) =>
        topic.includes(secLower) ||
        secLower.includes(topic) ||
        (secLower === 'sport' && topic.includes('f1')) ||
        (secLower === 'tech' && topic.includes('robotics'))
    );

    if (isFollowed) {
      followedSections.push(sec);
    } else {
      remainingSections.push(sec);
    }
  });

  // "Markets" is strictly the last item in the section bar
  const sectionTabs = ['All', ...followedSections, ...remainingSections, 'Markets'];

  return (
    <nav
      aria-label="Section Filter"
      className="sticky top-12 z-20 bg-stone-50 border-b border-stone-200 px-3 py-1 select-none shadow-xs"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {sectionTabs.map((sec) => {
          const isSelected = selectedSection.toLowerCase() === sec.toLowerCase();

          return (
            <button
              key={sec}
              type="button"
              onClick={() => {
                logFunctionCall('SectionFilterBar:select', { sec });
                onSelectSection(sec);
              }}
              className={`relative px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSelected ? 'text-stone-950 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{sec}</span>

              {/* Sliding underline with shared layoutId */}
              {isSelected && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'section-underline'}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.1 }
                      : { type: 'spring', stiffness: 450, damping: 35 }
                  }
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full"
                  style={{ backgroundColor: config.accentColorHex }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
