/**
 * @file src/config/appConfig.ts
 * @description Centralized Configuration for "My news".
 *
 * This configuration serves as the single source of truth for:
 * 1. Visual constants:
 *    - Strict single accent colour (`#c05621` warm rust/terracotta) used ONLY for the Updated tag,
 *      the change line, and today's point on the timeline.
 *    - Clean, wordless flat section emblems readable at 48x48 px (UK, World, Elections, Energy, Health, F1, Robotics).
 * 2. Editorial date:
 *    - Fixed publication date: Saturday 31 October 2026.
 * 3. AI Model identifiers:
 *    - `gemini-3.8-flash` for onboarding analysis and factual relevance generation.
 * 4. Reader persona seeds:
 *    - Default topics: 'F1', 'Robotics', 'Engineering', 'London'.
 *
 * USE CASES:
 * - Centralizing all customizable application flags in one modular location.
 * - Supplying static image asset paths created via Nano Banana 2.
 */

import appIcon from '../assets/images/app_icon_1793452208962.jpg';
import setupIllustration from '../assets/images/setup_illustration_1793452208205.jpg';
import sectionUk from '../assets/images/section_uk_simple_1793453897208.jpg';
import sectionWorld from '../assets/images/section_world_simple_1793453896945.jpg';
import sectionElections from '../assets/images/section_elections_simple_1793453912848.jpg';
import sectionEnergy from '../assets/images/section_energy_simple_1793453912940.jpg';
import sectionHealth from '../assets/images/section_health_simple_1793453928713.jpg';
import sectionF1 from '../assets/images/section_f1_simple_1793453929664.jpg';
import sectionRobotics from '../assets/images/section_robotics_simple_1793453943906.jpg';

export interface AppConfig {
  appName: string;
  editionDate: string;
  formattedDate: string;
  geminiModel: string;
  accentColor: string;
  accentColorHex: string;
  images: {
    appIcon: string;
    setupIllustration: string;
    sections: Record<string, string>;
  };
  apiEndpoints: {
    setupAnalyze: string;
    setupRefine: string;
    relevance: string;
    markets: string;
  };
  defaultPersona: {
    inputSentence: string;
    situation: string;
    initialTopics: string[];
  };
}

export const APP_CONFIG: AppConfig = {
  appName: 'My news',
  editionDate: '2026-10-31',
  formattedDate: 'Saturday 31 October 2026',
  geminiModel: 'gemini-3.8-flash',
  accentColor: '#c05621', // Terracotta / warm rust accent
  accentColorHex: '#c05621',
  images: {
    appIcon,
    setupIllustration,
    sections: {
      UK: sectionUk,
      World: sectionWorld,
      Elections: sectionElections,
      Energy: sectionEnergy,
      Health: sectionHealth,
      F1: sectionF1,
      Robotics: sectionRobotics
    }
  },
  apiEndpoints: {
    setupAnalyze: '/api/setup/analyze',
    setupRefine: '/api/setup/refine',
    relevance: '/api/gemini/relevance',
    markets: '/api/markets'
  },
  defaultPersona: {
    inputSentence: 'I study engineering in London and I follow F1 and robotics.',
    situation: 'Engineering student in London following F1 and robotics',
    initialTopics: ['F1', 'Robotics', 'Engineering', 'London']
  }
};

/**
 * Returns the centralized application configuration.
 *
 * @returns {AppConfig} The global configuration object.
 */
export function getAppConfig(): AppConfig {
  return APP_CONFIG;
}
