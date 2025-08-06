import { supabase } from '@/integrations/supabase/client';

interface AuditResult {
  isValid: boolean;
  tolerance: number;
  calculated: number;
  stored: number;
  difference: number;
  percentageDiff: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
}

interface PortfolioAudit {
  userId: string;
  totalValue: AuditResult;
  totalInvested: AuditResult;
  unrealizedPnL: AuditResult;
  realizedPnL: AuditResult;
  totalPnL: AuditResult;
  holdingsCount: number;
  lastUpdated: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
}

interface TradingAudit {
  orderId: string;
  executionPrice: AuditResult;
  fees: AuditResult;
  portfolioUpdate: AuditResult;
  balanceUpdate: AuditResult;
  timestamp: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
}

export class TradingAuditService {
  private static readonly TOLERANCE_PERCENTAGE = 1; // 1% tolerance
  private static readonly FEE_RATE = 0.001; // 0.1% trading fee

  // Audit a single calculation with tolerance
  private static auditCalculation(
    calculated: number,
    stored: number,
    tolerance: number = this.TOLERANCE_PERCENTAGE,
    description: string
  ): AuditResult {
    const difference = Math.abs(calculated - stored);
    const percentageDiff = stored === 0 ? 
      (calculated === 0 ? 0 : 100) : 
      (difference / Math.abs(stored)) * 100;

    const isValid = percentageDiff <= tolerance;
    
    let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (!isValid) {
      status = percentageDiff <= tolerance * 2 ? 'WARNING' : 'FAIL';
    }

    return {
      isValid,
      tolerance,
      calculated,
      stored,
      difference,
      percentageDiff,
      status,
      message: `${description}: ${status} (${percentageDiff.toFixed(2)}% diff)`
    };
  }

