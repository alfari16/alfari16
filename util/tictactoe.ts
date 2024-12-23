import { Client, fql } from "fauna";

interface Tile {
  code: "A1" | "A2" | "A3" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
  value: "X" | "O" | "";
}

const COLLECTION_REF = "272071595693965830";
const COUNTER_REF = "272739253159461381";

const client = new Client({
  secret: "fnAFzRcEh_ACQdeT-cvZt2cNVSneufjoFqPDthXW",
});

export const stats = async (): Promise<{
  clicks: string;
  ips: Array<Record<string, number>>;
}> => {
  const { data } = await client.query(fql`code.byId(${COUNTER_REF})`);
  return data;
};

export const tictactoeData = async (): Promise<Array<Tile>> => {
  const {
    data: { codes },
  } = await client.query(fql`code.byId(${COLLECTION_REF})`);
  return codes;
};

export const updateTictactoeData = async (tictactoeData, clientIp: string) => {
  const { clicks, ips } = await stats();
  if (!ips[clientIp]) ips[clientIp] = 0;
  ips[clientIp] += 1;

  return client.query(fql`
  let stats = code.byId(${COUNTER_REF})
  stats?.update({
    clicks: ${clicks} + 1,
    ips: ${ips}
  })
  let data = code.byId(${COLLECTION_REF})
  data?.update({
    codes: ${tictactoeData}
  })
`);
};

export const currentTurn = async (
  tictactoeDataCached: Array<Tile> | null = null
): Promise<Tile["value"]> => {
  const data = tictactoeDataCached || (await tictactoeData());
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
  tictactoeDataCached: Array<Tile> | null = null
): Promise<boolean | string> => {
  const data = tictactoeDataCached || (await tictactoeData());

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
  tictactoeDataCached: Array<Tile> | null = null
): Promise<boolean> => {
  const data = tictactoeDataCached || (await tictactoeData());
  const filtered = data.filter((el) => el.value);
  if (filtered.length === 9) return true;
  return false;
};
