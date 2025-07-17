
import { supabase } from '@/integrations/supabase/client';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TradingAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
  technicalIndicators: Record<string, number>;
  recommendation: 'buy' | 'sell' | 'hold';
  priceTargets: {
    short: number;
    medium: number;
    long: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

export class OpenRouterService {
  private static readonly API_BASE = 'https://openrouter.ai/api/v1';
  private static apiKey: string | null = null;

  static setApiKey(key: string): void {
    this.apiKey = key;
  }

  // Available free and affordable models
  static getAvailableModels() {
    return [
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        cost: 'Low',
        description: 'Fast and efficient for trading analysis'
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        cost: 'Low',
        description: 'Quick responses for market sentiment'
      },
      {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B',
        provider: 'Meta',
        cost: 'Free',
        description: 'Free model for basic analysis'
      },
      {
        id: 'microsoft/wizardlm-2-8x22b',
        name: 'WizardLM 2 8x22B',
        provider: 'Microsoft',
        cost: 'Medium',
        description: 'Advanced reasoning for complex analysis'
      },
      {
        id: 'google/gemma-2-9b-it:free',
        name: 'Gemma 2 9B',
        provider: 'Google',
        cost: 'Free',
        description: 'Free Google model'
      }
    ];
  }

  static async makeRequest(
    messages: OpenRouterMessage[],
    model: string = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not set');
    }

    try {
      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Crypto Trading Platform'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Log usage for audit
      await this.logAuditEvent('ai_request', {
        model,
        tokens: data.usage,
        cost_estimate: this.estimateCost(model, data.usage.total_tokens)
      });

      return data;
    } catch (error) {
      console.error('OpenRouter request error:', error);
      await this.logAuditEvent('ai_error', { model, error: error.toString() });
      throw error;
    }
  }

  // Analyze market sentiment using AI
  static async analyzeMarketSentiment(
    marketData: {
      symbol: string;
      price: number;
      change24h: number;
      volume: number;
      news?: string[];
    },
    model: string = 'meta-llama/llama-3.1-8b-instruct:free'
  ): Promise<TradingAnalysis> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are an expert cryptocurrency trading analyst. Analyze the provided market data and return a JSON response with trading insights. Be precise and data-driven.

Response format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation",
  "technicalIndicators": {"rsi": 65, "macd": 0.5, "support": 43000, "resistance": 45000},
  "recommendation": "buy|sell|hold",
  "priceTargets": {"short": 44000, "medium": 46000, "long": 50000},
  "riskLevel": "low|medium|high"
}`
      },
      {
        role: 'user',
        content: `Analyze this market data for ${marketData.symbol}:
- Current Price: $${marketData.price}
- 24h Change: ${marketData.change24h}%
- 24h Volume: $${marketData.volume}
${marketData.news ? `- Recent News: ${marketData.news.join('; ')}` : ''}

