
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Target, Layers } from 'lucide-react';
import { useFibonacciLevels, useLiquidityZones } from '@/hooks/useTradingData';

interface AdvancedChartProps {
  tradingPairId: string;
  symbol: string;
  currentPrice: number;
  priceData: any[];
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({
  tradingPairId,
  symbol,
  currentPrice,
  priceData,
}) => {
  const [timeframe, setTimeframe] = useState('1h');
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  
  const { data: fibLevels } = useFibonacciLevels(tradingPairId);
  const { data: liquidityZones } = useLiquidityZones(tradingPairId);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '$0.00';
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const getFibonacciColor = (level: string) => {
    const colors = {
      '236': '#ff6b6b',
      '382': '#4ecdc4',
      '500': '#45b7d1',
      '618': '#96ceb4',
      '786': '#ffeaa7',
    };
    return colors[level as keyof typeof colors] || '#ffffff';
  };

  const getLiquidityColor = (zone: any) => {
    if (zone.zone_type === 'support') return '#10b981';
    if (zone.zone_type === 'resistance') return '#ef4444';
    if (zone.zone_type === 'supply') return '#f59e0b';
    return '#8b5cf6';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          {symbol} Advanced Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={showFibonacci ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFibonacci(!showFibonacci)}
            className="text-xs"
          >
            <Target className="h-3 w-3 mr-1" />
            Fibonacci
          </Button>
          <Button
            variant={showLiquidity ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLiquidity(!showLiquidity)}
            className="text-xs"
          >
            <Layers className="h-3 w-3 mr-1" />
            Liquidity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeframe selector */}
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* Current price and change */}
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white">
              {formatPrice(currentPrice)}
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.45%
            </Badge>
          </div>

          {/* Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatPrice}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
                
                {/* Fibonacci levels */}
                {showFibonacci && fibLevels && fibLevels.length > 0 && (
                  <>
                    {fibLevels[0].level_236 && (
                      <ReferenceLine 
                        y={Number(fibLevels[0].level_236)} 
                        stroke={getFibonacciColor('236')}
                        strokeDasharray="5 5"
                        label={{ value: "23.6%", position: "right" }}
                      />
                    )}
                    {fibLevels[0].level_382 && (
                      <ReferenceLine 
                        y={Number(fibLevels[0].level_382)} 
                        stroke={getFibonacciColor('382')}
                        strokeDasharray="5 5"
                        label={{ value: "38.2%", position: "right" }}
                      />
                    )}
                    {fibLevels[0].level_618 && (
                      <ReferenceLine 
                        y={Number(fibLevels[0].level_618)} 
                        stroke={getFibonacciColor('618')}
                        strokeDasharray="5 5"
                        label={{ value: "61.8%", position: "right" }}
                      />
                    )}
                  </>
                )}

                {/* Liquidity zones */}
                {showLiquidity && liquidityZones && liquidityZones.map((zone, index) => (
                  <ReferenceLine 
                    key={index}
                    y={Number(zone.price_level)} 
                    stroke={getLiquidityColor(zone)}
                    strokeWidth={zone.strength === 'strong' ? 3 : zone.strength === 'medium' ? 2 : 1}
                    strokeDasharray="3 3"
                    label={{ 
                      value: `${zone.zone_type.toUpperCase()} - ${zone.strength}`, 
                      position: "left",
                      style: { fontSize: '10px' }
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Technical indicators summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">RSI</div>
              <div className="text-sm font-bold text-yellow-400">67.8</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">MACD</div>
              <div className="text-sm font-bold text-green-400">Bullish</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">BB</div>
              <div className="text-sm font-bold text-blue-400">Upper</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">Vol</div>
              <div className="text-sm font-bold text-purple-400">High</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
