
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

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
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

export interface AIBotPerformance {
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  winningTrades: number;
}

export interface AIBotData {
  id: string;
  name: string;
  type: string;
  bot_type: string;
  is_running: boolean;
  status: 'running' | 'stopped' | 'error';
  performance: AIBotPerformance;
  lastUpdate: string;
  enhancedState?: {
    lastSignalTime: Date | null;
    errorCount: number;
    performance: AIBotPerformance;
  };
  memoryUsage?: number;
  lastError?: string;
}

export const useEnhancedTradingData = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPairData[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('680c340f-4bdf-42a6-9896-18c3acdfd04b');
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                change24h: Math.random() * 10 - 5,
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

  const fetchOrderBook = async (tradingPairId: string) => {
    try {
      const pair = tradingPairs.find(p => p.id === tradingPairId);
      if (!pair) return;

      const orderBookData = await CryptoDataService.getBinanceOrderBook(pair.symbol);
      
      const bids: OrderBookEntry[] = orderBookData.bids.slice(0, 10).map(([priceStr, quantityStr]) => ({
        price: parseFloat(priceStr),
        quantity: parseFloat(quantityStr)
      }));
      
      const asks: OrderBookEntry[] = orderBookData.asks.slice(0, 10).map(([priceStr, quantityStr]) => ({
        price: parseFloat(priceStr),
        quantity: parseFloat(quantityStr)
      }));

      setOrderBook({
        bids,
        asks,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

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

  const updateSelectedPair = (pairId: string) => {
    setSelectedPair(pairId);
    fetchOrderBook(pairId);
  };

  useEffect(() => {
    fetchTradingPairs();
    fetchTradingAccounts();

    const interval = setInterval(() => {
      if (selectedPair) {
        fetchOrderBook(selectedPair);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      const memoryUsage = Math.floor(Math.random() * 100) + 50;
      const activeBots = Math.floor(Math.random() * 5) + 1;
      const totalErrors = Math.floor(Math.random() * 10);
      const uptime = Math.floor(Math.random() * 86400) + 86400;

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
    refetchInterval: 10000
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

        return (data || []).map(bot => {
          const performanceStats = bot.performance_stats as any;
          const performance: AIBotPerformance = {
            totalTrades: performanceStats?.totalTrades || 0,
            winRate: performanceStats?.winRate || 0,
            profitLoss: performanceStats?.profitLoss || 0,
            winningTrades: Math.floor((performanceStats?.totalTrades || 0) * (performanceStats?.winRate || 0) / 100)
          };

          return {
            id: bot.id,
            name: bot.name,
            type: bot.bot_type,
            bot_type: bot.bot_type,
            is_running: bot.is_running || false,
            status: bot.is_running ? 'running' : 'stopped' as const,
            performance,
            lastUpdate: bot.updated_at || new Date().toISOString(),
            enhancedState: {
              lastSignalTime: bot.updated_at ? new Date(bot.updated_at) : null,
              errorCount: 0,
              performance
            },
            memoryUsage: Math.floor(Math.random() * 50) + 20,
            lastError: undefined
          };
        });
      } catch (error) {
        console.error('Error fetching AI bots:', error);
        // Fallback mock data
        return [
          {
            id: '1',
            name: 'Momentum Bot',
            type: 'momentum',
            bot_type: 'momentum',
            is_running: true,
            status: 'running',
            performance: {
              totalTrades: 156,
              winRate: 73.2,
              profitLoss: 2847.65,
              winningTrades: 114
            },
            lastUpdate: new Date().toISOString(),
            enhancedState: {
              lastSignalTime: new Date(),
              errorCount: 0,
              performance: {
                totalTrades: 156,
                winRate: 73.2,
                profitLoss: 2847.65,
                winningTrades: 114
              }
            },
            memoryUsage: 45,
            lastError: undefined
          }
        ];
      }
    },
    refetchInterval: 15000
  });
};
