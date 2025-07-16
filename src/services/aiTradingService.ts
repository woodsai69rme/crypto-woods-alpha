
import { supabase } from '@/integrations/supabase/client';

export interface AISignalRequest {
  trading_pair_id: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price_target?: number;
  stop_loss?: number;
  take_profit?: number;
  reasoning: string;
  technical_indicators?: Record<string, any>;
  sentiment_score?: number;
}

export interface TradingBotConfig {
  [key: string]: any;
  strategy_type: 'momentum' | 'dca' | 'grid' | 'arbitrage' | 'ml_predictor' | 'sentiment';
  risk_level: 'low' | 'medium' | 'high';
  max_position_size: number;
  stop_loss_percentage: number;
  take_profit_percentage: number;
  indicators: string[];
}

export class AITradingService {
  static async createTradingBot(
    name: string,
    bot_type: string,
    config: TradingBotConfig,
    strategy_id?: string,
    trading_account_id?: string
  ) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('ai_trading_bots')
      .insert({
        user_id: user.user.id,
        name,
        bot_type,
        config: config as any,
        strategy_id,
        trading_account_id,
        is_running: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async generateSignal(bot_id: string, request: AISignalRequest) {
    const { data, error } = await supabase
      .from('ai_trading_signals')
      .insert({
        bot_id,
        ...request,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async calculateTradeProbability(
    trading_pair_id: string,
    direction: 'long' | 'short',
    timeframe: string = '1h'
  ): Promise<number> {
    // Advanced probability calculation based on multiple factors
    try {
      const [marketData, liquidityZones, fibLevelsData] = await Promise.all([
        supabase
          .from('market_data_live')
          .select('*')
          .eq('trading_pair_id', trading_pair_id)
          .single(),
        supabase
          .from('liquidity_zones')
          .select('*')
          .eq('trading_pair_id', trading_pair_id),
        supabase
          .from('fibonacci_levels')
          .select('*')
          .eq('trading_pair_id', trading_pair_id)
          .eq('timeframe', timeframe)
          .eq('is_active', true)
      ]);

      if (!marketData.data) return 0.5; // Neutral probability

      const price = Number(marketData.data.price);
      let probability = 0.5; // Base probability

      // Factor 1: Liquidity zone analysis
      if (liquidityZones.data) {
        const nearbyZones = liquidityZones.data.filter(zone => {
          const zonePriceLevel = Number(zone.price_level);
          const priceDistance = Math.abs(price - zonePriceLevel) / price;
          return priceDistance < 0.02; // Within 2% of current price
        });

        for (const zone of nearbyZones) {
          const strengthMultiplier = zone.strength === 'strong' ? 0.3 : 
                                   zone.strength === 'medium' ? 0.15 : 0.05;
          
          if (zone.zone_type === 'support' && direction === 'long') {
            probability += strengthMultiplier;
          } else if (zone.zone_type === 'resistance' && direction === 'short') {
            probability += strengthMultiplier;
          }
        }
      }

      // Factor 2: Fibonacci level analysis
      if (fibLevelsData.data && fibLevelsData.data.length > 0) {
        const latestFib = fibLevelsData.data[0];
        const fibLevels = [
          Number(latestFib.level_236),
          Number(latestFib.level_382),
          Number(latestFib.level_500),
          Number(latestFib.level_618),
          Number(latestFib.level_786)
        ].filter(level => level && !isNaN(level));

        // Check if price is near any Fibonacci level
        for (const level of fibLevels) {
          const distance = Math.abs(price - level) / price;
          if (distance < 0.01) { // Within 1% of Fib level
            probability += direction === 'long' ? 0.1 : -0.1;
          }
        }
      }

      // Factor 3: Volume and momentum analysis
      const priceChange24h = Number(marketData.data.price_change_24h);
      
      if (priceChange24h > 0 && direction === 'long') {
        probability += Math.min(priceChange24h / 100, 0.2); // Max 20% boost
      } else if (priceChange24h < 0 && direction === 'short') {
        probability += Math.min(Math.abs(priceChange24h) / 100, 0.2);
      }

      // Ensure probability stays within bounds
      return Math.max(0.1, Math.min(0.9, probability));
    } catch (error) {
      console.error('Error calculating trade probability:', error);
      return 0.5; // Return neutral probability on error
    }
  }

  static async analyzeLiquidityTargets(trading_pair_id: string) {
    const { data, error } = await supabase
      .from('liquidity_zones')
      .select('*')
      .eq('trading_pair_id', trading_pair_id)
      .eq('is_market_maker_target', true)
      .order('volume', { ascending: false });

    if (error) throw error;

    return data.map(zone => ({
      price_level: Number(zone.price_level),
      direction: zone.zone_type === 'support' ? 'above' : 'below',
      strength: zone.strength,
      volume: Number(zone.volume),
      big_orders_count: zone.big_orders_count,
    }));
  }

  static async getMarketCorrelations() {
    // Simplified correlation analysis - in real implementation, this would be more complex
    const { data: btcData } = await supabase
      .from('market_data_live')
      .select('*, trading_pairs!inner(*)')
      .eq('trading_pairs.symbol', 'BTCUSDT')
      .single();

    const { data: ethData } = await supabase
      .from('market_data_live')
      .select('*, trading_pairs!inner(*)')
      .eq('trading_pairs.symbol', 'ETHUSDT')
      .single();

    if (btcData && ethData) {
      const btcChange = Number(btcData.price_change_24h);
      const ethChange = Number(ethData.price_change_24h);
      
      // Simple correlation calculation
      const correlation = (btcChange * ethChange) > 0 ? 0.7 : -0.3;
      
      return {
        btc_eth_correlation: correlation,
        divergence_detected: Math.abs(btcChange - ethChange) > 5,
        btc_change_24h: btcChange,
        eth_change_24h: ethChange,
      };
    }

    return null;
  }
}
