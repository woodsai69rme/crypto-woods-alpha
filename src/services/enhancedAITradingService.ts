import { supabase } from '@/integrations/supabase/client';
import { AITradingService, AISignalRequest, TradingBotConfig } from './aiTradingService';

export interface BotState {
  id: string;
  isRunning: boolean;
  lastSignalTime: Date | null;
  executedTrades: number;
  errorCount: number;
  performance: {
    totalTrades: number;
    winningTrades: number;
    profitLoss: number;
    winRate: number;
  };
}

export interface MemoryConstraints {
  maxMemoryUsage: number; // MB
  maxExecutionTime: number; // seconds
  maxConcurrentRequests: number;
}

export class EnhancedAITradingService extends AITradingService {
  private static botStates = new Map<string, BotState>();
  private static memoryConstraints: MemoryConstraints = {
    maxMemoryUsage: 150, // 150MB limit
    maxExecutionTime: 30, // 30 seconds
    maxConcurrentRequests: 5
  };
  private static activeRequests = 0;

  static async createEnhancedBot(
    name: string,
    bot_type: string,
    config: TradingBotConfig,
    strategy_id?: string,
    trading_account_id?: string
  ) {
    try {
      // Check memory constraints before creating bot
      if (this.botStates.size >= 10) {
        throw new Error('Maximum number of bots reached. Stop existing bots before creating new ones.');
      }

      const bot = await this.createTradingBot(name, bot_type, config, strategy_id, trading_account_id);
      
      // Initialize bot state with proper memory management
      this.botStates.set(bot.id, {
        id: bot.id,
        isRunning: false,
        lastSignalTime: null,
        executedTrades: 0,
        errorCount: 0,
        performance: {
          totalTrades: 0,
          winningTrades: 0,
          profitLoss: 0,
          winRate: 0
        }
      });

      return bot;
    } catch (error) {
      console.error('Error creating enhanced bot:', error);
      throw error;
    }
  }

