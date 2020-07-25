import { NowRequest, NowResponse } from '@vercel/node';
import x from '../../assets/x';
import o from '../../assets/o';
import blank from '../../assets/blank';
import redirection from '../../util/redirection';
import { tictactoeData, ghRepo } from '../../util/github';
import { currentTurn, hasWinner } from '../../util/tictactoe';

export default async (req: NowRequest, res: NowResponse) => {
  const {
    query: { code },
    headers,
  } = req;
  const dest = headers['sec-fetch-dest'] || headers['Sec-Fetch-Dest'];
  const accept = headers['accept'];
  const isImage = dest ? dest === 'image' : !/text\/html/.test(accept);

  const { data, sha, path } = await tictactoeData();
  const winner = await hasWinner(data);
  const found = data.find((el) => el.code === code);

  res.setHeader('Cache-Control', 'no-cache, max-age=0');
  if (isImage) {
    const image =
      found.value === 'X'
        ? x(winner === 'x')
        : found.value === 'O'
        ? o(winner === 'o')
        : blank;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(image);
  }

  if (hasWinner)
    data.forEach((el) => {
      el.value = '';
    });

  if (found && !found.value) {
    found.value = await currentTurn(data);
    await ghRepo.updateContentsAsync(
      path,
      'Update tictactoe data',
      JSON.stringify(data),
      sha
    );
  }

  res.setHeader('Content-Type', 'text/html');
  return res.send(redirection);
};
