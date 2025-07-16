
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Eye, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface LiquidityLevel {
  price: number;
  volume: number;
  type: 'support' | 'resistance';
  strength: 'strong' | 'medium' | 'weak';
  bigOrders: number;
  marketMakerTarget: boolean;
}

export const LiquidityMap: React.FC = () => {
  const [liquidityLevels, setLiquidityLevels] = useState<LiquidityLevel[]>([]);
  const [currentPrice] = useState(43250);
  const [showBigOrders, setShowBigOrders] = useState(true);
  const [showTargets, setShowTargets] = useState(true);

  useEffect(() => {
    const generateLiquidityLevels = (): LiquidityLevel[] => {
      const levels: LiquidityLevel[] = [];
      
      // Generate support levels (below current price)
      for (let i = 1; i <= 8; i++) {
        const price = currentPrice - (i * 50) - Math.random() * 100;
        levels.push({
          price,
          volume: Math.random() * 1000000 + 100000,
          type: 'support',
          strength: i <= 3 ? 'strong' : i <= 6 ? 'medium' : 'weak',
          bigOrders: Math.floor(Math.random() * 15) + 5,
          marketMakerTarget: Math.random() > 0.7,
        });
      }
      
      // Generate resistance levels (above current price)
      for (let i = 1; i <= 8; i++) {
        const price = currentPrice + (i * 50) + Math.random() * 100;
        levels.push({
          price,
          volume: Math.random() * 1000000 + 100000,
          type: 'resistance',
          strength: i <= 3 ? 'strong' : i <= 6 ? 'medium' : 'weak',
          bigOrders: Math.floor(Math.random() * 15) + 5,
          marketMakerTarget: Math.random() > 0.7,
        });
      }
      
      return levels.sort((a, b) => b.price - a.price);
    };

    setLiquidityLevels(generateLiquidityLevels());
    
    // Real-time updates
    const interval = setInterval(() => {
      setLiquidityLevels(prev => prev.map(level => ({
        ...level,
        volume: level.volume * (1 + (Math.random() - 0.5) * 0.05),
        bigOrders: Math.max(1, level.bigOrders + Math.floor((Math.random() - 0.5) * 3)),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const maxVolume = Math.max(...liquidityLevels.map(l => l.volume));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-400" />
            Hyblock Liquidity Map
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={showBigOrders ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowBigOrders(!showBigOrders)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Big Orders
            </Button>
            <Button
              variant={showTargets ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowTargets(!showTargets)}
              className="text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              MM Targets
            </Button>
            <Badge className="bg-blue-600 text-white">REAL-TIME</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {liquidityLevels.map((level, index) => (
            <div key={index} className="relative">
              {/* Current Price Indicator */}
              {Math.abs(level.price - currentPrice) < 25 && index > 0 && (
                <div className="flex items-center justify-center py-2 my-2 bg-gray-900 rounded border border-yellow-500">
                  <div className="text-yellow-400 font-bold flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Current Price: ${currentPrice.toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3 relative overflow-hidden">
                {/* Volume Background Bar */}
                <div 
                  className={`absolute left-0 top-0 h-full opacity-20 ${
                    level.type === 'support' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(level.volume / maxVolume) * 100}%` }}
                />
                
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    {level.type === 'support' ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      level.type === 'support' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {level.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className={`w-2 h-2 rounded-full ${getStrengthColor(level.strength)}`} />
                  
                  <span className="text-white font-bold">
                    ${level.price.toFixed(2)}
                  </span>
                  
                  {showTargets && level.marketMakerTarget && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      MM TARGET
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm relative z-10">
                  <div className="text-right">
                    <div className="text-gray-400">Volume</div>
                    <div className="text-white font-medium">
                      ${(level.volume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  
                  {showBigOrders && (
                    <div className="text-right">
                      <div className="text-gray-400">Big Orders</div>
                      <div className="text-orange-400 font-medium">
                        {level.bigOrders}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          Liquidity zones show where big money is positioned for long/short entries
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="w-full h-2 bg-red-500 rounded mb-1 opacity-20"></div>
            <span className="text-gray-400">Strong Resistance</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-yellow-500 rounded mb-1 opacity-20"></div>
            <span className="text-gray-400">Medium Level</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-green-500 rounded mb-1 opacity-20"></div>
            <span className="text-gray-400">Strong Support</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
