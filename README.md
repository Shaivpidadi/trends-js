A TypeScript library for interacting with the Google Trends API. This package provides a simple and type-safe way to access Google Trends data programmatically.

## Showcase

### EliteTimesNews.com — Built with `@shaivpidadi/trends-js`
**URL:** https://elitetimesnews.com  
**What it uses:** `dailyTrends()` (US, en) to power the home page “Daily Trending” rail, refreshed on a schedule.


## Installation

```bash
npm install @shaivpidadi/trends-js
```

## Features

- Get daily trending topics
- Get real-time trending topics
- Get autocomplete suggestions
- Explore trends data
- Get interest by region data
- Get related topics for any keyword
- Get related queries for any keyword
- Get combined related data (topics + queries)
- TypeScript support
- Promise-based API

## Usage

### Importing

```typescript
import GoogleTrendsApi from '@shaivpidadi/trends-js';
```

### Daily Trends

Get daily trending topics for a specific region:

```typescript
const result = await GoogleTrendsApi.dailyTrends({
  geo: 'US', // Default: 'US'
  lang: 'en', // Default: 'en'
});

// Result structure:
// {
//   allTrendingStories: Array<...>,
//   summary: string[]
// }
```

### Real-Time Trends

Get real-time trending topics:

```typescript
const result = await GoogleTrendsApi.realTimeTrends({
  geo: 'US', // Default: 'US'
  trendingHours: 4, // Default: 4
});

// Result structure:
// {
//   allTrendingStories: Array<...>,
//   summary: string[]
// }
```

### Autocomplete

Get search suggestions for a keyword:

```typescript
const suggestions = await GoogleTrendsApi.autocomplete(
  'bitcoin', // Keyword to get suggestions for
  'en-US', // Language (default: 'en-US')
);

// Returns: string[]
```

### Explore

Get widget data for a keyword:

```typescript
const result = await GoogleTrendsApi.explore({
  keyword: 'bitcoin',
  geo: 'US', // Default: 'US'
  time: 'today 12-m', // Default: 'today 12-m'
  category: 0, // Default: 0
  property: '', // Default: ''
  hl: 'en-US', // Default: 'en-US'
});

// Result structure:
// {
//   widgets: Array<{
//     id: string,
//     request: {...},
//     token: string
//   }>
// }
```

### Interest by Region

Get interest data by region:

```typescript
const result = await GoogleTrendsApi.interestByRegion({
  keyword: 'Stock Market', // Required - string or string[]
  startTime: new Date('2024-01-01'), // Optional - defaults to 2004-01-01
  endTime: new Date(), // Optional - defaults to current date
  geo: 'US', // Optional - string or string[] - defaults to 'US'
  resolution: 'REGION', // Optional - 'COUNTRY' | 'REGION' | 'CITY' | 'DMA'
  hl: 'en-US', // Optional - defaults to 'en-US'
  timezone: -240, // Optional - defaults to local timezone
  category: 0, // Optional - defaults to 0
});

// Result structure:
// {
//   default: {
//     geoMapData: Array<{
//       geoCode: string,
//       geoName: string,
//       value: number[],
//       formattedValue: string[],
//       maxValueIndex: number,
//       hasData: boolean[],
//       coordinates?: {
//         lat: number,
//         lng: number
//       }
//     }>
//   }
// }
```

Example with multiple keywords and regions:

```typescript
const result = await GoogleTrendsApi.interestByRegion({
  keyword: ['wine', 'peanuts'],
  geo: ['US-CA', 'US-VA'],
  startTime: new Date('2024-01-01'),
  endTime: new Date(),
  resolution: 'CITY',
});
```

### Related Topics

Get related topics for any keyword:

```typescript
const result = await GoogleTrendsApi.relatedTopics({
  keyword: 'artificial intelligence', // Required
  geo: 'US', // Optional - defaults to 'US'
  time: 'now 1-d', // Optional - defaults to 'now 1-d'
  category: 0, // Optional - defaults to 0
  property: '', // Optional - defaults to ''
  hl: 'en-US', // Optional - defaults to 'en-US'
});

// Result structure:
// {
//   data: {
//     default: {
//       rankedList: Array<{
//         rankedKeyword: Array<{
//           topic: {
//             mid: string,
//             title: string,
//             type: string
//           },
//           value: number,
//           formattedValue: string,
//           hasData: boolean,
//           link: string
//         }>
//       }>
//     }
//   }
// }
```

### Related Queries

Get related queries for any keyword:

```typescript
const result = await GoogleTrendsApi.relatedQueries({
  keyword: 'machine learning', // Required
  geo: 'US', // Optional - defaults to 'US'
  time: 'now 1-d', // Optional - defaults to 'now 1-d'
  category: 0, // Optional - defaults to 0
  property: '', // Optional - defaults to ''
  hl: 'en-US', // Optional - defaults to 'en-US'
});

// Result structure:
// {
//   data: {
//     default: {
//       rankedList: Array<{
//         rankedKeyword: Array<{
//           query: string,
//           value: number,
//           formattedValue: string,
//           hasData: boolean,
//           link: string
//         }>
//       }>
//     }
//   }
// }
```

### Combined Related Data

Get both related topics and queries in a single call:

```typescript
const result = await GoogleTrendsApi.relatedData({
  keyword: 'blockchain', // Required
  geo: 'US', // Optional - defaults to 'US'
  time: 'now 1-d', // Optional - defaults to 'now 1-d'
  category: 0, // Optional - defaults to 0
  property: '', // Optional - defaults to ''
  hl: 'en-US', // Optional - defaults to 'en-US'
});

// Result structure:
// {
//   data: {
//     topics: Array<RelatedTopic>,
//     queries: Array<RelatedQuery>
//   }
// }
```

## API Reference

### DailyTrendsOptions

```typescript
interface DailyTrendsOptions {
  geo?: string; // Default: 'US'
  lang?: string; // Default: 'en'
}
```

### RealTimeTrendsOptions

```typescript
interface RealTimeTrendsOptions {
  geo: string;
  trendingHours?: number; // Default: 4
}
```

### ExploreOptions

```typescript
interface ExploreOptions {
  keyword: string;
  geo?: string; // Default: 'US'
  time?: string; // Default: 'today 12-m'
  category?: number; // Default: 0
  property?: string; // Default: ''
  hl?: string; // Default: 'en-US'
}
```

### InterestByRegionOptions

```typescript
interface InterestByRegionOptions {
  keyword: string | string[]; // Required - search term(s)
  startTime?: Date; // Optional - start date
  endTime?: Date; // Optional - end date
  geo?: string | string[]; // Optional - geocode(s)
  resolution?: 'COUNTRY' | 'REGION' | 'CITY' | 'DMA'; // Optional
  hl?: string; // Optional - language code
  timezone?: number; // Optional - timezone offset
  category?: number; // Optional - category number
}
```

### RelatedTopicsResponse

```typescript
interface RelatedTopicsResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: Array<{
        topic: {
          mid: string;
          title: string;
          type: string;
        };
        value: number;
        formattedValue: string;
        hasData: boolean;
        link: string;
      }>;
    }>;
  };
}
```

### RelatedQueriesResponse

```typescript
interface RelatedQueriesResponse {
  default: {
    rankedList: Array<{
      rankedKeyword: Array<{
        query: string;
        value: number;
        formattedValue: string;
        hasData: boolean;
        link: string;
      }>;
    }>;
  };
}
```

### RelatedData

```typescript
interface RelatedData {
  topics: Array<RelatedTopic>;
  queries: Array<RelatedQuery>;
}
```

## Development

### Building

```

```
