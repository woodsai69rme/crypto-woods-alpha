
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, Settings, TrendingUp, DollarSign, Eye } from 'lucide-react';

interface TradingAccount {
  id: string;
  name: string;
  type: 'paper' | 'live';
  exchange: string;
  balance: number;
  pnl: number;
  pnl_percentage: number;
  status: 'active' | 'paused' | 'stopped';
  created_at: string;
}

export const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([
    {
      id: '1',
      name: 'Primary Paper Account',
      type: 'paper',
      exchange: 'binance',
      balance: 10000,
      pnl: 1247.83,
      pnl_percentage: 12.48,
      status: 'active',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Aggressive Strategy Test',
      type: 'paper',
      exchange: 'coinbase',
      balance: 5000,
      pnl: -234.56,
      pnl_percentage: -4.69,
      status: 'active',
      created_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Conservative DCA',
      type: 'paper',
      exchange: 'kraken',
      balance: 15000,
      pnl: 456.78,
      pnl_percentage: 3.05,
      status: 'active',
      created_at: '2024-01-25T09:15:00Z'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'paper' as 'paper' | 'live',
    exchange: 'binance',
    initialBalance: 10000
  });

  const createAccount = () => {
    const account: TradingAccount = {
      id: Date.now().toString(),
      name: newAccount.name || `New ${newAccount.type} Account`,
      type: newAccount.type,
      exchange: newAccount.exchange,
      balance: newAccount.initialBalance,
      pnl: 0,
      pnl_percentage: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    setAccounts(prev => [...prev, account]);
    setNewAccount({ name: '', type: 'paper', exchange: 'binance', initialBalance: 10000 });
    setShowCreateForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-yellow-600';
      case 'stopped': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getExchangeColor = (exchange: string) => {
    const colors = {
      binance: 'bg-yellow-600',
      coinbase: 'bg-blue-600',
      kraken: 'bg-purple-600',
      bybit: 'bg-orange-600',
      bitfinex: 'bg-green-600'
    };
    return colors[exchange as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-400" />
          Trading Accounts
        </CardTitle>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showCreateForm && (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Account Name</label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Trading Account"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Account Type</label>
                  <Select value={newAccount.type} onValueChange={(value: 'paper' | 'live') => setNewAccount(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Paper Trading</SelectItem>
                      <SelectItem value="live">Live Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Exchange</label>
                  <Select value={newAccount.exchange} onValueChange={(value) => setNewAccount(prev => ({ ...prev, exchange: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="coinbase">Coinbase</SelectItem>
                      <SelectItem value="kraken">Kraken</SelectItem>
                      <SelectItem value="bybit">Bybit</SelectItem>
                      <SelectItem value="bitfinex">Bitfinex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Initial Balance ($)</label>
                  <Input
                    type="number"
                    value={newAccount.initialBalance}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, initialBalance: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createAccount} className="bg-green-600 hover:bg-green-700">
                  Create Account
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getExchangeColor(account.exchange)}>
                        {account.exchange.toUpperCase()}
                      </Badge>
                      <Badge className={account.type === 'paper' ? 'bg-blue-600' : 'bg-purple-600'}>
                        {account.type.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Account Name</div>
                    <div className="text-white font-medium">{account.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-white font-bold flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {account.balance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">P&L</div>
                    <div className={`font-bold flex items-center gap-1 ${account.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <TrendingUp className="h-4 w-4" />
                      ${account.pnl.toFixed(2)} ({account.pnl_percentage.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Created: {new Date(account.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
