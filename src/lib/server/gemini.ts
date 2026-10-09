import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { z } from 'zod';
import { RequestError } from './http';
import type { Locale } from '../schemas';

export function demoMode() {
  return process.env.DEMO_MODE !== 'false';
}
export function liveEnabled() {
  return (
    !demoMode() && process.env.ENABLE_LIVE_AI === 'true' && Boolean(process.env.GEMINI_API_KEY)
  );
}

let instruction: Promise<string> | undefined;
function systemInstruction() {
  instruction ??= readFile(join(process.cwd(), 'docs/prompts/SYSTEM_PROMPT.md'), 'utf8').then(
    (text) => {
      const block = text.match(/```text\r?\n([\s\S]*?)\r?\n```/);
      if (!block) throw new Error('Missing system prompt');
      return block[1];
    },
  );
  return instruction;
}

// The package's bounded array schema is rejected by Gemini (HTTP 400).
// Keep shape/types at the provider; Zod enforces every local bound on return.
export function providerSchema(schema: z.ZodType) {
  const localOnly = new Set([
    '$schema',
    'minLength',
    'maxLength',
    'minItems',
    'maxItems',
    'minimum',
    'maximum',
  ]);
  return JSON.parse(JSON.stringify(z.toJSONSchema(schema)), (key, value) =>
    localOnly.has(key) ? undefined : value,
  );
}

function providerError(error: unknown, timedOut: boolean): RequestError {
  if (timedOut)
    return new RequestError('AI_TIMEOUT', 'Gemini cavabı gecikdi. Yenidən yoxlayın.', 504);
  const status = error && typeof error === 'object' && 'status' in error ? error.status : null;
  if (status === 401 || status === 403)
    return new RequestError(
      'AI_AUTH_FAILED',
      'Gemini açarı və giriş icazəsi serverdə yoxlanmalıdır.',
      503,
      false,
    );
  if (status === 429)
    return new RequestError(
      'AI_RATE_LIMITED',
      'Gemini kvotası dolub. Bir qədər sonra yenidən yoxlayın.',
      429,
    );
  if (status === 400 || status === 404)
    return new RequestError(
      'AI_CONFIGURATION_ERROR',
      'Gemini model və sorğu ayarları serverdə yoxlanmalıdır.',
      503,
      false,
    );
  return new RequestError(
    'PROVIDER_UNAVAILABLE',
    'Gemini hazırda cavab vermir. Yenidən yoxlayın.',
    503,
  );
}

export async function structured<T>(
  task: 'profile' | 'writing' | 'comparison' | 'evidence' | 'coach',
  prompt: string,
  data: unknown,
  schema: z.ZodType<T>,
  locale: Locale,
  validate?: (result: T) => void,
): Promise<T> {
  if (!liveEnabled())
    throw new RequestError(
      'AI_NOT_CONFIGURED',
      'Gemini bağlantısı aktiv deyil. Demo nümunəsini və ya əl ilə profili istifadə edin.',
      503,
      false,
    );
  const model =
    task === 'profile'
      ? process.env.GEMINI_MODEL_PROFILE || 'gemini-3.5-flash-lite'
      : task === 'comparison' || task === 'evidence'
        ? process.env.GEMINI_MODEL_ANALYSIS || 'gemini-3.5-flash-lite'
        : process.env.GEMINI_MODEL_WRITING || 'gemini-3.5-flash-lite';
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const started = Date.now();
  const signal = AbortSignal.timeout(25000);
  const instructions = `${await systemInstruction()}\n\ntrusted_context: ${JSON.stringify({ active_role: task === 'profile' ? 'profile_extractor' : task === 'comparison' ? 'opportunity_analyst' : task === 'evidence' ? 'github_evidence_analyst' : 'application_coach', locale, output_language: { az: 'Azerbaijani', tr: 'Turkish', en: 'English' }[locale], prompt_version: 'pilot-v3-career', schema_version: 'prototype-v3', task: { instructions: prompt } })}`;
  let repair = false;
  let validationErrors: { code: string; path?: PropertyKey[] }[] = [];
  // At most two provider calls total: transient retry OR schema/reference repair.
  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await client.models.generateContent({
        model,
        contents: JSON.stringify({
          untrusted_data: data,
          ...(repair ? { validation_errors: validationErrors } : {}),
        }),
        config: {
          systemInstruction:
            instructions +
            (repair
              ? '\nRepair the invalid output using the SAME input and permitted IDs. Follow all task counts/limits. Do not invent facts to fill gaps.'
              : ''),
          responseMimeType: 'application/json',
          responseJsonSchema: providerSchema(schema),
          maxOutputTokens:
            task === 'profile' ? 1800 : task === 'comparison' || task === 'writing' ? 6000 : 3000,
          abortSignal: signal,
          httpOptions: { retryOptions: { attempts: 1 } },
        },
      });
    } catch (error) {
      const safe = providerError(error, signal.aborted);
      if (attempt === 0 && safe.retryable && !signal.aborted) {
        await delay(300, undefined, { signal }).catch(() => {});
        continue;
      }
      throw safe;
    }
    // Operational metadata only; never log prompts, error bodies or documents.
    console.info(
      'pilot_ai',
      JSON.stringify({
        task,
        model,
        attempt: attempt + 1,
        duration_ms: Date.now() - started,
        input_tokens: response.usageMetadata?.promptTokenCount,
        output_tokens: response.usageMetadata?.candidatesTokenCount,
        total_tokens: response.usageMetadata?.totalTokenCount,
      }),
    );
    try {
      const result = schema.parse(JSON.parse(response.text ?? ''));
      validate?.(result);
      return result;
    } catch (error) {
      validationErrors =
        error instanceof z.ZodError
          ? error.issues.map((issue) => ({ code: issue.code, path: issue.path }))
          : [{ code: error instanceof SyntaxError ? 'INVALID_JSON' : 'INVALID_REFERENCES' }];
      console.info(
        'pilot_ai_validation',
        JSON.stringify({ task, attempt: attempt + 1, errors: validationErrors }),
      );
      repair = true;
    }
  }
  throw new RequestError(
    'INVALID_AI_OUTPUT',
    'AI nəticəsi yoxlamadan keçmədi. Yenidən yoxlayın və ya əl ilə davam edin.',
    502,
  );
}
