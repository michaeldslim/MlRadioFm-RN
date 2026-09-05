import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IRadioStation, IPlayerState, RadioStationType } from '../types';
import { getStationTypeText, getStationTypeIcon } from '../utils/categoryUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { StationCategory } from '../types';
import { Copyright } from './Copyright';

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
  selectedCategory,
}) => {
  const { t, language } = useLanguage();

  const getKoreanPrefix = (station: IRadioStation) => {
    if (station.type !== RadioStationType.KOREAN) return '';
    if (station.url.startsWith('kbs://')) return 'KBS ';
    if (station.url.startsWith('mbc://')) return 'MBC ';
    if (station.url.startsWith('sbs://')) return 'SBS ';
    if (station.url.startsWith('ytn://')) return 'YTN ';
    if (station.url.startsWith('bbs://')) return 'BBS ';
    return '';
  };

  const renderStationItem = ({ item: station }: { item: IRadioStation }) => {
    const isCurrentStation = playerState.currentStation?.id === station.id;
    const isPlaying = isCurrentStation && playerState.isPlaying;
    const isLoading = isCurrentStation && playerState.isLoading;

    const showPrefix = typeof selectedCategory !== 'undefined' && (selectedCategory === StationCategory.ALL || (selectedCategory === StationCategory.OTHER && (station.url.startsWith('bbs://') || station.url.startsWith('ytn://'))));
    const prefix = showPrefix ? getKoreanPrefix(station) : '';

    return (
      <TouchableOpacity
        style={[
          styles.stationItem,
          isCurrentStation && styles.currentStationItem,
        ]}
        onPress={() => onStationSelect(station)}
        activeOpacity={0.7}
      >
        <View style={styles.stationContent}>
          <View style={styles.indicatorContainer}>
            <View
              style={[
                styles.indicator,
                isCurrentStation && styles.currentIndicator,
              ]}
            >
              {isCurrentStation && isPlaying && (
                <View style={styles.playingIndicator} />
              )}
            </View>
          </View>

          <View style={styles.stationInfo}>
            <Text style={styles.stationName} numberOfLines={2}>
              {prefix}{station.name.replace(/^(KBS|MBC|SBS|YTN|BBS)\s+/, '')}
            </Text>

            {language === 'en' && station.nameEn && station.type === RadioStationType.KOREAN && (
              <Text style={styles.stationNameEn} numberOfLines={1}>
                {station.nameEn}
              </Text>
            )}

            <View style={styles.stationMeta}>
              <Ionicons
                name={getStationTypeIcon(station.type) as any}
                size={10}
                color="#8E8E93"
              />
              <Text style={styles.stationTypeText}>
                {getStationTypeText(station.type, language)}
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            {isCurrentStation && (
              <>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : isPlaying ? (
                  <Ionicons name="volume-high" size={14} color="#007AFF" />
                ) : (
                  <Ionicons name="pause-circle" size={14} color="#8E8E93" />
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="radio" size={48} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>{t.emptyStateTitle}</Text>
      <Text style={styles.emptyStateSubtitle}>{t.emptyStateSubtitle}</Text>
    </View>
  );

  const renderFooter = () => <Copyright />;

  return (
    <FlatList
      data={stations}
      renderItem={renderStationItem}
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
  stationItem: {
    backgroundColor: 'rgba(205, 220, 196, 0.5)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  currentStationItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  stationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  indicatorContainer: {
    marginRight: 14,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  currentIndicator: {
    backgroundColor: '#007AFF',
  },
  playingIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 3,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  stationNameEn: {
    fontSize: 12,
    fontWeight: '400',
    color: '#007AFF',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  statusContainer: {
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
