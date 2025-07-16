
-- Create comprehensive trading platform database schema

-- Trading pairs and assets
CREATE TABLE public.trading_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  exchange TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_trade_amount NUMERIC DEFAULT 0,
  max_trade_amount NUMERIC,
  price_precision INTEGER DEFAULT 8,
  quantity_precision INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time market data
CREATE TABLE public.market_data_live (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  price NUMERIC NOT NULL,
  volume_24h NUMERIC DEFAULT 0,
  price_change_24h NUMERIC DEFAULT 0,
  high_24h NUMERIC DEFAULT 0,
  low_24h NUMERIC DEFAULT 0,
  bid_price NUMERIC,
  ask_price NUMERIC,
  bid_size NUMERIC,
  ask_size NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  exchange TEXT NOT NULL,
  UNIQUE(trading_pair_id, exchange)
);

-- Order book data
CREATE TABLE public.order_book_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  side TEXT CHECK (side IN ('buy', 'sell')),
  price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  exchange TEXT NOT NULL
);

-- User trading accounts
CREATE TABLE public.trading_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_type TEXT CHECK (account_type IN ('paper', 'live')) DEFAULT 'paper',
  exchange TEXT NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  balance_usd NUMERIC DEFAULT 10000.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User orders
CREATE TABLE public.user_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  trading_account_id UUID REFERENCES public.trading_accounts(id),
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  order_type TEXT CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')) NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC,
  stop_price NUMERIC,
  status TEXT CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected', 'partial')) DEFAULT 'pending',
  filled_quantity NUMERIC DEFAULT 0,
  average_fill_price NUMERIC,
  fees NUMERIC DEFAULT 0,
  external_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Trade executions
CREATE TABLE public.trade_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  order_id UUID REFERENCES public.user_orders(id),
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  fees NUMERIC DEFAULT 0,
  fee_currency TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  external_trade_id TEXT,
  profit_loss NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User portfolios
CREATE TABLE public.user_trading_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  trading_account_id UUID REFERENCES public.trading_accounts(id),
  asset TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  average_cost NUMERIC DEFAULT 0,
  total_invested NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unrealized_pnl NUMERIC DEFAULT 0,
  realized_pnl NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trading_account_id, asset)
);

-- Trading strategies
CREATE TABLE public.trading_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT CHECK (strategy_type IN ('dca', 'grid', 'scalping', 'momentum', 'arbitrage', 'ai_ml', 'custom')) NOT NULL,
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI trading bots
CREATE TABLE public.ai_trading_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.trading_strategies(id),
  trading_account_id UUID REFERENCES public.trading_accounts(id),
  name TEXT NOT NULL,
  bot_type TEXT CHECK (bot_type IN ('momentum', 'dca', 'grid', 'arbitrage', 'ml_predictor', 'sentiment')) NOT NULL,
  config JSONB DEFAULT '{}',
  is_running BOOLEAN DEFAULT false,
  last_signal JSONB,
  last_signal_time TIMESTAMP WITH TIME ZONE,
  performance_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI signals and predictions
CREATE TABLE public.ai_trading_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.ai_trading_bots(id),
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  signal_type TEXT CHECK (signal_type IN ('buy', 'sell', 'hold')) NOT NULL,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  price_target NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  reasoning TEXT,
  technical_indicators JSONB DEFAULT '{}',
  sentiment_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_executed BOOLEAN DEFAULT false
);

-- Market analysis and liquidity data
CREATE TABLE public.liquidity_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  price_level NUMERIC NOT NULL,
  zone_type TEXT CHECK (zone_type IN ('support', 'resistance', 'supply', 'demand')) NOT NULL,
  strength TEXT CHECK (strength IN ('weak', 'medium', 'strong')) NOT NULL,
  volume NUMERIC DEFAULT 0,
  big_orders_count INTEGER DEFAULT 0,
  is_market_maker_target BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fibonacci levels
CREATE TABLE public.fibonacci_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  timeframe TEXT NOT NULL,
  high_price NUMERIC NOT NULL,
  low_price NUMERIC NOT NULL,
  level_236 NUMERIC,
  level_382 NUMERIC,
  level_500 NUMERIC,
  level_618 NUMERIC,
  level_786 NUMERIC,
  extension_1272 NUMERIC,
  extension_1618 NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- News and sentiment data
CREATE TABLE public.market_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  url TEXT,
  sentiment_score NUMERIC CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  impact_score NUMERIC CHECK (impact_score >= 0 AND impact_score <= 1),
  related_assets TEXT[],
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs for complete transparency
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User watchlists
CREATE TABLE public.user_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  trading_pairs UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Price alerts
CREATE TABLE public.trading_price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  trading_pair_id UUID REFERENCES public.trading_pairs(id),
  alert_type TEXT CHECK (alert_type IN ('price_above', 'price_below', 'volume_spike', 'technical_indicator')) NOT NULL,
  target_value NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Exchange API configurations
CREATE TABLE public.exchange_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_name TEXT NOT NULL UNIQUE,
  api_base_url TEXT NOT NULL,
  websocket_url TEXT,
  rate_limits JSONB DEFAULT '{}',
  supported_features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default exchange configurations
