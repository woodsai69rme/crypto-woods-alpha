
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, Zap } from 'lucide-react';
import { useTradingPairs } from '@/hooks/useTradingData';
import { AITradingService } from '@/services/aiTradingService';
import { PortfolioService } from '@/services/portfolioService';

interface TradingPanelProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  requireAuth: (action: () => void) => void;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  selectedPair,
  onPairChange,
  requireAuth,
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiProbability, setAiProbability] = useState<number | null>(null);

  const { data: tradingPairs } = useTradingPairs();

  const handleCalculateProbability = async () => {
    requireAuth(async () => {
      if (!selectedPair) return;
      
      setIsLoading(true);
      try {
        const pair = tradingPairs?.find(p => p.symbol === selectedPair);
        if (pair) {
          const probability = await AITradingService.calculateTradeProbability(
            pair.id,
            side === 'buy' ? 'long' : 'short'
          );
          setAiProbability(probability);
        }
      } catch (error) {
        console.error('Error calculating probability:', error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handlePlaceOrder = async () => {
    requireAuth(async () => {
      if (!quantity || (orderType !== 'market' && !price)) return;
      
      setIsLoading(true);
      try {
        // For demo purposes, we'll place a mock order
        const pair = tradingPairs?.find(p => p.symbol === selectedPair);
        if (pair) {
          // This would normally create a real order
          console.log('Placing order:', {
            pair: selectedPair,
            side,
            quantity: Number(quantity),
            orderType,
            price: price ? Number(price) : undefined,
          });
          
          // Reset form
          setQuantity('');
          setPrice('');
          setAiProbability(null);
        }
      } catch (error) {
        console.error('Error placing order:', error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const formatProbability = (prob: number) => {
    const percentage = (prob * 100).toFixed(1);
    const confidence = prob > 0.7 ? 'HIGH' : prob > 0.5 ? 'MEDIUM' : 'LOW';
    const color = prob > 0.7 ? 'text-green-400' : prob > 0.5 ? 'text-yellow-400' : 'text-red-400';
    return { percentage, confidence, color };
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          Trading Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pair Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Trading Pair</label>
            <Select value={selectedPair} onValueChange={onPairChange}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {tradingPairs?.map((pair) => (
                  <SelectItem key={pair.id} value={pair.symbol} className="text-white">
                    {pair.symbol} - {pair.exchange}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="spot" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="spot" className="text-white">Spot Trading</TabsTrigger>
              <TabsTrigger value="ai" className="text-white">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spot" className="space-y-4">
              {/* Order Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Order Type</label>
                <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="market" className="text-white">Market</SelectItem>
                    <SelectItem value="limit" className="text-white">Limit</SelectItem>
                    <SelectItem value="stop" className="text-white">Stop Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={side === 'buy' ? 'default' : 'outline'}
                  onClick={() => setSide('buy')}
                  className={`flex-1 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'}`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  BUY
                </Button>
                <Button
                  variant={side === 'sell' ? 'default' : 'outline'}
                  onClick={() => setSide('sell')}
                  className={`flex-1 ${side === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'}`}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  SELL
                </Button>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quantity</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Price (for limit orders) */}
              {orderType !== 'market' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading || !quantity}
                className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isLoading ? 'Placing Order...' : `Place ${side.toUpperCase()} Order`}
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              {/* AI Trade Probability */}
              <div className="space-y-3">
                <Button
                  onClick={handleCalculateProbability}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isLoading ? 'Calculating...' : 'Calculate Trade Probability'}
                </Button>

                {aiProbability !== null && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {side.toUpperCase()} Probability for {selectedPair}
                      </span>
                      <Badge variant="outline" className={formatProbability(aiProbability).color}>
                        {formatProbability(aiProbability).confidence}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${formatProbability(aiProbability).color}`}>
                      {formatProbability(aiProbability).percentage}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Based on liquidity zones, Fibonacci levels, and market momentum
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendations */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  AI Recommendations
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optimal Entry:</span>
                    <span className="text-green-400">$42,850 - $43,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400">$42,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-green-400">$44,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk/Reward:</span>
                    <span className="text-blue-400">1:2.6</span>
                  </div>
                </div>
              </div>

              {/* Quick AI Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-sm">
                  Create AI Strategy
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  Follow AI Signal
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Account Balance */}
          <div className="bg-gray-800 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Available Balance:</span>
              <span className="text-white font-medium">$10,000.00 USDT</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
