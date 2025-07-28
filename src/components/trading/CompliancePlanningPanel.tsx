import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Building,
  Scale,
  Users
} from 'lucide-react';

interface ComplianceTask {
  id: string;
  title: string;
  category: 'licensing' | 'security' | 'kyc' | 'reporting' | 'insurance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  estimatedCost: string;
  timeframe: string;
  description: string;
  requirements: string[];
  dependencies?: string[];
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  tasks: string[];
  status: 'upcoming' | 'current' | 'completed' | 'overdue';
}

export const CompliancePlanningPanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const complianceTasks: ComplianceTask[] = [
    {
      id: 'msb-license',
      title: 'MSB License Registration',
      category: 'licensing',
      priority: 'critical',
      status: 'not_started',
      estimatedCost: '$50K - $150K',
      timeframe: '6-12 months',
      description: 'Register as Money Services Business with FinCEN',
      requirements: [
        'FinCEN BSA registration',
        'State-level MSB licenses',
        'Surety bond posting',
        'Compliance officer designation'
      ]
    },
    {
      id: 'kyc-system',
      title: 'KYC/AML Implementation',
      category: 'kyc',
      priority: 'critical',
      status: 'not_started',
      estimatedCost: '$25K - $75K',
      timeframe: '3-6 months',
      description: 'Implement customer verification and monitoring systems',
      requirements: [
        'Identity verification system',
        'Document verification',
        'PEP and sanctions screening',
        'Transaction monitoring',
        'Suspicious activity reporting'
      ]
    },
    {
      id: 'custody-solution',
      title: 'Qualified Custodian Setup',
      category: 'security',
      priority: 'critical',
      status: 'not_started',
      estimatedCost: '$100K+ setup',
      timeframe: '4-8 months',
      description: 'Secure custody solution for customer funds',
      requirements: [
        'SEC-qualified custodian partnership',
        'Cold storage implementation',
        'Multi-signature wallets',
        'Insurance coverage',
        'Audit procedures'
      ]
    },
    {
      id: 'compliance-reporting',
      title: 'Regulatory Reporting System',
      category: 'reporting',
      priority: 'high',
      status: 'not_started',
      estimatedCost: '$30K - $60K',
      timeframe: '3-5 months',
      description: 'Automated compliance reporting to regulators',
      requirements: [
        'CTR filing automation',
        'SAR reporting system',
        'OFAC compliance monitoring',
        'State reporting requirements',
        'Record keeping system'
      ]
    },
    {
      id: 'professional-insurance',
      title: 'Professional Insurance Coverage',
      category: 'insurance',
      priority: 'high',
      status: 'not_started',
      estimatedCost: '$50K+ annually',
      timeframe: '1-2 months',
      description: 'Comprehensive insurance coverage',
      requirements: [
        'Errors & Omissions insurance',
        'Cyber liability insurance',
        'Crime & fidelity insurance',
        'Professional liability',
        'Directors & Officers insurance'
      ]
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'phase1',
      title: 'Foundation & Legal Structure',
      targetDate: '2024-06-01',
      progress: 15,
      tasks: ['msb-license', 'professional-insurance'],
      status: 'current'
    },
    {
      id: 'phase2',
      title: 'Security & Compliance Infrastructure',
      targetDate: '2024-09-01',
      progress: 0,
      tasks: ['kyc-system', 'custody-solution'],
      status: 'upcoming'
    },
    {
      id: 'phase3',
      title: 'Operational Readiness',
      targetDate: '2024-12-01',
      progress: 0,
      tasks: ['compliance-reporting'],
      status: 'upcoming'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in_progress': return 'bg-blue-600';
      case 'blocked': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'licensing': return <Scale className="h-4 w-4" />;
      case 'security': return <Building className="h-4 w-4" />;
      case 'kyc': return <Users className="h-4 w-4" />;
      case 'reporting': return <FileText className="h-4 w-4" />;
      case 'insurance': return <DollarSign className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const overallProgress = Math.round(
    (complianceTasks.filter(task => task.status === 'completed').length / complianceTasks.length) * 100
  );

  const totalEstimatedCost = '$500K - $1.2M+';
  const estimatedTimeToCompletion = '12-18 months';

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Regulatory Compliance Planning
          <Badge className="bg-blue-600">
            {overallProgress}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="text-white">Tasks</TabsTrigger>
            <TabsTrigger value="timeline" className="text-white">Timeline</TabsTrigger>
            <TabsTrigger value="resources" className="text-white">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{overallProgress}%</div>
                    <div className="text-sm text-gray-400">Overall Progress</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{totalEstimatedCost}</div>
                    <div className="text-sm text-gray-400">Estimated Cost</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-600">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{estimatedTimeToCompletion}</div>
                    <div className="text-sm text-gray-400">Time to Complete</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Alerts */}
            <Alert className="border-red-600 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                <strong>Regulatory Compliance Required:</strong> All critical compliance tasks must be completed 
                before operating with real money. Failure to comply may result in legal penalties.
              </AlertDescription>
            </Alert>

            {/* Progress by Category */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Progress by Category</h3>
              {['licensing', 'security', 'kyc', 'reporting', 'insurance'].map((category) => {
                const categoryTasks = complianceTasks.filter(task => task.category === category);
                const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
                const progress = categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span className="text-white capitalize">{category}</span>
                      </div>
                      <span className="text-gray-400">{completedTasks}/{categoryTasks.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {complianceTasks.map((task) => (
              <Card key={task.id} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(task.category)}
                      <div>
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-gray-400 text-sm">Cost:</span>
                      <span className="text-white ml-2">{task.estimatedCost}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Timeline:</span>
                      <span className="text-white ml-2">{task.timeframe}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-white">Requirements:</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {task.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="bg-gray-800 border-gray-600">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{milestone.title}</h4>
                    <Badge className={milestone.status === 'completed' ? 'bg-green-600' : 
                                   milestone.status === 'current' ? 'bg-blue-600' : 'bg-gray-600'}>
                      {milestone.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target Date: {milestone.targetDate}</span>
                      <span className="text-gray-400">{milestone.progress}% Complete</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                    
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium text-white">Included Tasks:</h5>
                      {milestone.tasks.map((taskId) => {
                        const task = complianceTasks.find(t => t.id === taskId);
                        return task ? (
                          <div key={taskId} className="flex items-center gap-2 text-sm text-gray-400">
                            {getStatusIcon(task.status)}
                            {task.title}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Regulatory Bodies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => window.open('https://www.fincen.gov/money-services-business-msb-information-center', '_blank')}
                  >
                    FinCEN MSB Center
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => window.open('https://www.sec.gov/', '_blank')}
                  >
                    SEC Guidance
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => window.open('https://www.cftc.gov/', '_blank')}
                  >
                    CFTC Resources
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Professional Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-400 space-y-2">
                    <div>
                      <strong className="text-white">Legal Counsel:</strong> Securities & FinTech law firm
                    </div>
                    <div>
                      <strong className="text-white">Compliance Consultant:</strong> Regulatory compliance specialist
                    </div>
                    <div>
                      <strong className="text-white">Security Auditor:</strong> Cybersecurity assessment firm
                    </div>
                    <div>
                      <strong className="text-white">Insurance Broker:</strong> FinTech insurance specialist
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-blue-600 bg-blue-900/20">
              <FileText className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>Professional Consultation Required:</strong> This planning tool provides general guidance only. 
                Consult with qualified legal and compliance professionals for your specific regulatory requirements.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};