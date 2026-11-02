/**
 * @file src/components/StoryTimelines.tsx
 * @description Timeline Screen Wrapper for "My news".
 *
 * Implements Section 5 of Timeline Redesign:
 * - "The Timeline bottom tab opens the story view at the first story. Remove the old horizontal chips story selector."
 *
 * USE CASES:
 * - Direct timeline viewing initiated from the fixed bottom tab bar.
 */

import React from 'react';
import { Story } from '../types/news.ts';
import { StoryDetailView } from './StoryDetailView.tsx';
import { logFunctionCall } from '../utils/logger.ts';

interface StoryTimelinesProps {
  initialStoryId?: string;
  stories: Story[];
  onClose: () => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onSelectStory?: (storyId: string) => void;
}

export function StoryTimelines({
  initialStoryId,
  stories,
  onClose,
  onLike,
  onDislike,
  onSelectStory
}: StoryTimelinesProps): React.ReactElement {
  logFunctionCall('StoryTimelines:render', { initialStoryId });

  return (
    <StoryDetailView
      stories={stories}
      initialStoryId={initialStoryId || stories[0]?.id || ''}
      onClose={onClose}
      onLike={onLike || (() => {})}
      onDislike={onDislike || (() => {})}
      onSelectStory={onSelectStory}
    />
  );
}
