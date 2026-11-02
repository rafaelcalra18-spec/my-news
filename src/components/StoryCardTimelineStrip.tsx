/**
 * @file src/components/StoryCardTimelineStrip.tsx
 * @description Date-spaced horizontal mini-timeline strip rendered under each card's headline.
 *
 * Implements Section 1 & Requirement 9:
 * 1. Date-spaced horizontal timeline as a small strip under each card's headline.
 * 2. Past entries are solid dots, today is the accent dot, and upcoming events are hollow dots on a dashed segment after today.
 * 3. Label only the first date, "today" and "next".
 * 4. Tapping the card or the strip opens the story view.
 * 5. Strictly no text smaller than 13 px on a phone.
 *
 * USE CASES:
 * - Visually giving readers an instant chronological glance of a story's momentum directly on the Today card.
 */

import React from 'react';
import { TimelineNode } from '../types/news.ts';
import { getUpcomingEventsForStory } from '../data/upcomingEventsData.ts';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface StoryCardTimelineStripProps {
  storyId: string;
  nodes: TimelineNode[];
  onOpenStory: () => void;
}

export function StoryCardTimelineStrip({
  storyId,
  nodes,
  onOpenStory
}: StoryCardTimelineStripProps): React.ReactElement {
  const config = getAppConfig();
  const upcoming = getUpcomingEventsForStory(storyId);
  const hasUpcoming = upcoming.length > 0;

  logFunctionCall('StoryCardTimelineStrip:render', {
    storyId,
    nodesCount: nodes.length,
    hasUpcoming
  });

  // If there are no nodes, render a minimal placeholder
  if (nodes.length === 0) {
    return <div className="h-8" />;
  }

  // Today node or the latest node
  const todayNode = nodes.find((n) => n.isToday) || nodes[nodes.length - 1];
  const firstNode = nodes[0];

  const pastToTodayWidthPct = hasUpcoming ? 74 : 92;

  const minTimestamp = new Date(firstNode.date).getTime();
  const todayTimestamp = new Date(todayNode.date).getTime();
  const duration = Math.max(1, todayTimestamp - minTimestamp);

  /**
   * Computes horizontal percentage along the strip for a given date.
   */
  const computePct = (dateStr: string): number => {
    if (nodes.length <= 1 || duration === 0) return 12;
    const t = new Date(dateStr).getTime();
    const ratio = Math.max(0, Math.min(1, (t - minTimestamp) / duration));
    return 8 + ratio * (pastToTodayWidthPct - 16);
  };

  const todayPct = computePct(todayNode.date);
  const upcomingPct = 92;

  // Format first date concisely (e.g. "25 Oct")
  const firstDateLabel = firstNode.dateDisplay.replace(/^[A-Za-z]+\s+/, '');

  return (
    <div
      onClick={onOpenStory}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenStory();
        }
      }}
      className="w-full pt-1.5 pb-4 my-2 cursor-pointer group focus:outline-none select-none"
      aria-label="Story timeline overview, tap to expand story view"
    >
      <div className="relative h-8 flex items-center">
        {/* Continuous Solid Track leading up to Today */}
        <div
          className="absolute left-2 h-[2px] bg-stone-300 transition-colors group-hover:bg-stone-400"
          style={{ width: `${todayPct - 2}%` }}
        />

        {/* Dashed Segment leading from Today to Upcoming */}
        {hasUpcoming && (
          <div
            className="absolute h-[2px] border-t-2 border-dashed border-stone-400 transition-colors group-hover:border-stone-500"
            style={{
              left: `${todayPct + 2}%`,
              width: `${upcomingPct - todayPct - 4}%`
            }}
          />
        )}

        {/* Past Milestone Nodes: Solid Dots */}
        {nodes.map((node) => {
          if (node.id === todayNode.id) return null;
          const pct = computePct(node.date);
          const isFirst = node.id === firstNode.id;

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${pct}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-stone-600 group-hover:bg-stone-900 transition-transform group-hover:scale-125" />
              {isFirst && (
                <span className="absolute top-3 text-[13px] font-mono text-stone-500 group-hover:text-stone-700 whitespace-nowrap">
                  {firstDateLabel}
                </span>
              )}
            </div>
          );
        })}

        {/* Today Node: Accent Dot with "today" label */}
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${todayPct}%` }}
        >
          <div
            className="w-3 h-3 rounded-full ring-2 ring-white transition-transform group-hover:scale-125 shadow-xs"
            style={{ backgroundColor: config.accentColorHex }}
          />
          <span
            className="absolute top-3 text-[13px] font-mono font-bold tracking-tight whitespace-nowrap"
            style={{ color: config.accentColorHex }}
          >
            today
          </span>
        </div>

        {/* Upcoming Milestone Node: Hollow Dot with "next" label */}
        {hasUpcoming && (
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${upcomingPct}%` }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full border-2 bg-white transition-transform group-hover:scale-125"
              style={{ borderColor: config.accentColorHex }}
            />
            <span className="absolute top-3 text-[13px] font-mono text-stone-600 group-hover:text-stone-900 font-semibold whitespace-nowrap">
              next
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
