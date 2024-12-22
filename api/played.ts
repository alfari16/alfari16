import { NowRequest, NowResponse } from "@vercel/node";
import { stats } from "../util/tictactoe";
import statsbg from "../assets/stats";

export default async (req: NowRequest, res: NowResponse) => {
  let { clicks: counter, ips } = await stats();

  const {
    query: { self },
    headers,
  } = req;

  if (self) {
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress;

    counter = ips[clientIp] || 0;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "image/svg+xml");

  return res.send(statsbg(counter));
};
