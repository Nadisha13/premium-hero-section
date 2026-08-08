const DEV_STORE_SHOPS = new Set([
  "premium-hero-section.myshopify.com",
]);

export async function isDevelopmentStore(admin) {
  try {
    const response = await admin.graphql(`
      #graphql
      query {
        shop {
          plan {
            partnerDevelopment
          }
        }
      }
    `);
    const data = await response.json();
    return data?.data?.shop?.plan?.partnerDevelopment === true;
  } catch (error) {
    console.error("Failed to query shop plan partnerDevelopment:", error);
    return false;
  }
}

