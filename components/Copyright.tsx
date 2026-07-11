import React from 'react';
import appJson from '../app.json';
import { View, Text, StyleSheet } from 'react-native';

export const APP_VERSION = appJson.expo.version;

export const Copyright: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Copyright © 2025 Michaeldslim</Text>
      <Text style={styles.text}>v{APP_VERSION}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 32,
  },
  text: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
});
