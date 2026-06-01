/* global process */
import { Outlet, useLoaderData, Link, useLocation } from "react-router";

import { AppProvider } from "@shopify/shopify-app-react-router/react";

export const loader = async () => {
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
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

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.

