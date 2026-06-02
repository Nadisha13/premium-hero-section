import { useRouteError, Link } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  // Prevent same-origin policy errors from happening on error page
  if (typeof window !== "undefined") {
    // Block any redirects from broken state
    const originalReplace = window.location.replace;
    const originalHref = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(window.location),
      "href"
    );

    if (window.location.protocol === "chrome-error:") {
      // We're in a broken state, prevent further navigation
      window.location.replace = function () {
        console.warn("Blocked navigation from error page");
      };
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 1rem 0" }}>
          ⚠️ Connection Error
        </h1>

        <p style={{ fontSize: "1rem", color: "#6b7280", margin: "1rem 0" }}>
          We encountered an issue loading the application. This often happens when:
        </p>

        <ul
          style={{
            textAlign: "left",
            color: "#6b7280",
            margin: "1.5rem 0",
            paddingLeft: "1.5rem",
          }}
        >
          <li style={{ marginBottom: "0.75rem" }}>Your Cloudflare tunnel disconnected</li>
          <li style={{ marginBottom: "0.75rem" }}>The local development server is not running</li>
          <li style={{ marginBottom: "0.75rem" }}>Your session expired</li>
          <li style={{ marginBottom: "0.75rem" }}>A network timeout occurred</li>
        </ul>

        <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937", margin: "2rem 0 1rem 0" }}>
          Try these steps:
        </h2>

        <ol
          style={{
            textAlign: "left",
            color: "#6b7280",
            margin: "1rem 0",
            paddingLeft: "1.5rem",
          }}
        >
          <li style={{ marginBottom: "0.75rem" }}>
            <strong>1. Check your tunnel:</strong> Ensure your Cloudflare tunnel is running
          </li>
          <li style={{ marginBottom: "0.75rem" }}>
            <strong>2. Restart the dev server:</strong> Stop and restart `npm run dev`
          </li>
          <li style={{ marginBottom: "0.75rem" }}>
            <strong>3. Clear cache:</strong> Try opening the app in an Incognito window
          </li>
          <li style={{ marginBottom: "0.75rem" }}>
            <strong>4. Refresh:</strong> Click the button below to retry
          </li>
        </ol>

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => {
              if (window.top) window.top.location.href = "/";
              else window.location.href = "/";
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            🔄 Retry Connection
          </button>
          <a
            href="/"
            target="_top"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#e5e7eb",
              color: "#1f2937",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            🏠 Go Home
          </a>
        </div>

        {error && error.status && (
          <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#9ca3af" }}>
            Error {error.status}: {error.statusText || "Unknown Error"}
          </p>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;
