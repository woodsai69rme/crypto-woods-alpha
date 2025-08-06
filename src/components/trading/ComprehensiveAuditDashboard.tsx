
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Play,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveAuditService } from '@/services/comprehensiveAuditService';

interface AuditResult {
  id: string;
  auditArea: string;
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'CRITICAL';
  score: number;
  notes: string[];
  recommendations: string[];
  timestamp: string;
}

interface GoNoGoAssessment {
  ready_for_real_money: boolean;
  main_issues: string[];
  recommended_fixes: string[];
  simulated_roi: string;
  data_integrity: 'High' | 'Medium' | 'Low';
  security_grade: number;
  final_recommendation: 'GO' | 'NO-GO';
  detailed_scores: {
    security: number;
    accuracy: number;
    stability: number;
    profitability: number;
    risk_protection: number;
  };
}

export const ComprehensiveAuditDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [assessment, setAssessment] = useState<GoNoGoAssessment | null>(null);
  const [exports, setExports] = useState<{ csv: string, json: string, markdown: string } | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const runFullAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    setStartTime(new Date());
    setAuditResults([]);
    setAssessment(null);
    setExports(null);

    try {
      // Phase 1: System Diagnostics
      setCurrentPhase('System Diagnostics');
      setProgress(10);
      const diagnostics = await ComprehensiveAuditService.runSystemDiagnostics();
      setAuditResults(prev => [...prev, ...diagnostics]);
      setProgress(25);

      // Phase 2: Data Integrity
      setCurrentPhase('Data Integrity Check');
      const dataIntegrity = await ComprehensiveAuditService.runDataIntegrityCheck();
      setAuditResults(prev => [...prev, ...dataIntegrity]);
      setProgress(45);

      // Phase 3: Strategy Validation
      setCurrentPhase('Strategy Validation');
      const strategies = await ComprehensiveAuditService.runStrategyValidation();
      setAuditResults(prev => [...prev, ...strategies]);
      setProgress(65);

      // Phase 4: Simulated Trading
      setCurrentPhase('Simulated Trading Session');
      const trading = await ComprehensiveAuditService.runSimulatedTrading();
      setAuditResults(prev => [...prev, ...trading.results]);
      setProgress(80);

      // Phase 5: Security Audit
      setCurrentPhase('Security & Fault Tolerance');
      const security = await ComprehensiveAuditService.runSecurityAudit();
      setAuditResults(prev => [...prev, ...security]);
      setProgress(95);

      // Generate Assessment
      setCurrentPhase('Generating Final Assessment');
      const fullAudit = await ComprehensiveAuditService.runFullAudit();
      setAssessment(fullAudit.assessment);
      setExports(fullAudit.exports);
      setProgress(100);

      toast({
        title: "Audit Complete!",
        description: `Final recommendation: ${fullAudit.assessment.final_recommendation}`,
      });

    } catch (error) {
      toast({
        title: "Audit Failed",
        description: `Error: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentPhase('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'FAIL': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'CRITICAL': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-600';
      case 'WARNING': return 'bg-yellow-600';
      case 'FAIL': return 'bg-red-600';
      case 'CRITICAL': return 'bg-red-700';
      default: return 'bg-gray-600';
    }
  };

  const downloadExport = (format: 'csv' | 'json' | 'markdown') => {
    if (!exports) return;
    
    const content = exports[format];
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      markdown: 'text/markdown'
    };
    
    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto_audit_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const criticalCount = auditResults.filter(r => r.status === 'CRITICAL').length;
  const failCount = auditResults.filter(r => r.status === 'FAIL').length;
  const warningCount = auditResults.filter(r => r.status === 'WARNING').length;
  const passCount = auditResults.filter(r => r.status === 'PASS').length;

  const overallScore = auditResults.length > 0 ? 
    auditResults.reduce((sum, r) => sum + r.score, 0) / auditResults.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Comprehensive Crypto Trading Platform Audit
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-gray-400">
              {startTime && `Started: ${startTime.toLocaleTimeString()}`}
            </div>
            <Button 
              onClick={runFullAudit} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Audit...' : 'Start Full Audit'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      {isRunning && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{currentPhase}</span>
                <span className="text-gray-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Status */}
      {assessment && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overall Score</p>
                  <p className="text-2xl font-bold text-white">{overallScore.toFixed(1)}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Security Grade</p>
                  <p className="text-2xl font-bold text-white">{assessment.security_grade.toFixed(0)}</p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Simulated ROI</p>
                  <p className="text-2xl font-bold text-white">{assessment.simulated_roi}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Recommendation</p>
                  <Badge className={assessment.final_recommendation === 'GO' ? 'bg-green-600' : 'bg-red-600'}>
                    {assessment.final_recommendation}
                  </Badge>
                </div>
                <div className="h-8 w-8">
                  {assessment.ready_for_real_money ? 
                    <CheckCircle className="h-8 w-8 text-green-400" /> :
                    <XCircle className="h-8 w-8 text-red-400" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Summary */}
      {auditResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-900/20 border-green-600">
            <CardContent className="pt-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{passCount}</p>
              <p className="text-sm text-green-300">Passed</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/20 border-yellow-600">
            <CardContent className="pt-4 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
              <p className="text-sm text-yellow-300">Warnings</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-600">
            <CardContent className="pt-4 text-center">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{failCount}</p>
              <p className="text-sm text-red-300">Failed</p>
            </CardContent>
          </Card>

          <Card className="bg-red-900/30 border-red-700">
            <CardContent className="pt-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-sm text-red-400">Critical</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {auditResults.length > 0 && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="results">Audit Results</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="exports">Export & Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Detailed Audit Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditResults.map((result) => (
                    <Card key={result.id} className="bg-gray-800 border-gray-600">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <h4 className="text-white font-medium">{result.component}</h4>
                              <p className="text-sm text-gray-400">{result.auditArea}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                            <span className="text-white font-mono">{result.score}/100</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-300 mb-1">Notes:</p>
                            <ul className="text-sm text-gray-400 list-disc list-inside">
                              {result.notes.map((note, idx) => (
                                <li key={idx}>{note}</li>
                              ))}
                            </ul>
                          </div>

                          {result.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-yellow-300 mb-1">Recommendations:</p>
                              <ul className="text-sm text-yellow-200 list-disc list-inside">
                                {result.recommendations.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-4">
            {assessment && (
              <div className="space-y-4">
                <Card className={`${assessment.ready_for_real_money ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
                  <CardHeader>
                    <CardTitle className={`${assessment.ready_for_real_money ? 'text-green-400' : 'text-red-400'} flex items-center gap-2`}>
                      {assessment.ready_for_real_money ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      {assessment.final_recommendation}: Ready for Real Money Trading
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data Integrity:</span>
                            <span className="text-white">{assessment.data_integrity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Security Grade:</span>
                            <span className="text-white">{assessment.security_grade.toFixed(0)}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Simulated ROI:</span>
                            <span className="text-white">{assessment.simulated_roi}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Detailed Scores</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Security:</span>
                            <span className="text-white">{assessment.detailed_scores.security.toFixed(0)}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Accuracy:</span>
                            <span className="text-white">{assessment.detailed_scores.accuracy.toFixed(0)}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Stability:</span>
                            <span className="text-white">{assessment.detailed_scores.stability.toFixed(0)}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Profitability:</span>
                            <span className="text-white">{assessment.detailed_scores.profitability.toFixed(0)}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Risk Protection:</span>
                            <span className="text-white">{assessment.detailed_scores.risk_protection.toFixed(0)}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {assessment.main_issues.length > 0 && (
                      <Alert className="mt-4 border-red-600 bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-200">
                          <strong>Main Issues:</strong> {assessment.main_issues.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    {assessment.recommended_fixes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-yellow-400 font-medium mb-2">Recommended Fixes:</h4>
                        <ul className="text-yellow-200 list-disc list-inside space-y-1">
                          {assessment.recommended_fixes.map((fix, idx) => (
                            <li key={idx}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="exports" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Audit Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => downloadExport('csv')}
                    disabled={!exports}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button
                    onClick={() => downloadExport('json')}
                    disabled={!exports}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button
                    onClick={() => downloadExport('markdown')}
                    disabled={!exports}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>

                {!exports && (
                  <Alert className="mt-4 border-blue-600 bg-blue-900/20">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      Run the full audit to generate downloadable reports
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
