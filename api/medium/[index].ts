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

  if (isImage) {
    res.setHeader('Cache-Control', 's-maxage=36000, stale-while-revalidate');
    // res.setHeader('Cache-Control', 'no-cache');

    const { data: thumbnailRaw } = await axios.get(thumbnail, {
      responseType: 'arraybuffer',
    });

    const base64Img = Buffer.from(thumbnailRaw).toString('base64');
    const imgTypeArr = thumbnail.split('.');
    const imgType = imgTypeArr[imgTypeArr.length - 1];
    const convertedThumbnail = `data:image/${imgType};base64,${base64Img}`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(
      medium({
        title: title.length > 56 ? title.substring(0, 56) + ' ...' : title,
        thumbnail: convertedThumbnail,
        url,
        date: moment(pubDate).format('DD MMM YYYY, HH:mm'),
        description:
          description
            .replace(/<h3>.*<\/h3>|<figcaption>.*<\/figcaption>|<[^>]*>/gm, '')
            .substring(0, 150) + '...',
      })
    );
  }

  res.writeHead(301, { Location: url });
  res.end();
};
