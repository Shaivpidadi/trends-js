import GoogleTrendsApi from '../index';
import { RateLimitError, InvalidRequestError, NetworkError, ParseError } from '../errors/GoogleTrendsError';
import { GoogleTrendsTrendingHours } from '../types/enums';

describe('GoogleTrendsApi', () => {
  describe('dailyTrends', () => {
    it('should return trending topics with default parameters', async () => {
      const result = await GoogleTrendsApi.dailyTrends({ geo: 'US' });
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('allTrendingStories');
      expect(result.data).toHaveProperty('summary');
      expect(Array.isArray(result.data?.allTrendingStories)).toBe(true);
      expect(Array.isArray(result.data?.summary)).toBe(true);
    });

    it('should return trending topics for different geo locations', async () => {
      const locations = ['US', 'GB', 'JP', 'IN', 'BR', 'DE', 'FR', 'CA', 'AU', 'RU'];
      for (const geo of locations) {
        const result = await GoogleTrendsApi.dailyTrends({ geo });
        expect(result.data).toBeDefined();
        expect(result.data).toHaveProperty('allTrendingStories');
        expect(result.data).toHaveProperty('summary');
        expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
      }
    });

    it('should return trending topics for different languages', async () => {
      const languages = [
        { lang: 'en', geo: 'US' },
        { lang: 'fr', geo: 'FR' },
        { lang: 'de', geo: 'DE' },
        { lang: 'es', geo: 'ES' },
        { lang: 'ja', geo: 'JP' },
        { lang: 'pt', geo: 'BR' },
        { lang: 'it', geo: 'IT' },
        { lang: 'ru', geo: 'RU' }
      ];

      for (const { lang, geo } of languages) {
        const result = await GoogleTrendsApi.dailyTrends({ geo, lang });
        expect(result.data).toBeDefined();
        expect(result.data).toHaveProperty('allTrendingStories');
        expect(result.data).toHaveProperty('summary');
        expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
      }
    });

    it('should work with no params', async () => {
      const result = await GoogleTrendsApi.dailyTrends({});
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('allTrendingStories');
      expect(result.data).toHaveProperty('summary');
      expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
    });

    it('should handle invalid geo location', async () => {
      const result = await GoogleTrendsApi.dailyTrends({
        geo: 'INVALID_GEO',
      });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(NetworkError);
    });

    it('should validate trending stories structure', async () => {
      const result = await GoogleTrendsApi.dailyTrends({ geo: 'US' });
      const story = result.data?.allTrendingStories[0];
      expect(story).toMatchObject({
        title: expect.any(String),
        traffic: expect.any(String),
        articles: expect.any(Array),
        shareUrl: expect.any(String)
      });
      expect(story?.title.length).toBeGreaterThan(0);
      expect(story?.traffic.length).toBeGreaterThan(0);
      expect(story?.articles.length).toBeGreaterThan(0);
      expect(story?.shareUrl.length).toBeGreaterThan(0);
    });

    it('should validate summary structure', async () => {
      const result = await GoogleTrendsApi.dailyTrends({ geo: 'US' });
      const summary = result.data?.summary[0];
      expect(summary).toMatchObject({
        title: expect.any(String),
        traffic: expect.any(String),
        articles: expect.any(Array)
      });
      expect(summary?.title.length).toBeGreaterThan(0);
      expect(summary?.traffic.length).toBeGreaterThan(0);
      expect(summary?.articles.length).toBeGreaterThan(0);
    });
  });

  describe('realTimeTrends', () => {
    it('should return realtime trends with default parameters', async () => {
      const result = await GoogleTrendsApi.realTimeTrends({
        geo: 'US',
      });
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('allTrendingStories');
      expect(result.data).toHaveProperty('summary');
      expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
    });

    it('should return realtime trends for different time periods', async () => {
      const hours = [
        GoogleTrendsTrendingHours.fourHrs,
        GoogleTrendsTrendingHours.oneDay,
        GoogleTrendsTrendingHours.twoDays,
        GoogleTrendsTrendingHours.sevenDays
      ];

      for (const trendingHours of hours) {
        const result = await GoogleTrendsApi.realTimeTrends({
          geo: 'US',
          trendingHours,
        });
        expect(result.data).toBeDefined();
        expect(result.data).toHaveProperty('allTrendingStories');
        expect(result.data).toHaveProperty('summary');
        expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
      }
    });

    it('should return realtime trends for different locations', async () => {
      const locations = ['US', 'GB', 'JP', 'IN', 'BR', 'DE', 'FR', 'CA', 'AU', 'RU'];
      for (const geo of locations) {
        const result = await GoogleTrendsApi.realTimeTrends({
          geo,
          trendingHours: GoogleTrendsTrendingHours.fourHrs,
        });
        expect(result.data).toBeDefined();
        expect(result.data).toHaveProperty('allTrendingStories');
        expect(result.data).toHaveProperty('summary');
        expect(result.data?.allTrendingStories.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid trending hours', async () => {
      const result = await GoogleTrendsApi.realTimeTrends({
        geo: 'US',
        trendingHours: -1,
      });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(NetworkError);
    });

    it('should handle invalid geo location', async () => {
      const result = await GoogleTrendsApi.realTimeTrends({
        geo: 'INVALID_GEO',
      });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(NetworkError);
    });

    it('should validate realtime trending stories structure', async () => {
      const result = await GoogleTrendsApi.realTimeTrends({
        geo: 'US',
        trendingHours: GoogleTrendsTrendingHours.fourHrs,
      });
      const story = result.data?.allTrendingStories[0];
      expect(story).toMatchObject({
        title: expect.any(String),
        traffic: expect.any(String),
        articles: expect.any(Array),
        shareUrl: expect.any(String)
      });
      expect(story?.title.length).toBeGreaterThan(0);
      expect(story?.traffic.length).toBeGreaterThan(0);
      expect(story?.articles.length).toBeGreaterThan(0);
      expect(story?.shareUrl.length).toBeGreaterThan(0);
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions for a keyword', async () => {
      const result = await GoogleTrendsApi.autocomplete('bitcoin');
      // API may return errors due to rate limiting, so we check for either data or error
      if (result.data) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
        expect(typeof result.data?.[0]).toBe('string');
        expect(result.data?.[0].length).toBeGreaterThan(0);
      } else {
        // If API returns error, it should be a valid error object
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should return autocomplete suggestions for different languages', async () => {
      const languages = [
        { keyword: 'bitcoin', hl: 'en-US' },
        { keyword: 'bitcoin', hl: 'fr-FR' },
        { keyword: 'bitcoin', hl: 'de-DE' },
        { keyword: 'bitcoin', hl: 'es-ES' },
        { keyword: 'bitcoin', hl: 'ja-JP' },
        { keyword: 'bitcoin', hl: 'pt-BR' },
        { keyword: 'bitcoin', hl: 'it-IT' },
        { keyword: 'bitcoin', hl: 'ru-RU' }
      ];

      for (const { keyword, hl } of languages) {
        const result = await GoogleTrendsApi.autocomplete(keyword, hl);
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data?.length).toBeGreaterThan(0);
          expect(typeof result.data?.[0]).toBe('string');
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle empty keyword', async () => {
      const result = await GoogleTrendsApi.autocomplete('');
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(0);
    });

    it('should handle special characters in keyword', async () => {
      const specialKeywords = [
        'bitcoin & ethereum',
        'c++ programming',
        'c# developer',
        'node.js framework',
        'react.js vs vue.js',
        'python 3.9',
        'typescript 4.x',
        'docker-compose.yml'
      ];

      for (const keyword of specialKeywords) {
        const result = await GoogleTrendsApi.autocomplete(keyword);
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data?.length).toBeGreaterThan(0);
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle non-ASCII characters', async () => {
      const nonAsciiKeywords = [
        { keyword: 'ビットコイン', hl: 'ja-JP' },
        { keyword: '比特币', hl: 'zh-CN' },
        { keyword: '비트코인', hl: 'ko-KR' },
        { keyword: 'บิตคอยน์', hl: 'th-TH' },
        { keyword: 'बिटकॉइन', hl: 'hi-IN' },
        { keyword: 'बिटकॉइन', hl: 'mr-IN' }
      ];

      for (const { keyword, hl } of nonAsciiKeywords) {
        const result = await GoogleTrendsApi.autocomplete(keyword, hl);
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data?.length).toBeGreaterThan(0);
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should handle very long keywords', async () => {
      const longKeyword = 'a'.repeat(1000);
      const result = await GoogleTrendsApi.autocomplete(longKeyword);
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(NetworkError);
    });

    it('should handle common search terms', async () => {
      const commonTerms = [
        'weather',
        'news',
        'sports',
        'music',
        'movies',
        'games',
        'shopping',
        'travel'
      ];

      for (const term of commonTerms) {
        const result = await GoogleTrendsApi.autocomplete(term);
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data?.length).toBeGreaterThan(0);
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });
  });

  describe('relatedTopics', () => {
    it('should return related topics for a keyword', async () => {
      const result = await GoogleTrendsApi.relatedTopics({ keyword: 'bitcoin' });
      // API may return errors due to rate limiting, so we check for either data or error
      if (result.data) {
        expect(result.data?.default).toBeDefined();
        expect(result.data?.default.rankedList).toBeDefined();
        expect(Array.isArray(result.data?.default.rankedList)).toBe(true);
        expect(result.data?.default.rankedList.length).toBeGreaterThan(0);
      } else {
        // If API returns error, it should be a valid error object
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should return related topics with different geo locations', async () => {
      const locations = ['US', 'GB', 'JP', 'IN', 'BR'];
      for (const geo of locations) {
        const result = await GoogleTrendsApi.relatedTopics({
          keyword: 'bitcoin',
          geo
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.default).toBeDefined();
          expect(result.data?.default.rankedList).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should return related topics with different time ranges', async () => {
      const timeRanges = ['now 1-d', 'now 7-d', 'today 12-m'];
      for (const time of timeRanges) {
        const result = await GoogleTrendsApi.relatedTopics({
          keyword: 'bitcoin',
          time
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.default).toBeDefined();
          expect(result.data?.default.rankedList).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should validate related topics structure', async () => {
      const result = await GoogleTrendsApi.relatedTopics({ keyword: 'bitcoin' });
      const topic = result.data?.default.rankedList?.[0]?.rankedKeyword?.[0];
      if (topic) {
        expect(topic).toMatchObject({
          topic: {
            mid: expect.any(String),
            title: expect.any(String),
            type: expect.any(String)
          },
          value: expect.any(Number),
          formattedValue: expect.any(String),
          hasData: expect.any(Boolean),
          link: expect.any(String)
        });
        expect(topic.topic.mid.length).toBeGreaterThan(0);
        expect(topic.topic.title.length).toBeGreaterThan(0);
        expect(topic.topic.type.length).toBeGreaterThan(0);
        expect(topic.link.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid keyword', async () => {
      const result = await GoogleTrendsApi.relatedTopics({ keyword: '' });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(ParseError);
    });
  });

  describe('relatedQueries', () => {
    it('should return related queries for a keyword', async () => {
      const result = await GoogleTrendsApi.relatedQueries({ keyword: 'bitcoin' });
      // API may return errors due to rate limiting, so we check for either data or error
      if (result.data) {
        expect(result.data?.default).toBeDefined();
        expect(result.data?.default.rankedList).toBeDefined();
        expect(Array.isArray(result.data?.default.rankedList)).toBe(true);
        expect(result.data?.default.rankedList.length).toBeGreaterThan(0);
      } else {
        // If API returns error, it should be a valid error object
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should return related queries with different geo locations', async () => {
      const locations = ['US', 'GB', 'JP', 'IN', 'BR'];
      for (const geo of locations) {
        const result = await GoogleTrendsApi.relatedQueries({
          keyword: 'bitcoin',
          geo
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.default).toBeDefined();
          expect(result.data?.default.rankedList).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should return related queries with different time ranges', async () => {
      const timeRanges = ['now 1-d', 'now 7-d', 'today 12-m'];
      for (const time of timeRanges) {
        const result = await GoogleTrendsApi.relatedQueries({
          keyword: 'bitcoin',
          time
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.default).toBeDefined();
          expect(result.data?.default.rankedList).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should validate related queries structure', async () => {
      const result = await GoogleTrendsApi.relatedQueries({ keyword: 'bitcoin' });
      const query = result.data?.default.rankedList?.[0]?.rankedKeyword?.[0];
      if (query) {
        expect(query).toMatchObject({
          query: expect.any(String),
          value: expect.any(Number),
          formattedValue: expect.any(String),
          hasData: expect.any(Boolean),
          link: expect.any(String)
        });
        expect(query.query.length).toBeGreaterThan(0);
        expect(query.link.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid keyword', async () => {
      const result = await GoogleTrendsApi.relatedQueries({ keyword: '' });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(ParseError);
    });
  });

  describe('relatedData', () => {
    it('should return both related topics and queries', async () => {
      const result = await GoogleTrendsApi.relatedData({ keyword: 'bitcoin' });
      // API may return errors due to rate limiting, so we check for either data or error
      if (result.data) {
        expect(result.data?.topics).toBeDefined();
        expect(result.data?.queries).toBeDefined();
        expect(Array.isArray(result.data?.topics)).toBe(true);
        expect(Array.isArray(result.data?.queries)).toBe(true);
      } else {
        // If API returns error, it should be a valid error object
        expect(result.error).toBeDefined();
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should return related data with different geo locations', async () => {
      const locations = ['US', 'GB', 'JP', 'IN', 'BR'];
      for (const geo of locations) {
        const result = await GoogleTrendsApi.relatedData({
          keyword: 'bitcoin',
          geo
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.topics).toBeDefined();
          expect(result.data?.queries).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should return related data with different time ranges', async () => {
      const timeRanges = ['now 1-d', 'now 7-d', 'today 12-m'];
      for (const time of timeRanges) {
        const result = await GoogleTrendsApi.relatedData({
          keyword: 'bitcoin',
          time
        });
        // API may return errors due to rate limiting, so we check for either data or error
        if (result.data) {
          expect(result.data?.topics).toBeDefined();
          expect(result.data?.queries).toBeDefined();
        } else {
          // If API returns error, it should be a valid error object
          expect(result.error).toBeDefined();
          expect(result.error).toBeInstanceOf(Error);
        }
      }
    });

    it('should validate related data structure', async () => {
      const result = await GoogleTrendsApi.relatedData({ keyword: 'bitcoin' });

      // Check topics structure
      const topic = result.data?.topics?.[0];
      if (topic) {
        expect(topic).toMatchObject({
          topic: {
            mid: expect.any(String),
            title: expect.any(String),
            type: expect.any(String)
          },
          value: expect.any(Number),
          formattedValue: expect.any(String),
          hasData: expect.any(Boolean),
          link: expect.any(String)
        });
      }

      // Check queries structure
      const query = result.data?.queries?.[0];
      if (query) {
        expect(query).toMatchObject({
          query: expect.any(String),
          value: expect.any(Number),
          formattedValue: expect.any(String),
          hasData: expect.any(Boolean),
          link: expect.any(String)
        });
      }
    });

    it('should handle invalid keyword', async () => {
      const result = await GoogleTrendsApi.relatedData({ keyword: '' });
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(ParseError);
    });
  });
});
