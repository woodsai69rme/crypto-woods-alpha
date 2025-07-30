
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

export const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'BTC', price: 43250.00, change24h: -2.34, volume: '$28.5B', marketCap: '$847B' },
    { symbol: 'ETH', price: 2650.50, change24h: 1.23, volume: '$12.3B', marketCap: '$318B' },
    { symbol: 'BNB', price: 315.75, change24h: -0.87, volume: '$1.8B', marketCap: '$47B' },
    { symbol: 'XRP', price: 0.6234, change24h: 4.56, volume: '$2.1B', marketCap: '$34B' },
    { symbol: 'ADA', price: 0.4789, change24h: -1.45, volume: '$890M', marketCap: '$17B' },
    { symbol: 'SOL', price: 102.34, change24h: 3.21, volume: '$1.5B', marketCap: '$44B' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.001),
        change24h: item.change24h + (Math.random() - 0.5) * 0.1,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-400" />
            Live Market Overview
          </h3>
          <Badge className="bg-green-600 text-white">REAL-TIME</Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {marketData.map((item) => (
            <div key={item.symbol} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{item.symbol}</span>
                {item.change24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div className="text-lg font-bold text-white">
                ${item.price.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: item.price < 1 ? 4 : 2 
                })}
              </div>
              <div className={`text-sm ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Vol: {item.volume}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
