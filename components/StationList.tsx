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
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { IRadioStation, IPlayerState, RadioStationType } from '../types';
import { getStationTypeText, getStationTypeIcon } from '../utils/categoryUtils';

interface IStationListProps {
  stations: IRadioStation[];
  playerState: IPlayerState;
  onStationSelect: (station: IRadioStation) => void;
  onSeek?: (progress: number) => void;
}

export const StationList: React.FC<IStationListProps> = ({
  stations,
  playerState,
  onStationSelect,
  onSeek,
}) => {
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderStationItem = ({ item: station }: { item: IRadioStation }) => {
    const isCurrentStation = playerState.currentStation?.id === station.id;
    const isPlaying = isCurrentStation && playerState.isPlaying;
    const isLoading = isCurrentStation && playerState.isLoading;

    return (
      <TouchableOpacity
        style={[
          styles.stationItem,
          isCurrentStation && styles.currentStationItem,
        ]}
        onPress={() => onStationSelect(station)}
      >
        <View style={styles.stationContent}>
          {/* Station Indicator */}
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

          {/* Station Info */}
          <View style={styles.stationInfo}>
            <Text style={styles.stationName} numberOfLines={2}>
              {station.name.replace(/^(KBS|MBC|SBS)\s+/, '')}
            </Text>
            
            <View style={styles.stationMeta}>
              <Ionicons
                name={getStationTypeIcon(station.type) as any}
                size={10}
                color="#8E8E93"
              />
              <Text style={styles.stationTypeText}>
                {getStationTypeText(station.type)}
              </Text>
            </View>

            {/* Podcast Episode Info */}
            {station.type === RadioStationType.PODCAST && 
             isCurrentStation && 
             playerState.currentEpisode && (
              <View style={styles.episodeInfo}>
                {playerState.currentEpisode.number && (
                  <Text style={styles.episodeNumber}>
                    Episode #{playerState.currentEpisode.number}
                  </Text>
                )}
                <Text style={styles.episodeTitle} numberOfLines={2}>
                  {playerState.currentEpisode.title}
                </Text>

                {/* Progress Bar for Podcasts */}
                {isPlaying && playerState.duration > 0 && onSeek && (
                  <View style={styles.progressContainer}>
                    <Slider
                      style={styles.progressSlider}
                      minimumValue={0}
                      maximumValue={1}
                      value={playerState.progress}
                      onValueChange={onSeek}
                      minimumTrackTintColor="#FF9500"
                      maximumTrackTintColor="#E5E5EA"
                      thumbTintColor="#FF9500"
                    />
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(playerState.currentTime)}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatTime(playerState.duration)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Playing Status */}
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
      <Text style={styles.emptyStateTitle}>검색 결과가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>다른 키워드로 검색해보세요</Text>
    </View>
  );

  return (
    <FlatList
      data={stations}
      renderItem={renderStationItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Increased bottom padding for podcast controls
  },
  stationItem: {
    backgroundColor: 'rgba(242, 242, 247, 0.5)',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationTypeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  episodeInfo: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(142, 142, 147, 0.2)',
  },
  episodeNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 2,
  },
  episodeTitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  progressSlider: {
    height: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#8E8E93',
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
