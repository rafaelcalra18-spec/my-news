/**
 * @file scripts/snapshot-markets.ts
 * @description Saves the prediction market prices as they stood at 8am London time on 31 Oct 2026,
 * when the demo's morning edition went out, into src/data/marketSnapshot.ts.
 *
 * Every number comes from the public Kalshi and Polymarket APIs. The script reads hourly prices
 * and keeps, for each day from 24 to 31 Oct, the last price at or before 08:00 UTC
 * (8am in London, which is on GMT from 25 Oct).
 *
 * Run with: npx tsx scripts/snapshot-markets.ts
 */

import { writeFileSync } from 'fs';
import { compute7dChange, formatDisplayDate, formatProbability } from '../server/marketService.ts';
import type { MarketOutcome, MarketPricePoint, StoryMarketData } from '../src/types/news.ts';

const DAYS = ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'];
const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2';
const START_TS = Math.floor(Date.UTC(2026, 9, 20) / 1000);
const END_TS = Math.floor(Date.UTC(2026, 10, 1, 12) / 1000);

async function getJson(url: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      // Kalshi rate limit: wait and try again
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }
  throw new Error(`Still rate limited after 5 tries: ${url}`);
}

type Series = [number, number][]; // [unix seconds, price], sorted by time

/** One point per day: the last price at or before 08:00 UTC that day. */
function toHistory(series: Series, storyDays: string[]): MarketPricePoint[] {
  const points: MarketPricePoint[] = [];
  for (const day of DAYS) {
    const cutoff = Date.parse(`${day}T08:00:00Z`) / 1000;
    const before = series.filter(([t]) => t <= cutoff);
    if (before.length === 0) continue;
    points.push({
      date: day,
      dateDisplay: formatDisplayDate(day),
      price: before[before.length - 1][1],
      hasStoryEntry: storyDays.includes(day)
    });
  }
  return points;
}

/** Hourly last-trade prices for one Kalshi market. Hours with no trade are skipped. */
async function kalshiSeries(series: string, ticker: string): Promise<Series> {
  const data = await getJson(
    `${KALSHI}/series/${series}/markets/${ticker}/candlesticks?period_interval=60&start_ts=${START_TS}&end_ts=${END_TS}`
  );
  const out: Series = [];
  for (const c of data.candlesticks ?? []) {
    const close = parseFloat(c.price?.close_dollars);
    if (!Number.isNaN(close)) out.push([c.end_period_ts, close]);
  }
  return out.sort((a, b) => a[0] - b[0]);
}

/** Hourly prices for one Polymarket token. */
async function polymarketSeries(tokenId: string): Promise<Series> {
  const data = await getJson(
    `https://clob.polymarket.com/prices-history?market=${tokenId}&startTs=${START_TS}&endTs=${END_TS}&fidelity=60`
  );
  const out: Series = (data.history ?? []).map((h: { t: number; p: number }) => [h.t, h.p]);
  return out.sort((a, b) => a[0] - b[0]);
}

function buildMarket(
  base: Omit<StoryMarketData, 'probability' | 'probabilityFormatted' | 'checkedTimeDisplay' | 'isFallback' | 'savedPrice' | 'savedDate' | 'priceHistory'>,
  history: MarketPricePoint[]
): StoryMarketData {
  const last = history[history.length - 1];
  if (!last || last.date !== '2026-10-31') throw new Error(`No 31 Oct price for ${base.id}`);
  return {
    ...base,
    probability: last.price,
    probabilityFormatted: formatProbability(last.price),
    checkedTimeDisplay: 'Price at 8am, 31 Oct',
    isFallback: false,
    savedPrice: last.price,
    savedDate: '31 Oct',
    ...compute7dChange(last.price, history),
    priceHistory: history
  };
}

