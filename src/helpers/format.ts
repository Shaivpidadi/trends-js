import { DailyTrendingTopics, TrendingStory, TrendingTopic } from '../types/index.js';
import { ParseError } from '../errors/GoogleTrendsError.js';

// For future reference and update: from google trends page rpc call response,
// 0	"twitter down"	The main trending search term.
// 1	null OR [newsUrl, source, imageUrl, [articles...]]	Image/article data (often null in current API responses).
// 2	"US"	Country code (where the trend is happening).
// 3	[1741599600]	Unix timestamp array - first element is when the trend started.
// 4	null OR [1741602000]	Unix timestamp array - trend end time (if available).
// 5	null	Unused (reserved for future data).
// 6	500000	Search volume index (estimated search interest for the term).
// 7	null	Unused (reserved for future data).
// 8	1000	Trend ranking score (higher means more popular).
// 9	["twitter down", "is twitter down", "is x down", ...]	Related searches (other queries that users searched alongside this term).
// 10	[11]	Unclear, possibly a category identifier.
// 11	[[3606769742, "en", "US"], [3596035008, "en", "US"]]	User demographics or trending sources, with numerical IDs, language ("en" for English), and country ("US" for United States).
// 12	"twitter down"	The original trending keyword (sometimes a duplicate of index 0).

export const extractJsonFromResponse = (text: string): DailyTrendingTopics | null => {
  const cleanedText = text.replace(/^\)\]\}'/, '').trim();
  try {
    const parsedResponse = JSON.parse(cleanedText);

    if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
      throw new ParseError('Invalid response format: empty array');
    }
    const nestedJsonString = parsedResponse[0][2];

    if (!nestedJsonString) {
      throw new ParseError('Invalid response format: missing nested JSON');
    }
    const data = JSON.parse(nestedJsonString);

    if (!data || !Array.isArray(data) || data.length < 2) {
      throw new ParseError('Invalid response format: missing data array');
    }

    return updateResponseObject(data[1]);
  } catch (e: unknown) {
    if (e instanceof ParseError) {
      throw e;
    }
    throw new ParseError('Failed to parse response');
  }
};

const extractArticles = (item: unknown[]): any[] => {
  const imageData = item[1];
  if (!imageData || !Array.isArray(imageData)) return [];
  if (imageData.length <= 3) return [];

  const articlesArray = imageData[3];
  if (!Array.isArray(articlesArray)) return [];

  return articlesArray
    .filter((article: any) => Array.isArray(article) && article.length >= 5)
    .map((article: any) => ({
      title: String(article[0] || ''),
      url: String(article[1] || ''),
      source: String(article[2] || ''),
      time: String(article[3] || ''),
      snippet: String(article[4] || ''),
    }));
};

const extractTimestamp = (item: unknown[], index: number): number | undefined => {
  const timeArray = item[index];
  if (!Array.isArray(timeArray)) return undefined;
  if (timeArray.length === 0) return undefined;

  const timestamp = timeArray[0];
  if (typeof timestamp !== 'number') return undefined;

  return timestamp;
};

const extractImage = (item: unknown[]): { newsUrl: string; source: string; imageUrl: string } | undefined => {
  const imageData = item[1];
  if (!imageData || !Array.isArray(imageData)) return undefined;
  if (imageData.length < 3) return undefined;

  return {
    newsUrl: String(imageData[0] || ''),
    source: String(imageData[1] || ''),
    imageUrl: String(imageData[2] || ''),
  };
};

const updateResponseObject = (data: unknown[]): DailyTrendingTopics => {
  if (!Array.isArray(data)) {
    throw new ParseError('Invalid data format: expected array');
  }

  const allTrendingStories: TrendingStory[] = [];
  const summary: TrendingTopic[] = [];

  data.forEach((item: unknown) => {
    if (Array.isArray(item)) {
      const articles = extractArticles(item);

      const startTime = extractTimestamp(item, 3) ?? 0;
      const endTime = extractTimestamp(item, 4);

      const image = extractImage(item);

      const story: TrendingStory = {
        title: String(item[0] || ''),
        traffic: String(item[6] || '0'),
        articles: articles,
        shareUrl: String(item[12] || ''),
        startTime,
        ...(endTime && { endTime }),
        ...(image && { image }),
      };

      allTrendingStories.push(story);
      summary.push({
        title: story.title,
        traffic: story.traffic,
        articles: story.articles,
        startTime,
        ...(endTime && { endTime }),
      });
    }
  });

  return { allTrendingStories, summary };
};
