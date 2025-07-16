
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

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
      const { data, error } = await supabase
        .from('order_book_entries')
        .select('*')
        .eq('trading_pair_id', tradingPairId)
        .order('price', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const bids = data.filter(entry => entry.side === 'buy').slice(0, 10);
      const asks = data.filter(entry => entry.side === 'sell').slice(0, 10);
      
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
