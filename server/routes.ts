import type { Express } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express): void {
  // Proxy routes for external APIs to avoid CORS issues
  
  // CoinGecko proxy routes
  app.get('/api/proxy/coingecko/*', async (req, res) => {
    try {
      const path = req.params[0];
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `https://api.coingecko.com/api/v3/${path}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      // Check Content-Type header
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error(`CoinGecko API returned non-JSON content (${response.status}):`, contentType, errorText);
        return res.status(response.status || 500).json({ 
          error: `CoinGecko API returned non-JSON content: ${contentType}`,
          details: errorText
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinGecko API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `CoinGecko API error: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('CoinGecko proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from CoinGecko' });
    }
  });
  
  // Binance proxy routes
  app.get('/api/proxy/binance/*', async (req, res) => {
    try {
      const path = req.params[0];
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `https://api.binance.com/api/v3/${path}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      // Check Content-Type header
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error(`Binance API returned non-JSON content (${response.status}):`, contentType, errorText);
        return res.status(response.status || 500).json({ 
          error: `Binance API returned non-JSON content: ${contentType}`,
          details: errorText
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Binance API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `Binance API error: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Binance proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from Binance' });
    }
  });
}