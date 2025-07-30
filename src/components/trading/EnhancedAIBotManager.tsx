import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Play, 
  Pause, 
  Square,
  AlertTriangle, 
  Activity,
  MemoryStick,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';
import { EnhancedAITradingService } from '@/services/enhancedAITradingService';
import { useEnhancedAIBots, useSystemHealth } from '@/hooks/useEnhancedTradingData';
import { useToast } from '@/hooks/use-toast';

export const EnhancedAIBotManager: React.FC = () => {
  const { data: bots, isLoading, refetch } = useEnhancedAIBots();
  const { data: systemHealth } = useSystemHealth();
  const { toast } = useToast();
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

  const handleStartBot = async (botId: string) => {
    setOperationInProgress(botId);
    try {
      const success = await EnhancedAITradingService.startBot(botId);
      if (success) {
        toast({
          title: "Bot Started",
          description: "AI trading bot is now active",
        });
        refetch();
      } else {
        throw new Error('Failed to start bot');
      }
    } catch (error) {
      toast({
        title: "Start Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  const handleStopBot = async (botId: string) => {
    setOperationInProgress(botId);
    try {
      const success = await EnhancedAITradingService.stopBot(botId);
      if (success) {
        toast({
          title: "Bot Stopped",
          description: "AI trading bot has been stopped",
        });
        refetch();
      } else {
        throw new Error('Failed to stop bot');
      }
    } catch (error) {
      toast({
        title: "Stop Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  const handleEmergencyStop = async () => {
    setOperationInProgress('emergency');
    try {
      await EnhancedAITradingService.emergencyStopAllBots();
      toast({
        title: "Emergency Stop Activated",
        description: "All AI trading bots have been stopped",
        variant: "destructive",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Emergency Stop Failed",
        description: "Could not stop all bots",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  const getStatusColor = (isRunning: boolean, errorCount: number) => {
    if (errorCount > 3) return 'text-red-400';
    if (!isRunning) return 'text-gray-400';
    return 'text-green-400';
  };

  const getMemoryUsageColor = (usage: number) => {
    if (usage > 80) return 'text-red-400';
    if (usage > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin" />
          <span>Loading enhanced AI bots...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      {systemHealth && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Memory Usage</div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  <Progress value={systemHealth.memoryUsage} className="flex-1" />
                  <span className={`text-sm font-bold ${getMemoryUsageColor(systemHealth.memoryUsage)}`}>
                    {systemHealth.memoryUsage}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Active Bots</div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-lg font-bold text-white">{systemHealth.activeBots}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Total Errors</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-lg font-bold text-red-400">{systemHealth.totalErrors}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">System Status</div>
                <Badge 
                  variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {systemHealth.status}
                </Badge>
              </div>
            </div>
            
            {systemHealth.status !== 'healthy' && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  System health is {systemHealth.status}. 
                  {systemHealth.status === 'critical' ? ' Consider stopping some bots to reduce load.' : ' Monitor system closely.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Controls */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              disabled={operationInProgress === 'emergency'}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              {operationInProgress === 'emergency' ? 'Stopping All...' : 'Emergency Stop All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Bot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots?.map((bot) => (
          <Card key={bot.id} className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {bot.name}
                </div>
                <Badge 
                  variant={bot.is_running ? "default" : "outline"}
                  className={bot.is_running ? "bg-green-600 text-white" : "border-gray-600 text-gray-400"}
                >
                  {bot.is_running ? 'Running' : 'Stopped'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bot Type & Strategy */}
              <div className="text-sm">
                <div className="text-gray-400">Strategy</div>
                <div className="text-white font-medium capitalize">{bot.bot_type.replace('_', ' ')}</div>
              </div>

              {/* Enhanced Performance Metrics */}
              {bot.enhancedState && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="flex items-center gap-2">
                      <Progress value={bot.enhancedState.performance.winRate} className="flex-1" />
                      <span className="text-xs font-bold text-green-400">
                        {bot.enhancedState.performance.winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Total P&L</div>
                    <div className={`text-sm font-bold ${
                      bot.enhancedState.performance.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${bot.enhancedState.performance.profitLoss.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Trades</div>
                    <div className="text-sm font-bold text-white">
                      {bot.enhancedState.performance.totalTrades}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Errors</div>
                    <div className="text-sm font-bold text-red-400">
                      {bot.enhancedState.errorCount}
                    </div>
                  </div>
                </div>
              )}

              {/* Memory Usage */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Memory Usage</div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-3 w-3" />
                  <Progress value={bot.memoryUsage} className="flex-1" />
                  <span className={`text-xs ${getMemoryUsageColor(bot.memoryUsage)}`}>
                    {bot.memoryUsage}MB
                  </span>
                </div>
              </div>

              {/* Last Error Display */}
              {bot.lastError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Last Error: {bot.lastError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Enhanced Controls */}
              <div className="flex gap-2">
                {bot.is_running ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStopBot(bot.id)}
                    disabled={operationInProgress === bot.id}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Pause className="h-3 w-3" />
                    {operationInProgress === bot.id ? 'Stopping...' : 'Stop'}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStartBot(bot.id)}
                    disabled={operationInProgress === bot.id}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    {operationInProgress === bot.id ? 'Starting...' : 'Start'}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Logs
                </Button>
              </div>

              {/* Last Activity */}
              {bot.enhancedState?.lastSignalTime && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last signal: {new Date(bot.enhancedState.lastSignalTime).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Bots Message */}
      {!bots || bots.length === 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-bold text-white mb-2">No AI Trading Bots</h3>
            <p className="text-gray-400 mb-4">
              Create your first AI trading bot to start automated trading.
            </p>
            <Button>Create New Bot</Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};