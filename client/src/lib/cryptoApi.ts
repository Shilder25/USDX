// Crypto API service using CoinGecko (free API)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

// Available cryptocurrencies
export const CRYPTO_OPTIONS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
];

// Binance symbol mapping
const BINANCE_SYMBOLS: Record<string, string> = {
  'bitcoin': 'BTCUSDT',
  'solana': 'SOLUSDT',
};

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CryptoPrice {
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  symbol?: string;
}

export interface LiveMarketData {
  symbol: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
}

export async function getCryptoPrice(cryptoId: string = 'solana'): Promise<CryptoPrice> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    
    const data = await response.json();
    const cryptoData = data[cryptoId];
    
    return {
      current_price: cryptoData.usd,
      price_change_24h: cryptoData.usd_24h_change || 0,
      price_change_percentage_24h: cryptoData.usd_24h_change || 0,
      total_volume: cryptoData.usd_24h_vol || 0,
      market_cap: cryptoData.usd_market_cap || 0,
      symbol: CRYPTO_OPTIONS.find(c => c.id === cryptoId)?.symbol || '',
    };
  } catch (error) {
    console.error(`Error fetching ${cryptoId} price:`, error);
    // Fallback data
    const fallbackData: Record<string, CryptoPrice> = {
      'bitcoin': {
        current_price: 67234.56,
        price_change_24h: 1567.89,
        price_change_percentage_24h: 2.34,
        total_volume: 28500000000,
        market_cap: 1320000000000,
        symbol: 'BTC',
      },
      'solana': {
        current_price: 156.78,
        price_change_24h: -1.23,
        price_change_percentage_24h: -0.89,
        total_volume: 2100000000,
        market_cap: 73000000000,
        symbol: 'SOL',
      },
    };
    
    return fallbackData[cryptoId] || fallbackData['solana'];
}

