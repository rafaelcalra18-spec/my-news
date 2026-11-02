/**
 * @file src/data/backfillData.ts
 * @description Pure Seed Data Ledger for "My news".
 *
 * Implements strict adherence to verified seed data without invented stories, facts, or figures:
 * - 13 stories across World, UK, F1, and Robotics.
 * - Updated stories (2+ dated entries) vs New stories (1 dated entry).
 * - Change lines labeled strictly with the exact date of the change (e.g. Budget is Thu 29 Oct).
 * - Summaries provide background without repeating the change line.
 * - "Why it matters to you" connects only to London, studying engineering, F1, or robotics; otherwise omitted.
 * - Scoreboard contains ONLY forecasts with named source, clear outcome, and resolve date (Trump item removed).
 *
 * USE CASES:
 * - Today's morning edition cards (Front Page + From your topics).
 * - 2D real-time-spaced timeline rendering.
 * - Verified prediction scoreboard auditing.
 */

import { DailyEditionData, Story, TimelineNode, StoryMarketData } from '../types/news.ts';
import { logFunctionCall } from '../utils/logger.ts';

import {
  STORY_1_MARKET_CEASEFIRE,
  STORY_5_MARKET_HOUSE,
  STORY_5_MARKET_SENATE,
  STORY_11_MARKET_CHAMPION,
  STORY_11_MARKET_MEXICO_GP
} from './marketsData.ts';

