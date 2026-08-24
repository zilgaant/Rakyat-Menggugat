/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Gemini Client with Exponential Backoff & Model Fallback
 * Handles temporary 503 (High Demand / Unavailable) and 429 errors gracefully.
 */

import { GoogleGenAI, GenerateContentConfig } from '@google/genai';

const FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

export async function generateGeminiContentWithRetry(
  prompt: string,
  options: {
    config?: GenerateContentConfig;
    preferredModel?: string;
    maxRetries?: number;
  } = {}
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const preferred = options.preferredModel || 'gemini-3.7-flash';
  const modelsToTry = [preferred, ...FALLBACK_MODELS.filter(m => m !== preferred)];
  const maxRetries = options.maxRetries ?? 2;

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: options.config,
        });

        const text = response.text || '';
        if (text) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isTransient = 
          errMessage.includes('503') || 
          errMessage.includes('high demand') || 
          errMessage.includes('UNAVAILABLE') || 
          errMessage.includes('429') || 
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < maxRetries) {
          // Exponential jittered backoff: 300ms, 800ms
          const backoff = (attempt + 1) * 350 + Math.random() * 200;
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue; // retry same model
        }

        // Break inner loop to try next fallback model
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate content after trying multiple Gemini models');
}
