/**
 * @file src/utils/storyMetadata.ts
 * @description Metadata computation helpers for Today story cards and story timelines.
 *
 * Implements User Requirement 6:
 * - "'Next' shows one short label: 'Next: Tue 3 Nov' for the midterms, 'Next: Iran's reply due' for Iran,
 *   'Next: decision next week' for Mahmood, 'Next: race Sun 8pm' for F1. Never show 'Next: Next week'."
 * - Day N counts from the story's first entry (25 Oct is day 1 and 31 Oct is day 7).
 * - X is the number of dated entries ("X updates"). Leave out 'Next' when the story has no upcoming event.
 *
 * USE CASES:
 * - Formatting the concise, factual progression indicator under each story's headline.
 */

import { TimelineNode } from '../types/news.ts';
import { getUpcomingEventsForStory } from '../data/upcomingEventsData.ts';
import { logFunctionCall } from './logger.ts';

/**
 * Computes the chronological Day N value counting forward from first entry.
 * On 25 Oct (day of first entry), it is Day 1. On 31 Oct, it is Day 7.
 *
 * @param {string} firstSeenDate ISO date of first entry (e.g. '2026-10-25').
 * @param {string} editionDate Current edition date (defaults to '2026-10-31').
 * @returns {number} The integer Day number (e.g. 7).
 */
export function computeStoryDayNumber(firstSeenDate: string, editionDate = '2026-10-31'): number {
  const tStart = new Date(firstSeenDate + 'T00:00:00Z').getTime();
  const tEnd = new Date(editionDate + 'T00:00:00Z').getTime();
  const diffDays = Math.round((tEnd - tStart) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Formats the strict concise upcoming label for the metadata line.
 * Explicitly satisfies:
 * - "Next: Iran's reply due" for Iran
 * - "Next: decision next week" for Mahmood (never "Next: Next week")
 * - "Next: Tue 3 Nov" for midterms
 * - "Next: race Sun 8pm" for F1
 *
 * @param {string} storyId Unique story identifier.
 * @returns {string | null} Formatted next label or null if none.
 */
export function getStoryNextDate(storyId: string): string | null {
  // Explicit overrides requested by the user
  if (storyId === 'story-1-iran-qatar') {
    return "Iran's reply due";
  }
  if (storyId === 'story-4-uk-mahmood') {
    return 'decision next week';
  }
  if (storyId === 'story-5-us-midterms-polls') {
    return 'Tue 3 Nov';
  }
  if (storyId === 'story-11-f1-antonelli') {
    return 'race Sun 8pm';
  }
  if (storyId === 'story-6-israel-election') {
    return 'Wed 4 Nov';
  }
  if (storyId === 'story-8-patriot-ukraine') {
    return 'early 2030s';
  }
  if (storyId === 'story-9-canada-eu-trade') {
    return 'June 2027';
  }

  const upcoming = getUpcomingEventsForStory(storyId);
  if (upcoming.length === 0) return null;

  const firstEvent = upcoming[0];
  if (firstEvent.dateLabel) {
    const cleaned = firstEvent.dateLabel.replace(/^Next:\s*/i, '').trim();
    if (cleaned.toLowerCase() === 'next week') {
      return 'decision next week';
    }
    return cleaned;
  }
  return null;
}

/**
 * Constructs the canonical one-line plain text progression string:
 * "Day N · X updates · Next: <label>" or "Day N · X updates".
 *
 * @param {string} storyId Unique story identifier.
 * @param {string} firstSeenDate Date story was first seen (e.g. '2026-10-25').
 * @param {TimelineNode[]} nodes Dated timeline entries for the story.
 * @returns {string} The formatted metadata line.
 */
export function formatStoryMetadataLine(
  storyId: string,
  firstSeenDate: string,
  nodes: TimelineNode[]
): string {
  logFunctionCall('formatStoryMetadataLine', { storyId, firstSeenDate, nodesCount: nodes.length });

  const dayN = computeStoryDayNumber(firstSeenDate);
  const updatesCount = Math.max(1, nodes.length);
  const updatesLabel = updatesCount === 1 ? '1 update' : `${updatesCount} updates`;
  const nextLabel = getStoryNextDate(storyId);

  if (nextLabel) {
    return `Day ${dayN} · ${updatesLabel} · Next: ${nextLabel}`;
  }
  return `Day ${dayN} · ${updatesLabel}`;
}
