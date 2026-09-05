import TrackPlayer, { Event, State, TrackType } from 'react-native-track-player';
import { IRadioStation, IPlayerState, RadioStationType, RadioError } from '../types';
import { KoreanRadioAPI } from './KoreanRadioAPI';
import { configureTrackPlayerOptions, updateMediaControls } from './trackPlayerConfig';
import { liveMediaArtwork } from '../constants/mediaAssets';

const PLAYBACK_VOLUME = 1;

export class RadioPlayerService {
  private static instance: RadioPlayerService;
  private listeners: ((state: IPlayerState) => void)[] = [];
  private isChangingStation: boolean = false;
  private setupPromise: Promise<void> | null = null;
  private eventsRegistered = false;
  private bufferingTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastStoppedStation: IRadioStation | null = null;
  private playerState: IPlayerState = {
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    errorMessage: null,
  };

  public static getInstance(): RadioPlayerService {
    if (!RadioPlayerService.instance) {
      RadioPlayerService.instance = new RadioPlayerService();
    }
    return RadioPlayerService.instance;
  }

  public async initialize(): Promise<void> {
    await this.ensureSetup();
  }

  private async ensureSetup(): Promise<void> {
    if (!this.setupPromise) {
      this.setupPromise = this.setupTrackPlayer();
    }
    await this.setupPromise;
  }

