
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Users, Star, TrendingUp, Copy, Search, Filter } from 'lucide-react';

interface Trader {
  id: string;
  username: string;
  avatar?: string;
  verified: boolean;
  followers: number;
  following: number;
  winRate: number;
  totalTrades: number;
  monthlyReturn: number;
  totalReturn: number;
  riskScore: number;
  strategies: string[];
  latestSignal: {
    pair: string;
    action: 'BUY' | 'SELL';
    price: number;
    confidence: number;
    timestamp: string;
  };
}

export const SocialTrading: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const [topTraders] = useState<Trader[]>([
    {
      id: '1',
      username: 'CryptoKing2024',
      avatar: '/api/placeholder/40/40',
      verified: true,
      followers: 15420,
      following: 234,
      winRate: 78.5,
      totalTrades: 1247,
      monthlyReturn: 15.2,
      totalReturn: 245.8,
      riskScore: 6.2,
      strategies: ['Momentum', 'Grid Trading', 'DCA'],
      latestSignal: {
        pair: 'BTC/USDT',
        action: 'BUY',
        price: 43250,
        confidence: 89,
        timestamp: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: '2',
      username: 'AITradeMaster',
      avatar: '/api/placeholder/40/40',
      verified: true,
      followers: 8934,
      following: 156,
      winRate: 82.1,
      totalTrades: 892,
      monthlyReturn: 12.7,
      totalReturn: 189.4,
      riskScore: 4.8,
      strategies: ['AI Prediction', 'Arbitrage', 'Scalping'],
      latestSignal: {
        pair: 'ETH/USDT',
        action: 'SELL',
        price: 2580,
        confidence: 94,
        timestamp: '2024-01-15T11:15:00Z'
      }
    },
    {
      id: '3',
      username: 'QuantumTrader',
      avatar: '/api/placeholder/40/40',
      verified: false,
      followers: 3267,
      following: 89,
      winRate: 75.3,
      totalTrades: 634,
      monthlyReturn: 9.8,
      totalReturn: 156.7,
      riskScore: 7.1,
      strategies: ['Momentum', 'Technical Analysis'],
      latestSignal: {
        pair: 'BNB/USDT',
        action: 'BUY',
        price: 315,
        confidence: 76,
        timestamp: '2024-01-15T09:45:00Z'
      }
    }
  ]);

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignalColor = (action: string) => {
    return action === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          Social Trading
        </CardTitle>
        <Badge className="bg-purple-600 text-white">FOLLOW TRADERS</Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traders..."
              className="bg-gray-800 border-gray-600 text-white pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Top Traders List */}
        <div className="space-y-4">
          {topTraders.map((trader) => (
            <Card key={trader.id} className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={trader.avatar} />
                      <AvatarFallback>{trader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{trader.username}</span>
                        {trader.verified && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {trader.followers.toLocaleString()} followers • {trader.following} following
                      </div>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Copy className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{trader.winRate}%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{trader.totalTrades}</div>
                    <div className="text-xs text-gray-400">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">+{trader.monthlyReturn}%</div>
                    <div className="text-xs text-gray-400">Monthly Return</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getRiskColor(trader.riskScore)}`}>{trader.riskScore}/10</div>
                    <div className="text-xs text-gray-400">Risk Score</div>
                  </div>
                </div>

                {/* Strategies */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Strategies:</div>
                  <div className="flex gap-2 flex-wrap">
                    {trader.strategies.map((strategy, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Latest Signal */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">Latest Signal</div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{trader.latestSignal.pair}</span>
                        <Badge className={getSignalColor(trader.latestSignal.action) === 'text-green-400' ? 'bg-green-600' : 'bg-red-600'}>
                          {trader.latestSignal.action}
                        </Badge>
                        <span className="text-gray-300">${trader.latestSignal.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Confidence</div>
                      <div className="text-lg font-bold text-yellow-400">{trader.latestSignal.confidence}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(trader.latestSignal.timestamp).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Summary */}
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Your Copy Trading Performance</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">+24.7%</div>
                  <div className="text-sm text-gray-400">Total Return</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <div className="text-sm text-gray-400">Copied Traders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">142</div>
                  <div className="text-sm text-gray-400">Copied Trades</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
