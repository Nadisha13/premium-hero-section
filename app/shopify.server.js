import "@shopify/shopify-app-react-router/adapters/node";

import { BillingInterval } from "@shopify/shopify-api";

import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

import prisma from "./db.server";

// Get correct app URL
function getAppUrl() {
  const configuredUrl = process.env.SHOPIFY_APP_URL?.trim();

  // In production, strictly prefer SHOPIFY_APP_URL to prevent origin mismatches.
  if (configuredUrl) {
    console.log(`[shopify.server.js] Using SHOPIFY_APP_URL: ${configuredUrl}`);
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development" && process.env.HOST) {
    console.log(`[shopify.server.js] Development mode. Using HOST: ${process.env.HOST}`);
    return process.env.HOST.replace(/\/$/, "");
  }

  // Fallback to registered production domain instead of ephemeral Vercel URLs to prevent postMessage mismatches
  if (process.env.NODE_ENV === "production" || !process.env.NODE_ENV) {
    console.warn("⚠️ [shopify.server.js] SHOPIFY_APP_URL environment variable is missing in production!");
    console.warn("⚠️ Falling back to registered production domain: https://herosection.unitradein.com to prevent origin mismatch");
    return "https://herosection.unitradein.com";
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const fallbackUrl = `https://${vercelUrl.replace(/\/$/, "")}`;
    console.log(`[shopify.server.js] Using VERCEL_URL fallback: ${fallbackUrl}`);
    return fallbackUrl;
  }

  return "https://herosection.unitradein.com";
}

// Validation: Prevent silent failures later by checking required config on startup
console.log(`[shopify.server.js] Starting app in ${process.env.NODE_ENV || 'development'} mode.`);
console.log(`[shopify.server.js] Resolved app URL: ${getAppUrl()}`);

if (process.env.NODE_ENV === "production") {
  const missing = [];
  if (!process.env.SHOPIFY_API_KEY) missing.push("SHOPIFY_API_KEY");
  if (!process.env.SHOPIFY_API_SECRET) missing.push("SHOPIFY_API_SECRET");
  if (!process.env.SHOPIFY_APP_URL) missing.push("SHOPIFY_APP_URL");

  if (missing.length > 0) {
    const errorMsg = `🚨 FATAL ERROR: Missing required environment variables: ${missing.join(", ")}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const appUrl = process.env.SHOPIFY_APP_URL || "";
  if (appUrl.includes("trycloudflare.com") || appUrl.includes("ngrok") || appUrl.includes("tunnelmole.net") || appUrl.includes("localhost")) {
    const errorMsg = `🚨 FATAL ERROR: SHOPIFY_APP_URL contains a development tunnel URL (${appUrl}) but NODE_ENV is production.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log("✅ All required production environment variables are present and valid.");
}

// Persistent Prisma session storage
const sessionStorage = new PrismaSessionStorage(prisma);

console.log("✅ Using Prisma session storage");

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,

  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",

  apiVersion: ApiVersion.October25,

  scopes: process.env.SCOPES?.split(","),

  appUrl: getAppUrl(),

  authPathPrefix: "/auth",

  sessionStorage,

  distribution: AppDistribution.AppStore,

  billing: {
    "Pro Plan": {
      lineItems: [
        {
          amount: 19,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },

    "Elite Plan": {
      lineItems: [
        {
          amount: 99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  },

  future: {
    expiringOfflineAccessTokens: true,
  },

  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? {
        customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
      }
    : {}),
});

export default shopify;

export const apiVersion = ApiVersion.October25;

export const addDocumentResponseHeaders =
  shopify.addDocumentResponseHeaders;

export const authenticate = shopify.authenticate;

export const unauthenticated = shopify.unauthenticated;

export const login = shopify.login;

export const registerWebhooks = shopify.registerWebhooks;

export const appSessionStorage =
  shopify.sessionStorage;