import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IPlayerState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getStationBrand, getStationDisplayName } from '../utils/categoryUtils';
import { EqualizerBars } from './EqualizerBars';

interface IMiniPlayerBarProps {
  playerState: IPlayerState;
  onPlayPause: () => void;
  onStop: () => void;
  onRetry?: () => void;
}

function PulsingDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.pulseDot, { backgroundColor: color, opacity }]}
    />
  );
}

function LiveProgressBar({
  isPlaying,
  isLoading,
  hasError,
  color,
}: {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  color: string;
}) {
  const fillRatio = useRef(new Animated.Value(0.35)).current;
  const pulseOpacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    fillRatio.stopAnimation();
    pulseOpacity.stopAnimation();

    if (hasError) {
      fillRatio.setValue(1);
      pulseOpacity.setValue(1);
      return;
    }

    if (isLoading) {
      pulseOpacity.setValue(0.85);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(fillRatio, {
            toValue: 0.78,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(fillRatio, {
            toValue: 0.18,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }

    if (isPlaying) {
      fillRatio.setValue(1);
      pulseOpacity.setValue(0.55);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.45,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }

    fillRatio.setValue(0.35);
    pulseOpacity.setValue(0.45);
  }, [fillRatio, hasError, isLoading, isPlaying, pulseOpacity]);

  const barColor = hasError ? '#FF9500' : isPlaying || isLoading ? color : '#AEAEB2';

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFillWrap,
          {
            width: fillRatio.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
              opacity: isPlaying || hasError ? pulseOpacity : 0.7,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

function GlassBackground({ hasError }: { hasError: boolean }) {
  if (Platform.OS === 'ios') {
    return (
      <>
        <BlurView
          intensity={90}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.glassTint,
            hasError && styles.glassTintError,
          ]}
        />
      </>
    );
  }

  // Android: semi-transparent frosted layer over the scrolling list beneath.
  // Native blur needs a dev rebuild; this still shows list content through the bar.
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        styles.androidFrost,
        hasError && styles.androidFrostError,
      ]}
    />
  );
}

export const MiniPlayerBar: React.FC<IMiniPlayerBarProps> = ({
  playerState,
  onPlayPause,
  onStop,
  onRetry,
}) => {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isPlaying, isLoading, currentStation, errorMessage } = playerState;

  if (!currentStation) {
    return null;
  }

  const brand = getStationBrand(currentStation);
  const hasError = Boolean(errorMessage);

  const renderStatus = () => {
    if (errorMessage) {
      return (
        <View style={styles.statusRow}>
          <Text style={styles.errorText} numberOfLines={1}>
            {errorMessage}
          </Text>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel={t.retry}
            >
              <Text style={styles.retryText}>{t.retry}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.statusRow}>
          <PulsingDot color={brand.color} />
          <Text style={[styles.statusText, { color: brand.color }]}>
            {t.loading}
          </Text>
        </View>
      );
    }

    if (isPlaying) {
      return (
        <View style={styles.statusRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t.live}</Text>
          </View>
          <EqualizerBars isActive color={brand.color} size="compact" />
        </View>
      );
    }

    return (
      <View style={styles.statusRow}>
        <Text style={styles.pausedText}>{t.paused}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <GlassBackground hasError={hasError} />

      <LiveProgressBar
        isPlaying={isPlaying && !isLoading && !hasError}
        isLoading={isLoading}
        hasError={hasError}
        color={brand.color}
      />

      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: brand.color }]}>
          <Text style={styles.avatarLabel}>{brand.label}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.stationName} numberOfLines={1}>
            {brand.label} · {getStationDisplayName(currentStation)}
          </Text>
          {renderStatus()}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: brand.color }]}
            onPress={onPlayPause}
            accessibilityLabel={isPlaying ? t.pause : t.play}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onStop}
            accessibilityLabel={t.close}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(142, 142, 147, 0.2)',
  },
  glassTint: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  glassTintError: {
    backgroundColor: 'rgba(255, 248, 240, 0.62)',
  },
  androidFrost: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  androidFrostError: {
    backgroundColor: 'rgba(255, 248, 240, 0.9)',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  infoSection: {
    flex: 1,
    marginRight: 10,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pausedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34C759',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: 0.6,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#FF9500',
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
