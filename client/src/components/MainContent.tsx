import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Activity } from "lucide-react";

export default function MainContent() {
  const [btcPrice, setBtcPrice] = useState(67234.56);
  const [priceChange, setPriceChange] = useState(2.34);
  const [sentiment, setSentiment] = useState(75);
  const [news, setNews] = useState([
    { id: 1, text: "Bitcoin reaches new monthly high...", time: "12:34", type: "bullish" },
    { id: 2, text: "Market sentiment improving across...", time: "12:31", type: "neutral" },
    { id: 3, text: "Major exchange announces new features...", time: "12:28", type: "bullish" },
  ]);
  const [newsIndex, setNewsIndex] = useState(0);

  // Simulate price updates
  useEffect(() => {
    const priceInterval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      setBtcPrice(prev => Math.max(prev + change, 50000));
      setPriceChange(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 3000);

    return () => clearInterval(priceInterval);
  }, []);

  // Auto-scroll news
  useEffect(() => {
    const newsInterval = setInterval(() => {
      setNewsIndex(prev => (prev + 1) % news.length);
    }, 4000);

    return () => clearInterval(newsInterval);
  }, [news.length]);

  const handleBuy = () => {
    console.log('Buy order triggered');
    // Add particle effect or visual feedback
  };

  const handleSell = () => {
    console.log('Sell order triggered');
    // Add particle effect or visual feedback
  };

  return (
    <main className="flex-1 p-6 space-y-6 cyber-scrollbar overflow-y-auto">
      {/* Trading Chart Section */}
      <Card className="p-6 cyber-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-cyber cyber-glow">TRADING CHART</h2>
          <Badge className="pulse-glow">LIVE</Badge>
        </div>
        
        {/* Mock Chart Area */}
        <div className="bg-card/30 cyber-border rounded-lg p-6 mb-6" style={{ height: '300px' }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-lg font-cyber">CANDLESTICK CHART</p>
              <p className="text-sm text-muted-foreground font-mono">Real-time market data visualization</p>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center cyber-border">
            <div className="text-3xl font-cyber cyber-glow">
              ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm font-mono text-muted-foreground">BTC/USD</div>
          </Card>
          <Card className="p-4 text-center cyber-border">
            <div className={`text-2xl font-cyber ${priceChange >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
            <div className="text-sm font-mono text-muted-foreground">24h Change</div>
          </Card>
          <Card className="p-4 text-center cyber-border">
            <div className="text-2xl font-cyber text-cyber-gold">
              $2.1B
            </div>
            <div className="text-sm font-mono text-muted-foreground">Volume</div>
          </Card>
        </div>

        {/* Trading Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-cyber-success hover:bg-cyber-success/80 text-black font-cyber px-8 cyber-button"
            onClick={handleBuy}
            data-testid="button-buy"
          >
            <ArrowUp className="w-5 h-5 mr-2" />
            BUY
          </Button>
          <Button 
            size="lg" 
            className="bg-cyber-danger hover:bg-cyber-danger/80 text-white font-cyber px-8 cyber-button"
            onClick={handleSell}
            data-testid="button-sell"
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            SELL
          </Button>
        </div>
      </Card>

      {/* Market Sentiment */}
      <Card className="p-6 cyber-border">
        <h2 className="text-xl font-cyber cyber-glow mb-4">MARKET SENTIMENT</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-mono">BULLISH</span>
              <span className="text-sm font-mono">BEARISH</span>
            </div>
            <Progress value={sentiment} className="h-3" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-cyber cyber-glow">{sentiment}%</div>
            <div className="text-xs font-mono text-muted-foreground">CONFIDENCE</div>
          </div>
        </div>
      </Card>

      {/* Latest Updates */}
      <Card className="p-6 cyber-border">
        <h2 className="text-xl font-cyber cyber-glow mb-4">LATEST UPDATES</h2>
        <div className="bg-card/30 cyber-border rounded p-4">
          <div className="typewriter text-sm font-mono" key={newsIndex}>
            [{news[newsIndex].time}] {news[newsIndex].text}
          </div>
        </div>
      </Card>
    </main>
  );
}