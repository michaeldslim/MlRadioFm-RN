import TrackPlayer, { Event } from 'react-native-track-player';
import { RadioPlayerService } from './RadioPlayerService';

export async function PlaybackService(): Promise<void> {
  const radioService = RadioPlayerService.getInstance();

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void radioService.handleRemotePlay();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void radioService.handleRemotePause();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    void radioService.handleRemoteSeek(position);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    void radioService.handleRemoteStop();
  });
}
