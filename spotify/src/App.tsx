import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./routes";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SpotifyProvider>
          <RouterProvider router={router} />
        </SpotifyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
