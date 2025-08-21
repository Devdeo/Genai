
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  // Nifty 50 index instrument key
  const instrumentKey = "NSE_INDEX|Nifty 50";
  const url = `https://api.upstox.com/v2/market-quote/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}`;

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
    console.error("Upstox OHLC API Error:", err.response?.data);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
}
