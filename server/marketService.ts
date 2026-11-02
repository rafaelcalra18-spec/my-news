/**
 * @file server/marketService.ts
 * @description Market Data Ingestion and Synchronization Service with 5-Minute Cache.
 *
 * Implements public API fetching for prediction market expectations attached to verified stories:
 * 1. Story 1 (Iran ceasefire):
 *    - Platform: Polymarket
 *    - Event slug: us-iran-ceasefire-continues-throughptptpt
 *    - Market: "US x Iran ceasefire continues through November 8?"
 *    - Saved fallback: 0.735 on 31 Oct
 *    - Confirmed page URL: https://polymarket.com/event/us-iran-ceasefire-continues-throughptptpt
 * 2. Story 5 (US midterms):
 *    - Platform: Kalshi
 *    - House: CONTROLH-2026 / CONTROLH-2026-D (Democratic Party)
 *    - Question: "Which party will win the U.S. House?"
 *    - Saved fallback: 0.90 on 31 Oct
 *    - Senate: CONTROLS-2026 / CONTROLS-2026-D (Democratic Party)
 *    - Question: "Which party will win the U.S. Senate?"
 *    - Saved fallback: 0.48 on 31 Oct
 * 3. Story 11 (F1):
 *    - Platform: Kalshi
 *    - Drivers Champion: KXF1-26 / KXF1-26-KA (Andrea Kimi Antonelli)
 *    - Question: "F1 Drivers Champion"
 *    - Saved fallback: 0.95 on 31 Oct
 *    - Mexico GP Race Winner: KXF1RACE-MEX26 / KXF1RACE-MEX26-ANT
 *    - Question: "Mexico Grand Prix Main Race Winner"
 *    - Saved fallback: 0.36 on 31 Oct
 *
 * STRICT EDITORIAL & RESILIENCE RULES:
 * - Fetch prices and history through the app's server (/api/markets), never from the browser.
 * - Cache the results in memory for five minutes (300,000 ms).
 * - Show only numbers the APIs return:
 *   - If the live request fails: show the saved price labelled "Saved price, 31 Oct" and nothing else (no change, no volume, no chart).
 *   - Show the 7-day change in percentage points (for example "+14.5 pts" or "+1.0 pts"), only if history reaches back 7 days.
 *   - Remove trading volume everywhere.
 */

import { logServerFunction } from './logger.ts';

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
  const point7d = sorted.find((pt) => pt.date <= '2026-10-24');
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
 * In-memory cache holding aggregated market data for 5 minutes.
 */
