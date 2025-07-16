
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';

export const TradingPanel: React.FC = () => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('43250.00');
  const [stopPrice, setStopPrice] = useState('');
  
  const [balance] = useState({
    BTC: 0.05432,
    USDT: 15420.50
  });

  const handleTrade = () => {
    console.log('Executing trade:', { orderType, side, amount, price, stopPrice });
    // Trade execution logic would go here
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <span>Trading Panel</span>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              Paper Trading
            </Badge>
            <Badge className="bg-red-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Risk: Medium
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-2">Available Balance</div>
          <div className="flex justify-between items-center">
            <span className="text-white">BTC: <span className="font-bold">{balance.BTC}</span></span>
            <span className="text-white">USDT: <span className="font-bold">${balance.USDT.toLocaleString()}</span></span>
          </div>
        </div>

        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
            <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
            <TabsTrigger value="stop" className="text-xs">Stop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={side === 'buy' ? "default" : "outline"}
                onClick={() => setSide('buy')}
                className={side === 'buy' ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={side === 'sell' ? "default" : "outline"}
                onClick={() => setSide('sell')}
                className={side === 'sell' ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Amount (BTC)</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="text-sm text-gray-400">
              Market Price: <span className="text-white font-bold">${price}</span>
            </div>
          </TabsContent>
          
          <TabsContent value="limit" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={side === 'buy' ? "default" : "outline"}
                onClick={() => setSide('buy')}
                className={side === 'buy' ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={side === 'sell' ? "default" : "outline"}
                onClick={() => setSide('sell')}
                className={side === 'sell' ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Price (USDT)</label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Amount (BTC)</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stop" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={side === 'buy' ? "default" : "outline"}
                onClick={() => setSide('buy')}
                className={side === 'buy' ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={side === 'sell' ? "default" : "outline"}
                onClick={() => setSide('sell')}
                className={side === 'sell' ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Stop Price (USDT)</label>
              <Input
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="43000.00"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Amount (BTC)</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {['25%', '50%', '75%', '100%'].map((percentage) => (
            <Button
              key={percentage}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                const maxAmount = side === 'buy' 
                  ? balance.USDT / parseFloat(price)
                  : balance.BTC;
                const percent = parseInt(percentage) / 100;
                setAmount((maxAmount * percent).toFixed(8));
              }}
            >
              {percentage}
            </Button>
          ))}
        </div>
        
        {/* Trade Button */}
        <Button
          onClick={handleTrade}
          className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          disabled={!amount}
        >
          <Zap className="h-4 w-4 mr-2" />
          {side === 'buy' ? 'Buy' : 'Sell'} BTC
        </Button>
        
        {/* Trade Summary */}
        {amount && (
          <div className="bg-gray-700 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Total:</span>
              <span className="text-white font-bold">
                ${(parseFloat(amount || '0') * parseFloat(price)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fee (0.1%):</span>
              <span className="text-white">
                ${((parseFloat(amount || '0') * parseFloat(price)) * 0.001).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
