import { NextResponse } from 'next/server';
import type { MarketDataMeta } from './types';
import { checkRateLimit } from './rate-limit';

export function marketRateLimitResponse(clientKey: string) {
  const result = checkRateLimit(`market:${clientKey}`);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}

export function withMarketMeta<T extends Record<string, unknown>>(
  payload: T,
  meta: MarketDataMeta
) {
  return { ...payload, meta };
}