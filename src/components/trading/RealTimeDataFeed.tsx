
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Wifi, WifiOff, Activity, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { CryptoDataService } from '@/services/cryptoDataService';
import { OpenRouterService } from '@/services/openRouterService';

interface DataSource {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: string;
  requestCount: number;
  errorCount: number;
  latency: number;
}

interface RealTimePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  timestamp: string;
  source: string;
}

export const RealTimeDataFeed: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { name: 'CoinGecko', status: 'disconnected', lastUpdate: '', requestCount: 0, errorCount: 0, latency: 0 },
    { name: 'Binance', status: 'disconnected', lastUpdate: '', requestCount: 0, errorCount: 0, latency: 0 },
    { name: 'CoinCap', status: 'disconnected', lastUpdate: '', requestCount: 0, errorCount: 0, latency: 0 },
    { name: 'Kraken', status: 'disconnected', lastUpdate: '', requestCount: 0, errorCount: 0, latency: 0 },
    { name: 'OpenRouter AI', status: 'disconnected', lastUpdate: '', requestCount: 0, errorCount: 0, latency: 0 }
  ]);

  const [realTimePrices, setRealTimePrices] = useState<RealTimePrice[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);
  const [successRate, setSuccessRate] = useState(100);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'BNBUSDT'];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAllData();
      }, refreshInterval);

      // Initial fetch
      fetchAllData();

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchAllData = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Test CoinGecko
      const coinGeckoStart = Date.now();
      try {
        const coinGeckoPrices = await CryptoDataService.getCoinGeckoPrices(symbols);
        updateDataSource('CoinGecko', 'connected', coinGeckoPrices.length > 0, Date.now() - coinGeckoStart);
        
        coinGeckoPrices.forEach(price => {
          setRealTimePrices(prev => {
            const filtered = prev.filter(p => !(p.symbol === price.symbol && p.source === 'CoinGecko'));
            return [...filtered, { ...price, source: 'CoinGecko' }];
          });
        });
      } catch (error) {
        updateDataSource('CoinGecko', 'error', false, Date.now() - coinGeckoStart);
      }

      // Test Binance
      const binanceStart = Date.now();
      try {
        const binancePrices = await CryptoDataService.getBinancePrices(symbols);
        updateDataSource('Binance', 'connected', binancePrices.length > 0, Date.now() - binanceStart);
        
        binancePrices.forEach(price => {
          setRealTimePrices(prev => {
            const filtered = prev.filter(p => !(p.symbol === price.symbol && p.source === 'Binance'));
            return [...filtered, { ...price, source: 'Binance' }];
          });
        });
      } catch (error) {
        updateDataSource('Binance', 'error', false, Date.now() - binanceStart);
      }

      // Test CoinCap
      const coinCapStart = Date.now();
      try {
        const coinCapPrices = await CryptoDataService.getCoinCapPrices(symbols);
        updateDataSource('CoinCap', 'connected', coinCapPrices.length > 0, Date.now() - coinCapStart);
        
        coinCapPrices.forEach(price => {
          setRealTimePrices(prev => {
            const filtered = prev.filter(p => !(p.symbol === price.symbol && p.source === 'CoinCap'));
            return [...filtered, { ...price, source: 'CoinCap' }];
          });
        });
      } catch (error) {
        updateDataSource('CoinCap', 'error', false, Date.now() - coinCapStart);
      }

      // Test Kraken
      const krakenStart = Date.now();
      try {
        const krakenPrices = await CryptoDataService.getKrakenPrices(symbols);
        updateDataSource('Kraken', 'connected', krakenPrices.length > 0, Date.now() - krakenStart);
        
        krakenPrices.forEach(price => {
          setRealTimePrices(prev => {
            const filtered = prev.filter(p => !(p.symbol === price.symbol && p.source === 'Kraken'));
            return [...filtered, { ...price, source: 'Kraken' }];
          });
        });
      } catch (error) {
        updateDataSource('Kraken', 'error', false, Date.now() - krakenStart);
      }

      setTotalRequests(prev => prev + 1);
      
      // Calculate success rate
      const connected = dataSources.filter(ds => ds.status === 'connected').length;
      const total = dataSources.length - 1; // Exclude OpenRouter from this calculation
      setSuccessRate((connected / total) * 100);

    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDataSource = (name: string, status: 'connected' | 'disconnected' | 'error', success: boolean, latency: number) => {
    setDataSources(prev => prev.map(ds => {
      if (ds.name === name) {
        return {
          ...ds,
          status,
          lastUpdate: new Date().toISOString(),
          requestCount: ds.requestCount + 1,
          errorCount: success ? ds.errorCount : ds.errorCount + 1,
          latency
        };
      }
      return ds;
    }));
  };

  const testOpenRouter = async () => {
    const apiKey = prompt('Enter your OpenRouter API key:');
    if (!apiKey) return;

    OpenRouterService.setApiKey(apiKey);
    
    const start = Date.now();
    try {
      await OpenRouterService.analyzeMarketSentiment({
        symbol: 'BTCUSDT',
        price: 43000,
        change24h: 2.5,
        volume: 1000000
      });
      
      updateDataSource('OpenRouter AI', 'connected', true, Date.now() - start);
    } catch (error) {
      updateDataSource('OpenRouter AI', 'error', false, Date.now() - start);
      console.error('OpenRouter test failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const groupedPrices = symbols.map(symbol => {
    const symbolPrices = realTimePrices.filter(p => p.symbol === symbol);
    const avgPrice = symbolPrices.length > 0 
      ? symbolPrices.reduce((sum, p) => sum + p.price, 0) / symbolPrices.length 
      : 0;
    const avgChange = symbolPrices.length > 0 
      ? symbolPrices.reduce((sum, p) => sum + p.change24h, 0) / symbolPrices.length 
      : 0;
    
    return {
      symbol,
      avgPrice,
      avgChange,
      sources: symbolPrices
    };
  });

  return (
    <div className="space-y-6">
      {/* Data Source Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Real-Time Data Sources
            <Badge className={isLoading ? 'bg-yellow-600' : 'bg-green-600'}>
              {isLoading ? 'FETCHING' : 'LIVE'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Auto Refresh:</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
            <Button onClick={fetchAllData} disabled={isLoading} size="sm">
              Refresh Now
            </Button>
            <div className="text-sm text-gray-400">
              Success Rate: {successRate.toFixed(1)}%
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <Card key={source.name} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(source.status)}
                      <span className="font-medium text-white">{source.name}</span>
                    </div>
                    <Badge className={getStatusColor(source.status)}>
                      {source.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Requests:</span>
                      <span>{source.requestCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Errors:</span>
                      <span className={source.errorCount > 0 ? 'text-red-400' : ''}>{source.errorCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Latency:</span>
                      <span>{source.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Last Update:</span>
                      <span>
                        {source.lastUpdate 
                          ? new Date(source.lastUpdate).toLocaleTimeString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  {source.name === 'OpenRouter AI' && source.status === 'disconnected' && (
                    <Button 
                      onClick={testOpenRouter}
                      size="sm" 
                      className="w-full mt-2"
                      variant="outline"
                    >
                      Connect API Key
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Price Feed */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-green-400" />
            Live Price Aggregation
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {groupedPrices.map((group) => (
              <div key={group.symbol} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">{group.symbol}</span>
                    <span className="text-xl font-bold text-white">
                      ${group.avgPrice.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${group.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {group.avgChange >= 0 ? '+' : ''}{group.avgChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {group.sources.length} source{group.sources.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {group.sources.map((price, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                      <div className="text-gray-400">{price.source}</div>
                      <div className="text-white font-medium">${price.price.toFixed(2)}</div>
                      <div className={price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">API Success Rate</span>
                <span className="text-white">{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{totalRequests}</div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{realTimePrices.length}</div>
                <div className="text-sm text-gray-400">Live Prices</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {dataSources.filter(ds => ds.status === 'connected').length}
                </div>
                <div className="text-sm text-gray-400">Active Sources</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