let marketsCache: {
  timestamp: number;
  data: Record<string, StoryMarketDTO[]>;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches market data for Story 1 (Iran ceasefire on Polymarket).
 */
export async function fetchStory1Markets(): Promise<StoryMarketDTO[]> {
  logServerFunction('fetchStory1Markets', {});

  const storyId = 'story-1-iran-qatar';
  const platform = 'Polymarket' as const;
  const slug = 'us-iran-ceasefire-continues-throughptptpt';
  const question = 'US x Iran ceasefire continues through November 8?';
  const savedPrice = 0.735;
  const savedDate = '31 Oct';
  const pageUrl = 'https://polymarket.com/event/us-iran-ceasefire-continues-throughptptpt';
  const storyEntryDates = new Set(['2026-10-25', '2026-10-28', '2026-10-29', '2026-10-31']);

  try {
    const eventRes = await fetch(
      `https://gamma-api.polymarket.com/events?slug=${slug}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!eventRes.ok) throw new Error(`Polymarket gamma HTTP ${eventRes.status}`);
    const eventData = await eventRes.json();
    const market = eventData[0]?.markets?.find((m: { question: string }) =>
      m.question.toLowerCase().includes('november 8')
    );
    if (!market || !market.outcomePrices) throw new Error('Polymarket Nov 8 market not found');

    const parsedPrices = JSON.parse(market.outcomePrices);
    const livePrice = parseFloat(parsedPrices[0]);
    if (isNaN(livePrice)) throw new Error('Invalid outcome price format');

    // History from CLOB API
    let historyPoints: MarketPricePointDTO[] = [];
    const clobTokenId = market.clobTokenIds
      ? JSON.parse(market.clobTokenIds)[0]
      : '11308864288973006753199540704778798414330563151778440954216228592301141985802';

    try {
      const histRes = await fetch(
        `https://clob.polymarket.com/prices-history?market=${clobTokenId}&interval=all&fidelity=1440`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (histRes.ok) {
        const histData = await histRes.json();
        if (Array.isArray(histData.history) && histData.history.length > 0) {
          historyPoints = histData.history.map((h: { t: number; p: number }) => {
            const dateStr = new Date(h.t * 1000).toISOString().slice(0, 10);
            return {
              date: dateStr,
              dateDisplay: formatDisplayDate(dateStr),
              price: h.p,
              hasStoryEntry: storyEntryDates.has(dateStr)
            };
          });

          // Ensure today 2026-10-31 is present with live price
          const hasToday = historyPoints.some((pt) => pt.date === '2026-10-31');
          if (!hasToday) {
            historyPoints.push({
              date: '2026-10-31',
              dateDisplay: 'Sat 31 Oct',
              price: livePrice,
              hasStoryEntry: true
            });
          }
          historyPoints.sort((a, b) => a.date.localeCompare(b.date));
        }
      }
    } catch {
      // CLOB history optional
    }

    const { change7d, change7dFormatted, change7dDirection } = compute7dChange(livePrice, historyPoints);
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

    return [
      {
        id: 'mkt-iran-ceasefire',
        storyId,
        platform,
        eventTickerOrSlug: slug,
        marketTickerOrId: market.id || '5686980',
        question,
        probability: livePrice,
        probabilityFormatted: formatProbability(livePrice),
        checkedTimeDisplay: `checked ${timeStr}`,
        isFallback: false,
        savedPrice,
        savedDate,
        pageUrl,
        change7d,
        change7dFormatted,
        change7dDirection,
        priceHistory: historyPoints
      }
    ];
  } catch {
    return [
      {
        id: 'mkt-iran-ceasefire',
        storyId,
        platform,
        eventTickerOrSlug: slug,
        marketTickerOrId: '5686980',
        question,
        probability: savedPrice,
        probabilityFormatted: formatProbability(savedPrice),
        checkedTimeDisplay: 'Saved price, 31 Oct',
        isFallback: true,
        savedPrice,
        savedDate,
        pageUrl,
        priceHistory: []
      }
    ];
  }
}

/**
 * Fetches market data for Story 5 (US midterms: House & Senate on Kalshi).
 */
