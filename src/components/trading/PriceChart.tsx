
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Zap } from 'lucide-react';

interface ChartData {
  time: string;
  price: number;
  volume: number;
  fibonacci618: number;
  fibonacci382: number;
  support: number;
  resistance: number;
}

export const PriceChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState('1H');
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);

  // Generate realistic price data with Fibonacci levels
  useEffect(() => {
    const generateData = () => {
      const basePrice = 43250;
      const data: ChartData[] = [];
      
      for (let i = 0; i < 100; i++) {
        const time = new Date(Date.now() - (100 - i) * 60000).toLocaleTimeString();
        const volatility = 0.002;
        const price = basePrice + (Math.sin(i * 0.1) * 500) + (Math.random() - 0.5) * basePrice * volatility;
        
        // Calculate Fibonacci levels
        const high = basePrice + 1000;
        const low = basePrice - 1000;
        const range = high - low;
        
        data.push({
          time,
          price,
          volume: Math.random() * 1000000 + 500000,
          fibonacci618: low + range * 0.618,
          fibonacci382: low + range * 0.382,
          support: basePrice - 800,
          resistance: basePrice + 800,
        });
      }
      
      return data;
    };

    setChartData(generateData());
    
    // Real-time updates
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = prev[prev.length - 1]?.price || 43250;
        const newPrice = lastPrice + (Math.random() - 0.5) * 50;
        
        newData.push({
          time: new Date().toLocaleTimeString(),
          price: newPrice,
          volume: Math.random() * 1000000 + 500000,
          fibonacci618: 43250 + 1000 * 0.618 - 1000,
          fibonacci382: 43250 + 1000 * 0.382 - 1000,
          support: 42450,
          resistance: 44050,
        });
        
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            BTC/USDT - TradingView Quality Chart
            <Badge className="ml-2 bg-green-600 text-white">LIVE</Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={showFibonacci ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFibonacci(!showFibonacci)}
              className="text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              Fibonacci
            </Button>
            <Button
              variant={showLiquidity ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowLiquidity(!showLiquidity)}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Liquidity
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className="text-xs px-2 py-1"
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={['dataMin - 200', 'dataMax + 200']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              
              {/* Fibonacci Levels */}
              {showFibonacci && (
                <>
                  <ReferenceLine 
                    y={chartData[0]?.fibonacci618} 
                    stroke="#F59E0B" 
                    strokeDasharray="5 5"
                    label={{ value: "Fib 61.8%", position: "right" }}
                  />
                  <ReferenceLine 
                    y={chartData[0]?.fibonacci382} 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    label={{ value: "Fib 38.2%", position: "right" }}
                  />
                </>
              )}
              
              {/* Support/Resistance */}
              {showLiquidity && (
                <>
                  <ReferenceLine 
                    y={chartData[0]?.support} 
                    stroke="#10B981" 
                    strokeDasharray="3 3"
                    label={{ value: "Support", position: "right" }}
                  />
                  <ReferenceLine 
                    y={chartData[0]?.resistance} 
                    stroke="#EF4444" 
                    strokeDasharray="3 3"
                    label={{ value: "Resistance", position: "right" }}
                  />
                </>
              )}
              
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Current Price</div>
            <div className="text-white font-bold">
              ${chartData[chartData.length - 1]?.price.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">24h Change</div>
            <div className="text-red-400 font-bold">-2.34%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Volume</div>
            <div className="text-white font-bold">$28.5B</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Market Cap</div>
            <div className="text-white font-bold">$847B</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
