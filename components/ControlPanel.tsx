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
          style={[
            styles.playButton,
            !currentStation && styles.playButtonDisabled,
          ]}
          onPress={onPlayPause}
          disabled={!currentStation}
        >
          <LinearGradient
            colors={
              currentStation
                ? ['#007AFF', '#AF52DE']
                : ['#8E8E93', '#8E8E93']
            }
            style={styles.playButtonGradient}
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
          style={[
            styles.stopButton,
            !currentStation && styles.stopButtonDisabled,
          ]}
          onPress={onStop}
          disabled={!currentStation}
        >
          <View style={styles.stopButtonBackground}>
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playButton: {
    marginRight: 20,
  },
  playButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  stopButton: {
    opacity: 1,
  },
  stopButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stopButtonDisabled: {
    opacity: 0.5,
  },
  volumeContainer: {
    marginTop: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  volumeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
});
