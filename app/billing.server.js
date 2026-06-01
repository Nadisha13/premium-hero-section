const DEV_STORE_SHOPS = new Set([
  "premium-hero-section.myshopify.com",
]);

export function isBillingTestMode(shop) {
  const configured = process.env.SHOPIFY_BILLING_TEST_MODE?.trim().toLowerCase();

  if (configured) {
    return ["1", "true", "yes", "on"].includes(configured);
  }

  return process.env.NODE_ENV !== "production" || DEV_STORE_SHOPS.has(shop);
}
