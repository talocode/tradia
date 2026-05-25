/**
 * Forex Market Intelligence Page
 *
 * A comprehensive forex market dashboard for prop firm traders.
 * Includes market overview, heatmap, TradingView charts, sessions,
 * watchlist, prop firm risk brief, and news risk.
 */

'use client';

import React, { useState } from 'react';
import LayoutClient from '@/components/LayoutClient';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import AccountSwitcher from '@/components/dashboard/AccountSwitcher';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedDropdown from '@/components/ui/AnimatedDropdown';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Menu,
  X,
  Globe,
  TrendingUp,
  Shield,
} from 'lucide-react';

// Market components
import MarketOverviewCards from '@/components/market/MarketOverviewCards';
import ForexHeatmap from '@/components/market/ForexHeatmap';
import TradingViewWidget from '@/components/market/TradingViewWidget';
import SessionDashboard from '@/components/market/SessionDashboard';
import PropFirmRiskBrief from '@/components/market/PropFirmRiskBrief';
import MarketWatchlist from '@/components/market/MarketWatchlist';
import NewsRiskCard from '@/components/market/NewsRiskCard';

// Mock data
import {
  mockForexPairs,
  mockCurrencyStrengths,
  mockTradingSessions,
  mockWatchlist,
  mockRiskBrief,
  mockNewsEvents,
  tradingViewSymbols,
} from '@/lib/market/forex-market-data';

// --- Tab Definitions ---
type DashboardTabDef = {
  value: string;
  label: string;
  icon: string;
  href?: string;
};

const BASE_TAB_DEFS: DashboardTabDef[] = [
  { value: "dashboard", label: "Prop Dashboard", icon: "Activity", href: "/dashboard" },
  { value: "overview", label: "Overview", icon: "BarChart3", href: "/dashboard/overview" },
  { value: "history", label: "Trade History", icon: "History", href: "/dashboard/trade-history" },
  { value: "journal", label: "Trade Journal", icon: "BookOpen", href: "/dashboard/trade-journal" },
  { value: "analytics", label: "Trade Analytics", icon: "TrendingUp", href: "/dashboard/trade-analytics" },
  { value: "chat", label: "Tradia AI", icon: "Bot", href: "/dashboard/trades/chat" },
  { value: "tradia-predict", label: "Tradia Predict", icon: "Brain", href: "/tradia-predict" },
  { value: "market", label: "Forex Market", icon: "Globe", href: "/dashboard/market" },
  { value: "risk", label: "Risk Management", icon: "Shield", href: "/dashboard/risk-management" },
  { value: "reporting", label: "Reporting", icon: "FileText", href: "/dashboard/reporting" },
  { value: "pre-trade-brief", label: "Pre-Trade Brief", icon: "FileText", href: "/dashboard/pre-trade-brief" },
  { value: "planner", label: "Trade Planner", icon: "Target", href: "/dashboard/trade-planner" },
  { value: "position-sizing", label: "Position Sizing", icon: "Calculator", href: "/dashboard/position-sizing" },
  { value: "education", label: "Trade Education", icon: "GraduationCap", href: "/dashboard/trade-education" },
  { value: "upgrade", label: "Upgrade", icon: "Crown", href: "/dashboard/upgrade" },
];

