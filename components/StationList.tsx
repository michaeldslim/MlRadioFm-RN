import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SectionList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IRadioStation, IPlayerState, StationCategory } from '../types';
import {
  getStationBrand,
  getStationDisplayName,
  groupStationsIntoSections,
  IStationSection,
} from '../utils/categoryUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { Copyright } from './Copyright';
import { EqualizerBars } from './EqualizerBars';

interface IStationListProps {
  stations: IRadioStation[];
  playerState: IPlayerState;
  onStationSelect: (station: IRadioStation) => void;
  selectedCategory?: StationCategory;
}

export const StationList: React.FC<IStationListProps> = ({
  stations,
  playerState,
  onStationSelect,
  selectedCategory = StationCategory.ALL,
}) => {
  const { t, language } = useLanguage();
  const useSections = selectedCategory === StationCategory.ALL;

  const sections = useMemo(
    () => (useSections ? groupStationsIntoSections(stations, language) : []),
    [useSections, stations, language],
  );

  const renderStatusIndicator = (
    isCurrentStation: boolean,
    isPlaying: boolean,
    isLoading: boolean,
    brandColor: string,
  ) => {
    if (!isCurrentStation) {
      return null;
    }

    if (isLoading) {
      return <ActivityIndicator size="small" color={brandColor} />;
    }

    if (isPlaying) {
      return <EqualizerBars isActive color={brandColor} size="compact" />;
    }

    return <Ionicons name="pause" size={14} color="#8E8E93" />;
  };

  const renderStationRow = (
    station: IRadioStation,
    isLastInGroup: boolean,
  ) => {
    const isCurrentStation = playerState.currentStation?.id === station.id;
    const isPlaying = isCurrentStation && playerState.isPlaying;
    const isLoading = isCurrentStation && playerState.isLoading;
    const brand = getStationBrand(station);

    return (
      <TouchableOpacity
        style={[
          styles.stationRow,
          isCurrentStation && { backgroundColor: `${brand.color}10` },
          !isLastInGroup && styles.stationRowBorder,
        ]}
        onPress={() => onStationSelect(station)}
        activeOpacity={0.6}
      >
        {isCurrentStation && (
          <View style={[styles.accentBar, { backgroundColor: brand.color }]} />
        )}

        <View style={[styles.avatar, { backgroundColor: brand.color }]}>
          <Text style={styles.avatarLabel}>{brand.label}</Text>
        </View>

        <View style={styles.stationInfo}>
          <Text
            style={[
              styles.stationName,
              isCurrentStation && styles.currentStationName,
            ]}
            numberOfLines={1}
          >
            {getStationDisplayName(station)}
          </Text>

          {language === 'en' && station.nameEn && (
            <Text style={styles.stationSubtitle} numberOfLines={1}>
              {station.nameEn}
            </Text>
          )}
        </View>

        <View style={styles.statusContainer}>
          {renderStatusIndicator(isCurrentStation, isPlaying, isLoading, brand.color)}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: IStationSection }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionAccent, { backgroundColor: section.color }]} />
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="radio" size={48} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>{t.emptyStateTitle}</Text>
      <Text style={styles.emptyStateSubtitle}>{t.emptyStateSubtitle}</Text>
    </View>
  );

  const renderFooter = () => <Copyright />;

  if (useSections) {
    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        extraData={playerState}
        renderItem={({ item, index, section }) =>
          renderStationRow(item, index === section.data.length - 1)
        }
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      data={stations}
      renderItem={({ item, index }) =>
        renderStationRow(item, index === stations.length - 1)
      }
      keyExtractor={(item) => item.id}
      extraData={playerState}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 4,
    backgroundColor: '#f8f9fa',
  },
  sectionAccent: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    position: 'relative',
  },
  stationRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(142, 142, 147, 0.25)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 1.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  stationName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  currentStationName: {
    fontWeight: '600',
  },
  stationSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 2,
  },
  statusContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
