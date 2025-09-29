import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy routes for external APIs to avoid CORS issues
  
  // CoinGecko proxy routes
  app.get('/api/proxy/coingecko/*', async (req, res) => {
    try {
      const path = req.params[0];
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `https://api.coingecko.com/api/v3/${path}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
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
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      console.error('Binance proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from Binance' });
    }
  });


  const httpServer = createServer(app);

  return httpServer;
}
