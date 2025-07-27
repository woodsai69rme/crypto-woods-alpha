import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Play, Pause, RefreshCw, Bug } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  duration: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'running' | 'idle';
}

export const TestingPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Trading Engine Tests',
      status: 'idle',
      tests: [
        { name: 'Order Placement', status: 'passed', duration: 125 },
        { name: 'Price Calculation', status: 'passed', duration: 89 },
        { name: 'Risk Management', status: 'warning', duration: 234, details: 'Position size calculation slightly off' },
        { name: 'Order Cancellation', status: 'passed', duration: 67 },
      ]
    },
    {
      name: 'AI Bot Tests',
      status: 'idle',
      tests: [
        { name: 'Signal Generation', status: 'passed', duration: 456 },
        { name: 'Strategy Execution', status: 'failed', duration: 678, error: 'Memory allocation error' },
        { name: 'Performance Metrics', status: 'passed', duration: 234 },
        { name: 'Risk Assessment', status: 'passed', duration: 123 },
      ]
    },
    {
      name: 'Market Data Tests',
      status: 'idle',
      tests: [
        { name: 'Real-time Feed', status: 'passed', duration: 78 },
        { name: 'Historical Data', status: 'passed', duration: 156 },
        { name: 'Price Aggregation', status: 'passed', duration: 234 },
        { name: 'Latency Check', status: 'warning', duration: 345, details: 'Average latency 150ms (target: 100ms)' },
      ]
    },
    {
      name: 'Security Tests',
      status: 'idle',
      tests: [
        { name: 'Authentication', status: 'passed', duration: 234 },
        { name: 'API Rate Limiting', status: 'passed', duration: 123 },
        { name: 'Data Encryption', status: 'passed', duration: 456 },
        { name: 'Access Control', status: 'passed', duration: 189 },
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Update all suites to running status
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'running' as const
    })));

    // Simulate test execution
    for (let i = 0; i < testSuites.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestSuites(prev => prev.map((suite, index) => {
        if (index === i) {
          const hasFailures = suite.tests.some(test => test.status === 'failed');
          const hasWarnings = suite.tests.some(test => test.status === 'warning');
          
          return {
            ...suite,
            status: hasFailures ? 'failed' as const : 'passed' as const
          };
        }
        return suite;
      }));
    }

    setIsRunning(false);
  };

  const runSuite = async (suiteName: string) => {
    setTestSuites(prev => prev.map(suite => 
      suite.name === suiteName ? { ...suite, status: 'running' as const } : suite
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    setTestSuites(prev => prev.map(suite => {
      if (suite.name === suiteName) {
        const hasFailures = suite.tests.some(test => test.status === 'failed');
        const hasWarnings = suite.tests.some(test => test.status === 'warning');
        
        return {
          ...suite,
          status: hasFailures ? 'failed' as const : 'passed' as const
        };
      }
      return suite;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      default: return <Bug className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'running': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'failed').length, 0
  );
  const warningTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'warning').length, 0
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-400" />
            Testing & Quality Assurance
            {isRunning && <Badge className="bg-blue-600 animate-pulse">RUNNING</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-300">{passedTests} Passed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-gray-300">{failedTests} Failed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span className="text-gray-300">{warningTests} Warnings</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Test Progress</span>
              <span className="text-white">{passedTests}/{totalTests} tests passed</span>
            </div>
            <Progress value={(passedTests / totalTests) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="ai">AI Bots</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.name} className="bg-gray-900 border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(suite.status)}
                      <h3 className="font-bold text-white">{suite.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(suite.status)}>
                        {suite.status.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSuite(suite.name)}
                        disabled={isRunning}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {suite.tests.map((test, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded text-sm">
                        {getStatusIcon(test.status)}
                        <span className="text-gray-300 truncate">{test.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {testSuites.map((suite) => (
          <TabsContent key={suite.name} value={suite.name.toLowerCase().split(' ')[0]}>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  {getStatusIcon(suite.status)}
                  {suite.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium text-white">{test.name}</p>
                          {test.error && (
                            <p className="text-sm text-red-400">{test.error}</p>
                          )}
                          {test.details && (
                            <p className="text-sm text-yellow-400">{test.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-white font-medium">{test.duration}ms</p>
                        </div>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
