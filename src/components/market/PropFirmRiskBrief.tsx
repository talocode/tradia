/**
 * Prop Firm Risk Brief
 * 
 * AI-style intelligence brief specific to prop firm trading risks.
 * Highlights key risks and cautions for funded traders.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBriefItem } from '@/lib/market/forex-market-data';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Shield, 
  Info 
} from 'lucide-react';

interface PropFirmRiskBriefProps {
  briefs: RiskBriefItem[];
}

export default function PropFirmRiskBrief({ 
  briefs 
}: PropFirmRiskBriefProps): React.ReactElement {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="w-4 h-4" />;
      case 'volatility':
        return <AlertTriangle className="w-4 h-4" />;
      case 'session':
        return <Clock className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-black text-white dark:bg-white dark:text-black';
      case 'medium':
        return 'bg-gray-600 text-white dark:bg-gray-400 dark:text-black';
      default:
        return 'bg-gray-300 text-black dark:bg-gray-700 dark:text-white';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'strength':
        return 'Strength';
      case 'volatility':
        return 'Volatility';
      case 'session':
        return 'Session';
      default:
        return 'General';
    }
  };

  return (
    <Card className="border-none bg-gradient-to-br from-gray-900 to-black shadow-sm ring-1 ring-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Today&apos;s Prop Firm Risk Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Brief Items */}
        <div className="space-y-3">
          {briefs.map((brief) => (
            <div
              key={brief.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#161B22] border border-gray-800"
            >
              <div className="flex-shrink-0 mt-0.5 text-gray-400">
                {getTypeIcon(brief.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPriorityColor(brief.priority)}`}
                  >
                    {brief.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {getTypeLabel(brief.type)}
                  </span>
                  {brief.symbol && (
                    <span className="text-xs text-gray-400 font-mono">
                      {brief.symbol}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {brief.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-start gap-2">
          <Info className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Market data may be delayed or mocked. This is not financial advice. 
            Always respect your prop firm&apos;s daily loss limits and risk parameters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
