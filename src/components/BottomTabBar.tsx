/**
 * @file src/components/BottomTabBar.tsx
 * @description Fixed Bottom Tab Navigation Bar for "My news".
 *
 * Implements User Requirement 5:
 * - "Replace the Timeline tab with a Markets tab. The bottom bar becomes Today, Markets, Topics."
 * - Phone-first ergonomic navigation anchored to the bottom.
 * - Centered layout constrained to 640 px max width on desktop and 390 px on mobile.
 * - Strictly no text smaller than 13 px.
 *
 * USE CASES:
 * - Switching between Today (Daily Briefing), Markets (Expectations), and Topics (Reader Profile).
 */

import React from 'react';
import { Newspaper, TrendingUp, Sliders } from 'lucide-react';
import { logFunctionCall } from '../utils/logger.ts';

export type ScreenTab = 'today' | 'markets' | 'topics';

interface BottomTabBarProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps): React.ReactElement {
  logFunctionCall('BottomTabBar:render', { activeTab });

  const tabs: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Newspaper },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'topics', label: 'Topics', icon: Sliders }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-50 border-t border-stone-200 shadow-sm"
    >
      <div className="max-w-[640px] mx-auto flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                logFunctionCall('BottomTabBar:select', { selected: tab.id });
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              <span className="text-[13px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
