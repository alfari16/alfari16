export const getArticle = async (index: string | number) => {
  const response = await fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@alfari"
  );
  const { items } = await response.json();

  const indexNum = typeof index === 'string' ? parseInt(index) : index;
  const article = items[indexNum || 0];

  if (!article) {
    throw new Error('Article not found');
  }

  const {
    title,
    pubDate,
    link: url,
    description,
  } = article;

  let thumbnail = "";
  const thumbnailRaw = description.match(/[^"]*\.(?:png|jpg|jpeg|gif)/gm);
  if (thumbnailRaw && thumbnailRaw.length) {
    const item = thumbnailRaw[0];
    const imgResponse = await fetch(item);
    const arrayBuffer = await imgResponse.arrayBuffer();

    const base64Img = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    const imgTypeArr = item.split(".");
    const imgType = imgTypeArr[imgTypeArr.length - 1];
    thumbnail = `data:image/${imgType};base64,${base64Img}`;
  }

  // Simple date formatting (instead of moment.js)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  return {
    title: title.length > 56 ? title.substring(0, 56) + " ..." : title,
    thumbnail,
    url,
    date: formatDate(pubDate),
    description:
      description
        .replace(/<h3>.*<\/h3>|<figcaption>.*<\/figcaption>|<[^>]*>/gm, "")
        .substring(0, 150) + "...",
  };
};
