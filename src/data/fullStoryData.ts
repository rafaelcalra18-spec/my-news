/**
 * @file src/data/fullStoryData.ts
 * @description Verified Full Story reporting texts and sources for "My news".
 *
 * Implements strict adherence to user-provided editorial text:
 * - Stories 1 through 11 contain verified background reporting and source attribution links.
 * - Stories 12 and 13 explicitly omit the Full story section.
 * - Does not repeat any timeline entry word for word.
 *
 * USE CASES:
 * - Rendered in StoryDetailView under the "Full story" heading immediately following "What changed".
 */

import { logFunctionCall } from '../utils/logger.ts';

export interface FullStorySource {
  outlet: string;
  url: string;
}

export interface FullStoryRecord {
  storyId: string;
  text: string;
  sources: FullStorySource[];
}

/**
 * Strict canonical repository of full story texts and source links.
 */
export const FULL_STORY_DATA: Record<string, FullStoryRecord> = {
  // Story 1: Iran
  'story-1-iran-qatar': {
    storyId: 'story-1-iran-qatar',
    text: "The US is blockading Iranian ports. According to Iran's Tasnim agency, Iran wants the blockade lifted, sanctions eased and its frozen assets released before it agrees to a ceasefire. Vice President Vance wrote to the Iranian official Mohsen Rezaei seeking to restart talks, though Trump says the outreach is only about medical supplies. US Central Command says it has been clearing mines in the strait, and the Revolutionary Guard has challenged it to prove that. CBS reports that US officials have told Gulf allies to prepare for a short, intense campaign.",
    sources: [
      {
        outlet: 'CBS News',
        url: 'https://www.cbsnews.com/live-updates/iran-war-donald-trump-qatar-mediators-new-proposal-end-war/'
      }
    ]
  },

  // Story 2: Spain
  'story-2-spain-train-crash': {
    storyId: 'story-2-spain-train-crash',
    text: 'The Renfe train was carrying 397 passengers and the Iryo train 146. A computer failure had stopped several trains on the line before the collision, and controllers then let them move again without speed limits. The Interior Ministry first put the toll at 74, before the presidency and the Transport Ministry revised it to 69. The railway accident investigation commission has opened an inquiry and has not reached a conclusion.',
    sources: [
      {
        outlet: 'ABC News',
        url: 'https://abcnews.com/International/10-killed-train-collision-high-speed-line-spain/story?id=137633323'
      },
      {
        outlet: 'El Demócrata',
        url: 'https://www.democrata.es/en/current-events/the-number-of-fatalities-in-the-urda-railway-accident-rises-to-74-according-to-the-investigation-commission/'
      }
    ]
  },

  // Story 3: Budget
  'story-3-uk-healey': {
    storyId: 'story-3-uk-healey',
    text: 'Healey replaced Rachel Reeves as Chancellor when Andy Burnham became Prime Minister in July. The Budget kept the cash ISA limit at £20,000, extended the 5p fuel duty cut and the cut to VAT on electricity until July, and set defence spending at 3% of GDP by 2030. The Office for Budget Responsibility raised its growth forecast for this year to 1.2%. More than 100 Labour MPs opposed cuts to disability benefits last year.',
    sources: [
      {
        outlet: 'LBC',
        url: 'https://www.lbc.co.uk/article/what-in-budget-2026-john-healey-5HjdkZM_2/'
      },
      {
        outlet: 'The Telegraph',
        url: 'https://www.aol.com/articles/healey-rules-crude-cuts-welfare-095610000.html'
      }
    ]
  },

  // Story 4: Mahmood
  'story-4-uk-mahmood': {
    storyId: 'story-4-uk-mahmood',
    text: 'The plan would double the qualifying period for indefinite leave to remain from five years to ten, with some lower-paid migrants facing fifteen. The consultation drew 200,000 responses. Angela Rayner called the change for people already in the UK un-British, and more than 100 Labour MPs signed a letter asking the government to think again. The Conservatives say Mahmood has given in to pressure, and the Home Office says it will not comment until the decision goes to Parliament.',
    sources: [
      {
        outlet: 'Eastern Eye',
        url: 'https://easterneye.biz/indefinite-leave-to-remain-shabana-mahmood-immigration-social-care-workers'
      },
      {
        outlet: 'The Independent',
        url: 'https://www.aol.com/news/labour-mps-threatening-vote-mahmood-092749881.html'
      }
    ]
  },

  // Story 5: US Midterms
  'story-5-us-midterms-polls': {
    storyId: 'story-5-us-midterms-polls',
    text: "Texas had 6.3 million early votes by Wednesday, against 4.2 million at the same point in 2022, and Georgia passed 2.5 million. The RealClearPolling average gives Democrats an 8.2-point lead on the congressional ballot. In the PBS News, NPR and Marist poll, 59% of likely voters disapproved of Trump. Kyle Kondik of Sabato's Crystal Ball says the Senate is much harder to call than the House, with seven toss-up races.",
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/us-midterms-3-days-to-go-what-latest-polls-say-as-early-voting-surges'
      },
      {
        outlet: 'PBS NewsHour',
        url: 'https://www.pbs.org/newshour/politics/poll-likely-voters-favor-democrats-as-trump-disapproval-drives-early-turnout'
      }
    ]
  },

  // Story 6: Israel
  'story-6-israel-election': {
    storyId: 'story-6-israel-election',
    text: "Likud is still the largest party with 27 seats, followed by Yashar with 21 and B'Yachad with 12. Netanyahu's bloc fell from 68 seats in the outgoing Knesset to 53. The Arab parties would give Netanyahu's opponents a majority, but every Zionist party except The Democrats has ruled out working with them. Coalition talks could take more than two months.",
    sources: [
      {
        outlet: 'The Times of Israel',
        url: 'https://www.timesofisrael.com/with-all-votes-counted-netanyahus-bloc-at-53-seats-eisenkots-48-arab-parties-19/'
      }
    ]
  },

  // Story 7: Poland
  'story-7-poland-court': {
    storyId: 'story-7-poland-court',
    text: 'Justice Minister Waldemar Żurek has asked for the immunity of Święczkowski and his deputy to be lifted. Anna Korwin-Piotrowska, one of the judges parliament chose, has been put in charge of the tribunal. President Nawrocki has refused to swear in three of the six judges nominated by parliament. Prime Minister Donald Tusk says restoring the rule of law requires decisive action, while the opposition Law and Justice party calls the suspension an attack on the constitutional order.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/30/polish-police-deployed-to-top-court-after-head-judge-suspended'
      },
      {
        outlet: 'Euronews',
        url: 'https://www.euronews.com/2026/10/30/polish-president-turns-back-mid-flight-amid-coup-detat-allegations'
      }
    ]
  },

  // Story 8: Patriot sale
  'story-8-patriot-ukraine': {
    storyId: 'story-8-patriot-ukraine',
    text: 'The missiles have not been built yet. Lockheed Martin is the main contractor and has said it will triple its PAC-3 production capacity by the end of 2030. President Zelenskyy said on Monday that Kyiv had waited almost a month for Washington to approve the supplies, as Russia steps up missile attacks on energy and civilian infrastructure.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/us-greenlights-2-1bn-patriot-missile-sale-to-ukraine'
      }
    ]
  },

  // Story 9: EU and Canada
  'story-9-canada-eu-trade': {
    storyId: 'story-9-canada-eu-trade',
    text: 'The two sides also agreed that the European Investment Bank will invest in Canadian critical minerals, and that they will work together on AI safety and security. Carney says the partnership will stop well short of full membership. Canada is in a trade dispute with the United States, and talks on a deal are under way.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/30/eu-and-canada-seek-deeper-ties-amid-worsening-global-uncertainty'
      }
    ]
  },

  // Story 10: Ebola
  'story-10-ebola-congo': {
    storyId: 'story-10-ebola-congo',
    text: 'The virus has reached eight of the country\'s 26 provinces. Al Jazeera reports that late detection and stretched health services let it spread faster than in past outbreaks.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com'
      }
    ]
  },

  // Story 11: F1
  'story-11-f1-antonelli': {
    storyId: 'story-11-f1-antonelli',
    text: "Leclerc's best lap in second practice was 1:17.827, just over a tenth ahead of Lando Norris and George Russell. Antonelli was fourth in that session after missing Thursday's media day with a viral illness. If he wins the title on Sunday, he becomes the youngest world champion in Formula 1 history. The race is 71 laps of the 4.304 km circuit.",
    sources: [
      {
        outlet: 'Sky Sports',
        url: 'https://skysports.com/f1/news/13605831/mexico-city-gp-charles-leclerc-completes-friday-practice-double-as-ferrari-team-mate-lewis-hamilton-suffers-technical-failure'
      },
      {
        outlet: 'Grande Premio',
        url: 'https://www.grandepremio.com.br/f1/noticias/charles-leclerc-lidera-segundo-treino-livre-gp-da-cidade-do-mexico-f1/'
      }
    ]
  }
  // Stories 12 and 13: explicitly omitted per requirements
};

/**
 * Retrieves the full story record for a given story ID.
 *
 * @param {string} storyId Unique story identifier.
 * @returns {FullStoryRecord | null} The full story record or null if omitted.
 */
export function getFullStoryForStory(storyId: string): FullStoryRecord | null {
  logFunctionCall('getFullStoryForStory', { storyId });
  return FULL_STORY_DATA[storyId] || null;
}
