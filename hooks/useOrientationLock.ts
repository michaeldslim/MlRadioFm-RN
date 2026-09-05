import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useDeviceLayout } from './useDeviceLayout';

/**
 * Phones stay portrait; tablets (Galaxy Tab, etc.) default to landscape.
 */
export function useOrientationLock() {
  const { isTablet } = useDeviceLayout();

  useEffect(() => {
    async function applyLock() {
      try {
        if (isTablet) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
        }
      } catch {
        // Unavailable on web or some simulators
      }
    }

    applyLock();
  }, [isTablet]);
}
