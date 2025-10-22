interface Tile {
  code: "A1" | "A2" | "A3" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
  value: "X" | "O" | "";
}

interface BoardState {
  codes: Tile[];
}

// Convert tile code to board index
function tileToIndex(code: string): number {
  const map: { [key: string]: number } = {
    A1: 0, A2: 1, A3: 2,
    B1: 3, B2: 4, B3: 5,
    C1: 6, C2: 7, C3: 8,
  };
  return map[code];
}

// Convert board index to tile code
function indexToTile(index: number): string {
  const map = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];
  return map[index];
}

// Check for winner on a simple board array
function checkWinner(board: string[]): string | null {
  const winPatterns = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal 1
    [2, 4, 6], // Diagonal 2
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

// Check if board is full (draw)
function isBoardFull(board: string[]): boolean {
  return board.every((cell) => cell !== "");
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: string[],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: string,
  humanPlayer: string
): number {
  const winner = checkWinner(board);

  // Terminal states
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = aiPlayer;
        const eval_score = minimax(board, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
        board[i] = "";
        maxEval = Math.max(maxEval, eval_score);
        alpha = Math.max(alpha, eval_score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = humanPlayer;
        const eval_score = minimax(board, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
        board[i] = "";
        minEval = Math.min(minEval, eval_score);
        beta = Math.min(beta, eval_score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return minEval;
  }
}

// Find the best move for AI
export function findBestMove(gameState: BoardState, aiPlayer: "X" | "O"): string | null {
  const humanPlayer = aiPlayer === "X" ? "O" : "X";

  // Convert gameState to simple board array
  const board: string[] = new Array(9).fill("");
  gameState.codes.forEach((tile) => {
    const index = tileToIndex(tile.code);
    board[index] = tile.value;
  });

  // Check if there are any empty spaces
  const hasEmptySpace = board.some((cell) => cell === "");
  if (!hasEmptySpace) return null;

  // Check if game is already won
  const winner = checkWinner(board);
  if (winner) return null;

  let bestScore = -Infinity;
  let bestMove = -1;

  // Try all possible moves
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
      board[i] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  // If no move found, return first empty space
  if (bestMove === -1) {
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        bestMove = i;
        break;
      }
    }
  }

  return bestMove !== -1 ? indexToTile(bestMove) : null;
}

// Determine AI player based on game state
// Human is always X (goes first), AI is always O
export function getAIPlayer(gameState: BoardState): "X" | "O" {
  return "O"; // AI always plays as O
}

export function shouldAIMove(gameState: BoardState): boolean {
  // Count moves
  const xCount = gameState.codes.filter((tile) => tile.value === "X").length;
  const oCount = gameState.codes.filter((tile) => tile.value === "O").length;

  // AI should move if human (X) has more moves than AI (O)
  return xCount > oCount;
}
