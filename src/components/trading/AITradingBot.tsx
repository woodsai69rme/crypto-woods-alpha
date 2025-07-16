
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  DollarSign,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { AITradingService } from '@/services/aiTradingService';

interface AITradingBotProps {
  bot: {
    id: string;
    name: string;
    bot_type: string;
    is_running: boolean;
    performance_stats: any;
    config: any;
  };
}

export const AITradingBot: React.FC<AITradingBotProps> = ({ bot }) => {
  const [isRunning, setIsRunning] = useState(bot.is_running);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleBot = async () => {
    try {
      // In a real implementation, this would call the backend to start/stop the bot
      setIsRunning(!isRunning);
      console.log(`${isRunning ? 'Stopping' : 'Starting'} bot ${bot.name}`);
    } catch (error) {
      console.error('Error toggling bot:', error);
    }
  };

  const getBotTypeIcon = (type: string) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-4 w-4" />;
      case 'dca': return <DollarSign className="h-4 w-4" />;
      case 'grid': return <Activity className="h-4 w-4" />;
      case 'arbitrage': return <Zap className="h-4 w-4" />;
      case 'ml_predictor': return <Target className="h-4 w-4" />;
      case 'sentiment': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const performance = bot.performance_stats || {};
  const winRate = performance.win_rate || 0;
  const totalTrades = performance.total_trades || 0;
  const profitLoss = performance.total_pnl || 0;
  const avgTradeDuration = performance.avg_trade_duration || '0h 0m';

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          {getBotTypeIcon(bot.bot_type)}
          {bot.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isRunning ? "default" : "outline"}
            className={isRunning ? "bg-green-600 text-white" : "border-gray-600 text-gray-400"}
          >
            {isRunning ? 'Running' : 'Stopped'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bot controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isRunning}
                onCheckedChange={handleToggleBot}
              />
              <span className="text-sm text-gray-300">
                {isRunning ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleBot}
              className="flex items-center gap-1"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3 w-3" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Start
                </>
              )}
            </Button>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Win Rate</div>
              <div className="flex items-center gap-2">
                <Progress value={winRate} className="flex-1" />
                <span className="text-sm font-bold text-green-400">{winRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Total P&L</div>
              <div className={`text-sm font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(profitLoss)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Total Trades</div>
              <div className="text-sm font-bold text-white">{totalTrades}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Avg Duration</div>
              <div className="text-sm font-bold text-blue-400">{avgTradeDuration}</div>
            </div>
          </div>

          {/* Bot type specific information */}
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-xs text-gray-400 mb-2">Strategy: {bot.bot_type.toUpperCase()}</div>
            <div className="text-xs text-gray-300">
              {bot.bot_type === 'momentum' && 'Follows price momentum with dynamic stop-losses'}
              {bot.bot_type === 'dca' && 'Dollar-cost averaging with smart entry points'}
              {bot.bot_type === 'grid' && 'Grid trading with multiple buy/sell levels'}
              {bot.bot_type === 'arbitrage' && 'Cross-exchange arbitrage opportunities'}
              {bot.bot_type === 'ml_predictor' && 'AI-powered price prediction model'}
              {bot.bot_type === 'sentiment' && 'News and social sentiment analysis'}
            </div>
          </div>

          {/* Recent activity */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Recent Activity</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Last signal: BUY ETH/USDT</span>
                <span className="text-green-400">+2.34%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Confidence: 87%</span>
                <span className="text-gray-400">2m ago</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              View Logs
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              Backtest
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              Clone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
