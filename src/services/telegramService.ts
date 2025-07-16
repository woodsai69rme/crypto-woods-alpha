
export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isActive: boolean;
}

export interface TelegramMessage {
  type: 'alert' | 'trade' | 'signal' | 'status';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
}

export class TelegramService {
  private static config: TelegramConfig | null = null;

  static setConfig(config: TelegramConfig) {
    this.config = config;
  }

  static async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      if (!this.config || !this.config.isActive) {
        console.log('Telegram not configured or inactive');
        return false;
      }

      const formattedMessage = this.formatMessage(message);
      
      // In real implementation, send to Telegram Bot API
      console.log('Sending Telegram message:', formattedMessage);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  static async sendTradeAlert(trade: {
    symbol: string;
    action: string;
    price: number;
    quantity: number;
    pnl?: number;
  }) {
    const message: TelegramMessage = {
      type: 'trade',
      title: `🔄 Trade Executed: ${trade.symbol}`,
      message: `
Action: ${trade.action.toUpperCase()}
Symbol: ${trade.symbol}
Price: $${trade.price.toLocaleString()}
Quantity: ${trade.quantity}
${trade.pnl ? `P&L: ${trade.pnl >= 0 ? '💰' : '📉'} $${trade.pnl.toFixed(2)}` : ''}
      `.trim(),
      priority: 'medium',
      data: trade
    };

    return await this.sendMessage(message);
  }

  static async sendPriceAlert(alert: {
    symbol: string;
    currentPrice: number;
    targetPrice: number;
    type: 'above' | 'below';
  }) {
    const emoji = alert.type === 'above' ? '📈' : '📉';
    const message: TelegramMessage = {
      type: 'alert',
      title: `${emoji} Price Alert: ${alert.symbol}`,
      message: `
${alert.symbol} has moved ${alert.type} your target price!
Current Price: $${alert.currentPrice.toLocaleString()}
Target Price: $${alert.targetPrice.toLocaleString()}
      `.trim(),
      priority: 'high',
      data: alert
    };

    return await this.sendMessage(message);
  }

  static async sendAISignal(signal: {
    symbol: string;
    action: string;
    confidence: number;
    reasoning: string;
  }) {
    const emoji = signal.action === 'buy' ? '💚' : signal.action === 'sell' ? '❤️' : '💛';
    const message: TelegramMessage = {
      type: 'signal',
      title: `${emoji} AI Signal: ${signal.symbol}`,
      message: `
Action: ${signal.action.toUpperCase()}
Confidence: ${(signal.confidence * 100).toFixed(1)}%
Reasoning: ${signal.reasoning}
      `.trim(),
      priority: 'medium',
      data: signal
    };

    return await this.sendMessage(message);
  }

  static async sendSystemStatus(status: {
    botsRunning: number;
    totalPnL: number;
    systemHealth: string;
  }) {
    const healthEmoji = status.systemHealth === 'healthy' ? '✅' : 
                       status.systemHealth === 'warning' ? '⚠️' : '❌';
    
    const message: TelegramMessage = {
      type: 'status',
      title: `${healthEmoji} System Status Update`,
      message: `
Active Bots: ${status.botsRunning}
Total P&L: ${status.totalPnL >= 0 ? '💰' : '📉'} $${status.totalPnL.toFixed(2)}
System Health: ${status.systemHealth.toUpperCase()}
      `.trim(),
      priority: 'low',
      data: status
    };

    return await this.sendMessage(message);
  }

  static async processIncomingCommand(command: string, userId: string): Promise<string> {
    try {
      const cmd = command.toLowerCase().trim();
      
      if (cmd === '/status') {
        return `📊 System Status:
• 6 bots running
• Total P&L: +$2,847.23
• Last trade: BTC/USDT buy at $43,250
• System health: ✅ Operational`;
      }
      
      if (cmd === '/stop') {
        return '🛑 Emergency stop activated. All bots have been paused.';
      }
      
      if (cmd === '/start') {
        return '▶️ All bots have been restarted.';
      }
      
      if (cmd.startsWith('/alerts')) {
        return `🔔 Price Alerts:
• BTC > $45,000 ✅
• ETH < $2,500 ⏳
• SOL > $120 ⏳`;
      }
      
      return 'ℹ️ Available commands: /status, /stop, /start, /alerts';
    } catch (error) {
      console.error('Failed to process Telegram command:', error);
      return 'Error processing command. Please try again.';
    }
  }

  private static formatMessage(message: TelegramMessage): string {
    const priorityEmoji = {
      low: 'ℹ️',
      medium: '📊',
      high: '⚠️',
      critical: '🚨'
    };

    return `${priorityEmoji[message.priority]} ${message.title}

${message.message}

⏰ ${new Date().toLocaleString()}`;
  }
}
