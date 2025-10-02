import { IRadioStation, RadioStationType } from '../types';

export const radioStations: IRadioStation[] = [
  // KBS 라디오
  {
    id: 'kbs-1radio',
    name: 'KBS 1라디오',
    url: 'kbs://21',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'kbs-2radio',
    name: 'KBS 2라디오 해피FM',
    url: 'kbs://22',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'kbs-3radio',
    name: 'KBS 3라디오 쿨FM',
    url: 'kbs://23',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'kbs-classic',
    name: 'KBS 클래식FM',
    url: 'kbs://24',
    type: RadioStationType.KOREAN,
  },

  // MBC 라디오
  {
    id: 'mbc-standard',
    name: 'MBC 표준FM',
    url: 'mbc://sfm',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'mbc-fm4u',
    name: 'MBC FM4U',
    url: 'mbc://mfm',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'mbc-allthatmusic',
    name: 'MBC 올댓뮤직',
    url: 'mbc://chm',
    type: RadioStationType.KOREAN,
  },

  // SBS 라디오
  {
    id: 'sbs-love',
    name: 'SBS 러브FM',
    url: 'sbs://love',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'sbs-power',
    name: 'SBS 파워FM',
    url: 'sbs://power',
    type: RadioStationType.KOREAN,
  },

  // 기타 방송사 (HTTPS 공식 스트림)
  {
    id: 'bbs-main',
    name: 'BBS 불교방송',
    url: 'bbs://main',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'ytn-radio',
    name: 'YTN 라디오',
    url: 'ytn://main',
    type: RadioStationType.KOREAN,
  },
  {
    id: 'arirang-radio',
    name: 'Arirang Radio',
    url: 'arirang://main',
    type: RadioStationType.KOREAN,
  },

  // 해외 라디오
  {
    id: 'kiss-fm',
    name: 'KISS FM 106.1',
    url: 'https://n35a-e2.revma.ihrhls.com/zc181',
    type: RadioStationType.INTERNATIONAL,
  },
  {
    id: 'star-1021',
    name: 'STAR 102.1',
    url: 'https://n10a-e2.revma.ihrhls.com/zc2815',
    type: RadioStationType.INTERNATIONAL,
  },
  {
    id: 'new-mix',
    name: 'The New MiX 102.9',
    url: 'https://n10a-e2.revma.ihrhls.com/zc2237',
    type: RadioStationType.INTERNATIONAL,
  },

  // Podcasts
  {
    id: 'syntax-fm',
    name: 'Syntax.fm',
    url: 'https://feed.syntax.fm/rss',
    type: RadioStationType.PODCAST,
  },
];