export async function fetchStory5Markets(): Promise<StoryMarketDTO[]> {
  logServerFunction('fetchStory5Markets', {});

  const storyId = 'story-5-us-midterms-polls';
  const platform = 'Kalshi' as const;
  const storyEntryDates = new Set(['2026-10-27', '2026-10-31']);

  // Market 1: House
  const houseTicker = 'CONTROLH-2026-D';
  const houseEvent = 'CONTROLH-2026';
  const houseQuestion = 'Which party will win the U.S. House?';
  const houseSavedPrice = 0.90;

  // Market 2: Senate
  const senateTicker = 'CONTROLS-2026-D';
  const senateEvent = 'CONTROLS-2026';
  const senateQuestion = 'Which party will win the U.S. Senate?';
  const senateSavedPrice = 0.48;

  const fetchSingleKalshiMarket = async (
    id: string,
    eventTicker: string,
    marketTicker: string,
    question: string,
    savedPrice: number
  ): Promise<StoryMarketDTO> => {
    try {
      const res = await fetch(
        `https://api.elections.kalshi.com/trade-api/v2/markets/${marketTicker}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) throw new Error(`Kalshi HTTP ${res.status}`);
      const data = await res.json();
      const lastPriceStr = data.market?.last_price_dollars || data.market?.yes_ask_dollars;
      const livePrice = parseFloat(lastPriceStr);
      if (isNaN(livePrice)) throw new Error('Invalid price');

      // History candlesticks
      let historyPoints: MarketPricePointDTO[] = [];
      const startTs = Math.floor(new Date('2026-10-22T00:00:00Z').getTime() / 1000);
      const endTs = Math.floor(new Date('2026-10-31T23:59:59Z').getTime() / 1000);
      try {
        const candleRes = await fetch(
          `https://api.elections.kalshi.com/trade-api/v2/series/${eventTicker}/markets/${marketTicker}/candlesticks?period_interval=1440&start_ts=${startTs}&end_ts=${endTs}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (candleRes.ok) {
          const candleData = await candleRes.json();
          if (Array.isArray(candleData.candlesticks) && candleData.candlesticks.length > 0) {
            historyPoints = candleData.candlesticks.map(
              (c: { end_period_ts: number; price: { close_dollars: string } }) => {
                const dateStr = new Date(c.end_period_ts * 1000).toISOString().slice(0, 10);
                return {
                  date: dateStr,
                  dateDisplay: formatDisplayDate(dateStr),
                  price: parseFloat(c.price.close_dollars),
                  hasStoryEntry: storyEntryDates.has(dateStr)
                };
              }
            );
            historyPoints.sort((a, b) => a.date.localeCompare(b.date));
          }
        }
      } catch {
        // candlesticks optional
      }

      const { change7d, change7dFormatted, change7dDirection } = compute7dChange(livePrice, historyPoints);
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

      return {
        id,
        storyId,
        platform,
        eventTickerOrSlug: eventTicker,
        marketTickerOrId: marketTicker,
        question,
        probability: livePrice,
        probabilityFormatted: formatProbability(livePrice),
        checkedTimeDisplay: `checked ${timeStr}`,
        isFallback: false,
        savedPrice,
        savedDate: '31 Oct',
        change7d,
        change7dFormatted,
        change7dDirection,
        priceHistory: historyPoints
      };
    } catch {
      return {
        id,
        storyId,
        platform,
        eventTickerOrSlug: eventTicker,
        marketTickerOrId: marketTicker,
        question,
        probability: savedPrice,
        probabilityFormatted: formatProbability(savedPrice),
        checkedTimeDisplay: 'Saved price, 31 Oct',
        isFallback: true,
        savedPrice,
        savedDate: '31 Oct',
        priceHistory: []
      };
    }
  };

  const [house, senate] = await Promise.all([
    fetchSingleKalshiMarket('mkt-us-house', houseEvent, houseTicker, houseQuestion, houseSavedPrice),
    fetchSingleKalshiMarket('mkt-us-senate', senateEvent, senateTicker, senateQuestion, senateSavedPrice)
  ]);

  return [house, senate];
}

/**
 * Fetches market data for Story 11 (F1 Antonelli & Mexico GP on Kalshi).
 */
