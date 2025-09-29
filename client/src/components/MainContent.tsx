import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCryptoPrice, getMarketSentiment, type MarketSentiment } from "@/lib/cryptoApi";
import CryptoCandlestickChart from "./SolanaCandlestickChart";

export default function MainContent() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin'); // Track selected crypto from chart
  const [news, setNews] = useState([
    { id: 1, text: "Bitcoin showing strong institutional adoption...", time: "12:34", type: "bullish" },
    { id: 2, text: "BTC breaks key resistance level at $67K...", time: "12:31", type: "bullish" },
    { id: 3, text: "Major crypto exchange adds new features...", time: "12:28", type: "neutral" },
  ]);
  const [newsIndex, setNewsIndex] = useState(0);

  // Fetch real crypto price data based on selected crypto
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['crypto-price', selectedCrypto],
    queryFn: () => getCryptoPrice(selectedCrypto),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Fetch real market sentiment
  const { data: sentimentData } = useQuery({
    queryKey: ['market-sentiment'],
    queryFn: () => getMarketSentiment(['bitcoin', 'solana']),
    refetchInterval: 60000, // Refresh every minute
  });

  // Listen for crypto selection changes from the chart component
  useEffect(() => {
    const handleCryptoChange = (event: CustomEvent) => {
      setSelectedCrypto(event.detail.cryptoId);
    };

    window.addEventListener('cryptoSelectionChanged', handleCryptoChange as EventListener);
    return () => {
      window.removeEventListener('cryptoSelectionChanged', handleCryptoChange as EventListener);
    };
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

  // Get crypto symbol for display
  const cryptoSymbol = selectedCrypto === 'bitcoin' ? 'BTC' : 'SOL';

  return (
    <main className="flex-1 p-6 space-y-6 cyber-scrollbar overflow-y-auto">
      {/* Trading Chart Section */}
      <Card className="p-6 cyber-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-cyber cyber-glow">TRADING CHART</h2>
          <Badge className="pulse-glow">LIVE</Badge>
        </div>
        
        {/* Real Crypto Candlestick Chart */}
        <CryptoCandlestickChart onCryptoChange={setSelectedCrypto} />

        {/* Price Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center cyber-border">
            <div className="text-3xl font-cyber cyber-glow">
              ${isLoading ? '...' : priceData?.current_price.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: selectedCrypto === 'bitcoin' ? 2 : 4
              }) || (selectedCrypto === 'bitcoin' ? '42,150.75' : '98.32')}
            </div>
            <div className="text-sm font-mono text-muted-foreground">{cryptoSymbol}/USD</div>
          </Card>
          <Card className="p-4 text-center cyber-border">
            <div className={`text-2xl font-cyber ${(priceData?.price_change_percentage_24h || 0) >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
              {isLoading ? '...' : `${(priceData?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}${(priceData?.price_change_percentage_24h || (selectedCrypto === 'bitcoin' ? -2.88 : 2.23)).toFixed(2)}%`}
            </div>
            <div className="text-sm font-mono text-muted-foreground">24h Change</div>
          </Card>
          <Card className="p-4 text-center cyber-border">
            <div className="text-2xl font-cyber text-cyber-gold">
              ${isLoading ? '...' : (priceData?.total_volume ? 
                (priceData.total_volume / 1000000000).toFixed(1) + 'B' : 
                (selectedCrypto === 'bitcoin' ? '18.5B' : '1.9B'))}
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
            BUY {cryptoSymbol}
          </Button>
          <Button 
            size="lg" 
            className="bg-cyber-danger hover:bg-cyber-danger/80 text-white font-cyber px-8 cyber-button"
            onClick={handleSell}
            data-testid="button-sell"
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            SELL {cryptoSymbol}
          </Button>
        </div>
      </Card>

      {/* Market Sentiment */}
      <Card className="p-6 cyber-border">
        <h2 className="text-xl font-cyber cyber-glow mb-4">MARKET SENTIMENT</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {sentimentData?.trend === 'bullish' ? (
                <TrendingUp className="w-5 h-5 text-cyber-success" />
              ) : sentimentData?.trend === 'bearish' ? (
                <TrendingDown className="w-5 h-5 text-cyber-danger" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-cyber-gold" />
              )}
              <span className="text-sm font-mono text-muted-foreground">
                {sentimentData?.trend?.toUpperCase() || 'NEUTRAL'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-cyber cyber-glow">
                {sentimentData?.bullish || 75}%
              </div>
              <div className="text-xs font-mono text-muted-foreground">BULLISH</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-mono">BULLISH</span>
              <span className="text-sm font-mono">BEARISH</span>
            </div>
            <Progress value={sentimentData?.bullish || 75} className="h-3" />
            <div className="flex justify-between mt-1 text-xs font-mono text-muted-foreground">
              <span>{sentimentData?.bullish || 75}%</span>
              <span>{sentimentData?.bearish || 25}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-sm font-mono text-muted-foreground">CONFIDENCE</span>
            <div className="text-lg font-cyber text-cyber-gold">
              {sentimentData?.confidence || 85}%
            </div>
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