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
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
          } else {
            errorDetails = await response.text();
          }
        } catch (parseError) {
          errorDetails = 'Unable to parse error response';
        }
        console.error(`CoinGecko API error (${response.status}):`, errorDetails);
        return res.status(response.status || 500).json({ 
          error: `CoinGecko API error: ${response.status} ${response.statusText}`,
          details: errorDetails
        });
      }
      
      // Check content type before parsing
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          res.json(data);
        } else {
          const responseText = await response.text();
          console.error('CoinGecko returned non-JSON response:', responseText);
          return res.status(500).json({ 
            error: 'CoinGecko returned non-JSON response',
            details: responseText
          });
        }
      } catch (parseError) {
        console.error('Failed to parse CoinGecko JSON response:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse JSON response from CoinGecko',
          details: parseError.message
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
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
          } else {
            errorDetails = await response.text();
          }
        } catch (parseError) {
          errorDetails = 'Unable to parse error response';
        }
        console.error(`Binance API error (${response.status}):`, errorDetails);
        return res.status(response.status || 500).json({ 
          error: `Binance API error: ${response.status} ${response.statusText}`,
          details: errorDetails
        });
      }
      
      // Check content type before parsing
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          res.json(data);
        } else {
          const responseText = await response.text();
          console.error('Binance returned non-JSON response:', responseText);
          return res.status(500).json({ 
            error: 'Binance returned non-JSON response',
            details: responseText
          });
        }
      } catch (parseError) {
        console.error('Failed to parse Binance JSON response:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse JSON response from Binance',
          details: parseError.message
        });
      }
    } catch (error) {
      console.error('Binance proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from Binance' });
    }
  });
}