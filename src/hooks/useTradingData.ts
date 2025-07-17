
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

export const useOrderBook = (tradingPairId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['order-book', tradingPairId],
    queryFn: async () => {
      // First try to get from database
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

export const useLiquidityZones = (tradingPairId: string) => {
  return useQuery({
    queryKey: ['liquidity-zones', tradingPairId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_zones')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .order('price_level', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tradingPairId,
  });
};

export const useFibonacciLevels = (tradingPairId: string) => {
  return useQuery({
    queryKey: ['fibonacci-levels', tradingPairId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fibonacci_levels')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
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
