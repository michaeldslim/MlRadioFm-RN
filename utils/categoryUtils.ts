import { StationCategory, IStationCategoryInfo, IRadioStation, RadioStationType } from '../types';

export const categoryInfo: Record<StationCategory, IStationCategoryInfo> = {
  [StationCategory.ALL]: {
    category: StationCategory.ALL,
    icon: 'radio',
    color: '#007AFF',
  },
  [StationCategory.KBS]: {
    category: StationCategory.KBS,
    icon: 'tv',
    color: '#007AFF',
  },
  [StationCategory.MBC]: {
    category: StationCategory.MBC,
    icon: 'tv',
    color: '#34C759',
  },
  [StationCategory.SBS]: {
    category: StationCategory.SBS,
    icon: 'tv',
    color: '#FF9500',
  },
  [StationCategory.OTHER]: {
    category: StationCategory.OTHER,
    icon: 'radio-outline',
    color: '#AF52DE',
  },
  [StationCategory.INTERNATIONAL]: {
    category: StationCategory.INTERNATIONAL,
    icon: 'globe-outline',
    color: '#5856D6',
  },
  [StationCategory.PODCAST]: {
    category: StationCategory.PODCAST,
    icon: 'mic',
    color: '#FF2D92',
  },
};

export const filterStationsByCategory = (
  stations: IRadioStation[],
  category: StationCategory
): IRadioStation[] => {
  switch (category) {
    case StationCategory.ALL:
      return stations;
    case StationCategory.KBS:
      return stations.filter(station => station.name.startsWith('KBS'));
    case StationCategory.MBC:
      return stations.filter(station => station.name.startsWith('MBC'));
    case StationCategory.SBS:
      return stations.filter(station => station.name.startsWith('SBS'));
    case StationCategory.OTHER:
      return stations.filter(
        station =>
          !station.name.startsWith('KBS') &&
          !station.name.startsWith('MBC') &&
          !station.name.startsWith('SBS') &&
          station.type === RadioStationType.KOREAN
      );
    case StationCategory.INTERNATIONAL:
      return stations.filter(station => station.type === RadioStationType.INTERNATIONAL);
    case StationCategory.PODCAST:
      return stations.filter(station => station.type === RadioStationType.PODCAST);
    default:
      return stations;
  }
};

export const getStationTypeText = (type: RadioStationType): string => {
  switch (type) {
    case RadioStationType.KOREAN:
      return '한국 방송';
    case RadioStationType.INTERNATIONAL:
      return '해외 방송';
    case RadioStationType.PODCAST:
      return '팟캐스트';
    default:
      return '';
  }
};

export const getStationTypeIcon = (type: RadioStationType): string => {
  switch (type) {
    case RadioStationType.KOREAN:
      return 'radio-outline';
    case RadioStationType.INTERNATIONAL:
      return 'globe';
    case RadioStationType.PODCAST:
      return 'mic';
    default:
      return 'radio';
  }
};
