
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MLPredictionService } from '@/services/mlPredictionService';
import { Brain, TrendingUp, TrendingDown, Target, Activity, Zap } from 'lucide-react';

export const MLPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelPerformance, setModelPerformance] = useState<any>(null);

  useEffect(() => {
    loadPredictions();
    loadModelPerformance();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      // Mock predictions for demo
      const mockPredictions = [
        {
          symbol: 'BTC/USDT',
          direction: 'bullish',
          confidence: 0.82,
          targetPrice: 45200,
          timeHorizon: '4h',
          factors: { technical: 0.8, sentiment: 0.7, volume: 0.9, momentum: 0.75 },
          riskLevel: 'medium',
          recommendation: 'buy'
        },
        {
          symbol: 'ETH/USDT',
          direction: 'bearish',
          confidence: 0.69,
          targetPrice: 2520,
          timeHorizon: '1h',
          factors: { technical: 0.4, sentiment: 0.3, volume: 0.6, momentum: 0.2 },
          riskLevel: 'high',
          recommendation: 'sell'
        },
        {
          symbol: 'SOL/USDT',
          direction: 'neutral',
          confidence: 0.55,
          targetPrice: 118,
          timeHorizon: '1d',
          factors: { technical: 0.5, sentiment: 0.6, volume: 0.4, momentum: 0.5 },
          riskLevel: 'low',
          recommendation: 'hold'
        }
      ];
      
      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelPerformance = async () => {
    try {
      const performance = await MLPredictionService.getModelPerformance('ensemble', 'BTCUSDT');
      setModelPerformance(performance);
    } catch (error) {
      console.error('Failed to load model performance:', error);
    }
  };

  const generateNewPrediction = async (symbol: string) => {
    setIsLoading(true);
    try {
      const mockInput = {
        symbol,
        timeframe: '4h' as const,
        priceHistory: Array.from({ length: 100 }, (_, i) => 43000 + Math.random() * 2000),
        volumeHistory: Array.from({ length: 100 }, (_, i) => 1000000 + Math.random() * 500000),
        technicalIndicators: {
          rsi: 65.2,
          macd: 0.8,
          bollinger: { upper: 44000, lower: 42000, middle: 43000 },
          ema20: 43100,
          ema50: 42800
        },
        marketSentiment: 0.7,
        newsScore: 0.6
      };

      const prediction = await MLPredictionService.predictPrice(mockInput);
      setPredictions(prev => [prediction, ...prev]);
    } catch (error) {
      console.error('Failed to generate prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-700';
      case 'buy': return 'bg-green-600';
      case 'hold': return 'bg-yellow-600';
      case 'sell': return 'bg-red-600';
      case 'strong_sell': return 'bg-red-700';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI/ML Price Predictions
          <Badge className="bg-purple-600 text-white">
            {predictions.length} ACTIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="performance">Model Performance</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Latest Predictions</h3>
              <Button
                onClick={() => generateNewPrediction('BTC/USDT')}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Prediction
              </Button>
            </div>

            <div className="grid gap-4">
              {predictions.map((prediction, index) => (
                <Card key={index} className="bg-gray-800 border-gray-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getDirectionIcon(prediction.direction)}
                        <div>
                          <h4 className="text-white font-bold">{prediction.symbol}</h4>
                          <p className="text-sm text-gray-400">{prediction.timeHorizon} prediction</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${prediction.targetPrice.toLocaleString()}
                        </div>
                        <Badge className={getRecommendationColor(prediction.recommendation)}>
                          {prediction.recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.confidence * 100} className="w-20" />
                          <span className="text-sm text-white">{(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-400">Technical</span>
                          <Progress value={prediction.factors.technical * 100} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Sentiment</span>
                          <Progress value={prediction.factors.sentiment * 100} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Volume</span>
                          <Progress value={prediction.factors.volume * 100} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Momentum</span>
                          <Progress value={prediction.factors.momentum * 100} className="mt-1" />
                        </div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Risk Level: 
                          <span className={`ml-1 ${
                            prediction.riskLevel === 'low' ? 'text-green-400' :
                            prediction.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {prediction.riskLevel.toUpperCase()}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Direction: <span className="text-white">{prediction.direction.toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {modelPerformance && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-600">
                  <CardContent className="pt-4">
                    <h4 className="text-white font-semibold mb-3">Model Accuracy</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-green-400">{(modelPerformance.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Precision:</span>
                        <span className="text-blue-400">{(modelPerformance.precision * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recall:</span>
                        <span className="text-purple-400">{(modelPerformance.recall * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">F1 Score:</span>
                        <span className="text-yellow-400">{(modelPerformance.f1Score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardContent className="pt-4">
                    <h4 className="text-white font-semibold mb-3">Prediction Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Predictions:</span>
                        <span className="text-white">{modelPerformance.totalPredictions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Correct:</span>
                        <span className="text-green-400">{modelPerformance.correctPredictions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="text-blue-400">
                          {((modelPerformance.correctPredictions / modelPerformance.totalPredictions) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Updated:</span>
                        <span className="text-gray-300">
                          {new Date(modelPerformance.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <h4 className="text-white font-semibold mb-4">Custom Model Training</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Model Type</label>
                    <select className="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      <option value="lstm">LSTM Neural Network</option>
                      <option value="transformer">Transformer</option>
                      <option value="ensemble">Ensemble Model</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Training Symbol</label>
                    <select className="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      <option value="BTCUSDT">BTC/USDT</option>
                      <option value="ETHUSDT">ETH/USDT</option>
                      <option value="SOLUSDT">SOL/USDT</option>
                    </select>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Start Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
