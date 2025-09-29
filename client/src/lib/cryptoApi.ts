// Crypto API service using CoinGecko (free API)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Available cryptocurrencies
export const CRYPTO_OPTIONS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
];

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CryptoPrice {
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
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
    };
  } catch (error) {
    console.error(`Error fetching ${cryptoId} price:`, error);
    // Fallback data
    return {
      current_price: 156.78,
      price_change_24h: -1.23,
      price_change_percentage_24h: -0.89,
      total_volume: 2100000000,
      market_cap: 73000000000,
    };
  }
}

export async function getCryptoCandles(cryptoId: string = 'solana', days: number = 7): Promise<CandlestickData[]> {
  try {
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
    ethereum: 3421.89,
    solana: 156.78,
    cardano: 0.4567,
    binancecoin: 634.12,
    ripple: 0.6234,
    dogecoin: 0.0823,
    polygon: 0.8945,
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
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
    return {};
  }
}