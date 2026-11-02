/**
 * @file src/types/news.ts
 * @description Core Domain Models and Type Definitions for "My news".
 *
 * Defines the strict, un-invented data structures for:
 * 1. Story Cards:
 *    - Status tag with strict section name (World, UK, Sport, Tech).
 *    - Headline in serif typeface.
 *    - Plain metadata line: "Day N · X updates · Next: <date>".
 *    - Dated change line (for Updated stories, e.g. "What changed · Sat 31 Oct").
 *    - In-card prediction markets block directly under "What changed".
 *    - Factual 2-3 sentence background summary.
 *    - Situation-based "Why it matters to you" line.
 *    - Neutral coverage rows.
 *    - Reader feedback: like and dislike states.
 * 2. Prediction Markets:
 *    - Platform, exact question, 28px probability, 7-day change with direction arrow.
 *    - 48px compact card chart, 180px detailed story view chart.
 *    - Multi-outcome markets rendered as horizontal bars.
 *    - Multiple markets per story with "+1 more" link.
 * 3. Reader Profile & Navigation:
 *    - Setup sentence, situation, and followed topics.
 *    - Today, Markets, and Topics tabs.
 *
 * USE CASES:
 * - Rendering phone-first cards with inline market expectations.
 * - Powering the dedicated Markets tab sorted by 7-day change size.
 * - Interactive timeline jumping from market chart dates.
 */

export type StoryStatusTag = 'New' | 'Updated';

export type NewsSection = 'World' | 'UK' | 'Sport' | 'Tech' | string;

/**
 * Outcome probability item for multi-candidate markets (e.g. Mexico GP Winner).
 */
export interface MarketOutcome {
  id: string;
  name: string;
  probability: number; // 0.0 to 1.0
  probabilityFormatted: string; // e.g. "36%"
}

/**
 * Daily market price point for timeline charting.
 */
export interface MarketPricePoint {
  date: string; // '2026-10-25'
  dateDisplay: string; // 'Sun 25 Oct'
  price: number; // 0.0 to 1.0 (probability)
  hasStoryEntry?: boolean; // Whether this date corresponds to a story entry milestone
}

/**
 * Prediction market expectations attached strictly to verified stories (Story 1, 5, 11).
 */
export interface StoryMarketData {
  id: string;
  storyId: string;
  platform: 'Kalshi' | 'Polymarket';
  eventTickerOrSlug: string;
  marketTickerOrId: string;
  question: string; // Exact market question in quotes
  probability: number; // 0.0 to 1.0 (primary outcome probability)
  probabilityFormatted: string; // e.g. "90%" or "73.5%"
  checkedTimeDisplay: string; // e.g. "checked 13:50" or "saved 31 Oct 2026"
  isFallback: boolean; // true if public API request failed and fallback price is shown
  savedPrice: number;
  savedDate: string; // "31 Oct 2026"
  pageUrl?: string; // Confirmed page URL only
  priceHistory: MarketPricePoint[];
  change7d?: number; // Change since 7 days ago, e.g. +0.150 (+15.0 pts)
  change7dFormatted?: string; // e.g. "+15.0 pts" or "+1.0 pts"
  change7dDirection?: 'up' | 'down' | 'flat';
  volumeFormatted?: string; // e.g. "$3.2M volume" (only if API returned it)
  outcomes?: MarketOutcome[]; // For multi-outcome markets (e.g. F1 race winner)
}

/**
 * Objective coverage record representing how a specific news outlet framed a story.
 */
export interface OutletCoverage {
  outlet: string;
  url: string;
  framingDescription: string;
}

/**
 * Verified story record displayed on the Today screen.
 */
export interface Story {
  id: string;
  section: NewsSection;
  statusTag: StoryStatusTag;
  headline: string;
  changeDate?: string; // e.g. 'Sat 31 Oct'
  changeSummary?: string; // e.g. "Ayatollah Khamenei ordered the military to answer any threat at once..."
  summary: string; // 2-3 sentences from seed facts
  whyItMattersToYou: string; // Derived strictly from story facts + reader situation
  coverage: OutletCoverage[];
  likesCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  dateFirstSeen: string;
  dateLastChanged: string;
  hasTimeline: boolean;
  market?: StoryMarketData; // Primary market
  markets?: StoryMarketData[]; // All markets attached to this story (e.g. Story 5 & 11)
}

/**
 * Milestone node in a story's chronological timeline.
 */
export interface TimelineNode {
  id: string;
  storyId: string;
  date: string; // '2026-10-25'
  dateDisplay: string; // 'Sun 25 Oct'
  isToday: boolean;
  changeDescription: string;
  sources: {
    outlet: string;
    url?: string;
    note?: string;
  }[];
}

/**
 * Reader profile created and tuned in the Topics screen.
 */
export interface ReaderProfile {
  setupSentence: string;
  situation: string;
  topics: string[];
  likedStoryIds: string[];
  dislikedStoryIds: string[];
}

/**
 * The full daily edition package for a given morning.
 */
export interface DailyEditionData {
  editionDate: string; // '2026-10-31'
  formattedDate: string; // 'Saturday 31 October 2026'
  stories: Story[];
}
