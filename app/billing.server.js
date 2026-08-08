const DEV_STORE_SHOPS = new Set([
  "premium-hero-section.myshopify.com",
]);

export async function isDevelopmentStore(admin) {
  // Unconditionally return false to ensure ALL charges are actual charges.
  // Test charges have been completely disabled as requested.
  return false;
}

