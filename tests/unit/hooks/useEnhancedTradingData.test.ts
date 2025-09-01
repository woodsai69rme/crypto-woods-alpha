
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEnhancedTradingData, useSystemHealth, useEnhancedAIBots } from '../../../src/hooks/useEnhancedTradingData';

// Mock Supabase
jest.mock('../../../src/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } } 
      })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ 
      data: [
        {
          id: 'test-pair-id',
          symbol: 'BTCUSDT',
          base_asset: 'BTC',
          quote_asset: 'USDT',
          is_active: true
        }
      ], 
      error: null 
    })
  }
}));

// Mock CryptoDataService
jest.mock('../../../src/services/cryptoDataService', () => ({
  CryptoDataService: {
    getBinancePrices: jest.fn().mockResolvedValue([
      { price: 50000, symbol: 'BTCUSDT' }
    ]),
    getBinanceOrderBook: jest.fn().mockResolvedValue({
      bids: [['49950', '0.1']],
      asks: [['50050', '0.1']]
    })
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEnhancedTradingData', () => {
  it('should fetch trading pairs successfully', async () => {
    const { result } = renderHook(() => useEnhancedTradingData(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tradingPairs).toHaveLength(1);
    expect(result.current.tradingPairs[0].symbol).toBe('BTCUSDT');
  });

  it('should handle selected pair updates', async () => {
    const { result } = renderHook(() => useEnhancedTradingData(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.updateSelectedPair('new-pair-id');
    expect(result.current.selectedPair).toBe('new-pair-id');
  });
});

describe('useSystemHealth', () => {
  it('should return system health data', async () => {
    const { result } = renderHook(() => useSystemHealth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const healthData = result.current.data!;
    expect(healthData.status).toMatch(/healthy|warning|critical/);
    expect(typeof healthData.memoryUsage).toBe('number');
    expect(typeof healthData.activeBots).toBe('number');
  });
});

describe('useEnhancedAIBots', () => {
  it('should return AI bots data', async () => {
    const { result } = renderHook(() => useEnhancedAIBots(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const botsData = result.current.data!;
    expect(Array.isArray(botsData)).toBe(true);
    expect(botsData.length).toBeGreaterThan(0);
    expect(botsData[0]).toHaveProperty('id');
    expect(botsData[0]).toHaveProperty('name');
    expect(botsData[0]).toHaveProperty('performance');
  });
});
