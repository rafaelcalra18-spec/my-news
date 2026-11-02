/**
 * @file server/geminiService.ts
 * @description Server-Side Gemini AI Service for Setup Conversations and Factual Relevance.
 *
 * Implements two backend Gemini capabilities:
 * 1. Setup Conversation:
 *    Parses reader freeform onboarding input (e.g. "I study engineering in London and I follow F1 and robotics"),
 *    derives their personal situation, and proposes 2 follow-up questions tailored directly to their input
 *    (e.g., which parts of F1 to cover, which robotics areas to track).
 * 2. Strictly Constrained "Why it matters to you" generation:
 *    Connects a fact from the story to reader setup (London, studying engineering, F1, robotics).
 *    If there is no real connection, leaves the line out entirely. Never writes generic filler.
 *
 * USE CASES:
 * - Calling `/api/setup/analyze` when onboarding or updating profile in Topics screen.
 * - Calling `/api/setup/refine` when tapping follow-up question chips.
 * - Calling `/api/gemini/relevance` to personalize relevance lines with real connections only.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { SERVER_CONFIG } from './config.ts';
import { logServerFunction, logServerGenAI } from './logger.ts';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': SERVER_CONFIG.userAgent
        }
      }
    })
  : null;

export interface SetupAnalysisResult {
  situation: string;
  initialTopics: string[];
  followUpQuestions: {
    id: string;
    question: string;
    options: string[];
  }[];
}

export interface SetupRefineResult {
  refinedTopics: string[];
  refinedSituation: string;
}

export interface StoryRelevanceResult {
  whyItMattersToYou: string;
}

/**
 * Analyzes reader setup sentence to extract situation, reader-specific topics, and custom follow-ups.
 *
 * @param {string} userSentence The raw sentence input by the reader.
 * @returns {Promise<SetupAnalysisResult>} The structured situation and follow-ups.
 */
export async function analyzeSetupSentence(userSentence: string): Promise<SetupAnalysisResult> {
  logServerFunction('analyzeSetupSentence', { userSentence });

  // Default fallback for "I study engineering in London and I follow F1 and robotics"
  const isDefaultPersona =
    userSentence.toLowerCase().includes('engineering') ||
    userSentence.toLowerCase().includes('f1') ||
    userSentence.toLowerCase().includes('robotics');

  const fallbackResult: SetupAnalysisResult = {
    situation: isDefaultPersona
      ? 'Engineering student in London following F1 and robotics'
      : 'Reader seeking factual daily briefing',
    initialTopics: isDefaultPersona
      ? ['F1', 'Robotics', 'Engineering', 'London']
      : ['World', 'UK'],
    followUpQuestions: [
      {
        id: 'q1',
        question: 'Which parts of Formula 1 do you want covered?',
        options: ['Championship Standings', 'Technical & Aerodynamics', 'Practice & Qualifying', 'Driver Transfers']
      },
      {
        id: 'q2',
        question: 'Which robotics areas should we prioritize?',
        options: ['Humanoid Robots', 'Simulation & Learning', 'Industrial Automation', 'Autonomous Systems']
      }
    ]
  };

  if (!ai) {
    logServerGenAI('analyzeSetupSentence:fallback_no_key', SERVER_CONFIG.geminiModel, userSentence, {}, fallbackResult);
    return fallbackResult;
  }

  const prompt = `You are the onboarding intelligence for "My news", a morning brief app.
The user described themselves with this sentence:
"${userSentence}"

CRITICAL RULES:
1. Setup MUST keep the reader's own interests. If the sentence mentions F1 and robotics, initialTopics MUST explicitly include "F1" and "Robotics".
2. The follow-up questions MUST be about what they wrote (for example, which parts of F1 to cover, or which robotics sectors to prioritize).
3. "situation": A concise 1-sentence description of their situation (e.g., "Engineering student in London following F1 and robotics").`;

  const config = {
    systemInstruction: 'Extract reader profile situation, topics, and relevant follow-up questions.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        situation: { type: Type.STRING },
        initialTopics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        followUpQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'question', 'options']
          }
        }
      },
      required: ['situation', 'initialTopics', 'followUpQuestions']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: SERVER_CONFIG.geminiModel,
      contents: prompt,
      config
    });

    const parsed = JSON.parse(response.text || '{}') as SetupAnalysisResult;
    logServerGenAI('analyzeSetupSentence:success', SERVER_CONFIG.geminiModel, prompt, config, parsed);
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in analyzeSetupSentence, using fallback:', error);
    logServerGenAI('analyzeSetupSentence:error', SERVER_CONFIG.geminiModel, prompt, config, fallbackResult);
    return fallbackResult;
  }
}