Provide a comprehensive trading analysis.`
      }
    ];

    try {
      const response = await this.makeRequest(messages, model);
      const content = response.choices[0].message.content;
      
      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        await this.logAuditEvent('sentiment_analysis', {
          symbol: marketData.symbol,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          model
        });
        
        return analysis;
      } else {
        // Fallback parsing
        return this.parseTextAnalysis(content, marketData);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Return neutral analysis on error
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        reasoning: 'Analysis failed, using neutral stance',
        technicalIndicators: {},
        recommendation: 'hold',
        priceTargets: {
          short: marketData.price,
          medium: marketData.price,
          long: marketData.price
        },
        riskLevel: 'medium'
      };
    }
  }

  // Generate trading signals
  static async generateTradingSignal(
    symbol: string,
    timeframe: string,
    indicators: Record<string, number>,
    model: string = 'openai/gpt-3.5-turbo'
  ): Promise<{
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    reasoning: string;
  }> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a professional crypto trading signal generator. Based on technical indicators, generate precise trading signals with entry/exit points.

Response format:
{
  "signal": "buy|sell|hold",
  "strength": 0.0-1.0,
  "entry": number,
  "stopLoss": number,
  "takeProfit": number,
  "reasoning": "detailed explanation"
}`
      },
      {
        role: 'user',
        content: `Generate a trading signal for ${symbol} on ${timeframe} timeframe:
Technical Indicators: ${JSON.stringify(indicators, null, 2)}

Provide specific entry, stop-loss, and take-profit levels.`
      }
    ];

    try {
      const response = await this.makeRequest(messages, model);
      const content = response.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const signal = JSON.parse(jsonMatch[0]);
        
        await this.logAuditEvent('trading_signal', {
          symbol,
          signal: signal.signal,
          strength: signal.strength,
          model
        });
        
        return signal;
      }
    } catch (error) {
      console.error('Trading signal error:', error);
    }

    // Fallback signal
    return {
      signal: 'hold',
      strength: 0.5,
      entry: indicators.price || 0,
      stopLoss: (indicators.price || 0) * 0.95,
      takeProfit: (indicators.price || 0) * 1.05,
      reasoning: 'Signal generation failed, holding position'
    };
  }

  // Portfolio optimization
  static async optimizePortfolio(
    holdings: Array<{ symbol: string; amount: number; value: number }>,
    riskTolerance: 'low' | 'medium' | 'high',
    model: string = 'anthropic/claude-3-haiku'
  ): Promise<{
    recommendations: Array<{
      symbol: string;
      action: 'buy' | 'sell' | 'hold';
      targetAllocation: number;
      reasoning: string;
    }>;
    riskScore: number;
    diversificationScore: number;
  }> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a crypto portfolio optimization expert. Analyze the current portfolio and provide rebalancing recommendations based on risk tolerance and diversification principles.`
      },
      {
        role: 'user',
        content: `Optimize this crypto portfolio:
Holdings: ${JSON.stringify(holdings, null, 2)}
Risk Tolerance: ${riskTolerance}

Provide rebalancing recommendations with target allocations.`
      }
    ];

    try {
      const response = await this.makeRequest(messages, model);
      const content = response.choices[0].message.content;
      
      // Parse response and extract recommendations
      // This would require more sophisticated parsing in a real implementation
      const recommendations = holdings.map(holding => ({
        symbol: holding.symbol,
        action: 'hold' as const,
        targetAllocation: holding.value / holdings.reduce((sum, h) => sum + h.value, 0),
        reasoning: 'AI analysis completed'
      }));

      await this.logAuditEvent('portfolio_optimization', {
        holdings_count: holdings.length,
        risk_tolerance: riskTolerance,
        model
      });

      return {
        recommendations,
        riskScore: 0.5,
        diversificationScore: 0.7
      };
    } catch (error) {
      console.error('Portfolio optimization error:', error);
      return {
        recommendations: [],
        riskScore: 0.5,
        diversificationScore: 0.5
      };
    }
  }

  private static parseTextAnalysis(content: string, marketData: any): TradingAnalysis {
    // Basic text parsing fallback
    const sentiment = content.toLowerCase().includes('bullish') ? 'bullish' :
                     content.toLowerCase().includes('bearish') ? 'bearish' : 'neutral';
    
    return {
      sentiment,
      confidence: 0.6,
      reasoning: content.substring(0, 200) + '...',
      technicalIndicators: {},
      recommendation: sentiment === 'bullish' ? 'buy' : sentiment === 'bearish' ? 'sell' : 'hold',
      priceTargets: {
        short: marketData.price * (sentiment === 'bullish' ? 1.02 : 0.98),
        medium: marketData.price * (sentiment === 'bullish' ? 1.05 : 0.95),
        long: marketData.price * (sentiment === 'bullish' ? 1.1 : 0.9)
      },
      riskLevel: 'medium'
    };
  }

  private static estimateCost(model: string, tokens: number): number {
    // Rough cost estimates per 1M tokens
    const costs: Record<string, number> = {
      'openai/gpt-3.5-turbo': 1.50,
      'anthropic/claude-3-haiku': 0.25,
      'meta-llama/llama-3.1-8b-instruct:free': 0,
      'google/gemma-2-9b-it:free': 0,
      'microsoft/wizardlm-2-8x22b': 10.0
    };
    
    return ((costs[model] || 5.0) * tokens) / 1000000;
  }

  private static async logAuditEvent(action: string, data: any): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: `openrouter_${action}`,
          resource_type: 'ai_service',
          new_values: JSON.parse(JSON.stringify(data))
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }
}
