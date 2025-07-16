
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceChart } from './PriceChart';
import { OrderBook } from './OrderBook';
import { PortfolioOverview } from './PortfolioOverview';
import { TradingPanel } from './TradingPanel';
import { MarketOverview } from './MarketOverview';
import { LiveSignals } from './LiveSignals';
import { LiquidityMap } from './LiquidityMap';
import { AIInsights } from './AIInsights';

export const TradingDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Top Market Overview */}
      <MarketOverview />
      
      {/* Main Trading Interface */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Charts and Analysis */}
        <div className="col-span-8 space-y-6">
          <PriceChart />
          <LiquidityMap />
        </div>
        
        {/* Right Column - Trading Panel and Order Book */}
        <div className="col-span-4 space-y-6">
          <TradingPanel />
          <OrderBook />
        </div>
      </div>
      
      {/* Bottom Row - Portfolio, Signals, AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioOverview />
        <LiveSignals />
        <AIInsights />
      </div>
    </div>
  );
};
