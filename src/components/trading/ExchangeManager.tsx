
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExchangeService } from '@/services/exchangeService';
import { Zap, Settings, CheckCircle, AlertCircle, Activity } from 'lucide-react';

export const ExchangeManager: React.FC = () => {
  const [connections, setConnections] = useState([
    {
      id: '1',
      exchange: 'binance',
      name: 'Binance Main',
      status: 'connected',
      type: 'live',
      balance: 15420.50,
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      exchange: 'coinbase',
      name: 'Coinbase Pro',
      status: 'disconnected',
      type: 'live',
      balance: 0,
      lastSync: null
    }
  ]);

  const [newConnection, setNewConnection] = useState({
    exchange: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    sandbox: true
  });

  const handleTestConnection = async (exchangeId: string) => {
    console.log('Testing connection for exchange:', exchangeId);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnections(prev => prev.map(conn => 
      conn.id === exchangeId 
        ? { ...conn, status: 'connected', lastSync: new Date().toISOString() }
        : conn
    ));
  };

  const handleAddConnection = async () => {
    try {
      const success = await ExchangeService.testConnection(newConnection.exchange, {
        apiKey: newConnection.apiKey,
        apiSecret: newConnection.apiSecret,
        passphrase: newConnection.passphrase,
        sandbox: newConnection.sandbox
      });

      if (success) {
        const newConn = {
          id: Date.now().toString(),
          exchange: newConnection.exchange,
          name: `${newConnection.exchange} Account`,
          status: 'connected',
          type: newConnection.sandbox ? 'paper' : 'live',
          balance: newConnection.sandbox ? 10000 : 0,
          lastSync: new Date().toISOString()
        };

        setConnections(prev => [...prev, newConn]);
        setNewConnection({ exchange: '', apiKey: '', apiSecret: '', passphrase: '', sandbox: true });
      }
    } catch (error) {
      console.error('Failed to add connection:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'connecting': return <Activity className="h-4 w-4 text-yellow-400 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Exchange Connections
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="connections">Active Connections</TabsTrigger>
            <TabsTrigger value="add">Add Exchange</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4">
            {connections.map((conn) => (
              <Card key={conn.id} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`/api/placeholder/32/32`}
                        alt={conn.exchange}
                        className="w-8 h-8 rounded"
                      />
                      <div>
                        <h3 className="text-white font-medium">{conn.name}</h3>
                        <p className="text-sm text-gray-400">{conn.exchange.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conn.status)}
                      <Badge variant={conn.type === 'live' ? 'default' : 'outline'}>
                        {conn.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Balance</div>
                      <div className="text-lg font-bold text-white">
                        ${conn.balance.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Last Sync</div>
                      <div className="text-sm text-white">
                        {conn.lastSync ? new Date(conn.lastSync).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTestConnection(conn.id)}
                      disabled={conn.status === 'connecting'}
                    >
                      Test Connection
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Exchange</label>
                <select
                  value={newConnection.exchange}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, exchange: e.target.value }))}
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">Select Exchange</option>
                  <option value="binance">Binance</option>
                  <option value="coinbase">Coinbase Pro</option>
                  <option value="kraken">Kraken</option>
                  <option value="bitfinex">Bitfinex</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">API Key</label>
                <Input
                  type="text"
                  value={newConnection.apiKey}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">API Secret</label>
                <Input
                  type="password"
                  value={newConnection.apiSecret}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, apiSecret: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your API secret"
                />
              </div>

              {newConnection.exchange === 'coinbase' && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Passphrase</label>
                  <Input
                    type="password"
                    value={newConnection.passphrase}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, passphrase: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter your passphrase"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Sandbox Mode (Paper Trading)</span>
                <Switch
                  checked={newConnection.sandbox}
                  onCheckedChange={(checked) => setNewConnection(prev => ({ ...prev, sandbox: checked }))}
                />
              </div>

              <Button
                onClick={handleAddConnection}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!newConnection.exchange || !newConnection.apiKey || !newConnection.apiSecret}
              >
                Add Exchange Connection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
