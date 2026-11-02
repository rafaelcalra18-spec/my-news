/**
 * @file src/components/FullStorySection.tsx
 * @description Dedicated Full Story Section for StoryDetailView.
 *
 * Implements User Requirements 4 & 5:
 * 1. "Show it under the heading 'Full story', with the listed sources as links underneath."
 * 2. "Order in the story view: headline, 'What changed' line, Full story, timeline, what's next, market."
 * 3. "No text smaller than 13 px on a phone, including chart labels."
 *
 * USE CASES:
 * - Rendering comprehensive factual background context for stories 1-11 in the fullscreen story view.
 */

import React from 'react';
import { FullStoryRecord } from '../data/fullStoryData.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface FullStorySectionProps {
  fullStory: FullStoryRecord | null;
}

export function FullStorySection({ fullStory }: FullStorySectionProps): React.ReactElement | null {
  if (!fullStory) {
    return null;
  }

  logFunctionCall('FullStorySection:render', {
    storyId: fullStory.storyId,
    sourcesCount: fullStory.sources.length
  });

  return (
    <section className="mb-6 pt-3 pb-4 border-b border-stone-200">
      <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight mb-2">
        Full story
      </h2>

      {/* Main body text: strictly >= 13px */}
      <p className="text-[13px] sm:text-sm text-stone-800 leading-relaxed mb-3">
        {fullStory.text}
      </p>

      {/* Sources as links underneath */}
      {fullStory.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-stone-600">
          <span className="font-medium text-stone-500">
            {fullStory.sources.length === 1 ? 'Source:' : 'Sources:'}
          </span>
          {fullStory.sources.map((src, idx) => (
            <span key={idx} className="inline-flex items-center">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
              >
                {src.outlet}
              </a>
              {idx < fullStory.sources.length - 1 && (
                <span className="text-stone-400 ml-1.5 mr-0.5">,</span>
              )}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
