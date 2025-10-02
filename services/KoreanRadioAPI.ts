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
      const response = await fetch(`https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${channelCode}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.kbs.co.kr/',
          'Origin': 'https://www.kbs.co.kr'
        }
      });
      
      if (!response.ok) {
        throw new Error(`KBS API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract stream URL from API response - KBS returns it in channel_item array
      let streamUrl = null;
      
      if (data?.channel_item && Array.isArray(data.channel_item) && data.channel_item.length > 0) {
        const radioItem = data.channel_item.find((item: any) => item.media_type === 'radio');
        streamUrl = radioItem?.service_url;
      }
      
      // Fallback to other possible locations
      if (!streamUrl) {
        streamUrl = data?.live_url || data?.data?.live_url || data?.result?.live_url || data?.stream_url || data?.url;
      }
      
      if (!streamUrl) {
        throw new Error(`No stream URL found for KBS channel ${channelCode}`);
      }
      
      return streamUrl;
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`KBS API network error - check internet connection or CORS policy`);
      }
      throw new Error(`KBS API failed for channel ${channelCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // MBC API - 채널: sfm(표준FM), mfm(FM4U)
  async getMBCStreamURL(channel: string): Promise<string> {
    try {
      const response = await fetch(`https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Referer': 'https://www.imbc.com/',
          'Origin': 'https://www.imbc.com'
        },
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`MBC API failed: ${response.status} ${response.statusText}`);
      }
      
      // Check if we got redirected to an actual stream URL
      const originalUrl = `https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${channel}`;
      if (response.url === originalUrl) {
        const responseText = await response.text();
        
        // If response text looks like a URL, use it
        if (responseText.trim().startsWith('http')) {
          return responseText.trim();
        } else {
          throw new Error(`MBC API returned unexpected content: ${responseText.substring(0, 100)}`);
        }
      } else {
        return response.url;
      }
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`MBC API network error - check internet connection or CORS policy`);
      }
      throw new Error(`MBC API failed for channel ${channel}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SBS API - 채널: lovefm, powerfm
  async getSBSStreamURL(channel: string): Promise<string> {
    try {
      const response = await fetch(`https://apis.sbs.co.kr/play-api/1.0/livestream/${channel}pc/${channel}fm?protocol=hls&ssl=Y`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Referer': 'https://www.sbs.co.kr/',
          'Origin': 'https://www.sbs.co.kr'
        }
      });
      
      if (!response.ok) {
        throw new Error(`SBS API failed: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      
      // SBS API returns the stream URL directly as text, not JSON
      if (responseText.trim().startsWith('http')) {
        return responseText.trim();
      }
      
      // Fallback: Try to parse as JSON in case format changes
      try {
        const data = JSON.parse(responseText);
        const streamUrl = data?.url || data?.stream_url || data?.live_url || data?.data?.url || data?.result?.url;
        
        if (streamUrl) {
          return streamUrl;
        }
      } catch (parseError) {
        // Not JSON format, which is expected
      }
      
      throw new Error(`No valid stream URL found for SBS channel ${channel}`);
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`SBS API network error - check internet connection or CORS policy`);
      }
      throw new Error(`SBS API failed for channel ${channel}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // MBC 올댓뮤직 API
  async getMBCAllThatMusicURL(): Promise<string> {
    try {
      const response = await fetch('https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=chm', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Referer': 'https://www.imbc.com/',
          'Origin': 'https://www.imbc.com'
        },
        redirect: 'follow'
      });
      
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
    try {
      // Try multiple possible BBS stream URLs
      const streamUrls = [
        'https://bbslive.clouducs.com/bbsradio-live/livestream/playlist.m3u8',
        'https://bbslive.clouducs.com/bbsradio-live/livestream.m3u8',
        'https://live.bbs.co.kr/radio/bbs.m3u8',
        'https://stream.bbs.co.kr/radio/live.m3u8',
        'https://bbslive.clouducs.com/bbsradio/livestream/playlist.m3u8'
      ];
      
      for (const streamUrl of streamUrls) {
        try {
          const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            }
          });
          
          if (response.ok) {
            return streamUrl;
          }
        } catch (urlError) {
          continue;
        }
      }
      
      throw new Error('All BBS stream URLs are inaccessible');
      
    } catch (error) {
      throw new Error(`BBS stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // YTN 라디오 API
  async getYTNStreamURL(): Promise<string> {
    try {
      const streamUrl = 'https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8';
      
      const response = await fetch(streamUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      });
      
      if (response.ok) {
        return streamUrl;
      } else {
        throw new Error(`YTN stream URL not accessible: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`YTN stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Arirang Radio API
  async getArirangRadioStreamURL(): Promise<string> {
    try {
      const streamUrl = 'https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8';
      
      const response = await fetch(streamUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      });
      
      if (response.ok) {
        return streamUrl;
      } else {
        throw new Error(`Arirang stream URL not accessible: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Arirang stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}
