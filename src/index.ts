import { GoogleTrendsApi } from './helpers/googleTrendsAPI';

const api = new GoogleTrendsApi();

export const dailyTrends = api.dailyTrends.bind(api);
export const realTimeTrends = api.realTimeTrends.bind(api);
export const autocomplete = api.autocomplete.bind(api);

// Default export for CommonJS compatibility
export default {
  dailyTrends,
  realTimeTrends,
  autocomplete
};
