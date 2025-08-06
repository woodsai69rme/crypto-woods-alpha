-- PHASE 1: CRITICAL SECURITY FIXES
-- Fix all RLS disabled tables
ALTER TABLE ai_trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Fix function search_path settings for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_portfolio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_portfolios (user_id, virtual_balance)
  VALUES (NEW.id, 10000.00);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_portfolio_totals(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_value NUMERIC := 0;
  total_invested NUMERIC := 0;
  total_pnl NUMERIC := 0;
BEGIN
  SELECT 
    COALESCE(SUM(current_value), 0),
    COALESCE(SUM(total_invested), 0),
    COALESCE(SUM(profit_loss), 0)
  INTO total_value, total_invested, total_pnl
  FROM public.portfolio_holdings 
  WHERE user_id = p_user_id;
  
  UPDATE public.user_portfolios 
  SET 
    total_invested = total_invested,
    total_profit_loss = total_pnl,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_credits(user_uuid uuid, credit_amount integer, transaction_type text, description text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET credits = COALESCE(credits, 0) + credit_amount,
      updated_at = NOW()
  WHERE id = user_uuid;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (user_uuid, credit_amount, transaction_type, description);
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_audit_log(p_user_id uuid, p_action text, p_resource_type text, p_resource_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_old_values, p_new_values)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_portfolio_on_trade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  account_id UUID;
  base_asset TEXT;
  quote_asset TEXT;
  position_exists BOOLEAN;
BEGIN
  SELECT ta.id, tp.base_asset, tp.quote_asset 
  INTO account_id, base_asset, quote_asset
  FROM public.user_orders uo
  JOIN public.trading_accounts ta ON uo.trading_account_id = ta.id
  JOIN public.trading_pairs tp ON uo.trading_pair_id = tp.id
  WHERE uo.id = NEW.order_id;

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
$function$;

-- Add essential RLS policies for newly enabled tables
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own searches" ON searches
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trades" ON trades
FOR SELECT USING (auth.uid() = user_id);

-- Populate initial trading pairs for major cryptocurrencies
INSERT INTO trading_pairs (symbol, base_asset, quote_asset, exchange) VALUES
('BTCUSDT', 'BTC', 'USDT', 'binance'),
('ETHUSDT', 'ETH', 'USDT', 'binance'),
('ADAUSDT', 'ADA', 'USDT', 'binance'),
('SOLUSDT', 'SOL', 'USDT', 'binance'),
('DOTUSDT', 'DOT', 'USDT', 'binance'),
('MATICUSDT', 'MATIC', 'USDT', 'binance'),
('AVAXUSDT', 'AVAX', 'USDT', 'binance'),
('LINKUSDT', 'LINK', 'USDT', 'binance'),
('ALGOUSDT', 'ALGO', 'USDT', 'binance'),
('ATOMUSDT', 'ATOM', 'USDT', 'binance')
ON CONFLICT (symbol, exchange) DO NOTHING;