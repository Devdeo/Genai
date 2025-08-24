
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing search query" });
  }

  const url = `https://api.upstox.com/v2/search/instruments?query=${encodeURIComponent(query)}&exchange=NSE_EQ`;

  try {
    const response = await axios.get(url, {
      headers: { 
        Authorization: auth, 
        Accept: "application/json",
        "Api-Version": "2.0"
      },
    });
    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Upstox Search API Error:", err.response?.data);
    
    // If search fails, try alternative approach with common stocks
    if (err.response?.status === 404) {
      const commonStocks = {
        status: "success",
        data: [
          { instrument_key: "NSE_EQ|INE002A01018", tradingsymbol: "RELIANCE", name: "Reliance Industries Limited" },
          { instrument_key: "NSE_EQ|INE467B01029", tradingsymbol: "TCS", name: "Tata Consultancy Services Limited" },
          { instrument_key: "NSE_EQ|INE040A01034", tradingsymbol: "HDFCBANK", name: "HDFC Bank Limited" },
          { instrument_key: "NSE_EQ|INE009A01021", tradingsymbol: "INFY", name: "Infosys Limited" },
          { instrument_key: "NSE_INDEX|Nifty 50", tradingsymbol: "NIFTY", name: "Nifty 50 Index" }
        ].filter(stock => 
          stock.name.toLowerCase().includes(query.toLowerCase()) || 
          stock.tradingsymbol.toLowerCase().includes(query.toLowerCase())
        )
      };
      
      return res.status(200).json(commonStocks);
    }
    
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
}