  static async startBot(botId: string): Promise<boolean> {
    const state = this.botStates.get(botId);
    if (!state) {
      throw new Error('Bot not found');
    }

    // Check if we're within memory constraints
    if (this.activeRequests >= this.memoryConstraints.maxConcurrentRequests) {
      throw new Error('Too many active bots. Please stop some bots before starting new ones.');
    }

    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .update({ 
          is_running: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', botId)
        .select()
        .single();

      if (error) throw error;

      state.isRunning = true;
      this.activeRequests++;
      
      return true;
    } catch (error) {
      console.error('Error starting bot:', error);
      return false;
    }
  }

  static async stopBot(botId: string): Promise<boolean> {
    const state = this.botStates.get(botId);
    if (!state) {
      throw new Error('Bot not found');
    }

    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .update({ 
          is_running: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', botId)
        .select()
        .single();

      if (error) throw error;

      state.isRunning = false;
      this.activeRequests = Math.max(0, this.activeRequests - 1);
      
      return true;
    } catch (error) {
      console.error('Error stopping bot:', error);
      return false;
    }
  }

  static async generateEnhancedSignal(botId: string, request: AISignalRequest) {
    const state = this.botStates.get(botId);
    if (!state) {
      throw new Error('Bot not found');
    }

    if (!state.isRunning) {
      throw new Error('Bot is not running');
    }

    // Check memory and execution constraints
    const memoryUsage = this.estimateMemoryUsage();
    if (memoryUsage > this.memoryConstraints.maxMemoryUsage) {
      state.errorCount++;
      throw new Error('Memory limit exceeded. Please reduce bot load.');
    }

    try {
      // Validate trading pair ID before generating signal
      if (!this.isValidUUID(request.trading_pair_id)) {
        // Get first available valid trading pair
        const { data: pairs } = await supabase
          .from('trading_pairs')
          .select('id, symbol')
          .eq('is_active', true)
          .limit(1);
        
        if (pairs && pairs.length > 0) {
          request.trading_pair_id = pairs[0].id;
          console.warn(`Invalid trading pair ID replaced with: ${pairs[0].symbol}`);
        } else {
          throw new Error('No valid trading pairs available');
        }
      }

      const signal = await this.generateSignal(botId, request);
      
      // Update bot state
      state.lastSignalTime = new Date();
      state.executedTrades++;
      
      // Track performance
      state.performance.totalTrades++;
      if (request.confidence > 0.7) {
        state.performance.winningTrades++;
      }
      state.performance.winRate = (state.performance.winningTrades / state.performance.totalTrades) * 100;

      // Store performance in database
      await this.updateBotPerformance(botId, state.performance);

      return signal;
    } catch (error) {
      state.errorCount++;
      console.error('Error generating enhanced signal:', error);
      
      // Auto-stop bot if too many errors
      if (state.errorCount > 5) {
        await this.stopBot(botId);
        console.warn(`Bot ${botId} stopped due to excessive errors`);
      }
      
      throw error;
    }
  }

  static getBotState(botId: string): BotState | null {
    return this.botStates.get(botId) || null;
  }

  static getAllBotStates(): BotState[] {
    return Array.from(this.botStates.values());
  }

  static async emergencyStopAllBots(): Promise<void> {
    for (const [botId, state] of this.botStates) {
      if (state.isRunning) {
        await this.stopBot(botId);
      }
    }
    this.activeRequests = 0;
    console.log('Emergency stop: All bots stopped');
  }

  static getMemoryUsage(): number {
    return this.estimateMemoryUsage();
  }

  static getSystemHealth(): { 
    memoryUsage: number; 
    activeBots: number; 
    totalErrors: number; 
    status: 'healthy' | 'warning' | 'critical' 
  } {
    const memoryUsage = this.estimateMemoryUsage();
    const activeBots = Array.from(this.botStates.values()).filter(s => s.isRunning).length;
    const totalErrors = Array.from(this.botStates.values()).reduce((sum, s) => sum + s.errorCount, 0);
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (memoryUsage > 120 || totalErrors > 10) {
      status = 'critical';
    } else if (memoryUsage > 80 || totalErrors > 5) {
      status = 'warning';
    }

    return { memoryUsage, activeBots, totalErrors, status };
  }

  private static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private static estimateMemoryUsage(): number {
    // Simplified memory estimation based on active bots and requests
    const activeBots = Array.from(this.botStates.values()).filter(s => s.isRunning).length;
    const baseMemory = 50; // Base memory usage in MB
    const memoryPerBot = 15; // Memory per active bot in MB
    return baseMemory + (activeBots * memoryPerBot);
  }

  private static async updateBotPerformance(botId: string, performance: BotState['performance']) {
    try {
      await supabase
        .from('ai_trading_bots')
        .update({
          performance_stats: performance,
          updated_at: new Date().toISOString()
        })
        .eq('id', botId);
    } catch (error) {
      console.error('Error updating bot performance:', error);
    }
  }

  // Enhanced probability calculation with better error handling
  static async calculateEnhancedTradeProbability(
    trading_pair_id: string,
    direction: 'long' | 'short',
    timeframe: string = '1h'
  ): Promise<{ probability: number; confidence: number; factors: string[] }> {
    try {
      // Validate UUID first
      if (!this.isValidUUID(trading_pair_id)) {
        return {
          probability: 0.5,
          confidence: 0.1,
          factors: ['Invalid trading pair ID']
        };
      }

      const probability = await this.calculateTradeProbability(trading_pair_id, direction, timeframe);
      
      // Enhanced confidence calculation
      const confidence = Math.min(0.95, Math.max(0.1, Math.abs(probability - 0.5) * 2));
      
      // Determine factors affecting probability
      const factors = [];
      if (probability > 0.7) factors.push('Strong bullish signals');
      if (probability < 0.3) factors.push('Strong bearish signals');
      if (confidence < 0.3) factors.push('Low data quality');
      if (confidence > 0.8) factors.push('High confidence indicators');

      return { probability, confidence, factors };
    } catch (error) {
      console.error('Error calculating enhanced probability:', error);
      return {
        probability: 0.5,
        confidence: 0.1,
        factors: ['Calculation error']
      };
    }
  }
}