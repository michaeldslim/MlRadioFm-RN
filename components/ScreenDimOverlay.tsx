import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface IScreenDimOverlayProps {
  visible: boolean;
  onPress: () => void;
}

export const ScreenDimOverlay: React.FC<IScreenDimOverlayProps> = ({
  visible,
  onPress,
}) => {
  const { t } = useLanguage();

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.overlay} onPress={onPress}>
      <Text style={styles.hint}>{t.screenDimmedHint}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
});
