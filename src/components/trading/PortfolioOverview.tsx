
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { PortfolioService } from '@/services/portfolioService';
import { TradingAuditService } from '@/services/tradingAuditService';
import { RealMarketDataService } from '@/services/realMarketDataService';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange24h, setTotalChange24h] = useState(0);
  const [isRealData, setIsRealData] = useState(false);
  const [calculationAccuracy, setCalculationAccuracy] = useState<number>(100);
  const [auditStatus, setAuditStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    if (!user?.id) {
      // Mock data when user is not authenticated
      setPortfolio([
        { symbol: 'BTC', name: 'Bitcoin', amount: 0.05432, value: 2350.25, change24h: -2.34, percentage: 45.2, color: '#F59E0B' },
        { symbol: 'ETH', name: 'Ethereum', amount: 0.8734, value: 2315.76, change24h: 1.23, percentage: 44.5, color: '#3B82F6' },
        { symbol: 'BNB', name: 'Binance Coin', amount: 1.234, value: 389.88, change24h: -0.87, percentage: 7.5, color: '#10B981' },
        { symbol: 'ADA', name: 'Cardano', amount: 312.45, value: 149.65, change24h: -1.45, percentage: 2.8, color: '#8B5CF6' },
      ]);
      setIsRealData(false);
      setAuditStatus('invalid');
      return;
    }

    const loadRealPortfolioData = async () => {
      try {
        // Get real portfolio data
        const portfolioMetrics = await PortfolioService.getUserPortfolio(user.id);
        
        // Get current market prices
        const { data: marketPrices } = await RealMarketDataService.getRealTimePrices();
        
        // Create real portfolio items with current market data
        const realPortfolioItems: PortfolioItem[] = portfolioMetrics.holdings.map((holding, index) => {
          const marketPrice = marketPrices.find(p => p.symbol === `${holding.asset}USDT`);
          const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#8B5CF6'];
          
          return {
            symbol: holding.asset,
            name: holding.asset,
            amount: holding.quantity,
            value: holding.current_value,
            change24h: marketPrice?.change24h || 0,
            percentage: holding.allocation_percentage,
            color: colors[index % colors.length]
          };
        });

        setPortfolio(realPortfolioItems);
        setTotalValue(portfolioMetrics.total_value);
        setTotalChange24h((portfolioMetrics.unrealized_pnl / portfolioMetrics.total_invested) * 100);
        setIsRealData(true);

        // Validate calculations
        const auditResults = await TradingAuditService.performFullTradingAudit(user.id);
        const portfolioValid = auditResults.results
          .filter(r => r.category.includes('PORTFOLIO'))
          .every(r => r.status === 'PASS');
        
        setAuditStatus(portfolioValid ? 'valid' : 'invalid');
        
        // Calculate accuracy percentage
        const passCount = auditResults.results.filter(r => r.status === 'PASS').length;
        const accuracy = (passCount / auditResults.results.length) * 100;
        setCalculationAccuracy(accuracy);

        console.log('Real portfolio data loaded and validated:', realPortfolioItems.length, 'holdings');
      } catch (error) {
        console.error('Failed to load real portfolio data:', error);
        setIsRealData(false);
        setAuditStatus('invalid');
        
        // Fallback to enhanced mock data
        setPortfolio([
          { symbol: 'BTC', name: 'Bitcoin', amount: 0.05432, value: 2350.25, change24h: -2.34, percentage: 45.2, color: '#F59E0B' },
          { symbol: 'ETH', name: 'Ethereum', amount: 0.8734, value: 2315.76, change24h: 1.23, percentage: 44.5, color: '#3B82F6' },
          { symbol: 'BNB', name: 'Binance Coin', amount: 1.234, value: 389.88, change24h: -0.87, percentage: 7.5, color: '#10B981' },
          { symbol: 'ADA', name: 'Cardano', amount: 312.45, value: 149.65, change24h: -1.45, percentage: 2.8, color: '#8B5CF6' },
        ]);
      }
    };

    loadRealPortfolioData();

    // Real-time updates for authenticated users
    if (user?.id) {
      const ws = RealMarketDataService.initializeRealTimeUpdates((price) => {
        setPortfolio(prev => prev.map(item => {
          if (item.symbol === price.symbol.replace('USDT', '')) {
            const newValue = item.amount * price.price;
            return {
              ...item,
              value: newValue,
              change24h: price.change24h
            };
          }
          return item;
        }));
      });

      return () => {
        if (ws) ws.close();
      };
    } else {
      // Mock updates for non-authenticated users
      const interval = setInterval(() => {
        setPortfolio(prev => prev.map(item => ({
          ...item,
          change24h: item.change24h + (Math.random() - 0.5) * 0.1,
          value: item.value * (1 + (Math.random() - 0.5) * 0.001),
        })));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Recalculate totals when portfolio changes
  useEffect(() => {
    const total = portfolio.reduce((sum, item) => sum + item.value, 0);
    const totalChange = portfolio.reduce((sum, item) => sum + (item.value * item.change24h / 100), 0);
    
    setTotalValue(total);
    setTotalChange24h(total > 0 ? (totalChange / total) * 100 : 0);
  }, [portfolio]);

  const getAuditIcon = () => {
    switch (auditStatus) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getAuditColor = () => {
    switch (auditStatus) {
      case 'valid': return 'bg-green-600';
      case 'invalid': return 'bg-red-600';
      default: return 'bg-yellow-600';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-green-400" />
            Portfolio Overview
          </div>
          <div className="flex gap-2">
            <Badge className={isRealData ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}>
              {isRealData ? "REAL DATA" : "SIMULATED"}
            </Badge>
            <Badge className={getAuditColor()}>
              {getAuditIcon()}
              {auditStatus === 'checking' ? 'VALIDATING' : auditStatus === 'valid' ? 'VERIFIED' : 'NEEDS REVIEW'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Calculation Accuracy Alert */}
        {calculationAccuracy < 100 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Portfolio calculations are {calculationAccuracy.toFixed(1)}% accurate. 
              {calculationAccuracy < 90 && ' Please review for potential discrepancies.'}
            </AlertDescription>
          </Alert>
        )}

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
            {isRealData && (
              <div className="text-xs text-gray-400 mt-1">
                Calculation Accuracy: {calculationAccuracy.toFixed(1)}%
              </div>
            )}
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
                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Allocation']}
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

        {!user?.id && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sign in to view real portfolio data with live calculations and validation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
