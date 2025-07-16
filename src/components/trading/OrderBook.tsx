
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderBook } from '@/hooks/useTradingData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface OrderBookProps {
  tradingPairId: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ tradingPairId }) => {
  const { data: orderBook, isLoading } = useOrderBook(tradingPairId);

  const formatPrice = (price: number) => `$${price.toFixed(6)}`;
  const formatQuantity = (quantity: number) => quantity.toFixed(4);

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const { bids = [], asks = [] } = orderBook || {};

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Order Book
          <Badge className="bg-green-600 text-white animate-pulse ml-auto">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asks (Sell Orders) */}
        <div>
          <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Asks (Sellers)
          </div>
          <div className="space-y-1">
            {asks.slice(0, 8).map((ask, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-red-400">{formatPrice(Number(ask.price))}</span>
                <span className="text-gray-300">{formatQuantity(Number(ask.quantity))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spread */}
        <div className="py-2 border-t border-b border-gray-700">
          <div className="text-center text-xs text-gray-400">
            Spread: ${asks[0] && bids[0] ? (Number(asks[0].price) - Number(bids[0].price)).toFixed(2) : '0.00'}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div>
          <div className="text-xs text-green-400 mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Bids (Buyers)
          </div>
          <div className="space-y-1">
            {bids.slice(0, 8).map((bid, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-green-400">{formatPrice(Number(bid.price))}</span>
                <span className="text-gray-300">{formatQuantity(Number(bid.quantity))}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
