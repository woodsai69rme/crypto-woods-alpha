
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  BarChart3,
  Shield,
  Database
} from 'lucide-react';
import { RealMarketDataService } from '@/services/realMarketDataService';
import { TradingAuditService } from '@/services/tradingAuditService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RealTimePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
}

interface MarketDataValidation {
  isValid: boolean;
  dataAge: number;
  source: string;
  confidence: number;
  errors: string[];
}

export const RealDataDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [realTimePrices, setRealTimePrices] = useState<RealTimePrice[]>([]);
  const [validation, setValidation] = useState<MarketDataValidation | null>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Load real-time market data
  const loadRealTimeData = async () => {
    setIsLoadingPrices(true);
    try {
      const { data, validation: dataValidation } = await RealMarketDataService.getRealTimePrices();
      setRealTimePrices(data);
      setValidation(dataValidation);
      
      if (dataValidation.errors.length > 0) {
        toast({
          title: "Data Validation Issues",
          description: `${dataValidation.errors.length} validation errors detected`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Real Data Load Failed",
        description: "Could not load real market data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Run comprehensive trading audit
  const runTradingAudit = async () => {
    if (!user?.id) return;
    
    setIsRunningAudit(true);
    try {
      const results = await TradingAuditService.performFullTradingAudit(user.id);
      setAuditResults(results);
      
      toast({
        title: "Trading Audit Complete",
        description: `Status: ${results.overallStatus} - ${results.results.length} checks performed`,
        variant: results.overallStatus === 'PASS' ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: "Audit Failed",
        description: "Could not complete trading audit",
        variant: "destructive",
      });
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Initialize real-time WebSocket connection
  useEffect(() => {
    const ws = RealMarketDataService.initializeRealTimeUpdates((price) => {
      setRealTimePrices(prev => {
        const updated = prev.map(p => p.symbol === price.symbol ? price : p);
        const exists = prev.some(p => p.symbol === price.symbol);
        return exists ? updated : [...prev, price];
      });
    });
    
    setWsConnection(ws);
    
    // Load initial data
    loadRealTimeData();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'FAIL': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-600';
      case 'WARNING': return 'bg-yellow-600';
      case 'FAIL': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Market Data */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Live Real Market Data
            {wsConnection && <Badge className="bg-green-600 text-white animate-pulse">LIVE</Badge>}
          </CardTitle>
          <Button 
            onClick={loadRealTimeData} 
            disabled={isLoadingPrices}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPrices ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Data Validation Status */}
          {validation && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">Data Validation</h4>
                <Badge className={validation.isValid ? 'bg-green-600' : 'bg-red-600'}>
                  {validation.isValid ? 'VALID' : 'ISSUES DETECTED'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Data Age</div>
                  <div className="text-sm font-bold text-white">{validation.dataAge}s</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Source</div>
                  <div className="text-sm font-bold text-white capitalize">{validation.source}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="flex items-center gap-2">
                    <Progress value={validation.confidence * 100} className="flex-1" />
                    <span className="text-sm font-bold text-white">{(validation.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Errors</div>
                  <div className="text-sm font-bold text-red-400">{validation.errors.length}</div>
                </div>
              </div>
              {validation.errors.length > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Validation Issues: {validation.errors.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Live Price Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {realTimePrices.map((price) => (
              <div key={price.symbol} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{price.symbol.replace('USDT', '')}</span>
                  {price.change24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="text-lg font-bold text-white">
                  ${price.price.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: price.price < 1 ? 4 : 2 
                  })}
                </div>
                <div className={`text-sm ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Vol: ${(price.volume24h / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(price.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Audit Results */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Trading Figures Audit
          </CardTitle>
          <Button 
            onClick={runTradingAudit} 
            disabled={isRunningAudit || !user?.id}
            variant="outline" 
            size="sm"
          >
            <BarChart3 className={`h-4 w-4 mr-2 ${isRunningAudit ? 'animate-spin' : ''}`} />
            {isRunningAudit ? 'Auditing...' : 'Run Audit'}
          </Button>
        </CardHeader>
        
        <CardContent>
          {auditResults ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(auditResults.overallStatus)}
                  <div>
                    <h4 className="text-lg font-semibold text-white">Overall Audit Status</h4>
                    <p className="text-gray-400">Comprehensive trading calculations validation</p>
                  </div>
                </div>
                <Badge className={getStatusColor(auditResults.overallStatus)}>
                  {auditResults.overallStatus}
                </Badge>
              </div>

              {/* Portfolio Summary */}
              {auditResults.portfolioAudit && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Portfolio Audit Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Total Value</div>
                      <div className="text-lg font-bold text-green-400">
                        ${auditResults.portfolioAudit.totalValue?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Total Invested</div>
                      <div className="text-lg font-bold text-white">
                        ${auditResults.portfolioAudit.totalInvested?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Unrealized P&L</div>
                      <div className={`text-lg font-bold ${
                        (auditResults.portfolioAudit.unrealizedPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${auditResults.portfolioAudit.unrealizedPnL?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">P&L %</div>
                      <div className={`text-lg font-bold ${
                        (auditResults.portfolioAudit.pnlPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {auditResults.portfolioAudit.pnlPercentage?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Audit Results */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">Detailed Validation Results</h4>
                {auditResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="text-white font-medium">{result.category.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-400">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(result.status)} variant="outline">
                        {result.status}
                      </Badge>
                      {result.actualValue !== undefined && (
                        <div className="text-xs text-gray-400 mt-1">
                          Value: {typeof result.actualValue === 'number' ? result.actualValue.toFixed(2) : result.actualValue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Figure Validation Summary */}
              {auditResults.figureValidation && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Figure Validation Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(auditResults.figureValidation).map(([key, isValid]) => (
                      <div key={key} className="flex items-center gap-2">
                        {isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-white">{key.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-white mb-2">No Audit Results</h3>
              <p className="text-gray-400 mb-4">
                Run a comprehensive audit to validate all trading calculations and figures.
              </p>
              {!user?.id && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please log in to run trading audit.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
