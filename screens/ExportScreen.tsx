import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function ExportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xuất kho</Text>
      <Text style={styles.subtitle}>Quản lý xuất hàng khỏi kho</Text>
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
