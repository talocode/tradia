/**
 * TradingView Widget Component
 * 
 * Embeds TradingView Advanced Real-Time Chart with safe client-side loading.
 * Falls back gracefully if TradingView scripts fail to load.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string;
  height?: number;
}

// Global type for TradingView
interface TradingViewWindow extends Window {
  TradingView?: {
    widget: new (config: Record<string, unknown>) => void;
  };
}

export default function TradingViewWidget({ 
  symbol = 'FX:EURUSD',
  height = 500 
}: TradingViewWidgetProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Cleanup function to handle component unmounting
    return () => {
      // Clean up widget container
      if (widgetRef.current && containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const loadTradingView = async (): Promise<void> => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Clear previous widget
        containerRef.current.innerHTML = '';

        // Check if script is already loaded
        const tvWindow = window as unknown as TradingViewWindow;
        
        if (!tvWindow.TradingView && !scriptLoadedRef.current) {
          // Load TradingView script
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => {
              scriptLoadedRef.current = true;
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load TradingView script'));
            document.head.appendChild(script);
          });
        }

        // Wait a bit for script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create widget
        if (tvWindow.TradingView && containerRef.current) {
          const widgetContainer = document.createElement('div');
          widgetContainer.id = `tradingview_widget_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
          widgetContainer.style.height = '100%';
          widgetContainer.style.width = '100%';
          containerRef.current.appendChild(widgetContainer);
          widgetRef.current = widgetContainer;

          new tvWindow.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: '60',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#0f1319',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: widgetContainer.id,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: 'https://www.tradingview.com',
            overrides: {
              'mainSeriesProperties.showCountdown': true,
              'paneProperties.background': '#0f1319',
              'paneProperties.vertGridProperties.color': '#1a1f2a',
              'paneProperties.horzGridProperties.color': '#1a1f2a',
            },
          });

          setIsLoading(false);
        } else {
          throw new Error('TradingView library not available');
        }
      } catch (err) {
        console.error('TradingView widget error:', err);
        setError('Chart temporarily unavailable');
        setIsLoading(false);
      }
    };

    loadTradingView();
  }, [symbol]);

  if (error) {
    return (
      <Card className="border-none bg-[#0f1319] shadow-sm ring-1 ring-gray-800 h-full">
        <CardHeader>
          <CardTitle className="text-white">Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">{error}</p>
            <p className="text-gray-600 text-xs mt-1">Symbol: {symbol}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-[#0f1319] shadow-sm ring-1 ring-gray-800 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          <span>Chart</span>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden" style={{ height }}>
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ minHeight: height }}
        />
      </CardContent>
    </Card>
  );
}