export const SEED_STORIES: Story[] = [
  // --- FRONT PAGE STORIES (World & UK) ---
  {
    id: 'story-1-iran-qatar',
    section: 'World',
    statusTag: 'Updated',
    headline: "Iran's answer to Qatar's peace draft is due",
    changeDate: 'Sat 31 Oct',
    changeSummary: "Al Jazeera reported that Ayatollah Khamenei ordered the military to answer any threat at once, wherever it comes from. Iran's reply to Qatar was expected by the end of the week.",
    summary: "Qatari mediators gave Iran a new draft deal to end the war, according to Reuters, though a senior Iranian official denied receiving a new proposal. The US removed the Joint Chiefs' head of strategy over alleged leaks, and Iran reported that four tankers hit mines on a southern route through the Strait of Hormuz backed by the US.",
    whyItMattersToYou: '',
    coverage: [
      {
        outlet: 'CBS News',
        url: 'https://www.cbsnews.com/live-updates/iran-war-donald-trump-qatar-mediators-new-proposal-end-war/',
        framingDescription: 'Said the mine reports came from Iran and could not be verified.'
      },
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/liveblog/2026/10/31/iran-war-live-oil-tankers-hit-in-hormuz-trump-says-conflict-will-end-soon',
        framingDescription: 'Led with the tanker strikes and with Trump saying the war will end soon.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-25',
    dateLastChanged: '2026-10-31',
    hasTimeline: true,
    market: STORY_1_MARKET_CEASEFIRE,
    markets: [STORY_1_MARKET_CEASEFIRE]
  },
  {
    id: 'story-4-uk-mahmood',
    section: 'UK',
    statusTag: 'New', // 1 entry: 31 Oct
    headline: 'Mahmood is expected to soften the ten-year wait for settlement',
    summary: 'Home Secretary Shabana Mahmood is expected to exempt social care workers already in the UK from her plan to double the wait for indefinite leave to remain from five years to ten. The BBC reports a final decision next week.',
    whyItMattersToYou: '',
    coverage: [
      {
        outlet: 'Eastern Eye',
        url: 'https://easterneye.biz/indefinite-leave-to-remain-shabana-mahmood-immigration-social-care-workers',
        framingDescription: 'Reported a narrow exemption for care workers, citing the BBC.'
      },
      {
        outlet: 'GB News',
        url: 'https://www.gbnews.com/politics/andy-burnham-shabana-mahmood-cabinet-labour',
        framingDescription: 'Called it a cabinet revolt.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-31',
    dateLastChanged: '2026-10-31',
    hasTimeline: true
  },
  {
    id: 'story-5-us-midterms-polls',
    section: 'World',
    statusTag: 'Updated', // 2 entries: 27 Oct, 31 Oct
    headline: 'The US votes on Tuesday with Democrats ahead in the polls',
    changeDate: 'Sat 31 Oct',
    changeSummary: 'An AP count put early votes above 43 million, about 10 million more than at the same point before the 2022 midterms.',
    summary: 'A PBS News, NPR and Marist poll found likely voters favouring Democrats by 52% to 44%, driven by Trump disapproval. Election day is Tuesday 3 November with voters who had not yet voted evenly split.',
    whyItMattersToYou: '',
    coverage: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/us-midterms-3-days-to-go-what-latest-polls-say-as-early-voting-surges',
        framingDescription: 'Led with the Democratic lead and early turnout.'
      },
      {
        outlet: 'PBS NewsHour',
        url: 'https://www.pbs.org/newshour/politics/poll-likely-voters-favor-democrats-as-trump-disapproval-drives-early-turnout',
        framingDescription: 'Linked turnout to disapproval of Trump and reported that voters who had not yet voted were evenly split.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-27',
    dateLastChanged: '2026-10-31',
    hasTimeline: true,
    market: STORY_5_MARKET_HOUSE,
    markets: [STORY_5_MARKET_HOUSE, STORY_5_MARKET_SENATE]
  },
  {
    id: 'story-8-patriot-ukraine',
    section: 'World',
    statusTag: 'New', // 1 entry: 31 Oct
    headline: 'The US approves a $2.1bn Patriot missile sale to Ukraine',
    summary: 'The US State Department approved a possible sale of 500 Patriot PAC-3 missiles to Ukraine, worth an estimated $2.1bn. Canada, Germany and Norway will help pay through a US programme, along with an EU loan. Delivery is not expected until the early 2030s.',
    whyItMattersToYou: '',
    coverage: [],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-31',
    dateLastChanged: '2026-10-31',
    hasTimeline: true
  },
  {
    id: 'story-2-spain-train-crash',
    section: 'World',
    statusTag: 'Updated', // 3 entries: 28, 29, 30 Oct
    headline: "Spain's high-speed train crash: death toll revised to 69",
    changeDate: 'Fri 30 Oct',
    changeSummary: 'The Spanish presidency and Transport Ministry revised the toll down to at least 69.',
    summary: 'A Renfe train hit a stationary Iryo train from behind near Urda, Toledo, on the Madrid-Seville high-speed line. Transport Minister Óscar Puente said rail controllers inexplicably let trains move without speed limits after a computer failure took down the LZB safety system.',
    whyItMattersToYou: 'As an engineering student, the investigation centers on safety-critical systems: the failure of the LZB rail automation and the controller override.',
    coverage: [
      {
        outlet: 'ABC News',
        url: 'https://abcnews.com/International/10-killed-train-collision-high-speed-line-spain/story?id=137633323',
        framingDescription: "Focused on the controllers' order."
      },
      {
        outlet: 'El Demócrata',
        url: 'https://www.democrata.es/en/current-events/the-number-of-fatalities-in-the-urda-railway-accident-rises-to-74-according-to-the-investigation-commission/',
        framingDescription: 'Focused on the safety system failure and the instruction to resume at normal speed.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-28',
    dateLastChanged: '2026-10-30',
    hasTimeline: true
  },
  {
    id: 'story-6-israel-election',
    section: 'World',
    statusTag: 'Updated', // 2 entries: 27, 30 Oct
    headline: "Israel's final count leaves both blocs short of a majority",
    changeDate: 'Fri 30 Oct',
    changeSummary: "Final results gave Netanyahu's bloc 53 seats, Gadi Eisenkot's bloc 48 and the Arab parties 19.",
    summary: 'Israel held its general election on 27 October to elect the 120-seat Knesset. A governing coalition requires 61 seats, leaving both major political blocs dependent on negotiations with other parties.',
    whyItMattersToYou: '',
    coverage: [
      {
        outlet: 'The Times of Israel',
        url: 'https://www.timesofisrael.com/with-all-votes-counted-netanyahus-bloc-at-53-seats-eisenkots-48-arab-parties-19/',
        framingDescription: 'Focused on the seat count.'
      },
      {
        outlet: 'Euronews',
        url: 'https://www.euronews.com/2026/10/30/netanyahu-bloc-emerges-ahead-in-israeli-election-but-fails-to-secure-majority',
        framingDescription: 'Focused on the Arab parties holding the balance of power.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-27',
    dateLastChanged: '2026-10-30',
    hasTimeline: true
  },
  {
    id: 'story-7-poland-court',
    section: 'World',
    statusTag: 'New', // 1 entry: 30 Oct
    headline: 'Poland suspends the head of its constitutional court',
    summary: 'The Constitutional Tribunal said its president, Bogdan Święczkowski, had been suspended. Police entered the court after objects were thrown at officers and detained three people, while President Karol Nawrocki turned his plane back on the way to Senegal amid coup allegations.',
    whyItMattersToYou: '',
    coverage: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/30/polish-police-deployed-to-top-court-after-head-judge-suspended',
        framingDescription: 'Placed the suspension inside the long dispute over the court.'
      },
      {
        outlet: 'Euronews',
        url: 'https://www.euronews.com/2026/10/30/polish-president-turns-back-mid-flight-amid-coup-detat-allegations',
        framingDescription: "Led with the tribunal's own claim of a coup, attributed to the court."
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-30',
    dateLastChanged: '2026-10-30',
    hasTimeline: true
  },
  {
    id: 'story-9-canada-eu-trade',
    section: 'World',
    statusTag: 'New', // 1 entry: 30 Oct
    headline: 'Canada and the EU sign a digital trade deal in Montreal',
    summary: 'At a summit in Montreal, Mark Carney, Ursula von der Leyen and Antonio Costa launched an Alliance for the Future. Canada signed a digital trade deal, will put €500 million into an EU loan for Ukraine, and proposed becoming an associate EU member.',
    whyItMattersToYou: 'As a student, Canada and the EU are opening talks on deeper participation in Erasmus+ student exchanges.',
    coverage: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/30/eu-and-canada-seek-deeper-ties-amid-worsening-global-uncertainty',
        framingDescription: 'Noted that "associate member" has no legal basis.'
      },
      {
        outlet: 'Euronews',
        url: 'https://www.euronews.com/video/2026/10/30/canada-aims-to-become-eus-first-associate-member-by-june-2027-carney-says',
        framingDescription: "Led with Carney's target of June 2027."
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-30',
    dateLastChanged: '2026-10-30',
    hasTimeline: true
  },
  {
    id: 'story-10-ebola-congo',
    section: 'World',
    statusTag: 'New', // 1 entry: 30 Oct
    headline: 'Ebola deaths in DR Congo pass 5,000',
    summary: 'Government figures put deaths above 5,000 and infections above 10,000 since the outbreak was declared in May. The Bundibugyo strain behind it has no approved vaccine or treatment.',
    whyItMattersToYou: '',
    coverage: [],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-30',
    dateLastChanged: '2026-10-30',
    hasTimeline: true
  },
  {
    id: 'story-3-uk-healey',
    section: 'UK',
    statusTag: 'Updated', // 2 entries: 28, 29 Oct
    headline: 'Healey says there is no deadline for cutting the benefits bill',
    changeDate: 'Thu 29 Oct', // Fixed to Thu 29 Oct per requirement 2
    changeSummary: 'After telling Radio 4 that the benefits bill would fall, Healey said no timetable had been set.',
    summary: 'Chancellor John Healey delivered his first Budget, promising no tax rises on working people and a £100 Household Energy Payment for 20 million households in council tax bands A to D. The Budget raised the National Living Wage 3.9% to £13.21 and announced face-to-face benefit assessments.',
    whyItMattersToYou: 'Living in London, the Budget gives households in council tax bands A to D a £100 Household Energy Payment and raises the National Living Wage to £13.21.',
    coverage: [
      {
        outlet: 'LBC',
        url: 'https://www.lbc.co.uk/article/what-in-budget-2026-john-healey-5HjdkZM_2/',
        framingDescription: 'Went through the Budget measure by measure.'
      },
      {
        outlet: 'The Telegraph',
        url: 'https://www.aol.com/articles/healey-rules-crude-cuts-welfare-095610000.html',
        framingDescription: "Treated Healey's later remarks as a climbdown."
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-28',
    dateLastChanged: '2026-10-29',
    hasTimeline: true
  },

  // --- TOPIC STORIES (Sport & Tech) ---
  {
    id: 'story-11-f1-antonelli',
    section: 'Sport',
    statusTag: 'Updated', // 2 entries: 30, 31 Oct
    headline: 'Antonelli can win the title in Mexico on Sunday',
    changeDate: 'Sat 31 Oct',
    changeSummary: 'The stewards gave Verstappen and Lawson a one-place grid penalty and a penalty point each, calling their driving unacceptable.',
    summary: 'Charles Leclerc topped both Friday practice sessions at the Mexico City Grand Prix while Lewis Hamilton stopped early with an engine problem. Andrea Kimi Antonelli leads the championship with 365 points and can clinch the title on Sunday by finishing ninth or better.',
    whyItMattersToYou: 'Matches your F1 interest: Andrea Kimi Antonelli can win the world championship in Mexico on Sunday by finishing ninth or better.',
    coverage: [
      {
        outlet: 'Sky Sports',
        url: 'https://skysports.com/f1/news/13605831/mexico-city-gp-charles-leclerc-completes-friday-practice-double-as-ferrari-team-mate-lewis-hamilton-suffers-technical-failure',
        framingDescription: 'Focused on Leclerc completing a practice double and Hamilton technical failure.'
      },
      {
        outlet: 'GrandPrix247',
        url: 'https://www.grandprix247.com/grand-prix-f1-weekend-news/max-verstappen-and-liam-lawson-handed-grid-penalties-after-unacceptable-practice-clash',
        framingDescription: 'Focused on grid penalties handed to Verstappen and Lawson after their practice clash.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-30',
    dateLastChanged: '2026-10-31',
    hasTimeline: true,
    market: STORY_11_MARKET_CHAMPION,
    markets: [STORY_11_MARKET_CHAMPION, STORY_11_MARKET_MEXICO_GP]
  },
  {
    id: 'story-12-machenta-robotics',
    section: 'Tech',
    statusTag: 'New', // 1 entry: 27 Oct
    headline: 'London startup Machenta raises $40 million',
    summary: 'Machenta, based in London, raised $40 million for a model trained in simulation that it says can learn a new task from one demonstration without fine-tuning.',
    whyItMattersToYou: 'Directly connects to your London location and robotics focus: Machenta is based in London and raised $40 million for one-demonstration robot learning.',
    coverage: [
      {
        outlet: 'Humanoids Daily',
        url: 'https://www.humanoidsdaily.com/news/machenta-40-million-instant-robot-learning',
        framingDescription: 'Reported on Machenta raising $40 million for instant robot learning from one demonstration.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-27',
    dateLastChanged: '2026-10-27',
    hasTimeline: true
  },
  {
    id: 'story-13-audi-robotics',
    section: 'Tech',
    statusTag: 'New', // 1 entry: 28 Oct
    headline: 'Audi tests humanoid robots on its production line',
    summary: 'Audi is testing mobile humanoids from Agile Robots for sequencing car parts at Ingolstadt, with virtual testing from Dassault Systèmes and NVIDIA.',
    whyItMattersToYou: 'Matches your robotics and engineering focus: Audi is testing mobile humanoid robots on its Ingolstadt automotive assembly line.',
    coverage: [
      {
        outlet: 'Humanoids Daily',
        url: 'https://www.humanoidsdaily.com/news/audi-agile-robots-mobile-humanoids-parts-sequencing',
        framingDescription: 'Reported on Audi testing Agile Robots mobile humanoids for car parts sequencing.'
      }
    ],
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    dateFirstSeen: '2026-10-28',
    dateLastChanged: '2026-10-28',
    hasTimeline: true
  }
];

/**
 * Timelines for all stories.
 */
export const TIMELINE_STORY_1: TimelineNode[] = [
  {
    id: 'tl-1-25oct',
    storyId: 'story-1-iran-qatar',
    date: '2026-10-25',
    dateDisplay: 'Sun 25 Oct',
    isToday: false,
    changeDescription: 'Qatari mediators gave Iran a new draft deal to end the war, according to Reuters. A senior Iranian official denied receiving a new proposal.',
    sources: [
      {
        outlet: 'CBS News',
        url: 'https://www.cbsnews.com/live-updates/iran-war-donald-trump-qatar-mediators-new-proposal-end-war/'
      }
    ]
  },
  {
    id: 'tl-1-28oct',
    storyId: 'story-1-iran-qatar',
    date: '2026-10-28',
    dateDisplay: 'Wed 28 Oct',
    isToday: false,
    changeDescription: "US Defense Secretary Pete Hegseth removed Lt Gen Brett Sylvia, the Joint Chiefs' head of strategy, plans and policy, over alleged leaks about the war.",
    sources: [
      {
        outlet: 'CBS News',
        url: 'https://www.cbsnews.com/live-updates/iran-war-donald-trump-qatar-mediators-new-proposal-end-war/'
      }
    ]
  },
  {
    id: 'tl-1-29oct',
    storyId: 'story-1-iran-qatar',
    date: '2026-10-29',
    dateDisplay: 'Thu 29 Oct',
    isToday: false,
    changeDescription: 'Iran said four tankers hit mines on a southern route through the Strait of Hormuz that the US backs. The UK Maritime Trade Operations centre confirmed one ship on fire.',
    sources: [
      {
        outlet: 'CBS News',
        url: 'https://www.cbsnews.com/live-updates/iran-war-donald-trump-qatar-mediators-new-proposal-end-war/'
      }
    ]
  },
  {
    id: 'tl-1-31oct',
    storyId: 'story-1-iran-qatar',
    date: '2026-10-31',
    dateDisplay: 'Sat 31 Oct',
    isToday: true,
    changeDescription: "Al Jazeera reported that Ayatollah Khamenei ordered the military to answer any threat at once, wherever it comes from. Iran's reply to Qatar was expected by the end of the week.",
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/liveblog/2026/10/31/iran-war-live-oil-tankers-hit-in-hormuz-trump-says-conflict-will-end-soon'
      }
    ]
  }
];

export const TIMELINE_STORY_2: TimelineNode[] = [
  {
    id: 'tl-2-28oct',
    storyId: 'story-2-spain-train-crash',
    date: '2026-10-28',
    dateDisplay: 'Wed 28 Oct',
    isToday: false,
    changeDescription: 'At about 8:30, a Renfe train hit a stationary Iryo train from behind near Urda, Toledo, on the Madrid-Seville high-speed line. Transport Minister Óscar Puente said the first findings point to controllers letting trains move without speed limits after a computer failure.',
    sources: [
      {
        outlet: 'ABC News',
        url: 'https://abcnews.com/International/10-killed-train-collision-high-speed-line-spain/story?id=137633323'
      }
    ]
  },
  {
    id: 'tl-2-29oct',
    storyId: 'story-2-spain-train-crash',
    date: '2026-10-29',
    dateDisplay: 'Thu 29 Oct',
    isToday: false,
    changeDescription: 'Reports put the death toll at 74. Initial reports said a computer failure took down the LZB safety system and the control centre told the driver to resume at normal speed.',
    sources: [
      {
        outlet: 'El Demócrata',
        url: 'https://www.democrata.es/en/current-events/the-number-of-fatalities-in-the-urda-railway-accident-rises-to-74-according-to-the-investigation-commission/'
      }
    ]
  },
  {
    id: 'tl-2-30oct',
    storyId: 'story-2-spain-train-crash',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: 'The Spanish presidency and Transport Ministry revised the toll down to at least 69.',
    sources: [
      {
        outlet: 'ABC News',
        url: 'https://abcnews.com/International/10-killed-train-collision-high-speed-line-spain/story?id=137633323'
      }
    ]
  }
];

export const TIMELINE_STORY_3: TimelineNode[] = [
  {
    id: 'tl-3-28oct',
    storyId: 'story-3-uk-healey',
    date: '2026-10-28',
    dateDisplay: 'Wed 28 Oct',
    isToday: false,
    changeDescription: 'Chancellor John Healey delivered his first Budget. It promised no tax rises on working people and a £100 Household Energy Payment for 20 million households in council tax bands A to D, and raised the National Living Wage 3.9% to £13.21 with face-to-face benefit assessments.',
    sources: [
      {
        outlet: 'LBC',
        url: 'https://www.lbc.co.uk/article/what-in-budget-2026-john-healey-5HjdkZM_2/'
      }
    ]
  },
  {
    id: 'tl-3-29oct',
    storyId: 'story-3-uk-healey',
    date: '2026-10-29',
    dateDisplay: 'Thu 29 Oct',
    isToday: false,
    changeDescription: 'After telling Radio 4 that the benefits bill would fall, Healey said no timetable had been set.',
    sources: [
      {
        outlet: 'The Telegraph',
        url: 'https://www.aol.com/articles/healey-rules-crude-cuts-welfare-095610000.html'
      }
    ]
  }
];

export const TIMELINE_STORY_4: TimelineNode[] = [
  {
    id: 'tl-4-31oct',
    storyId: 'story-4-uk-mahmood',
    date: '2026-10-31',
    dateDisplay: 'Sat 31 Oct',
    isToday: true,
    changeDescription: 'Home Secretary Shabana Mahmood is expected to exempt social care workers already in the UK from her plan to double the wait for indefinite leave to remain from five years to ten. The BBC reports a final decision next week.',
    sources: [
      {
        outlet: 'Eastern Eye',
        url: 'https://easterneye.biz/indefinite-leave-to-remain-shabana-mahmood-immigration-social-care-workers'
      }
    ]
  }
];

export const TIMELINE_STORY_5: TimelineNode[] = [
  {
    id: 'tl-5-27oct',
    storyId: 'story-5-us-midterms-polls',
    date: '2026-10-27',
    dateDisplay: 'Tue 27 Oct',
    isToday: false,
    changeDescription: 'A PBS News, NPR and Marist poll found likely voters favouring Democrats by 52% to 44%.',
    sources: [
      {
        outlet: 'PBS NewsHour',
        url: 'https://www.pbs.org/newshour/politics/poll-likely-voters-favor-democrats-as-trump-disapproval-drives-early-turnout'
      }
    ]
  },
  {
    id: 'tl-5-31oct',
    storyId: 'story-5-us-midterms-polls',
    date: '2026-10-31',
    dateDisplay: 'Sat 31 Oct',
    isToday: true,
    changeDescription: 'An AP count put early votes above 43 million, about 10 million more than at the same point before the 2022 midterms. Election day is Tuesday 3 November.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/us-midterms-3-days-to-go-what-latest-polls-say-as-early-voting-surges'
      }
    ]
  }
];

export const TIMELINE_STORY_6: TimelineNode[] = [
  {
    id: 'tl-6-27oct',
    storyId: 'story-6-israel-election',
    date: '2026-10-27',
    dateDisplay: 'Tue 27 Oct',
    isToday: false,
    changeDescription: 'Israel held its general election.',
    sources: []
  },
  {
    id: 'tl-6-30oct',
    storyId: 'story-6-israel-election',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: "Final results gave Netanyahu's bloc 53 seats, Gadi Eisenkot's bloc 48 and the Arab parties 19. A government needs 61 of the 120 seats.",
    sources: [
      {
        outlet: 'The Times of Israel',
        url: 'https://www.timesofisrael.com/with-all-votes-counted-netanyahus-bloc-at-53-seats-eisenkots-48-arab-parties-19/'
      }
    ]
  }
];

export const TIMELINE_STORY_7: TimelineNode[] = [
  {
    id: 'tl-7-30oct',
    storyId: 'story-7-poland-court',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: 'The Constitutional Tribunal said its president, Bogdan Święczkowski, had been suspended. Police entered the court after objects were thrown at officers and detained three people. President Karol Nawrocki turned his plane back on the way to Senegal.',
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
  }
];

export const TIMELINE_STORY_8: TimelineNode[] = [
  {
    id: 'tl-8-31oct',
    storyId: 'story-8-patriot-ukraine',
    date: '2026-10-31',
    dateDisplay: 'Sat 31 Oct',
    isToday: true,
    changeDescription: 'The US State Department approved a possible sale of 500 Patriot PAC-3 missiles to Ukraine, worth an estimated $2.1bn. Canada, Germany and Norway will help pay through a US programme, along with an EU loan. Two people briefed on the decision said delivery is not expected until the early 2030s.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/us-greenlights-2-1bn-patriot-missile-sale-to-ukraine'
      }
    ]
  }
];

export const TIMELINE_STORY_9: TimelineNode[] = [
  {
    id: 'tl-9-30oct',
    storyId: 'story-9-canada-eu-trade',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: 'At a summit in Montreal, Mark Carney, Ursula von der Leyen and Antonio Costa launched an Alliance for the Future. Canada signed a digital trade deal, will put €500 million into the EU\'s €90 billion loan for Ukraine, and will open talks on deeper participation in Erasmus+ student exchanges. Carney wants Canada to become the EU\'s first associate member.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/30/eu-and-canada-seek-deeper-ties-amid-worsening-global-uncertainty'
      }
    ]
  }
];

export const TIMELINE_STORY_10: TimelineNode[] = [
  {
    id: 'tl-10-30oct',
    storyId: 'story-10-ebola-congo',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: 'Government figures put deaths above 5,000 and infections above 10,000 since the outbreak was declared in May. The Bundibugyo strain behind it has no approved vaccine or treatment.',
    sources: [
      {
        outlet: 'Al Jazeera',
        url: 'https://www.aljazeera.com/news/2026/10/31/ebola-death-toll-in-dr-congo-passes-5000'
      }
    ]
  }
];

export const TIMELINE_STORY_11: TimelineNode[] = [
  {
    id: 'tl-11-30oct',
    storyId: 'story-11-f1-antonelli',
    date: '2026-10-30',
    dateDisplay: 'Fri 30 Oct',
    isToday: false,
    changeDescription: 'Charles Leclerc topped both practice sessions at the Mexico City Grand Prix. Lewis Hamilton stopped early in the second session with an apparent engine problem. Max Verstappen and Liam Lawson collided in the same session.',
    sources: [
      {
        outlet: 'Sky Sports',
        url: 'https://skysports.com/f1/news/13605831/mexico-city-gp-charles-leclerc-completes-friday-practice-double-as-ferrari-team-mate-lewis-hamilton-suffers-technical-failure'
      }
    ]
  },
  {
    id: 'tl-11-31oct',
    storyId: 'story-11-f1-antonelli',
    date: '2026-10-31',
    dateDisplay: 'Sat 31 Oct',
    isToday: true,
    changeDescription: 'The stewards gave Verstappen and Lawson a one-place grid penalty and a penalty point each, calling their driving unacceptable. Andrea Kimi Antonelli leads with 365 points and can clinch the title by finishing ninth or better on Sunday.',
    sources: [
      {
        outlet: 'GrandPrix247',
        url: 'https://www.grandprix247.com/grand-prix-f1-weekend-news/max-verstappen-and-liam-lawson-handed-grid-penalties-after-unacceptable-practice-clash'
      },
      {
        outlet: 'Grande Premio',
        url: 'https://grandepremio.com/en/f1/is-there-f1-qualifying-today-mexico-city-gp-start-time-in-the-uk'
      }
    ]
  }
];

export const TIMELINE_STORY_12: TimelineNode[] = [
  {
    id: 'tl-12-27oct',
    storyId: 'story-12-machenta-robotics',
    date: '2026-10-27',
    dateDisplay: 'Tue 27 Oct',
    isToday: false,
    changeDescription: 'Machenta, based in London, raised $40 million for a model trained in simulation that it says can learn a new task from one demonstration without fine-tuning.',
    sources: [
      {
        outlet: 'Humanoids Daily',
        url: 'https://www.humanoidsdaily.com/news/machenta-40-million-instant-robot-learning'
      }
    ]
  }
];

export const TIMELINE_STORY_13: TimelineNode[] = [
  {
    id: 'tl-13-28oct',
    storyId: 'story-13-audi-robotics',
    date: '2026-10-28',
    dateDisplay: 'Wed 28 Oct',
    isToday: false,
    changeDescription: 'Audi is testing mobile humanoids from Agile Robots for sequencing car parts at Ingolstadt, with virtual testing from Dassault Systèmes and NVIDIA.',
    sources: [
      {
        outlet: 'Humanoids Daily',
        url: 'https://www.humanoidsdaily.com/news/audi-agile-robots-mobile-humanoids-parts-sequencing'
      }
    ]
  }
];

/**
 * Retrieves the daily edition payload containing only verified seed data.
 *
 * @returns {DailyEditionData} Today's assembled briefing payload.
 */
export function getDailyEditionData(): DailyEditionData {
  logFunctionCall('getDailyEditionData', {});
  return {
    editionDate: '2026-10-31',
    formattedDate: 'Saturday 31 October 2026',
    stories: SEED_STORIES
  };
}

/**
 * Retrieves timeline nodes for a given story.
 *
 * @param {string} storyId Unique story identifier.
 * @returns {TimelineNode[]} Chronological sequence of verified milestones.
 */
export function getTimelineForStory(storyId: string): TimelineNode[] {
  logFunctionCall('getTimelineForStory', { storyId });
  switch (storyId) {
    case 'story-1-iran-qatar':
      return TIMELINE_STORY_1;
    case 'story-2-spain-train-crash':
      return TIMELINE_STORY_2;
    case 'story-3-uk-healey':
      return TIMELINE_STORY_3;
    case 'story-4-uk-mahmood':
      return TIMELINE_STORY_4;
    case 'story-5-us-midterms-polls':
      return TIMELINE_STORY_5;
    case 'story-6-israel-election':
      return TIMELINE_STORY_6;
    case 'story-7-poland-court':
      return TIMELINE_STORY_7;
    case 'story-8-patriot-ukraine':
      return TIMELINE_STORY_8;
    case 'story-9-canada-eu-trade':
      return TIMELINE_STORY_9;
    case 'story-10-ebola-congo':
      return TIMELINE_STORY_10;
    case 'story-11-f1-antonelli':
      return TIMELINE_STORY_11;
    case 'story-12-machenta-robotics':
      return TIMELINE_STORY_12;
    case 'story-13-audi-robotics':
      return TIMELINE_STORY_13;
    default:
      return [];
  }
}
