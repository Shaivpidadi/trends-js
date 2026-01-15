import { GoogleTrendsEndpoints, GoogleTrendsTrendingHours } from './enums';

export type GoogleTrendsMapper = {
  path: string;
  method: string;
  host: string;
  url: string;
  headers: Record<string, string>;
};

export { GoogleTrendsEndpoints, GoogleTrendsTrendingHours };

// TRENDING TOPICS

export enum GoogleTrendsTrendingHours {
  fourHrs = 4,
  oneDay = 24,
  twoDays = 48,
  sevenDays = 168,
}

export type DailyTrendingTopicsOptions = {
  geo?: string;
  lang?: string;
};

export interface TrendingStory {
  title: string;
  traffic: string;
  image?: {
    newsUrl: string;
    source: string;
    imageUrl: string;
  };
  articles: Array<{
    title: string;
    url: string;
    source: string;
    time: string;
    snippet: string;
  }>;
  shareUrl: string;
  startTime: number;
  endTime?: number;
}

export interface TrendingTopic {
  title: string;
  traffic: string;
  articles: Array<{
    title: string;
    url: string;
    source: string;
    time: string;
    snippet: string;
  }>;
  startTime: number;
  endTime?: number;
}

export interface DailyTrendingTopics {
  allTrendingStories: TrendingStory[];
  summary: TrendingTopic[];
}

// Real Time Trends

export type RealTimeTrendsOptions = {
  geo: string;
  trendingHours?: number;
};

// Explore

export type ExploreOptions = {
  keyword: string;
  geo?: string;
  time?: string;
  category?: number;
  property?: string;
  hl?: string;
  enableBackoff?: boolean;
};

export type ExploreResponse = {
  widgets: Array<{
    id: string;
    request: {
      comparisonItem: Array<{
        keyword: string;
        geo: string;
        time: string;
      }>;
      category: number;
      property: string;
      restriction?: {
        geo: { country: string };
        time: string;
        originalTimeRangeForExploreUrl: string;
        complexKeywordsRestriction: {
          keyword: Array<{
            type: string;
            value: string;
          }>;
        };
      };
    };
    token: string;
  }>;
};

// Related Topics
export interface RelatedTopic {
  topic: {
    mid: string;
    title: string;
    type: string;
  };
  value: number;
  formattedValue: string;
  hasData: boolean;
  link: string;
}

export interface RelatedTopicsResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: RelatedTopic[];
    }>;
  };
}

// Related Queries
export interface RelatedQuery {
  query: string;
  value: number;
  formattedValue: string;
  hasData: boolean;
  link: string;
}

export interface RelatedQueriesResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: RelatedQuery[];
    }>;
  };
}

// Combined Related Data
export interface RelatedData {
  topics: RelatedTopic[];
  queries: RelatedQuery[];
}

export interface InterestByRegionOptions {
  keyword: string;
  startTime?: Date;
  endTime?: Date;
  geo?: string;
  resolution?: 'COUNTRY' | 'REGION' | 'CITY' | 'DMA';
  hl?: string;
  timezone?: number;
  category?: number;
  enableBackoff?: boolean;
}

export interface InterestByRegionData {
  geoCode: string;
  geoName: string;
  value: number[];
  formattedValue: string[];
  maxValueIndex: number;
  hasData: boolean[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface InterestByRegionResponse {
  default: {
    geoMapData: InterestByRegionData[];
  };
}

export interface GoogleTrendsError extends Error {
  code: string;
  statusCode?: number;
  details?: unknown;
}

export type GoogleTrendsResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: GoogleTrendsError;
};
