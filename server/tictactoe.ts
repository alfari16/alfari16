import { store, TileData, StatsData } from "./store";

export const stats = (): StatsData => {
  return store.getStats();
};

export const tictactoeData = (): TileData[] => {
  return store.getGameState().map((t) => ({ ...t }));
};

export const updateTictactoeData = (
  data: TileData[],
  clientIp: string
): void => {
  store.updateGame(data, clientIp);
};

export const resetGame = (): void => {
  store.resetGame();
};

export const hasWinner = (data: TileData[]): string | false => {
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

export const isDraw = (data: TileData[]): boolean => {
  return data.filter((el) => el.value).length === 9;
};
