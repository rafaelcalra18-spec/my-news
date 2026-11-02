/**
 * @file src/components/MarketCardBlock.tsx
 * @description Inline Prediction Market Block displayed on Today story cards.
 *
 * Implements User Requirements 2, 4, & 7:
 * 1. "Card charts: the line spans the full width of its box. The y-range zooms to the line's own lowest and highest value, with 2 points of padding, and the first and current values stay printed at the two ends."
 * 2. "Buttons that switch between markets name the market, not the platform. For story 11 use 'Title 99%' and 'Mexico win 36%', with the percentage taken from the live price."
 * 3. "Remove trading volume everywhere."
 * 4. Step line holds each price until the next.
 * 5. Strictly no text smaller than 13 px.
 *
 * USE CASES:
 * - Rendering verified prediction market expectations directly within story cards on the Today screen.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StoryMarketData } from '../types/news.ts';
import { AnimatedMarketProbability } from './AnimatedMarketProbability.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface MarketCardBlockProps {
  markets: StoryMarketData[];
  onOpenStory: () => void;
}

/**
 * Generates market name labels for switcher buttons.
 * Specifically handles Story 11 ("Title 99%", "Mexico win 36%") and Story 5 ("House 94%", "Senate 72%").
 *
 * @param {StoryMarketData} market Target market.
 * @returns {string} Human-readable label with live percentage.
 */
export function getMarketButtonName(market: StoryMarketData): string {
  const q = market.question.toLowerCase();
  const id = (market.id || '').toLowerCase();
  const prob = market.probabilityFormatted;

  if (q.includes('champion') || id.includes('champ')) {
    return `Title ${prob}`;
  }
  if (q.includes('mexico') || id.includes('mex')) {
    return `Mexico win ${prob}`;
  }
  if (q.includes('house') || id.includes('house')) {
    return `House ${prob}`;
  }
  if (q.includes('senate') || id.includes('senate')) {
    return `Senate ${prob}`;
  }
  if (q.includes('ceasefire')) {
    return `Ceasefire ${prob}`;
  }
  return `${market.question.slice(0, 14)} ${prob}`;
}

/**
 * MarketCardBlock renders prediction market data attached to a story card.
 *
 * @param {MarketCardBlockProps} props Component props.
 * @returns {React.ReactElement | null} Market card block.
 */
export function MarketCardBlock({
  markets,
  onOpenStory
}: MarketCardBlockProps): React.ReactElement | null {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();
  const [showAllMarkets, setShowAllMarkets] = useState<boolean>(false);

  if (!markets || markets.length === 0) return null;

  logFunctionCall('MarketCardBlock:render', {
    marketsCount: markets.length,
    primaryQuestion: markets[0]?.question
  });

  const displayedMarkets = showAllMarkets ? markets : [markets[0]];
  const hasAdditionalMarkets = markets.length > 1;

  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('a') || target.closest('button')) {
          e.stopPropagation();
        }
      }}
      className="my-3 p-3 bg-stone-50 border border-stone-200 rounded-lg select-none"
    >
      {displayedMarkets.map((market, idx) => {
        const lastWeekPrice = market.priceHistory[0]?.price ?? market.probability;
        const isMultiOutcome = !!market.outcomes && market.outcomes.length > 0;
        const isFallback = market.isFallback;

        return (
          <div key={market.id} className={idx > 0 ? 'mt-3 pt-3 border-t border-stone-200' : ''}>
            {/* 1. Platform and exact question on one line */}
            <div className="flex items-center justify-between gap-2 mb-1.5 text-[13px] text-stone-800 leading-snug">
              <div className="truncate">
                {market.pageUrl ? (
                  <a
                    href={market.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-stone-900 underline underline-offset-2 hover:text-stone-600 mr-1"
                  >
                    {market.platform}
                  </a>
                ) : (
                  <span className="font-bold text-stone-900 mr-1">{market.platform}</span>
                )}
                <span className="text-stone-700">&ldquo;{market.question}&rdquo;</span>
              </div>

              <span className="font-mono text-[13px] text-stone-500 shrink-0">
                {isFallback ? 'Saved price, 31 Oct' : market.checkedTimeDisplay}
              </span>
            </div>

            {/* If live request failed (fallback mode): show saved price and label and nothing else */}
            {isFallback ? (
              <div className="flex items-baseline gap-2 my-1">
                <span className="font-mono font-bold text-[28px] leading-none text-stone-900">
                  {market.probabilityFormatted}
                </span>
                <span className="text-[13px] font-mono text-stone-500">
                  Saved price, 31 Oct
                </span>
              </div>
            ) : isMultiOutcome && market.outcomes ? (
              /* Multi-outcome: top three as horizontal bars */
              <div className="my-2 space-y-2">
                {market.outcomes.slice(0, 3).map((outcome) => {
                  const pctWidth = Math.round(outcome.probability * 100);
                  return (
                    <div key={outcome.id} className="text-[13px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-stone-800 truncate mr-2">
                          {outcome.name}
                        </span>
                        <span className="font-mono font-bold text-stone-900 shrink-0">
                          {outcome.probabilityFormatted}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: shouldReduceMotion ? `${pctWidth}%` : '0%' }}
                          animate={{ width: `${pctWidth}%` }}
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
              /* Binary / single probability: 28px probability + 7d change (in pts) + 56px zoomed step chart */
              <>
                <div className="flex items-baseline gap-2.5 mb-2">
                  <AnimatedMarketProbability
                    currentProbability={market.probability}
                    lastWeekProbability={lastWeekPrice}
                    className="text-stone-900"
                  />

                  {/* 7-day change in percentage points (only if history reaches back 7 days) */}
                  {market.change7dFormatted && (
                    <div
                      className="flex items-center gap-0.5 text-[13px] font-mono font-semibold"
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
                        <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                      ) : (market.change7d ?? 0) < 0 ? (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.2]" />
                      ) : null}
                      <span>{market.change7dFormatted} 7d</span>
                    </div>
                  )}
                </div>

                {/* Card chart: full width and 56 px tall step line zoomed to lowest/highest + 2 pts padding */}
                <CardStepChart market={market} shouldReduceMotion={shouldReduceMotion} />
              </>
            )}
          </div>
        );
      })}

      {/* Switcher links if story has more than one market */}
      {hasAdditionalMarkets && (
        <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllMarkets((prev) => !prev);
            }}
            className="text-[13px] font-mono font-semibold text-stone-700 hover:text-stone-950 underline underline-offset-2 cursor-pointer"
          >
            {showAllMarkets ? 'Show less' : `+${markets.length - 1} more market`}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStory();
            }}
            className="text-[13px] font-mono text-stone-500 hover:text-stone-800 underline underline-offset-2 cursor-pointer"
          >
            Inspect in story &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 56 px full-width Card Step Chart.
 *
 * Implements User Requirement 2:
 * - "Card charts: the line spans the full width of its box. The y-range zooms to the line's own lowest
 *    and highest value, with 2 points of padding, and the first and current values stay printed at the two ends."
 * - "If history has fewer than three points, show no chart."
 * - "Labels are at least 13 px."
 */
