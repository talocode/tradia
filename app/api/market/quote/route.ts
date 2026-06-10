import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import {
  getMarketDataProvider,
  validateSymbolParam,
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

    const symbolParam = request.nextUrl.searchParams.get('symbol');
    const validation = validateSymbolParam(symbolParam);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { provider, meta } = getMarketDataProvider();
    const quote = await provider.getQuote(validation.symbol!);

    return NextResponse.json(withMarketMeta({ quote }, meta));
  } catch (error) {
    console.error('[market/quote]', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch quote';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}