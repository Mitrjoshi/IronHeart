import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Iron Heart",
        short_name: "Iron Heart",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
          { src: "icons/icon-48x48.webp", sizes: "48x48", type: "image/webp" },
          { src: "icons/icon-72x72.webp", sizes: "72x72", type: "image/webp" },
          { src: "icons/icon-96x96.webp", sizes: "96x96", type: "image/webp" },
          {
            src: "icons/icon-128x128.webp",
            sizes: "128x128",
            type: "image/webp",
          },
          {
            src: "icons/icon-144x144.webp",
            sizes: "144x144",
            type: "image/webp",
          },
          {
            src: "icons/icon-152x152.webp",
            sizes: "152x152",
            type: "image/webp",
          },
          {
            src: "icons/icon-192x192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "icons/icon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "icons/icon-384x384.webp",
            sizes: "384x384",
            type: "image/webp",
          },
          {
            src: "icons/icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,webp,woff2,woff}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
