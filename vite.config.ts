import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.BASE_URL || "/",
  optimizeDeps: {
    exclude: ["unrar-wasm"],
  },
  build: {
    rollupOptions: {
      external: ["unrar-wasm"],
    },
  },
  worker: {
    rollupOptions: {
      external: ["unrar-wasm"],
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Guttr",
        short_name: "Guttr",
        description: "A comic book reader for CBR/CBZ files",
        theme_color: "#0891b2",
        background_color: "#111827",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        file_handlers: [
          {
            action: "/",
            accept: {
              "application/x-cbr": [".cbr"],
              "application/x-cbz": [".cbz"],
            },
          },
        ],
      },
    }),
  ],
});
