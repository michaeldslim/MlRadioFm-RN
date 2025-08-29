import { Audio, AVPlaybackStatus } from 'expo-av';
import { IRadioStation, IPodcastEpisode, IPlayerState, RadioStationType, RadioError } from '../types';
import { KoreanRadioAPI } from './KoreanRadioAPI';
import { PodcastService } from './PodcastService';

export class RadioPlayerService {
  private static instance: RadioPlayerService;
  private sound: Audio.Sound | null = null;
  private listeners: ((state: IPlayerState) => void)[] = [];
  private playerState: IPlayerState = {
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    currentEpisode: null,
    volume: 0.6,
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

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      // Audio initialization failed
    }
  }

  public subscribe(listener: (state: IPlayerState) => void): () => void {
    this.listeners.push(listener);
    listener(this.playerState); // Send current state immediately
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<IPlayerState>) {
    this.playerState = { ...this.playerState, ...updates };
    this.listeners.forEach(listener => listener(this.playerState));
  }

  async playStation(station: IRadioStation): Promise<void> {
    this.updateState({
      isLoading: true,
      errorMessage: null,
      isPlaying: false,
    });

    await this.stop();

    try {
      let streamURL: string;

      if (station.type === RadioStationType.KOREAN) {
        streamURL = await this.getKoreanStationURL(station);
      } else if (station.type === RadioStationType.PODCAST) {
        try {
          console.log('🎧 Getting podcast episode for:', station.name);
          const episode = await this.getPodcastEpisode(station);
          console.log('🎧 Episode loaded:', episode.title);
          this.updateState({ currentEpisode: episode });
          streamURL = episode.audioURL;
          
          // Validate the audio URL before proceeding
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

      await this.playWithURL(streamURL, station);
      
    } catch (error) {
      this.updateState({
        errorMessage: `연결 실패: ${station.name}`,
        isLoading: false,
        isPlaying: false,
      });
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

  private bufferingTimeout: NodeJS.Timeout | null = null;
  private lastLogTime: number = 0;

  private async playWithURL(url: string, station: IRadioStation): Promise<void> {
    try {
      if (this.bufferingTimeout) {
        clearTimeout(this.bufferingTimeout);
        this.bufferingTimeout = null;
      }
      
      // Different settings for podcasts vs live streams
      const isPodcast = station.type === RadioStationType.PODCAST;
      
      if (isPodcast) {
        console.log('🎧 Creating podcast audio with URL:', url);
        
        // Validate podcast URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error('Invalid podcast URL - must be HTTP/HTTPS');
        }
      }
      
      const audioConfig = {
        shouldPlay: false,
        volume: this.playerState.volume,
        isLooping: false,
        progressUpdateIntervalMillis: isPodcast ? 1000 : 1000, // Same interval to reduce instability
      };
      
      if (isPodcast) {
        // Podcast-specific config for stability
        Object.assign(audioConfig, {
          shouldCorrectPitch: false, // Disable pitch correction to reduce processing
          rate: 1.0, // Ensure normal playback rate
          shouldDuckAndroid: false, // Prevent audio ducking
          staysActiveInBackground: true, // Keep active in background
        });
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        audioConfig,
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      
      if (isPodcast) {
        console.log('🎧 Podcast sound created, starting playback...');
      }
      
      await sound.playAsync();
      
      this.updateState({
        currentStation: station,
        isLoading: true,
      });
      
      // Much longer timeout for podcasts as they can be large files
      const timeoutDuration = isPodcast ? 45000 : 15000;
      
      this.bufferingTimeout = setTimeout(() => {
        // Only trigger timeout if still not playing
        if (!this.playerState.isPlaying) {
          if (isPodcast) console.log('🎧 Podcast timeout triggered - still not playing after', timeoutDuration / 1000, 'seconds');
          this.updateState({
            errorMessage: `연결 시간 초과: ${station.name}`,
            isPlaying: false,
            isLoading: false,
          });
        } else {
          if (isPodcast) console.log('🎧 Podcast timeout ignored - already playing');
        }
      }, timeoutDuration);

    } catch (error) {
      if (station.type === RadioStationType.PODCAST) {
        console.log('🎧 Podcast playback error:', error);
      }
      throw error;
    }
  }

  private onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    const isPodcast = this.playerState.currentStation?.type === RadioStationType.PODCAST;
    
    // Reduced logging for podcasts to avoid spam
    if (isPodcast && (!this.lastLogTime || Date.now() - this.lastLogTime > 5000)) {
      console.log('🎧 Podcast Status:', {
        isLoaded: status.isLoaded,
        isPlaying: status.isLoaded ? status.isPlaying : 'N/A',
        isBuffering: status.isLoaded ? status.isBuffering : 'N/A',
        position: status.isLoaded && status.positionMillis ? Math.floor(status.positionMillis / 1000) : 'N/A',
        duration: status.isLoaded && status.durationMillis ? Math.floor(status.durationMillis / 1000) : 'N/A',
        hasError: !status.isLoaded && 'error' in status
      });
      this.lastLogTime = Date.now();
    }
    
    if (status.isLoaded) {
      // Clear buffering timeout when audio starts playing successfully
      if (status.isPlaying && (!status.isBuffering || isPodcast)) {
        if (this.bufferingTimeout) {
          clearTimeout(this.bufferingTimeout);
          this.bufferingTimeout = null;
          if (isPodcast) console.log('🎧 Podcast timeout cleared - playback started');
        }
      }
      
      // Stable loading logic for podcasts vs live streams
      let isActuallyLoading: boolean;
      if (isPodcast) {
        // For podcasts, be more lenient with buffering states
        // Only show loading if we haven't started playing yet or if we're stuck
        const hasStartedPlaying = status.positionMillis && status.positionMillis > 0;
        isActuallyLoading = !hasStartedPlaying && status.isBuffering;
      } else {
        // For live streams, don't show loading if audio is playing (even if buffering)
        isActuallyLoading = status.isBuffering && !status.isPlaying;
      }
      
      this.updateState({
        isPlaying: status.isPlaying,
        isLoading: isActuallyLoading,
        currentTime: status.positionMillis ? status.positionMillis / 1000 : 0,
        duration: status.durationMillis ? status.durationMillis / 1000 : 0,
        progress: status.durationMillis && status.positionMillis 
          ? status.positionMillis / status.durationMillis 
          : 0,
        errorMessage: null, // Clear any previous errors when playback is working
      });

      // Handle when track finishes
      if (status.didJustFinish) {
        if (isPodcast) console.log('🎧 Podcast finished');
        this.updateState({ 
          isPlaying: false,
          isLoading: false 
        });
      }
    } else if (!status.isLoaded && 'error' in status) {
      // Handle audio load errors
      if (isPodcast) console.log('🎧 Podcast load error:', status.error);
      if (this.bufferingTimeout) {
        clearTimeout(this.bufferingTimeout);
        this.bufferingTimeout = null;
      }
      this.updateState({
        errorMessage: `오디오 로드 실패`,
        isPlaying: false,
        isLoading: false,
      });
    }
  }

  async togglePlayPause(): Promise<void> {
    if (!this.sound) return;

    try {
      if (this.playerState.isPlaying) {
        await this.sound.pauseAsync();
      } else {
        await this.sound.playAsync();
      }
    } catch (error) {
      // Toggle play/pause error
    }
  }

  async stop(): Promise<void> {
    // Clear buffering timeout
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }
    
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        // Stop error
      }
      this.sound = null;
    }

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

  async setVolume(volume: number): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateState({ volume: clampedVolume });

    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(clampedVolume);
      } catch (error) {
        console.error('Set volume error:', error);
      }
    }
  }

  async seek(progress: number): Promise<void> {
    if (!this.sound || this.playerState.duration === 0) return;

    const clampedProgress = Math.max(0, Math.min(1, progress));
    const positionMillis = clampedProgress * this.playerState.duration * 1000;

    try {
      await this.sound.setPositionAsync(positionMillis);
    } catch (error) {
      // Seek error
    }
  }

  getState(): IPlayerState {
    return this.playerState;
  }
}
