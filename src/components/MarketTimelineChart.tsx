/**
 * @file src/components/MarketTimelineChart.tsx
 * @description Compact 64px Market Price Line Chart with No Gridlines.
 *
 * Implements User Requirement 6 & 9:
 * 1. "make it a compact line 64 px tall with no gridlines."
 * 2. "Keep the axis at 0% to 100%."
 * 3. "Print the first and the latest percentage at the two ends of the line, and mark story-entry days with small ticks under it."
 * 4. "Remove the 'Story entry on this date' badge."
 * 5. "Tapping the chart opens a larger version."
 * 6. "Keep gaps for missing days."
 * 7. "No text smaller than 13 px on a phone, including chart labels."
 *
 * USE CASES:
 * - Clean inline market trend rendering attached to story timelines.
 */

import React, { useState } from 'react';
import { StoryMarketData, TimelineNode, MarketPricePoint } from '../types/news.ts';
import { MarketChartModal } from './MarketChartModal.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface MarketTimelineChartProps {
  market: StoryMarketData;
  timelineNodes: TimelineNode[];
}

export function MarketTimelineChart({
  market,
  timelineNodes
}: MarketTimelineChartProps): React.ReactElement | null {
  const config = getAppConfig();
  logFunctionCall('MarketTimelineChart:render', {
    storyId: market.storyId,
    platform: market.platform,
    pointsCount: market.priceHistory.length
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const priceHistory = market.priceHistory || [];
  if (priceHistory.length === 0) {
    return null;
  }

  // Set of dates that have a story entry
  const storyDates = new Set(timelineNodes.map((n) => n.date));

  // Determine chronological dates
  const sortedPoints = [...priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const allDates = Array.from(
    new Set([...sortedPoints.map((p) => p.date), ...timelineNodes.map((n) => n.date)])
  ).sort();

  if (allDates.length === 0) return null;

  // Compact dimensions: 64 px tall
  const width = 360;
  const height = 64;
  const paddingLeft = 44; // space for first percentage label
  const paddingRight = 44; // space for latest percentage label
  const paddingTop = 14;
  const paddingBottom = 16;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minTime = new Date(allDates[0]).getTime();
  const maxTime = new Date(allDates[allDates.length - 1]).getTime();
  const duration = Math.max(1, maxTime - minTime);

  const getX = (dateStr: string): number => {
    const t = new Date(dateStr).getTime();
    const ratio = Math.max(0, Math.min(1, (t - minTime) / duration));
    return paddingLeft + ratio * chartW;
  };

  /**
   * Strictly keeps axis at 0% (bottom) to 100% (top).
   */
  const getY = (price: number): number => {
    const clamped = Math.max(0, Math.min(1.0, price));
    return paddingTop + (1.0 - clamped) * chartH;
  };

  // Build segments with gaps for missing days
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

  const firstPoint = sortedPoints[0];
  const latestPoint = sortedPoints[sortedPoints.length - 1];

  const firstPctFormatted = `${(firstPoint.price * 100).toFixed(0)}%`;
  const latestPctFormatted = `${(latestPoint.price * 100).toFixed(0)}%`;

  return (
    <>
      <div
        onClick={() => {
          logFunctionCall('MarketTimelineChart:openModal', { storyId: market.storyId });
          setIsModalOpen(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        className="mt-2.5 w-full bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-200 rounded-lg p-2.5 cursor-pointer group"
        aria-label="Market probability chart. Tap to expand larger version."
      >
        {/* SVG Compact Line (64px tall, NO gridlines, 0-100% bounds) */}
        <div className="relative w-full h-[64px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none"
          >
            {/* Base axis line at 0% level */}
            <line
              x1={paddingLeft}
              y1={paddingTop + chartH}
              x2={width - paddingRight}
              y2={paddingTop + chartH}
              stroke="#d6d3d1"
              strokeWidth="1"
            />

            {/* First percentage printed at the left end of the line: >= 13px */}
            <text
              x={paddingLeft - 6}
              y={getY(firstPoint.price) + 4}
              textAnchor="end"
              fontSize="13"
              fill="#44403c"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {firstPctFormatted}
            </text>

            {/* Latest percentage printed at the right end of the line: >= 13px */}
            <text
              x={width - paddingRight + 6}
              y={getY(latestPoint.price) + 4}
              textAnchor="start"
              fontSize="13"
              fill="#1c1917"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {latestPctFormatted}
            </text>

            {/* Market line segments with gaps for missing days */}
            {segments.map((seg, sIdx) => {
              if (seg.length === 1) {
                return (
                  <circle
                    key={`seg-single-${sIdx}`}
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
                <path
                  key={`seg-${sIdx}`}
                  d={pathD}
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Small ticks under the axis for days with a story entry */}
            {allDates.map((dateStr) => {
              if (!storyDates.has(dateStr)) return null;
              const x = getX(dateStr);
              const axisY = paddingTop + chartH;
              return (
                <line
                  key={`compact-tick-${dateStr}`}
                  x1={x}
                  y1={axisY}
                  x2={x}
                  y2={axisY + 4}
                  stroke={config.accentColorHex}
                  strokeWidth="1.75"
                />
              );
            })}

            {/* First & latest milestone dots */}
            <circle
              cx={getX(firstPoint.date)}
              cy={getY(firstPoint.price)}
              r="2.5"
              fill="#44403c"
            />
            <circle
              cx={getX(latestPoint.date)}
              cy={getY(latestPoint.price)}
              r="3.5"
              fill={config.accentColorHex}
            />
          </svg>
        </div>

        {/* Tap to expand hint text strictly >= 13px */}
        <div className="mt-1 flex items-center justify-between text-[13px] font-mono text-stone-500">
          <span>{firstPoint.dateDisplay} &rarr; {latestPoint.dateDisplay}</span>
          <span className="text-stone-400 group-hover:text-stone-700 transition-colors">
            Tap to enlarge
          </span>
        </div>
      </div>

      {/* Enlarged Chart Modal */}
      <MarketChartModal
        isOpen={isModalOpen}
        market={market}
        timelineNodes={timelineNodes}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