function ForexMarketPageContent(): React.ReactElement {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("market");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chart symbol state
  const [selectedSymbol, setSelectedSymbol] = useState('FX:EURUSD');
  
  // Find display name for selected symbol
  const selectedSymbolData = tradingViewSymbols.find(s => s.symbol === selectedSymbol);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";

  // Handle pair selection from overview or watchlist
  const handleSelectPair = (symbol: string) => {
    // Map common symbols to TradingView format
    const symbolMap: Record<string, string> = {
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD',
      'USDJPY': 'FX:USDJPY',
      'XAUUSD': 'OANDA:XAUUSD',
      'US30': 'CAPITALCOM:US30',
      'NAS100': 'CAPITALCOM:US100',
      'GBPJPY': 'FX:GBPJPY',
    };
    
    const tvSymbol = symbolMap[symbol] || `FX:${symbol}`;
    setSelectedSymbol(tvSymbol);
  };

  // Shared Sidebar Rendering Logic
  const SidebarContent = () => (
    <>
      <div className="flex flex-col h-full sticky top-0">
        <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-[#2a2f3a]">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">Tradia</h1>
            <p className="text-gray-500 dark:text-gray-500 text-xs">Market Intelligence</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Account Switcher - Visible in mobile sidebar */}
          <div className="lg:hidden mb-4">
            <AccountSwitcher />
          </div>
          <DashboardSidebar tabs={BASE_TAB_DEFS} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="p-4 border-t border-[var(--surface-border)] dark:border-[#2a2f3a]">
          <AnimatedDropdown
            title="Account"
            panelClassName="w-[95%] max-w-sm"
            positionClassName="left-4 top-16"
            trigger={(
              <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--surface-secondary)] dark:bg-transparent hover:bg-[var(--surface-hover)] dark:hover:bg-gray-700 transition-colors" aria-label="Open account menu">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? session?.user?.email ?? "Profile"} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-[var(--text-primary)] dark:text-white text-sm font-medium truncate">
                    {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[var(--text-muted)] dark:text-gray-400 text-xs truncate">
                    {session?.user?.email || ''}
                  </p>
                </div>
              </button>
            )}
          >
            <div className="p-2">
              <button onClick={() => router.push("/dashboard/profile")} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-left text-black dark:text-white font-light rounded-md">
                <User className="w-4 h-4" /> <span>Profile</span>
              </button>
              <button onClick={() => router.push("/dashboard/settings")} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-left text-black dark:text-white font-light rounded-md">
                <Settings className="w-4 h-4" /> <span>Settings</span>
              </button>
              <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-left text-red-600 dark:text-red-400 font-light rounded-md">
                <span>Sign Out</span>
              </button>
            </div>
          </AnimatedDropdown>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen w-full bg-white dark:bg-[#0f1319] transition-colors duration-300 overflow-x-hidden">
      <div className="flex min-h-screen max-w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-gray-50 dark:bg-[#0D1117] border-r border-gray-200 dark:border-[#2a2f3a]">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-white dark:bg-[#161B22] border-r border-gray-200 dark:border-[#2a2f3a] overflow-y-auto">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
            <SidebarContent />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#0D1117] sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Forex Market Intelligence
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Track currency strength, active sessions, volatile pairs, and prop firm risk before you trade.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AccountSwitcher />
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Market Overview Cards */}
              <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market Overview
                </h2>
                <MarketOverviewCards 
                  pairs={mockForexPairs}
                  onSelectPair={handleSelectPair}
                  selectedPair={selectedSymbol.split(':')[1] || selectedSymbol}
                />
              </section>

              {/* Main Grid: Chart + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Panel */}
                <div className="lg:col-span-2">
                  <TradingViewWidget 
                    symbol={selectedSymbol}
                    height={500}
                  />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Watchlist */}
                  <MarketWatchlist 
                    items={mockWatchlist}
                    selectedSymbol={selectedSymbol.split(':')[1] || selectedSymbol}
                    onSelectSymbol={handleSelectPair}
                  />

                  {/* Session Dashboard */}
                  <SessionDashboard sessions={mockTradingSessions} />
                </div>
              </div>

              {/* Secondary Grid: Heatmap + Risk Brief + News */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Forex Heatmap */}
                <div className="lg:col-span-1">
                  <ForexHeatmap 
                    currencies={mockCurrencyStrengths}
                    pairs={mockForexPairs}
                  />
                </div>

                {/* Prop Firm Risk Brief */}
                <div className="lg:col-span-1">
                  <PropFirmRiskBrief briefs={mockRiskBrief} />
                </div>

                {/* News Risk */}
                <div className="lg:col-span-1">
                  <NewsRiskCard events={mockNewsEvents} />
                </div>
              </div>

              {/* Footer Disclaimer */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <strong>Disclaimer:</strong> TradiaAI is not a broker. Market information is educational and may be delayed. 
                      Nothing here is financial advice. Always do your own analysis and respect your prop firm&apos;s risk parameters.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                      Trading foreign exchange and CFDs carries a high level of risk and may not be suitable for all investors. 
                      Past performance is not indicative of future results.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </main>
  );
}

export default function ForexMarketPage(): React.ReactElement {
  return (
    <LayoutClient>
      <ForexMarketPageContent />
    </LayoutClient>
  );
}
