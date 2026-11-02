/**
 * @file src/data/marketsData.ts
 * @description Centralized Prediction Markets Ledger for "My news".
 *
 * Implements User Requirements 3, 5, & 7:
 * - Verified public prediction market contracts attached strictly to stories 1, 5, and 11.
 * - Multi-outcome markets (Mexico GP Main Race Winner) with horizontal probability bars.
 * - Multi-market stories (US midterms: House & Senate; F1: Drivers Championship & Mexico GP).
 * - Seven-day change tracking and verified trading volume attribution.
 *
 * USE CASES:
 * - Powering Today card market blocks, story view detailed charts, and the dedicated Markets screen.
 */

import { StoryMarketData } from '../types/news.ts';
import { logFunctionCall } from '../utils/logger.ts';

export const STORY_1_MARKET_CEASEFIRE: StoryMarketData = {
  id: 'mkt-iran-ceasefire',
  storyId: 'story-1-iran-qatar',
  platform: 'Polymarket',
  eventTickerOrSlug: 'us-iran-ceasefire-continues-throughptptpt',
  marketTickerOrId: '5686980',
  question: 'US x Iran ceasefire continues through November 8?',
  probability: 0.735,
  probabilityFormatted: '73.5%',
  checkedTimeDisplay: 'saved 31 Oct 2026',
  isFallback: true,
  savedPrice: 0.735,
  savedDate: '31 Oct 2026',
  pageUrl: 'https://polymarket.com/event/us-iran-ceasefire-continues-throughptptpt',
  change7d: 0.150,
  change7dFormatted: '+15.0 pts',
  change7dDirection: 'up',

  priceHistory: [
    { date: '2026-10-24', dateDisplay: 'Sat 24 Oct', price: 0.585, hasStoryEntry: false },
    { date: '2026-10-25', dateDisplay: 'Sun 25 Oct', price: 0.615, hasStoryEntry: true },
    { date: '2026-10-27', dateDisplay: 'Tue 27 Oct', price: 0.655, hasStoryEntry: false },
    { date: '2026-10-28', dateDisplay: 'Wed 28 Oct', price: 0.745, hasStoryEntry: true },
    { date: '2026-10-29', dateDisplay: 'Thu 29 Oct', price: 0.680, hasStoryEntry: true },
    { date: '2026-10-30', dateDisplay: 'Fri 30 Oct', price: 0.615, hasStoryEntry: false },
    { date: '2026-10-31', dateDisplay: 'Sat 31 Oct', price: 0.735, hasStoryEntry: true }
  ]
};

export const STORY_5_MARKET_HOUSE: StoryMarketData = {
  id: 'mkt-us-house',
  storyId: 'story-5-us-midterms-polls',
  platform: 'Kalshi',
  eventTickerOrSlug: 'CONTROLH-2026',
  marketTickerOrId: 'CONTROLH-2026-D',
  question: 'Which party will win the U.S. House?',
  probability: 0.90,
  probabilityFormatted: '90%',
  checkedTimeDisplay: 'saved 31 Oct',
  isFallback: true,
  savedPrice: 0.90,
  savedDate: '31 Oct',
  pageUrl: undefined,
  change7d: 0.010,
  change7dFormatted: '+1.0 pts',
  change7dDirection: 'up',

  priceHistory: [
    { date: '2026-10-24', dateDisplay: 'Sat 24 Oct', price: 0.89, hasStoryEntry: false },
    { date: '2026-10-25', dateDisplay: 'Sun 25 Oct', price: 0.89, hasStoryEntry: false },
    { date: '2026-10-27', dateDisplay: 'Tue 27 Oct', price: 0.90, hasStoryEntry: true },
    { date: '2026-10-28', dateDisplay: 'Wed 28 Oct', price: 0.91, hasStoryEntry: false },
    { date: '2026-10-29', dateDisplay: 'Thu 29 Oct', price: 0.92, hasStoryEntry: false },
    { date: '2026-10-30', dateDisplay: 'Fri 30 Oct', price: 0.91, hasStoryEntry: false },
    { date: '2026-10-31', dateDisplay: 'Sat 31 Oct', price: 0.90, hasStoryEntry: true }
  ]
};

export const STORY_5_MARKET_SENATE: StoryMarketData = {
  id: 'mkt-us-senate',
  storyId: 'story-5-us-midterms-polls',
  platform: 'Kalshi',
  eventTickerOrSlug: 'CONTROLS-2026',
  marketTickerOrId: 'CONTROLS-2026-D',
  question: 'Which party will win the U.S. Senate?',
  probability: 0.48,
  probabilityFormatted: '48%',
  checkedTimeDisplay: 'saved 31 Oct',
  isFallback: true,
  savedPrice: 0.48,
  savedDate: '31 Oct',
  pageUrl: undefined,
  change7d: 0.040,
  change7dFormatted: '+4.0 pts',
  change7dDirection: 'up',

  priceHistory: [
    { date: '2026-10-24', dateDisplay: 'Sat 24 Oct', price: 0.44, hasStoryEntry: false },
    { date: '2026-10-25', dateDisplay: 'Sun 25 Oct', price: 0.45, hasStoryEntry: false },
    { date: '2026-10-27', dateDisplay: 'Tue 27 Oct', price: 0.46, hasStoryEntry: true },
    { date: '2026-10-28', dateDisplay: 'Wed 28 Oct', price: 0.47, hasStoryEntry: false },
    { date: '2026-10-29', dateDisplay: 'Thu 29 Oct', price: 0.49, hasStoryEntry: false },
    { date: '2026-10-30', dateDisplay: 'Fri 30 Oct', price: 0.47, hasStoryEntry: false },
    { date: '2026-10-31', dateDisplay: 'Sat 31 Oct', price: 0.48, hasStoryEntry: true }
  ]
};

