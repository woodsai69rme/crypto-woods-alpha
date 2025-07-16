
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Bot, 
  Wallet, 
  Settings, 
  BookOpen,
  Users,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Database,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: TrendingUp, label: 'Trading', active: false },
    { icon: Bot, label: 'AI Bots', active: false },
    { icon: Brain, label: 'AI Analytics', active: false },
    { icon: Wallet, label: 'Portfolio', active: false },
    { icon: Target, label: 'Strategies', active: false },
    { icon: Activity, label: 'Liquidity Map', active: false },
    { icon: Zap, label: 'Live Signals', active: false },
    { icon: Database, label: 'Audit Logs', active: false },
    { icon: AlertTriangle, label: 'Risk Manager', active: false },
    { icon: Users, label: 'Community', active: false },
    { icon: BookOpen, label: 'Education', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 transition-all duration-300 z-40",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant={item.active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
              item.active && "bg-gray-700 text-white",
              !isOpen && "px-2"
            )}
          >
            <item.icon className="h-5 w-5" />
            {isOpen && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};
