import axios from "axios";
import moment from "moment";

export const getArticle = async (index) => {
  const {
    data: { items },
  } = await axios.get(
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@alfari"
  );
  const {
    title,
    pubDate,
    link: url,
    description,
  } = items[
    // @ts-ignore
    index || 0
  ];

  let thumbnail = "";
  const thumbnailRaw = description.match(/[^"]*\.(?:png|jpg|jpeg|gif)/gm);
  if (thumbnailRaw.length) {
    const item = thumbnailRaw[0];
    const { data } = await axios.get(item, {
      responseType: "arraybuffer",
    });

    const base64Img = Buffer.from(data).toString("base64");
    const imgTypeArr = item.split(".");
    const imgType = imgTypeArr[imgTypeArr.length - 1];
    thumbnail = `data:image/${imgType};base64,${base64Img}`;
  }

  return {
    title: title.length > 56 ? title.substring(0, 56) + " ..." : title,
    thumbnail,
    url,
    date: moment(pubDate).format("DD MMM YYYY, HH:mm"),
    description:
      description
        .replace(/<h3>.*<\/h3>|<figcaption>.*<\/figcaption>|<[^>]*>/gm, "")
        .substring(0, 150) + "...",
  };
};