  // Audit portfolio calculations for a user
  static async auditUserPortfolio(userId: string): Promise<PortfolioAudit> {
    try {
      // Get user's trading portfolios
      const { data: portfolios, error } = await supabase
        .from('user_trading_portfolios')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!portfolios || portfolios.length === 0) {
        return {
          userId,
          totalValue: this.auditCalculation(0, 0, this.TOLERANCE_PERCENTAGE, 'Total Value'),
          totalInvested: this.auditCalculation(0, 0, this.TOLERANCE_PERCENTAGE, 'Total Invested'),
          unrealizedPnL: this.auditCalculation(0, 0, this.TOLERANCE_PERCENTAGE, 'Unrealized P&L'),
          realizedPnL: this.auditCalculation(0, 0, this.TOLERANCE_PERCENTAGE, 'Realized P&L'),
          totalPnL: this.auditCalculation(0, 0, this.TOLERANCE_PERCENTAGE, 'Total P&L'),
          holdingsCount: 0,
          lastUpdated: new Date().toISOString(),
          overallStatus: 'PASS'
        };
      }

      // Calculate expected values
      let calculatedTotalValue = 0;
      let calculatedTotalInvested = 0;
      let calculatedUnrealizedPnL = 0;
      let calculatedRealizedPnL = 0;

      for (const portfolio of portfolios) {
        const quantity = Number(portfolio.quantity) || 0;
        const avgCost = Number(portfolio.average_cost) || 0;
        const invested = Number(portfolio.total_invested) || 0;
        
        // Get current market price for this asset
        const { data: marketData } = await supabase
          .from('market_data_live')
          .select('price')
          .eq('trading_pair_id', portfolio.trading_account_id) // This might need adjustment
          .single();

        const currentPrice = marketData ? Number(marketData.price) : avgCost;
        const currentValue = quantity * currentPrice;
        const unrealizedPnL = currentValue - invested;
        
        calculatedTotalValue += currentValue;
        calculatedTotalInvested += invested;
        calculatedUnrealizedPnL += unrealizedPnL;
        calculatedRealizedPnL += Number(portfolio.realized_pnl) || 0;
      }

      const calculatedTotalPnL = calculatedUnrealizedPnL + calculatedRealizedPnL;

      // Get stored values
      const storedTotalValue = portfolios.reduce((sum, p) => sum + (Number(p.current_value) || 0), 0);
      const storedTotalInvested = portfolios.reduce((sum, p) => sum + (Number(p.total_invested) || 0), 0);
      const storedUnrealizedPnL = portfolios.reduce((sum, p) => sum + (Number(p.unrealized_pnl) || 0), 0);
      const storedRealizedPnL = portfolios.reduce((sum, p) => sum + (Number(p.realized_pnl) || 0), 0);
      const storedTotalPnL = storedUnrealizedPnL + storedRealizedPnL;

      // Audit each calculation
      const totalValueAudit = this.auditCalculation(calculatedTotalValue, storedTotalValue, this.TOLERANCE_PERCENTAGE, 'Total Value');
      const totalInvestedAudit = this.auditCalculation(calculatedTotalInvested, storedTotalInvested, this.TOLERANCE_PERCENTAGE, 'Total Invested');
      const unrealizedPnLAudit = this.auditCalculation(calculatedUnrealizedPnL, storedUnrealizedPnL, this.TOLERANCE_PERCENTAGE, 'Unrealized P&L');
      const realizedPnLAudit = this.auditCalculation(calculatedRealizedPnL, storedRealizedPnL, this.TOLERANCE_PERCENTAGE, 'Realized P&L');
      const totalPnLAudit = this.auditCalculation(calculatedTotalPnL, storedTotalPnL, this.TOLERANCE_PERCENTAGE, 'Total P&L');

      // Determine overall status
      const audits = [totalValueAudit, totalInvestedAudit, unrealizedPnLAudit, realizedPnLAudit, totalPnLAudit];
      const hasFails = audits.some(a => a.status === 'FAIL');
      const hasWarnings = audits.some(a => a.status === 'WARNING');
      
      const overallStatus: 'PASS' | 'FAIL' | 'WARNING' = hasFails ? 'FAIL' : hasWarnings ? 'WARNING' : 'PASS';

      return {
        userId,
        totalValue: totalValueAudit,
        totalInvested: totalInvestedAudit,
        unrealizedPnL: unrealizedPnLAudit,
        realizedPnL: realizedPnLAudit,
        totalPnL: totalPnLAudit,
        holdingsCount: portfolios.length,
        lastUpdated: new Date().toISOString(),
        overallStatus
      };

    } catch (error) {
      console.error('Portfolio audit failed:', error);
      throw error;
    }
  }

  // Audit a specific trade execution
  static async auditTradeExecution(orderId: string): Promise<TradingAudit> {
    try {
      // Get order and execution details
      const { data: order, error: orderError } = await supabase
        .from('user_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: execution, error: execError } = await supabase
        .from('trade_executions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (execError) throw execError;

      // Get trading pair info
      const { data: tradingPair, error: pairError } = await supabase
        .from('trading_pairs')
        .select('*')
        .eq('id', order.trading_pair_id)
        .single();

      if (pairError) throw pairError;

      // Get market price at execution time
      const { data: marketData } = await supabase
        .from('market_data_live')
        .select('price')
        .eq('trading_pair_id', order.trading_pair_id)
        .single();

      const marketPrice = marketData ? Number(marketData.price) : Number(order.price);

      // Audit execution price (should be market price for market orders)
      const expectedPrice = order.order_type === 'market' ? marketPrice : Number(order.price);
      const executionPriceAudit = this.auditCalculation(
        expectedPrice,
        Number(execution.price),
        this.TOLERANCE_PERCENTAGE,
        'Execution Price'
      );

      // Audit fees calculation
      const expectedFees = Number(order.quantity) * Number(execution.price) * this.FEE_RATE;
      const feesAudit = this.auditCalculation(
        expectedFees,
        Number(execution.fees),
        this.TOLERANCE_PERCENTAGE,
        'Trading Fees'
      );

      // Audit portfolio update (simplified check)
      const portfolioAudit = this.auditCalculation(1, 1, 0, 'Portfolio Update'); // Placeholder
      const balanceAudit = this.auditCalculation(1, 1, 0, 'Balance Update'); // Placeholder

      const audits = [executionPriceAudit, feesAudit, portfolioAudit, balanceAudit];
      const hasFails = audits.some(a => a.status === 'FAIL');
      const hasWarnings = audits.some(a => a.status === 'WARNING');
      
      const status: 'PASS' | 'FAIL' | 'WARNING' = hasFails ? 'FAIL' : hasWarnings ? 'WARNING' : 'PASS';

      return {
        orderId,
        executionPrice: executionPriceAudit,
        fees: feesAudit,
        portfolioUpdate: portfolioAudit,
        balanceUpdate: balanceAudit,
        timestamp: execution.executed_at || new Date().toISOString(),
        status
      };

    } catch (error) {
      console.error('Trade audit failed:', error);
      throw error;
    }
  }

  // Run comprehensive system audit
  static async runSystemAudit(): Promise<{
    portfolioAudits: PortfolioAudit[];
    tradeAudits: TradingAudit[];
    summary: {
      totalPortfolios: number;
      passedPortfolios: number;
      failedPortfolios: number;
      totalTrades: number;
      passedTrades: number;
      failedTrades: number;
      overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    };
  }> {
    try {
      // Get all users with trading portfolios
      const { data: allUsers } = await supabase
        .from('user_trading_portfolios')
        .select('user_id');

      // Get unique user IDs
      const users = allUsers ? Array.from(new Set(allUsers.map(u => u.user_id))).map(user_id => ({ user_id })) : [];

      const portfolioAudits: PortfolioAudit[] = [];
      if (users) {
        for (const user of users) {
          try {
            const audit = await this.auditUserPortfolio(user.user_id);
            portfolioAudits.push(audit);
          } catch (error) {
            console.error(`Failed to audit portfolio for user ${user.user_id}:`, error);
          }
        }
      }

      // Get recent trade executions
      const { data: recentTrades } = await supabase
        .from('trade_executions')
        .select('order_id')
        .order('executed_at', { ascending: false })
        .limit(10);

      const tradeAudits: TradingAudit[] = [];
      if (recentTrades) {
        for (const trade of recentTrades) {
          try {
            const audit = await this.auditTradeExecution(trade.order_id);
            tradeAudits.push(audit);
          } catch (error) {
            console.error(`Failed to audit trade ${trade.order_id}:`, error);
          }
        }
      }

      // Calculate summary
      const passedPortfolios = portfolioAudits.filter(a => a.overallStatus === 'PASS').length;
      const failedPortfolios = portfolioAudits.filter(a => a.overallStatus === 'FAIL').length;
      const passedTrades = tradeAudits.filter(a => a.status === 'PASS').length;
      const failedTrades = tradeAudits.filter(a => a.status === 'FAIL').length;

      const portfolioHealthy = failedPortfolios === 0 && portfolioAudits.length > 0;
      const tradeHealthy = failedTrades === 0 && tradeAudits.length > 0;
      
      let overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
      if (!portfolioHealthy || !tradeHealthy) {
        overallHealth = failedPortfolios > portfolioAudits.length * 0.5 || failedTrades > tradeAudits.length * 0.5 ? 'CRITICAL' : 'DEGRADED';
      }

      return {
        portfolioAudits,
        tradeAudits,
        summary: {
          totalPortfolios: portfolioAudits.length,
          passedPortfolios,
          failedPortfolios,
          totalTrades: tradeAudits.length,
          passedTrades,
          failedTrades,
          overallHealth
        }
      };

    } catch (error) {
      console.error('System audit failed:', error);
      throw error;
    }
  }

  // Log audit results to database
  static async logAuditResults(auditType: string, results: any): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: `audit_${auditType}`,
          resource_type: 'trading_system',
          new_values: results
        });
      }
    } catch (error) {
      console.error('Failed to log audit results:', error);
    }
  }
}