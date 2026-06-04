export async function syncPlanToMetafield(admin, plan) {
  try {
    // 1. Get current app installation ID
    const installationResponse = await admin.graphql(
      `#graphql
      query {
        currentAppInstallation {
          id
        }
      }`
    );
    const installationData = await installationResponse.json();
    const appInstallationId = installationData.data.currentAppInstallation.id;

    // 2. Set the plan metafield on the app installation
    const metafieldResponse = await admin.graphql(
      `#graphql
      mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafieldsSetInput: [
            {
              ownerId: appInstallationId,
              namespace: "premium_hero",
              key: "plan",
              type: "single_line_text_field",
              value: plan,
            },
          ],
        },
      }
    );

    const metafieldData = await metafieldResponse.json();

    if (metafieldData.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Error setting app metafield:", JSON.stringify(metafieldData.data.metafieldsSet.userErrors));
    } else {
      console.log(`✅ Successfully synced plan to metafield: ${plan}`);
    }
  } catch (error) {
    console.error("Failed to sync plan to metafield:", error);
  }
}
