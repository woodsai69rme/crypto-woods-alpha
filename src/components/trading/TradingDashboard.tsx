
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketOverview } from './MarketOverview';
import { PortfolioOverview } from './PortfolioOverview';
import { PriceChart } from './PriceChart';
import { OrderBook } from './OrderBook';
import { TransactionHistory } from './TransactionHistory';
import { TradingPanel } from './TradingPanel';
import { AIInsights } from './AIInsights';
import { LiveSignals } from './LiveSignals';
import { NewsAnalysis } from './NewsAnalysis';
import { AITradingBot } from './AITradingBot';
import { MLPredictions } from './MLPredictions';
import { SocialTrading } from './SocialTrading';
import { AccountManager } from './AccountManager';
import { ExchangeManager } from './ExchangeManager';
import { TestingPanel } from './TestingPanel';
import { SystemStatusPanel } from './SystemStatusPanel';
import { RealDataDashboard } from './RealDataDashboard';
import { ComprehensiveAuditDashboard } from './ComprehensiveAuditDashboard';
import { TestScenarioRunner } from './TestScenarioRunner';
import { SecurityHardeningPanel } from './SecurityHardeningPanel';
import { AuditTrail } from './AuditTrail';
import { Activity, Shield, Zap, Database, TrendingUp, Users } from 'lucide-react';

export const TradingDashboard: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('680c340f-4bdf-42a6-9896-18c3acdfd04b');
  const [selectedBot, setSelectedBot] = useState<any>(null);

  // Mock bot data for now
  useEffect(() => {
    setSelectedBot({
      id: '1',
      name: 'Demo Trading Bot',
      strategy: 'Momentum Trading',
      isRunning: false,
      balance: 10000,
      pnl: 0,
      trades: 0,
      winRate: 0
    });
  }, []);

  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ultimate Crypto Trading Platform</h1>
          <p className="text-gray-400">Professional-grade trading with AI-powered insights and comprehensive auditing</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-gray-900">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Management</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PriceChart />
              </div>
              <div>
                <MarketOverview />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioOverview />
              <OrderBook />
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradingPanel 
                  selectedPair={selectedPair}
                  onPairChange={handlePairChange}
                  requireAuth={true}
                />
              </div>
              <div className="space-y-6">
                <LiveSignals />
                <TransactionHistory />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsights />
              <MLPredictions />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewsAnalysis />
              <SocialTrading />
            </div>
            {selectedBot && (
              <AITradingBot bot={selectedBot} />
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AccountManager />
              <ExchangeManager />
            </div>
            <SystemStatusPanel />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <ComprehensiveAuditDashboard />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestingPanel />
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Test Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Run comprehensive test scenarios to validate your trading system before real money deployment.
                  </p>
                </CardContent>
              </Card>
            </div>
            <TestScenarioRunner />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <RealDataDashboard />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SecurityHardeningPanel />
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Monitor security status, review audit trails, and manage access controls for your trading platform.
                  </p>
                </CardContent>
              </Card>
            </div>
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
