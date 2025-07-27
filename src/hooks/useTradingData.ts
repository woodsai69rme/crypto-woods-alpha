import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { CryptoDataService } from '@/services/cryptoDataService';

export const useTradingPairs = () => {
  return useQuery({
    queryKey: ['trading-pairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_pairs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useRealTimeMarketData = (symbols: string[]) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['real-time-market-data', symbols],
    queryFn: async () => {
      // Fetch from multiple sources and aggregate
      return await CryptoDataService.getAggregatedPrices(symbols);
    },
    enabled: symbols.length > 0,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (symbols.length > 0) {
      CryptoDataService.connectBinanceWebSocket(symbols, (priceUpdate) => {
        queryClient.setQueryData(['real-time-market-data', symbols], (oldData: any) => {
          if (!oldData) return [priceUpdate];
          
          const updated = oldData.map((price: any) => 
            price.symbol === priceUpdate.symbol ? priceUpdate : price
          );
          
          // Add new symbol if not exists
          if (!updated.find((p: any) => p.symbol === priceUpdate.symbol)) {
            updated.push(priceUpdate);
          }
          
          return updated;
        });
      });
    }

    return () => {
      CryptoDataService.disconnectAll();
    };
  }, [symbols, queryClient]);

  return query;
};

export const useMarketData = (tradingPairId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['market-data', tradingPairId],
    queryFn: async () => {
      let query = supabase
        .from('market_data_live')
        .select(`
          *,
          trading_pairs (
            id,
            symbol,
            base_asset,
            quote_asset,
            exchange
          )
        `)
        .order('timestamp', { ascending: false });
      
      if (tradingPairId) {
        query = query.eq('trading_pair_id', tradingPairId);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: true,
    refetchInterval: 1000, // Refresh every second for real-time data
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('market-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data_live',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['market-data'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Helper function to generate mock order book
const generateMockOrderBook = (symbol: string = 'BTCUSDT') => {
  const basePrice = symbol === 'BTCUSDT' ? 43250 : 2580;
  const bids = [];
  const asks = [];
  
  // Generate realistic bid/ask spread
  for (let i = 0; i < 10; i++) {
    const bidPrice = basePrice - (i + 1) * (basePrice * 0.0001);
    const askPrice = basePrice + (i + 1) * (basePrice * 0.0001);
    
    bids.push({
      price: bidPrice.toFixed(2),
      quantity: (Math.random() * 5 + 0.1).toFixed(4),
      side: 'buy'
    });
    
    asks.push({
      price: askPrice.toFixed(2),
      quantity: (Math.random() * 5 + 0.1).toFixed(4),
      side: 'sell'
    });
  }
  
  return { bids, asks };
};

export const useOrderBook = (tradingPairId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['order-book', tradingPairId],
    queryFn: async () => {
      // Validate UUID format first
      if (!tradingPairId || tradingPairId === '1' || !tradingPairId.includes('-')) {
        console.warn('Invalid trading pair ID format:', tradingPairId);
        // Use first available trading pair as fallback
        const { data: pairs } = await supabase
          .from('trading_pairs')
          .select('id, symbol')
          .eq('is_active', true)
          .limit(1);
        
        if (pairs && pairs.length > 0) {
          const fallbackId = pairs[0].id;
          console.log('Using fallback trading pair:', pairs[0].symbol, fallbackId);
          
          // Try to get from database with valid UUID
          const { data, error } = await supabase
            .from('order_book_entries')
            .select('*')
            .eq('trading_pair_id', fallbackId)
            .order('price', { ascending: false })
            .limit(20);
            
          if (error) console.error('Order book query error:', error);
          
          const bids = data?.filter(entry => entry.side === 'buy').slice(0, 10) || [];
          const asks = data?.filter(entry => entry.side === 'sell').slice(0, 10) || [];
          
          // If no data, generate mock order book
          if (bids.length === 0 && asks.length === 0) {
            return generateMockOrderBook(pairs[0].symbol);
          }
          
          return { bids, asks };
        }
        
        // Generate mock data if no trading pairs available
        return generateMockOrderBook('BTCUSDT');
      }

      // First try to get from database with valid UUID
      const { data, error } = await supabase
        .from('order_book_entries')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .order('price', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const bids = data.filter(entry => entry.side === 'buy').slice(0, 10);
      const asks = data.filter(entry => entry.side === 'sell').slice(0, 10);
      
      // If no data in database, fetch from live API
      if (bids.length === 0 && asks.length === 0) {
        // Get trading pair symbol
        const { data: pairData } = await supabase
          .from('trading_pairs')
          .select('symbol')
          .eq('id', tradingPairId)
          .single();
        
        if (pairData) {
          const orderBook = await CryptoDataService.getBinanceOrderBook(pairData.symbol);
          return {
            bids: orderBook.bids.map(([price, quantity]) => ({ price, quantity, side: 'buy' })),
            asks: orderBook.asks.map(([price, quantity]) => ({ price, quantity, side: 'sell' }))
          };
        }
      }
      
      return { bids, asks };
    },
    enabled: !!tradingPairId,
    refetchInterval: 500, // High frequency for order book
  });

  // Real-time order book updates
  useEffect(() => {
    if (!tradingPairId) return;

    const channel = supabase
      .channel('order-book-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_book_entries',
          filter: `trading_pair_id=eq.${tradingPairId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['order-book', tradingPairId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tradingPairId, queryClient]);

  return query;
};

// Helper function for mock liquidity zones
const generateMockLiquidityZones = () => {
  const basePrice = 43250;
  return [
    {
      id: 'mock-1',
      price_level: basePrice * 1.05,
      zone_type: 'resistance',
      strength: 'strong',
      volume: 1250000,
      big_orders_count: 15,
      is_market_maker_target: true
    },
    {
      id: 'mock-2',
      price_level: basePrice * 0.95,
      zone_type: 'support',
      strength: 'strong',
      volume: 980000,
      big_orders_count: 12,
      is_market_maker_target: true
    },
    {
      id: 'mock-3',
      price_level: basePrice * 1.02,
      zone_type: 'resistance',
      strength: 'medium',
      volume: 750000,
      big_orders_count: 8,
      is_market_maker_target: false
    }
  ];
};

export const useLiquidityZones = (tradingPairId: string) => {
  return useQuery({
    queryKey: ['liquidity-zones', tradingPairId],
    queryFn: async () => {
      // Validate UUID format
      if (!tradingPairId || tradingPairId === '1' || !tradingPairId.includes('-')) {
        console.warn('Invalid trading pair ID for liquidity zones:', tradingPairId);
        // Return mock liquidity zones
        return generateMockLiquidityZones();
      }

      const { data, error } = await supabase
        .from('liquidity_zones')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .order('price_level', { ascending: false });
      
      if (error) {
        console.error('Liquidity zones query error:', error);
        return generateMockLiquidityZones();
      }
      
      return data || generateMockLiquidityZones();
    },
    enabled: !!tradingPairId,
  });
};

// Helper function for mock Fibonacci levels
const generateMockFibonacciLevels = () => {
  const high = 45000;
  const low = 40000;
  const range = high - low;
  
  return [{
    id: 'mock-fib-1',
    high_price: high,
    low_price: low,
    level_236: low + (range * 0.236),
    level_382: low + (range * 0.382),
    level_500: low + (range * 0.500),
    level_618: low + (range * 0.618),
    level_786: low + (range * 0.786),
    extension_1272: high + (range * 0.272),
    extension_1618: high + (range * 0.618),
    timeframe: '1d',
    is_active: true
  }];
};

export const useFibonacciLevels = (tradingPairId: string) => {
  return useQuery({
    queryKey: ['fibonacci-levels', tradingPairId],
    queryFn: async () => {
      // Validate UUID format
      if (!tradingPairId || tradingPairId === '1' || !tradingPairId.includes('-')) {
        console.warn('Invalid trading pair ID for Fibonacci levels:', tradingPairId);
        return generateMockFibonacciLevels();
      }

      const { data, error } = await supabase
        .from('fibonacci_levels')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Fibonacci levels query error:', error);
        return generateMockFibonacciLevels();
      }
      
      return data || generateMockFibonacciLevels();
    },
    enabled: !!tradingPairId,
  });
};

export const useAISignals = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ai-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_trading_signals')
        .select(`
          *,
          trading_pairs (
            symbol,
            base_asset,
            quote_asset
          ),
          ai_trading_bots (
            name,
            bot_type
          )
        `)
        .eq('is_executed', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time AI signals
  useEffect(() => {
    const channel = supabase
      .channel('ai-signals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_trading_signals',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-signals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useTransactionHistory = () => {
  return useQuery({
    queryKey: ['transaction-history'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get orders
      const { data: orders } = await supabase
        .from('user_orders')
        .select(`
          *,
          trading_pairs (symbol, base_asset, quote_asset),
          trading_accounts (exchange, account_type)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get executions
      const { data: executions } = await supabase
        .from('trade_executions')
        .select(`
          *,
          trading_pairs (symbol, base_asset, quote_asset)
        `)
        .eq('user_id', user.user.id)
        .order('executed_at', { ascending: false })
        .limit(100);

      return { orders: orders || [], executions: executions || [] };
    },
  });
};

export const useAuditLogs = (limit: number = 100) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};