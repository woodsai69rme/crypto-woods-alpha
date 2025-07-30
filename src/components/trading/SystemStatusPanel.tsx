import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Database,
  Wifi,
  Server,
  MemoryStick,
  Clock
} from 'lucide-react';
import { useSystemHealth } from '@/hooks/useEnhancedTradingData';

export const SystemStatusPanel: React.FC = () => {
  const { data: systemHealth, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-gray-400">Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemHealth) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to fetch system health data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Status */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Overall Status</div>
              <Badge 
                className={`${getStatusColor(systemHealth.status)} text-white capitalize`}
              >
                {systemHealth.status}
              </Badge>
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Memory Usage</div>
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4" />
                <Progress value={systemHealth.memoryUsage} className="flex-1" />
                <span className="text-sm font-bold text-white">{systemHealth.memoryUsage}MB</span>
              </div>
            </div>

            {/* Active Bots */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Active Bots</div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-lg font-bold text-green-400">{systemHealth.activeBots}</span>
              </div>
            </div>

            {/* Uptime */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">System Uptime</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-bold text-blue-400">
                  {formatUptime(systemHealth.uptime)}
                </span>
              </div>
            </div>
          </div>

          {/* System Health Warning */}
          {systemHealth.status !== 'healthy' && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {systemHealth.status === 'critical' && (
                  <>
                    <strong>Critical:</strong> System is under heavy load. Memory usage: {systemHealth.memoryUsage}MB. 
                    Consider stopping some AI bots to reduce resource consumption.
                  </>
                )}
                {systemHealth.status === 'warning' && (
                  <>
                    <strong>Warning:</strong> System performance may be degraded. 
                    Monitor resource usage and consider reducing bot activity.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Connections Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            API Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supabase */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium text-white">Supabase</span>
                </div>
                {getStatusIcon(systemHealth.apiConnections.supabase)}
              </div>
              <div className="text-sm text-gray-400 capitalize">
                {systemHealth.apiConnections.supabase}
              </div>
            </div>

            {/* Exchanges */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="font-medium text-white">Exchanges</span>
                </div>
                {getStatusIcon(systemHealth.apiConnections.exchanges)}
              </div>
              <div className="text-sm text-gray-400 capitalize">
                {systemHealth.apiConnections.exchanges}
              </div>
            </div>

            {/* AI Services */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium text-white">AI Services</span>
                </div>
                {getStatusIcon(systemHealth.apiConnections.ai_services)}
              </div>
              <div className="text-sm text-gray-400 capitalize">
                {systemHealth.apiConnections.ai_services}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Summary */}
      {systemHealth.totalErrors > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Errors (Last 24h)</span>
                <Badge variant="destructive" className="text-white">
                  {systemHealth.totalErrors}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-400">
                Most common errors: UUID validation failures, memory allocation issues, database timeouts
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High error count detected. Consider reviewing bot configurations and system resources.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.2%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">156ms</div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1,247</div>
              <div className="text-sm text-gray-400">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">87.3%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};