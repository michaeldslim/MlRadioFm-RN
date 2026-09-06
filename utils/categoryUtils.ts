import { StationCategory, IStationCategoryInfo, IRadioStation, RadioStationType } from '../types';
import { Language } from '../locales';

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
    case StationCategory.OTHER: {
      const filtered = stations.filter(
        station =>
          (
            (
              !station.name.startsWith('KBS') &&
              !station.name.startsWith('MBC') &&
              !station.name.startsWith('SBS')
            ) ||
            station.name.startsWith('BBS') ||
            station.name.startsWith('YTN') ||
            station.url.startsWith('bbs://') ||
            station.url.startsWith('ytn://')
          ) &&
          station.type === RadioStationType.KOREAN
      );
      return filtered;
    }
    case StationCategory.INTERNATIONAL:
      return stations.filter(station => station.type === RadioStationType.INTERNATIONAL);
    default:
      return stations;
  }
};

export const getStationTypeText = (type: RadioStationType, language: Language = 'en'): string => {
  if (language === 'ko') {
    switch (type) {
      case RadioStationType.KOREAN:
        return '한국 라디오';
      case RadioStationType.INTERNATIONAL:
        return '해외 라디오';
      default:
        return '';
    }
  }

  switch (type) {
    case RadioStationType.KOREAN:
      return 'Korean Radio';
    case RadioStationType.INTERNATIONAL:
      return 'International';
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
    default:
      return 'radio';
  }
};

export interface IStationBrand {
  label: string;
  color: string;
}

export const getStationBrand = (station: IRadioStation): IStationBrand => {
  if (station.url.startsWith('kbs://') || station.name.startsWith('KBS')) {
    return { label: 'KBS', color: categoryInfo[StationCategory.KBS].color };
  }
  if (station.url.startsWith('mbc://') || station.name.startsWith('MBC')) {
    return { label: 'MBC', color: categoryInfo[StationCategory.MBC].color };
  }
  if (station.url.startsWith('sbs://') || station.name.startsWith('SBS')) {
    return { label: 'SBS', color: categoryInfo[StationCategory.SBS].color };
  }
  if (station.url.startsWith('bbs://') || station.name.startsWith('BBS')) {
    return { label: 'BBS', color: categoryInfo[StationCategory.OTHER].color };
  }
  if (station.url.startsWith('ytn://') || station.name.startsWith('YTN')) {
    return { label: 'YTN', color: '#FF3B30' };
  }
  if (station.url.startsWith('arirang://') || station.name.startsWith('Arirang')) {
    return { label: 'AR', color: categoryInfo[StationCategory.OTHER].color };
  }
  if (station.type === RadioStationType.INTERNATIONAL) {
    return { label: 'FM', color: categoryInfo[StationCategory.INTERNATIONAL].color };
  }
  return { label: 'KR', color: categoryInfo[StationCategory.ALL].color };
};

export const getStationDisplayName = (station: IRadioStation): string => {
  const name = station.name.replace(/^(KBS|MBC|SBS|YTN|BBS)\s+/, '');
  return name.replace(/^\d+/, '');
};

export const getStationSection = (station: IRadioStation): StationCategory => {
  if (station.type === RadioStationType.INTERNATIONAL) {
    return StationCategory.INTERNATIONAL;
  }
  if (station.url.startsWith('kbs://') || station.name.startsWith('KBS')) {
    return StationCategory.KBS;
  }
  if (station.url.startsWith('mbc://') || station.name.startsWith('MBC')) {
    return StationCategory.MBC;
  }
  if (station.url.startsWith('sbs://') || station.name.startsWith('SBS')) {
    return StationCategory.SBS;
  }
  return StationCategory.OTHER;
};

const SECTION_ORDER: StationCategory[] = [
  StationCategory.KBS,
  StationCategory.MBC,
  StationCategory.SBS,
  StationCategory.OTHER,
  StationCategory.INTERNATIONAL,
];

export interface IStationSection {
  category: StationCategory;
  title: string;
  color: string;
  data: IRadioStation[];
}

export const groupStationsIntoSections = (
  stations: IRadioStation[],
  language: Language = 'en',
): IStationSection[] => {
  const buckets = new Map<StationCategory, IRadioStation[]>();

  for (const station of stations) {
    const section = getStationSection(station);
    const group = buckets.get(section) ?? [];
    group.push(station);
    buckets.set(section, group);
  }

  return SECTION_ORDER
    .filter(category => (buckets.get(category)?.length ?? 0) > 0)
    .map(category => ({
      category,
      title: getCategoryDisplayName(category, language),
      color: categoryInfo[category].color,
      data: buckets.get(category)!,
    }));
};

export const getCategoryDisplayName = (category: StationCategory, language: Language = 'en'): string => {
  if (language === 'ko') {
    switch (category) {
      case StationCategory.ALL:
        return '전체';
      case StationCategory.KBS:
        return 'KBS';
      case StationCategory.MBC:
        return 'MBC';
      case StationCategory.SBS:
        return 'SBS';
      case StationCategory.OTHER:
        return '기타';
      case StationCategory.INTERNATIONAL:
        return '해외';
      default:
        return category;
    }
  }

  switch (category) {
    case StationCategory.ALL:
      return 'All';
    case StationCategory.KBS:
      return 'KBS';
    case StationCategory.MBC:
      return 'MBC';
    case StationCategory.SBS:
      return 'SBS';
    case StationCategory.OTHER:
      return 'Other';
    case StationCategory.INTERNATIONAL:
      return 'International';
    default:
      return category;
  }
};
