// Central configuration for radio and podcast stream URLs and helpers

export const IHEART_BASE = 'https://stream.revma.ihrhls.com';

export const makeIHeartUrl = (zcCode: number | string): string => {
  return `${IHEART_BASE}/zc${zcCode}/hls.m3u8`;
};

// Direct international streams
export const WAYFM_897_STREAM_URL = 'https://ais-sa8.cdnstream1.com/3144_64.aac';

// Podcast feed URLs (not the episode audio URLs)
export const PODCAST_FEEDS: Record<string, string> = {
  'syntax-fm': 'https://feed.syntax.fm/rss',
};

// Korean broadcaster API bases and stream URLs
export const KBS_API_BASE = 'https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code';

export const MBC_API_URL = 'https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=';

export const SBS_API_BASE = 'https://apis.sbs.co.kr/play-api/1.0/livestream';

export const BBS_STREAM_CANDIDATES: string[] = [
  'https://bbslive.clouducs.com/bbsradio-mlive/radio.stream/chunklist_w1242564288.m3u8',
  'https://bbslive.clouducs.com/bbsradio-mlive/radio.stream/chunklist_w849550616.m3u8',
];

export const YTN_STREAM_URL = 'https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8';

export const ARIRANG_STREAM_URL = 'https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8';
