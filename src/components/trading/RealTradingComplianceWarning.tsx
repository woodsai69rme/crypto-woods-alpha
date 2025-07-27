import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Lock, 
  FileText, 
  DollarSign,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  status: 'missing' | 'partial' | 'complete';
  description: string;
  priority: 'critical' | 'high' | 'medium';
  estimatedCost?: string;
  timeToImplement?: string;
}

export const RealTradingComplianceWarning: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const complianceItems: ComplianceItem[] = [
    {
      id: 'licensing',
      title: 'Financial Services License',
      status: 'missing',
      description: 'MSB (Money Services Business) registration with FinCEN and state licenses',
      priority: 'critical',
      estimatedCost: '$50K - $150K',
      timeToImplement: '6-12 months'
    },
    {
      id: 'security',
      title: 'Enterprise Security Infrastructure',
      status: 'missing',
      description: 'Hardware Security Modules (HSM), encryption, audit trails, penetration testing',
      priority: 'critical',
      estimatedCost: '$100K - $200K',
      timeToImplement: '3-6 months'
    },
    {
      id: 'kycaml',
      title: 'KYC/AML Compliance',
      status: 'missing',
      description: 'Know Your Customer and Anti-Money Laundering procedures and systems',
      priority: 'critical',
      estimatedCost: '$25K - $75K',
      timeToImplement: '2-4 months'
    },
    {
      id: 'custody',
      title: 'Qualified Custodian',
      status: 'missing',
      description: 'SEC-qualified custodian for customer funds and digital assets',
      priority: 'critical',
      estimatedCost: '$1M+ insurance',
      timeToImplement: '3-6 months'
    },
    {
      id: 'api_integration',
      title: 'Production Exchange APIs',
      status: 'partial',
      description: 'Live trading APIs with proper error handling and risk management',
      priority: 'high',
      estimatedCost: '$10K - $30K',
      timeToImplement: '1-3 months'
    },
    {
      id: 'risk_management',
      title: 'Risk Management System',
      status: 'partial',
      description: 'Real-time position monitoring, liquidation protection, circuit breakers',
      priority: 'high',
      estimatedCost: '$50K - $100K',
      timeToImplement: '2-4 months'
    },
    {
      id: 'compliance_reporting',
      title: 'Regulatory Reporting',
      status: 'missing',
      description: 'Automated compliance reporting to SEC, CFTC, and other regulators',
      priority: 'high',
      estimatedCost: '$25K - $50K',
      timeToImplement: '2-3 months'
    },
    {
      id: 'insurance',
      title: 'Professional Insurance',
      status: 'missing',
      description: 'Errors & Omissions, Cyber Liability, Crime & Fidelity insurance',
      priority: 'high',
      estimatedCost: '$50K+ annually',
      timeToImplement: '1-2 months'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'partial': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-600';
      case 'partial': return 'bg-yellow-600';
      case 'missing': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const criticalMissing = complianceItems.filter(item => 
    item.status === 'missing' && item.priority === 'critical'
  ).length;

  const totalEstimatedCost = '$1M - $2.5M+';
  const totalTimeframe = '12-24 months';

  return (
    <Card className="bg-gray-900 border-red-600 border-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          REAL MONEY TRADING - COMPLIANCE WARNING
          <Badge className="bg-red-600 text-white pulse">
            {criticalMissing} CRITICAL MISSING
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Critical Warning */}
        <Alert className="border-red-600 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong>WARNING:</strong> This platform is for SIMULATION/EDUCATIONAL purposes only. 
            Operating a real money trading platform requires extensive regulatory compliance, 
            licensing, and security infrastructure that is NOT currently implemented.
          </AlertDescription>
        </Alert>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{criticalMissing}</div>
            <div className="text-sm text-gray-400">Critical Missing</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalEstimatedCost}</div>
            <div className="text-sm text-gray-400">Est. Cost</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{totalTimeframe}</div>
            <div className="text-sm text-gray-400">Implementation</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">0%</div>
            <div className="text-sm text-gray-400">Ready for Real Trading</div>
          </div>
        </div>

        {/* Toggle Details */}
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full"
        >
          {isExpanded ? 'Hide' : 'Show'} Detailed Compliance Requirements
        </Button>

        {/* Detailed Compliance Items */}
        {isExpanded && (
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <Card key={item.id} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                      <div className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()} PRIORITY
                      </div>
                    </div>
                  </div>
                  
                  {(item.estimatedCost || item.timeToImplement) && (
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      {item.estimatedCost && (
                        <div>
                          <span className="text-gray-400">Est. Cost:</span>
                          <span className="text-white ml-2">{item.estimatedCost}</span>
                        </div>
                      )}
                      {item.timeToImplement && (
                        <div>
                          <span className="text-gray-400">Time:</span>
                          <span className="text-white ml-2">{item.timeToImplement}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legal Disclaimer */}
        <Alert className="border-yellow-600 bg-yellow-900/20">
          <FileText className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <strong>LEGAL DISCLAIMER:</strong> This assessment covers technical requirements only. 
            Actual compliance requires consultation with qualified legal and financial professionals 
            specializing in securities law, derivatives regulation, and financial services compliance.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.fincen.gov/money-services-business-msb-information-center', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            FinCEN MSB Requirements
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.sec.gov/investment/im-guidance-2019-02.pdf', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            SEC Digital Assets Guidance
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.cftc.gov/sites/default/files/2019-12/oceo_bitcoinbasics0218.pdf', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            CFTC Crypto Guidance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};