import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  try {
    const { shop, topic, payload } = await authenticate.webhook(request);

    console.log(`Received mandatory compliance webhook: ${topic} for shop: ${shop}`);

    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
        // Triggered when a customer requests their data from the store owner.
        console.log("Customer data request payload:", JSON.stringify(payload));
        // We do not store persistent customer personal profiles outside of form submissions,
        // but we acknowledge the compliance request.
        break;

            case "CUSTOMERS_REDACT":
        // Triggered when a store owner requests that customer data be deleted.
        console.log("Customer redact payload:", JSON.stringify(payload));
        break;

      case "SHOP_REDACT":
        // Triggered 48 hours after a store owner uninstalls the app.
        console.log("Shop redact payload:", JSON.stringify(payload));
        if (shop) {
          console.log(`Erasure request: Redacting all database records for shop: ${shop}`);
          // 1. Delete subscription plans
          await db.shopSubscription.deleteMany({
            where: { shop }
          });
          // 2. Delete auth sessions
          await db.session.deleteMany({
            where: { shop }
          });
        }
        break;

      default:
        return new Response("Unhandled compliance topic", { status: 400 });
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("Error handling compliance webhook:", error);
    if (error instanceof Response) {
      return error;
    }
    return new Response("Internal Server Error", { status: 500 });
  }
};
