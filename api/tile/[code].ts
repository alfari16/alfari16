import { NowRequest, NowResponse } from '@vercel/node';
import x from '../../assets/x';
import o from '../../assets/o';
import blank from '../../assets/blank';
import redirection from '../../util/redirection';
import { tictactoeData, ghRepo } from '../../util/github';
import { currentTurn } from '../../util/tictactoe';

export default async (req: NowRequest, res: NowResponse) => {
  const {
    query: { code },
    headers,
  } = req;
  const dest = headers['sec-fetch-dest'] || headers['Sec-Fetch-Dest'];
  const accept = headers['accept'];
  const isImage = dest ? dest === 'image' : !/text\/html/.test(accept);

  const data = await tictactoeData();
  const found = data.find((el) => el.code === code);

  res.setHeader('Cache-Control', 'no-cache, max-age=0');
  if (isImage) {
    const image = found.value === 'X' ? x : found.value === 'O' ? o : blank;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(image);
  }

  const isCompleted = data.find((el) => !el.value);
  if (isCompleted)
    data.forEach((el) => {
      el.code = '';
    });

  if (found && !found.value) {
    const { sha, path } = (
      await ghRepo.contentsAsync('data/tictactoe.json')
    )[0];
    found.value = await currentTurn();
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