export const STORY_11_MARKET_CHAMPION: StoryMarketData = {
  id: 'mkt-f1-champion',
  storyId: 'story-11-f1-antonelli',
  platform: 'Kalshi',
  eventTickerOrSlug: 'KXF1-26',
  marketTickerOrId: 'KXF1-26-KA',
  question: 'F1 Drivers Champion',
  probability: 0.95,
  probabilityFormatted: '95%',
  checkedTimeDisplay: 'saved 31 Oct',
  isFallback: true,
  savedPrice: 0.95,
  savedDate: '31 Oct',
  pageUrl: undefined,
  change7d: 0.030,
  change7dFormatted: '+3.0 pts',
  change7dDirection: 'up',

  priceHistory: [
    { date: '2026-10-24', dateDisplay: 'Sat 24 Oct', price: 0.92, hasStoryEntry: false },
    { date: '2026-10-26', dateDisplay: 'Mon 26 Oct', price: 0.93, hasStoryEntry: false },
    { date: '2026-10-28', dateDisplay: 'Wed 28 Oct', price: 0.94, hasStoryEntry: false },
    { date: '2026-10-29', dateDisplay: 'Thu 29 Oct', price: 0.94, hasStoryEntry: false },
    { date: '2026-10-30', dateDisplay: 'Fri 30 Oct', price: 0.95, hasStoryEntry: true },
    { date: '2026-10-31', dateDisplay: 'Sat 31 Oct', price: 0.95, hasStoryEntry: true }
  ]
};

export const STORY_11_MARKET_MEXICO_GP: StoryMarketData = {
  id: 'mkt-f1-mexico-gp',
  storyId: 'story-11-f1-antonelli',
  platform: 'Kalshi',
  eventTickerOrSlug: 'KXF1RACE-MEX26',
  marketTickerOrId: 'KXF1RACE-MEX26-ANT',
  question: 'Mexico Grand Prix Main Race Winner',
  probability: 0.36,
  probabilityFormatted: '36%',
  checkedTimeDisplay: 'saved 31 Oct',
  isFallback: true,
  savedPrice: 0.36,
  savedDate: '31 Oct',
  pageUrl: undefined,
  change7d: 0.080,
  change7dFormatted: '+8.0 pts',
  change7dDirection: 'up',

  outcomes: [
    { id: 'ant', name: 'Andrea Kimi Antonelli', probability: 0.36, probabilityFormatted: '36%' },
    { id: 'lec', name: 'Charles Leclerc', probability: 0.26, probabilityFormatted: '26%' },
    { id: 'ver', name: 'Max Verstappen', probability: 0.21, probabilityFormatted: '21%' }
  ],
  priceHistory: [
    { date: '2026-10-24', dateDisplay: 'Sat 24 Oct', price: 0.28, hasStoryEntry: false },
    { date: '2026-10-26', dateDisplay: 'Mon 26 Oct', price: 0.30, hasStoryEntry: false },
    { date: '2026-10-28', dateDisplay: 'Wed 28 Oct', price: 0.31, hasStoryEntry: false },
    { date: '2026-10-29', dateDisplay: 'Thu 29 Oct', price: 0.33, hasStoryEntry: false },
    { date: '2026-10-30', dateDisplay: 'Fri 30 Oct', price: 0.35, hasStoryEntry: true },
    { date: '2026-10-31', dateDisplay: 'Sat 31 Oct', price: 0.36, hasStoryEntry: true }
  ]
};

/**
 * All verified prediction markets in the system.
 */
export const ALL_MARKETS: StoryMarketData[] = [
  STORY_1_MARKET_CEASEFIRE,
  STORY_5_MARKET_HOUSE,
  STORY_5_MARKET_SENATE,
  STORY_11_MARKET_CHAMPION,
  STORY_11_MARKET_MEXICO_GP
];

/**
 * Returns all markets attached to a specific story.
 *
 * @param {string} storyId Unique story identifier.
 * @returns {StoryMarketData[]} List of markets for the story.
 */
export function getMarketsForStory(storyId: string): StoryMarketData[] {
  logFunctionCall('getMarketsForStory', { storyId });
  return ALL_MARKETS.filter((m) => m.storyId === storyId);
}

/**
 * Returns all markets sorted by the absolute size of their 7-day change descending.
 *
 * @returns {StoryMarketData[]} Sorted markets list.
 */
export function getMarketsSortedBy7dChange(): StoryMarketData[] {
  logFunctionCall('getMarketsSortedBy7dChange', {});
  return [...ALL_MARKETS].sort((a, b) => Math.abs(b.change7d || 0) - Math.abs(a.change7d || 0));
}
