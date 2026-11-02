/**
 * @file src/components/StoryDetailView.tsx
 * @description Fullscreen Single-Page Story View with Unified Scroll, Inline Markets, Background, and Coverage.
 *
 * Implements User Requirements 1, 2, 5, 6:
 * 1. "The whole story view scrolls as one page. Remove the inner scrolling box and its second scrollbar."
 * 2. "Order in the story view: headline, 'What changed' line, market, Full story, timeline, what's next."
 * 3. "Move the summary, coverage and like and dislike buttons into the story view."
 *    - Like and dislike buttons show no counts, filled when pressed, pressing again undoes it.
 * 4. "The floating next arrow appears only when the mouse hovers on desktop, outside the text column, and never on touch screens."
 * 5. Strictly only one scrollbar for the whole page.
 *
 * USE CASES:
 * - Comprehensive deep-dive inspection of a story's evolution, prediction expectations, context, and coverage.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, List, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Story, TimelineNode } from '../types/news.ts';
import { getTimelineForStory } from '../data/backfillData.ts';
import { getUpcomingEventsForStory, UpcomingMilestone } from '../data/upcomingEventsData.ts';
import { getFullStoryForStory } from '../data/fullStoryData.ts';
import { FullStorySection } from './FullStorySection.tsx';
import { StoryMarketDetailChart } from './StoryMarketDetailChart.tsx';
import { StoryIndexBottomSheet } from './StoryIndexBottomSheet.tsx';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

/** Turns '2026-10-31' into 'Sat 31 Oct', the format the "What changed" line uses for updated stories. */
function formatShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getUTCDay()]} ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

interface StoryDetailViewProps {
  stories: Story[];
  initialStoryId: string;
  onClose: () => void;
  onLike: (storyId: string) => void;
  onDislike: (storyId: string) => void;
  onSelectStory?: (storyId: string) => void;
}

/**
 * StoryDetailView displays the full story deep dive with unified single-page scrolling.
 *
 * @param {StoryDetailViewProps} props Component props.
 * @returns {React.ReactElement} Story view component.
 */
