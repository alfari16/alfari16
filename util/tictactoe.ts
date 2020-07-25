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

export const hasWinner = async (tictactoeData = null) => {
  tictactoeData = tictactoeData || (await dataRaw()).data;
  console.log(tictactoeData);

  const x = tictactoeData.filter((el) => el.value === 'X').map((el) => el.code);
  const o = tictactoeData.filter((el) => el.value === 'O').map((el) => el.code);

  const xWord = x.join('').replace(/\d/g, '');
  const xDigit = x.join('').replace(/\D/g, '');
  console.log(xWord, xDigit);
  if (/A{3}|B{3}|C{3}/gm.test(xWord) || /1{3}|2{3}|3{3}/gm.test(xDigit))
    return 'X';

  const oWord = o.join('').replace(/\d/g, '');
  const oDigit = o.join('').replace(/\D/g, '');
  console.log(oWord, oDigit);

  if (/A{3}|B{3}|C{3}/gm.test(oWord) || /1{3}|2{3}|3{3}/gm.test(oDigit))
    return 'O';
  return false;
};
