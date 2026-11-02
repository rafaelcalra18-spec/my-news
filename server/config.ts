/**
 * @file server/config.ts
 * @description Centralized Server Configuration for Morning Brief ("My news").
 *
 * This file centralizes backend runtime variables, model identifiers, API timeouts,
 * system prompt templates, and port configurations.
 *
 * USE CASES:
 * 1. Specifying the canonical server-side Gemini model (`gemini-3.8-flash`).
 * 2. Configuring Express HTTP listener settings and telemetry headers.
 * 3. Maintaining structured JSON prompts for Setup Onboarding and Grounded Q&A ("Ask the Edition").
 */

export interface ServerConfig {
  port: number;
  geminiModel: string;
  userAgent: string;
  corsOrigin: string;
}

export const SERVER_CONFIG: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  geminiModel: 'gemini-3.8-flash',
  userAgent: 'aistudio-build',
  corsOrigin: '*'
};

/**
 * Returns the active server configuration settings.
 *
 * @returns {ServerConfig} The current server configuration.
 */
export function getServerConfig(): ServerConfig {
  return SERVER_CONFIG;
}
