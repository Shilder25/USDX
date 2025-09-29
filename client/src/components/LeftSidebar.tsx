import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Settings, User, ChartBar as BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLiveMarketData } from "@/lib/cryptoApi";
import cryptoMeme1 from "@assets/generated_images/Crypto_meme_placeholder_b0373b09.png";
import cryptoMeme2 from "@assets/generated_images/Ethereum_meme_placeholder_dd48646c.png";

export default function LeftSidebar() {
  const [activeNav, setActiveNav] = useState('trading');
  const [currentMeme, setCurrentMeme] = useState(0);
  
  const memes = [cryptoMeme1, cryptoMeme2];

  const navItems = [
    { id: 'trading', label: 'TRADING', icon: TrendingUp },
    { id: 'portfolio', label: 'PORTFOLIO', icon: BarChart3 },
    { id: 'analytics', label: 'ANALYTICS', icon: Activity },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  // Fetch real market data
  const { data: marketTickers, isLoading: marketLoading } = useQuery({
    queryKey: ['live-market-data'],
    queryFn: getLiveMarketData,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    console.log(`Navigation clicked: ${navId}`);
  };

  const rotateMeme = () => {
    setCurrentMeme((prev) => (prev + 1) % memes.length);
    console.log('Meme rotated');
  };

  return (
    <aside className="w-full h-full bg-sidebar cyber-border p-4 space-y-4 cyber-scrollbar overflow-y-auto">
      {/* Navigation Panel */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4">NAVIGATION</h2>
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start font-mono text-xs ${isActive ? 'cyber-glow' : ''}`}
                onClick={() => handleNavClick(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Status Indicators */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4">STATUS</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">CONNECTION</span>
            <Badge className="pulse-glow bg-cyber-success">ONLINE</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">TRADING</span>
            <Badge className="pulse-glow bg-cyber-success">ACTIVE</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">ALERTS</span>
            <Badge className="pulse-glow bg-cyber-gold">3 NEW</Badge>
          </div>
        </div>
      </Card>

      {/* Live Market Ticker */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4">LIVE MARKET</h2>
        {marketLoading ? (
          <div className="space-y-2">
            <div className="animate-pulse bg-card/30 h-12 rounded"></div>
            <div className="animate-pulse bg-card/30 h-12 rounded"></div>
          </div>
        ) : (
          <div className="space-y-2 text-xs font-mono">
            {marketTickers && marketTickers.length > 0 ? marketTickers.map((ticker, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded bg-card/50 cyber-border">
                <span className="text-foreground font-cyber">{ticker.symbol}</span>
                <div className="text-right">
                  <div className="text-foreground font-mono">{ticker.price}</div>
                  <div className={`font-mono ${ticker.trend === 'up' ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                    {ticker.change}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground">
                <div className="text-xs">Loading market data...</div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Meme Corner */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4">MEME CORNER</h2>
        <div className="text-center">
          <img 
            src={memes[currentMeme]} 
            alt="Crypto Meme" 
            className="w-full aspect-square object-cover rounded cyber-border cursor-pointer"
            onClick={rotateMeme}
            data-testid="meme-image"
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2 w-full font-mono text-xs"
            onClick={rotateMeme}
            data-testid="button-rotate-meme"
          >
            <Zap className="w-3 h-3 mr-1" />
            ROTATE
          </Button>
        </div>
      </Card>
    </aside>
  );
}