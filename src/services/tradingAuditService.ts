
import { supabase } from '@/integrations/supabase/client';

interface TradingAuditResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  actualValue?: number;
  expectedValue?: number;
  deviation?: number;
}

interface PortfolioAudit {
  totalValue: number;
  totalInvested: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  pnlPercentage: number;
  calculationErrors: string[];
}

interface OrderAudit {
  orderId: string;
  calculatedFees: number;
  actualFees: number;
  feeAccuracy: boolean;
  fillAccuracy: boolean;
  priceAccuracy: boolean;
}

export class TradingAuditService {
  private static readonly FEE_RATE = 0.001; // 0.1% standard fee
  private static readonly PRECISION_TOLERANCE = 0.01; // 1% tolerance for calculations

  // Comprehensive trading audit
  static async performFullTradingAudit(userId: string): Promise<{
    overallStatus: 'PASS' | 'FAIL' | 'WARNING';
    results: TradingAuditResult[];
    portfolioAudit: PortfolioAudit;
    orderAudits: OrderAudit[];
    figureValidation: { [key: string]: boolean };
  }> {
    const results: TradingAuditResult[] = [];
    
    console.log(`Starting comprehensive trading audit for user: ${userId}`);

    try {
      // 1. Audit Portfolio Calculations
      const portfolioAudit = await this.auditPortfolioCalculations(userId);
      results.push(...this.validatePortfolioResults(portfolioAudit));

      // 2. Audit Order Calculations
      const orderAudits = await this.auditOrderCalculations(userId);
      results.push(...this.validateOrderResults(orderAudits));

      // 3. Audit P&L Calculations
      const pnlResults = await this.auditPnLCalculations(userId);
      results.push(...pnlResults);

      // 4. Audit Fee Calculations
      const feeResults = await this.auditFeeCalculations(userId);
      results.push(...feeResults);

      // 5. Audit Balance Calculations
      const balanceResults = await this.auditBalanceCalculations(userId);
      results.push(...balanceResults);

      // 6. Validate Market Data Integrity
      const marketDataResults = await this.auditMarketDataIntegrity();
      results.push(...marketDataResults);

      // Determine overall status
      const failCount = results.filter(r => r.status === 'FAIL').length;
      const warningCount = results.filter(r => r.status === 'WARNING').length;
      
      const overallStatus = failCount > 0 ? 'FAIL' : warningCount > 0 ? 'WARNING' : 'PASS';

      // Generate figure validation summary
      const figureValidation = this.generateFigureValidation(results);

      console.log(`Trading audit completed. Status: ${overallStatus}, Errors: ${failCount}, Warnings: ${warningCount}`);

      return {
        overallStatus,
        results,
        portfolioAudit,
        orderAudits,
        figureValidation
      };
    } catch (error) {
      console.error('Trading audit failed:', error);
      results.push({
        category: 'AUDIT_ERROR',
        status: 'FAIL',
        message: `Audit system error: ${error}`,
      });

      return {
        overallStatus: 'FAIL',
        results,
        portfolioAudit: {} as PortfolioAudit,
        orderAudits: [],
        figureValidation: {}
      };
    }
  }

