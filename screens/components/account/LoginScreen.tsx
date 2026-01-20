import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services';
import { ApiError } from '../../../types';

const { width, height } = Dimensions.get('window');

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface LoginScreenProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onBack: () => void;
  onLoginSuccess: (user: UserData) => void;
}

export default function LoginScreen({ 
  onSwitchToSignup, 
  onSwitchToForgotPassword,
  onBack,
  onLoginSuccess 
}: LoginScreenProps) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('ccvi@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setLoading(false);
      
      // Extract username from email and capitalize first letter
      const emailUsername = email.split('@')[0];
      const displayName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      
      const userData: UserData = {
        name: displayName,
        email: response.data?.email || email,
        phone: undefined,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2196F3&color=fff&size=128`,
      };
      
      // Proceed to home without success alert
      onLoginSuccess(userData);
    } catch (error) {
      setLoading(false);
      const apiError = error as ApiError;
      
      // Debug info for APK environment
      const errorDetails = [
        `Thông báo: ${apiError.message || 'Mật khẩu hoặc email không chính xác'}`,
        apiError.status !== undefined ? `Mã lỗi: ${apiError.status}` : null,
        apiError.code ? `Code: ${apiError.code}` : null,
        __DEV__ ? `Email: ${email}` : null,
      ].filter(Boolean).join('\n');
      
      console.error('Login error details:', {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        email,
      });
      
      Alert.alert('Lỗi đăng nhập', errorDetails);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      {/* Header Background */}
      <View style={styles.headerBackground} pointerEvents="none">
        <View style={styles.headerPattern1} />
        <View style={styles.headerPattern2} />
        <View style={styles.headerPattern3} />
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="close" size={24} color="#2196F3" />

        </View>
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        nestedScrollEnabled
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="cube" size={50} color="#fff" />
          </View>
          <Text style={styles.welcomeText}>
            Chào mừng trở lại!
          </Text>
          <Text style={styles.subtitle}>
            Đăng nhập để quản lý kho hàng
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email
            </Text>
            <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused
            ]}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={emailFocused ? '#2196F3' : '#999'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!loading}
              />
              {email.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setEmail('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mật khẩu
            </Text>
            <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused
            ]}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={passwordFocused ? '#2196F3' : '#999'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? 'eye' : 'eye-off'} 
                  size={20} 
                  color={passwordFocused ? '#2196F3' : '#999'} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            onPress={onSwitchToForgotPassword} 
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.loginButtonContent}>
              {loading ? (
                <>
                  <View style={styles.loadingDot} />
                  <Text style={styles.loginButtonText}>
                    Đang đăng nhập...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.loginButtonText}>
                    Đăng nhập
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </View>
          </TouchableOpacity>

          

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Chưa có tài khoản? 
            </Text>
            <TouchableOpacity onPress={onSwitchToSignup} activeOpacity={0.7}>
              <Text style={styles.signupLink}>
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            Bằng việc đăng nhập, bạn đồng ý với
          </Text>
          <View style={styles.bottomLinks}>
            <TouchableOpacity>
              <Text style={styles.bottomLinkText}>
                Điều khoản sử dụng
              </Text>
            </TouchableOpacity>
            <Text style={styles.bottomInfoText}> và </Text>
            <TouchableOpacity>
              <Text style={styles.bottomLinkText}>
                Chính sách bảo mật
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: '#2196F3',
    overflow: 'hidden',
    zIndex: 0,
  },
  headerPattern1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerPattern2: {
    position: 'absolute',
    top: 100,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerPattern3: {
    position: 'absolute',
    bottom: -20,
    right: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1,
    position: 'relative',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 13,
  },
  quickLoginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  quickLoginText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  bottomInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  bottomInfoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
});