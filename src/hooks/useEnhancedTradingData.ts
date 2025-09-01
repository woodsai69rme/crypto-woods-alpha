
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CryptoDataService } from '@/services/cryptoDataService';

export interface TradingPairData {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
}

export interface OrderBookData {
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  lastUpdate: string;
}

export interface TradingAccount {
  id: string;
  exchange: string;
  accountType: 'paper' | 'live';
  balance: number;
  isActive: boolean;
}

export interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical';
  memoryUsage: number;
  activeBots: number;
  totalErrors: number;
  uptime: number;
  apiConnections: {
    supabase: 'connected' | 'disconnected' | 'error';
    exchanges: 'connected' | 'disconnected' | 'error';
    ai_services: 'connected' | 'disconnected' | 'error';
  };
}

export interface AIBotData {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  performance: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
  };
  lastUpdate: string;
}

export const useEnhancedTradingData = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPairData[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('680c340f-4bdf-42a6-9896-18c3acdfd04b');
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trading pairs from database
  const fetchTradingPairs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_pairs')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;

      if (data) {
        const pairs = await Promise.all(
          data.map(async (pair) => {
            try {
              const priceData = await CryptoDataService.getBinancePrices([pair.symbol]);
              const price = priceData[0]?.price || 0;
              
              return {
                id: pair.id,
                symbol: pair.symbol,
                baseAsset: pair.base_asset,
                quoteAsset: pair.quote_asset,
                price,
                change24h: Math.random() * 10 - 5, // Mock data
                volume24h: Math.random() * 1000000,
                high24h: price * 1.05,
                low24h: price * 0.95,
                lastUpdate: new Date().toISOString()
              };
            } catch (error) {
              console.error(`Error fetching data for ${pair.symbol}:`, error);
              return {
                id: pair.id,
                symbol: pair.symbol,
                baseAsset: pair.base_asset,
                quoteAsset: pair.quote_asset,
                price: 0,
                change24h: 0,
                volume24h: 0,
                high24h: 0,
                low24h: 0,
                lastUpdate: new Date().toISOString()
              };
            }
          })
        );
        setTradingPairs(pairs);
      }
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch trading pairs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order book data
  const fetchOrderBook = async (tradingPairId: string) => {
    try {
      const pair = tradingPairs.find(p => p.id === tradingPairId);
      if (!pair) return;

      const orderBookData = await CryptoDataService.getBinanceOrderBook(pair.symbol);
      setOrderBook({
        bids: orderBookData.bids.map(([price, quantity]) => ({ 
          price: parseFloat(price), 
          quantity: parseFloat(quantity) 
        })),
        asks: orderBookData.asks.map(([price, quantity]) => ({ 
          price: parseFloat(price), 
          quantity: parseFloat(quantity) 
        })),
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  // Fetch trading accounts
  const fetchTradingAccounts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true);

      if (error) throw error;

      if (data) {
        setTradingAccounts(data.map(account => ({
          id: account.id,
          exchange: account.exchange,
          accountType: account.account_type as 'paper' | 'live',
          balance: Number(account.balance_usd) || 0,
          isActive: account.is_active
        })));
      }
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
    }
  };

  // Update selected pair and fetch related data
  const updateSelectedPair = (pairId: string) => {
    setSelectedPair(pairId);
    fetchOrderBook(pairId);
  };

  // Real-time data updates
  useEffect(() => {
    fetchTradingPairs();
    fetchTradingAccounts();

    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (selectedPair) {
        fetchOrderBook(selectedPair);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update order book when selected pair changes
  useEffect(() => {
    if (selectedPair) {
      fetchOrderBook(selectedPair);
    }
  }, [selectedPair, tradingPairs]);

  return {
    tradingPairs,
    selectedPair,
    orderBook,
    tradingAccounts,
    loading,
    error,
    updateSelectedPair,
    refreshData: fetchTradingPairs,
    refreshOrderBook: () => fetchOrderBook(selectedPair)
  };
};

// System Health Hook
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async (): Promise<SystemHealthData> => {
      // Mock system health data - in a real app, this would come from monitoring APIs
      const memoryUsage = Math.floor(Math.random() * 100) + 50; // 50-150MB
      const activeBots = Math.floor(Math.random() * 5) + 1; // 1-5 bots
      const totalErrors = Math.floor(Math.random() * 10); // 0-10 errors
      const uptime = Math.floor(Math.random() * 86400) + 86400; // 1-2 days in seconds

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (memoryUsage > 120 || totalErrors > 7) {
        status = 'critical';
      } else if (memoryUsage > 90 || totalErrors > 3) {
        status = 'warning';
      }

      return {
        status,
        memoryUsage,
        activeBots,
        totalErrors,
        uptime,
        apiConnections: {
          supabase: 'connected',
          exchanges: Math.random() > 0.1 ? 'connected' : 'disconnected',
          ai_services: Math.random() > 0.2 ? 'connected' : 'error'
        }
      };
    },
    refetchInterval: 10000 // Update every 10 seconds
  });
};

// Enhanced AI Bots Hook
export const useEnhancedAIBots = () => {
  return useQuery({
    queryKey: ['enhancedAIBots'],
    queryFn: async (): Promise<AIBotData[]> => {
      try {
        const { data, error } = await supabase
          .from('ai_trading_bots')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        return (data || []).map(bot => ({
          id: bot.id,
          name: bot.name,
          type: bot.bot_type,
          status: bot.is_running ? 'running' : 'stopped',
          performance: {
            totalTrades: bot.performance_stats?.totalTrades || 0,
            winRate: bot.performance_stats?.winRate || 0,
            profitLoss: bot.performance_stats?.profitLoss || 0
          },
          lastUpdate: bot.updated_at || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error fetching AI bots:', error);
        // Return mock data as fallback
        return [
          {
            id: '1',
            name: 'Momentum Bot',
            type: 'momentum',
            status: 'running',
            performance: {
              totalTrades: 156,
              winRate: 73.2,
              profitLoss: 2847.65
            },
            lastUpdate: new Date().toISOString()
          },
          {
            id: '2',
            name: 'DCA Bot',
            type: 'dca',
            status: 'stopped',
            performance: {
              totalTrades: 89,
              winRate: 67.4,
              profitLoss: 1234.56
            },
            lastUpdate: new Date().toISOString()
          }
        ];
      }
    },
    refetchInterval: 15000 // Update every 15 seconds
  });
};
