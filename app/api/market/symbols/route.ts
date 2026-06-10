import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getMarketDataProvider, MVP_MARKET_SYMBOLS } from '@/lib/market-data';
import {
  marketRateLimitResponse,
  withMarketMeta,
} from '@/lib/market-data/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimited = marketRateLimitResponse(session.user.id);
    if (rateLimited) return rateLimited;

    const { provider, meta } = getMarketDataProvider();
    const symbols = provider.getSupportedSymbols
      ? await provider.getSupportedSymbols()
      : MVP_MARKET_SYMBOLS;

    return NextResponse.json(withMarketMeta({ symbols }, meta));
  } catch (error) {
    console.error('[market/symbols]', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch symbols';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}