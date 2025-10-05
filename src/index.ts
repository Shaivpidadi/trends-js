import { GoogleTrendsApi } from './helpers/googleTrendsAPI.js';

const api = new GoogleTrendsApi();

export const dailyTrends = api.dailyTrends.bind(api);
export const realTimeTrends = api.realTimeTrends.bind(api);
export const autocomplete = api.autocomplete.bind(api);
export const explore = api.explore.bind(api);
export const interestByRegion = api.interestByRegion.bind(api);
export const relatedTopics = api.relatedTopics.bind(api);
export const relatedQueries = api.relatedQueries.bind(api);
export const relatedData = api.relatedData.bind(api);

export { GoogleTrendsApi };

// Default export for CommonJS compatibility
export default {
  dailyTrends,
  realTimeTrends,
  autocomplete,
  explore,
  interestByRegion,
  relatedTopics,
  relatedQueries,
  relatedData
};
