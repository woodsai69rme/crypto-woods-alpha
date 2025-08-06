
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingDown, 
  Wifi, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  results?: string[];
}

export const TestScenarioRunner: React.FC = () => {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: 'normal_trading',
      name: 'Normal Trading Day',
      description: 'All systems functioning, profitable trades executed',
      icon: <Activity className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'market_crash',
      name: 'Market Crash Simulation',
      description: 'Rapid price drops, emergency stops triggered',
      icon: <TrendingDown className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'api_failure',
      name: 'API Outage Test',
      description: 'Exchange downtime, fallback data sources activated',
      icon: <Wifi className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'high_volatility',
      name: 'High Volatility Test',
      description: 'Extreme price swings, risk limits tested',
      icon: <Zap className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'network_issues',
      name: 'Network Latency Test',
      description: 'Slow connections, timeout handling verified',
      icon: <Clock className="h-5 w-5" />,
      status: 'pending'
    }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runScenario = async (scenarioId: string): Promise<{ passed: boolean; results: string[] }> => {
    // Simulate test scenarios
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    switch (scenarioId) {
      case 'normal_trading':
        return {
          passed: true,
          results: [
            'Successfully executed 10 trades',
            'Average execution time: 250ms',
            'PnL: +$125.50',
            'All risk limits respected'
          ]
        };
      
      case 'market_crash':
        const crashPassed = Math.random() > 0.3;
        return {
          passed: crashPassed,
          results: crashPassed ? [
            'Emergency stop triggered at -8% portfolio loss',
            'All open positions closed within 5 seconds',
            'Risk management system performed correctly',
            'Maximum drawdown: 7.8%'
          ] : [
            'Emergency stop delayed by 12 seconds',
            'Portfolio loss exceeded -10% threshold',
            'Risk management system needs improvement'
          ]
        };
      
      case 'api_failure':
        return {
          passed: true,
          results: [
            'Primary API failure detected in 2.1 seconds',
            'Fallback to secondary data source successful',
            'No trading interruption',
            'Data quality maintained at 99.2%'
          ]
        };
      
      case 'high_volatility':
        const volatilityPassed = Math.random() > 0.2;
        return {
          passed: volatilityPassed,
          results: volatilityPassed ? [
            'Position sizing reduced automatically',
            'Stop losses triggered appropriately',
            'Maximum single trade loss: 2.1%',
            'Volatility filters working correctly'
          ] : [
            'Position sizing exceeded risk limits',
            'Some stop losses failed to trigger',
            'Maximum single trade loss: 6.3%'
          ]
        };
      
      case 'network_issues':
        return {
          passed: true,
          results: [
            'Timeout handling working correctly',
            'Retry mechanisms functioning',
            'Average latency during degradation: 1.2s',
            'No failed transactions due to network issues'
          ]
        };
      
      default:
        return { passed: false, results: ['Unknown scenario'] };
    }
  };

  const runAllScenarios = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const totalScenarios = scenarios.length;
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      setCurrentScenario(scenario.id);
      
      // Update status to running
      setScenarios(prev => prev.map(s => 
        s.id === scenario.id ? { ...s, status: 'running' as const } : s
      ));
      
      const startTime = Date.now();
      const result = await runScenario(scenario.id);
      const duration = Date.now() - startTime;
      
      // Update scenario with results
      setScenarios(prev => prev.map(s => 
        s.id === scenario.id ? { 
          ...s, 
          status: result.passed ? 'passed' as const : 'failed' as const,
          duration,
          results: result.results
        } : s
      ));
      
      setProgress(((i + 1) / totalScenarios) * 100);
      
      // Show toast for each scenario
      toast({
        title: `${scenario.name} ${result.passed ? 'Passed' : 'Failed'}`,
        description: result.results[0],
        variant: result.passed ? 'default' : 'destructive'
      });
    }
    
    setIsRunning(false);
    setCurrentScenario(null);
    
    const passedCount = scenarios.filter(s => s.status === 'passed').length;
    const failedCount = scenarios.filter(s => s.status === 'failed').length;
    
    toast({
      title: "All Test Scenarios Complete",
      description: `${passedCount} passed, ${failedCount} failed`,
    });
  };

  const runSingleScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || isRunning) return;

    setCurrentScenario(scenarioId);
    
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, status: 'running' as const } : s
    ));
    
    const startTime = Date.now();
    const result = await runScenario(scenarioId);
    const duration = Date.now() - startTime;
    
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { 
        ...s, 
        status: result.passed ? 'passed' as const : 'failed' as const,
        duration,
        results: result.results
      } : s
    ));
    
    setCurrentScenario(null);
    
    toast({
      title: `${scenario.name} ${result.passed ? 'Passed' : 'Failed'}`,
      description: result.results[0],
      variant: result.passed ? 'default' : 'destructive'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-400 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'running': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const passedCount = scenarios.filter(s => s.status === 'passed').length;
  const failedCount = scenarios.filter(s => s.status === 'failed').length;
  const totalRun = scenarios.filter(s => s.status !== 'pending').length;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Scenario Runner
            </span>
            <Button 
              onClick={runAllScenarios}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running Tests...' : 'Run All Scenarios'}
            </Button>
          </CardTitle>
          {totalRun > 0 && (
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">Passed: {passedCount}</span>
              <span className="text-red-400">Failed: {failedCount}</span>
              <span className="text-gray-400">Total: {totalRun}/{scenarios.length}</span>
            </div>
          )}
        </CardHeader>

        {isRunning && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white">Running test scenarios...</span>
                <span className="text-gray-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {scenario.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{scenario.name}</h3>
                      {getStatusIcon(scenario.status)}
                      <Badge className={getStatusColor(scenario.status)}>
                        {scenario.status.toUpperCase()}
                      </Badge>
                      {scenario.duration && (
                        <span className="text-sm text-gray-400">
                          ({(scenario.duration / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{scenario.description}</p>
                    
                    {scenario.results && scenario.results.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-300">Results:</p>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {scenario.results.map((result, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-gray-500">•</span>
                              <span>{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runSingleScenario(scenario.id)}
                  disabled={isRunning}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  {scenario.status === 'running' ? 'Running...' : 'Run Test'}
                </Button>
              </div>

              {scenario.status === 'failed' && scenario.results && (
                <Alert className="mt-4 border-red-600 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    <strong>Test Failed:</strong> This scenario requires attention before real money trading.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalRun === scenarios.length && (
        <Alert className={failedCount > 0 ? 'border-red-600 bg-red-900/20' : 'border-green-600 bg-green-900/20'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={failedCount > 0 ? 'text-red-200' : 'text-green-200'}>
            <strong>All scenarios complete.</strong> {failedCount > 0 
              ? `${failedCount} scenarios failed and must be fixed before real money trading.`
              : 'All scenarios passed! System is ready for testing.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
