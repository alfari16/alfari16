import { VercelRequest, VercelResponse } from "@vercel/node";
import { stats } from "../util/tictactoe";
import statsGreen from "../assets/stats_green";
import statsBlue from "../assets/stats_blue";

export default async (req: VercelRequest, res: VercelResponse) => {
  let { clicks: counter, ips } = await stats();
  let assets = statsGreen;

  const {
    query: { self },
    headers,
  } = req;

  const clientIp =
    (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
  if (self && clientIp) {
    counter = ips[clientIp] || 0;
    assets = statsBlue;
  }

  res.setHeader("Cache-Control", "no-cache, max-age=0");
  res.setHeader("Content-Type", "image/svg+xml");

  return res.send(assets(counter));
};
