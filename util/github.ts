// @ts-ignore
import github from 'octonode';

export const ghClient = github.client({
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_ACCESS_TOKEN,
});

export const ghRepo = ghClient.repo(process.env.GITHUB_REPO);

export const tictactoeData = async (): Promise<{
  data: Array<Record<string, string>>;
  sha: string;
  path: string;
}> => {
  console.log('fetching data from repo');
  const { sha, path, content } = (
    await ghRepo.contentsAsync('data/tictactoe.json')
  )[0];
  const data = JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
  return { sha, path, data };
};
