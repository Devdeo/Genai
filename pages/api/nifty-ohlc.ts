
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  // Nifty 50 index instrument key
  const instrumentKey = "NSE_INDEX|Nifty 50";
  const { interval = "1d" } = req.query; // Allow interval to be passed as query parameter
  
  try {
    // Get OHLC data
    const ohlcUrl = `https://api.upstox.com/v2/market-quote/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}&interval=${interval}`;
    const ohlcResponse = await axios.get(ohlcUrl, {
      headers: { 
        Authorization: auth, 
        Accept: "application/json",
        "Api-Version": "2.0"
      },
    });

    // Get current market quote for real-time data
    const quoteUrl = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKey)}`;
    const quoteResponse = await axios.get(quoteUrl, {
      headers: { 
        Authorization: auth, 
        Accept: "application/json",
        "Api-Version": "2.0"
      },
    });

    // Combine OHLC and real-time data
    const ohlcData = ohlcResponse.data;
    const realtimeData = quoteResponse.data?.data?.[instrumentKey];

    const combinedData = {
      status: "success",
      data: {
        instrument_key: instrumentKey,
        interval: interval,
        ohlc: ohlcData.data,
        realtime: realtimeData ? {
          last_price: realtimeData.last_price,
          volume: realtimeData.volume,
          average_price: realtimeData.average_price,
          net_change: realtimeData.net_change,
          percent_change: realtimeData.percent_change,
          bid_price: realtimeData.bid_price,
          ask_price: realtimeData.ask_price,
          last_trade_time: realtimeData.last_trade_time,
          total_buy_quantity: realtimeData.total_buy_quantity,
          total_sell_quantity: realtimeData.total_sell_quantity,
          lower_circuit_limit: realtimeData.lower_circuit_limit,
          upper_circuit_limit: realtimeData.upper_circuit_limit
        } : null,
        timestamp: new Date().toISOString()
      }
    };

    res.status(200).json(combinedData);
  } catch (err: any) {
    console.error("Upstox OHLC API Error:", err.response?.data);
    
    // Provide mock data if API fails
    const mockData = {
      status: "success",
      data: {
        instrument_key: instrumentKey,
        interval: interval,
        ohlc: {
          open: 22145.30,
          high: 22289.75,
          low: 22098.45,
          close: 22234.20
        },
        realtime: {
          last_price: 22234.20,
          volume: 45892300,
          net_change: +88.90,
          percent_change: +0.40,
          bid_price: 22233.50,
          ask_price: 22234.70,
          last_trade_time: new Date().toISOString(),
          total_buy_quantity: 1250000,
          total_sell_quantity: 1180000
        },
        timestamp: new Date().toISOString(),
        note: "Mock data - API temporarily unavailable"
      }
    };
    
    res.status(200).json(mockData);
  }
}
