import { CryptoDataService } from './cryptoDataService';
import { supabase } from '@/integrations/supabase/client';

interface RealMarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
  source: string;
}

interface MarketDataUpdate {
  trading_pair_id: string;
  price: number;
  volume_24h: number;
  price_change_24h: number;
  high_24h: number;
  low_24h: number;
  exchange: string;
}

export class RealMarketDataService {
  private static updateInterval: NodeJS.Timeout | null = null;
  private static wsConnections: Map<string, WebSocket> = new Map();

  // Initialize real-time market data feeds
  static async initializeRealDataFeeds(): Promise<void> {
    console.log('🚀 Initializing real market data feeds...');
    
    try {
      // Get all active trading pairs
      const { data: tradingPairs, error } = await supabase
        .from('trading_pairs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (!tradingPairs || tradingPairs.length === 0) {
        console.warn('⚠️ No trading pairs found. Creating initial pairs...');
        await this.createInitialTradingPairs();
        return this.initializeRealDataFeeds();
      }

      const symbols = tradingPairs.map(pair => pair.symbol);
      console.log(`📊 Found ${symbols.length} trading pairs: ${symbols.join(', ')}`);

      // Start fetching real data
      await this.fetchAndStoreInitialData(symbols);
      
      // Set up periodic updates every 30 seconds
      this.updateInterval = setInterval(async () => {
        await this.updateMarketData(symbols);
      }, 30000);

      // Set up WebSocket for real-time updates
      this.setupWebSocketFeeds(symbols);

      console.log('✅ Real market data feeds initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize real data feeds:', error);
      throw error;
    }
  }

  // Create initial trading pairs if none exist
  private static async createInitialTradingPairs(): Promise<void> {
    const initialPairs = [
      { symbol: 'BTCUSDT', base_asset: 'BTC', quote_asset: 'USDT', exchange: 'binance' },
      { symbol: 'ETHUSDT', base_asset: 'ETH', quote_asset: 'USDT', exchange: 'binance' },
      { symbol: 'ADAUSDT', base_asset: 'ADA', quote_asset: 'USDT', exchange: 'binance' },
      { symbol: 'SOLUSDT', base_asset: 'SOL', quote_asset: 'USDT', exchange: 'binance' },
      { symbol: 'DOTUSDT', base_asset: 'DOT', quote_asset: 'USDT', exchange: 'binance' },
    ];

    for (const pair of initialPairs) {
      const { error } = await supabase
        .from('trading_pairs')
        .insert(pair);
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Failed to create trading pair:', pair.symbol, error);
      }
    }
  }

  // Fetch and store initial market data
  private static async fetchAndStoreInitialData(symbols: string[]): Promise<void> {
    console.log('📥 Fetching initial market data...');
    
    try {
      const aggregatedPrices = await CryptoDataService.getAggregatedPrices(symbols);
      
      if (aggregatedPrices.length === 0) {
        console.warn('⚠️ No price data received from APIs');
        return;
      }

      // Convert to RealMarketData format
      const realMarketData: RealMarketData[] = aggregatedPrices.map(price => ({
        ...price,
        source: 'aggregated'
      }));

      await this.storeMarketData(realMarketData);
      console.log(`✅ Stored initial data for ${aggregatedPrices.length} symbols`);
    } catch (error) {
      console.error('❌ Failed to fetch initial data:', error);
    }
  }

  // Update market data from external APIs
  private static async updateMarketData(symbols: string[]): Promise<void> {
    try {
      console.log('🔄 Updating market data...');
      const prices = await CryptoDataService.getAggregatedPrices(symbols);
      
      if (prices.length > 0) {
        const realMarketData: RealMarketData[] = prices.map(price => ({
          ...price,
          source: 'aggregated'
        }));
        await this.storeMarketData(realMarketData);
        console.log(`✅ Updated ${prices.length} market prices`);
      }
    } catch (error) {
      console.error('❌ Market data update failed:', error);
    }
  }

  // Store market data in database
  private static async storeMarketData(prices: RealMarketData[]): Promise<void> {
    for (const price of prices) {
      try {
        // Get trading pair ID
        const { data: tradingPair } = await supabase
          .from('trading_pairs')
          .select('id')
          .eq('symbol', price.symbol)
          .single();

        if (!tradingPair) {
          console.warn(`Trading pair not found: ${price.symbol}`);
          continue;
        }

        // Update or insert market data
        const marketUpdate: MarketDataUpdate = {
          trading_pair_id: tradingPair.id,
          price: price.price,
          volume_24h: price.volume24h,
          price_change_24h: price.change24h,
          high_24h: price.high24h,
          low_24h: price.low24h,
          exchange: 'aggregated'
        };

        const { error } = await supabase
          .from('market_data_live')
          .upsert(marketUpdate, { 
            onConflict: 'trading_pair_id,exchange',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Failed to store market data for ${price.symbol}:`, error);
        }
      } catch (error) {
        console.error(`Error processing ${price.symbol}:`, error);
      }
    }
  }

  // Set up WebSocket connections for real-time updates
  private static setupWebSocketFeeds(symbols: string[]): void {
    console.log('🌐 Setting up WebSocket feeds...');
    
    // Binance WebSocket for real-time price updates
    CryptoDataService.connectBinanceWebSocket(symbols, async (priceData) => {
      try {
        await this.storeMarketData([{
          symbol: priceData.symbol,
          price: priceData.price,
          change24h: priceData.change24h,
          volume24h: priceData.volume24h,
          high24h: priceData.high24h,
          low24h: priceData.low24h,
          timestamp: priceData.timestamp,
          source: 'binance_ws'
        }]);
      } catch (error) {
        console.error('WebSocket data storage error:', error);
      }
    });
  }

  // Get current market status
  static async getMarketStatus(): Promise<{
    totalPairs: number;
    activePairs: number;
    lastUpdate: string;
    dataSource: string;
    healthStatus: 'healthy' | 'degraded' | 'critical';
  }> {
    try {
      const { data: pairs } = await supabase
        .from('trading_pairs')
        .select('*');

      const { data: lastData } = await supabase
        .from('market_data_live')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const totalPairs = pairs?.length || 0;
      const activePairs = pairs?.filter(p => p.is_active).length || 0;
      const lastUpdate = lastData?.timestamp || 'Never';
      
      // Determine health status
      const lastUpdateTime = lastData ? new Date(lastData.timestamp) : null;
      const timeSinceUpdate = lastUpdateTime ? Date.now() - lastUpdateTime.getTime() : Infinity;
      
      let healthStatus: 'healthy' | 'degraded' | 'critical' = 'critical';
      if (timeSinceUpdate < 60000) healthStatus = 'healthy'; // < 1 minute
      else if (timeSinceUpdate < 300000) healthStatus = 'degraded'; // < 5 minutes

      return {
        totalPairs,
        activePairs,
        lastUpdate,
        dataSource: 'Multi-source aggregation',
        healthStatus
      };
    } catch (error) {
      console.error('Failed to get market status:', error);
      return {
        totalPairs: 0,
        activePairs: 0,
        lastUpdate: 'Error',
        dataSource: 'Unknown',
        healthStatus: 'critical'
      };
    }
  }

  // Cleanup connections
  static cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    CryptoDataService.disconnectAll();
    console.log('🧹 Real market data service cleaned up');
  }

  // Force refresh all market data
  static async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing all market data...');
    
    const { data: tradingPairs } = await supabase
      .from('trading_pairs')
      .select('symbol')
      .eq('is_active', true);

    if (tradingPairs) {
      const symbols = tradingPairs.map(pair => pair.symbol);
      await this.updateMarketData(symbols);
    }
  }
}