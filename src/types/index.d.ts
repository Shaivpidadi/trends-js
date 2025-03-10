export type GoogleTrendsMapper = {
    path: string;
    method: string;
    host: string;
    url: string;
    headers: Record<string, string>;
};

export const enum GoogleTrendsEndpoints {
    dailyTrends = "dailyTrends"
}

// TRENDING TOPICS

export const enum GoogleTrendsTrendingHours {
    fourHrs = 4,
    oneDay = 24,
    twoDays = 48,
    sevenDays = 168,
}

export type DailyTrendingTopicsOptions = {
    geo: string;
    trendingHours?: GoogleTrendsTrendingHours;
}

export type DailyTrendingTopics = {
    allTrendingStories: unknown[];
    summary: string[];
}
