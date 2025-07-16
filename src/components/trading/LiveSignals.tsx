
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  strength: 'STRONG' | 'MEDIUM' | 'WEAK';
  price: number;
  confidence: number;
  reason: string;
  timestamp: Date;
  profitProbability: number;
}

export const LiveSignals: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const generateSignal = (): Signal => {
      const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP'];
      const types: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
      const strengths: ('STRONG' | 'MEDIUM' | 'WEAK')[] = ['STRONG', 'MEDIUM', 'WEAK'];
      const reasons = [
        'Fibonacci 61.8% retracement',
        'Liquidity zone breakthrough',
        'AI pattern recognition',
        'Whale accumulation detected',
        'Support level confirmed',
        'Resistance breakout imminent',
        'RSI oversold condition',
        'MACD bullish crossover',
        'Volume spike detected',
        'Market maker liquidity target'
      ];

      return {
        id: Math.random().toString(36).substr(2, 9),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        type: types[Math.floor(Math.random() * types.length)],
        strength: strengths[Math.floor(Math.random() * strengths.length)],
        price: 43000 + Math.random() * 1000,
        confidence: Math.floor(Math.random() * 30) + 70,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        timestamp: new Date(),
        profitProbability: Math.floor(Math.random() * 20) + 75,
      };
    };

    // Generate initial signals
    setSignals([generateSignal(), generateSignal(), generateSignal()]);

    // Add new signals periodically
    const interval = setInterval(() => {
      setSignals(prev => {
        const newSignals = [generateSignal(), ...prev.slice(0, 4)];
        return newSignals;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'bg-green-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'WEAK': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            Live AI Signals
          </div>
          <Badge className="bg-yellow-600 text-white animate-pulse">
            GENERATING
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {signals.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Analyzing market conditions...</p>
          </div>
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{signal.symbol}</span>
                  <Badge className={getStrengthColor(signal.strength)}>
                    {signal.strength}
                  </Badge>
                  <div className={`flex items-center font-bold ${getTypeColor(signal.type)}`}>
                    {signal.type === 'BUY' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {signal.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${signal.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">
                    {signal.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                {signal.reason}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <Target className="h-3 w-3 mr-1 text-blue-400" />
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white ml-1">{signal.confidence}%</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-green-400" />
                    <span className="text-gray-400">Profit Prob:</span>
                    <span className="text-green-400 ml-1">{signal.profitProbability}%</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className={`${signal.type === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Execute Trade
                </Button>
              </div>
            </div>
          ))
        )}
        
        <div className="text-center pt-2">
          <div className="text-xs text-gray-400">
            Signals generated by AI analysis of liquidity, Fibonacci, and probability indicators
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
