import { QueryClient } from '@tanstack/react-query';

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        return apiRequest(url);
      },
    },
  },
});

// Fonction utilitaire pour vider le cache lors de la déconnexion
export const clearUserCache = () => {
  console.log('🧹 Vidage du cache React Query...');
  queryClient.clear();
};

export { apiRequest };