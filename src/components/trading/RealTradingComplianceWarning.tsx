import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, DollarSign, Scale, Lock, AlertCircle } from 'lucide-react';

interface ComplianceIssue {
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  requirements: string[];
  estimatedCost: string;
  timeframe: string;
}

const COMPLIANCE_ISSUES: ComplianceIssue[] = [
  {
    category: "Exchange API Integration",
    severity: "CRITICAL",
    description: "No real exchange connections. Currently using mock/demo data only.",
    requirements: [
      "Binance Pro API integration with live trading",
      "Coinbase Pro API for institutional trading",
      "Kraken Pro API for advanced orders",
      "Multi-exchange order routing system",
      "Real-time balance synchronization"
    ],
    estimatedCost: "$50K - $150K",
    timeframe: "3-6 months"
  },
  {
    category: "Financial Licensing & Compliance",
    severity: "CRITICAL", 
    description: "Missing all required financial licenses and regulatory compliance.",
    requirements: [
      "Money Services Business (MSB) license",
      "FINCEN registration and reporting",
      "State-by-state money transmitter licenses",
      "KYC/AML compliance implementation",
      "OFAC sanctions screening",
      "Suspicious Activity Reporting (SAR)"
    ],
    estimatedCost: "$200K - $500K",
    timeframe: "6-18 months"
  },
  {
    category: "Security Infrastructure",
    severity: "CRITICAL",
    description: "Development-level security. Not suitable for real money handling.",
    requirements: [
      "Hardware Security Modules (HSM) for key storage",
      "Multi-signature wallet implementation", 
      "Cold storage for customer funds",
      "Penetration testing and security audits",
      "SOC 2 Type II compliance",
      "Insurance coverage for digital assets"
    ],
    estimatedCost: "$100K - $300K", 
    timeframe: "4-8 months"
  },
  {
    category: "Banking & Custody",
    severity: "HIGH",
    description: "No real banking integration or custody solutions.",
    requirements: [
      "Relationship with crypto-friendly banks",
      "ACH and wire transfer capabilities",
      "Qualified custodian for digital assets",
      "Segregated customer accounts",
      "Daily reconciliation processes",
      "Audit trail for all fund movements"
    ],
    estimatedCost: "$75K - $200K",
    timeframe: "6-12 months"
  },
  {
    category: "Risk Management",
    severity: "HIGH",
    description: "Insufficient risk controls for real trading.",
    requirements: [
      "Real-time position monitoring",
      "Automated liquidation mechanisms",
      "Margin requirements and calculations",
      "Circuit breakers for market volatility",
      "Maximum exposure limits per user",
      "Stress testing and scenario analysis"
    ],
    estimatedCost: "$50K - $150K",
    timeframe: "3-6 months"
  },
  {
    category: "Tax & Reporting",
    severity: "MEDIUM",
    description: "No tax reporting or regulatory filing capabilities.",
    requirements: [
      "1099 tax form generation",
      "Cost basis tracking for all trades",
      "FATCA compliance for international users",
      "State and federal tax reporting",
      "Customer transaction history exports",
      "Regulatory reporting automation"
    ],
    estimatedCost: "$25K - $75K",
    timeframe: "2-4 months"
  }
];

const CURRENT_PLATFORM_ISSUES = [
  "WebSocket connection failures affecting real-time data",
  "CoinGecko API network errors causing data gaps",
  "No real exchange API integrations",
  "Mock trading data not reflecting real market conditions",
  "Missing transaction audit trails for compliance",
  "No user identity verification (KYC) process",
  "Unencrypted storage of trading credentials",
  "No position limits or risk management controls"
];

export const RealTradingComplianceWarning: React.FC = () => {
  const totalEstimatedCost = "$500K - $1.5M";
  const totalTimeframe = "12-24 months";

  return (
    <div className="space-y-6">
      {/* Critical Warning Alert */}
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          🚨 CRITICAL: NOT READY FOR REAL MONEY TRADING
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          This platform is currently for EDUCATIONAL/SIMULATION purposes only. 
          Real money trading would be illegal and extremely dangerous without proper licensing and infrastructure.
        </AlertDescription>
      </Alert>

      {/* Current Issues */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5" />
            Current Platform Issues
          </CardTitle>
          <CardDescription>
            Immediate technical problems affecting platform reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {CURRENT_PLATFORM_ISSUES.map((issue, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{issue}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <div className="grid gap-4">
        <h3 className="text-xl font-semibold mb-4">Real Money Trading Requirements</h3>
        
        {COMPLIANCE_ISSUES.map((issue, index) => (
          <Card key={index} className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {issue.severity === 'CRITICAL' && <Shield className="h-5 w-5 text-red-500" />}
                  {issue.severity === 'HIGH' && <Lock className="h-5 w-5 text-orange-500" />}
                  {issue.severity === 'MEDIUM' && <Scale className="h-5 w-5 text-yellow-500" />}
                  {issue.category}
                </CardTitle>
                <Badge 
                  variant={issue.severity === 'CRITICAL' ? 'destructive' : 
                          issue.severity === 'HIGH' ? 'secondary' : 'outline'}
                >
                  {issue.severity}
                </Badge>
              </div>
              <CardDescription>{issue.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Required Implementation:</h5>
                  <ul className="space-y-1">
                    {issue.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Cost:</span> {issue.estimatedCost}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Timeline:</span> {issue.timeframe}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Implementation Summary for Real Trading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Total Estimated Investment</h5>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalEstimatedCost}</p>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Implementation Timeline</h5>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalTimeframe}</p>
            </div>
          </div>
          
          <Alert className="border-blue-300 bg-blue-100 dark:bg-blue-900">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Recommendation:</strong> Continue using this platform for education, backtesting, and strategy development. 
              Consider partnering with an existing licensed broker-dealer for real money trading implementation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};