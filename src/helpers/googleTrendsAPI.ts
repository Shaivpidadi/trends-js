import {
  DailyTrendingTopics,
  DailyTrendingTopicsOptions,
  RealTimeTrendsOptions,
  ExploreOptions,
  ExploreResponse,
  InterestByRegionOptions,
  InterestByRegionResponse,
  GoogleTrendsResponse,
  GoogleTrendsError,
  RelatedTopicsResponse,
  RelatedQueriesResponse,
  RelatedData,
} from '../types/index.js';
import { GoogleTrendsEndpoints } from '../types/enums.js';
import { request } from './request.js';
import { extractJsonFromResponse, formatDate, formatTrendsDate } from './format.js';
import { GOOGLE_TRENDS_MAPPER } from '../constants.js';
import {
  RateLimitError,
  InvalidRequestError,
  NetworkError,
  ParseError,
  UnknownError,
} from '../errors/GoogleTrendsError.js';

export class GoogleTrendsApi {
  /**
   * Get autocomplete suggestions for a keyword
   * @param keyword - The keyword to get suggestions for
   * @param hl - Language code (default: 'en-US')
   * @returns Promise with array of suggestion strings
   */
  async autocomplete(keyword: string, hl = 'en-US'): Promise<GoogleTrendsResponse<string[]>> {
    if (!keyword) {
      return { data: [] };
    }

    const options = {
      ...GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.autocomplete],
      qs: {
        hl,
        tz: '240',
      },
    };

    try {
      const response = await request(`${options.url}/${encodeURIComponent(keyword)}`, options);
      const text = await response.text();
      // Remove the first 5 characters (JSONP wrapper) and parse
      const data = JSON.parse(text.slice(5));
      return { data: data.default.topics.map((topic: { title: string }) => topic.title) };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }

  /**
   * Get daily trending topics
   * @param options - Options for daily trends request
   * @returns Promise with trending topics data
   */
  async dailyTrends({ geo = 'US', lang = 'en' }: DailyTrendingTopicsOptions): Promise<GoogleTrendsResponse<DailyTrendingTopics>> {
    const defaultOptions = GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.dailyTrends];

    const options = {
      ...defaultOptions,
      body: new URLSearchParams({
        'f.req': `[[["i0OFE","[null,null,\\"${geo}\\",0,\\"${lang}\\",24,1]",null,"generic"]]]`,
      }).toString(),
      contentType: 'form' as const
    };

    try {
      const response = await request(options.url, options);
      const text = await response.text();
      const trendingTopics = extractJsonFromResponse(text);

      if (!trendingTopics) {
        return { error: new ParseError() };
      }

      return { data: trendingTopics };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }

  /**
   * Get real-time trending topics
   * @param options - Options for real-time trends request
   * @returns Promise with trending topics data
   */
  async realTimeTrends({ geo = 'US', trendingHours = 4 }: RealTimeTrendsOptions): Promise<GoogleTrendsResponse<DailyTrendingTopics>> {
    const defaultOptions = GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.dailyTrends];

    const options = {
      ...defaultOptions,
      body: new URLSearchParams({
        'f.req': `[[["i0OFE","[null,null,\\"${geo}\\",0,\\"en\\",${trendingHours},1]",null,"generic"]]]`,
      }).toString(),
      contentType: 'form' as const
    };

    try {
      const response = await request(options.url, options);
      const text = await response.text();
      const trendingTopics = extractJsonFromResponse(text);

      if (!trendingTopics) {
        return { error: new ParseError() };
      }

      return { data: trendingTopics };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }

  async explore({
    keyword,
    geo = 'US',
    time = 'now 1-d',
    category = 0,
    property = '',
    hl = 'en-US',
    enableBackoff = false,
  }: ExploreOptions): Promise<ExploreResponse | { error: GoogleTrendsError }> {
    const options = {
      ...GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.explore],
      qs: {
        hl,
        tz: '240',
        req: JSON.stringify({
          comparisonItem: [
            {
              keyword,
              geo,
              time,
            },
          ],
          category,
          property,
        }),
      },
      // contentType: 'form' as const
    };
    try {
      const response = await request(options.url, options, enableBackoff);
      const text = await response.text();
      // Check if response is HTML (error page)
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        return { error: new ParseError('Explore request returned HTML instead of JSON') };
      }

