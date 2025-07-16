
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Download, Filter, Clock, User, Activity } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

export const AuditTrail: React.FC = () => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Simulate real-time audit data
    const generateAuditEntry = (): AuditEntry => {
      const actions = ['CREATE_ORDER', 'CANCEL_ORDER', 'EXECUTE_TRADE', 'UPDATE_BOT', 'CREATE_ACCOUNT', 'LOGIN', 'LOGOUT', 'UPDATE_SETTINGS'];
      const resources = ['order', 'trade', 'bot', 'account', 'user', 'strategy'];
      const statuses: ('success' | 'failed' | 'warning')[] = ['success', 'failed', 'warning'];
      const users = ['user123', 'trader456', 'botmaster789', 'crypto_king'];
      
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      return {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        username: user,
        action,
        resource_type: resource,
        resource_id: `${resource}_${Math.random().toString(36).substr(2, 9)}`,
        old_values: action.includes('UPDATE') ? { status: 'active' } : undefined,
        new_values: action.includes('UPDATE') ? { status: 'paused' } : { amount: Math.random() * 1000 },
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status,
        details: `${action} performed on ${resource} successfully`
      };
    };

    // Generate initial entries
    const initialEntries = Array.from({ length: 50 }, generateAuditEntry);
    setAuditEntries(initialEntries);

    // Add new entries every 5 seconds to simulate real-time
    const interval = setInterval(() => {
      const newEntry = generateAuditEntry();
      setAuditEntries(prev => [newEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = auditEntries;

    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(entry => entry.action === actionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    setFilteredEntries(filtered);
  }, [auditEntries, searchQuery, actionFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('ORDER') || action.includes('TRADE')) return <Activity className="h-4 w-4" />;
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <User className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Username', 'Action', 'Resource', 'Status', 'IP Address', 'Details'].join(','),
      ...filteredEntries.map(entry => [
        entry.timestamp,
        entry.username,
        entry.action,
        entry.resource_type,
        entry.status,
        entry.ip_address,
        `"${entry.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" />
          Live Audit Trail
          <Badge className="bg-green-600 text-white animate-pulse">REAL-TIME</Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={exportAuditLog} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit logs..."
              className="bg-gray-800 border-gray-600 text-white pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE_ORDER">Create Order</SelectItem>
              <SelectItem value="EXECUTE_TRADE">Execute Trade</SelectItem>
              <SelectItem value="UPDATE_BOT">Update Bot</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {filteredEntries.length} entries
          </div>
        </div>

        {/* Audit Entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="bg-gray-800 border-gray-600">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.toUpperCase()}
                        </Badge>
                        <span className="text-white font-medium">{entry.action}</span>
                        <span className="text-gray-400">by</span>
                        <span className="text-blue-400">{entry.username}</span>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        {entry.details}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                        <div>
                          <span className="font-medium">Resource:</span> {entry.resource_type}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {entry.ip_address}
                        </div>
                        <div>
                          <span className="font-medium">ID:</span> {entry.resource_id.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {(entry.old_values || entry.new_values) && (
                        <div className="mt-2 text-xs">
                          <details className="text-gray-400">
                            <summary className="cursor-pointer hover:text-white">View Changes</summary>
                            <div className="mt-2 space-y-1">
                              {entry.old_values && (
                                <div>
                                  <span className="text-red-400">Old:</span> {JSON.stringify(entry.old_values)}
                                </div>
                              )}
                              {entry.new_values && (
                                <div>
                                  <span className="text-green-400">New:</span> {JSON.stringify(entry.new_values)}
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No audit entries found matching your filters
          </div>
        )}
      </CardContent>
    </Card>
  );
};
