import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function callback(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const tokenRes = await axios.post(
      "https://api.upstox.com/v2/oauth2/token",
      {
        code,
        client_id: process.env.UPSTOX_CLIENT_ID,
        client_secret: process.env.UPSTOX_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    // redirect to /market with token in query
    res.redirect(`/market?access_token=${accessToken}`);
  } catch (err: any) {
    res.status(500).json(err.response?.data || { error: err.message });
  }
}
