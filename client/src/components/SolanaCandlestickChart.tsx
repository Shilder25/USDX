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
import { getSolanaCandles, type CandlestickData } from '@/lib/cryptoApi';
import { Loader2 } from 'lucide-react';

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

export default function SolanaCandlestickChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(7);

  const { data: candleData, isLoading, error } = useQuery({
    queryKey: ['solana-candles', selectedTimeframe],
    queryFn: () => getSolanaCandles(selectedTimeframe),
    refetchInterval: 60000, // Refresh every minute
  });

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

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'SOL/USD Candlestick Chart',
          color: '#00d4ff',
          font: {
            family: 'Orbitron',
            size: 16,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(10, 10, 26, 0.9)',
          titleColor: '#00d4ff',
          bodyColor: '#ffffff',
          borderColor: '#00d4ff',
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              const data = context.parsed;
              return [
                `Open: $${data.o.toFixed(2)}`,
                `High: $${data.h.toFixed(2)}`,
                `Low: $${data.l.toFixed(2)}`,
                `Close: $${data.c.toFixed(2)}`
              ];
            }
          }
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: selectedTimeframe <= 1 ? 'hour' : 'day',
          },
          grid: {
            color: 'rgba(0, 212, 255, 0.1)',
          },
          ticks: {
            color: '#00d4ff',
            font: {
              family: 'Roboto Mono',
            },
          },
        },
        y: {
          type: 'linear',
          position: 'right',
          grid: {
            color: 'rgba(0, 212, 255, 0.1)',
          },
          ticks: {
            color: '#00d4ff',
            font: {
              family: 'Roboto Mono',
            },
            callback: function(value: any) {
              return '$' + value.toFixed(2);
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: 'SOL/USD',
          data: chartData,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 1,
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
  }, [candleData, selectedTimeframe]);

  const timeframes = [
    { label: '1D', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
  ];

  if (error) {
    return (
      <div className="bg-card/30 cyber-border rounded-lg p-6 flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <p className="text-cyber-danger font-mono">Error loading chart data</p>
          <p className="text-sm text-muted-foreground mt-2">Using fallback data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      <div className="flex justify-center space-x-2">
        {timeframes.map((tf) => (
          <button
            key={tf.days}
            onClick={() => setSelectedTimeframe(tf.days)}
            className={`px-3 py-1 text-xs font-mono rounded cyber-border transition-all ${
              selectedTimeframe === tf.days
                ? 'bg-primary text-primary-foreground cyber-glow'
                : 'bg-card hover:bg-card/80'
            }`}
            data-testid={`timeframe-${tf.label.toLowerCase()}`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-card/30 cyber-border rounded-lg p-4" style={{ height: '400px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm font-mono text-muted-foreground">Loading SOL/USD data...</p>
            </div>
          </div>
        ) : (
          <canvas
            ref={chartRef}
            data-testid="solana-chart"
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}