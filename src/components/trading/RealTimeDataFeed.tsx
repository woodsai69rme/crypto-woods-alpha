
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataFeedStatus {
  exchange: string;
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: Date;
  latency: number;
  dataPoints: number;
}

interface MarketUpdate {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: Date;
}

export const RealTimeDataFeed: React.FC = () => {
  const [feedStatus, setFeedStatus] = useState<DataFeedStatus[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<MarketUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [dataQuality, setDataQuality] = useState(85);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mock data feeds
    const initializeFeeds = () => {
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex'];
      const initialStatus: DataFeedStatus[] = exchanges.map(exchange => ({
        exchange,
        status: Math.random() > 0.1 ? 'connected' : 'disconnected',
        lastUpdate: new Date(),
        latency: Math.floor(Math.random() * 100) + 10,
        dataPoints: Math.floor(Math.random() * 1000) + 500
      }));
      
      setFeedStatus(initialStatus);
      setIsConnected(initialStatus.some(feed => feed.status === 'connected'));
    };

    initializeFeeds();

    // Simulate real-time market updates
    const marketInterval = setInterval(() => {
      const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
      const newUpdate: MarketUpdate = {
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        price: 40000 + Math.random() * 10000,
        change: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000,
        timestamp: new Date()
      };

      setMarketUpdates(prev => [newUpdate, ...prev.slice(0, 49)]);
    }, 2000);

    // Simulate feed status updates
    const statusInterval = setInterval(() => {
      setFeedStatus(prev => prev.map(feed => ({
        ...feed,
        lastUpdate: new Date(),
        latency: Math.floor(Math.random() * 100) + 10,
        dataPoints: feed.dataPoints + Math.floor(Math.random() * 10),
        status: Math.random() > 0.05 ? 'connected' : feed.status
      })));

      // Update data quality
      setDataQuality(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 10)));
    }, 5000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const handleReconnect = async (exchange: string) => {
    setFeedStatus(prev => prev.map(feed => 
      feed.exchange === exchange 
        ? { ...feed, status: 'connected', lastUpdate: new Date() }
        : feed
    ));
    
    toast({
      title: "Reconnected",
      description: `Successfully reconnected to ${exchange}`,
    });
  };

  const handleDisconnect = (exchange: string) => {
    setFeedStatus(prev => prev.map(feed => 
      feed.exchange === exchange 
        ? { ...feed, status: 'disconnected' }
        : feed
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'disconnected': return 'bg-red-600';
      case 'error': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const connectedFeeds = feedStatus.filter(feed => feed.status === 'connected').length;
  const totalFeeds = feedStatus.length;

  return (
    <div className="space-y-6">
      {/* Connection Overview */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Real-Time Data Feed Status
            {isConnected ? (
              <Badge className="bg-green-600 text-white">LIVE</Badge>
            ) : (
              <Badge className="bg-red-600 text-white">OFFLINE</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Connected Feeds</p>
                  <p className="text-2xl font-bold text-white">{connectedFeeds}/{totalFeeds}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Latency</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(feedStatus.reduce((acc, feed) => acc + feed.latency, 0) / feedStatus.length || 0)}ms
                  </p>
                </div>
                <Activity className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Data Quality</p>
                  <p className="text-2xl font-bold text-white">{dataQuality.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Updates/Min</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.floor(marketUpdates.length / 5) * 12}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Data Quality</span>
              <span className="text-sm text-white">{dataQuality.toFixed(1)}%</span>
            </div>
            <Progress value={dataQuality} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={autoReconnect} onCheckedChange={setAutoReconnect} />
              <span className="text-sm text-gray-300">Auto-reconnect</span>
            </div>
            <Button variant="outline" size="sm">
              Export Feed Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Exchange Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedStatus.map((feed) => (
              <div key={feed.exchange} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(feed.status)}
                  <div>
                    <p className="font-medium text-white">{feed.exchange}</p>
                    <p className="text-sm text-gray-400">
                      Last update: {feed.lastUpdate.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Latency</p>
                    <p className="text-white font-medium">{feed.latency}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Data Points</p>
                    <p className="text-white font-medium">{feed.dataPoints.toLocaleString()}</p>
                  </div>
                  <Badge className={getStatusColor(feed.status)}>
                    {feed.status.toUpperCase()}
                  </Badge>
                  {feed.status === 'disconnected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReconnect(feed.exchange)}
                    >
                      Reconnect
                    </Button>
                  )}
                  {feed.status === 'connected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDisconnect(feed.exchange)}
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Market Updates */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Live Market Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {marketUpdates.map((update, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  {update.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className="font-medium text-white">{update.symbol}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white font-medium">
                    ${update.price.toLocaleString()}
                  </span>
                  <span className={`font-medium ${update.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {update.change >= 0 ? '+' : ''}{update.change.toFixed(2)}%
                  </span>
                  <span className="text-gray-400">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
