/* global process */
import { Outlet, useLoaderData, Link, useLocation } from "react-router";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
    return { apiKey: process.env.SHOPIFY_API_KEY || "" };
  } catch (error) {
    // If authenticate.admin throws a Response (e.g. redirect for OAuth), let it pass through
    if (error instanceof Response) {
      throw error;
    }
    console.error("Authentication Error in app.jsx:", error);
    throw new Response(JSON.stringify({ error: "Authentication failed" }), { 
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

