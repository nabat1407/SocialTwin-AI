import { GoogleGenAI } from '@google/genai';

// Run with node --env-file=.env.local scripts/check-gemini.mjs.
// This authentication probe uses no personal input and generates no tokens.
const started = Date.now();
try {
  if (!process.env.GEMINI_API_KEY) throw Object.assign(new Error(), { status: 0 });
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = await client.models.list({
    config: { pageSize: 100, httpOptions: { timeout: 15000, retryOptions: { attempts: 1 } } },
  });
  const wanted = [process.env.GEMINI_MODEL_PROFILE, process.env.GEMINI_MODEL_WRITING].filter(
    Boolean,
  );
  const available = [];
  for await (const model of models) {
    const id = model.name?.replace(/^models\//, '');
    if (wanted.includes(id)) available.push(id);
  }
  console.log(
    JSON.stringify({ ok: true, available_models: available, duration_ms: Date.now() - started }),
  );
} catch (error) {
  // Never print the SDK's message/body/URL: it may include credentials or request data.
  const status = typeof error?.status === 'number' ? error.status : null;
  let reason;
  try {
    const details = JSON.parse(error.message)?.error?.details;
    const value = details?.find((detail) => detail.reason)?.reason;
    if (['API_KEY_INVALID', 'API_KEY_EXPIRED', 'API_KEY_SERVICE_BLOCKED'].includes(value))
      reason = value;
  } catch {
    /* Provider bodies are untrusted. */
  }
  console.log(JSON.stringify({ ok: false, status, reason, duration_ms: Date.now() - started }));
  process.exitCode = 1;
}
