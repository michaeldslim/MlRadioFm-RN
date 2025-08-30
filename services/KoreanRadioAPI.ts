import { RadioError } from '../types';

export class KoreanRadioAPI {
  private static instance: KoreanRadioAPI;

  public static getInstance(): KoreanRadioAPI {
    if (!KoreanRadioAPI.instance) {
      KoreanRadioAPI.instance = new KoreanRadioAPI();
    }
    return KoreanRadioAPI.instance;
  }

  // KBS API - 채널 코드: 21(1라디오), 22(2라디오), 23(3라디오), 24(클래식FM)
  async getKBSStreamURL(channelCode: string): Promise<string> {
    try {
      const response = await fetch(`https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${channelCode}`);
      
      if (!response.ok) {
        throw new Error(`KBS API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract stream URL from API response
      const streamUrl = data?.live_url || data?.data?.live_url || data?.result?.live_url || data?.stream_url || data?.url;
      
      if (!streamUrl) {
        throw new Error(`No stream URL found for KBS channel ${channelCode}`);
      }
      
      return streamUrl;
      
    } catch (error) {
      throw new Error(`KBS API failed for channel ${channelCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // MBC API - 채널: sfm(표준FM), mfm(FM4U)
  async getMBCStreamURL(channel: string): Promise<string> {
    try {
      const response = await fetch(`https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`);
      
      if (!response.ok) {
        throw new Error(`MBC API failed: ${response.status}`);
      }
      
      const streamUrl = response.url;
      return streamUrl;
      
    } catch (error) {
      throw new Error(`MBC API failed for channel ${channel}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SBS API - 채널: lovefm, powerfm
  async getSBSStreamURL(channel: string): Promise<string> {
    try {
      const response = await fetch(`https://apis.sbs.co.kr/play-api/1.0/livestream/${channel}pc/${channel}fm?protocol=hls&ssl=Y`);
      
      if (!response.ok) {
        throw new Error(`SBS API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract stream URL from API response
      const streamUrl = data?.url || data?.stream_url || data?.live_url;
      
      if (!streamUrl) {
        throw new Error(`No stream URL found for SBS channel ${channel}`);
      }
      
      return streamUrl;
      
    } catch (error) {
      throw new Error(`SBS API failed for channel ${channel}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // MBC 올댓뮤직 API
  async getMBCAllThatMusicURL(): Promise<string> {
    try {
      const response = await fetch('https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=chm');
      
      if (!response.ok) {
        throw new Error(`MBC AllThatMusic API failed: ${response.status}`);
      }
      
      const streamUrl = await response.text();
      const trimmedUrl = streamUrl.trim();
      
      if (!trimmedUrl) {
        throw new Error('No stream URL found for MBC AllThatMusic');
      }
      
      return trimmedUrl;
      
    } catch (error) {
      throw new Error(`MBC AllThatMusic API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // BBS 불교방송 API
  async getBBSStreamURL(): Promise<string> {
    return 'https://stream.zeno.fm/buddhist-radio';
  }

  // YTN 라디오 API
  async getYTNStreamURL(): Promise<string> {
    return 'https://stream.zeno.fm/korean-news-radio';
  }

  // Arirang Radio API
  async getArirangRadioStreamURL(): Promise<string> {
    return 'https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8';
  }
}
