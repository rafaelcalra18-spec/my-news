/**
 * @file src/components/StoryMarketDetailChart.tsx
 * @description Full-width 200px Detailed Prediction Market Step Chart for the Story View.
 *
 * Implements User Requirements 3, 4, & 7:
 * 1. "Story view chart: the x-axis covers the market's last 14 days of history, or all of it if shorter,
 *    rather than starting at the story's first entry. The line spans the full chart width. Draw story entries
 *    inside this range as before, and leave out any that fall before it."
 * 2. "Buttons that switch between markets name the market, not the platform. For story 11 use 'Title 99%'
 *    and 'Mexico win 36%', with the percentage taken from the live price."
 * 3. "Remove trading volume everywhere."
 * 4. Step line holds each price until the next.
 * 5. Nothing sits outside the chart box; labels are at least 13 px.
 *
 * USE CASES:
 * - Positioned directly under "What changed" and above "Full story" in StoryDetailView.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { StoryMarketData, TimelineNode } from '../types/news.ts';
import { AnimatedMarketProbability } from './AnimatedMarketProbability.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface StoryMarketDetailChartProps {
  markets: StoryMarketData[];
  timelineNodes: TimelineNode[];
  storyFirstSeenDate?: string;
}

/**
 * Returns human-readable market button labels.
 * Explicitly for Story 11: "Title 99%" and "Mexico win 36%".
 * For Story 5: "House 94%" and "Senate 72%".
 *
 * @param {StoryMarketData} m Target market.
 * @returns {string} Name of the market and live percentage.
 */
export function getMarketSwitcherLabel(m: StoryMarketData): string {
  const q = m.question.toLowerCase();
  const id = (m.id || '').toLowerCase();
  const prob = m.probabilityFormatted;

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
  return `${m.question.slice(0, 14)} ${prob}`;
}

/**
 * StoryMarketDetailChart renders the comprehensive 200px prediction market chart with entry inspector.
 *
 * @param {StoryMarketDetailChartProps} props Component props.
 * @returns {React.ReactElement | null} Detail chart element.
 */
