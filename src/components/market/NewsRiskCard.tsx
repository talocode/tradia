/**
 * News Risk Card
 *
 * Placeholder for economic calendar and high-impact news events.
 * Shows upcoming news with impact levels.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsEvent } from '@/lib/market/forex-market-data';
import { 
  Newspaper, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Briefcase
} from 'lucide-react';

interface NewsRiskCardProps {
  events: NewsEvent[];
}

export default function NewsRiskCard({ 
  events 
}: NewsRiskCardProps): React.ReactElement {
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high':
        return 'bg-white text-black dark:bg-white dark:text-black';
      case 'medium':
        return 'bg-gray-500 text-white dark:bg-gray-500 dark:text-white';
      default:
        return 'bg-gray-700 text-gray-300 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CPI':
        return <BarChart3 className="w-3 h-3" />;
      case 'FOMC':
        return <Briefcase className="w-3 h-3" />;
      case 'NFP':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <DollarSign className="w-3 h-3" />;
    }
  };

  return (
    <Card className="border-none bg-[#161B22] shadow-sm ring-1 ring-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Newspaper className="w-4 h-4" />
          News Risk
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Events List */}
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-[#0f1319] border border-gray-800"
            >
              {/* Time */}
              <div className="flex-shrink-0 text-center min-w-[45px]">
                <Clock className="w-3 h-3 text-gray-500 mx-auto mb-1" />
                <span className="text-xs text-gray-400 font-mono">
                  {event.time}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-800" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium truncate">
                    {event.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getImpactColor(event.impact)}`}
                  >
                    {event.impact} impact
                  </Badge>
                  <span className="text-xs text-gray-500 font-mono">
                    {event.currency}
                  </span>
                </div>
              </div>

              {/* Type Icon */}
              <div className="text-gray-500">
                {getTypeIcon(event.type)}
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder Notice */}
        <div className="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-800 border-dashed">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">
                Economic calendar integration coming soon.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Connect real-time news feed to get live updates.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
