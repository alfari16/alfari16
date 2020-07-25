// @ts-ignore
import github from 'octonode';

const TICTACTOE_DATA_URL =
  'https://raw.githubusercontent.com/alfari16/alfari16/master/data/tictactoe.json';

export const ghClient = github.client({
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_ACCESS_TOKEN,
});

export const ghRepo = ghClient.repo(process.env.GITHUB_REPO);

export const tictactoeData = async () => {
  const data = await ghRepo.contentsAsync('data/tictactoe.json');
  const parsed = Buffer.from(data[0].content, 'base64').toString('utf-8');
  return JSON.parse(parsed);
};
