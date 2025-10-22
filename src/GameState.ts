export interface TileData {
  code: string;
  value: "X" | "O" | "";
}

export interface GameStateData {
  codes: TileData[];
}

export interface StatsData {
  clicks: number;
  ips: { [ip: string]: number };
}

export class GameState {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/stats") {
        return this.getStats();
      } else if (path === "/gameState") {
        return this.getGameState();
      } else if (path === "/updateGame") {
        const body = await request.json();
        return this.updateGame(body);
      } else if (path === "/reset") {
        return this.reset();
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  private async getStats(): Promise<Response> {
    const stats = await this.state.storage.get<StatsData>("stats");
    const defaultStats: StatsData = { clicks: 0, ips: {} };

    return new Response(JSON.stringify(stats || defaultStats), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async getGameState(): Promise<Response> {
    const gameState = await this.state.storage.get<GameStateData>("gameState");
    const defaultGameState: GameStateData = {
      codes: [
        { code: "A1", value: "" },
        { code: "A2", value: "" },
        { code: "A3", value: "" },
        { code: "B1", value: "" },
        { code: "B2", value: "" },
        { code: "B3", value: "" },
        { code: "C1", value: "" },
        { code: "C2", value: "" },
        { code: "C3", value: "" },
      ],
    };

    return new Response(JSON.stringify(gameState || defaultGameState), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async updateGame(body: any): Promise<Response> {
    const { gameState, clientIp } = body;

    // Update game state
    await this.state.storage.put("gameState", gameState);

    // Update stats
    const stats = await this.state.storage.get<StatsData>("stats");
    const currentStats: StatsData = stats || { clicks: 0, ips: {} };

    currentStats.clicks += 1;
    if (clientIp) {
      currentStats.ips[clientIp] = (currentStats.ips[clientIp] || 0) + 1;
    }

    await this.state.storage.put("stats", currentStats);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async reset(): Promise<Response> {
    const defaultGameState: GameStateData = {
      codes: [
        { code: "A1", value: "" },
        { code: "A2", value: "" },
        { code: "A3", value: "" },
        { code: "B1", value: "" },
        { code: "B2", value: "" },
        { code: "B3", value: "" },
        { code: "C1", value: "" },
        { code: "C2", value: "" },
        { code: "C3", value: "" },
      ],
    };

    await this.state.storage.put("gameState", defaultGameState);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
