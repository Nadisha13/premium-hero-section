/* global process */
import { Outlet, useLoaderData, Link, useLocation } from "react-router";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    console.log(`[loader:app.jsx] Authenticating request: ${request.url}`);
    const authResult = await authenticate.admin(request);
    console.log(`[loader:app.jsx] Authentication successful. Shop: ${authResult?.session?.shop}`);
    return { apiKey: process.env.SHOPIFY_API_KEY || "" };
  } catch (error) {
    // If it's a redirect or auth response, re-throw it so Shopify/React Router can handle it.
    const isResponse = error instanceof Response || (error && typeof error.status === "number");
    if (isResponse) {
      console.log(`[loader:app.jsx] Redirect or expected auth Response thrown (status: ${error.status || 'unknown'}). Re-throwing.`);
      throw error;
    }
    console.error("🚨 Detailed Authentication Error in app.jsx:", error);
    if (error && typeof error === "object") {
      console.error("Error name/message:", error.name, "-", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Response(JSON.stringify({ 
      error: "Authentication failed",
      details: error?.message || "Unknown error during authentication",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export default function App() {
  const { apiKey } = useLoaderData();
  const location = useLocation();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <div style={{ padding: "20px" }}>
        <nav style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <Link to={`/app${location.search}`} style={{ color: "white", textDecoration: "none" }}>Home</Link>
          <Link to={`/app/pricing${location.search}`} style={{ color: "white", textDecoration: "none" }}>Subscription Plans</Link>
        </nav>
        <Outlet />
      </div>
    </AppProvider>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

