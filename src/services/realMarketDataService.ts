
import { supabase } from '@/integrations/supabase/client';
import { CryptoDataService } from './cryptoDataService';

interface RealTimePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
}

interface MarketDataValidation {
  isValid: boolean;
  dataAge: number; // seconds
  source: string;
  confidence: number; // 0-1
  errors: string[];
}

export class RealMarketDataService {
  private static priceCache = new Map<string, RealTimePrice & { timestamp: number }>();
  private static readonly CACHE_DURATION = 5000; // 5 seconds
  private static readonly SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT'];

  // Get real-time prices with validation
  static async getRealTimePrices(): Promise<{ data: RealTimePrice[], validation: MarketDataValidation }> {
    const now = Date.now();
    const errors: string[] = [];
    
    try {
      // Primary source: Binance API (most reliable)
      const binancePrices = await this.getBinanceRealTimePrices();
      
      // Secondary validation: CoinGecko
      const coinGeckoPrices = await CryptoDataService.getCoinGeckoPrices(this.SYMBOLS);
      
      // Cross-validate prices
      const validatedPrices = this.validatePrices(binancePrices, coinGeckoPrices);
      
      // Update database with real prices
      await this.updateDatabasePrices(validatedPrices.data);
      
      console.log('Real market data fetched and validated:', validatedPrices.data.length, 'prices');
      
      return validatedPrices;
    } catch (error) {
      errors.push(`Market data fetch failed: ${error}`);
      console.error('Real market data error:', error);
      
      // Fallback to cached data
      const cachedData = this.getCachedPrices();
      return {
        data: cachedData,
        validation: {
          isValid: false,
          dataAge: now - Math.min(...Array.from(this.priceCache.values()).map(p => p.timestamp)),
          source: 'cache',
          confidence: 0.3,
          errors
        }
      };
    }
  }

  private static async getBinanceRealTimePrices(): Promise<RealTimePrice[]> {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!response.ok) throw new Error('Binance API error');
    
    const data = await response.json();
    const now = new Date().toISOString();
    
    return data
      .filter((ticker: any) => this.SYMBOLS.includes(ticker.symbol))
      .map((ticker: any) => ({
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        lastUpdate: now
      }));
  }

  private static validatePrices(primary: RealTimePrice[], secondary: any[]): { data: RealTimePrice[], validation: MarketDataValidation } {
    const errors: string[] = [];
    const validatedPrices: RealTimePrice[] = [];
    let totalConfidence = 0;
    
    primary.forEach(primaryPrice => {
      const secondaryPrice = secondary.find(s => s.symbol === primaryPrice.symbol);
      
      if (secondaryPrice) {
        // Check if prices are within reasonable range (5% difference)
        const priceDiff = Math.abs(primaryPrice.price - secondaryPrice.price) / primaryPrice.price;
        
        if (priceDiff > 0.05) {
          errors.push(`Price discrepancy for ${primaryPrice.symbol}: ${(priceDiff * 100).toFixed(2)}%`);
        }
        
        totalConfidence += (1 - Math.min(priceDiff, 0.05) * 20); // Max confidence reduction of 100%
      }
      
      // Cache the validated price
      this.priceCache.set(primaryPrice.symbol, {
        ...primaryPrice,
        timestamp: Date.now()
      });
      
      validatedPrices.push(primaryPrice);
    });
    
    const avgConfidence = totalConfidence / primary.length;
    
    return {
      data: validatedPrices,
      validation: {
        isValid: errors.length === 0,
        dataAge: 0,
        source: 'binance+coingecko',
        confidence: Math.max(0.5, avgConfidence), // Minimum 50% confidence
        errors
      }
    };
  }

  private static getCachedPrices(): RealTimePrice[] {
    return Array.from(this.priceCache.values()).map(cached => ({
      symbol: cached.symbol,
      price: cached.price,
      change24h: cached.change24h,
      volume24h: cached.volume24h,
      high24h: cached.high24h,
      low24h: cached.low24h,
      lastUpdate: cached.lastUpdate
    }));
  }

  private static async updateDatabasePrices(prices: RealTimePrice[]): Promise<void> {
    try {
      for (const price of prices) {
        // Get trading pair ID
        const { data: tradingPair } = await supabase
          .from('trading_pairs')
          .select('id')
          .eq('symbol', price.symbol)
          .single();

        if (tradingPair) {
          // Update market data
          await supabase
            .from('market_data_live')
            .upsert({
              trading_pair_id: tradingPair.id,
              price: price.price,
              volume_24h: price.volume24h,
              price_change_24h: price.change24h,
              high_24h: price.high24h,
              low_24h: price.low24h,
              exchange: 'binance',
              timestamp: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Database update error:', error);
    }
  }

  // Real-time WebSocket connection for live updates
  static initializeRealTimeUpdates(callback: (price: RealTimePrice) => void): WebSocket | null {
    try {
      const symbols = this.SYMBOLS.map(s => s.toLowerCase()).join('/');
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols}@ticker`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price: RealTimePrice = {
            symbol: data.s,
            price: parseFloat(data.c),
            change24h: parseFloat(data.P),
            volume24h: parseFloat(data.v),
            high24h: parseFloat(data.h),
            low24h: parseFloat(data.l),
            lastUpdate: new Date().toISOString()
          };
          
          // Update cache
          this.priceCache.set(price.symbol, { ...price, timestamp: Date.now() });
          callback(price);
        } catch (error) {
          console.error('WebSocket data parsing error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return ws;
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      return null;
    }
  }
}
