
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedChart } from './AdvancedChart';
import { OrderBook } from './OrderBook';
import { PortfolioOverview } from './PortfolioOverview';
import { TradingPanel } from './TradingPanel';
import { MarketOverview } from './MarketOverview';
import { LiveSignals } from './LiveSignals';
import { LiquidityMap } from './LiquidityMap';
import { AIInsights } from './AIInsights';
import { AITradingBot } from './AITradingBot';
import { useTradingPairs, useMarketData, useAISignals } from '@/hooks/useTradingData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { AlertTriangle, Bot, TrendingUp, Zap } from 'lucide-react';

export const TradingDashboard: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  const { user } = useAuthContext();
  const { data: tradingPairs } = useTradingPairs();
  const { data: marketData } = useMarketData(selectedPairId);
  const { data: aiSignals } = useAISignals();

  // Mock AI trading bots data
  const mockBots = [
    {
      id: '1',
      name: 'Momentum Hunter',
      bot_type: 'momentum',
      is_running: true,
      performance_stats: {
        win_rate: 73.5,
        total_trades: 142,
        total_pnl: 2847.32,
        avg_trade_duration: '2h 15m'
      },
      config: {}
    },
    {
      id: '2',
      name: 'DCA Master',
      bot_type: 'dca',
      is_running: false,
      performance_stats: {
        win_rate: 68.2,
        total_trades: 89,
        total_pnl: 1523.18,
        avg_trade_duration: '1d 4h'
      },
      config: {}
    },
    {
      id: '3',
      name: 'Grid Trader Pro',
      bot_type: 'grid',
      is_running: true,
      performance_stats: {
        win_rate: 81.3,
        total_trades: 267,
        total_pnl: 4156.77,
        avg_trade_duration: '45m'
      },
      config: {}
    }
  ];

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

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Emergency Stop Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">CryptoAI Trading Platform</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={() => requireAuth(() => console.log('Emergency stop all bots'))}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            EMERGENCY STOP
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
      
      {/* AI Trading Bots Section */}
      {user && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-400" />
              AI Trading Bots
            </h2>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => console.log('Create new bot')}
            >
              <Bot className="h-4 w-4 mr-2" />
              Create Bot
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mockBots.map((bot) => (
              <AITradingBot key={bot.id} bot={bot} />
            ))}
          </div>
        </div>
      )}
      
      {/* Bottom Row - Portfolio, Signals, AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioOverview requireAuth={requireAuth} />
        <LiveSignals />
        <AIInsights />
      </div>

      {/* Real-time Audit Log */}
      {user && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Live Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Bot "Momentum Hunter" executed BUY order</span>
                <span className="text-gray-400">2s ago</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Portfolio rebalanced: +$247.83</span>
                <span className="text-gray-400">15s ago</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Liquidity zone updated: BTC resistance at $43,500</span>
                <span className="text-gray-400">32s ago</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">AI signal: STRONG BUY ETH (94% confidence)</span>
                <span className="text-gray-400">1m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};