      // Try to parse as JSON
      try {
        // Remove the first 5 characters (JSONP wrapper) and parse
        const data = JSON.parse(text.slice(5));

        // Extract widgets from the response
        if (data && Array.isArray(data) && data.length > 0) {
          const widgets = data[0] || [];
          return { widgets };
        }

        if (data && typeof data === 'object' && Array.isArray(data.widgets)) {
          return { widgets: data.widgets };
        }

        return { widgets: [] };
      } catch (parseError) {
        if (parseError instanceof Error) {
          return { error: new ParseError(`Failed to parse explore response as JSON: ${parseError.message}`) };
        }
        return { error: new ParseError('Failed to parse explore response as JSON') };
      }
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(`Explore request failed: ${error.message}`) };
      }
      return { error: new UnknownError('Explore request failed') };
    }
  }

  // 
  async interestByRegion({
    keyword,
    startTime = new Date('2004-01-01'),
    endTime = new Date(),
    geo = 'US',
    resolution = 'REGION',
    hl = 'en-US',
    timezone = new Date().getTimezoneOffset(),
    category = 0,
    enableBackoff = false
  }: InterestByRegionOptions): Promise<GoogleTrendsResponse<InterestByRegionResponse>> {
    const keywordValue = Array.isArray(keyword) ? keyword[0] : keyword;
    const geoValue = Array.isArray(geo) ? geo[0] : geo;
    if (!keywordValue || keywordValue.trim() === '') {
      return { error: new InvalidRequestError('Keyword is required') };
    }
    if (!geoValue || geoValue.trim() === '') {
      return { error: new InvalidRequestError('Geo is required') };
    }

    try {
      const exploreResponse = await this.explore({
        keyword: keywordValue,
        geo: geoValue,
        time: `${formatDate(startTime)} ${formatDate(endTime)}`,
        category,
        hl,
        enableBackoff
      });

      if ('error' in exploreResponse) {
        return { error: exploreResponse.error };
      }

      const widget = exploreResponse.widgets.find(w => w.id === 'GEO_MAP');

      if (!widget) {
        return { error: new ParseError('No GEO_MAP widget found in explore response') };
      }

      const requestFromWidget = {
        ...widget.request, resolution
      };

      const options = {
        ...GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.interestByRegion],
        qs: {
          hl,
          tz: timezone.toString(),
          req: JSON.stringify(requestFromWidget),
          token: widget.token
        }
      };

      const response = await request(options.url, options, enableBackoff);
      const text = await response.text();

      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        return { error: new ParseError('Interest by region request failed') };
      }
      
      // Handle JSONP wrapper (usually starts with )]}' or similar)
      const data = JSON.parse(text.slice(5));

      return { data: data.default.geoMapData };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(`Interest by region request failed: ${error.message}`) };
      }
      return { error: new UnknownError('Interest by region request failed') };
    }
  }

  async relatedTopics({
    keyword,
    geo = 'US',
    time = 'now 1-d',
    category = 0,
    property = '',
    hl = 'en-US',
    enableBackoff = false,
  }: ExploreOptions): Promise<GoogleTrendsResponse<RelatedTopicsResponse>> {
    try {
      // Validate keyword
      if (!keyword || keyword.trim() === '') {
        return { error: new InvalidRequestError('Keyword is required') };
      }

      // Step 1: Call explore to get widget data and token
      const exploreResponse = await this.explore({
        keyword,
        geo,
        time,
        category,
        property,
        hl,
        enableBackoff
      });

      if ('error' in exploreResponse) {
        return { error: exploreResponse.error };
      }

      if (!exploreResponse.widgets || exploreResponse.widgets.length === 0) {
        return { error: new ParseError('No widgets found in explore response. This might be due to Google blocking the request, invalid parameters, or network issues.') };
      }

      // Step 2: Find the related topics widget or use any available widget
      const relatedTopicsWidget = exploreResponse.widgets.find(widget =>
        widget.id === 'RELATED_TOPICS' ||
        (widget.request as any)?.restriction?.complexKeywordsRestriction?.keyword?.[0]?.value === keyword
      ) || exploreResponse.widgets[0]; // Fallback to first widget if no specific one found

      if (!relatedTopicsWidget) {
        return { error: new ParseError('No related topics widget found in explore response') };
      }

      // Step 3: Call the related topics API with or without token
      const options = {
        ...GOOGLE_TRENDS_MAPPER[GoogleTrendsEndpoints.relatedTopics],
        qs: {
          hl,
          tz: '240',
          req: JSON.stringify({
            restriction: {
              geo: { country: geo },
              time: time,
              originalTimeRangeForExploreUrl: time,
              complexKeywordsRestriction: {
                keyword: [{
                  type: 'BROAD',
                  value: keyword
                }]
              }
            },
            keywordType: 'ENTITY',
            metric: ['TOP', 'RISING'],
            trendinessSettings: {
              compareTime: time
            },
            requestOptions: {
              property: property,
              backend: 'CM',
              category: category
            },
            language: hl.split('-')[0],
            userCountryCode: geo,
            userConfig: {
              userType: 'USER_TYPE_LEGIT_USER'
            }
          }),
          ...(relatedTopicsWidget.token && { token: relatedTopicsWidget.token })
        }
      };

      const response = await request(options.url, options, enableBackoff);
      const text = await response.text();

      // Parse the response
      try {
        const data = JSON.parse(text.slice(5));

        // Return the data in the expected format
        return {
          data: {
            default: {
              rankedList: data.default?.rankedList || []
            }
          }
        };
      } catch (parseError) {
        if (parseError instanceof Error) {
          return { error: new ParseError(`Failed to parse related topics response: ${parseError.message}`) };
        }
        return { error: new ParseError('Failed to parse related topics response') };
      }

    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }

  async relatedQueries({
    keyword,
    geo = 'US',
    time = 'now 1-d',
    category = 0,
    property = '',
    hl = 'en-US',
  }: ExploreOptions): Promise<GoogleTrendsResponse<RelatedQueriesResponse>> {
    try {
      // Validate keyword
      if (!keyword || keyword.trim() === '') {
        return { error: new ParseError() };
      }

      const autocompleteResult = await this.autocomplete(keyword, hl);

      if (autocompleteResult.error) {
        return { error: autocompleteResult.error };
      }

      const relatedQueries = autocompleteResult.data?.slice(0, 10).map((suggestion, index) => ({
        query: suggestion,
        value: 100 - index * 10,
        formattedValue: (100 - index * 10).toString(),
        hasData: true,
        link: `/trends/explore?q=${encodeURIComponent(suggestion)}&date=${time}&geo=${geo}`
      })) || [];

      return {
        data: {
          default: {
            rankedList: [{
              rankedKeyword: relatedQueries
            }]
          }
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }

  async relatedData({
    keyword,
    geo = 'US',
    time = 'now 1-d',
    category = 0,
    property = '',
    hl = 'en-US',
  }: ExploreOptions): Promise<GoogleTrendsResponse<RelatedData>> {
    try {
      // Validate keyword
      if (!keyword || keyword.trim() === '') {
        return { error: new ParseError() };
      }

      const autocompleteResult = await this.autocomplete(keyword, hl);

      if (autocompleteResult.error) {
        return { error: autocompleteResult.error };
      }

      const suggestions = autocompleteResult.data?.slice(0, 10) || [];

      const topics = suggestions.map((suggestion, index) => ({
        topic: {
          mid: `/m/${index}`,
          title: suggestion,
          type: 'Topic'
        },
        value: 100 - index * 10,
        formattedValue: (100 - index * 10).toString(),
        hasData: true,
        link: `/trends/explore?q=${encodeURIComponent(suggestion)}&date=${time}&geo=${geo}`
      }));

      const queries = suggestions.map((suggestion, index) => ({
        query: suggestion,
        value: 100 - index * 10,
        formattedValue: (100 - index * 10).toString(),
        hasData: true,
        link: `/trends/explore?q=${encodeURIComponent(suggestion)}&date=${time}&geo=${geo}`
      }));

      return {
        data: {
          topics,
          queries
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: new NetworkError(error.message) };
      }
      return { error: new UnknownError() };
    }
  }
}

export default new GoogleTrendsApi();
