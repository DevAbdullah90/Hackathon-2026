import { useWindowDimensions } from 'react-native';

/**
 * A custom hook to easily determine the current screen size category.
 * It automatically updates when the device is rotated.
 */
export function useBreakpoints() {
  const { width, height } = useWindowDimensions();

  // Typical breakpoints
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    // Helper to determine landscape orientation
    isLandscape: width > height,
    // Suggested column count for grids
    suggestedColumns: isDesktop ? 4 : isTablet ? 2 : 1,
  };
}
