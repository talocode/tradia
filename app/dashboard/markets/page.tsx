'use client';

import React, { useEffect, useState } from 'react';
import LayoutClient from '@/components/LayoutClient';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import AccountSwitcher from '@/components/dashboard/AccountSwitcher';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedDropdown from '@/components/ui/AnimatedDropdown';
import MarketChart from '@/components/market/MarketChart';
import MarketInsightPanel from '@/components/market/MarketInsightPanel';
import SymbolSelector from '@/components/market/SymbolSelector';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTrade } from '@/context/TradeContext';
import { User, Settings, Menu, X, LineChart } from 'lucide-react';
import type { MarketSymbol, MarketQuote } from '@/lib/market-data/types';
import { MVP_MARKET_SYMBOLS } from '@/lib/market-data/symbols';

type DashboardTabDef = {
  value: string;
  label: string;
  icon: string;
  href?: string;
};

const BASE_TAB_DEFS: DashboardTabDef[] = [
  { value: 'dashboard', label: 'Prop Dashboard', icon: 'Activity', href: '/dashboard' },
  { value: 'overview', label: 'Overview', icon: 'BarChart3', href: '/dashboard/overview' },
  { value: 'history', label: 'Trade History', icon: 'History', href: '/dashboard/trade-history' },
  { value: 'journal', label: 'Trade Journal', icon: 'BookOpen', href: '/dashboard/trade-journal' },
  { value: 'analytics', label: 'Trade Analytics', icon: 'TrendingUp', href: '/dashboard/trade-analytics' },
  { value: 'chat', label: 'Tradia AI', icon: 'Bot', href: '/dashboard/trades/chat' },
  { value: 'tradia-predict', label: 'Tradia Predict', icon: 'Brain', href: '/tradia-predict' },
  { value: 'markets', label: 'Live Markets', icon: 'TrendingUp', href: '/dashboard/markets' },
  { value: 'risk', label: 'Risk Management', icon: 'Shield', href: '/dashboard/risk-management' },
  { value: 'reporting', label: 'Reporting', icon: 'FileText', href: '/dashboard/reporting' },
  { value: 'pre-trade-brief', label: 'Pre-Trade Brief', icon: 'FileText', href: '/dashboard/pre-trade-brief' },
  { value: 'planner', label: 'Trade Planner', icon: 'Target', href: '/dashboard/trade-planner' },
  { value: 'position-sizing', label: 'Position Sizing', icon: 'Calculator', href: '/dashboard/position-sizing' },
  { value: 'education', label: 'Trade Education', icon: 'GraduationCap', href: '/dashboard/trade-education' },
  { value: 'upgrade', label: 'Upgrade', icon: 'Crown', href: '/dashboard/upgrade' },
];

const DEFAULT_SYMBOL = 'OANDA:EUR_USD';

function MarketsPageContent(): React.ReactElement {
  const { data: session } = useSession();
  const router = useRouter();
  const { trades } = useTrade();
  const [activeTab, setActiveTab] = useState('markets');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [symbols, setSymbols] = useState<MarketSymbol[]>(MVP_MARKET_SYMBOLS);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [providerLabel, setProviderLabel] = useState('Finnhub');
  const [degraded, setDegraded] = useState(false);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const response = await fetch('/api/market/symbols');
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.symbols?.length) {
          setSymbols(payload.symbols);
        }
        if (payload.meta) {
          setProviderLabel(
            payload.meta.provider === 'finnhub' ? 'Finnhub' : 'Mock (MVP)'
          );
          setDegraded(Boolean(payload.meta.degraded));
        }
      } catch {
        // keep defaults
      }
    };
    loadSymbols();
  }, []);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const response = await fetch(
          `/api/market/quote?symbol=${encodeURIComponent(selectedSymbol)}`
        );
        if (!response.ok) return;
        const payload = await response.json();
        setQuote(payload.quote ?? null);
        if (payload.meta) {
          setProviderLabel(
            payload.meta.provider === 'finnhub' ? 'Finnhub' : 'Mock (MVP)'
          );
          setDegraded(Boolean(payload.meta.degraded));
        }
      } catch {
        setQuote(null);
      }
    };
    loadQuote();
  }, [selectedSymbol]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full sticky top-0">
      <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-[#2a2f3a]">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <LineChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">Tradia</h1>
          <p className="text-gray-500 text-xs">Live Market Charts</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
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
          trigger={
            <button
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--surface-secondary)] dark:bg-transparent hover:bg-[var(--surface-hover)] dark:hover:bg-gray-700 transition-colors"
              aria-label="Open account menu"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={session?.user?.image ?? ''}
                  alt={session?.user?.name ?? session?.user?.email ?? 'Profile'}
                />
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {userInitial}
                </AvatarFallback>
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
          }
        >
          <div className="p-2">
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-left text-black dark:text-white font-light rounded-md"
            >
              <User className="w-4 h-4" /> <span>Profile</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-left text-black dark:text-white font-light rounded-md"
            >
              <Settings className="w-4 h-4" /> <span>Settings</span>
            </button>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-left text-red-600 dark:text-red-400 font-light rounded-md"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </AnimatedDropdown>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-white dark:bg-[#0f1319] transition-colors duration-300 overflow-x-hidden">
      <div className="flex min-h-screen max-w-full">
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-gray-50 dark:bg-[#0D1117] border-r border-gray-200 dark:border-[#2a2f3a]">
          <SidebarContent />
        </div>

        <div
          className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-white dark:bg-[#161B22] border-r border-gray-200 dark:border-[#2a2f3a] overflow-y-auto">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-[#2a2f3a] bg-white dark:bg-[#0D1117] sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  Live Market Chart
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Real-time charts connected to your trading journal and risk intelligence.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SymbolSelector
                symbols={symbols}
                value={selectedSymbol}
                onChange={setSelectedSymbol}
              />
              <AccountSwitcher />
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MarketChart
                  symbol={selectedSymbol}
                  providerLabel={providerLabel}
                  degraded={degraded}
                  trades={trades}
                />
              </div>
              <div>
                <MarketInsightPanel
                  symbol={selectedSymbol}
                  quote={quote}
                  providerLabel={providerLabel}
                  degraded={degraded}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}

export default function MarketsPage(): React.ReactElement {
  return (
    <LayoutClient>
      <MarketsPageContent />
    </LayoutClient>
  );
}