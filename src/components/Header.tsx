/**
 * @file src/components/Header.tsx
 * @description One-Line Compact Header for "My news" with Topics Screen Icon.
 *
 * Implements User Requirement 1:
 * - "Navigation: remove the bottom bar and the Markets tab. Put a topics icon in the header, top right, that opens the Topics screen."
 * - One line with app name, icon, date, and topics button.
 * - Minimal, uncluttered header adhering to phone-first 390 px design.
 *
 * USE CASES:
 * - Persistent top branding and direct access to the Topics personalization screen.
 */

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface HeaderProps {
  onOpenTopics?: () => void;
}

/**
 * Renders the top one-line navigation header with date and Topics button.
 *
 * @param {HeaderProps} props Component props.
 * @returns {React.ReactElement} Header element.
 */
export function Header({ onOpenTopics }: HeaderProps): React.ReactElement {
  const config = getAppConfig();
  logFunctionCall('Header:render', { appName: config.appName, date: config.formattedDate });

  return (
    <header className="sticky top-0 z-30 bg-stone-50 border-b border-stone-200 px-4 h-12 flex items-center justify-between select-none">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={config.images.appIcon}
          alt="My news icon"
          className="w-6 h-6 rounded object-cover shrink-0 border border-stone-300"
        />
        <h1 className="font-serif font-bold text-base tracking-tight text-stone-900 truncate">
          {config.appName}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 pl-2">
        <div className="text-[13px] font-mono text-stone-600 whitespace-nowrap">
          {config.formattedDate}
        </div>

        {onOpenTopics && (
          <button
            type="button"
            onClick={() => {
              logFunctionCall('Header:clickTopics', {});
              onOpenTopics();
            }}
            aria-label="Personalize Topics"
            className="p-1.5 -mr-1 rounded-md text-stone-700 hover:text-stone-950 hover:bg-stone-200/80 transition-colors cursor-pointer"
            title="Personalize topics"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
