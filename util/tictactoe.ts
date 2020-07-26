import { tictactoeData as dataRaw } from './github';

export const currentTurn = async (tictactoeData = null): Promise<string> => {
  const data = tictactoeData || (await dataRaw()).data;
  const xCount = data.reduce(
    (prev, el) => (el.value === 'X' ? prev + 1 : prev),
    0
  );
  const oCount = data.reduce(
    (prev, el) => (el.value === 'O' ? prev + 1 : prev),
    0
  );
  return xCount <= oCount ? 'X' : 'O';
};

export const hasWinner = async (
  tictactoeData = null
): Promise<boolean | string> => {
  tictactoeData = tictactoeData || (await dataRaw()).data;

  const x = tictactoeData.filter((el) => el.value === 'X').map((el) => el.code);
  const o = tictactoeData.filter((el) => el.value === 'O').map((el) => el.code);

  let xWord = x.join('').replace(/\d/g, '');
  let xDigit = x
    .sort((a, b) => {
      const aInt = a.replace(/\D/gm, '');
      const bInt = b.replace(/\D/gm, '');
      return aInt - bInt;
    })
    .join('')
    .replace(/\D/g, '');

  let oWord = o.join('').replace(/\d/g, '');
  let oDigit = o
    .sort((a, b) => {
      const aInt = a.replace(/\D/gm, '');
      const bInt = b.replace(/\D/gm, '');
      return aInt - bInt;
    })
    .join('')
    .replace(/\D/g, '');

  for (const iterator of tictactoeData) {
    if (['A1', 'B2', 'C3'].includes(iterator.code)) {
      if (iterator.value === 'X') xWord += 'D';
      else oWord += 'D';
    }
    if (['A3', 'B2', 'C1'].includes(iterator.code)) {
      if (iterator.value === 'X') xDigit += '4';
      else oDigit += '4';
    }
  }

  if (
    /A{3}|B{3}|C{3}|D{3}/gm.test(xWord) ||
    /1{3}|2{3}|3{3}|4{3}/gm.test(xDigit)
  )
    return 'X';
  if (
    /A{3}|B{3}|C{3}|D{3}/gm.test(oWord) ||
    /1{3}|2{3}|3{3}|4{3}/gm.test(oDigit)
  )
    return 'O';
  return false;
};

export const isDraw = async (tictactoeData = null): Promise<boolean> => {
  tictactoeData = tictactoeData || (await dataRaw()).data;
  const filtered = tictactoeData.filter((el) => el.value);
  if (filtered.length === 9) return true;
  return false;
};