INSERT INTO public.exchange_configs (exchange_name, api_base_url, websocket_url, supported_features) VALUES
('binance', 'https://api.binance.com', 'wss://stream.binance.com:9443', ARRAY['spot', 'futures', 'options']),
('coinbase', 'https://api.exchange.coinbase.com', 'wss://ws-feed.exchange.coinbase.com', ARRAY['spot']),
('kraken', 'https://api.kraken.com', 'wss://ws.kraken.com', ARRAY['spot', 'futures']),
('bitfinex', 'https://api-pub.bitfinex.com', 'wss://api-pub.bitfinex.com/ws/2', ARRAY['spot', 'margin']),
('bybit', 'https://api.bybit.com', 'wss://stream.bybit.com', ARRAY['spot', 'derivatives']);

-- Insert default trading pairs
INSERT INTO public.trading_pairs (base_asset, quote_asset, symbol, exchange) VALUES
('BTC', 'USDT', 'BTCUSDT', 'binance'),
('ETH', 'USDT', 'ETHUSDT', 'binance'),
('BNB', 'USDT', 'BNBUSDT', 'binance'),
('ADA', 'USDT', 'ADAUSDT', 'binance'),
('SOL', 'USDT', 'SOLUSDT', 'binance'),
('XRP', 'USDT', 'XRPUSDT', 'binance'),
('DOGE', 'USDT', 'DOGEUSDT', 'binance'),
('AVAX', 'USDT', 'AVAXUSDT', 'binance'),
('MATIC', 'USDT', 'MATICUSDT', 'binance'),
('DOT', 'USDT', 'DOTUSDT', 'binance');

-- Enable Row Level Security
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_book_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trading_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trading_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fibonacci_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public data (trading pairs, market data, news)
CREATE POLICY "Anyone can view trading pairs" ON public.trading_pairs FOR SELECT USING (true);
CREATE POLICY "Anyone can view market data" ON public.market_data_live FOR SELECT USING (true);
CREATE POLICY "Anyone can view order book" ON public.order_book_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can view liquidity zones" ON public.liquidity_zones FOR SELECT USING (true);
CREATE POLICY "Anyone can view fibonacci levels" ON public.fibonacci_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view market news" ON public.market_news FOR SELECT USING (true);
CREATE POLICY "Anyone can view exchange configs" ON public.exchange_configs FOR SELECT USING (true);

-- RLS Policies for user-specific data
CREATE POLICY "Users can manage own trading accounts" ON public.trading_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own orders" ON public.user_orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own trade executions" ON public.trade_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own portfolios" ON public.user_trading_portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own strategies" ON public.trading_strategies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public strategies" ON public.trading_strategies FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own bots" ON public.ai_trading_bots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own signals" ON public.ai_trading_signals FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.ai_trading_bots WHERE id = bot_id));
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlists" ON public.user_watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own price alerts" ON public.trading_price_alerts FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trading_pairs_updated_at BEFORE UPDATE ON public.trading_pairs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON public.trading_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_orders_updated_at BEFORE UPDATE ON public.user_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_trading_portfolios_updated_at BEFORE UPDATE ON public.user_trading_portfolios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trading_strategies_updated_at BEFORE UPDATE ON public.trading_strategies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_trading_bots_updated_at BEFORE UPDATE ON public.ai_trading_bots FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_liquidity_zones_updated_at BEFORE UPDATE ON public.liquidity_zones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_watchlists_updated_at BEFORE UPDATE ON public.user_watchlists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_old_values, p_new_values)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update portfolio when trades are executed
CREATE OR REPLACE FUNCTION update_portfolio_on_trade()
RETURNS TRIGGER AS $$
DECLARE
  account_id UUID;
  base_asset TEXT;
  quote_asset TEXT;
  position_exists BOOLEAN;
BEGIN
  -- Get account and assets
  SELECT ta.id, tp.base_asset, tp.quote_asset 
  INTO account_id, base_asset, quote_asset
  FROM public.user_orders uo
  JOIN public.trading_accounts ta ON uo.trading_account_id = ta.id
  JOIN public.trading_pairs tp ON uo.trading_pair_id = tp.id
  WHERE uo.id = NEW.order_id;

  -- Update base asset position
  INSERT INTO public.user_trading_portfolios (trading_account_id, asset, quantity, total_invested)
  VALUES (account_id, base_asset, 
    CASE WHEN NEW.side = 'buy' THEN NEW.quantity ELSE -NEW.quantity END,
    CASE WHEN NEW.side = 'buy' THEN NEW.quantity * NEW.price ELSE 0 END)
  ON CONFLICT (trading_account_id, asset) 
  DO UPDATE SET
    quantity = user_trading_portfolios.quantity + 
      CASE WHEN NEW.side = 'buy' THEN NEW.quantity ELSE -NEW.quantity END,
    total_invested = user_trading_portfolios.total_invested + 
      CASE WHEN NEW.side = 'buy' THEN NEW.quantity * NEW.price ELSE 0 END,
    updated_at = now();

  -- Update quote asset position (usually USDT)
  INSERT INTO public.user_trading_portfolios (trading_account_id, asset, quantity)
  VALUES (account_id, quote_asset,
    CASE WHEN NEW.side = 'sell' THEN NEW.quantity * NEW.price ELSE -(NEW.quantity * NEW.price) END)
  ON CONFLICT (trading_account_id, asset)
  DO UPDATE SET
    quantity = user_trading_portfolios.quantity + 
      CASE WHEN NEW.side = 'sell' THEN NEW.quantity * NEW.price ELSE -(NEW.quantity * NEW.price) END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_update_on_trade 
  AFTER INSERT ON public.trade_executions 
  FOR EACH ROW EXECUTE PROCEDURE update_portfolio_on_trade();

-- Enable realtime for live data tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data_live;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_book_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_trading_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_trading_portfolios;
