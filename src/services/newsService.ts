
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  impactScore: number;
  relatedAssets: string[];
  category: 'market' | 'regulatory' | 'technology' | 'adoption' | 'security';
}

export interface SentimentAnalysis {
  overall: number;
  timeframe: string;
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trending: {
    asset: string;
    sentiment: number;
    change24h: number;
  }[];
}

export class NewsService {
  private static sources = [
    'CoinDesk',
    'CoinTelegraph',
    'CryptoNews',
    'Bitcoin.com',
    'Decrypt',
    'The Block',
    'Crypto Briefing'
  ];

  static async fetchLatestNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      console.log('Fetching latest crypto news...');

      // Mock news data - in real implementation, integrate with news APIs
      const mockNews: NewsArticle[] = [
        {
          id: 'news_1',
          title: 'Bitcoin Breaks $45,000 Resistance as Institutional Demand Surges',
          content: 'Bitcoin has successfully broken through the critical $45,000 resistance level...',
          source: 'CoinDesk',
          url: 'https://coindesk.com/markets/bitcoin-breaks-45k',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          sentiment: 'positive',
          sentimentScore: 0.8,
          impactScore: 0.9,
          relatedAssets: ['BTC', 'ETH'],
          category: 'market'
        },
        {
          id: 'news_2',
          title: 'SEC Announces New Crypto Regulation Framework',
          content: 'The Securities and Exchange Commission has unveiled comprehensive guidelines...',
          source: 'Reuters',
          url: 'https://reuters.com/crypto-regulation',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          sentiment: 'neutral',
          sentimentScore: 0.1,
          impactScore: 0.8,
          relatedAssets: ['BTC', 'ETH', 'ADA', 'SOL'],
          category: 'regulatory'
        },
        {
          id: 'news_3',
          title: 'Ethereum Layer 2 Solutions See Record Transaction Volume',
          content: 'Layer 2 scaling solutions built on Ethereum have processed a record number...',
          source: 'The Block',
          url: 'https://theblock.co/ethereum-l2-volume',
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          sentiment: 'positive',
          sentimentScore: 0.7,
          impactScore: 0.6,
          relatedAssets: ['ETH', 'MATIC'],
          category: 'technology'
        }
      ];

      // Store news in database
      await this.storeNews(mockNews);

      return mockNews;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
  }

  static async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  }> {
    try {
      // Mock sentiment analysis - in real implementation, use NLP APIs
      const positiveWords = ['bullish', 'surge', 'breakthrough', 'adoption', 'growth', 'success'];
      const negativeWords = ['bearish', 'crash', 'decline', 'regulation', 'ban', 'hack'];

      const words = text.toLowerCase().split(/\s+/);
      let positiveCount = 0;
      let negativeCount = 0;

      words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
        if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      });

      const totalSentimentWords = positiveCount + negativeCount;
      if (totalSentimentWords === 0) {
        return { sentiment: 'neutral', score: 0, confidence: 0.5 };
      }

      const score = (positiveCount - negativeCount) / totalSentimentWords;
      const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
      const confidence = Math.min(totalSentimentWords / 10, 1);

      return { sentiment, score, confidence };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }
  }

  static async getMarketSentiment(timeframe: '1h' | '24h' | '7d' = '24h'): Promise<SentimentAnalysis> {
    try {
      console.log(`Analyzing market sentiment for ${timeframe}`);

      // Mock sentiment analysis
      const overall = 0.3 + (Math.random() - 0.5) * 0.6; // -0.3 to 0.9

      return {
        overall,
        timeframe,
        breakdown: {
          positive: 45 + Math.random() * 30,
          negative: 25 + Math.random() * 20,
          neutral: 30 + Math.random() * 20
        },
        trending: [
          { asset: 'BTC', sentiment: 0.8, change24h: 0.2 },
          { asset: 'ETH', sentiment: 0.6, change24h: -0.1 },
          { asset: 'SOL', sentiment: 0.4, change24h: 0.3 },
          { asset: 'ADA', sentiment: 0.2, change24h: -0.2 }
        ]
      };
    } catch (error) {
      console.error('Failed to analyze market sentiment:', error);
      throw error;
    }
  }

  static async getNewsImpactOnPrice(symbol: string, hours: number = 24): Promise<{
    priceChange: number;
    newsCount: number;
    avgSentiment: number;
    correlation: number;
  }> {
    try {
      // Mock correlation analysis
      return {
        priceChange: (Math.random() - 0.5) * 10, // -5% to +5%
        newsCount: Math.floor(Math.random() * 20) + 5,
        avgSentiment: (Math.random() - 0.5) * 2, // -1 to 1
        correlation: 0.3 + Math.random() * 0.4 // 0.3 to 0.7
      };
    } catch (error) {
      console.error('Failed to analyze news impact:', error);
      throw error;
    }
  }

  private static async storeNews(articles: NewsArticle[]) {
    try {
      for (const article of articles) {
        await supabase.from('market_news').upsert({
          id: article.id,
          title: article.title,
          content: article.content,
          source: article.source,
          url: article.url,
          published_at: article.publishedAt,
          sentiment_score: article.sentimentScore,
          impact_score: article.impactScore,
          related_assets: article.relatedAssets
        });
      }
    } catch (error) {
      console.error('Failed to store news:', error);
    }
  }
}
