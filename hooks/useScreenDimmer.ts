import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { IPlayerState } from '../types';

const DIM_DELAY_MS = __DEV__ ? 3_000 : 10_000;

export const useScreenDimmer = (playerState: IPlayerState) => {
  const [isDimmed, setIsDimmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsDimmed(true);
    }, DIM_DELAY_MS);
  }, [clearTimer]);

  const wake = useCallback(() => {
    setIsDimmed(false);
    if (playerState.isPlaying && !playerState.isLoading) {
      startTimer();
    }
  }, [playerState.isPlaying, playerState.isLoading, startTimer]);

  useEffect(() => {
    const { isPlaying, isLoading } = playerState;

    if (!isPlaying || isLoading) {
      clearTimer();
      setIsDimmed(false);
      return;
    }

    startTimer();
    return clearTimer;
  }, [
    playerState.isPlaying,
    playerState.isLoading,
    playerState.currentStation?.id,
    startTimer,
    clearTimer,
  ]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        clearTimer();
        setIsDimmed(false);
        return;
      }

      if (nextState === 'active' && playerState.isPlaying && !playerState.isLoading) {
        startTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [playerState.isPlaying, playerState.isLoading, startTimer, clearTimer]);

  return { isDimmed, wake };
};
