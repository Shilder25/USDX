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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinGecko API error (${response.status}):`, errorText);
        return res.status(response.status || 500).json({ 
          error: `CoinGecko API error: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }
      
      // Try to parse as JSON directly
      try {
        const data = await response.json();
        res.json(data);
      } catch (parseError) {
        // If JSON parsing fails, read as text and return error
        const responseText = await response.text();
        console.error('Failed to parse CoinGecko JSON response:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse JSON response from CoinGecko',
          details: responseText
        });
      }
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Binance API error (${response.status}):`, errorText);
        return res.status(response.status || 500).json({ 
          error: `Binance API error: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }
      
      // Try to parse as JSON directly
      try {
        const data = await response.json();
        res.json(data);
      } catch (parseError) {
        // If JSON parsing fails, read as text and return error
        const responseText = await response.text();
        console.error('Failed to parse Binance JSON response:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse JSON response from Binance',
          details: responseText
        });
      }
    } catch (error) {
      console.error('Binance proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from Binance' });
    }
  });
}