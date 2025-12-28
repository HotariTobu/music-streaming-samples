import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { MusicKitProvider } from "./contexts/MusicKitContext";
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
        <MusicKitProvider>
          <RouterProvider router={router} />
        </MusicKitProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
