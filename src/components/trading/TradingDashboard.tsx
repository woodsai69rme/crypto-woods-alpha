
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedChart } from './AdvancedChart';
import { OrderBook } from './OrderBook';
import { PortfolioOverview } from './PortfolioOverview';
import { TradingPanel } from './TradingPanel';
import { MarketOverview } from './MarketOverview';
import { LiveSignals } from './LiveSignals';
import { LiquidityMap } from './LiquidityMap';
import { AIInsights } from './AIInsights';
import { AITradingBot } from './AITradingBot';
import { AccountManager } from './AccountManager';
import { SocialTrading } from './SocialTrading';
import { AuditTrail } from './AuditTrail';
import { AdvancedBotManager } from './AdvancedBotManager';
import { useTradingPairs, useMarketData, useAISignals } from '@/hooks/useTradingData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { AlertTriangle, Bot, TrendingUp, Zap, Users, Shield, Settings, Wallet } from 'lucide-react';

export const TradingDashboard: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');
  
  const { user } = useAuthContext();
  const { data: tradingPairs } = useTradingPairs();
  const { data: marketData } = useMarketData(selectedPairId);
  const { data: aiSignals } = useAISignals();

  // Generate mock price data for charts
  const generateMockPriceData = (basePrice: number) => {
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000).toLocaleTimeString();
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1;
      data.push({ timestamp, price });
    }
    return data;
  };

  const currentPrice = marketData?.[0]?.price ? Number(marketData[0].price) : 43250;
  const priceData = generateMockPriceData(currentPrice);

  // Find selected trading pair
  React.useEffect(() => {
    if (tradingPairs && tradingPairs.length > 0) {
      const pair = tradingPairs.find(p => p.symbol === selectedPair) || tradingPairs[0];
      setSelectedPairId(pair.id);
    }
  }, [tradingPairs, selectedPair]);

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    action();
  };

  const emergencyStopAll = () => {
    requireAuth(() => {
      console.log('🚨 EMERGENCY STOP ALL BOTS ACTIVATED');
      // In real implementation, this would stop all active bots
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Emergency Stop Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Ultimate CryptoAI Trading Platform</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse"
            onClick={emergencyStopAll}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            🚨 EMERGENCY STOP ALL
          </Button>
          {!user && (
            <Button
              onClick={() => setShowLoginDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Top Market Overview */}
      <MarketOverview />

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          {/* Main Trading Interface */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Charts and Analysis */}
            <div className="col-span-8 space-y-6">
              <AdvancedChart 
                tradingPairId={selectedPairId}
                symbol={selectedPair}
                currentPrice={currentPrice}
                priceData={priceData}
              />
              <LiquidityMap tradingPairId={selectedPairId} />
            </div>
            
            {/* Right Column - Trading Panel and Order Book */}
            <div className="col-span-4 space-y-6">
              <TradingPanel 
                selectedPair={selectedPair}
                onPairChange={setSelectedPair}
                requireAuth={requireAuth}
              />
              <OrderBook tradingPairId={selectedPairId} />
            </div>
          </div>
          
          {/* Bottom Row - Portfolio, Signals, AI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PortfolioOverview requireAuth={requireAuth} />
            <LiveSignals />
            <AIInsights />
          </div>
        </TabsContent>

        <TabsContent value="bots" className="space-y-6">
          <AdvancedBotManager />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <AccountManager />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialTrading />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                Settings panel coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time System Status */}
      {user && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Live System Status
              <Badge className="bg-green-600 text-white animate-pulse">ALL SYSTEMS OPERATIONAL</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Market Data Feed:</span>
                <Badge className="bg-green-600 text-white">LIVE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">AI Signal Engine:</span>
                <Badge className="bg-green-600 text-white">ACTIVE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Trading Bots:</span>
                <Badge className="bg-blue-600 text-white">6 RUNNING</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Audit Logger:</span>
                <Badge className="bg-green-600 text-white">RECORDING</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};
