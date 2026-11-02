/**
 * @file src/data/upcomingEventsData.ts
 * @description Verified Upcoming Milestone Events for Story Timelines.
 *
 * Implements strict adherence to the seed list of upcoming events:
 * - Story 1 (Iran): "Iran's reply to Qatar was expected by the end of this week (CBS News). The US votes on Tue 3 Nov, and CBS reports that Trump is weighing new strikes or a deal after that." -> "Next: Iran's reply due"
 * - Story 4 (Mahmood): "Final decision expected next week (BBC, via Eastern Eye)." -> "Next: decision next week"
 * - Story 5 (US midterms): "Election day, Tue 3 Nov." -> "Next: Tue 3 Nov"
 * - Story 6 (Israel): "Official results go to President Herzog on Wed 4 Nov. The new Knesset is sworn in on Tue 10 Nov (The Times of Israel)." -> "Next: Wed 4 Nov"
 * - Story 8 (Patriot sale): "Deliveries not expected until the early 2030s, according to two people briefed (Al Jazeera)." -> "Next: early 2030s"
 * - Story 9 (EU and Canada): "Carney's target of associate membership by June 2027 (Euronews)." -> "Next: June 2027"
 * - Story 11 (F1): "Qualifying Sat 31 Oct at 9pm GMT. Race Sun 1 Nov at 8pm GMT. Antonelli wins the title with ninth or better." -> "Next: race Sun 8pm"
 * - All other stories have NO upcoming events and end with "No dates announced yet".
 *
 * USE CASES:
 * - Rendering upcoming hollow dots and milestones in the full story view and metadata lines.
 */

import { logFunctionCall } from '../utils/logger.ts';

export interface UpcomingMilestone {
  id: string;
  storyId: string;
  text: string;
  dateLabel?: string;
  sourceOutlet?: string;
}

/**
 * Strict canonical lookup of upcoming events by story ID.
 * Strictly limited to the 7 stories specified in the editorial brief.
 */
export const UPCOMING_EVENTS_BY_STORY: Record<string, UpcomingMilestone[]> = {
  // Story 1: Iran
  'story-1-iran-qatar': [
    {
      id: 'upcoming-story-1',
      storyId: 'story-1-iran-qatar',
      text: "Iran's reply to Qatar was expected by the end of this week (CBS News). The US votes on Tue 3 Nov, and CBS reports that Trump is weighing new strikes or a deal after that.",
      dateLabel: "Next: Iran's reply due",
      sourceOutlet: 'CBS News'
    }
  ],

  // Story 4: Mahmood
  'story-4-uk-mahmood': [
    {
      id: 'upcoming-story-4',
      storyId: 'story-4-uk-mahmood',
      text: 'Final decision expected next week (BBC, via Eastern Eye).',
      dateLabel: 'Next: decision next week',
      sourceOutlet: 'BBC / Eastern Eye'
    }
  ],

  // Story 5: US Midterms
  'story-5-us-midterms-polls': [
    {
      id: 'upcoming-story-5',
      storyId: 'story-5-us-midterms-polls',
      text: 'Election day, Tue 3 Nov.',
      dateLabel: 'Next: Tue 3 Nov',
      sourceOutlet: undefined
    }
  ],

  // Story 6: Israel
  'story-6-israel-election': [
    {
      id: 'upcoming-story-6',
      storyId: 'story-6-israel-election',
      text: 'Official results go to President Herzog on Wed 4 Nov. The new Knesset is sworn in on Tue 10 Nov (The Times of Israel).',
      dateLabel: 'Next: Wed 4 Nov & Tue 10 Nov',
      sourceOutlet: 'The Times of Israel'
    }
  ],

  // Story 8: Patriot missile sale
  'story-8-patriot-ukraine': [
    {
      id: 'upcoming-story-8',
      storyId: 'story-8-patriot-ukraine',
      text: 'Deliveries not expected until the early 2030s, according to two people briefed (Al Jazeera).',
      dateLabel: 'Next: early 2030s',
      sourceOutlet: 'Al Jazeera'
    }
  ],

  // Story 9: Canada and EU
  'story-9-canada-eu-trade': [
    {
      id: 'upcoming-story-9',
      storyId: 'story-9-canada-eu-trade',
      text: "Carney's target of associate membership by June 2027 (Euronews).",
      dateLabel: 'Next: June 2027',
      sourceOutlet: 'Euronews'
    }
  ],

  // Story 11: F1 Mexico GP
  'story-11-f1-antonelli': [
    {
      id: 'upcoming-story-11',
      storyId: 'story-11-f1-antonelli',
      text: 'Qualifying Sat 31 Oct at 9pm GMT. Race Sun 1 Nov at 8pm GMT. Antonelli wins the title with ninth or better.',
      dateLabel: 'Next: race Sun 8pm',
      sourceOutlet: undefined
    }
  ]
};

/**
 * Retrieves the strict list of upcoming milestone events for a given story.
 *
 * @param {string} storyId Unique story identifier.
 * @returns {UpcomingMilestone[]} Array of upcoming milestones (empty if none announced).
 */
export function getUpcomingEventsForStory(storyId: string): UpcomingMilestone[] {
  logFunctionCall('getUpcomingEventsForStory', { storyId });
  return UPCOMING_EVENTS_BY_STORY[storyId] || [];
}
