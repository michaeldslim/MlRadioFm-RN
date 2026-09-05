import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';
import { defaultMediaArtwork } from '../constants/mediaAssets';

const androidPlaybackOptions = {
  appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
  alwaysPauseOnInterruption: true,
};

let baseConfigured = false;

export async function configureTrackPlayerOptions(): Promise<void> {
  if (baseConfigured) {
    return;
  }

  await TrackPlayer.updateOptions({
    android: androidPlaybackOptions,
    icon: defaultMediaArtwork,
  });

  baseConfigured = true;
}

export async function updateMediaControls(isPodcast: boolean): Promise<void> {
  const transport = [Capability.Play, Capability.Pause];
  const capabilities = isPodcast
    ? [...transport, Capability.SeekTo]
    : transport;

  await TrackPlayer.updateOptions({
    android: androidPlaybackOptions,
    capabilities,
    compactCapabilities: transport,
    notificationCapabilities: capabilities,
    progressUpdateEventInterval: isPodcast ? 1 : 0,
    icon: defaultMediaArtwork,
  });
}
