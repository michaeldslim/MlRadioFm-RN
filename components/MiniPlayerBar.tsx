import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IPlayerState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface IMiniPlayerBarProps {
  playerState: IPlayerState;
  onPlayPause: () => void;
  onStop: () => void;
}

export const MiniPlayerBar: React.FC<IMiniPlayerBarProps> = ({
  playerState,
  onPlayPause,
  onStop,
}) => {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isPlaying, isLoading, currentStation, currentEpisode } = playerState;

  if (!currentStation) {
    return null;
  }

  const statusText = isLoading ? t.loading : isPlaying ? t.playing : t.paused;

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        <View style={styles.infoSection}>
          <Text style={styles.stationName} numberOfLines={1}>
            {currentStation.name}
          </Text>
          {currentEpisode && (
            <Text style={styles.episodeTitle} numberOfLines={1}>
              {currentEpisode.title}
            </Text>
          )}
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayPause}
            accessibilityLabel={isPlaying ? t.pause : t.play}
          >
            <LinearGradient
              colors={['#007AFF', '#AF52DE']}
              style={styles.playButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color="white"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStop}
            accessibilityLabel={t.stop}
          >
            <View style={styles.stopButtonBackground}>
              <Ionicons name="stop" size={14} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(142, 142, 147, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  episodeTitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginRight: 10,
  },
  playButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {},
  stopButtonBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