function CardStepChart({
  market,
  shouldReduceMotion
}: {
  market: StoryMarketData;
  shouldReduceMotion: boolean | null;
}): React.ReactElement | null {
  const sortedPoints = [...market.priceHistory].sort((a, b) => a.date.localeCompare(b.date));

  // If history has fewer than three points, show no chart
  if (sortedPoints.length < 3 || market.isFallback) {
    return null;
  }

  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  const firstPriceDisplay = `${Math.round(firstPoint.price * 100)}%`;
  const currentPriceDisplay = `${Math.round(lastPoint.price * 100)}%`;
  const firstDateDisplay = firstPoint.dateDisplay.replace(/^[A-Za-z]+\s+/, ''); // e.g. "24 Oct"

  // Dimensions: 56px height
  const width = 360;
  const height = 56;
  const paddingTop = 16;
  const paddingBottom = 16;
  const chartH = height - paddingTop - paddingBottom; // 24px chart area

  // Zoom y-range to line's own lowest and highest values, with 2 points (0.02) of padding
  const allPrices = sortedPoints.map((p) => p.price);
  const lowestPrice = Math.min(...allPrices);
  const highestPrice = Math.max(...allPrices);

  const yMin = Math.max(0, lowestPrice - 0.02);
  const yMax = Math.min(1.0, highestPrice + 0.02);
  const yRange = Math.max(0.01, yMax - yMin);

  // Time range spanning the full width of the box (0 to width)
  const minTime = new Date(firstPoint.date).getTime();
  const maxTime = new Date(lastPoint.date).getTime();
  const duration = Math.max(1, maxTime - minTime);

  const getX = (dateStr: string): number => {
    const t = new Date(dateStr).getTime();
    const ratio = Math.max(0, Math.min(1, (t - minTime) / duration));
    return ratio * width; // Spans 100% full width from 0 to width
  };

  const getY = (price: number): number => {
    const clamped = Math.max(yMin, Math.min(yMax, price));
    const ratio = (clamped - yMin) / yRange;
    return paddingTop + (1.0 - ratio) * chartH;
  };

  // Build step-line SVG path holding each price until the next
  let pathD = `M ${getX(sortedPoints[0].date).toFixed(1)} ${getY(sortedPoints[0].price).toFixed(1)}`;
  for (let i = 1; i < sortedPoints.length; i++) {
    const prev = sortedPoints[i - 1];
    const curr = sortedPoints[i];
    const prevY = getY(prev.price).toFixed(1);
    const currX = getX(curr.date).toFixed(1);
    const currY = getY(curr.price).toFixed(1);

    pathD += ` H ${currX} V ${currY}`;
  }

  return (
    <div className="w-full h-[56px] bg-white rounded border border-stone-200 relative overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-hidden"
      >
        {/* Step line holding each price until the next, spanning 100% full width */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#1c1917"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* First price printed at left */}
        <text
          x={6}
          y={12}
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#1c1917"
          textAnchor="start"
        >
          {firstPriceDisplay}
        </text>

        {/* Current price printed at right */}
        <text
          x={width - 6}
          y={12}
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#1c1917"
          textAnchor="end"
        >
          {currentPriceDisplay}
        </text>

        {/* First date under left */}
        <text
          x={6}
          y={height - 3}
          fontSize="13"
          fontFamily="monospace"
          fill="#78716c"
          textAnchor="start"
        >
          {firstDateDisplay}
        </text>

        {/* "today" under right */}
        <text
          x={width - 6}
          y={height - 3}
          fontSize="13"
          fontFamily="monospace"
          fill="#78716c"
          textAnchor="end"
        >
          today
        </text>
      </svg>
    </div>
  );
}
