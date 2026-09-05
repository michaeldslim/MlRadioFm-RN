export enum RadioStationType {
  KOREAN = 'korean',
  INTERNATIONAL = 'international',
}

export enum StationCategory {
  ALL = '전체',
  KBS = 'KBS',
  MBC = 'MBC',
  SBS = 'SBS',
  OTHER = '기타',
  INTERNATIONAL = '해외',
}

export interface IRadioStation {
  id: string;
  name: string;
  nameEn?: string;
  url: string;
  type: RadioStationType;
}

export interface IPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentStation: IRadioStation | null;
  errorMessage: string | null;
}

export interface IStationCategoryInfo {
  category: StationCategory;
  icon: string;
  color: string;
}

export interface IKoreanRadioAPIResponse {
  channel_item?: Array<{
    service_url: string;
  }>;
}

export enum RadioError {
  INVALID_URL = 'INVALID_URL',
  NO_STREAM_URL = 'NO_STREAM_URL',
  NO_STREAM_FOUND = 'NO_STREAM_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
