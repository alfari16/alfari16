import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

export interface TileData {
  code: string;
  value: "X" | "O" | "";
}

export interface StatsData {
  clicks: number;
  ips: { [ip: string]: number };
}

interface PersistentState {
  tiles: TileData[];
  clicks: number;
  ips: { [ip: string]: number };
}

const DEFAULT_TILES: TileData[] = [
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3",
].map((code) => ({ code, value: "" }));

const BASE_CLICKS = 10340; // Starting counter offset
const DATA_PATH = new URL("../data/state.json", import.meta.url).pathname;

class Store {
  tiles: TileData[];
  clicks: number;
  ips: { [ip: string]: number };
  private saveTimer: ReturnType<typeof setInterval> | null = null;
  private dirty = false;

  constructor() {
    this.tiles = DEFAULT_TILES.map((t) => ({ ...t }));
    this.clicks = 0;
    this.ips = {};
    this.load();
    this.startAutoSave();
    this.registerShutdownHooks();
  }

  // Game state methods
  getGameState(): TileData[] {
    return this.tiles;
  }

  getStats(): StatsData {
    return { clicks: BASE_CLICKS + this.clicks, ips: { ...this.ips } };
  }

  updateGame(tiles: TileData[], clientIp: string): void {
    this.tiles = tiles.map((t) => ({ code: t.code, value: t.value }));
    this.clicks++;
    if (clientIp) {
      this.ips[clientIp] = (this.ips[clientIp] || 0) + 1;
    }
    this.dirty = true;
  }

  resetGame(): void {
    this.tiles.forEach((t) => (t.value = ""));
    this.dirty = true;
  }

  // Persistence
  private load(): void {
    try {
      if (existsSync(DATA_PATH)) {
        const raw = readFileSync(DATA_PATH, "utf-8");
        const data: PersistentState = JSON.parse(raw);
        if (data.tiles?.length === 9) this.tiles = data.tiles;
        if (typeof data.clicks === "number") this.clicks = data.clicks;
        if (data.ips) this.ips = data.ips;
        console.log("Loaded state from", DATA_PATH);
      }
    } catch (e) {
      console.error("Failed to load state:", e);
    }
  }

  save(): void {
    try {
      const dir = dirname(DATA_PATH);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const data: PersistentState = {
        tiles: this.tiles,
        clicks: this.clicks,
        ips: this.ips,
      };
      writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
      this.dirty = false;
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }

  private startAutoSave(): void {
    this.saveTimer = setInterval(() => {
      if (this.dirty) this.save();
    }, 30_000);
  }

  private registerShutdownHooks(): void {
    const shutdown = () => {
      if (this.saveTimer) clearInterval(this.saveTimer);
      this.save();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
}

export const store = new Store();
