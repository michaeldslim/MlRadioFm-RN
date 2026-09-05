import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';
import { liveMediaArtwork } from '../constants/mediaAssets';

const androidPlaybackOptions = {
  appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
  alwaysPauseOnInterruption: true,
  // Remove the media notification immediately when playback stops.
  stopForegroundGracePeriod: 0,
};

const transport = [Capability.Play, Capability.Pause];

let configured = false;

export async function configureTrackPlayerOptions(): Promise<void> {
  if (configured) {
    return;
  }

  await TrackPlayer.updateOptions({
    android: androidPlaybackOptions,
    icon: liveMediaArtwork,
  });

  configured = true;
}

export async function updateMediaControls(): Promise<void> {
  await TrackPlayer.updateOptions({
    android: androidPlaybackOptions,
    capabilities: transport,
    compactCapabilities: transport,
    notificationCapabilities: transport,
    progressUpdateEventInterval: 0,
    icon: liveMediaArtwork,
  });
}

export async function clearMediaControls(): Promise<void> {
  await TrackPlayer.updateOptions({
    android: androidPlaybackOptions,
    capabilities: [],
    compactCapabilities: [],
    notificationCapabilities: [],
    progressUpdateEventInterval: 0,
    icon: liveMediaArtwork,
  });
}
