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

export const isComplete = async (tictactoeData) => {};
