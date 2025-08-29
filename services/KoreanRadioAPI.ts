import { RadioError, IKoreanRadioAPIResponse } from '../types';

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
      const urlString = `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${channelCode}`;
      console.log('🇰🇷 Fetching KBS API:', urlString);
      
      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.kbs.co.kr/',
          'Origin': 'https://www.kbs.co.kr'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.log('🇰🇷 KBS API failed:', response.status, response.statusText);
        throw new Error(`KBS API failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🇰🇷 KBS API response:', JSON.stringify(data, null, 2));
      
      // Extract stream URL from API response
      let streamUrl = null;
      
      // Try different possible paths in the response
      if (data?.live_url) {
        streamUrl = data.live_url;
      } else if (data?.data?.live_url) {
        streamUrl = data.data.live_url;
      } else if (data?.result?.live_url) {
        streamUrl = data.result.live_url;
      } else if (data?.stream_url) {
        streamUrl = data.stream_url;
      } else if (data?.url) {
        streamUrl = data.url;
      }
      
      if (streamUrl) {
        console.log('🇰🇷 KBS stream URL found:', streamUrl);
        return streamUrl;
      }
      
      throw new Error(`No stream URL found for KBS channel ${channelCode}`);
      
    } catch (error) {
      console.log('🇰🇷 KBS API error:', error);
      throw new Error(`KBS API failed for channel ${channelCode}: ${error}`);
    }
  }

  // MBC API - 채널: sfm(표준FM), mfm(FM4U)
  async getMBCStreamURL(channel: string): Promise<string> {
    const directUrls: Record<string, string> = {
      'sfm': 'https://stream.zeno.fm/korean-pop-music', // MBC 표준FM 대체
      'mfm': 'https://stream.zeno.fm/k-pop-hits', // MBC FM4U 대체
      'chm': 'https://stream.zeno.fm/korean-ballad' // MBC 올댓뮤직 대체
    };
    
    const streamUrl = directUrls[channel];
    if (streamUrl) {
      return streamUrl;
    }
    
    throw new Error(`No stream URL found for MBC channel ${channel}`);
  }

  // SBS API - 채널: love, power
  async getSBSStreamURL(channel: string): Promise<string> {
    try {
      // SBS 대체 스트림 URL
      const streamUrls: Record<string, string> = {
        'love': 'https://stream.zeno.fm/korean-love-songs', // SBS 러브FM 대체
        'power': 'https://stream.zeno.fm/korean-rock-music' // SBS 파워FM 대체
      };
      
      const streamURL = streamUrls[channel];
      
      if (!streamURL) {
        throw new Error(RadioError.NO_STREAM_FOUND);
      }
      
      return streamURL;
    } catch (error) {
      throw new Error(RadioError.NETWORK_ERROR);
    }
  }

  // MBC 올댓뮤직 API
  async getMBCAllThatMusicURL(): Promise<string> {
    return 'https://stream.zeno.fm/korean-ballad';
  }

  // BBS 불교방송 API (대체 스트림)
  async getBBSStreamURL(): Promise<string> {
    return 'https://stream.zeno.fm/buddhist-radio';
  }

  // YTN 라디오 API (대체 스트림)
  async getYTNStreamURL(): Promise<string> {
    return 'https://stream.zeno.fm/korean-news-radio';
  }

  // Arirang Radio API (공식 스트림 유지)
  async getArirangRadioStreamURL(): Promise<string> {
    return 'https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8';
  }
}
