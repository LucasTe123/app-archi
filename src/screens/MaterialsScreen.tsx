import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MaterialsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Materials screen works</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
});