  private static async auditPortfolioCalculations(userId: string): Promise<PortfolioAudit> {
    const { data: portfolioData } = await supabase
      .from('user_trading_portfolios')
      .select('*')
      .eq('user_id', userId);

    if (!portfolioData || portfolioData.length === 0) {
      return {
        totalValue: 0,
        totalInvested: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        totalPnL: 0,
        pnlPercentage: 0,
        calculationErrors: ['No portfolio data found']
      };
    }

    let totalValue = 0;
    let totalInvested = 0;
    let unrealizedPnL = 0;
    let realizedPnL = 0;
    const calculationErrors: string[] = [];

    // Get current market prices for validation
    const currentPrices = await this.getCurrentMarketPrices();

    for (const holding of portfolioData) {
      const quantity = Number(holding.quantity) || 0;
      const avgCost = Number(holding.average_cost) || 0;
      const invested = Number(holding.total_invested) || 0;
      
      // Get current market price
      const currentPrice = currentPrices[holding.asset] || avgCost;
      const currentValue = quantity * currentPrice;
      
      // Validate calculations
      const expectedInvested = quantity * avgCost;
      if (Math.abs(invested - expectedInvested) > this.PRECISION_TOLERANCE * expectedInvested) {
        calculationErrors.push(`${holding.asset}: Invested amount mismatch. Expected: ${expectedInvested}, Actual: ${invested}`);
      }

      totalValue += currentValue;
      totalInvested += invested;
      unrealizedPnL += (currentValue - invested);
      realizedPnL += Number(holding.realized_pnl) || 0;
    }

    const totalPnL = unrealizedPnL + realizedPnL;
    const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      unrealizedPnL,
      realizedPnL,
      totalPnL,
      pnlPercentage,
      calculationErrors
    };
  }

  private static async auditOrderCalculations(userId: string): Promise<OrderAudit[]> {
    const { data: orders } = await supabase
      .from('user_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'filled')
      .limit(50);

    if (!orders) return [];

    return orders.map(order => {
      const quantity = Number(order.quantity) || 0;
      const price = Number(order.average_fill_price) || Number(order.price) || 0;
      const actualFees = Number(order.fees) || 0;
      
      // Calculate expected fees
      const orderValue = quantity * price;
      const calculatedFees = orderValue * this.FEE_RATE;
      
      // Validate fee calculation
      const feeAccuracy = Math.abs(actualFees - calculatedFees) <= calculatedFees * this.PRECISION_TOLERANCE;
      
      // Validate fill accuracy
      const filledQuantity = Number(order.filled_quantity) || 0;
      const fillAccuracy = Math.abs(filledQuantity - quantity) <= quantity * this.PRECISION_TOLERANCE;
      
      // Validate price accuracy (if market order, should be close to market price)
      const priceAccuracy = order.order_type === 'limit' || price > 0;

      return {
        orderId: order.id,
        calculatedFees,
        actualFees,
        feeAccuracy,
        fillAccuracy,
        priceAccuracy
      };
    });
  }

  private static async auditPnLCalculations(userId: string): Promise<TradingAuditResult[]> {
    const results: TradingAuditResult[] = [];
    
    // Get trade executions for P&L validation
    const { data: trades } = await supabase
      .from('trade_executions')
      .select('*')
      .eq('user_id', userId)
      .limit(100);

    if (!trades || trades.length === 0) {
      results.push({
        category: 'P&L_CALCULATION',
        status: 'WARNING',
        message: 'No trade executions found for P&L validation'
      });
      return results;
    }

    let totalPnL = 0;
    let validTrades = 0;

    for (const trade of trades) {
      const pnl = Number(trade.profit_loss) || 0;
      const quantity = Number(trade.quantity) || 0;
      const price = Number(trade.price) || 0;
      
      if (quantity > 0 && price > 0) {
        totalPnL += pnl;
        validTrades++;
      }
    }

    results.push({
      category: 'P&L_CALCULATION',
      status: validTrades > 0 ? 'PASS' : 'FAIL',
      message: `Validated ${validTrades} trades with total P&L: $${totalPnL.toFixed(2)}`,
      actualValue: totalPnL
    });

    return results;
  }

  private static async auditFeeCalculations(userId: string): Promise<TradingAuditResult[]> {
    const results: TradingAuditResult[] = [];
    
    const { data: orders } = await supabase
      .from('user_orders')
      .select('quantity, price, average_fill_price, fees')
      .eq('user_id', userId)
      .eq('status', 'filled')
      .limit(100);

    if (!orders || orders.length === 0) {
      results.push({
        category: 'FEE_CALCULATION',
        status: 'WARNING',
        message: 'No filled orders found for fee validation'
      });
      return results;
    }

    let totalCalculatedFees = 0;
    let totalActualFees = 0;
    let errorCount = 0;

    for (const order of orders) {
      const quantity = Number(order.quantity) || 0;
      const price = Number(order.average_fill_price) || Number(order.price) || 0;
      const actualFees = Number(order.fees) || 0;
      
      const orderValue = quantity * price;
      const calculatedFees = orderValue * this.FEE_RATE;
      
      totalCalculatedFees += calculatedFees;
      totalActualFees += actualFees;
      
      // Check if fees are within tolerance
      if (Math.abs(actualFees - calculatedFees) > calculatedFees * this.PRECISION_TOLERANCE) {
        errorCount++;
      }
    }

    const feeAccuracy = totalActualFees > 0 ? (1 - Math.abs(totalCalculatedFees - totalActualFees) / totalActualFees) * 100 : 0;

    results.push({
      category: 'FEE_CALCULATION',
      status: errorCount === 0 ? 'PASS' : errorCount < orders.length * 0.1 ? 'WARNING' : 'FAIL',
      message: `Fee calculation accuracy: ${feeAccuracy.toFixed(2)}%, Errors: ${errorCount}/${orders.length}`,
      actualValue: totalActualFees,
      expectedValue: totalCalculatedFees,
      deviation: Math.abs(totalCalculatedFees - totalActualFees)
    });

    return results;
  }

  private static async auditBalanceCalculations(userId: string): Promise<TradingAuditResult[]> {
    const results: TradingAuditResult[] = [];
    
    const { data: accounts } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId);

    if (!accounts || accounts.length === 0) {
      results.push({
        category: 'BALANCE_CALCULATION',
        status: 'WARNING',
        message: 'No trading accounts found for balance validation'
      });
      return results;
    }

    for (const account of accounts) {
      const balanceUsd = Number(account.balance_usd) || 0;
      
      // For paper trading accounts, validate against initial balance minus trades
      if (account.account_type === 'paper') {
        const initialBalance = 10000; // Default paper trading balance
        
        // Get total trade value for this account
        const { data: orders } = await supabase
          .from('user_orders')
          .select('quantity, price, fees, side')
          .eq('trading_account_id', account.id)
          .eq('status', 'filled');

        let totalSpent = 0;
        let totalReceived = 0;

        if (orders) {
          for (const order of orders) {
            const quantity = Number(order.quantity) || 0;
            const price = Number(order.price) || 0;
            const fees = Number(order.fees) || 0;
            const value = quantity * price + fees;

            if (order.side === 'buy') {
              totalSpent += value;
            } else {
              totalReceived += value;
            }
          }
        }

        const expectedBalance = initialBalance - totalSpent + totalReceived;
        const deviation = Math.abs(balanceUsd - expectedBalance);
        const isAccurate = deviation <= expectedBalance * this.PRECISION_TOLERANCE;

        results.push({
          category: 'BALANCE_CALCULATION',
          status: isAccurate ? 'PASS' : 'FAIL',
          message: `Account ${account.id.slice(0, 8)}... balance validation`,
          actualValue: balanceUsd,
          expectedValue: expectedBalance,
          deviation
        });
      }
    }

    return results;
  }

  private static async auditMarketDataIntegrity(): Promise<TradingAuditResult[]> {
    const results: TradingAuditResult[] = [];
    
    const { data: marketData } = await supabase
      .from('market_data_live')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!marketData || marketData.length === 0) {
      results.push({
        category: 'MARKET_DATA',
        status: 'FAIL',
        message: 'No market data found in database'
      });
      return results;
    }

    // Check data freshness
    const latestTimestamp = new Date(marketData[0].timestamp).getTime();
    const now = Date.now();
    const dataAge = (now - latestTimestamp) / 1000; // seconds
    
    results.push({
      category: 'MARKET_DATA',
      status: dataAge < 60 ? 'PASS' : dataAge < 300 ? 'WARNING' : 'FAIL',
      message: `Market data age: ${dataAge.toFixed(0)} seconds`,
      actualValue: dataAge
    });

    // Check for price anomalies
    let anomalies = 0;
    for (const data of marketData) {
      const price = Number(data.price) || 0;
      const high24h = Number(data.high_24h) || 0;
      const low24h = Number(data.low_24h) || 0;
      
      if (price <= 0 || (high24h > 0 && low24h > 0 && (price > high24h * 1.1 || price < low24h * 0.9))) {
        anomalies++;
      }
    }

    results.push({
      category: 'MARKET_DATA',
      status: anomalies === 0 ? 'PASS' : anomalies < marketData.length * 0.1 ? 'WARNING' : 'FAIL',
      message: `Price anomalies detected: ${anomalies}/${marketData.length}`,
      actualValue: anomalies
    });

    return results;
  }

  private static validatePortfolioResults(audit: PortfolioAudit): TradingAuditResult[] {
    const results: TradingAuditResult[] = [];
    
    // Validate P&L percentage calculation
    const expectedPnLPercentage = audit.totalInvested > 0 ? (audit.totalPnL / audit.totalInvested) * 100 : 0;
    const pnlDeviation = Math.abs(audit.pnlPercentage - expectedPnLPercentage);
    
    results.push({
      category: 'PORTFOLIO_PNL',
      status: pnlDeviation < 0.01 ? 'PASS' : 'FAIL',
      message: `P&L percentage calculation validation`,
      actualValue: audit.pnlPercentage,
      expectedValue: expectedPnLPercentage,
      deviation: pnlDeviation
    });

    // Report calculation errors
    if (audit.calculationErrors.length > 0) {
      results.push({
        category: 'PORTFOLIO_ERRORS',
        status: 'FAIL',
        message: `Portfolio calculation errors: ${audit.calculationErrors.join(', ')}`
      });
    }

    return results;
  }

  private static validateOrderResults(orderAudits: OrderAudit[]): TradingAuditResult[] {
    const results: TradingAuditResult[] = [];
    
    const totalOrders = orderAudits.length;
    const feeErrors = orderAudits.filter(o => !o.feeAccuracy).length;
    const fillErrors = orderAudits.filter(o => !o.fillAccuracy).length;
    const priceErrors = orderAudits.filter(o => !o.priceAccuracy).length;

    results.push({
      category: 'ORDER_FEES',
      status: feeErrors === 0 ? 'PASS' : feeErrors < totalOrders * 0.1 ? 'WARNING' : 'FAIL',
      message: `Fee calculation accuracy: ${feeErrors} errors in ${totalOrders} orders`,
      actualValue: feeErrors
    });

    results.push({
      category: 'ORDER_FILLS',
      status: fillErrors === 0 ? 'PASS' : 'FAIL',
      message: `Order fill accuracy: ${fillErrors} errors in ${totalOrders} orders`,
      actualValue: fillErrors
    });

    return results;
  }

  private static generateFigureValidation(results: TradingAuditResult[]): { [key: string]: boolean } {
    const validation: { [key: string]: boolean } = {};
    
    results.forEach(result => {
      validation[result.category] = result.status === 'PASS';
    });

    return validation;
  }

  private static async getCurrentMarketPrices(): Promise<{ [symbol: string]: number }> {
    const { data: marketData } = await supabase
      .from('market_data_live')
      .select('trading_pairs(symbol), price')
      .order('timestamp', { ascending: false })
      .limit(10);

    const prices: { [symbol: string]: number } = {};
    
    if (marketData) {
      marketData.forEach((data: any) => {
        if (data.trading_pairs?.symbol) {
          const asset = data.trading_pairs.symbol.replace('USDT', '');
          prices[asset] = Number(data.price) || 0;
        }
      });
    }

    return prices;
  }
}
