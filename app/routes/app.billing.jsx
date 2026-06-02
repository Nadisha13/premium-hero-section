import { authenticate } from "../shopify.server";
import { isBillingTestMode } from "../billing.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export async function loader({ request }) {
  try {
    const { billing } = await authenticate.admin(request);
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "";
    const host = url.searchParams.get("host") || "";

    let appUrl = process.env.SHOPIFY_APP_URL || process.env.HOST;
    const hostHeader = request.headers.get("host");

    if (process.env.NODE_ENV === "development") {
      appUrl = process.env.HOST || hostHeader || appUrl;
    }

    if (appUrl && !appUrl.startsWith("http")) {
      appUrl = `https://${appUrl}`;
    }

    const returnUrl = `${appUrl}/app?plan=PRO&shop=${shop}&host=${encodeURIComponent(host)}`;

    return await billing.request({
      plan: "Pro Plan",
      isTest: isBillingTestMode(shop),
      returnUrl: returnUrl,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if (error.name === "AbortError" || error.message?.toLowerCase().includes("aborted")) {
      console.log("Billing request was aborted:", error.message);
      return new Response("Request aborted", { status: 499 });
    }
    console.error("Billing Error:", error);

    return new Response(
      `Failed to process subscription: ${error.message}`,
      { status: 500 }
    );
  }
}
