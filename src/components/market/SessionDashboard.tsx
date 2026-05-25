/**
 * Session Dashboard
 * 
 * Displays trading session status with active/upcoming/closed states.
 * Includes typical pairs and volatility warnings.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TradingSession } from '@/lib/market/forex-market-data';
import { Clock, Globe, Activity, AlertTriangle, CheckCircle, Hourglass } from 'lucide-react';

interface SessionDashboardProps {
  sessions: TradingSession[];
}

export default function SessionDashboard({ 
  sessions 
}: SessionDashboardProps): React.ReactElement {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'upcoming':
        return <Hourglass className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-white text-black dark:bg-white dark:text-black';
      case 'upcoming':
        return 'bg-gray-600 text-white dark:bg-gray-500 dark:text-white';
      default:
        return 'bg-gray-800 text-gray-500 dark:bg-gray-900 dark:text-gray-600';
    }
  };

  const getVolatilityIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <Card className="border-none bg-[#161B22] shadow-sm ring-1 ring-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Trading Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`
                p-3 rounded-lg border transition-all
                ${session.status === 'active' 
                  ? 'bg-white border-white dark:bg-white dark:border-white' 
                  : 'bg-[#0f1319] border-gray-800'}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(session.status)}
                  <span className={`font-medium text-sm ${
                    session.status === 'active' ? 'text-black' : 'text-white'
                  }`}>
                    {session.name}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(session.status)}
                >
                  {session.status}
                </Badge>
              </div>

              {/* City */}
              <p className={`text-xs mb-2 ${
                session.status === 'active' ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {session.city}
              </p>

              {/* Time */}
              <div className={`text-xs font-mono mb-2 ${
                session.status === 'active' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {session.localStartTime} - {session.localEndTime} UTC
              </div>

              {/* Typical Pairs */}
              <div className="flex flex-wrap gap-1 mb-2">
                {session.typicalPairs.map((pair) => (
                  <span
                    key={pair}
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      session.status === 'active' 
                        ? 'bg-gray-200 text-black' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {pair}
                  </span>
                ))}
              </div>

              {/* Caution Note */}
              <div className={`flex items-start gap-1.5 text-xs ${
                session.status === 'active' ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {getVolatilityIcon(session.volatilityLevel)}
                <span>{session.cautionNote}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