export function StoryDetailView({
  stories,
  initialStoryId,
  onClose,
  onLike,
  onDislike,
  onSelectStory
}: StoryDetailViewProps): React.ReactElement {
  const config = getAppConfig();
  const shouldReduceMotion = useReducedMotion();

  // Find initial story index
  const initialIndex = Math.max(
    0,
    stories.findIndex((s) => s.id === initialStoryId)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [showIndexSheet, setShowIndexSheet] = useState<boolean>(false);

  // Horizontal touch dragging state
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Touch tracking refs
  const touchStartRef = useRef<{ x: number; y: number; scrollTop: number }>({ x: 0, y: 0, scrollTop: 0 });
  const directionLockRef = useRef<'horizontal' | 'vertical' | null>(null);

  // Single page outer scroll container ref
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const activeStory = stories[currentIndex] || stories[0];
  const nextStory = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : null;
  const prevStory = currentIndex > 0 ? stories[currentIndex - 1] : null;

  const fullStoryRecord = getFullStoryForStory(activeStory.id);
  const timelineNodes = getTimelineForStory(activeStory.id);
  const upcomingEvents = getUpcomingEventsForStory(activeStory.id);

  const storyMarkets = activeStory.markets && activeStory.markets.length > 0
    ? activeStory.markets
    : activeStory.market
    ? [activeStory.market]
    : [];

  logFunctionCall('StoryDetailView:render', {
    currentIndex,
    storyId: activeStory.id,
    headline: activeStory.headline
  });

  // Sync initialStoryId changes externally
  useEffect(() => {
    const idx = stories.findIndex((s) => s.id === initialStoryId);
    if (idx !== -1 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [initialStoryId, stories]);

  // Requirement 1: Opens at the top showing close row, headline, and "What changed" line
  useEffect(() => {
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentIndex]);

  // Keyboard navigation on desktop (Left, Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIndexSheet) {
        if (e.key === 'Escape') setShowIndexSheet(false);
        return;
      }
      if (e.key === 'ArrowRight') {
        if (currentIndex < stories.length - 1) {
          logFunctionCall('StoryDetailView:keyRight', { nextIdx: currentIndex + 1 });
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          logFunctionCall('StoryDetailView:keyLeft', { prevIdx: currentIndex - 1 });
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Escape') {
        logFunctionCall('StoryDetailView:keyEscape', {});
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length, onClose, showIndexSheet]);

  // Touch Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const scrollTop = pageContainerRef.current ? pageContainerRef.current.scrollTop : 0;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, scrollTop };
    directionLockRef.current = null;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (!directionLockRef.current) {
      if (Math.abs(deltaY) > 10) {
        directionLockRef.current = 'vertical';
      } else if (Math.abs(deltaX) > 10) {
        directionLockRef.current = 'horizontal';
        setIsDragging(true);
      }
    }

    if (directionLockRef.current === 'horizontal') {
      if (e.cancelable) e.preventDefault();
      let drag = deltaX;
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === stories.length - 1 && deltaX < 0)) {
        drag = deltaX * 0.35;
      }
      setDragOffset(drag);
    } else if (directionLockRef.current === 'vertical') {
      if (touchStartRef.current.scrollTop <= 0 && deltaY > 100) {
        logFunctionCall('StoryDetailView:swipeDownClose', { deltaY });
        onClose();
      }
    }
  };

  const handleTouchEnd = () => {
    if (directionLockRef.current === 'horizontal') {
      const threshold = 65;
      if (dragOffset < -threshold && currentIndex < stories.length - 1) {
        logFunctionCall('StoryDetailView:snapNext', { nextIdx: currentIndex + 1 });
        setCurrentIndex((prev) => prev + 1);
      } else if (dragOffset > threshold && currentIndex > 0) {
        logFunctionCall('StoryDetailView:snapPrev', { prevIdx: currentIndex - 1 });
        setCurrentIndex((prev) => prev - 1);
      }
    }
    setDragOffset(0);
    setIsDragging(false);
    directionLockRef.current = null;
  };

  const goToNextStory = () => {
    if (currentIndex < stories.length - 1) {
      logFunctionCall('StoryDetailView:goToNextStory', { nextIdx: currentIndex + 1 });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevStory = () => {
    if (currentIndex > 0) {
      logFunctionCall('StoryDetailView:goToPrevStory', { prevIdx: currentIndex - 1 });
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const springTransition = shouldReduceMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      layoutId={shouldReduceMotion ? undefined : `story-card-${activeStory.id}`}
      transition={springTransition}
      initial={{ opacity: shouldReduceMotion ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: shouldReduceMotion ? 0 : 0.8 }}
      ref={pageContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      /* Requirement 6: The whole story view scrolls as one single page. No second scrollbar! */
      className="fixed inset-0 z-40 bg-stone-100 overflow-y-auto select-none group"
    >
      {/* Floating Prev Arrow: desktop mouse hover only, outside 640px text column */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={goToPrevStory}
          aria-label="Previous story"
          className="hidden md:group-hover:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/95 border border-stone-300 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 transition-all cursor-pointer pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Floating Next Arrow: desktop mouse hover only, outside 640px text column */}
      {currentIndex < stories.length - 1 && (
        <button
          type="button"
          onClick={goToNextStory}
          aria-label="Next story"
          className="hidden md:group-hover:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/95 border border-stone-300 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 transition-all cursor-pointer pointer-events-auto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Centered phone-first column (max 640px) */}
      <div
        className="w-full max-w-[640px] mx-auto min-h-screen bg-white border-x border-stone-200 relative flex flex-col shadow-sm"
        style={{
          transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 250ms ease-out'
        }}
      >
        {/* Sticky Top Header: Progress Segments & Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-none border-b border-stone-200">
          <div className="flex items-center gap-[2px] px-3 pt-2 pb-1 bg-stone-50">
            {stories.map((s, idx) => {
              const isCurrent = idx === currentIndex;
              const isPast = idx < currentIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to story ${idx + 1}`}
                  className="flex-1 h-[2.5px] rounded-full transition-all cursor-pointer"
                  style={{
                    backgroundColor: isCurrent
                      ? '#1c1917'
                      : isPast
                      ? '#78716c'
                      : '#e7e5e4'
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between px-4 py-2.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close story view"
              className="p-1.5 -ml-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[13px] font-mono font-medium text-stone-600 uppercase tracking-wider">
              {currentIndex + 1} of {stories.length} &middot; {activeStory.section}
            </span>

            <button
              type="button"
              onClick={() => setShowIndexSheet(true)}
              aria-label="Open full edition index"
              className="p-1.5 -mr-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Story Body: strictly adheres to order in Requirement 4 & 2:
            1. Headline
            2. "What changed" line
            3. Market (200px step chart with internal dashed lines & tap inspector)
            4. Background summary & "Why it matters to you" & Like/dislike buttons
            5. Full story
            6. Timeline
            7. What's next
            8. Coverage
        */}
        <main className="px-5 py-5 flex-1 select-text">
          {/* 1. Headline in serif */}
          <motion.h1
            layoutId={shouldReduceMotion ? undefined : `story-headline-${activeStory.id}`}
            transition={springTransition}
            className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 leading-tight mb-2.5"
          >
            {activeStory.headline}
          </motion.h1>

          {/* 2. Dated "What changed" line in accent colour */}
          {activeStory.changeSummary && activeStory.changeDate ? (
            <div
              className="text-[13px] sm:text-sm leading-relaxed mb-4 pl-3 border-l-2 font-medium"
              style={{
                borderColor: config.accentColorHex,
                color: config.accentColorHex
              }}
            >
              <span>What changed &middot; {activeStory.changeDate}:</span>{' '}
              <span className="text-stone-800 font-normal">
                {activeStory.changeSummary}
              </span>
            </div>
          ) : (
            <div
              className="text-[13px] sm:text-sm leading-relaxed mb-4 pl-3 border-l-2 font-medium"
              style={{
                borderColor: config.accentColorHex,
                color: config.accentColorHex
              }}
            >
              <span>What changed &middot; {formatShortDate(activeStory.dateLastChanged)}:</span>{' '}
              <span className="text-stone-800 font-normal">
                {/* First sentence only: split at a full stop followed by a space, so "$2.1bn" stays whole */}
                {activeStory.summary.split(/(?<=[.!?])\s+/)[0]}
              </span>
            </div>
          )}

          {/* 3. Market Block (200px step chart) directly under "What changed" */}
          {storyMarkets.length > 0 && (
            <StoryMarketDetailChart
              markets={storyMarkets}
              timelineNodes={timelineNodes}
              storyFirstSeenDate={activeStory.dateFirstSeen}
            />
          )}

          {/* 4. Background Summary & Reader Relevance & Like/Dislike moved into Story View */}
          <section className="mb-6 space-y-3">
            <p className="text-stone-800 text-[13px] sm:text-sm leading-relaxed">
              {activeStory.summary}
            </p>

            {activeStory.whyItMattersToYou && activeStory.whyItMattersToYou.trim() !== '' && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[13px] sm:text-sm text-stone-700 leading-relaxed">
                <span className="font-semibold text-stone-900 block mb-0.5">
                  Why it matters to you
                </span>
                {activeStory.whyItMattersToYou}
              </div>
            )}

            {/* Like and Dislike buttons (filled when pressed, pressing again undoes it, no counts) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  logFunctionCall('StoryDetailView:like', { storyId: activeStory.id });
                  onLike(activeStory.id);
                }}
                aria-label="Like story"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
                  activeStory.isLiked
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${
                    activeStory.isLiked ? 'fill-white stroke-white' : 'stroke-current'
                  }`}
                />
                <span>Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logFunctionCall('StoryDetailView:dislike', { storyId: activeStory.id });
                  onDislike(activeStory.id);
                }}
                aria-label="Dislike story"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
                  activeStory.isDisliked
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${
                    activeStory.isDisliked ? 'fill-white stroke-white' : 'stroke-current'
                  }`}
                />
                <span>Less like this</span>
              </button>
            </div>
          </section>

          {/* 5. Full Story Section */}
          <FullStorySection fullStory={fullStoryRecord} />

          {/* 6. Timeline (past entries leading to today) & 7. What's next */}
          <UnifiedStoryTimeline
            story={activeStory}
            timelineNodes={timelineNodes}
            upcomingEvents={upcomingEvents}
          />

          {/* 8. Coverage: one row per outlet */}
          {activeStory.coverage && activeStory.coverage.length > 0 && (
            <section className="mt-6 pt-5 border-t border-stone-200 mb-8">
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight mb-3">
                Coverage
              </h2>
              <div className="space-y-2">
                {activeStory.coverage.map((c, idx) => (
                  <div key={idx} className="text-[13px] sm:text-sm leading-normal text-stone-700">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 mr-1.5"
                    >
                      {c.outlet}
                    </a>
                    <span className="text-stone-600">{c.framingDescription}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Slim bottom bar reading: "Next: [next headline]" */}
        {nextStory ? (
          <button
            type="button"
            onClick={goToNextStory}
            className="w-full border-t border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors px-4 py-3 flex items-center justify-between text-left shrink-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <span className="text-[13px] font-mono uppercase tracking-wider text-stone-500 shrink-0">
                Next:
              </span>
              <span className="text-[13px] sm:text-sm font-serif font-semibold text-stone-800 truncate">
                {nextStory.headline}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
          </button>
        ) : (
          <div className="w-full border-t border-stone-200 bg-stone-50 px-4 py-3 text-center text-[13px] font-mono text-stone-400 shrink-0">
            End of edition
          </div>
        )}
      </div>

      {/* Index Bottom Sheet */}
      <StoryIndexBottomSheet
        isOpen={showIndexSheet}
        stories={stories}
        currentStoryId={activeStory.id}
        onSelectStory={(id) => {
          const idx = stories.findIndex((s) => s.id === id);
          if (idx !== -1) setCurrentIndex(idx);
          if (onSelectStory) onSelectStory(id);
        }}
        onClose={() => setShowIndexSheet(false)}
      />
    </motion.div>
  );
}

/**
 * Unified Timeline rendering:
 * - Past entries: solid vertical line and solid dots.
 * - Today: accent dot pulsing once.
 * - Future segment: continuous dashed line passing straight through the centre of the hollow dots.
 * - Placed strictly in the left gutter (never crosses any text).
 */
function UnifiedStoryTimeline({
  story: _story,
  timelineNodes,
  upcomingEvents
}: {
  story: Story;
  timelineNodes: TimelineNode[];
  upcomingEvents: UpcomingMilestone[];
}): React.ReactElement {
  const config = getAppConfig();
  const hasUpcoming = upcomingEvents.length > 0;

  // Separate past nodes and today node
  const todayNode = timelineNodes.find((n) => n.isToday) || timelineNodes[timelineNodes.length - 1];
  const pastNodes = timelineNodes.filter((n) => n.id !== todayNode?.id);

  return (
    <div className="mt-6 pb-4">
      {/* Timeline Section Header */}
      <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight mb-4">
        Timeline
      </h2>

      <div className="relative">
        {/* Continuous Solid Line for Past Entries up to Today */}
        <div
          className="absolute left-[11px] top-2 w-[2px] bg-stone-300"
          style={{
            bottom: hasUpcoming ? 'auto' : '16px',
            height: hasUpcoming ? 'calc(100% - 8px)' : undefined
          }}
        />

        {/* PAST ENTRIES */}
        <div className="space-y-6 mb-6">
          {pastNodes.map((n) => (
            <div
              key={n.id}
              id={`timeline-node-${n.id}`}
              className="relative flex items-start scroll-mt-20"
            >
              <div className="absolute left-[12px] top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-stone-600 ring-4 ring-white shadow-xs z-10" />

              <div className="ml-8 w-full">
                <div className="font-mono text-[13px] font-bold text-stone-800 mb-1">
                  {n.dateDisplay}
                </div>
                <p className="text-[13px] sm:text-sm text-stone-700 leading-relaxed mb-1.5">
                  {n.changeDescription}
                </p>

                {n.sources && n.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-stone-500">
                    <span className="text-[13px] font-mono text-stone-400">
                      Reported by:
                    </span>
                    {n.sources.map((src, i) => (
                      <span key={i}>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-stone-800 underline underline-offset-2 hover:text-stone-600"
                          >
                            {src.outlet}
                          </a>
                        ) : (
                          <span className="font-medium text-stone-800">{src.outlet}</span>
                        )}
                        {src.note && <span className="text-stone-400 ml-1">({src.note})</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* TODAY ENTRY */}
        {todayNode && (
          <div
            id={`timeline-node-${todayNode.id}`}
            className="relative flex items-start mb-6 scroll-mt-20"
          >
            <div className="absolute left-[12px] top-1.5 -translate-x-1/2 z-10">
              <span
                className="absolute -inset-0.5 rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: config.accentColorHex }}
              />
              <span
                className="relative block w-4 h-4 rounded-full ring-4 ring-white shadow-xs"
                style={{ backgroundColor: config.accentColorHex }}
              />
            </div>

            <div className="ml-8 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[13px] font-bold text-stone-900">
                  {todayNode.dateDisplay}
                </span>
                <span
                  className="text-[13px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: config.accentColorHex }}
                >
                  Today
                </span>
              </div>

              <p className="text-[13px] sm:text-sm text-stone-900 font-medium leading-relaxed mb-2">
                {todayNode.changeDescription}
              </p>

              {todayNode.sources && todayNode.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-stone-600 mb-2">
                  <span className="text-[13px] font-mono text-stone-400">
                    Sources:
                  </span>
                  {todayNode.sources.map((src, i) => (
                    <span key={i}>
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
                        >
                          {src.outlet}
                        </a>
                      ) : (
                        <span className="font-medium text-stone-900">{src.outlet}</span>
                      )}
                      {src.note && <span className="text-stone-400 ml-1">({src.note})</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WHAT'S NEXT & FUTURE SEGMENT */}
        {hasUpcoming ? (
          <div className="relative pt-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight mb-4 ml-8">
              What&apos;s next
            </h2>

            <div className="absolute left-[11px] top-12 bottom-3 w-[2px] border-l-2 border-dashed border-stone-400" />

            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="relative flex items-start">
                  <div
                    className="absolute left-[12px] top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white ring-4 ring-white z-10"
                    style={{ borderColor: config.accentColorHex }}
                  />

                  <div className="ml-8 w-full">
                    {event.dateLabel && (
                      <div
                        className="font-mono text-[13px] font-bold mb-1"
                        style={{ color: config.accentColorHex }}
                      >
                        {event.dateLabel}
                      </div>
                    )}
                    <p className="text-[13px] sm:text-sm text-stone-800 leading-relaxed">
                      {event.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative flex items-start pt-3">
            <div className="absolute left-[11px] top-0 h-6 w-[2px] border-l-2 border-dashed border-stone-300" />
            <div className="ml-8 text-[13px] font-mono text-stone-400 italic pt-2">
              No dates announced yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
