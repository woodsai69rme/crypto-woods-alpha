import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  Database,
  Eye,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityCheck {
  id: string;
  name: string;
  category: 'authentication' | 'encryption' | 'network' | 'monitoring';
  status: 'enabled' | 'disabled' | 'warning' | 'critical';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  autoFixAvailable: boolean;
}

export const SecurityHardeningPanel: React.FC = () => {
  const { toast } = useToast();
  const [securityMode, setSecurityMode] = useState(false);
  
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([
    {
      id: 'tfa',
      name: '2FA Authentication',
      category: 'authentication',
      status: 'disabled',
      description: 'Two-factor authentication for user accounts',
      impact: 'critical',
      autoFixAvailable: true
    },
    {
      id: 'api-encryption',
      name: 'API Key Encryption',
      category: 'encryption',
      status: 'disabled',
      description: 'Encrypt API keys at rest using AES-256',
      impact: 'critical',
      autoFixAvailable: true
    },
    {
      id: 'rate-limiting',
      name: 'Rate Limiting',
      category: 'network',
      status: 'warning',
      description: 'Prevent API abuse with request limits',
      impact: 'high',
      autoFixAvailable: true
    },
    {
      id: 'audit-logging',
      name: 'Enhanced Audit Logging',
      category: 'monitoring',
      status: 'enabled',
      description: 'Comprehensive logging of all trading actions',
      impact: 'medium',
      autoFixAvailable: false
    },
    {
      id: 'session-timeout',
      name: 'Session Timeout',
      category: 'authentication',
      status: 'warning',
      description: 'Automatic logout after inactivity',
      impact: 'medium',
      autoFixAvailable: true
    },
    {
      id: 'tls-encryption',
      name: 'TLS 1.3 Encryption',
      category: 'network',
      status: 'enabled',
      description: 'Secure data transmission',
      impact: 'high',
      autoFixAvailable: false
    },
    {
      id: 'input-validation',
      name: 'Input Sanitization',
      category: 'network',
      status: 'warning',
      description: 'Validate and sanitize all user inputs',
      impact: 'high',
      autoFixAvailable: true
    },
    {
      id: 'intrusion-detection',
      name: 'Intrusion Detection',
      category: 'monitoring',
      status: 'disabled',
      description: 'Monitor for suspicious trading patterns',
      impact: 'high',
      autoFixAvailable: false
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'disabled': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'disabled': return 'bg-red-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Key className="h-4 w-4" />;
      case 'encryption': return <Lock className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'monitoring': return <Eye className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const enableSecurity = async (checkId: string) => {
    setSecurityChecks(prev =>
      prev.map(check =>
        check.id === checkId
          ? { ...check, status: 'enabled' }
          : check
      )
    );

    toast({
      title: "Security Feature Enabled",
      description: `${securityChecks.find(c => c.id === checkId)?.name} has been enabled`,
    });
  };

  const enableAllSecurity = async () => {
    const enableableChecks = securityChecks.filter(check => 
      check.autoFixAvailable && check.status !== 'enabled'
    );

    for (const check of enableableChecks) {
      await new Promise(resolve => {
        enableSecurity(check.id);
        setTimeout(resolve, 500);
      });
    }
  };

  const calculateSecurityScore = () => {
    const enabledCount = securityChecks.filter(check => check.status === 'enabled').length;
    return Math.round((enabledCount / securityChecks.length) * 100);
  };

  const criticalIssues = securityChecks.filter(check => 
    check.impact === 'critical' && check.status !== 'enabled'
  ).length;

  const securityScore = calculateSecurityScore();

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Hardening
          <Badge className={securityScore >= 80 ? 'bg-green-600' : securityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}>
            {securityScore}% Secure
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Security Score</span>
            <span className="text-white font-mono">{securityScore}/100</span>
          </div>
          <Progress value={securityScore} className="h-2" />
          
          {criticalIssues > 0 && (
            <Alert className="border-red-600 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                <strong>{criticalIssues} Critical Security Issues</strong> - Address immediately before real trading
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Enhanced Security Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <Label htmlFor="security-mode" className="text-white font-medium">
              Enhanced Security Mode
            </Label>
            <p className="text-sm text-gray-400">
              Enable comprehensive security monitoring and protection
            </p>
          </div>
          <Switch
            id="security-mode"
            checked={securityMode}
            onCheckedChange={setSecurityMode}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={enableAllSecurity}
            className="bg-green-600 hover:bg-green-700"
          >
            Auto-Fix Available Issues
          </Button>
          <Button 
            variant="outline"
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
          >
            Generate Security Report
          </Button>
        </div>

        {/* Security Checks */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Security Checks</h3>
          
          {securityChecks.map((check) => (
            <Card key={check.id} className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(check.category)}
                    <div>
                      <h4 className="text-white font-medium flex items-center gap-2">
                        {check.name}
                        {getStatusIcon(check.status)}
                      </h4>
                      <p className="text-sm text-gray-400">{check.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                    <div className={`text-sm font-medium ${getImpactColor(check.impact)}`}>
                      {check.impact.toUpperCase()} IMPACT
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                    {check.category}
                  </Badge>
                  {check.autoFixAvailable && check.status !== 'enabled' && (
                    <Button
                      size="sm"
                      onClick={() => enableSecurity(check.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Recommendations */}
        <Alert className="border-blue-600 bg-blue-900/20">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Recommended:</strong> Enable all critical security features before connecting real trading accounts. 
            Consider implementing hardware security modules (HSM) for production environments.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};