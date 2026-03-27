export const Config = {
  APIURL: import.meta.env.VITE_API_URL as string,
  MAX_CACHE_AGE_MINS: 10,
  FEATURE_MULTICANVAS_EDITOR: import.meta.env.VITE_FEATURE_MULTICANVAS_EDITOR == "true",
  MULTICANVAS_EDITOR_KEY: import.meta.env.VITE_MULTICANVAS_EDITOR_KEY as string | undefined,
  DISCORD_LOGIN_URL: import.meta.env.VITE_DISCORD_LOGIN_URL as string,
};