async function main(): Promise<void> {
  const markets: StoryMarketData[] = [];

  // Story 1: Iran ceasefire on Polymarket
  const slug = 'us-iran-ceasefire-continues-throughptptpt';
  const event = (await getJson(`https://gamma-api.polymarket.com/events?slug=${slug}`))[0];
  const ceasefire = event.markets.find((m: { question: string }) => m.question.toLowerCase().includes('november 8'));
  const tokenId = JSON.parse(ceasefire.clobTokenIds)[0];
  markets.push(
    buildMarket(
      {
        id: 'mkt-iran-ceasefire',
        storyId: 'story-1-iran-qatar',
        platform: 'Polymarket',
        eventTickerOrSlug: slug,
        marketTickerOrId: String(ceasefire.id),
        question: 'US x Iran ceasefire continues through November 8?',
        pageUrl: `https://polymarket.com/event/${slug}`
      },
      toHistory(await polymarketSeries(tokenId), ['2026-10-25', '2026-10-28', '2026-10-29', '2026-10-31'])
    )
  );

  // Story 5: US midterms on Kalshi
  const midtermDays = ['2026-10-27', '2026-10-31'];
  for (const [id, series, ticker, question] of [
    ['mkt-us-house', 'CONTROLH-2026', 'CONTROLH-2026-D', 'Which party will win the U.S. House?'],
    ['mkt-us-senate', 'CONTROLS-2026', 'CONTROLS-2026-D', 'Which party will win the U.S. Senate?']
  ]) {
    markets.push(
      buildMarket(
        { id, storyId: 'story-5-us-midterms-polls', platform: 'Kalshi', eventTickerOrSlug: series, marketTickerOrId: ticker, question },
        toHistory(await kalshiSeries(series, ticker), midtermDays)
      )
    );
  }

  // Story 11: F1 on Kalshi
  const f1Days = ['2026-10-30', '2026-10-31'];
  markets.push(
    buildMarket(
      {
        id: 'mkt-f1-champion',
        storyId: 'story-11-f1-antonelli',
        platform: 'Kalshi',
        eventTickerOrSlug: 'KXF1-26',
        marketTickerOrId: 'KXF1-26-KA',
        question: 'F1 Drivers Champion'
      },
      toHistory(await kalshiSeries('KXF1-26', 'KXF1-26-KA'), f1Days)
    )
  );

  // Mexico GP winner: the top three drivers at 8am on 31 Oct
  const raceSeries = 'KXF1RACE-MEX26';
  const raceMarkets = (await getJson(`${KALSHI}/markets?event_ticker=${raceSeries}&limit=100`)).markets as {
    ticker: string;
    yes_sub_title: string;
  }[];
  const drivers: { ticker: string; name: string; series: Series }[] = [];
  for (const m of raceMarkets) {
    drivers.push({ ticker: m.ticker, name: m.yes_sub_title, series: await kalshiSeries(raceSeries, m.ticker) });
  }
  const closeOn31 = (d: (typeof drivers)[number]): number => {
    const last = toHistory(d.series, []).pop();
    return last && last.date === '2026-10-31' ? last.price : 0;
  };
  const ranked = [...drivers].sort((a, b) => closeOn31(b) - closeOn31(a));
  const outcomes: MarketOutcome[] = ranked.slice(0, 3).map((d) => ({
    id: d.ticker.split('-').pop()!.toLowerCase(),
    name: d.name,
    probability: closeOn31(d),
    probabilityFormatted: formatProbability(closeOn31(d))
  }));
  const antonelli = drivers.find((d) => d.ticker === 'KXF1RACE-MEX26-ANT');
  if (!antonelli) throw new Error('Antonelli Mexico GP market not found');
  markets.push({
    ...buildMarket(
      {
        id: 'mkt-f1-mexico-gp',
        storyId: 'story-11-f1-antonelli',
        platform: 'Kalshi',
        eventTickerOrSlug: raceSeries,
        marketTickerOrId: antonelli.ticker,
        question: 'Mexico Grand Prix Main Race Winner'
      },
      toHistory(antonelli.series, f1Days)
    ),
    outcomes
  });

  const body = `/**
 * @file src/data/marketSnapshot.ts
 * @description Prediction market prices at 8am London time on 31 Oct 2026, when the demo edition went out.
 * Generated by scripts/snapshot-markets.ts from the public Kalshi and Polymarket APIs. Do not edit by hand.
 */

import type { StoryMarketData } from '../types/news.ts';

export const MARKET_SNAPSHOT: StoryMarketData[] = ${JSON.stringify(markets, null, 2)};
`;
  writeFileSync(new URL('../src/data/marketSnapshot.ts', import.meta.url), body);
  for (const m of markets) {
    // eslint-disable-next-line no-console
    console.info(m.id, m.probabilityFormatted, m.change7dFormatted ?? '', m.priceHistory.map((p) => `${p.date.slice(5)}=${p.price}`).join(' '));
  }
  // eslint-disable-next-line no-console
  console.info('Mexico top three at 8am 31 Oct:', outcomes.map((o) => `${o.name} ${o.probabilityFormatted}`).join(', '));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
