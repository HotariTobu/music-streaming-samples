import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { YouTubeProvider } from "./contexts/YouTubeContext";
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
        <YouTubeProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="bottom-right" />
        </YouTubeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
