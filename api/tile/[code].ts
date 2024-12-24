import { VercelRequest, VercelResponse } from "@vercel/node";
import x from "../../assets/x";
import o from "../../assets/o";
import blank from "../../assets/blank";
import {
  currentTurn,
  hasWinner,
  isDraw,
  tictactoeData,
  updateTictactoeData,
} from "../../util/tictactoe";

export default async (req: VercelRequest, res: VercelResponse) => {
  const {
    query: { code },
    headers,
  } = req;
  const dest = headers["sec-fetch-dest"] || headers["Sec-Fetch-Dest"];
  const accept = headers["accept"] as string;
  const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  const data = await tictactoeData();
  const winner = await hasWinner(data);
  const isDrawLocal = await isDraw(data);

  const found = data.find((el) => el.code === code);

  if (!found) {
    res.writeHead(301, {
      Location: "https://github.com/alfari16",
    });
    res.end();
    return;
  }

  res.setHeader("Cache-Control", "no-cache, max-age=0");
  if (isImage) {
    const image =
      found.value === "X"
        ? x(winner === "X" || isDrawLocal, winner === "X" ? "WINNER!" : "DRAW!")
        : found.value === "O"
        ? o(winner === "O" || isDrawLocal, winner === "O" ? "WINNER!" : "DRAW!")
        : blank;
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(image);
  }

  if (winner || isDrawLocal) {
    data.forEach((el) => {
      el.value = "";
    });
  }

  const clientIp = (req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "no-ip") as string;

  if (found && !found.value) {
    found.value = await currentTurn(data);
    await updateTictactoeData(data, clientIp);
  }

  res.writeHead(301, {
    Location: "https://github.com/alfari16",
  });
  res.end();
};
