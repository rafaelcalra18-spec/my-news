/**
 * @file src/data/marketsData.ts
 * @description Prediction markets attached to the stories in the 31 Oct 2026 edition.
 *
 * The prices come from src/data/marketSnapshot.ts: what Kalshi and Polymarket showed at
 * 8am London time on 31 Oct, with one price per day back to 24 Oct.
 * - Story 1: Iran ceasefire (Polymarket).
 * - Story 5: US House and Senate control (Kalshi).
 * - Story 11: F1 drivers' title and Mexico GP winner, with the top three drivers (Kalshi).
 *
 * USE CASES:
 * - Powering Today card market blocks, story view detailed charts, and the dedicated Markets screen.
 */

import { StoryMarketData } from '../types/news.ts';
import { logFunctionCall } from '../utils/logger.ts';
import { MARKET_SNAPSHOT } from './marketSnapshot.ts';

function snapshotMarket(id: string): StoryMarketData {
  const market = MARKET_SNAPSHOT.find((m) => m.id === id);
  if (!market) throw new Error(`Market ${id} is missing from marketSnapshot.ts`);
  return market;
}

export const STORY_1_MARKET_CEASEFIRE = snapshotMarket('mkt-iran-ceasefire');
export const STORY_5_MARKET_HOUSE = snapshotMarket('mkt-us-house');
export const STORY_5_MARKET_SENATE = snapshotMarket('mkt-us-senate');
export const STORY_11_MARKET_CHAMPION = snapshotMarket('mkt-f1-champion');
export const STORY_11_MARKET_MEXICO_GP = snapshotMarket('mkt-f1-mexico-gp');

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
