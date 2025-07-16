
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Target, Zap, AlertTriangle } from 'lucide-react';

interface AIInsight {
  type: 'prediction' | 'sentiment' | 'pattern' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
}

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [marketSentiment, setMarketSentiment] = useState(65);
  const [tradeProbability, setTradeProbability] = useState({ long: 72, short: 28 });

  useEffect(() => {
    const generateInsights = (): AIInsight[] => {
      const insightTemplates = [
        {
          type: 'prediction' as const,
          title: 'BTC Price Direction',
          description: 'AI models predict 73% probability of upward movement to $44,200 within 4 hours based on liquidity analysis.',
          confidence: 73,
          impact: 'high' as const,
          timeframe: '4h',
          actionable: true,
        },
        {
          type: 'sentiment' as const,
          title: 'Social Sentiment Shift',
          description: 'Whale movement tracking shows accumulation pattern. 8 large transfers detected in last hour.',
          confidence: 81,
          impact: 'high' as const,
          timeframe: '1h',
          actionable: true,
        },
        {
          type: 'pattern' as const,
          title: 'Fibonacci Convergence',
          description: 'Price approaching 61.8% retracement level with high volume. Historical data shows 78% success rate.',
          confidence: 78,
          impact: 'medium' as const,
          timeframe: '2h',
          actionable: true,
        },
        {
          type: 'risk' as const,
          title: 'Market Volatility Alert',
          description: 'Options flow indicates potential volatility spike. Consider position sizing adjustments.',
          confidence: 65,
          impact: 'medium' as const,
          timeframe: '6h',
          actionable: false,
        },
      ];

      return insightTemplates.map(template => ({
        ...template,
        confidence: template.confidence + Math.floor((Math.random() - 0.5) * 10),
      }));
    };

    setInsights(generateInsights());

    // Real-time updates
    const interval = setInterval(() => {
      setMarketSentiment(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setTradeProbability(prev => {
        const change = (Math.random() - 0.5) * 10;
        const newLong = Math.max(0, Math.min(100, prev.long + change));
        return { long: newLong, short: 100 - newLong };
      });
      
      setInsights(prev => prev.map(insight => ({
        ...insight,
        confidence: Math.max(50, Math.min(95, insight.confidence + (Math.random() - 0.5) * 3)),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment': return <Brain className="h-4 w-4" />;
      case 'pattern': return <Target className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            AI Market Intelligence
          </div>
          <Badge className="bg-purple-600 text-white animate-pulse">
            ANALYZING
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Market Sentiment Gauge */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Market Sentiment</span>
            <span className="text-white font-bold">{marketSentiment}/100</span>
          </div>
          <Progress 
            value={marketSentiment} 
            className="h-2"
          />
          <div className="text-xs text-gray-400 mt-1">
            {marketSentiment >= 70 ? 'Extremely Bullish' : 
             marketSentiment >= 50 ? 'Bullish' : 
             marketSentiment >= 30 ? 'Bearish' : 'Extremely Bearish'}
          </div>
        </div>

        {/* Trade Probability */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">Trade Direction Probability</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                <span className="text-green-400">Long</span>
              </div>
              <span className="text-white font-bold">{tradeProbability.long}%</span>
            </div>
            <Progress 
              value={tradeProbability.long} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-400" />
                <span className="text-red-400">Short</span>
              </div>
              <span className="text-white font-bold">{tradeProbability.short}%</span>
            </div>
            <Progress 
              value={tradeProbability.short} 
              className="h-2"
            />
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <div className="text-sm text-gray-400 font-medium">Live AI Insights</div>
          {insights.map((insight, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-purple-400">
                    {getTypeIcon(insight.type)}
                  </div>
                  <span className="text-white font-medium text-sm">{insight.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getImpactColor(insight.impact)} border-current`}
                  >
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{insight.timeframe}</div>
                  <div className="text-xs text-white">{insight.confidence}% confident</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <Progress 
                  value={insight.confidence} 
                  className="h-1 w-20"
                />
                {insight.actionable && (
                  <Badge className="bg-green-600 text-white text-xs">
                    ACTIONABLE
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <div className="text-xs text-gray-400">
            AI analysis combines liquidity data, sentiment, patterns, and probability models
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
