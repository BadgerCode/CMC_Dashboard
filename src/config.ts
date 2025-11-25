export const Config = {
  APIURL: import.meta.env.VITE_API_URL as string,
  MAX_CACHE_AGE_MINS: 10,
  FEATURE_COLLECTIONS: import.meta.env.VITE_FEATURE_COLLECTIONS == "true",
  COLLECTIONS_KEY: import.meta.env.VITE_COLLECTIONS_KEY as string | undefined,
};