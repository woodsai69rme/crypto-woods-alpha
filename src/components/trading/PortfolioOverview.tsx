
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioItem {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  percentage: number;
  color: string;
}

interface PortfolioOverviewProps {
  requireAuth?: (action: () => void) => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ requireAuth }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.05432, value: 2350.25, change24h: -2.34, percentage: 45.2, color: '#F59E0B' },
    { symbol: 'ETH', name: 'Ethereum', amount: 0.8734, value: 2315.76, change24h: 1.23, percentage: 44.5, color: '#3B82F6' },
    { symbol: 'BNB', name: 'Binance Coin', amount: 1.234, value: 389.88, change24h: -0.87, percentage: 7.5, color: '#10B981' },
    { symbol: 'ADA', name: 'Cardano', amount: 312.45, value: 149.65, change24h: -1.45, percentage: 2.8, color: '#8B5CF6' },
  ]);

  const [totalValue, setTotalValue] = useState(0);
  const [totalChange24h, setTotalChange24h] = useState(0);

  useEffect(() => {
    const total = portfolio.reduce((sum, item) => sum + item.value, 0);
    const totalChange = portfolio.reduce((sum, item) => sum + (item.value * item.change24h / 100), 0);
    
    setTotalValue(total);
    setTotalChange24h((totalChange / total) * 100);

    // Real-time updates
    const interval = setInterval(() => {
      setPortfolio(prev => prev.map(item => ({
        ...item,
        change24h: item.change24h + (Math.random() - 0.5) * 0.1,
        value: item.value * (1 + (Math.random() - 0.5) * 0.001),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [portfolio]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-green-400" />
            Portfolio Overview
          </div>
          <Badge className="bg-green-600 text-white">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Total Portfolio Value */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm flex items-center justify-center ${totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalChange24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </div>

        {/* Portfolio Distribution Chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolio}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="percentage"
                strokeWidth={2}
                stroke="#1F2937"
              >
                {portfolio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${value}%`, 'Allocation']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Items */}
        <div className="space-y-3">
          {portfolio.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="text-white font-medium">{item.symbol}</div>
                  <div className="text-xs text-gray-400">{item.amount.toFixed(4)} {item.symbol}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">${item.value.toFixed(2)}</div>
                <div className={`text-xs ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
