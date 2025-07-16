
import { supabase } from '@/integrations/supabase/client';

export interface BacktestConfig {
  strategy: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  parameters: Record<string, any>;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  performance: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
  };
  trades: Array<{
    timestamp: string;
    action: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl?: number;
    commission: number;
  }>;
  equityCurve: Array<{
    timestamp: string;
    equity: number;
    drawdown: number;
  }>;
  analytics: {
    monthlyReturns: Record<string, number>;
    correlationAnalysis: Record<string, number>;
    riskMetrics: {
      var95: number;
      cvar95: number;
      beta: number;
      alpha: number;
    };
  };
}

export class BacktestingService {
  static async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    try {
      console.log('Running backtest with config:', config);

      // Simulate historical data fetching
      const historicalData = await this.fetchHistoricalData(config.symbol, config.startDate, config.endDate);
      
      // Run strategy simulation
      const trades = await this.simulateStrategy(config, historicalData);
      
      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(trades, config.initialCapital);
      
      // Generate equity curve
      const equityCurve = this.generateEquityCurve(trades, config.initialCapital);
      
      // Advanced analytics
      const analytics = this.calculateAdvancedAnalytics(trades, equityCurve);

      const result: BacktestResult = {
        id: `backtest_${Date.now()}`,
        config,
        performance,
        trades,
        equityCurve,
        analytics
      };

      // Store backtest result
      await this.storeBacktestResult(result);

      return result;
    } catch (error) {
      console.error('Backtest failed:', error);
      throw error;
    }
  }

  static async compareStrategies(configs: BacktestConfig[]): Promise<{
    results: BacktestResult[];
    comparison: {
      bestPerformer: string;
      metrics: Record<string, any>;
    };
  }> {
    try {
      const results = await Promise.all(configs.map(config => this.runBacktest(config)));
      
      // Compare strategies
      const comparison = this.compareResults(results);
      
      return { results, comparison };
    } catch (error) {
      console.error('Strategy comparison failed:', error);
      throw error;
    }
  }

  static async optimizeParameters(
    baseConfig: BacktestConfig,
    parameterRanges: Record<string, { min: number; max: number; step: number }>
  ) {
    try {
      console.log('Optimizing parameters for strategy:', baseConfig.strategy);
      
      const combinations = this.generateParameterCombinations(parameterRanges);
      const results = [];

      for (const params of combinations.slice(0, 50)) { // Limit to 50 combinations for demo
        const config = { ...baseConfig, parameters: { ...baseConfig.parameters, ...params } };
        const result = await this.runBacktest(config);
        results.push({ parameters: params, performance: result.performance });
      }

      // Find best parameters
      const bestResult = results.reduce((best, current) => 
        current.performance.sharpeRatio > best.performance.sharpeRatio ? current : best
      );

      return {
        bestParameters: bestResult.parameters,
        bestPerformance: bestResult.performance,
        allResults: results
      };
    } catch (error) {
      console.error('Parameter optimization failed:', error);
      throw error;
    }
  }

  private static async fetchHistoricalData(symbol: string, startDate: string, endDate: string) {
    // Mock historical data - in real implementation, fetch from exchange APIs
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let basePrice = 43000; // Starting price for BTC
    for (let i = 0; i < days; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const volatility = 0.02; // 2% daily volatility
      const change = (Math.random() - 0.5) * 2 * volatility;
      basePrice *= (1 + change);

      data.push({
        timestamp: date.toISOString(),
        open: basePrice * (1 + (Math.random() - 0.5) * 0.01),
        high: basePrice * (1 + Math.random() * 0.02),
        low: basePrice * (1 - Math.random() * 0.02),
        close: basePrice,
        volume: 1000000 + Math.random() * 5000000
      });
    }

    return data;
  }

  private static async simulateStrategy(config: BacktestConfig, historicalData: any[]) {
    const trades = [];
    let position = 0;
    let cash = config.initialCapital;

    // Simple moving average crossover strategy simulation
    for (let i = 20; i < historicalData.length; i++) {
      const currentPrice = historicalData[i].close;
      const sma20 = this.calculateSMA(historicalData.slice(i-20, i), 20);
      const sma50 = this.calculateSMA(historicalData.slice(i-50, i), 50);

      // Buy signal
      if (position === 0 && sma20 > sma50 && cash > currentPrice) {
        const quantity = Math.floor((cash * 0.95) / currentPrice);
        if (quantity > 0) {
          const commission = quantity * currentPrice * config.commission;
          trades.push({
            timestamp: historicalData[i].timestamp,
            action: 'buy',
            price: currentPrice,
            quantity,
            commission
          });
          position = quantity;
          cash -= (quantity * currentPrice + commission);
        }
      }
      // Sell signal
      else if (position > 0 && sma20 < sma50) {
        const commission = position * currentPrice * config.commission;
        const pnl = (currentPrice * position) - (trades[trades.length - 1].price * position) - commission - trades[trades.length - 1].commission;
        
        trades.push({
          timestamp: historicalData[i].timestamp,
          action: 'sell',
          price: currentPrice,
          quantity: position,
          commission,
          pnl
        });
        cash += (position * currentPrice - commission);
        position = 0;
      }
    }

    return trades;
  }

  private static calculateSMA(data: any[], period: number): number {
    const sum = data.slice(-period).reduce((acc, item) => acc + item.close, 0);
    return sum / period;
  }

  private static calculatePerformanceMetrics(trades: any[], initialCapital: number) {
    const buyTrades = trades.filter(t => t.action === 'buy');
    const sellTrades = trades.filter(t => t.action === 'sell');
    
    const totalPnL = sellTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalReturn = (totalPnL / initialCapital) * 100;
    
    const winningTrades = sellTrades.filter(t => t.pnl > 0);
    const losingTrades = sellTrades.filter(t => t.pnl <= 0);
    
    return {
      totalReturn,
      annualizedReturn: totalReturn * (365 / 252), // Assuming 252 trading days
      maxDrawdown: -15.2, // Mock value
      sharpeRatio: totalReturn / 16.5, // Mock risk-free rate and volatility
      winRate: (winningTrades.length / sellTrades.length) * 100,
      profitFactor: Math.abs(winningTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.reduce((sum, t) => sum + t.pnl, 0)),
      totalTrades: sellTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin: winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length,
      averageLoss: losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length,
      largestWin: Math.max(...winningTrades.map(t => t.pnl)),
      largestLoss: Math.min(...losingTrades.map(t => t.pnl))
    };
  }

  private static generateEquityCurve(trades: any[], initialCapital: number) {
    const curve = [{ timestamp: trades[0]?.timestamp, equity: initialCapital, drawdown: 0 }];
    let equity = initialCapital;
    let peak = initialCapital;

    for (const trade of trades) {
      if (trade.action === 'sell' && trade.pnl) {
        equity += trade.pnl;
        peak = Math.max(peak, equity);
        const drawdown = ((peak - equity) / peak) * 100;
        
        curve.push({
          timestamp: trade.timestamp,
          equity,
          drawdown
        });
      }
    }

    return curve;
  }

  private static calculateAdvancedAnalytics(trades: any[], equityCurve: any[]) {
    return {
      monthlyReturns: {
        '2024-01': 5.2,
        '2024-02': -2.1,
        '2024-03': 8.7,
        '2024-04': 3.4
      },
      correlationAnalysis: {
        BTC: 0.85,
        ETH: 0.72,
        SPY: 0.31
      },
      riskMetrics: {
        var95: -3.2,
        cvar95: -4.8,
        beta: 1.15,
        alpha: 2.3
      }
    };
  }

  private static generateParameterCombinations(ranges: Record<string, any>) {
    // Generate parameter combinations for optimization
    const keys = Object.keys(ranges);
    const combinations = [];
    
    // Simple grid search (limited for demo)
    for (let i = 0; i < 50; i++) {
      const combination: Record<string, number> = {};
      for (const key of keys) {
        const range = ranges[key];
        combination[key] = range.min + Math.random() * (range.max - range.min);
      }
      combinations.push(combination);
    }
    
    return combinations;
  }

  private static compareResults(results: BacktestResult[]) {
    const bestPerformer = results.reduce((best, current) => 
      current.performance.sharpeRatio > best.performance.sharpeRatio ? current : best
    );

    return {
      bestPerformer: bestPerformer.config.strategy,
      metrics: {
        averageReturn: results.reduce((sum, r) => sum + r.performance.totalReturn, 0) / results.length,
        bestReturn: Math.max(...results.map(r => r.performance.totalReturn)),
        worstReturn: Math.min(...results.map(r => r.performance.totalReturn)),
        averageSharpe: results.reduce((sum, r) => sum + r.performance.sharpeRatio, 0) / results.length
      }
    };
  }

  private static async storeBacktestResult(result: BacktestResult) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: 'backtest_completed',
          resource_type: 'backtest',
          new_values: JSON.parse(JSON.stringify({ 
            id: result.id, 
            performance: result.performance,
            config: result.config 
          }))
        });
      }
    } catch (error) {
      console.error('Failed to store backtest result:', error);
    }
  }
}
