import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/admin/queryClient";
import router from "./routes/router";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
