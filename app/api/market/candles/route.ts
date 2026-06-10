import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import {
  getMarketDataProvider,
  validateCandlesParams,
} from '@/lib/market-data';
import {
  marketRateLimitResponse,
  withMarketMeta,
} from '@/lib/market-data/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimited = marketRateLimitResponse(session.user.id);
    if (rateLimited) return rateLimited;

    const params = request.nextUrl.searchParams;
    const validation = validateCandlesParams(
      params.get('symbol'),
      params.get('resolution'),
      params.get('from'),
      params.get('to')
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { provider, meta } = getMarketDataProvider();
    const candles = await provider.getCandles(
      validation.symbol!,
      validation.resolution!,
      validation.from!,
      validation.to!
    );

    return NextResponse.json(
      withMarketMeta(
        {
          symbol: validation.symbol,
          resolution: validation.resolution,
          candles,
        },
        meta
      )
    );
  } catch (error) {
    console.error('[market/candles]', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch candles';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}