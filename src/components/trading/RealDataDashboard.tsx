import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { RealMarketDataService } from '@/services/realMarketDataService';
import { TradingAuditService } from '@/services/tradingAuditService';
import { SecurityHardeningPanel } from './SecurityHardeningPanel';
import { CompliancePlanningPanel } from './CompliancePlanningPanel';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  marketHealth: 'healthy' | 'degraded' | 'critical';
  activePairs: number;
  totalPairs: number;
  lastUpdate: string;
  dataSource: string;
  auditScore: number;
  securityScore: number;
}

export const RealDataDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    marketHealth: 'critical',
    activePairs: 0,
    totalPairs: 0,
    lastUpdate: 'Never',
    dataSource: 'Unknown',
    auditScore: 0,
    securityScore: 0
  });
  const [auditResults, setAuditResults] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get market status
      const marketStatus = await RealMarketDataService.getMarketStatus();
      
      // Run system audit if user is authenticated
      let auditSummary = null;
      if (user) {
        const fullAudit = await TradingAuditService.runSystemAudit();
        auditSummary = fullAudit.summary;
        setAuditResults(fullAudit);
      }

      // Calculate scores
      const auditScore = auditSummary ? 
        Math.round((auditSummary.passedPortfolios + auditSummary.passedTrades) / 
        (auditSummary.totalPortfolios + auditSummary.totalTrades + 0.01) * 100) : 0;

      // Mock security score (in real app, this would come from security scan)
      const securityScore = 85;

      setStats({
        marketHealth: marketStatus.healthStatus,
        activePairs: marketStatus.activePairs,
        totalPairs: marketStatus.totalPairs,
        lastUpdate: marketStatus.lastUpdate,
        dataSource: marketStatus.dataSource,
        auditScore,
        securityScore
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    setLoading(true);
    try {
      await RealMarketDataService.initializeRealDataFeeds();
      await loadDashboardData();
    } catch (error) {
      console.error('System initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await RealMarketDataService.forceRefresh();
      await loadDashboardData();
    } catch (error) {
      console.error('Data refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy': return <Badge variant="default">Healthy</Badge>;
      case 'degraded': return <Badge variant="secondary">Degraded</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Real Data & System Management
          </h1>
          <p className="text-muted-foreground">
            Monitor real-time data feeds, security posture, and system health
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={initializeSystem} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            Initialize System
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getHealthColor(stats.marketHealth)}`}>
                {stats.marketHealth.toUpperCase()}
              </div>
              {getHealthBadge(stats.marketHealth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activePairs}/{stats.totalPairs} pairs active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auditScore}%</div>
            <Progress value={stats.auditScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Calculation accuracy score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityScore}%</div>
            <Progress value={stats.securityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Security posture rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.lastUpdate !== 'Never' 
                ? new Date(stats.lastUpdate).toLocaleTimeString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.dataSource}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      {stats.marketHealth === 'critical' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical System Status:</strong> Market data feeds are not operational. 
            Initialize the system to begin receiving real-time data feeds from multiple exchanges.
          </AlertDescription>
        </Alert>
      )}

      {!user && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Authentication Required:</strong> Please sign in to access portfolio audits and full system management features.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Data Status</CardTitle>
                <CardDescription>Real-time data feed monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Health Status</span>
                    <span className={getHealthColor(stats.marketHealth)}>
                      {stats.marketHealth.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Trading Pairs</span>
                    <span>{stats.activePairs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Pairs</span>
                    <span>{stats.totalPairs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Sources</span>
                    <span>Multi-exchange</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Update Frequency</span>
                    <span>30 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Data Quality</span>
                      <span>{stats.auditScore}%</span>
                    </div>
                    <Progress value={stats.auditScore} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Security Score</span>
                      <span>{stats.securityScore}%</span>
                    </div>
                    <Progress value={stats.securityScore} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Uptime</span>
                      <span>99.5%</span>
                    </div>
                    <Progress value={99.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {auditResults && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Audit Summary</CardTitle>
                <CardDescription>Portfolio and trade validation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {auditResults.summary.passedPortfolios}
                    </div>
                    <div className="text-sm text-muted-foreground">Passed Portfolios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {auditResults.summary.failedPortfolios}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed Portfolios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {auditResults.summary.passedTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">Valid Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {auditResults.summary.failedTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed Trades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security">
          <SecurityHardeningPanel />
        </TabsContent>

        <TabsContent value="compliance">
          <CompliancePlanningPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Configuration</CardTitle>
                  <CardDescription>System audit parameters and tolerances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Tolerance</div>
                      <div className="text-2xl font-bold">±1%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Fee Rate</div>
                      <div className="text-2xl font-bold">0.1%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Audit Frequency</div>
                      <div className="text-2xl font-bold">Real-time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {auditResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Audit Results</h3>
                  
                  {auditResults.portfolioAudits.map((audit: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Portfolio Audit</CardTitle>
                          <Badge variant={audit.overallStatus === 'PASS' ? 'default' : audit.overallStatus === 'WARNING' ? 'secondary' : 'destructive'}>
                            {audit.overallStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Total Value</div>
                            <div className={audit.totalValue.status === 'PASS' ? 'text-green-600' : 'text-red-600'}>
                              {audit.totalValue.status}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">P&L</div>
                            <div className={audit.totalPnL.status === 'PASS' ? 'text-green-600' : 'text-red-600'}>
                              {audit.totalPnL.status}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Holdings</div>
                            <div>{audit.holdingsCount}</div>
                          </div>
                          <div>
                            <div className="font-medium">Updated</div>
                            <div>{new Date(audit.lastUpdated).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Please sign in to view detailed audit results and portfolio validation data.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};