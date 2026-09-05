import TrackPlayer, { Event, State, TrackType } from 'react-native-track-player';
import { IRadioStation, IPodcastEpisode, IPlayerState, RadioStationType, RadioError } from '../types';
import { KoreanRadioAPI } from './KoreanRadioAPI';
import { PodcastService } from './PodcastService';
import { configureTrackPlayerOptions, updateMediaControls } from './trackPlayerConfig';
import { defaultMediaArtwork, liveMediaArtwork } from '../constants/mediaAssets';

export class RadioPlayerService {
  private static instance: RadioPlayerService;
  private listeners: ((state: IPlayerState) => void)[] = [];
  private isChangingStation: boolean = false;
  private setupPromise: Promise<void> | null = null;
  private eventsRegistered = false;
  private bufferingTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastLogTime: number = 0;
  private lastProgressPosition = 0;
  private lastStoppedStation: IRadioStation | null = null;
  private lastStoppedEpisode: IPodcastEpisode | null = null;
  private playerState: IPlayerState = {
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    currentEpisode: null,
    volume: 0.5,
    currentTime: 0,
    duration: 0,
    progress: 0,
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
    await TrackPlayer.setVolume(this.playerState.volume);
  }

  private registerEventListeners(): void {
    if (this.eventsRegistered) {
      return;
    }

    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
      this.handlePlaybackState(state);
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({ position, duration }) => {
      this.handleProgress(position, duration);
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
      console.log('Station change already in progress, ignoring request');
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
      let episode: IPodcastEpisode | null = null;

      if (station.type === RadioStationType.KOREAN) {
        streamURL = await this.getKoreanStationURL(station);
      } else if (station.type === RadioStationType.PODCAST) {
        try {
          console.log('🎧 Getting podcast episode for:', station.name);
          episode = await this.getPodcastEpisode(station);
          console.log('🎧 Episode loaded:', episode.title);
          this.updateState({ currentEpisode: episode });
          streamURL = episode.audioURL;

          if (!streamURL || (!streamURL.startsWith('http://') && !streamURL.startsWith('https://'))) {
            throw new Error('Invalid podcast audio URL');
          }

          console.log('🎧 Using audio URL:', streamURL);
        } catch (error) {
          console.log('🎧 Podcast episode error:', error);
          throw new Error(`팟캐스트 에피소드 로드 실패: ${station.name}`);
        }
      } else {
        streamURL = station.url;
      }

      if (!streamURL || streamURL.trim() === '') {
        throw new Error('Empty stream URL received');
      }

      await this.playWithURL(streamURL, station, episode, !fromRemote);
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
      } else {
        return await api.getMBCStreamURL(channel);
      }
    } else if (station.url.startsWith('sbs://')) {
      const channel = station.url.replace('sbs://', '');
      return await api.getSBSStreamURL(channel);
    } else if (station.url.startsWith('bbs://')) {
      return await api.getBBSStreamURL();
    } else if (station.url.startsWith('ytn://')) {
      return await api.getYTNStreamURL();
    } else if (station.url.startsWith('arirang://')) {
      return await api.getArirangRadioStreamURL();
    } else {
      throw new Error(RadioError.INVALID_URL);
    }
  }

  private async getPodcastEpisode(station: IRadioStation): Promise<IPodcastEpisode> {
    const podcastService = PodcastService.getInstance();

    try {
      const episode = await podcastService.parseLatestEpisode(station.url);

      if (!episode || !episode.audioURL) {
        throw new Error('Invalid episode data');
      }

      return episode;
    } catch (error) {
      throw new Error(`팟캐스트 RSS 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    episode: IPodcastEpisode | null,
    allowReset: boolean = true,
  ): Promise<void> {
    this.clearBufferingTimeout();
    this.lastProgressPosition = 0;

    const isPodcast = station.type === RadioStationType.PODCAST;

    if (isPodcast) {
      console.log('🎧 Creating podcast track with URL:', url);

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Invalid podcast URL - must be HTTP/HTTPS');
      }
    }

    const artist = isPodcast && episode
      ? episode.title
      : 'ML Radio FM';

    await this.clearQueue({ allowReset });
    await updateMediaControls(isPodcast);
    await TrackPlayer.add({
      id: station.id,
      url,
      title: station.name,
      artist,
      album: isPodcast ? 'Podcast' : 'Live Radio',
      artwork: isPodcast ? defaultMediaArtwork : liveMediaArtwork,
      isLiveStream: !isPodcast,
      type: this.resolveTrackType(url),
    });
    await TrackPlayer.setVolume(this.playerState.volume);
    await TrackPlayer.play();

    this.updateState({
      currentStation: station,
      isLoading: true,
      currentEpisode: episode,
    });

    const timeoutDuration = isPodcast ? 45000 : 15000;

    this.bufferingTimeout = setTimeout(() => {
      if (!this.playerState.isPlaying) {
        if (isPodcast) {
          console.log('🎧 Podcast timeout triggered - still not playing after', timeoutDuration / 1000, 'seconds');
        }
        this.updateState({
          errorMessage: `연결 시간 초과: ${station.name}`,
          isPlaying: false,
          isLoading: false,
        });
      } else if (isPodcast) {
        console.log('🎧 Podcast timeout ignored - already playing');
      }
    }, timeoutDuration);
  }

  private handlePlaybackState(state: State): void {
    const isPodcast = this.playerState.currentStation?.type === RadioStationType.PODCAST;
    const isPlaying = state === State.Playing;
    const isBuffering = state === State.Buffering || state === State.Loading;

    if (isPodcast && (!this.lastLogTime || Date.now() - this.lastLogTime > 5000)) {
      console.log('🎧 Podcast Status:', {
        state,
        position: this.lastProgressPosition,
        duration: this.playerState.duration,
      });
      this.lastLogTime = Date.now();
    }

    if (isPlaying) {
      this.clearBufferingTimeout();
      if (isPodcast) {
        console.log('🎧 Podcast timeout cleared - playback started');
      }
    }

    let isActuallyLoading: boolean;
    if (isPodcast) {
      const hasStartedPlaying = this.lastProgressPosition > 0;
      isActuallyLoading = !hasStartedPlaying && isBuffering;
    } else {
      isActuallyLoading = isBuffering && !isPlaying;
    }

    this.updateState({
      isPlaying,
      isLoading: isActuallyLoading,
      errorMessage: state === State.Error ? '오디오 로드 실패' : null,
    });

    if (state === State.Ended) {
      if (isPodcast) {
        console.log('🎧 Podcast finished');
      }
      this.updateState({
        isPlaying: false,
        isLoading: false,
      });
    }
  }

  private handleProgress(position: number, duration: number): void {
    this.lastProgressPosition = position;

    this.updateState({
      currentTime: position,
      duration: duration > 0 ? duration : this.playerState.duration,
      progress: duration > 0 ? position / duration : 0,
    });
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
      this.lastStoppedEpisode = this.playerState.currentEpisode;
    }
  }

  private clearPlayerUiState(): void {
    this.updateState({
      isPlaying: false,
      isLoading: false,
      currentStation: null,
      currentEpisode: null,
      currentTime: 0,
      duration: 0,
      progress: 0,
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
    } catch (error) {
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
        const artwork = this.lastStoppedStation?.type === RadioStationType.PODCAST
          ? defaultMediaArtwork
          : liveMediaArtwork;
        await TrackPlayer.updateMetadataForTrack(0, { artwork });

        if (!this.playerState.currentStation && this.lastStoppedStation) {
          this.updateState({
            currentStation: this.lastStoppedStation,
            currentEpisode: this.lastStoppedEpisode,
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

  async handleRemoteSeek(position: number): Promise<void> {
    const station = this.playerState.currentStation ?? this.lastStoppedStation;
    if (station?.type !== RadioStationType.PODCAST) {
      return;
    }

    try {
      await TrackPlayer.seekTo(position);
      const duration = this.playerState.duration;
      if (duration > 0) {
        this.updateState({
          currentTime: position,
          progress: position / duration,
        });
      }
    } catch (error) {
      console.warn('Remote seek error:', error);
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

  async setVolume(volume: number): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateState({ volume: clampedVolume });

    try {
      await this.ensureSetup();
      await TrackPlayer.setVolume(clampedVolume);
    } catch (error) {
      console.error('Set volume error:', error);
    }
  }

  async seek(progress: number): Promise<void> {
    if (this.playerState.duration === 0) {
      return;
    }

    const clampedProgress = Math.max(0, Math.min(1, progress));
    const position = clampedProgress * this.playerState.duration;

    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      // Seek error
    }
  }

  getState(): IPlayerState {
    return this.playerState;
  }
}
