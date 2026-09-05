import { useWindowDimensions } from 'react-native';
import {
  isLandscapeOrientation,
  isTabletDevice,
} from '../utils/deviceUtils';

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = isTabletDevice(width, height);
  const isLandscape = isLandscapeOrientation(width, height);

  return {
    width,
    height,
    isTablet,
    isLandscape,
    isLandscapeTablet: isTablet && isLandscape,
  };
}
