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
  private sql: SqlStorage;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sql = state.storage.sql;
    this.initializeTables();
  }

  private async initializeTables() {
    // Create game_state table
    await this.sql.exec(`
      CREATE TABLE IF NOT EXISTS game_state (
        code TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
      )
    `);

    // Create stats table
    await this.sql.exec(`
      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create ip_stats table
    await this.sql.exec(`
      CREATE TABLE IF NOT EXISTS ip_stats (
        ip TEXT PRIMARY KEY,
        clicks INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Initialize default game state if empty
    const count = await this.sql.exec(`SELECT COUNT(*) as count FROM game_state`);
    if (count.rows[0].count === 0) {
      const tiles = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];
      for (const code of tiles) {
        await this.sql.exec(`INSERT INTO game_state (code, value) VALUES (?, '')`, code);
      }
    }

    // Initialize stats if not exists
    const statsCount = await this.sql.exec(`SELECT COUNT(*) as count FROM stats WHERE key = 'clicks'`);
    if (statsCount.rows[0].count === 0) {
      await this.sql.exec(`INSERT INTO stats (key, value) VALUES ('clicks', 0)`);
    }
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
    // Get total clicks
    const clicksResult = await this.sql.exec(`SELECT value FROM stats WHERE key = 'clicks'`);
    const clicks = clicksResult.rows[0]?.value || 0;

    // Get IP stats
    const ipResult = await this.sql.exec(`SELECT ip, clicks FROM ip_stats`);
    const ips: { [ip: string]: number } = {};
    for (const row of ipResult.rows) {
      ips[row.ip] = row.clicks;
    }

    const stats: StatsData = { clicks, ips };

    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async getGameState(): Promise<Response> {
    const result = await this.sql.exec(`SELECT code, value FROM game_state ORDER BY code`);

    const codes: TileData[] = result.rows.map(row => ({
      code: row.code,
      value: row.value as "X" | "O" | ""
    }));

    const gameState: GameStateData = { codes };

    return new Response(JSON.stringify(gameState), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async updateGame(body: any): Promise<Response> {
    const { gameState, clientIp } = body;

    // Update game state in a transaction
    for (const tile of gameState.codes) {
      await this.sql.exec(
        `UPDATE game_state SET value = ? WHERE code = ?`,
        tile.value,
        tile.code
      );
    }

    // Update stats - increment total clicks
    await this.sql.exec(`UPDATE stats SET value = value + 1 WHERE key = 'clicks'`);

    // Update IP stats if provided
    if (clientIp) {
      await this.sql.exec(`
        INSERT INTO ip_stats (ip, clicks) VALUES (?, 1)
        ON CONFLICT(ip) DO UPDATE SET clicks = clicks + 1
      `, clientIp);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async reset(): Promise<Response> {
    // Reset all game state values to empty
    await this.sql.exec(`UPDATE game_state SET value = ''`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
