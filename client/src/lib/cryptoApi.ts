// Crypto API service using CoinGecko (free API)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

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

export async function getSolanaPrice(): Promise<CryptoPrice> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    
    const data = await response.json();
    const solanaData = data.solana;
    
    return {
      current_price: solanaData.usd,
      price_change_24h: solanaData.usd_24h_change || 0,
      price_change_percentage_24h: solanaData.usd_24h_change || 0,
      total_volume: solanaData.usd_24h_vol || 0,
      market_cap: solanaData.usd_market_cap || 0,
    };
  } catch (error) {
    console.error('Error fetching Solana price:', error);
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

export async function getSolanaCandles(days: number = 7): Promise<CandlestickData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/solana/ohlc?vs_currency=usd&days=${days}`
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
    console.error('Error fetching Solana candles:', error);
    // Fallback candlestick data
    return generateFallbackCandles();
  }
}

function generateFallbackCandles(): CandlestickData[] {
  const candles: CandlestickData[] = [];
  let price = 156.78;
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