import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function OtherScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setMessage('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    setMessage('');

    fetch('http://demoportal.ccvi.com.vn:8888/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Đăng nhập thất bại');
        }
        setMessage('Đăng nhập thành công');
        // TODO: lưu token từ data nếu cần: data?.token
      })
      .catch((err) => {
        setMessage(err?.message || 'Không thể đăng nhập');
      })
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khác</Text>
      <Text style={styles.subtitle}>Cài đặt và chức năng khác</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đăng nhập</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={loading ? undefined : handleLogin}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
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
  card: {
    width: '100%',
    maxWidth: 360,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f6f7fb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d4dc',
    backgroundColor: '#fff',
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#d32f2f',
  },
});
