
import { supabase } from '@/integrations/supabase/client';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  source: 'tradingview' | 'external' | 'telegram' | 'custom';
  isActive: boolean;
  secret?: string;
  filters: {
    symbols?: string[];
    signals?: string[];
    minConfidence?: number;
  };
}

export interface WebhookSignal {
  id: string;
  source: string;
  timestamp: string;
  symbol: string;
  action: 'buy' | 'sell' | 'close';
  price?: number;
  quantity?: number;
  confidence?: number;
  metadata?: Record<string, any>;
}

export class WebhookService {
  static async createWebhook(config: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      const webhook: WebhookConfig = {
        id: `webhook_${Date.now()}`,
        ...config
      };

      // Store webhook configuration
      console.log('Creating webhook:', webhook);
      
      // In real implementation, this would create actual webhook endpoints
      return webhook;
    } catch (error) {
      console.error('Failed to create webhook:', error);
      throw error;
    }
  }

  static async processIncomingSignal(signal: Partial<WebhookSignal>): Promise<boolean> {
    try {
      console.log('Processing incoming webhook signal:', signal);

      // Validate signal
      if (!signal.symbol || !signal.action) {
        throw new Error('Invalid signal format');
      }

      const processedSignal: WebhookSignal = {
        id: `signal_${Date.now()}`,
        source: signal.source || 'external',
        timestamp: signal.timestamp || new Date().toISOString(),
        symbol: signal.symbol,
        action: signal.action,
        price: signal.price,
        quantity: signal.quantity,
        confidence: signal.confidence || 0.7,
        metadata: signal.metadata || {}
      };

      // Store signal in database
      await this.storeSignal(processedSignal);

      // Trigger automated actions if configured
      await this.triggerAutomatedActions(processedSignal);

      return true;
    } catch (error) {
      console.error('Failed to process webhook signal:', error);
      return false;
    }
  }

  static async getTradingViewAlert(alertData: any) {
    try {
      // Parse TradingView alert format
      const signal: Partial<WebhookSignal> = {
        source: 'tradingview',
        symbol: alertData.ticker || alertData.symbol,
        action: alertData.strategy?.order?.action?.toLowerCase() || 'buy',
        price: alertData.strategy?.order?.price || alertData.close,
        confidence: 0.8,
        metadata: {
          indicator: alertData.indicator,
          timeframe: alertData.interval,
          exchange: alertData.exchange
        }
      };

      return await this.processIncomingSignal(signal);
    } catch (error) {
      console.error('Failed to process TradingView alert:', error);
      return false;
    }
  }

  static async sendWebhookNotification(config: WebhookConfig, data: any) {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.secret && { 'Authorization': `Bearer ${config.secret}` })
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'crypto-trading-platform',
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      console.log('Webhook notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
      return false;
    }
  }

  private static async storeSignal(signal: WebhookSignal) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: 'webhook_signal',
          resource_type: 'signal',
          new_values: JSON.parse(JSON.stringify(signal))
        });
      }
    } catch (error) {
      console.error('Failed to store signal:', error);
    }
  }

  private static async triggerAutomatedActions(signal: WebhookSignal) {
    try {
      // Find active bots that should respond to this signal
      console.log('Checking for automated actions for signal:', signal);

      // This would trigger actual bot actions in real implementation
      // For now, just log the action
      console.log(`Would trigger ${signal.action} action for ${signal.symbol}`);
    } catch (error) {
      console.error('Failed to trigger automated actions:', error);
    }
  }
}
