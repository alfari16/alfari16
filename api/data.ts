import { NowRequest, NowResponse } from '@vercel/node';
import { ghRepo } from '../util/github';

export default async (req: NowRequest, res: NowResponse) => {
  const data = await ghRepo.contentsAsync('data/tictactoe.json');
  const parsed = Buffer.from(data[0].content, 'base64').toString('utf-8');
  return res.json({ data, parsed, origin: req.headers.origin });
};
