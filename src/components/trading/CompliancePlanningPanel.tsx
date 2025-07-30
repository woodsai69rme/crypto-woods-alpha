import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';

interface CompliancePhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  cost: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  tasks: ComplianceTask[];
}

interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedHours: number;
  dependencies: string[];
}

const COMPLIANCE_PHASES: CompliancePhase[] = [
  {
    id: 'immediate',
    title: 'Immediate Fixes (Week 1-2)',
    description: 'Critical technical issues that prevent reliable operation',
    duration: '2 weeks',
    cost: '$10K - $25K',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    tasks: [
      {
        id: 'fix-networking',
        title: 'Fix Network Connectivity Issues',
        description: 'Resolve WebSocket and API connection failures',
        status: 'IN_PROGRESS',
        estimatedHours: 40,
        dependencies: []
      },
      {
        id: 'implement-fallbacks',
        title: 'Implement Data Fallbacks',
        description: 'Add robust fallback mechanisms for failed API calls',
        status: 'NOT_STARTED',
        estimatedHours: 24,
        dependencies: ['fix-networking']
      },
      {
        id: 'audit-calculations',
        title: 'Audit All Financial Calculations',
        description: 'Verify P&L, fee, and balance calculations are accurate',
        status: 'NOT_STARTED',
        estimatedHours: 32,
        dependencies: []
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Infrastructure (Month 1-3)',
    description: 'Build robust technical foundation for trading operations',
    duration: '3 months',
    cost: '$75K - $150K',
    priority: 'CRITICAL',
    status: 'NOT_STARTED',
    tasks: [
      {
        id: 'exchange-apis',
        title: 'Real Exchange API Integration',
        description: 'Connect to Binance, Coinbase, Kraken production APIs',
        status: 'NOT_STARTED',
        estimatedHours: 200,
        dependencies: ['fix-networking']
      },
      {
        id: 'order-management',
        title: 'Production Order Management System',
        description: 'Build reliable order routing and execution system',
        status: 'NOT_STARTED',
        estimatedHours: 160,
        dependencies: ['exchange-apis']
      },
      {
        id: 'real-balances',
        title: 'Real Balance Management',
        description: 'Implement actual fund custody and balance tracking',
        status: 'NOT_STARTED',
        estimatedHours: 120,
        dependencies: ['order-management']
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Regulatory Compliance (Month 4-12)',
    description: 'Obtain necessary licenses and implement compliance framework',
    duration: '9 months',
    cost: '$200K - $500K',
    priority: 'CRITICAL',
    status: 'NOT_STARTED',
    tasks: [
      {
        id: 'msb-license',
        title: 'Money Services Business License',
        description: 'Apply for and obtain federal MSB license',
        status: 'NOT_STARTED',
        estimatedHours: 400,
        dependencies: []
      },
      {
        id: 'state-licenses',
        title: 'State Money Transmitter Licenses',
        description: 'Obtain licenses in all operating states',
        status: 'NOT_STARTED',
        estimatedHours: 800,
        dependencies: ['msb-license']
      },
      {
        id: 'kyc-aml',
        title: 'KYC/AML Implementation',
        description: 'Build customer verification and monitoring systems',
        status: 'NOT_STARTED',
        estimatedHours: 300,
        dependencies: ['msb-license']
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Hardening (Month 2-6)',
    description: 'Implement institutional-grade security measures',
    duration: '5 months',
    cost: '$100K - $300K',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    tasks: [
      {
        id: 'hsm-implementation',
        title: 'Hardware Security Modules',
        description: 'Deploy HSMs for secure key storage and operations',
        status: 'NOT_STARTED',
        estimatedHours: 200,
        dependencies: []
      },
      {
        id: 'cold-storage',
        title: 'Cold Storage Implementation',
        description: 'Set up secure cold storage for customer funds',
        status: 'NOT_STARTED',
        estimatedHours: 120,
        dependencies: ['hsm-implementation']
      },
      {
        id: 'security-audit',
        title: 'Third-Party Security Audit',
        description: 'Complete penetration testing and security review',
        status: 'NOT_STARTED',
        estimatedHours: 80,
        dependencies: ['cold-storage']
      }
    ]
  },
  {
    id: 'banking',
    title: 'Banking & Custody (Month 6-12)',
    description: 'Establish banking relationships and custody solutions',
    duration: '6 months',
    cost: '$75K - $200K',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    tasks: [
      {
        id: 'banking-relationships',
        title: 'Crypto-Friendly Banking',
        description: 'Establish relationships with crypto-friendly banks',
        status: 'NOT_STARTED',
        estimatedHours: 100,
        dependencies: ['state-licenses']
      },
      {
        id: 'custody-solution',
        title: 'Qualified Custodian',
        description: 'Partner with qualified custodian for digital assets',
        status: 'NOT_STARTED',
        estimatedHours: 80,
        dependencies: ['banking-relationships']
      },
      {
        id: 'ach-wires',
        title: 'ACH/Wire Integration',
        description: 'Implement fund transfer capabilities',
        status: 'NOT_STARTED',
        estimatedHours: 120,
        dependencies: ['custody-solution']
      }
    ]
  }
];

export const CompliancePlanningPanel: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState('immediate');

  const getPhaseProgress = (phase: CompliancePhase) => {
    const completed = phase.tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = phase.tasks.filter(task => task.status === 'IN_PROGRESS').length;
    return {
      completed,
      inProgress,
      total: phase.tasks.length,
      percentage: (completed + inProgress * 0.5) / phase.tasks.length * 100
    };
  };

  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    COMPLIANCE_PHASES.forEach(phase => {
      totalTasks += phase.tasks.length;
      completedTasks += phase.tasks.filter(task => task.status === 'COMPLETED').length;
      inProgressTasks += phase.tasks.filter(task => task.status === 'IN_PROGRESS').length;
    });

    return {
      percentage: (completedTasks + inProgressTasks * 0.5) / totalTasks * 100,
      completed: completedTasks,
      inProgress: inProgressTasks,
      total: totalTasks
    };
  };

  const totalProgress = getTotalProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Real Trading Compliance Roadmap</CardTitle>
          <CardDescription>
            Comprehensive plan to transition from simulation to real money trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {totalProgress.completed + totalProgress.inProgress} / {totalProgress.total} tasks
              </span>
            </div>
            <Progress value={totalProgress.percentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{totalProgress.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalProgress.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {totalProgress.total - totalProgress.completed - totalProgress.inProgress}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Tabs */}
      <Tabs value={selectedPhase} onValueChange={setSelectedPhase}>
        <TabsList className="grid w-full grid-cols-5">
          {COMPLIANCE_PHASES.map(phase => (
            <TabsTrigger key={phase.id} value={phase.id} className="text-xs">
              {phase.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {COMPLIANCE_PHASES.map(phase => {
          const progress = getPhaseProgress(phase);
          
          return (
            <TabsContent key={phase.id} value={phase.id}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {phase.title}
                        <Badge 
                          variant={phase.priority === 'CRITICAL' ? 'destructive' : 
                                  phase.priority === 'HIGH' ? 'secondary' : 'outline'}
                        >
                          {phase.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {phase.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {phase.cost}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Phase Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Phase Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {progress.completed} / {progress.total} completed
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                      {phase.tasks.map(task => (
                        <div key={task.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {task.status === 'COMPLETED' && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {task.status === 'IN_PROGRESS' && (
                                <Clock className="h-5 w-5 text-blue-500" />
                              )}
                              {task.status === 'NOT_STARTED' && (
                                <AlertTriangle className="h-5 w-5 text-gray-400" />
                              )}
                              <h4 className="font-medium">{task.title}</h4>
                            </div>
                            <Badge variant="outline">
                              {task.estimatedHours}h
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          {task.dependencies.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Dependencies:</strong> {task.dependencies.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant={phase.status === 'NOT_STARTED' ? 'default' : 'outline'}
                        disabled={phase.status === 'COMPLETED'}
                      >
                        {phase.status === 'NOT_STARTED' ? 'Start Phase' :
                         phase.status === 'IN_PROGRESS' ? 'Continue' : 'Completed'}
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};