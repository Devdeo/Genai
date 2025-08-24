
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing access token" });

  try {
    // Get current month Nifty option contracts
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Sample Nifty option instrument keys (these would need to be updated with actual current month options)
    const niftyOptions = [
      `NSE_FO|NIFTY${currentYear}${currentMonth.toString().padStart(2, '0')}22000CE`,
      `NSE_FO|NIFTY${currentYear}${currentMonth.toString().padStart(2, '0')}22000PE`,
      `NSE_FO|NIFTY${currentYear}${currentMonth.toString().padStart(2, '0')}22500CE`,
      `NSE_FO|NIFTY${currentYear}${currentMonth.toString().padStart(2, '0')}22500PE`,
    ];

    const optionData = [];

    for (const instrumentKey of niftyOptions) {
      try {
        const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKey)}`;
        
        const response = await axios.get(url, {
          headers: { 
            Authorization: auth, 
            Accept: "application/json",
            "Api-Version": "2.0"
          },
        });

        if (response.data && response.data.data && response.data.data[instrumentKey]) {
          const quoteData = response.data.data[instrumentKey];
          
          // Extract Greeks information if available
          const optionInfo = {
            instrument_key: instrumentKey,
            symbol: instrumentKey.split('|')[1],
            last_price: quoteData.last_price,
            net_change: quoteData.net_change,
            percent_change: quoteData.percent_change,
            volume: quoteData.volume,
            open_interest: quoteData.oi,
            bid_price: quoteData.bid_price,
            ask_price: quoteData.ask_price,
            // Note: Upstox may not provide Greeks directly in market quote
            // These would typically come from a specialized derivatives data feed
            delta: null, // Would need specialized endpoint
            gamma: null, // Would need specialized endpoint
            theta: null, // Would need specialized endpoint
            vega: null,  // Would need specialized endpoint
            iv: null     // Implied volatility would need specialized endpoint
          };

          optionData.push(optionInfo);
        }
      } catch (optionError) {
        console.error(`Error fetching data for ${instrumentKey}:`, optionError);
      }
    }

    if (optionData.length === 0) {
      // Return mock Greeks data if no real data is available
      const mockGreeksData = {
        status: "success",
        message: "Mock data - Real Greeks require specialized derivatives data feed",
        data: [
          {
            instrument_key: "NSE_FO|NIFTY202401022000CE",
            symbol: "NIFTY202401022000CE",
            strike_price: 22000,
            option_type: "CE",
            expiry: "2024-01-25",
            last_price: 185.50,
            net_change: 12.30,
            percent_change: 7.12,
            volume: 245600,
            open_interest: 1250000,
            greeks: {
              delta: 0.6725,
              gamma: 0.0015,
              theta: -8.45,
              vega: 18.25,
              iv: 0.1875
            }
          },
          {
            instrument_key: "NSE_FO|NIFTY202401022000PE",
            symbol: "NIFTY202401022000PE",
            strike_price: 22000,
            option_type: "PE",
            expiry: "2024-01-25",
            last_price: 24.75,
            net_change: -3.25,
            percent_change: -11.61,
            volume: 189400,
            open_interest: 980000,
            greeks: {
              delta: -0.3275,
              gamma: 0.0015,
              theta: -6.15,
              vega: 18.25,
              iv: 0.1925
            }
          }
        ]
      };

      return res.status(200).json(mockGreeksData);
    }

    res.status(200).json({
      status: "success",
      data: optionData,
      note: "Greeks data may require specialized derivatives data feed from Upstox"
    });

  } catch (err: any) {
    console.error("Upstox Greeks API Error:", err.response?.data);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
}
