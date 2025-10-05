import { DailyTrendingTopics, TrendingStory, TrendingTopic } from '../types/index.js';
import { ParseError } from '../errors/GoogleTrendsError.js';

// For future refrence and update: from google trends page rpc call response,
// 0	"twitter down"	The main trending search term.
// 1	null	Unused (reserved for future Google Trends data).
// 2	"US"	Country code (where the trend is happening).
// 3	[1741599600]	Unix timestamp (represents when the search started trending).
// 4	null	Unused (reserved for future data).
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

const updateResponseObject = (data: unknown[]): DailyTrendingTopics => {
  if (!Array.isArray(data)) {
    throw new ParseError('Invalid data format: expected array');
  }

  const allTrendingStories: TrendingStory[] = [];
  const summary: TrendingTopic[] = [];

  data.forEach((item: unknown) => {
    if (Array.isArray(item)) {
      const story: TrendingStory = {
        title: String(item[0] || ''),
        traffic: String(item[6] || '0'),
        articles: Array.isArray(item[9]) ? item[9].map((article: any) => ({
          title: String(article[0] || ''),
          url: String(article[1] || ''),
          source: String(article[2] || ''),
          time: String(article[3] || ''),
          snippet: String(article[4] || '')
        })) : [],
        shareUrl: String(item[12] || '')
      };

      if (item[1]) {
        story.image = {
          newsUrl: String(item[1][0] || ''),
          source: String(item[1][1] || ''),
          imageUrl: String(item[1][2] || '')
        };
      }

      allTrendingStories.push(story);
      summary.push({
        title: story.title,
        traffic: story.traffic,
        articles: story.articles
      });
    }
  });

  return { allTrendingStories, summary };
};
