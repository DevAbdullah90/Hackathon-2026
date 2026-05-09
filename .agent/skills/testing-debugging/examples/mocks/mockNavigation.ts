import { jest } from '@jest/globals';

export const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};

export const mockRoute = {
  params: {},
  name: 'MockScreen',
};

export function resetNavigationMocks(): void {
  mockNavigation.navigate.mockReset();
  mockNavigation.replace.mockReset();
  mockNavigation.reset.mockReset();
  mockNavigation.goBack.mockReset();
  mockNavigation.dispatch.mockReset();
}

// jest.mock('@react-navigation/native', () => ({
//   useNavigation: () => mockNavigation,
//   useRoute: () => mockRoute,
// }));
