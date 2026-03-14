// In-memory articles cache with stale-while-revalidate
interface ArticlesCache {
  items: any[];
  fetchedAt: number;
}

let cache: ArticlesCache | null = null;
let refreshing = false;

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const fetchFreshArticles = async (): Promise<any[]> => {
  const response = await fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@alfari"
  );
  if (!response.ok) {
    throw new Error(`RSS API responded with status: ${response.status}`);
  }
  const data: any = await response.json();
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Invalid RSS response format");
  }
  return data.items;
};

const refreshCacheAsync = (): void => {
  if (refreshing) return;
  refreshing = true;
  
  console.log("Refreshing articles cache asynchronously...");
  fetchFreshArticles()
    .then((items) => {
      cache = { items, fetchedAt: Date.now() };
      console.log(`Cache refreshed with ${items.length} articles`);
    })
    .catch((err) => {
      console.error("Failed to refresh articles cache:", err);
    })
    .finally(() => {
      refreshing = false;
    });
};

const getArticles = async (): Promise<any[]> => {
  // If we have cache, check if stale
  if (cache) {
    const age = Date.now() - cache.fetchedAt;
    if (age > TTL_MS) {
      // Stale: return cached data but trigger async refresh
      refreshCacheAsync();
    }
    return cache.items;
  }

  // No cache: must fetch synchronously on first boot
  console.log("First boot: fetching articles from RSS API...");
  const items = await fetchFreshArticles();
  cache = { items, fetchedAt: Date.now() };
  console.log(`Fetched ${items.length} articles`);
  return items;
};

const processArticle = async (
  article: any
): Promise<Record<string, string>> => {
  const { title, pubDate, link: url, description } = article;

  let thumbnail = "";
  const thumbnailRaw = description.match(/[^"]*\.(?:png|jpg|jpeg|gif)/gm);
  if (thumbnailRaw && thumbnailRaw.length) {
    const item = thumbnailRaw[0];
    try {
      const imgResponse = await fetch(item);
      const arrayBuffer = await imgResponse.arrayBuffer();
      const base64Img = Buffer.from(arrayBuffer).toString("base64");
      const imgTypeArr = item.split(".");
      const imgType = imgTypeArr[imgTypeArr.length - 1];
      thumbnail = `data:image/${imgType};base64,${base64Img}`;
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
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

export const getArticle = async (
  index: string | number
): Promise<Record<string, string>> => {
  const indexNum = typeof index === "string" ? parseInt(index) : index;

  const items = await getArticles();
  const article = items[indexNum || 0];

  if (!article) {
    throw new Error("Article not found");
  }

  return await processArticle(article);
};

// Pre-fetch articles on module load (first boot)
getArticles().catch((err) => {
  console.error("Failed to pre-fetch articles on boot:", err);
});
