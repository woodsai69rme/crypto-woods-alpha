import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedChart } from "@/components/trading/AdvancedChart";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { MarketOverview } from "@/components/trading/MarketOverview";
import { OrderBook } from "@/components/trading/OrderBook";
import { LiveSignals } from "@/components/trading/LiveSignals";
import { AdvancedBotManager } from "@/components/trading/AdvancedBotManager";
import { MLPredictions } from "@/components/trading/MLPredictions";
import { AIInsights } from "@/components/trading/AIInsights";
import { ExchangeManager } from "@/components/trading/ExchangeManager";
import { NewsAnalysis } from "@/components/trading/NewsAnalysis";
import { AccountManager } from "@/components/trading/AccountManager";
import { SocialTrading } from "@/components/trading/SocialTrading";
import { AuditTrail } from "@/components/trading/AuditTrail";
import { RealTimeDataFeed } from "@/components/trading/RealTimeDataFeed";
import { TransactionHistory } from "@/components/trading/TransactionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const TradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trading");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Crypto Trading Platform</h1>
          <p className="text-gray-400">Professional trading with AI-powered insights and real-time data</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-12 bg-gray-800 mb-6">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="ai-bots">AI Bots</TabsTrigger>
            <TabsTrigger value="ml-ai">ML/AI</TabsTrigger>
            <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="data">Real Data</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AdvancedChart />
                <TradingPanel />
              </div>
              <div className="space-y-6">
                <MarketOverview />
                <OrderBook />
                <LiveSignals />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-bots">
            <AdvancedBotManager />
          </TabsContent>

          <TabsContent value="ml-ai">
            <div className="space-y-6">
              <MLPredictions />
              <AIInsights />
            </div>
          </TabsContent>

          <TabsContent value="exchanges">
            <ExchangeManager />
          </TabsContent>

          <TabsContent value="backtest">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Advanced Backtesting Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Test your trading strategies against historical data with comprehensive analytics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                      <h3 className="font-bold text-white mb-2">Strategy Testing</h3>
                      <p className="text-sm text-gray-400">Test multiple strategies simultaneously</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <h3 className="font-bold text-white mb-2">Risk Analysis</h3>
                      <p className="text-sm text-gray-400">Comprehensive risk metrics and drawdown analysis</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <h3 className="font-bold text-white mb-2">Performance Reports</h3>
                      <p className="text-sm text-gray-400">Detailed performance reports with visualizations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news">
            <NewsAnalysis />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountManager />
          </TabsContent>

          <TabsContent value="social">
            <SocialTrading />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>

          <TabsContent value="data">
            <RealTimeDataFeed />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white mb-2">API Configuration</h3>
                      <p className="text-gray-400 mb-4">Configure your exchange APIs and external services</p>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Configure Exchange APIs
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Set OpenRouter API Key
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Configure Telegram Bot
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-white mb-2">Risk Management</h3>
                      <p className="text-gray-400 mb-4">Set global risk parameters and limits</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Max Risk Per Trade (%)</label>
                          <Input type="number" defaultValue="2" className="bg-gray-800 border-gray-600" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Daily Loss Limit (%)</label>
                          <Input type="number" defaultValue="5" className="bg-gray-800 border-gray-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white mb-2">Notifications</h3>
                      <p className="text-gray-400 mb-4">Configure alerts and notifications</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Trade Notifications</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white">Price Alerts</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white">AI Signal Alerts</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
