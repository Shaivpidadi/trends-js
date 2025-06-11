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
    };
    token: string;
  }>;
};

export interface InterestByRegionOptions {
  keyword: string | string[];
  startTime?: Date;
  endTime?: Date;
  geo?: string | string[];
  resolution?: 'COUNTRY' | 'REGION' | 'CITY' | 'DMA';
  hl?: string;
  timezone?: number;
  category?: number;
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
