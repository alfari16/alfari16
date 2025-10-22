import { GameState } from './GameState';
import {
  stats,
  tictactoeData,
  updateTictactoeData,
  currentTurn,
  hasWinner,
  isDraw,
} from './tictactoe';
import { getArticle } from './medium';
import { findBestMove, getAIPlayer, shouldAIMove } from './ai';

// Import assets
import statsGreen from './assets/stats_green';
import statsBlue from './assets/stats_blue';
import thumbO from './assets/o_thumb';
import thumbX from './assets/x_thumb';
import x from './assets/x';
import o from './assets/o';
import blank from './assets/blank';
import medium from './assets/medium';

export { GameState };

interface Env {
  GAME_STATE: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Get Durable Object instance
    const id = env.GAME_STATE.idFromName("global-game");
    const gameState = env.GAME_STATE.get(id);

    // Route handling
    try {
      if (pathname === "/played" || pathname === "/api/played") {
        return handlePlayed(request, gameState);
      } else if (pathname === "/turn" || pathname === "/api/turn") {
        return handleTurn(request, gameState);
      } else if (pathname.startsWith("/tile/") || pathname.startsWith("/api/tile/")) {
        const code = pathname.replace(/^\/(?:api\/)?tile\//, "");
        return handleTile(request, gameState, code);
      } else if (pathname.startsWith("/medium/") || pathname.startsWith("/api/medium/")) {
        const index = pathname.replace(/^\/(?:api\/)?medium\//, "");
        return handleMedium(request, index);
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

async function handlePlayed(request: Request, gameState: DurableObjectStub): Promise<Response> {
  const url = new URL(request.url);
  const self = url.searchParams.get("self");

  let { clicks: counter, ips } = await stats(gameState);
  let assets = statsGreen;

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

  if (self && clientIp) {
    counter = ips[clientIp] || 0;
    assets = statsBlue;
  }

  return new Response(assets(counter), {
    headers: {
      "Cache-Control": "no-cache, max-age=0",
      "Content-Type": "image/svg+xml",
    },
  });
}

async function handleTurn(request: Request, gameState: DurableObjectStub): Promise<Response> {
  // In single-player mode, human is always X and always goes first
  // So we always show X as it's always the player's turn to click
  return new Response(thumbX, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, max-age=0",
    },
  });
}

async function handleTile(
  request: Request,
  gameState: DurableObjectStub,
  code: string
): Promise<Response> {
  const dest = request.headers.get("sec-fetch-dest");
  const accept = request.headers.get("accept") || "";
  const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  const data = await tictactoeData(gameState);
  const winner = await hasWinner(data);
  const isDrawLocal = await isDraw(data);

  const found = data.find((el) => el.code === code);

  if (!found) {
    return Response.redirect("https://github.com/alfari16", 301);
  }

  if (isImage) {
    const image =
      found.value === "X"
        ? x(winner === "X" || isDrawLocal, winner === "X" ? "WINNER!" : "DRAW!")
        : found.value === "O"
        ? o(winner === "O" || isDrawLocal, winner === "O" ? "WINNER!" : "DRAW!")
        : blank;

    return new Response(image, {
      headers: {
        "Cache-Control": "no-cache, max-age=0",
        "Content-Type": "image/svg+xml",
      },
    });
  }

  // Handle click (HTML request)
  // If game is over, reset the board
  if (winner || isDrawLocal) {
    data.forEach((el) => {
      el.value = "";
    });
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

  // Only process if the clicked tile is empty
  if (found && !found.value) {
    // Human player (always X) makes their move
    found.value = "X";
    await updateTictactoeData(gameState, data, clientIp);

    // Check if game ended after human's move
    const winnerAfterHuman = await hasWinner(data);
    const drawAfterHuman = await isDraw(data);

    // If game is not over, AI makes its move
    if (!winnerAfterHuman && !drawAfterHuman) {
      const aiPlayer = getAIPlayer({ codes: data });
      const aiMove = findBestMove({ codes: data }, aiPlayer);

      if (aiMove) {
        const aiTile = data.find((el) => el.code === aiMove);
        if (aiTile && !aiTile.value) {
          aiTile.value = aiPlayer;
          await updateTictactoeData(gameState, data, "AI");
        }
      }
    }
  }

  return Response.redirect("https://github.com/alfari16", 301);
}

async function handleMedium(request: Request, index: string): Promise<Response> {
  const { title, thumbnail, url, date, description } = await getArticle(index);

  const dest = request.headers.get("sec-fetch-dest");
  const accept = request.headers.get("accept") || "";
  const isImage = dest ? dest === "image" : !/text\/html/.test(accept);

  if (isImage) {
    return new Response(
      medium({
        title,
        thumbnail,
        url,
        date,
        description,
      }),
      {
        headers: {
          "Cache-Control": "s-maxage=36000, stale-while-revalidate",
          "Content-Type": "image/svg+xml",
        },
      }
    );
  }

  return Response.redirect(url, 301);
}
