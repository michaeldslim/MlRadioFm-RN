import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Copyright: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Copyright © 2025 Michaeldslim</Text>
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
