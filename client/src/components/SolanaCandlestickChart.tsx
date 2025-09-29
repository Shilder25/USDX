import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { getCryptoCandles, CRYPTO_OPTIONS, type CandlestickData } from '@/lib/cryptoApi';
import { Loader as Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

ChartJS.register(
  TimeScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

interface CryptoCandlestickChartProps {
  onCryptoChange?: (cryptoId: string) => void;
}

export default function CryptoCandlestickChart({ onCryptoChange }: CryptoCandlestickChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState(0.25); // 15 minutes

  // Notify parent component when crypto changes
  const handleCryptoChange = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    onCryptoChange?.(cryptoId);
  };

  const { data: candleData, isLoading, error, refetch } = useQuery({
    queryKey: ['crypto-candles', selectedCrypto, selectedTimeframe],
    queryFn: () => getCryptoCandles(selectedCrypto, selectedTimeframe),
    refetchInterval: selectedTimeframe < 1 ? 30000 : 60000, // 30s for minute data, 1min for daily
  });

  const selectedCryptoInfo = CRYPTO_OPTIONS.find(crypto => crypto.id === selectedCrypto);

  useEffect(() => {
    if (!chartRef.current || !candleData) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartData = candleData.map((candle: CandlestickData) => ({
      x: candle.timestamp,
      o: candle.open,
      h: candle.high,
      l: candle.low,
      c: candle.close,
    }));

    // Calculate price trend
    const firstPrice = candleData[0]?.open || 0;
    const lastPrice = candleData[candleData.length - 1]?.close || 0;
    const isUpTrend = lastPrice > firstPrice;

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${selectedCryptoInfo?.symbol}/USD Candlestick Chart`,
          color: '#00d4ff',
          font: {
            family: 'Orbitron',
            size: 18,
            weight: 'bold',
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          titleColor: '#00d4ff',
          bodyColor: '#ffffff',
          borderColor: '#00d4ff',
          borderWidth: 2,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(context: any) {
              const date = new Date(context[0].parsed.x);
              if (selectedTimeframe < 1) {
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            },
            label: function(context: any) {
              const data = context.parsed;
              return [
                `Open: $${data.o.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                `High: $${data.h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                `Low: $${data.l.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                `Close: $${data.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
              ];
            }
          }
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: selectedTimeframe < 1 ? (selectedTimeframe <= 0.25 ? 'minute' : 'hour') : 
                  selectedTimeframe <= 7 ? 'day' : 'week',
            displayFormats: {
              minute: 'HH:mm',
              hour: 'MMM dd HH:mm',
              day: 'MMM dd',
              week: 'MMM dd'
            }
          },
          grid: {
            color: 'rgba(0, 212, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: '#00d4ff',
            font: {
              family: 'Roboto Mono',
              size: 11,
            },
            maxTicksLimit: selectedTimeframe < 1 ? 10 : 8,
          },
        },
        y: {
          type: 'linear',
          position: 'right',
          grid: {
            color: 'rgba(0, 212, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: '#00d4ff',
            font: {
              family: 'Roboto Mono',
              size: 11,
            },
            callback: function(value: any) {
              const numValue = Number(value);
              if (numValue >= 1000) {
                return '$' + (numValue / 1000).toFixed(1) + 'K';
              } else if (numValue >= 1) {
                return '$' + numValue.toFixed(2);
              } else {
                return '$' + numValue.toFixed(6);
              }
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart',
      },
    };

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: `${selectedCryptoInfo?.symbol}/USD`,
          data: chartData,
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 1,
          color: {
            up: '#00ff88',
            down: '#ff0044',
            unchanged: '#00d4ff',
          },
          borderColor: {
            up: '#00ff88',
            down: '#ff0044',
            unchanged: '#00d4ff',
          },
        }],
      },
      options,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [candleData, selectedTimeframe, selectedCrypto, selectedCryptoInfo]);

  const timeframes = [
    { label: '15m', days: 0.25 },
    { label: '1h', days: 0.042 }, // 1 hour
    { label: '4h', days: 0.167 }, // 4 hours
    { label: '1D', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
  ];

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="bg-card/30 cyber-border rounded-lg p-6 flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <p className="text-cyber-danger font-mono mb-4">Error loading chart data</p>
          <Button onClick={handleRefresh} variant="outline" className="cyber-button">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Crypto Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-muted-foreground">Asset:</span>
          <Select value={selectedCrypto} onValueChange={handleCryptoChange}>
            <SelectTrigger className="w-32 cyber-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRYPTO_OPTIONS.map((crypto) => (
                <SelectItem key={crypto.id} value={crypto.id}>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{crypto.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-muted-foreground">Period:</span>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.days}
                size="sm"
                variant={selectedTimeframe === tf.days ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(tf.days)}
                className={`font-mono text-xs ${
                  selectedTimeframe === tf.days
                    ? 'cyber-glow bg-primary'
                    : 'cyber-border hover:bg-primary/20'
                }`}
                data-testid={`timeframe-${tf.label.toLowerCase()}`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="cyber-border hover:bg-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {/* Chart Container */}
      <div className="bg-card/30 cyber-border rounded-lg p-4" style={{ height: '500px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-mono text-muted-foreground">
                Loading {selectedCryptoInfo?.symbol}/USD data...
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={chartRef}
            data-testid="crypto-chart"
            className="w-full h-full"
          />
        )}
      </div>

      {/* Chart Info */}
      {candleData && candleData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-card/20 cyber-border rounded p-3">
            <div className="text-xs font-mono text-muted-foreground">First</div>
            <div className="text-sm font-cyber">
              ${candleData[0].open.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })}
            </div>
          </div>
          <div className="bg-card/20 cyber-border rounded p-3">
            <div className="text-xs font-mono text-muted-foreground">Last</div>
            <div className="text-sm font-cyber">
              ${candleData[candleData.length - 1].close.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })}
            </div>
          </div>
          <div className="bg-card/20 cyber-border rounded p-3">
            <div className="text-xs font-mono text-muted-foreground">High</div>
            <div className="text-sm font-cyber text-cyber-success">
              ${Math.max(...candleData.map(c => c.high)).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })}
            </div>
          </div>
          <div className="bg-card/20 cyber-border rounded p-3">
            <div className="text-xs font-mono text-muted-foreground">Low</div>
            <div className="text-sm font-cyber text-cyber-danger">
              ${Math.min(...candleData.map(c => c.low)).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}