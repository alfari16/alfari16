import { tictactoeData } from './github';
export const currentTurn = async (): Promise<string> => {
  const data = await tictactoeData();
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
