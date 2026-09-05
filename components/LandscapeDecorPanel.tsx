import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { IPlayerState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ILandscapeDecorPanelProps {
  playerState: IPlayerState;
}

const EQ_BAR_HEIGHTS = [0.35, 0.55, 0.75, 1, 0.65, 0.85, 0.45, 0.7, 0.5, 0.9, 0.6, 0.4];

function WaveRing({
  size,
  delay,
  isActive,
}: {
  size: number;
  delay: number;
  isActive: boolean;
}) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0.28)).current;

  useEffect(() => {
    if (!isActive) {
      scale.setValue(0.9);
      opacity.setValue(0.12);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.12,
            duration: 2600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.28,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [delay, isActive, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.waveRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

const EQ_MAX_PX = 48;

function EqBar({ index, isActive }: { index: number; isActive: boolean }) {
  const peak = EQ_BAR_HEIGHTS[index];
  const height = useRef(new Animated.Value(peak * 0.25)).current;

  useEffect(() => {
    if (!isActive) {
      Animated.timing(height, {
        toValue: peak * 0.2,
        duration: 400,
        useNativeDriver: false,
      }).start();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 70),
        Animated.timing(height, {
          toValue: peak,
          duration: 320 + index * 20,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(height, {
          toValue: peak * 0.3,
          duration: 280 + index * 15,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [height, index, isActive, peak]);

  return (
    <View style={styles.eqBarTrack}>
      <Animated.View
        style={[
          styles.eqBarFill,
          {
            height: height.interpolate({
              inputRange: [0, 1],
              outputRange: [0, EQ_MAX_PX],
            }),
          },
        ]}
      />
    </View>
  );
}

function BackgroundGrid() {
  const rows = Array.from({ length: 8 }, (_, i) => i);
  const cols = Array.from({ length: 14 }, (_, i) => i);

  return (
    <View style={styles.gridOverlay} pointerEvents="none">
      {rows.map(row =>
        cols.map(col => (
          <View
            key={`${row}-${col}`}
            style={[
              styles.gridDot,
              {
                top: `${(row / 7) * 100}%`,
                left: `${(col / 13) * 100}%`,
              },
            ]}
          />
        ))
      )}
    </View>
  );
}

export const LandscapeDecorPanel: React.FC<ILandscapeDecorPanelProps> = ({
  playerState,
}) => {
  const { t } = useLanguage();
  const { isPlaying, isLoading, currentStation } = playerState;
  const isActive = isPlaying && !isLoading;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#080812', '#141428', '#1a1040']}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 122, 255, 0.08)', 'rgba(175, 82, 222, 0.12)']}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.leftFade} />
      <BackgroundGrid />

      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />
      <View style={styles.diagonalStreak} />

      <View style={styles.badge}>
        <View style={[styles.liveDot, isActive && styles.liveDotActive]} />
        <Text style={styles.badgeText}>FM</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.waveContainer}>
          <WaveRing size={300} delay={0} isActive={isActive} />
          <WaveRing size={240} delay={500} isActive={isActive} />
          <WaveRing size={180} delay={1000} isActive={isActive} />

          <View style={styles.iconOuterRing}>
            <LinearGradient
              colors={isActive ? ['#007AFF', '#5856D6', '#AF52DE'] : ['#3A3A4A', '#2C2C3A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name="radio" size={52} color="white" />
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.title}>{t.appTitle}</Text>
        <Text style={styles.tagline}>{t.landscapeTagline}</Text>

        {currentStation ? (
          <View style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingHeader}>
              <Text style={styles.nowPlayingLabel}>{t.nowListening}</Text>
              {isActive && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingBadgeText}>{t.playing}</Text>
                </View>
              )}
            </View>
            <Text style={styles.stationName} numberOfLines={2}>
              {currentStation.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.hint}>{t.landscapeHint}</Text>
        )}
      </View>

      <View style={styles.eqContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.35)']}
          style={styles.eqFade}
        />
        <View style={styles.eqBars}>
          {EQ_BAR_HEIGHTS.map((_, index) => (
            <EqBar key={index} index={index} isActive={isActive} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 48,
    backgroundColor: 'transparent',
    borderLeftWidth: 0,
    // Soft edge blend from radio panel
    shadowColor: '#000',
    shadowOffset: { width: -12, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  gridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: -1,
    marginTop: -1,
  },
  glowOrbTop: {
    position: 'absolute',
    top: -100,
    right: '10%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 122, 255, 0.18)',
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -80,
    left: '15%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(175, 82, 222, 0.14)',
  },
  diagonalStreak: {
    position: 'absolute',
    top: '20%',
    right: '-10%',
    width: '60%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: [{ rotate: '-24deg' }],
  },
  badge: {
    position: 'absolute',
    top: 28,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  liveDotActive: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 72,
  },
  waveContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  waveRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 122, 255, 0.45)',
  },
  iconOuterRing: {
    padding: 4,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.58)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 340,
  },
  nowPlayingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    maxWidth: 400,
    width: '100%',
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nowPlayingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  playingBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  playingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34C759',
  },
  stationName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eqContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
  },
  eqFade: {
    ...StyleSheet.absoluteFillObject,
  },
  eqBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  eqBarTrack: {
    width: 8,
    height: 48,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  eqBarFill: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.55)',
  },
});
