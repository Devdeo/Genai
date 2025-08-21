import type { NextApiRequest, NextApiResponse } from "next";

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI!);
  const clientId = process.env.UPSTOX_CLIENT_ID!;
  const url = `https://api.upstox.com/v2/login/authorization/dialog?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  res.redirect(url);
}
