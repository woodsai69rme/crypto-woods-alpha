
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioMetrics {
  total_value: number;
  total_invested: number;
  unrealized_pnl: number;
  realized_pnl: number;
  total_pnl: number;
  pnl_percentage: number;
  daily_change: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  asset: string;
  quantity: number;
  average_cost: number;
  current_value: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  allocation_percentage: number;
}

export class PortfolioService {
  static async getUserPortfolio(user_id: string): Promise<PortfolioMetrics> {
    const { data: portfolioData, error } = await supabase
      .from('user_trading_portfolios')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;

    if (!portfolioData || portfolioData.length === 0) {
      return {
        total_value: 0,
        total_invested: 0,
        unrealized_pnl: 0,
        realized_pnl: 0,
        total_pnl: 0,
        pnl_percentage: 0,
        daily_change: 0,
        holdings: [],
      };
    }

    // Calculate current values for each holding
    const holdings: PortfolioHolding[] = [];
    let totalValue = 0;
    let totalInvested = 0;
    let totalUnrealizedPnl = 0;
    let totalRealizedPnl = 0;

    for (const holding of portfolioData) {
      const currentValue = Number(holding.current_value) || 0;
      const invested = Number(holding.total_invested) || 0;
      const unrealizedPnl = Number(holding.unrealized_pnl) || 0;
      const realizedPnl = Number(holding.realized_pnl) || 0;
      
      totalValue += currentValue;
      totalInvested += invested;
      totalUnrealizedPnl += unrealizedPnl;
      totalRealizedPnl += realizedPnl;

      if (Number(holding.quantity) > 0) {
        holdings.push({
          asset: holding.asset,
          quantity: Number(holding.quantity),
          average_cost: Number(holding.average_cost),
          current_value: currentValue,
          unrealized_pnl: unrealizedPnl,
          pnl_percentage: invested > 0 ? (unrealizedPnl / invested) * 100 : 0,
          allocation_percentage: 0, // Will be calculated after total value is known
        });
      }
    }

    // Calculate allocation percentages
    holdings.forEach(holding => {
      holding.allocation_percentage = totalValue > 0 ? (holding.current_value / totalValue) * 100 : 0;
    });

    const totalPnl = totalUnrealizedPnl + totalRealizedPnl;
    const pnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
      total_value: totalValue,
      total_invested: totalInvested,
      unrealized_pnl: totalUnrealizedPnl,
      realized_pnl: totalRealizedPnl,
      total_pnl: totalPnl,
      pnl_percentage: pnlPercentage,
      daily_change: 0, // TODO: Calculate from historical data
      holdings: holdings.sort((a, b) => b.current_value - a.current_value),
    };
  }

  static async createTradingAccount(exchange: string, account_type: 'paper' | 'live' = 'paper') {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: user.user.id,
        exchange,
        account_type,
        balance_usd: account_type === 'paper' ? 10000 : 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async placeMockTrade(
    trading_account_id: string,
    trading_pair_id: string,
    side: 'buy' | 'sell',
    quantity: number,
    order_type: 'market' | 'limit',
    price?: number
  ) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Get current market price if market order
    let executionPrice = price;
    if (order_type === 'market') {
      const { data: marketData } = await supabase
        .from('market_data_live')
        .select('price')
        .eq('trading_pair_id', trading_pair_id)
        .single();
      
      if (marketData) {
        executionPrice = Number(marketData.price);
      }
    }

    if (!executionPrice) throw new Error('Could not determine execution price');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('user_orders')
      .insert({
        user_id: user.user.id,
        trading_account_id,
        trading_pair_id,
        order_type,
        side,
        quantity,
        price: executionPrice,
        status: 'filled', // Mock orders are instantly filled
        filled_quantity: quantity,
        average_fill_price: executionPrice,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create trade execution
    const { data: execution, error: executionError } = await supabase
      .from('trade_executions')
      .insert({
        user_id: user.user.id,
        order_id: order.id,
        trading_pair_id,
        side,
        quantity,
        price: executionPrice,
        fees: quantity * executionPrice * 0.001, // 0.1% fee
      })
      .select()
      .single();

    if (executionError) throw executionError;

    return { order, execution };
  }
}
