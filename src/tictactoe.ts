interface Tile {
  code: "A1" | "A2" | "A3" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
  value: "X" | "O" | "";
}

interface StatsData {
  clicks: number;
  ips: { [ip: string]: number };
}

export const stats = async (gameState: DurableObjectStub): Promise<StatsData> => {
  const response = await gameState.fetch("http://internal/stats");
  return await response.json();
};

export const tictactoeData = async (gameState: DurableObjectStub): Promise<Array<Tile>> => {
  const response = await gameState.fetch("http://internal/gameState");
  const data: any = await response.json();
  return data.codes;
};

export const updateTictactoeData = async (
  gameState: DurableObjectStub,
  tictactoeData: Array<Tile>,
  clientIp: string
) => {
  const response = await gameState.fetch("http://internal/updateGame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameState: { codes: tictactoeData },
      clientIp,
    }),
  });
  return await response.json();
};

export const resetGame = async (gameState: DurableObjectStub) => {
  const response = await gameState.fetch("http://internal/reset", {
    method: "POST",
  });
  return await response.json();
};

export const currentTurn = async (
  tictactoeDataCached: Array<Tile> | null = null,
  gameState?: DurableObjectStub
): Promise<Tile["value"]> => {
  const data = tictactoeDataCached || (gameState ? await tictactoeData(gameState) : []);
  const xCount = data.reduce(
    (prev, el) => (el.value === "X" ? prev + 1 : prev),
    0
  );
  const oCount = data.reduce(
    (prev, el) => (el.value === "O" ? prev + 1 : prev),
    0
  );
  return xCount <= oCount ? "X" : "O";
};

export const hasWinner = async (
  tictactoeDataCached: Array<Tile> | null = null,
  gameState?: DurableObjectStub
): Promise<boolean | string> => {
  const data = tictactoeDataCached || (gameState ? await tictactoeData(gameState) : []);

  const x = data.filter((el) => el.value === "X").map((el) => el.code);
  const o = data.filter((el) => el.value === "O").map((el) => el.code);

  let xWord = x.join("").replace(/\d/g, "");
  let xDigit = x
    .sort((a, b) => {
      const aInt = Number(a.replace(/\D/gm, ""));
      const bInt = Number(b.replace(/\D/gm, ""));
      return aInt - bInt;
    })
    .join("")
    .replace(/\D/g, "");

  let oWord = o.join("").replace(/\d/g, "");
  let oDigit = o
    .sort((a, b) => {
      const aInt = Number(a.replace(/\D/gm, ""));
      const bInt = Number(b.replace(/\D/gm, ""));
      return aInt - bInt;
    })
    .join("")
    .replace(/\D/g, "");

  for (const iterator of data) {
    if (["A1", "B2", "C3"].includes(iterator.code)) {
      if (iterator.value === "X") xWord += "D";
      if (iterator.value === "O") oWord += "D";
    }
    if (["A3", "B2", "C1"].includes(iterator.code)) {
      if (iterator.value === "X") xDigit += "4";
      if (iterator.value === "O") oDigit += "4";
    }
  }

  if (
    /A{3}|B{3}|C{3}|D{3}/gm.test(xWord) ||
    /1{3}|2{3}|3{3}|4{3}/gm.test(xDigit)
  )
    return "X";
  if (
    /A{3}|B{3}|C{3}|D{3}/gm.test(oWord) ||
    /1{3}|2{3}|3{3}|4{3}/gm.test(oDigit)
  )
    return "O";
  return false;
};

export const isDraw = async (
  tictactoeDataCached: Array<Tile> | null = null,
  gameState?: DurableObjectStub
): Promise<boolean> => {
  const data = tictactoeDataCached || (gameState ? await tictactoeData(gameState) : []);
  const filtered = data.filter((el) => el.value);
  if (filtered.length === 9) return true;
  return false;
};
