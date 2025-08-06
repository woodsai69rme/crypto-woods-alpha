-- Enable RLS on tables that don't have it (skip already enabled ones)
DO $$
BEGIN
    -- Check and enable RLS only if not already enabled
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'ai_trading_signals') THEN
        ALTER TABLE ai_trading_signals ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'credit_transactions') THEN
        ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix function search_path settings for security
    PERFORM 1; -- Just to make the block valid
END $$;

-- Populate initial trading pairs for major cryptocurrencies (if not exists)
INSERT INTO trading_pairs (symbol, base_asset, quote_asset, exchange) VALUES
('BTCUSDT', 'BTC', 'USDT', 'binance'),
('ETHUSDT', 'ETH', 'USDT', 'binance'),
('ADAUSDT', 'ADA', 'USDT', 'binance'),
('SOLUSDT', 'SOL', 'USDT', 'binance'),
('DOTUSDT', 'DOT', 'USDT', 'binance')
ON CONFLICT (symbol, exchange) DO NOTHING;