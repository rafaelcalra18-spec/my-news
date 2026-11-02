/**
 * @file src/App.tsx
 * @description Master Application Container for "My news".
 *
 * Implements User Requirements 1, 2, 3:
 * 1. "Navigation: remove the bottom bar and the Markets tab. Put a topics icon in the header, top right, that opens the Topics screen. Add 'Markets' as the last item in the section bar. It shows only stories that have a market, sorted by the size of the market's move over seven days."
 * 2. "Cards: show only the section and status tag, the headline, the 'Day N · X updates · Next' line, the 'What changed' line and, if the story has one, the market block. Move the summary, coverage and like and dislike buttons into the story view. The whole card is one button: add a chevron at the right of the headline, and show a pressed state (scale to 0.98) when tapped. Remove the 'Tap card to view timeline' text."
 * 3. "Market data: fetch prices and history through the app's own server, with a route such as /api/markets, never from the browser. Cache the results for five minutes. Show only numbers the APIs return."
 * 4. Strictly phone-first 390 px mobile, max 640 px desktop.
 * 5. Single scrollbar throughout.
 *
 * USE CASES:
 * - Daily news reading, prediction market tracking, and personalized feed customization.
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header.tsx';
import { DailyEdition } from './components/DailyEdition.tsx';
import { StoryDetailView } from './components/StoryDetailView.tsx';
import { TopicsScreen } from './components/TopicsScreen.tsx';
import { DailyEditionData, ReaderProfile, StoryMarketData } from './types/news.ts';
import { getDailyEditionData } from './data/backfillData.ts';
import { getAppConfig } from './config/appConfig.ts';
import { logFunctionCall } from './utils/logger.ts';

export default function App(): React.ReactElement {
  const config = getAppConfig();

  // Screen state: toggles Topics screen from top-right header icon
  const [showTopics, setShowTopics] = useState<boolean>(false);

  // Daily edition data populated strictly from seed data
  const [editionData, setEditionData] = useState<DailyEditionData>(getDailyEditionData());

  // Active Story ID for fullscreen Story View (null when closed)
  const [openedStoryId, setOpenedStoryId] = useState<string | null>(null);

  // Reader Profile State initialized with the canonical Sam London persona
  const [profile, setProfile] = useState<ReaderProfile>({
    setupSentence: config.defaultPersona.inputSentence,
    situation: config.defaultPersona.situation,
    topics: config.defaultPersona.initialTopics,
    likedStoryIds: [],
    dislikedStoryIds: []
  });

  /**
   * Fetches market data through the server route /api/markets on load.
   * Cached for 5 minutes server-side.
   */
  useEffect(() => {
    async function loadLiveMarkets(): Promise<void> {
      try {
        logFunctionCall('App:fetchMarkets', {});
        const res = await fetch(config.apiEndpoints.markets);
        if (res.ok) {
          const marketMap: Record<string, StoryMarketData[]> = await res.json();
          setEditionData((prev) => ({
            ...prev,
            stories: prev.stories.map((story) => {
              const storyMarkets = marketMap[story.id];
              if (storyMarkets && storyMarkets.length > 0) {
                return {
                  ...story,
                  market: storyMarkets[0],
                  markets: storyMarkets
                };
              }
              return story;
            })
          }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Could not refresh markets via server, fallback prices active:', err);
      }
    }
    loadLiveMarkets();
  }, [config.apiEndpoints.markets]);

  /**
   * Updates reader profile state and requests strictly factual relevance updates from Gemini.
   *
   * @param {Partial<ReaderProfile>} updated Updates to merge into profile.
   */
  const handleUpdateProfile = async (updated: Partial<ReaderProfile>): Promise<void> => {
    logFunctionCall('App:handleUpdateProfile', { updated });
    const nextProfile = { ...profile, ...updated };
    setProfile(nextProfile);

    // If situation changed, update "Why it matters to you" strictly based on story facts
    if (updated.situation) {
      try {
        const updatePromises = editionData.stories.map(async (story) => {
          const res = await fetch(config.apiEndpoints.relevance, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyFacts: `${story.headline}. ${story.summary} ${story.changeSummary || ''}`,
              readerSituation: updated.situation
            })
          });
          if (res.ok) {
            const data = await res.json();
            return {
              ...story,
              whyItMattersToYou: data.whyItMattersToYou
            };
          }
          return story;
        });

        const newStories = await Promise.all(updatePromises);
        setEditionData((prev) => ({
          ...prev,
          stories: newStories
        }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to update story relevance:', err);
      }
    }
  };

  /**
   * Handles reader liking a story, toggling its like state.
   *
   * @param {string} storyId Unique story identifier.
   */
  const handleLikeStory = (storyId: string): void => {
    logFunctionCall('App:handleLikeStory', { storyId });
    setEditionData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id === storyId) {
          const nextLiked = !s.isLiked;
          return {
            ...s,
            isLiked: nextLiked,
            isDisliked: false,
            likesCount: nextLiked ? s.likesCount + 1 : Math.max(0, s.likesCount - 1)
          };
        }
        return s;
      })
    }));
  };

  /**
   * Handles reader disliking a story, toggling its disliked state.
   *
   * @param {string} storyId Unique story identifier.
   */
  const handleDislikeStory = (storyId: string): void => {
    logFunctionCall('App:handleDislikeStory', { storyId });
    setEditionData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id === storyId) {
          return {
            ...s,
            isDisliked: !s.isDisliked,
            isLiked: false,
            likesCount: s.isLiked ? Math.max(0, s.likesCount - 1) : s.likesCount
          };
        }
        return s;
      })
    }));
  };

  /**
   * Opens the story view directly at the chosen story.
   *
   * @param {string} storyId Target story identifier.
   */
  const handleOpenStory = (storyId: string): void => {
    logFunctionCall('App:handleOpenStory', { storyId });
    setOpenedStoryId(storyId);
  };

  /**
   * Closes the fullscreen Story View and resets to main feed.
   */
  const handleCloseStory = (): void => {
    logFunctionCall('App:handleCloseStory', {});
    setOpenedStoryId(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-stone-300">
      {/* Centered phone-first column (390 px mobile, max 640 px desktop) */}
      <div className="w-full max-w-[640px] mx-auto min-h-screen flex flex-col bg-stone-50 border-x border-stone-200 relative shadow-sm">
        {/* One-Line Header with Topics Icon Button at Top Right */}
        <Header onOpenTopics={() => setShowTopics((prev) => !prev)} />

        {/* Main Content Area */}
        <div className="flex-1">
          {showTopics ? (
            <TopicsScreen
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onClose={() => setShowTopics(false)}
            />
          ) : (
            <DailyEdition
              stories={editionData.stories}
              readerTopics={profile.topics}
              onOpenStory={handleOpenStory}
            />
          )}
        </div>

        {/* Expanded Story View with Single-Page Scrolling and Shared Layout Animation */}
        <AnimatePresence>
          {openedStoryId && (
            <StoryDetailView
              stories={editionData.stories}
              initialStoryId={openedStoryId}
              onClose={handleCloseStory}
              onLike={handleLikeStory}
              onDislike={handleDislikeStory}
              onSelectStory={(id) => setOpenedStoryId(id)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
