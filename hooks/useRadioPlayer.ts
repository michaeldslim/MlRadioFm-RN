import { useState, useEffect, useCallback } from 'react';
import { IRadioStation, IPlayerState } from '../types';
import { RadioPlayerService } from '../services/RadioPlayerService';

export const useRadioPlayer = () => {
  const [playerState, setPlayerState] = useState<IPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    currentEpisode: null,
    volume: 0.5,
    currentTime: 0,
    duration: 0,
    progress: 0,
    errorMessage: null,
  });

  const radioService = RadioPlayerService.getInstance();

  useEffect(() => {
    const unsubscribe = radioService.subscribe(setPlayerState);
    return unsubscribe;
  }, []);

  const playStation = useCallback(async (station: IRadioStation) => {
    await radioService.playStation(station);
  }, []);

  const togglePlayPause = useCallback(async () => {
    await radioService.togglePlayPause();
  }, []);

  const stop = useCallback(async () => {
    await radioService.stop();
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await radioService.setVolume(volume);
  }, []);

  const seek = useCallback(async (progress: number) => {
    await radioService.seek(progress);
  }, []);

  return {
    playerState,
    playStation,
    togglePlayPause,
    stop,
    setVolume,
    seek,
  };
};
