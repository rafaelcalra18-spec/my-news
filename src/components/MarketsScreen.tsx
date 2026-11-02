/**
 * @file src/components/MarketsScreen.tsx
 * @description Dedicated Prediction Markets Screen for "My news".
 *
 * Implements User Requirement 5:
 * 1. "Replace the Timeline tab with a Markets tab. The bottom bar becomes Today, Markets, Topics."
 * 2. "The Markets tab lists every market tied to a story."
 * 3. "Each row shows the question, the platform, the large percentage, the change over seven days, a small chart, and the story's headline underneath."
 * 4. "Sort the rows by the size of the seven-day change."
 * 5. "Tapping a row opens that story's view."
 * 6. "Strictly no text smaller than 13 px."
 *
 * USE CASES:
 * - Macro overview of all prediction market expectations sorted by 7-day momentum.
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Story, StoryMarketData, MarketPricePoint } from '../types/news.ts';
import { getMarketsSortedBy7dChange } from '../data/marketsData.ts';
import { AnimatedMarketProbability } from './AnimatedMarketProbability.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface MarketsScreenProps {
  stories: Story[];
  onOpenStory: (storyId: string) => void;
}

export function MarketsScreen({ stories, onOpenStory }: MarketsScreenProps): React.ReactElement {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();
  const sortedMarkets = getMarketsSortedBy7dChange();

  logFunctionCall('MarketsScreen:render', {
    marketsCount: sortedMarkets.length
  });

  return (
    <main className="px-3 pt-3 pb-24 max-w-[640px] mx-auto w-full select-none">
      {/* Header Overview */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-stone-800" />
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Market Expectations
          </h2>
        </div>
        <p className="text-[13px] text-stone-600 leading-relaxed">
          Public prediction markets tied to today&apos;s active stories, sorted by seven-day probability momentum.
        </p>
      </div>

      {/* Markets List sorted by size of 7-day change */}
      <div className="space-y-4">
        {sortedMarkets.map((market) => {
          const matchingStory = stories.find((s) => s.id === market.storyId);
          const lastWeekPrice = market.priceHistory[0]?.price ?? market.probability;
          const isMultiOutcome = !!market.outcomes && market.outcomes.length > 0;

          return (
            <article
              key={market.id}
              onClick={() => {
                logFunctionCall('MarketsScreen:openStory', { storyId: market.storyId });
                onOpenStory(market.storyId);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenStory(market.storyId);
                }
              }}
              className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs hover:border-stone-400 transition-colors cursor-pointer"
            >
              {/* 1. Question & Platform */}
              <div className="flex items-center justify-between gap-2 mb-2 text-[13px]">
                <div className="text-stone-900 font-medium leading-snug">
                  <span className="font-bold mr-1.5">{market.platform}</span>
                  <span className="text-stone-700">&ldquo;{market.question}&rdquo;</span>
                </div>
                <span className="font-mono text-[13px] text-stone-500 shrink-0">
                  {market.checkedTimeDisplay}
                </span>
              </div>

              {/* 2. Large percentage (28 px) & 7-day change */}
              <div className="flex items-baseline gap-3 mb-2">
                <AnimatedMarketProbability
                  currentProbability={market.probability}
                  lastWeekProbability={lastWeekPrice}
                  className="text-stone-950"
                />

                <div
                  className="flex items-center gap-0.5 text-[13px] font-mono font-bold"
                  style={{
                    color:
                      (market.change7d ?? 0) > 0
                        ? '#15803d'
                        : (market.change7d ?? 0) < 0
                        ? '#b91c1c'
                        : '#57534e'
                  }}
                >
                  {(market.change7d ?? 0) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
                  ) : (market.change7d ?? 0) < 0 ? (
                    <ArrowDownRight className="w-4 h-4 stroke-[2.4]" />
                  ) : null}
                </div>
              </div>

              {/* Multi-outcome horizontal bars if applicable (e.g. Mexico GP) */}
              {isMultiOutcome && market.outcomes ? (
                <div className="my-2.5 space-y-1.5">
                  {market.outcomes.slice(0, 3).map((outcome) => {
                    const pct = Math.round(outcome.probability * 100);
                    return (
                      <div key={outcome.id} className="text-[13px]">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-stone-800">{outcome.name}</span>
                          <span className="font-mono font-bold text-stone-900">
                            {outcome.probabilityFormatted}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: shouldReduceMotion ? `${pct}%` : '0%' }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: config.accentColorHex }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 3. Small Chart Line */
                <MarketsRowChart market={market} shouldReduceMotion={shouldReduceMotion} />
              )}

              {/* 4. Story headline underneath */}
              {matchingStory && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[13px]">
                  <div className="truncate mr-2">
                    <span className="text-stone-400 font-mono uppercase tracking-wider mr-1.5">
                      Story:
                    </span>
                    <span className="font-serif font-semibold text-stone-800">
                      {matchingStory.headline}
                    </span>
                  </div>
                  <span className="text-stone-400 font-mono shrink-0">&rarr;</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

/**
 * Small 44px chart for the Markets tab row.
 */
function MarketsRowChart({
  market,
  shouldReduceMotion
}: {
  market: StoryMarketData;
  shouldReduceMotion: boolean | null;
}): React.ReactElement {
  const width = 360;
  const height = 44;
  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 6;
  const paddingBottom = 8;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const sortedPoints = [...market.priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const minTime = sortedPoints.length > 0 ? new Date(sortedPoints[0].date).getTime() : 0;
  const maxTime = sortedPoints.length > 0 ? new Date(sortedPoints[sortedPoints.length - 1].date).getTime() : 1;
  const duration = Math.max(1, maxTime - minTime);

  const getX = (dateStr: string): number => {
    const t = new Date(dateStr).getTime();
    const ratio = Math.max(0, Math.min(1, (t - minTime) / duration));
    return paddingLeft + ratio * chartW;
  };

  const getY = (price: number): number => {
    const clamped = Math.max(0, Math.min(1.0, price));
    return paddingTop + (1.0 - clamped) * chartH;
  };

  const segments: MarketPricePoint[][] = [];
  let currentSegment: MarketPricePoint[] = [];

  for (let i = 0; i < sortedPoints.length; i++) {
    const pt = sortedPoints[i];
    if (currentSegment.length === 0) {
      currentSegment.push(pt);
    } else {
      const prev = currentSegment[currentSegment.length - 1];
      const prevTime = new Date(prev.date).getTime();
      const currTime = new Date(pt.date).getTime();
      const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentSegment.push(pt);
      } else {
        segments.push(currentSegment);
        currentSegment = [pt];
      }
    }
  }
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return (
    <div className="w-full h-[44px] bg-stone-50 rounded border border-stone-200/80 px-1 py-0.5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible select-none"
      >
        <line
          x1={paddingLeft}
          y1={paddingTop + chartH}
          x2={width - paddingRight}
          y2={paddingTop + chartH}
          stroke="#e7e5e4"
          strokeWidth="1"
        />

        {segments.map((seg, sIdx) => {
          if (seg.length === 1) {
            return (
              <circle
                key={`row-dot-${sIdx}`}
                cx={getX(seg[0].date)}
                cy={getY(seg[0].price)}
                r="2.5"
                fill="#1c1917"
              />
            );
          }
          const pathD = seg
            .map((pt, idx) => {
              const x = getX(pt.date);
              const y = getY(pt.price);
              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <motion.path
              key={`row-seg-${sIdx}`}
              d={pathD}
              fill="none"
              stroke="#1c1917"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
