import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function ImportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập kho</Text>
      <Text style={styles.subtitle}>Quản lý nhập hàng vào kho</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
