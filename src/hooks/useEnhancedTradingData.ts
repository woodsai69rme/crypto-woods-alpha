
import { useState, useEffect } from 'react';
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
        bids: orderBookData.bids.map(bid => ({ price: bid.price, quantity: bid.quantity })),
        asks: orderBookData.asks.map(ask => ({ price: ask.price, quantity: ask.quantity })),
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
