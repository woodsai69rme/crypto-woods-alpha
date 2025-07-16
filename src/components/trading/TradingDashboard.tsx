
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
import { AccountManager } from './AccountManager';
import { SocialTrading } from './SocialTrading';
import { AuditTrail } from './AuditTrail';
import { AdvancedBotManager } from './AdvancedBotManager';
import { ExchangeManager } from './ExchangeManager';
import { MLPredictions } from './MLPredictions';
import { NewsAnalysis } from './NewsAnalysis';
import { useTradingPairs, useMarketData, useAISignals } from '@/hooks/useTradingData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { 
  AlertTriangle, 
  Bot, 
  TrendingUp, 
  Zap, 
  Users, 
  Shield, 
  Settings, 
  Wallet,
  Brain,
  Newspaper,
  BarChart3,
  Webhook,
  Smartphone
} from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-10 bg-gray-800">
          <TabsTrigger value="trading" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI Bots
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            ML/AI
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="backtesting" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Backtest
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-1">
            <Newspaper className="h-3 w-3" />
            News
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Social
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
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

        <TabsContent value="ml" className="space-y-6">
          <MLPredictions />
        </TabsContent>

        <TabsContent value="exchanges" className="space-y-6">
          <ExchangeManager />
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Real-Time Data Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">✅ LIVE</div>
                  <div className="text-sm text-gray-400">Binance WebSocket</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">✅ LIVE</div>
                  <div className="text-sm text-gray-400">Coinbase Feed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">⚠️ DELAYED</div>
                  <div className="text-sm text-gray-400">Kraken API</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backtesting" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Backtesting Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Quick Backtest</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Strategy</label>
                      <select className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                        <option>SMA Crossover</option>
                        <option>RSI Mean Reversion</option>
                        <option>Bollinger Bands</option>
                        <option>MACD Signal</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm text-gray-400">From</label>
                        <input type="date" className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">To</label>
                        <input type="date" className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white" />
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Run Backtest
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Latest Results</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Return:</span>
                        <span className="text-green-400">+34.5%</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sharpe Ratio:</span>
                        <span className="text-blue-400">1.85</span>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Drawdown:</span>
                        <span className="text-red-400">-8.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <NewsAnalysis />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webhook Configuration */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">TradingView Webhook URL</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="https://your-domain.com/webhook/tradingview"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">External Signals Webhook</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="https://your-domain.com/webhook/signals"
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Save Webhook Settings
                </Button>
              </CardContent>
            </Card>

            {/* Telegram Bot Configuration */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Telegram Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Bot Token</label>
                  <input 
                    type="password" 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Chat ID</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="-1001234567890"
                  />
                </div>
                <div className="text-xs text-gray-400">
                  Get your bot token from @BotFather and chat ID from @userinfobot
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Connect Telegram Bot
                </Button>
              </CardContent>
            </Card>

            {/* Mobile App Info */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Mobile App</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Smartphone className="h-12 w-12 text-blue-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Mobile Trading App</h3>
                    <p className="text-gray-400">React Native app for iOS and Android</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button className="bg-black text-white">
                      📱 Download iOS
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      🤖 Download Android
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Dark Mode</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sound Alerts</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Push Notifications</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Advanced Features</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Market Data:</span>
                <Badge className="bg-green-600 text-white">LIVE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">AI Signals:</span>
                <Badge className="bg-green-600 text-white">ACTIVE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Trading Bots:</span>
                <Badge className="bg-blue-600 text-white">8 RUNNING</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">ML Models:</span>
                <Badge className="bg-purple-600 text-white">TRAINED</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Audit Trail:</span>
                <Badge className="bg-green-600 text-white">RECORDING</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Webhooks:</span>
                <Badge className="bg-yellow-600 text-white">READY</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};
