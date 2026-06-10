/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketChart from '../MarketChart';

describe('MarketChart', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/market/quote')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            quote: {
              symbol: 'OANDA:EUR_USD',
              price: 1.0842,
              change: 0.001,
              changePercent: 0.1,
              high: 1.09,
              low: 1.08,
              open: 1.083,
              previousClose: 1.082,
              timestamp: 1710000000,
            },
            meta: { provider: 'mock', degraded: true, message: 'MVP mock feed' },
          }),
        }) as Promise<Response>;
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          candles: [
            { time: 1710000000, open: 1.08, high: 1.09, low: 1.07, close: 1.085, volume: 100 },
          ],
          meta: { provider: 'mock', degraded: true },
        }),
      }) as Promise<Response>;
    }) as jest.Mock;
  });

  it('renders loading then chart content', async () => {
    render(
      <MarketChart
        symbol="OANDA:EUR_USD"
        providerLabel="Mock (MVP)"
        degraded
        trades={[]}
      />
    );

    expect(screen.getByText(/OANDA:EUR_USD/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1.0842')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to load quote' }),
    });

    render(
      <MarketChart symbol="OANDA:EUR_USD" providerLabel="Mock (MVP)" trades={[]} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load quote/i)).toBeInTheDocument();
    });
  });
});