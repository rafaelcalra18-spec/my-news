/**
 * @file server/marketService.ts
 * @description Prediction market data for the stories in the 31 Oct 2026 demo edition.
 *
 * The edition is a fixed snapshot, so /api/markets serves the prices as they stood at
 * 8am London time on 31 Oct (src/data/marketSnapshot.ts) instead of today's prices.
 * scripts/snapshot-markets.ts rebuilds that file from the public Kalshi and Polymarket APIs.
 *
 * Markets:
 * - Story 1 (Iran ceasefire): Polymarket, "US x Iran ceasefire continues through November 8?"
 * - Story 5 (US midterms): Kalshi CONTROLH-2026-D (House) and CONTROLS-2026-D (Senate)
 * - Story 11 (F1): Kalshi KXF1-26-KA (drivers' title) and KXF1RACE-MEX26-ANT (Mexico GP winner)
 *
 * Seven-day changes are shown in percentage points and compare 31 Oct with 24 Oct.
 */

import { logServerFunction } from './logger.ts';
import { MARKET_SNAPSHOT } from '../src/data/marketSnapshot.ts';

export interface MarketPricePointDTO {
  date: string; // '2026-10-25'
  dateDisplay: string; // 'Sun 25 Oct'
  price: number;
  hasStoryEntry?: boolean;
}

export interface MarketOutcomeDTO {
  id: string;
  name: string;
  probability: number;
  probabilityFormatted: string;
}

export interface StoryMarketDTO {
  id: string;
  storyId: string;
  platform: 'Kalshi' | 'Polymarket';
  eventTickerOrSlug: string;
  marketTickerOrId: string;
  question: string;
  probability: number;
  probabilityFormatted: string;
  checkedTimeDisplay: string;
  isFallback: boolean;
  savedPrice: number;
  savedDate: string;
  pageUrl?: string;
  change7d?: number;
  change7dFormatted?: string;
  change7dDirection?: 'up' | 'down' | 'flat';
  outcomes?: MarketOutcomeDTO[];
  priceHistory: MarketPricePointDTO[];
}

/**
 * Formats probability as a clean percentage string.
 *
 * @param {number} prob Value between 0.0 and 1.0.
 * @returns {string} Clean percentage string e.g. "90%" or "73.5%".
 */
export function formatProbability(prob: number): string {
  const pct = prob * 100;
  if (Math.abs(pct - Math.round(pct)) < 0.05) {
    return `${Math.round(pct)}%`;
  }
  return `${pct.toFixed(1)}%`;
}

/**
 * Converts a Date string into short day + date display e.g. 'Sat 31 Oct'.
 *
 * @param {string} isoDate ISO date string YYYY-MM-DD.
 * @returns {string} Formatted display date.
 */
export function formatDisplayDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getUTCDay()]} ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

/**
 * Computes 7-day change strictly in percentage points ("+14.5 pts" or "+1.0 pts")
 * only if history reaches back 7 days.
 *
 * @param {number} currentPrice Current probability.
 * @param {MarketPricePointDTO[]} history Price history points.
 * @returns {object} Calculated change properties or undefined if history < 7 days.
 */
export function compute7dChange(
  currentPrice: number,
  history: MarketPricePointDTO[]
): {
  change7d?: number;
  change7dFormatted?: string;
  change7dDirection?: 'up' | 'down' | 'flat';
} {
  if (!history || history.length < 2) return {};

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  // Today in the briefing context is 2026-10-31. 7 days prior is 2026-10-24.
  // Take the latest price on or before that day, so the change covers exactly one week.
  const point7d = sorted.filter((pt) => pt.date <= '2026-10-24').pop();
  if (!point7d) {
    return {};
  }

  const diffFraction = currentPrice - point7d.price;
  const diffPoints = diffFraction * 100;
  const sign = diffPoints > 0 ? '+' : '';
  const change7dFormatted = `${sign}${diffPoints.toFixed(1)} pts`;
  const change7dDirection: 'up' | 'down' | 'flat' =
    diffPoints > 0.05 ? 'up' : diffPoints < -0.05 ? 'down' : 'flat';

  return {
    change7d: diffFraction,
    change7dFormatted,
    change7dDirection
  };
}

/**
 * Groups the 31 Oct snapshot by story.
 *
 * @returns {Promise<Record<string, StoryMarketDTO[]>>} Map of storyId to market lists.
 */
export async function getAllStoryMarkets(): Promise<Record<string, StoryMarketDTO[]>> {
  logServerFunction('getAllStoryMarkets', { source: 'snapshot-2026-10-31' });

  const byStory: Record<string, StoryMarketDTO[]> = {};
  for (const market of MARKET_SNAPSHOT) {
    (byStory[market.storyId] ??= []).push(market as StoryMarketDTO);
  }
  return byStory;
}
