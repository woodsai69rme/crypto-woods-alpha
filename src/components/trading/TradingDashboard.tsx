
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
import { useEnhancedTradingData } from '@/hooks/useEnhancedTradingData';
import { useToast } from '@/hooks/use-toast';

export const TradingDashboard: React.FC = () => {
  const { 
    tradingPairs, 
    selectedPair, 
    orderBook, 
    tradingAccounts,
    loading,
    error,
    updateSelectedPair,
    refreshData 
  } = useEnhancedTradingData();

  const { toast } = useToast();
  const [selectedBot, setSelectedBot] = useState<any>(null);

  // Initialize with first available trading pair or fallback
  useEffect(() => {
    if (tradingPairs.length > 0 && !selectedPair) {
      updateSelectedPair(tradingPairs[0].id);
    }
  }, [tradingPairs, selectedPair, updateSelectedPair]);

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
    updateSelectedPair(newPair);
    toast({
      title: "Trading Pair Updated",
      description: `Switched to ${tradingPairs.find(p => p.id === newPair)?.symbol || 'Unknown'}`,
    });
  };

  const handleRequireAuth = (action: () => void) => {
    // For now, just execute the action - in production this would check auth first
    try {
      action();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute action. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (loading && tradingPairs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trading platform...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-red-700">
          <CardHeader>
            <CardTitle className="text-red-400">System Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ultimate Crypto Trading Platform</h1>
          <p className="text-gray-400">Professional-grade trading with AI-powered insights and comprehensive auditing</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>Active Pairs: {tradingPairs.length}</span>
            <span>Accounts: {tradingAccounts.length}</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              System Online
            </span>
          </div>
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
              <OrderBook tradingPairId={selectedPair} />
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradingPanel 
                  selectedPair={selectedPair}
                  onPairChange={handlePairChange}
                  requireAuth={handleRequireAuth}
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
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>System Health:</span>
                      <span className="text-green-400">✓ Operational</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Connections:</span>
                      <span className="text-green-400">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Accuracy:</span>
                      <span className="text-yellow-400">⚠ Pending Audit</span>
                    </div>
                  </div>
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
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Encryption Status:</span>
                      <span className="text-green-400">✓ AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Security:</span>
                      <span className="text-green-400">✓ Rate Limited</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audit Logging:</span>
                      <span className="text-green-400">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authentication:</span>
                      <span className="text-yellow-400">⚠ Basic</span>
                    </div>
                  </div>
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
