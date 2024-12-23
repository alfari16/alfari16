import { VercelRequest, VercelResponse } from '@vercel/node';
import { currentTurn } from '../util/tictactoe';
import thumbO from '../assets/o_thumb';
import thumbX from '../assets/x_thumb';

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, max-age=0');
  const turn = await currentTurn();
  return res.status(200).send(turn === 'X' ? thumbX : thumbO);
};
