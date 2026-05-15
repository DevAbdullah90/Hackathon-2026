import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 300_000, // 5 minutes
      retry: 2,
      retryDelay: (attempt) => attempt * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Example of integrating QueryClientProvider in your App component (React Native)
/*
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import AppNavigator from './AppNavigator';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
*/
