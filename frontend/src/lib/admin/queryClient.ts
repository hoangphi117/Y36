import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 10 * 60 * 1000, // 10 phút (caching time)
    },
    mutations: {
      retry: 0,
    },
  },
});
