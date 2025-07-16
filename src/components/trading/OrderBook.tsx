
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export const OrderBook: React.FC = () => {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState(0);

  useEffect(() => {
    const generateOrderBook = () => {
      const currentPrice = 43250;
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[] = [];
      
      // Generate bids (buy orders)
      for (let i = 0; i < 15; i++) {
        const price = currentPrice - (i + 1) * 2.5;
        const amount = Math.random() * 5 + 0.1;
        const total = price * amount;
        newBids.push({ price, amount, total });
      }
      
      // Generate asks (sell orders)
      for (let i = 0; i < 15; i++) {
        const price = currentPrice + (i + 1) * 2.5;
        const amount = Math.random() * 5 + 0.1;
        const total = price * amount;
        newAsks.push({ price, amount, total });
      }
      
      setBids(newBids);
      setAsks(newAsks);
      setSpread(newAsks[0]?.price - newBids[0]?.price || 0);
    };

    generateOrderBook();
    
    // Real-time updates
    const interval = setInterval(generateOrderBook, 500);
    return () => clearInterval(interval);
  }, []);

  const maxBidTotal = Math.max(...bids.map(b => b.total));
  const maxAskTotal = Math.max(...asks.map(a => a.total));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-400" />
            Order Book
          </div>
          <Badge className="bg-green-600 text-white">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-4 pb-2">
          <div className="grid grid-cols-3 text-xs text-gray-400 pb-2">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Total</span>
          </div>
        </div>
        
        {/* Asks (Sell Orders) */}
        <div className="px-4 space-y-1">
          {asks.slice(0, 8).reverse().map((ask, index) => (
            <div 
              key={`ask-${index}`}
              className="grid grid-cols-3 text-xs py-1 relative"
            >
              <div 
                className="absolute inset-0 bg-red-500 opacity-10"
                style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
              />
              <span className="text-red-400 relative z-10">{ask.price.toFixed(2)}</span>
              <span className="text-right text-white relative z-10">{ask.amount.toFixed(4)}</span>
              <span className="text-right text-gray-300 relative z-10">{ask.total.toFixed(0)}</span>
            </div>
          ))}
        </div>
        
        {/* Spread */}
        <div className="px-4 py-3 bg-gray-700 border-y border-gray-600">
          <div className="text-center">
            <div className="text-sm font-bold text-white">{((bids[0]?.price + asks[0]?.price) / 2).toFixed(2)}</div>
            <div className="text-xs text-gray-400">Spread: ${spread.toFixed(2)}</div>
          </div>
        </div>
        
        {/* Bids (Buy Orders) */}
        <div className="px-4 space-y-1 pt-2">
          {bids.slice(0, 8).map((bid, index) => (
            <div 
              key={`bid-${index}`}
              className="grid grid-cols-3 text-xs py-1 relative"
            >
              <div 
                className="absolute inset-0 bg-green-500 opacity-10"
                style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
              />
              <span className="text-green-400 relative z-10">{bid.price.toFixed(2)}</span>
              <span className="text-right text-white relative z-10">{bid.amount.toFixed(4)}</span>
              <span className="text-right text-gray-300 relative z-10">{bid.total.toFixed(0)}</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 text-xs text-gray-400 text-center">
          Real-time order book data
        </div>
      </CardContent>
    </Card>
  );
};
