import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const appUrl =
  process.env.SHOPIFY_APP_URL ||
  "https://premium-hero-section.vercel.app";

const host = new URL(appUrl).hostname;

export default defineConfig({
  server: {
    allowedHosts: [host, ".tunnelmole.net", ".trycloudflare.com"],
    cors: {
      preflightContinue: true,
      origin: true,
    },
    port: Number(process.env.PORT || 3000),

    // Disable HMR for Cloudflare tunnel to prevent WebSocket errors
    // Cloudflare doesn't handle WebSocket HMR well, so we disable it
    hmr: process.env.NODE_ENV === "development" && process.env.SHOPIFY_APP_URL
      ? false  // Disable HMR when using tunnel URLs (Cloudflare, ngrok, etc.)
      : true,  // Enable HMR for local development only

    fs: {
      allow: ["app", "node_modules"],
    },

    middlewareMode: false,
  },

  plugins: [reactRouter(), tsconfigPaths()],

  build: {
    assetsInlineLimit: 0,
  },

  resolve: {
    dedupe: ["react", "react-dom"],
  },

  optimizeDeps: {
    include: ["@shopify/app-bridge-react"],
  },
});