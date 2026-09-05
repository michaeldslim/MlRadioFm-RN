import { useState, useEffect, useCallback } from 'react';
import { IRadioStation, IPlayerState } from '../types';
import { RadioPlayerService } from '../services/RadioPlayerService';

export const useRadioPlayer = () => {
  const [playerState, setPlayerState] = useState<IPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    errorMessage: null,
  });

  const radioService = RadioPlayerService.getInstance();

  useEffect(() => {
    void radioService.initialize();
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

  return {
    playerState,
    playStation,
    togglePlayPause,
    stop,
  };
};
