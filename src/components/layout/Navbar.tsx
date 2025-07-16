
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Settings, Bell, User, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-gray-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <span className="text-xl font-bold text-white">CryptoWoods Pro</span>
            <Badge variant="secondary" className="bg-green-600 text-white">
              LIVE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            <span className="text-green-400">BTC:</span> $43,250.00
            <span className="text-red-400 ml-2">-2.3%</span>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-xs">
              3
            </Badge>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
