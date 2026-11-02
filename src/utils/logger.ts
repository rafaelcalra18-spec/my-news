/**
 * @file src/utils/logger.ts
 * @description Centralized Logging Utility for the Frontend Application.
 *
 * This module ensures comprehensive traceability across all client-side operations.
 * It provides standardized methods to log function invocations, parameter signatures,
 * user interactions, and calls made to backend GenAI services.
 *
 * USE CASES:
 * 1. Logging every application action and function call with formatted parameter inspection.
 * 2. Logging GenAI requests and responses with sanitized metadata (stripping sensitive binary or inline data).
 * 3. Providing an in-memory buffer of recent logs so testers and judges can view the live execution log in the demo.
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'function' | 'genai' | 'user_action' | 'navigation';
  name: string;
  params?: Record<string, unknown>;
  output?: unknown;
}

const logBuffer: LogEntry[] = [];
const MAX_LOGS = 200;

/**
 * Strips raw base64 or inline data payloads from parameters or responses
 * to prevent console bloat while preserving execution metadata.
 *
 * @param {unknown} data The arbitrary object or data structure to sanitize.
 * @returns {unknown} The sanitized object with inline binary stripped.
 */
export function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (key.toLowerCase().includes('inlinedata') || key.toLowerCase().includes('base64')) {
      sanitized[key] = '[BINARY_INLINE_DATA_STRIPPED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Logs standard function execution with its supplied arguments.
 *
 * @param {string} functionName The name of the invoked function.
 * @param {Record<string, unknown>} params The parameter map supplied to the function.
 */
export function logFunctionCall(functionName: string, params: Record<string, unknown> = {}): void {
  const sanitizedParams = sanitizeData(params) as Record<string, unknown>;
  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'function',
    name: functionName,
    params: sanitizedParams
  };

  logBuffer.unshift(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop();
  }

  // eslint-disable-next-line no-console
  console.info(`[APP-FN-CALL] ${functionName}`, sanitizedParams);
}

/**
 * Logs GenAI API interaction metadata including model, prompt, configuration parameters,
 * and sanitized outputs.
 *
 * @param {string} operation The name or purpose of the GenAI operation.
 * @param {string} model The identifier of the model being called.
 * @param {unknown} prompt The input prompt or conversational contents.
 * @param {unknown} config Model configuration parameters (thinkingLevel, schemas, etc.).
 * @param {unknown} output The output received from the GenAI model.
 */
export function logGenAICall(
  operation: string,
  model: string,
  prompt: unknown,
  config: unknown,
  output?: unknown
): void {
  const sanitizedPrompt = sanitizeData(prompt);
  const sanitizedConfig = sanitizeData(config);
  const sanitizedOutput = sanitizeData(output);

  const entry: LogEntry = {
    id: `genai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'genai',
    name: operation,
    params: {
      model,
      prompt: sanitizedPrompt,
      config: sanitizedConfig
    },
    output: sanitizedOutput
  };

  logBuffer.unshift(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop();
  }

  // eslint-disable-next-line no-console
  console.info(`[GENAI-API-CALL] [${model}] ${operation}`, {
    prompt: sanitizedPrompt,
    config: sanitizedConfig,
    output: sanitizedOutput
  });
}

/**
 * Retrieves the recent in-memory log entries for display in the debug or audit panels.
 *
 * @returns {LogEntry[]} An array of the latest logged events.
 */
export function getRecentLogs(): LogEntry[] {
  return [...logBuffer];
}
