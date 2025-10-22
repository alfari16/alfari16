## Tic Tac Toe on Github  ![Total Played](https://alfari16-tictactoe.workers.dev/played)

**It's your turn!** Click on an empty space to fill with ![turn](https://alfari16-tictactoe.workers.dev/turn).

|     | A                                                                                                          | B                                                                                                          | C                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | <a href="https://alfari16-tictactoe.workers.dev/tile/A1"><img src="https://alfari16-tictactoe.workers.dev/tile/A1" alt="A1"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/B1"><img src="https://alfari16-tictactoe.workers.dev/tile/B1" alt="B1"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/C1"><img src="https://alfari16-tictactoe.workers.dev/tile/C1" alt="C1"></a> |
| 2   | <a href="https://alfari16-tictactoe.workers.dev/tile/A2"><img src="https://alfari16-tictactoe.workers.dev/tile/A2" alt="A2"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/B2"><img src="https://alfari16-tictactoe.workers.dev/tile/B2" alt="B2"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/C2"><img src="https://alfari16-tictactoe.workers.dev/tile/C2" alt="C2"></a> |
| 3   | <a href="https://alfari16-tictactoe.workers.dev/tile/A3"><img src="https://alfari16-tictactoe.workers.dev/tile/A3" alt="A3"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/B3"><img src="https://alfari16-tictactoe.workers.dev/tile/B3" alt="B3"></a> | <a href="https://alfari16-tictactoe.workers.dev/tile/C3"><img src="https://alfari16-tictactoe.workers.dev/tile/C3" alt="C3"></a> |


# Hi there! Alif here. :wave:

### Checkout my latest Medium articles :bookmark_tabs:

<a target="_blank" href="https://alfari16-tictactoe.workers.dev/medium/0"><img src="https://alfari16-tictactoe.workers.dev/medium/0" alt="Medium Index 0"></a>

<a target="_blank" href="https://alfari16-tictactoe.workers.dev/medium/1"><img src="https://alfari16-tictactoe.workers.dev/medium/1" alt="Medium Index 1"></a>

<a target="_blank" href="https://alfari16-tictactoe.workers.dev/medium/2"><img src="https://alfari16-tictactoe.workers.dev/medium/2" alt="Medium Index 2"></a>

---

## Tech Stack

This project is now powered by:
- **Cloudflare Workers** - Serverless edge computing platform
- **Durable Objects** - Consistent, low-latency data storage (replacing FaunaDB)
- **TypeScript** - Type-safe development
- **SVG** - Dynamic graphics generation

Previously hosted on Vercel with FaunaDB, now fully migrated to Cloudflare's infrastructure for better performance and reliability.

---

## Development & Deployment

### Prerequisites

- Node.js 18 or later
- A Cloudflare account (free tier works!)
- Wrangler CLI (will be installed with dependencies)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

This will start a local Cloudflare Workers environment. Visit `http://localhost:8787` to test the endpoints.

### Deployment to Cloudflare

1. Login to Cloudflare:
```bash
npx wrangler login
```

2. Deploy the Worker:
```bash
npm run deploy
```

3. After deployment, Wrangler will provide your Worker's URL (e.g., `https://alfari16-tictactoe.workers.dev`).

4. Update the README.md URLs if your Worker has a different name or custom domain.

### Project Structure

```
src/
├── index.ts         # Main Worker entry point with routing
├── GameState.ts     # Durable Object for game state management
├── tictactoe.ts     # Game logic utilities
├── medium.ts        # Medium article fetcher
└── assets/          # SVG generators
    ├── blank.ts     # Empty tile
    ├── x.ts         # X tile
    ├── o.ts         # O tile
    ├── stats_*.ts   # Statistics badges
    └── medium.ts    # Article cards
```

### API Endpoints

- `GET /played` - Total game statistics badge
- `GET /played?self=true` - Personal play count
- `GET /turn` - Current player's turn indicator
- `GET /tile/{code}` - Game tile (A1-C3)
- `GET /medium/{index}` - Medium article card (0-2)

---

## Migration from Vercel

This project was fully migrated from Vercel + FaunaDB to Cloudflare Workers + Durable Objects:

**Changes:**
- ✅ Removed Vercel serverless functions
- ✅ Removed FaunaDB dependency
- ✅ Implemented Durable Objects for state management
- ✅ Migrated to Cloudflare Workers runtime
- ✅ Removed axios and moment dependencies (using native fetch and date formatting)

**Benefits:**
- Better global edge performance
- Lower latency with Durable Objects
- No cold starts
- Better free tier limits
- Simplified architecture
