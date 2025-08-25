import React from 'react';
import { AppContextProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <AppContextProvider>
            {children}
            <Toaster />
          </AppContextProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}