import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

export const AppEffects = () => {
  const { user, token } = useAuthStore();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Effect 1: Sync Dark Mode
  // When user preference changes (loaded from DB/store), update the UI theme
  useEffect(() => {
    if (user) {
      // If user has a preference, use it
      setTheme(user.dark_mode ? "dark" : "light");
    }
  }, [user?.dark_mode, setTheme]);

  // Effect 2: Clear Cache on Logout
  // When token disappears (logout), clear all React Query cache to prevent stale data
  useEffect(() => {
    if (!token) {
      // User just logged out or token expired
      queryClient.removeQueries();
      queryClient.invalidateQueries();
    }
  }, [token, queryClient]);

  return null; // This component renders nothing
};
