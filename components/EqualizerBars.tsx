import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const COMPACT_BAR_HEIGHTS = [0.5, 0.85, 0.65, 1];

interface IEqualizerBarsProps {
  isActive: boolean;
  color?: string;
  size?: 'compact' | 'full';
}

function EqBar({
  index,
  peak,
  isActive,
  maxHeight,
  color,
}: {
  index: number;
  peak: number;
  isActive: boolean;
  maxHeight: number;
  color: string;
}) {
  const height = useRef(new Animated.Value(peak * 0.25)).current;

  useEffect(() => {
    if (!isActive) {
      Animated.timing(height, {
        toValue: peak * 0.2,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 60),
        Animated.timing(height, {
          toValue: peak,
          duration: 280 + index * 25,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(height, {
          toValue: peak * 0.25,
          duration: 240 + index * 20,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [height, index, isActive, peak]);

  return (
    <View style={[styles.barTrack, { height: maxHeight }]}>
      <Animated.View
        style={[
          styles.barFill,
          { backgroundColor: color },
          {
            height: height.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight],
            }),
          },
        ]}
      />
    </View>
  );
}

export const EqualizerBars: React.FC<IEqualizerBarsProps> = ({
  isActive,
  color = '#007AFF',
  size = 'compact',
}) => {
  const maxHeight = size === 'compact' ? 16 : 48;
  const gap = size === 'compact' ? 2 : 6;

  return (
    <View style={[styles.container, { gap }]}>
      {COMPACT_BAR_HEIGHTS.map((peak, index) => (
        <EqBar
          key={index}
          index={index}
          peak={peak}
          isActive={isActive}
          maxHeight={maxHeight}
          color={color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barTrack: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 1.5,
  },
});
