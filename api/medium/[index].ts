import { NowRequest, NowResponse } from '@vercel/node';
import axios from 'axios';
import moment from 'moment';
import medium from '../../assets/medium';

export default async (req: NowRequest, res: NowResponse) => {
  const {
    query: { index },
    headers,
  } = req;

  const {
    data: { items },
  } = await axios.get(
    'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@alfari'
  );
  const { title, pubDate, link: url, thumbnail, description } = items[
    // @ts-ignore
    index || 0
  ];

  const dest = headers['sec-fetch-dest'] || headers['Sec-Fetch-Dest'];
  const accept = headers['accept'];
  const isImage = dest ? dest === 'image' : !/text\/html/.test(accept);

  // if (isImage) {
  res.setHeader('Cache-Control', 's-maxage=36000, stale-while-revalidate');
  // res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(
    medium({
      title,
      thumbnail,
      url,
      date: moment(pubDate).format('DD MMM YYYY, HH:mm'),
      description:
        description
          .replace(/<h3>.*<\/h3>|<figcaption>.*<\/figcaption>|<[^>]*>/gm, '')
          .substring(0, 80) + '...',
    })
  );
  // }

  // res.writeHead(301, { Location: url });
  // res.end();
};
