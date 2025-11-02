// Simple date formatting (instead of moment.js)
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const getArticles = async (articles: DurableObjectStub): Promise<any[]> => {
  const response = await articles.fetch("http://internal/getArticles");
  return await response.json();
};

const processArticle = async (article: any): Promise<Record<string, string>> => {
  const { title, pubDate, link: url, description } = article;

  let thumbnail = "";
  const thumbnailRaw = description.match(/[^"]*\.(?:png|jpg|jpeg|gif)/gm);
  if (thumbnailRaw && thumbnailRaw.length) {
    const item = thumbnailRaw[0];
    try {
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
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      // Continue without thumbnail if there's an error
    }
  }

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

export const getArticle = async (index: string | number, articles: DurableObjectStub) => {
  const indexNum = typeof index === "string" ? parseInt(index) : index;

  try {
    // Get articles from Durable Object (handles caching automatically)
    const items = await getArticles(articles);

    const article = items[indexNum || 0];

    if (!article) {
      throw new Error("Article not found");
    }

    return await processArticle(article);
  } catch (error) {
    console.error('Error getting article:', error);
    throw new Error("Failed to fetch article");
  }
};
