
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Download, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'fee' | 'dividend';
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  exchange: string;
  account: string;
  timestamp: string;
  orderId?: string;
  notes?: string;
}

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch transactions
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('user_orders')
        .select(`
          *,
          trading_pairs (symbol, base_asset, quote_asset),
          trading_accounts (exchange, account_type)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data;
    }
  });

  const { data: executionsData } = useQuery({
    queryKey: ['trade-executions'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('trade_executions')
        .select(`
          *,
          trading_pairs (symbol, base_asset, quote_asset),
          user_orders (order_type, status)
        `)
        .eq('user_id', user.user.id)
        .order('executed_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    // Combine orders and executions into transaction format
    const allTransactions: Transaction[] = [];

    // Add orders as transactions
    ordersData?.forEach(order => {
      allTransactions.push({
        id: order.id,
        type: order.side as 'buy' | 'sell',
        symbol: order.trading_pairs?.symbol || 'N/A',
        quantity: order.quantity || 0,
        price: order.price || 0,
        total: (order.quantity || 0) * (order.price || 0),
        fee: order.fees || 0,
        status: order.status as any,
        exchange: order.trading_accounts?.exchange || 'Unknown',
        account: order.trading_accounts?.account_type || 'Unknown',
        timestamp: order.created_at || '',
        orderId: order.id,
        notes: `${order.order_type} order`
      });
    });

    // Add executions as transactions
    executionsData?.forEach(execution => {
      allTransactions.push({
        id: execution.id,
        type: execution.side as 'buy' | 'sell',
        symbol: execution.trading_pairs?.symbol || 'N/A',
        quantity: execution.quantity || 0,
        price: execution.price || 0,
        total: (execution.quantity || 0) * (execution.price || 0),
        fee: execution.fees || 0,
        status: 'completed',
        exchange: 'Binance', // Default since executions don't have exchange info
        account: 'Paper Trading',
        timestamp: execution.executed_at || '',
        orderId: execution.order_id || undefined,
        notes: `Executed trade - P&L: $${execution.profit_loss || 0}`
      });
    });

    // Sort by timestamp
    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setTransactions(allTransactions);
  }, [ordersData, executionsData]);

  useEffect(() => {
    let filtered = [...transactions];

    // Apply filters
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    if (exchangeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.exchange === exchangeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, typeFilter, statusFilter, exchangeFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Symbol', 'Quantity', 'Price', 'Total', 'Fee', 'Status', 'Exchange', 'Account', 'Order ID', 'Notes'].join(','),
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleString(),
        tx.type,
        tx.symbol,
        tx.quantity,
        tx.price,
        tx.total,
        tx.fee,
        tx.status,
        tx.exchange,
        tx.account,
        tx.orderId || '',
        `"${tx.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
  };

  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalFees = filteredTransactions.reduce((sum, tx) => sum + tx.fee, 0);
  const buyTransactions = filteredTransactions.filter(tx => tx.type === 'buy').length;
  const sellTransactions = filteredTransactions.filter(tx => tx.type === 'sell').length;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
          <span>Transaction History</span>
          <Button onClick={exportTransactions} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400">Total Transactions</div>
            <div className="text-lg font-bold text-white">{filteredTransactions.length}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400">Total Volume</div>
            <div className="text-lg font-bold text-white">${totalVolume.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400">Total Fees</div>
            <div className="text-lg font-bold text-white">${totalFees.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400">Buy/Sell Ratio</div>
            <div className="text-lg font-bold text-white">{buyTransactions}/{sellTransactions}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="bg-gray-800 border-gray-600 text-white pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exchanges</SelectItem>
              <SelectItem value="Binance">Binance</SelectItem>
              <SelectItem value="Coinbase">Coinbase</SelectItem>
              <SelectItem value="Kraken">Kraken</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setStatusFilter('all');
              setExchangeFilter('all');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead 
                  className="text-gray-300 cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-1">
                    Date/Time
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-gray-300 text-right">Quantity</TableHead>
                <TableHead className="text-gray-300 text-right">Price</TableHead>
                <TableHead className="text-gray-300 text-right">Total</TableHead>
                <TableHead className="text-gray-300 text-right">Fee</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Exchange</TableHead>
                <TableHead className="text-gray-300">Account</TableHead>
                <TableHead className="text-gray-300">Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-700">
                    <TableCell colSpan={11} className="text-center text-gray-400 py-8">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={11} className="text-center text-gray-400 py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-white capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">{transaction.symbol}</TableCell>
                    <TableCell className="text-white text-right">{transaction.quantity.toFixed(6)}</TableCell>
                    <TableCell className="text-white text-right">${transaction.price.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right font-medium">
                      ${transaction.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-400 text-right">
                      ${transaction.fee.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{transaction.exchange}</TableCell>
                    <TableCell className="text-gray-300">{transaction.account}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {transaction.orderId?.slice(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
