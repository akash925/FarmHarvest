import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
