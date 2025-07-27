
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  database: number;
  api: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

export const SystemHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    network: 0,
    database: 0,
    api: 0,
  });

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    // Initialize services
    const initialServices: ServiceStatus[] = [
      { name: 'Trading API', status: 'online', responseTime: 45, uptime: 99.8, lastCheck: new Date() },
      { name: 'Market Data', status: 'online', responseTime: 23, uptime: 99.9, lastCheck: new Date() },
      { name: 'User Database', status: 'online', responseTime: 12, uptime: 99.7, lastCheck: new Date() },
      { name: 'AI Services', status: 'online', responseTime: 78, uptime: 98.5, lastCheck: new Date() },
      { name: 'Notification System', status: 'online', responseTime: 156, uptime: 97.2, lastCheck: new Date() },
    ];

    setServices(initialServices);

    // Simulate real-time metrics updates
    const metricsInterval = setInterval(() => {
      setMetrics({
        cpu: Math.max(0, Math.min(100, 30 + (Math.random() - 0.5) * 20)),
        memory: Math.max(0, Math.min(100, 65 + (Math.random() - 0.5) * 15)),
        network: Math.max(0, Math.min(100, 25 + (Math.random() - 0.5) * 30)),
        database: Math.max(0, Math.min(100, 15 + (Math.random() - 0.5) * 10)),
        api: Math.max(0, Math.min(100, 40 + (Math.random() - 0.5) * 25)),
      });
    }, 2000);

    // Simulate service status updates
    const serviceInterval = setInterval(() => {
      setServices(prev => prev.map(service => {
        const statusRandom = Math.random();
        let newStatus: 'online' | 'offline' | 'degraded' = service.status;
        
        if (statusRandom < 0.05) {
          newStatus = 'offline';
        } else if (statusRandom < 0.15) {
          newStatus = 'degraded';
        } else {
          newStatus = 'online';
        }

        return {
          ...service,
          status: newStatus,
          responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 20),
          uptime: Math.max(90, Math.min(100, service.uptime + (Math.random() - 0.5) * 0.1)),
          lastCheck: new Date(),
        };
      }));
    }, 5000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(serviceInterval);
    };
  }, []);

  // Calculate overall health
  useEffect(() => {
    const offlineServices = services.filter(s => s.status === 'offline').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    const highCpuMemory = metrics.cpu > 80 || metrics.memory > 85;

    if (offlineServices > 0 || highCpuMemory) {
      setOverallHealth('critical');
    } else if (degradedServices > 1 || metrics.cpu > 60 || metrics.memory > 70) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('healthy');
    }
  }, [services, metrics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-600';
      case 'offline': return 'bg-red-600';
      case 'degraded': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 80) return 'text-red-400';
    if (value > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            System Health Monitor
            <Badge className={overallHealth === 'healthy' ? 'bg-green-600' : overallHealth === 'warning' ? 'bg-yellow-600' : 'bg-red-600'}>
              {overallHealth.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* CPU Usage */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">CPU Usage</span>
                <span className={`text-sm font-bold ${getMetricColor(metrics.cpu)}`}>
                  {metrics.cpu.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cpu} className="h-2" />
            </div>

            {/* Memory Usage */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Memory</span>
                <span className={`text-sm font-bold ${getMetricColor(metrics.memory)}`}>
                  {metrics.memory.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memory} className="h-2" />
            </div>

            {/* Network Usage */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Network</span>
                <span className={`text-sm font-bold ${getMetricColor(metrics.network)}`}>
                  {metrics.network.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.network} className="h-2" />
            </div>

            {/* Database Load */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Database</span>
                <span className={`text-sm font-bold ${getMetricColor(metrics.database)}`}>
                  {metrics.database.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.database} className="h-2" />
            </div>

            {/* API Load */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">API Load</span>
                <span className={`text-sm font-bold ${getMetricColor(metrics.api)}`}>
                  {metrics.api.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.api} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-green-400" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-white">{service.name}</p>
                    <p className="text-sm text-gray-400">
                      Last check: {service.lastCheck.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Response</p>
                    <p className="text-white font-medium">{service.responseTime.toFixed(0)}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Uptime</p>
                    <p className="text-white font-medium">{service.uptime.toFixed(1)}%</p>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button size="sm" variant="outline">
              <Wifi className="h-4 w-4 mr-2" />
              Restart Services
            </Button>
            <Button size="sm" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Run Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
