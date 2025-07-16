
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NewsService } from '@/services/newsService';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export const NewsAnalysis: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewsAndSentiment();
  }, []);

  const loadNewsAndSentiment = async () => {
    try {
      const [newsData, sentimentData] = await Promise.all([
        NewsService.fetchLatestNews(10),
        NewsService.getMarketSentiment('24h')
      ]);
      
      setNews(newsData);
      setSentiment(sentimentData);
    } catch (error) {
      console.error('Failed to load news and sentiment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-blue-600';
      case 'regulatory': return 'bg-red-600';
      case 'technology': return 'bg-purple-600';
      case 'adoption': return 'bg-green-600';
      case 'security': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center text-gray-400">Loading news and sentiment...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-400" />
          Market News & Sentiment Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sentiment Overview */}
        {sentiment && (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="pt-4">
              <h3 className="text-white font-semibold mb-4">Overall Market Sentiment (24h)</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Overall Score</span>
                    <span className={`font-bold ${sentiment.overall > 0 ? 'text-green-400' : sentiment.overall < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {sentiment.overall > 0 ? '+' : ''}{(sentiment.overall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(sentiment.overall * 100)} 
                    className="mb-4"
                  />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Positive:</span>
                      <span className="text-white">{sentiment.breakdown.positive.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">Negative:</span>
                      <span className="text-white">{sentiment.breakdown.negative.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">Neutral:</span>
                      <span className="text-white">{sentiment.breakdown.neutral.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Trending Assets</h4>
                  <div className="space-y-2">
                    {sentiment.trending.map((asset: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{asset.asset}</span>
                          {asset.sentiment > 0 ? 
                            <TrendingUp className="h-3 w-3 text-green-400" /> :
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          }
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${asset.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(asset.sentiment * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {asset.change24h > 0 ? '+' : ''}{(asset.change24h * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest News */}
        <div>
          <h3 className="text-white font-semibold mb-4">Latest Crypto News</h3>
          <div className="space-y-4">
            {news.map((article) => (
              <Card key={article.id} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400">{article.source}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(article.publishedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`text-sm font-medium ${getSentimentColor(article.sentiment)}`}>
                        {article.sentiment.toUpperCase()}
                      </div>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-400">
                        Impact: <span className="text-white">{(article.impactScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Sentiment: <span className="text-white">{(article.sentimentScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {article.relatedAssets.map((asset: string) => (
                        <Badge key={asset} variant="outline" className="text-xs">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
