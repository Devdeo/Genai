
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  // Example Nifty Call option instrument key (you may need to update this with current month/strike)
  // Format: NSE_FO|[ISIN] where ISIN is the option contract identifier
  // This is a sample - you'll need to get the actual current month option ISIN
  const instrumentKey = "NSE_FO|INE009A01021"; // Example Nifty option - update with actual option ISIN
  const url = `https://api.upstox.com/v2/option/greeks?instrument_key=${encodeURIComponent(instrumentKey)}`;

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
    console.error("Upstox Greeks API Error:", err.response?.data);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
}
