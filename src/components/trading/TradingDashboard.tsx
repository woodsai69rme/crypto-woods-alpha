
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketOverview } from './MarketOverview';
import { PortfolioOverview } from './PortfolioOverview';
import { RealDataDashboard } from './RealDataDashboard';
import { EnhancedAIBotManager } from './EnhancedAIBotManager';
import { SystemStatusPanel } from './SystemStatusPanel';
import { AuditTrail } from './AuditTrail';

export const TradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-900 p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Trading Platform
        </h1>
        <p className="text-gray-400">
          Advanced cryptocurrency trading with real-time data and AI-powered insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="real-data" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Real Data & Audit
          </TabsTrigger>
          <TabsTrigger 
            value="ai-bots" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            AI Bots
          </TabsTrigger>
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            System Health
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Audit Trail
          </TabsTrigger>
          <TabsTrigger 
            value="portfolio" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="real-data" className="space-y-6">
          <RealDataDashboard />
        </TabsContent>

        <TabsContent value="ai-bots" className="space-y-6">
          <EnhancedAIBotManager />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemStatusPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};
