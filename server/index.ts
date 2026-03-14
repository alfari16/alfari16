import { Hono } from "hono";
import { serve } from "@hono/node-server";
import {
  stats,
  tictactoeData,
  updateTictactoeData,
  hasWinner,
  isDraw,
} from "./tictactoe";
import { getArticle } from "./medium";
import { findBestMove, getAIPlayer } from "../src/ai";

// Import assets
import statsGreen from "../src/assets/stats_green";
import statsBlue from "../src/assets/stats_blue";
import thumbX from "../src/assets/x_thumb";
import x from "../src/assets/x";
import o from "../src/assets/o";
import blank from "../src/assets/blank";
import medium from "../src/assets/medium";

const app = new Hono();

function getClientIp(c: any): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
}

// /played
app.get("/played", (c) => {
  return handlePlayed(c);
});
app.get("/api/played", (c) => {
  return handlePlayed(c);
});

async function handlePlayed(c: any) {
  const self = c.req.query("self");
  let { clicks: counter, ips } = stats();
  let assets = statsGreen;

  const clientIp = getClientIp(c);

  if (self && clientIp) {
    counter = ips[clientIp] || 0;
    assets = statsBlue;
  }

  return c.body(assets(counter), 200, {
    "Cache-Control": "no-cache, max-age=0",
    "Content-Type": "image/svg+xml",
  });
}

// /turn
app.get("/turn", (c) => {
  return c.body(thumbX, 200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "no-cache, max-age=0",
  });
});
app.get("/api/turn", (c) => {
  return c.body(thumbX, 200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "no-cache, max-age=0",
  });
});

// /tile/:code
app.get("/tile/:code", (c) => handleTile(c, c.req.param("code")));
app.get("/api/tile/:code", (c) => handleTile(c, c.req.param("code")));

async function handleTile(c: any, code: string) {
  const dest = c.req.header("sec-fetch-dest");
  const accept = c.req.header("accept") || "";
  const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  const data = tictactoeData();
  const winner = hasWinner(data);
  const isDrawLocal = isDraw(data);

  const found = data.find((el) => el.code === code);

  if (!found) {
    return c.redirect("https://github.com/alfari16", 301);
  }

  if (isImage) {
    const image =
      found.value === "X"
        ? x(winner === "X" || isDrawLocal, winner === "X" ? "WINNER!" : "DRAW!")
        : found.value === "O"
        ? o(winner === "O" || isDrawLocal, winner === "O" ? "WINNER!" : "DRAW!")
        : blank;

    return c.body(image, 200, {
      "Cache-Control": "no-cache, max-age=0",
      "Content-Type": "image/svg+xml",
    });
  }

  // Handle click (HTML request)
  if (winner || isDrawLocal) {
    data.forEach((el) => {
      el.value = "";
    });
  }

  const clientIp = getClientIp(c);

  if (found && !found.value) {
    found.value = "X";
    updateTictactoeData(data, clientIp);

    const winnerAfterHuman = hasWinner(data);
    const drawAfterHuman = isDraw(data);

    if (!winnerAfterHuman && !drawAfterHuman) {
      const aiPlayer = getAIPlayer({ codes: data });
      const aiMove = findBestMove({ codes: data }, aiPlayer);

      if (aiMove) {
        const aiTile = data.find((el) => el.code === aiMove);
        if (aiTile && !aiTile.value) {
          aiTile.value = aiPlayer;
          updateTictactoeData(data, "AI");
        }
      }
    }
  }

  return c.redirect("https://github.com/alfari16", 301);
}

// /medium/:index
app.get("/medium/:index", (c) => handleMedium(c, c.req.param("index")));
app.get("/api/medium/:index", (c) => handleMedium(c, c.req.param("index")));

async function handleMedium(c: any, index: string) {
  const { title, thumbnail, url, date, description } = await getArticle(index);

  const dest = c.req.header("sec-fetch-dest");
  const accept = c.req.header("accept") || "";
  const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  if (isImage) {
    return c.body(medium({ title, thumbnail, url, date, description }), 200, {
      "Cache-Control": "s-maxage=36000, stale-while-revalidate",
      "Content-Type": "image/svg+xml",
    });
  }

  return c.redirect(url, 301);
}

// Start server
const port = 3000;
console.log(`Tic-tac-toe server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
