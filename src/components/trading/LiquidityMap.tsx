
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLiquidityZones } from '@/hooks/useTradingData';
import { Layers, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface LiquidityMapProps {
  tradingPairId: string;
}

export const LiquidityMap: React.FC<LiquidityMapProps> = ({ tradingPairId }) => {
  const { data: liquidityZones, isLoading } = useLiquidityZones(tradingPairId);

  const getZoneColor = (zoneType: string, strength: string) => {
    const baseColors = {
      support: 'green',
      resistance: 'red',
      supply: 'orange',
      demand: 'blue'
    };
    
    const intensity = strength === 'strong' ? 500 : strength === 'medium' ? 400 : 300;
    return `${baseColors[zoneType as keyof typeof baseColors]}-${intensity}`;
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case 'support': return <TrendingUp className="h-3 w-3" />;
      case 'resistance': return <TrendingDown className="h-3 w-3" />;
      case 'supply': return <Target className="h-3 w-3" />;
      case 'demand': return <Target className="h-3 w-3" />;
      default: return <Layers className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Liquidity Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">Loading liquidity data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            Liquidity Zones
          </div>
          <Badge className="bg-blue-600 text-white">HYBLOCK STYLE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liquidityZones && liquidityZones.length > 0 ? (
            liquidityZones.map((zone, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 border-l-4" 
                   style={{ borderColor: `var(--${getZoneColor(zone.zone_type, zone.strength)})` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getZoneIcon(zone.zone_type)}
                    <span className="text-white font-medium capitalize">{zone.zone_type}</span>
                    <Badge className={`bg-${getZoneColor(zone.zone_type, zone.strength)} text-white`}>
                      {zone.strength.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-white font-bold">
                    ${Number(zone.price_level).toFixed(2)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Volume:</span>
                    <span className="text-white ml-1">${Number(zone.volume || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Big Orders:</span>
                    <span className="text-yellow-400 ml-1">{zone.big_orders_count || 0}</span>
                  </div>
                </div>
                
                {zone.is_market_maker_target && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-600 text-white text-xs">
                      🎯 Market Maker Target
                    </Badge>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No liquidity zones found
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          Liquidity zones show where big money is positioned
        </div>
      </CardContent>
    </Card>
  );
};
