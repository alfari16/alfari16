import { Client, query } from "faunadb";

const COLLECTION_REF = "272071595693965830";
const COUNTER_REF = "272739253159461381";

const client = new Client({
  secret: process.env.FAUNA_SECRET,
});

export const tictactoeData = async () => {
  const {
    data: { codes },
  } = await client.query(
    query.Get(query.Ref(query.Collection("code"), COLLECTION_REF))
  );
  return codes;
};

export const updateTictactoeData = async (tictactoeData, clientIp) => {
  let {
    data: { clicks, ips },
  } = await client.query(
    query.Get(query.Ref(query.Collection("code"), COUNTER_REF))
  );
  clicks += 1;
  if (!ips[clientIp]) {
    ips[clientIp] = 0;
  }
  ips[clientIp] += 1;
  return Promise.all([
    client.query(
      query.Update(query.Ref(query.Collection("code"), COLLECTION_REF), {
        data: { codes: tictactoeData },
      })
    ),
    client.query(
      query.Update(query.Ref(query.Collection("code"), COUNTER_REF), {
        data: { clicks: clicks, ips },
      })
    ),
  ]);
};

export const currentTurn = async (
  tictactoeDataCached = null
): Promise<string> => {
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
  tictactoeDataCached = null
): Promise<boolean | string> => {
  const data = tictactoeDataCached || (await tictactoeData());

  const x = data.filter((el) => el.value === "X").map((el) => el.code);
  const o = data.filter((el) => el.value === "O").map((el) => el.code);

  let xWord = x.join("").replace(/\d/g, "");
  let xDigit = x
    .sort((a, b) => {
      const aInt = a.replace(/\D/gm, "");
      const bInt = b.replace(/\D/gm, "");
      return aInt - bInt;
    })
    .join("")
    .replace(/\D/g, "");

  let oWord = o.join("").replace(/\d/g, "");
  let oDigit = o
    .sort((a, b) => {
      const aInt = a.replace(/\D/gm, "");
      const bInt = b.replace(/\D/gm, "");
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

export const isDraw = async (tictactoeDataCached = null): Promise<boolean> => {
  const data = tictactoeDataCached || (await tictactoeData());
  const filtered = data.filter((el) => el.value);
  if (filtered.length === 9) return true;
  return false;
};

export const stats = async () => {
  const { data } = await client.query(
    query.Get(query.Ref(query.Collection("code"), COUNTER_REF))
  );
  return data;
};
