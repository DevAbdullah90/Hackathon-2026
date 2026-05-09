import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
// Import other global providers as needed, e.g., Zustand stores, ThemeProvider

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { wrapper: WrapperComponent, ...renderOptions }: RenderOptions = {}
) {
  const queryClient = createTestQueryClient();
  const AllProviders: React.FC = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );

  const Wrapper = WrapperComponent || AllProviders;
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Usage example in a test file:
// const { getByText } = renderWithProviders(<LoginScreen />);
