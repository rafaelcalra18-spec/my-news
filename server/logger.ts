/**
 * @file server/logger.ts
 * @description Centralized Logging Utility for Server-Side and Gemini API Interactions.
 *
 * This module fulfills the strict logging requirements of the Morning Brief system:
 * 1. Log as INFO all function calls with their complete parameter objects.
 * 2. Log all GenAI calls with all invocation parameters (model name, prompt contents,
 *    and configuration options) and their resulting outputs.
 * 3. Strip any inline binary data (e.g., base64 audio/images) to preserve clean server logs.
 *
 * USE CASES:
 * - Debugging server-side Gemini prompt engineering and JSON schema validations.
 * - Auditing requests received at `/api/setup/analyze`, `/api/setup/refine`, and `/api/gemini/ask-edition`.
 * - Validating that no raw API keys or binary blobs are leaked to stdout.
 */

/**
 * Strips inline base64 or binary data payloads from arbitrary objects.
 *
 * @param {unknown} data The object to sanitize.
 * @returns {unknown} The sanitized object with binary blobs replaced with placeholders.
 */
export function sanitizeServerData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeServerData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('inlinedata') || lowerKey.includes('base64') || lowerKey.includes('audiobuffer')) {
      sanitized[key] = '[BINARY_INLINE_DATA_STRIPPED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeServerData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Logs a standard server-side function execution with its parameters.
 *
 * @param {string} functionName Name of the executing function.
 * @param {Record<string, unknown>} params The parameter values passed to the function.
 */
export function logServerFunction(functionName: string, params: Record<string, unknown> = {}): void {
  const sanitized = sanitizeServerData(params);
  // eslint-disable-next-line no-console
  console.info(`[SERVER-FN] ${functionName}`, JSON.stringify(sanitized, null, 2));
}

/**
 * Logs a server-side GenAI interaction with full model name, prompt, configuration, and output.
 *
 * @param {string} operation Purpose or identifier of the GenAI operation.
 * @param {string} model Model identifier used (e.g., 'gemini-3.8-flash').
 * @param {unknown} prompt Prompt string or structured content parts.
 * @param {unknown} config Model configuration parameters (schema, thinkingLevel, temperature, etc.).
 * @param {unknown} output The raw or parsed output received from Gemini.
 */
export function logServerGenAI(
  operation: string,
  model: string,
  prompt: unknown,
  config: unknown,
  output?: unknown
): void {
  const sanitizedPrompt = sanitizeServerData(prompt);
  const sanitizedConfig = sanitizeServerData(config);
  const sanitizedOutput = sanitizeServerData(output);

  // eslint-disable-next-line no-console
  console.info(`[SERVER-GENAI-CALL] [${model}] ${operation}:`, {
    timestamp: new Date().toISOString(),
    prompt: sanitizedPrompt,
    config: sanitizedConfig,
    output: sanitizedOutput
  });
}
