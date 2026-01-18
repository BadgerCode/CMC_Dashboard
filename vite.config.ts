import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/map/tiles": {
        target: "https://callmecarson.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map\/tiles/, "/subserver/map/tiles"),
      },
      "/map/sse": {
        target: "https://callmecarson.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map\/sse/, "/subserver/map/sse"),
      },
      "/map/images": {
        target: "https://callmecarson.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map\/images/, "/subserver/map/images"),
      },

      // Debug config (add to the specific rewrite rule)
      // configure: (proxy, _options) => {
      //   proxy.on("error", (err, _req, _res) => {
      //     console.log("proxy error", err);
      //   });
      //   proxy.on("proxyReq", (proxyReq, req, _res) => {
      //     console.log("Sending Request to the Target:", req.method, req.url);
      //   });
      //   proxy.on("proxyRes", (proxyRes, req, _res) => {
      //     console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
      //   });
      // },
    },
  },
});
