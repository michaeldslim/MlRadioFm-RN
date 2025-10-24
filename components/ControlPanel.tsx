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
import Slider from '@react-native-community/slider';
import { IPlayerState } from '../types';

interface IControlPanelProps {
  playerState: IPlayerState;
  onPlayPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export const ControlPanel: React.FC<IControlPanelProps> = ({
  playerState,
  onPlayPause,
  onStop,
  onVolumeChange,
}) => {
  const { isPlaying, isLoading, currentStation, volume, errorMessage } = playerState;

  return (
    <View style={styles.container}>
      {/* Loading and Error States */}
      {isLoading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>연결 중...</Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          disabled={!currentStation}
        >
          <LinearGradient
            colors={
              currentStation
                ? ['#007AFF', '#AF52DE']
                : ['#8E8E93', '#8E8E93']
            }
            style={[
              styles.playButtonGradient,
              !currentStation && styles.playButtonDisabled,
            ]}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stop Button */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={onStop}
          disabled={!currentStation}
        >
          <View style={[
            styles.stopButtonBackground,
            !currentStation && styles.stopButtonDisabled,
          ]}>
            <Ionicons name="stop" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <View style={styles.volumeHeader}>
          <Text style={styles.volumeLabel}>볼륨</Text>
          <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
        </View>

        <View style={styles.volumeSliderContainer}>
          <Ionicons name="volume-low" size={12} color="#8E8E93" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={onVolumeChange}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5EA"
            thumbTintColor="#007AFF"
          />
          <Ionicons name="volume-high" size={12} color="#8E8E93" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 6,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  playButton: {
    marginRight: 12,
  },
  playButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  stopButton: {
    opacity: 1,
  },
  stopButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stopButtonDisabled: {
    opacity: 0.5,
  },
  volumeContainer: {
    marginTop: 4,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  volumeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  volumeValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    height: 32,
    marginHorizontal: 8,
  },
});
