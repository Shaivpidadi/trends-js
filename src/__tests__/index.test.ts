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
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(typeof result.data?.[0]).toBe('string');
      expect(result.data?.[0].length).toBeGreaterThan(0);
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
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
        expect(typeof result.data?.[0]).toBe('string');
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
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
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
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
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
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
      }
    });
  });
});
