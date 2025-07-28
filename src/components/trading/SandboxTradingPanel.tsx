import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TestTube, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SandboxTest {
  id: string;
  name: string;
  type: 'order_execution' | 'risk_management' | 'portfolio_sync' | 'data_feed';
  status: 'idle' | 'running' | 'passed' | 'failed';
  description: string;
  lastRun?: Date;
  result?: string;
}

export const SandboxTradingPanel: React.FC = () => {
  const { toast } = useToast();
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string>('binance-testnet');
  const [testAmount, setTestAmount] = useState('100');
  
  const [sandboxTests, setSandboxTests] = useState<SandboxTest[]>([
    {
      id: 'order-exec',
      name: 'Order Execution Test',
      type: 'order_execution',
      status: 'idle',
      description: 'Test buy/sell order placement and execution'
    },
    {
      id: 'risk-mgmt',
      name: 'Risk Management Test',
      type: 'risk_management',
      status: 'idle',
      description: 'Test stop-loss and position size limits'
    },
    {
      id: 'portfolio-sync',
      name: 'Portfolio Sync Test',
      type: 'portfolio_sync',
      status: 'idle',
      description: 'Test real-time portfolio balance updates'
    },
    {
      id: 'data-feed',
      name: 'Data Feed Test',
      type: 'data_feed',
      status: 'idle',
      description: 'Test market data streaming and accuracy'
    }
  ]);

  const sandboxExchanges = [
    { id: 'binance-testnet', name: 'Binance Testnet', status: 'available' },
    { id: 'coinbase-sandbox', name: 'Coinbase Pro Sandbox', status: 'available' },
    { id: 'kraken-demo', name: 'Kraken Demo', status: 'maintenance' }
  ];

  const runTest = async (testId: string) => {
    setSandboxTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'running' }
          : test
      )
    );

    // Simulate test execution
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setSandboxTests(prev => 
        prev.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                status: success ? 'passed' : 'failed',
                lastRun: new Date(),
                result: success ? 'Test completed successfully' : 'Test failed - check configuration'
              }
            : test
        )
      );
      
      toast({
        title: success ? "Test Passed" : "Test Failed",
        description: `${sandboxTests.find(t => t.id === testId)?.name} ${success ? 'completed successfully' : 'failed'}`,
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const runAllTests = async () => {
    for (const test of sandboxTests) {
      await new Promise(resolve => {
        runTest(test.id);
        setTimeout(resolve, 2500);
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-600';
      case 'passed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Sandbox Trading Environment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sandbox Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <Label htmlFor="sandbox-mode" className="text-white font-medium">
              Sandbox Testing Mode
            </Label>
            <p className="text-sm text-gray-400">
              Enable safe testing environment with virtual funds
            </p>
          </div>
          <Switch
            id="sandbox-mode"
            checked={isTestingMode}
            onCheckedChange={setIsTestingMode}
          />
        </div>

        {isTestingMode && (
          <>
            {/* Exchange Selection */}
            <div className="space-y-4">
              <Label className="text-white">Select Sandbox Exchange</Label>
              <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Choose exchange" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {sandboxExchanges.map((exchange) => (
                    <SelectItem 
                      key={exchange.id} 
                      value={exchange.id}
                      disabled={exchange.status === 'maintenance'}
                    >
                      <div className="flex items-center gap-2">
                        {exchange.name}
                        <Badge 
                          className={exchange.status === 'available' ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {exchange.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Configuration */}
            <div className="space-y-4">
              <Label className="text-white">Test Amount (USD)</Label>
              <Input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter test amount"
              />
            </div>

            {/* Test Suite */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Test Suite</h3>
                <Button 
                  onClick={runAllTests}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={sandboxTests.some(test => test.status === 'running')}
                >
                  Run All Tests
                </Button>
              </div>

              <div className="space-y-3">
                {sandboxTests.map((test) => (
                  <Card key={test.id} className="bg-gray-800 border-gray-600">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h4 className="text-white font-medium">{test.name}</h4>
                            <p className="text-sm text-gray-400">{test.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(test.status)}>
                            {test.status.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTest(test.id)}
                            disabled={test.status === 'running'}
                          >
                            {test.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {test.lastRun && (
                        <div className="mt-3 text-sm text-gray-400">
                          Last run: {test.lastRun.toLocaleString()}
                          {test.result && (
                            <div className={`mt-1 ${test.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}>
                              {test.result}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Warning */}
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                <strong>Sandbox Environment:</strong> All trades are simulated using test funds. 
                No real money or cryptocurrency will be used.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};