export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_trading_bots: {
        Row: {
          bot_type: string
          config: Json | null
          created_at: string | null
          id: string
          is_running: boolean | null
          last_signal: Json | null
          last_signal_time: string | null
          name: string
          performance_stats: Json | null
          strategy_id: string | null
          trading_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bot_type: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_running?: boolean | null
          last_signal?: Json | null
          last_signal_time?: string | null
          name: string
          performance_stats?: Json | null
          strategy_id?: string | null
          trading_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bot_type?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_running?: boolean | null
          last_signal?: Json | null
          last_signal_time?: string | null
          name?: string
          performance_stats?: Json | null
          strategy_id?: string | null
          trading_account_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_trading_bots_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_trading_bots_trading_account_id_fkey"
            columns: ["trading_account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_trading_signals: {
        Row: {
          bot_id: string | null
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_executed: boolean | null
          price_target: number | null
          reasoning: string | null
          sentiment_score: number | null
          signal_type: string
          stop_loss: number | null
          take_profit: number | null
          technical_indicators: Json | null
          trading_pair_id: string | null
        }
        Insert: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_executed?: boolean | null
          price_target?: number | null
          reasoning?: string | null
          sentiment_score?: number | null
          signal_type: string
          stop_loss?: number | null
          take_profit?: number | null
          technical_indicators?: Json | null
          trading_pair_id?: string | null
        }
        Update: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_executed?: boolean | null
          price_target?: number | null
          reasoning?: string | null
          sentiment_score?: number | null
          signal_type?: string
          stop_loss?: number | null
          take_profit?: number | null
          technical_indicators?: Json | null
          trading_pair_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_trading_signals_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_trading_signals_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          stripe_payment_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_assets: {
        Row: {
          created_at: string | null
          current_price: number
          id: string
          is_active: boolean | null
          last_updated: string | null
          market_cap: number | null
          name: string
          price_change_24h: number | null
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          created_at?: string | null
          current_price?: number
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          created_at?: string | null
          current_price?: number
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          card_id: string
          card_image: string | null
          card_name: string
          confidence_score: number
          created_at: string | null
          deal_price: number
          deal_source: string
          discount_percentage: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          market_price: number
          potential_profit: number | null
          source_url: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          card_id: string
          card_image?: string | null
          card_name: string
          confidence_score: number
          created_at?: string | null
          deal_price: number
          deal_source: string
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          market_price: number
          potential_profit?: number | null
          source_url: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          card_id?: string
          card_image?: string | null
          card_name?: string
          confidence_score?: number
          created_at?: string | null
          deal_price?: number
          deal_source?: string
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          market_price?: number
          potential_profit?: number | null
          source_url?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_configs: {
        Row: {
          api_base_url: string
          created_at: string | null
          exchange_name: string
          id: string
          is_active: boolean | null
          rate_limits: Json | null
          supported_features: string[] | null
          websocket_url: string | null
        }
        Insert: {
          api_base_url: string
          created_at?: string | null
          exchange_name: string
          id?: string
          is_active?: boolean | null
          rate_limits?: Json | null
          supported_features?: string[] | null
          websocket_url?: string | null
        }
        Update: {
          api_base_url?: string
          created_at?: string | null
          exchange_name?: string
          id?: string
          is_active?: boolean | null
          rate_limits?: Json | null
          supported_features?: string[] | null
          websocket_url?: string | null
        }
        Relationships: []
      }
      fibonacci_levels: {
        Row: {
          created_at: string | null
          extension_1272: number | null
          extension_1618: number | null
          high_price: number
          id: string
          is_active: boolean | null
          level_236: number | null
          level_382: number | null
          level_500: number | null
          level_618: number | null
          level_786: number | null
          low_price: number
          timeframe: string
          trading_pair_id: string | null
        }
        Insert: {
          created_at?: string | null
          extension_1272?: number | null
          extension_1618?: number | null
          high_price: number
          id?: string
          is_active?: boolean | null
          level_236?: number | null
          level_382?: number | null
          level_500?: number | null
          level_618?: number | null
          level_786?: number | null
          low_price: number
          timeframe: string
          trading_pair_id?: string | null
        }
        Update: {
          created_at?: string | null
          extension_1272?: number | null
          extension_1618?: number | null
          high_price?: number
          id?: string
          is_active?: boolean | null
          level_236?: number | null
          level_382?: number | null
          level_500?: number | null
          level_618?: number | null
          level_786?: number | null
          low_price?: number
          timeframe?: string
          trading_pair_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fibonacci_levels_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      github_repositories: {
        Row: {
          created_at: string | null
          default_branch: string | null
          id: string
          last_commit_sha: string | null
          last_sync: string | null
          project_id: string | null
          repo_id: number | null
          repo_name: string
          repo_owner: string
          stats: Json | null
          webhook_id: number | null
        }
        Insert: {
          created_at?: string | null
          default_branch?: string | null
          id?: string
          last_commit_sha?: string | null
          last_sync?: string | null
          project_id?: string | null
          repo_id?: number | null
          repo_name: string
          repo_owner: string
          stats?: Json | null
          webhook_id?: number | null
        }
        Update: {
          created_at?: string | null
          default_branch?: string | null
          id?: string
          last_commit_sha?: string | null
          last_sync?: string | null
          project_id?: string | null
          repo_id?: number | null
          repo_name?: string
          repo_owner?: string
          stats?: Json | null
          webhook_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "github_repositories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_profiles: {
        Row: {
          created_at: string | null
          goal: string | null
          id: string
          risk_level: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal?: string | null
          id?: string
          risk_level: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal?: string | null
          id?: string
          risk_level?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          id: string
          invested_at: string | null
          portfolio_type: string
          round_up_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          invested_at?: string | null
          portfolio_type: string
          round_up_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          invested_at?: string | null
          portfolio_type?: string
          round_up_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_round_up_id_fkey"
            columns: ["round_up_id"]
            isOneToOne: false
            referencedRelation: "round_ups"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_zones: {
        Row: {
          big_orders_count: number | null
          created_at: string | null
          id: string
          is_market_maker_target: boolean | null
          price_level: number
          strength: string
          trading_pair_id: string | null
          updated_at: string | null
          volume: number | null
          zone_type: string
        }
        Insert: {
          big_orders_count?: number | null
          created_at?: string | null
          id?: string
          is_market_maker_target?: boolean | null
          price_level: number
          strength: string
          trading_pair_id?: string | null
          updated_at?: string | null
          volume?: number | null
          zone_type: string
        }
        Update: {
          big_orders_count?: number | null
          created_at?: string | null
          id?: string
          is_market_maker_target?: boolean | null
          price_level?: number
          strength?: string
          trading_pair_id?: string | null
          updated_at?: string | null
          volume?: number | null
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_zones_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          active_listings: number
          daily_volume: number
          id: string
          market_sentiment: string | null
          recorded_at: string | null
          total_market_cap: number
        }
        Insert: {
          active_listings: number
          daily_volume: number
          id?: string
          market_sentiment?: string | null
          recorded_at?: string | null
          total_market_cap: number
        }
        Update: {
          active_listings?: number
          daily_volume?: number
          id?: string
          market_sentiment?: string | null
          recorded_at?: string | null
          total_market_cap?: number
        }
        Relationships: []
      }
      market_data_live: {
        Row: {
          ask_price: number | null
          ask_size: number | null
          bid_price: number | null
          bid_size: number | null
          exchange: string
          high_24h: number | null
          id: string
          low_24h: number | null
          price: number
          price_change_24h: number | null
          timestamp: string | null
          trading_pair_id: string | null
          volume_24h: number | null
        }
        Insert: {
          ask_price?: number | null
          ask_size?: number | null
          bid_price?: number | null
          bid_size?: number | null
          exchange: string
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          price: number
          price_change_24h?: number | null
          timestamp?: string | null
          trading_pair_id?: string | null
          volume_24h?: number | null
        }
        Update: {
          ask_price?: number | null
          ask_size?: number | null
          bid_price?: number | null
          bid_size?: number | null
          exchange?: string
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          price?: number
          price_change_24h?: number | null
          timestamp?: string | null
          trading_pair_id?: string | null
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_live_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      market_news: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          impact_score: number | null
          published_at: string
          related_assets: string[] | null
          sentiment_score: number | null
          source: string
          title: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          published_at: string
          related_assets?: string[] | null
          sentiment_score?: number | null
          source: string
          title: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          published_at?: string
          related_assets?: string[] | null
          sentiment_score?: number | null
          source?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      mystery_packs: {
        Row: {
          available_count: number | null
          cards_included: number
          created_at: string | null
          description: string | null
          expected_value: number
          guaranteed_rarity: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          tier: string
          updated_at: string | null
        }
        Insert: {
          available_count?: number | null
          cards_included?: number
          created_at?: string | null
          description?: string | null
          expected_value: number
          guaranteed_rarity?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          tier: string
          updated_at?: string | null
        }
        Update: {
          available_count?: number | null
          cards_included?: number
          created_at?: string | null
          description?: string | null
          expected_value?: number
          guaranteed_rarity?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_book_entries: {
        Row: {
          exchange: string
          id: string
          price: number
          quantity: number
          side: string | null
          timestamp: string | null
          trading_pair_id: string | null
        }
        Insert: {
          exchange: string
          id?: string
          price: number
          quantity: number
          side?: string | null
          timestamp?: string | null
          trading_pair_id?: string | null
        }
        Update: {
          exchange?: string
          id?: string
          price?: number
          quantity?: number
          side?: string | null
          timestamp?: string | null
          trading_pair_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_book_entries_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_cards: {
        Row: {
          ai_recommendation: string | null
          card_number: string
          condition: string | null
          created_at: string | null
          current_price: number
          ebay_url: string | null
          grade: number | null
          id: string
          image_url: string | null
          market_trend: string
          name: string
          previous_price: number
          rarity: string
          set_name: string
          supply_level: string
          tcg_player_url: string | null
          updated_at: string | null
        }
        Insert: {
          ai_recommendation?: string | null
          card_number: string
          condition?: string | null
          created_at?: string | null
          current_price?: number
          ebay_url?: string | null
          grade?: number | null
          id?: string
          image_url?: string | null
          market_trend?: string
          name: string
          previous_price?: number
          rarity: string
          set_name: string
          supply_level?: string
          tcg_player_url?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_recommendation?: string | null
          card_number?: string
          condition?: string | null
          created_at?: string | null
          current_price?: number
          ebay_url?: string | null
          grade?: number | null
          id?: string
          image_url?: string | null
          market_trend?: string
          name?: string
          previous_price?: number
          rarity?: string
          set_name?: string
          supply_level?: string
          tcg_player_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          average_buy_price: number
          created_at: string | null
          crypto_asset_id: string
          current_value: number | null
          id: string
          profit_loss: number | null
          quantity: number
          total_invested: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          created_at?: string | null
          crypto_asset_id: string
          current_value?: number | null
          id?: string
          profit_loss?: number | null
          quantity?: number
          total_invested?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_buy_price?: number
          created_at?: string | null
          crypto_asset_id?: string
          current_value?: number | null
          id?: string
          profit_loss?: number | null
          quantity?: number
          total_invested?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_crypto_asset_id_fkey"
            columns: ["crypto_asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          card_id: string
          condition: string
          created_at: string | null
          id: string
          is_active: boolean | null
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          condition: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          condition?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          card_id: string
          id: string
          price: number
          recorded_at: string | null
          source: string
        }
        Insert: {
          card_id: string
          id?: string
          price: number
          recorded_at?: string | null
          source: string
        }
        Update: {
          card_id?: string
          id?: string
          price?: number
          recorded_at?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      price_snapshots: {
        Row: {
          crypto_asset_id: string
          id: string
          market_cap: number | null
          price: number
          recorded_at: string | null
          volume_24h: number | null
        }
        Insert: {
          crypto_asset_id: string
          id?: string
          market_cap?: number | null
          price: number
          recorded_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          crypto_asset_id?: string
          id?: string
          market_cap?: number | null
          price?: number
          recorded_at?: string | null
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_snapshots_crypto_asset_id_fkey"
            columns: ["crypto_asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credits: number | null
          email_notifications: boolean | null
          experience_level: string | null
          full_name: string | null
          github_username: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          preferred_language: string | null
          push_notifications: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits?: number | null
          email_notifications?: boolean | null
          experience_level?: string | null
          full_name?: string | null
          github_username?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          preferred_language?: string | null
          push_notifications?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits?: number | null
          email_notifications?: boolean | null
          experience_level?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          preferred_language?: string | null
          push_notifications?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_databases: {
        Row: {
          connection_string: string | null
          created_at: string | null
          health_status: Json | null
          id: string
          last_backup: string | null
          last_health_check: string | null
          name: string
          project_id: string | null
          status: Database["public"]["Enums"]["database_status"] | null
          supabase_project_id: string | null
          supabase_url: string | null
          updated_at: string | null
        }
        Insert: {
          connection_string?: string | null
          created_at?: string | null
          health_status?: Json | null
          id?: string
          last_backup?: string | null
          last_health_check?: string | null
          name: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["database_status"] | null
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_string?: string | null
          created_at?: string | null
          health_status?: Json | null
          id?: string
          last_backup?: string | null
          last_health_check?: string | null
          name?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["database_status"] | null
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_databases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reports: {
        Row: {
          auto_generated: boolean | null
          content: string | null
          file_path: string | null
          file_size: number | null
          generated_at: string | null
          generated_by: string | null
          id: string
          last_updated: string | null
          metadata: Json | null
          project_id: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status: Database["public"]["Enums"]["report_status"] | null
          title: string | null
          version: number | null
        }
        Insert: {
          auto_generated?: boolean | null
          content?: string | null
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          project_id?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"] | null
          title?: string | null
          version?: number | null
        }
        Update: {
          auto_generated?: boolean | null
          content?: string | null
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          project_id?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"] | null
          title?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_teams: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          project_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_teams_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_valuations: {
        Row: {
          amount: number
          calculated_by: string | null
          date_calculated: string | null
          id: string
          is_current: boolean | null
          methodology: Database["public"]["Enums"]["valuation_methodology"]
          metrics: Json | null
          notes: string | null
          project_id: string | null
        }
        Insert: {
          amount: number
          calculated_by?: string | null
          date_calculated?: string | null
          id?: string
          is_current?: boolean | null
          methodology: Database["public"]["Enums"]["valuation_methodology"]
          metrics?: Json | null
          notes?: string | null
          project_id?: string | null
        }
        Update: {
          amount?: number
          calculated_by?: string | null
          date_calculated?: string | null
          id?: string
          is_current?: boolean | null
          methodology?: Database["public"]["Enums"]["valuation_methodology"]
          metrics?: Json | null
          notes?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_valuations_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_valuations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          current_valuation: number | null
          description: string | null
          github_owner: string | null
          github_repo_name: string | null
          github_repo_url: string | null
          github_webhook_id: string | null
          id: string
          is_public: boolean | null
          last_github_sync: string | null
          name: string
          primary_database_id: string | null
          stage: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          team_size: number | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_valuation?: number | null
          description?: string | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_webhook_id?: string | null
          id?: string
          is_public?: boolean | null
          last_github_sync?: string | null
          name: string
          primary_database_id?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_valuation?: number | null
          description?: string | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_webhook_id?: string | null
          id?: string
          is_public?: boolean | null
          last_github_sync?: string | null
          name?: string
          primary_database_id?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_primary_database"
            columns: ["primary_database_id"]
            isOneToOne: false
            referencedRelation: "project_databases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      quad_vision_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quad_vision_bookmarks: {
        Row: {
          category: string | null
          created_at: string
          id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      quad_vision_configs: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          layout: string
          name: string
          updated_at: string
          urls: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          layout?: string
          name: string
          updated_at?: string
          urls?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          layout?: string
          name?: string
          updated_at?: string
          urls?: string[]
          user_id?: string
        }
        Relationships: []
      }
      quad_vision_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      report_generation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          progress: number | null
          project_id: string | null
          report_types: Database["public"]["Enums"]["report_type"][] | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_id?: string | null
          report_types?: Database["public"]["Enums"]["report_type"][] | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_id?: string | null
          report_types?: Database["public"]["Enums"]["report_type"][] | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_generation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_generation_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      round_ups: {
        Row: {
          created_at: string | null
          id: string
          invested: boolean | null
          purchase_id: string | null
          round_up_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invested?: boolean | null
          purchase_id?: string | null
          round_up_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invested?: boolean | null
          purchase_id?: string | null
          round_up_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_ups_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_results: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          search_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          search_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          search_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_results_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      searches: {
        Row: {
          created_at: string | null
          credits_used: number | null
          id: string
          query_data: Json
          results: Json | null
          risk_score: number | null
          search_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          id?: string
          query_data: Json
          results?: Json | null
          risk_score?: number | null
          search_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          id?: string
          query_data?: Json
          results?: Json | null
          risk_score?: number | null
          search_type?: string
          user_id?: string
        }
        Relationships: []
      }
      trade_executions: {
        Row: {
          created_at: string | null
          executed_at: string | null
          external_trade_id: string | null
          fee_currency: string | null
          fees: number | null
          id: string
          order_id: string | null
          price: number
          profit_loss: number | null
          quantity: number
          side: string
          trading_pair_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          executed_at?: string | null
          external_trade_id?: string | null
          fee_currency?: string | null
          fees?: number | null
          id?: string
          order_id?: string | null
          price: number
          profit_loss?: number | null
          quantity: number
          side: string
          trading_pair_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          executed_at?: string | null
          external_trade_id?: string | null
          fee_currency?: string | null
          fees?: number | null
          id?: string
          order_id?: string | null
          price?: number
          profit_loss?: number | null
          quantity?: number
          side?: string
          trading_pair_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "user_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_executions_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          crypto_asset_id: string
          executed_at: string | null
          fees: number | null
          id: string
          price_per_unit: number
          quantity: number
          status: string | null
          total_amount: number
          trade_type: string
          user_id: string
        }
        Insert: {
          crypto_asset_id: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          price_per_unit: number
          quantity: number
          status?: string | null
          total_amount: number
          trade_type: string
          user_id: string
        }
        Update: {
          crypto_asset_id?: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          price_per_unit?: number
          quantity?: number
          status?: string | null
          total_amount?: number
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_crypto_asset_id_fkey"
            columns: ["crypto_asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_type: string | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          balance_usd: number | null
          created_at: string | null
          exchange: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          balance_usd?: number | null
          created_at?: string | null
          exchange: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          balance_usd?: number | null
          created_at?: string | null
          exchange?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_pairs: {
        Row: {
          base_asset: string
          created_at: string | null
          exchange: string
          id: string
          is_active: boolean | null
          max_trade_amount: number | null
          min_trade_amount: number | null
          price_precision: number | null
          quantity_precision: number | null
          quote_asset: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          base_asset: string
          created_at?: string | null
          exchange: string
          id?: string
          is_active?: boolean | null
          max_trade_amount?: number | null
          min_trade_amount?: number | null
          price_precision?: number | null
          quantity_precision?: number | null
          quote_asset: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          base_asset?: string
          created_at?: string | null
          exchange?: string
          id?: string
          is_active?: boolean | null
          max_trade_amount?: number | null
          min_trade_amount?: number | null
          price_precision?: number | null
          quantity_precision?: number | null
          quote_asset?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trading_price_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          target_value: number
          trading_pair_id: string | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          target_value: number
          trading_pair_id?: string | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          target_value?: number
          trading_pair_id?: string | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_price_alerts_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_strategies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          parameters: Json | null
          performance_metrics: Json | null
          strategy_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          parameters?: Json | null
          performance_metrics?: Json | null
          strategy_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          parameters?: Json | null
          performance_metrics?: Json | null
          strategy_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_collections: {
        Row: {
          card_id: string
          condition: string | null
          created_at: string | null
          grade: number | null
          id: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          condition?: string | null
          created_at?: string | null
          grade?: number | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          condition?: string | null
          created_at?: string | null
          grade?: number | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_orders: {
        Row: {
          average_fill_price: number | null
          created_at: string | null
          executed_at: string | null
          external_order_id: string | null
          fees: number | null
          filled_quantity: number | null
          id: string
          order_type: string
          price: number | null
          quantity: number
          side: string
          status: string | null
          stop_price: number | null
          trading_account_id: string | null
          trading_pair_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_fill_price?: number | null
          created_at?: string | null
          executed_at?: string | null
          external_order_id?: string | null
          fees?: number | null
          filled_quantity?: number | null
          id?: string
          order_type: string
          price?: number | null
          quantity: number
          side: string
          status?: string | null
          stop_price?: number | null
          trading_account_id?: string | null
          trading_pair_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_fill_price?: number | null
          created_at?: string | null
          executed_at?: string | null
          external_order_id?: string | null
          fees?: number | null
          filled_quantity?: number | null
          id?: string
          order_type?: string
          price?: number | null
          quantity?: number
          side?: string
          status?: string | null
          stop_price?: number | null
          trading_account_id?: string | null
          trading_pair_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_orders_trading_account_id_fkey"
            columns: ["trading_account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_orders_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolios: {
        Row: {
          created_at: string | null
          id: string
          total_invested: number | null
          total_profit_loss: number | null
          updated_at: string | null
          user_id: string
          virtual_balance: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_invested?: number | null
          total_profit_loss?: number | null
          updated_at?: string | null
          user_id: string
          virtual_balance?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          total_invested?: number | null
          total_profit_loss?: number | null
          updated_at?: string | null
          user_id?: string
          virtual_balance?: number
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mystery_pack_id: string | null
          payment_provider: string | null
          payment_status: string | null
          purchase_type: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mystery_pack_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          purchase_type: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mystery_pack_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          purchase_type?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_mystery_pack_id_fkey"
            columns: ["mystery_pack_id"]
            isOneToOne: false
            referencedRelation: "mystery_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trading_portfolios: {
        Row: {
          asset: string
          average_cost: number | null
          current_value: number | null
          id: string
          quantity: number | null
          realized_pnl: number | null
          total_invested: number | null
          trading_account_id: string | null
          unrealized_pnl: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset: string
          average_cost?: number | null
          current_value?: number | null
          id?: string
          quantity?: number | null
          realized_pnl?: number | null
          total_invested?: number | null
          trading_account_id?: string | null
          unrealized_pnl?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset?: string
          average_cost?: number | null
          current_value?: number | null
          id?: string
          quantity?: number | null
          realized_pnl?: number | null
          total_invested?: number | null
          trading_account_id?: string | null
          unrealized_pnl?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trading_portfolios_trading_account_id_fkey"
            columns: ["trading_account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watchlists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          trading_pairs: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          trading_pairs?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          trading_pairs?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_card_mentions: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          mention_context: string | null
          video_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          mention_context?: string | null
          video_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          mention_context?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_card_mentions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_card_mentions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          alert_on_drop: boolean | null
          alert_on_rise: boolean | null
          card_id: string
          created_at: string | null
          id: string
          target_price: number | null
          user_id: string
        }
        Insert: {
          alert_on_drop?: boolean | null
          alert_on_rise?: boolean | null
          card_id: string
          created_at?: string | null
          id?: string
          target_price?: number | null
          user_id: string
        }
        Update: {
          alert_on_drop?: boolean | null
          alert_on_rise?: boolean | null
          card_id?: string
          created_at?: string | null
          id?: string
          target_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          price_impact: number | null
          published_at: string
          sentiment: string | null
          thumbnail: string | null
          title: string
          view_count: number | null
          youtube_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          price_impact?: number | null
          published_at: string
          sentiment?: string | null
          thumbnail?: string | null
          title: string
          view_count?: number | null
          youtube_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          price_impact?: number | null
          published_at?: string
          sentiment?: string | null
          thumbnail?: string | null
          title?: string
          view_count?: number | null
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
      get_user_projects: {
        Args: { user_uuid: string }
        Returns: {
          project_id: string
          project_name: string
          project_description: string
          project_status: Database["public"]["Enums"]["project_status"]
          github_repo_url: string
          current_valuation: number
          team_size: number
          user_role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
          last_activity: string
        }[]
      }
      update_portfolio_totals: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_user_credits: {
        Args: {
          user_uuid: string
          credit_amount: number
          transaction_type: string
          description?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      database_status: "active" | "inactive" | "maintenance" | "error"
      project_status:
        | "planning"
        | "development"
        | "active"
        | "paused"
        | "completed"
        | "archived"
      report_status:
        | "draft"
        | "generated"
        | "reviewed"
        | "approved"
        | "published"
      report_type:
        | "product_overview"
        | "prd_product_requirements"
        | "feature_specifications"
        | "design_system"
        | "user_journeys_flows"
        | "technical_architecture"
        | "api_documentation"
        | "database_schema"
        | "auth_security"
        | "developer_setup"
        | "codebase_conventions"
        | "testing_strategy"
        | "deployment"
        | "getting_started_users"
        | "how_to_guides"
        | "faq"
        | "troubleshooting"
        | "validation_checklist"
        | "kpis_success_metrics"
        | "testing_feedback_reports"
        | "roadmap"
        | "changelog"
        | "postmortem_retrospective"
        | "current_valuation"
        | "funding_pitch"
        | "valuation_methodology"
        | "investor_faq"
        | "funding_strategy"
        | "secret_sauce"
        | "readme_handoff"
      user_role: "owner" | "admin" | "developer" | "viewer"
      valuation_methodology:
        | "revenue_multiple"
        | "user_based"
        | "market_comparison"
        | "dcf"
        | "asset_based"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      database_status: ["active", "inactive", "maintenance", "error"],
      project_status: [
        "planning",
        "development",
        "active",
        "paused",
        "completed",
        "archived",
      ],
      report_status: [
        "draft",
        "generated",
        "reviewed",
        "approved",
        "published",
      ],
      report_type: [
        "product_overview",
        "prd_product_requirements",
        "feature_specifications",
        "design_system",
        "user_journeys_flows",
        "technical_architecture",
        "api_documentation",
        "database_schema",
        "auth_security",
        "developer_setup",
        "codebase_conventions",
        "testing_strategy",
        "deployment",
        "getting_started_users",
        "how_to_guides",
        "faq",
        "troubleshooting",
        "validation_checklist",
        "kpis_success_metrics",
        "testing_feedback_reports",
        "roadmap",
        "changelog",
        "postmortem_retrospective",
        "current_valuation",
        "funding_pitch",
        "valuation_methodology",
        "investor_faq",
        "funding_strategy",
        "secret_sauce",
        "readme_handoff",
      ],
      user_role: ["owner", "admin", "developer", "viewer"],
      valuation_methodology: [
        "revenue_multiple",
        "user_based",
        "market_comparison",
        "dcf",
        "asset_based",
      ],
    },
  },
} as const