// Get minute-level data from Binance API
export async function getCryptoMinuteCandles(cryptoId: string = 'solana', interval: string = '1m', limit: number = 100): Promise<CandlestickData[]> {
  try {
    const symbol = BINANCE_SYMBOLS[cryptoId];
    if (!symbol) {
      throw new Error(`Symbol not supported for minute data: ${cryptoId}`);
    }

    const response = await fetch(
      `${BINANCE_BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch minute candlestick data');
    }
    
    const data = await response.json();
    
    return data.map((candle: any[]) => ({
      timestamp: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));
  } catch (error) {
    console.error(`Error fetching ${cryptoId} minute candles:`, error);
    return generateFallbackMinuteCandles(cryptoId, interval, limit);
  }
}

function generateFallbackMinuteCandles(cryptoId: string = 'solana', interval: string = '1m', limit: number = 100): CandlestickData[] {
  const candles: CandlestickData[] = [];
  
  const basePrices: Record<string, number> = {
    bitcoin: 67234.56,
    solana: 156.78,
  };
  
  let price = basePrices[cryptoId] || 156.78;
  const now = Date.now();
  
  // Convert interval to milliseconds
  const intervalMs = interval === '1m' ? 60000 : 
                    interval === '5m' ? 300000 : 
                    interval === '15m' ? 900000 : 
                    interval === '1h' ? 3600000 : 60000;

  for (let i = limit; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const volatility = 0.001; // 0.1% volatility for minute data
    
    const open = price;
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    const high = open + Math.abs(change) + (Math.random() * 0.0005 * price);
    const low = open - Math.abs(change) - (Math.random() * 0.0005 * price);
    const close = open + change;
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000 + 500000,
    });
    
    price = close;
  }
  
  return candles;
}

export async function getCryptoCandles(cryptoId: string = 'solana', days: number = 7): Promise<CandlestickData[]> {
  try {
    // For minute/hour data, use Binance API
    if (days < 1) {
      const hours = days * 24;
      const minutes = hours * 60;
      
      if (minutes <= 60) {
        return getCryptoMinuteCandles(cryptoId, '1m', Math.min(minutes, 100));
      } else if (minutes <= 300) {
        return getCryptoMinuteCandles(cryptoId, '5m', Math.min(Math.floor(minutes / 5), 100));
      } else if (minutes <= 900) {
        return getCryptoMinuteCandles(cryptoId, '15m', Math.min(Math.floor(minutes / 15), 100));
      } else {
        return getCryptoMinuteCandles(cryptoId, '1h', Math.min(Math.floor(hours), 100));
      }
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${cryptoId}/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch candlestick data');
    }
    
    const data = await response.json();
    
    return data.map((candle: number[]) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
    }));
  } catch (error) {
    console.error(`Error fetching ${cryptoId} candles:`, error);
    // Fallback candlestick data
    return generateFallbackCandles(cryptoId);
  }
}

function generateFallbackCandles(cryptoId: string = 'solana'): CandlestickData[] {
  const candles: CandlestickData[] = [];
  
  // Different base prices for different cryptos
  const basePrices: Record<string, number> = {
    bitcoin: 67234.56,
    solana: 156.78,
  };
  
  let price = basePrices[cryptoId] || 156.78;
  const now = Date.now();
  const interval = 4 * 60 * 60 * 1000; // 4 hours

  for (let i = 168; i >= 0; i--) { // 7 days of 4-hour candles
    const timestamp = now - (i * interval);
    const volatility = 0.02; // 2% volatility
    
    const open = price;
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    const high = open + Math.abs(change) + (Math.random() * 0.01 * price);
    const low = open - Math.abs(change) - (Math.random() * 0.01 * price);
    const close = open + change;
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
    });
    
    price = close;
  }
  
  return candles;
}

// Get live market data for sidebar
export async function getLiveMarketData(): Promise<LiveMarketData[]> {
  try {
    // Get both BTC and SOL prices
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch live market data');
    }
    
    const data = await response.json();
    const result: LiveMarketData[] = [];
    
    // Bitcoin
    if (data.bitcoin) {
      const btc = data.bitcoin;
      result.push({
        symbol: 'BTC/USD',
        price: `$${btc.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: `${btc.usd_24h_change >= 0 ? '+' : ''}${btc.usd_24h_change.toFixed(2)}%`,
        trend: btc.usd_24h_change >= 0 ? 'up' : 'down',
      });
    }
    
    // Solana
    if (data.solana) {
      const sol = data.solana;
      result.push({
        symbol: 'SOL/USD',
        price: `$${sol.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: `${sol.usd_24h_change >= 0 ? '+' : ''}${sol.usd_24h_change.toFixed(2)}%`,
        trend: sol.usd_24h_change >= 0 ? 'up' : 'down',
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching live market data:', error);
    // Fallback data
    return [
      {
        symbol: 'BTC/USD',
        price: '$67,234.56',
        change: '+2.34%',
        trend: 'up',
      },
      {
        symbol: 'SOL/USD',
        price: '$156.78',
        change: '-0.89%',
        trend: 'down',
      }
    ];
  }
}

// Get multiple crypto prices at once
export async function getMultipleCryptoPrices(cryptoIds: string[]): Promise<Record<string, CryptoPrice>> {
  try {
    const idsString = cryptoIds.join(',');
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch multiple crypto prices');
    }
    
    const data = await response.json();
    const result: Record<string, CryptoPrice> = {};
    
    for (const cryptoId of cryptoIds) {
      if (data[cryptoId]) {
        const cryptoData = data[cryptoId];
        result[cryptoId] = {
          current_price: cryptoData.usd,
          price_change_24h: cryptoData.usd_24h_change || 0,
          price_change_percentage_24h: cryptoData.usd_24h_change || 0,
          total_volume: cryptoData.usd_24h_vol || 0,
          market_cap: cryptoData.usd_market_cap || 0,
          symbol: CRYPTO_OPTIONS.find(c => c.id === cryptoId)?.symbol || '',
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
    return {};
  }
}