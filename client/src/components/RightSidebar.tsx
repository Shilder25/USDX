import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, MessageSquare, TrendingUp, User } from "lucide-react";
import cyberAvatar from "@assets/generated_images/Cyberpunk_trader_avatar_9c40e50f.png";

export default function RightSidebar() {
  const [portfolioValues] = useState([
    { name: 'BTC', value: 65, color: 'hsl(var(--chart-1))' },
    { name: 'ETH', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'SOL', value: 10, color: 'hsl(var(--chart-3))' },
  ]);

  const [topTraders] = useState([
    { rank: 1, name: 'CyberTrader_X', profit: '+234.5%', avatar: '🤖' },
    { rank: 2, name: 'Matrix_Alpha', profit: '+187.2%', avatar: '🔥' },
    { rank: 3, name: 'Neo_Crypto', profit: '+156.8%', avatar: '⚡' },
    { rank: 4, name: 'CodeRunner', profit: '+142.3%', avatar: '💎' },
    { rank: 5, name: 'DigitalNinja', profit: '+128.9%', avatar: '🚀' },
  ]);

  const [socialFeed] = useState([
    { id: 1, user: 'CryptoGuru', message: 'Major bullish breakout incoming! 🚀', time: '2m' },
    { id: 2, user: 'TechAnalyst', message: 'RSI showing oversold conditions', time: '5m' },
    { id: 3, user: 'WhaleWatcher', message: 'Large BTC transfer detected 👀', time: '8m' },
    { id: 4, user: 'MarketMaker', message: 'Volume spike in altcoins', time: '12m' },
  ]);

  const handleProfileEdit = () => {
    console.log('Profile edit triggered');
  };

  const handleSocialInteraction = (feedId: number) => {
    console.log(`Social interaction with feed ${feedId}`);
  };

  return (
    <aside className="w-full h-full bg-sidebar cyber-border p-4 space-y-4 cyber-scrollbar overflow-y-auto">
      {/* User Profile Card */}
      <Card className="p-4 cyber-border">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3 cyber-border">
            <AvatarImage src={cyberAvatar} alt="User Avatar" />
            <AvatarFallback>CX</AvatarFallback>
          </Avatar>
          <h3 className="font-cyber text-lg cyber-glow">CYBER_TRADER_01</h3>
          <p className="text-sm font-mono text-muted-foreground mb-3">Elite Member</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="text-center">
              <div className="text-cyber-gold font-cyber">$47.2K</div>
              <div className="text-muted-foreground">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-cyber-success font-cyber">+23.4%</div>
              <div className="text-muted-foreground">P&L</div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-3 w-full font-mono"
            onClick={handleProfileEdit}
            data-testid="button-edit-profile"
          >
            <User className="w-3 h-3 mr-1" />
            EDIT PROFILE
          </Button>
        </div>
      </Card>

      {/* Portfolio Pie Chart */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4">PORTFOLIO</h2>
        <div className="space-y-3">
          {portfolioValues.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm font-mono">
                <span>{item.name}</span>
                <span>{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="text-2xl font-cyber cyber-glow">$47.2K</div>
          <div className="text-xs font-mono text-muted-foreground">Total Value</div>
        </div>
      </Card>

      {/* Top Traders Leaderboard */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          TOP TRADERS
        </h2>
        <div className="space-y-2">
          {topTraders.map((trader) => (
            <div key={trader.rank} className="flex items-center justify-between p-2 rounded bg-card/50 cyber-border">
              <div className="flex items-center space-x-2">
                <Badge className="w-6 h-6 rounded-full text-xs p-0 flex items-center justify-center">
                  {trader.rank}
                </Badge>
                <span className="text-xs font-mono">{trader.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-cyber text-cyber-success">{trader.profit}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Social Feed */}
      <Card className="p-4 cyber-border">
        <h2 className="text-lg font-cyber cyber-glow mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          SOCIAL FEED
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {socialFeed.map((post) => (
            <div 
              key={post.id} 
              className="p-2 rounded bg-card/50 cyber-border cursor-pointer hover-elevate"
              onClick={() => handleSocialInteraction(post.id)}
              data-testid={`social-post-${post.id}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-cyber-blue">{post.user}</span>
                <span className="text-xs text-muted-foreground">{post.time}</span>
              </div>
              <p className="text-xs font-mono">{post.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </aside>
  );
}