export function StoryMarketDetailChart({
  markets,
  timelineNodes
}: StoryMarketDetailChartProps): React.ReactElement | null {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();
  const [selectedMarketIndex, setSelectedMarketIndex] = useState<number>(0);
  const [inspectedEntry, setInspectedEntry] = useState<TimelineNode | null>(null);

  if (!markets || markets.length === 0) return null;

  const market = markets[selectedMarketIndex] || markets[0];
  const lastWeekPrice = market.priceHistory[0]?.price ?? market.probability;
  const isMultiOutcome = !!market.outcomes && market.outcomes.length > 0;
  const isFallback = market.isFallback;

  logFunctionCall('StoryMarketDetailChart:render', {
    storyId: market.storyId,
    marketId: market.id,
    question: market.question,
    isFallback
  });

  // Chart Dimensions strictly contained inside the viewBox
  const width = 360;
  const height = 200;
  const paddingLeft = 44; // Room for 100%, 50%, 0%
  const paddingRight = 14;
  const paddingTop = 22;
  const paddingBottom = 34; // Room for x-axis ticks, dots, and date labels inside box

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Requirement 3: The x-axis covers the market's last 14 days of history, or all of it if shorter,
  // rather than starting at the story's first entry.
  const todayTs = new Date('2026-10-31T00:00:00Z').getTime();
  const fourteenDaysAgoTs = todayTs - 14 * 24 * 60 * 60 * 1000; // 17 Oct 2026

  const rawSortedPoints = [...market.priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const earliestHistoryTs = rawSortedPoints.length > 0
    ? new Date(rawSortedPoints[0].date + 'T00:00:00Z').getTime()
    : fourteenDaysAgoTs;

  const minTime = Math.max(fourteenDaysAgoTs, earliestHistoryTs);
  const maxTime = todayTs;
  const duration = Math.max(1, maxTime - minTime);

  // Filter price points to 14-day history window
  const sortedPoints = rawSortedPoints.filter(
    (pt) => new Date(pt.date + 'T00:00:00Z').getTime() >= minTime
  );

  const getX = (dateStr: string): number => {
    const t = new Date(dateStr + 'T00:00:00Z').getTime();
    const ratio = Math.max(0, Math.min(1, (t - minTime) / duration));
    return paddingLeft + ratio * chartW;
  };

  const getY = (price: number): number => {
    const clamped = Math.max(0, Math.min(1.0, price));
    return paddingTop + (1.0 - clamped) * chartH;
  };

  // Build step-line path spanning full chart width
  let stepPathD = '';
  if (sortedPoints.length > 0) {
    stepPathD = `M ${getX(sortedPoints[0].date).toFixed(1)} ${getY(sortedPoints[0].price).toFixed(1)}`;
    for (let i = 1; i < sortedPoints.length; i++) {
      const prev = sortedPoints[i - 1];
      const curr = sortedPoints[i];
      const prevY = getY(prev.price).toFixed(1);
      const currX = getX(curr.date).toFixed(1);
      const currY = getY(curr.price).toFixed(1);
      stepPathD += ` H ${currX} V ${currY}`;
    }
  }

  // Requirement 3: Draw story entries inside this range as before, and leave out any that fall before it
  const visibleTimelineNodes = timelineNodes.filter((node) => {
    const nodeTs = new Date(node.date + 'T00:00:00Z').getTime();
    return nodeTs >= minTime && nodeTs <= maxTime;
  });

  return (
    <section className="mb-6 pb-5 border-b border-stone-200">
      {/* Requirement 4: Buttons that switch between markets name the market, not the platform */}
      {markets.length > 1 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
          {markets.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedMarketIndex(idx);
                setInspectedEntry(null);
              }}
              className={`text-[13px] font-mono px-3 py-1.5 rounded-full border transition-colors cursor-pointer shrink-0 ${
                idx === selectedMarketIndex
                  ? 'bg-stone-900 text-white border-stone-900 font-bold'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              {getMarketSwitcherLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* Fallback mode: show saved price labelled "Saved price, 31 Oct" and nothing else */}
      {isFallback ? (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
          <div className="text-[13px] font-serif font-semibold text-stone-900 mb-1.5">
            &ldquo;{market.question}&rdquo;
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono font-bold text-[28px] leading-none text-stone-900">
              {market.probabilityFormatted}
            </span>
            <span className="text-[13px] font-mono text-stone-500 font-medium">
              Saved price, 31 Oct
            </span>
          </div>
          <div className="text-[13px] font-mono text-stone-500 mt-2">
            {market.platform}
          </div>
        </div>
      ) : (
        <>
          {/* Probability Display (28px) & 7-day change in pts */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2.5">
              <AnimatedMarketProbability
                currentProbability={market.probability}
                lastWeekProbability={lastWeekPrice}
                className="text-stone-900"
              />

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

            <span className="text-[13px] font-mono text-stone-500 font-medium">
              {market.platform}
            </span>
          </div>

          {/* Multi-outcome horizontal bars if applicable */}
          {isMultiOutcome && market.outcomes && (
            <div className="my-3 space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Top Contenders
              </span>
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
                    <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
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
          )}

          {/* Full-width 200px Step Chart covering last 14 days of history */}
          {sortedPoints.length >= 2 && (
            <div className="w-full h-[200px] bg-stone-50 rounded-lg border border-stone-200 overflow-hidden relative select-none">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-hidden"
              >
                {/* Horizontal Guidelines for 100%, 50%, and 0% */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop}
                  x2={width - paddingRight}
                  y2={paddingTop}
                  stroke="#e7e5e4"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                <line
                  x1={paddingLeft}
                  y1={paddingTop + chartH / 2}
                  x2={width - paddingRight}
                  y2={paddingTop + chartH / 2}
                  stroke="#e7e5e4"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                <line
                  x1={paddingLeft}
                  y1={paddingTop + chartH}
                  x2={width - paddingRight}
                  y2={paddingTop + chartH}
                  stroke="#d6d3d1"
                  strokeWidth="1.2"
                />

                {/* Y-axis labels: strictly >= 13px */}
                <text
                  x={paddingLeft - 6}
                  y={paddingTop + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  100%
                </text>
                <text
                  x={paddingLeft - 6}
                  y={paddingTop + chartH / 2 + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  50%
                </text>
                <text
                  x={paddingLeft - 6}
                  y={paddingTop + chartH + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  0%
                </text>

                {/* Step line path holding each price until next, spanning full chart width */}
                {stepPathD && (
                  <motion.path
                    d={stepPathD}
                    fill="none"
                    stroke="#1c1917"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="miter"
                    initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}

                {/* Requirement 3: Draw story entries inside this 14-day range, leave out earlier entries */}
                {visibleTimelineNodes.map((node) => {
                  const x = getX(node.date);
                  const isToday = node.isToday || node.date === '2026-10-31';
                  const isSelected = inspectedEntry?.id === node.id;

                  return (
                    <g
                      key={`chart-entry-${node.id}`}
                      className="cursor-pointer group"
                      onClick={() => {
                        logFunctionCall('StoryMarketDetailChart:tapMarker', { nodeId: node.id });
                        setInspectedEntry(isSelected ? null : node);
                      }}
                    >
                      {/* Thin dashed vertical line inside the chart */}
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + chartH}
                        stroke={isToday ? config.accentColorHex : '#a8a29e'}
                        strokeDasharray="2,2"
                        strokeWidth="1.2"
                      />

                      {/* Dot on the x-axis */}
                      <circle
                        cx={x}
                        cy={paddingTop + chartH}
                        r={isToday ? 5 : 4}
                        fill={isToday ? config.accentColorHex : '#44403c'}
                        stroke={isSelected ? '#1c1917' : '#ffffff'}
                        strokeWidth={isSelected ? 2 : 1}
                        className="transition-transform group-hover:scale-125"
                      />

                      {/* Date tick & label inside chart box */}
                      <text
                        x={x}
                        y={paddingTop + chartH + 18}
                        textAnchor="middle"
                        fontSize="13"
                        fontFamily="monospace"
                        fontWeight={isToday ? 'bold' : 'normal'}
                        fill={isToday ? config.accentColorHex : '#57534e'}
                      >
                        {isToday ? 'today' : node.dateDisplay.replace(/^[A-Za-z]+\s+/, '')}
                      </text>

                      {/* Generous touch target */}
                      <rect
                        x={x - 14}
                        y={paddingTop}
                        width="28"
                        height={chartH + 24}
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Interactive marker panel under the chart */}
          {inspectedEntry && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-3 p-3 bg-stone-100/90 rounded-lg border border-stone-200 text-[13px] relative"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-mono font-bold"
                  style={{
                    color: inspectedEntry.isToday ? config.accentColorHex : '#1c1917'
                  }}
                >
                  {inspectedEntry.dateDisplay} {inspectedEntry.isToday ? '· Today' : ''}
                </span>

                <button
                  type="button"
                  onClick={() => setInspectedEntry(null)}
                  className="p-1 -mr-1 rounded hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                  aria-label="Close entry panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-stone-800 leading-relaxed mb-1">
                {inspectedEntry.changeDescription}
              </p>

              {inspectedEntry.sources && inspectedEntry.sources.length > 0 && (
                <div className="text-[13px] text-stone-500 font-mono">
                  Sources: {inspectedEntry.sources.map((s) => s.outlet).join(', ')}
                </div>
              )}
            </motion.div>
          )}

          {/* Requirement 7: Trading volume removed everywhere. Show question, platform, checked time */}
          <div className="mt-3 space-y-1 text-[13px] text-stone-700">
            <div className="font-serif font-semibold text-stone-900 leading-snug">
              &ldquo;{market.question}&rdquo;
            </div>
            <div className="flex flex-wrap items-center gap-x-2 font-mono text-[13px] text-stone-600">
              <span>{market.platform}</span>
              <span>&middot;</span>
              <span className="text-stone-500">{market.checkedTimeDisplay}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
