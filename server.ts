/**
 * @file server.ts
 * @description Full-Stack Express Server with Vite Middleware and Gemini API Endpoints.
 *
 * This server implements the backend API and static hosting for "My news":
 * 1. Express API endpoints:
 *    - POST `/api/setup/analyze`: Parses reader setup sentence into situation and follow-up chips.
 *    - POST `/api/setup/refine`: Updates reader topic chips based on interactive selections.
 *    - POST `/api/gemini/relevance`: Writes the strictly factual "Why it matters to you" line.
 *    - GET `/api/health`: Health status probe.
 * 2. Vite dev server middleware in development mode (`NODE_ENV !== 'production'`).
 * 3. Static asset serving in production mode.
 *
 * USE CASES:
 * - Running the app in AI Studio development and production environments.
 * - Securing the Gemini 3.8 Flash API key server-side without leaking it to client code.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from './server/config.ts';
import { logServerFunction } from './server/logger.ts';
import { analyzeSetupSentence, refineSetupAnswers, generateStoryRelevance } from './server/geminiService.ts';
import { getAllStoryMarkets } from './server/marketService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/**
 * Health check endpoint for testing deployment status.
 *
 * @param {Request} _req Express request object.
 * @param {Response} res Express response object.
 */
function handleHealthCheck(_req: Request, res: Response): void {
  logServerFunction('handleHealthCheck', {});
  res.json({ status: 'ok', app: 'My news', date: '2026-10-31' });
}

/**
 * API handler for analyzing a reader's setup sentence.
 *
 * @param {Request} req Express request object containing `sentence`.
 * @param {Response} res Express response object returning structured profile.
 */
async function handleSetupAnalyze(req: Request, res: Response): Promise<void> {
  const { sentence } = req.body;
  logServerFunction('handleSetupAnalyze', { sentence });

  if (!sentence || typeof sentence !== 'string') {
    res.status(400).json({ error: 'A valid string sentence is required.' });
    return;
  }

  try {
    const result = await analyzeSetupSentence(sentence);
    res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to analyze setup sentence:', error);
    res.status(500).json({ error: 'Failed to process setup sentence.' });
  }
}

/**
 * API handler for refining topic chips based on selected follow-up chips.
 *
 * @param {Request} req Express request object containing `existingTopics`, `answers`, and `currentSituation`.
 * @param {Response} res Express response object returning updated topics.
 */
async function handleSetupRefine(req: Request, res: Response): Promise<void> {
  const { existingTopics, answers, currentSituation } = req.body;
  logServerFunction('handleSetupRefine', { existingTopics, answers, currentSituation });

  try {
    const result = await refineSetupAnswers(
      existingTopics || [],
      answers || [],
      currentSituation || ''
    );
    res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to refine setup answers:', error);
    res.status(500).json({ error: 'Failed to refine setup topics.' });
  }
}

/**
 * API handler for strictly factual "Why it matters to you" generation.
 *
 * @param {Request} req Express request object containing `storyFacts` and `readerSituation`.
 * @param {Response} res Express response object returning relevance sentence.
 */
async function handleStoryRelevance(req: Request, res: Response): Promise<void> {
  const { storyFacts, readerSituation } = req.body;
  logServerFunction('handleStoryRelevance', { readerSituation });

  try {
    const result = await generateStoryRelevance(storyFacts || '', readerSituation || '');
    res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate story relevance:', error);
    res.status(500).json({ error: 'Failed to generate relevance.' });
  }
}

/**
 * API handler for fetching current market data and price histories.
 *
 * @param {Request} _req Express request object.
 * @param {Response} res Express response object returning dictionary of storyId -> market data.
 */
async function handleGetMarkets(_req: Request, res: Response): Promise<void> {
  logServerFunction('handleGetMarkets', {});

  try {
    const markets = await getAllStoryMarkets();
    res.json(markets);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch markets:', error);
    res.status(500).json({ error: 'Failed to fetch markets.' });
  }
}

// Register API Routes
app.get('/api/health', handleHealthCheck);
app.get('/api/markets', handleGetMarkets);
app.post('/api/setup/analyze', handleSetupAnalyze);
app.post('/api/setup/refine', handleSetupRefine);
app.post('/api/gemini/relevance', handleStoryRelevance);

/**
 * Initializes the server with either Vite development middleware or production static files.
 */
async function startServer(): Promise<void> {
  logServerFunction('startServer', { port: SERVER_CONFIG.port, env: process.env.NODE_ENV });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: SERVER_CONFIG.port },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(SERVER_CONFIG.port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.info(`[SERVER-START] My news server listening on http://0.0.0.0:${SERVER_CONFIG.port}`);
  });
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal server startup error:', err);
});