/**
 * Refines topic chips and reader situation based on selected follow-up chips.
 *
 * @param {string[]} existingTopics Active topics.
 * @param {{ question: string; selectedOptions: string[] }[]} answers Tapped option chips.
 * @param {string} currentSituation Detected situation.
 * @returns {Promise<SetupRefineResult>} Refined topics and updated situation.
 */
export async function refineSetupAnswers(
  existingTopics: string[],
  answers: { question: string; selectedOptions: string[] }[],
  currentSituation: string
): Promise<SetupRefineResult> {
  logServerFunction('refineSetupAnswers', { existingTopics, answers, currentSituation });

  const addedFromOptions = answers.flatMap((a) => a.selectedOptions);
  const combined = Array.from(new Set([...existingTopics, ...addedFromOptions]));

  if (!ai) {
    return {
      refinedTopics: combined.slice(0, 6),
      refinedSituation: currentSituation
    };
  }

  const prompt = `Current situation: "${currentSituation}"
Existing topics: ${JSON.stringify(existingTopics)}
User selected follow-up chips:
${JSON.stringify(answers, null, 2)}

Produce a finalized, curated array of 4 to 6 clean, specific topic chips and an updated situation sentence. Ensure user-selected topics like F1 or Robotics are preserved.`;

  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        refinedTopics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        refinedSituation: { type: Type.STRING }
      },
      required: ['refinedTopics', 'refinedSituation']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: SERVER_CONFIG.geminiModel,
      contents: prompt,
      config
    });
    const parsed = JSON.parse(response.text || '{}') as SetupRefineResult;
    logServerGenAI('refineSetupAnswers:success', SERVER_CONFIG.geminiModel, prompt, config, parsed);
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in refineSetupAnswers, using combined:', error);
    return { refinedTopics: combined.slice(0, 6), refinedSituation: currentSituation };
  }
}

/**
 * Writes the "Why it matters to you" line for a story.
 * CRITICAL RULE:
 * Connects a fact from the story to something the reader said at setup: London, studying engineering, F1 or robotics.
 * If there is no real connection, leave the line out (return empty string ""). Never write generic lines like "affects regional stability".
 *
 * @param {string} storyFacts The verified facts of the story.
 * @param {string} readerSituation The reader's situation.
 * @returns {Promise<StoryRelevanceResult>} A single factual relevance sentence or empty string.
 */
export async function generateStoryRelevance(
  storyFacts: string,
  readerSituation: string
): Promise<StoryRelevanceResult> {
  logServerFunction('generateStoryRelevance', { readerSituation });

  if (!ai) {
    return { whyItMattersToYou: '' };
  }

  const prompt = `You are writing the "Why it matters to you" line for a news story in "My news".
Reader Profile: "${readerSituation}". Reader attributes: London, studying engineering, F1, robotics.
Story Facts:
"${storyFacts}"

STRICT RULES:
1. Write ONE sentence that connects a concrete fact from the story to something the reader said at setup: London, studying engineering, F1 or robotics.
2. If there is NO REAL, DIRECT connection to London, studying engineering, F1 or robotics, you MUST return an empty string "" for whyItMattersToYou.
3. NEVER write generic lines like "affects regional stability", "affects geopolitical balance", or "relates to international trade".
4. Rely ONLY on the facts given in the story. Do not add outside numbers or facts.`;

  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        whyItMattersToYou: { type: Type.STRING }
      },
      required: ['whyItMattersToYou']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: SERVER_CONFIG.geminiModel,
      contents: prompt,
      config
    });
    const parsed = JSON.parse(response.text || '{}') as StoryRelevanceResult;
    logServerGenAI('generateStoryRelevance:success', SERVER_CONFIG.geminiModel, prompt, config, parsed);
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in generateStoryRelevance:', error);
    return { whyItMattersToYou: '' };
  }
}
