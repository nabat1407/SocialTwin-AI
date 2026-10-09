import 'server-only';
import { z } from 'zod';

export class RequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public retryable = status === 429 || status >= 500,
  ) {
    super(message);
  }
}

// Conservative process-local safeguard for this local prototype. Not a distributed quota.
const buckets = new Map<string, { count: number; reset: number }>();
export async function readBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const origin = request.headers.get('origin');
  if (origin) {
    let source: URL;
    try {
      source = new URL(origin);
    } catch {
      throw new RequestError('FORBIDDEN', 'Bu sorğuya icazə yoxdur.', 403);
    }
    const target = new URL(request.url);
    const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
    const sameLocal =
      loopback.has(source.hostname) &&
      loopback.has(target.hostname) &&
      source.port === target.port &&
      source.protocol === target.protocol;
    if (source.origin !== target.origin && !sameLocal)
      throw new RequestError('FORBIDDEN', 'Bu sorğuya icazə yoxdur.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new RequestError('INVALID_INPUT', 'JSON sorğusu tələb olunur.', 415);
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset <= now) buckets.delete(key);
  // One shared local budget avoids trusting user-supplied forwarded IP headers.
  const key = 'local';
  const bucket = buckets.get(key) ?? { count: 0, reset: now + 60000 };
  if (++bucket.count > 30)
    throw new RequestError('RATE_LIMITED', 'Bir dəqiqə sonra yenidən yoxlayın.', 429);
  buckets.set(key, bucket);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError('INVALID_INPUT', 'Sorğu boşdur.');
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 40000) {
      await reader.cancel();
      throw new RequestError('INVALID_INPUT', 'Sorğu çox böyükdür.', 413);
    }
    chunks.push(value);
  }
  let json: unknown;
  try {
    json = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new RequestError('INVALID_INPUT', 'Sorğu oxuna bilmədi.');
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    throw new RequestError('INVALID_INPUT', 'Məlumatları yoxlayıb yenidən göndərin.');
  return parsed.data;
}

export function success(data: unknown) {
  return Response.json(
    { ok: true, schema_version: 'prototype-v3', trace_id: crypto.randomUUID(), data },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
export function failure(error: unknown) {
  const known = error instanceof RequestError;
  return Response.json(
    {
      ok: false,
      trace_id: crypto.randomUUID(),
      error: {
        code: known ? error.code : 'PROVIDER_UNAVAILABLE',
        message: known
          ? error.message
          : 'Hazırda nəticə hazırlamaq mümkün olmadı. Yenidən yoxlayın.',
        retryable: known ? error.retryable : true,
      },
    },
    { status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
