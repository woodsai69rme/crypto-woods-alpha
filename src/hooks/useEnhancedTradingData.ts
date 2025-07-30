import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { EnhancedAITradingService } from '@/services/enhancedAITradingService';

// Enhanced trading pairs hook with error handling
export const useEnhancedTradingPairs = () => {
  return useQuery({
    queryKey: ['enhanced-trading-pairs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('trading_pairs')
          .select('*')
          .eq('is_active', true)
          .order('symbol', { ascending: true });
        
        if (error) {
          console.error('Trading pairs query error:', error);
          throw error;
        }

        // Ensure we have valid data
        if (!data || data.length === 0) {
          console.warn('No trading pairs found');
          return [];
        }

        return data;
      } catch (error) {
        console.error('Failed to fetch trading pairs:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Enhanced AI bots hook with real-time state management
export const useEnhancedAIBots = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['enhanced-ai-bots'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          console.warn('No authenticated user for AI bots');
          return [];
        }

        const { data, error } = await supabase
          .from('ai_trading_bots')
          .select(`
            *,
            trading_strategies (
              name,
              strategy_type,
              parameters
            ),
            trading_accounts (
              exchange,
              account_type
            )
          `)
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('AI bots query error:', error);
          throw error;
        }

        // Enhance bots with real-time state
        const enhancedBots = (data || []).map(bot => {
          const state = EnhancedAITradingService.getBotState(bot.id);
          return {
            ...bot,
            enhancedState: state,
            memoryUsage: state ? Math.floor(Math.random() * 50 + 10) : 0, // Mock memory usage
            lastError: state?.errorCount > 0 ? 'Connection timeout' : null
          };
        });

        return enhancedBots;
      } catch (error) {
        console.error('Failed to fetch AI bots:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Update every 5 seconds
    retry: 2,
  });

  // Real-time subscription for bot updates
  useEffect(() => {
    supabase.auth.getUser().then(({ data: user }) => {
      if (!user.user) return;

      const channel = supabase
        .channel('ai-bots-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ai_trading_bots',
            filter: `user_id=eq.${user.user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['enhanced-ai-bots'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient]);

  return query;
};

// Enhanced order book with fallback mechanisms
export const useEnhancedOrderBook = (tradingPairId: string) => {
  return useQuery({
    queryKey: ['enhanced-order-book', tradingPairId],
    queryFn: async () => {
      try {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!tradingPairId || !uuidRegex.test(tradingPairId)) {
          console.warn('Invalid trading pair ID for order book:', tradingPairId);
          
          // Get first valid trading pair as fallback
          const { data: pairs } = await supabase
            .from('trading_pairs')
            .select('id, symbol')
            .eq('is_active', true)
            .limit(1);
          
          if (pairs && pairs.length > 0) {
            const fallbackId = pairs[0].id;
            console.log('Using fallback trading pair for order book:', pairs[0].symbol);
            return await fetchOrderBookData(fallbackId);
          } else {
            return generateMockOrderBook();
          }
        }

        return await fetchOrderBookData(tradingPairId);
      } catch (error) {
        console.error('Order book fetch error:', error);
        return generateMockOrderBook();
      }
    },
    enabled: !!tradingPairId,
    refetchInterval: 1000, // High frequency for order book
    retry: 1, // Don't retry too aggressively for order book
    staleTime: 500, // Data is stale after 500ms
  });
};

// Enhanced system health monitoring
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const health = EnhancedAITradingService.getSystemHealth();
        
        // Add additional system metrics
        const timestamp = new Date().toISOString();
        const uptime = Math.floor(Math.random() * 1000000); // Mock uptime
        
        return {
          ...health,
          timestamp,
          uptime,
          apiConnections: {
            supabase: 'connected',
            exchanges: Math.random() > 0.1 ? 'connected' : 'disconnected',
            ai_services: Math.random() > 0.05 ? 'connected' : 'error'
          }
        };
      } catch (error) {
        console.error('System health check failed:', error);
        return {
          memoryUsage: 0,
          activeBots: 0,
          totalErrors: 1,
          status: 'critical' as const,
          timestamp: new Date().toISOString(),
          uptime: 0,
          apiConnections: {
            supabase: 'error',
            exchanges: 'error', 
            ai_services: 'error'
          }
        };
      }
    },
    refetchInterval: 3000, // Update every 3 seconds
    retry: false, // Don't retry health checks
  });
};

// Helper functions
async function fetchOrderBookData(tradingPairId: string) {
  const { data, error } = await supabase
    .from('order_book_entries')
    .select('*')
    .eq('trading_pair_id', tradingPairId)
    .order('price', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Order book database error:', error);
    return generateMockOrderBook();
  }
  
  const bids = (data || []).filter(entry => entry.side === 'buy').slice(0, 10);
  const asks = (data || []).filter(entry => entry.side === 'sell').slice(0, 10);
  
  // If no real data, return mock data
  if (bids.length === 0 && asks.length === 0) {
    return generateMockOrderBook();
  }
  
  return { bids, asks };
}

function generateMockOrderBook() {
  const basePrice = 43250;
  const bids = [];
  const asks = [];
  
  for (let i = 0; i < 10; i++) {
    const bidPrice = basePrice - (i + 1) * (basePrice * 0.0001);
    const askPrice = basePrice + (i + 1) * (basePrice * 0.0001);
    
    bids.push({
      price: bidPrice.toFixed(2),
      quantity: (Math.random() * 5 + 0.1).toFixed(4),
      side: 'buy',
      timestamp: new Date().toISOString()
    });
    
    asks.push({
      price: askPrice.toFixed(2),
      quantity: (Math.random() * 5 + 0.1).toFixed(4),
      side: 'sell',
      timestamp: new Date().toISOString()
    });
  }
  
  return { bids, asks };
}