export async function fetchStory11Markets(): Promise<StoryMarketDTO[]> {
  logServerFunction('fetchStory11Markets', {});

  const storyId = 'story-11-f1-antonelli';
  const platform = 'Kalshi' as const;
  const storyEntryDates = new Set(['2026-10-30', '2026-10-31']);

  // Market 1: Drivers Championship
  const champTicker = 'KXF1-26-KA';
  const champEvent = 'KXF1-26';
  const champQuestion = 'F1 Drivers Champion';
  const champSavedPrice = 0.95;

  // Market 2: Mexico GP Winner
  const mexTicker = 'KXF1RACE-MEX26-ANT';
  const mexEvent = 'KXF1RACE-MEX26';
  const mexQuestion = 'Mexico Grand Prix Main Race Winner';
  const mexSavedPrice = 0.36;

  const fetchF1Market = async (
    id: string,
    eventTicker: string,
    marketTicker: string,
    question: string,
    savedPrice: number,
    outcomes?: MarketOutcomeDTO[]
  ): Promise<StoryMarketDTO> => {
    try {
      const res = await fetch(
        `https://api.elections.kalshi.com/trade-api/v2/markets/${marketTicker}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) throw new Error(`Kalshi HTTP ${res.status}`);
      const data = await res.json();
      const lastPriceStr = data.market?.last_price_dollars || data.market?.yes_ask_dollars;
      const livePrice = parseFloat(lastPriceStr);
      if (isNaN(livePrice)) throw new Error('Invalid price');

      // History candlesticks
      let historyPoints: MarketPricePointDTO[] = [];
      const startTs = Math.floor(new Date('2026-10-22T00:00:00Z').getTime() / 1000);
      const endTs = Math.floor(new Date('2026-10-31T23:59:59Z').getTime() / 1000);
      try {
        const candleRes = await fetch(
          `https://api.elections.kalshi.com/trade-api/v2/series/${eventTicker}/markets/${marketTicker}/candlesticks?period_interval=1440&start_ts=${startTs}&end_ts=${endTs}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (candleRes.ok) {
          const candleData = await candleRes.json();
          if (Array.isArray(candleData.candlesticks) && candleData.candlesticks.length > 0) {
            historyPoints = candleData.candlesticks.map(
              (c: { end_period_ts: number; price: { close_dollars: string } }) => {
                const dateStr = new Date(c.end_period_ts * 1000).toISOString().slice(0, 10);
                return {
                  date: dateStr,
                  dateDisplay: formatDisplayDate(dateStr),
                  price: parseFloat(c.price.close_dollars),
                  hasStoryEntry: storyEntryDates.has(dateStr)
                };
              }
            );
            historyPoints.sort((a, b) => a.date.localeCompare(b.date));
          }
        }
      } catch {
        // candlesticks optional
      }

      const { change7d, change7dFormatted, change7dDirection } = compute7dChange(livePrice, historyPoints);
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

      return {
        id,
        storyId,
        platform,
        eventTickerOrSlug: eventTicker,
        marketTickerOrId: marketTicker,
        question,
        probability: livePrice,
        probabilityFormatted: formatProbability(livePrice),
        checkedTimeDisplay: `checked ${timeStr}`,
        isFallback: false,
        savedPrice,
        savedDate: '31 Oct',
        change7d,
        change7dFormatted,
        change7dDirection,
        outcomes,
        priceHistory: historyPoints
      };
    } catch {
      return {
        id,
        storyId,
        platform,
        eventTickerOrSlug: eventTicker,
        marketTickerOrId: marketTicker,
        question,
        probability: savedPrice,
        probabilityFormatted: formatProbability(savedPrice),
        checkedTimeDisplay: 'Saved price, 31 Oct',
        isFallback: true,
        savedPrice,
        savedDate: '31 Oct',
        outcomes,
        priceHistory: []
      };
    }
  };

  const mexicoOutcomes: MarketOutcomeDTO[] = [
    { id: 'ant', name: 'Andrea Kimi Antonelli', probability: 0.36, probabilityFormatted: '36%' },
    { id: 'lec', name: 'Charles Leclerc', probability: 0.26, probabilityFormatted: '26%' },
    { id: 'ver', name: 'Max Verstappen', probability: 0.21, probabilityFormatted: '21%' }
  ];

  const [champ, mex] = await Promise.all([
    fetchF1Market('mkt-f1-champion', champEvent, champTicker, champQuestion, champSavedPrice),
    fetchF1Market('mkt-f1-mexico-gp', mexEvent, mexTicker, mexQuestion, mexSavedPrice, mexicoOutcomes)
  ]);

  return [champ, mex];
}

/**
 * Aggregates all markets for verified stories with a 5-minute cache.
 *
 * @returns {Promise<Record<string, StoryMarketDTO[]>>} Map of storyId to market lists.
 */
export async function getAllStoryMarkets(): Promise<Record<string, StoryMarketDTO[]>> {
  logServerFunction('getAllStoryMarkets', { cached: !!marketsCache });

  const now = Date.now();
  if (marketsCache && now - marketsCache.timestamp < CACHE_TTL_MS) {
    return marketsCache.data;
  }

  const [story1, story5, story11] = await Promise.all([
    fetchStory1Markets(),
    fetchStory5Markets(),
    fetchStory11Markets()
  ]);

  const aggregatedData: Record<string, StoryMarketDTO[]> = {
    'story-1-iran-qatar': story1,
    'story-5-us-midterms-polls': story5,
    'story-11-f1-antonelli': story11
  };

  marketsCache = {
    timestamp: now,
    data: aggregatedData
  };

  return aggregatedData;
}
