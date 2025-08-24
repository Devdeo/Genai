
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  // Popular Indian stocks with their instrument keys
  const stocks = [
    { symbol: "RELIANCE", key: "NSE_EQ|INE002A01018", sector: "Energy" },
    { symbol: "TCS", key: "NSE_EQ|INE467B01029", sector: "IT" },
    { symbol: "HDFCBANK", key: "NSE_EQ|INE040A01034", sector: "Banking" },
    { symbol: "INFY", key: "NSE_EQ|INE009A01021", sector: "IT" },
    { symbol: "ICICIBANK", key: "NSE_EQ|INE090A01021", sector: "Banking" },
    { symbol: "HINDUNILVR", key: "NSE_EQ|INE030A01027", sector: "FMCG" },
    { symbol: "ITC", key: "NSE_EQ|INE154A01025", sector: "FMCG" },
    { symbol: "SBIN", key: "NSE_EQ|INE062A01020", sector: "Banking" },
    { symbol: "BHARTIARTL", key: "NSE_EQ|INE397D01024", sector: "Telecom" },
    { symbol: "ASIANPAINT", key: "NSE_EQ|INE021A01026", sector: "Paints" },
    { symbol: "MARUTI", key: "NSE_EQ|INE585B01010", sector: "Auto" },
    { symbol: "KOTAKBANK", key: "NSE_EQ|INE237A01028", sector: "Banking" },
    { symbol: "LT", key: "NSE_EQ|INE018A01030", sector: "Infrastructure" },
    { symbol: "TITAN", key: "NSE_EQ|INE280A01028", sector: "Consumer" },
    { symbol: "AXISBANK", key: "NSE_EQ|INE238A01034", sector: "Banking" },
    { symbol: "ULTRACEMCO", key: "NSE_EQ|INE481G01011", sector: "Cement" },
    { symbol: "WIPRO", key: "NSE_EQ|INE075A01022", sector: "IT" },
    { symbol: "NESTLEIND", key: "NSE_EQ|INE239A01016", sector: "FMCG" },
    { symbol: "POWERGRID", key: "NSE_EQ|INE752E01010", sector: "Power" },
    { symbol: "NTPC", key: "NSE_EQ|INE733E01010", sector: "Power" },
    { symbol: "JSWSTEEL", key: "NSE_EQ|INE019A01038", sector: "Steel" },
    { symbol: "TATAMOTORS", key: "NSE_EQ|INE155A01022", sector: "Auto" },
    { symbol: "HCLTECH", key: "NSE_EQ|INE860A01027", sector: "IT" },
    { symbol: "BAJFINANCE", key: "NSE_EQ|INE296A01024", sector: "NBFC" }
  ];

  try {
    const heatmapData = [];
    
    // Fetch data for all stocks in parallel
    const promises = stocks.map(async (stock) => {
      try {
        const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(stock.key)}`;
        const response = await axios.get(url, {
          headers: { 
            Authorization: auth, 
            Accept: "application/json",
            "Api-Version": "2.0"
          },
        });

        const data = response.data?.data?.[stock.key];
        if (data) {
          const ltp = data.last_price || 0;
          const change = data.net_change || 0;
          const changePercent = data.change_percent || 0;
          
          return {
            symbol: stock.symbol,
            sector: stock.sector,
            price: ltp,
            change: change,
            changePercent: changePercent,
            volume: data.volume || 0,
            marketCap: ltp * (data.total_buy_quantity + data.total_sell_quantity) // Approximation
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching data for ${stock.symbol}:`, error.response?.data);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);

    res.status(200).json({
      status: "success",
      data: validResults,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Heatmap API Error:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
}
