
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Target,
  BarChart3,
  Brain,
  Layers,
  Activity
} from 'lucide-react';

interface AdvancedBot {
  id: string;
  name: string;
  type: 'momentum' | 'dca' | 'grid' | 'arbitrage' | 'ml_predictor' | 'sentiment' | 'scalping' | 'market_making';
  status: 'running' | 'stopped' | 'paused';
  account: string;
  winRate: number;
  totalTrades: number;
  dailyPnL: number;
  totalPnL: number;
  riskScore: number;
  currentPosition?: {
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    unrealizedPnL: number;
  };
  lastSignal?: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timestamp: string;
  };
  settings: {
    maxPositionSize: number;
    riskPerTrade: number;
    stopLoss: number;
    takeProfit: number;
  };
}

export const AdvancedBotManager: React.FC = () => {
  const [bots, setBots] = useState<AdvancedBot[]>([
    {
      id: '1',
      name: 'Quantum Momentum Pro',
      type: 'momentum',
      status: 'running',
      account: 'Primary Paper',
      winRate: 78.5,
      totalTrades: 342,
      dailyPnL: 247.83,
      totalPnL: 3456.78,
      riskScore: 6.2,
      currentPosition: {
        symbol: 'BTC/USDT',
        side: 'long',
        size: 0.025,
        entryPrice: 43120,
        unrealizedPnL: 67.45
      },
      lastSignal: {
        action: 'BUY',
        confidence: 89,
        timestamp: '2024-01-15T10:30:00Z'
      },
      settings: {
        maxPositionSize: 1000,
        riskPerTrade: 2,
        stopLoss: 3,
        takeProfit: 6
      }
    },
    {
      id: '2',
      name: 'DCA Master v3',
      type: 'dca',
      status: 'running',
      account: 'Conservative Strategy',
      winRate: 85.2,
      totalTrades: 156,
      dailyPnL: 89.23,
      totalPnL: 1789.45,
      riskScore: 3.8,
      settings: {
        maxPositionSize: 500,
        riskPerTrade: 1,
        stopLoss: 5,
        takeProfit: 10
      }
    },
    {
      id: '3',
      name: 'Grid Trader Elite',
      type: 'grid',
      status: 'running',
      account: 'Aggressive Strategy',
      winRate: 72.4,
      totalTrades: 1247,
      dailyPnL: -34.56,
      totalPnL: 2134.67,
      riskScore: 7.9,
      currentPosition: {
        symbol: 'ETH/USDT',
        side: 'short',
        size: 1.2,
        entryPrice: 2580,
        unrealizedPnL: -23.45
      },
      settings: {
        maxPositionSize: 2000,
        riskPerTrade: 3,
        stopLoss: 2,
        takeProfit: 4
      }
    },
    {
      id: '4',
      name: 'AI Sentiment Analyzer',
      type: 'sentiment',
      status: 'paused',
      account: 'AI Testing',
      winRate: 81.7,
      totalTrades: 89,
      dailyPnL: 0,
      totalPnL: 567.89,
      riskScore: 5.5,
      lastSignal: {
        action: 'HOLD',
        confidence: 64,
        timestamp: '2024-01-15T09:15:00Z'
      },
      settings: {
        maxPositionSize: 750,
        riskPerTrade: 1.5,
        stopLoss: 4,
        takeProfit: 8
      }
    },
    {
      id: '5',
      name: 'Scalping Beast',
      type: 'scalping',
      status: 'running',
      account: 'High Frequency',
      winRate: 68.9,
      totalTrades: 2847,
      dailyPnL: 156.78,
      totalPnL: 4567.23,
      riskScore: 8.7,
      settings: {
        maxPositionSize: 300,
        riskPerTrade: 0.5,
        stopLoss: 1,
        takeProfit: 1.5
      }
    },
    {
      id: '6',
      name: 'Market Maker Pro',
      type: 'market_making',
      status: 'running',
      account: 'Market Making',
      winRate: 74.3,
      totalTrades: 1834,
      dailyPnL: 203.45,
      totalPnL: 2890.12,
      riskScore: 6.8,
      settings: {
        maxPositionSize: 1500,
        riskPerTrade: 1.8,
        stopLoss: 2.5,
        takeProfit: 3.5
      }
    }
  ]);

  const getBotIcon = (type: string) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-4 w-4" />;
      case 'dca': return <BarChart3 className="h-4 w-4" />;
      case 'grid': return <Layers className="h-4 w-4" />;
      case 'arbitrage': return <Zap className="h-4 w-4" />;
      case 'ml_predictor': return <Brain className="h-4 w-4" />;
      case 'sentiment': return <Target className="h-4 w-4" />;
      case 'scalping': return <Activity className="h-4 w-4" />;
      case 'market_making': return <Target className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600';
      case 'stopped': return 'bg-red-600';
      case 'paused': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const toggleBot = (botId: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: bot.status === 'running' ? 'paused' : 'running' }
        : bot
    ));
  };

  const emergencyStopAll = () => {
    setBots(prev => prev.map(bot => ({ ...bot, status: 'stopped' as const })));
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          Advanced AI Trading Bots
          <Badge className="bg-blue-600 text-white">{bots.filter(b => b.status === 'running').length} ACTIVE</Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={emergencyStopAll}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            🚨 EMERGENCY STOP ALL
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Summary */}
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  +${bots.reduce((sum, bot) => sum + bot.totalPnL, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Total P&L</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  +${bots.reduce((sum, bot) => sum + bot.dailyPnL, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Daily P&L</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {bots.reduce((sum, bot) => sum + bot.totalTrades, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {(bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Avg Win Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {bots.filter(b => b.currentPosition).length}
                </div>
                <div className="text-sm text-gray-400">Open Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Bots */}
        <div className="grid gap-4">
          {bots.map((bot) => (
            <Card key={bot.id} className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getBotIcon(bot.type)}
                      <span className="text-white font-bold">{bot.name}</span>
                    </div>
                    <Badge className={getStatusColor(bot.status)}>
                      {bot.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {bot.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={bot.status === 'running'}
                      onCheckedChange={() => toggleBot(bot.id)}
                    />
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Account</div>
                    <div className="text-white font-medium">{bot.account}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-green-400 font-bold">{bot.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Trades</div>
                    <div className="text-white font-medium">{bot.totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Risk Score</div>
                    <div className={`font-bold ${getRiskColor(bot.riskScore)}`}>
                      {bot.riskScore}/10
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Daily P&L</div>
                    <div className={`text-lg font-bold ${bot.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.dailyPnL >= 0 ? '+' : ''}${bot.dailyPnL.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total P&L</div>
                    <div className={`text-lg font-bold ${bot.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.totalPnL >= 0 ? '+' : ''}${bot.totalPnL.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Current Position */}
                {bot.currentPosition && (
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-400 mb-2">Current Position</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white ml-2">{bot.currentPosition.symbol}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Side:</span>
                        <Badge className={bot.currentPosition.side === 'long' ? 'bg-green-600' : 'bg-red-600'} size="sm">
                          {bot.currentPosition.side.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white ml-2">{bot.currentPosition.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Unrealized P&L:</span>
                        <span className={`ml-2 ${bot.currentPosition.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.currentPosition.unrealizedPnL >= 0 ? '+' : ''}${bot.currentPosition.unrealizedPnL.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Signal */}
                {bot.lastSignal && (
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-400 mb-2">Last Signal</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          bot.lastSignal.action === 'BUY' ? 'bg-green-600' : 
                          bot.lastSignal.action === 'SELL' ? 'bg-red-600' : 'bg-gray-600'
                        }>
                          {bot.lastSignal.action}
                        </Badge>
                        <span className="text-white">Confidence: {bot.lastSignal.confidence}%</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(bot.lastSignal.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Max Position:</span>
                    <span className="text-white ml-1">${bot.settings.maxPositionSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Risk/Trade:</span>
                    <span className="text-white ml-1">{bot.settings.riskPerTrade}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 ml-1">{bot.settings.stopLoss}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-green-400 ml-1">{bot.settings.takeProfit}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
