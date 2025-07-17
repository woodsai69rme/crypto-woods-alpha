
import { supabase } from '@/integrations/supabase/client';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

interface OrderBookData {
  bids: [number, number][];
  asks: [number, number][];
  timestamp: string;
}

interface TradeData {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: string;
  side: 'buy' | 'sell';
}

export class CryptoDataService {
  private static wsConnections: Map<string, WebSocket> = new Map();
  private static priceCache: Map<string, CryptoPrice> = new Map();

  // CoinGecko API (Free)
  static async getCoinGeckoPrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      const ids = symbols.map(s => s.toLowerCase().replace('usdt', '')).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      
      if (!response.ok) throw new Error('CoinGecko API error');
      
      const data = await response.json();
      const prices: CryptoPrice[] = [];
      
      Object.keys(data).forEach(id => {
        const coinData = data[id];
        prices.push({
          symbol: id.toUpperCase() + 'USDT',
          price: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          volume24h: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap || 0,
          high24h: coinData.usd * (1 + (coinData.usd_24h_change || 0) / 100),
          low24h: coinData.usd * (1 - Math.abs(coinData.usd_24h_change || 0) / 100),
          timestamp: new Date().toISOString()
        });
      });
      
      await this.logAuditEvent('price_fetch', 'coingecko', { count: prices.length });
      return prices;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return [];
    }
  }

  // Binance Public API (Free)
  static async getBinancePrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!response.ok) throw new Error('Binance API error');
      
      const data = await response.json();
      const prices: CryptoPrice[] = data
        .filter((ticker: any) => symbols.includes(ticker.symbol))
        .map((ticker: any) => ({
          symbol: ticker.symbol,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.volume),
          marketCap: 0, // Not available in this endpoint
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          timestamp: new Date().toISOString()
        }));
      
      await this.logAuditEvent('price_fetch', 'binance', { count: prices.length });
      return prices;
    } catch (error) {
      console.error('Binance API error:', error);
      return [];
    }
  }

  // CoinCap API (Free)
  static async getCoinCapPrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
      if (!response.ok) throw new Error('CoinCap API error');
      
      const { data } = await response.json();
      const prices: CryptoPrice[] = data
        .filter((asset: any) => symbols.some(s => s.startsWith(asset.symbol)))
        .map((asset: any) => ({
          symbol: asset.symbol + 'USDT',
          price: parseFloat(asset.priceUsd),
          change24h: parseFloat(asset.changePercent24Hr),
          volume24h: parseFloat(asset.volumeUsd24Hr),
          marketCap: parseFloat(asset.marketCapUsd),
          high24h: parseFloat(asset.priceUsd) * 1.05, // Estimated
          low24h: parseFloat(asset.priceUsd) * 0.95, // Estimated
          timestamp: new Date().toISOString()
        }));
      
      await this.logAuditEvent('price_fetch', 'coincap', { count: prices.length });
      return prices;
    } catch (error) {
      console.error('CoinCap API error:', error);
      return [];
    }
  }

  // Kraken Public API (Free)
  static async getKrakenPrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      const krakenSymbols = symbols.map(s => s.replace('USDT', 'USD')).join(',');
      const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${krakenSymbols}`);
      
      if (!response.ok) throw new Error('Kraken API error');
      
      const { result } = await response.json();
      const prices: CryptoPrice[] = [];
      
      Object.keys(result).forEach(pair => {
        const ticker = result[pair];
        prices.push({
          symbol: pair.replace('USD', 'USDT'),
          price: parseFloat(ticker.c[0]),
          change24h: ((parseFloat(ticker.c[0]) - parseFloat(ticker.o)) / parseFloat(ticker.o)) * 100,
          volume24h: parseFloat(ticker.v[1]),
          marketCap: 0,
          high24h: parseFloat(ticker.h[1]),
          low24h: parseFloat(ticker.l[1]),
          timestamp: new Date().toISOString()
        });
      });
      
      await this.logAuditEvent('price_fetch', 'kraken', { count: prices.length });
      return prices;
    } catch (error) {
      console.error('Kraken API error:', error);
      return [];
    }
  }

  // Aggregate data from all sources
  static async getAggregatedPrices(symbols: string[]): Promise<CryptoPrice[]> {
    const [coingecko, binance, coincap, kraken] = await Promise.all([
      this.getCoinGeckoPrices(symbols),
      this.getBinancePrices(symbols),
      this.getCoinCapPrices(symbols),
      this.getKrakenPrices(symbols)
    ]);

    const aggregated: Map<string, CryptoPrice[]> = new Map();
    
    [...coingecko, ...binance, ...coincap, ...kraken].forEach(price => {
      if (!aggregated.has(price.symbol)) {
        aggregated.set(price.symbol, []);
      }
      aggregated.get(price.symbol)!.push(price);
    });

    const result: CryptoPrice[] = [];
    aggregated.forEach((prices, symbol) => {
      if (prices.length > 0) {
        // Average prices from multiple sources
        const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        const avgChange = prices.reduce((sum, p) => sum + p.change24h, 0) / prices.length;
        const avgVolume = prices.reduce((sum, p) => sum + p.volume24h, 0) / prices.length;
        
        result.push({
          symbol,
          price: avgPrice,
          change24h: avgChange,
          volume24h: avgVolume,
          marketCap: Math.max(...prices.map(p => p.marketCap)),
          high24h: Math.max(...prices.map(p => p.high24h)),
          low24h: Math.min(...prices.map(p => p.low24h)),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Store in database
    await this.storePricesInDatabase(result);
    return result;
  }

  // WebSocket connections for real-time data
  static connectBinanceWebSocket(symbols: string[], callback: (data: CryptoPrice) => void): void {
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const price: CryptoPrice = {
          symbol: data.s,
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume24h: parseFloat(data.v),
          marketCap: 0,
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l),
          timestamp: new Date().toISOString()
        };
        
        this.priceCache.set(data.s, price);
        callback(price);
        this.logAuditEvent('realtime_price', 'binance_ws', { symbol: data.s, price: price.price });
      } catch (error) {
        console.error('WebSocket data parsing error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
      this.logAuditEvent('websocket_error', 'binance', { error: error.toString() });
    };
    
    this.wsConnections.set('binance', ws);
  }

  // Store prices in database
  static async storePricesInDatabase(prices: CryptoPrice[]): Promise<void> {
    try {
      for (const price of prices) {
        // Find or create trading pair
        let { data: tradingPair } = await supabase
          .from('trading_pairs')
          .select('id')
          .eq('symbol', price.symbol)
          .single();

        if (!tradingPair) {
          const { data: newPair } = await supabase
            .from('trading_pairs')
            .insert({
              symbol: price.symbol,
              base_asset: price.symbol.replace('USDT', ''),
              quote_asset: 'USDT',
              exchange: 'aggregated'
            })
            .select('id')
            .single();
          tradingPair = newPair;
        }

        if (tradingPair) {
          // Insert market data
          await supabase
            .from('market_data_live')
            .insert({
              trading_pair_id: tradingPair.id,
              price: price.price,
              volume_24h: price.volume24h,
              price_change_24h: price.change24h,
              high_24h: price.high24h,
              low_24h: price.low24h,
              exchange: 'aggregated'
            });
        }
      }

      await this.logAuditEvent('store_prices', 'database', { count: prices.length });
    } catch (error) {
      console.error('Database storage error:', error);
      await this.logAuditEvent('storage_error', 'database', { error: error.toString() });
    }
  }

  // Get order book data
  static async getBinanceOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`);
      if (!response.ok) throw new Error('Binance order book error');
      
      const data = await response.json();
      const orderBook: OrderBookData = {
        bids: data.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: data.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: new Date().toISOString()
      };

      await this.logAuditEvent('orderbook_fetch', 'binance', { symbol, bids: orderBook.bids.length, asks: orderBook.asks.length });
      return orderBook;
    } catch (error) {
      console.error('Order book fetch error:', error);
      return { bids: [], asks: [], timestamp: new Date().toISOString() };
    }
  }

  // Get recent trades
  static async getBinanceTrades(symbol: string, limit: number = 100): Promise<TradeData[]> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${limit}`);
      if (!response.ok) throw new Error('Binance trades error');
      
      const data = await response.json();
      const trades: TradeData[] = data.map((trade: any) => ({
        id: trade.id.toString(),
        symbol,
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.qty),
        timestamp: new Date(trade.time).toISOString(),
        side: trade.isBuyerMaker ? 'sell' : 'buy'
      }));

      await this.logAuditEvent('trades_fetch', 'binance', { symbol, count: trades.length });
      return trades;
    } catch (error) {
      console.error('Trades fetch error:', error);
      return [];
    }
  }

  private static async logAuditEvent(action: string, source: string, data: any): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: `crypto_data_${action}`,
          resource_type: 'market_data',
          new_values: JSON.parse(JSON.stringify({ source, ...data }))
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  // Cleanup WebSocket connections
  static disconnectAll(): void {
    this.wsConnections.forEach((ws, key) => {
      ws.close();
      console.log(`Disconnected ${key} WebSocket`);
    });
    this.wsConnections.clear();
  }
}
