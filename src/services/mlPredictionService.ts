
import { supabase } from '@/integrations/supabase/client';

export interface PredictionInput {
  symbol: string;
  timeframe: '1h' | '4h' | '1d';
  priceHistory: number[];
  volumeHistory: number[];
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollinger: { upper: number; lower: number; middle: number };
    ema20: number;
    ema50: number;
  };
  marketSentiment: number;
  newsScore: number;
}

export interface PredictionResult {
  symbol: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  targetPrice: number;
  timeHorizon: string;
  factors: {
    technical: number;
    sentiment: number;
    volume: number;
    momentum: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export class MLPredictionService {
  private static models = {
    lstm: 'Long Short-Term Memory Neural Network',
    transformer: 'Transformer-based Price Prediction',
    ensemble: 'Ensemble of Multiple Models',
    reinforcement: 'Reinforcement Learning Agent'
  };

  static async predictPrice(input: PredictionInput): Promise<PredictionResult> {
    try {
      console.log('Running ML prediction for:', input.symbol);

      // Simulate advanced ML prediction
      const technicalScore = this.calculateTechnicalScore(input.technicalIndicators);
      const momentumScore = this.calculateMomentumScore(input.priceHistory);
      const volumeScore = this.calculateVolumeScore(input.volumeHistory);
      const sentimentScore = input.marketSentiment;

      // Weighted ensemble prediction
      const weights = { technical: 0.4, momentum: 0.3, volume: 0.2, sentiment: 0.1 };
      const overallScore = 
        technicalScore * weights.technical +
        momentumScore * weights.momentum +
        volumeScore * weights.volume +
        sentimentScore * weights.sentiment;

      const direction = overallScore > 0.6 ? 'bullish' : overallScore < 0.4 ? 'bearish' : 'neutral';
      const confidence = Math.abs(overallScore - 0.5) * 2;

      // Calculate target price
      const currentPrice = input.priceHistory[input.priceHistory.length - 1];
      const priceChange = (overallScore - 0.5) * 0.1; // Max 5% change prediction
      const targetPrice = currentPrice * (1 + priceChange);

      const prediction: PredictionResult = {
        symbol: input.symbol,
        direction,
        confidence,
        targetPrice,
        timeHorizon: input.timeframe,
        factors: {
          technical: technicalScore,
          sentiment: sentimentScore,
          volume: volumeScore,
          momentum: momentumScore
        },
        riskLevel: confidence > 0.8 ? 'low' : confidence > 0.6 ? 'medium' : 'high',
        recommendation: this.getRecommendation(overallScore, confidence)
      };

      // Store prediction in database
      await this.storePrediction(prediction);

      return prediction;
    } catch (error) {
      console.error('ML prediction failed:', error);
      throw error;
    }
  }

  static async getModelPerformance(modelType: string, symbol: string) {
    try {
      // Mock model performance metrics
      return {
        accuracy: 0.72 + Math.random() * 0.15,
        precision: 0.68 + Math.random() * 0.2,
        recall: 0.71 + Math.random() * 0.18,
        f1Score: 0.69 + Math.random() * 0.16,
        totalPredictions: Math.floor(Math.random() * 1000) + 500,
        correctPredictions: Math.floor(Math.random() * 700) + 350,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get model performance:', error);
      throw error;
    }
  }

  static async trainCustomModel(config: {
    symbol: string;
    features: string[];
    modelType: 'lstm' | 'transformer' | 'ensemble';
    trainingPeriod: number;
  }) {
    try {
      console.log('Training custom model:', config);
      
      // Simulate model training
      const trainingProgress = {
        status: 'training',
        progress: 0,
        epochs: 100,
        currentEpoch: 0,
        loss: 0,
        accuracy: 0
      };

      // Return training job ID
      return {
        jobId: `train_${Date.now()}`,
        estimatedTime: '15 minutes',
        progress: trainingProgress
      };
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    }
  }

  private static calculateTechnicalScore(indicators: PredictionInput['technicalIndicators']): number {
    let score = 0.5; // Neutral starting point

    // RSI analysis
    if (indicators.rsi < 30) score += 0.2; // Oversold - bullish
    else if (indicators.rsi > 70) score -= 0.2; // Overbought - bearish

    // MACD analysis
    if (indicators.macd > 0) score += 0.15;
    else score -= 0.15;

    // EMA crossover
    if (indicators.ema20 > indicators.ema50) score += 0.1;
    else score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private static calculateMomentumScore(priceHistory: number[]): number {
    if (priceHistory.length < 2) return 0.5;

    const recentPrices = priceHistory.slice(-10);
    const earlierPrices = priceHistory.slice(-20, -10);

    const recentAvg = recentPrices.reduce((a, b) => a + b) / recentPrices.length;
    const earlierAvg = earlierPrices.reduce((a, b) => a + b) / earlierPrices.length;

    const momentum = (recentAvg - earlierAvg) / earlierAvg;
    return Math.max(0, Math.min(1, 0.5 + momentum * 5));
  }

  private static calculateVolumeScore(volumeHistory: number[]): number {
    if (volumeHistory.length < 2) return 0.5;

    const recentVolume = volumeHistory.slice(-5).reduce((a, b) => a + b) / 5;
    const historicalVolume = volumeHistory.slice(0, -5).reduce((a, b) => a + b) / (volumeHistory.length - 5);

    const volumeRatio = recentVolume / historicalVolume;
    return Math.max(0, Math.min(1, 0.3 + (volumeRatio - 1) * 0.4));
  }

  private static getRecommendation(score: number, confidence: number): PredictionResult['recommendation'] {
    if (confidence < 0.5) return 'hold';
    
    if (score > 0.8) return 'strong_buy';
    if (score > 0.6) return 'buy';
    if (score < 0.2) return 'strong_sell';
    if (score < 0.4) return 'sell';
    return 'hold';
  }

  private static async storePrediction(prediction: PredictionResult) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('audit_logs').insert({
          user_id: user.user.id,
          action: 'ml_prediction',
          resource_type: 'prediction',
          new_values: prediction
        });
      }
    } catch (error) {
      console.error('Failed to store prediction:', error);
    }
  }
}