  private async setupTrackPlayer(): Promise<void> {
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
    });
    await configureTrackPlayerOptions();
    this.registerEventListeners();
    await TrackPlayer.setVolume(PLAYBACK_VOLUME);
  }

  private registerEventListeners(): void {
    if (this.eventsRegistered) {
      return;
    }

    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
      this.handlePlaybackState(state);
    });

    TrackPlayer.addEventListener(Event.PlaybackError, () => {
      this.clearBufferingTimeout();
      this.updateState({
        errorMessage: '오디오 로드 실패',
        isPlaying: false,
        isLoading: false,
      });
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      this.updateState({
        isPlaying: false,
        isLoading: false,
      });
    });

    this.eventsRegistered = true;
  }

  public subscribe(listener: (state: IPlayerState) => void): () => void {
    this.listeners.push(listener);
    listener(this.playerState);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<IPlayerState>) {
    this.playerState = { ...this.playerState, ...updates };
    this.listeners.forEach(listener => listener(this.playerState));
  }

  async playStation(station: IRadioStation, options?: { fromRemote?: boolean }): Promise<void> {
    if (this.isChangingStation) {
      return;
    }

    this.isChangingStation = true;
    const fromRemote = options?.fromRemote ?? false;

    try {
      if (!fromRemote) {
        await this.ensureSetup();
      } else if (this.setupPromise) {
        await this.setupPromise;
      }

      this.updateState({
        isLoading: true,
        errorMessage: null,
        isPlaying: false,
      });

      await this.clearQueue({ allowReset: !fromRemote });
      await new Promise(resolve => setTimeout(resolve, 100));

      let streamURL: string;
      if (station.type === RadioStationType.KOREAN) {
        streamURL = await this.getKoreanStationURL(station);
      } else {
        streamURL = station.url;
      }

      if (!streamURL || streamURL.trim() === '') {
        throw new Error('Empty stream URL received');
      }

      await this.playWithURL(streamURL, station, !fromRemote);
    } catch (error) {
      this.updateState({
        errorMessage: `연결 실패: ${station.name}`,
        isLoading: false,
        isPlaying: false,
      });
    } finally {
      this.isChangingStation = false;
    }
  }

  private async getKoreanStationURL(station: IRadioStation): Promise<string> {
    const api = KoreanRadioAPI.getInstance();

    if (station.url.startsWith('kbs://')) {
      const channelCode = station.url.replace('kbs://', '');
      return await api.getKBSStreamURL(channelCode);
    } else if (station.url.startsWith('mbc://')) {
      const channel = station.url.replace('mbc://', '');
      if (channel === 'chm') {
        return await api.getMBCAllThatMusicURL();
      }
      return await api.getMBCStreamURL(channel);
    } else if (station.url.startsWith('sbs://')) {
      const channel = station.url.replace('sbs://', '');
      return await api.getSBSStreamURL(channel);
    } else if (station.url.startsWith('bbs://')) {
      return await api.getBBSStreamURL();
    } else if (station.url.startsWith('ytn://')) {
      return await api.getYTNStreamURL();
    } else if (station.url.startsWith('arirang://')) {
      return await api.getArirangRadioStreamURL();
    }
    throw new Error(RadioError.INVALID_URL);
  }

  private resolveTrackType(url: string): TrackType {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.m3u8')) {
      return TrackType.HLS;
    }
    if (lowerUrl.includes('.mpd')) {
      return TrackType.Dash;
    }
    if (lowerUrl.includes('.ism')) {
      return TrackType.SmoothStreaming;
    }
    return TrackType.Default;
  }

  private async playWithURL(
    url: string,
    station: IRadioStation,
    allowReset: boolean = true,
  ): Promise<void> {
    this.clearBufferingTimeout();

    await this.clearQueue({ allowReset });
    await updateMediaControls();
    await TrackPlayer.add({
      id: station.id,
      url,
      title: station.name,
      artist: 'ML Radio FM',
      album: 'Live Radio',
      artwork: liveMediaArtwork,
      isLiveStream: true,
      type: this.resolveTrackType(url),
    });
    await TrackPlayer.setVolume(PLAYBACK_VOLUME);
    await TrackPlayer.play();

    this.updateState({
      currentStation: station,
      isLoading: true,
    });

    this.bufferingTimeout = setTimeout(() => {
      if (!this.playerState.isPlaying) {
        this.updateState({
          errorMessage: `연결 시간 초과: ${station.name}`,
          isPlaying: false,
          isLoading: false,
        });
      }
    }, 15000);
  }

  private handlePlaybackState(state: State): void {
    const isPlaying = state === State.Playing;
    const isBuffering = state === State.Buffering || state === State.Loading;

    if (isPlaying) {
      this.clearBufferingTimeout();
    }

    this.updateState({
      isPlaying,
      isLoading: isBuffering && !isPlaying,
      errorMessage: state === State.Error ? '오디오 로드 실패' : null,
    });

    if (state === State.Ended) {
      this.updateState({
        isPlaying: false,
        isLoading: false,
      });
    }
  }

  private clearBufferingTimeout(): void {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }
  }

  private async clearQueue({ allowReset }: { allowReset: boolean }): Promise<void> {
    this.clearBufferingTimeout();

    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        return;
      }

      if (allowReset) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        return;
      }

      await TrackPlayer.pause();
      await TrackPlayer.remove(queue.map((_, index) => index));
    } catch (error) {
      console.warn('Error clearing track player queue:', error);
    }
  }

  private rememberStoppedStation(): void {
    if (this.playerState.currentStation) {
      this.lastStoppedStation = this.playerState.currentStation;
    }
  }

  private clearPlayerUiState(): void {
    this.updateState({
      isPlaying: false,
      isLoading: false,
      currentStation: null,
    });
  }

  async togglePlayPause(): Promise<void> {
    if (!this.playerState.currentStation) {
      return;
    }

    await this.ensureSetup();

    try {
      const playbackState = await TrackPlayer.getPlaybackState();
      if (playbackState.state === State.Playing) {
        await TrackPlayer.pause();
        this.updateState({ isLoading: false });
      } else {
        await TrackPlayer.play();
      }
    } catch {
      // Toggle play/pause error
    }
  }

  async stop(): Promise<void> {
    this.rememberStoppedStation();
    await this.clearQueue({ allowReset: true });
    this.clearPlayerUiState();
  }

  async handleRemotePlay(): Promise<void> {
    try {
      if (this.setupPromise) {
        await this.setupPromise;
      }

      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) {
        await TrackPlayer.updateMetadataForTrack(0, { artwork: liveMediaArtwork });

        if (!this.playerState.currentStation && this.lastStoppedStation) {
          this.updateState({
            currentStation: this.lastStoppedStation,
            isLoading: true,
          });
        }

        const playbackState = await TrackPlayer.getPlaybackState();
        if (playbackState.state !== State.Playing) {
          await TrackPlayer.play();
        }
        return;
      }

      if (this.lastStoppedStation) {
        await this.playStation(this.lastStoppedStation, { fromRemote: true });
      }
    } catch (error) {
      console.warn('Remote play error:', error);
    }
  }

  async handleRemotePause(): Promise<void> {
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        return;
      }
      await TrackPlayer.pause();
    } catch (error) {
      console.warn('Remote pause error:', error);
    }
  }

  async handleRemoteStop(): Promise<void> {
    try {
      this.rememberStoppedStation();
      this.clearBufferingTimeout();

      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) {
        await TrackPlayer.pause();
      }

      this.clearPlayerUiState();
    } catch (error) {
      console.warn('Remote stop error:', error);
    }
  }

  getState(): IPlayerState {
    return this.playerState;
  }
}
