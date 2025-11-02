interface ArticleData {
  items: any[];
  fetched_at: string;
  updated_at: string;
}

export class Articles {
  private state: DurableObjectState;
  private sql: SqlStorage;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sql = state.storage.sql;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/getArticles") {
        console.log('Fetching articles...');
        const articles = await this.getOrFetchArticles();
        console.log(`Found ${articles.length} articles`);
        return new Response(JSON.stringify(articles), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    } catch (error) {
      console.error('Error in Articles.fetch:', error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  async initialize() {
    // Create articles table if it doesn't exist
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY,
        feed_data TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  async getArticles(): Promise<ArticleData | null> {
    // Get the most recent articles entry
    const result = this.sql.exec(
      'SELECT feed_data, fetched_at, updated_at FROM articles ORDER BY updated_at DESC LIMIT 1'
    ).toArray();

    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0] as any;
    return {
      items: JSON.parse(row.feed_data),
      fetched_at: new Date(row.fetched_at * 1000).toISOString(),
      updated_at: new Date(row.updated_at * 1000).toISOString(),
    };
  }

  async isCacheExpired(): Promise<boolean> {
    const result = this.sql.exec(
      'SELECT updated_at FROM articles ORDER BY updated_at DESC LIMIT 1'
    ).toArray();

    if (!result || result.length === 0) {
      return true; // No cache exists
    }

    const latest = result[0] as any;
    const cacheAge = Date.now() - (latest.updated_at * 1000);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    return cacheAge > twentyFourHours;
  }

  async updateArticles(feedData: any[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    // Insert new articles entry
    this.sql.exec(
      'INSERT INTO articles (feed_data, fetched_at, updated_at) VALUES (?, ?, ?)',
      JSON.stringify(feedData),
      now,
      now
    );

    // Optional: Clean up old entries (keep only the latest 10 entries)
    this.sql.exec(`
      DELETE FROM articles
      WHERE id NOT IN (
        SELECT id FROM articles
        ORDER BY updated_at DESC
        LIMIT 10
      )
    `);
  }

  async fetchFreshArticles(): Promise<any[]> {
    try {
      const response = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@alfari"
      );

      if (!response.ok) {
        throw new Error(`RSS API responded with status: ${response.status}`);
      }

      const data: any = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid RSS response format');
      }

      return data.items;
    } catch (error) {
      console.error('Error fetching fresh articles:', error);
      throw error;
    }
  }

  async getOrFetchArticles(): Promise<any[]> {
    // Initialize database if needed
    console.log('Initializing database...');
    await this.initialize();

    // Check if cache is expired
    const expired = await this.isCacheExpired();
    console.log('Cache expired:', expired);

    if (!expired) {
      // Return cached data
      const cached = await this.getArticles();
      console.log('Cached data:', cached);
      if (cached && cached.items) {
        console.log('Returning cached articles from', cached.updated_at);
        return cached.items;
      }
    }

    // Cache is expired or doesn't exist, fetch fresh data
    console.log('Fetching fresh articles from RSS API');
    const freshArticles = await this.fetchFreshArticles();
    console.log(`Fetched ${freshArticles.length} fresh articles`);

    // Update cache with fresh data
    await this.updateArticles(freshArticles);

    return freshArticles;
  }
}