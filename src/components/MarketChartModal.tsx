/**
 * @file src/components/MarketChartModal.tsx
 * @description Enlarged Market Price Chart Modal for in-depth inspection.
 *
 * Implements User Requirement 6:
 * 1. "Tapping the chart opens a larger version."
 * 2. Detailed probability axis (0% to 100%), full date labels, and interactive date points.
 * 3. Strictly no text smaller than 13 px.
 *
 * USE CASES:
 * - Reader tapping on the 64px compact chart to inspect detailed daily price milestones.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { StoryMarketData, TimelineNode, MarketPricePoint } from '../types/news.ts';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface MarketChartModalProps {
  isOpen: boolean;
  market: StoryMarketData;
  timelineNodes: TimelineNode[];
  onClose: () => void;
}

export function MarketChartModal({
  isOpen,
  market,
  timelineNodes,
  onClose
}: MarketChartModalProps): React.ReactElement {
  const config = getAppConfig();
  logFunctionCall('MarketChartModal:render', {
    isOpen,
    storyId: market.storyId,
    platform: market.platform
  });

  const [activeDate, setActiveDate] = useState<string | null>(null);

  const priceHistory = market.priceHistory || [];
  const storyDates = new Set(timelineNodes.map((n) => n.date));
  const sortedPoints = [...priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const allDates = Array.from(
    new Set([...sortedPoints.map((p) => p.date), ...timelineNodes.map((n) => n.date)])
  ).sort();

  const width = 360;
  const height = 180;
  const paddingLeft = 44;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minTime = allDates.length > 0 ? new Date(allDates[0]).getTime() : 0;
  const maxTime = allDates.length > 0 ? new Date(allDates[allDates.length - 1]).getTime() : 1;
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

  const inspectedPoint =
    sortedPoints.find((p) => p.date === activeDate) ||
    sortedPoints[sortedPoints.length - 1] || {
      date: '2026-10-31',
      dateDisplay: 'Sat 31 Oct',
      price: market.probability
    };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950 z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-[540px] mx-auto bg-white rounded-xl shadow-2xl z-50 p-5 border border-stone-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-stone-100">
              <div>
                <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                  {market.platform} Price History
                </span>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  &ldquo;{market.question}&rdquo;
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close enlarged chart"
                className="p-1.5 -mr-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Readout */}
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[13px] font-mono text-stone-600">
                <span>Selected: </span>
                <span className="font-bold text-stone-900">{inspectedPoint.dateDisplay}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-stone-900">
                  {(inspectedPoint.price * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full bg-stone-50 rounded-lg p-2 border border-stone-200">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Guidelines at 100%, 50%, 0% */}
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
                  x={paddingLeft - 8}
                  y={paddingTop + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  100%
                </text>
                <text
                  x={paddingLeft - 8}
                  y={paddingTop + chartH / 2 + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  50%
                </text>
                <text
                  x={paddingLeft - 8}
                  y={paddingTop + chartH + 5}
                  textAnchor="end"
                  fontSize="13"
                  fill="#78716c"
                  fontFamily="monospace"
                >
                  0%
                </text>

                {/* Path segments */}
                {segments.map((seg, sIdx) => {
                  if (seg.length === 1) {
                    return (
                      <circle
                        key={`modal-single-${sIdx}`}
                        cx={getX(seg[0].date)}
                        cy={getY(seg[0].price)}
                        r="3"
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
                      key={`modal-seg-${sIdx}`}
                      d={pathD}
                      fill="none"
                      stroke="#1c1917"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}

                {/* Story Entry Ticks under the axis */}
                {allDates.map((dateStr) => {
                  if (!storyDates.has(dateStr)) return null;
                  const x = getX(dateStr);
                  const axisY = paddingTop + chartH;
                  return (
                    <line
                      key={`modal-tick-${dateStr}`}
                      x1={x}
                      y1={axisY}
                      x2={x}
                      y2={axisY + 6}
                      stroke={config.accentColorHex}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Interactive Points */}
                {sortedPoints.map((pt) => {
                  const x = getX(pt.date);
                  const y = getY(pt.price);
                  const isInspected = inspectedPoint.date === pt.date;

                  return (
                    <g
                      key={`modal-pt-${pt.date}`}
                      className="cursor-pointer"
                      onClick={() => setActiveDate(pt.date)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isInspected ? 5 : 3}
                        fill={isInspected ? config.accentColorHex : '#44403c'}
                      />
                      <circle cx={x} cy={y} r="14" fill="transparent" />
                    </g>
                  );
                })}

                {/* X-axis date labels */}
                {allDates.map((dateStr, idx) => {
                  const hasStory = storyDates.has(dateStr);
                  const isFirst = idx === 0;
                  const isLast = idx === allDates.length - 1;
                  if (!hasStory && !isFirst && !isLast && idx % 2 !== 0) return null;

                  const x = getX(dateStr);
                  const parts = dateStr.split('-');
                  const label = `${Number(parts[2])} Oct`;

                  return (
                    <text
                      key={`modal-label-${dateStr}`}
                      x={x}
                      y={paddingTop + chartH + 20}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="monospace"
                      fontWeight={hasStory ? 'bold' : 'normal'}
                      fill={hasStory ? config.accentColorHex : '#78716c'}
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-between text-[13px] text-stone-500 font-mono">
              <span>Ticks indicate story reporting days</span>
              <span>{market.checkedTimeDisplay}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
